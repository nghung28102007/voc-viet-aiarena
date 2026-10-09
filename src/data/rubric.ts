import type { CulturalAuditResult } from '@/types';

export interface NormalizedAuditInput {
  occasionId: string;
  occasionLabel: string;
  garmentId: string;
  garmentName: string;
  garmentColor: string;
  shoeId: string;
  shoeName: string;
  accessoryId: string;
  accessoryName: string;
}

/**
 * Deterministic Rubric Scoring Engine for Sắc Việt.
 * Strictly adheres to hackathon cultural safety criteria:
 * - Base score: 70
 * - Temple + Traditional: 90 - 95 (safe)
 * - Temple + Modern casual footwear / Sunglasses: < 45 (violation)
 * - Street/Graduation + Tasteful mix: 85 - 95 (safe)
 * - Street + Clashing boots/Nhật Bình: 50 - 60 (caution)
 * - Missing shoes or garment: -25 points
 */
export function computeDeterministicAudit(input: NormalizedAuditInput): CulturalAuditResult {
  const {
    occasionId,
    garmentId,
    garmentName,
    shoeId,
    shoeName,
    accessoryId,
    accessoryName,
  } = input;

  let score = 70; // Base score
  let badgeTitle = 'Hài Hòa Đương Đại';
  let summary = '';
  let correctionNotice: string | null = null;

  const isTemple = occasionId === 'temple';
  const hasGarment = !!garmentId;
  const hasShoes = !!shoeId && shoeId !== '';

  const isTraditionalShoes =
    shoeId.includes('traditional') ||
    shoeId.includes('hai') ||
    shoeId.includes('guoc') ||
    shoeName.toLowerCase().includes('hài') ||
    shoeName.toLowerCase().includes('guốc');

  const isModernShoes = hasShoes && !isTraditionalShoes;
  const isBoots =
    shoeId.includes('boots') ||
    shoeId.includes('platform') ||
    shoeName.toLowerCase().includes('bốt') ||
    shoeName.toLowerCase().includes('đế cao');

  const isSneakers =
    shoeId.includes('sneaker') ||
    shoeName.toLowerCase().includes('sneaker');

  const isSunglasses =
    accessoryId.includes('sunglasses') ||
    accessoryId.includes('kinh') ||
    accessoryName.toLowerCase().includes('kính');

  const isToteOrBag =
    accessoryId.includes('tote') ||
    accessoryId.includes('bag') ||
    accessoryId.includes('handbag') ||
    accessoryName.toLowerCase().includes('túi');

  const isNhatBinh = garmentId === 'ao-nhat-binh';
  const isNguThanOrTuThan = garmentId === 'ao-ngu-than' || garmentId === 'ao-tu-than';

  // ── RULE 3: Missing Footwear or Missing Garment (-25 points) ──
  if (!hasShoes || !hasGarment) {
    score -= 25; // 70 - 25 = 45
    badgeTitle = 'Thiếu Phụ Kiện Cốt Lõi';
    summary = !hasShoes
      ? 'Bộ trang phục chưa chọn giày phối kèm, làm giảm tính hoàn thiện và trang nhã tổng thể.'
      : 'Chưa có trang phục cốt lõi trên người.';
    correctionNotice = 'Hãy chọn thêm một đôi giày hoặc hài phù hợp để hoàn thiện diện mạo trang nhã.';
  }
  // ── RULE 1: Occasion Di tích tâm linh / Không gian thờ tự ──
  else if (isTemple) {
    if (isTraditionalShoes && hasGarment) {
      if (isSunglasses) {
        score -= 40; // 30 points (<45)
        badgeTitle = 'Lệch Chuẩn Tâm Linh';
        summary = 'Đeo kính mát trong không gian thờ tự di tích tâm linh là điều cấm kỵ, gây cảm giác thiếu tôn nghiêm.';
        correctionNotice = 'Vui lòng tháo bỏ kính mát và giữ diện mạo trang nhã, mộc mạc khi bước vào khuôn viên thờ tự linh thiêng.';
      } else {
        score = 93; // 90 - 95
        badgeTitle = 'Trang Nghiêm Tôn Kính';
        summary = `Phối ${garmentName} cùng ${shoeName} chuẩn mực cho chốn linh thiêng, giữ trọn nét tôn kính và uy nghiêm trước tiền nhân.`;
        correctionNotice = null;
      }
    } else if (isModernShoes || isSunglasses) {
      score = isSunglasses && isModernShoes ? 28 : 34; // Drops strictly below 45
      badgeTitle = 'Lệch Ngữ Cảnh Tâm Linh';
      summary = `Mang ${shoeName}${isSunglasses ? ' và đeo kính mát' : ''} tại không gian thờ tự là hành vi vi phạm quy chuẩn văn hóa tôn nghiêm.`;
      correctionNotice = 'Bắt buộc thay thế giày hiện đại/dép quai bằng hài truyền thống hoặc guốc mộc thanh nhã khi viếng thăm đền chùa, di tích.';
    }
  }
  // ── RULE 2: Occasion Dạo phố Gen Z / Kỷ yếu / Lễ hội ──
  else {
    if (isBoots && isNhatBinh) {
      score = 52; // Clashing: 50 - 60
      badgeTitle = 'Xung Đột Tỷ Lệ Triều Phục';
      summary = 'Áo Nhật Bình có phom cung đình trang trọng; việc phối cùng bốt hầm hố tạo cảm giác lệch tông, nặng nề ở phần chân.';
      correctionNotice = 'Nên thay bốt bằng hài thêu nhẹ nhàng hoặc giày lười tối giản để tôn vinh sự thanh thoát quyền quý của Áo Nhật Bình.';
    } else if (isSneakers && isNguThanOrTuThan) {
      score = isToteOrBag ? 94 : 89; // Tasteful mix: 85 - 95
      badgeTitle = 'Phá Cách Thanh Lịch';
      summary = `Bản phối ${garmentName} cùng ${shoeName}${accessoryName ? ` và ${accessoryName}` : ''} tạo nên phong cách Gen Z năng động mà vẫn trân trọng nét đẹp di sản Việt.`;
      correctionNotice = null;
    } else if (isTraditionalShoes) {
      score = 90;
      badgeTitle = 'Cổ Điển Xuống Phố';
      summary = `Vẻ đẹp thuần Việt nguyên bản khi phối ${garmentName} với ${shoeName}, tạo dấu ấn trang nhã khác biệt nơi phố hội.`;
      correctionNotice = null;
    } else {
      score = 83;
      badgeTitle = 'Giao Thoa Đương Đại';
      summary = `Trang phục ${garmentName} phối cùng ${shoeName} mang lại sự hài hòa tươi mới giữa nét đẹp cổ truyền và nhịp sống hiện đại.`;
      correctionNotice = null;
    }
  }

  const gNameLower = (garmentName || '').toLowerCase();
  const isNhatBinhMatched = garmentId === 'ao-nhat-binh' || gNameLower.includes('nhật bình');
  const isTuThanMatched = garmentId === 'ao-tu-than' || gNameLower.includes('tứ thân');
  const isNguThanMatched = garmentId === 'ao-ngu-than' || gNameLower.includes('ngũ thân');

  // Cultural Insight per garment
  let culturalInsight = '';
  if (isNhatBinhMatched) {
    culturalInsight = 'Áo Nhật Bình là thường phục của bậc Hoàng thái hậu, Hoàng hậu, Công chúa và mệnh phụ triều Nguyễn. Điểm nhấn là cổ áo hình chữ nhật viền hoa văn phụng và dải ngũ sắc biểu trưng ngũ hành.';
  } else if (isTuThanMatched) {
    culturalInsight = 'Áo Tứ Thân biểu trưng cho bốn đức tính tốt đẹp của người phụ nữ Việt (công, dung, ngôn, hạnh). Thường đi kèm với chiếc yếm thắm và dải thắt lưng buông lơi đậm chất quan họ Kinh Bắc.';
  } else if (isNguThanMatched) {
    culturalInsight = 'Áo Ngũ Thân lập lĩnh định hình từ thời chúa Nguyễn Phúc Khoát và vua Minh Mạng, tượng trưng cho tứ thân phụ mẫu che chở đứa con (thân thứ năm) và đạo ngũ thường nhân - nghĩa - lễ - trí - tín.';
  } else {
    culturalInsight = `Trang phục "${garmentName || 'Áo dài / Cổ phục'}" mang hơi thở độc đáo của văn hóa trang phục Việt, kết hợp giữa phom dáng truyền thống và nét chấm phá nghệ thuật đương đại.`;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const status: 'safe' | 'caution' | 'violation' =
    score >= 70 ? 'safe' : score >= 45 ? 'caution' : 'violation';

  const recommendedPalette = [
    { name: 'Đỏ Chu Sa', hex: '#8B1E1E' },
    { name: 'Hoàng Kim', hex: '#D4AF37' },
    { name: 'Kem Ngà', hex: '#FAF8F5' },
    { name: 'Mực Trầm', hex: '#1F1E1D' },
    { name: 'Thanh Trúc', hex: '#2D6A4F' },
  ];

  return {
    score,
    status,
    badgeTitle,
    summary,
    culturalInsight,
    correctionNotice,
    recommendedPalette,
  };
}
