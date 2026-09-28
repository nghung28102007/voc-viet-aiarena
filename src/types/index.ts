// ─── Core Domain Types ────────────────────────────────────────────────────────

export type GarmentCategory = 'ao-ngu-than' | 'ao-tu-than' | 'ao-nhat-binh';

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface Garment {
  id: GarmentCategory;
  name: string;
  nameEn: string;
  description: string;
  palette: ColorSwatch[];
  /** SVG path string for the silhouette fill area */
  silhouetteId: string;
}

export type AccessoryCategory = 'accessory' | 'footwear';

export interface AccessoryItem {
  id: string;
  name: string;
  category: AccessoryCategory;
  emoji: string;
  /** Suggested initial canvas position ratio (0-1) */
  defaultPosition: { x: number; y: number };
}

// ─── Occasions ────────────────────────────────────────────────────────────────

export type OccasionId = 'street' | 'graduation' | 'temple' | 'festival';

export interface Occasion {
  id: OccasionId;
  label: string;
  emoji: string;
  /** Injected into audit prompt to shape strictness */
  contextPrompt: string;
  /** How strict the audit should be: 1 = lenient, 5 = very strict */
  strictnessLevel: number;
}

// ─── Cultural Audit ───────────────────────────────────────────────────────────

export type AuditStatus = 'safe' | 'caution' | 'violation';

export interface HarmonyAnalysis {
  colorMatch: string;
  styleBalance: string;
}

export interface PaletteChip {
  name: string;
  hex: string;
}

export interface CulturalAuditResult {
  score: number;
  status: AuditStatus;
  badgeTitle: string;
  culturalInsight: string;
  correctionNotice: string | null;
  harmonyAnalysis: HarmonyAnalysis;
  recommendedPalette: PaletteChip[];
}

// ─── Inspect Item ─────────────────────────────────────────────────────────────

export interface InspectItemResult {
  label: string;
  category: AccessoryCategory;
  confidence: number;
  placement: { x: number; y: number };
}
