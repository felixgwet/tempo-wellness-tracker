import { useMemo, useState } from 'react';
import { Droplets, Minus, Trash2, Sparkles, TrendingDown, Target } from 'lucide-react';
import { useStore, todayISO, dateISO, glassesOn, notify } from '../lib/store';
import { WATER_BENEFITS, WATER_SKIP_COSTS, WATER_TIPS, WATER_REMINDER_NOTE, GLASS_ML } from '../lib/data';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, Input, Label, EmptyState, MiniBars, HeroBanner, ProCon, Ring } from '../components/bits';

export default function Hydrate() {
  const { state, dispatch } = useStore();
  const target = state.settings.waterTarget;
  const [targetDraft, setTargetDraft] = useState(String(target));

  const today = todayISO();
  const todayGlasses = glassesOn(state.waterLogs, today);
  const pct = Math.min(100, Math.round((todayGlasses / target) * 100));

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = dateISO(d);
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), value: glassesOn(state.waterLogs, iso) });
    }
    return out;
  }, [state.waterLogs]);

  const sorted = useMemo(
    () => [...new Map(state.waterLogs.map((l) => [l.dateISO, l])).values()].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 10),
    [state.waterLogs]
  );

  const hitTargetDays = useMemo(() => {
    const days = new Map<string, number>();
    state.waterLogs.forEach((l) => days.set(l.dateISO, (days.get(l.dateISO) || 0) + l.glasses));
    return [...days.values()].filter((g) => g >= target).length;
  }, [state.waterLogs, target]);

  const add = (glasses: number) => {
    dispatch({ type: 'addWater', log: { dateISO: today, glasses } });
    const newTotal = todayGlasses + glasses;
    if (newTotal >= target && todayGlasses < target) {
      notify('Hydration target hit 💧', `${newTotal} glasses (${newTotal * GLASS_ML} ml). Well watered.`);
    }
  };

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <HeroBanner src="/hero-water.png" alt="Hydration illustration" height={130} />

      {/* Today card */}
      <Card className="mt-3">
        <div className="flex items-center gap-4">
          <Ring percent={pct} size={84} stroke={8} color="hsl(200 95% 45%)">
            <Droplets size={22} className={pct >= 100 ? 'text-sky-600' : 'text-muted-foreground'} />
          </Ring>
          <div className="flex-1">
            <p className="text-sm font-bold">{pct >= 100 ? 'Target hit — fully watered. 💧' : todayGlasses === 0 ? 'No water logged yet today.' : `${target - todayGlasses} glass${target - todayGlasses === 1 ? '' : 'es'} to go.`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {todayGlasses} / {target} glasses · ~{todayGlasses * GLASS_ML} ml of ~{target * GLASS_ML} ml
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => todayGlasses > 0 && add(-1)}
            disabled={todayGlasses <= 0}
            className="w-12 rounded-xl bg-muted/70 py-3 flex items-center justify-center active:scale-[0.96] transition-transform disabled:opacity-30"
            aria-label="Remove one glass"
          >
            <Minus size={16} />
          </button>
          <PrimaryButton className="flex-1 !grad-blue" onClick={() => add(1)}>
            <span className="flex items-center justify-center gap-2"><Droplets size={16} /> +1 glass</span>
          </PrimaryButton>
          <button
            onClick={() => add(2)}
            className="w-12 rounded-xl bg-muted/70 py-3 flex items-center justify-center active:scale-[0.96] transition-transform text-sm font-bold"
            aria-label="Add two glasses"
          >
            +2
          </button>
        </div>

        {/* Target setting */}
        <div className="mt-4 pt-3 border-t border-border">
          <Label>Daily target (glasses)</Label>
          <div className="flex gap-2">
            <Input type="number" inputMode="numeric" min={1} max={30} value={targetDraft} onChange={(e) => setTargetDraft(e.target.value)} />
            <PrimaryButton
              className="w-auto px-5"
              onClick={() => dispatch({ type: 'setWaterTarget', glasses: Math.max(1, Number(targetDraft) || 8) })}
            >
              Save
            </PrimaryButton>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1"><Target size={11} /> Default 8 glasses ≈ 2.4 L. Adjust for body size, heat and training days.</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Avg (7d)" value={(state.waterLogs.filter((l) => l.dateISO >= dateISO(new Date(Date.now() - 6 * 86400000))).reduce((a, l) => a + l.glasses, 0) / 7).toFixed(1)} unit="gl" accent="text-sky-600" /></Card>
        <Card><Stat label="Days on target" value={hitTargetDays} accent="text-primary" /></Card>
        <Card><Stat label="Total" value={state.waterLogs.reduce((a, l) => a + l.glasses, 0)} unit="gl" /></Card>
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-3 text-foreground/90">Glasses per day — last 14 days</p>
        {state.waterLogs.length ? <MiniBars data={bars} color="hsl(200 95% 45%)" /> : <EmptyState icon={<Droplets size={28} />} text="Log your first glass above." />}
      </Card>

      {/* Why it matters */}
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

      <Card className="mt-3">
        <p className="text-xs font-bold mb-2 text-foreground/90">Drink more, effortlessly</p>
        <ul className="space-y-1.5">
          {WATER_TIPS.map((t, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-sky-600 font-bold">•</span>{t}</li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground/70 mt-2">{WATER_REMINDER_NOTE}</p>
      </Card>

      {/* Recent days */}
      {sorted.length > 0 && (
        <>
          <SectionTitle title="Recent days" />
          <Card className="p-2">
            {sorted.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{new Date(l.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[11px] text-muted-foreground">{l.glasses} glasses · ~{l.glasses * GLASS_ML} ml</p>
                </div>
                <Pill tone={l.glasses >= target ? 'good' : l.glasses >= target / 2 ? 'warn' : 'bad'}>
                  {l.glasses >= target ? 'on target' : `${target - l.glasses} short`}
                </Pill>
                <button onClick={() => dispatch({ type: 'deleteWater', id: l.id })} className="p-2 text-muted-foreground/50 hover:text-red-500" aria-label="Delete">
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
