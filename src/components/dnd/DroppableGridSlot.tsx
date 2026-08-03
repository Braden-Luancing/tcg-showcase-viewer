/**
 * A grid slot wrapped as a dnd-kit drop target for DraggableLibraryCard and
 * for other grid slots (card-to-card swap/move), with a hover highlight.
 * When occupied, the slot is also draggable so its card can be picked up and
 * dropped onto another slot.
 */

import type { CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GridSlot } from '../GridDisplay/GridSlot';

interface DroppableGridSlotProps {
  slotIndex: number;
  cardId: string | null;
  widthPx: number;
  heightPx: number;
  imageUrl: string | null;
}

export function DroppableGridSlot({ slotIndex, cardId, widthPx, heightPx, imageUrl }: DroppableGridSlotProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: { type: 'grid-slot', slotIndex },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `slot-card-${slotIndex}`,
    data: { type: 'grid-slot-card', slotIndex, cardId },
    disabled: !cardId,
  });

  function setRefs(node: HTMLElement | null) {
    setDroppableRef(node);
    setDraggableRef(node);
  }

  const style: CSSProperties = {
    outline: isOver ? '2px solid #646cff' : undefined,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: cardId ? 'none' : undefined,
    cursor: cardId ? 'grab' : undefined,
  };

  return (
    <div ref={setRefs} style={style} {...(cardId ? listeners : undefined)} {...(cardId ? attributes : undefined)}>
      <GridSlot widthPx={widthPx} heightPx={heightPx} imageUrl={imageUrl} />
    </div>
  );
}
