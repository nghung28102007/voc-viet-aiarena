'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { InspectItemResult } from '@/types';
import type { StudioItem } from '@/data/wardrobe';
import { QUICK_SAMPLES } from '@/data/quickSamples';

interface UploadCustomItemProps {
  onClose: () => void;
  onAddItem: (item: StudioItem) => void;
  targetSlot?: StudioItem['anchorSlot'];
}

type Stage = 'idle' | 'removing-bg' | 'inspecting' | 'done' | 'error';

export default function UploadCustomItem({
  onClose,
  onAddItem,
  targetSlot,
}: UploadCustomItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn file ảnh (JPG, PNG, WEBP).');
      setStage('error');
      return;
    }

    try {
      // ─ Step 1: Show preview ───────────────────────────────────────────────
      const originalUrl = URL.createObjectURL(file);
      setPreview(originalUrl);
      setStage('removing-bg');
      setProgress(15);

      // ─ Step 2: Background removal (lazy loaded) ───────────────────────────
      let processedDataUrl: string;
      try {
        const { removeBackground } = await import('@imgly/background-removal');
        setProgress(35);
        const blob: Blob = await removeBackground(file, {
          progress: (_key, current, total) => {
            const pct = Math.round((current / total) * 50) + 35;
            setProgress(Math.min(pct, 85));
          },
        });
        processedDataUrl = URL.createObjectURL(blob);
        setPreview(processedDataUrl);
      } catch {
        // BG removal fallback — use original
        console.warn('[UploadCustomItem] BG removal failed or unsupported, using original');
        processedDataUrl = originalUrl;
      }
      setProgress(85);

      // ─ Step 3: Gemini Vision classify ─────────────────────────────────────
      setStage('inspecting');
      let inspectResult: InspectItemResult;
      try {
        const formData = new FormData();
        const fetchBlob = await fetch(processedDataUrl).then((r) => r.blob());
        formData.append('image', fetchBlob, 'item.png');

        const res = await fetch('/api/inspect-item', { method: 'POST', body: formData });
        inspectResult = await res.json();
      } catch {
        // Fallback classification
        inspectResult = {
          label: file.name.replace(/\.[^.]+$/, '') || 'Vật phẩm thời trang',
          category: targetSlot === 'garment' ? 'garment' : targetSlot === 'feet' ? 'footwear' : 'accessory',
          confidence: 0.8,
          placement: { x: 0.5, y: 0.5 },
        };
      }

      setProgress(100);
      setStage('done');

      // ─ Step 4: Construct StudioItem with slot attachment ────────────────
      const isFootwear = targetSlot === 'feet' || inspectResult.category === 'footwear';
      const isGarment = targetSlot === 'garment' || inspectResult.category === 'garment';
      const cleanFileName = file.name.replace(/\.[^.]+$/, '') || (isGarment ? 'Áo Dài Của Bạn' : 'Vật Phẩm Của Bạn');

      const slot: StudioItem['anchorSlot'] = targetSlot || (isGarment ? 'garment' : isFootwear ? 'feet' : 'hand');
      const defaultName = isGarment ? 'Áo Dài Của Bạn' : isFootwear ? 'Giày Của Bạn' : 'Phụ Kiện Của Bạn';

      const hasValidCustomName = cleanFileName && cleanFileName !== 'item' && cleanFileName !== 'image' && cleanFileName !== 'blob';
      const cleanLabel = inspectResult.label && inspectResult.label !== 'Phụ Kiện Thời Trang'
        ? inspectResult.label
        : (hasValidCustomName ? cleanFileName : defaultName);

      const studioItem: StudioItem = {
        id: `ugc-${Date.now()}`,
        name: cleanLabel,
        category: isGarment ? 'garment' : isFootwear ? 'sneaker' : 'handbag',
        anchorSlot: slot,
        renderAssetUrl: processedDataUrl,
        thumbnailUrl: processedDataUrl,
        transform: {
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        },
      };

      // 1-Click Zero Friction: Brief checkmark animation then immediate handoff
      setTimeout(() => {
        onAddItem(studioItem);
        onClose();
      }, 500);

    } catch (err) {
      console.error('[UploadCustomItem] Error:', err);
      setErrorMsg('Có lỗi xảy ra. Vui lòng thử lại.');
      setStage('error');
    }
  }, [onAddItem, onClose, targetSlot]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const stageLabel: Record<Stage, string> = {
    idle: '',
    'removing-bg': 'Đang xóa nền ảnh…',
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
            <p className="text-[11px] text-[#9A8F84]">AI sẽ tự xóa nền & nhận diện vật phẩm</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F0EBE3] transition-colors"
          >
            <X size={18} className="text-[#9A8F84]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => stage === 'idle' && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2
              min-h-[160px] transition-all cursor-pointer
              ${isDragOver
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                : 'border-dashed border-[#C8B98A] bg-[#FAF7F2] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'}
              ${stage !== 'idle' ? 'cursor-default' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Preview */}
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

            {/* Overlay state */}
            {stage === 'idle' && !preview && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                  <Upload size={22} className="text-[#D4AF37]" />
                </div>
                <p className="text-sm font-medium text-[#1F1E1D]">Tải ảnh phụ kiện / giày</p>
                <p className="text-[11px] text-[#9A8F84]">Kéo thả hoặc click để chọn</p>
                <p className="text-[10px] text-[#C8B98A]">JPG · PNG · WEBP · tối đa 10MB</p>
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
                  <p className="text-[11px] text-[#9A8F84]">{stageLabel[stage]}</p>
                  <p className="text-[11px] font-semibold text-[#D4AF37]">{progress}%</p>
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

          {/* Retry on error */}
          {stage === 'error' && (
            <button
              onClick={() => { setStage('idle'); setPreview(null); setErrorMsg(''); setProgress(0); }}
              className="w-full py-2.5 rounded-xl bg-[#F0EBE3] text-sm font-medium text-[#1F1E1D]
                hover:bg-[#E8E2D9] transition-colors"
            >
              Thử Lại
            </button>
          )}

          {/* Quick Preset Samples for Judges / Fast Demo */}
          {stage === 'idle' && (
            <div className="pt-3 border-t border-[#E8E2D9] space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#8B1E1E] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#D4AF37]" />
                  Mẫu thử nhanh (Dành cho BGK):
                </p>
                <span className="text-[10px] text-[#9A8F84] font-medium">1-Click nạp đồ</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {QUICK_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onAddItem(sample);
                      onClose();
                    }}
                    className="p-2 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] hover:border-[#D4AF37] hover:bg-white transition-all text-left flex flex-col items-center gap-1.5 cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div className="size-10 rounded-lg bg-white border border-[#E8E2D9]/80 overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                      {sample.renderAssetUrl ? (
                        <img
                          src={sample.renderAssetUrl}
                          alt={sample.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-base">👘</span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-[#1F1E1D] text-center leading-tight line-clamp-2">
                      {sample.name.replace(' Cách Tân', '').replace(' Nam Bộ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
