import { kpPapers, problemById } from '../content';
import { fits808, importance808, target808Points, target808Scope, target808Units, TARGET_808_PAPER } from '../content/target808';
import type { TrainerEvent } from '../types';
import { masteryStatus, priority, type MasteryIndex } from './mastery';
import { examEmphasis } from '../content/target808';
import { referenceEvidence808 } from './reference808';

/** 针对中北808的证据画像；未测点不以先验0.5冒充已掌握。 */
export function readiness808(mi: MasteryIndex, events: TrainerEvent[], now: number) {
  const totalWeight = target808Scope.reduce((sum, k) => sum + importance808(k.id), 0);
  const points = target808Scope.map(k => {
    const mastery = mi.kp(k.id), weight = importance808(k.id) / totalWeight;
    const measured = mastery.uniqueProblems > 0, validated = mastery.uniqueProblems >= 3;
    return { ...k, mastery, weight, measured, validated, status: masteryStatus(mastery),
      examPoints: target808Points.get(k.id) ?? 0, years: kpPapers.get(k.id)?.size ?? 0,
      priority: priority(k.stars, mastery.m, kpPapers.get(k.id)?.size ?? 0, mastery, examEmphasis(k.id)).value };
  }).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const coverage = points.filter(k => k.measured).reduce((sum, k) => sum + k.weight, 0);
  const validatedCoverage = points.filter(k => k.validated).reduce((sum, k) => sum + k.weight, 0);
  const measuredMastery = coverage ? points.filter(k => k.measured).reduce((sum, k) => sum + k.weight * k.mastery.m, 0) / coverage : null;
  const reference = referenceEvidence808(events,now);
  const level = coverage < 0.7 || validatedCoverage < 0.4 || reference.coverage < 0.6 ? '仍需补测'
    : measuredMastery !== null && measuredMastery >= 0.75 ? '重点掌握较稳'
      : measuredMastery !== null && measuredMastery >= 0.55 ? '正在巩固' : '重点仍需补强';
  const latest = new Map<string, Extract<TrainerEvent, {kind:'attempt'}>>();
  for (const e of [...events].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id))) {
    if (e.kind === 'attempt' && e.t <= now && fits808(e.problemId)) latest.set(e.problemId, e);
  }
  const types = [...new Set(target808Units.map(p => p.type))].map(type => {
    const units = target808Units.filter(p => p.type === type);
    const attempts = [...latest.values()].filter(e => problemById.get(e.problemId)?.type === type);
    return { type, count: units.length, score: units.reduce((sum, p) => sum + (p.sources.find(s => s.paper === TARGET_808_PAPER)?.score ?? 0), 0),
      practiced: attempts.length, full: attempts.filter(e => e.grade === 3).length };
  });
  return { points, coverage, validatedCoverage, measuredMastery, level, types, reference };
}
