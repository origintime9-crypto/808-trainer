import { createEmptyCard, fsrs, Rating, State, type Card as FsrsCard, type Grade as FsrsGrade } from 'ts-fsrs';
import type { AttemptEvent, Grade, TrainerEvent } from '../types';

export const DAY = 86_400_000;

export function daysUntil(examDate: string, now: number): number {
  const exam = new Date(`${examDate}T09:00:00`).getTime();
  return Math.max(0, Math.ceil((exam - now) / DAY));
}

function maxInterval(examDate: string, now: number): number {
  return Math.max(1, Math.min(21, daysUntil(examDate, now)));
}

const GRADE_TO_RATING: Record<Grade, FsrsGrade> = {
  0: Rating.Again,
  1: Rating.Hard,
  2: Rating.Good,
  3: Rating.Easy,
};

const cache = new Map<string, ReturnType<typeof fsrs>>();
function scheduler(maximum_interval: number, enable_short_term: boolean) {
  const key = `${maximum_interval}-${enable_short_term}`;
  let f = cache.get(key);
  if (!f) {
    f = fsrs({ request_retention: 0.9, enable_fuzz: false, enable_short_term, maximum_interval });
    cache.set(key, f);
  }
  return f;
}

// ts-fsrs 会强制"很熟"的间隔大于"记得"，可能越过 maximum_interval，这里再截断一次
function clampDue(card: FsrsCard, t: number, maxDays: number, examDate: string): FsrsCard {
  const exam = new Date(`${examDate}T09:00:00`).getTime();
  const limit = Math.min(t + maxDays * DAY, Math.max(t, exam));
  return card.due.getTime() > limit ? { ...card, due: new Date(limit), scheduled_days: Math.max(0, (limit - t) / DAY) } : card;
}

export interface CardState {
  card: FsrsCard;
  reviews: number;
  lastRating?: number;
}

export interface ProblemState {
  card: FsrsCard;
  attempts: AttemptEvent[];
  /** 当前是否在错题本中 */
  inMistakes: boolean;
  /** 已过关：做过且不在错题本中（从未出错，或出错后连续两次全对） */
  mastered: boolean;
  streak: number;
}

export interface Schedule {
  cards: Map<string, CardState>;
  problems: Map<string, ProblemState>;
  notes: Map<string, string>;
}

export function replay(events: TrainerEvent[], examDate: string): Schedule {
  const sorted = [...events].sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
  const cards = new Map<string, CardState>();
  const problems = new Map<string, ProblemState>();
  const notes = new Map<string, string>();

  for (const e of sorted) {
    const cap = maxInterval(examDate, e.t);
    if (e.kind === 'review') {
      const f = scheduler(cap, true);
      const prev = cards.get(e.cardId);
      const base = prev?.card ?? createEmptyCard<FsrsCard>(new Date(e.t));
      const next = clampDue(f.next(base, new Date(e.t), e.rating as FsrsGrade).card, e.t, cap, examDate);
      cards.set(e.cardId, { card: next, reviews: (prev?.reviews ?? 0) + 1, lastRating: e.rating });
    } else if (e.kind === 'attempt') {
      const f = scheduler(cap, false);
      const prev = problems.get(e.problemId);
      const base = prev?.card ?? createEmptyCard<FsrsCard>(new Date(e.t));
      // 不会、部分对的题第二天必须重做
      const next = clampDue(f.next(base, new Date(e.t), GRADE_TO_RATING[e.grade]).card, e.t, e.grade <= 1 ? 1 : cap, examDate);
      const attempts = [...(prev?.attempts ?? []), e];
      const wasInMistakes = prev?.inMistakes ?? false;
      const streak = e.grade === 3 ? (prev?.streak ?? 0) + 1 : 0;
      let inMistakes = wasInMistakes;
      if (e.grade < 3) inMistakes = true;
      else if (wasInMistakes && streak >= 2) inMistakes = false;
      problems.set(e.problemId, { card: next, attempts, inMistakes, mastered: !inMistakes, streak });
    } else if (e.kind === 'note') {
      notes.set(e.problemId, e.text);
    }
  }
  return { cards, problems, notes };
}

export function isDue(card: FsrsCard, now: number): boolean {
  return card.due.getTime() <= now;
}

export function isNewCard(state: CardState | undefined): boolean {
  return !state || state.card.state === State.New;
}

/** 距今天的天数（按本地日历日计） */
export function dayDiff(from: number, to: number): number {
  const a = new Date(from);
  const b = new Date(to);
  const da = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const db = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((db - da) / DAY);
}

export function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfToday(now: number): number {
  return startOfToday(now) + DAY - 1;
}
