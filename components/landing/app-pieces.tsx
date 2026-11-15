import Slider from '@react-native-community/slider';
import React, { useSyncExternalStore } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Candle } from '@/components/wickglow/features/clock/candle';
import { LevelCardView } from '@/components/wickglow/features/progression/level-card';
import { DayCell } from '@/components/wickglow/features/progression/month-calendar';
import { CheckBox, FocusButton, taskListStyles as task } from '@/components/wickglow/features/tasks/task-list';
import { accountRowStyles as account } from '@/components/wickglow/features/account/account-row';
import { ChevronIcon, FlameIcon } from '@/components/wickglow/shared/icons';
import { panelStyles as panel } from '@/components/wickglow/shared/panel-styles';
import { MOODS, monthGrid } from '@/components/wickglow/theme';
import { AMBIENT_SOUNDS } from '@/src/core/ambient';
import type { DayHistory } from '@/src/core/types';
import { levelInfo } from '@/src/core/xp';
import { colors, fade, fonts } from '@/src/theme/tokens';

// The "What's inside" pictures on the web landing page. They are the app's own
// pieces, drawn with the app's own components and styles, so they look exactly
// like the app, fed with sample values instead of a live session. Each one is
// decoration: hidden from screen readers and not pressable.

const AMBER = MOODS.find((mood) => mood.id === 'amber') ?? MOODS[0];
const NO_TOUCH = 'none' as const;

function subscribe() {
  return () => {};
}

/** False on the server render, true in the browser: the animated pieces draw only there. */
function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** Web-only CSS that React Native's style types do not list. */
function web(style: object): ViewStyle {
  return style as ViewStyle;
}

const noop = () => {};

/** Three of the app's candles at different heights, on the Amber phone background. */
export function CandlesPreview({ times }: { times: readonly string[] }) {
  const client = useIsClient();
  const levels = [1, 0.52, 0.12];
  return (
    <View style={styles.candles} aria-hidden pointerEvents={NO_TOUCH}>
      {client
        ? levels.map((progress, position) => (
            <View key={position} style={styles.candleCol}>
              <View style={styles.candleBox}>
                <Candle
                  progress={progress}
                  lit
                  paused={false}
                  idle={false}
                  smoke={false}
                  dimming={false}
                  mode="focus"
                  mood={AMBER}
                  swap={0}
                />
              </View>
              <Text style={styles.candleTime}>{times[position]}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

// Level 6 with 92 of 350 XP into it, which is what 1092 total XP is in the app's own rules.
const SAMPLE_LEVEL = levelInfo(1092);

/** The app's level card (ring, name, XP bar), with the streak under it. */
export function LevelPreview() {
  return (
    <View style={styles.level} aria-hidden pointerEvents={NO_TOUCH}>
      <LevelCardView
        level={SAMPLE_LEVEL.level}
        levelName={SAMPLE_LEVEL.name}
        xpInLevel={SAMPLE_LEVEL.left}
        xpNeeded={SAMPLE_LEVEL.need}
        accent={AMBER.accent}
        desk
      />
      <View style={[panel.mini, styles.streak]}>
        <FlameIcon size={14} color={AMBER.flame2} />
        <Text style={panel.miniText}>{SAMPLE_STREAK} day streak</Text>
      </View>
    </View>
  );
}

/** Task rows built from the app's own checkbox, focus button and row styles. */
export function TasksPreview() {
  const rows = [
    { id: 1, title: 'Chapter 4 notes', done: false, active: true, subs: '1/3' },
    { id: 2, title: 'Practice problems', done: false, active: false, subs: '+ Sub' },
    { id: 3, title: 'Read the intro', done: true, active: false, subs: '' },
  ];
  return (
    <View style={[task.list, { marginTop: 0 }]} aria-hidden pointerEvents={NO_TOUCH}>
      {rows.map((row) => (
        <View
          key={row.id}
          style={[
            task.item,
            row.active ? { borderColor: fade(AMBER.accent, 0.7), backgroundColor: fade(AMBER.accent, 0.07) } : null,
          ]}
        >
          <View style={task.row}>
            <CheckBox on={row.done} accent={AMBER.accent} label="" onPress={noop} />
            <View style={task.titleBtn}>
              <Text style={[task.title, row.done ? task.done : null]} numberOfLines={1}>
                {row.title}
              </Text>
            </View>
            {row.done ? null : (
              <>
                <View style={[task.subBtn, row.subs !== '+ Sub' ? task.subBtnOn : null]}>
                  <Text style={task.subBtnText}>{row.subs}</Text>
                  {row.subs !== '+ Sub' ? <ChevronIcon size={10} color={fade(colors.textPrimary, 0.45)} /> : null}
                </View>
                <FocusButton on={row.active} accent={AMBER.accent} label="" onPress={noop} />
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// Sample ambient levels, 0 to 100, in the order the mixer shows them.
const SAMPLE_MIX: Record<string, number> = { rain: 70, cafe: 25, fire: 45 };

/** The app's ambient mixer: its heading, "Turn off" button and sliders. */
export function MixerPreview() {
  const client = useIsClient();
  return (
    <View style={styles.mixer} aria-hidden pointerEvents={NO_TOUCH}>
      <View style={panel.mixHead}>
        <Text style={[panel.kicker, panel.mixKicker, panel.kickerLg]}>Ambient sounds</Text>
        <View style={panel.mini}>
          <Text style={panel.miniText}>Turn off</Text>
        </View>
      </View>
      {AMBIENT_SOUNDS.filter((sound) => sound.key in SAMPLE_MIX).map((sound) => (
        <View key={sound.key} style={panel.mixRow}>
          <Text style={panel.mixLabel}>{sound.label}</Text>
          {client ? (
            <Slider
              style={panel.slider}
              minimumValue={0}
              maximumValue={100}
              value={SAMPLE_MIX[sound.key]}
              disabled
              minimumTrackTintColor={AMBER.accent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={AMBER.accent}
            />
          ) : (
            <View style={panel.slider} />
          )}
          <Text style={panel.mixValue}>{SAMPLE_MIX[sound.key]}</Text>
        </View>
      ))}
    </View>
  );
}

// A fixed sample month: Nov 2026, today the 26th, with a week-long streak ending today.
const SAMPLE_NOW = new Date(2026, 10, 26, 12).getTime();
const SAMPLE_MINUTES: Record<number, number> = {
  1: 50, 2: 25, 3: 75, 4: 25, 6: 100, 7: 50, 9: 25, 10: 60, 11: 90, 12: 30, 13: 25, 14: 120,
  16: 50, 18: 75, 19: 25, 20: 60, 21: 50, 22: 90, 23: 25, 24: 120, 25: 75, 26: 50,
};
const SAMPLE_STREAK = 7;

function sampleHistory(): DayHistory {
  const days: DayHistory = {};
  for (const [day, minutes] of Object.entries(SAMPLE_MINUTES)) {
    const key = `2026-11-${day}`;
    days[key] = { d: key, minutes, sessions: Math.ceil(minutes / 25), tasks: 0, claimed: [] };
  }
  return days;
}

const SAMPLE_GRID = monthGrid(SAMPLE_NOW, sampleHistory(), 2026, 10);
// The app always draws six weeks so its height never changes; here the sixth, all padding, is left out.
const FIVE_WEEKS = 5;
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The app's Account row, signed out: its text, round initial and Sign in button. */
export function SyncPreview() {
  return (
    <View style={styles.syncWrap} aria-hidden pointerEvents={NO_TOUCH}>
    <View style={[panel.levelCard, account.card, styles.sync]}>
      <View style={account.head}>
        <View
          style={[account.avatar, { backgroundColor: fade(AMBER.accent, 0.16), borderColor: fade(AMBER.accent, 0.35) }]}
        >
          <Text style={[account.avatarText, { color: AMBER.accent }]}>W</Text>
        </View>
        <View style={account.copy}>
          <Text style={account.name}>Account</Text>
          <Text style={account.status}>Keep your progress on every device</Text>
        </View>
        <View style={[account.action, { backgroundColor: AMBER.accent, borderColor: AMBER.accent }]}>
          <Text style={[account.actionText, { color: colors.textInverse }]}>Sign in</Text>
        </View>
      </View>
    </View>
    <View style={styles.syncChips}>
      {SYNCED.map((name) => (
        <View key={name} style={panel.mini}>
          <Text style={panel.miniText}>{name}</Text>
        </View>
      ))}
    </View>
    </View>
  );
}

// What an account keeps in step across devices (the privacy policy's list).
const SYNCED = ['XP and level', 'Streaks', 'Tasks', 'History'];

/** The lines the app shows under its calendar: the shade legend, the month total and today's reading. */
export function CalendarNotes() {
  const today = SAMPLE_GRID.weeks.flat().find((cell) => cell.today && cell.inMonth);
  // A fixed locale, so the server render and the browser agree.
  const todayLabel = new Date(SAMPLE_NOW).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const swatches = [fade('#FFFFFF', 0.08), fade(AMBER.accent, 0.2), fade(AMBER.accent, 0.42), AMBER.accent];
  return (
    <View style={styles.notes} aria-hidden pointerEvents={NO_TOUCH}>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {swatches.map((color) => (
          <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
      <Text style={[panel.monthTotal, styles.noteLine]}>
        This month: {SAMPLE_GRID.minutes} minutes · {SAMPLE_GRID.sessions} sessions
      </Text>
      {today ? (
        <Text style={[panel.monthDetail, styles.noteLine]}>
          {todayLabel}: {today.minutes} minutes · {today.sessions} {today.sessions === 1 ? 'session' : 'sessions'}
        </Text>
      ) : null}
    </View>
  );
}

/** The app's month calendar, with each day shaded by the minutes studied. */
export function CalendarPreview() {
  return (
    <View style={styles.calendar} aria-hidden pointerEvents={NO_TOUCH}>
      <View style={panel.monthHead}>
        <View style={panel.monthNav}>
          <Text style={panel.monthNavText}>‹</Text>
        </View>
        <Text style={panel.monthLabel}>
          {SAMPLE_GRID.label} · {SAMPLE_STREAK} day streak
        </Text>
        <View style={[panel.monthNav, panel.monthNavOff]}>
          <Text style={panel.monthNavText}>›</Text>
        </View>
      </View>
      <View style={[panel.monthWeek, { marginTop: 8 }]}>
        {DAY_NAMES.map((name, index) => (
          <Text key={`${name}-${index}`} style={panel.monthDayName}>
            {name}
          </Text>
        ))}
      </View>
      <View style={panel.monthGrid}>
        {SAMPLE_GRID.weeks.slice(0, FIVE_WEEKS).map((week) => (
          <View key={week[0].key} style={panel.monthWeek}>
            {week.map((cell) => (
              <DayCell key={cell.key} cell={cell} accent={AMBER.accent} selected={false} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  candles: web({
    flexGrow: 1,
    flexBasis: 220,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 215,
    // The phone's Amber background, from the same mood the candle is drawn in.
    backgroundColor: AMBER.bgMid,
    experimental_backgroundImage: `linear-gradient(180deg, ${AMBER.bgBase}, ${AMBER.bgMid} 72%, ${AMBER.bgGlow})`,
  }),
  candleCol: {
    flex: 1,
    alignItems: 'center',
  },
  candleBox: {
    width: '100%',
    height: 150,
  },
  candleTime: {
    color: colors.textPrimary,
    fontFamily: fonts.timeLight,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  level: {
    gap: 10,
  },
  streak: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  syncWrap: {
    gap: 12,
  },
  syncChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // The app's card has outer margins for its own lists; on the landing page the bento card spaces it.
  sync: {
    marginTop: 0,
    marginBottom: 0,
  },
  notes: {
    gap: 8,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  noteLine: {
    marginTop: 0,
  },
  mixer: {
    minWidth: 0,
  },
  calendar: {
    width: 300,
    maxWidth: '100%',
    flexShrink: 0,
  },
});
