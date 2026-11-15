// The first-run tour (roadmap #13): the steps and their words, per layout.
// Pure data and rules, no React, so the copy and the "should it show" rule
// are tested on their own (tour.test.ts).

export type TourLayout = 'phone' | 'tablet' | 'desktop';

/** A part of the screen a step points at. Each layout marks its own. */
export type TourTarget = 'timer' | 'music' | 'ambient' | 'scenes' | 'tasks' | 'progress';

export interface TourStep {
  id: 'welcome' | TourTarget;
  /** What the step points at, or null for the centered welcome card. */
  target: TourTarget | null;
  title: string;
  body: string;
}

/** Stored on the device (never synced) once the tour is finished or skipped. */
export const TOUR_SEEN = 'seen';

/**
 * Whether to start the tour at launch. `stored` is the device's tour value:
 * null when nothing is stored, undefined when storage could not be read. A
 * failed read does not start it, so a browser that blocks storage is not
 * shown the tour on every visit.
 */
export function shouldStartTour(stored: string | null | undefined): boolean {
  return stored === null;
}

/** The tour for one layout, in order. Same steps everywhere; the words fit where each part lives. */
export function tourSteps(layout: TourLayout): TourStep[] {
  const phone = layout === 'phone';
  const desktop = layout === 'desktop';
  return [
    {
      id: 'welcome',
      target: null,
      title: 'Welcome to Wickglow',
      body: 'Focus sessions, calm music, and XP for showing up. Here is a quick look around.',
    },
    {
      id: 'timer',
      target: 'timer',
      title: 'Timer',
      body: 'Start a focus session here. Pause or skip any time.',
    },
    {
      id: 'music',
      target: 'music',
      title: 'Music',
      body: desktop
        ? 'Pick a lofi track or play your own files. Paste a streaming link to play it here.'
        : phone
          ? 'Open Sounds to pick a lofi track or play your own files.'
          : 'Pick a lofi track or play your own files.',
    },
    {
      id: 'ambient',
      target: 'ambient',
      title: 'Ambient sounds',
      body: phone
        ? 'Tap Ambient in Sounds to mix in rain, cafe and other sounds behind your music.'
        : 'Mix in rain, cafe and other sounds behind your music.',
    },
    {
      id: 'scenes',
      target: 'scenes',
      title: desktop ? 'Scenes' : 'Mood',
      body: desktop ? 'Change the view behind your timer.' : 'Change the look behind your timer.',
    },
    {
      id: 'tasks',
      target: 'tasks',
      title: 'Tasks',
      body: 'Add what you are working on, then pick one to focus on.',
    },
    {
      id: 'progress',
      target: 'progress',
      title: desktop ? 'Progress' : 'Stats',
      body: desktop
        ? 'Finish sessions to earn XP and keep your streak. Open these to see your progress.'
        : 'Finish sessions to earn XP and keep your streak.',
    },
  ];
}
