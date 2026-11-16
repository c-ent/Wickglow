# Background Video Attribution

This project uses third-party video assets for full-screen ambient backgrounds: Rainy Cabin is bundled from `assets/backgrounds/videos/`, the rest are served from `public/scenes/v1/videos/`. As of 2026-11-15 every video in the app is cleared; the dated status notes further down are history.

**Summary (2026-11-15).** Cleared: Rainy Cabin and Cyberpunk Desk (Pixabay), Frog Pond, Snowy Sled and Mossy Branch (Abi Toads' permission), Meadow and Aurora (CraftPix). `night_hills.mp4` (MoeWalls, a night version of the Windows XP "Bliss" hills with a watermark, no licence from the creator) was removed on 2026-11-15 at the owner's request: out of the app, the site and `original/`.

## Scene loops (2026-11-11 batch)

Added 2026-11-11, compressed the same day from raw exports (up to 71MB each) down to 1080p/30fps H.264 (CRF 26, re-encoded 2026-11-12 at CRF 20 from the originals in `videos/original/`, keeping 24fps sources at 24; audio stripped since the app's own audio system handles sound), then renamed from their original UUID-style export names to the descriptive names below. Compression and renaming did not change ownership or licensing — the license for each file still needs to be filled in here before it ships.

| File (was) | Length | License | Source / artist |
| :--- | :----- | :------ | :--------------- |
| `frog_lily_pond.mp4` (`ad249c50-39c0-48f4-b72d-02e9e4c4afe9.mp4`) | 22s | **Cleared: permission from the artist.** Abi Toads replied "Go for it! I would be absolutely honored~" (reported by the owner, 2026-11-15). Keep a screenshot of the message with her account name and date | Artist: Abi Toads (Instagram `abi.toads`). Downloaded as "Frog Relaxing in Pond", uploaded to Wallper as "Henry Hui": https://www.wallper.app/wallpaper/animals/frog-relaxing-in-pond-ad249c50-39c0-48f4-b72d-02e9e4c4afe9 |

`cyberpunk_desk.mp4` (Wallper "Cyber Hacker" by "biggjohnson2k", `9288727d…`) was replaced on 2026-11-15 by a Pixabay video; see "Pixabay videos" below. The original stays in `assets/backgrounds/videos/original/` and is no longer served.

**Status (2026-11-11, history; superseded 2026-11-15 by the artist's permission and the Pixabay replacement above).** On 2026-11-12 the owner had `desktop_windows.mp4` ("Blue,Lofi boy"), `cherry_blossom_cottage.mp4` ("Spring lofi"), `twilight_skyline.mp4` (owner-made) and `rainy_cottage.mp4` ("Lofi") removed from the app, and later the same day `flower_hill_girl.mp4` ("Field of cherry blossom"). The remaining two are wired into the desktop `ScenePicker`'s "Videos" group (`components/wickglow/features/background/video-art.ts`), each with a thumbnail in `assets/backgrounds/thumbnails/`. Both came from Wallper; the owner is shipping them on Wallper's permission (below), not on a licence from each artist. An earlier note here said three carried a moewalls.com watermark; the originals were later traced to Wallper.

**Sources found 2026-11-11.** Six of the original filenames are Wallper wallpaper ids (`wallper.app`, a paid live-wallpaper app for Mac); the sitemap lists them under `cdn.wallper.app/wallper-user-generated/`, and each video's length matches its page. The names above are Wallper usernames, not confirmed artists. Wallper's terms (`https://www.wallper.app/legal/terms`) say uploaders keep their rights and license them to Wallper only, and give app users a licence to the app on up to three personal Macs, with no right to redistribute. Those terms alone do not clear the videos for Wickglow; see Wallper's permission below.

**Wallper permission, 2026-11-11 (history).** The owner asked Wallper about the six Wallper videos above and reports that Wallper said they are okay to use. The reply was never put on file, and no video in the app relies on it any more: the remaining Wallper uploads are cleared by their artist, Abi Toads, and Cyberpunk Desk was replaced by a Pixabay video.

Wallper's own terms say uploaders keep ownership and license their content to Wallper "in connection with the Service", so Wallper's yes is good-faith permission from the platform, not a licence from each artist. If an artist objects, remove that video in the next release.

## Scene loops (2026-11-12 batch)

Added 2026-11-12 from raw exports in `assets/backgrounds/videos/original/` (mostly 4K, 1 to 71MB each, about 246MB in all) and encoded to 1080p H.264 High, CRF 20 (first CRF 26, raised the same day at the owner's request for about twice the bitrate), preset slow, at most 30fps (24fps sources kept at 24), audio stripped, faststart. About 40MB in all. Thumbnails are a frame at 1s, 480px wide. `sunlit_meadow.mp4` (`bcb295b7…`, looked like a Studio Ghibli frame) and `blossom_grove.mp4` (`43d863ae…`, looked like Minecraft) were encoded too but removed the same day at the owner's request. `hilltop_picnic.mp4` and `pixel_coder.mp4` were also removed on 2026-11-12 at the owner's request. `moonlit_city.mp4` was also removed on 2026-11-12 at the owner's request. The owner confirmed on 2026-11-12 that the remaining three came from Wallper (wallper.app), like the 2026-11-11 batch. Their original filenames look like Wallper wallpaper ids; the exact pages and uploaders are not recorded yet.

| File (was) | Length | License | Source / artist |
| :--- | :----- | :------ | :--------------- |
| `snowy_sled.mp4` (`2d0d311f-1486-414b-aa40-fc098ed96745.mp4`) | 11s | **Cleared: permission from the artist.** The owner confirmed on 2026-11-15 that it is Abi Toads' work and covered by her "Go for it! I would be absolutely honored~" | Artist: Abi Toads (Instagram `abi.toads`). Hand-painted snowy slope, a small frog on a sled |
| `mossy_branch.mp4` (`5037c286-9372-4693-8679-dcf3d73134db.mp4`) | 35s | **Cleared: permission from the artist.** The owner confirmed on 2026-11-15 that it is Abi Toads' work and covered by the same reply | Artist: Abi Toads (Instagram `abi.toads`). Close-up of a moss-covered branch |

**Status (2026-11-15).** Snowy Sled and Mossy Branch are in the `ScenePicker`'s "Videos" group, cleared by Abi Toads' permission (rows above). The third video of this batch, Night Hills, was removed on 2026-11-15.

## Pixel-art pair

Source: "Nature Landscapes Free Pixel Art" by Free Game Assets (CraftPix), https://free-game-assets.itch.io/nature-landscapes-free-pixel-art . The pack is 8 PNG parallax backgrounds; the videos in `assets/backgrounds/pixel-art/` are animated versions of them. Asked "What is the license?" on that page, the creator linked https://craftpix.net/file-licenses/ . The owner confirmed on 2026-11-12 that this itch.io page is where the pixel art came from.

That licence (checked 2026-11-11), for free assets: use in any number of personal and commercial projects; modify them and include them in "game projects, elements for websites, applications"; sell and distribute games with them. "No attribution or link back to this site is required, however any credit will be highly appreciated." Not allowed: reselling or redistributing the art files themselves, or letting the user save or export the artwork from the app. Wickglow only shows them as a background, which is allowed. Also not allowed: using them to train AI.

`mountain_4k.mp4` (the snowy mountain and pine valley) was removed from the app on 2026-11-12 at the owner's request.

| File | Matches | Status |
| :--- | :------ | :----- |
| `meadow_4k.mp4` | The pine and bush meadow preview on the itch.io page | Cleared (CraftPix licence) |
| `aurora_4k.mp4` | Not in the four previews on the page; owner confirmed 2026-11-11 it is in the downloaded zip | Cleared (CraftPix licence) |

Who made the animated versions is not recorded. If someone other than the owner animated them, the CraftPix licence still covers the art; note the source of the animation here if known.

## Pixabay videos

Pixabay Content License (https://pixabay.com/service/license-summary/): free for commercial and non-commercial use, no attribution required, may be modified. Not allowed: selling or distributing the video on its own (standalone), including a version with only minor changes such as a re-encode, trim or resize, or implying endorsement. Shown as a background inside the app, which is allowed. Credit is given anyway, as Pixabay asks.

| File | Length | License | Source / artist |
| :--- | :----- | :------ | :--------------- |
| `rainy_cabin.mp4` (the "Rainy Cabin" scene, bundled) | Not recorded | **Cleared:** Pixabay Content License | "Live Wallpaper Cozy Cabin Rainy Day" by MrBones03: https://pixabay.com/videos/live-wallpaper-cozy-cabin-rainy-day-270983/ (page and artist confirmed by the owner, 2026-11-15) |
| `cyberpunk_desk_rain.mp4` (the "Cyberpunk Desk" scene, served from `public/scenes/v1/videos/`) | 21s | **Cleared:** Pixabay Content License | Pixabay video 150883 by `u_gm5v89x1on`: https://pixabay.com/videos/computers-office-desk-windows-rain-150883/ (from the owner, 2026-11-15). Source download: `assets/backgrounds/videos/original/cyberpunkreplacement.mp4` (3840x2160, 30fps). Encoded 2026-11-15 to 1080p H.264 High, CRF 20, preset slow, 30fps, no audio, faststart (5.4MB); thumbnail is the frame at 1s, 480x270. Replaces the Wallper "Cyber Hacker" video under the same scene id, at a new path so phones that downloaded the old file fetch this one |
