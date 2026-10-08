import React, { useMemo, useState } from 'react';
import { Brain, BookOpen, Crown, Trash2, CalendarCheck2, Hourglass } from 'lucide-react';
import { useStore, todayISO, daysSinceLatest, countInLastDays, notify } from '../lib/store';
import {
  MEDITATION_BENEFITS,
  MEDITATION_KINDS,
  READING_CATEGORIES,
  CHESS_BENEFITS,
  CHESS_GAP_WARNINGS,
  HABIT_GAP_WARNINGS,
} from '../lib/data';
import { Card, SectionTitle, Stat, Pill, PrimaryButton, Input, Select, Label, EmptyState, HeroBanner } from '../components/bits';

type Tab = 'meditate' | 'read' | 'chess';

export default function Mind() {
  const [tab, setTab] = useState<Tab>('meditate');

  return (
    <div className="px-4 pt-2 pb-28 space-y-1">
      <HeroBanner src="/hero-mind.jpg" alt="Mind habits illustration" height={130} />

      <div className="flex gap-2 mt-3">
        {(
          [
            { id: 'meditate', label: 'Meditate', icon: <Brain size={14} /> },
            { id: 'read', label: 'Read', icon: <BookOpen size={14} /> },
            { id: 'chess', label: 'Chess', icon: <Crown size={14} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 text-[13px] font-bold border transition-colors ${
              tab === t.id ? 'grad-hero text-white border-transparent shadow-[0_4px_12px_-4px_hsl(14_94%_55%/0.6)]' : 'bg-muted/60 border-border text-muted-foreground'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'meditate' && <Meditate />}
      {tab === 'read' && <Read />}
      {tab === 'chess' && <Chess />}
    </div>
  );
}

// ─────────────────────────── Meditation ───────────────────────────
function Meditate() {
  const { state, dispatch } = useStore();
  const [minutes, setMinutes] = useState('10');
  const [kind, setKind] = useState(MEDITATION_KINDS[0]);

  const dates = state.meditationLogs.map((l) => l.dateISO);
  const totalMin = state.meditationLogs.reduce((a, l) => a + l.minutes, 0);
  const totalSessions = state.meditationLogs.length;
  const weekCount = countInLastDays(dates, 7);
  const gap = daysSinceLatest(dates);
  const todayLogged = dates.includes(todayISO());
  const warning = gap !== null && !todayLogged ? HABIT_GAP_WARNINGS.meditation.filter((w) => gap >= w.days).pop() : null;

  return (
    <div className="space-y-1">
      {warning && (
        <Card className="mt-3 border-amber-500/50 bg-amber-50">
          <p className="text-xs text-amber-700 font-semibold">⚠ {warning.text}</p>
        </Card>
      )}

      <Card className="mt-3">
        <p className="text-sm font-bold mb-1">{todayLogged ? 'Meditation logged today — mind maintained. 🙏' : 'Have you meditated today?'}</p>
        <p className="text-[11px] text-muted-foreground mb-3">Even 5 minutes counts. Consistency beats duration.</p>
        <div className="flex gap-2 mb-3">
          {['5', '10', '15', '20'].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={`flex-1 rounded-xl py-2 text-sm font-bold border transition-colors ${
                minutes === m ? 'bg-primary text-white border-primary' : 'bg-muted/60 border-border text-muted-foreground'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
        <div className="mb-3">
          <Input type="number" inputMode="numeric" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div className="mb-3">
          <Label>Style</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            {MEDITATION_KINDS.map((k) => <option key={k}>{k}</option>)}
          </Select>
        </div>
        <PrimaryButton
          disabled={!Number(minutes)}
          onClick={() => {
            dispatch({ type: 'addMeditation', log: { dateISO: todayISO(), minutes: Number(minutes), kind } });
            notify('Meditation logged 🧘', `${minutes} min of ${kind.toLowerCase()}. Attention is a muscle — you just trained it.`);
          }}
        >
          Log meditation
        </PrimaryButton>
      </Card>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Days (7d)" value={weekCount} unit="days" accent="text-primary" /></Card>
        <Card><Stat label="Sessions" value={totalSessions} /></Card>
        <Card><Stat label="Minutes" value={totalMin} /></Card>
      </div>

      <SectionTitle title="Benefits you're building" sub="Based on published mindfulness research" />
      <div className="space-y-3">
        {MEDITATION_BENEFITS.map((b) => {
          const active = totalSessions >= 1 && (b.minDays === 1 || weekCount >= Math.min(b.minDays, 7) || totalSessions >= b.minDays);
          return (
            <Card key={b.minDays} className={active ? 'border-primary/30 bg-primary/5' : ''}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-bold ${active ? '' : 'text-muted-foreground'}`}>{b.title}</p>
                {active && <Pill tone="accent">building</Pill>}
              </div>
              <p className="text-[11px] text-muted-foreground">{b.text}</p>
            </Card>
          );
        })}
      </div>

      <LogList
        logs={state.meditationLogs}
        emptyText="Your meditation sessions will appear here."
        render={(l) => `${l.minutes} min · ${l.kind}`}
        onDelete={(id) => dispatch({ type: 'deleteLog', habit: 'meditation', id })}
      />
    </div>
  );
}

// ─────────────────────────── Reading ───────────────────────────
function Read() {
  const { state, dispatch } = useStore();
  const [minutes, setMinutes] = useState('20');
  const [book, setBook] = useState('');
  const [category, setCategory] = useState('nonfiction');

  const dates = state.readingLogs.map((l) => l.dateISO);
  const totalMin = state.readingLogs.reduce((a, l) => a + l.minutes, 0);
  const weekCount = countInLastDays(dates, 7);
  const gap = daysSinceLatest(dates);
  const todayLogged = dates.includes(todayISO());
  const warning = gap !== null && !todayLogged ? HABIT_GAP_WARNINGS.reading.filter((w) => gap >= w.days).pop() : null;
  const cat = READING_CATEGORIES[category];

  return (
    <div className="space-y-1">
      {warning && (
        <Card className="mt-3 border-amber-500/50 bg-amber-50">
          <p className="text-xs text-amber-700 font-semibold">⚠ {warning.text}</p>
        </Card>
      )}

      <Card className="mt-3">
        <p className="text-sm font-bold mb-1">{todayLogged ? 'Reading logged today — mind fed. 📖' : 'Have you read today?'}</p>
        <p className="text-[11px] text-muted-foreground mb-3">What are you reading, and for how long?</p>
        <div className="space-y-3">
          <div>
            <Label>Book / material</Label>
            <Input placeholder="e.g. Meditations — Marcus Aurelius" value={book} onChange={(e) => setBook(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.entries(READING_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Minutes</Label>
            <Input type="number" inputMode="numeric" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <PrimaryButton
            disabled={!Number(minutes)}
            onClick={() => {
              dispatch({ type: 'addReading', log: { dateISO: todayISO(), minutes: Number(minutes), book: book || 'Untitled', category } });
              notify('Reading logged 📚', `${minutes} min of ${cat.label.toLowerCase()}. Knowledge compounding.`);
            }}
          >
            Log reading
          </PrimaryButton>
        </div>
      </Card>

      {/* Perceived benefits for chosen category */}
      <Card className="mt-3">
        <p className="text-xs font-bold mb-2 text-foreground/90">Why keep reading — {cat.label}</p>
        <div className="space-y-1.5">
          {cat.benefits.map((b, i) => (
            <p key={i} className="text-[11px] text-muted-foreground flex gap-2"><span className="text-emerald-600 font-bold">+</span>{b}</p>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Days (7d)" value={weekCount} unit="days" accent="text-primary" /></Card>
        <Card><Stat label="Sessions" value={state.readingLogs.length} /></Card>
        <Card><Stat label="Minutes" value={totalMin} /></Card>
      </div>

      <LogList
        logs={state.readingLogs}
        emptyText="Your reading sessions will appear here."
        render={(l) => `${l.minutes} min · ${l.book}${l.category ? ` · ${READING_CATEGORIES[l.category]?.label || l.category}` : ''}`}
        onDelete={(id) => dispatch({ type: 'deleteLog', habit: 'reading', id })}
      />
    </div>
  );
}

// ─────────────────────────── Chess ───────────────────────────
function Chess() {
  const { state, dispatch } = useStore();
  const [minutes, setMinutes] = useState('15');
  const [kind, setKind] = useState('games');
  const [games, setGames] = useState('1');

  const dates = state.chessLogs.map((l) => l.dateISO);
  const totalMin = state.chessLogs.reduce((a, l) => a + l.minutes, 0);
  const weekCount = countInLastDays(dates, 7);
  const gap = daysSinceLatest(dates);
  const todayLogged = dates.includes(todayISO());
  const warning = gap !== null && !todayLogged ? CHESS_GAP_WARNINGS.filter((w) => gap >= w.days).pop() : null;

  return (
    <div className="space-y-1">
      {warning && (
        <Card className={`mt-3 ${warning.severe ? 'border-red-500/60 bg-red-50' : 'border-amber-500/50 bg-amber-50'}`}>
          <p className={`text-xs font-bold ${warning.severe ? 'text-red-700' : 'text-amber-700'}`}>
            {warning.severe ? '🚨 Drawbacks getting severe' : '⚠'} {warning.text}
          </p>
        </Card>
      )}

      <Card className="mt-3">
        <p className="text-sm font-bold mb-1">{todayLogged ? 'Chess logged today — the board is sharp. ♞' : 'Played any chess today?'}</p>
        <p className="text-[11px] text-muted-foreground mb-3">Games, puzzles or study — it all counts.</p>
        <div className="space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="games">Games</option>
              <option value="puzzles">Puzzles</option>
              <option value="study">Study / lessons</option>
            </Select>
          </div>
          {kind === 'games' && (
            <div>
              <Label>Games played</Label>
              <Input type="number" inputMode="numeric" min={0} value={games} onChange={(e) => setGames(e.target.value)} />
            </div>
          )}
          <div>
            <Label>Minutes</Label>
            <Input type="number" inputMode="numeric" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <PrimaryButton
            disabled={!Number(minutes)}
            onClick={() => {
              dispatch({ type: 'addChess', log: { dateISO: todayISO(), minutes: Number(minutes), kind, games: kind === 'games' ? Number(games) : undefined } });
              notify('Chess logged ♞', `${minutes} min of ${kind}. Your working memory just did a set.`);
            }}
          >
            Log chess
          </PrimaryButton>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <Card><Stat label="Days (7d)" value={weekCount} unit="days" accent="text-primary" /></Card>
        <Card><Stat label="Sessions" value={state.chessLogs.length} /></Card>
        <Card><Stat label="Minutes" value={totalMin} /></Card>
      </div>

      <SectionTitle title="Benefits you're building" sub="From chess cognition research" />
      <div className="space-y-3">
        {CHESS_BENEFITS.map((b) => {
          const active = state.chessLogs.length >= 1 && (b.minDays === 1 || weekCount >= Math.min(b.minDays, 7) || state.chessLogs.length >= b.minDays);
          return (
            <Card key={b.minDays} className={active ? 'border-primary/30 bg-primary/5' : ''}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-bold ${active ? '' : 'text-muted-foreground'}`}>{b.title}</p>
                {active && <Pill tone="accent">building</Pill>}
              </div>
              <p className="text-[11px] text-muted-foreground">{b.text}</p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-3">
        <p className="text-xs font-bold mb-1.5 text-foreground/90">The cost of skipping — honestly</p>
        <div className="space-y-1.5">
          {CHESS_GAP_WARNINGS.map((w) => (
            <p key={w.days} className="text-[11px] text-muted-foreground flex gap-2">
              <span className={w.severe ? 'text-red-500 font-bold' : 'text-red-400 font-bold'}>–</span>{w.text}
            </p>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-2">Forge alerts you when the gap gets severe — watch for the red banner and a notification.</p>
      </Card>

      <LogList
        logs={state.chessLogs}
        emptyText="Your chess sessions will appear here."
        render={(l) => `${l.minutes} min · ${l.kind}${l.games ? ` · ${l.games} game${l.games === 1 ? '' : 's'}` : ''}`}
        onDelete={(id) => dispatch({ type: 'deleteLog', habit: 'chess', id })}
      />
    </div>
  );
}

// ─────────────────────────── Shared ───────────────────────────
function LogList<T extends { id: string; dateISO: string }>({
  logs,
  render,
  emptyText,
  onDelete,
}: {
  logs: T[];
  render: (l: T) => string;
  emptyText: string;
  onDelete: (id: string) => void;
}) {
  const sorted = useMemo(() => [...logs].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 10), [logs]);
  if (!sorted.length) return <Card className="mt-3"><EmptyState icon={<Hourglass size={24} />} text={emptyText} /></Card>;
  return (
    <>
      <SectionTitle title="Recent activity" />
      <Card className="p-2">
        {sorted.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <CalendarCheck2 size={13} className="text-primary shrink-0" />
                {new Date(l.dateISO + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{render(l)}</p>
            </div>
            <button onClick={() => onDelete(l.id)} className="p-2 text-muted-foreground/50 hover:text-red-500" aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}
