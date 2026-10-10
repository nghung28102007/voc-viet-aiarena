'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OCCASIONS, getOccasion } from '@/data/occasions';
import { GARMENTS_DATA, StudioItem } from '@/data/wardrobe';
import { computeDeterministicAudit } from '@/data/rubric';
import type { GarmentCategory, OccasionId, CulturalAuditResult } from '@/types';
import WardrobeStudio from '@/components/WardrobeStudio';
import StudioCanvas from '@/components/StudioCanvas';
import CulturalFeedback from '@/components/CulturalFeedback';
import LookbookModal from '@/components/LookbookModal';
import { extractFabricProperties } from '@/utils/fabricExtractor';

export default function StudioPage() {
  // ── Core outfit state (Managed in Memory State — 0 quota overflow risk) ───
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionId>('street');
  const [selectedGarmentId, setSelectedGarmentId] = useState<GarmentCategory>('ao-ngu-than');
  const [selectedColor, setSelectedColor] = useState<string>(GARMENTS_DATA[0].palette[0].hex);
  const [customGarment, setCustomGarment] = useState<StudioItem | null>(null);
  const [selectedShoe, setSelectedShoe] = useState<StudioItem | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<StudioItem | null>(null);
  const [customItems, setCustomItems] = useState<StudioItem[]>([]);

  // ── AI audit state ────────────────────────────────────────────────────────
  const [isAuditing, setIsAuditing] = useState(false);
  const [isAiAudited, setIsAiAudited] = useState(false);
  const [showLookbook, setShowLookbook] = useState(false);

  // Initialize with deterministic rubric score
  const [auditResult, setAuditResult] = useState<CulturalAuditResult>(() => {
    return computeDeterministicAudit({
      occasionId: 'street',
      occasionLabel: 'Dạo Phố',
      garmentId: 'ao-ngu-than',
      garmentName: 'Áo Ngũ Thân',
      garmentColor: GARMENTS_DATA[0].palette[0].hex,
      shoeId: '',
      shoeName: '',
      accessoryId: '',
      accessoryName: '',
    });
  });

  const selectedGarment =
    GARMENTS_DATA.find((g) => g.id === selectedGarmentId) ?? GARMENTS_DATA[0];
  const currentOccasion = getOccasion(selectedOccasion);

  // Live Deterministic Feedback: Only calculates when Gemini hasn't locked the audit
  useEffect(() => {
    if (!isAiAudited) {
      const activeGarmentId = customGarment ? customGarment.id : selectedGarment.id;
      const activeGarmentName = customGarment ? customGarment.name : selectedGarment.name;
      const liveResult = computeDeterministicAudit({
        occasionId: selectedOccasion,
        occasionLabel: currentOccasion.label,
        garmentId: activeGarmentId,
        garmentName: activeGarmentName,
        garmentColor: selectedColor,
        garmentFamily: customGarment?.garmentFamily,
        shoeId: selectedShoe?.id ?? '',
        shoeName: selectedShoe?.name ?? '',
        accessoryId: selectedAccessory?.id ?? '',
        accessoryName: selectedAccessory?.name ?? '',
      });
      setAuditResult(liveResult);
    }
  }, [
    isAiAudited,
    selectedOccasion,
    currentOccasion.label,
    selectedGarment.id,
    selectedGarment.name,
    selectedColor,
    customGarment,
    selectedShoe,
    selectedAccessory,
  ]);

  // Handle UGC uploads: 1-Click direct slot assignment without destructive pixel scrubbing
  const handleAddUGC = useCallback(async (item: StudioItem) => {
    if (item.anchorSlot === 'garment') {
      let dominantColor = item.dominantColor;
      let patternUrl = item.patternUrl;
      let cutoutUrl = item.cutoutUrl;
      let cutoutAspect = item.cutoutAspect;

      // Extract fabric colour, pattern and (when Gemini gave a box) the full garment cutout
      if ((!dominantColor || !patternUrl || (item.box && !cutoutUrl)) && item.renderAssetUrl) {
        try {
          const extracted = await extractFabricProperties(item.renderAssetUrl, item.box);
          dominantColor = dominantColor || extracted.dominantColor;
          patternUrl = patternUrl || extracted.patternUrl;
          cutoutUrl = cutoutUrl || extracted.cutoutUrl;
          cutoutAspect = cutoutAspect || extracted.cutoutAspect;
        } catch (e) {
          console.warn('[handleAddUGC] fabric extraction fallback:', e);
        }
      }

      const garmentItem: StudioItem = {
        ...item,
        dominantColor: dominantColor || '#8B1E1E',
        patternUrl: patternUrl || item.renderAssetUrl,
        cutoutUrl,
        cutoutAspect,
      };

      setCustomItems((prev) => [garmentItem, ...prev]);
      setCustomGarment(garmentItem);
      if (dominantColor) {
        setSelectedColor(dominantColor);
      }
      // Re-enable live feedback for newly uploaded garment
      setIsAiAudited(false);
      return;
    }

    setCustomItems((prev) => [item, ...prev]);
    if (item.anchorSlot === 'feet') {
      setSelectedShoe(item);
    } else {
      setSelectedAccessory(item);
    }
  }, []);

  // Full AI Cultural Audit via Gemini 2.0 Flash
  const handleAudit = useCallback(async () => {
    setIsAuditing(true);
    try {
      const activeGarmentId = customGarment ? customGarment.id : selectedGarment.id;
      const activeGarmentName = customGarment ? customGarment.name : selectedGarment.name;
      const isCustom = !!customGarment;
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: {
            id: selectedOccasion,
            label: currentOccasion.label,
            strictnessLevel: currentOccasion.strictnessLevel,
          },
          garment: {
            id: activeGarmentId,
            name: activeGarmentName,
            isCustom,
            color: selectedColor,
            family: customGarment?.garmentFamily ?? null,
            sensitivity: customGarment
              ? 'TRUNG BÌNH (Trang phục truyền thống cách tân / trang phục cá nhân)'
              : selectedGarment.id === 'ao-nhat-binh'
              ? 'RẤT CAO (Lễ phục cung đình triều Nguyễn)'
              : 'TRUNG BÌNH (Trang phục truyền thống chuẩn mực)',
          },
          shoes: selectedShoe ? { id: selectedShoe.id, name: selectedShoe.name } : null,
          accessory: selectedAccessory
            ? { id: selectedAccessory.id, name: selectedAccessory.name }
            : null,
          occasionId: selectedOccasion,
          garmentId: activeGarmentId,
          garmentName: activeGarmentName,
          garmentColor: selectedColor,
          footwear: selectedShoe ? [selectedShoe.name] : [],
          accessories: selectedAccessory ? [selectedAccessory.name] : [],
          garmentImage: customGarment?.cutoutUrl || customGarment?.patternUrl || customGarment?.renderAssetUrl || null,
        }),
      });

      if (!res.ok) throw new Error('audit failed');
      const data: CulturalAuditResult = await res.json();
      setAuditResult(data);
      setIsAiAudited(true); // Lock Gemini deep feedback from being overwritten by ping-pong useEffect
    } catch {
      // Deterministic fallback guarantees accurate rubric score even if offline
      const activeGarmentId = customGarment ? customGarment.id : selectedGarment.id;
      const activeGarmentName = customGarment ? customGarment.name : selectedGarment.name;
      const fallback = computeDeterministicAudit({
        occasionId: selectedOccasion,
        occasionLabel: currentOccasion.label,
        garmentId: activeGarmentId,
        garmentName: activeGarmentName,
        garmentColor: selectedColor,
        garmentFamily: customGarment?.garmentFamily,
        shoeId: selectedShoe?.id ?? '',
        shoeName: selectedShoe?.name ?? '',
        accessoryId: selectedAccessory?.id ?? '',
        accessoryName: selectedAccessory?.name ?? '',
      });
      setAuditResult(fallback);
    } finally {
      setIsAuditing(false);
    }
  }, [
    selectedOccasion,
    currentOccasion.label,
    currentOccasion.strictnessLevel,
    selectedGarment.id,
    selectedGarment.name,
    selectedGarmentId,
    selectedColor,
    customGarment,
    selectedShoe,
    selectedAccessory,
  ]);

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#FAF8F5]">
      {/* ── Top Bar ── */}
      <header className="shrink-0 px-4 py-2 border-b border-[#E8E2D8] bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-playfair)] font-bold text-lg text-[#1F1E1D]">
              Vóc Việt
            </span>
            <span className="hidden sm:inline text-xs text-[#9A8F84] font-mono">
              • Phòng Thử Đồ & Thẩm Định Văn Hóa AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini 2.0 Flash Active
            </span>
            <span className="text-[11px] font-mono text-[#9A8F84]">AI Arena 2026</span>
          </div>
        </div>
      </header>

      {/* ── SPLIT-SCREEN MAIN STUDIO ── */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT COLUMN: Controls & Wardrobe Dock ── */}
        <aside className="w-full lg:w-[380px] xl:w-[410px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E8E2D8] bg-white overflow-y-auto custom-scroll p-4 lg:p-5 flex flex-col">
          <WardrobeStudio
            selectedOccasion={selectedOccasion}
            onSelectOccasion={(occ) => {
              setSelectedOccasion(occ);
              setIsAiAudited(false);
            }}
            selectedGarmentId={selectedGarmentId}
            selectedColor={selectedColor}
            customGarment={customGarment}
            onSelectGarment={(id) => {
              setSelectedGarmentId(id);
              setCustomGarment(null); // Reset to preset vector robe
              setIsAiAudited(false);
              const g = GARMENTS_DATA.find((item) => item.id === id);
              if (g) setSelectedColor(g.palette[0].hex);
            }}
            onSelectCustomGarment={(item) => {
              setCustomGarment(item);
              setIsAiAudited(false);
              if (item.dominantColor) {
                setSelectedColor(item.dominantColor);
              }
            }}
            onSelectColor={(c) => {
              setSelectedColor(c);
              setIsAiAudited(false);
            }}
            selectedShoe={selectedShoe}
            selectedAccessory={selectedAccessory}
            onSelectShoe={(s) => {
              setSelectedShoe(s);
              setIsAiAudited(false);
            }}
            onSelectAccessory={(a) => {
              setSelectedAccessory(a);
              setIsAiAudited(false);
            }}
            customItems={customItems}
            onAddUGC={handleAddUGC}
          />
        </aside>

        {/* ── RIGHT COLUMN: Live Studio Canvas + Cultural Compass ── */}
        <section className="flex-1 min-w-0 overflow-y-auto custom-scroll p-4 lg:p-6 bg-[#FAF8F5]">
          <div className="max-w-5xl mx-auto flex flex-col gap-5">
            {/* Active Outfit Status Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E2D9] shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-[#9A8F84] tracking-wider mr-1">
                  Đang phối:
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1F1E1D] text-white">
                  {currentOccasion.emoji} {currentOccasion.label}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#8A7120] border border-[#D4AF37]/30">
                  👘 {customGarment ? customGarment.name : selectedGarment.name}
                </span>
                {selectedShoe && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    👟 {selectedShoe.name}
                  </span>
                )}
                {selectedAccessory && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    ✨ {selectedAccessory.name}
                  </span>
                )}
              </div>

              {isAiAudited && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Đã thẩm định sâu cùng Gemini
                </span>
              )}
            </div>

            {/* Split Screen Stage: Canvas on Left, Cultural Compass Card on Right */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Studio Canvas Stage */}
              <div className="xl:col-span-6 w-full flex justify-center">
                <StudioCanvas
                  key={customGarment?.id ?? 'preset'}
                  garmentName={selectedGarment.name}
                  garmentColor={selectedColor}
                  customGarment={customGarment}
                  selectedShoes={selectedShoe}
                  selectedAccessory={selectedAccessory}
                />
              </div>

              {/* Cultural Compass Card */}
              <div className="xl:col-span-6 w-full flex justify-center">
                <CulturalFeedback
                  result={auditResult}
                  isLoading={isAuditing}
                  onReAudit={handleAudit}
                  onSelectColor={(c) => {
                    setSelectedColor(c);
                    setIsAiAudited(false);
                  }}
                  onExportLookbook={() => setShowLookbook(true)}
                  disableColorChange={!!customGarment}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Lookbook Share Modal ── */}
      <AnimatePresence>
        {showLookbook && (
          <LookbookModal
            onClose={() => setShowLookbook(false)}
            auditResult={auditResult}
            occasionLabel={currentOccasion.label}
            garmentName={customGarment ? customGarment.name : selectedGarment.name}
            garmentColor={selectedColor}
            customGarment={customGarment}
            selectedShoes={selectedShoe}
            selectedAccessory={selectedAccessory}
          />
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="shrink-0 px-4 py-2 border-t border-[#E8E2D9] bg-white/70 text-[10px] text-[#9A8F84] font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Vóc Việt (Co-Mix Studio) · AI Arena VNU × Google 2026</span>
          <span>Bảo Tồn Di Sản · Thẩm Định Văn Hóa Chuẩn Mực</span>
        </div>
      </footer>
    </div>
  );
}
