import type { Occasion } from '@/types';

export const OCCASIONS: Occasion[] = [
  {
    id: 'street',
    label: 'Dạo Phố',
    emoji: '🛍️',
    contextPrompt:
      'This is a casual streetwear context. Modern accessories, sneakers, and bold color mixing are encouraged and culturally acceptable for Gen Z expression. Be supportive and creative.',
    strictnessLevel: 1,
  },
  {
    id: 'graduation',
    label: 'Kỷ Yếu',
    emoji: '🎓',
    contextPrompt:
      'This is a graduation photo context. The outfit should balance youthful expression with respectful presentation. Some modern elements are fine but the garment\'s heritage should remain the focal point.',
    strictnessLevel: 2,
  },
  {
    id: 'festival',
    label: 'Lễ Hội',
    emoji: '🏮',
    contextPrompt:
      'This is a traditional Vietnamese festival context (Tết, Hội). Outfits should celebrate cultural heritage while festive accessories are welcome. Avoid overly casual or disrespectful Western items that clash with sacred festival energy.',
    strictnessLevel: 3,
  },
  {
    id: 'temple',
    label: 'Di Tích Tâm Linh',
    emoji: '🛕',
    contextPrompt:
      'This is a sacred spiritual site visit (temple, pagoda, imperial citadel). The outfit MUST be modest, respectful, and culturally appropriate. Áo Nhật Bình in sacred spaces requires extreme reverence. Sneakers, short skirts, crop tops, or overly casual items are a violation of sacred space etiquette. Score strictly.',
    strictnessLevel: 5,
  },
];

export const getOccasion = (id: string): Occasion =>
  OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0];
