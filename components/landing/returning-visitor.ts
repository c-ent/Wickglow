import { Platform } from 'react-native';
import { STORAGE_KEY } from '@/components/wickglow/domain/saved-state';

// On the web, `/` is the landing page and `/app` is the app. Someone who has
// used the web app before skips the landing page: a small script in the page
// head (see `app/+html.tsx`) sends them from `/` to `/app` before anything is
// drawn, so the landing page never flashes. Search engines do not have the
// mark, so they always see the landing page.
//
// The mark is set when `/app` opens. Visitors from before the mark existed are
// recognised by the app's own saved state. The
// script also runs on `/download`, the landing page's first address, which
// otherwise redirects to `/` inside the page, after this script has run.
// `/?home` shows the landing page anyway. Query and hash are carried over.

/** Set in this browser once the web app has been opened. */
export const APP_VISITED_KEY = 'wickglow:app-visited';

export const APP_PATH = '/app';

/** The addresses that show the landing page, so the ones a returning visitor skips. */
const LANDING_PATHS = ['/', '/download'];

/** Inline script for the page head. Plain ES5, wrapped in try: storage can be blocked. */
export const RETURNING_VISITOR_SCRIPT = `try{var s=window.localStorage,p=location.pathname.replace(/\\/+$/,'')||'/';if(${JSON.stringify(LANDING_PATHS)}.indexOf(p)>=0&&!/[?&]home(=|&|$)/.test(location.search)&&(s.getItem('${APP_VISITED_KEY}')||s.getItem('${STORAGE_KEY}'))){location.replace('${APP_PATH}'+location.search+location.hash)}}catch(e){}`;

/** Marks this browser as a returning visitor. Call when the web app opens. */
export function markAppVisited(): void {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(APP_VISITED_KEY, '1');
  } catch {
    // Storage blocked (private window, site data off): they see the landing page next time.
  }
}
