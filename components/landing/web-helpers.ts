import { useSyncExternalStore } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { levelInfo } from '@/src/core/xp';

// Small helpers the landing page files share.

function subscribe() {
  return () => {};
}

/**
 * False on the server render, true in the browser. Pieces that depend on the
 * window or animate draw only once this is true, so the static HTML and the
 * browser's first render match.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** Web-only CSS that React Native's style types do not list (gradients, clamp sizes, transitions). */
export function web(style: object): ViewStyle & TextStyle {
  return style as ViewStyle & TextStyle;
}

/**
 * The sample level every landing picture shows: 1092 total XP, which the app's
 * own rules make Level 6 with 92 of 350 XP into it. Derived, not typed, so a
 * change to the XP curve updates every picture together.
 */
export const SAMPLE_LEVEL = levelInfo(1092);
