# Sắc Việt — Co-Mix Studio & Cultural Safety Engine
## Developer & Product Handoff Document (Hackathon Edition)

---

## 🎯 Executive Overview
"Sắc Việt (Co-Mix Studio)" is an AI-powered styling and cultural guardrail platform for Gen Z wearing modern-mixed Vietnamese traditional garments (*Việt phục*).
- **Core Value:** Zero-friction interactive styling + Realtime cultural safety evaluation (no clunky 3D try-on, instant deterministic + generative feedback).
- **Event:** AI Arena (VNU × Google) Hackathon.

---

## 🏛️ System Architecture

```
sac-viet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit/route.ts          ← Gemini 2.0 Flash (temperature: 0.1) Rubric Audit API
│   │   │   └── inspect-item/route.ts   ← Gemini Vision classifier for user-uploaded items
│   │   ├── page.tsx                    ← Split-screen studio (Left: Controls, Right: Canvas + Compass)
│   │   ├── layout.tsx                  ← Typography (Be Vietnam Pro, Playfair) & metadata
│   │   └── globals.css                 ← Indochine cream/ink palette tokens & scrollbar
│   ├── components/
│   │   ├── StudioCanvas.tsx            ← Dynamic Rigging Engine with standardized Anchor Slots (ViewBox 300x450)
│   │   ├── WardrobeStudio.tsx          ← Left dock: Occasion + Category Filter Pills + Items Grid + UGC
│   │   ├── CulturalFeedback.tsx        ← Cultural Compass Card: 0-100 score arc, badge, summary, palette
│   │   └── UploadCustomItem.tsx        ← Client-side @imgly background removal + UGC pipeline
│   ├── data/
│   │   ├── wardrobe.ts                 ← Scalable Data Layer: StudioItem contract, FOOTWEAR_DATA, ACCESSORIES_DATA
│   │   ├── heritage.ts                 ← Historical garment descriptions & color palettes
│   │   ├── occasions.ts                ← 4 event spaces with heritage context & strictness levels
│   │   └── rubric.ts                   ← Deterministic cultural scoring engine (strict rules)
│   └── types/
│       ├── index.ts                    ← Domain types (Garment, Occasion, CulturalAuditResult)
│       └── canvas-item.ts              ← CanvasItem & UGC types
├── next.config.ts                      ← Turbopack & SharedArrayBuffer COOP/COEP headers
└── .env.local                          ← Gemini API Key configuration
```

---

## ⚓ Dynamic Rigging Engine & Standardized Anchor Slots
The rendering engine in `components/StudioCanvas.tsx` operates as a headless rigging system, completely decoupled from hardcoded `if/else` item conditions:

```ts
const ANCHORS = {
  head:  { x: 135, y: 18,  width: 30, height: 30 },
  eyes:  { x: 137, y: 47,  width: 26, height: 10 },
  wrist: { x: 92,  y: 220, width: 16, height: 12 },
  hand:  { x: 194, y: 222, width: 24, height: 28 },
  feet:  { x: 116, y: 382, width: 68, height: 28 },
};
```

Every wearable item implements the `StudioItem` contract:
```ts
export interface StudioItem {
  id: string;
  name: string;
  category: string; // e.g. "sneaker" | "traditional" | "boots" | "jewelry" | "headwear" | "eyewear" | "handbag"
  thumbnailUrl?: string;
  renderAssetUrl?: string; // Transparent PNG / SVG data URL
  anchorSlot: 'head' | 'wrist' | 'hand' | 'feet' | 'eyes';
  transform?: {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
  };
}
```

---

## ⚖️ Strict Scoring Rubric (Deterministic Engine)

The cultural safety engine evaluates combinations based on rigorous heritage guidelines:
- **Base Score:** 70 points.

### 1. Di Tích Tâm Linh / Không Gian Thờ Tự (`temple`):
- **Traditional Footwear (Hài/Guốc) + Full Garment:** +20 to +25 points (Total: 90 – 95, Status: `safe`, Badge: *"Trang Nghiêm Tôn Kính"*).
- **Modern Casual Footwear (Sneakers/Dép quai/Boots) OR Sunglasses:** Deduct 35 – 45 points (Total drops strictly below 45, Status: `violation`, Badge: *"Lệch Ngữ Cảnh Tâm Linh"*).
- **Missing Footwear:** Deduct 25 points.

### 2. Dạo Phố Gen Z / Kỷ Yếu / Lễ Hội (`street`, `graduation`, `festival`):
- **Tasteful Mix (Sneaker trắng + Áo Ngũ Thân/Tứ Thân + Túi tote):** +15 to +25 points (Total: 85 – 95, Status: `safe`, Badge: *"Phá Cách Thanh Lịch"*).
- **Clashing Items (Boots hầm hố + Áo Nhật Bình dạ hội triều đình):** Deduct 20 points (Total: 50 – 60, Status: `caution`, Badge: *"Xung Đột Tỷ Lệ Triều Phục"*).
- **Missing Footwear:** Deduct 25 points.

### 3. Gemini 2.0 Flash Integration:
- Configured with `temperature: 0.1` and strict `responseSchema`.
- Guarantees dynamic, contextual responses (no more static 74%).
- Offline & error resilient: `computeDeterministicAudit` runs instantly on client & server fallback.

---

## 🚦 Verification Test Matrix

| # | Occasion | Garment | Footwear | Accessory | Expected Score | Status |
|---|---|---|---|---|---|---|
| 1 | 🛕 Di Tích Tâm Linh | Áo Ngũ Thân | Hài Truyền Thống | Cài Hoa | **93** | `safe` |
| 2 | 🛕 Di Tích Tâm Linh | Áo Ngũ Thân | Sneaker Trắng | Kính Mát | **28 - 34** | `violation` |
| 3 | 🛍️ Dạo Phố | Áo Ngũ Thân | Sneaker Trắng | Tote Bag | **94** | `safe` |
| 4 | 🛍️ Dạo Phố | Áo Nhật Bình | Bốt | Túi Xách | **52** | `caution` |
| 5 | 🎓 Kỷ Yếu | Áo Tứ Thân | Chưa chọn giày | Không có | **45** | `caution` |

---

*Sắc Việt (Co-Mix Studio) · AI Arena VNU × Google 2026*
