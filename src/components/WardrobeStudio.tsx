'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Footprints, Sparkles, Plus, Check, MapPin } from 'lucide-react';
import { OCCASIONS } from '@/data/occasions';
import {
  StudioItem,
  GARMENTS_DATA,
  FOOTWEAR_DATA,
  ACCESSORIES_DATA,
} from '@/data/wardrobe';
import type { GarmentCategory, OccasionId } from '@/types';
import UploadCustomItem from './UploadCustomItem';
import { QUICK_SAMPLES } from '@/data/quickSamples';

type Tab = 'garment' | 'footwear' | 'accessory';

interface WardrobeStudioProps {
  selectedOccasion: OccasionId;
  onSelectOccasion: (id: OccasionId) => void;
  selectedGarmentId: string;
  selectedColor: string;
  customGarment: StudioItem | null;
  onSelectGarment: (id: GarmentCategory) => void;
  onSelectCustomGarment: (item: StudioItem) => void;
  onSelectColor: (hex: string) => void;
  selectedShoe: StudioItem | null;
  selectedAccessory: StudioItem | null;
  onSelectShoe: (item: StudioItem | null) => void;
  onSelectAccessory: (item: StudioItem | null) => void;
  customItems?: StudioItem[];
  onAddUGC: (item: StudioItem) => void;
}

export default function WardrobeStudio({
  selectedOccasion,
  onSelectOccasion,
  selectedGarmentId,
  selectedColor,
  customGarment,
  onSelectGarment,
  onSelectCustomGarment,
  onSelectColor,
  selectedShoe,
  selectedAccessory,
  onSelectShoe,
  onSelectAccessory,
  customItems = [],
  onAddUGC,
}: WardrobeStudioProps) {
  const [tab, setTab] = useState<Tab>('garment');
  const [shoeFilter, setShoeFilter] = useState<string>('all');
  const [accFilter, setAccFilter] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);

  const selectedGarment =
    GARMENTS_DATA.find((g) => g.id === selectedGarmentId) ?? GARMENTS_DATA[0];

  // Merge presets with user-uploaded items
  const customGarments = useMemo(() => {
    return customItems.filter((i) => i.anchorSlot === 'garment');
  }, [customItems]);

  const allFootwear = useMemo(() => {
    const customShoes = customItems.filter((i) => i.anchorSlot === 'feet');
    return [...customShoes, ...FOOTWEAR_DATA];
  }, [customItems]);

  const allAccessories = useMemo(() => {
    // Strictly accessories only: anchorSlot is NOT feet and NOT garment
    const customAcc = customItems.filter(
      (i) => i.anchorSlot !== 'feet' && i.anchorSlot !== 'garment'
    );
    return [...customAcc, ...ACCESSORIES_DATA];
  }, [customItems]);

  // Filtered lists
  const filteredFootwear = useMemo(() => {
    if (shoeFilter === 'all') return allFootwear;
    return allFootwear.filter((item) => item.category === shoeFilter);
  }, [allFootwear, shoeFilter]);

  const filteredAccessories = useMemo(() => {
    if (accFilter === 'all') return allAccessories;
    return allAccessories.filter((item) => item.category === accFilter);
  }, [allAccessories, accFilter]);

  const handleShoeClick = (item: StudioItem) => {
    if (selectedShoe?.id === item.id) {
      onSelectShoe(null); // toggle off
    } else {
      onSelectShoe(item);
    }
  };

  const handleAccessoryClick = (item: StudioItem) => {
    if (selectedAccessory?.id === item.id) {
      onSelectAccessory(null); // toggle off
    } else {
      onSelectAccessory(item);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Brand Header ── */}
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#8B1E1E]" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
            VNU × Google Hackathon
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1F1E1D] leading-tight mt-0.5">
          Sắc Việt
        </h1>
        <p className="text-[11px] text-[#9A8F84] tracking-widest uppercase mt-0.5">
          Co‑Mix Studio & Cultural Guardrail
        </p>
      </div>

      {/* ── 1. Occasion Selector (Left Column) ── */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1F1E1D] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} className="text-[#8B1E1E]" />
            1. Bối cảnh không gian
          </label>
          {(() => {
            const occ = OCCASIONS.find((o) => o.id === selectedOccasion);
            if (!occ || occ.strictnessLevel < 3) return null;
            return (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  occ.strictnessLevel >= 5
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {occ.strictnessLevel >= 5 ? '🛕 Nghiêm trang' : '⚠️ Trang trọng'}
              </span>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {OCCASIONS.map((occ) => {
            const isActive = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => onSelectOccasion(occ.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1F1E1D] text-white border-[#1F1E1D] shadow-xs'
                    : 'bg-white text-[#524B43] border-[#E8E2D9] hover:border-[#C8B98A] hover:bg-[#FAF8F5]'
                }`}
              >
                <span className="text-sm">{occ.emoji}</span>
                <span className="truncate">{occ.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Wardrobe Category Tabs (Left Column) ── */}
      <div className="shrink-0 space-y-2 pt-1">
        <label className="text-xs font-bold text-[#1F1E1D] uppercase tracking-wider flex items-center gap-1.5">
          <Shirt size={13} className="text-[#D4AF37]" />
          2. Chọn trang phục & phụ kiện
        </label>

        <div className="flex gap-1 bg-[#F0EBE3] p-1 rounded-xl">
          {(
            [
              { key: 'garment', label: 'Trang Phục', icon: <Shirt size={13} /> },
              { key: 'footwear', label: 'Giày Dép', icon: <Footprints size={13} /> },
              { key: 'accessory', label: 'Phụ Kiện', icon: <Sparkles size={13} /> },
            ] as { key: Tab; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                tab === t.key
                  ? 'bg-white text-[#1F1E1D] shadow-xs'
                  : 'text-[#9A8F84] hover:text-[#1F1E1D]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content Container ── */}
      <div className="flex-1 overflow-y-auto custom-scroll min-h-0 pr-1">
        <AnimatePresence mode="wait">
          {/* ── GARMENT TAB ── */}
          {tab === 'garment' && (
            <motion.div
              key="garment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pb-4"
            >
              {/* Custom Uploaded Garments */}
              {customGarments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#8B1E1E] uppercase tracking-wider flex items-center gap-1.5">
                      <span>👘</span> Áo của bạn (Đã tải lên)
                    </p>
                    <span className="text-[10px] text-[#9A8F84] font-medium">
                      {customGarments.length} mẫu
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {customGarments.map((g) => {
                      const isSelected = customGarment?.id === g.id;
                      return (
                        <motion.button
                          key={g.id}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectCustomGarment(g)}
                          className={`p-2.5 rounded-2xl border-2 transition-all text-left flex flex-col items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-xs'
                              : 'border-[#E8E2D9] bg-white hover:border-[#C8B98A]'
                          }`}
                        >
                          <div className="size-16 flex items-center justify-center p-1 bg-[#FAF8F5] rounded-xl overflow-hidden w-full">
                            {g.renderAssetUrl ? (
                              <img
                                src={g.renderAssetUrl}
                                alt={g.name}
                                className="max-h-full max-w-full object-contain drop-shadow-xs"
                              />
                            ) : (
                              <span className="text-2xl">👘</span>
                            )}
                          </div>
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1F1E1D] truncate flex-1">
                              {g.name}
                            </span>
                            {isSelected && (
                              <Check size={12} className="text-[#D4AF37] shrink-0" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Preset Samples for Judges / Fast Demo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#8B1E1E] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D4AF37]" />
                    Mẫu thử nhanh (Dành cho BGK)
                  </p>
                  <span className="text-[10px] text-[#9A8F84] font-medium">1-Click nạp đồ</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {QUICK_SAMPLES.map((sample) => {
                    const isSelected = customGarment?.id === sample.id;
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          onSelectCustomGarment(sample);
                          if (sample.dominantColor) {
                            onSelectColor(sample.dominantColor);
                          }
                        }}
                        className={`p-2 rounded-xl border transition-all text-left flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-2 ring-[#D4AF37]'
                            : 'border-[#E8E2D9] bg-[#FAF8F5] hover:border-[#D4AF37] hover:bg-white'
                        }`}
                      >
                        <div className="size-11 rounded-lg bg-white border border-[#E8E2D9]/80 overflow-hidden flex items-center justify-center p-0.5">
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
                    );
                  })}
                </div>
              </div>

              {/* Preset Garment Cards */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#9A8F84] uppercase tracking-wider">
                  Cổ phục mẫu (Di sản)
                </p>

                {GARMENTS_DATA.map((g) => {
                  const isSelected = !customGarment && selectedGarmentId === g.id;
                  return (
                    <motion.button
                      key={g.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelectGarment(g.id as GarmentCategory);
                        onSelectColor(g.palette[0].hex);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/8 shadow-xs'
                          : 'border-[#E8E2D9] bg-white hover:border-[#C8B98A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="size-10 rounded-xl shrink-0 border-2 border-white shadow-xs"
                          style={{
                            backgroundColor: isSelected ? selectedColor : g.palette[0].hex,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-[#1F1E1D] truncate">{g.name}</p>
                          <p className="text-[11px] text-[#9A8F84] truncate">{g.nameEn}</p>
                        </div>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#9A8F84] uppercase tracking-wider">
                    Màu vải — {selectedGarment.name}
                  </p>
                  <span className="text-[11px] font-medium text-[#1F1E1D]">
                    {selectedGarment.palette.find((p) => p.hex === selectedColor)?.name ?? ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedGarment.palette.map((swatch) => (
                    <button
                      key={swatch.hex}
                      title={swatch.name}
                      onClick={() => onSelectColor(swatch.hex)}
                      className={`palette-chip ${selectedColor === swatch.hex ? 'selected' : ''}`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Upload Item Prompt Card in Garment Tab */}
              <div className="pt-1">
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#C8B98A] bg-[#FAF8F5] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all cursor-pointer text-xs font-bold text-[#8B1E1E]"
                >
                  <Plus size={16} className="text-[#D4AF37]" />
                  <span>+ Thêm đồ của bạn (Tự động tách nền AI)</span>
                </button>
              </div>

              {/* Heritage Description */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] p-3.5">
                <p className="text-[11px] text-[#635B52] leading-relaxed text-pretty italic">
                  &ldquo;{selectedGarment.description}&rdquo;
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FOOTWEAR TAB ── */}
          {tab === 'footwear' && (
            <motion.div
              key="footwear"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 pb-4"
            >
              {/* Category Filter Pill Bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scroll">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'sneaker', label: 'Sneaker' },
                  { id: 'traditional', label: 'Hài / Guốc' },
                  { id: 'boots', label: 'Bốt' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setShoeFilter(f.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      shoeFilter === f.id
                        ? 'bg-[#1F1E1D] text-white shadow-xs'
                        : 'bg-white border border-[#E8E2D9] text-[#716960] hover:text-[#1F1E1D]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Footwear Grid */}
              <div className="grid grid-cols-3 gap-2">
                {filteredFootwear.map((item) => {
                  const active = selectedShoe?.id === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShoeClick(item)}
                      className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border-2 transition-all cursor-pointer h-28 ${
                        active
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-xs'
                          : 'border-[#E8E2D9] bg-white hover:border-[#C8B98A]'
                      }`}
                    >
                      <div className="w-full flex-1 flex items-center justify-center p-1">
                        {item.renderAssetUrl ? (
                          <img
                            src={item.renderAssetUrl}
                            alt={item.name}
                            className="max-h-12 w-auto object-contain drop-shadow-xs"
                          />
                        ) : (
                          <span className="text-3xl">👟</span>
                        )}
                      </div>

                      <span className="text-[10px] font-semibold text-[#1F1E1D] text-center leading-tight line-clamp-1 w-full">
                        {item.name}
                      </span>

                      {active && (
                        <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#D4AF37] flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}

                {/* [+ Thêm của bạn] Card */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpload(true)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border-2 border-dashed border-[#C8B98A] bg-[#FAF8F5] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all cursor-pointer h-28"
                >
                  <div className="size-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <Plus size={16} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8B1E1E] text-center leading-tight">
                    + Thêm đồ<br />của bạn
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── ACCESSORY TAB ── */}
          {tab === 'accessory' && (
            <motion.div
              key="accessory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 pb-4"
            >
              {/* Category Filter Pill Bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scroll">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'eyewear', label: 'Kính mắt' },
                  { id: 'headwear', label: 'Nón / Cài đầu' },
                  { id: 'handbag', label: 'Túi xách' },
                  { id: 'jewelry', label: 'Trang sức' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAccFilter(f.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      accFilter === f.id
                        ? 'bg-[#1F1E1D] text-white shadow-xs'
                        : 'bg-white border border-[#E8E2D9] text-[#716960] hover:text-[#1F1E1D]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Accessories Grid */}
              <div className="grid grid-cols-3 gap-2">
                {filteredAccessories.map((item) => {
                  const active = selectedAccessory?.id === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccessoryClick(item)}
                      className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border-2 transition-all cursor-pointer h-28 ${
                        active
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-xs'
                          : 'border-[#E8E2D9] bg-white hover:border-[#C8B98A]'
                      }`}
                    >
                      <div className="w-full flex-1 flex items-center justify-center p-1">
                        {item.renderAssetUrl ? (
                          <img
                            src={item.renderAssetUrl}
                            alt={item.name}
                            className="max-h-12 w-auto object-contain drop-shadow-xs"
                          />
                        ) : (
                          <span className="text-3xl">✨</span>
                        )}
                      </div>

                      <span className="text-[10px] font-semibold text-[#1F1E1D] text-center leading-tight line-clamp-1 w-full">
                        {item.name}
                      </span>

                      {active && (
                        <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#D4AF37] flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}

                {/* [+ Thêm của bạn] Card */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpload(true)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border-2 border-dashed border-[#C8B98A] bg-[#FAF8F5] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all cursor-pointer h-28"
                >
                  <div className="size-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <Plus size={16} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8B1E1E] text-center leading-tight">
                    + Thêm đồ<br />của bạn
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Client-side BG Removal & Upload Modal ── */}
      <AnimatePresence>
        {showUpload && (
          <UploadCustomItem
            targetSlot={tab === 'garment' ? 'garment' : tab === 'footwear' ? 'feet' : 'hand'}
            onClose={() => setShowUpload(false)}
            onAddItem={(item) => {
              onAddUGC(item);
              setShowUpload(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
