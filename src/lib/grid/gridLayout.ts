/**
 * Converts a GridConfig (stored in mm) into pixel measurements for rendering.
 * Mm-to-px conversion is a pure function of a `scale` (px per mm) supplied by
 * the caller, so this module has no knowledge of the container's actual
 * on-screen size — see hooks/useMmToPx.ts for how `scale` is derived.
 */

import type { CardSizeDefinition } from '../cardRegistry/types';
import { getRowCounts, type GridConfig } from './gridConfig';

/** Pixel layout for a single row of the grid. */
export interface RowPxLayout {
  slotCount: number;
  gridTemplateColumns: string;
  columnGapPx: number;
  rowGapPx: number;
}

/** Full pixel layout for a grid: all rows plus shared card size/padding. */
export interface GridPxLayout {
  rows: RowPxLayout[];
  paddingPx: number;
  cardWidthPx: number;
  cardHeightPx: number;
}

/**
 * The natural (unscaled) width of the grid in mm, based on its widest row.
 * Used to derive the px-per-mm scale factor from an available container width.
 */
export function getNaturalWidthMm(config: GridConfig, cardSize: CardSizeDefinition): number {
  const rowCounts = getRowCounts(config.layout);
  const widestRow = Math.max(0, ...rowCounts);
  const cardsWidthMm = widestRow * cardSize.widthMm;
  const gapsWidthMm = Math.max(0, widestRow - 1) * config.spacingMm;
  return cardsWidthMm + gapsWidthMm + config.borderMm * 2;
}

/**
 * Converts a GridConfig's mm-based measurements into pixel values for every
 * row, using the given px-per-mm `scale` (see hooks/useMmToPx.ts).
 */
export function computeGridPxLayout(
  config: GridConfig,
  cardSize: CardSizeDefinition,
  scale: number,
): GridPxLayout {
  const rowCounts = getRowCounts(config.layout);
  const cardWidthPx = cardSize.widthMm * scale;
  const cardHeightPx = cardSize.heightMm * scale;
  const gapPx = config.spacingMm * scale;
  const paddingPx = config.borderMm * scale;

  const rows: RowPxLayout[] = rowCounts.map((slotCount) => ({
    slotCount,
    gridTemplateColumns: `repeat(${slotCount}, ${cardWidthPx}px)`,
    columnGapPx: gapPx,
    rowGapPx: gapPx,
  }));

  return { rows, paddingPx, cardWidthPx, cardHeightPx };
}
