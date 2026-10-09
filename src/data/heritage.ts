import type { Garment, AccessoryItem } from '@/types';

// ─── Garments ─────────────────────────────────────────────────────────────────

export const GARMENTS: Garment[] = [
  {
    id: 'ao-ngu-than',
    name: 'Áo Ngũ Thân',
    nameEn: 'Five-Panel Robe',
    description:
      'Trang phục truyền thống của người Việt thế kỷ 17–19, thường mặc trong lễ hội và sự kiện trang trọng.',
    silhouetteId: 'ngu-than',
    palette: [
      { name: 'Mực Trầm', hex: '#2C3E50' },
      { name: 'Thiên Thanh', hex: '#5B8DB8' },
      { name: 'Đỏ Thắm', hex: '#8B1E1E' },
      { name: 'Ngọc Bích', hex: '#2D6A4F' },
      { name: 'Vàng Hoàng Gia', hex: '#D4AF37' },
    ],
  },
  {
    id: 'ao-tu-than',
    name: 'Áo Tứ Thân',
    nameEn: 'Four-Panel Dress',
    description:
      'Trang phục dân gian của phụ nữ miền Bắc, gắn liền với văn hóa Kinh Bắc và quan họ Bắc Ninh.',
    silhouetteId: 'tu-than',
    palette: [
      { name: 'Nâu Gỗ', hex: '#6B4226' },
      { name: 'Xanh Rêu', hex: '#4A5240' },
      { name: 'Hoa Đào', hex: '#C77B8A' },
      { name: 'Vàng Chanh', hex: '#C8B560' },
      { name: 'Trắng Ngà', hex: '#F5F0E8' },
    ],
  },
  {
    id: 'ao-nhat-binh',
    name: 'Áo Nhật Bình',
    nameEn: 'Court Robe',
    description:
      'Lễ phục cung đình triều Nguyễn, có cổ vuông đặc trưng, dành cho phi tần và quý tộc.',
    silhouetteId: 'nhat-binh',
    palette: [
      { name: 'Chu Sa', hex: '#C0392B' },
      { name: 'Tím Huế', hex: '#7D3C98' },
      { name: 'Xanh Hoàng Triều', hex: '#1A5276' },
      { name: 'Vàng Cung Đình', hex: '#F0C040' },
      { name: 'Hồng Phấn', hex: '#E8A0B4' },
    ],
  },
];

// ─── Accessories ──────────────────────────────────────────────────────────────

export const ACCESSORIES: AccessoryItem[] = [
  {
    id: 'tote-bag',
    name: 'Tote Bag',
    category: 'accessory',
    emoji: '👜',
    defaultPosition: { x: 0.75, y: 0.6 },
  },
  {
    id: 'sunglasses',
    name: 'Kính Mát',
    category: 'accessory',
    emoji: '🕶️',
    defaultPosition: { x: 0.5, y: 0.18 },
  },
  {
    id: 'straw-hat',
    name: 'Nón Lá',
    category: 'accessory',
    emoji: '🎩',
    defaultPosition: { x: 0.5, y: 0.05 },
  },
  {
    id: 'handbag',
    name: 'Túi Xách',
    category: 'accessory',
    emoji: '👛',
    defaultPosition: { x: 0.72, y: 0.55 },
  },
  {
    id: 'flower-pin',
    name: 'Cài Hoa',
    category: 'accessory',
    emoji: '🌸',
    defaultPosition: { x: 0.35, y: 0.3 },
  },
  {
    id: 'beaded-bracelet',
    name: 'Vòng Tay',
    category: 'accessory',
    emoji: '📿',
    defaultPosition: { x: 0.25, y: 0.55 },
  },
];

export const FOOTWEAR: AccessoryItem[] = [
  {
    id: 'white-sneakers',
    name: 'Sneaker Trắng',
    category: 'footwear',
    emoji: '👟',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
  {
    id: 'loafers',
    name: 'Giày Lười',
    category: 'footwear',
    emoji: '🥿',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
  {
    id: 'sandals',
    name: 'Dép Quai',
    category: 'footwear',
    emoji: '👡',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
  {
    id: 'platform-shoes',
    name: 'Giày Đế Cao',
    category: 'footwear',
    emoji: '👠',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
  {
    id: 'boots',
    name: 'Bốt',
    category: 'footwear',
    emoji: '🥾',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
  {
    id: 'traditional-shoes',
    name: 'Hài Truyền Thống',
    category: 'footwear',
    emoji: '🩴',
    defaultPosition: { x: 0.5, y: 0.9 },
  },
];
