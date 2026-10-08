import { problemById } from '../content';
import { compareDemand, reference808 } from '../content/difficulty808';
import { fits808, TARGET_808_PAPER, target808Total, target808Units } from '../content/target808';
import type { AttemptEvent, TrainerEvent } from '../types';
import { startOfToday } from './scheduler';

/**
 * 用最近练习日的首次评分验证题位；同日看答案后的改分不能冒充新的难度证据。
 * 单题只匹配一个原卷题位。缺少作答辅助标记，不能称为独立闭卷或校准分数。
 */
export function referenceEvidence808(events: TrainerEvent[], now: number) {
  const samples = new Map<string, AttemptEvent>();
  for (const e of [...events].sort((a,b) => a.t-b.t || a.id.localeCompare(b.id))) {
    if (e.kind !== 'attempt' || e.t > now || !fits808(e.problemId)) continue;
    const old = samples.get(e.problemId);
    if (!old || startOfToday(e.t) > startOfToday(old.t)) samples.set(e.problemId,e);
  }
  const rows = [...samples.values()];
  const candidates = target808Units.map(anchor => rows.filter(e => {
    const p=problemById.get(e.problemId)!;
    return compareDemand(anchor,p).comparable;
  }).sort((a,b) => Number(b.problemId === anchor.id)-Number(a.problemId === anchor.id) ||
    compareDemand(anchor,problemById.get(b.problemId)!).closeness-compareDemand(anchor,problemById.get(a.problemId)!).closeness ||
    a.problemId.localeCompare(b.problemId)));
  const assigned = new Map<string,number>(), picks = new Map<number,AttemptEvent>();
  // 已做过实际原卷题时，证据归属自己的题位，不被同方法的邻近题位借走。
  for (const [slot,anchor] of target808Units.entries()) {
    const event=samples.get(anchor.id);
    if (event) { assigned.set(event.problemId,slot);picks.set(slot,event); }
  }
  const assign = (slot:number,visited:Set<string>):boolean => {
    for (const event of candidates[slot]) {
      if (visited.has(event.problemId)) continue;
      visited.add(event.problemId);
      const old=assigned.get(event.problemId);
      if (old !== undefined && target808Units[old].id === event.problemId) continue;
      if (old === undefined || assign(old,visited)) {
        assigned.set(event.problemId,slot);picks.set(slot,event);return true;
      }
    }
    return false;
  };
  for (const slot of target808Units.map((_,i)=>i).sort((a,b)=>candidates[a].length-candidates[b].length))
    if (!picks.has(slot)) assign(slot,new Set());
  const slots = target808Units.map((anchor,i) => {
    const attempt=picks.get(i);
    const score=anchor.sources.find(s=>s.paper===TARGET_808_PAPER)!.score!;
    // 页面计时可能受中途离开影响，作为参考用时记录，不用于拟合能力参数。
    const timed = !!attempt && attempt.sec >= 15 && attempt.sec <= score*1.2*60;
    return { referenceId:anchor.id, no:anchor.sources.find(s=>s.paper===TARGET_808_PAPER)!.no,
      score, attempt, measured:!!attempt, full:attempt?.grade===3, timedFull:attempt?.grade===3 && timed };
  });
  const coveredPoints=slots.filter(s=>s.measured).reduce((n,s)=>n+s.score,0);
  return { slots, total:slots.length, measured:slots.filter(s=>s.measured).length,
    full:slots.filter(s=>s.full).length, timedFull:slots.filter(s=>s.timedFull).length,
    coverage:coveredPoints/target808Total,
    foundation:rows.filter(e=>reference808(e.problemId).category==='foundation').length,
    stretch:rows.filter(e=>reference808(e.problemId).category==='stretch').length,
    latestDayFirstScores:rows.length };
}
