/**
 * The card library panel: file upload (button + native OS drag-and-drop
 * onto the panel) and a list of uploaded cards. Rendering of individual
 * cards is delegated to `renderItem` when the caller needs them to also be
 * draggable into the grid (see App.tsx, which passes DraggableLibraryCard).
 */

import { useState, type DragEvent, type ReactNode } from 'react';
import type { CardImageRecord } from '../../types';
import { UploadButton } from './UploadButton';
import { UrlImportForm } from './UrlImportForm';
import { LibraryCard } from './LibraryCard';

/** A card image paired with its (object URL) image source, ready to render. */
export interface LibraryEntry {
  record: CardImageRecord;
  imageUrl: string;
}

interface CardLibraryPanelProps {
  entries: LibraryEntry[];
  onFilesAdded: (files: FileList | File[]) => void;
  onUrlAdded: (url: string) => Promise<void>;
  onCleanUnused: () => void;
  hasUnusedImages: boolean;
  /** Optional override for rendering each entry, e.g. to make it draggable into the grid. */
  renderItem?: (entry: LibraryEntry) => ReactNode;
}

export function CardLibraryPanel({
  entries,
  onFilesAdded,
  onUrlAdded,
  onCleanUnused,
  hasUnusedImages,
  renderItem,
}: CardLibraryPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Shared by the URL form and by dropping a dragged image/link from another
  // page, so both entry points show the same loading/error state.
  async function submitUrl(url: string) {
    setIsUrlLoading(true);
    setUrlError(null);
    try {
      await onUrlAdded(url);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Failed to add image from URL.');
    } finally {
      setIsUrlLoading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
      return;
    }
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url.trim()) {
      void submitUrl(url.trim());
    }
  }

  // Cleanup is destructive (removes cached blobs from IndexedDB), so confirm
  // before calling through; the underlying files on the user's device are
  // untouched since they were only ever copied into the app's cache.
  function handleCleanUnused() {
    const confirmed = window.confirm(
      'This will remove all cached images not used in the current project. Uploaded files on your device are not affected.',
    );
    if (confirmed) onCleanUnused();
  }

  return (
    <section
      className={isDragOver ? 'card-library-panel card-library-panel--drag-over' : 'card-library-panel'}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="card-library-panel__toolbar">
        <UploadButton onFilesSelected={onFilesAdded} />
        <UrlImportForm onSubmit={submitUrl} isLoading={isUrlLoading} error={urlError} />
        <button type="button" onClick={handleCleanUnused} disabled={!hasUnusedImages}>
          Clean unused cached images
        </button>
      </div>
      <div className="card-library-panel__list">
        {entries.map((entry) =>
          renderItem ? (
            <div key={entry.record.id}>{renderItem(entry)}</div>
          ) : (
            <LibraryCard key={entry.record.id} imageUrl={entry.imageUrl} fileName={entry.record.fileName} />
          ),
        )}
      </div>
    </section>
  );
}
