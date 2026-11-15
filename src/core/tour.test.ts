import { shouldStartTour, TOUR_SEEN, tourSteps, type TourLayout } from './tour';

const LAYOUTS: TourLayout[] = ['phone', 'tablet', 'desktop'];

describe('tour steps', () => {
  it('runs the same steps in the same order on every layout', () => {
    const order = tourSteps('phone').map((step) => step.id);
    expect(order).toEqual(['welcome', 'timer', 'music', 'ambient', 'scenes', 'tasks', 'progress']);
    for (const layout of LAYOUTS) expect(tourSteps(layout).map((step) => step.id)).toEqual(order);
  });

  it('opens on a centered welcome and points every later step at its part', () => {
    for (const layout of LAYOUTS) {
      const [welcome, ...rest] = tourSteps(layout);
      expect(welcome.target).toBeNull();
      expect(welcome.title).toBe('Welcome to Wickglow');
      for (const step of rest) expect(step.target).toBe(step.id);
    }
  });

  it('mentions streaming links only on desktop, where streaming lives', () => {
    const music = (layout: TourLayout) => tourSteps(layout).find((step) => step.id === 'music')!.body;
    expect(music('desktop')).toMatch(/streaming link/);
    expect(music('tablet')).not.toMatch(/streaming/);
    expect(music('phone')).not.toMatch(/streaming/);
  });

  it('names the phone and tablet picker Mood and the desktop one Scenes', () => {
    const title = (layout: TourLayout) => tourSteps(layout).find((step) => step.id === 'scenes')!.title;
    expect(title('desktop')).toBe('Scenes');
    expect(title('tablet')).toBe('Mood');
    expect(title('phone')).toBe('Mood');
  });
});

describe('shouldStartTour', () => {
  it('starts only when the device has nothing stored', () => {
    expect(shouldStartTour(null)).toBe(true);
    expect(shouldStartTour(TOUR_SEEN)).toBe(false);
  });

  it('does not start when storage could not be read', () => {
    expect(shouldStartTour(undefined)).toBe(false);
  });
});
