import { NextRequest, NextResponse } from 'next/server';
import type { InspectItemResult } from '@/types';

// Supported Gemini models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_RESULT: InspectItemResult = {
  label: 'Phụ Kiện Thời Trang',
  category: 'accessory',
  confidence: 0.85,
  placement: { x: 0.6, y: 0.5 },
};

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
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
Phân tích hình ảnh vật phẩm thời trang này. Xác định:
1. Tên mô tả ngắn gọn và chính xác bằng tiếng Việt (ví dụ: "Áo dài cách tân hoa nhí", "Áo ngũ thân vàng thêu rồng", "Áo bà ba lụa", "Túi tote vải", "Sneaker trắng", "Nón lá truyền thống")
2. Danh mục: "garment" (áo, váy, trang phục), "footwear" (giày dép), hoặc "accessory" (phụ kiện, nón lá, túi xách, kính, quạt, trang sức)
3. Mức độ tin cậy từ 0.0 đến 1.0
4. Vị trí gợi ý trên canvas (x: 0-1, y: 0-1) phù hợp với loại vật phẩm

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
  "placement": { "x": number, "y": number }
}
    `.trim();

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64,
                    },
                  },
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
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result: InspectItemResult = JSON.parse(jsonMatch[0]);
            console.log(`[inspect-item] Identified item via ${model}: "${result.label}" (${result.category})`);
            return NextResponse.json(result);
          }
        } else {
          const errText = await res.text();
          console.warn(`[inspect-item] Model ${model} HTTP ${res.status}:`, errText.slice(0, 100));
        }
      } catch (err: any) {
        console.warn(`[inspect-item] Model ${model} error:`, err?.message);
      }
    }

    return NextResponse.json(MOCK_RESULT);
  } catch (err) {
    console.error('[inspect-item] Error:', err);
    return NextResponse.json(MOCK_RESULT);
  }
}
