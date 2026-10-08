import { cardById, cards, kpById, kpPapers, paperById, problemById, problems } from '../content';
import { examEmphasis, fits808 } from '../content/target808';
import type { Settings, TrainerEvent } from '../types';
import { priority, problemPriority, type MasteryIndex } from './mastery';
import { DAY, endOfToday, isNewCard, startOfToday, type Schedule } from './scheduler';

const LEARN_AHEAD_MS = 20 * 60 * 1000;

export interface ReviewQueue {
  due: string[];
  fresh: string[];
  newToday: number;
}

/** 卡片复习队列：到期卡（含 20 分钟内的学习步）优先，然后是今日剩余额度的新卡 */
export function cardQueue(sched: Schedule, events: TrainerEvent[], settings: Settings, mi: MasteryIndex, now: number): ReviewQueue {
  const kpScore = (ids: string[]) => Math.max(0, ...ids.map(id => {
    const k = kpById.get(id), m = mi.kp(id);
    return k && k.chapter <= 7 ? priority(k.stars, m.m, kpPapers.get(id)?.size ?? 0, m, examEmphasis(id)).value : 0;
  }));
  const due = cards
    .filter((c) => {
      const st = sched.cards.get(c.id);
      return st && !isNewCard(st) && st.card.due.getTime() <= now + LEARN_AHEAD_MS;
    })
    .sort((a, b) => {
      const urgency = (id: string, kps: string[]) => kpScore(kps) + Math.log1p(Math.max(0, now - sched.cards.get(id)!.card.due.getTime()) / DAY);
      return urgency(b.id, b.kps) - urgency(a.id, a.kps) || sched.cards.get(a.id)!.card.due.getTime() - sched.cards.get(b.id)!.card.due.getTime();
    })
    .map((c) => c.id);

  const today = startOfToday(now);
  const firstSeen = new Map<string, number>();
  for (const e of events) if (e.kind === 'review' && e.t <= now && cardById.has(e.cardId)) firstSeen.set(e.cardId, Math.min(firstSeen.get(e.cardId) ?? Infinity, e.t));
  const newToday = [...firstSeen.values()].filter((t) => t >= today).length;
  const quota = Math.max(0, settings.newCardsPerDay - newToday);

  const fresh = cards
    .filter((c) => isNewCard(sched.cards.get(c.id)) && c.kps.some(k => (kpById.get(k)?.chapter ?? 8) <= 7))
    .map((c, i) => ({ id: c.id, i, score: kpScore(c.kps) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, quota)
    .map((x) => x.id);

  return { due, fresh, newToday };
}

/** 过关题也按记忆曲线复习；错题和重要考点优先，但不超前拉取未到期题。 */
export function duePractice(sched: Schedule, mi: MasteryIndex, now: number): string[] {
  return [...sched.problems.entries()]
    .filter(([id, state]) => fits808(id) && state.card.due.getTime() <= endOfToday(now))
    .map(([id, state]) => ({ id, due: state.card.due.getTime(),
      score: problemPriority(id, mi) + (state.inMistakes ? 0.3 : 0) + Math.log1p(Math.max(0, now - state.card.due.getTime()) / DAY) }))
    .sort((a, b) => b.score - a.score || a.due - b.due || a.id.localeCompare(b.id))
    .map(row => row.id);
}

export function dueMistakes(sched: Schedule, now: number): string[] {
  const end = endOfToday(now);
  return [...sched.problems.entries()]
    .filter(([, st]) => st.inMistakes && st.card.due.getTime() <= end)
    .sort((a, b) => a[1].card.due.getTime() - b[1].card.due.getTime())
    .map(([id]) => id);
}

/** 推荐新题：按808重点补弱，题型和考点用软惩罚保持多样性，预留待测点探索。 */
export function recommendNew(sched: Schedule, events: TrainerEvent[], settings: Settings, mi: MasteryIndex, now: number): string[] {
  const today = startOfToday(now);
  const doneToday = new Set<string>();
  const firstAttempt = new Map<string, number>();
  for (const e of events) if (e.kind === 'attempt' && e.t <= now && fits808(e.problemId)) firstAttempt.set(e.problemId, Math.min(firstAttempt.get(e.problemId) ?? Infinity, e.t));
  for (const [id, t] of firstAttempt) if (t >= today) doneToday.add(id);
  const quota = Math.max(0, settings.newProblemsPerDay - doneToday.size);

  const candidates = problems
    .filter((p) => !sched.problems.has(p.id) && fits808(p.id))
    .map((p) => ({
      p,
      score: problemPriority(p.id, mi) * (p.sources.some((s) => paperById.get(s.paper)?.kind === '真题') ? 1.2 : 1),
    }))
    .sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  const usedPatterns = new Map<string, number>(), usedKps = new Map<string, number>();
  const available = [...candidates];
  const diagnosticSlots = Math.min(Math.floor(quota / 5), available.filter(({p}) => p.kps.some(k => mi.kp(k).attempts === 0)).length);
  const pick = (diagnostic: boolean) => {
    const choices = available.filter(({p}) => !diagnostic || p.kps.some(k => mi.kp(k).attempts === 0 && !usedKps.has(k)));
    if (!choices.length) return false;
    const value = ({p, score}: (typeof choices)[number]) => {
      const weak = p.kps.some(k => mi.kp(k).m < 0.55 && mi.kp(k).attempts > 0);
      const patternPenalty = p.pattern ? (usedPatterns.get(p.pattern) ?? 0) * (weak ? 0.2 : 0.85) : 0;
      const coveragePenalty = Math.max(0, ...p.kps.map(k => usedKps.get(k) ?? 0)) * (weak ? 0.12 : 0.35);
      return score / (1 + patternPenalty + coveragePenalty);
    };
    choices.sort((a, b) => value(b) - value(a) || a.p.id.localeCompare(b.p.id));
    const winner = choices[0];
    picked.push(winner.p.id);
    available.splice(available.indexOf(winner), 1);
    if (winner.p.pattern) usedPatterns.set(winner.p.pattern, (usedPatterns.get(winner.p.pattern) ?? 0) + 1);
    for (const k of winner.p.kps) usedKps.set(k, (usedKps.get(k) ?? 0) + 1);
    return true;
  }
  for (let i = 0; i < diagnosticSlots; i++) if (!pick(true)) break;
  while (picked.length < quota && pick(false)) { /* 同一道题只取一次 */ }
  return picked;
}

export function suggestedMinutes(problemId: string): number {
  const p = problemById.get(problemId);
  if (p?.minutes) return p.minutes;
  const score = p?.sources.find((s) => s.score)?.score ?? 5;
  return Math.max(2, Math.round(score * 1.2));
}
