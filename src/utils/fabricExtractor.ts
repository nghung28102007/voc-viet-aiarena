/**
 * HTML5 Canvas helper: dominant fabric colour, pattern crop and garment cutout.
 *
 * When Gemini supplies a bounding box (normalised 0–1) we crop exactly the garment
 * and keep its aspect ratio. Without a box we fall back to the legacy fixed-percentage
 * torso crop (assumes a standing model photo).
 */

import type { NormalizedBox } from '@/types';

export interface FabricProperties {
  /** e.g. '#8B1E1E' */
  dominantColor: string;
  /** Torso/pattern crop, used when projecting the print onto the template robe */
  patternUrl: string;
  /** Full garment crop (aspect preserved) — only when a bounding box was provided */
  cutoutUrl?: string;
  /** width / height of cutoutUrl */
  cutoutAspect?: number;
}

const DEFAULT_COLOR = '#8B1E1E';
const BOX_PADDING = 0.02;
const CUTOUT_MAX_SIDE = 720;
const PATTERN_MAX_SIDE = 540;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function canvasWithSize(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Output size that fits (w × h) inside maxSide while keeping the aspect ratio. */
function fitSize(w: number, h: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(w, h));
  return { w: w * scale, h: h * scale };
}

export async function extractFabricProperties(
  imageUrl: string,
  box?: NormalizedBox
): Promise<FabricProperties> {
  const fallback: FabricProperties = { dominantColor: DEFAULT_COLOR, patternUrl: imageUrl };

  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(fallback);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const nw = img.naturalWidth || 400;
        const nh = img.naturalHeight || 600;

        // ── Garment region (pixels): padded bounding box, or the whole image ──
        const rx = box ? clamp(box.x - BOX_PADDING, 0, 1) * nw : 0;
        const ry = box ? clamp(box.y - BOX_PADDING, 0, 1) * nh : 0;
        const rw = box ? Math.min(nw - rx, (box.w + BOX_PADDING * 2) * nw) : nw;
        const rh = box ? Math.min(nh - ry, (box.h + BOX_PADDING * 2) * nh) : nh;

        // ── 1. Dominant colour from the central area of the garment ──
        const sample = canvasWithSize(64, 64);
        const sCtx = sample.getContext('2d', { willReadFrequently: true });
        if (!sCtx) return resolve(fallback);

        sCtx.drawImage(img, rx + rw * 0.25, ry + rh * 0.3, rw * 0.5, rh * 0.4, 0, 0, 64, 64);
        const data = sCtx.getImageData(0, 0, 64, 64).data;

        const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};
        let opaque = 0;
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 120) continue; // transparent
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          opaque++;
          totalR += r;
          totalG += g;
          totalB += b;
          if (r > 250 && g > 250 && b > 250) continue; // near-white background remnants
          const key = `${Math.floor(r / 20)}_${Math.floor(g / 20)}_${Math.floor(b / 20)}`;
          const bucket = (buckets[key] ??= { r: 0, g: 0, b: 0, count: 0 });
          bucket.r += r;
          bucket.g += g;
          bucket.b += b;
          bucket.count++;
        }

        let maxCount = 0;
        let domR = 139;
        let domG = 30;
        let domB = 30;
        for (const k in buckets) {
          const bk = buckets[k];
          if (bk.count > maxCount) {
            maxCount = bk.count;
            domR = Math.round(bk.r / bk.count);
            domG = Math.round(bk.g / bk.count);
            domB = Math.round(bk.b / bk.count);
          }
        }
        // All-white silk garment: average everything that was opaque
        if (maxCount === 0 && opaque > 0) {
          domR = Math.round(totalR / opaque);
          domG = Math.round(totalG / opaque);
          domB = Math.round(totalB / opaque);
        }

        const toHex = (n: number) => clamp(n, 0, 255).toString(16).padStart(2, '0');
        const dominantColor = `#${toHex(domR)}${toHex(domG)}${toHex(domB)}`.toUpperCase();

        // ── 2. Full garment cutout (only when we know where the garment is) ──
        let cutoutUrl: string | undefined;
        let cutoutAspect: number | undefined;
        if (box) {
          const { w, h } = fitSize(rw, rh, CUTOUT_MAX_SIDE);
          const cutout = canvasWithSize(w, h);
          const cCtx = cutout.getContext('2d');
          if (cCtx) {
            cCtx.drawImage(img, rx, ry, rw, rh, 0, 0, cutout.width, cutout.height);
            cutoutUrl = cutout.toDataURL('image/png');
            cutoutAspect = rw / rh;
          }
        }

        // ── 3. Pattern crop (torso area), aspect ratio preserved ──
        const t = box
          ? { fx: 0.2, fy: 0.12, fw: 0.6, fh: 0.6 } // inside the garment box
          : { fx: 0.22, fy: 0.22, fw: 0.56, fh: 0.62 }; // legacy: standing model photo
        const px = rx + rw * t.fx;
        const py = ry + rh * t.fy;
        const pw = rw * t.fw;
        const ph = rh * t.fh;
        const pSize = fitSize(pw, ph, PATTERN_MAX_SIDE);
        const pattern = canvasWithSize(pSize.w, pSize.h);
        const pCtx = pattern.getContext('2d');
        if (pCtx) pCtx.drawImage(img, px, py, pw, ph, 0, 0, pattern.width, pattern.height);
        const patternUrl = pattern.toDataURL('image/png');

        resolve({ dominantColor, patternUrl, cutoutUrl, cutoutAspect });
      } catch (err) {
        console.error('[extractFabricProperties] error:', err);
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
  });
}
