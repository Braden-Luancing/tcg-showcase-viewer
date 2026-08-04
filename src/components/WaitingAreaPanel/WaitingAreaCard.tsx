/**
 * A waiting-area card wrapped as both a dnd-kit drop target (for cards
 * dragged onto it from the library, grid, or another waiting-area position)
 * and a draggable source (so it can be picked up and dropped onto a grid
 * slot or another waiting-area card). Mirrors DroppableGridSlot's dual-role
 * pattern.
 */

import type { CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GridSlot } from '../GridDisplay/GridSlot';

interface WaitingAreaCardProps {
  cardId: string;
  index: number;
  widthPx: number;
  heightPx: number;
  imageUrl: string | null;
}

export function WaitingAreaCard({ cardId, index, widthPx, heightPx, imageUrl }: WaitingAreaCardProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `waiting-card-drop-${index}`,
    data: { type: 'waiting-card', cardId, index },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `waiting-card-drag-${index}`,
    data: { type: 'waiting-card', cardId, index },
  });

  function setRefs(node: HTMLElement | null) {
    setDroppableRef(node);
    setDraggableRef(node);
  }

  const style: CSSProperties = {
    outline: isOver ? '2px solid #646cff' : undefined,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  return (
    <div ref={setRefs} style={style} {...listeners} {...attributes}>
      <GridSlot widthPx={widthPx} heightPx={heightPx} imageUrl={imageUrl} />
    </div>
  );
}
