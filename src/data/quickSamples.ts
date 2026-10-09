import { StudioItem } from './wardrobe';

const toSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\s+/g, ' '))}`;

// ─── 1. Áo Dài Hoa Nhí Cách Tân (Terracotta Coral with Cherry Blossom Motifs) ───
const aoDaiHoaNhiSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 270" width="150" height="270">
  <defs>
    <linearGradient id="coralSilk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#EB8A70"/>
      <stop offset="50%" stopColor="#DF7357"/>
      <stop offset="100%" stopColor="#C85A3E"/>
    </linearGradient>
    <g id="flower1">
      <circle cx="0" cy="-4" r="2.8" fill="#FFF5F2"/>
      <circle cx="4" cy="-1.5" r="2.8" fill="#FFF5F2"/>
      <circle cx="2.5" cy="3.5" r="2.8" fill="#FFF5F2"/>
      <circle cx="-2.5" cy="3.5" r="2.8" fill="#FFF5F2"/>
      <circle cx="-4" cy="-1.5" r="2.8" fill="#FFF5F2"/>
      <circle cx="0" cy="0" r="1.8" fill="#D94834"/>
      <circle cx="5" cy="4" r="1.5" fill="#88AB75"/>
    </g>
    <g id="flower2">
      <circle cx="0" cy="-3" r="2.2" fill="#FFEAE3"/>
      <circle cx="3" cy="-1" r="2.2" fill="#FFEAE3"/>
      <circle cx="2" cy="3" r="2.2" fill="#FFEAE3"/>
      <circle cx="-2" cy="3" r="2.2" fill="#FFEAE3"/>
      <circle cx="-3" cy="-1" r="2.2" fill="#FFEAE3"/>
      <circle cx="0" cy="0" r="1.4" fill="#C93B26"/>
    </g>
  </defs>

  <!-- Fabric Silk Background -->
  <rect width="150" height="270" fill="url(#coralSilk)"/>

  <!-- Subtle Silk Sheen Lines -->
  <line x1="0" y1="40" x2="150" y2="40" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <line x1="0" y1="110" x2="150" y2="110" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <line x1="0" y1="180" x2="150" y2="180" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>

  <!-- Floral Branches and Blossoms -->
  <use href="#flower1" x="35" y="45"/>
  <use href="#flower2" x="80" y="30"/>
  <use href="#flower1" x="120" y="60"/>
  <use href="#flower2" x="25" y="100"/>
  <use href="#flower1" x="65" y="90"/>
  <use href="#flower2" x="110" y="115"/>
  <use href="#flower1" x="40" y="150"/>
  <use href="#flower2" x="85" y="140"/>
  <use href="#flower1" x="125" y="170"/>
  <use href="#flower2" x="20" y="200"/>
  <use href="#flower1" x="60" y="215"/>
  <use href="#flower2" x="105" y="195"/>
  <use href="#flower1" x="75" y="250"/>
  <use href="#flower2" x="130" y="240"/>
  <use href="#flower1" x="30" y="260"/>

  <!-- Diagonal Front Lapel Line for Ao Dai -->
  <path d="M 65 0 C 85 30 90 70 90 120" stroke="#FFEAE3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>
`;

// ─── 2. Áo Bà Ba Lụa Nam Bộ (Deep Indigo Silk with Mother-of-Pearl Buttons & Pockets) ───
const aoBaBaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 270" width="150" height="270">
  <defs>
    <linearGradient id="indigoSilk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#3F6B88"/>
      <stop offset="40%" stopColor="#2E526B"/>
      <stop offset="100%" stopColor="#1E394C"/>
    </linearGradient>
  </defs>

  <!-- Fabric Background -->
  <rect width="150" height="270" fill="url(#indigoSilk)"/>

  <!-- Central Placket -->
  <rect x="71" y="0" width="8" height="270" fill="#244257" opacity="0.6"/>
  <line x1="75" y1="0" x2="75" y2="270" stroke="#5283A4" stroke-width="1.5"/>

  <!-- Mother of Pearl Buttons -->
  <circle cx="75" cy="35" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>
  <circle cx="75" cy="70" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>
  <circle cx="75" cy="105" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>
  <circle cx="75" cy="140" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>
  <circle cx="75" cy="175" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>
  <circle cx="75" cy="210" r="3.5" fill="#F4EAE0" stroke="#A89F91" stroke-width="0.8"/>

  <!-- Two Front Pockets (Túi áo bà ba truyền thống) -->
  <rect x="25" y="160" width="34" height="42" rx="4" fill="#244257" stroke="#5283A4" stroke-width="1.5"/>
  <line x1="25" y1="170" x2="59" y2="170" stroke="#5283A4" stroke-width="1.2"/>

  <rect x="91" y="160" width="34" height="42" rx="4" fill="#244257" stroke="#5283A4" stroke-width="1.5"/>
  <line x1="91" y1="170" x2="125" y2="170" stroke="#5283A4" stroke-width="1.2"/>

  <!-- Curved Collar Accent -->
  <path d="M 45 0 C 65 30 85 30 105 0" stroke="#F4EAE0" stroke-width="2" fill="none"/>
</svg>
`;

// ─── 3. Áo Tấc Sa Đéc Hoàng Kim (Imperial Gold with Royal Dragon & Cloud Brocade) ───
const aoTacHoangKimSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 270" width="150" height="270">
  <defs>
    <linearGradient id="goldBrocade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ECC44A"/>
      <stop offset="50%" stopColor="#D4AF37"/>
      <stop offset="100%" stopColor="#AA8518"/>
    </linearGradient>
    <pattern id="cloudPattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 5 20 Q 15 10 25 20" stroke="#FFEBA8" stroke-width="1.2" fill="none" opacity="0.6"/>
      <circle cx="15" cy="14" r="2.5" fill="#FFEBA8" opacity="0.5"/>
    </pattern>
  </defs>

  <!-- Gold Brocade Base -->
  <rect width="150" height="270" fill="url(#goldBrocade)"/>
  <rect width="150" height="270" fill="url(#cloudPattern)"/>

  <!-- Royal Red & Gold Embroidered Center Lapel -->
  <rect x="68" y="0" width="14" height="270" fill="#8B1E1E"/>
  <line x1="75" y1="0" x2="75" y2="270" stroke="#FFEBA8" stroke-width="1.5" stroke-dasharray="4 2"/>

  <!-- Gold Frog Buttons (Khuy ngọc hoàng gia) -->
  <circle cx="75" cy="30" r="4" fill="#FFEBA8" stroke="#8B1E1E" stroke-width="1"/>
  <circle cx="75" cy="65" r="4" fill="#FFEBA8" stroke="#8B1E1E" stroke-width="1"/>
  <circle cx="75" cy="100" r="4" fill="#FFEBA8" stroke="#8B1E1E" stroke-width="1"/>
  <circle cx="75" cy="135" r="4" fill="#FFEBA8" stroke="#8B1E1E" stroke-width="1"/>
  <circle cx="75" cy="170" r="4" fill="#FFEBA8" stroke="#8B1E1E" stroke-width="1"/>

  <!-- Hemline Thủy Ba (Wave & Sun Border) -->
  <path d="M 0 250 Q 25 235 50 250 T 100 250 T 150 250 L 150 270 L 0 270 Z" fill="#8B1E1E"/>
  <line x1="0" y1="248" x2="150" y2="248" stroke="#FFEBA8" stroke-width="2"/>
</svg>
`;

export const QUICK_SAMPLES: StudioItem[] = [
  {
    id: 'sample-ao-dai-hoa-nhi',
    name: 'Áo Dài Hoa Nhí Cách Tân',
    category: 'garment',
    anchorSlot: 'garment',
    dominantColor: '#DF7357',
    thumbnailUrl: toSvgDataUri(aoDaiHoaNhiSvg),
    renderAssetUrl: toSvgDataUri(aoDaiHoaNhiSvg),
    patternUrl: toSvgDataUri(aoDaiHoaNhiSvg),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'sample-ao-ba-ba',
    name: 'Áo Bà Ba Lụa Nam Bộ',
    category: 'garment',
    anchorSlot: 'garment',
    dominantColor: '#2E526B',
    thumbnailUrl: toSvgDataUri(aoBaBaSvg),
    renderAssetUrl: toSvgDataUri(aoBaBaSvg),
    patternUrl: toSvgDataUri(aoBaBaSvg),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'sample-ao-tac-hoang-kim',
    name: 'Áo Tấc Sa Đéc Hoàng Kim',
    category: 'garment',
    anchorSlot: 'garment',
    dominantColor: '#D4AF37',
    thumbnailUrl: toSvgDataUri(aoTacHoangKimSvg),
    renderAssetUrl: toSvgDataUri(aoTacHoangKimSvg),
    patternUrl: toSvgDataUri(aoTacHoangKimSvg),
    transform: { scale: 1, offsetX: 0, offsetY: 0 },
  },
];
