/**
 * Loads the persisted layout state on mount and provides a debounced
 * `update` function that applies an in-memory change immediately (for
 * responsive UI) while writing to IndexedDB after a short quiet period, to
 * avoid a DB write on every keystroke/drag.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getLayoutState, saveLayoutState } from '../lib/db/layoutStore';
import { DEFAULT_GRID_CONFIG } from '../lib/grid/gridConfig';
import type { LayoutState } from '../types';

const DEFAULT_LAYOUT_STATE: LayoutState = {
  id: 'current',
  gridConfig: DEFAULT_GRID_CONFIG,
  libraryOrder: [],
  slotAssignments: [],
  waitingAreaOrder: [],
  waitingAreaEnabled: false,
  units: 'mm',
  updatedAt: 0,
};

const PERSIST_DEBOUNCE_MS = 400;

export function useLayoutState() {
  const [state, setState] = useState<LayoutState>(DEFAULT_LAYOUT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLayoutState().then((loaded) => {
      if (cancelled) return;
      if (loaded) {
        setState({
          ...loaded,
          waitingAreaOrder: loaded.waitingAreaOrder ?? [],
          waitingAreaEnabled: loaded.waitingAreaEnabled ?? false,
        });
      }
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Applies `updater` to the current state immediately and schedules a
   * debounced persist to IndexedDB (resetting the timer on rapid updates).
   */
  const update = useCallback((updater: (prev: LayoutState) => LayoutState) => {
    setState((prev) => {
      const next = updater(prev);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveLayoutState(next);
      }, PERSIST_DEBOUNCE_MS);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { state, isLoaded, update };
}
