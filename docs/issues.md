# Code audit

Findings from the code audit of 2026-11-11, with the follow-up architecture and best-practice review. Every finding is fixed. The detail of each fix is in git history.

## Critical

| ID | Finding | Fix |
| :--- | :--- | :--- |
| C1 | Uncleared videos were selectable in the scene picker | Every video is cleared by Pixabay, CraftPix or the artist's written permission, or removed (`BACKGROUND_LICENSES.md`). Fixed 2026-11-15 |

## High

| ID | Finding | Fix |
| :--- | :--- | :--- |
| H1 | Start computed the deadline before the notification permission work | Start commits the session first and schedules the alarm only if that run is still current (`isSameRun`) |
| H2 | Auto-start left the music lowered or stopped | An auto-started phase gets the same music a manual start gives it |
| H3 | Every context consumer re-rendered four times a second | The clock publishes only when the second on screen changes, in its own context (`useWickglowClock`) |
| H4 | Every slider tick wrote the whole save | `domain/save-queue.ts`: timer changes write at once, the rest 300 ms after the last change |
| H5 | Eleven audio players were created at launch | Ambient players are built the first time a slider goes above zero |
| H6 | One test failed | `bgControl` test and `ui.md` match the token (20%) |

## Medium

| ID | Finding | Fix |
| :--- | :--- | :--- |
| M1 | Two competing ways to write state | `domain/saved-store.ts` is the one writer |
| M2 | Progress used the setting, not the session's own length | Progress reads the session's `totalMs` |
| M3 | Some saved fields were not validated; no error boundary | `parseSavedState` validates every field and drops unknown keys; `app/index.tsx` exports an `ErrorBoundary` |
| M4 | Picked music files were stored twice | The cache copy is deleted after the file is copied in |
| M5 | Notification channels were rebuilt on every Start | Set up once per run, retried on the next Start if it fails |
| M6 | Exact-alarm permissions | `SCHEDULE_EXACT_ALARM` capped at API 32 (`plugins/with-exact-alarm-max-sdk.js`); the Play declaration is step 7 of the Play steps in `progress.md` |
| M7 | A failed embed opened another app without being asked | A failed embed shows an "Open link" button |
| M8 | Small cleanups | Stale comments, unused helpers and outdated architecture notes removed; `.env` ignored |

## Architecture

| ID | Finding | Fix |
| :--- | :--- | :--- |
| A1 | Session transitions wired by hand in the provider | `domain/session-run.ts` owns every timer change |
| A2 | Four refs tracked which player owns the sound | `src/core/music-source.ts` decides it |
| A3 | Saving spread over the provider | Saving lives in `domain/saved-store.ts` and `save-queue.ts` |
| A4 | The three shells repeated the same session rules | The rules live in one place; shells only arrange panels |
| A5 | No single list of ambient sounds | `AMBIENT_SOUNDS` in `src/core/ambient.ts` |
| A6 | Pass-through modules and timer limits typed twice | Pass-throughs removed; limits defined once (`MAX_MINUTES`) |

## Best practices

| ID | Finding | Fix |
| :--- | :--- | :--- |
| B1 | Components read one context object rebuilt every render | Stable actions (`useStableActions`), a memoised value and a separate clock context |
| B2 | Lists were not virtualised | Track and task lists draw only the rows on screen (`@shopify/flash-list`) |
| B3 | Fonts loaded at runtime | Fonts embedded at build time through the `expo-font` plugin |
| B4 | Styling details | Corners use `rounded()`; a dead `shadowColor` removed |
| B5 | `react-native` `Image` for thumbnails | Scene thumbnails use `expo-image` |
| B6 | The stream embed slot was measured a frame late | Measured in a layout effect |
