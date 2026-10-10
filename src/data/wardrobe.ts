import { Garment, GarmentFamily, NormalizedBox } from '@/types';
import { GARMENTS } from '@/data/heritage';

// ─── StudioItem Contract ──────────────────────────────────────────────────────

export interface StudioItem {
  id: string;
  name: string;
  category: string; // e.g. "garment" | "sneaker" | "traditional" | "boots" | "jewelry" | "headwear" | "eyewear" | "handbag"
  thumbnailUrl?: string;
  renderAssetUrl?: string; // Transparent PNG / SVG data URL
  dominantColor?: string; // Hex extracted from fabric
  patternUrl?: string; // Cropped fabric texture URL for SVG <pattern>
  garmentFamily?: GarmentFamily;      // Gemini nhận diện khi upload (áo dài, bà ba, ...)
  box?: NormalizedBox;                // khung bao quanh áo trong renderAssetUrl (0-1)
  cutoutUrl?: string;                 // ảnh áo đã cắt theo box, giữ tỉ lệ (data URL)
  cutoutAspect?: number;              // width / height của cutoutUrl
  wornByPerson?: boolean;             // ảnh còn người mặc
  anchorSlot: 'garment' | 'head' | 'wrist' | 'hand' | 'feet' | 'eyes';
  transform?: {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

// ─── SVG Asset Helper ─────────────────────────────────────────────────────────

const toSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\s+/g, ' '))}`;

// ─── Garments Data ────────────────────────────────────────────────────────────

export const GARMENTS_DATA: Garment[] = GARMENTS;

// ─── Footwear Data (Universal Anchor: feet: x:116, y:382, w:68, h:28) ────────

export const FOOTWEAR_DATA: StudioItem[] = [
  {
    id: 'white-sneakers',
    name: 'Sneaker Trắng',
    category: 'sneaker',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Shoe -->
        <path d="M4 14 C5 8 13 8 20 10 L28 10 C30 14 30 22 26 25 L3 25 C1 23 2 17 4 14 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
        <path d="M4 22 L27 22" stroke="#8B1E1E" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="3" y1="25" x2="26" y2="25" stroke="#94A3B8" stroke-width="1.5"/>
        <path d="M12 12 L16 16" stroke="#94A3B8" stroke-width="1" stroke-linecap="round"/>
        
        <!-- Right Shoe -->
        <path d="M64 14 C63 8 55 8 48 10 L40 10 C38 14 38 22 42 25 L65 25 C67 23 66 17 64 14 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
        <path d="M64 22 L41 22" stroke="#8B1E1E" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="65" y1="25" x2="42" y2="25" stroke="#94A3B8" stroke-width="1.5"/>
        <path d="M56 12 L52 16" stroke="#94A3B8" stroke-width="1" stroke-linecap="round"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'traditional-shoes',
    name: 'Hài Truyền Thống',
    category: 'traditional',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Hài -->
        <path d="M4 15 C12 12 24 14 28 24 L2 24 C-1 20 1 16 4 15 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="1"/>
        <circle cx="5" cy="18" r="2.5" fill="#D4AF37"/>
        <path d="M2 24 L28 24" stroke="#D4AF37" stroke-width="1.2"/>
        
        <!-- Right Hài -->
        <path d="M64 15 C56 12 44 14 40 24 L66 24 C69 20 67 16 64 15 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="1"/>
        <circle cx="63" cy="18" r="2.5" fill="#D4AF37"/>
        <path d="M40 24 L66 24" stroke="#D4AF37" stroke-width="1.2"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'boots',
    name: 'Bốt Hầm Hố',
    category: 'boots',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Boot -->
        <path d="M4 8 L18 8 L19 14 L28 14 C30 18 29 25 26 26 L2 26 C0 22 1 12 4 8 Z" fill="#18181B" stroke="#27272A" stroke-width="1.2"/>
        <line x1="2" y1="23" x2="27" y2="23" stroke="#52525B" stroke-width="2.5"/>
        <rect x="7" y="11" width="7" height="2" rx="1" fill="#D4AF37"/>
        
        <!-- Right Boot -->
        <path d="M64 8 L50 8 L49 14 L40 14 C38 18 39 25 42 26 L66 26 C68 22 67 12 64 8 Z" fill="#18181B" stroke="#27272A" stroke-width="1.2"/>
        <line x1="66" y1="23" x2="41" y2="23" stroke="#52525B" stroke-width="2.5"/>
        <rect x="54" y="11" width="7" height="2" rx="1" fill="#D4AF37"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'loafers',
    name: 'Giày Lười Loafer',
    category: 'sneaker',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Loafer -->
        <path d="M4 16 C8 11 20 12 28 18 L28 25 L3 25 C1 23 2 19 4 16 Z" fill="#3E2723" stroke="#1F1511" stroke-width="1"/>
        <rect x="12" y="15" width="6" height="2" rx="1" fill="#D4AF37"/>
        <line x1="2" y1="25" x2="28" y2="25" stroke="#1F1511" stroke-width="2"/>
        
        <!-- Right Loafer -->
        <path d="M64 16 C60 11 48 12 40 18 L40 25 L65 25 C67 23 66 19 64 16 Z" fill="#3E2723" stroke="#1F1511" stroke-width="1"/>
        <rect x="50" y="15" width="6" height="2" rx="1" fill="#D4AF37"/>
        <line x1="40" y1="25" x2="66" y2="25" stroke="#1F1511" stroke-width="2"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'sandals',
    name: 'Guốc Mộc Quai Đỏ',
    category: 'traditional',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Clog -->
        <path d="M3 21 L28 21 L27 25 L2 25 Z" fill="#A8734A" stroke="#7A4B23" stroke-width="1"/>
        <path d="M7 21 C9 15 17 15 20 21" stroke="#B91C1C" stroke-width="3" fill="none" stroke-linecap="round"/>
        
        <!-- Right Clog -->
        <path d="M65 21 L40 21 L41 25 L66 25 Z" fill="#A8734A" stroke="#7A4B23" stroke-width="1"/>
        <path d="M61 21 C59 15 51 15 48 21" stroke="#B91C1C" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'platform-shoes',
    name: 'Giày Platform Đế Cao',
    category: 'boots',
    anchorSlot: 'feet',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28">
        <!-- Left Platform -->
        <path d="M3 13 C7 9 17 11 27 15 L27 26 L2 26 Z" fill="#27272A" stroke="#18181B" stroke-width="1"/>
        <line x1="2" y1="20" x2="27" y2="20" stroke="#E4E4E7" stroke-width="1"/>
        <line x1="2" y1="26" x2="27" y2="26" stroke="#09090B" stroke-width="3"/>
        
        <!-- Right Platform -->
        <path d="M65 13 C61 9 51 11 41 15 L41 26 L66 26 Z" fill="#27272A" stroke="#18181B" stroke-width="1"/>
        <line x1="41" y1="20" x2="66" y2="20" stroke="#E4E4E7" stroke-width="1"/>
        <line x1="41" y1="26" x2="66" y2="26" stroke="#09090B" stroke-width="3"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
];

// ─── Accessories Data (Anchors: eyes, head, hand, wrist) ──────────────────────

export const ACCESSORIES_DATA: StudioItem[] = [
  {
    id: 'sunglasses',
    name: 'Kính Mát Wayfarer',
    category: 'eyewear',
    anchorSlot: 'eyes',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 10">
        <!-- Left Lens -->
        <rect x="1" y="1" width="10" height="7" rx="2" fill="#18181B" stroke="#09090B" stroke-width="1"/>
        <line x1="3" y1="2.5" x2="8" y2="2.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>
        <!-- Bridge -->
        <line x1="11" y1="3" x2="15" y2="3" stroke="#D4AF37" stroke-width="1.2"/>
        <!-- Right Lens -->
        <rect x="15" y="1" width="10" height="7" rx="2" fill="#18181B" stroke="#09090B" stroke-width="1"/>
        <line x1="17" y1="2.5" x2="22" y2="2.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'flower-pin',
    name: 'Trâm Hoa Cài Tóc',
    category: 'headwear',
    anchorSlot: 'head',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
        <!-- Pin Stick -->
        <line x1="5" y1="25" x2="20" y2="10" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Lotus Petals -->
        <circle cx="21" cy="9" r="6" fill="#F43F5E"/>
        <circle cx="16" cy="7" r="4.5" fill="#FB7185"/>
        <circle cx="25" cy="7" r="4.5" fill="#FB7185"/>
        <circle cx="21" cy="4" r="4.5" fill="#FDA4AF"/>
        <circle cx="21" cy="9" r="2.5" fill="#FEF08A"/>
      </svg>
    `),
    transform: { scale: 1.1, offsetX: 8, offsetY: -4 },
  },
  {
    id: 'straw-hat',
    name: 'Nón Lá Truyền Thống',
    category: 'headwear',
    anchorSlot: 'head',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
        <!-- Conical Hat Base -->
        <path d="M15 2 L1 22 L29 22 Z" fill="#F5EBE0" stroke="#D5BDAF" stroke-width="1"/>
        <!-- Ribs -->
        <line x1="15" y1="2" x2="8" y2="22" stroke="#E3D5CA" stroke-width="0.7"/>
        <line x1="15" y1="2" x2="22" y2="22" stroke="#E3D5CA" stroke-width="0.7"/>
        <ellipse cx="15" cy="22" rx="14" ry="3" fill="#E3D5CA" stroke="#D5BDAF" stroke-width="0.8"/>
        <!-- Silk Ribbon -->
        <path d="M5 22 Q15 28 25 22" fill="none" stroke="#E11D48" stroke-width="1.2"/>
      </svg>
    `),
    transform: { scale: 1.3, offsetX: 0, offsetY: -10 },
  },
  {
    id: 'tote-bag',
    name: 'Túi Tote Canvas',
    category: 'handbag',
    anchorSlot: 'hand',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28">
        <!-- Handle -->
        <path d="M6 8 C6 1 18 1 18 8" fill="none" stroke="#A8A29E" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Bag Body -->
        <rect x="2" y="8" width="20" height="19" rx="2" fill="#F5F5F4" stroke="#D6D3D1" stroke-width="1"/>
        <!-- Graphic Print -->
        <circle cx="12" cy="16" r="4" fill="#991B1B" fill-opacity="0.85"/>
        <text x="12" y="18" font-size="4" font-family="sans-serif" font-weight="bold" fill="#FEF2F2" text-anchor="middle">SẮC</text>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'handbag',
    name: 'Túi Da Cầm Tay',
    category: 'handbag',
    anchorSlot: 'hand',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28">
        <!-- Handle -->
        <path d="M7 9 C7 3 17 3 17 9" fill="none" stroke="#78350F" stroke-width="1.5"/>
        <!-- Bag Body -->
        <rect x="2" y="9" width="20" height="17" rx="3" fill="#92400E" stroke="#78350F" stroke-width="1"/>
        <line x1="2" y1="13" x2="22" y2="13" stroke="#B45309" stroke-width="0.8"/>
        <!-- Gold Clasp -->
        <rect x="10" y="12" width="4" height="3" rx="1" fill="#FBBF24"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'beaded-bracelet',
    name: 'Vòng Tay Ngọc Bích',
    category: 'jewelry',
    anchorSlot: 'wrist',
    renderAssetUrl: toSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12">
        <!-- Jade Beads around wrist -->
        <ellipse cx="8" cy="6" rx="6.5" ry="3.5" fill="none" stroke="#065F46" stroke-width="3"/>
        <circle cx="3" cy="6" r="1.5" fill="#34D399"/>
        <circle cx="8" cy="8.5" r="1.5" fill="#34D399"/>
        <circle cx="13" cy="6" r="1.5" fill="#34D399"/>
        <circle cx="8" cy="3.5" r="1.5" fill="#FBBF24"/>
      </svg>
    `),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
];
