/**
 * Loads and manages the card image library: syncs IndexedDB records with
 * React state and maintains a blob-URL cache (object URLs) for rendering
 * images, revoking URLs as records are removed or the hook unmounts.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addCardImage,
  deleteCardImages,
  getAllCardImages,
} from '../lib/db/cardImagesStore';
import type { CardImageRecord } from '../types';
import type { LibraryEntry } from '../components/CardLibraryPanel/CardLibraryPanel';

export function useCardLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  // Converts DB records into render-ready entries with object URLs, reusing
  // existing URLs where possible and revoking ones for records that no
  // longer exist so we don't leak blob URLs.
  const toEntries = useCallback((records: CardImageRecord[]): LibraryEntry[] => {
    const urls = objectUrlsRef.current;
    const nextIds = new Set(records.map((r) => r.id));

    for (const [id, url] of urls) {
      if (!nextIds.has(id)) {
        URL.revokeObjectURL(url);
        urls.delete(id);
      }
    }

    return records.map((record) => {
      let url = urls.get(record.id);
      if (!url) {
        url = URL.createObjectURL(record.blob);
        urls.set(record.id, url);
      }
      return { record, imageUrl: url };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAllCardImages().then((records) => {
      if (cancelled) return;
      setEntries(toEntries(records));
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  /** Persists the given files as new card images and refreshes the library. */
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const added = await Promise.all(fileArray.map((file) => addCardImage(file, file.name, 'upload')));
      const all = await getAllCardImages();
      setEntries(toEntries(all));
      return added;
    },
    [toEntries],
  );

  /** Deletes the given card images from IndexedDB and refreshes the library. */
  const removeImages = useCallback(
    async (ids: string[]) => {
      await deleteCardImages(ids);
      const all = await getAllCardImages();
      setEntries(toEntries(all));
    },
    [toEntries],
  );

  return { entries, isLoaded, addFiles, removeImages };
}
