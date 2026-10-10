import { NextRequest, NextResponse } from 'next/server';
import type { InspectItemResult, GarmentFamily, NormalizedBox } from '@/types';

// Supported Gemini models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

const PER_MODEL_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const FAMILIES: GarmentFamily[] = ['ao-dai', 'ba-ba', 'ngu-than', 'tu-than', 'nhat-binh', 'khac'];
const CATEGORIES = ['garment', 'footwear', 'accessory'] as const;

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_RESULT: InspectItemResult = {
  label: 'Phụ Kiện Thời Trang',
  category: 'accessory',
  confidence: 0.85,
  placement: { x: 0.6, y: 0.5 },
  source: 'fallback',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Gemini boxes are [ymin, xmin, ymax, xmax] on a 0–1000 scale. */
function normalizeBox(raw: unknown): NormalizedBox | undefined {
  if (!Array.isArray(raw) || raw.length !== 4) return undefined;
  const nums = raw.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return undefined;
  const [ymin, xmin, ymax, xmax] = nums;
  const x = clamp01(xmin / 1000);
  const y = clamp01(ymin / 1000);
  const w = clamp01(xmax / 1000) - x;
  const h = clamp01(ymax / 1000) - y;
  // Reject degenerate boxes — the client will fall back to its default crop
  if (w < 0.1 || h < 0.1) return undefined;
  return { x, y, w, h };
}

function cleanLabel(raw: unknown): string {
  if (typeof raw !== 'string') return MOCK_RESULT.label;
  const cleaned = raw.replace(/[\r\n"`{}<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  return cleaned || MOCK_RESULT.label;
}

/** Validate + normalise whatever the model returned. Never trust raw JSON. */
function sanitizeResult(raw: Record<string, unknown>): InspectItemResult {
  const category = CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number])
    ? (raw.category as InspectItemResult['category'])
    : 'accessory';

  const confidence =
    typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
      ? clamp01(raw.confidence)
      : 0.5;

  const p = raw.placement as { x?: unknown; y?: unknown } | undefined;
  const placement = {
    x: typeof p?.x === 'number' ? clamp01(p.x) : 0.5,
    y: typeof p?.y === 'number' ? clamp01(p.y) : 0.5,
  };

  const result: InspectItemResult = {
    label: cleanLabel(raw.label),
    category,
    confidence,
    placement,
    source: 'gemini',
  };

  if (category === 'garment') {
    result.garmentFamily = FAMILIES.includes(raw.garmentFamily as GarmentFamily)
      ? (raw.garmentFamily as GarmentFamily)
      : 'khac';
    result.wornByPerson = raw.wornByPerson === true;
  }

  const box = normalizeBox(raw.box_2d);
  if (box) result.box = box;

  return result;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[inspect-item] GEMINI_API_KEY not set — returning mock result');
      return NextResponse.json(MOCK_RESULT);
    }

    // Convert File to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type || 'image/png';

    const prompt = `
Phân tích hình ảnh vật phẩm thời trang này (nền đã được xóa, có thể còn sót một phần người mặc). Xác định:
1. "label": tên mô tả ngắn gọn, chính xác bằng tiếng Việt (ví dụ: "Áo dài cách tân hoa nhí", "Áo ngũ thân vàng thêu rồng", "Áo bà ba lụa", "Túi tote vải", "Sneaker trắng", "Nón lá truyền thống", "Hài thêu đỏ")
2. "category": "garment" (áo, váy, trang phục), "footwear" (giày dép), hoặc "accessory" (phụ kiện, nón lá, túi xách, kính, quạt, trang sức)
3. "confidence": mức độ tin cậy từ 0.0 đến 1.0
4. "placement": vị trí gợi ý trên canvas (x: 0-1, y: 0-1)
5. "box_2d": khung chữ nhật BAO SÁT vật phẩm chính, định dạng [ymin, xmin, ymax, xmax], thang 0-1000. Với trang phục: chỉ khung quanh chiếc áo/váy, KHÔNG gồm đầu, cổ, bàn tay, chân người mặc.
6. Chỉ khi category = "garment":
   - "garmentFamily": một trong "ao-dai" (áo dài), "ba-ba" (áo bà ba), "ngu-than" (áo ngũ thân), "tu-than" (áo tứ thân), "nhat-binh" (áo nhật bình), "khac" (không thuộc các loại trên hoặc không chắc chắn)
   - "wornByPerson": true nếu vẫn còn thấy người (đầu, tay, chân) đang mặc áo trong ảnh, ngược lại false

Quy tắc vị trí:
- Trang phục (áo, đầm, cổ phục, áo bà ba, áo dài): x=0.5, y=0.45
- Giày dép: x=0.5, y=0.88 (dưới cùng)
- Túi xách: x=0.75, y=0.60 (bên phải)
- Kính mắt / Nón: x=0.5, y=0.18 (trên đầu)
- Phụ kiện khác: x=0.65, y=0.50 (giữa)

Trả lời CHỈ ĐÚNG JSON với format:
{
  "label": string,
  "category": "garment" | "footwear" | "accessory",
  "confidence": number,
  "placement": { "x": number, "y": number },
  "box_2d": [number, number, number, number],
  "garmentFamily": "ao-dai" | "ba-ba" | "ngu-than" | "tu-than" | "nhat-binh" | "khac",
  "wornByPerson": boolean
}
    `.trim();

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: 'POST',
          signal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType, data: base64 } },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = sanitizeResult(JSON.parse(jsonMatch[0]));
            console.log(
              `[inspect-item] ${model}: "${result.label}" (${result.category}/${result.garmentFamily ?? '-'}) box=${result.box ? 'yes' : 'no'}`
            );
            return NextResponse.json(result);
          }
        } else {
          const errText = await res.text();
          console.warn(`[inspect-item] Model ${model} HTTP ${res.status}:`, errText.slice(0, 100));
        }
      } catch (err) {
        console.warn(`[inspect-item] Model ${model} error:`, err instanceof Error ? err.message : err);
      }
    }

    return NextResponse.json(MOCK_RESULT);
  } catch (err) {
    console.error('[inspect-item] Error:', err);
    return NextResponse.json(MOCK_RESULT);
  }
}
