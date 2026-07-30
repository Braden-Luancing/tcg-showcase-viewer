import { useEffect, useRef, useState } from 'react';

const MAX_SCALE = 12; // px per mm safety cap, avoids absurd sizes on very wide containers

/**
 * Derives a px-per-mm scale factor from an observed container width and a
 * known "natural" (unscaled) grid width in mm. The container ref must be
 * attached to the element whose width should drive the scale.
 */
export function useMmToPx(naturalWidthMm: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || naturalWidthMm <= 0) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      const nextScale = Math.min(MAX_SCALE, width / naturalWidthMm);
      setScale(nextScale > 0 ? nextScale : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [naturalWidthMm]);

  return { containerRef, scale };
}
