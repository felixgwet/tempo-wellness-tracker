# Tempo — Body & Mind

An iPhone-first **progressive web app** that tracks gym workouts, sleep, hydration and mind habits (meditation, reading, chess) — with a motivation engine, evidence-based benefits/drawbacks coaching, and web push reminders. 100% client-side: no backend, no accounts, all data stays in `localStorage` on the user's device.

**Live demo:** https://de3rngsqpkhee.kimi.page

![Tech stack](https://img.shields.io/badge/React-18-61dafb) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## Why I built it

I wanted a single morning-glance dashboard for the habits I actually care about — training, sleep, water, and deliberate practice — without giving my data to a fitness company. I also wanted it to feel like a native app on my phone: installable to the Home Screen, offline-capable, and able to nudge me with real notifications.

Streaks were deliberately left out. They gamify missing a day into "losing everything", which is motivating until the day you break one — then the app becomes a source of guilt. Tempo uses **rolling 7-day frequency** and rich benefits/drawbacks context instead, so a missed day is just information.

## Features

| Zone | What it does |
|---|---|
| **Today** | Greeting, motivation line picked from your actual state, status chips, illustrated quick-nav, weekly summary, milestone celebrations |
| **Train** | Weekly program (from my own workout PDF), live gym timer, per-exercise sets/reps/weight logging with last-weight prefill, stats (avg duration, weekly frequency, ~kcal), 14-day chart, history |
| **Sleep** | Tap-to-sleep timer ("going to bed" → "I woke up", rounded to the nearest 10 min), manual hours + perceived-rest logging, instant full verdict card per entry (pros/cons of that duration), research-graded reference bands, sleep tips |
| **Fuel** | Water in ml/oz (quick-add chips + custom amounts, adjustable daily target, progress ring, 14-day chart) **and running** (minutes, optional distance, presets, run history, 14-day chart) — with benefits/drawbacks lists for both |
| **Mind** | Meditation / reading / chess check-ins with minutes, style/type, per-category reading benefits, chess gap warnings that escalate to a "drawbacks getting severe" alert |

Cross-cutting:

- **Motivation engine** — encouraging copy chosen from the user's real state, plus one-time milestone celebrations (frequency-based, never streaks)
- **Reminder engine** — in-app banners checked every 30 s against user-set times for gym, meditation, reading, chess, hydration and sleep-logging; escalates chess gaps
- **Unit switching** — metric (ml · km) or imperial (oz · mi) in Settings; distances are normalised to km internally and converted at the display layer
- **Web push** — service worker + Push API; notifications fire while the app is open everywhere, and as true push once installed to the Home Screen (iOS 16.4+)
- **PWA** — installable, offline shell cache, custom icon set, deep-linkable tabs (`#train`, `#sleep`…)

## Changelog

### v2 — Fuel, running & smarter logging
- **Hydrate tab renamed to Fuel** and now covers water *and* running.
- **Water is tracked in ml/oz directly** — the "glass" metaphor is gone. Quick-add chips (+250 / +500 / +750), custom amounts, and a daily target in ml (default 2 400). Old glass-based data is converted automatically on first load.
- **Running log** — minutes (with 15/30/45/60 presets), optional distance, note; totals for runs, time and distance; 14-day minutes chart; deleteable history. Run frequency milestones (3+/6+ runs per 7 days) join the motivation engine.
- **Total gym time** — Train stats now include the all-time sum of every logged session (Xh Ym).
- **Tap-to-sleep** — tap "I'm going to sleep" when you get in bed and "I woke up" in the morning; the night is logged rounded to the nearest 10 minutes (±10 min accuracy shown in the entry). Survives app restarts overnight via a separate localStorage key. Manual entry is still there.
- **Metric / imperial switch** in Settings (ml·km vs oz·mi), applied app-wide.
- Service-worker cache bumped to `tempo-v2` so installed phones pick up the new build.

### v1 — Initial release
- Five zones (Today, Train, Sleep, Hydrate, Mind), motivation engine, reminder engine, web push, PWA install.

## Tech stack

- **React 18 + TypeScript** — UI, strictly typed state
- **Vite 7** — dev server and production build (tree-shaking, hashed assets)
- **Tailwind CSS 3 + shadcn/ui** — utility styling on top of a HSL design-token theme (`src/index.css`), Radix primitives under the hood
- **Web Notifications + Service Worker** (`public/sw.js`) — reminder delivery
- **localStorage** — the entire "database"; versioned key with a reducer pattern
- **Lucide** — icons

## Architecture

```
src/
├── App.tsx            # Shell: tabs, header, reminder engine, settings sheet
├── types.ts           # All domain types (GymSession, SleepLog, WaterLog, …)
├── lib/
│   ├── store.tsx      # useReducer + Context store, localStorage persistence, date utils, notify()
│   └── data.ts        # Workout plan, benefits/cons copy, band tables, gap warnings, motivation lines
├── components/
│   ├── bits.tsx       # Card, Pill, Stat, MiniBars, Ring, HeroBanner, ProCon …
│   └── ui/            # shadcn/ui primitives
└── screens/
    ├── Today.tsx      # Dashboard + motivation engine
    ├── Train.tsx      # Timer + exercise logging + stats
    ├── Sleep.tsx      # Tap-to-sleep timer + manual logging + verdicts
    ├── Fuel.tsx       # Water in ml/oz + running log
    └── Mind.tsx       # Meditation / reading / chess
```

Design decisions worth noting:

- **Reducer + Context** instead of scattered `useState` — every mutation is an explicit, typed action (`addGym`, `addWater`, `setReminder`…), which makes persistence and migration trivial.
- **Versioned storage key** (`tempo-state-v1`) with defaults deep-merged over parsed state, so new settings fields never break old saves.
- **Benefits content as data**, not markup — every pro/con list lives in `data.ts` and renders through one `ProCon` component, so screens stay layout-only.
- **Calories are honest estimates** — MET-based approximation (`5.5 METs × body weight × hours`), labelled as such in the UI.
- **Frequency over streaks** — `countInLastDays()` powers stats, celebrations and gap warnings.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site → dist/
npm run preview  # serve the production build
```

Then on an iPhone: open the URL in Safari → Share → **Add to Home Screen**. It launches full-screen with its own icon and can receive web push.

## How I built it (process)

I scoped it as a mobile-first PWA from day one and iterated screen by screen. Roughly:

1. **Extracted the workout plan** from my training PDF into typed data (`WEEKLY_PLAN`), normalising sets/reps so the logger can prefill them.
2. **Built the state layer first** — types, reducer, persistence — before any UI, so every screen just dispatches actions.
3. **Designed the theme as tokens** — HSL CSS variables feeding Tailwind, so the whole palette (cream background, coral/amber/cobalt accents) swaps in one place.
4. **Implemented each zone** (Train → Sleep → Hydrate → Mind), keeping screens layout-only and content in `data.ts`.
5. **Added the motivation engine** — state-aware encouragement and one-time milestone celebrations.
6. **Wired notifications** — service worker, Notification permission flow, per-habit reminder times, escalation rules for chess gaps.
7. **Verified like a user** — production build, headless-browser screenshots of every tab at iPhone viewport, then published.

I used **Kimi (AI assistant)** as a pair-programmer throughout — scaffolding boilerplate, drafting benefits copy from research summaries, generating the flat-illustration hero artwork, and double-checking edge cases — while I drove the architecture, data model, design system and product decisions. It roughly halved the time from idea to a published, installable app.

## Deployment

Static `dist/` bundle published via Kimix:

```bash
cd dist && zip -r ../bundle.zip .   # index.html at zip root
kimix website validate static ../bundle.zip
kimix website create static ../bundle.zip --app-name "Tempo — Body & Mind" --wait
```

Live at **https://de3rngsqpkhee.kimi.page** — or serve `dist/` from any static host (GitHub Pages, Netlify, Vercel…).

## License

MIT — see [LICENSE](LICENSE).
