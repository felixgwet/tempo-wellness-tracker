import type { ExercisePlan, TimeOfDay } from '../types';

// ─── Workout plan — extracted from Weekly_Workout_Plan_Mens_Edition.pdf ───
// index 0 = Sunday … 6 = Saturday (JS getDay)
export const WEEKLY_PLAN: { day: string; rest: boolean; exercises: ExercisePlan[]; tip?: string }[] = [
  { day: 'Sunday', rest: true, exercises: [] },
  {
    day: 'Monday',
    rest: false,
    exercises: [
      { name: 'Squat', sets: '4 × 8', targets: 'Quads · Glutes · Hamstrings · Core' },
      { name: 'Bench Press', sets: '4 × 8', targets: 'Chest · Front Delts · Triceps' },
      { name: 'Dumbbell Row', sets: '3 × 12', targets: 'Lats · Rhomboids · Traps · Biceps' },
      { name: 'Cable Lateral Raise', sets: '4 × 15', targets: 'Side Delts' },
      { name: 'Face Pull', sets: '4 × 15', targets: 'Rear Delts · Traps · Rhomboids' },
      { name: 'Triceps Pushdown', sets: '3 × 15', targets: 'Triceps' },
      { name: 'Barbell Curl', sets: '4 × 10', targets: 'Biceps · Forearms' },
      { name: 'Calf Raises', sets: '4 × 20', targets: 'Calves' },
    ],
  },
  {
    day: 'Tuesday',
    rest: false,
    exercises: [
      { name: 'Pull Up (or Lat Pulldown)', sets: '4 × 5 / 4 × 12', targets: 'Lats · Rhomboids · Biceps' },
      { name: 'Dumbbell Overhead Press', sets: '3 × 12', targets: 'Shoulders · Triceps · Traps' },
      { name: 'Overhead Triceps Extension', sets: '4 × 12', targets: 'Triceps' },
      { name: 'Hammer Curl', sets: '4 × 10', targets: 'Brachialis · Biceps · Forearms' },
      { name: 'Machine Reverse Fly', sets: '4 × 15', targets: 'Rear Delts · Traps' },
      { name: 'Lateral Raise', sets: '4 × 10', targets: 'Side Delts' },
      { name: 'Barbell / Trap Bar Shrug', sets: '4 × 10', targets: 'Traps' },
      { name: 'Hollow Body Hold', sets: '3 × 60 sec', targets: 'Core · Hip Flexors' },
    ],
  },
  { day: 'Wednesday', rest: true, exercises: [] },
  {
    day: 'Thursday',
    rest: false,
    exercises: [
      { name: 'Goblet Squat', sets: '4 × 12', targets: 'Quads · Glutes · Adductors · Core' },
      { name: 'Overhead Press', sets: '3 × 8', targets: 'Shoulders · Triceps · Traps' },
      { name: 'Chin Up', sets: '3 × AMRAP', targets: 'Lats · Biceps' },
      { name: 'Incline Dumbbell Bench', sets: '3 × 12', targets: 'Upper Chest · Front Delts · Triceps' },
      { name: 'Dumbbell Curl', sets: '4 × 15', targets: 'Biceps · Forearms' },
      { name: 'Wrist Curl', sets: '2 × 12', targets: 'Forearm Flexors' },
      { name: 'Farmer Walk', sets: '4 × 30 sec', targets: 'Traps · Grip · Core · Glutes' },
    ],
    tip: 'Keep rest periods tight: 60–90s between isolation sets, up to 3 min on heavy compounds. Control the lowering phase — ~2 seconds down on every rep.',
  },
  {
    day: 'Friday',
    rest: false,
    exercises: [
      { name: 'Barbell Row', sets: '4 × 8', targets: 'Lats · Rhomboids · Traps · Biceps' },
      { name: 'Close Grip Bench Press', sets: '3 × 12', targets: 'Triceps · Inner Chest' },
      { name: 'Lateral Raise', sets: '4 × 12', targets: 'Side Delts' },
      { name: 'Cable Reverse Fly', sets: '4 × 15', targets: 'Rear Delts' },
      { name: 'Dumbbell Curl', sets: '3 × 10', targets: 'Biceps · Forearms' },
      { name: 'Dumbbell Shrug', sets: '4 × 15', targets: 'Traps' },
      { name: 'Hanging Knee Raise', sets: '3 × AMRAP', targets: 'Core · Hip Flexors · Grip' },
    ],
    tip: 'Keep rest periods tight: 60–90s between isolation sets, up to 3 min on heavy compounds. Control the lowering phase — ~2 seconds down on every rep.',
  },
  {
    day: 'Saturday',
    rest: false,
    exercises: [
      { name: 'Squat', sets: '4 × 8', targets: 'Quads · Glutes · Hamstrings · Core' },
      { name: 'Calf Raises', sets: '4 × 20', targets: 'Calves' },
      { name: 'Push Ups', sets: '3 × 20', targets: 'Chest · Front Delts · Triceps · Core' },
      { name: 'Triceps Pushdown', sets: '3 × 15', targets: 'Triceps' },
      { name: 'Calf Raises (burnout)', sets: '2 × AMRAP', targets: 'Calves' },
      { name: 'Squat (finisher)', sets: '1 × AMRAP', targets: 'Quads · Glutes · Hamstrings · Core' },
    ],
  },
];

// ─── Gym: benefits of showing up & costs of skipping ───
export const GYM_BENEFITS = [
  'Strength training 2–3×/week is linked to 20–30% lower all-cause mortality in large cohort studies',
  'Every session spikes endorphins and dopamine — the post-gym mood lift is real, measurable chemistry',
  'Resistance training is one of the strongest known interventions for bone density and longevity',
  'Muscle is metabolic armor: more lean mass means better insulin sensitivity and easier body-composition control',
  'Regular training deepens slow-wave sleep — you fall asleep faster and recover harder',
  'Progressive overload rewires self-image: you become someone who keeps promises to yourself',
  'Consistent lifters report lower anxiety and higher self-rated energy within 4–6 weeks of starting',
];

export const GYM_SKIP_COSTS = [
  'Missing a planned session rarely stays at one — each skip roughly doubles the odds of skipping the next (habit-loop research)',
  'Detraining begins fast: measurable strength loss appears after ~2–3 weeks off, cardio even sooner',
  'Muscle protein synthesis from your last workout returns to baseline within ~48h — the stimulus must be repeated',
  'The mood and sleep benefits above fade within days to weeks of stopping',
  'Skips cost more than the session: they quietly erode the identity of "someone who trains"',
];

// ─── Sleep ───
export interface SleepBand {
  max: number; // upper bound (exclusive), Infinity for last
  label: string;
  tone: 'bad' | 'warn' | 'good' | 'info';
  headline: string;
  pros: string[];
  cons: string[];
}

export const SLEEP_BANDS: SleepBand[] = [
  {
    max: 6,
    label: 'Under 6h',
    tone: 'bad',
    headline: 'Critical sleep debt',
    pros: ['More awake hours — but at a steep price'],
    cons: [
      'Two weeks of 6h nights impairs you as much as two nights with zero sleep — and you barely notice it happening (Van Dongen et al., 2003)',
      'Attention lapses, slower reactions, poor memory consolidation',
      'Elevated cortisol and hunger hormones — cravings and fat gain risk',
      'Linked to higher risk of obesity, diabetes, heart disease and depression (AASM/NSF consensus)',
      'Weakened immune system — you get sick more often',
      'Testosterone and growth hormone release drops sharply — directly stealing your gym recovery',
      'Emotional volatility rises: one bad night makes amygdala reactivity spike ~60%',
      'Appetite regulation breaks down — short sleepers eat ~300+ extra calories per day on average',
    ],
  },
  {
    max: 7,
    label: '6 – 7h',
    tone: 'warn',
    headline: 'Below the recommended floor',
    pros: ['You can function — workouts are still possible', 'Slightly better than the under-6h danger zone'],
    cons: [
      'Below the 7h minimum recommended for adults (AASM / CDC / Sleep Foundation)',
      'Chronic short sleepers consistently underestimate how impaired they are',
      'Recovery between gym sessions is slower — muscle repair happens mostly during sleep',
      'Mood and stress resilience take a quiet hit',
      'Reaction time and judgment drift before you feel tired — like a mild alcohol buzz',
      'Cumulative debt builds: five 6.5h nights ≈ one fully lost night of sleep',
    ],
  },
  {
    max: 9,
    label: '7 – 9h',
    tone: 'good',
    headline: 'The optimal zone',
    pros: [
      'Meets the adult recommendation of 7+ hours — the range tied to the best health outcomes',
      'Best memory consolidation, focus and reaction time',
      'Lowest all-cause mortality in large cohort studies — the risk curve bottoms out around 7h',
      'Muscle recovery, growth hormone release and immune function all peak',
      'Better mood, stress resilience and appetite control',
      'Skin, hair and eyes look visibly fresher — sleep is the cheapest "treatment" there is',
      'Learning sticks: skill practice plus a full night transfers far better to long-term memory',
      'Willpower and decision quality are restored — dieting and discipline both get easier',
    ],
    cons: ['None — this is the target range. Keep it consistent, even on weekends'],
  },
  {
    max: Infinity,
    label: 'Over 9h',
    tone: 'info',
    headline: 'Possibly oversleeping',
    pros: [
      'Fine occasionally — illness, heavy training blocks and catching up on debt are valid reasons',
      'Some people genuinely need 9h+, especially during hard training phases',
    ],
    cons: [
      'Regularly sleeping 9h+ is associated in studies with higher health risks (U-shaped curve)',
      'Can leave you groggier than 7–8h if it disrupts your rhythm',
      'If this keeps happening, it may signal poor sleep quality or an underlying issue',
      'Very long sleep plus low energy is worth mentioning to a doctor',
    ],
  },
];

export const SLEEP_TIPS = [
  'Keep a consistent bedtime and wake time — even on weekends. Rhythm beats duration.',
  'Dark, cool room (around 18°C / 65°F).',
  'No heavy meals or intense screens in the last hour.',
  'Morning light exposure anchors your body clock.',
  'Caffeine after early afternoon steals deep sleep hours later.',
  'Train hard, but finish intense workouts 2–3h before bed when possible.',
  'A short evening wind-down ritual (reading counts!) tells your brain the day is over.',
  'If you can\'t sleep after ~20 minutes, get up, do something calm in dim light, and retry.',
];

// ─── Hydration & running ───
export const ML_PER_OZ = 29.5735;
export const KM_PER_MI = 1.60934;

/** Format a water volume in the user's units. */
export function fmtWater(ml: number, units: 'metric' | 'imperial'): string {
  return units === 'metric' ? `${Math.round(ml)} ml` : `${Math.round(ml / ML_PER_OZ)} oz`;
}

/** Format a distance in the user's units. */
export function fmtDist(km: number, units: 'metric' | 'imperial'): string {
  return units === 'metric' ? `${km.toFixed(1)} km` : `${(km / KM_PER_MI).toFixed(1)} mi`;
}

export const WATER_BENEFITS = [
  'Even mild dehydration (1–2% of body weight) measurably reduces concentration, memory and reaction time — staying topped up keeps your brain online',
  'Proper hydration supports the muscle repair and protein synthesis your training stimulates',
  'Water is the main transport for nutrients and the main channel for flushing metabolic waste',
  'Well-hydrated joints and spinal discs tolerate heavy lifting sessions far better',
  'Energy and mood lift quickly: headache, fatigue and irritability are classic early dehydration signs that water fixes fast',
  'Hydrated skin simply looks better — plumper, clearer, less dull',
  'Thirst is often mistaken for hunger; a glass of water first quietly improves appetite control',
  'Hydration supports stable blood pressure and circulation during workouts',
];

export const WATER_SKIP_COSTS = [
  'A 1–2% fluid deficit impairs cognitive performance and short-term memory without you feeling "thirsty" yet',
  'Strength and power output drop measurably when you train even mildly dehydrated',
  'Dehydration thickens blood and strains the cardiovascular system during exercise',
  'Headaches, afternoon slumps and poor focus are frequently just delayed hydration',
  'Chronic under-drinking raises the risk of kidney stones and urinary-tract irritation',
  'Recovery slows: waste products from training linger longer when fluid intake is low',
];

export const WATER_TIPS = [
  'Front-load the day: 500 ml right after waking restarts your fluid balance after sleep.',
  'Keep a bottle where you train and sip between sets, not just when you feel thirsty.',
  'Urine color is the simplest gauge — pale straw means well hydrated.',
  'Caffeine and alcohol both increase fluid needs; add a glass per coffee or drink.',
  'Hot days and hard sessions each add roughly 500–750 ml to your baseline.',
  'Attach drinking to existing habits: after brushing teeth, before each meal, when you log a workout.',
];

export const WATER_REMINDER_NOTE =
  'Reminder fires daily at the time you set in Settings — hydration slips in the afternoon, so that\'s a good slot.';

// ─── Running ───
export const RUN_BENEFITS = [
  'Running is one of the most efficient cardio engines: ~10 kcal per minute at a steady pace, more than almost any gym session per minute',
  'Zone-2 easy running builds your aerobic base — better stamina for lifting, sports and everyday energy',
  'Regular running lowers resting heart rate and blood pressure within weeks (classic cardiovascular adaptation)',
  'It burns visceral fat specifically — the metabolically dangerous kind around your organs',
  'Runner\'s high is real: steady-state cardio reliably releases endocannabinoids and endorphins',
  'Impact loading from running actually strengthens bone density — a perfect complement to lifting',
  'Just 10 minutes of light running measurably improves mood and focus for hours afterwards',
  'Consistent runners report falling asleep faster and sleeping deeper — cardio debt is a natural sleep aid',
];

export const RUN_SKIP_COSTS = [
  'Aerobic fitness decays fast: measurable VO₂max decline begins within ~10–14 days off',
  'That easy-run stamina you built fades to baseline in about a month of stopping',
  'Skipping cardio leaves lifting as your only stimulus — heart health and recovery pace both lose a gear',
  'The mood-boost and mental-clearance effect of a run disappears with it — often within days',
  'Returning after a long gap feels disproportionately hard: runs that were easy feel like a slog, which discourages the restart',
];

export const RUN_TIPS = [
  'Most of your running should feel easy — if you can\'t hold a conversation, slow down.',
  '2–3 runs a week is plenty alongside lifting; more volume needs rest days between.',
  'Log distance only when you know it — minutes alone are a perfectly good metric.',
  'Five minutes of running beats zero. Short counts.',
  'A loop from your front door removes the "get to a track" excuse entirely.',
];

// ─── Meditation ───
export const MEDITATION_BENEFITS = [
  {
    minDays: 1,
    title: 'Immediate',
    text: 'Even a single session measurably reduces anxiety. Just 15 minutes can shift you to the relaxation level of a vacation day (2020 study, J. of Positive Psychology).',
  },
  {
    minDays: 7,
    title: 'After ~1 week',
    text: 'Brief training (as little as 4 days) improves sustained attention, working memory and visuo-spatial processing, while cutting anxiety and mental fatigue.',
  },
  {
    minDays: 14,
    title: 'After ~2 weeks',
    text: 'Regular short practice starts lowering baseline cortisol. Many practitioners report the first "I noticed my reaction before I had it" moments here — the core skill of emotional regulation.',
  },
  {
    minDays: 30,
    title: 'After ~1 month',
    text: 'An 8-week mindfulness program reduced anxiety by ~30% — comparable to conventional treatment, per a JAMA Psychiatry study; another found mindfulness nearly as effective as the antidepressant escitalopram for anxiety disorders.',
  },
  {
    minDays: 60,
    title: 'After ~2 months',
    text: 'Attention stabilizes: meditators show reduced mind-wandering and better error-awareness. Sleep quality typically improves as the racing-mind pattern weakens.',
  },
  {
    minDays: 90,
    title: 'Long term',
    text: 'Long-term meditators show increased cortical folding (faster information processing) and better-preserved grey matter with age (UCLA, 2012). Consistent practice also lowers inflammation and raises stress resilience.',
  },
];

export const MEDITATION_KINDS = ['Breath awareness', 'Guided', 'Mindfulness / body scan', 'Moving / walking', 'Other'];

// ─── Reading ───
export const READING_CATEGORIES: Record<string, { label: string; benefits: string[] }> = {
  fiction: {
    label: 'Fiction',
    benefits: [
      'Narrative fiction builds empathy and theory of mind — understanding other people\'s inner worlds',
      'Vocabulary and language instincts grow passively',
      'Sustained attention span trains like a muscle',
      'A 2013 study found literary fiction temporarily boosts empathy more than nonfiction or pop fiction',
      'Bedtime fiction replaces screen stimulation and helps you fall asleep faster',
    ],
  },
  nonfiction: {
    label: 'Non-fiction',
    benefits: [
      'Direct knowledge compounding — every session makes you more capable than yesterday',
      'Better conversations, decisions and frameworks for thinking',
      'Reading for as little as ~6 minutes has been shown to reduce stress',
      'Domain knowledge stacks: 20 minutes a day ≈ a dozen serious books a year',
      'You start seeing the world through better models — fewer surprises, better bets',
    ],
  },
  selfdev: {
    label: 'Self-development',
    benefits: [
      'Mindset reinforcement — you absorb the identity you are trying to build',
      'Practical strategies surface right when you need them',
      'Pairs powerfully with meditation and discipline work',
      'Re-reading a great book at a new stage of life yields brand-new insights',
      'Small daily upgrades compound: 1% better per day is ~37× better in a year',
    ],
  },
  biography: {
    label: 'Biography / history',
    benefits: [
      'Pattern-matching from real lives — you inherit decades of others\' experience in hours',
      'Perspective and motivation: your struggles have been survived before',
      'Sharper judgment about people, power and decisions',
      'History repeats: readers of history recognize the loops earlier than everyone else',
    ],
  },
  other: {
    label: 'Other',
    benefits: [
      'Any sustained reading trains focus and deepens knowledge',
      'Screen-free time before bed also protects your sleep',
      'Even 10 focused pages a day is ~12+ books a year',
    ],
  },
};

// ─── Chess ───
export const CHESS_BENEFITS = [
  {
    minDays: 1,
    title: 'Every session',
    text: 'A game of chess engages both hemispheres — logic and analytics on the left, creativity and pattern holistics on the right. One game is a full workout for planning, working memory and concentration.',
  },
  {
    minDays: 7,
    title: 'Consistent week',
    text: 'In one study, 30 minutes of chess a day for 6 months improved children\'s attention span by ~50% — and the gains transferred to schoolwork. Sustained focus is the first thing regular play trains.',
  },
  {
    minDays: 30,
    title: 'Consistent month',
    text: 'University of La Laguna (Spain): students doing 2h of chess per week improved working memory by 22% in one semester (vs 8% for controls). A 2016 study in Intelligence linked 3 months of chess to improved IQ scores.',
  },
  {
    minDays: 90,
    title: 'Long term',
    text: 'Regular chess is linked to stronger problem-solving under pressure, better planning, and long-term brain health — mentally stimulating activities are associated with lower cognitive-decline risk later in life.',
  },
];

export interface ChessGapWarning {
  days: number;
  text: string;
  severe?: boolean;
}

export const CHESS_GAP_WARNINGS: ChessGapWarning[] = [
  { days: 2, text: '2+ days without chess: your tactical pattern recall is starting to fade.' },
  { days: 4, text: '4+ days off: calculation speed and board vision are noticeably duller. A 15-min puzzle set brings it back fast.', severe: true },
  { days: 7, text: 'A week away: openings and patterns get rusty — "use it or lose it" applies hard to chess. Play one game today.', severe: true },
  { days: 10, text: '10+ days without chess: drawbacks getting severe — many players need days of puzzle work just to return to their level. Play now, thank yourself later.', severe: true },
];

export const HABIT_GAP_WARNINGS: Record<string, { days: number; text: string }[]> = {
  meditation: [
    { days: 2, text: '2 days without meditation: stress and reactivity start creeping back. Even 5 minutes resets the day.' },
    { days: 4, text: '4 days off: attention gains begin to decay. Sit for 10 minutes — future you will feel it.' },
  ],
  reading: [
    { days: 2, text: '2 days without reading: the habit is colder than you think. Ten pages keeps the chain alive.' },
    { days: 4, text: '4 days off: momentum is fading. Read before bed tonight — your sleep will thank you too.' },
  ],
};

export const TIME_OF_DAY_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning (5–11)',
  afternoon: 'Afternoon (11–17)',
  evening: 'Evening (17–22)',
  night: 'Night (22–5)',
};

export function timeOfDayFromDate(d: Date): TimeOfDay {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

/** Parse "4 × 8" → {sets:4, reps:8}; handles AMRAP / sec variants. */
export function parseSetsReps(sets: string): { sets?: number; reps?: number } {
  const m = sets.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (m) return { sets: Number(m[1]), reps: Number(m[2]) };
  const s = sets.match(/(\d+)/);
  return s ? { sets: Number(s[1]) } : {};
}

// Vigorous weight training ≈ 5–6 METs. Approximation, clearly labelled as such.
export function estimateCalories(weightKg: number, minutes: number): number {
  const met = 5.5;
  return Math.round(met * weightKg * (minutes / 60));
}

// ─── Motivation engine ───
/** Frequency-based celebrations (no streaks). Rolling 7-day windows & elapsed-time milestones. */
export const CONGRATS_MESSAGES: Record<string, string> = {
  'gym-3week': '3+ workouts in the last 7 days — your consistency is compounding. Muscle is being built one session at a time.',
  'gym-4week': '4+ workouts in 7 days — elite consistency. This is how physiques are made.',
  'sleep-week-good': 'A full week averaging 7–9h of sleep — recovery, hormones and focus are all operating at their peak.',
  'meditate-3': 'Meditation 3+ days this week — anxiety down, attention up. You are literally reshaping your brain.',
  'meditate-6': 'Meditation 6+ days this week — this is a practice, not a phase. JAMA-level results territory.',
  'read-3': 'Reading 3+ days this week — knowledge is compounding. Readers finish the year as different people.',
  'read-6': 'Reading 6+ days this week — a genuine identity-level habit. Keep feeding your mind.',
  'chess-3': 'Chess 3+ days this week — your pattern recognition and calculation are sharpening daily.',
  'chess-6': 'Chess 6+ days this week — working-memory training in disguise. The board is your second gym.',
  'water-week': 'Target hit every day this week — hydration on autopilot. Your brain, joints and recovery all run on that water.',
  'run-3': '3+ runs in the last 7 days — your aerobic base is compounding. Easy miles now, endless energy later.',
  'run-6': '6+ runs in 7 days — engine-building territory. Your heart, lungs and mood are all thanking you.',
};

/** Encouraging lines shown on the Today screen, picked by current state. */
export const MOTIVATION_LINES = {
  allDone: [
    'Everything logged today. That\'s not luck — that\'s who you are now.',
    'Full house today. Rest well, you earned every bit of it.',
    'Training, sleep, mind — all accounted for. Elite day.',
  ],
  mostDone: [
    'Strong day. One small log left — finish the picture.',
    'You\'re close to a perfect day. Close it out.',
    'Most boxes ticked. The last one is the easiest — go.',
  ],
  fresh: [
    'Every master was once a beginner who refused to quit. Start anywhere.',
    'Small steps, logged daily, become unrecognizable results.',
    'Today is a blank page. Write the first line.',
  ],
  gymMissed: [
    'The workout you skip is the one you remember tonight. Go get it.',
    'Your future self is watching this exact moment. Send him a win.',
    'One hour of work for a day of pride. Fair trade.',
  ],
};
