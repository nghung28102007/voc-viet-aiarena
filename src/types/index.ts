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

export type AccessoryCategory = 'accessory' | 'footwear' | 'garment';

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
  summary: string;
  culturalInsight: string;
  correctionNotice?: string | null;
  harmonyAnalysis?: HarmonyAnalysis;
  recommendedPalette: PaletteChip[];
}

// ─── Inspect Item ─────────────────────────────────────────────────────────────

/** Garment family recognised by Gemini Vision for user-uploaded clothes. */
export type GarmentFamily =
  | 'ao-dai'
  | 'ba-ba'
  | 'ngu-than'
  | 'tu-than'
  | 'nhat-binh'
  | 'khac';

/** Normalised bounding box (all values 0–1, relative to the inspected image). */
export interface NormalizedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface InspectItemResult {
  label: string;
  category: AccessoryCategory;
  confidence: number;
  placement: { x: number; y: number };
  /** Only meaningful when category === 'garment' */
  garmentFamily?: GarmentFamily;
  /** True when a person is still visible wearing the item */
  wornByPerson?: boolean;
  /** Tight box around the main item, so the client can crop without guessing */
  box?: NormalizedBox;
  /** 'gemini' = real model answer, 'fallback' = mock / client-side guess */
  source?: 'gemini' | 'fallback';
}
