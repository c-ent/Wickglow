// Native half of the preload pair; web uses `preload-track.web.ts`, which has
// to swap the element onto a fetched copy. Native players stream once told to
// play, so a plain preload is enough here.

import { preload } from 'expo-audio';

/** Warms the audio cache for a track that is not playing yet. */
export function preloadTrack(uri: number | string): Promise<void> {
  return preload(uri);
}
