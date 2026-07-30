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
import { DndProvider } from './components/dnd/DndProvider';
import { DraggableLibraryCard } from './components/dnd/DraggableLibraryCard';
import { useCardLibrary } from './hooks/useCardLibrary';
import { useLayoutState } from './hooks/useLayoutState';
import { normalizeSlotAssignments, type GridConfig } from './lib/grid/gridConfig';

function App() {
  const { state, isLoaded: isLayoutLoaded, update } = useLayoutState();
  const { entries, isLoaded: isLibraryLoaded, addFiles, removeImages } = useCardLibrary();

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
    return used;
  }, [state.slotAssignments, state.libraryOrder]);

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

  if (!isLayoutLoaded || !isLibraryLoaded) {
    return <div className="app-loading">Loading…</div>;
  }

  return (
    <div className="app">
      <DndProvider onAssign={handleAssign}>
        <GridConfigurator config={state.gridConfig} onChange={handleGridConfigChange} />
        <GridDisplay config={state.gridConfig} slotAssignments={state.slotAssignments} imageUrlById={imageUrlById} />
        <CardLibraryPanel
          entries={entries}
          onFilesAdded={handleFilesAdded}
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
