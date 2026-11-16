import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { Outfit_200ExtraLight, Outfit_300Light, Outfit_400Regular, Outfit_500Medium } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  BellIcon,
  CheckIcon,
  ChevronIcon,
  ChevronLeftIcon,
  DownloadIcon,
  FlameIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
} from '@/components/wickglow/shared/icons';
import { useReducedMotion } from '@/components/wickglow/hooks/use-reduced-motion';
import { LogoMark } from '@/components/wickglow/shared/logo';
import { colors, fade, fonts, radius } from '@/src/theme/tokens';
import {
  APK_URL,
  APP_VERSION,
  type GallerySlide,
  BENTO,
  HERO_SAMPLE,
  GALLERY,
  GALLERY_ADDRESS,
  PHONE_SHOT,
  SOURCE_URL,
  STRIP_ITEMS,
  type StripIconName,
} from './content';
import { CalendarNotes, CalendarPreview, CandlesPreview, LevelPreview, MixerPreview, SyncPreview, TasksPreview } from './app-pieces';
import { land } from './palette';
import { APP_PATH, LANDING_HOME_PATH } from './returning-visitor';
import { SAMPLE_LEVEL, useIsClient, web } from './web-helpers';

// The web landing page at `/` (roadmap #12); the web app is at /app. The static export renders
// it to plain HTML, so it reads without JavaScript. Sizes use wrapping rows,
// max widths and CSS clamp(), not the window size, so the server render and
// the browser render match. The one exception is the floating hero widgets:
// they are decoration, drawn only in the browser and only on a wide window.

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

const STRIP_ICONS: Record<StripIconName, IconComponent> = {
  check: CheckIcon,
  shield: ShieldIcon,
  user: UserIcon,
  bell: BellIcon,
};

const TITLE = 'Wickglow: a calm lofi Pomodoro study timer';
const DESCRIPTION =
  'A calm lofi Pomodoro study timer with XP, streaks, tasks and ambient sounds. Free for Android and the web.';


/** True when this visitor allows motion. Starts false, so the server render and the first frame are still. */
const MotionContext = createContext(false);

// Looping hero animations (CSS keyframes through react-native-web).
// Transforms are CSS strings: react-native-web drops the array form inside keyframes.
const FLOAT = {
  '0%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-8px)' },
  '100%': { transform: 'translateY(0px)' },
};
const BREATHE = { '0%': { opacity: 0.7 }, '50%': { opacity: 1 }, '100%': { opacity: 0.7 } };
const PULSE = {
  '0%': { transform: 'scaleY(0.45)' },
  '50%': { transform: 'scaleY(1)' },
  '100%': { transform: 'scaleY(0.45)' },
};

// A candle's uneven flicker, for the accent word in the hero heading.
const FLICKER = {
  '0%': { opacity: 1 },
  '18%': { opacity: 0.88 },
  '22%': { opacity: 1 },
  '47%': { opacity: 0.94 },
  '53%': { opacity: 0.82 },
  '58%': { opacity: 1 },
  '83%': { opacity: 0.9 },
  '100%': { opacity: 1 },
};
// The live dot in the eyebrow pill: grows and fades, like a pilot light.
const GLOW_DOT = {
  '0%': { opacity: 0.55, transform: 'scale(0.8)' },
  '50%': { opacity: 1, transform: 'scale(1.15)' },
  '100%': { opacity: 0.55, transform: 'scale(0.8)' },
};
// An ember rising behind the hero copy: fades in, drifts up and sideways, fades out.
function rise(sway: number) {
  return {
    '0%': { opacity: 0, transform: 'translate(0px, 0px)' },
    '15%': { opacity: 0.9, transform: `translate(${sway * 0.3}px, -50px)` },
    '55%': { opacity: 0.6, transform: `translate(${sway}px, -200px)` },
    '100%': { opacity: 0, transform: `translate(${sway * -0.4}px, -380px)` },
  };
}
// react-native-web turns `animationKeyframes` into a CSS animation only in
// StyleSheet.create; in an inline style it is dropped and nothing moves. So
// the keyframes are registered here, and `loop` adds only the timing inline.
const FRAMES = StyleSheet.create({
  float: web({ animationKeyframes: FLOAT }),
  breathe: web({ animationKeyframes: BREATHE }),
  pulse: web({ animationKeyframes: PULSE }),
  flicker: web({ animationKeyframes: FLICKER }),
  glowDot: web({ animationKeyframes: GLOW_DOT }),
  riseLeft: web({ animationKeyframes: rise(-16) }),
  riseRight: web({ animationKeyframes: rise(14) }),
  // The gallery's timer bar, filling once from the left.
  fill: web({ animationKeyframes: { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } } }),
});
type Frames = (typeof FRAMES)[keyof typeof FRAMES];
const RISE_LEFT = FRAMES.riseLeft;
const RISE_RIGHT = FRAMES.riseRight;

function loop(frames: Frames, seconds: number, delaySeconds = 0, timing = 'ease-in-out') {
  return [frames, web({
    animationDuration: `${seconds}s`,
    animationDelay: `${delaySeconds}s`,
    animationIterationCount: 'infinite',
    animationTimingFunction: timing,
    // Holds the first frame through the delay, so an ember waits unseen.
    animationFillMode: 'both',
  })];
}

/**
 * Whether the mouse is over an element, and the props that track it. Only on
 * a device that can hover, so a tap on a phone never leaves a card lifted.
 */
function useHover() {
  const [hovered, setHovered] = useState(false);
  const props = {
    onMouseEnter: () => {
      if (typeof matchMedia !== 'undefined' && matchMedia('(hover: hover)').matches) setHovered(true);
    },
    onMouseLeave: () => setHovered(false),
  } as object;
  return [hovered, props] as const;
}

/**
 * A View that fades in and rises when it scrolls into view. Anything already on
 * screen at load stays put, and with no JavaScript, reduced motion or no
 * IntersectionObserver the content simply shows, so nothing is ever hidden for good.
 */
function Reveal({
  children,
  style,
  delay = 0,
  lift = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  /** A card: under the mouse it warms its border, lifts (motion allowed) and a soft light follows the pointer. */
  lift?: boolean;
}) {
  const motion = useContext(MotionContext);
  const ref = useRef<React.ComponentRef<typeof View>>(null);
  const spotRef = useRef<React.ComponentRef<typeof View>>(null);
  const [phase, setPhase] = useState<'visible' | 'hidden' | 'shown'>('visible');
  const [hovered, hoverProps] = useHover();

  // Once the entrance has played, drop its slow transition so hover feels quick.
  useEffect(() => {
    if (phase !== 'shown') return undefined;
    const timer = setTimeout(() => setPhase('visible'), delay + 750);
    return () => clearTimeout(timer);
  }, [delay, phase]);

  // The light follows the pointer, written straight to the element so a mouse
  // move does not re-render the card.
  const onMouseMove = (event: { nativeEvent: MouseEvent }) => {
    const card = ref.current as unknown as HTMLElement | null;
    const spot = spotRef.current as unknown as HTMLElement | null;
    if (!card || !spot) return;
    const box = card.getBoundingClientRect();
    const x = event.nativeEvent.clientX - box.left;
    const y = event.nativeEvent.clientY - box.top;
    spot.style.backgroundImage = `radial-gradient(380px circle at ${x}px ${y}px, ${fade(land.accent, 0.13)}, transparent 70%)`;
  };
  const liftProps = lift ? ({ ...hoverProps, onMouseMove } as object) : {};

  useEffect(() => {
    const node = ref.current as unknown as HTMLElement | null;
    if (!motion || Platform.OS !== 'web' || !node || typeof IntersectionObserver === 'undefined') {
      setPhase('visible');
      return;
    }
    // On screen, or already scrolled past, when the page loads: leave it be.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    setPhase('hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPhase('shown');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion]);

  const phaseStyle =
    phase === 'hidden'
      ? web({ opacity: 0, transform: [{ translateY: 28 }] })
      : phase === 'shown'
        ? web({
            opacity: 1,
            transform: [{ translateY: 0 }],
            transitionProperty: 'opacity, transform',
            transitionDuration: '700ms',
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          })
        : null;

  return (
    <View
      ref={ref}
      {...liftProps}
      style={[
        style,
        lift && styles.lift,
        phaseStyle,
        lift && hovered && styles.liftOn,
        lift && hovered && motion && styles.liftUp,
      ]}
    >
      {lift ? <View ref={spotRef} pointerEvents="none" style={[styles.spot, hovered && styles.spotOn]} /> : null}
      {children}
    </View>
  );
}

export function LandingPage() {
  useFonts({
    [fonts.time]: Outfit_200ExtraLight,
    [fonts.timeLight]: Outfit_300Light,
    // The app's own pieces (level card and others) use these two.
    [fonts.timeRegular]: Outfit_400Regular,
    [fonts.timeMedium]: Outfit_500Medium,
    [fonts.body]: Figtree_400Regular,
    [fonts.bodyMedium]: Figtree_500Medium,
    [fonts.bodySemibold]: Figtree_600SemiBold,
  });
  const isClient = useIsClient();
  const { width } = useWindowDimensions();
  const showWidgets = isClient && width >= 1180;
  const compact = isClient && width < 600;
  const motion = !useReducedMotion();

  return (
    <MotionContext.Provider value={motion}>
    <ScrollView
      style={[styles.page, motion && web({ scrollBehavior: 'smooth' })]}
      contentContainerStyle={styles.pageContent}
    >
      {/* React 19 lifts these into <head>, in the static export and in the browser. */}
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:type" content="website" />

      {/* Background light: violet haze, then three Amber glows down the page. */}
      <View style={[styles.glow, styles.glowHaze]} pointerEvents="none" />
      <View style={[styles.glow, styles.glowHero, motion && loop(FRAMES.breathe, 9)]} pointerEvents="none" />
      <View style={[styles.glow, styles.glowRight]} pointerEvents="none" />

      <View style={styles.nav}>
        {/* The logo goes back to the top of the landing page. `/?home`, so a
            returning visitor is not sent on to the app. */}
        <Anchor href={LANDING_HOME_PATH} style={styles.brand}>
          <LogoMark size={28} />
          <Text style={styles.brandText}>Wickglow</Text>
        </Anchor>
        <View style={styles.navRight}>
          {compact ? null : (
            <View style={styles.navLinks}>
              <TextLink href="#features" style={styles.navLinkText} label="Features" />
              <TextLink href="#android" style={styles.navLinkText} label="Android" />
            </View>
          )}
          <Anchor href={APP_PATH} style={styles.navButton} hoverStyle={styles.navButtonOn}>
            <Text style={styles.navButtonText}>Open the app</Text>
          </Anchor>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        {isClient && motion ? <HeroEmbers /> : null}
        {showWidgets ? <HeroWidgets /> : null}
        <View style={styles.heroCopy}>
          <View style={styles.eyebrowPill}>
            <View style={[styles.eyebrowDot, motion && loop(FRAMES.glowDot, 2.6)]} />
            <Text style={styles.eyebrowPillText}>Lofi Pomodoro study timer</Text>
          </View>
          <Text role="heading" aria-level={1} style={styles.heroTitle}>
            Get the work <Text style={[styles.heroAccent, motion && loop(FRAMES.flicker, 5)]}>done.</Text>
          </Text>
          <Text style={styles.heroBody}>
            Wickglow is a calm focus timer with lofi music, ambient sounds, tasks and gentle progress. Earn XP for
            every focus minute and keep your streak burning.
          </Text>
          <View style={styles.ctaRow}>
            <DownloadButton />
            <BrowserButton />
          </View>
          <Text style={styles.ctaNote}>Free · Android APK · Google Play coming soon</Text>
        </View>
      </View>

      {/* Strip */}
      <Reveal style={[styles.strip, compact && styles.stripCompact]}>
        {STRIP_ITEMS.map((item) => {
          const Icon = STRIP_ICONS[item.icon];
          return (
            <View key={item.label} style={[styles.stripItem, compact && styles.stripItemCompact]}>
              <View style={compact && styles.stripIconCompact}>
                <Icon size={15} color={land.accentSoft} />
              </View>
              <Text style={[styles.stripLabel, compact && styles.stripLabelCompact]}>{item.label}</Text>
            </View>
          );
        })}
      </Reveal>

      {/* Gallery */}
      <View style={styles.section}>
        <SectionHeading eyebrow="See it in action" title="A quiet place to get the work done" />
        <Reveal>
          <Gallery slides={GALLERY} />
        </Reveal>
      </View>

      {/* What's inside */}
      <View id="features" style={styles.section}>
        <SectionHeading eyebrow="What's inside" title="Everything a study session needs" align="start" />
        <View style={styles.bentoGrid}>
          <View style={styles.bentoRow}>
            <Reveal lift style={[styles.bento, styles.bentoCandle]}>
              <View style={styles.bentoSplit}>
                <View style={styles.bentoText}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{BENTO.candle.badge}</Text>
                  </View>
                  <BentoCopy title={BENTO.candle.title} body={BENTO.candle.body} />
                </View>
                <CandlesPreview times={BENTO.candle.times} />
              </View>
            </Reveal>
            <Reveal lift style={[styles.bento, styles.bentoXp]} delay={90}>
              <LevelPreview />
              <BentoCopy title={BENTO.xp.title} body={BENTO.xp.body} />
            </Reveal>
          </View>
          <View style={styles.bentoRow}>
            <Reveal lift style={[styles.bento, styles.bentoTasks]}>
              <TasksPreview />
              <BentoCopy title={BENTO.tasks.title} body={BENTO.tasks.body} />
            </Reveal>
            <Reveal lift style={[styles.bento, styles.bentoSounds]} delay={90}>
              <MixerPreview />
              <BentoCopy title={BENTO.sounds.title} body={BENTO.sounds.body} />
            </Reveal>
          </View>
          <View style={styles.bentoRow}>
            <Reveal lift style={[styles.bento, styles.bentoCalendar]}>
              <View style={styles.bentoSplit}>
                <CalendarPreview />
                <View style={styles.bentoText}>
                  <BentoCopy title={BENTO.calendar.title} body={BENTO.calendar.body} />
                  <CalendarNotes />
                </View>
              </View>
            </Reveal>
            <Reveal lift style={[styles.bento, styles.bentoSync]} delay={90}>
              <SyncPreview />
              <BentoCopy title={BENTO.sync.title} body={BENTO.sync.body} />
            </Reveal>
          </View>
        </View>
      </View>

      {/* Download */}
      <View id="android" style={styles.section}>
        <Reveal style={styles.download}>
          <View style={styles.downloadGlow} pointerEvents="none" />
          <View style={[styles.downloadCopy, compact && styles.downloadCopyCompact]}>
            <LogoMark size={48} />
            <Text
              role="heading"
              aria-level={2}
              style={[styles.downloadTitle, compact && styles.downloadTextCompact]}
            >
              Get Wickglow for Android
            </Text>
            <Text style={[styles.downloadBody, compact && styles.downloadTextCompact]}>
              Wickglow is not on Google Play yet. Download the APK and open it on your phone. The first time,
              Android asks you to allow installs from your browser or file manager.
            </Text>
            <View style={[styles.ctaRow, !compact && styles.ctaRowStart]}>
              <DownloadButton />
              <BrowserButton />
            </View>
            <Text style={[styles.ctaNote, !compact && styles.ctaNoteStart]}>Version {APP_VERSION}</Text>
          </View>
          <PhoneShot />
        </Reveal>
      </View>

      <Reveal style={[styles.footer, compact && styles.footerCompact]}>
        <View style={[styles.footerBrand, compact && styles.footerBrandCompact]}>
          <Anchor href={LANDING_HOME_PATH} style={styles.brand}>
            <LogoMark size={24} />
            <Text style={styles.footerName}>Wickglow</Text>
          </Anchor>
          <Text style={styles.footerTagline}>A calm lofi Pomodoro study timer</Text>
        </View>
        <View style={[styles.footerLinks, compact && styles.footerLinksCompact]}>
          <TextLink href={APP_PATH} style={styles.footerLink} label="Open the app" />
          <TextLink href="/privacy" style={styles.footerLink} label="Privacy" />
          <TextLink href="/delete-account" style={styles.footerLink} label="Delete account" />
          <TextLink href={SOURCE_URL} external style={styles.footerLink} label="Source on GitHub" />
        </View>
      </Reveal>
    </ScrollView>
    </MotionContext.Provider>
  );
}

function DownloadButton() {
  const motion = useContext(MotionContext);
  return (
    <Anchor
      href={APK_URL}
      external
      style={[styles.button, styles.buttonPrimary, styles.buttonInner]}
      hoverStyle={[styles.buttonPrimaryOn, motion && styles.buttonUp]}
    >
      <DownloadIcon size={18} color={colors.textInverse} />
      <Text style={styles.buttonPrimaryText}>Download APK</Text>
    </Anchor>
  );
}

function BrowserButton() {
  const motion = useContext(MotionContext);
  return (
    <Anchor href={APP_PATH} style={[styles.button, styles.buttonGhost]} hoverStyle={[styles.buttonGhostOn, motion && styles.buttonUp]}>
      <Text style={styles.buttonGhostText}>Open in browser</Text>
    </Anchor>
  );
}

/**
 * A real `<a>` on web. react-native-web renders a View with `href` as an
 * anchor. Plain anchors, not expo-router's Link, because /privacy and
 * /delete-account are static files in `public/`, not app routes, so a
 * client-side navigation to them would land on the not-found screen.
 */
function Anchor({
  href,
  external = false,
  style,
  hoverStyle,
  children,
}: {
  href: string;
  external?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Added while the mouse is over the link. */
  hoverStyle?: StyleProp<ViewStyle>;
  /** Content, or a function of whether the mouse is over the link (to recolor text). */
  children: React.ReactNode | ((hovered: boolean) => React.ReactNode);
}) {
  const [hovered, hoverProps] = useHover();
  const webLink = {
    href,
    role: 'link',
    hrefAttrs: external ? { target: '_blank', rel: 'noopener noreferrer' } : undefined,
  } as object;
  return (
    <View {...webLink} {...hoverProps} style={[styles.link, style, hovered && hoverStyle]}>
      {typeof children === 'function' ? children(hovered) : children}
    </View>
  );
}

/** A text link that brightens under the mouse. */
function TextLink({ href, external, style, label }: { href: string; external?: boolean; style: StyleProp<TextStyle>; label: string }) {
  return (
    <Anchor href={href} external={external}>
      {(hovered) => <Text style={[style, styles.linkText, hovered && styles.linkTextOn]}>{label}</Text>}
    </Anchor>
  );
}

/**
 * One browser-style window of screenshots that loops forever. Swipe or scroll sideways,
 * press the arrows, or pick a scene tab; past the last slide it carries on to the first,
 * and back from the first to the last. It is a plain horizontal scroller with CSS
 * scroll snapping, so touch swiping, trackpads and keyboard scrolling all work. The
 * window takes the exact shape of the screenshots, so nothing is cropped or padded.
 *
 * The loop is a copy of the last slide before the first and a copy of the first
 * after the last. When a scroll settles on a copy, the view jumps (without
 * animating) to the real slide it copies, which looks identical, so it never
 * rewinds across the whole strip.
 */
const AUTO_SECONDS = 6;
// How many 140ms pauses (about a second) the tabs wait for an arrow, tab or
// autoplay scroll to arrive before trusting wherever the strip stopped.
const HEADING_MAX_WAITS = 7;

function Gallery({ slides }: { slides: readonly GallerySlide[] }) {
  const motion = useContext(MotionContext);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = slides.length;
  // Position in the strip of count + 2 panels: 0 is the copy of the last slide,
  // 1 to count are the real slides, count + 1 is the copy of the first.
  const rawRef = useRef(1);
  // Where an arrow press is heading, so quick presses add up instead of counting once.
  const pendingRef = useRef<number | null>(null);
  // Where a scroll the page started (arrow, tab, autoplay) is heading, until it settles.
  const headingRef = useRef<number | null>(null);
  // How many pauses that scroll has waited through without arriving.
  const headingWaitsRef = useRef(0);
  // Where the last scroll event put the strip.
  const lastRawRef = useRef(1);
  const widthRef = useRef(0);
  const [index, setIndex] = useState(0);
  // The window's width in pixels. Percentage widths do not resolve inside a
  // horizontal scroller, so each panel is sized in pixels once this is measured;
  // until then the first real slide fills the window, which is what the server renders.
  const [stageWidth, setStageWidth] = useState(0);
  // Autoplay: moves on every AUTO_SECONDS while the gallery is on screen, pauses
  // under the mouse, and stops for good once the visitor picks a slide themselves.
  const wrapRef = useRef<React.ComponentRef<typeof View>>(null);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, hoverProps] = useHover();
  const running = motion && auto && inView && !hovered && stageWidth > 0;

  const panels = [
    { key: `${slides[count - 1].id}-before`, slide: slides[count - 1] },
    ...slides.map((slide) => ({ key: slide.id, slide })),
    { key: `${slides[0].id}-after`, slide: slides[0] },
  ];

  const realIndex = (raw: number) => (((raw - 1) % count) + count) % count;

  const scrollToRaw = (raw: number, animated: boolean) => {
    rawRef.current = raw;
    headingRef.current = animated ? raw : null;
    headingWaitsRef.current = 0;
    setIndex(realIndex(raw));
    scroller.current?.scrollTo({ x: raw * widthRef.current, animated });
  };

  const step = (direction: 1 | -1) => {
    let base = pendingRef.current ?? rawRef.current;
    // Already on (or heading to) a copy at either end: jump to the real slide
    // it copies, which looks the same, and step on from there, so the press
    // is not lost against the end of the strip.
    if (base + direction > count + 1 || base + direction < 0) {
      base = base === 0 ? count : 1;
      scrollToRaw(base, false);
    }
    const target = base + direction;
    pendingRef.current = target;
    scrollToRaw(target, motion);
  };

  // Once scrolling has stopped on a copy, jump to the real slide it copies.
  const normalize = () => {
    if (rawRef.current === 0) scrollToRaw(count, false);
    else if (rawRef.current === count + 1) scrollToRaw(1, false);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    if (layoutMeasurement.width <= 0) return;
    const raw = Math.round(contentOffset.x / layoutMeasurement.width);
    lastRawRef.current = raw;
    // While an arrow, tab or autoplay scroll is on its way, the tab and caption
    // stay on the slide it is heading to. Following the scroll position would
    // flick them back to the old slide and forward again on the way.
    if (headingRef.current === null) {
      rawRef.current = raw;
      setIndex(realIndex(raw));
    }
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(settleScroll, 140);
  };

  // Scrolling has paused. A scroll the page started counts as done only once
  // the strip is on its target (a pause before it gets there is not the end),
  // or after HEADING_MAX_WAITS pauses, when it trusts wherever the strip stopped.
  const settleScroll = () => {
    const heading = headingRef.current;
    if (heading !== null) {
      if (lastRawRef.current !== heading && headingWaitsRef.current < HEADING_MAX_WAITS) {
        headingWaitsRef.current += 1;
        settle.current = setTimeout(settleScroll, 140);
        return;
      }
      headingRef.current = null;
      rawRef.current = lastRawRef.current;
      setIndex(realIndex(lastRawRef.current));
    }
    pendingRef.current = null;
    normalize();
  };

  // The visitor takes over: autoplay stops, and the tabs follow their scroll from now on.
  const takeOver = () => {
    setAuto(false);
    headingRef.current = null;
  };

  // A sideways trackpad or wheel scroll is the visitor choosing a slide.
  const onWheel = (event: { nativeEvent: WheelEvent }) => {
    if (Math.abs(event.nativeEvent.deltaX) > Math.abs(event.nativeEvent.deltaY)) takeOver();
  };

  const onLayout = (event: LayoutChangeEvent) => {
    widthRef.current = event.nativeEvent.layout.width;
    setStageWidth(event.nativeEvent.layout.width);
  };

  // Start on the first real slide, and keep the same slide in view after a resize.
  useEffect(() => {
    if (stageWidth > 0) scroller.current?.scrollTo({ x: rawRef.current * stageWidth, animated: false });
  }, [stageWidth]);

  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );

  // Autoplay only counts while at least part of the window is on screen.
  useEffect(() => {
    const node = wrapRef.current as unknown as HTMLElement | null;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => setInView(entries.some((entry) => entry.isIntersecting)), {
      threshold: 0.4,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The latest `step`, for the autoplay timer.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    if (!running) return undefined;
    const timer = setTimeout(() => stepRef.current(1), AUTO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [index, running]);

  return (
    // Keyboard focus on a gallery control is the visitor taking over, so autoplay stops for good.
    <View ref={wrapRef} {...hoverProps} {...({ onFocus: () => setAuto(false) } as object)}>
      {/* Warm light under the window, as if the screen glows onto the desk. */}
      <View style={styles.galleryGlow} pointerEvents="none" />
      <View style={styles.mac}>
        <View style={styles.macBar}>
          <View style={styles.macDots}>
            <View style={[styles.macDot, { backgroundColor: land.dotClose }]} />
            <View style={[styles.macDot, { backgroundColor: land.dotMin }]} />
            <View style={[styles.macDot, { backgroundColor: land.dotMax }]} />
          </View>
          <View style={styles.address} aria-hidden>
            <LockIcon size={11} color={colors.textMuted} />
            <Text numberOfLines={1} style={styles.addressText}>
              {GALLERY_ADDRESS}
            </Text>
          </View>
          {/* Balances the dots so the address sits in the middle. */}
          <View style={styles.macDots} />
        </View>
        {/* A swipe is the visitor choosing a slide, so autoplay stops. */}
        <View style={styles.viewport} onTouchStart={takeOver} {...({ onWheel } as object)}>
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onLayout={onLayout}
            style={[styles.scroller, { aspectRatio: slides[0].ratio }]}
          >
            {panels.map(({ key, slide }, position) => {
              const width = (stageWidth > 0 ? stageWidth : position === 1 ? '100%' : 0) as ViewStyle['width'];
              const isCopy = position === 0 || position === count + 1;
              return (
                <View key={key} style={[styles.slide, { width }]} aria-hidden={isCopy || undefined}>
                  <Image
                    source={slide.source}
                    alt={isCopy ? '' : slide.alt}
                    resizeMode="cover"
                    style={styles.slideFill}
                  />
                </View>
              );
            })}
          </ScrollView>
          <Pressable
            role="button"
            aria-label="Previous screenshot"
            onPress={() => {
              setAuto(false);
              step(-1);
            }}
            style={[styles.arrow, styles.arrowLeft]}
          >
            <ChevronLeftIcon size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            role="button"
            aria-label="Next screenshot"
            onPress={() => {
              setAuto(false);
              step(1);
            }}
            style={[styles.arrow, styles.arrowRight]}
          >
            <ChevronIcon size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.tabs} role="tablist" aria-label="Screenshots">
        {slides.map((slide, position) => {
          const on = position === index;
          return (
            <Pressable
              key={slide.id}
              role="tab"
              aria-selected={on}
              aria-label={`Show the ${slide.label} screenshot`}
              onPress={() => {
                // A tab names its slide outright: an arrow press still settling must not add to it.
                pendingRef.current = null;
                setAuto(false);
                scrollToRaw(position + 1, motion);
              }}
              style={[styles.tab, on && styles.tabOn]}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{slide.label}</Text>
              {/* How long until autoplay moves on: fills once, then starts over on the next slide. */}
              {on && running ? (
                <View
                  key={index}
                  pointerEvents="none"
                  style={[styles.tabTimer, FRAMES.fill, web({ animationDuration: `${AUTO_SECONDS}s`, animationTimingFunction: 'linear', animationFillMode: 'both' })]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {/* Autoplay changes are not announced; a slide the visitor picks is. */}
      <Text style={styles.galleryCaption} aria-live={running ? 'off' : 'polite'}>
        {slides[index]?.caption}
      </Text>
    </View>
  );
}

/** The phone screenshot in a slim device frame. It floats gently, like the hero widgets. */
function PhoneShot() {
  const motion = useContext(MotionContext);
  return (
    <View style={[styles.phone, motion && loop(FRAMES.float, 7)]}>
      <View style={[styles.phoneScreen, { aspectRatio: PHONE_SHOT.ratio }]}>
        <Image source={PHONE_SHOT.source} alt={PHONE_SHOT.alt} resizeMode="cover" style={styles.slideFill} />
      </View>
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  align?: 'center' | 'start';
}) {
  const start = align === 'start';
  return (
    <Reveal style={[styles.sectionHead, start && styles.sectionHeadStart]}>
      <Text style={[styles.eyebrow, start && styles.textStart]}>{eyebrow}</Text>
      <Text role="heading" aria-level={2} style={[styles.sectionTitle, start && styles.textStart]}>
        {title}
      </Text>
    </Reveal>
  );
}

/** A card's title and short text. */
function BentoCopy({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.bentoCopy}>
      <Text role="heading" aria-level={3} style={styles.bentoTitle}>
        {title}
      </Text>
      <Text style={styles.bentoBody}>{body}</Text>
    </View>
  );
}

// Where each hero ember starts (% across the hero), its size, how long one
// rise takes, its delay, and which way it sways. Fixed, so every visit looks the same.
const EMBERS = [
  { left: 9, size: 4, seconds: 9, delay: 0, sway: RISE_RIGHT },
  { left: 17, size: 3, seconds: 11, delay: 3.2, sway: RISE_LEFT },
  { left: 26, size: 5, seconds: 10, delay: 6.1, sway: RISE_RIGHT },
  { left: 34, size: 3, seconds: 12, delay: 1.4, sway: RISE_LEFT },
  { left: 42, size: 4, seconds: 9.5, delay: 7.8, sway: RISE_RIGHT },
  { left: 50, size: 3, seconds: 11.5, delay: 4.6, sway: RISE_LEFT },
  { left: 58, size: 5, seconds: 10.5, delay: 2.3, sway: RISE_RIGHT },
  { left: 66, size: 3, seconds: 12.5, delay: 8.9, sway: RISE_LEFT },
  { left: 74, size: 4, seconds: 9, delay: 5.4, sway: RISE_RIGHT },
  { left: 83, size: 3, seconds: 11, delay: 0.8, sway: RISE_LEFT },
  { left: 91, size: 4, seconds: 10, delay: 6.9, sway: RISE_RIGHT },
];

/** Warm embers drifting up behind the hero copy. Decoration, drawn only in the browser with motion allowed. */
function HeroEmbers() {
  return (
    <View style={styles.embers} pointerEvents="none" aria-hidden>
      {EMBERS.map((ember) => (
        <View
          key={ember.left}
          style={[
            styles.ember,
            {
              left: `${ember.left}%`,
              width: ember.size,
              height: ember.size,
              borderRadius: ember.size / 2,
            },
            loop(ember.sway, ember.seconds, ember.delay, 'linear'),
          ]}
        />
      ))}
    </View>
  );
}

/** Four sample widgets around the hero: the app's own pieces, as decoration. */
function HeroWidgets() {
  const motion = useContext(MotionContext);
  const { level, left: xp, need: xpToNext } = SAMPLE_LEVEL;
  const ring = 22;
  const circumference = 2 * Math.PI * ring;
  const bars = [8, 14, 20, 12, 26, 18, 30, 16, 24, 10, 20, 14, 8];
  return (
    <View style={styles.widgets} pointerEvents="none" aria-hidden>
      <View style={[styles.widget, styles.widgetTimer, motion && loop(FRAMES.float, 6)]}>
        <Svg width={54} height={54} viewBox="0 0 54 54">
          <Circle cx={27} cy={27} r={ring} stroke={fade('#FFFFFF', 0.1)} strokeWidth={4} fill="none" />
          <Circle
            cx={27}
            cy={27}
            r={ring}
            stroke={land.accent}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.72} ${circumference}`}
            transform="rotate(-90 27 27)"
          />
        </Svg>
        <View>
          <Text style={styles.widgetTime}>{HERO_SAMPLE.time}</Text>
          <Text style={styles.widgetCaps}>{HERO_SAMPLE.timeCaption}</Text>
        </View>
      </View>

      <View style={[styles.widget, styles.widgetStreak, motion && loop(FRAMES.float, 7, 1.2)]}>
        <View style={styles.tile}>
          <FlameIcon size={18} color={land.accent} />
        </View>
        <View>
          <Text style={styles.widgetTitle}>{HERO_SAMPLE.streakTitle}</Text>
          <Text style={styles.widgetSmall}>{HERO_SAMPLE.streakCaption}</Text>
        </View>
      </View>

      <View style={[styles.widget, styles.widgetLevel, motion && loop(FRAMES.float, 6.5, 0.6)]}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{level}</Text>
        </View>
        <View style={styles.levelBody}>
          <Text style={styles.widgetTitle}>Level {level}</Text>
          <Text style={styles.widgetSmall}>
            {xp} / {xpToNext} XP
          </Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round((xp / xpToNext) * 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={[styles.widget, styles.widgetMix, motion && loop(FRAMES.float, 7.5, 1.8)]}>
        <Text style={styles.widgetCaps}>{HERO_SAMPLE.mixLabel}</Text>
        <Text style={styles.widgetTitle}>{HERO_SAMPLE.mix}</Text>
        <View style={styles.wave}>
          {bars.map((height, index) => (
            <View key={index} style={[styles.waveBar, { height }, motion && loop(FRAMES.pulse, 1.3, index * 0.11)]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const MAX = 1040;
const WIDE = 1296;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: land.bg,
  },
  pageContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    overflow: 'hidden',
  },

  // Background light
  glow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowHaze: {
    top: -260,
    left: -240,
    width: 760,
    height: 620,
    backgroundColor: fade(land.haze, 0.38),
    filter: 'blur(140px)',
  },
  glowHero: {
    // A warm glow behind the hero heading.
    top: 150,
    width: 900,
    height: 600,
    backgroundColor: fade(colors.flame3, 0.3),
    filter: 'blur(180px)',
  },
  glowRight: {
    top: 2100,
    right: -300,
    width: 640,
    height: 640,
    backgroundColor: fade(colors.flame3, 0.14),
    filter: 'blur(150px)',
  },

  // Nav
  nav: {
    width: '100%',
    maxWidth: MAX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 22,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  navLinkText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  navButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fade(land.accent, 0.5),
    backgroundColor: fade(land.accent, 0.06),
  },
  navButtonOn: {
    borderColor: land.accent,
    backgroundColor: fade(land.accent, 0.14),
  },
  navButtonText: {
    color: land.accentSoft,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },

  // Hero
  hero: web({
    width: '100%',
    maxWidth: WIDE,
    alignItems: 'center',
    paddingTop: 'clamp(32px, 8vw, 96px)',
    paddingBottom: 'clamp(36px, 6vw, 72px)',
  }),
  heroCopy: {
    width: '100%',
    maxWidth: 720,
    alignItems: 'center',
    marginBottom: 52,
    marginTop: 42,
  },
  embers: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  ember: {
    position: 'absolute',
    bottom: '12%',
    opacity: 0,
    backgroundColor: land.accent,
    boxShadow: `0 0 10px ${fade(land.accent, 0.9)}`,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: land.accent,
    boxShadow: `0 0 8px ${land.accent}`,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fade(land.accent, 0.4),
    backgroundColor: fade(land.accent, 0.08),
    marginBottom: 28,
  },
  eyebrowPillText: {
    color: land.accentSoft,
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  eyebrow: {
    color: land.accent,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  heroTitle: web({
    color: colors.textPrimary,
    fontFamily: fonts.time,
    fontSize: 'clamp(46px, 8vw, 96px)',
    lineHeight: 'clamp(54px, 9vw, 108px)',
    textAlign: 'center',
    marginBottom: 24,
    // The title is wider than the copy column, so it may overflow its sides.
    width: '100vw',
    maxWidth: 1000,
    fontWeight: 'bold'
  }),
  heroAccent: {
    color: land.accent,
  },
  heroBody: web({
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 27,
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: 28,
    textWrap: 'pretty',
  }),
  // The two buttons share the row equally, so they line up on a phone.
  ctaRow: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  ctaNote: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 18,
    textAlign: 'center',
  },

  // Buttons
  button: web({
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 140,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 'clamp(14px, 4vw, 24px)',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonPrimary: web({
    backgroundColor: land.accentSoft,
    experimental_backgroundImage: `linear-gradient(180deg, ${land.buttonTop}, ${land.buttonBottom})`,
    boxShadow: `0 8px 32px ${fade(colors.flame3, 0.35)}`,
  }),
  buttonPrimaryText: web({
    color: colors.textInverse,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    whiteSpace: 'nowrap',
  }),
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.glassEdgeOn,
    backgroundColor: land.card,
  },
  // Hover: the main button glows brighter, the other warms its border; both rise a touch.
  buttonPrimaryOn: {
    boxShadow: `0 12px 40px ${fade(colors.flame3, 0.55)}`,
  },
  buttonGhostOn: {
    borderColor: fade(land.accent, 0.55),
    backgroundColor: fade(land.accent, 0.08),
  },
  buttonUp: {
    transform: [{ translateY: -2 }],
  },
  // Every landing link eases its hover changes.
  link: web({
    transitionProperty: 'transform, box-shadow, border-color, background-color',
    transitionDuration: '220ms',
    transitionTimingFunction: 'ease-out',
  }),
  linkText: web({
    transitionProperty: 'color',
    transitionDuration: '220ms',
  }),
  linkTextOn: {
    color: land.accentSoft,
  },
  buttonGhostText: web({
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    whiteSpace: 'nowrap',
  }),

  // Floating widgets
  widgets: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    height: 420,
  },
  widget: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: fade(land.cardSolid, 0.9),
    boxShadow: `0 18px 50px ${fade('#000000', 0.45)}`,
  },
  widgetTimer: {
    top: 0,
    left: 0,
    paddingRight: 22,
  },
  widgetStreak: {
    top: 0,
    right: 0,
    paddingRight: 22,
  },
  widgetLevel: {
    top: 400,
    left: 0,
    width: 250,
  },
  widgetMix: {
    top: 390,
    right: 0,
    width: 200,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  widgetTime: {
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 26,
    fontVariant: ['tabular-nums'],
  },
  widgetCaps: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  widgetTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
  widgetSmall: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: land.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
  levelBody: {
    flex: 1,
    gap: 2,
  },
  xpTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: fade('#FFFFFF', 0.1),
    marginTop: 6,
    overflow: 'hidden',
  },
  xpFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: land.accent,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 32,
    marginTop: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: land.accent,
  },

  // Strip: a slim bar between two hairlines, no card.
  strip: {
    width: '100%',
    maxWidth: MAX,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: 12,
    columnGap: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  stripLabel: {
    color: fade(colors.textPrimary, 0.85),
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  // On a phone: a 2 by 2 grid, each label wrapping beside its icon.
  stripCompact: {
    justifyContent: 'flex-start',
    columnGap: 12,
    rowGap: 14,
  },
  stripItemCompact: {
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'flex-start',
  },
  stripIconCompact: {
    marginTop: 2,
  },
  stripLabelCompact: {
    flexShrink: 1,
    lineHeight: 19,
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: land.tile,
  },
  tileLarge: {
    width: 40,
    height: 40,
    marginBottom: 18,
  },


  // Sections
  section: web({
    width: '100%',
    maxWidth: MAX,
    paddingTop: 'clamp(56px, 11vw, 104px)',
  }),
  sectionHead: web({
    alignItems: 'center',
    marginBottom: 'clamp(24px, 5vw, 40px)',
    gap: 12,
  }),
  sectionTitle: web({
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 'clamp(30px, 4.4vw, 44px)',
    lineHeight: 'clamp(38px, 5.4vw, 54px)',
    textAlign: 'center',
    textWrap: 'balance',
  }),
  // Gallery: a browser-style window (bezel, title bar with dots and an address pill) around the shots.
  mac: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: fade('#FFFFFF', 0.05),
    padding: 8,
    boxShadow: `0 30px 80px ${fade('#000000', 0.55)}, 0 0 120px ${fade(colors.flame3, 0.1)}`,
  },
  galleryGlow: web({
    position: 'absolute',
    left: '12%',
    right: '12%',
    bottom: -30,
    height: '45%',
    borderRadius: 9999,
    backgroundColor: fade(colors.flame3, 0.3),
    filter: 'blur(90px)',
  }),
  macBar: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: land.cardSolid,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: land.cardEdge,
  },
  macDots: {
    width: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  address: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    width: 280,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: fade('#FFFFFF', 0.05),
  },
  addressText: {
    flexShrink: 1,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  macDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  viewport: {
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: land.cardSolid,
  },
  scroller: web({
    width: '100%',
    flexGrow: 0,
    scrollSnapType: 'x mandatory',
  }),
  slide: web({
    height: '100%',
    overflow: 'hidden',
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
  }),
  // A local image keeps its own pixel size unless told otherwise, so fill its box explicitly.
  slideFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  phone: {
    width: 'clamp(190px, 58vw, 240px)' as unknown as number,
    flexShrink: 0,
    padding: 6,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: fade('#FFFFFF', 0.06),
    boxShadow: `0 24px 70px ${fade('#000000', 0.6)}`,
  },
  phoneScreen: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: land.cardSolid,
  },
  arrow: web({
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fade(land.bg, 0.55),
    borderWidth: 1,
    borderColor: colors.glassEdge,
    backdropFilter: 'blur(12px)',
    cursor: 'pointer',
  }),
  arrowLeft: {
    left: 14,
  },
  arrowRight: {
    right: 14,
  },
  // Scene tabs under the window: one segmented pill, the shown slide lit in Amber.
  tabs: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    marginTop: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: land.card,
  },
  tab: web({
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 'clamp(12px, 3vw, 20px)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '250ms',
  }),
  tabOn: {
    backgroundColor: fade(land.accent, 0.14),
    borderColor: fade(land.accent, 0.4),
  },
  // The autoplay timer under the active tab's label.
  tabTimer: web({
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: fade(land.accent, 0.7),
    transformOrigin: 'left',
  }),
  tabText: web({
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    whiteSpace: 'nowrap',
  }),
  tabTextOn: {
    color: land.accentSoft,
  },
  galleryCaption: web({
    alignSelf: 'center',
    maxWidth: 520,
    minHeight: 44,
    marginTop: 14,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    textWrap: 'balance',
  }),
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    flexGrow: 1,
    flexBasis: 280,
    padding: 20,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: land.card,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    marginBottom: 8,
  },
  cardBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },

  sectionHeadStart: {
    alignItems: 'flex-start',
  },
  textStart: {
    textAlign: 'left',
  },

  // Bento grid for "What's inside"
  bentoGrid: {
    gap: 14,
  },
  bentoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  // Each card's flexBasis is the width it wants on a wide screen. React Native's
  // flexShrink defaults to 0, so without these two a card wider than a phone
  // keeps that width and spills off the right edge.
  bento: web({
    flexShrink: 1,
    minWidth: 0,
    padding: 'clamp(16px, 4vw, 22px)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: land.card,
    justifyContent: 'space-between',
    gap: 18,
  }),
  // Hover on a feature card (`Reveal lift`): the border warms, a soft glow
  // spreads, the card rises a little, and a light follows the pointer.
  lift: web({
    cursor: 'default',
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  }),
  liftOn: {
    borderColor: fade(land.accent, 0.38),
    boxShadow: `0 18px 48px ${fade('#000000', 0.45)}, 0 0 36px ${fade(land.accent, 0.12)}`,
  },
  liftUp: {
    transform: [{ translateY: -4 }],
  },
  spot: web({
    ...StyleSheet.absoluteFill,
    borderRadius: 'inherit',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '300ms',
  }),
  spotOn: {
    opacity: 1,
  },
  // Cards with a picture beside the text align both to the top; the others keep the picture on top and the text at the bottom.
  bentoCandle: { flexGrow: 1.7, flexBasis: 420, justifyContent: 'flex-start' },
  bentoXp: { flexGrow: 1, flexBasis: 250 },
  bentoTasks: { flexGrow: 1, flexBasis: 320 },
  bentoSounds: { flexGrow: 1, flexBasis: 320 },
  bentoCalendar: { flexGrow: 1.15, flexBasis: 520, justifyContent: 'flex-start' },
  bentoSync: { flexGrow: 1, flexBasis: 340, justifyContent: 'flex-start' },
  bentoSplit: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    columnGap: 24,
    rowGap: 18,
  },
  bentoText: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    flexBasis: 200,
    gap: 12,
  },
  bentoCopy: {
    gap: 8,
  },
  bentoTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 17,
    lineHeight: 23,
  },
  bentoBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fade(land.accent, 0.45),
    backgroundColor: fade(land.accent, 0.08),
  },
  badgeText: {
    color: land.accentSoft,
    fontFamily: fonts.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },


  // Download
  download: web({
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 'clamp(24px, 6vw, 64px)',
    rowGap: 32,
    paddingVertical: 'clamp(36px, 7vw, 56px)',
    paddingHorizontal: 'clamp(20px, 5vw, 56px)',
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: fade(land.accent, 0.25),
    backgroundColor: fade(colors.flame3, 0.05),
    overflow: 'hidden',
  }),
  downloadGlow: {
    position: 'absolute',
    top: -140,
    left: 0,
    width: 560,
    height: 300,
    borderRadius: 280,
    backgroundColor: fade(colors.flame3, 0.28),
    filter: 'blur(90px)',
  },
  downloadCopy: {
    flexGrow: 1,
    flexBasis: 300,
    maxWidth: 460,
    alignItems: 'flex-start',
    gap: 14,
  },
  downloadCopyCompact: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  downloadTitle: web({
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 'clamp(28px, 4vw, 40px)',
    lineHeight: 'clamp(36px, 5vw, 48px)',
  }),
  downloadBody: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 10,
  },
  downloadTextCompact: {
    textAlign: 'center',
  },
  ctaRowStart: {
    justifyContent: 'flex-start',
  },
  ctaNoteStart: {
    textAlign: 'left',
    marginTop: 4,
  },

  // Footer
  footer: {
    width: '100%',
    maxWidth: MAX,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    paddingTop: 32,
    marginTop: 72,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerCompact: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 28,
  },
  footerBrand: {
    gap: 6,
  },
  footerBrandCompact: {
    alignItems: 'center',
  },
  footerName: {
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 18,
  },
  footerTagline: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 24,
    rowGap: 12,
  },
  footerLinksCompact: {
    justifyContent: 'center',
    columnGap: 20,
    maxWidth: 320,
  },
  footerLink: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    paddingVertical: 4,
  },
});
