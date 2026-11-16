import { dimPieces, EDGE, GAP, placeCard, visibleRect } from './placement';

describe('dimPieces', () => {
  const area = (pieces: { width: number; height: number }[]) => pieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);

  it('covers the whole window with no holes', () => {
    expect(dimPieces([], { width: 400, height: 800 })).toEqual([{ x: 0, y: 0, width: 400, height: 800 }]);
  });

  it('leaves out every hole and covers the rest exactly', () => {
    const holes = [
      { x: 20, y: 100, width: 300, height: 400 },
      { x: 20, y: 700, width: 40, height: 40 },
    ];
    const pieces = dimPieces(holes, { width: 400, height: 800 });
    expect(area(pieces)).toBe(400 * 800 - 300 * 400 - 40 * 40);
    for (const piece of pieces) {
      for (const hole of holes) {
        const overlapX = Math.min(piece.x + piece.width, hole.x + hole.width) - Math.max(piece.x, hole.x);
        const overlapY = Math.min(piece.y + piece.height, hole.y + hole.height) - Math.max(piece.y, hole.y);
        expect(overlapX > 0 && overlapY > 0).toBe(false);
      }
    }
  });

  it('handles holes that overlap', () => {
    const holes = [
      { x: 0, y: 0, width: 200, height: 200 },
      { x: 100, y: 100, width: 200, height: 200 },
    ];
    expect(area(dimPieces(holes, { width: 400, height: 400 }))).toBe(400 * 400 - (200 * 200 * 2 - 100 * 100));
  });
});

const screen = { width: 400, height: 800 };
const card = { width: 300, height: 160 };

describe('placeCard', () => {
  it('centers the card when there is nothing to point at', () => {
    expect(placeCard(null, screen, card)).toEqual({ left: 50, top: 320, side: 'center' });
  });

  it('puts the card under a target near the top', () => {
    const place = placeCard({ x: 300, y: 20, width: 80, height: 36 }, screen, card);
    expect(place.side).toBe('below');
    expect(place.top).toBe(20 + 36 + GAP);
    // Centered on the target would run off the right edge, so it is held in.
    expect(place.left).toBe(screen.width - EDGE - card.width);
  });

  it('puts the card above a target near the bottom, like a tab bar', () => {
    const place = placeCard({ x: 160, y: 720, width: 60, height: 56 }, screen, card);
    expect(place).toEqual({ left: 40, top: 720 - GAP - card.height, side: 'above' });
  });

  it('puts the card beside a target too tall for above or below', () => {
    const wide = { width: 800, height: 600 };
    const place = placeCard({ x: 420, y: 10, width: 360, height: 580 }, wide, card);
    expect(place).toEqual({ left: 420 - GAP - card.width, top: EDGE, side: 'left' });
  });

  it('tries the sides in the order given', () => {
    const wide = { width: 800, height: 600 };
    const place = placeCard({ x: 420, y: 100, width: 360, height: 40 }, wide, card, ['left', 'below']);
    expect(place).toEqual({ left: 420 - GAP - card.width, top: 100, side: 'left' });
  });

  it('puts the card against the roomier window edge when no side has room', () => {
    // Screen 400 wide: the target leaves 40 on its left and 10 on its right.
    expect(placeCard({ x: 40, y: 100, width: 350, height: 700 }, screen, card)).toEqual({ left: 16, top: 100, side: 'edge' });
    expect(placeCard({ x: 10, y: 100, width: 350, height: 700 }, screen, card)).toEqual({ left: 84, top: 100, side: 'edge' });
  });

  it('moves the edge card off a second highlight', () => {
    const avoid = { x: 300, y: 90, width: 80, height: 40 };
    expect(placeCard({ x: 10, y: 100, width: 350, height: 700 }, screen, card, undefined, avoid)).toEqual({ left: 84, top: 90 + 40 + GAP, side: 'edge' });
  });
});

describe('visibleRect', () => {
  it('grows the rect by the padding', () => {
    expect(visibleRect({ x: 50, y: 50, width: 100, height: 40 }, screen, 6)).toEqual({ x: 44, y: 44, width: 112, height: 52 });
  });

  it('cuts a rect that runs past the window to what shows', () => {
    expect(visibleRect({ x: 200, y: 600, width: 300, height: 900 }, screen)).toEqual({ x: 200, y: 600, width: 200, height: 200 });
  });

  it('is null for a rect fully off screen', () => {
    expect(visibleRect({ x: 0, y: 900, width: 100, height: 40 }, screen)).toBeNull();
  });
});
