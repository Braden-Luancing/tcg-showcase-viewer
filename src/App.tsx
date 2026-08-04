/**
 * Root component: wires together layout state (grid config + slot
 * assignments, persisted via useLayoutState) and the card image library
 * (persisted via useCardLibrary), and composes the configurator, grid
 * display, and library panel inside a shared drag-and-drop context.
 */

import { useMemo } from 'react';
import './App.css';
import { GridConfigurator } from './components/GridConfigurator/GridConfigurator';
import { GridDisplay } from './components/GridDisplay/GridDisplay';
import { CardLibraryPanel } from './components/CardLibraryPanel/CardLibraryPanel';
import { WaitingAreaPanel } from './components/WaitingAreaPanel/WaitingAreaPanel';
import { DndProvider } from './components/dnd/DndProvider';
import { DraggableLibraryCard } from './components/dnd/DraggableLibraryCard';
import { useCardLibrary } from './hooks/useCardLibrary';
import { useLayoutState } from './hooks/useLayoutState';
import { normalizeSlotAssignments, type GridConfig } from './lib/grid/gridConfig';

function App() {
  const { state, isLoaded: isLayoutLoaded, update } = useLayoutState();
  const { entries, isLoaded: isLibraryLoaded, addFiles, addFromUrl, removeImages } = useCardLibrary();

  const imageUrlById = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) map.set(entry.record.id, entry.imageUrl);
    return map;
  }, [entries]);

  // An image counts as "used" if it's placed in a slot or still listed in
  // the library order; anything else is a stale cache candidate for cleanup.
  const usedImageIds = useMemo(() => {
    const used = new Set<string>();
    for (const id of state.slotAssignments) if (id) used.add(id);
    for (const id of state.libraryOrder) used.add(id);
    for (const id of state.waitingAreaOrder) used.add(id);
    return used;
  }, [state.slotAssignments, state.libraryOrder, state.waitingAreaOrder]);

  const unusedImageIds = useMemo(
    () => entries.map((e) => e.record.id).filter((id) => !usedImageIds.has(id)),
    [entries, usedImageIds],
  );

  function handleGridConfigChange(gridConfig: GridConfig) {
    update((prev) => ({
      ...prev,
      gridConfig,
      slotAssignments: normalizeSlotAssignments(gridConfig.layout, prev.slotAssignments),
    }));
  }

  async function handleFilesAdded(files: FileList | File[]) {
    const added = await addFiles(files);
    update((prev) => ({ ...prev, libraryOrder: [...prev.libraryOrder, ...added.map((r) => r.id)] }));
  }

  async function handleUrlAdded(url: string) {
    const record = await addFromUrl(url);
    update((prev) => ({ ...prev, libraryOrder: [...prev.libraryOrder, record.id] }));
  }

  async function handleCleanUnused() {
    await removeImages(unusedImageIds);
  }

  function handleAssign(cardId: string, slotIndex: number) {
    update((prev) => {
      const slotAssignments = normalizeSlotAssignments(prev.gridConfig.layout, prev.slotAssignments);
      slotAssignments[slotIndex] = cardId;
      return { ...prev, slotAssignments };
    });
  }

  function handleMoveOrSwap(fromSlotIndex: number, toSlotIndex: number) {
    update((prev) => {
      const slotAssignments = normalizeSlotAssignments(prev.gridConfig.layout, prev.slotAssignments);
      const fromCardId = slotAssignments[fromSlotIndex];
      if (!fromCardId) return prev;
      const toCardId = slotAssignments[toSlotIndex];

      slotAssignments[toSlotIndex] = fromCardId;
      slotAssignments[fromSlotIndex] = toCardId;

      return { ...prev, slotAssignments };
    });
  }

  function handleLibraryToWaitingAppend(cardId: string) {
    update((prev) => ({ ...prev, waitingAreaOrder: [...prev.waitingAreaOrder, cardId] }));
  }

  function handleLibraryToWaitingInsert(cardId: string, index: number) {
    update((prev) => {
      const waitingAreaOrder = [...prev.waitingAreaOrder];
      waitingAreaOrder.splice(index, 0, cardId);
      return { ...prev, waitingAreaOrder };
    });
  }

  function handleGridToWaitingAppend(slotIndex: number) {
    update((prev) => {
      const slotAssignments = normalizeSlotAssignments(prev.gridConfig.layout, prev.slotAssignments);
      const cardId = slotAssignments[slotIndex];
      if (!cardId) return prev;
      slotAssignments[slotIndex] = null;
      return { ...prev, slotAssignments, waitingAreaOrder: [...prev.waitingAreaOrder, cardId] };
    });
  }

  function swapGridAndWaiting(slotIndex: number, waitingIndex: number) {
    update((prev) => {
      const slotAssignments = normalizeSlotAssignments(prev.gridConfig.layout, prev.slotAssignments);
      const waitingAreaOrder = [...prev.waitingAreaOrder];
      const gridCardId = slotAssignments[slotIndex];
      const waitingCardId = waitingAreaOrder[waitingIndex];
      if (waitingCardId === undefined) return prev;

      slotAssignments[slotIndex] = waitingCardId;
      if (gridCardId) {
        waitingAreaOrder[waitingIndex] = gridCardId;
      } else {
        waitingAreaOrder.splice(waitingIndex, 1);
      }

      return { ...prev, slotAssignments, waitingAreaOrder };
    });
  }

  function handleWaitingReorder(fromIndex: number, toIndex: number) {
    update((prev) => {
      const waitingAreaOrder = [...prev.waitingAreaOrder];
      const [moved] = waitingAreaOrder.splice(fromIndex, 1);
      if (moved === undefined) return prev;
      if (toIndex === -1) waitingAreaOrder.push(moved);
      else waitingAreaOrder.splice(toIndex, 0, moved);
      return { ...prev, waitingAreaOrder };
    });
  }

  function handleWaitingAreaEnabledChange(waitingAreaEnabled: boolean) {
    update((prev) => ({ ...prev, waitingAreaEnabled }));
  }

  if (!isLayoutLoaded || !isLibraryLoaded) {
    return <div className="app-loading">Loading…</div>;
  }

  return (
    <div className="app">
      <DndProvider
        onAssign={handleAssign}
        onMoveOrSwap={handleMoveOrSwap}
        onLibraryToWaitingAppend={handleLibraryToWaitingAppend}
        onLibraryToWaitingInsert={handleLibraryToWaitingInsert}
        onGridToWaitingAppend={handleGridToWaitingAppend}
        onGridWaitingSwap={swapGridAndWaiting}
        onWaitingToGridSwap={(waitingIndex, slotIndex) => swapGridAndWaiting(slotIndex, waitingIndex)}
        onWaitingReorder={handleWaitingReorder}
      >
        <GridConfigurator
          config={state.gridConfig}
          onChange={handleGridConfigChange}
          waitingAreaEnabled={state.waitingAreaEnabled}
          onWaitingAreaEnabledChange={handleWaitingAreaEnabledChange}
        />
        <div className="app__main-row">
          <GridDisplay
            config={state.gridConfig}
            slotAssignments={state.slotAssignments}
            imageUrlById={imageUrlById}
            onConfigChange={handleGridConfigChange}
          />
          {state.waitingAreaEnabled && (
            <WaitingAreaPanel
              cardIds={state.waitingAreaOrder}
              imageUrlById={imageUrlById}
              cardSizeId={state.gridConfig.cardSizeId}
            />
          )}
        </div>
        <CardLibraryPanel
          entries={entries}
          onFilesAdded={handleFilesAdded}
          onUrlAdded={handleUrlAdded}
          onCleanUnused={handleCleanUnused}
          hasUnusedImages={unusedImageIds.length > 0}
          renderItem={(entry) => (
            <DraggableLibraryCard
              cardId={entry.record.id}
              imageUrl={entry.imageUrl}
              fileName={entry.record.fileName}
            />
          )}
        />
      </DndProvider>
    </div>
  );
}

export default App;
