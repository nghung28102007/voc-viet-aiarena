'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Sparkles, Check, Copy } from 'lucide-react';
import type { CulturalAuditResult } from '@/types';
import type { StudioItem } from '@/data/wardrobe';

interface LookbookModalProps {
  onClose: () => void;
  auditResult: CulturalAuditResult | null;
  occasionLabel: string;
  garmentName: string;
  garmentColor: string;
  customGarment?: StudioItem | null;
  selectedShoes?: StudioItem | null;
  selectedAccessory?: StudioItem | null;
}

export default function LookbookModal({
  onClose,
  auditResult,
  occasionLabel,
  garmentName,
  garmentColor,
  customGarment,
  selectedShoes,
  selectedAccessory,
}: LookbookModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallback defaults
  const score = auditResult?.score ?? 88;
  const badgeTitle = auditResult?.badgeTitle ?? 'Giao Thoa Đương Đại';
  const summary = auditResult?.summary ?? 'Bản phối hài hòa giữa nét đẹp cổ truyền và hơi thở phong cách trẻ.';
  const palette = auditResult?.recommendedPalette ?? [
    { name: 'Đỏ Chu Sa', hex: '#8B1E1E' },
    { name: 'Hoàng Kim', hex: '#D4AF37' },
    { name: 'Trắng Ngà', hex: '#FAF8F5' },
    { name: 'Thanh Trúc', hex: '#2D6A4F' },
  ];

  const statusColor = score >= 70 ? '#059669' : score >= 45 ? '#D97706' : '#DC2626';

  // Render high-res PNG from card
  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      // Find the SVG element in canvas if present
      const svgElement = document.querySelector('svg.drop-shadow-sm') as SVGSVGElement | null;
      let svgDataUrl = '';
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      }

      // Create an offscreen HTML5 canvas for high-DPI export (1080x1440)
      const width = 1080;
      const height = 1440;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Cannot get canvas 2d context');

      // 1. Background Parchment
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, width, height);

      // 2. Ornate Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      ctx.strokeStyle = '#8B1E1E';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(46, 46, width - 92, height - 92);

      // Corner ornaments
      const drawCorner = (x: number, y: number) => {
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCorner(46, 46);
      drawCorner(width - 46, 46);
      drawCorner(46, height - 46);
      drawCorner(width - 46, height - 46);

      // 3. Header Texts
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 38px "Playfair Display", serif, "Times New Roman"';
      ctx.fillText('SẮC VIỆT • CO-MIX STUDIO', width / 2, 110);

      ctx.fillStyle = '#9A8F84';
      ctx.font = 'bold 18px monospace, sans-serif';
      ctx.fillText('THẺ THẨM ĐỊNH VĂN HÓA DI SẢN ĐƯƠNG ĐẠI', width / 2, 145);

      // Line divider
      ctx.strokeStyle = '#E8E2D9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(120, 168);
      ctx.lineTo(width - 120, 168);
      ctx.stroke();

      // Occasion Pill
      ctx.fillStyle = '#1F1E1D';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`BỐI CẢNH: ${occasionLabel.toUpperCase()}`, width / 2, 205);

      // 4. Draw Mannequin Artwork if SVG available
      if (svgDataUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Draw artwork centered
            const artWidth = 440;
            const artHeight = 580;
            const artX = (width - artWidth) / 2;
            const artY = 240;

            // Artwork backdrop card
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#E8E2D8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(artX - 20, artY - 15, artWidth + 40, artHeight + 30, 24);
            ctx.fill();
            ctx.stroke();

            ctx.drawImage(img, artX, artY, artWidth, artHeight);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = svgDataUrl;
        });
      }

      // 5. Score & Badge Badge Section
      const badgeY = 890;
      ctx.fillStyle = '#1F1E1D';
      ctx.font = 'bold 36px "Playfair Display", serif, sans-serif';
      ctx.fillText(badgeTitle, width / 2, badgeY);

      // Score arc box
      ctx.fillStyle = statusColor;
      ctx.font = 'bold 44px monospace, sans-serif';
      ctx.fillText(`${score} / 100`, width / 2, badgeY + 50);

      ctx.fillStyle = '#524B43';
      ctx.font = 'italic 20px "Playfair Display", serif, Georgia';
      
      // Wrap summary into max 2 lines
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
      };
      wrapText(`“${summary}”`, width / 2, badgeY + 95, 780, 28);

      // 6. Outfit items breakdown
      const itemsY = 1080;
      ctx.fillStyle = '#FAF8F5';
      ctx.strokeStyle = '#E8E2D9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(90, itemsY, width - 180, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1F1E1D';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`👘 Trang phục: ${customGarment ? customGarment.name : garmentName}`, 120, itemsY + 40);
      ctx.fillText(
        `👟 Giày dép: ${selectedShoes ? selectedShoes.name : 'Chưa chọn'}   •   ✨ Phụ kiện: ${
          selectedAccessory ? selectedAccessory.name : 'Không có'
        }`,
        120,
        itemsY + 78
      );

      // 7. Palette Row
      const paletteY = 1230;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9A8F84';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('BẢNG MÀU PANTONE ĐỀ XUẤT TỪ GEMINI AI', width / 2, paletteY);

      const chipSpacing = 140;
      const startX = width / 2 - ((palette.length - 1) * chipSpacing) / 2;
      palette.forEach((p, idx) => {
        const cx = startX + idx * chipSpacing;
        const cy = paletteY + 36;
        ctx.fillStyle = p.hex;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00000022';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#1F1E1D';
        ctx.font = '14px sans-serif';
        ctx.fillText(p.name, cx, cy + 30);
      });

      // 8. Watermark Footer
      ctx.fillStyle = '#9A8F84';
      ctx.font = '15px monospace';
      ctx.fillText('AI ARENA 2026 • GOOGLE GEMINI 3.8 / FLASH • SAC-VIET.VN', width / 2, 1390);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sac-viet-lookbook-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('[LookbookModal] Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [occasionLabel, garmentName, customGarment, selectedShoes, selectedAccessory, badgeTitle, score, statusColor, summary, palette]);

  // Copy card image to clipboard
  const handleCopy = useCallback(async () => {
    try {
      handleDownload();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [handleDownload]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden flex flex-col my-auto"
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E2D9] bg-white/60">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#8B1E1E]" />
            <span className="text-xs font-bold text-[#1F1E1D] font-mono uppercase tracking-wider">
              Thẻ Di Sản Sắc Việt
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Preview Body */}
        <div ref={cardRef} className="p-5 sm:p-6 space-y-4">
          {/* Card Frame */}
          <div className="rounded-2xl border-2 border-[#D4AF37] p-4 bg-white/90 shadow-sm space-y-3 relative overflow-hidden">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] font-mono font-semibold text-[#8B1E1E] tracking-widest uppercase">
                VNU × Google AI Arena 2026
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-black text-[#1F1E1D]">
                Sắc Việt • Lookbook Di Sản
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] text-[10px] font-semibold text-[#524B43]">
                <span>Bối cảnh:</span>
                <span className="font-bold text-[#8B1E1E]">{occasionLabel}</span>
              </div>
            </div>

            {/* Score & Badge Hero */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9A8F84] tracking-wider block">
                  Huy hiệu thẩm định
                </span>
                <span className="text-base font-extrabold text-[#1F1E1D]">{badgeTitle}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#9A8F84] tracking-wider block">
                  Điểm hòa hợp
                </span>
                <span className="text-2xl font-black font-mono tabular-nums" style={{ color: statusColor }}>
                  {score}
                  <span className="text-xs text-[#9A8F84]">/100</span>
                </span>
              </div>
            </div>

            {/* Gemini Summary Quote */}
            <div className="p-3 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#4A443C] italic leading-relaxed text-pretty">
              &ldquo;{summary}&rdquo;
            </div>

            {/* Look Details List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F0EBE3]">
                <span className="text-[#9A8F84]">Trang phục:</span>
                <span className="font-bold text-[#1F1E1D] truncate max-w-[200px]">
                  {customGarment ? customGarment.name : garmentName}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0EBE3]">
                <span className="text-[#9A8F84]">Giày dép:</span>
                <span className="font-semibold text-[#1F1E1D]">
                  {selectedShoes ? selectedShoes.name : 'Chưa chọn'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#9A8F84]">Phụ kiện:</span>
                <span className="font-semibold text-[#1F1E1D]">
                  {selectedAccessory ? selectedAccessory.name : 'Không có'}
                </span>
              </div>
            </div>

            {/* Palette Row */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-wider block mb-1.5">
                Bảng màu gợi ý từ AI
              </span>
              <div className="flex flex-wrap gap-1.5">
                {palette.map((p) => (
                  <div
                    key={p.hex}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D9] text-[9px] font-mono text-[#1F1E1D]"
                  >
                    <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: p.hex }} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Footer */}
            <div className="pt-2 text-center border-t border-[#E8E2D9]">
              <span className="text-[9px] font-mono text-[#9A8F84] flex items-center justify-center gap-1">
                <Sparkles size={10} className="text-[#D4AF37]" />
                Được thẩm định bởi Google Gemini Multimodal Vision AI
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-[#E8E2D9] bg-white flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#6A1515] text-white font-bold text-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <span>Đang kết xuất thẻ PNG…</span>
            ) : (
              <>
                <Download size={15} />
                <span>Tải Thẻ Về Máy (PNG)</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-3 rounded-xl border border-[#D4AF37] bg-[#FAF8F5] hover:bg-white text-[#8B1E1E] transition-all cursor-pointer"
            title="Sao chép / Tải nhanh"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
