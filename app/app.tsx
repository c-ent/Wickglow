import { markAppVisited } from '@/components/landing/returning-visitor';
import { ErrorScreen } from '@/components/wickglow/shared/error-screen';
import { WickglowScreen } from '@/components/wickglow/wickglow-screen';
import { colors } from '@/src/theme/tokens';
import type { ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * The web app at /app. On the web, `/` is the landing page (`index.web.tsx`);
 * on Android and iOS, `/` is the app itself (`index.tsx`) and this route is unused.
 */
export default function AppScreen() {
  useEffect(() => {
    markAppVisited();
  }, []);

  return (
    <View style={styles.fill}>
      <WickglowScreen />
    </View>
  );
}

/** Expo Router shows this in place of the screen when rendering it throws. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={() => void retry()} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
});
