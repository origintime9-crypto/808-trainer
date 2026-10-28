import type { AttemptEvent, TrainerEvent } from '../types';
import { startOfToday } from './scheduler';
import { learningEvents } from './history';

export const isIndependent = (e: AttemptEvent): boolean => e.workMode === 'independent' && e.hintsUsed === false;
export const isFullCredit=(e:AttemptEvent):boolean=>e.grade===3&&(!e.score||e.score.earned===e.score.max);

/** 先取每题每日首次作答，再筛辅助条件；看过解析后当日重做不能升级成独立证据。 */
export function dailyEvidence(events: TrainerEvent[], now: number): AttemptEvent[] {
  const first = new Map<string, AttemptEvent>();
  for (const e of learningEvents(events.filter(e=>e.t<=now))) {
    if (e.kind !== 'attempt' || e.t > now) continue;
    const key = e.problemId + ':' + startOfToday(e.t);
    if (!first.has(key)) first.set(key, e);
  }
  return [...first.values()].filter(e => e.workMode === undefined || isIndependent(e));
}

export function latestEvidence(events: TrainerEvent[], now: number): AttemptEvent[] {
  const latest = new Map<string, AttemptEvent>();
  for (const e of dailyEvidence(events, now)) latest.set(e.problemId, e);
  return [...latest.values()];
}
