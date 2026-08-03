/** Shared domain types persisted to IndexedDB (see lib/db). */

import type { GridConfig } from '../lib/grid/gridConfig';
import type { LengthUnit } from '../lib/units/units';

/**
 * How a card image entered the library. `'api-cache'` is for a future phase
 * (pulling card art directly from a TCG API) — see PLAN.md.
 */
export type CardImageSourceType = 'upload' | 'url' | 'api-cache';

/** A single uploaded card image, stored as a blob in the `cardImages` IndexedDB store. */
export interface CardImageRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
  sourceType: CardImageSourceType;
  createdAt: number;
  /** Last time this image was assigned to a slot or added to the library; used to detect unused images for cleanup. */
  lastUsedAt: number;
}

/**
 * The single persisted "project" record: current grid config, library
 * ordering, and which card image (if any) fills each grid slot.
 */
export interface LayoutState {
  /** Always `'current'` — this app supports exactly one saved layout at a time. */
  id: 'current';
  gridConfig: GridConfig;
  /** Card image ids in the order they appear in the library panel. */
  libraryOrder: string[];
  /** Card image id (or null if empty) per grid slot, indexed by flattened slot position. */
  slotAssignments: (string | null)[];
  units: LengthUnit;
  updatedAt: number;
}
