/**
 * Bottom-right corner handle that lets the user drag-resize a uniform grid's
 * row/column count directly, as an alternative to the numeric inputs in
 * GridConfigurator. Uses native Pointer Events (not dnd-kit) since it's a
 * standalone DOM node outside any draggable/droppable slot.
 */

import { useRef } from 'react';
import type { UniformGridConfig } from '../../lib/grid/gridConfig';

const MIN_UNIFORM_DIM = 1;
const MAX_UNIFORM_DIM = 30;

interface ResizeHandleProps {
  layout: UniformGridConfig;
  cardWidthPx: number;
  cardHeightPx: number;
  gapPx: number;
  onResize: (layout: UniformGridConfig) => void;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startRows: number;
  startCols: number;
  stepX: number;
  stepY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ResizeHandle({ layout, cardWidthPx, cardHeightPx, gapPx, onResize }: ResizeHandleProps) {
  const dragRef = useRef<DragState | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startRows: layout.rows,
      startCols: layout.cols,
      // Fixed for the whole drag: recomputing from live scale mid-drag would
      // create feedback jitter, since a rows/cols change alters scale, which
      // alters px-per-card, which would change the step size next frame.
      stepX: cardWidthPx + gapPx,
      stepY: cardHeightPx + gapPx,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const cols = clamp(drag.startCols + Math.round(dx / drag.stepX), MIN_UNIFORM_DIM, MAX_UNIFORM_DIM);
    const rows = clamp(drag.startRows + Math.round(dy / drag.stepY), MIN_UNIFORM_DIM, MAX_UNIFORM_DIM);

    if (cols !== layout.cols || rows !== layout.rows) {
      onResize({ mode: 'uniform', rows, cols });
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div
      className="grid-display__resize-handle"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
      role="presentation"
      aria-label="Drag to resize grid"
    />
  );
}
