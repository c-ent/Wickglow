# Progress

Read at the start of every session. Update after each meaningful change. Keep it short: what is current, what is open, and what still needs checking. Finished work goes in [completed.md](completed.md).

## Current phase

v2

## Current feature

None right now. The Google Play and iOS App Store releases are the feature and will come in the future; the Google Play steps below stay for then.

## Current goal

None set.

## Not yet completed

Nothing open. Finished work is in [completed.md](completed.md).

## Open questions

None.

## Google Play deployment

The release after v2. The steps, in order:

1. **Privacy policy URL.** Deployed at `https://wickglow.vercel.app/privacy`. Paste it into the Play Console privacy policy field.
2. **Account deletion page.** `https://wickglow.vercel.app/delete-account`. Play requires a web link for account deletion requests. Check the page against Play's account-deletion policy at that time.
3. **Store listing.** App name: Wickglow. Icon: done. Still to add: short description, full description, feature graphic (1024×500), and at least two phone screenshots.
4. **Data Safety form.** Declare what the app collects: sign-in email and name (optional), and saved progress for accounts; nothing else. Check the answers against the privacy policy before submitting.
5. **Content rating questionnaire.**
6. **Target audience.** 13+ age groups only, and "No" to appealing to children.
7. **Permissions declaration.** The app declares `SCHEDULE_EXACT_ALARM` and `USE_EXACT_ALARM` (session-end alarm) and a media playback foreground service. Google may ask why the exact-alarm permissions are needed. The manifest also lists `READ_EXTERNAL_STORAGE`, added by a library; declare or remove it. Check the declaration before submitting.
8. **Background licences** (`BACKGROUND_LICENSES.md`). Done 2026-11-15: every video in the app is cleared (Pixabay, CraftPix, or Abi Toads' permission). Keep screenshots of Abi's message.
9. **Release build.** The APK for testing is installed. For Play, build an `.aab` with `eas build --platform android` (production profile). Test that build on a device, because a debug build does not show R8 problems.
10. **Closed test.** 12 testers opted in for 14 consecutive days (personal accounts created after 13 November 2023). Start it as soon as the release build is ready.
11. **Production access.** Apply after the closed test has run 14 days.
12. **Submit.** Run `eas submit` to production.
13. **Create the Play Console developer account** ($25 one time, identity verification can take a few days). Steps 3 to 12 happen in that account, so it has to exist first in practice, even though it is listed last.

## Next up

None right now.

## Still to check

Nothing right now.
