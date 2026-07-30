/**
 * Grid configuration model: describes the shape of a display (uniform
 * rows/cols or custom per-row card counts) plus spacing/border/card-size
 * settings. All physical measurements are stored in mm — see
 * lib/units/units.ts and CLAUDE.md's "real-world units are the source of
 * truth" principle. `displayUnit` only affects what unit the UI shows.
 */

import type { LengthUnit } from '../units/units';
import { DEFAULT_CARD_SIZE_ID } from '../cardRegistry/cardRegistry';

export interface UniformGridConfig {
  mode: 'uniform';
  rows: number;
  cols: number;
}

/** Per-row card counts, e.g. a pyramid or irregular layout. */
export interface CustomGridConfig {
  mode: 'custom';
  rowCounts: number[];
}

export interface GridConfig {
  layout: UniformGridConfig | CustomGridConfig;
  /** Key into CARD_SIZE_REGISTRY (lib/cardRegistry). */
  cardSizeId: string;
  /** Gap between cards, in mm. */
  spacingMm: number;
  /** Distance from the outer edge of the display to the nearest card, in mm. */
  borderMm: number;
  /** Unit used for display/input only; does not affect stored values. */
  displayUnit: LengthUnit;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  layout: { mode: 'uniform', rows: 3, cols: 3 },
  cardSizeId: DEFAULT_CARD_SIZE_ID,
  spacingMm: 5,
  borderMm: 10,
  displayUnit: 'mm',
};

/** Expands a layout into a flat array of per-row slot counts. */
export function getRowCounts(layout: UniformGridConfig | CustomGridConfig): number[] {
  if (layout.mode === 'uniform') {
    return Array.from({ length: layout.rows }, () => layout.cols);
  }
  return layout.rowCounts;
}

/** Total number of card slots across all rows. */
export function getTotalSlots(layout: UniformGridConfig | CustomGridConfig): number {
  return getRowCounts(layout).reduce((sum, count) => sum + count, 0);
}

/**
 * Resizes a slot-assignment array to match the current layout's total slot
 * count, truncating extra assignments or padding with nulls. Called whenever
 * the grid shape changes so stored assignments stay index-aligned with slots.
 */
export function normalizeSlotAssignments(
  layout: UniformGridConfig | CustomGridConfig,
  current: (string | null)[],
): (string | null)[] {
  const total = getTotalSlots(layout);
  const next = current.slice(0, total);
  while (next.length < total) next.push(null);
  return next;
}
