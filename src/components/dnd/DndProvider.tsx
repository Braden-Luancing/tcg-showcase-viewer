/**
 * Wraps the app in a dnd-kit DndContext configured with both pointer and
 * touch sensors, so drag interactions work on both PC and mobile (see
 * CLAUDE.md's drag-and-drop requirements). Owns no drag state itself — it
 * just maps a completed drag to the appropriate callback: a library card
 * dropped on a slot calls `onAssign` (copy/overwrite), a card already in a
 * slot dropped on another slot calls `onMoveOrSwap` (swap if the destination
 * is occupied, move if it's empty), and cards moving to/from/within the
 * waiting area route through the waiting-area-specific callbacks below.
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

interface DraggableWaitingCardData {
  type: 'waiting-card';
  cardId: string;
  index: number;
}

interface DroppableGridSlotData {
  type: 'grid-slot';
  slotIndex: number;
}

interface DroppableWaitingAreaData {
  type: 'waiting-area';
}

type ActiveData = DraggableLibraryCardData | DraggableGridSlotCardData | DraggableWaitingCardData;
type OverData = DroppableGridSlotData | DraggableWaitingCardData | DroppableWaitingAreaData;

interface DndProviderProps {
  children: ReactNode;
  onAssign: (cardId: string, slotIndex: number) => void;
  onMoveOrSwap: (fromSlotIndex: number, toSlotIndex: number) => void;
  onLibraryToWaitingAppend: (cardId: string) => void;
  onLibraryToWaitingInsert: (cardId: string, index: number) => void;
  onGridToWaitingAppend: (slotIndex: number) => void;
  onGridWaitingSwap: (slotIndex: number, waitingIndex: number) => void;
  onWaitingToGridSwap: (waitingIndex: number, slotIndex: number) => void;
  onWaitingReorder: (fromIndex: number, toIndex: number) => void;
}

export function DndProvider({
  children,
  onAssign,
  onMoveOrSwap,
  onLibraryToWaitingAppend,
  onLibraryToWaitingInsert,
  onGridToWaitingAppend,
  onGridWaitingSwap,
  onWaitingToGridSwap,
  onWaitingReorder,
}: DndProviderProps) {
  const sensors = useSensors(
    // Small movement threshold so plain clicks aren't mistaken for drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Short delay so touch-scrolling the page isn't mistaken for a drag.
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as ActiveData | undefined;
    const overData = over.data.current as OverData | undefined;
    if (!activeData || !overData) return;

    if (activeData.type === 'library-card') {
      if (overData.type === 'grid-slot') {
        onAssign(activeData.cardId, overData.slotIndex);
      } else if (overData.type === 'waiting-area') {
        onLibraryToWaitingAppend(activeData.cardId);
      } else if (overData.type === 'waiting-card') {
        onLibraryToWaitingInsert(activeData.cardId, overData.index);
      }
    } else if (activeData.type === 'grid-slot-card') {
      if (overData.type === 'grid-slot') {
        if (activeData.slotIndex === overData.slotIndex) return;
        onMoveOrSwap(activeData.slotIndex, overData.slotIndex);
      } else if (overData.type === 'waiting-area') {
        onGridToWaitingAppend(activeData.slotIndex);
      } else if (overData.type === 'waiting-card') {
        onGridWaitingSwap(activeData.slotIndex, overData.index);
      }
    } else if (activeData.type === 'waiting-card') {
      if (overData.type === 'grid-slot') {
        onWaitingToGridSwap(activeData.index, overData.slotIndex);
      } else if (overData.type === 'waiting-card') {
        if (activeData.index === overData.index) return;
        onWaitingReorder(activeData.index, overData.index);
      } else if (overData.type === 'waiting-area') {
        onWaitingReorder(activeData.index, -1);
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
