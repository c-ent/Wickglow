import type { VideoId } from '@/components/wickglow/domain/video-ids';
import type { SceneSource } from '@/components/wickglow/features/background/scene-downloads';

// The video backgrounds. Rainy Cabin is bundled (it is the default and the
// fallback); the others live on the scene host (src/core/remote-scenes.ts) and
// are downloaded on Android or streamed on web, which keeps the app small. The
// files are in public/scenes/<path>; `bytes` must be the exact file size.
// Metro needs literal require paths, so each bundled file is listed by hand.
// `thumb` is a small still frame shown in the scene picker, always bundled, so
// the grid never has to decode or download video.
// A downloaded file is named after its `path`, so a replaced video needs a new
// path, or phones that downloaded the old one keep playing it.
export const VIDEOS: { id: VideoId; name: string; source: SceneSource; thumb: number }[] = [
  { id: 'rainy_cabin', name: 'Rainy Cabin', source: require('../../../../assets/backgrounds/videos/rainy_cabin.mp4'), thumb: require('../../../../assets/backgrounds/thumbnails/rainy_cabin.jpg') },
  { id: 'cyberpunk_desk', name: 'Cyberpunk Desk', source: { path: 'v1/videos/cyberpunk_desk_rain.mp4', bytes: 5689150 }, thumb: require('../../../../assets/backgrounds/thumbnails/cyberpunk_desk.jpg') },
  { id: 'frog_lily_pond', name: 'Frog Pond', source: { path: 'v1/videos/frog_lily_pond.mp4', bytes: 9847972 }, thumb: require('../../../../assets/backgrounds/thumbnails/frog_lily_pond.jpg') },
  { id: 'snowy_sled', name: 'Snowy Sled', source: { path: 'v1/videos/snowy_sled.mp4', bytes: 4168013 }, thumb: require('../../../../assets/backgrounds/thumbnails/snowy_sled.jpg') },
  { id: 'mossy_branch', name: 'Mossy Branch', source: { path: 'v1/videos/mossy_branch.mp4', bytes: 6860109 }, thumb: require('../../../../assets/backgrounds/thumbnails/mossy_branch.jpg') },];

/** The bundled Rainy Cabin video, played when a picked scene is not on the device. */
export const RAINY_CABIN_VIDEO: number = require('../../../../assets/backgrounds/videos/rainy_cabin.mp4');
