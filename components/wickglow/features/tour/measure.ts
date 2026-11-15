import type React from 'react';
import type { View } from 'react-native';
import type { Rect } from './placement';

export type TourNode = React.ComponentRef<typeof View>;

// While a part slides or scrolls into place, it is measured every POLL_MS
// until it stops moving, for at most MAX_WAIT_MS.
const POLL_MS = 80;
const MAX_WAIT_MS = 1500;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves once `node` has stayed in the same place for one poll, or after MAX_WAIT_MS. */
export async function waitUntilStill(node: TourNode) {
  let last = (await measureInWindow(node))?.y;
  for (let waited = 0; waited < MAX_WAIT_MS; waited += POLL_MS) {
    await pause(POLL_MS);
    const now = (await measureInWindow(node))?.y;
    if (now === last && waited > 0) return;
    last = now;
  }
}

/** Where `node` is in the window, or null when it has no size (not laid out, or hidden). */
export function measureInWindow(node: TourNode): Promise<Rect | null> {
  return new Promise((resolve) => {
    try {
      node.measureInWindow((x, y, width, height) => {
        resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
      });
    } catch {
      resolve(null);
    }
  });
}
