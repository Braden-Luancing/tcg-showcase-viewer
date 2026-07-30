/** CRUD helpers for the `cardImages` IndexedDB store (uploaded card image blobs). */

import { getDb } from './db';
import type { CardImageRecord, CardImageSourceType } from '../../types';

/** Stores a new card image blob and returns its generated record. */
export async function addCardImage(
  blob: Blob,
  fileName: string,
  sourceType: CardImageSourceType,
): Promise<CardImageRecord> {
  const db = await getDb();
  const now = Date.now();
  const record: CardImageRecord = {
    id: crypto.randomUUID(),
    blob,
    mimeType: blob.type,
    fileName,
    sourceType,
    createdAt: now,
    lastUsedAt: now,
  };
  await db.put('cardImages', record);
  return record;
}

/** Returns every stored card image record. */
export async function getAllCardImages(): Promise<CardImageRecord[]> {
  const db = await getDb();
  return db.getAll('cardImages');
}

/** Deletes a single card image record by id. */
export async function deleteCardImage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('cardImages', id);
}

/** Deletes multiple card image records in one transaction. */
export async function deleteCardImages(ids: string[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cardImages', 'readwrite');
  await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
}

/** Updates a record's `lastUsedAt` timestamp; no-ops if the record is missing. */
export async function touchCardImage(id: string): Promise<void> {
  const db = await getDb();
  const record = await db.get('cardImages', id);
  if (!record) return;
  record.lastUsedAt = Date.now();
  await db.put('cardImages', record);
}
