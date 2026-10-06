import { cards, paperById, problemById, problems } from '../content';
import type { Settings, TrainerEvent } from '../types';
import { problemPriority, type MasteryIndex } from './mastery';
import { endOfToday, isNewCard, startOfToday, type Schedule } from './scheduler';

const LEARN_AHEAD_MS = 20 * 60 * 1000;

export interface ReviewQueue {
  due: string[];
  fresh: string[];
  newToday: number;
}

/** 卡片复习队列：到期卡（含 20 分钟内的学习步）优先，然后是今日剩余额度的新卡 */
export function cardQueue(sched: Schedule, events: TrainerEvent[], settings: Settings, mi: MasteryIndex, now: number): ReviewQueue {
  const due = cards
    .filter((c) => {
      const st = sched.cards.get(c.id);
      return st && !isNewCard(st) && st.card.due.getTime() <= now + LEARN_AHEAD_MS;
    })
    .sort((a, b) => sched.cards.get(a.id)!.card.due.getTime() - sched.cards.get(b.id)!.card.due.getTime())
    .map((c) => c.id);

  const today = startOfToday(now);
  const firstSeen = new Map<string, number>();
  for (const e of events) if (e.kind === 'review' && !firstSeen.has(e.cardId)) firstSeen.set(e.cardId, e.t);
  const newToday = [...firstSeen.values()].filter((t) => t >= today).length;
  const quota = Math.max(0, settings.newCardsPerDay - newToday);

  const kpScore = (ids: string[]) => Math.max(0, ...ids.map((id) => 1 - mi.kp(id).m));
  const fresh = cards
    .filter((c) => isNewCard(sched.cards.get(c.id)))
    .map((c, i) => ({ id: c.id, i, score: kpScore(c.kps) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, quota)
    .map((x) => x.id);

  return { due, fresh, newToday };
}

export function dueMistakes(sched: Schedule, now: number): string[] {
  const end = endOfToday(now);
  return [...sched.problems.entries()]
    .filter(([, st]) => st.inMistakes && st.card.due.getTime() <= end)
    .sort((a, b) => a[1].card.due.getTime() - b[1].card.due.getTime())
    .map(([id]) => id);
}

/** 推荐新题：未做过的题按优先级排序，真题优先，同一题型不重复 */
export function recommendNew(sched: Schedule, events: TrainerEvent[], settings: Settings, mi: MasteryIndex, now: number): string[] {
  const today = startOfToday(now);
  const doneToday = new Set<string>();
  const firstAttempt = new Map<string, number>();
  for (const e of events) if (e.kind === 'attempt' && !firstAttempt.has(e.problemId)) firstAttempt.set(e.problemId, e.t);
  for (const [id, t] of firstAttempt) if (t >= today) doneToday.add(id);
  const quota = Math.max(0, settings.newProblemsPerDay - doneToday.size);

  const candidates = problems
    .filter((p) => !sched.problems.has(p.id))
    .map((p) => ({
      p,
      score: problemPriority(p.id, mi) * (p.sources.some((s) => paperById.get(s.paper)?.kind === '真题') ? 1.2 : 1),
    }))
    .sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  const usedPatterns = new Set<string>();
  for (const { p } of candidates) {
    if (picked.length >= quota) break;
    if (p.pattern && usedPatterns.has(p.pattern)) continue;
    picked.push(p.id);
    if (p.pattern) usedPatterns.add(p.pattern);
  }
  return picked;
}

export function suggestedMinutes(problemId: string): number {
  const p = problemById.get(problemId);
  const score = p?.sources.find((s) => s.score)?.score ?? 5;
  return Math.max(2, Math.round(score * 1.2));
}
