import { useMemo, useState } from 'react';
import { Droplets, Footprints, Trash2, Sparkles, TrendingDown, Target, Minus, Plus } from 'lucide-react';
import { useStore, todayISO, dateISO, mlOn, notify } from '../lib/store';
import {
  WATER_BENEFITS, WATER_SKIP_COSTS, WATER_TIPS, WATER_REMINDER_NOTE,
  RUN_BENEFITS, RUN_SKIP_COSTS, RUN_TIPS,
  fmtWater, fmtDist, ML_PER_OZ, KM_PER_MI,
} from '../lib/data';
import { Card, SectionTitle, Stat, PrimaryButton, Input, Label, EmptyState, MiniBars, HeroBanner, ProCon, Ring } from '../components/bits';

const QUICK_ML = [250, 500, 750];
const RUN_PRESETS = [15, 30, 45, 60];

export default function Fuel() {
  const { state, dispatch } = useStore();
  const units = state.settings.units;
  const targetMl = state.settings.waterTarget;
  const [targetDraft, setTargetDraft] = useState(String(targetMl));
  const [customMl, setCustomMl] = useState('');
  const [runDate, setRunDate] = useState(todayISO());
  const [runMinutes, setRunMinutes] = useState('30');
  const [runDist, setRunDist] = useState('');
  const [runNote, setRunNote] = useState('');

  const today = todayISO();
  const todayMl = mlOn(state.waterLogs, today);
  const pct = Math.min(100, Math.round((todayMl / targetMl) * 100));

  // ─── Water charts & stats ───
  const waterBars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: Math.round(mlOn(state.waterLogs, dateISO(d)) / 100) / 10 });
    }
    return out;
  }, [state.waterLogs]);

  const hitTargetDays = useMemo(() => {
    const days = new Map<string, number>();
    state.waterLogs.forEach((l) => days.set(l.dateISO, (days.get(l.dateISO) || 0) + l.ml));
    return [...days.values()].filter((ml) => ml >= targetMl).length;
  }, [state.waterLogs, targetMl]);

  const addWater = (ml: number) => {
    if (ml <= 0) return;
    dispatch({ type: 'addWater', log: { dateISO: today, ml } });
    const newTotal = todayMl + ml;
    if (newTotal >= targetMl && todayMl < targetMl) {
      notify('Hydration target hit 💧', `${fmtWater(newTotal, units)} logged. Well watered.`);
    }
  };

  const removeLastWater = () => {
    const lastToday = state.waterLogs.find((l) => l.dateISO === today);
    if (lastToday) dispatch({ type: 'deleteWater', id: lastToday.id });
  };

  // ─── Run stats ───
  const runs = state.runLogs;
  const totalRunMin = runs.reduce((a, r) => a + r.minutes, 0);
  const totalRunKm = runs.reduce((a, r) => a + (r.distanceKm || 0), 0);

  const runBars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: runs.filter((r) => r.dateISO === iso).reduce((a, r) => a + r.minutes, 0) });
    }
    return out;
  }, [runs]);

  const sortedRuns = useMemo(() => [...runs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 8), [runs]);

  const saveRun = () => {
    const minutes = Number(runMinutes);
    if (!runDate || !minutes) return;
    const distInput = Number(runDist);
    // distance is entered in the user's units — normalise to km for storage
    const distanceKm = runDist && distInput > 0 ? (units === 'metric' ? distInput : distInput * KM_PER_MI) : undefined;
    dispatch({ type: 'addRun', log: { dateISO: runDate, minutes, distanceKm, note: runNote.trim() || undefined } });
    notify('Run logged 🏃', `${minutes} min${distanceKm ? ` · ${fmtDist(distanceKm, units)}` : ''}. Engine work done.`);
    setRunDist('');
    setRunNote('');
  };

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <HeroBanner src="/hero-water.png" alt="Hydration illustration" height={130} />

      {/* ─── Water: today card ─── */}
      <Card className="mt-3">
        <div className="flex items-center gap-4">
          <Ring percent={pct} size={84} stroke={8} color="hsl(200 95% 45%)">
            <Droplets size={22} className={pct >= 100 ? 'text-sky-600' : 'text-muted-foreground'} />
          </Ring>
          <div className="flex-1">
            <p className="text-sm font-bold">{pct >= 100 ? 'Target hit — fully watered. 💧' : todayMl === 0 ? 'No water logged yet today.' : `${fmtWater(targetMl - todayMl, units)} to go.`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {fmtWater(todayMl, units)} / {fmtWater(targetMl, units)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={removeLastWater}
            disabled={todayMl <= 0}
            className="w-11 rounded-xl bg-muted/70 py-2.5 flex items-center justify-center active:scale-[0.96] transition-transform disabled:opacity-30"
            aria-label="Remove last water entry"
          >
            <Minus size={15} />
          </button>
          {QUICK_ML.map((ml) => (
            <PrimaryButton key={ml} className="flex-1 !grad-blue !py-2.5" onClick={() => addWater(ml)}>
              <span className="flex items-center justify-center gap-1.5"><Plus size={13} /> {units === 'metric' ? `${ml} ml` : `${Math.round(ml / ML_PER_OZ)} oz`}</span>
            </PrimaryButton>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input type="number" inputMode="numeric" min={1} placeholder={units === 'metric' ? 'Custom ml…' : 'Custom oz…'} value={customMl} onChange={(e) => setCustomMl(e.target.value)} />
          <PrimaryButton
            className="w-auto px-5"
            disabled={!Number(customMl)}
            onClick={() => {
              const v = Number(customMl);
              addWater(units === 'metric' ? v : Math.round(v * ML_PER_OZ));
              setCustomMl('');
            }}
          >
            Add
          </PrimaryButton>
        </div>

        {/* Target setting */}
        <div className="mt-4 pt-3 border-t border-border">
          <Label>Daily target ({units === 'metric' ? 'ml' : 'oz'})</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={targetDraft}
              onChange={(e) => setTargetDraft(e.target.value)}
            />
            <PrimaryButton
              className="w-auto px-5"
              onClick={() => {
                const v = Number(targetDraft) || 2400;
                dispatch({ type: 'setWaterTarget', ml: units === 'metric' ? v : Math.round(v * ML_PER_OZ) });
              }}
            >
              Save
            </PrimaryButton>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1"><Target size={11} /> Default 2 400 ml (≈ 81 oz). Adjust for body size, heat and training days. Change units in Settings.</p>
        </div>
      </Card>

      {/* Water stats */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Avg (7d)" value={(state.waterLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000))).reduce((a, l) => a + l.ml, 0) / 7 / (units === 'metric' ? 1 : ML_PER_OZ)).toFixed(0)} unit={units === 'metric' ? 'ml' : 'oz'} accent="text-sky-600" /></Card>
        <Card><Stat label="Days on target" value={hitTargetDays} accent="text-primary" /></Card>
        <Card><Stat label="Total" value={(state.waterLogs.reduce((a, l) => a + l.ml, 0) / (units === 'metric' ? 1 : ML_PER_OZ)).toFixed(0)} unit={units === 'metric' ? 'ml' : 'oz'} /></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-3 text-foreground/90">{units === 'metric' ? 'Litres' : 'Oz'} per day — last 14 days</p>
        {state.waterLogs.length ? <MiniBars data={waterBars} color="hsl(200 95% 45%)" /> : <EmptyState icon={<Droplets size={28} />} text="Log your first water above." />}
      </Card>

      {/* ─── Running ─── */}
      <SectionTitle title="Running" sub="Minutes + optional distance" />
      <Card>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Date</Label>
            <Input type="date" value={runDate} max={todayISO()} onChange={(e) => setRunDate(e.target.value)} />
          </div>
          <div>
            <Label>How long? (minutes)</Label>
            <Input type="number" inputMode="numeric" min={1} value={runMinutes} onChange={(e) => setRunMinutes(e.target.value)} />
          </div>
          <div>
            <Label>Distance ({units === 'metric' ? 'km' : 'mi'}, optional)</Label>
            <Input type="number" inputMode="decimal" min={0} step="0.1" placeholder="e.g. 5" value={runDist} onChange={(e) => setRunDist(e.target.value)} />
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Input placeholder="Easy loop, hills…" value={runNote} onChange={(e) => setRunNote(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {RUN_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setRunMinutes(String(m))}
              className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-colors ${Number(runMinutes) === m ? 'grad-hero text-white border-transparent' : 'bg-muted/60 border-border text-muted-foreground'}`}
            >
              {m} min
            </button>
          ))}
        </div>
        <PrimaryButton className="mt-3" disabled={!runDate || !Number(runMinutes)} onClick={saveRun}>
          Log run
        </PrimaryButton>
      </Card>

      {/* Run stats */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Runs" value={runs.length} accent="text-primary" /></Card>
        <Card><Stat label="Total time" value={totalRunMin >= 60 ? `${Math.floor(totalRunMin / 60)}h ${totalRunMin % 60}m` : totalRunMin} unit={totalRunMin >= 60 ? '' : 'min'} accent="text-amber-600" /></Card>
        <Card><Stat label="Distance" value={totalRunKm > 0 ? (units === 'metric' ? totalRunKm.toFixed(1) : (totalRunKm / KM_PER_MI).toFixed(1)) : '—'} unit={totalRunKm > 0 ? (units === 'metric' ? 'km' : 'mi') : ''} /></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-3 text-foreground/90">Run minutes — last 14 days</p>
        {runs.length ? <MiniBars data={runBars} color="hsl(14 94% 55%)" /> : <EmptyState icon={<Footprints size={28} />} text="Log your first run above." />}
      </Card>

      {/* Run history */}
      {sortedRuns.length > 0 && (
        <>
          <SectionTitle title="Recent runs" />
          <Card className="p-2">
            {sortedRuns.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50">
                <div className="w-9 h-9 rounded-xl grad-coral-soft flex items-center justify-center shrink-0">
                  <Footprints size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(r.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.minutes} min{r.distanceKm ? ` · ${fmtDist(r.distanceKm, units)}` : ''}{r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <button onClick={() => dispatch({ type: 'deleteRun', id: r.id })} className="p-2 text-muted-foreground/50 hover:text-red-500" aria-label="Delete run">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Why it matters — water */}
      <SectionTitle title="Why hydration matters" sub="Benefits you're collecting" />
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-amber-500" />
          <p className="text-xs font-bold text-foreground/90">What staying hydrated gives you</p>
        </div>
        <ProCon pros={WATER_BENEFITS} compact />
      </Card>
      <Card className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={15} className="text-red-500" />
          <p className="text-xs font-bold text-foreground/90">What running dry costs you</p>
        </div>
        <ProCon cons={WATER_SKIP_COSTS} compact />
      </Card>

      {/* Why it matters — running */}
      <SectionTitle title="Why running pays off" sub="Benefits you're collecting" />
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-amber-500" />
          <p className="text-xs font-bold text-foreground/90">What consistent running gives you</p>
        </div>
        <ProCon pros={RUN_BENEFITS} compact />
      </Card>
      <Card className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={15} className="text-red-500" />
          <p className="text-xs font-bold text-foreground/90">What skipping cardio costs you</p>
        </div>
        <ProCon cons={RUN_SKIP_COSTS} compact />
      </Card>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-2 text-foreground/90">Run better, effortlessly</p>
        <ul className="space-y-1.5">
          {RUN_TIPS.map((t, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-primary font-bold">•</span>{t}</li>
          ))}
        </ul>
      </Card>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-2 text-foreground/90">Drink more, effortlessly</p>
        <ul className="space-y-1.5">
          {WATER_TIPS.map((t, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-sky-600 font-bold">•</span>{t}</li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground/70 mt-2">{WATER_REMINDER_NOTE}</p>
      </Card>
    </div>
  );
}
