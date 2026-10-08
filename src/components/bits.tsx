import React from 'react';
import { cn } from '../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('glass rounded-2xl p-4 card-hover', className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-2 mt-5">
      <div>
        <h2 className="text-sm font-bold tracking-wide text-foreground/90">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn('text-xl font-bold mt-0.5', accent || 'text-foreground')}>
        {value}
        {unit && <span className="text-xs font-medium text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'accent'; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    neutral: 'bg-secondary text-secondary-foreground',
    good: 'bg-emerald-500/12 text-emerald-700 border border-emerald-600/25',
    warn: 'bg-amber-500/15 text-amber-700 border border-amber-600/30',
    bad: 'bg-red-500/12 text-red-700 border border-red-600/25',
    info: 'bg-sky-500/12 text-sky-700 border border-sky-600/25',
    accent: 'bg-primary/12 text-primary border border-primary/25',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tones[tone])}>{children}</span>;
}

export function PrimaryButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'w-full rounded-xl grad-hero text-white font-semibold py-3 text-sm active:scale-[0.98] transition-transform disabled:opacity-40 disabled:pointer-events-none shadow-[0_6px_16px_-6px_hsl(14_94%_55%/0.6)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'w-full rounded-xl bg-secondary text-secondary-foreground font-semibold py-3 text-sm active:scale-[0.98] transition-transform disabled:opacity-40 disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl bg-muted/60 border border-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl bg-muted/60 border border-input px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{children}</label>;
}

export function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-muted-foreground/60 mb-2">{icon}</div>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

/** Simple inline SVG bar chart for 7/14 day series. values: {label, value}[] */
export function MiniBars({ data, height = 90, color = 'hsl(14 94% 55%)' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[9px] text-muted-foreground">{d.value > 0 ? d.value : ''}</span>
          <div
            className="w-full rounded-md transition-all"
            style={{ height: `${Math.max(d.value > 0 ? 6 : 2, (d.value / max) * (height - 28))}px`, background: d.value > 0 ? color : 'hsl(28 60% 90%)' }}
          />
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Ring({ percent, size = 64, stroke = 6, color = 'hsl(14 94% 55%)', track = 'hsl(28 60% 92%)', children }: { percent: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (p / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Illustrated banner with rounded corners, matching the app's flat-illustration heroes. */
export function HeroBanner({ src, alt, height = 140, overlay }: { src: string; alt: string; height?: number; overlay?: React.ReactNode }) {
  return (
    <div className="hero-img mt-3" style={{ height }}>
      <img src={src} alt={alt} />
      {overlay && <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/45 via-transparent to-transparent">{overlay}</div>}
    </div>
  );
}

/** Benefits (+) and drawbacks (−) lists used across the app. */
export function ProCon({ pros, cons, proLabel = 'Benefits', conLabel = 'Drawbacks', compact = false }: { pros?: string[]; cons?: string[]; proLabel?: string; conLabel?: string; compact?: boolean }) {
  const text = compact ? 'text-[11px]' : 'text-xs';
  return (
    <div className="space-y-2.5">
      {pros && pros.length > 0 && (
        <div>
          <p className={`${text} font-bold text-emerald-700 mb-1`}>{proLabel}</p>
          <div className="space-y-1">
            {pros.map((p, i) => (
              <p key={`p${i}`} className={`${text} text-foreground/80 flex gap-2`}>
                <span className="text-emerald-600 font-bold shrink-0">+</span>
                <span>{p}</span>
              </p>
            ))}
          </div>
        </div>
      )}
      {cons && cons.length > 0 && (
        <div>
          <p className={`${text} font-bold text-red-700/80 mb-1`}>{conLabel}</p>
          <div className="space-y-1">
            {cons.map((c, i) => (
              <p key={`c${i}`} className={`${text} text-muted-foreground flex gap-2`}>
                <span className="text-red-500/80 font-bold shrink-0">–</span>
                <span>{c}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
