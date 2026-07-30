/**
 * Static, real-world dimensions for a single TCG's card size.
 *
 * Adding support for a new TCG is a data-only change: add an entry to
 * `CARD_SIZE_REGISTRY` in cardRegistry.ts, not new code.
 */
export interface CardSizeDefinition {
  /** Stable identifier used elsewhere (e.g. GridConfig.cardSizeId). */
  id: string;
  /** Human-readable name shown in the UI. */
  label: string;
  widthMm: number;
  heightMm: number;
}
