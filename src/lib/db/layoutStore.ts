/**
 * Read/write helpers for the `layoutState` IndexedDB store, which holds a
 * single record (id `'current'`) representing the user's in-progress grid
 * configuration, library ordering, and slot assignments.
 */

import { getDb } from './db';
import type { LayoutState } from '../../types';

/** Loads the current layout state, or undefined if nothing has been saved yet. */
export async function getLayoutState(): Promise<LayoutState | undefined> {
  const db = await getDb();
  return db.get('layoutState', 'current');
}

/** Persists the given layout state as the current state, stamping `updatedAt`. */
export async function saveLayoutState(state: LayoutState): Promise<void> {
  const db = await getDb();
  await db.put('layoutState', { ...state, id: 'current', updatedAt: Date.now() });
}
