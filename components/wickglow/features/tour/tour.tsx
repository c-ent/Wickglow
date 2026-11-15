import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { shouldStartTour, TOUR_SEEN, tourSteps, type TourLayout, type TourStep, type TourTarget } from '@/src/core/tour';
import type { TourNode } from './measure';
import { TourOverlay } from './tour-overlay';

/**
 * The first-run tour (roadmap #13). `TourProvider` wraps the current layout
 * and draws the overlay on top of it. A layout marks the parts a step points at
 * with `useTourTarget`, and closes its panels and holds off zen while
 * `useTour().active` is true. The tablet layout also scrolls its side column
 * to the part being shown (`useTourRevealer`).
 *
 * Whether the tour was seen is kept on this device only, under its own key,
 * never in the synced saved state: it starts once on a device that has nothing
 * stored, and "Show tour again" in Timer settings starts it at any time.
 */

/** Brings a target into view (and waits until it is there) before it is measured. */
type Revealer = (node: TourNode) => Promise<void>;

const TOUR_KEY = 'wickglow:tour';

interface TourValue {
  active: boolean;
  /** The step on screen, or null while no tour runs. */
  step: TourStep['id'] | null;
  start: () => void;
  register: (target: TourTarget, node: TourNode | null) => void;
  setRevealer: (revealer: Revealer | null) => void;
}

const TourContext = createContext<TourValue | null>(null);

/** Reads the device's tour value: null when nothing is stored, undefined when the read failed. */
function readTourSeen(): Promise<string | null | undefined> {
  return AsyncStorage.getItem(TOUR_KEY).catch(() => undefined);
}

export function TourProvider({ layout, children }: { layout: TourLayout; children: React.ReactNode }) {
  const steps = useMemo(() => tourSteps(layout), [layout]);
  // The step on screen, or null while no tour runs.
  const [index, setIndex] = useState<number | null>(null);
  const nodes = useRef(new Map<TourTarget, TourNode>());
  const revealer = useRef<Revealer | null>(null);

  useEffect(() => {
    let live = true;
    void readTourSeen().then((stored) => {
      if (live && shouldStartTour(stored)) setIndex(0);
    });
    return () => {
      live = false;
    };
  }, []);

  const finish = useCallback(() => {
    setIndex(null);
    // Best effort: if it cannot be written, the tour shows again next launch.
    AsyncStorage.setItem(TOUR_KEY, TOUR_SEEN).catch(() => undefined);
  }, []);

  const next = useCallback(() => {
    setIndex((current) => (current === null || current + 1 >= steps.length ? null : current + 1));
  }, [steps.length]);

  // The last step's button ends the tour the same way Skip does.
  const onNext = useCallback(() => {
    if (index !== null && index + 1 >= steps.length) finish();
    else next();
  }, [finish, index, next, steps.length]);

  const back = useCallback(() => {
    setIndex((current) => (current === null ? null : Math.max(0, current - 1)));
  }, []);

  const start = useCallback(() => setIndex(0), []);
  const register = useCallback((target: TourTarget, node: TourNode | null) => {
    if (node) nodes.current.set(target, node);
    else nodes.current.delete(target);
  }, []);
  const setRevealer = useCallback((fn: Revealer | null) => {
    revealer.current = fn;
  }, []);
  const nodeFor = useCallback((target: TourTarget) => nodes.current.get(target) ?? null, []);
  const reveal = useCallback((node: TourNode) => revealer.current?.(node) ?? Promise.resolve(), []);

  const active = index !== null;
  const step = index !== null ? steps[index] : null;
  const stepId = step?.id ?? null;
  const value = useMemo(() => ({ active, step: stepId, start, register, setRevealer }), [active, register, setRevealer, start, stepId]);

  return (
    <TourContext.Provider value={value}>
      {children}
      {step && index !== null ? (
        <TourOverlay
          layout={layout}
          step={step}
          index={index}
          count={steps.length}
          nodeFor={nodeFor}
          reveal={reveal}
          onNext={onNext}
          onBack={back}
          onSkip={finish}
        />
      ) : null}
    </TourContext.Provider>
  );
}

const NO_TOUR = { active: false, step: null, start: () => undefined };

/** Whether the tour is running, the step on screen, and a way to start it. Inert outside a `TourProvider`. */
export function useTour(): { active: boolean; step: TourStep['id'] | null; start: () => void } {
  const tour = useContext(TourContext);
  return tour ? { active: tour.active, step: tour.step, start: tour.start } : NO_TOUR;
}

/**
 * A ref for the view a step points at. One view can stand for several steps
 * (the phone's Sounds tab is both Music and Ambient sounds). Give the view
 * `collapsable={false}` so Android keeps it to measure.
 */
export function useTourTarget(...targets: TourTarget[]) {
  const register = useContext(TourContext)?.register;
  const key = targets.join(',');
  return useCallback(
    (node: TourNode | null) => {
      if (!register || !key) return;
      for (const target of key.split(',') as TourTarget[]) register(target, node);
    },
    [key, register],
  );
}

/** Lets a layout scroll a target into view before the tour measures it. `revealer` should be stable. */
export function useTourRevealer(revealer: Revealer) {
  const setRevealer = useContext(TourContext)?.setRevealer;
  useEffect(() => {
    if (!setRevealer) return undefined;
    setRevealer(revealer);
    return () => setRevealer(null);
  }, [revealer, setRevealer]);
}
