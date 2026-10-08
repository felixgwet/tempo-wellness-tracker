import { useEffect, useMemo } from 'react';
import { Dumbbell, MoonStar, Droplets, Brain, BookOpen, Crown, ChevronRight, Trophy, AlertTriangle, Sparkles } from 'lucide-react';
import { useStore, todayISO, dateISO, daysSinceLatest, countInLastDays, glassesOn, lastWeekSessions } from '../lib/store';
import { WEEKLY_PLAN, SLEEP_BANDS, CONGRATS_MESSAGES, MOTIVATION_LINES } from '../lib/data';
import { Card, SectionTitle, Pill } from '../components/bits';
import type { Tab } from '../App';

export default function Today({ go }: { go: (t: Tab) => void }) {
  const { state, dispatch } = useStore();
  const today = new Date();
  const todayIdx = today.getDay();
  const plan = WEEKLY_PLAN[todayIdx];

  const gymThisWeek = lastWeekSessions(state.gymSessions).length;
  const doneToday = state.gymSessions.some((s) => s.dateISO === todayISO());

  const lastSleep = [...state.sleepLogs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))[0];
  const sleepBand = lastSleep ? SLEEP_BANDS.find((b) => lastSleep.hours < b.max) : null;

  const waterToday = glassesOn(state.waterLogs, todayISO());
  const waterTarget = state.settings.waterTarget;
  const waterMet = waterToday >= waterTarget;

  const medDates = state.meditationLogs.map((l) => l.dateISO);
  const readDates = state.readingLogs.map((l) => l.dateISO);
  const chessDates = state.chessLogs.map((l) => l.dateISO);
  const medToday = medDates.includes(todayISO());
  const readToday = readDates.includes(todayISO());
  const chessToday = chessDates.includes(todayISO());
  const medWeek = countInLastDays(medDates, 7);
  const readWeek = countInLastDays(readDates, 7);
  const chessWeek = countInLastDays(chessDates, 7);
  const chessGap = daysSinceLatest(chessDates);

  const hour = today.getHours();
  const greeting = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // active gap warnings for dashboard
  const warnings = useMemo(() => {
    const w: { text: string; tab: Tab; severe?: boolean }[] = [];
    if (!plan.rest && !doneToday) w.push({ text: `${plan.day} session not logged yet.`, tab: 'train' });
    if (chessGap !== null && chessGap >= 7) w.push({ text: `${chessGap} days without chess — drawbacks getting severe.`, tab: 'mind', severe: true });
    else if (chessGap !== null && chessGap >= 4) w.push({ text: `${chessGap} days without chess — sharpness fading.`, tab: 'mind' });
    const medGap = daysSinceLatest(medDates);
    if (medGap !== null && medGap >= 2) w.push({ text: `${medGap} days without meditation.`, tab: 'mind' });
    const readGap = daysSinceLatest(readDates);
    if (readGap !== null && readGap >= 2) w.push({ text: `${readGap} days without reading.`, tab: 'mind' });
    if (lastSleep) {
      const sleepAge = Math.round((Date.now() - new Date(lastSleep.dateISO + 'T12:00:00').getTime()) / 86400000);
      if (sleepAge >= 1) w.push({ text: "Last night's sleep isn't logged yet.", tab: 'sleep' });
    }
    return w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, doneToday, chessGap, medDates, readDates, lastSleep]);

  // pending congrats — frequency-based celebrations (no streaks)
  const congrats = useMemo(() => {
    const keys: string[] = [];
    if (gymThisWeek >= 4) keys.push('gym-4week');
    else if (gymThisWeek >= 3) keys.push('gym-3week');
    if (medWeek >= 6) keys.push('meditate-6');
    else if (medWeek >= 3) keys.push('meditate-3');
    if (readWeek >= 6) keys.push('read-6');
    else if (readWeek >= 3) keys.push('read-3');
    if (chessWeek >= 6) keys.push('chess-6');
    else if (chessWeek >= 3) keys.push('chess-3');
    const weekLogs = state.sleepLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000)));
    if (weekLogs.length >= 5 && weekLogs.every((l) => l.hours >= 7 && l.hours <= 9)) keys.push('sleep-week-good');
    const waterDays = new Map<string, number>();
    state.waterLogs.forEach((l) => waterDays.set(l.dateISO, (waterDays.get(l.dateISO) || 0) + l.glasses));
    const weekWater = [...waterDays.entries()].filter(([d]) => d >= dateISO(new Date(Date.now() - 6 * 86400000)));
    if (weekWater.length >= 5 && weekWater.every(([, g]) => g >= waterTarget)) keys.push('water-week');
    return keys.filter((k) => !state.seenCongrats.includes(k) && CONGRATS_MESSAGES[k]);
  }, [state, gymThisWeek, medWeek, readWeek, chessWeek, waterTarget]);

  // Celebrate, then mark as seen so each milestone fires once
  useEffect(() => {
    if (!congrats.length) return;
    const t = window.setTimeout(() => dispatch({ type: 'markCongrats', keys: congrats }), 12000);
    return () => window.clearTimeout(t);
  }, [congrats, dispatch]);

  // Motivation engine — pick an encouraging line from current state
  const motivation = useMemo(() => {
    const hasGymToday = plan.rest || doneToday;
    const habitsDone = [medToday, readToday, chessToday].filter(Boolean).length;
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    if (hasGymToday && habitsDone === 3) return pick(MOTIVATION_LINES.allDone);
    if (hasGymToday && habitsDone >= 1) return pick(MOTIVATION_LINES.mostDone);
    if (!hasGymToday && (medToday || readToday || chessToday)) return pick(MOTIVATION_LINES.gymMissed);
    if (state.gymSessions.length + state.sleepLogs.length + state.meditationLogs.length === 0) return pick(MOTIVATION_LINES.fresh);
    return pick(MOTIVATION_LINES.mostDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.rest, doneToday, medToday, readToday, chessToday]);

  // Today's status chips
  const statusChips = [
    { label: plan.rest ? 'Rest day' : doneToday ? 'Trained ✓' : 'Train', done: plan.rest || doneToday, tab: 'train' as Tab },
    { label: lastSleep && lastSleep.dateISO === todayISO() ? `${lastSleep.hours}h ✓` : 'Sleep', done: !!lastSleep && lastSleep.dateISO === todayISO(), tab: 'sleep' as Tab },
    { label: waterMet ? 'Water ✓' : 'Water', done: waterMet, tab: 'hydrate' as Tab },
    { label: medToday ? 'Meditated ✓' : 'Meditate', done: medToday, tab: 'mind' as Tab },
    { label: readToday ? 'Read ✓' : 'Read', done: readToday, tab: 'mind' as Tab },
    { label: chessToday ? 'Chess ✓' : 'Chess', done: chessToday, tab: 'mind' as Tab },
  ];

  return (
    <div className="px-4 pt-2 pb-28">
      <div className="mt-3 mb-4">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">{greeting}.</h1>
      </div>

      {/* Motivation line */}
      <Card className="mb-3 grad-coral-soft border-primary/20">
        <div className="flex gap-2.5 items-start">
          <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-foreground/90 leading-snug">{motivation}</p>
        </div>
      </Card>

      {/* Congrats */}
      {congrats.map((k) => (
        <Card key={k} className="mb-3 border-amber-500/50 bg-amber-50">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl grad-amber flex items-center justify-center shrink-0">
              <Trophy size={19} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700">Milestone reached 🎉</p>
              <p className="text-xs text-muted-foreground mt-0.5">{CONGRATS_MESSAGES[k]}</p>
            </div>
          </div>
        </Card>
      ))}

      {/* Nudges */}
      {warnings.length > 0 && (
        <div className="mb-3 space-y-2">
          {warnings.slice(0, 3).map((w, i) => (
            <button key={i} onClick={() => go(w.tab)} className="w-full">
              <Card className={`flex items-center gap-3 ${w.severe ? 'border-red-400/60 bg-red-50' : 'border-amber-400/50 bg-amber-50'}`}>
                <AlertTriangle size={16} className={w.severe ? 'text-red-600' : 'text-amber-600'} shrink-0 />
                <span className={`text-xs flex-1 text-left font-semibold ${w.severe ? 'text-red-700' : 'text-amber-700'}`}>{w.text}</span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Status chips */}
      <Card>
        <p className="text-xs font-bold text-foreground/90 mb-3">Today's body & mind</p>
        <div className="flex flex-wrap gap-2">
          {statusChips.map((c, i) => (
            <button
              key={i}
              onClick={() => go(c.tab)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border transition-colors ${
                c.done ? 'bg-emerald-500/12 text-emerald-700 border-emerald-600/30' : 'bg-muted/70 text-muted-foreground border-border'
              }`}
            >
              {c.label}
              {!c.done && <ChevronRight size={12} />}
            </button>
          ))}
        </div>
      </Card>

      {/* Illustrated quick-nav */}
      <SectionTitle title="Your zones" sub="Tap to jump in" />
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => go('train')} className="text-left">
          <div className="hero-img h-28">
            <img src="/hero-train.jpg" alt="Train" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
              <div className="flex items-center gap-1.5 w-full">
                <Dumbbell size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Train</span>
                <span className="ml-auto text-white/85 text-[10px] font-semibold">{plan.rest ? 'Rest day' : doneToday ? 'Done ✓' : `${plan.exercises.length} exercises`}</span>
              </div>
            </div>
          </div>
        </button>
        <button onClick={() => go('sleep')} className="text-left">
          <div className="hero-img h-28">
            <img src="/hero-sleep.jpg" alt="Sleep" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
              <div className="flex items-center gap-1.5 w-full">
                <MoonStar size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Sleep</span>
                <span className="ml-auto text-white/85 text-[10px] font-semibold">{lastSleep ? `${lastSleep.hours}h last` : 'Not logged'}</span>
              </div>
            </div>
          </div>
        </button>
        <button onClick={() => go('mind')} className="text-left">
          <div className="hero-img h-28">
            <img src="/hero-mind.jpg" alt="Mind" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
              <div className="flex items-center gap-1.5 w-full">
                <Brain size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Mind</span>
                <span className="ml-auto text-white/85 text-[10px] font-semibold">{medWeek + readWeek + chessWeek} sessions/7d</span>
              </div>
            </div>
          </div>
        </button>
        <button onClick={() => go('hydrate')} className="text-left">
          <div className="hero-img h-28">
            <img src="/hero-water.png" alt="Hydrate" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
              <div className="flex items-center gap-1.5 w-full">
                <Droplets size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Hydrate</span>
                <span className="ml-auto text-white/85 text-[10px] font-semibold">{waterToday}/{waterTarget} glasses</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Mind habits */}
      <SectionTitle title="Mind habits — last 7 days" sub="Frequency, not pressure" />
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <Brain size={20} className={medWeek > 0 ? 'text-primary' : 'text-muted-foreground/40'} />
            <span className="text-base font-bold">{medWeek}<span className="text-xs text-muted-foreground font-semibold"> days</span></span>
            <span className="text-[10px] text-muted-foreground">meditation</span>
          </Card>
        </button>
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <BookOpen size={20} className={readWeek > 0 ? 'text-primary' : 'text-muted-foreground/40'} />
            <span className="text-base font-bold">{readWeek}<span className="text-xs text-muted-foreground font-semibold"> days</span></span>
            <span className="text-[10px] text-muted-foreground">reading</span>
          </Card>
        </button>
        <button onClick={() => go('mind')}>
          <Card className="flex flex-col items-center py-4 gap-1.5">
            <Crown size={20} className={chessGap === null ? 'text-muted-foreground/40' : chessGap <= 1 ? 'text-primary' : 'text-red-500'} />
            <span className="text-base font-bold">{chessGap === null ? '—' : `${chessGap}d`}</span>
            <span className="text-[10px] text-muted-foreground">since chess</span>
          </Card>
        </button>
      </div>

      {/* Today plan preview */}
      <SectionTitle title={plan.rest ? 'Today: recover' : `Today: ${plan.day} session`} sub={plan.rest ? 'Sleep, stretch, hydrate' : `${plan.exercises.length} exercises`} />
      <Card>
        {plan.rest ? (
          <p className="text-xs text-muted-foreground">Rest & recharge — light walking, mobility work and good sleep speed up recovery. Maybe meditate and read a little extra today.</p>
        ) : (
          <div className="space-y-2">
            {plan.exercises.slice(0, 4).map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs truncate">{e.name}</span>
                <Pill tone="neutral">{e.sets}</Pill>
              </div>
            ))}
            {plan.exercises.length > 4 && <p className="text-[11px] text-muted-foreground">+ {plan.exercises.length - 4} more…</p>}
            <button onClick={() => go('train')} className="w-full text-left text-xs text-primary font-bold pt-1">
              Open workout →
            </button>
          </div>
        )}
      </Card>

      {/* Sleep verdict */}
      {lastSleep && sleepBand && (
        <>
          <SectionTitle title="Sleep check" />
          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold">{lastSleep.hours}h last logged</p>
              <Pill tone={sleepBand.tone === 'good' ? 'good' : sleepBand.tone === 'bad' ? 'bad' : sleepBand.tone === 'warn' ? 'warn' : 'info'}>{sleepBand.headline}</Pill>
            </div>
            <p className="text-[11px] text-muted-foreground">{sleepBand.tone === 'good' ? sleepBand.pros[0] : sleepBand.cons[0]}</p>
          </Card>
        </>
      )}

      {/* Week summary */}
      <SectionTitle title="This week" />
      <Card>
        <div className="flex justify-between text-center">
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">{gymThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">workouts</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">
              {(() => {
                const wk = state.sleepLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000)));
                return wk.length ? (wk.reduce((a, l) => a + l.hours, 0) / wk.length).toFixed(1) : '—';
              })()}
            </p>
            <p className="text-[10px] text-muted-foreground">avg sleep h</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">
              {medWeek + readWeek + chessWeek}
            </p>
            <p className="text-[10px] text-muted-foreground">mind sessions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
