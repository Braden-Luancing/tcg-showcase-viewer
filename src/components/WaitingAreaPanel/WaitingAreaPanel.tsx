/**
 * Side panel holding cards the user has temporarily pulled out of the
 * library or off the main grid. An unbounded, reorderable list (unlike the
 * grid's fixed slot array) — see CLAUDE.md/PLAN.md context in App.tsx.
 * Cards are rendered at the configured TCG's real-world proportions via its
 * own mm-to-px scale, independent of the main grid's scale.
 */

import { useDroppable } from '@dnd-kit/core';
import { useMmToPx } from '../../hooks/useMmToPx';
import { getCardSizeById } from '../../lib/cardRegistry/cardRegistry';
import { WaitingAreaCard } from './WaitingAreaCard';

interface WaitingAreaPanelProps {
  cardIds: string[];
  imageUrlById: Map<string, string>;
  cardSizeId: string;
}

export function WaitingAreaPanel({ cardIds, imageUrlById, cardSizeId }: WaitingAreaPanelProps) {
  const { widthMm, heightMm } = getCardSizeById(cardSizeId);
  const { containerRef, scale } = useMmToPx(widthMm);
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'waiting-area',
    data: { type: 'waiting-area' },
  });

  function setRefs(node: HTMLDivElement | null) {
    containerRef.current = node;
    setDroppableRef(node);
  }

  const widthPx = widthMm * scale;
  const heightPx = heightMm * scale;

  return (
    <aside
      ref={setRefs}
      className={isOver ? 'waiting-area-panel waiting-area-panel--drag-over' : 'waiting-area-panel'}
    >
      {cardIds.length === 0 ? (
        <p className="waiting-area-panel--empty">Drag cards here to hold them</p>
      ) : (
        <div className="waiting-area-panel__list">
          {cardIds.map((cardId, index) => (
            <WaitingAreaCard
              key={`${cardId}-${index}`}
              cardId={cardId}
              index={index}
              widthPx={widthPx}
              heightPx={heightPx}
              imageUrl={imageUrlById.get(cardId) ?? null}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
