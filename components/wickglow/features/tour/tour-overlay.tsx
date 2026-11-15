import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fade, fonts, radius, rounded } from '@/src/theme/tokens';
import type { TourLayout, TourStep, TourTarget } from '@/src/core/tour';
import { useWickglow } from '@/components/wickglow/logic';
import { useReducedMotion } from '@/components/wickglow/hooks/use-reduced-motion';
import { glassPanel } from '@/components/wickglow/shared/panel-styles';
import { LogoMark } from '@/components/wickglow/shared/logo';
import {
  BarsIcon,
  CheckIcon,
  ChevronIcon,
  ChevronLeftIcon,
  MixerIcon,
  MusicIcon,
  SceneIcon,
  TaskIcon,
  TimerIcon,
} from '@/components/wickglow/shared/icons';
import { measureInWindow, type TourNode } from './measure';
import { DEFAULT_SIDES, EDGE, placeCard, visibleRect, type CardSide, type Rect, type Size } from './placement';

// Room between the target and the glowing ring around it.
const RING_PAD = 6;
const CARD_MAX_WIDTH = 340;
// On the tablet most parts are in the side column, so the card goes to their
// left, over the timer column, and the part and what follows it stay in view.
const TABLET_SIDES: readonly CardSide[] = ['left', 'below', 'above', 'right'];
// The pointer on the card's edge that aims at the part: a small square turned
// 45 degrees, half of it outside the card.
const CARET = 14;
// How close the pointer may come to a corner of the card.
const CARET_INSET = 22;

// The icon in each step's badge: the same one the app uses for that part.
const STEP_ICON: Record<TourTarget, React.ComponentType<{ size?: number; color?: string }>> = {
  timer: TimerIcon,
  music: MusicIcon,
  ambient: MixerIcon,
  scenes: SceneIcon,
  tasks: TaskIcon,
  progress: BarsIcon,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

interface TourOverlayProps {
  layout: TourLayout;
  step: TourStep;
  index: number;
  count: number;
  nodeFor: (target: TourTarget) => TourNode | null;
  reveal: (node: TourNode) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * One step of the tour: the screen dims softly except for a lit cut-out around
 * the part the step is about, ringed in the layout accent, and a small glass
 * card beside it says what that part does. The welcome step has no cut-out and
 * its card sits in the middle. The overlay takes every touch, so the app
 * behind it cannot be pressed until the tour moves on or is skipped.
 */
export function TourOverlay({ layout, step, index, count, nodeFor, reveal, onNext, onBack, onSkip }: TourOverlayProps) {
  const { sceneTheme, moodTheme } = useWickglow();
  const accent = layout === 'desktop' ? sceneTheme.accent : moodTheme.accent;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const cardWidth = Math.min(CARD_MAX_WIDTH, width - EDGE * 2);
  // The measured target for a step, tagged with that step so a stale result
  // from the step before is never drawn.
  const [measured, setMeasured] = useState<{ index: number; rect: Rect | null } | null>(null);
  const [cardHeight, setCardHeight] = useState(180);
  const shown = measured?.index === index;
  const opacity = useSharedValue(0);

  // Find the step's target (scrolled into view first where the layout can),
  // and measure it again whenever the window changes size.
  useEffect(() => {
    let live = true;
    const node = step.target ? nodeFor(step.target) : null;
    void (async () => {
      let rect: Rect | null = null;
      if (node) {
        await reveal(node);
        rect = await measureInWindow(node);
      }
      if (live) setMeasured({ index, rect });
    })();
    return () => {
      live = false;
    };
  }, [height, index, nodeFor, reveal, step.target, width]);

  // The ring and card fade in once the step is placed (at once under reduced motion).
  useEffect(() => {
    if (!shown) opacity.set(0);
    else opacity.set(reduced ? 1 : withTiming(1, { duration: 260 }));
  }, [opacity, reduced, shown]);

  // Escape skips the tour on the web, as it closes other cards.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onSkip]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  // The card also rises a few pixels as it fades in.
  const cardMotion = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: (1 - opacity.get()) * 8 }],
  }));

  const screen: Size = { width, height };
  const target = shown ? measured.rect : null;
  const hole = target ? visibleRect(target, screen, RING_PAD) : null;
  const place = placeCard(hole, screen, { width: cardWidth, height: cardHeight }, layout === 'tablet' ? TABLET_SIDES : DEFAULT_SIDES);
  // Keep the card clear of the status bar and the home indicator.
  const top = Math.max(insets.top + EDGE, Math.min(place.top, height - insets.bottom - EDGE - cardHeight));

  const last = index === count - 1;
  const welcome = step.target === null;
  const Icon = step.target ? STEP_ICON[step.target] : null;
  // Steps after the welcome, for the progress dots.
  const stepCount = count - 1;
  const caret = hole ? caretFor(place.side, hole, { x: place.left, y: top, width: cardWidth, height: cardHeight }) : null;

  return (
    <View style={styles.root} pointerEvents="auto">
      {/* The dim: four pieces around the cut-out, or the whole screen while a
          step is being placed and for the welcome card. */}
      {hole ? (
        <>
          <View style={[styles.dim, { left: 0, top: 0, width, height: hole.y }]} />
          <View style={[styles.dim, { left: 0, top: hole.y + hole.height, width, height: height - hole.y - hole.height }]} />
          <View style={[styles.dim, { left: 0, top: hole.y, width: hole.x, height: hole.height }]} />
          <View style={[styles.dim, { left: hole.x + hole.width, top: hole.y, width: width - hole.x - hole.width, height: hole.height }]} />
          <Reanimated.View
            pointerEvents="none"
            style={[
              styles.ring,
              fadeStyle,
              {
                left: hole.x,
                top: hole.y,
                width: hole.width,
                height: hole.height,
                borderColor: accent,
                borderRadius: Math.min(radius.lg, hole.height / 2, hole.width / 2),
                boxShadow: `0 0 28px ${accent}`,
              },
            ]}
          />
        </>
      ) : (
        <View style={[styles.dim, StyleSheet.absoluteFill]} />
      )}

      {shown ? (
        <Reanimated.View
          role="dialog"
          aria-modal
          aria-label={step.title}
          accessibilityViewIsModal
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.height);
            if (next > 0 && next !== cardHeight) setCardHeight(next);
          }}
          style={[
            styles.card,
            cardMotion,
            {
              width: cardWidth,
              left: place.left,
              top,
              borderTopColor: fade(accent, 0.5),
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.5), 0 0 48px ${fade(accent, 0.14)}`,
            },
          ]}
        >
          {caret ? <View pointerEvents="none" style={[styles.caret, caret]} /> : null}
          {welcome ? (
            <View style={styles.welcome}>
              <View style={[styles.logoHalo, { backgroundColor: fade(accent, 0.12), borderColor: fade(accent, 0.32), boxShadow: `0 0 32px ${fade(accent, 0.35)}` }]}>
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <LogoMark size={34} />
                </View>
              </View>
              <Text style={styles.welcomeTitle}>{step.title}</Text>
              <Text style={[styles.body, styles.centered]}>{step.body}</Text>
              <Pressable accessibilityRole="button" onPress={onNext} style={[styles.primary, styles.primaryWide, { backgroundColor: accent }]}>
                <Text style={styles.primaryText}>Show me around</Text>
                <ChevronIcon size={14} color={colors.textInverse} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Skip the tour" onPress={onSkip} hitSlop={6} style={styles.skipWide}>
                <Text style={styles.skipText}>Skip the tour</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.head}>
                {Icon ? (
                  <View style={[styles.badge, { backgroundColor: fade(accent, 0.14), borderColor: fade(accent, 0.34) }]}>
                    <Icon size={18} color={accent} />
                  </View>
                ) : null}
                <View style={styles.headText}>
                  <Text style={[styles.count, { color: accent }]}>Step {index} of {stepCount}</Text>
                  <Text style={styles.title}>{step.title}</Text>
                </View>
                {last ? null : (
                  <Pressable accessibilityRole="button" accessibilityLabel="Skip the tour" onPress={onSkip} hitSlop={8} style={styles.skip}>
                    <Text style={styles.skipText}>Skip</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.body}>{step.body}</Text>
              {last ? <Text style={styles.note}>Replay this tour any time from Timer settings.</Text> : null}
              <View style={styles.foot}>
                <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {Array.from({ length: stepCount }, (_, dot) => {
                    const current = dot + 1 === index;
                    const done = dot + 1 < index;
                    return (
                      <View
                        key={dot}
                        style={[
                          styles.dot,
                          current && styles.dotOn,
                          { backgroundColor: current ? accent : done ? fade(accent, 0.45) : colors.border },
                        ]}
                      />
                    );
                  })}
                </View>
                <View style={styles.actions}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={styles.back}>
                    <ChevronLeftIcon size={18} color={colors.textPrimary} />
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={onNext} style={[styles.primary, { backgroundColor: accent }]}>
                    <Text style={styles.primaryText}>{last ? 'Done' : 'Next'}</Text>
                    {last ? <CheckIcon size={14} color={colors.textInverse} /> : <ChevronIcon size={14} color={colors.textInverse} />}
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </Reanimated.View>
      ) : null}
    </View>
  );
}

/**
 * Where the pointer sits on the card, aimed at the middle of the highlight
 * along the card's edge that faces it. Each pointer shows the two borders that
 * face outward once turned. Null when the card is not beside the highlight.
 */
function caretFor(side: CardSide, hole: Rect, card: Rect) {
  const half = CARET / 2;
  const alongX = clamp(hole.x + hole.width / 2 - card.x - half, CARET_INSET - half, card.width - CARET_INSET - half);
  const alongY = clamp(hole.y + hole.height / 2 - card.y - half, CARET_INSET - half, card.height - CARET_INSET - half);
  const edge = -half - 1;
  switch (side) {
    case 'below':
      return { top: edge, left: alongX, borderTopWidth: 1, borderLeftWidth: 1 };
    case 'above':
      return { bottom: edge, left: alongX, borderBottomWidth: 1, borderRightWidth: 1 };
    case 'left':
      return { right: edge, top: alongY, borderTopWidth: 1, borderRightWidth: 1 };
    case 'right':
      return { left: edge, top: alongY, borderBottomWidth: 1, borderLeftWidth: 1 };
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  // Above everything, the session-end card (30) included.
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
  },
  dim: {
    position: 'absolute',
    backgroundColor: colors.scrim,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  card: {
    position: 'absolute',
    ...glassPanel,
    ...rounded(radius.sheet),
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  caret: {
    position: 'absolute',
    width: CARET,
    height: CARET,
    backgroundColor: colors.bgSurface,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  welcome: {
    alignItems: 'center',
    paddingTop: 6,
  },
  logoHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  welcomeTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  centered: {
    textAlign: 'center',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
  },
  count: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.timeMedium,
    fontSize: 19,
  },
  body: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.88,
  },
  note: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 10,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOn: {
    width: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },
  skipWide: {
    minHeight: 40,
    justifyContent: 'center',
    marginTop: 6,
  },
  skipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
  primary: {
    minHeight: 40,
    paddingLeft: 18,
    paddingRight: 14,
    ...rounded(radius.pill),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryWide: {
    alignSelf: 'stretch',
    minHeight: 46,
    marginTop: 20,
  },
  primaryText: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
  },
});
