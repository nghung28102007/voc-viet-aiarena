'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  X,
  Palette,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  RefreshCw,
  Share2,
} from 'lucide-react';
import type { CulturalAuditResult, AuditStatus } from '@/types';

interface CulturalFeedbackProps {
  result: CulturalAuditResult | null;
  isLoading: boolean;
  onClose?: () => void;
  onReAudit?: () => void;
  onSelectColor?: (hex: string) => void;
  onExportLookbook?: () => void;
}

const STATUS_CONFIG: Record<
  AuditStatus,
  { label: string; icon: React.ReactNode; cls: string; barColor: string }
> = {
  safe: {
    label: 'An Toàn Văn Hóa',
    icon: <ShieldCheck size={14} className="shrink-0" />,
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    barColor: '#059669',
  },
  caution: {
    label: 'Cần Lưu Ý',
    icon: <AlertTriangle size={14} className="shrink-0" />,
    cls: 'bg-amber-50 text-amber-800 border-amber-300',
    barColor: '#D97706',
  },
  violation: {
    label: 'Lệch Chuẩn / Vi Phạm',
    icon: <XCircle size={14} className="shrink-0" />,
    cls: 'bg-red-50 text-red-800 border-red-300',
    barColor: '#DC2626',
  },
};

export default function CulturalFeedback({
  result,
  isLoading,
  onClose,
  onReAudit,
  onSelectColor,
  onExportLookbook,
}: CulturalFeedbackProps) {
  const [expanded, setExpanded] = useState(true);

  const scoreColor = result
    ? result.score >= 70
      ? '#059669'
      : result.score >= 45
      ? '#D97706'
      : '#DC2626'
    : '#9A8F84';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full bg-white rounded-3xl border border-[#E8E2D9] shadow-sm overflow-hidden"
    >
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E2D9] bg-[#FAF8F5]/80">
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-[#8B1E1E]" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-[#1F1E1D] font-mono">
            Thước Đo Văn Hóa · Cultural Compass
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {result && !isLoading && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                STATUS_CONFIG[result.status].cls
              }`}
            >
              {STATUS_CONFIG[result.status].icon}
              {STATUS_CONFIG[result.status].label}
            </span>
          )}

          {result && !isLoading && (
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label="Thu gọn hoặc mở rộng phân tích văn hóa"
              className="p-1 rounded-lg hover:bg-[#F0EBE3] text-[#9A8F84] transition-colors"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Đóng bảng đánh giá"
              className="p-1 rounded-lg hover:bg-[#F0EBE3] text-[#9A8F84] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 space-y-4">
        {isLoading ? (
          <SkeletonLoader />
        ) : result ? (
          <>
            {/* Score & Summary Banner */}
            <div className="flex items-center gap-4">
              <ScoreArc score={result.score} color={scoreColor} />

              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[#1F1E1D] text-balance leading-snug">
                  {result.badgeTitle}
                </p>
                <p className="text-xs text-[#524B43] mt-1 leading-relaxed text-pretty">
                  {result.summary || result.culturalInsight}
                </p>
              </div>
            </div>

            {/* Warning Box (if status is violation or caution or correctionNotice present) */}
            {result.correctionNotice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl p-3.5 border ${
                  result.status === 'violation'
                    ? 'bg-red-50/90 border-red-200 text-red-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="shrink-0" />
                  Khuyến nghị chỉnh phục từ chuyên gia
                </p>
                <p className="text-xs leading-relaxed text-pretty font-medium">
                  {result.correctionNotice}
                </p>
              </motion.div>
            )}

            {/* Expandable Details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5 pt-1 overflow-hidden"
                >
                  {/* Heritage Insight */}
                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] p-3.5">
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <BookOpen size={12} />
                      Di sản & Ý nghĩa biểu trưng
                    </p>
                    <p className="text-xs text-[#4A443C] leading-relaxed text-pretty">
                      {result.culturalInsight}
                    </p>
                  </div>

                  {/* Harmony Analysis if provided */}
                  {result.harmonyAnalysis && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] p-2.5">
                        <p className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider mb-1">
                          Màu sắc
                        </p>
                        <p className="text-[11px] text-[#4A443C] leading-tight">
                          {result.harmonyAnalysis.colorMatch}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] p-2.5">
                        <p className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider mb-1">
                          Tỷ lệ phom dáng
                        </p>
                        <p className="text-[11px] text-[#4A443C] leading-tight">
                          {result.harmonyAnalysis.styleBalance}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommended Palette */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#9A8F84] uppercase tracking-wider flex items-center gap-1.5">
                        <Palette size={12} className="text-[#D4AF37]" />
                        Bảng màu gợi ý (Click đổi màu trực tiếp)
                      </span>
                      <span className="text-[9px] font-mono text-[#D4AF37] font-semibold">Tương tác 2 chiều</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.recommendedPalette.map((chip) => (
                        <button
                          key={chip.hex}
                          type="button"
                          onClick={() => onSelectColor?.(chip.hex)}
                          title={`Click để áp dụng màu ${chip.name} (${chip.hex})`}
                          className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D9] px-2.5 py-1.5 rounded-xl shadow-xs hover:border-[#D4AF37] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                        >
                          <span
                            className="size-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-[#D4AF37]/50 transition-all"
                            style={{ backgroundColor: chip.hex }}
                          />
                          <span className="text-[10px] font-semibold text-[#1F1E1D] font-mono group-hover:text-[#8B1E1E]">
                            {chip.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTAs: Re-Audit + Export Lookbook Card */}
            <div className="space-y-2 pt-1">
              {onReAudit && (
                <button
                  onClick={onReAudit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-white via-[#FAF8F5] to-white text-[#8B1E1E] hover:border-[#8B1E1E] font-bold text-xs transition-all disabled:opacity-60 cursor-pointer shadow-xs hover:shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#8B1E1E]" />
                      Đang thẩm định cùng Gemini Vision AI…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-[#D4AF37]" />
                      Thẩm định sâu cùng Gemini AI
                    </>
                  )}
                </button>
              )}

              {onExportLookbook && (
                <button
                  onClick={onExportLookbook}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1F1E1D] hover:bg-[#33312E] text-[#FAF8F5] font-bold text-xs transition-all cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <Share2 size={13} className="text-[#D4AF37]" />
                  <span>✨ Xuất Thẻ Thẩm Định / Chia Sẻ Lookbook (PNG)</span>
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

// ─── Score Arc Component ──────────────────────────────────────────────────────
function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ * 0.75; // 270° arc

  return (
    <div className="relative size-18 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 68 68" className="size-full -rotate-[135deg]">
        {/* Track */}
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#E8E2D9"
          strokeWidth="5"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ}`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${arc} ${circ}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold leading-none tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-[9px] font-mono text-[#9A8F84] mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Skeleton Loader Component ────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="skeleton size-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-2/3 rounded-lg" />
          <div className="skeleton h-3.5 w-full rounded-md" />
          <div className="skeleton h-3.5 w-4/5 rounded-md" />
        </div>
      </div>
      <div className="skeleton h-16 w-full rounded-2xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-7 w-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
