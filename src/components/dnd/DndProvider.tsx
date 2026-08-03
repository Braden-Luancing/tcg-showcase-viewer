/**
 * Wraps the app in a dnd-kit DndContext configured with both pointer and
 * touch sensors, so drag interactions work on both PC and mobile (see
 * CLAUDE.md's drag-and-drop requirements). Owns no drag state itself — it
 * just maps a completed drag to the appropriate callback: a library card
 * dropped on a slot calls `onAssign` (copy/overwrite), while a card already
 * in a slot dropped on another slot calls `onMoveOrSwap` (swap if the
 * destination is occupied, move if it's empty).
 */

import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DraggableLibraryCardData {
  type: 'library-card';
  cardId: string;
}

interface DraggableGridSlotCardData {
  type: 'grid-slot-card';
  slotIndex: number;
  cardId: string;
}

interface DroppableGridSlotData {
  type: 'grid-slot';
  slotIndex: number;
}

interface DndProviderProps {
  children: ReactNode;
  onAssign: (cardId: string, slotIndex: number) => void;
  onMoveOrSwap: (fromSlotIndex: number, toSlotIndex: number) => void;
}

export function DndProvider({ children, onAssign, onMoveOrSwap }: DndProviderProps) {
  const sensors = useSensors(
    // Small movement threshold so plain clicks aren't mistaken for drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Short delay so touch-scrolling the page isn't mistaken for a drag.
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as
      | DraggableLibraryCardData
      | DraggableGridSlotCardData
      | undefined;
    const overData = over.data.current as DroppableGridSlotData | undefined;

    if (overData?.type !== 'grid-slot') return;

    if (activeData?.type === 'library-card') {
      onAssign(activeData.cardId, overData.slotIndex);
    } else if (activeData?.type === 'grid-slot-card') {
      if (activeData.slotIndex === overData.slotIndex) return;
      onMoveOrSwap(activeData.slotIndex, overData.slotIndex);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
