import { useEffect, useMemo, useRef, useState } from 'react';
import { Dumbbell, Timer, Trash2, Plus, ChevronDown, ChevronUp, Clock3, CalendarDays, ChevronRight, Sparkles, TrendingDown } from 'lucide-react';
import { useStore, todayISO, dateISO, notify } from '../lib/store';
import { WEEKLY_PLAN, TIME_OF_DAY_LABEL, timeOfDayFromDate, parseSetsReps, GYM_BENEFITS, GYM_SKIP_COSTS } from '../lib/data';
import type { TimeOfDay, LoggedExercise } from '../types';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, GhostButton, Input, Select, Label, EmptyState, MiniBars, HeroBanner, ProCon } from '../components/bits';

function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** last logged weight per exercise name, for prefill */
function lastWeights(sessions: { exercises: LoggedExercise[] }[]): Map<string, number> {
  const map = new Map<string, number>();
  const sorted = [...sessions].sort((a, b) => {
    const ad = (a as { dateISO?: string }).dateISO || '';
    const bd = (b as { dateISO?: string }).dateISO || '';
    return ad < bd ? -1 : 1;
  });
  for (const s of sorted) {
    for (const e of s.exercises) {
      if (e.weightKg && !map.has(e.name)) map.set(e.name, e.weightKg);
    }
  }
  return map;
}

export default function Train() {
  const { state, dispatch } = useStore();
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<Record<number, { sets: string; reps: string; weight: string }>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showManual, setShowManual] = useState(false);
  const [manualDate, setManualDate] = useState(todayISO());
  const [manualMinutes, setManualMinutes] = useState('60');
  const [manualTod, setManualTod] = useState<TimeOfDay>(timeOfDayFromDate(new Date()));
  const [expandedHistory, setExpandedHistory] = useState(false);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (timerStart) {
      tick.current = window.setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (tick.current) window.clearInterval(tick.current);
      };
    }
  }, [timerStart]);

  const todayIdx = new Date().getDay();
  const todayPlan = WEEKLY_PLAN[todayIdx];
  const doneToday = state.gymSessions.some((s) => s.dateISO === todayISO());
  const weights = useMemo(() => lastWeights(state.gymSessions), [state.gymSessions]);

  const elapsed = timerStart ? now - timerStart : 0;

  const toggleExpand = (i: number) => {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i);
    else {
      next.add(i);
      // prefill from plan + last weight on first open
      if (!detail[i]) {
        const plan = todayPlan.exercises[i];
        const parsed = parseSetsReps(plan.sets);
        const lastW = weights.get(plan.name);
        setDetail((d) => ({
          ...d,
          [i]: {
            sets: String(parsed.sets ?? ''),
            reps: parsed.reps ? String(parsed.reps) : '',
            weight: lastW ? String(lastW) : '',
          },
        }));
      }
    }
    setExpanded(next);
  };

  const finishWorkout = () => {
    if (!timerStart) return;
    const end = Date.now();
    const startISO = new Date(timerStart);
    const minutes = Math.max(1, Math.round((end - timerStart) / 60000));
    const exercises: LoggedExercise[] = [];
    todayPlan.exercises.forEach((e, i) => {
      if (!checked.has(i)) return;
      const det = detail[i];
      const parsed = parseSetsReps(e.sets);
      const ex: LoggedExercise = { name: e.name };
      const sets = det?.sets ? Number(det.sets) : parsed.sets;
      const reps = det?.reps ? Number(det.reps) : parsed.reps;
      if (sets) ex.sets = sets;
      if (reps) ex.reps = reps;
      if (det?.weight) ex.weightKg = Number(det.weight);
      exercises.push(ex);
    });
    dispatch({
      type: 'addGym',
      session: {
        dateISO: dateISO(startISO),
        startISO: startISO.toISOString(),
        endISO: new Date(end).toISOString(),
        minutes,
        timeOfDay: timeOfDayFromDate(startISO),
        exercises,
      },
    });
    notify('Workout logged 🎉', `${minutes} min · ~${Math.round(5.5 * state.settings.weightKg * (minutes / 60))} kcal. Well earned.`);
    setTimerStart(null);
    setChecked(new Set());
    setDetail({});
    setExpanded(new Set());
  };

  // ─── Stats ───
  const sessions = state.gymSessions;
  const avgMin = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.minutes, 0) / sessions.length) : 0;
  const avgKcal = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.calories, 0) / sessions.length) : 0;
  const totalKcal = sessions.reduce((a, s) => a + s.calories, 0);
  const sessionsPerWeek = sessions.length
    ? (sessions.length / Math.max(1, (Date.now() - new Date(sessions[sessions.length - 1].dateISO + 'T12:00:00').getTime()) / (7 * 86400000))).toFixed(1)
    : '0';

  const todCounts = useMemo(() => {
    const c: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions.forEach((s) => c[s.timeOfDay]++);
    return c;
  }, [sessions]);

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      const mins = sessions.filter((s) => s.dateISO === iso).reduce((a, s) => a + s.minutes, 0);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: mins });
    }
    return out;
  }, [sessions]);

  const sortedHistory = useMemo(() => [...sessions].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)), [sessions]);
  const historyShown = expandedHistory ? sortedHistory : sortedHistory.slice(0, 5);

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <HeroBanner src="/hero-train.jpg" alt="Training illustration" height={130} />

      {/* Timer card */}
      <Card className="mt-3">
        {!timerStart ? (
          <div className="flex flex-col items-center py-2">
            <div className="w-14 h-14 rounded-2xl grad-coral-soft flex items-center justify-center mb-3">
              <Timer className="text-primary" size={26} />
            </div>
            <p className="text-sm font-bold">{doneToday ? 'Workout logged today — nice.' : todayPlan.rest ? 'Rest day — recover & recharge.' : `${todayPlan.day}'s session is waiting.`}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 text-center">
              {todayPlan.rest ? 'Sleep, stretch, hydrate. Light walking speeds up recovery.' : 'Hit start when you walk in, finish when you walk out.'}
            </p>
            <PrimaryButton
              className="ring-pulse"
              onClick={() => {
                setTimerStart(Date.now());
                setNow(Date.now());
              }}
              disabled={todayPlan.rest}
            >
              Start Workout
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Session running</p>
            <p className="text-5xl font-bold tabular-nums my-3 tracking-tight text-grad-fire">{fmtElapsed(elapsed)}</p>
            <p className="text-xs text-muted-foreground mb-4">Started {new Date(timerStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ~{Math.round(5.5 * state.settings.weightKg * (elapsed / 3600000))} kcal so far</p>
            <div className="flex gap-2 w-full">
              <GhostButton onClick={() => setTimerStart(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={finishWorkout}>Finish & Log</PrimaryButton>
            </div>
          </div>
        )}
      </Card>

      {/* Today's plan — with sets/reps/weight logging */}
      {!todayPlan.rest && (
        <>
          <SectionTitle title={`${todayPlan.day} — today's plan`} sub="Tap an exercise to log sets, reps & weight" />
          <Card className="p-2">
            {todayPlan.exercises.map((ex, i) => {
              const isDone = checked.has(i);
              const isOpen = expanded.has(i);
              const det = detail[i];
              return (
                <div key={i} className={`rounded-xl ${isDone ? 'bg-emerald-500/8' : 'hover:bg-muted/50'}`}>
                  <div className="w-full flex items-center gap-3 px-3 py-3 text-left">
                    <button
                      onClick={() => {
                        const next = new Set(checked);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        setChecked(next);
                        if (!next.has(i)) {
                          const exSet = new Set(expanded);
                          exSet.delete(i);
                          setExpanded(exSet);
                        }
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-border bg-white'}`}
                      aria-label={`Mark ${ex.name} done`}
                    >
                      {isDone && <span className="text-white text-xs font-bold">✓</span>}
                    </button>
                    <button onClick={() => toggleExpand(i)} className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-medium ${isDone ? 'line-through opacity-60' : ''}`}>{ex.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{ex.targets}</p>
                    </button>
                    <button onClick={() => toggleExpand(i)} className="flex items-center gap-1.5 shrink-0">
                      <Pill tone="neutral">{ex.sets}</Pill>
                      {det?.weight ? <Pill tone="accent">{det.weight}kg</Pill> : null}
                      {isOpen ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronRight size={15} className="text-muted-foreground" />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-0.5 animate-in">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label>Sets</Label>
                          <Input type="number" inputMode="numeric" min={0} value={det?.sets ?? ''} onChange={(e) => setDetail((d) => ({ ...d, [i]: { ...(d[i] || { sets: '', reps: '', weight: '' }), sets: e.target.value } }))} />
                        </div>
                        <div>
                          <Label>Reps</Label>
                          <Input type="number" inputMode="numeric" min={0} value={det?.reps ?? ''} onChange={(e) => setDetail((d) => ({ ...d, [i]: { ...(d[i] || { sets: '', reps: '', weight: '' }), reps: e.target.value } }))} />
                        </div>
                        <div>
                          <Label>Weight (kg)</Label>
                          <Input type="number" inputMode="decimal" min={0} step="0.5" value={det?.weight ?? ''} onChange={(e) => setDetail((d) => ({ ...d, [i]: { ...(d[i] || { sets: '', reps: '', weight: '' }), weight: e.target.value } }))} />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Prefilled from your plan{weights.get(ex.name) ? ' + last logged weight' : ''}. Leave blank for AMRAP / holds.</p>
                    </div>
                  )}
                </div>
              );
            })}
            {todayPlan.tip && <p className="text-[11px] text-muted-foreground px-3 py-2 italic border-t border-border mt-1">💡 {todayPlan.tip}</p>}
          </Card>
        </>
      )}

      {/* Weekly plan overview */}
      <SectionTitle title="Weekly plan" sub="From your Men's Edition program" />
      <Card className="p-2 space-y-1">
        {WEEKLY_PLAN.map((d, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl ${i === todayIdx ? 'bg-primary/10' : ''}`}>
            <span className={`text-sm ${i === todayIdx ? 'font-bold text-primary' : 'font-medium'}`}>{d.day}</span>
            <span className="text-[11px] text-muted-foreground text-right">
              {d.rest ? 'Rest 🛋️' : `${d.exercises.length} exercises`}
            </span>
          </div>
        ))}
      </Card>

      {/* Stats */}
      <SectionTitle title="Your numbers" />
      <div className="grid grid-cols-2 gap-3">
        <Card><Stat label="Sessions (14d)" value={sessions.filter((s) => s.dateISO >= dateISO(new Date(Date.now() - 13 * 86400000))).length} accent="text-primary" /><p className="text-[11px] text-muted-foreground mt-1">last 14 days</p></Card>
        <Card><Stat label="Avg duration" value={avgMin} unit="min" /><p className="text-[11px] text-muted-foreground mt-1">per session</p></Card>
        <Card><Stat label="Avg burn" value={avgKcal} unit="kcal" accent="text-amber-600" /><p className="text-[11px] text-muted-foreground mt-1">approx, per session</p></Card>
        <Card><Stat label="Frequency" value={sessionsPerWeek} unit="/wk" accent="text-emerald-600" /><p className="text-[11px] text-muted-foreground mt-1">avg since you started</p></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-3 text-foreground/90">Minutes trained — last 14 days</p>
        {sessions.length ? <MiniBars data={bars} /> : <EmptyState icon={<Dumbbell size={28} />} text="No sessions yet — start your first one above." />}
      </Card>

      {/* Time of day */}
      {sessions.length > 0 && (
        <Card className="mt-3">
          <p className="text-xs font-bold mb-3 text-foreground/90 flex items-center gap-1.5"><Clock3 size={14} className="text-primary" /> When you train</p>
          <div className="space-y-2">
            {(Object.keys(todCounts) as TimeOfDay[]).map((k) => {
              const total = sessions.length;
              const pct = Math.round((todCounts[k] / total) * 100);
              if (todCounts[k] === 0) return null;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0">{TIME_OF_DAY_LABEL[k]}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full grad-hero" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Why train / cost of skipping */}
      <SectionTitle title="Why you show up" sub="Benefits you're collecting" />
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-amber-500" />
          <p className="text-xs font-bold text-foreground/90">What consistent training gives you</p>
        </div>
        <ProCon pros={GYM_BENEFITS} compact />
      </Card>
      <Card className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={15} className="text-red-500" />
          <p className="text-xs font-bold text-foreground/90">What skipping costs you</p>
        </div>
        <ProCon cons={GYM_SKIP_COSTS} compact />
      </Card>

      {/* Manual log */}
      <button onClick={() => setShowManual(!showManual)} className="w-full flex items-center justify-between mt-4 text-sm font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5"><Plus size={15} /> Log a past session manually</span>
        {showManual ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showManual && (
        <Card className="mt-2 space-y-3">
          <div>
            <Label>Date</Label>
            <Input type="date" value={manualDate} max={todayISO()} onChange={(e) => setManualDate(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" inputMode="numeric" min={1} value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} />
          </div>
          <div>
            <Label>Time of day</Label>
            <Select value={manualTod} onChange={(e) => setManualTod(e.target.value as TimeOfDay)}>
              {(Object.keys(TIME_OF_DAY_LABEL) as TimeOfDay[]).map((k) => (
                <option key={k} value={k}>{TIME_OF_DAY_LABEL[k]}</option>
              ))}
            </Select>
          </div>
          <PrimaryButton
            disabled={!manualDate || !Number(manualMinutes)}
            onClick={() => {
              const d = new Date(manualDate + 'T12:00:00');
              dispatch({
                type: 'addGym',
                session: {
                  dateISO: manualDate,
                  startISO: d.toISOString(),
                  endISO: new Date(d.getTime() + Number(manualMinutes) * 60000).toISOString(),
                  minutes: Number(manualMinutes),
                  timeOfDay: manualTod,
                  exercises: [],
                },
              });
              setShowManual(false);
            }}
          >
            Save session
          </PrimaryButton>
        </Card>
      )}

      {/* History */}
      <SectionTitle title="History" sub={`${sessions.length} session${sessions.length === 1 ? '' : 's'} logged · ${totalKcal} kcal total`} />
      <Card className="p-2">
        {sortedHistory.length === 0 ? (
          <EmptyState icon={<CalendarDays size={28} />} text="Your logged workouts will appear here." />
        ) : (
          <>
            {historyShown.map((s) => (
              <div key={s.id} className="px-3 py-2.5 rounded-xl hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl grad-coral-soft flex items-center justify-center shrink-0">
                    <Dumbbell size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{new Date(s.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.minutes} min · ~{s.calories} kcal · {TIME_OF_DAY_LABEL[s.timeOfDay].split(' ')[0]}
                      {s.exercises.length > 0 && ` · ${s.exercises.length} exercises`}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'deleteGym', id: s.id })}
                    className="p-2 text-muted-foreground/50 hover:text-red-500"
                    aria-label="Delete session"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {s.exercises.length > 0 && (
                  <div className="mt-1.5 ml-12 flex flex-wrap gap-1.5">
                    {s.exercises.map((e, i) => (
                      <Pill key={i} tone="neutral">
                        {e.name}{e.sets ? ` ${e.sets}×${e.reps ?? '?'}` : ''}{e.weightKg ? ` @${e.weightKg}kg` : ''}
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sortedHistory.length > 5 && (
              <button onClick={() => setExpandedHistory(!expandedHistory)} className="w-full text-center text-xs font-semibold text-muted-foreground py-2">
                {expandedHistory ? 'Show less' : `Show all ${sortedHistory.length}`}
              </button>
            )}
          </>
        )}
      </Card>
      <p className="text-[10px] text-muted-foreground/70 text-center pt-3">Calories are approximations based on vigorous weight-training intensity (~5.5 METs) × your body weight. Set your weight in Settings.</p>
    </div>
  );
}
