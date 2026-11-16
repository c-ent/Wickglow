# Completed work

What Wickglow has shipped, one line per feature. The detail of each change is in git history; current behaviour is in `spec.md`, `architecture.md` and `ui.md`.

## Foundation

- Expo SDK 58 app with strict TypeScript, ESLint, Expo Router and Jest (`jest-expo`); Android and web from one codebase, renamed from LumiFi to Wickglow on 2026-11-10.
- Code grouped by feature: three layout shells in `screens/`, product concepts in `features/`, persistence and platform code in `domain/`, pure rules in `src/core/`, Firebase in `src/data/`.
- Theme tokens in `src/theme/tokens.ts`; seven moods (Amber default, Moonlit, Rose, Violet, Ash, Forest, Tide) shared by phone, tablet and desktop.
- Lucide icons through `shared/icons.tsx`; Zod validation at the save and Firestore boundaries.
- App icon, adaptive icon, splash and favicon rendered from `assets/images/logo.svg`.
- Layouts: phone under 600, tablet split view from 600 to 840, desktop scene above; a turned phone or tablet keeps the split view.

## Timer and session end

- Focus, short break and long break; presets 25/5/15, 50/10/20 and 90/20/30 plus custom lengths; a long break after every fourth focus session; optional auto-start.
- Remaining time is `endAt - now`, saved and restored across restarts; a deadline that passed while closed completes once.
- One session-end notification at `endAt` on the `session-end` channel, rescheduled on every pause, resume, reset, skip and mode change; works with the phone locked.
- Gentle end: the flame dims, a soft chime plays, and one encouraging line shows with Start break and Later.
- Music at session end: keep playing, lower the volume (default) or fade out.
- Focus fade (zen) hides the interface during focus and wakes on touch, mouse or key.

## Tasks

- Tasks with optional due dates (Android date picker), subtasks, a focused task shown under the timer, and a session count per task.
- Lists draw only the rows on screen on every layout.

## Progression

- 2 XP per focus minute, a level curve with six titles (Novice to Archmage), and a daily streak that needs a session of at least 10 minutes.
- Three daily quests (4 sessions, 60 minutes, 1 task) that pay once a day and are taken back if a task is reopened.
- Stats: today's minutes and sessions, a 7-day chart, and a month calendar shaded in four steps.

## Music and sound

- 14 bundled lofi tracks (Pixabay) with seek, volume and repeat; plays with the screen off.
- Own music files on Android, copied into the app and played offline.
- Nine ambient loops (CC0) with their own sliders; rain, embers, fireflies and waves show on screen.
- Streaming links (Spotify, YouTube, YouTube Music, Apple Music) in the desktop web layout, playing in each service's own player.
- Bundled audio re-encoded to Opus 32 kbps (about 9.7 MB in all).

## Scenes

- Desktop scenes: gradient tints, two pixel-art videos and five video scenes, all cleared (`BACKGROUND_LICENSES.md`).
- Rainy Cabin is bundled; the others are served from the website and downloaded on Android when picked; retired downloads are deleted on launch.
- The old background stays on screen until the new one is ready, with a loading cue.

## Accounts and sync

- Optional accounts with Firebase: email sign-in, sign-up, reset and verification, and Google sign-in on web and Android.
- Progress syncs as records in `users/{uid}/records`; XP, level and streak are rebuilt from them on every device. Each device reads only what is new.
- First sign-in asks "Keep which progress?" when both sides have progress.
- Sign-out clears progress from the device, keeps settings, and resets a running session first.
- Firestore rules bound every write and are tested on the emulator (`npm run test:rules`).
- Account deletion by email request, with a page at `/delete-account`.
- Browser tabs stay in step through the `storage` event.

## Layouts and onboarding

- Phone: candle home screen with a fixed glass tab bar (Tasks, Sounds, Stats, Mood, Timer) opening each section as a sheet.
- Tablet: timer beside a side column of sections.
- Desktop: full-screen scene, large timer, dock, and cards for Music, Ambient mixer, Scenes, Tasks, Quests, Progress and Timer settings; the Music dock button shows what is playing.
- First-run tour on every layout that opens each panel as it explains it, with Show tour again in Timer settings; a real modal on the web.
- Keyboard handling on Android and the web, so cards and sheets stay above the keyboard.

## Web

- Landing page at `/` with the hero, gallery, feature cards and the Android download; the web app at `/app`; returning visitors skip to `/app`.
- Privacy policy at `/privacy`, account deletion page at `/delete-account`; deployed on Vercel at <https://wickglow.vercel.app>.
- "About Wickglow" link in Timer settings opens the landing page in a new tab.

## Quality

- Code audit findings H1–H6, M1–M8, C1 and the best-practice fixes B1–B6 are fixed (`docs/issues.md`).
- No backward compatibility: one save format, one Firestore record format.
- `npm audit` at 0 through `overrides`; expo-doctor 20/20.
- 357 Jest tests and 22 rules tests pass; typecheck and the web export are clean.
- Checked on Android (phone and tablet) and desktop Chrome on 2026-11-14 and 2026-11-15, and the tour again in Chrome on 2026-11-16.
- User guide (`docs/user-guide.md`) and developer guide (`docs/developer-guide.md`).
