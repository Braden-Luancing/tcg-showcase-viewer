/**
 * Renders the physical card display: a set of CSS Grid rows sized in pixels
 * derived from the GridConfig's real-world (mm) measurements, scaled to fit
 * the available container width (see useMmToPx). Each slot is a droppable
 * target that shows the assigned card's image, if any.
 */

import { getCardSizeById } from '../../lib/cardRegistry/cardRegistry';
import type { GridConfig } from '../../lib/grid/gridConfig';
import { getRowCounts } from '../../lib/grid/gridConfig';
import { computeGridPxLayout, getNaturalWidthMm } from '../../lib/grid/gridLayout';
import { useMmToPx } from '../../hooks/useMmToPx';
import { DroppableGridSlot } from '../dnd/DroppableGridSlot';

interface GridDisplayProps {
  config: GridConfig;
  slotAssignments: (string | null)[];
  imageUrlById: Map<string, string>;
}

export function GridDisplay({ config, slotAssignments, imageUrlById }: GridDisplayProps) {
  const cardSize = getCardSizeById(config.cardSizeId);
  const naturalWidthMm = getNaturalWidthMm(config, cardSize);
  const { containerRef, scale } = useMmToPx(naturalWidthMm);
  const pxLayout = computeGridPxLayout(config, cardSize, scale);
  const rowCounts = getRowCounts(config.layout);

  // Rows can have different slot counts (custom layout mode), so slot
  // indices are assigned by walking rows in order rather than a fixed stride.
  let slotIndex = 0;

  return (
    <div className="grid-display" ref={containerRef} style={{ padding: pxLayout.paddingPx }}>
      {pxLayout.rows.map((row, rowIndex) => {
        const rowSlotCount = rowCounts[rowIndex] ?? 0;
        const rowStartIndex = slotIndex;
        slotIndex += rowSlotCount;

        return (
          <div
            key={rowIndex}
            className="grid-display__row"
            style={{
              display: 'grid',
              gridTemplateColumns: row.gridTemplateColumns,
              columnGap: row.columnGapPx,
              marginBottom: rowIndex < pxLayout.rows.length - 1 ? row.rowGapPx : 0,
            }}
          >
            {Array.from({ length: rowSlotCount }, (_, colIndex) => {
              const assignmentIndex = rowStartIndex + colIndex;
              const cardId = slotAssignments[assignmentIndex] ?? null;
              const imageUrl = cardId ? (imageUrlById.get(cardId) ?? null) : null;
              return (
                <DroppableGridSlot
                  key={assignmentIndex}
                  slotIndex={assignmentIndex}
                  widthPx={pxLayout.cardWidthPx}
                  heightPx={pxLayout.cardHeightPx}
                  imageUrl={imageUrl}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
