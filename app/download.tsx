import { Redirect } from 'expo-router';

/** The landing page's first address. It now lives at `/`; kept so links already shared still work. */
export default function DownloadScreen() {
  return <Redirect href="/" />;
}
