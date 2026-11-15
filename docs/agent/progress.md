# Progress

Read at the start of every session. Update after each meaningful change. Keep it short: what is current, what is open, and what still needs checking. Finished work goes in [completed.md](completed.md).

## Current phase

v2

## Current feature

Landing page (roadmap #12), alongside the Google Play release, whose remaining steps are owner tasks.

## Current goal

A web landing page that explains Wickglow and offers the Android APK for download, live before the Play listing exists. Ship Wickglow on Google Play after that.

## Not yet completed

- Landing page (current). See roadmap #12.
- Google Play release. See Google Play deployment.
- C1 fixed 2026-11-15: every video left is cleared, and Night Hills was removed. See `BACKGROUND_LICENSES.md`. The landing page now waits only on the APK link.

## Open questions

Landing page (roadmap #12). Built 2026-11-15. Moved the same day (owner): the landing page is `/` on the web and the web app is `/app`; returning visitors skip to `/app`; `/download` redirects to `/`. Android still opens the app at `/`. See roadmap #12. Waiting on the owner for item 1; item 2 is done:

1. The Google Drive share link for the APK (set to "Anyone with the link"). Replace `APK_URL` in `components/landing/content.ts`; it is a placeholder (`https://drive.google.com/`) until then. Drive shows a "can't scan for viruses" page before files over about 100MB download, so the button may land there first.
2. Screenshots are in (2026-11-15): WebP copies in `assets/landing/`, made from `assets/images/screenshots/` (about 80KB instead of 1.8MB), shown by `GALLERY` (three desktop shots in a Mac-style window) and `PHONE_SHOT` (beside the download) in `content.ts`. Replace a file in `assets/landing/` to change one. Gallery redesigned 2026-11-15: wider than the text column (1200), browser title bar with an address pill (`GALLERY_ADDRESS`), warm glow under the window, scene tabs plus a per-slide `caption` instead of dots.

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

- Retired scene clean-up (2026-11-15, from a code review): on launch the app deletes downloaded scenes no longer in `VIDEOS` or `PIXEL_ART` (`removeRetiredScenes`). On a phone that had the old Cyberpunk Desk or Night Hills downloaded, check they are gone and the other downloads stay.

Everything else was checked by the owner on 2026-11-15: two-device sync, ambient sounds with the screen off, own music files (no duplicate copy), timer controls, music source switching, the Scenes panel, the landing page at phone width, the desktop stream player and the tablet side column spacing.

## Tooling notes

- Docs (2026-11-15): added `docs/user-guide.md` (for users) and `docs/developer-guide.md` (for contributors; links to the agent docs instead of copying them), linked from `README.md`. Keep both in step when a user-visible feature or the code layout changes.

- `npm audit` reports 0 vulnerabilities through the `overrides` in `package.json` (`@grpc/grpc-js`, `uuid`, `re2`, `@opentelemetry/core`, `glob`), all transitive copies in dev-only `firebase-tools`; the app bundle is unaffected. Do not run `npm audit fix --force`: it downgrades `firebase`/`firebase-tools` to older majors. Re-check the overrides when `firebase-tools` resolves them itself.
- Agent skills (2026-11-15): removed `add-supabase-table` and `change-progression-rules` (both written for the old Supabase backend). Installed `grilling`, `codebase-design` and `domain-modeling` from `mattpocock/skills` with `npx skills add`, because `grill-me` and `improve-codebase-architecture` call them. They are pinned in `skills-lock.json` and linked into `.claude/skills/` for Claude Code.
