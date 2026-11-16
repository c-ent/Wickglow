# Wickglow

Calm lofi Pomodoro study app with XP and streaks. Android and web from one Expo codebase.

Try it in the browser at <https://wickglow.vercel.app>. The Android APK is linked from the same page.

## Requirements

- Node 22.13+, 24.3+ or 26. Odd-numbered Node versions are unsupported.
- An [EAS development build](https://docs.expo.dev/develop/development-builds/introduction/) or `npx expo run:android`. Background audio and notifications behave differently in Expo Go, so do not use it for testing.

## Setup

```bash
npm install
npx expo start
```

Add Expo packages with `npx expo install <pkg>`, not `npm install`, so versions match the SDK.

The Android and iOS folders are generated. Run `npx expo prebuild` instead of editing them by hand, and change `app.json` or `app.config.ts` for native config.

## Commands

| Task | Command |
| :--- | :--- |
| Dev server | `npx expo start` |
| Android device build | `npx expo run:android` |
| Web build | `npx expo export --platform web` |
| Typecheck | `npx tsc --noEmit` |
| Tests | `npx jest` |
| One test file | `npx jest path/to/file.test.ts` |
| Lint | `npx eslint .` |
| Dependency check | `npx expo-doctor@latest` |

Run the build, typecheck and tests before finishing a change.

## Project layout

- `app/`: Expo Router routes. Thin files that render a screen.
- `components/wickglow/`: the app UI, grouped by feature.
- `components/landing/`: the web landing page at `/` (the web app is at `/app`).
- `src/core/`: pure logic — timer math, XP, levels, streaks, quests. No React or Expo imports.
- `src/data/`: the only code that talks to Firebase (optional accounts and sync).
- `src/theme/`: color, font and radius tokens.
- `assets/audio/`: third-party audio. Read `MUSIC_LICENSES.md` before adding audio; every bundled file is covered there, and all of it is cleared.

## Documentation

- [`docs/user-guide.md`](docs/user-guide.md): how to use the app, for users.
- [`docs/developer-guide.md`](docs/developer-guide.md): how the code fits together, for contributors. Start here if you are new to the codebase.

Start with [`AGENTS.md`](AGENTS.md) for commands, conventions and boundaries. The design and planning docs live in [`docs/agent/`](docs/agent/):

- [`progress.md`](docs/agent/progress.md): current status. Read this first in a new session. Finished work is recorded in [`completed.md`](docs/agent/completed.md).
- [`spec.md`](docs/agent/spec.md): the v1 feature spec.
- [`roadmap.md`](docs/agent/roadmap.md): v2 and v3 plans.
- [`architecture.md`](docs/agent/architecture.md): data flow, storage, auth and folder boundaries.
- [`conventions.md`](docs/agent/conventions.md) and [`ui.md`](docs/agent/ui.md): code and UI rules.

## Third-party assets

All bundled audio is third-party and cleared for app distribution. The nine ambient loops and the two sound effects are CC0; the fourteen lofi tracks are Pixabay under the Pixabay Content License. Neither licence requires attribution or a credits screen, and both allow commercial use inside the app. Per-file licences are in [`MUSIC_LICENSES.md`](MUSIC_LICENSES.md) — read it before adding audio.

Every background video is cleared too (Pixabay, CraftPix, or the artist's written permission). Per-file records are in [`BACKGROUND_LICENSES.md`](BACKGROUND_LICENSES.md).
