import { EDGE, GAP, placeCard, visibleRect } from './placement';

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

  it('falls back to the middle when no side has room', () => {
    expect(placeCard({ x: 0, y: 0, width: 400, height: 800 }, screen, card).side).toBe('center');
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
