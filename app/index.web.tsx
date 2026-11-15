import { LandingPage } from '@/components/landing/landing-page';

/**
 * `/` on the web: the landing page (roadmap #12), so search results and new
 * visitors see what Wickglow is first. The web app is at /app, and returning
 * visitors are sent there before this draws (`components/landing/returning-visitor.ts`).
 * On Android and iOS, `index.tsx` is used instead and opens the app directly.
 */
export default function LandingScreen() {
  return <LandingPage />;
}
