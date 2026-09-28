import type { AccessoryCategory } from './index';

// ─── Canvas Transform ─────────────────────────────────────────────────────────

export interface ItemTransform {
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
}

export const DEFAULT_TRANSFORM: ItemTransform = {
  x: 0,
  y: 0,
  scale: 1,
  flipX: false,
};

// ─── Canvas Item ──────────────────────────────────────────────────────────────

export interface CanvasItem {
  id: string;
  /** Display label (from preset name or AI classification) */
  label: string;
  category: AccessoryCategory;
  /** Emoji or URL to image src */
  src: string;
  /** Whether it's a user-uploaded image (has transparent BG) */
  isUserUploaded: boolean;
  transform: ItemTransform;
}

export type CanvasItemUpdate = Partial<Omit<CanvasItem, 'id'>>;
