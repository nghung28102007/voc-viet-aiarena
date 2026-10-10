'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { InspectItemResult } from '@/types';
import type { StudioItem } from '@/data/wardrobe';

interface UploadCustomItemProps {
  onClose: () => void;
  onAddItem: (item: StudioItem) => void;
  targetSlot?: StudioItem['anchorSlot'];
}

type Stage = 'idle' | 'removing-bg' | 'inspecting' | 'done' | 'error';
type Slot = StudioItem['anchorSlot'];
type ItemKind = 'garment' | 'footwear' | 'accessory';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1024; // downscale before background removal — much faster on phone photos
const AI_TRUST_THRESHOLD = 0.7;

const SLOT_LABEL: Record<Slot, string> = {
  garment: 'mục Trang phục',
  feet: 'mục Giày dép',
  head: 'mục Phụ kiện',
  eyes: 'mục Phụ kiện',
  wrist: 'mục Phụ kiện',
  hand: 'mục Phụ kiện',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Downscale to MAX_SIDE and bake in EXIF orientation. Throws on unsupported formats (e.g. HEIC). */
async function downscaleImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

  if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('no-2d-context');
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const mime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob-failed'))), mime, 0.9)
  );
}

function kindForTab(tab?: Slot): ItemKind {
  if (tab === 'garment') return 'garment';
  if (tab === 'feet') return 'footwear';
  return 'accessory';
}

function accessorySlotFor(label: string): Slot {
  const l = label.toLowerCase();
  if (/(nón|mũ|cài|trâm|khăn vấn|mấn|vương miện)/.test(l)) return 'head';
  if (/(kính)/.test(l)) return 'eyes';
  if (/(vòng|lắc|đồng hồ)/.test(l)) return 'wrist';
  return 'hand';
}

function footwearCategory(label: string): string {
  const l = label.toLowerCase();
  if (/(hài|guốc|dép|thổ cẩm)/.test(l)) return 'traditional';
  if (/(bốt|boot)/.test(l)) return 'boots';
  return 'sneaker';
}

function accessoryCategory(slot: Slot): string {
  if (slot === 'head') return 'headwear';
  if (slot === 'eyes') return 'eyewear';
  if (slot === 'wrist') return 'jewelry';
  return 'handbag';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadCustomItem({ onClose, onAddItem, targetSlot }: UploadCustomItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [note, setNote] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // If the modal is closed mid-processing, never add the item afterwards
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const fail = useCallback((msg: string) => {
    setErrorMsg(msg);
    setStage('error');
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return fail('Vui lòng chọn file ảnh (JPG, PNG, WEBP).');
      if (file.size > MAX_FILE_BYTES) return fail('Ảnh vượt quá 10MB. Hãy chọn ảnh nhỏ hơn.');

      const notes: string[] = [];

      try {
        // ─ Step 1: Downscale + preview ────────────────────────────────────────
        setStage('removing-bg');
        setProgress(10);

        let source: Blob;
        try {
          source = await downscaleImage(file);
        } catch {
          return fail('Không đọc được ảnh này (HEIC?). Hãy dùng JPG, PNG hoặc WEBP.');
        }
        if (cancelledRef.current) return;

        const originalUrl = URL.createObjectURL(source);
        setPreview(originalUrl);
        setProgress(20);

        // ─ Step 2: Background removal (lazy loaded, runs in the browser) ─────
        let processedUrl = originalUrl;
        let bgRemoved = false;
        try {
          const { removeBackground } = await import('@imgly/background-removal');
          setProgress(35);
          const blob: Blob = await removeBackground(source, {
            progress: (_key, current, total) => {
              const pct = Math.round((current / total) * 50) + 35;
              setProgress(Math.min(pct, 85));
            },
          });
          processedUrl = URL.createObjectURL(blob);
          bgRemoved = true;
          URL.revokeObjectURL(originalUrl);
          setPreview(processedUrl);
        } catch (e) {
          console.warn('[UploadCustomItem] BG removal failed, using original image', e);
          notes.push('Chưa tách được nền nên đang dùng ảnh gốc, nền có thể che áo.');
        }
        if (cancelledRef.current) {
          URL.revokeObjectURL(processedUrl);
          return;
        }
        setProgress(85);

        // ─ Step 3: Gemini Vision — name, category, family, bounding box ──────
        setStage('inspecting');
        let inspect: InspectItemResult;
        try {
          const fd = new FormData();
          const imgBlob = await fetch(processedUrl).then((r) => r.blob());
          fd.append('image', imgBlob, 'item.png');
          const res = await fetch('/api/inspect-item', { method: 'POST', body: fd });
          if (!res.ok) throw new Error(`inspect HTTP ${res.status}`);
          inspect = await res.json();
        } catch {
          inspect = {
            label: file.name.replace(/\.[^.]+$/, '') || 'Vật phẩm thời trang',
            category: kindForTab(targetSlot),
            confidence: 0,
            placement: { x: 0.5, y: 0.5 },
            source: 'fallback',
          };
        }
        if (cancelledRef.current) {
          URL.revokeObjectURL(processedUrl);
          return;
        }

        // ─ Step 4: Decide slot — trust Gemini when it is confident ───────────
        const tabKind = kindForTab(targetSlot);
        const trusted = inspect.source === 'gemini' && inspect.confidence >= AI_TRUST_THRESHOLD;
        const kind: ItemKind = trusted ? inspect.category : tabKind;

        const fileName = file.name.replace(/\.[^.]+$/, '');
        const hasUsableFileName = !!fileName && !['item', 'image', 'blob'].includes(fileName);
        const defaultName =
          kind === 'garment' ? 'Áo Dài Của Bạn' : kind === 'footwear' ? 'Giày Của Bạn' : 'Phụ Kiện Của Bạn';
        const label =
          inspect.source === 'gemini' && inspect.label !== 'Phụ Kiện Thời Trang'
            ? inspect.label
            : hasUsableFileName
            ? fileName
            : defaultName;

        let slot: Slot;
        let category: string;
        if (kind === 'garment') {
          slot = 'garment';
          category = 'garment';
        } else if (kind === 'footwear') {
          slot = 'feet';
          category = footwearCategory(label);
        } else {
          slot = accessorySlotFor(label);
          category = accessoryCategory(slot);
        }

        if (kind !== tabKind) {
          notes.push(`Ảnh này giống ${kind === 'garment' ? 'trang phục' : kind === 'footwear' ? 'giày dép' : 'phụ kiện'}, đã thêm vào ${SLOT_LABEL[slot]}.`);
        }
        if (kind === 'garment' && inspect.wornByPerson) {
          notes.push('Ảnh còn người mặc nên đầu/tay có thể sót lại. Ảnh áo trải phẳng hoặc treo móc sẽ đẹp hơn.');
        }
        // Without a clean cutout the bounding box is unreliable, so only keep it when bg removal worked
        const studioItem: StudioItem = {
          id: `ugc-${Date.now()}`,
          name: label,
          category,
          anchorSlot: slot,
          renderAssetUrl: processedUrl,
          thumbnailUrl: processedUrl,
          transform: { scale: 1, offsetX: 0, offsetY: 0 },
          ...(kind === 'garment'
            ? {
                garmentFamily: inspect.garmentFamily,
                wornByPerson: inspect.wornByPerson,
                box: bgRemoved ? inspect.box : undefined,
              }
            : {}),
        };

        setNote(notes.join(' '));
        setProgress(100);
        setStage('done');

        // Quick checkmark; stay a bit longer when there is something to read
        setTimeout(() => {
          if (cancelledRef.current) return;
          onAddItem(studioItem);
          onClose();
        }, notes.length > 0 ? 2800 : 500);
      } catch (err) {
        console.error('[UploadCustomItem] Error:', err);
        fail('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    },
    [onAddItem, onClose, targetSlot, fail]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (stage !== 'idle') return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const stageLabel: Record<Stage, string> = {
    idle: '',
    'removing-bg': 'Đang chuẩn bị ảnh và xóa nền…',
    inspecting: 'AI đang nhận diện vật phẩm…',
    done: '✓ Đã thêm vào canvas!',
    error: errorMsg,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E8E2D9]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D9]">
          <div>
            <h3 className="font-semibold text-[#1F1E1D]">Thêm Đồ Của Bạn</h3>
            <p className="text-[11px] text-[#9A8F84]">
              Nền được xóa ngay trên máy bạn. Ảnh sau đó được gửi tới Gemini để nhận diện.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-full hover:bg-[#F0EBE3] transition-colors"
          >
            <X size={18} className="text-[#9A8F84]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => stage === 'idle' && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2
              min-h-[160px] transition-all cursor-pointer
              ${
                isDragOver
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                  : 'border-dashed border-[#C8B98A] bg-[#FAF7F2] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
              }
              ${stage !== 'idle' ? 'cursor-default' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {preview && (
              <div className="absolute inset-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  style={{ opacity: stage === 'done' ? 1 : 0.6 }}
                />
              </div>
            )}

            {stage === 'idle' && !preview && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                  <Upload size={22} className="text-[#D4AF37]" />
                </div>
                <p className="text-sm font-medium text-[#1F1E1D]">Tải ảnh trang phục / giày / phụ kiện</p>
                <p className="text-[11px] text-[#9A8F84]">Kéo thả hoặc click để chọn</p>
                <p className="text-[10px] text-[#8A7F73]">JPG · PNG · WEBP · tối đa 10MB</p>
              </div>
            )}

            {(stage === 'removing-bg' || stage === 'inspecting') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
                <Loader2 size={28} className="text-[#D4AF37] animate-spin mb-2" />
              </div>
            )}

            {stage === 'done' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <CheckCircle size={40} className="text-emerald-500" />
                </motion.div>
              </div>
            )}

            {stage === 'error' && (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle size={28} className="text-red-500" />
                <p className="text-xs text-red-600 text-center px-4">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {(stage === 'removing-bg' || stage === 'inspecting' || stage === 'done') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-[#716960]">{stageLabel[stage]}</p>
                  <p className="text-[11px] font-semibold text-[#8A7120]">{progress}%</p>
                </div>
                <div className="w-full h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#8B1E1E] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Heads-up after upload (wrong tab, bg removal failed, person still in photo) */}
          {stage === 'done' && note && (
            <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {note}
            </p>
          )}

          {stage === 'error' && (
            <button
              onClick={() => {
                setStage('idle');
                setPreview(null);
                setErrorMsg('');
                setNote('');
                setProgress(0);
              }}
              className="w-full py-2.5 rounded-xl bg-[#F0EBE3] text-sm font-medium text-[#1F1E1D]
                hover:bg-[#E8E2D9] transition-colors"
            >
              Thử Lại
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
