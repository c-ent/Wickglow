// Where the tour's highlight and card go. Pure geometry, no React, so it is
// tested on its own (placement.test.ts). All values are window coordinates.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type CardSide = 'below' | 'above' | 'left' | 'right' | 'center';

/** The order sides are tried in. The tablet tries left first, so the card sits over the timer column, beside the part. */
export const DEFAULT_SIDES: readonly CardSide[] = ['below', 'above', 'left', 'right'];

export interface CardPlace {
  left: number;
  top: number;
  side: CardSide;
}

/** Room kept between the card and the window edge, and between the card and the highlight. */
export const EDGE = 16;
export const GAP = 14;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * The part of `rect` inside the window, grown by `pad` on every side (and
 * clipped again). A target taller than the window, such as a long tablet
 * section, is cut to what shows. Null when nothing of it is on screen.
 */
export function visibleRect(rect: Rect, screen: Size, pad = 0): Rect | null {
  const left = Math.max(0, rect.x - pad);
  const top = Math.max(0, rect.y - pad);
  const right = Math.min(screen.width, rect.x + rect.width + pad);
  const bottom = Math.min(screen.height, rect.y + rect.height + pad);
  if (right - left < 1 || bottom - top < 1) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Places the card beside the highlight, on the first side in `sides` with
 * room (by default below it, then above, then to its left or right);
 * otherwise (or with no highlight) the card sits in the middle of the window.
 * The card never runs off the window.
 */
export function placeCard(target: Rect | null, screen: Size, card: Size, sides: readonly CardSide[] = DEFAULT_SIDES): CardPlace {
  const maxLeft = Math.max(EDGE, screen.width - EDGE - card.width);
  const maxTop = Math.max(EDGE, screen.height - EDGE - card.height);
  const center: CardPlace = {
    left: clamp((screen.width - card.width) / 2, EDGE, maxLeft),
    top: clamp((screen.height - card.height) / 2, EDGE, maxTop),
    side: 'center',
  };
  if (!target) return center;

  const centeredLeft = clamp(target.x + target.width / 2 - card.width / 2, EDGE, maxLeft);
  const sideTop = clamp(target.y, EDGE, maxTop);
  for (const side of sides) {
    if (side === 'below') {
      const top = target.y + target.height + GAP;
      if (top + card.height <= screen.height - EDGE) return { left: centeredLeft, top, side };
    } else if (side === 'above') {
      const top = target.y - GAP - card.height;
      if (top >= EDGE) return { left: centeredLeft, top, side };
    } else if (side === 'left') {
      const left = target.x - GAP - card.width;
      if (left >= EDGE) return { left, top: sideTop, side };
    } else if (side === 'right') {
      const left = target.x + target.width + GAP;
      if (left + card.width <= screen.width - EDGE) return { left, top: sideTop, side };
    }
  }
  return center;
}
