# Conventions

Read this when unsure how something is done here. Only rules that the linter, formatter and tsconfig do not enforce. Timer, notification, audio, navigation and env rules are in `AGENTS.md`.

## Expo and React Native
- Animate with Reanimated on the UI thread. Do not drive animation with `setInterval` and state.
- Ask for the Android notification permission when the user starts their first session, after creating the notification channel. Do not ask on launch.
- Decide layout from `useWindowDimensions`, not from device type. Web uses the window width. On Android and iOS, a window whose shorter side is at most 840 never uses the desktop scene, so turning the device shows the tablet layout once the width is at least 600.
- Before importing a helper from `react-native`, check that `react-native-web` exports it. `react-native-web` trails `react-native`, so a name that exists on one can be `undefined` on web. `useAnimatedValue` is the known case and lives in `hooks/use-animated-value.ts`; if another is needed, add a local hook the same way. Typecheck passes either way, because `react-native`'s types declare the export, so check the browser or the exported bundle, not only `tsc`.

## Firebase
- Firebase calls throw (`FirebaseError` with a `code`) instead of returning an error value. Catch them in `src/data` and hand screens a plain result.
- Validate unknown input (Firestore documents, stored JSON) at the boundary. Do not add a validation library without asking.

## Data and storage
- Audio and other large files go in assets or file storage, not in database rows.
- No backward compatibility: Wickglow is a new app. Do not add migrations, legacy keys or ids, or code that reads an older save or record format. Change a format in place; validation that falls back on a bad or missing field is still fine. This covers the synced Firestore format too (day totals and session records without `day` were removed on 2026-11-15), but changing the rules is still a schema change: ask first.

## Packages and docs
- `npm audit` stays at 0 through the `overrides` in `package.json` (all for dev-only `firebase-tools`). Do not run `npm audit fix --force`: it downgrades `firebase` and `firebase-tools` to older majors. Drop an override once `firebase-tools` resolves it itself.
- Keep `docs/user-guide.md` and `docs/developer-guide.md` in step when a user-visible feature or the code layout changes.

## Comments
- Say why the code is the way it is, not what a standard React Native or React API does.
- No history in code comments: no dated notes, "used to", "was removed" or commit ids.
- Docs state facts plainly. No "(owner, date)", "owner confirmed" or "owner request" notes: who decided what goes in git history. A date stays only where it is part of the fact (when a record was removed, when a licence was checked).
- Remove leftover code (unused files, exports, constants) instead of leaving a note that it is unused.
