# Progress

Read at the start of every session. Update after each meaningful change. Keep it short: what is current, what is open, and what still needs checking. Finished work goes in [completed.md](completed.md).

## Current phase

v2

## Current feature

First-run tour (roadmap #13), started 2026-11-15 (owner). The landing page (#12) is done (owner, 2026-11-15) apart from the APK link. The Google Play release steps are owner tasks.

## Current goal

New users see a short tour that points at the timer, music, ambient sounds, mood or scenes, tasks and progress on phone, tablet and desktop. Ship Wickglow on Google Play after that.

## Not yet completed

- First-run tour (current), built 2026-11-15. See roadmap #13 and Still to check.
- Landing page APK link (roadmap #12, open question 1 below).
- Google Play release. See Google Play deployment.
- EAS preview and production environments have no Firebase vars yet (only development does), so a `preview` APK build cannot reach Firebase until the seven vars are ticked for both on expo.dev. See `docs/feature/firebase.md`, Owner tasks.
- Review fixes 2026-11-15: no session can start while a sign-out runs, and sign-out stops when storage could not be read at launch. A state taken from another tab keeps that tab's task edit times. Gallery arrows keep counting past either end. Privacy policy: removed the wrong Android streaming sentence. Pixabay licence note now covers lightly changed copies.
- Landing gallery 2026-11-15: the pixel-art meadow (`desktop.webp`) is now the first slide. The third slide is a new Music panel shot (`desktop-2.webp`, from the new `screenshots/desktop-2.png`) and replaces the Amber one. The phone shot beside the Android download (`mobile.webp`) is the new `screenshots/mobile.png`. The second slide is now a Tasks panel shot (`desktop-3.webp`, 1600x760, from the owner's new PNG) and replaces the Moonlit one.
- Landing hero glow 2026-11-15: the Amber glow behind the hero is bigger (1500x1000, from under the nav to the gallery heading) and a little brighter, so it lights the whole hero.
- C1 fixed 2026-11-15: every video left is cleared, and Night Hills was removed. See `BACKGROUND_LICENSES.md`. The landing page now waits only on the APK link.
- App to landing page link 2026-11-15 (owner): web only, a quiet "About Wickglow" link as the last line of Timer settings (phone Timer tab, tablet side column, desktop settings card). It opens `/?home` (`LANDING_HOME_PATH`) in a new tab, so the returning-visitor script does not send it back and a running session keeps going.

## Open questions

Landing page (roadmap #12). Built 2026-11-15. Moved the same day (owner): the landing page is `/` on the web and the web app is `/app`; returning visitors skip to `/app`; `/download` redirects to `/`. Android still opens the app at `/`. See roadmap #12. Waiting on the owner for item 1; item 2 is done:

1. The Google Drive share link for the APK (set to "Anyone with the link"). Replace `APK_URL` in `components/landing/content.ts`; it is a placeholder (`https://drive.google.com/`) until then. Drive shows a "can't scan for viruses" page before files over about 100MB download, so the button may land there first.
2. Screenshots are in (2026-11-15): WebP copies in `assets/landing/`, made from `assets/images/screenshots/` (about 80KB instead of 1.8MB), shown by `GALLERY` (three desktop shots in a Mac-style window) and `PHONE_SHOT` (beside the download) in `content.ts`. Replace a file in `assets/landing/` to change one. Gallery redesigned 2026-11-15: on the same 1040 column as the other sections (first built at 1200; narrowed the same day so its edges line up), browser title bar with an address pill (`GALLERY_ADDRESS`), warm glow under the window, scene tabs plus a per-slide `caption` instead of dots.

Sign-out with a session running: decided 2026-11-15 (owner), built. Signing out resets a running or paused session to idle and cancels its alarm (the Reset button's `run.reset`) before the device is cleared, so a session begun under one account can never finish into the next account's progress.

Review fixes 2026-11-15: landing previews built from app buttons (tasks, calendar) are `inert`; a gallery tab press clears a pending arrow target; `adopt` (another tab's save) becomes the save queue's saved state and drops a waiting retry, a late failure of an older write, and a waiting local edit (the store shows the adopted state, so what is written matches what is shown); a `storage` event is only taken while storage still holds its value, so an old event cannot undo a newer local commit (`domain/other-tab.ts`); sign-out waits for the cleared state to be written and does not sign out (toast) if it fails; a change of account drops a waiting sign-out, and a sign-out overtaken while the device clears does not sign out (sync restarts if the same account is still signed in and no other sign-out runs); on a phone or tablet a task's controls wrap under the title rather than squeezing it below 120; the user guide and privacy policy say subtasks sync (their shown/hidden state stays local) and name streaming and scene downloads as the network exceptions without an account; a session record's day must be a real, unpadded `calendarKey` day.

## Google Play deployment

Work for the owner, in order:

1. **Privacy policy URL.** Deployed at `https://wickglow.vercel.app/privacy`. Paste it into the Play Console privacy policy field.
2. **Account deletion page.** Check that `https://wickglow.vercel.app/delete-account` loads. Play requires a web link for account deletion requests.
3. **Store listing.** App name: Wickglow. Icon: done. Still to add: short description, full description, feature graphic (1024×500), and at least two phone screenshots.
4. **Data Safety form.** Declare what the app collects: sign-in email and name (optional), and saved progress for accounts; nothing else. Check the answers against the privacy policy before submitting.
5. **Content rating questionnaire.**
6. **Target audience.** 13+ age groups only, and "No" to appealing to children.
7. **Permissions declaration.** The app declares `SCHEDULE_EXACT_ALARM` and `USE_EXACT_ALARM` (session-end alarm) and a media playback foreground service. Google may ask why the exact-alarm permissions are needed. Check the declaration before submitting.
8. **Background licences** (`BACKGROUND_LICENSES.md`). Done 2026-11-15: every video in the app is cleared (Pixabay, CraftPix, or Abi Toads' permission). Keep screenshots of Abi's message.
9. **Release build.** The APK for testing is installed. For Play, build an `.aab` with `eas build --platform android` (production profile). Test that build on a device, because a debug build does not show R8 problems.
10. **Closed test.** 12 testers opted in for 14 consecutive days (personal accounts created after 13 November 2023). Start it as soon as the release build is ready.
11. **Production access.** Apply after the closed test has run 14 days.
12. **Submit.** Run `eas submit` to production.
13. **Create the Play Console developer account** ($25 one time, identity verification can take a few days). Steps 3 to 12 happen in that account, so it has to exist first in practice, even though it is listed last.

APK builds until then: `eas build --platform android --profile preview` (sideloadable APK, same EAS keystore Play will use, so do not delete it). EAS pins Node 24.12.0. If your npm config has `legacy-peer-deps=true`, remove it (`npm config delete legacy-peer-deps`) or `npm ci` on EAS fails. EAS project: `@cent_1214/wickglow`. The 13 Expo patch updates (2026-11-14) changed native modules, so the next APK needs a fresh EAS build.

## Next up

None right now.

## Still to check

- Android date picker (2026-11-15, owner approved the dependency): `@react-native-community/datetimepicker` 9.2.1 via `npx expo install`, with its config plugin in `app.json`. The add form and each task row show a calendar button that opens the system date dialog (`features/tasks/due-picker.android.ts`; OK sets the day, Clear removes it, Cancel leaves it). It is native code, so it needs a new EAS build; check there that picking, changing and clearing a date work and that the day does not shift. `expo-doctor` passes 20/20.
- Task list speed and synced subtasks (2026-11-15, owner report: Android lagged with 20 tasks and about 80 subtasks, and synced subtasks were hidden). Each task row is a memoized `TaskItem`, and every layout now draws only the task rows on screen (FlashList): the phone Tasks tab and the desktop Tasks card use `TaskScroller` (the desktop card has a set height, up to 720, for this), and the tablet column has its tasks as the first rows of `SoundsScroller` (`lead`). Also and the new-task and subtask drafts live in their own row, so typing or changing one task redraws only that row. A subtask new from the account opens its parent's list (`reconcile` in `src/core/sync.ts`), as adding one on the device does. Tasks synced before this change stay closed until tapped once. Check on the Android build that opening Tasks, typing and ticking feel quick with a long list, on phone and tablet, and that the tablet tour still finds the Tasks section.
- Desktop cards (2026-11-15, owner): Tasks is up to 750 wide, and Progress, Quests and Tasks scroll inside the card under a fixed heading, so the scrollbar sits inside the card and the bottom corners stay rounded. Phone tour: the Ambient step opens Sounds on Ambient and points at the Ambient button. "Show tour again" sits right of "About Wickglow" on one line. Not yet looked at in a browser.
- First-run tour (2026-11-15): checked in a browser at desktop, phone (390 wide) and tablet (760 wide) widths: every step finds its part, the tablet columns scroll to it, Done and Skip store `wickglow:tour` and it does not return, and "Show tour again" starts it. Still to check on an Android build: the highlight sits on each tab (Android measures in window coordinates under the status bar), and the tablet layout in landscape.
- Retired scene clean-up (2026-11-15, from a code review): on launch the app deletes downloaded scenes no longer in `VIDEOS` or `PIXEL_ART` (`removeRetiredScenes`). On a phone that had the old Cyberpunk Desk or Night Hills downloaded, check they are gone and the other downloads stay.

Everything else was checked by the owner on 2026-11-15: two-device sync, ambient sounds with the screen off, own music files (no duplicate copy), timer controls, music source switching, the Scenes panel, the landing page at phone width, the desktop stream player and the tablet side column spacing.

## Tooling notes

- Clean-up (2026-11-15): code comments reviewed (outdated ones fixed, tutorial-style and "(owner, date)" notes removed); leftovers removed (`task-panel.tsx`, `streamCardHeight`); all backward compatibility removed (Lumifi save key and alarm id, old notification channels, the no-log and `videoBg: true` save conversions). Rules for both are in `conventions.md`. Firestore (owner, 2026-11-15): `d_` day-total records removed, and `day` is required on every session record, in the code, the rules and the rules tests (22 pass in the emulator). **Owner task: redeploy the rules** (`npm run deploy:rules`). Day totals and sessions without `day` already in the account are ignored from now on, so XP, streak and calendar lose that history.

- Docs (2026-11-15): added `docs/user-guide.md` (for users) and `docs/developer-guide.md` (for contributors; links to the agent docs instead of copying them), linked from `README.md`. Keep both in step when a user-visible feature or the code layout changes.

- `npm audit` reports 0 vulnerabilities through the `overrides` in `package.json` (`@grpc/grpc-js`, `uuid`, `re2`, `@opentelemetry/core`, `glob`), all transitive copies in dev-only `firebase-tools`; the app bundle is unaffected. Do not run `npm audit fix --force`: it downgrades `firebase`/`firebase-tools` to older majors. Re-check the overrides when `firebase-tools` resolves them itself.
- Agent skills (2026-11-15): removed `add-supabase-table` and `change-progression-rules` (both written for the old Supabase backend). Installed `grilling`, `codebase-design` and `domain-modeling` from `mattpocock/skills` with `npx skills add`, because `grill-me` and `improve-codebase-architecture` call them. They are pinned in `skills-lock.json` and linked into `.claude/skills/` for Claude Code.
