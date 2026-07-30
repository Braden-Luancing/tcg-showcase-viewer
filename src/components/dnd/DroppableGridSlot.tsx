/** A grid slot wrapped as a dnd-kit drop target for DraggableLibraryCard, with a hover highlight. */

import { useDroppable } from '@dnd-kit/core';
import { GridSlot } from '../GridDisplay/GridSlot';

interface DroppableGridSlotProps {
  slotIndex: number;
  widthPx: number;
  heightPx: number;
  imageUrl: string | null;
}

export function DroppableGridSlot({ slotIndex, widthPx, heightPx, imageUrl }: DroppableGridSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: { type: 'grid-slot', slotIndex },
  });

  return (
    <div ref={setNodeRef} style={{ outline: isOver ? '2px solid #646cff' : undefined }}>
      <GridSlot widthPx={widthPx} heightPx={heightPx} imageUrl={imageUrl} />
    </div>
  );
}
