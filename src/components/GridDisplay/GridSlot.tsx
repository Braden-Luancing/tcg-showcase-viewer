/** A single card-sized cell in the grid display; shows an image if a card is assigned, otherwise an empty placeholder. */

import type { CSSProperties } from 'react';

interface GridSlotProps {
  widthPx: number;
  heightPx: number;
  imageUrl: string | null;
}

export function GridSlot({ widthPx, heightPx, imageUrl }: GridSlotProps) {
  const style: CSSProperties = { width: widthPx, height: heightPx };

  return (
    <div className={imageUrl ? 'grid-slot grid-slot--filled' : 'grid-slot grid-slot--empty'} style={style}>
      {imageUrl && <img src={imageUrl} alt="" className="grid-slot__image" />}
    </div>
  );
}
