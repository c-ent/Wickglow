import { colors, fade } from '@/src/theme/tokens';

// Colours that only the landing page uses. The page is a darker, near-black
// violet than the app's Amber scene, with the Amber flame as the only accent
// (owner's design, 2026-11-15). Everything else comes from `src/theme/tokens`.
export const land = {
  bg: '#0B0812',
  /** The faint violet haze at the top left of the page. */
  haze: '#3A2370',
  card: fade('#FFFFFF', 0.04),
  cardEdge: fade('#FFFFFF', 0.09),
  cardSolid: '#14111C',
  tile: fade(colors.accent, 0.14),
  accent: colors.flame2,
  accentSoft: colors.accent,
  /** Candle wax in the feature pictures. */
  waxLight: '#F6EBD3',
  waxDark: '#D6C5A1',
  /** The three dots in a window's title bar. */
  dotClose: '#FF5F57',
  dotMin: '#FEBC2E',
  dotMax: '#28C840',
  /** Primary button gradient, light to deep. */
  buttonTop: '#FFC275',
  buttonBottom: '#FF9438',
} as const;
