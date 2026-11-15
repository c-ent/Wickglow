import type { ImageSourcePropType } from 'react-native';

// The landing page's links and copy (roadmap #12). Kept apart from the layout
// so a link or a sentence changes in one place.

/**
 * The Android APK download. Placeholder until the owner sends the Google Drive
 * share link (set to "Anyone with the link"). Replace this one line.
 */
export const APK_URL = 'https://drive.google.com/';

export const APP_VERSION = '1.0.0';

export const SOURCE_URL = 'https://github.com/c-ent/Wickglow';

/**
 * The desktop screenshots in the gallery, in order; the first is shown first.
 * They are web-sized copies (WebP) of the originals in
 * `assets/images/screenshots/`, and the gallery window takes their exact shape
 * (1920 x 911, a ratio of about 2.11). To change one, replace its file in
 * `assets/landing/` and keep `ratio` (width / height) matching; all slides must
 * share the same ratio.
 */
export type GallerySlide = {
  id: string;
  /** Short name on the slide's tab under the window. */
  label: string;
  /** One line under the tabs while the slide is shown. */
  caption: string;
  source: ImageSourcePropType;
  alt: string;
  ratio: number;
};

/** The address shown in the gallery window's title bar. */
export const GALLERY_ADDRESS = 'wickglow.vercel.app';

export const GALLERY: readonly GallerySlide[] = [
  {
    id: 'meadow',
    label: 'Pixel art',
    caption: 'Pick a scene to study in, like a rainy pixel-art meadow.',
    source: require('@/assets/landing/desktop.webp') as ImageSourcePropType,
    alt: 'Wickglow on desktop: a 25:00 timer over a rainy pixel-art meadow, with the Scenes picker open',
    ratio: 1600 / 759,
  },
  {
    id: 'moonlit',
    label: 'Moonlit',
    caption: 'A big, quiet timer over a moonlit night with falling rain.',
    source: require('@/assets/landing/desktop-3.webp') as ImageSourcePropType,
    alt: 'Wickglow on desktop: a 25:00 focus timer over a dark blue Moonlit scene with falling rain',
    ratio: 1600 / 759,
  },
  {
    id: 'music',
    label: 'Music',
    caption: 'Play the built-in lofi playlist, or paste a Spotify, YouTube or Apple Music link.',
    source: require('@/assets/landing/desktop-2.webp') as ImageSourcePropType,
    alt: 'Wickglow on desktop with the Music panel open: the lofi playlist beside a pasted Spotify playlist',
    ratio: 1600 / 756,
  },
];

/** The phone screenshot, shown beside the Android download. */
export const PHONE_SHOT = {
  source: require('@/assets/landing/mobile.webp') as ImageSourcePropType,
  alt: 'Wickglow on a phone: a lit candle above a 24:59 focus timer, with the Pause button',
  ratio: 374 / 816,
};

/** The slim bar under the hero: four short promises, each with a small icon. */
export type StripIconName = 'check' | 'shield' | 'user' | 'bell';

export const STRIP_ITEMS: readonly { icon: StripIconName; label: string }[] = [
  { icon: 'check', label: 'Free' },
  { icon: 'shield', label: 'No ads, no tracking' },
  { icon: 'user', label: 'No account needed' },
  { icon: 'bell', label: 'No harsh alarm, just a soft chime' },
];

/**
 * The "What's inside" cards. Each one sits in the bento grid with a picture drawn
 * by the app's own components (see `app-pieces.tsx`, with sample values).
 */
export const BENTO = {
  candle: {
    badge: 'Candle on Android',
    title: 'A Pomodoro timer with a candle',
    body: 'Focus, short break and long break. The candle burns down as the session runs, and the time stays right even while your phone sleeps.',
    times: ['25:00', '12:30', '02:30'],
  },
  xp: {
    title: 'XP, levels and streaks',
    body: 'Every focus minute earns XP. Keep a daily streak going and finish three small quests each day.',
  },
  tasks: {
    title: 'Tasks to focus on',
    body: 'Add tasks with due dates and subtasks, then pick one to keep under the timer while you work.',
  },
  sounds: {
    title: 'Lofi and ambient sounds',
    body: 'Fourteen lofi tracks and nine ambient loops to mix, from rain to a fireplace to a café. Add your own music on Android.',
  },
  calendar: {
    title: 'See your study time',
    body: 'A month calendar shades each day by the minutes you studied, next to your last seven days.',
  },
  sync: {
    title: 'Your progress on every device',
    body: 'An optional account, with email or Google, keeps XP, streaks, tasks and history in sync. Everything works without one.',
  },
} as const;

/**
 * The four sample widgets floating around the hero. They are decoration drawn
 * from the app's own pieces, not live data: the numbers are examples. The level
 * widget reads `SAMPLE_LEVEL` (`web-helpers.ts`), the same sample as the bento card.
 */
export const HERO_SAMPLE = {
  time: '25:00',
  timeCaption: 'FOCUS · 1 OF 4',
  streakTitle: 'Daily streak',
  streakCaption: '3 quests today',
  mixLabel: 'AMBIENT MIX',
  mix: 'Rain · Fireplace · Café',
} as const;
