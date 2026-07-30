/**
 * Hardcoded registry of real-world card sizes, keyed by TCG/format.
 *
 * This is the single source of truth for physical card dimensions used by
 * grid layout math (see lib/grid/gridLayout.ts). Support for a new TCG
 * should be added here as a new entry, not by deriving sizes elsewhere.
 */

import type { CardSizeDefinition } from './types';

export const CARD_SIZE_REGISTRY: readonly CardSizeDefinition[] = [
  { id: 'poker', label: 'Poker Size (Standard TCG)', widthMm: 63, heightMm: 88 },
];

export const DEFAULT_CARD_SIZE_ID = 'poker';

/** Looks up a card size definition by id. Throws if the id is unregistered. */
export function getCardSizeById(id: string): CardSizeDefinition {
  const found = CARD_SIZE_REGISTRY.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown card size id: ${id}`);
  return found;
}
