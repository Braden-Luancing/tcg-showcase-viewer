/**
 * IndexedDB schema and singleton connection for this app's client-side
 * persistence (no backend — see CLAUDE.md's "persistence is local-first"
 * principle). Two object stores: `cardImages` for uploaded card image blobs
 * and `layoutState` for the single current grid/library layout.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CardImageRecord, LayoutState } from '../../types';

interface AppDB extends DBSchema {
  cardImages: {
    key: string;
    value: CardImageRecord;
  };
  layoutState: {
    key: string;
    value: LayoutState;
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

/** Opens (or returns the cached open connection to) the app's IndexedDB database. */
export function getDb(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('tcg-showcase-viewer-db', 1, {
      upgrade(db) {
        db.createObjectStore('cardImages', { keyPath: 'id' });
        db.createObjectStore('layoutState', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
