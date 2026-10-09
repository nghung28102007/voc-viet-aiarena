/**
 * HTML5 Canvas Helper: SVG-Native Fabric Texture & Dominant Color Extractor
 * 
 * Analyzes uploaded garment images, filters transparent and background noise,
 * extracts the dominant fabric hex color, and crops a seamless texture tile for SVG <pattern>.
 */

export interface FabricProperties {
  dominantColor: string; // e.g. '#8B1E1E'
  patternUrl: string;    // Data URL for SVG <pattern>
}

/**
 * Extracts dominant fabric color and a texture pattern tile from an image URL.
 */
export async function extractFabricProperties(imageUrl: string): Promise<FabricProperties> {
  return new Promise((resolve) => {
    // If running in SSR environment, return fallback
    if (typeof window === 'undefined') {
      return resolve({ dominantColor: '#8B1E1E', patternUrl: imageUrl });
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || 400;
        const naturalH = img.naturalHeight || 600;

        // ── 1. Dominant Color Extraction ─────────────────────────────────────────
        // Sample on a normalized 100x100 grid for fast and consistent quantization
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 100;
        sampleCanvas.height = 100;
        const sCtx = sampleCanvas.getContext('2d');

        if (!sCtx) {
          return resolve({ dominantColor: '#8B1E1E', patternUrl: imageUrl });
        }

        sCtx.drawImage(img, 0, 0, 100, 100);
        const imgData = sCtx.getImageData(0, 0, 100, 100).data;

        // Quantize colors into 16-step RGB buckets to find the modal color (most common fabric hue)
        const buckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
        let nonTransparentCount = 0;
        let totalR = 0, totalG = 0, totalB = 0;

        // Focus sampling primarily on the torso fabric area (35% to 75% height, 25% to 75% width)
        for (let y = 35; y < 75; y++) {
          for (let x = 25; x < 75; x++) {
            const idx = (y * 100 + x) * 4;
            const a = imgData[idx + 3];
            if (a < 120) continue; // Ignore transparent pixels

            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];

            nonTransparentCount++;
            totalR += r;
            totalG += g;
            totalB += b;

            // Ignore extreme plain white background remnants unless whole garment is white
            const isNearWhite = r > 250 && g > 250 && b > 250;
            if (isNearWhite) continue;

            const key = `${Math.floor(r / 20)}_${Math.floor(g / 20)}_${Math.floor(b / 20)}`;
            if (!buckets[key]) {
              buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
            }
            buckets[key].r += r;
            buckets[key].g += g;
            buckets[key].b += b;
            buckets[key].count++;
          }
        }

        // Determine dominant color
        let maxCount = 0;
        let domR = 139, domG = 30, domB = 30; // Default Vietnamese crimson (#8B1E1E)

        for (const k in buckets) {
          if (buckets[k].count > maxCount) {
            maxCount = buckets[k].count;
            domR = Math.round(buckets[k].r / buckets[k].count);
            domG = Math.round(buckets[k].g / buckets[k].count);
            domB = Math.round(buckets[k].b / buckets[k].count);
          }
        }

        // If no non-background bucket found (e.g. all-white silk garment)
        if (maxCount === 0 && nonTransparentCount > 0) {
          domR = Math.round(totalR / nonTransparentCount);
          domG = Math.round(totalG / nonTransparentCount);
          domB = Math.round(totalB / nonTransparentCount);
        }

        const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
        const dominantColor = `#${toHex(domR)}${toHex(domG)}${toHex(domB)}`.toUpperCase();

        // ── 2. Extract Clean Garment Torso & Motif Graphic ─────────────────────
        // Crops the garment's central torso & chest zone:
        // Automatically excludes model's head (y < 22%), side arms (x < 23% and x > 77%), and feet (y > 84%)
        const torsoCanvas = document.createElement('canvas');
        const outW = 360;
        const outH = 540;
        torsoCanvas.width = outW;
        torsoCanvas.height = outH;
        const tCtx = torsoCanvas.getContext('2d');

        const cropX = Math.max(0, naturalW * 0.22);
        const cropW = Math.min(naturalW - cropX, naturalW * 0.56);
        const cropY = Math.max(0, naturalH * 0.22);
        const cropH = Math.min(naturalH - cropY, naturalH * 0.62);

        if (tCtx) {
          tCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
        }
        const patternUrl = torsoCanvas.toDataURL('image/png');

        resolve({ dominantColor, patternUrl });
      } catch (err) {
        console.error('[extractFabricProperties] error:', err);
        resolve({ dominantColor: '#8B1E1E', patternUrl: imageUrl });
      }
    };

    img.onerror = () => {
      resolve({ dominantColor: '#8B1E1E', patternUrl: imageUrl });
    };
  });
}
