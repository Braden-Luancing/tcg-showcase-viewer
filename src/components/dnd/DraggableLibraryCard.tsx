/** A library card wrapped as a dnd-kit draggable source (drag target: a DroppableGridSlot). */

import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import { LibraryCard } from '../CardLibraryPanel/LibraryCard';

interface DraggableLibraryCardProps {
  cardId: string;
  imageUrl: string;
  fileName: string;
}

export function DraggableLibraryCard({ cardId, imageUrl, fileName }: DraggableLibraryCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${cardId}`,
    data: { type: 'library-card', cardId },
  });

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LibraryCard imageUrl={imageUrl} fileName={fileName} />
    </div>
  );
}
