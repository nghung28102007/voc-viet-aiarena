import { NextRequest, NextResponse } from 'next/server';
import { getOccasion } from '@/data/occasions';
import { GARMENTS } from '@/data/heritage';
import { computeDeterministicAudit, NormalizedAuditInput } from '@/data/rubric';
import type { CulturalAuditResult } from '@/types';

// Supported Gemini models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

export async function POST(req: NextRequest) {
  let baseline: CulturalAuditResult | null = null;
  try {
    const body = await req.json();

    // Normalize parameters (supporting both explicit object and legacy flat shapes)
    const occasionData = body.occasion ?? getOccasion(body.occasionId ?? 'street');
    const occasionId = occasionData.id ?? body.occasionId ?? 'street';
    const occasionLabel = occasionData.label ?? 'Dạo Phố';

    const garmentData = body.garment ?? GARMENTS.find((g) => g.id === body.garmentId) ?? GARMENTS[0];
    const garmentId = garmentData.id ?? body.garmentId ?? 'ao-ngu-than';
    const garmentName = garmentData.name ?? body.garmentName ?? 'Áo Ngũ Thân';
    const garmentColor = garmentData.color ?? body.garmentColor ?? '#2C3E50';
    const garmentFamily: string | undefined = garmentData.family ?? body.garmentFamily ?? undefined;

    const shoesData = body.shoes ?? (Array.isArray(body.footwear) && body.footwear[0] ? { id: body.footwear[0], name: body.footwear[0] } : null);
    const shoeId = shoesData?.id ?? '';
    const shoeName = shoesData?.name ?? '';

    const accessoryData = body.accessory ?? (Array.isArray(body.accessories) && body.accessories[0] ? { id: body.accessories[0], name: body.accessories[0] } : null);
    const accessoryId = accessoryData?.id ?? '';
    const accessoryName = accessoryData?.name ?? '';

    const normalizedInput: NormalizedAuditInput = {
      occasionId,
      occasionLabel,
      garmentId,
      garmentName,
      garmentColor,
      garmentFamily,
      shoeId,
      shoeName,
      accessoryId,
      accessoryName,
    };

    // Compute deterministic baseline (strictly follows the 3 rubric rules)
    baseline = computeDeterministicAudit(normalizedInput);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[audit] GEMINI_API_KEY not set — using deterministic rubric engine');
      return NextResponse.json(baseline);
    }

    const isCustom = !!body.garment?.isCustom || garmentId.startsWith('garment') || garmentId.startsWith('ugc');
    const garmentSensitivity = isCustom
      ? 'TRUNG BÌNH (Trang phục cách tân / truyền thống do người dùng tự tải lên)'
      : garmentId === 'ao-nhat-binh'
      ? 'RẤT CAO (Lễ phục cung đình triều Nguyễn, đòi hỏi tính tôn nghiêm tuyệt đối)'
      : 'TRUNG BÌNH (Trang phục truyền thống chuẩn mực)';

    const prompt = `
Bạn là chuyên gia thẩm định văn hóa trang phục Việt Nam cấp cao thuộc dự án "Vóc Việt (Co-Mix Studio)".
Nhiệm vụ: Chấm điểm và thẩm định văn hóa cho bản phối trang phục dưới đây theo THANG ĐIỂM NGHIÊM NGẶT (STRICT RUBRIC).

BẢN PHỐI CẦN THẨM ĐỊNH:
- Bối cảnh sự kiện: ${occasionLabel} (ID: ${occasionId})
- Trang phục cốt lõi: ${garmentName} (Màu: ${garmentColor}) ${isCustom ? `[LƯU Ý QUAN TRỌNG: Đây là trang phục người dùng tải lên mang tên "${garmentName}". Hãy nhìn ảnh thực tế và nhận định đúng theo kiểu dáng và tên này. TUYỆT ĐỐI KHÔNG tự động coi đây là Áo Ngũ Thân nếu trang phục không phải là Áo Ngũ Thân.]` : '[Cổ phục mẫu di sản]'}
- Độ nhạy cảm di sản: ${garmentSensitivity}
- Dòng trang phục (nhận diện khi tải lên): ${garmentFamily ?? 'chưa rõ'}
- Giày dép: ${shoeName || 'Chưa chọn giày'} (ID: ${shoeId})
- Phụ kiện: ${accessoryName || 'Không có phụ kiện'} (ID: ${accessoryId})

QUY TẮC CHẤM ĐIỂM BẮT BUỘC (BASE SCORE: 70 ĐIỂM):
1. BỐI CẢNH "Di tích tâm linh / Không gian thờ tự" (temple):
   - Nếu mang Hài truyền thống / Guốc mộc + Trang phục đầy đủ: CỘNG 20-25 điểm -> Điểm từ 90 đến 95 (status: "safe").
   - Nếu mang Giày thể thao (Sneakers) / Dép quai / Bốt HOẶC đeo Kính mát: TRỪ 35-45 điểm -> Điểm BẮT BUỘC DƯỚI 45 (status: "violation"). Badge ví dụ: "Lệch Ngữ Cảnh Tâm Linh".
2. BỐI CẢNH "Dạo phố Gen Z / Kỷ yếu / Lễ hội" (street, graduation, festival):
   - Phối đồ hài hòa (Sneaker trắng + Áo Dài / Tứ Thân / Ngũ Thân / Bà Ba + Túi tote): CỘNG 15-25 điểm -> Điểm từ 85 đến 95 (status: "safe"). Badge ví dụ: "Phá Cách Thanh Lịch".
   - Phối đồ xung đột (Bốt hầm hố + Áo Nhật Bình dạ hội triều đình): TRỪ 20 điểm -> Điểm từ 50 đến 60 (status: "caution"). Badge ví dụ: "Xung Đột Tỷ Lệ Triều Phục".
3. THIẾU GIÀY HOẶC THIẾU TRANG PHỤC:
   - TRỪ 25 điểm -> Điểm từ 45 đến 50 (status: "caution").

QUY ĐỊNH ĐẦU RA (CHỈ TRẢ VỀ JSON HỢP LỆ THEO CẤU TRÚC):
{
  "score": <số nguyên từ 0 đến 100 theo đúng quy tắc trên>,
  "status": <"safe" nếu score >= 70, "caution" nếu score 45-69, "violation" nếu score < 45>,
  "badgeTitle": <Tiêu đề ngắn gọn, sắc sảo 3-5 từ, ví dụ "Phá Cách Thanh Lịch", "Giao Thoa Đương Đại", "Lệch Ngữ Cảnh Tâm Linh">,
  "summary": <1-2 câu nhận xét cô đọng, đánh giá sâu và chân thực về sự kết hợp giữa ${garmentName} và ${shoeName || 'giày dép'}${accessoryName ? ' cùng ' + accessoryName : ''}>,
  "culturalInsight": <Phân tích sâu về nguồn gốc, bối cảnh lịch sử, ý nghĩa văn hóa và hoa văn của ${garmentName} (tuyệt đối không nhầm sang Áo Ngũ Thân nếu trang phục không phải là Áo Ngũ Thân)>,
  "correctionNotice": <Hướng dẫn sửa đổi cụ thể nếu score < 60; nếu score >= 60 thì để null>,
  "recommendedPalette": [
    { "name": "Tên màu", "hex": "#MãHex" }
  ]
}
`.trim();

    // Multimodal Vision: Attach the actual garment image if provided so Gemini analyzes real fabric & motifs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [];

    if (body.garmentImage && typeof body.garmentImage === 'string' && body.garmentImage.startsWith('data:')) {
      const mimeMatch = body.garmentImage.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      // Gemini inlineData only supports raster images (PNG, JPEG, WebP, HEIC).
      // SVG (image/svg+xml) will cause HTTP 400 from Gemini API!
      if (!mimeType.includes('svg') && !mimeType.includes('xml')) {
        const base64Data = body.garmentImage.replace(/^data:[^;]+;base64,/, '');
        contentParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }

    contentParts.push({ text: prompt });

    let rawJsonText = '';
    let successModel = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: contentParts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            rawJsonText = candidateText;
            successModel = model;
            break;
          }
        } else {
          const errData = await geminiRes.text();
          console.warn(`[audit] Model ${model} returned HTTP ${geminiRes.status}:`, errData.slice(0, 100));
        }
      } catch (err: any) {
        console.warn(`[audit] Model ${model} request error:`, err?.message);
      }
    }

    if (rawJsonText) {
      const cleaned = rawJsonText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const aiResult: CulturalAuditResult = JSON.parse(cleaned);

      // Guardrail verification: ensure AI respects hard boundaries
      if (occasionId === 'temple') {
        const isTraditionalFootwear =
          shoeId.includes('traditional') ||
          shoeId.includes('hai') ||
          shoeId.includes('guoc') ||
          shoeId === 'sandals' ||
          shoeName.toLowerCase().includes('hài') ||
          shoeName.toLowerCase().includes('guốc');
        const isModernFootwear = shoeId && !isTraditionalFootwear;
        const isSun = accessoryId.includes('sunglasses') || accessoryName.toLowerCase().includes('kính');
        if (isModernFootwear || isSun) {
          aiResult.score = Math.min(aiResult.score, 42); // Must drop below 45
          aiResult.status = 'violation';
          if (!aiResult.correctionNotice) {
            aiResult.correctionNotice = baseline?.correctionNotice ?? null;
          }
        }
      }

      console.log(`[audit] Live Gemini audit succeeded via ${successModel} for ${garmentName}`);
      return NextResponse.json(aiResult);
    }

    // If Gemini failed on all models, return normalized baseline with custom garment insight
    console.warn('[audit] All Gemini models unavailable, using baseline');
    if (baseline) return NextResponse.json(baseline);
  } catch (err) {
    console.error('[audit] Handler error:', err);
    if (baseline) return NextResponse.json(baseline);
  }

  // Ultimate fallback if request body parsing failed before baseline calculation
  return NextResponse.json(
    computeDeterministicAudit({
      occasionId: 'street',
      occasionLabel: 'Dạo Phố',
      garmentId: 'ao-ngu-than',
      garmentName: 'Áo Ngũ Thân',
      garmentColor: '#2C3E50',
      shoeId: '',
      shoeName: '',
      accessoryId: '',
      accessoryName: '',
    })
  );
}
