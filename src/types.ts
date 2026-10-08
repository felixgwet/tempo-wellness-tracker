export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ExercisePlan {
  name: string;
  sets: string; // "4 × 8" or "3 × AMRAP"
  targets: string;
}

/** What was actually logged for one exercise in a session */
export interface LoggedExercise {
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
}

export interface GymSession {
  id: string;
  dateISO: string; // YYYY-MM-DD
  startISO: string; // full ISO
  endISO: string;
  minutes: number;
  calories: number;
  timeOfDay: TimeOfDay;
  exercises: LoggedExercise[];
  note?: string;
}

export interface SleepLog {
  id: string;
  dateISO: string; // day woken up
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface WaterLog {
  id: string;
  dateISO: string;
  ml: number;
}

export interface RunLog {
  id: string;
  dateISO: string;
  minutes: number;
  distanceKm?: number;
  note?: string;
}

export interface MeditationLog {
  id: string;
  dateISO: string;
  minutes: number;
  kind: string; // breath / guided / mindfulness / other
}

export interface ReadingLog {
  id: string;
  dateISO: string;
  minutes: number;
  book: string;
  category: string; // fiction / non-fiction / self-development / biography / other
}

export interface ChessLog {
  id: string;
  dateISO: string;
  minutes: number;
  kind: string; // games / puzzles / study
  games?: number;
}

export interface Settings {
  weightKg: number;
  units: 'metric' | 'imperial';
  waterTarget: number; // ml per day
  notifications: boolean;
  notifAsked: boolean;
  reminders: {
    gym: string; // "HH:MM"
    meditate: string;
    read: string;
    chess: string;
    water: string;
    sleep: string;
  };
}

export interface State {
  settings: Settings;
  gymSessions: GymSession[];
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  runLogs: RunLog[];
  meditationLogs: MeditationLog[];
  readingLogs: ReadingLog[];
  chessLogs: ChessLog[];
  dismissedAlerts: Record<string, string>; // key -> dateISO dismissed
  seenCongrats: string[]; // congrats keys already celebrated
}
