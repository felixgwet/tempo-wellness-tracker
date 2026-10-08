import { useEffect, useMemo, useState } from 'react';
import { MoonStar, Trash2, Lightbulb, BedDouble, AlarmClockCheck } from 'lucide-react';
import { useStore, todayISO, dateISO, notify } from '../lib/store';
import { SLEEP_BANDS, SLEEP_TIPS } from '../lib/data';
import type { SleepLog } from '../types';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, GhostButton, Input, Label, EmptyState, MiniBars, HeroBanner, ProCon } from '../components/bits';

const SLEEP_START_KEY = 'tempo-sleep-start';

function bandFor(hours: number) {
  return SLEEP_BANDS.find((b) => hours < b.max)!;
}

function fmtHM(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export default function Sleep() {
  const { state, dispatch } = useStore();
  const [date, setDate] = useState(todayISO());
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<SleepLog['quality']>(3);
  // tap-to-sleep: pending bedtime stored locally so it survives app restarts overnight
  const [sleepStart, setSleepStart] = useState<number | null>(() => {
    const raw = localStorage.getItem(SLEEP_START_KEY);
    const t = raw ? Number(raw) : NaN;
    return Number.isFinite(t) && t > 0 ? t : null;
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sleepStart) return;
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, [sleepStart]);

  const logs = state.sleepLogs;
  const avg = logs.length ? logs.reduce((a, l) => a + l.hours, 0) / logs.length : 0;
  const inZone = logs.filter((l) => l.hours >= 7 && l.hours <= 9).length;

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      const log = logs.find((l) => l.dateISO === iso);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: log ? Math.round(log.hours * 10) / 10 : 0 });
    }
    return out;
  }, [logs]);

  const sorted = useMemo(() => [...logs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 14), [logs]);
  const lastNight = logs.find((l) => l.dateISO === todayISO()) || sorted[0];
  const lastBand = lastNight ? bandFor(lastNight.hours) : null;

  const goToBed = () => {
    const t = Date.now();
    localStorage.setItem(SLEEP_START_KEY, String(t));
    setSleepStart(t);
    setNow(Date.now());
  };

  const wakeUp = () => {
    if (!sleepStart) return;
    const wake = Date.now();
    // give or take ~10 minutes: round the elapsed time to the nearest 10 min
    const elapsedMin = (wake - sleepStart) / 60000;
    const roundedMin = Math.max(10, Math.round(elapsedMin / 10) * 10);
    const h = Math.round((roundedMin / 60) * 10) / 10;
    localStorage.removeItem(SLEEP_START_KEY);
    setSleepStart(null);
    dispatch({
      type: 'addSleep',
      log: { dateISO: todayISO(), hours: h, quality, note: `Bed ${new Date(sleepStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → wake ${new Date(wake).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (±10 min)` },
    });
    const b = bandFor(h);
    if (b.tone === 'good') notify('Sleep logged 🌙', `${h}h — right in the optimal zone.`);
    else notify('Sleep logged 🌙', `${h}h — aim for 7–9h tonight.`);
  };

  const sleptAlready = sleepStart ? Math.max(0, (now - sleepStart) / 60000) : 0;

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <HeroBanner src="/hero-sleep.jpg" alt="Sleep illustration" height={130} />

      {/* Tap-to-sleep timer */}
      <Card className="mt-3">
        {!sleepStart ? (
          <div className="flex flex-col items-center py-1">
            <div className="w-14 h-14 rounded-2xl grad-sleep flex items-center justify-center mb-3">
              <BedDouble className="text-white" size={26} />
            </div>
            <p className="text-sm font-bold">Going to bed now?</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 text-center">Tap when you get in bed — tap again when you wake up.<br />Logged to the nearest 10 minutes.</p>
            <div className="w-full">
              <Label>How rested do you feel (right after waking)?</Label>
              <div className="flex gap-2 mb-3">
                {([1, 2, 3, 4, 5] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors ${
                      quality === q ? 'grad-hero text-white border-transparent shadow-[0_4px_12px_-4px_hsl(14_94%_55%/0.6)]' : 'bg-muted/60 border-border text-muted-foreground'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton className="ring-pulse" onClick={goToBed}>I'm going to sleep</PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Sleeping since {new Date(sleepStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-4xl font-bold tabular-nums my-3 tracking-tight text-violet-600">{fmtHM(sleptAlready)}</p>
            <p className="text-xs text-muted-foreground mb-4 text-center">So far tonight. Rest counts from the moment you tapped.<br />Wake time is rounded to the nearest 10 minutes.</p>
            <div className="flex gap-2 w-full">
              <GhostButton onClick={() => { localStorage.removeItem(SLEEP_START_KEY); setSleepStart(null); }}>Cancel</GhostButton>
              <PrimaryButton onClick={wakeUp}><span className="flex items-center justify-center gap-2"><AlarmClockCheck size={16} /> I woke up</span></PrimaryButton>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-3">
        <p className="text-xs font-bold text-foreground/90 mb-3">Log last night's sleep manually</p>
        <div className="space-y-3">
          <div>
            <Label>Date (day you woke up)</Label>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Hours slept</Label>
            <Input type="number" inputMode="decimal" step="0.5" min="0" max="16" value={hours} onChange={(e) => setHours(e.target.value)} />
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={Number(hours) || 0}
              onChange={(e) => setHours(e.target.value)}
              className="w-full mt-3 accent-[hsl(262_80%_60%)]"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>3h</span><span className="text-emerald-600 font-bold">7–9h optimal</span><span>12h</span>
            </div>
          </div>
          <div>
            <Label>How rested do you feel?</Label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-colors ${
                    quality === q ? 'grad-hero text-white border-transparent shadow-[0_4px_12px_-4px_hsl(14_94%_55%/0.6)]' : 'bg-muted/60 border-border text-muted-foreground'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton
            disabled={!date || !Number(hours)}
            onClick={() => {
              dispatch({ type: 'addSleep', log: { dateISO: date, hours: Number(hours), quality } });
              const b = bandFor(Number(hours));
              if (b.tone === 'good') notify('Sleep logged 🌙', `${hours}h — right in the optimal zone.`);
              else notify('Sleep logged 🌙', `${hours}h — aim for 7–9h tonight.`);
            }}
          >
            Save sleep
          </PrimaryButton>
        </div>
      </Card>

      {/* Last night verdict — full benefits/drawbacks of that entry */}
      {lastNight && lastBand && (
        <Card className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <MoonStar size={16} className={lastBand.tone === 'good' ? 'text-emerald-600' : lastBand.tone === 'bad' ? 'text-red-500' : 'text-amber-500'} />
            <p className="text-sm font-bold">Your last log: {lastNight.hours}h — {lastBand.headline}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2.5">
            Adult recommendation: <span className="font-semibold text-emerald-700">7–9 hours</span> (AASM / CDC / Sleep Foundation). Felt {lastNight.quality}/5 rested.
          </p>
          <ProCon
            pros={lastBand.pros}
            cons={lastBand.cons}
            proLabel={lastBand.tone === 'good' ? 'What this gives you' : 'The only upside'}
            conLabel={lastBand.tone === 'good' ? 'Watch out' : 'The drawbacks of this duration'}
            compact
          />
        </Card>
      )}

      {/* Stats */}
      <SectionTitle title="Your sleep" />
      <div className="grid grid-cols-2 gap-3">
        <Card><Stat label="Average" value={avg ? avg.toFixed(1) : '—'} unit="h" accent="text-primary" /><p className="text-[11px] text-muted-foreground mt-1">across {logs.length} night{logs.length === 1 ? '' : 's'}</p></Card>
        <Card><Stat label="In optimal zone" value={logs.length ? Math.round((inZone / logs.length) * 100) : 0} unit="%" accent="text-emerald-600" /><p className="text-[11px] text-muted-foreground mt-1">of nights at 7–9h</p></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-3 text-foreground/90">Hours — last 14 days</p>
        {logs.length ? <MiniBars data={bars} color="hsl(262 80% 60%)" /> : <EmptyState icon={<BedDouble size={28} />} text="Log your first night above." />}
      </Card>

      {/* Reference bands — the full research grid */}
      <SectionTitle title="Every duration, honestly graded" sub="What the research says about each sleep length" />
      <div className="space-y-3">
        {SLEEP_BANDS.map((b) => (
          <Card key={b.label} className={b.tone === 'good' ? 'border-emerald-500/40 bg-emerald-500/5' : ''}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold">{b.label}</p>
              <Pill tone={b.tone === 'good' ? 'good' : b.tone === 'bad' ? 'bad' : b.tone === 'warn' ? 'warn' : 'info'}>{b.headline}</Pill>
            </div>
            <ProCon pros={b.pros} cons={b.cons} compact />
          </Card>
        ))}
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5 text-foreground/90"><Lightbulb size={14} className="text-amber-500" /> Sleep better tonight</p>
        <ul className="space-y-1.5">
          {SLEEP_TIPS.map((t, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-primary font-bold">•</span>{t}</li>
          ))}
        </ul>
      </Card>

      {/* History */}
      {sorted.length > 0 && (
        <>
          <SectionTitle title="Recent nights" />
          <Card className="p-2">
            {sorted.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(l.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[11px] text-muted-foreground">{l.hours}h · felt {l.quality}/5</p>
                </div>
                <Pill tone={bandFor(l.hours).tone === 'good' ? 'good' : bandFor(l.hours).tone === 'bad' ? 'bad' : bandFor(l.hours).tone === 'warn' ? 'warn' : 'info'}>
                  {bandFor(l.hours).label}
                </Pill>
                <button onClick={() => dispatch({ type: 'deleteSleep', id: l.id })} className="p-2 text-muted-foreground/50 hover:text-red-500" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
