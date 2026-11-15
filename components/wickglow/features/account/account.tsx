import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, Linking } from 'react-native';
import {
  accountsAvailable,
  changeName,
  createAccount,
  refreshAccount,
  resendVerification,
  sendPasswordReset,
  signInWithEmail,
  signOutAccount,
  watchAccount,
  type AccountUser,
  type AuthResult,
} from '@/src/data/auth';
import { googleSignInAvailable, signInWithGoogle } from '@/src/data/google-sign-in';
import { fetchProgress, listenProgress, pushProgress, resetProgress } from '@/src/data/progress-remote';
import { createAccountSync, SyncStatus, SyncStore } from '@/components/wickglow/domain/account-sync';
import { savesSkipped } from '@/components/wickglow/domain/storage';

// The account: who is signed in, how syncing is going, and the sign-in
// actions. Its own context, so a sign-in or a sync status change re-renders
// the account UI and nothing else. `WickglowSession` provides it with the
// saved-state store.

/** Account deletion is by email request; the owner deletes by hand after 7 days. */
export const DELETION_EMAIL = 'encarnacionelher@gmail.com';

export interface AccountValue {
  /** False when the build has no Firebase config: the account UI is hidden. */
  available: boolean;
  google: boolean;
  /** Undefined until Firebase has said whether someone is signed in. */
  user: AccountUser | null | undefined;
  sync: SyncStatus;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signInGoogle: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  resend: () => Promise<AuthResult>;
  /**
   * Signs out and clears the progress from this device.
   * If some of it is not in the account yet, waits a moment for it, then asks
   * first (`leaving`).
   */
  signOut: () => Promise<void>;
  /** The sign-out card: waiting for progress to save, or warning that some is not saved. */
  leaving: 'saving' | 'unsaved' | null;
  /** "Sign out anyway": the unsaved progress is removed from this device. */
  confirmSignOut: () => void;
  cancelSignOut: () => void;
  setName: (name: string) => Promise<AuthResult>;
  choose: (keep: 'device' | 'account') => void;
  /** The keep-which-progress card is showing (it can be put off with "Decide later"). */
  choiceOpen: boolean;
  setChoiceOpen: (open: boolean) => void;
  retry: () => void;
  requestDeletion: () => void;
}

const AccountContext = createContext<AccountValue | null>(null);

export function deletionMailto(user: AccountUser): string {
  const subject = 'Delete my Wickglow account';
  const body = [
    'Please delete my Wickglow account and its saved progress.',
    '',
    `Account email: ${user.email ?? '(none)'}`,
    `Account id: ${user.uid}`,
    '',
    'I understand the account is deleted 7 days after this request.',
  ].join('\n');
  return `mailto:${DELETION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** The short messages shown after a sign-in the user started (not on a restored session). */
export const SIGNED_IN_MESSAGE = 'Signed in. Your progress saves to your account';
export const SIGNED_UP_MESSAGE = 'Account created. Check your email to confirm it';
/** How long Sign out waits for unsaved progress to reach the account before asking. */
export const SIGN_OUT_WAIT_MS = 4000;
/** Shown when this device's progress could not be cleared, so the sign-out did not go ahead. */
export const CLEAR_FAILED_MESSAGE = 'Could not sign out: this device could not be cleared. Try again';
/** Shown when no email app opens for the deletion request, so it can be sent by hand. */
export const DELETION_FAILED_MESSAGE = `Could not open your email app. To delete your account, write to ${DELETION_EMAIL}`;

export function AccountProvider({ store, notify, stopSession, holdSessions, children }: {
  store: SyncStore;
  /** Shows a short message (the app toast). */
  notify: (message: string) => void;
  /** Resets the timer to idle and cancels its alarm (the Reset button). */
  stopSession: () => void;
  /** True while a sign-out runs: the timer refuses to start until it is false again. */
  holdSessions: (hold: boolean) => void;
  children: React.ReactNode;
}) {
  // Latest `notify`, `stopSession` and `holdSessions`, so the memoised actions below never call a stale one.
  const notifyRef = useRef(notify);
  const stopSessionRef = useRef(stopSession);
  const holdSessionsRef = useRef(holdSessions);
  useEffect(() => {
    notifyRef.current = notify;
    stopSessionRef.current = stopSession;
    holdSessionsRef.current = holdSessions;
  });
  const [available] = useState(accountsAvailable);
  const [google] = useState(() => available && googleSignInAvailable());
  const [user, setUser] = useState<AccountUser | null | undefined>(available ? undefined : null);
  const [sync] = useState(() => createAccountSync({
    store,
    remote: { fetch: fetchProgress, listen: listenProgress, push: pushProgress, reset: resetProgress },
    now: Date.now,
  }));
  const status = useSyncExternalStore(sync.subscribe, sync.status, sync.status);
  // The question last put off with "Decide later". A new question shows again.
  const [putOff, setPutOff] = useState<SyncStatus | null>(null);
  const choiceOpen = status.phase === 'choose' && putOff !== status;
  const [leaving, setLeaving] = useState<'saving' | 'unsaved' | null>(null);
  // Bumped when a sign-out is answered or cancelled, so a wait still running drops out.
  const leaveRun = useRef(0);

  useEffect(() => watchAccount(setUser), []);
  useEffect(() => () => sync.dispose(), [sync]);

  // Waiting changes go up as soon as the app leaves the foreground (on web,
  // when the tab is hidden), so a task edit is not lost to the 10 s wait.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active') sync.flush();
    });
    return () => subscription.remove();
  }, [sync]);

  const uid = user?.uid ?? null;
  // The signed-in account now, for a sign-out that resumes after a wait.
  const uidRef = useRef(uid);
  useEffect(() => {
    uidRef.current = uid;
  });
  // How many sign-outs are clearing the device right now.
  const leavesRunning = useRef(0);
  // How many sign-outs have not finished (cleared and signed out, or given up).
  // While any has not, no session may start.
  const holding = useRef(0);
  // A sign-out card from the account before this one is not this account's.
  const [leavingFor, setLeavingFor] = useState(uid);
  if (leavingFor !== uid) {
    setLeavingFor(uid);
    setLeaving(null);
  }
  useEffect(() => {
    // A sign-out still waiting was for the account before this one: drop it,
    // so it cannot clear and sign out whoever is signed in now.
    leaveRun.current += 1;
    if (uid) sync.start(uid);
    else sync.stop();
  }, [sync, uid]);

  // Coming back to the app after opening the verification link: re-read the
  // user so the row stops saying "Email not confirmed".
  const unverified = user != null && !user.verified;
  useEffect(() => {
    if (!unverified) return undefined;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refreshAccount().then((fresh) => { if (fresh) setUser(fresh); });
    });
    return () => subscription.remove();
  }, [unverified]);

  // The device is cleared before the sign-out, so a sign-out cut short (the
  // app closed in between) cannot leave this account's progress behind for
  // the next one. If the sign-out fails, the account is still signed in and
  // its progress comes back from the account. If the cleared state cannot be
  // written, the sign-out does not go ahead: the old progress would come back
  // on the next launch for whoever signs in then.
  //
  // A running or paused session is reset first: it began under this account,
  // so if it finished after the sign-out it would be logged on the cleared
  // device and go to the next account to sign in here. Reset first, so the
  // clear's write holds the idle timer too. Starting is held off until the
  // sign-out has finished, for the same reason.
  //
  // If something newer took over while the device was being cleared (another
  // account signed in, or another sign-out started), this one stops there and
  // does not sign out. Clearing stopped the sync, so it is started again when
  // the same account is still signed in and no other sign-out is under way.
  const leave = useCallback(async () => {
    leaveRun.current += 1;
    const run = leaveRun.current;
    setLeaving(null);
    // Storage could not be read at launch, so nothing is being written: the
    // cleared state would not reach storage and the old progress would come
    // back on the next launch.
    if (savesSkipped()) {
      notifyRef.current(CLEAR_FAILED_MESSAGE);
      return;
    }
    leavesRunning.current += 1;
    holding.current += 1;
    holdSessionsRef.current(true);
    try {
      if (store.get().session.status !== 'idle') stopSessionRef.current();
      const cleared = await sync.forget();
      leavesRunning.current -= 1;
      if (run !== leaveRun.current) {
        if (uid && uidRef.current === uid && leavesRunning.current === 0) sync.start(uid);
        return;
      }
      if (!cleared) {
        if (uid) sync.start(uid);
        notifyRef.current(CLEAR_FAILED_MESSAGE);
        return;
      }
      const result = await signOutAccount();
      if (!result.ok) {
        if (uid) sync.start(uid);
        if (result.message) notifyRef.current(result.message);
      }
    } finally {
      holding.current -= 1;
      if (holding.current === 0) holdSessionsRef.current(false);
    }
  }, [store, sync, uid]);

  const value = useMemo<AccountValue>(() => ({
    available,
    google,
    user,
    sync: status,
    signIn: async (email, password) => {
      const result = await signInWithEmail(email, password);
      if (result.ok) notifyRef.current(SIGNED_IN_MESSAGE);
      return result;
    },
    signUp: async (email, password, name) => {
      const result = await createAccount(email, password, name);
      // The name is set after the sign-in event fired, so re-read the user.
      if (result.ok && name?.trim()) void refreshAccount().then((fresh) => { if (fresh) setUser(fresh); });
      if (result.ok) notifyRef.current(SIGNED_UP_MESSAGE);
      return result;
    },
    signInGoogle: async () => {
      const result = await signInWithGoogle();
      if (result.ok) notifyRef.current(SIGNED_IN_MESSAGE);
      return result;
    },
    resetPassword: sendPasswordReset,
    resend: resendVerification,
    signOut: async () => {
      // A task edit may be in its 10 s wait: send it now.
      sync.flush();
      if (!sync.unsaved()) {
        await leave();
        return;
      }
      leaveRun.current += 1;
      const run = leaveRun.current;
      setLeaving('saving');
      const saved = await sync.whenSaved(SIGN_OUT_WAIT_MS);
      if (run !== leaveRun.current) return;
      if (saved) await leave();
      else setLeaving('unsaved');
    },
    leaving,
    confirmSignOut: () => void leave(),
    cancelSignOut: () => {
      leaveRun.current += 1;
      setLeaving(null);
    },
    setName: async (name) => {
      const result = await changeName(name);
      if (result.ok) void refreshAccount().then((fresh) => { if (fresh) setUser(fresh); });
      return result;
    },
    choose: sync.choose,
    choiceOpen,
    setChoiceOpen: (open) => setPutOff(open ? null : status),
    retry: () => {
      sync.retry();
      void refreshAccount().then((fresh) => { if (fresh) setUser(fresh); });
    },
    requestDeletion: () => {
      if (user) void Linking.openURL(deletionMailto(user)).catch(() => notifyRef.current(DELETION_FAILED_MESSAGE));
    },
  }), [available, choiceOpen, google, leave, leaving, status, sync, user]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error('useAccount must be used inside AccountProvider');
  return value;
}
