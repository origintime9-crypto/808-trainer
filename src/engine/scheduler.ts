import { createEmptyCard, fsrs, Rating, State, type Card as FsrsCard, type Grade as FsrsGrade } from 'ts-fsrs';
import type { AttemptEvent, Grade, TrainerEvent } from '../types';
import { cardById, kpById, kpPapers, problemById, realPaperCount } from '../content';
import { examEmphasis } from '../content/target808';

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
function scheduler(maximum_interval: number, enable_short_term: boolean, request_retention = 0.9) {
  const key = maximum_interval + '-' + enable_short_term + '-' + request_retention;
  let f = cache.get(key);
  if (!f) {
    f = fsrs({ request_retention, enable_fuzz: false, enable_short_term, maximum_interval });
    cache.set(key, f);
  }
  return f;
}

/** 重点及中北真题高频考点要求更高的记忆保持率，因而更早到期。 */
export function targetRetention(kps: string[]): number {
  if (!kps.length) return 0.9;
  const demand = kps.map(id => {
    const point = kpById.get(id);
    if (!point) return 0.9;
    const frequency = Math.min(1, (kpPapers.get(id)?.size ?? 0) / Math.max(1, realPaperCount));
    return Math.min(0.95, 0.86 + 0.06 * point.stars / 5 + 0.02 * frequency + 0.01 * (examEmphasis(id) - 1));
  });
  return Math.round(Math.max(...demand) * 1000) / 1000;
}

/** FSRS 的单题记忆估计；知识点模型再对不同题目加权。 */
export function retrievability(card: FsrsCard, now: number): number {
  if (!card.last_review || card.state === State.New) return 1;
  const estimate = scheduler(21, false).get_retrievability(card, new Date(Math.max(now, card.last_review.getTime())), false);
  return Math.max(0, Math.min(1, Number.isFinite(estimate) ? estimate : 0));
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

  // 日内重评分保留全部历史，但只以该题当天最后一次成绩更新记忆。
  const lastDailyAttempt = new Map<string, string>();
  for (const e of sorted) if (e.kind === 'attempt') lastDailyAttempt.set(e.problemId + ':' + startOfToday(e.t), e.id);

  for (const e of sorted) {
    const cap = maxInterval(examDate, e.t);
    if (e.kind === 'review') {
      const f = scheduler(cap, true, targetRetention(cardById.get(e.cardId)?.kps ?? []));
      const prev = cards.get(e.cardId);
      const base = prev?.card ?? createEmptyCard<FsrsCard>(new Date(e.t));
      const next = clampDue(f.next(base, new Date(e.t), e.rating as FsrsGrade).card, e.t, cap, examDate);
      cards.set(e.cardId, { card: next, reviews: (prev?.reviews ?? 0) + 1, lastRating: e.rating });
    } else if (e.kind === 'attempt') {
      const f = scheduler(cap, false, targetRetention(problemById.get(e.problemId)?.kps ?? []));
      const prev = problems.get(e.problemId);
      const base = prev?.card ?? createEmptyCard<FsrsCard>(new Date(e.t));
      // 不会、部分对的题第二天必须重做
      const finalDaily = lastDailyAttempt.get(e.problemId + ':' + startOfToday(e.t)) === e.id;
      // 回放状态只属于本次调用，可原地累积，避免长历史反复复制；不修改原始事件。
      const attempts = prev?.attempts ?? [];
      attempts.push(e);
      const wasInMistakes = prev?.inMistakes ?? false;
      const streak = e.grade === 3 ? (prev?.streak ?? 0) + (finalDaily ? 1 : 0) : 0;
      let inMistakes = wasInMistakes;
      if (e.grade < 3) inMistakes = true;
      else if (wasInMistakes && streak >= 2) inMistakes = false;
      // 首次纠正还需隔日确认；不能用Easy长间隔把未过关错题推迟数天。
      const retryDays = e.grade <= 1 || (e.grade === 3 && inMistakes) ? 1 : cap;
      const next = finalDaily ? clampDue(f.next(base, new Date(e.t), GRADE_TO_RATING[e.grade]).card, e.t, retryDays, examDate) : base;
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
