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
import { APP_PATH } from './returning-visitor';
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
const FLOAT = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
  '100%': { transform: [{ translateY: 0 }] },
};
const BREATHE = { '0%': { opacity: 0.7 }, '50%': { opacity: 1 }, '100%': { opacity: 0.7 } };
const PULSE = {
  '0%': { transform: [{ scaleY: 0.45 }] },
  '50%': { transform: [{ scaleY: 1 }] },
  '100%': { transform: [{ scaleY: 0.45 }] },
};

function loop(keyframes: object, seconds: number, delaySeconds = 0) {
  return web({
    animationKeyframes: keyframes,
    animationDuration: `${seconds}s`,
    animationDelay: `${delaySeconds}s`,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  });
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
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const motion = useContext(MotionContext);
  const ref = useRef<React.ComponentRef<typeof View>>(null);
  const [phase, setPhase] = useState<'visible' | 'hidden' | 'shown'>('visible');

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
    <View ref={ref} style={[style, phaseStyle]}>
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
      <View style={[styles.glow, styles.glowHero, motion && loop(BREATHE, 9)]} pointerEvents="none" />
      <View style={[styles.glow, styles.glowRight]} pointerEvents="none" />

      <View style={styles.nav}>
        <View style={styles.brand}>
          <LogoMark size={28} />
          <Text style={styles.brandText}>Wickglow</Text>
        </View>
        <View style={styles.navRight}>
          {compact ? null : (
            <View style={styles.navLinks}>
              <Anchor href="#features">
                <Text style={styles.navLinkText}>Features</Text>
              </Anchor>
              <Anchor href="#android">
                <Text style={styles.navLinkText}>Android</Text>
              </Anchor>
            </View>
          )}
          <Anchor href={APP_PATH} style={styles.navButton}>
            <Text style={styles.navButtonText}>Open the app</Text>
          </Anchor>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        {showWidgets ? <HeroWidgets /> : null}
        <View style={styles.heroCopy}>
          <View style={styles.eyebrowPill}>
            <Text style={styles.eyebrowPillText}>Lofi Pomodoro study timer</Text>
          </View>
          <Text role="heading" aria-level={1} style={styles.heroTitle}>
            Get the work <Text style={styles.heroAccent}>done.</Text>
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
      <View style={[styles.section, styles.sectionWide]}>
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
            <Reveal style={[styles.bento, styles.bentoCandle]}>
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
            <Reveal style={[styles.bento, styles.bentoXp]} delay={90}>
              <LevelPreview />
              <BentoCopy title={BENTO.xp.title} body={BENTO.xp.body} />
            </Reveal>
          </View>
          <View style={styles.bentoRow}>
            <Reveal style={[styles.bento, styles.bentoTasks]}>
              <TasksPreview />
              <BentoCopy title={BENTO.tasks.title} body={BENTO.tasks.body} />
            </Reveal>
            <Reveal style={[styles.bento, styles.bentoSounds]} delay={90}>
              <MixerPreview />
              <BentoCopy title={BENTO.sounds.title} body={BENTO.sounds.body} />
            </Reveal>
          </View>
          <View style={styles.bentoRow}>
            <Reveal style={[styles.bento, styles.bentoCalendar]}>
              <View style={styles.bentoSplit}>
                <CalendarPreview />
                <View style={styles.bentoText}>
                  <BentoCopy title={BENTO.calendar.title} body={BENTO.calendar.body} />
                  <CalendarNotes />
                </View>
              </View>
            </Reveal>
            <Reveal style={[styles.bento, styles.bentoSync]} delay={90}>
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
          <View style={styles.brand}>
            <LogoMark size={24} />
            <Text style={styles.footerName}>Wickglow</Text>
          </View>
          <Text style={styles.footerTagline}>A calm lofi Pomodoro study timer</Text>
        </View>
        <View style={[styles.footerLinks, compact && styles.footerLinksCompact]}>
          <Anchor href={APP_PATH}>
            <Text style={styles.footerLink}>Open the app</Text>
          </Anchor>
          <Anchor href="/privacy">
            <Text style={styles.footerLink}>Privacy</Text>
          </Anchor>
          <Anchor href="/delete-account">
            <Text style={styles.footerLink}>Delete account</Text>
          </Anchor>
          <Anchor href={SOURCE_URL} external>
            <Text style={styles.footerLink}>Source on GitHub</Text>
          </Anchor>
        </View>
      </Reveal>
    </ScrollView>
    </MotionContext.Provider>
  );
}

function DownloadButton() {
  return (
    <Anchor href={APK_URL} external style={[styles.button, styles.buttonPrimary, styles.buttonInner]}>
      <DownloadIcon size={18} color={colors.textInverse} />
      <Text style={styles.buttonPrimaryText}>Download APK</Text>
    </Anchor>
  );
}

function BrowserButton() {
  return (
    <Anchor href={APP_PATH} style={[styles.button, styles.buttonGhost]}>
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
  children,
}: {
  href: string;
  external?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const webLink = {
    href,
    role: 'link',
    hrefAttrs: external ? { target: '_blank', rel: 'noopener noreferrer' } : undefined,
  } as object;
  return (
    <View {...webLink} style={style}>
      {children}
    </View>
  );
}

/**
 * One Mac-style window of screenshots that loops forever. Swipe or scroll sideways,
 * press the arrows, or use the dots; past the last slide it carries on to the first,
 * and back from the first to the last. It is a plain horizontal scroller with CSS
 * scroll snapping, so touch swiping, trackpads and keyboard scrolling all work. The
 * window takes the exact shape of the screenshots, so nothing is cropped or padded.
 *
 * The loop is a copy of the last slide before the first and a copy of the first
 * after the last. When a scroll settles on a copy, the view jumps (without
 * animating) to the real slide it copies, which looks identical, so it never
 * rewinds across the whole strip.
 */
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
  const widthRef = useRef(0);
  const [index, setIndex] = useState(0);
  // The window's width in pixels. Percentage widths do not resolve inside a
  // horizontal scroller, so each panel is sized in pixels once this is measured;
  // until then the first real slide fills the window, which is what the server renders.
  const [stageWidth, setStageWidth] = useState(0);

  const panels = [
    { key: `${slides[count - 1].id}-before`, slide: slides[count - 1] },
    ...slides.map((slide) => ({ key: slide.id, slide })),
    { key: `${slides[0].id}-after`, slide: slides[0] },
  ];

  const realIndex = (raw: number) => (((raw - 1) % count) + count) % count;

  const scrollToRaw = (raw: number, animated: boolean) => {
    rawRef.current = raw;
    setIndex(realIndex(raw));
    scroller.current?.scrollTo({ x: raw * widthRef.current, animated });
  };

  const step = (direction: 1 | -1) => {
    const base = pendingRef.current ?? rawRef.current;
    const target = Math.max(0, Math.min(count + 1, base + direction));
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
    rawRef.current = raw;
    setIndex(realIndex(raw));
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      pendingRef.current = null;
      normalize();
    }, 140);
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

  return (
    <View>
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
        <View style={styles.viewport}>
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
            onPress={() => step(-1)}
            style={[styles.arrow, styles.arrowLeft]}
          >
            <ChevronLeftIcon size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            role="button"
            aria-label="Next screenshot"
            onPress={() => step(1)}
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
              onPress={() => scrollToRaw(position + 1, motion)}
              style={[styles.tab, on && styles.tabOn]}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{slide.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.galleryCaption} aria-live="polite">
        {slides[index]?.caption}
      </Text>
    </View>
  );
}

/** The phone screenshot in a slim device frame. */
function PhoneShot() {
  return (
    <View style={styles.phone}>
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

/** Four sample widgets around the hero: the app's own pieces, as decoration. */
function HeroWidgets() {
  const motion = useContext(MotionContext);
  const { level, left: xp, need: xpToNext } = SAMPLE_LEVEL;
  const ring = 22;
  const circumference = 2 * Math.PI * ring;
  const bars = [8, 14, 20, 12, 26, 18, 30, 16, 24, 10, 20, 14, 8];
  return (
    <View style={styles.widgets} pointerEvents="none" aria-hidden>
      <View style={[styles.widget, styles.widgetTimer, motion && loop(FLOAT, 6)]}>
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

      <View style={[styles.widget, styles.widgetStreak, motion && loop(FLOAT, 7, 1.2)]}>
        <View style={styles.tile}>
          <FlameIcon size={18} color={land.accent} />
        </View>
        <View>
          <Text style={styles.widgetTitle}>{HERO_SAMPLE.streakTitle}</Text>
          <Text style={styles.widgetSmall}>{HERO_SAMPLE.streakCaption}</Text>
        </View>
      </View>

      <View style={[styles.widget, styles.widgetLevel, motion && loop(FLOAT, 6.5, 0.6)]}>
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

      <View style={[styles.widget, styles.widgetMix, motion && loop(FLOAT, 7.5, 1.8)]}>
        <Text style={styles.widgetCaps}>{HERO_SAMPLE.mixLabel}</Text>
        <Text style={styles.widgetTitle}>{HERO_SAMPLE.mix}</Text>
        <View style={styles.wave}>
          {bars.map((height, index) => (
            <View key={index} style={[styles.waveBar, { height }, motion && loop(PULSE, 1.3, index * 0.11)]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const MAX = 1040;
const WIDE = 1296;
/** The gallery breaks out of the text column so the screenshots read at a useful size. */
const GALLERY_MAX = 1200;

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
    top: 380,
    width: 900,
    height: 560,
    backgroundColor: fade(colors.flame3, 0.26),
    filter: 'blur(150px)',
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
  eyebrowPill: {
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
  // Gallery: a Mac-style window (bezel, title bar with three dots) around the shots.
  mac: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: land.cardEdge,
    backgroundColor: fade('#FFFFFF', 0.05),
    padding: 8,
    boxShadow: `0 30px 80px ${fade('#000000', 0.55)}, 0 0 120px ${fade(colors.flame3, 0.1)}`,
  },
  sectionWide: {
    maxWidth: GALLERY_MAX,
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
