'use client';

import React from 'react';
import { StudioItem } from '@/data/wardrobe';

interface Props {
  garmentName: string;
  garmentColor: string;
  customGarment?: StudioItem | null;
  selectedShoes: StudioItem | null;
  selectedAccessory: StudioItem | null;
}

type ShapeMode = 'original' | 'template';

// Area of the mannequin body (viewBox 0 0 300 450) where an original-shape garment is fitted
const GARMENT_AREA = { centerX: 150, top: 92, maxW: 130, maxH: 270 };

export const StudioCanvas: React.FC<Props> = ({
  garmentName,
  garmentColor = '#8B1E1E',
  customGarment,
  selectedShoes,
  selectedAccessory,
}) => {
  // Predefined Anatomy Anchors in ViewBox (0 0 300 450)
  const ANCHORS = {
    head: { x: 135, y: 18, width: 30, height: 30 },
    eyes: { x: 137, y: 47, width: 26, height: 10 },
    wrist: { x: 92, y: 220, width: 16, height: 12 },
    hand: { x: 194, y: 222, width: 24, height: 28 },
    feet: { x: 116, y: 382, width: 68, height: 28 },
  };

  const [nudgeX, setNudgeX] = React.useState(0);
  const [nudgeY, setNudgeY] = React.useState(0);
  const [nudgeScale, setNudgeScale] = React.useState(1);
  const [shapeChoice, setShapeChoice] = React.useState<ShapeMode | null>(null);

  // Dominant fabric color and clean pattern graphic
  const effectiveColor = customGarment?.dominantColor || garmentColor || '#8B1E1E';
  const customGraphic = customGarment?.patternUrl || customGarment?.renderAssetUrl;

  // Original-shape rendering needs a real garment cutout (uploads with a Gemini bounding box).
  // Flat SVG samples and preset robes always use the template silhouette.
  const cutoutUrl = customGarment?.cutoutUrl;
  const canUseOriginal = !!cutoutUrl;
  const mode: ShapeMode = customGarment && canUseOriginal ? shapeChoice ?? 'original' : 'template';

  // Fit the cutout inside the torso area while keeping its aspect ratio
  const cutoutRect = (() => {
    const aspect = customGarment?.cutoutAspect && customGarment.cutoutAspect > 0 ? customGarment.cutoutAspect : 0.6;
    let w = GARMENT_AREA.maxW;
    let h = w / aspect;
    if (h > GARMENT_AREA.maxH) {
      h = GARMENT_AREA.maxH;
      w = h * aspect;
    }
    return { x: GARMENT_AREA.centerX - w / 2, y: GARMENT_AREA.top, w, h };
  })();

  const nudgeTransform = `translate(${nudgeX}, ${nudgeY}) scale(${nudgeScale})`;

  return (
    <div className="relative w-full aspect-[3/4] max-w-[420px] mx-auto bg-[#FAF8F5] rounded-3xl border border-[#E8E2D8] shadow-sm flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Studio Header */}
      <div className="relative z-20 flex items-center justify-between border-b border-[#E8E2D8]/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#8B1E1E]" />
          <span className="font-mono text-[11px] tracking-widest uppercase text-neutral-500 font-bold">
            Vóc Việt • Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-600 bg-white/90 px-2.5 py-0.5 rounded-full border border-neutral-200 flex items-center gap-1.5 shadow-xs">
            <span
              className="size-2 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: effectiveColor }}
            />
            {customGarment ? customGarment.name : garmentName || 'Áo Ngũ Thân'}
          </span>
        </div>
      </div>

      {/* VIEWPORT SVG */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        <svg viewBox="0 0 300 450" className="w-full h-full max-h-[390px] drop-shadow-sm">
          <defs>
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5D5BE" />
              <stop offset="100%" stopColor="#E8BF9E" />
            </linearGradient>

            {/* Template Robe Silhouette ClipPath — Guarantees exact Royal proportions */}
            <clipPath id="templateRobeClip">
              <path d="M 130 95 L 110 115 L 105 210 L 118 200 L 118 360 L 182 360 L 182 200 L 195 210 L 190 115 L 170 95 Z" />
            </clipPath>
          </defs>

          {/* 1. Ground Shadow & Legs */}
          <ellipse cx="150" cy="425" rx="60" ry="8" fill="url(#groundShadow)" />
          <rect x="133" y="340" width="12" height="60" rx="5" fill="url(#skinGrad)" />
          <rect x="155" y="340" width="12" height="60" rx="5" fill="url(#skinGrad)" />

          {/* 2. Base Anatomy: Mannequin Head & Neck (drawn behind garment so neck sits naturally inside collar) */}
          <g id="base-anatomy">
            {/* Neck */}
            <rect x="143" y="78" width="14" height="26" fill="url(#skinGrad)" rx="4" />
            {/* Head & Face */}
            <path
              d="M 135 50 C 135 37 142 30 150 30 C 158 30 165 37 165 50 C 165 65 158 76 150 76 C 142 76 135 65 135 50 Z"
              fill="#F8E3D1"
            />
            {/* Hair Bun & Gold Pin */}
            <path
              d="M 133 46 C 133 30 141 22 150 22 C 159 22 167 30 167 46 C 163 35 155 33 150 33 C 145 33 137 35 133 46 Z"
              fill="#1C1917"
            />
            <circle cx="150" cy="17" r="8" fill="#1C1917" />
            <circle cx="150" cy="17" r="2.5" fill="#D4AF37" />

            {/* Slender Mannequin Arms extending naturally from the template sleeves.
                Hidden in original-shape mode: the garment image carries its own sleeves. */}
            {mode === 'template' && (
              <>
                <path d="M 112 110 L 98 220 L 107 222 L 121 120 Z" fill="url(#skinGrad)" />
                <circle cx="98" cy="227" r="5.5" fill="url(#skinGrad)" />
                <path d="M 188 110 L 202 220 L 193 222 L 179 120 Z" fill="url(#skinGrad)" />
                <circle cx="202" cy="227" r="5.5" fill="url(#skinGrad)" />
              </>
            )}
          </g>

          {/* 3. DYNAMIC FOOTWEAR SLOT */}
          {selectedShoes && (
            <g
              id="dynamic-shoes-slot"
              transform={`translate(${selectedShoes.transform?.offsetX || 0}, ${selectedShoes.transform?.offsetY || 0}) scale(${selectedShoes.transform?.scale || 1})`}
              style={{ transformOrigin: '150px 395px' }}
            >
              {selectedShoes.renderAssetUrl ? (
                <image
                  href={selectedShoes.renderAssetUrl}
                  x={ANCHORS.feet.x}
                  y={ANCHORS.feet.y}
                  width={ANCHORS.feet.width}
                  height={ANCHORS.feet.height}
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : null}
            </g>
          )}

          {/* 4a. Garment layer — ORIGINAL SHAPE: the user's own garment, cropped by Gemini's bounding box */}
          {mode === 'original' && cutoutUrl && (
            <g id="original-garment-layer">
              <g transform={nudgeTransform} style={{ transformOrigin: '150px 225px' }}>
                <image
                  href={cutoutUrl}
                  x={cutoutRect.x}
                  y={cutoutRect.y}
                  width={cutoutRect.w}
                  height={cutoutRect.h}
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>
          )}

          {/* 4b. Garment layer — TEMPLATE ROBE: preset robes, flat samples, or "apply pattern to template" */}
          {mode === 'template' && (
            <g id="heritage-garment-rig">
              {/* Layer 1: Base Robe Silhouette (Dominant Fabric Hue) */}
              <path
                d="M 130 95 L 110 115 L 105 210 L 118 200 L 118 360 L 182 360 L 182 200 L 195 210 L 190 115 L 170 95 Z"
                fill={effectiveColor}
              />

              {/* Layer 2: Authentic Pattern & Embroidery Projection (Clipped inside the robe) */}
              {customGarment && customGraphic && (
                <g clipPath="url(#templateRobeClip)">
                  <g transform={nudgeTransform} style={{ transformOrigin: '150px 225px' }}>
                    <image
                      href={customGraphic}
                      x={75}
                      y={95}
                      width={150}
                      height={268}
                      preserveAspectRatio="xMidYMin slice"
                      opacity="0.96"
                    />
                  </g>
                </g>
              )}

              {/* Layer 3: Center Lapel Seam & Fold Shadows */}
              <path d="M 148 95 L 150 360 L 152 360 L 150 95 Z" fill="rgba(0,0,0,0.12)" />
              <path d="M 170 115 L 180 200 L 182 360 L 178 360 L 175 200 Z" fill="rgba(0,0,0,0.06)" />

              {/* Layer 4: Mandarin Standing Collar (Cổ Đứng Triều Nguyễn) */}
              <path
                d="M 139 88 L 161 88 L 157 106 L 143 106 Z"
                fill={effectiveColor}
                stroke="#D4AF37"
                strokeWidth="1.5"
              />
              {/* Gold Inner Collar Piping */}
              <line
                x1="144"
                y1="92"
                x2="156"
                y2="92"
                stroke="#FFE066"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Layer 5: Sleeve Cuffs — Royal Gold Piping */}
              <line x1="105" y1="210" x2="118" y2="200" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="182" y1="200" x2="195" y2="210" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />

              {/* Layer 6: Bottom Hemline Gold Border Embroidery */}
              <line x1="118" y1="360" x2="182" y2="360" stroke="#D4AF37" strokeWidth="2.5" />
              <line
                x1="120"
                y1="357"
                x2="180"
                y2="357"
                stroke="#FFE066"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
            </g>
          )}

          {/* 5. DYNAMIC ACCESSORY SLOT */}
          {selectedAccessory && selectedAccessory.renderAssetUrl && selectedAccessory.anchorSlot !== 'garment' && (
            <g
              id="dynamic-accessory-slot"
              transform={`translate(${selectedAccessory.transform?.offsetX || 0}, ${selectedAccessory.transform?.offsetY || 0}) scale(${selectedAccessory.transform?.scale || 1})`}
            >
              {(() => {
                const slot = ANCHORS[selectedAccessory.anchorSlot as keyof typeof ANCHORS] || ANCHORS.hand;
                return (
                  <image
                    href={selectedAccessory.renderAssetUrl}
                    x={slot.x}
                    y={slot.y}
                    width={slot.width}
                    height={slot.height}
                    preserveAspectRatio="xMidYMid meet"
                  />
                );
              })()}
            </g>
          )}
        </svg>

        {/* Shape mode switch — only for uploads that have a real garment cutout */}
        {customGarment && canUseOriginal && (
          <div
            role="group"
            aria-label="Chế độ hiển thị trang phục"
            className="absolute bottom-2 left-2 z-30 flex items-center gap-0.5 bg-white/95 backdrop-blur-md p-0.5 rounded-xl border border-neutral-200/80 shadow-xs text-[10px] font-semibold select-none"
          >
            {(
              [
                { key: 'original', label: 'Phom gốc' },
                { key: 'template', label: 'Phom mẫu' },
              ] as { key: ShapeMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setShapeChoice(opt.key)}
                aria-pressed={mode === opt.key}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  mode === opt.key
                    ? 'bg-[#1F1E1D] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Quick alignment micro-toolbar when custom garment is active — Positioned in the bottom corner */}
        {customGarment && (
          <div className="absolute bottom-2 right-2 z-30 flex items-center gap-0.5 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-neutral-200/80 shadow-xs text-[9px] text-neutral-600 select-none">
            <span className="font-mono text-[8px] text-neutral-400 font-semibold px-0.5">
              {mode === 'original' ? 'Căn áo:' : 'Căn hoa văn:'}
            </span>
            <button
              type="button"
              onClick={() => setNudgeX((x) => x - 3)}
              aria-label="Dịch sang trái"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Dịch sang trái"
            >
              ◄
            </button>
            <button
              type="button"
              onClick={() => setNudgeX((x) => x + 3)}
              aria-label="Dịch sang phải"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Dịch sang phải"
            >
              ►
            </button>
            <button
              type="button"
              onClick={() => setNudgeY((y) => y - 3)}
              aria-label="Nâng lên"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Nâng lên"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => setNudgeY((y) => y + 3)}
              aria-label="Hạ xuống"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Hạ xuống"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => setNudgeScale((s) => Math.max(0.7, Number((s - 0.04).toFixed(2))))}
              aria-label="Thu nhỏ"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Thu nhỏ"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setNudgeScale((s) => Math.min(1.4, Number((s + 0.04).toFixed(2))))}
              aria-label="Phóng to"
              className="size-5 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
              title="Phóng to"
            >
              +
            </button>
            {(nudgeX !== 0 || nudgeY !== 0 || nudgeScale !== 1) && (
              <button
                type="button"
                onClick={() => {
                  setNudgeX(0);
                  setNudgeY(0);
                  setNudgeScale(1);
                }}
                className="text-[8px] text-[#8B1E1E] font-semibold hover:underline px-1 cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Indicators */}
      <div className="relative z-20 flex items-center justify-between pt-3 border-t border-[#E8E2D8]/80 text-xs">
        <span className="text-[11px] text-neutral-500 font-mono">
          Engine:{' '}
          <span className="text-emerald-700 font-bold">
            {!customGarment
              ? 'Heritage Vector Rig'
              : mode === 'original'
              ? 'Original Garment Layer (Phom Gốc)'
              : 'Heritage Silhouette Rig (Tái Tạo Phom Mẫu)'}
          </span>
        </span>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {customGarment && (
            <span className="flex items-center gap-1.5 text-[10px] bg-white border border-[#D4AF37] px-2 py-0.5 rounded-md text-[#8B1E1E] font-medium shadow-xs">
              <span
                className="size-2 rounded-full border border-black/15 inline-block shrink-0"
                style={{ backgroundColor: effectiveColor }}
              />
              👘 {customGarment.name}
            </span>
          )}
          {selectedShoes && (
            <span className="text-[10px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-700 font-medium shadow-xs">
              👟 {selectedShoes.name}
            </span>
          )}
          {selectedAccessory && selectedAccessory.anchorSlot !== 'garment' && (
            <span className="text-[10px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-700 font-medium shadow-xs">
              ✨ {selectedAccessory.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioCanvas;
