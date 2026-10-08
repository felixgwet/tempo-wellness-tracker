import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { State, GymSession, SleepLog, WaterLog, MeditationLog, ReadingLog, ChessLog } from '../types';
import { estimateCalories } from './data';

const STORAGE_KEY = 'tempo-state-v1';

const DEFAULT_STATE: State = {
  settings: {
    weightKg: 75,
    waterTarget: 8,
    notifications: false,
    notifAsked: false,
    reminders: { gym: '17:00', meditate: '07:30', read: '21:30', chess: '16:00', water: '14:00', sleep: '22:30' },
  },
  gymSessions: [],
  sleepLogs: [],
  waterLogs: [],
  meditationLogs: [],
  readingLogs: [],
  chessLogs: [],
  dismissedAlerts: {},
  seenCongrats: [],
};

function loadState(): State {
  try {
    // fresh key, then legacy forge keys (one-time migration; legacy-only fields are dropped)
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('forge-state-v2') || localStorage.getItem('forge-state-v1');
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const { releases: _legacyReleases, ...rest } = parsed;
    return {
      ...DEFAULT_STATE,
      ...rest,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}), reminders: { ...DEFAULT_STATE.settings.reminders, ...(parsed.settings?.reminders || {}) } },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

type Action =
  | { type: 'addGym'; session: Omit<GymSession, 'id' | 'calories'> }
  | { type: 'deleteGym'; id: string }
  | { type: 'addSleep'; log: Omit<SleepLog, 'id'> }
  | { type: 'deleteSleep'; id: string }
  | { type: 'addWater'; log: Omit<WaterLog, 'id'> }
  | { type: 'deleteWater'; id: string }
  | { type: 'addMeditation'; log: Omit<MeditationLog, 'id'> }
  | { type: 'addReading'; log: Omit<ReadingLog, 'id'> }
  | { type: 'addChess'; log: Omit<ChessLog, 'id'> }
  | { type: 'deleteLog'; habit: 'meditation' | 'reading' | 'chess'; id: string }
  | { type: 'setWeight'; weightKg: number }
  | { type: 'setWaterTarget'; glasses: number }
  | { type: 'setReminder'; habit: keyof State['settings']['reminders']; time: string }
  | { type: 'setNotifications'; enabled: boolean; asked: boolean }
  | { type: 'dismissAlert'; key: string; dateISO: string }
  | { type: 'markCongrats'; keys: string[] };

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addGym': {
      const s: GymSession = { ...action.session, id: uid(), calories: estimateCalories(state.settings.weightKg, action.session.minutes) };
      return { ...state, gymSessions: [s, ...state.gymSessions] };
    }
    case 'deleteGym':
      return { ...state, gymSessions: state.gymSessions.filter((s) => s.id !== action.id) };
    case 'addSleep':
      return { ...state, sleepLogs: [{ ...action.log, id: uid() }, ...state.sleepLogs] };
    case 'deleteSleep':
      return { ...state, sleepLogs: state.sleepLogs.filter((s) => s.id !== action.id) };
    case 'addWater':
      return { ...state, waterLogs: [{ ...action.log, id: uid() }, ...state.waterLogs] };
    case 'deleteWater':
      return { ...state, waterLogs: state.waterLogs.filter((l) => l.id !== action.id) };
    case 'addMeditation':
      return { ...state, meditationLogs: [{ ...action.log, id: uid() }, ...state.meditationLogs] };
    case 'addReading':
      return { ...state, readingLogs: [{ ...action.log, id: uid() }, ...state.readingLogs] };
    case 'addChess':
      return { ...state, chessLogs: [{ ...action.log, id: uid() }, ...state.chessLogs] };
    case 'deleteLog': {
      const key = action.habit + 'Logs';
      const list = (state as unknown as Record<string, unknown[]>)[key].filter((l) => (l as { id: string }).id !== action.id);
      return { ...state, [key]: list } as State;
    }
    case 'setWeight':
      return { ...state, settings: { ...state.settings, weightKg: action.weightKg } };
    case 'setWaterTarget':
      return { ...state, settings: { ...state.settings, waterTarget: Math.max(1, action.glasses) } };
    case 'setReminder':
      return { ...state, settings: { ...state.settings, reminders: { ...state.settings.reminders, [action.habit]: action.time } } };
    case 'setNotifications':
      return { ...state, settings: { ...state.settings, notifications: action.enabled, notifAsked: action.asked } };
    case 'dismissAlert':
      return { ...state, dismissedAlerts: { ...state.dismissedAlerts, [action.key]: action.dateISO } };
    case 'markCongrats':
      return { ...state, seenCongrats: [...new Set([...state.seenCongrats, ...action.keys])] };
    default:
      return state;
  }
}

// ─── Date helpers ───
export function dateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function todayISO(): string {
  return dateISO(new Date());
}

export function daysBetween(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split('-').map(Number);
  const [by, bm, bd] = bISO.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** Days since the most recent date in the list (0 if today). */
export function daysSinceLatest(datesISO: string[]): number | null {
  if (!datesISO.length) return null;
  const latest = datesISO.reduce((a, b) => (a > b ? a : b));
  return daysBetween(latest, todayISO());
}

/** How many of the given dates fall within the last N days (including today). Frequency, not streaks. */
export function countInLastDays(datesISO: string[], n: number): number {
  const cutoff = dateISO(new Date(Date.now() - (n - 1) * 86400000));
  return datesISO.filter((d) => d >= cutoff).length;
}

// ─── Context ───
interface StoreCtx {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const Ctx = createContext<StoreCtx>({ state: DEFAULT_STATE, dispatch: () => {} });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — ignore */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  return useContext(Ctx);
}

// ─── Derived stats helpers ───
export function lastWeekSessions(sessions: GymSession[]): GymSession[] {
  const cutoff = dateISO(new Date(Date.now() - 6 * 86400000));
  return sessions.filter((s) => s.dateISO >= cutoff);
}

/** Total glasses logged for a given date. */
export function glassesOn(logs: WaterLog[], date: string): number {
  return logs.filter((l) => l.dateISO === date).reduce((a, l) => a + l.glasses, 0);
}

/**
 * Fire an OS notification. Uses the service-worker registration when available
 * (works from installed PWAs and keeps working in the background on supported
 * platforms); falls back to the page Notification API.
 */
export function notify(title: string, body: string) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const icon = '/icon-192.png';
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, { body, icon, badge: icon, tag: `tempo-${Date.now()}` }))
        .catch(() => new Notification(title, { body, icon }));
    } else {
      new Notification(title, { body, icon });
    }
  } catch {
    /* notifications unsupported — in-app alerts still work */
  }
}
