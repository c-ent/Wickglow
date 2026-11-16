# Roadmap

Read this when starting or planning a feature, or when asked what comes next. Each item is the spec for one big feature. They ship one at a time. Build only the item marked Current in `progress.md`. The order is proposed and the owner can change it.

## How to use an item

- Build the current item only. Do not start a related one because it looks easy.
- Resolve the item's Open questions with the owner before writing code. Add any new ones to `progress.md`.
- Reward rules (XP, drops, quest payouts) are pure functions in `src/core` with tests, and the Firestore rules must still bound every write.
- When an item ships, add it to `completed.md` and update `spec.md` so it describes the app as it is.

## Reward eligibility

Applies to the streak and the four-session quest. Only a focus session of at least 10 minutes counts for those. A shorter session still pays 2 XP per minute and its minutes still count toward the 60-minute quest. The task quest is unchanged: 30 XP once per day.

## Order

The order was updated on 2026-11-03 and is recorded in `progress.md`. #1, #4 and #8 have shipped (#4 on 2026-11-04). #2 and #3 were removed on 2026-11-04. #6 and #7 are out. #5, #9, #10 and #11 were dropped on 2026-11-10.

| #   | Feature                                 | Version | Status                      | Depends on                                                |
| --- | --------------------------------------- | ------- | --------------------------- | --------------------------------------------------------- |
| 1   | Your own music files                    | v2      | Shipped 2026-11-03          | v1 music player                                           |
| 8   | Streaming playlists                     | v2      | Shipped 2026-11-03          | #1, terms check                                           |
| 2   | Unlocks (XP lights the room)            | —       | Removed 2026-11-04          | —                                                         |
| 3   | Goal-linked quests                      | —       | Removed 2026-11-04          | —                                                         |
| 4   | Calendar stats                          | v2      | Shipped 2026-11-04          | v1 daily minutes history                                  |
| 9   | Optional cosmetics or one-time purchase | —       | Out     | —                                                         |
| 6   | Study pets                              | —       | Out                         | v1 (server drops after #5)                                |
| 7   | Achievements                            | —       | Out                         | —                                                         |
| 5   | Accounts and sync                       | v2      | Shipped 2026-11-15 (checked on two devices) | —                                                         |
| 10  | Private circles (friends' candles)      | —       | Out     | —                                                         |
| 11  | Focus rooms                             | —       | Out     | —                                                         |
| 12  | Landing page                            | v2      | Done | Web build, APK on Google Drive, C1 cleared                |
| 13  | First-run tour                          | v2      | Shipped 2026-11-15 (checked on Android and desktop) | —                                                         |

#1, #4, #5, #8, #12 and #13 have shipped (#5, #12 and #13 in November 2026). #2 and #3 were removed. #6 and #7 are out. #9, #10 and #11 were dropped on 2026-11-10; their sections below are history only. No item is current; the owner picks the next one.

## v2

### 1. Your own music files — shipped 2026-11-03

Source: custom playlists are the top request. This was the safe half of it. Streaming services are #8.

Behavior:

- The user picks audio files from the device. They join the music player next to the bundled tracks and play with the screen off.
- Files stay on the device. They are never uploaded or stored in database rows.

Shipped: bundled tracks first, own files appended, all through the one `expo-audio` player. A document picker (`expo-document-picker`, SAF, no new permission) and a copy into the app's private document folder (`expo-file-system`). A missing or unreadable file is skipped. The web build hides the button, since a browser pick is a `blob:` URL that does not survive reload. Pure logic in `src/core/own-tracks.ts`.

### 2. Unlocks (XP lights the room) — removed 2026-11-04

Removed on 2026-11-04, along with the catalog, the Room panel and the
room art it shipped. XP still levels up and still drives the level name in the
stats surface; it no longer lights extra lights in the room. Kept here only as a
record of what was built and then taken out; do not rebuild it.

### 3. Goal-linked quests — removed 2026-11-04

Removed on 2026-11-04, along with the goal list, the 40 XP reward, and the link from a task to a goal. Tasks remain, now with an optional due date and subtasks. Kept here only as a record of what was built and then taken out; do not rebuild it.

Shipped, then removed: `src/core/goals.ts` held the pure rules. A goal was a title, an optional local date and an optional target in sessions or minutes. At most 3 active goals. A task carried one `goalId`, and a focus session of at least 10 minutes on that task credited the goal. Reaching a target, or closing a goal with no target, granted 40 XP once. The reward-eligibility minimum applied to goals alone and left with them.

### 4. Calendar stats — shipped 2026-11-04

Source: "Daywise study time tracker and streaks", a simple calendar of hours studied.

Behavior:

- A month calendar shades each day by minutes studied. Tapping a day shows minutes and sessions. The streak is visible.
- Reads the per-day minutes that v1 stores without pruning.

Done when: a month with gaps, a month boundary and a timezone change render correctly in tests.

Shipped: `src/core/month-calendar.ts` holds the pure rules. `monthGrid(now, days, year, month)` returns six padded weeks of cells, each with its local key, minutes and sessions; a day with no history entry is a gap with zero minutes rather than a missing cell, and the adjacent-month days that pad the first and last weeks are marked and left out of the month's own total, so the grid is the same height in every month. `monthShade` is the four-step rule: nothing, 1 to 24, 25 to 59, and 60 minutes or more. `shiftMonth` builds from the first of the month, so the arrows never stop at a year edge. Dates are built with `new Date(year, monthIndex, day)` and read back through `calendarKey`, so a local midnight or a DST hour cannot slip a day into the next cell. The `MonthCalendar` panel sits on the stats surface on all three shells, directly under the 7-day chart on phone and desktop and closing the tablet side column. It draws the cells, the streak in the header and the month total under the grid; the arrows change only the displayed month, today is marked, and the tapped day's line is derived from the same cell rather than a second copy of the history. Tests cover a gap inside the month, the month and year boundary, a padding day from an adjacent month, a local midnight, and the shade steps.

Open questions, answered by this build: four shading steps at 1, 25 and 60 minutes, the deepest in the layout accent. There is no weekly total; the header carries the streak and the month total sits under the grid.

### 6. Study pets

Out as of 2026-11-03. Kept here only as a record of what was proposed; do not build it.

Behavior:

- After a completed focus session there is a random chance to receive a pet from a fixed collection. Starting list from research: pet rock, lizard, snake, hamster, bird.
- A Pets screen shows what the user owns. Skipped or reset sessions never drop a pet, and neither do sessions below the minimum length (see Reward eligibility).
- The drop is a pure function in `src/core` that takes a random source, so tests can fix the outcome. After accounts ship, drops are decided and stored on the server.

Open questions: drop chance, and whether it grows with session length. Duplicates: allowed or not. Collection only, or pets appear in the candle scene. Whether pets level up. Who makes the art.

### 7. Achievements

Out as of 2026-11-03. Kept here only as a record of what was proposed; do not build it.

Listed in the original v2 scope but not designed. It would have needed a list of achievements, how they are earned, and whether they award XP, and it would have depended on accounts so rewards were server-validated.

### 8. Streaming playlists — shipped 2026-11-03

Source: the top request, "input our own playlists or songs from YouTube, Spotify and so on".

Terms read 2026-11-03, before the code:

- YouTube (API Services Developer Policies and Required Minimum Functionality): the embedded player stays visible, at least 200px tall here, with autoplay and the IFrame Player API left off. Background playback and separating the audio are forbidden, and Google Play has rejected apps whose WebView keeps YouTube audio after the screen locks. The player is removed when Wickglow leaves the screen. No offline copy.
- Spotify (Embeds and the Widget Terms): the iframe is Spotify's player, not the Web Playback SDK. Signed out, playback is a short preview. Full tracks need the listener's own Spotify session inside that player, which needs `encrypted-media` on the frame. The widget terms are written for a website the developer controls and require a privacy-policy disclosure that the embed sets cookies. That disclosure is in the privacy policy (`public/privacy.html`, streaming section). No sign-in is built by Wickglow.
- Apple Music (the embeddable player, not MusicKit): `embed.music.apple.com`. Signed out, a short preview. Full tracks need the listener's own Apple Music session inside that player. MusicKit would be a playback SDK and a sign-in, so it is not used.
- YouTube Music: no embed and no oEmbed. A `music.youtube.com` link is stored and opened. A normal `youtube.com` playlist is the YouTube player.

Shipped, web only, in the desktop layout: paste a public link. The save stores the link and the service name. The Music card splits Tracks and Streaming, and adding a link opens that service's player immediately. Spotify, YouTube, and Apple Music show that service's player on the scene, so it keeps playing when the card closes or the ambient mixer opens. The player keeps its default height and cannot be collapsed. Spotify and Apple Music keep playing in a hidden browser tab; YouTube's frame leaves while the page is hidden. YouTube Music opens. Starting an embed pauses the local `expo-audio` player, and closing it can resume. A private or unrecognized link fails with a short message. If an embed cannot play, the player shows an "Open link" button and never opens the service on its own. Session-end volume and fade stay on the local player. The timer, XP, and quests stay on the session clock. Pure parsing is in `src/core/stream-links.ts`.

Android and iOS have no Streaming view and no embed, and neither do phone and tablet widths on the web (see `spec.md`).

Open questions: whether links can be shared in rooms (decided with the rooms item).

### 12. Landing page — done (added and closed 2026-11-15)

Purpose: a portfolio link, and a home page ahead of the Play listing.

Decided 2026-11-15:

- On the web, `/` is the landing page (`app/index.web.tsx`, UI in `components/landing/`) and the web app is at `/app` (`app/app.tsx`). On Android and iOS, `/` stays the app (`app/index.tsx`). A visitor who has used the web app before is sent from `/` to `/app` by a script in the page head (`components/landing/returning-visitor.ts`); `/?home` shows the landing page anyway; the web app links there from an "About Wickglow" line at the end of Timer settings, opened in a new tab so a running session keeps going. `/download`, the first address, redirects to `/`. The web build uses `"output": "static"`, so each route is pre-rendered to a static HTML page and reuses the theme tokens and fonts.
- `/` is the page to link to (portfolio, posts, the Play listing's website field). The first plan kept the app at `/` with no redirect; the landing page moved to `/` the same day so search results show it.
- The main button downloads the Android APK from a Google Drive folder. `APK_URL` in `components/landing/content.ts` is the folder link, so the APK inside can be replaced without changing it.
- It goes live before the Google Play badge exists. When the Play listing is live, the badge is added and the APK button can be dropped or kept.
- Screenshots: three desktop shots in one swipeable gallery ("See it in action") inside a browser-style window (three dots and an address pill showing `GALLERY_ADDRESS`, arrows, scene tabs with a one-line caption per slide, a warm glow beneath), the same 1040 column as the other sections (it was 1200 wide at first), the screen area the same shape as the screenshots: the pixel-art Meadow, then the Tasks and Music panels (`GALLERY` in `content.ts`). The phone shot sits beside the Android download in the download card (`PHONE_SHOT`). WebP files are in `assets/landing/`.

Design: based on a mockup (2026-11-15). A near-black violet page with Amber glows and the flame colour as the only accent. Nav (Features, Android, Open the app); hero "Get the work done." with four floating sample widgets (timer, level, streak, ambient mix; sample numbers, drawn only on windows 1180 wide or more); a slim promise bar (Free, no ads or tracking, no account needed, no harsh alarm); a screenshot section; a "What's inside" bento grid whose pictures are the app's own components fed sample values (`components/landing/app-pieces.tsx`: `Candle`, `LevelCardView`, the task row pieces, the mixer styles, `DayCell`; the app exports `CheckBox`, `FocusButton`, `taskListStyles`, `DayCell` and `LevelCardView` for this); a download card; footer links to `/privacy`, `/delete-account` and the GitHub repo. Page-only colours are in `components/landing/palette.ts`; the rest come from the tokens.

C1 in `docs/issues.md` (the unconfirmed videos) was fixed on 2026-11-15, so it no longer blocks a public launch. The APK link is in (2026-11-15).

### 13. First-run tour — shipped 2026-11-15

Purpose: new users should be shown where the main parts of the app are.

Behavior:

- A short tour of tooltips, each placed next to the part it describes, with a soft highlight around that part. The rest of the screen dims softly with a warm glow. No bouncing arrows, no confetti.
- The same steps and words on phone, tablet and desktop. Only the target changes per layout: on desktop the dock buttons and panels, on phone the bottom tabs, on tablet the side column.
- Steps:
  1. Welcome to Wickglow: one line on what the app is (focus sessions, calm music, XP for showing up).
  2. Timer: "Start a focus session here. Pause or skip any time."
  3. Music: "Pick a lofi track or play your own files." On desktop, it also says "Paste a streaming link to play it here."
  4. Ambient sounds: "Mix in rain, cafe and other sounds behind your music." On desktop it opens and points at the Ambient mixer panel. On phone it points at the Sounds tab, where Ambient sits beside Tracks.
  5. Scenes (desktop) or Mood (phone and tablet): "Change the view behind your timer." / "Change the look behind your timer."
  6. Tasks: "Add what you are working on, then pick one to focus on."
  7. Progress (desktop, the Progress panel the top pills open) or Stats (phone tab, tablet section): "Finish sessions to earn XP and keep your streak."

  Progress and tasks were one step in the first plan; they are two because they sit in different places on every layout.
- Shown once, with Back and Skip on every step and Escape on the web. The last step says it can be replayed from Timer settings, where a "Show tour again" line sits just above "About Wickglow" (on every platform).

Decided 2026-11-15:

- Anyone who has not seen it on this device sees it, new or existing users.
- "Seen" is stored on the device only (`wickglow:tour` in AsyncStorage), never synced. Finishing or skipping stores it. If storage cannot be read, the tour does not start.
- On phone, the Music and Ambient steps both point at the Sounds tab.

Changed 2026-11-16: each step opens its panel while it shows. On desktop the Music, Ambient mixer, Scenes, Tasks and Progress panels open and the step lights both the panel and the button that opens it (its dock button; for Progress, the top pills), so the user sees where to open it later (`useTourButton`). A card with no room beside a wide panel sits against the window edge on the roomier side, moved up or down off the lit button. On phone the matching sheet tab opens behind the dim (Sounds on Tracks, then on Ambient, Mood, Tasks, Stats) and the step still points at the tab button (Ambient: the Ambient button). The Timer step closes the panel or sheet, and so does the tour's end. The tablet shows every part in its side column already, so nothing changes there.

Built 2026-11-15: steps and words in `src/core/tour.ts`; the provider, overlay and placement in `components/wickglow/features/tour/`. Each layout marks its parts with `useTourTarget`, opens the step's panel or sheet tab (`TOUR_PANEL` in `desktop.tsx`, `TOUR_SHEET` in `mobile.tsx`) and holds off zen while the tour runs. The tablet scrolls whichever column holds the part to the top and puts the card to its left.

## v3 (dropped)

### 9. Optional cosmetics or one-time purchase

Out as of 2026-11-10. Kept here only as a record; do not build it.

The core timer, tasks, sounds and progression stay free, because reviewers complain about paywalled features. Ask first before anything paid. Open: model, store billing, what counts as cosmetic.

## v4 (dropped: multiplayer)

Out as of 2026-11-10: private circles and focus rooms. Their sections below are kept only as a record of what was proposed; do not build them. Accounts and sync (#5) came back on 2026-11-13 and shipped on 2026-11-15.

### 5. Accounts and sync

Shipped 2026-11-15, ahead of the Play release. Uses Firebase on the Spark plan.

Behavior:

- Sign up and sign in with Firebase Auth: Email/Password and Google. Local-only use keeps working.
- Sync XP, streaks, tasks and focus history across devices. On first sign-in, upload local progress. Firestore rules bound how much XP, streak and quest rewards can change per write.

Done when:

- A second device shows the same XP, streak, tasks and history.
- A user cannot read or write another user's data, and a write that jumps XP or streak past the rule bounds is rejected (Firestore emulator rules test).

Answered 2026-11-13; the full plan and answers are in `docs/feature/firebase.md`.

### 10. Private circles (friends' candles)

Out as of 2026-11-10. Historical spec only. An idea from the research author, not validated by users.

Behavior: a small invite-only group. Each friend's candle burns while that friend is in a focus session. No chat by default.

Open questions: how invites work. Whether presence can be hidden. Whether friends get notified.

### 11. Focus rooms

Out as of 2026-11-10. Historical spec only. Must-haves from the research:

- Transfer host: the host can hand the role to another member. If the host leaves or is removed, the role passes on and the room and its Pomodoro timer are not lost.
- Chat can be turned off. No red unread dot or badge ever shows during a focus phase.
- Shared playlist for study groups, which needs #8.

Open questions: who becomes host when nobody is named. Rules for removing members. Reporting and blocking.

## Not planned

App blocking, flashcards, planners, notes (one competitor is called a "Notion wannabe"), ads, tracking SDKs, extra languages, study pets (out as of 2026-11-03; see the Evidence table for the request it would have met), achievements (out as of 2026-11-03).

## Evidence

Source: a competitor's feature request board and a gap analysis, shared by the project owner. The board is not named in the source file. Votes were read at the time of research and will change.

| Request                                   | Votes | Board status | Lands in                    |
| ----------------------------------------- | ----- | ------------ | --------------------------- |
| Task list for daily tasks                 | 122   | none shown   | v1 Tasks                    |
| Study pets, random pet reward             | 114   | none shown   | Out as of 2026-11-03        |
| Daywise study time tracker and streaks    | 9     | none shown   | v1 streak and 7 days, v2 #4 |
| Personalized end-of-session messages      | 134   | Planned      | v1 Session-end messages     |
| Custom songs playlist                     | 342   | Active       | v2 #1, v2 #8                |
| Change music behavior when the timer ends | 87    | Active       | v1 Sound                    |
| Clock ticking ambient sound               | 50    | Active       | v1 Sound                    |
| Turn off chat, the red ball hurts lock-in | 45    | none shown   | v4 #11                      |
| Transfer host                             | 38    | Active       | v4 #11                      |

Gaps to beat, from the same research:
| Gap | Wickglow answer | Lands in |
| --- | --- | --- |
| No reliable Android app with a timer that survives a locked screen | Timestamp timer and scheduled notification | v1 |
| Progress gives nothing | XP levels and daily quests | v1 |
| Harsh alarm at the end | Flame dims, soft chime, "Later" | v1 |
| No live accountability among friends | Friends' candles | v4 #10 |
| Paywalled features, feature creep | Free core, no notes or planner | principle |
| Web apps need a connection | Local-first, bundled audio, own files offline | v1, v2 #1 |
| Generic filler music | Licensed lofi tracks (Pixabay) | v1 |

The first gap is research, not marketing copy. Do not write "no reliable Android app" in store or site text until the Play Store has been checked, and prefer a feature claim even then.
