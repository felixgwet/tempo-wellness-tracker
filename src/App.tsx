import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Dumbbell, MoonStar, Droplets, Brain, Settings as SettingsIcon, X, Bell, BellOff, Share, Info, Activity } from 'lucide-react';
import { StoreProvider, useStore, todayISO, notify } from './lib/store';
import { WEEKLY_PLAN, GLASS_ML } from './lib/data';
import Today from './screens/Today';
import Train from './screens/Train';
import Sleep from './screens/Sleep';
import Hydrate from './screens/Hydrate';
import Mind from './screens/Mind';
import { Card, PrimaryButton, Input, Label } from './components/bits';

export type Tab = 'today' | 'train' | 'sleep' | 'hydrate' | 'mind';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'sleep', label: 'Sleep', icon: MoonStar },
  { id: 'hydrate', label: 'Hydrate', icon: Droplets },
  { id: 'mind', label: 'Mind', icon: Brain },
];

interface Alert {
  key: string;
  title: string;
  body: string;
  tab: Tab;
  severe?: boolean;
}

function Shell() {
  const [tab, setTabState] = useState<Tab>(() => {
    const h = window.location.hash.slice(1);
    return (['today', 'train', 'sleep', 'hydrate', 'mind'] as Tab[]).includes(h as Tab) ? (h as Tab) : 'today';
  });
  const setTab = (t: Tab) => {
    setTabState(t);
    try {
      window.history.replaceState(null, '', `#${t}`);
    } catch { /* hash update best effort */ }
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { state, dispatch } = useStore();

  // ─── Reminder / alert engine — re-checked every 30s while app is open ───
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const alerts = useMemo((): Alert[] => {
    const d = new Date(now);
    const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const today = todayISO();
    const out: Alert[] = [];
    const r = state.settings.reminders;
    const dismissed = state.dismissedAlerts;

    const push = (key: string, title: string, body: string, t: Tab, severe = false) => {
      if (dismissed[key] === today) return; // already shown & dismissed today
      out.push({ key, title, body, tab: t, severe });
    };

    // Gym
    const plan = WEEKLY_PLAN[d.getDay()];
    if (!plan.rest && !state.gymSessions.some((s) => s.dateISO === today) && hm >= r.gym) {
      push(`gym-${today}`, 'Time to train 💪', `${plan.day}'s session is waiting. ${plan.exercises.length} exercises.`, 'train');
    }
    // Meditation
    if (!state.meditationLogs.some((l) => l.dateISO === today) && hm >= r.meditate) {
      push(`med-${today}`, 'Meditation reminder', 'Have you sat today? Even 5 minutes protects your calm.', 'mind');
    }
    // Reading
    if (!state.readingLogs.some((l) => l.dateISO === today) && hm >= r.read) {
      push(`read-${today}`, 'Reading reminder', 'Have you read today? Ten pages a day is a dozen books a year.', 'mind');
    }
    // Chess — escalating gap alerts
    const chessDates = state.chessLogs.map((l) => l.dateISO);
    const chessGap = chessDates.length ? Math.round((Date.now() - new Date(chessDates.reduce((a, b) => (a > b ? a : b)) + 'T12:00:00').getTime()) / 86400000) : null;
    if (!chessDates.includes(today) && hm >= r.chess) {
      if (chessGap !== null && chessGap >= 7) {
        push(`chess-${today}`, '⚠ Chess gap getting severe', `You haven't played chess in ${chessGap} days — drawbacks are getting severe. Play one game now.`, 'mind', true);
      } else if (chessGap !== null && chessGap >= 4) {
        push(`chess-${today}`, 'Chess sharpness fading', `${chessGap} days without chess. Your calculation and pattern recall are dulling — a quick puzzle set fixes it.`, 'mind');
      } else {
        push(`chess-${today}`, 'Chess reminder', 'A quick puzzle set keeps your calculation sharp.', 'mind');
      }
    }
    // Sleep
    if (!state.sleepLogs.some((l) => l.dateISO === today) && hm >= r.sleep) {
      push(`sleep-${today}`, 'Wind down soon 🌙', "Log last night's sleep, then aim for 7–9h. Recovery is training.", 'sleep');
    }
    // Water
    const waterToday = state.waterLogs.filter((l) => l.dateISO === today).reduce((a, l) => a + l.glasses, 0);
    if (waterToday < state.settings.waterTarget && hm >= r.water) {
      push(`water-${today}`, 'Hydration check 💧', `You're at ${waterToday}/${state.settings.waterTarget} glasses (~${waterToday * GLASS_ML} ml). A glass now beats catch-up later.`, 'hydrate');
    }
    return out.slice(0, 2);
  }, [now, state]);

  // Fire OS notifications for alerts (once each — track via dismissed keys when permission granted)
  useEffect(() => {
    if (!state.settings.notifications) return;
    alerts.forEach((a) => {
      const flag = `notif-${a.key}`;
      if (!state.dismissedAlerts[flag]) {
        notify(a.title, a.body);
        dispatch({ type: 'dismissAlert', key: flag, dateISO: todayISO() });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  const askNotifications = async (enable: boolean) => {
    if (enable && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      dispatch({ type: 'setNotifications', enabled: perm === 'granted', asked: true });
      return;
    }
    dispatch({ type: 'setNotifications', enabled: enable && 'Notification' in window && Notification.permission === 'granted', asked: true });
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="pt-safe sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grad-blue flex items-center justify-center shadow-[0_4px_10px_-3px_hsl(214_92%_52%/0.6)]">
              <Activity size={15} className="text-white" />
            </div>
            <span className="font-bold tracking-tight">Tempo</span>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 text-muted-foreground" aria-label="Settings">
            <SettingsIcon size={19} />
          </button>
        </div>
      </div>

      {/* In-app alert banners */}
      {alerts.map((a) => (
        <div key={a.key} className="px-4 mt-3 animate-in">
          <Card className={`flex items-start gap-3 ${a.severe ? 'border-red-400/60 bg-red-50' : 'border-primary/30'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.severe ? 'bg-red-100' : 'bg-primary/12'}`}>
              <Bell size={16} className={a.severe ? 'text-red-600' : 'text-primary'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => {
                    setTab(a.tab);
                    dispatch({ type: 'dismissAlert', key: a.key, dateISO: todayISO() });
                  }}
                  className="text-xs font-semibold text-primary"
                >
                  Open →
                </button>
                <button
                  onClick={() => dispatch({ type: 'dismissAlert', key: a.key, dateISO: todayISO() })}
                  className="text-xs text-muted-foreground"
                >
                  Later
                </button>
              </div>
            </div>
          </Card>
        </div>
      ))}

      {/* Screens */}
      <main>
        {tab === 'today' && <Today go={setTab} />}
        {tab === 'train' && <Train />}
        {tab === 'sleep' && <Sleep />}
        {tab === 'hydrate' && <Hydrate />}
        {tab === 'mind' && <Mind />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-white/90 backdrop-blur-md border-t border-border/70 pb-safe shadow-[0_-6px_20px_-10px_hsl(20_60%_40%/0.15)]">
        <div className="flex justify-around px-2 pt-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px]">
                <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground/50'} />
                <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground/50'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings sheet */}
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} onNotif={askNotifications} />}
    </div>
  );
}

function SettingsSheet({ onClose, onNotif }: { onClose: () => void; onNotif: (enable: boolean) => Promise<void> }) {
  const { state, dispatch } = useStore();
  const [weight, setWeight] = useState(String(state.settings.weightKg));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-safe max-h-[88vh] overflow-y-auto no-scrollbar animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Body weight (kg) — used for calorie estimates</Label>
            <div className="flex gap-2">
              <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <PrimaryButton
                className="w-auto px-5"
                onClick={() => dispatch({ type: 'setWeight', weightKg: Math.max(30, Number(weight) || 75) })}
              >
                Save
              </PrimaryButton>
            </div>
          </div>

          <div>
            <Label>Notifications & alerts</Label>
            <button
              onClick={() => onNotif(!state.settings.notifications)}
              className="w-full flex items-center justify-between bg-muted/60 rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {state.settings.notifications ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
                {state.settings.notifications ? 'Notifications on' : 'Notifications off'}
              </span>
              <span className={`w-10 h-6 rounded-full relative transition-colors ${state.settings.notifications ? 'bg-primary' : 'bg-border'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${state.settings.notifications ? 'left-5' : 'left-1'}`} />
              </span>
            </button>
            <div className="mt-2 p-3 rounded-xl bg-secondary/60 space-y-1.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground/80">How notifications work:</span> reminders fire as web notifications while the app is open, and via web push when Tempo is installed to your Home Screen (iOS 16.4+). In-app reminder banners always work at the times you set below — even with notifications off.
              </p>
              {'PushManager' in window && 'serviceWorker' in navigator && (
                <p className="text-[11px] text-emerald-700 font-medium">✓ This device supports web push.</p>
              )}
            </div>
          </div>

          <div>
            <Label>Daily reminder times</Label>
            <div className="space-y-2">
              {(
                [
                  ['gym', 'Gym / workout'],
                  ['meditate', 'Meditation'],
                  ['read', 'Reading'],
                  ['chess', 'Chess'],
                  ['water', 'Hydration'],
                  ['sleep', 'Wind-down & sleep log'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between bg-muted/60 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium">{label}</span>
                  <input
                    type="time"
                    value={state.settings.reminders[key]}
                    onChange={(e) => dispatch({ type: 'setReminder', habit: key, time: e.target.value })}
                    className="bg-transparent text-sm text-primary font-bold focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/60 rounded-xl p-4">
            <p className="text-xs font-bold flex items-center gap-1.5 mb-2"><Share size={13} className="text-primary" /> Install on your iPhone</p>
            <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open this app in Safari on your iPhone.</li>
              <li>Tap the Share button.</li>
              <li>Scroll down and tap "Add to Home Screen".</li>
              <li>Tap "Add" — Tempo now opens full-screen like a native app, can receive web push, and your data stays on your device.</li>
            </ol>
          </div>

          <div className="flex gap-2 items-start pb-2">
            <Info size={13} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              All data is stored locally on your device only. Calorie, sleep and hydration figures are evidence-based estimates, clearly labelled as such inside the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
