/**
 * Wraps the app in a dnd-kit DndContext configured with both pointer and
 * touch sensors, so the library-card-to-grid-slot drag works on both PC and
 * mobile (see CLAUDE.md's drag-and-drop requirements). Owns no drag state
 * itself — it just maps a completed drag (library card -> grid slot) to the
 * `onAssign` callback.
 */

import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DraggableLibraryCardData {
  type: 'library-card';
  cardId: string;
}

interface DroppableGridSlotData {
  type: 'grid-slot';
  slotIndex: number;
}

interface DndProviderProps {
  children: ReactNode;
  onAssign: (cardId: string, slotIndex: number) => void;
}

export function DndProvider({ children, onAssign }: DndProviderProps) {
  const sensors = useSensors(
    // Small movement threshold so plain clicks aren't mistaken for drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Short delay so touch-scrolling the page isn't mistaken for a drag.
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as DraggableLibraryCardData | undefined;
    const overData = over.data.current as DroppableGridSlotData | undefined;

    if (activeData?.type === 'library-card' && overData?.type === 'grid-slot') {
      onAssign(activeData.cardId, overData.slotIndex);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
