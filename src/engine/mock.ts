import { paperById, papers, problemById, problems } from '../content';
import { paperProblems, SCORE_COEF } from './paper';
import type { AttemptEvent, ExamAnswer, ExamEvent, ExamItem, ExamSnapshotRow, Problem, TrainerEvent } from '../types';
import { learningEvents } from './history';
import { problemPriority, type MasteryIndex } from './mastery';
import { compareDemand, problemDemand } from '../content/difficulty808';

export type MockPool = 'mixed' | 'selected' | 'local';
export const templatePapers = papers.filter(p => p.kind === '真题' && !p.school && p.totalScore === 150 && paperProblems(p.id).every(q => q.sources.find(s => s.paper === p.id)?.score) && paperProblems(p.id).reduce((v,q)=>v+(q.sources.find(s=>s.paper===p.id)?.score??0),0) === 150);
export const selectedPapers = papers.filter(p => !!p.school);

function workload(p: Problem): number {
  return problemDemand(p).minutes;
}
function family(p: Problem): string {
  const discrete = p.kps.some(k => /^[67]\./.test(k));
  const continuous = p.kps.some(k => /^[2345]\./.test(k));
  return discrete ? (continuous ? 'both' : 'discrete') : continuous ? 'continuous' : 'basics';
}
function fits(anchor: Problem, p: Problem, score: number): boolean {
  if (p.verified === 'uncertain' || p.type !== anchor.type || p.kps.some(k=>k.startsWith('8.'))) return false;
  const a = family(anchor), b = family(p);
  // 含离散内容的题不混入纯连续题位，反之亦然。
  if ((a==='discrete' || a==='both') !== (b==='discrete' || b==='both')) return false;
  if (!p.kps.some(k=>anchor.kps.includes(k))) return false;
  if (!compareDemand(anchor,p).comparable) return false;
  const target = score*1.2, time = workload(p);
  return time <= Math.max(8,target*1.5) && time >= (score>=10 ? target*.55 : 2);
}
function noise(seed: string, id: string): number {
  let hash = 2166136261;
  for (const c of `${seed}:${id}`) hash = Math.imul(hash^c.charCodeAt(0),16777619);
  return (hash>>>0)/4294967296;
}
export function generateMock(template: string, pool: MockPool, seed: string, attempted = new Set<string>(), adaptive?: MasteryIndex): ExamItem[] {
  if (!templatePapers.some(p=>p.id===template)) throw new Error('这份卷的独立分值不完整，暂不能作为组卷模板。');
  const anchors = paperProblems(template);
  const choices = anchors.map(a => {
    const score = a.sources.find(s=>s.paper===template)!.score!;
    return problems.filter(p=> {
      if (p.id===a.id) return p.verified !== 'uncertain';
      if (p.sources.some(s=>s.paper===template)) return false; // 保留模板原题只作为其自身题位的兜底。
      if (pool==='selected' && !p.sources.some(s=>paperById.get(s.paper)?.school)) return false;
      if (pool==='local' && p.sources.some(s=>paperById.get(s.paper)?.school)) return false;
      return fits(a,p,score);
    }).map(p=> {
      const same = p.pattern && p.pattern===a.pattern;
      const external = p.sources.some(s=>paperById.get(s.paper)?.school);
      const value = p.id===a.id ? -1000 : (same?40:0)+p.kps.filter(k=>a.kps.includes(k)).length*8+
        compareDemand(a,p).closeness*20+(external?12:0)+(attempted.has(p.id)?0:6)-Math.abs(workload(p)-score*1.2)*2+noise(seed,p.id)*16;
      return { p, value: value + (adaptive && p.id !== a.id ? 35 * problemPriority(p.id, adaptive) : 0) };
    }).sort((a,b)=>b.value-a.value || a.p.id.localeCompare(b.p.id));
  });
  const assigned = new Map<string,number>(), picks = new Map<number,Problem>();
  // 增广匹配使候选稀少的题位仍能选到合适题，每个原题在整卷中最多出现一次。
  function assign(slot: number, visited: Set<string>): boolean {
    for (const {p} of choices[slot]) {
      if (visited.has(p.id)) continue;
      visited.add(p.id);
      const old = assigned.get(p.id);
      if (old===undefined || assign(old,visited)) {
        assigned.set(p.id,slot); picks.set(slot,p); return true;
      }
    }
    return false;
  }
  const order=anchors.map((_,i)=>i).sort((a,b)=>choices[a].length-choices[b].length);
  for (const slot of order) if (!assign(slot,new Set())) throw new Error(`第 ${slot+1} 个题位缺少可核验的匹配题，请更换题源或模板。`);
  return anchors.map((a,i)=> {
    const p=picks.get(i)!; const source=a.sources.find(s=>s.paper===template)!;
    return {problemId:p.id, referenceId:a.id,no:source.no,score:source.score!,match:p.id===a.id?'original':p.pattern===a.pattern?'pattern':'knowledge'};
  });
}

export interface MockSession {
  id: string; start: number; title: string; template: string; minutes: number; items: ExamItem[]; current: number; finished?: number;
  mode: 'strict' | 'practice'; origin: 'mock' | 'paper'; answers: Map<string, ExamAnswer>;
  snapshot?: ExamSnapshotRow[]; finishReason?: 'submitted' | 'timeout'; finishRecordedAt?: number;
}
export function mockSessions(events: TrainerEvent[]): MockSession[] {
  const sessions=new Map<string,MockSession>();
  for (const e of [...events].sort((a,b)=>a.t-b.t || a.id.localeCompare(b.id))) {
    if (e.kind!=='exam') continue;
    if (e.action==='start') {
      if (!sessions.has(e.examId)) sessions.set(e.examId,{id:e.examId,start:e.t,title:e.title,template:e.template,minutes:e.minutes,items:e.items,current:0,
        mode:e.mode??'practice',origin:e.origin??'mock',answers:new Map()});
    } else {
      const s=sessions.get(e.examId);
      if (!s) continue;
      if (e.action==='navigate' && s.finished===undefined && e.current>=0 && e.current<s.items.length && (s.mode!=='strict'||e.t<examDeadline(s))) s.current=e.current;
      if (e.action==='answer' && s.finished===undefined && e.t<examDeadline(s) && s.items.some(i=>i.problemId===e.answer.problemId)) s.answers.set(e.answer.problemId,e.answer);
      if (e.action==='finish' && s.finished===undefined && (e.endedAt??e.t)>=s.start) {
        s.finished=s.mode==='strict'?Math.min(e.endedAt??e.t,examDeadline(s)):e.endedAt??e.t;
        s.finishRecordedAt=e.t;s.finishReason=e.reason??'submitted';s.snapshot=e.snapshot;
      }
    }
  }
  return [...sessions.values()].sort((a,b)=>b.start-a.start || b.id.localeCompare(a.id));
}
export function mockResult(session: MockSession, events: TrainerEvent[]) {
  const attempts=new Map<string,AttemptEvent>();
  for (const e of session.mode==='strict'?learningEvents(events):events) {
    if (e.kind!=='attempt' || e.examId!==session.id || e.t<session.start || (session.finished!==undefined && e.t>session.finished)) continue;
    const prev=attempts.get(e.problemId);
    if (!prev || e.t>prev.t || (e.t===prev.t && e.id>prev.id)) attempts.set(e.problemId,e);
  }
  const rows=session.items.map(item=> {
    const frozen=session.snapshot?.find(r=>r.problemId===item.problemId);
    const answer=session.finished!==undefined && session.snapshot ? frozen?.answer : session.answers.get(item.problemId);
    const attempt=session.mode==='strict'?attempts.get(item.problemId):session.finished!==undefined&&session.snapshot?frozen?.attempt:attempts.get(item.problemId);
    const earned=attempt ? attempt.score && attempt.score.max===item.score ? attempt.score.earned : item.score*SCORE_COEF[attempt.grade] : 0;
    return {item,problem:problemById.get(item.problemId),attempt,answer,earned,
      seenBefore:item.seenBefore??events.some(e=>e.kind==='attempt'&&e.problemId===item.problemId&&e.t<session.start)};
  });
  const done=rows.filter(r=>session.mode==='strict'?r.answer?.status==='answered':r.attempt).length;
  return { rows, done, graded:rows.filter(r=>r.attempt).length, skipped:rows.filter(r=>r.answer?.status==='skipped').length,
    unanswered:rows.filter(r=>session.mode==='strict'?r.answer?.status!=='answered':!r.attempt).length,
    pending:session.mode==='strict'?rows.filter(r=>r.answer&&r.answer.status!=='skipped'&&(r.answer.text.trim()||r.answer.choice!==undefined)&&!r.attempt).length:0,
    fresh:rows.filter(r=>!r.seenBefore).length, score:rows.reduce((v,r)=>v+r.earned,0), total:session.items.reduce((v,i)=>v+i.score,0) };
}
export function validMockSession(s: MockSession): boolean {
  const anchor=paperProblems(s.template);
  if(s.origin==='paper') return paperById.has(s.template)&&s.items.length===anchor.length&&s.items.every((i,n)=>i.problemId===anchor[n].id&&i.referenceId===i.problemId&&i.score===(anchor[n].sources.find(x=>x.paper===s.template)?.score??0));
  return templatePapers.some(p=>p.id===s.template) && s.items.length===anchor.length && s.items.every((i,n)=>i.referenceId===anchor[n].id && i.no===anchor[n].sources.find(x=>x.paper===s.template)?.no && i.score===anchor[n].sources.find(x=>x.paper===s.template)?.score && problemById.has(i.problemId));
}
export const examDeadline=(s:MockSession):number=>s.start+s.minutes*60_000;

/** 固定当前卷的提交内容，不依赖结束后继续增长的学习历史。 */
export function finishExam(s:MockSession,events:TrainerEvent[],now:number):Omit<Extract<ExamEvent,{action:'finish'}>,'id'|'t'> {
  const endedAt=s.mode==='strict'?Math.min(now,examDeadline(s)):now;
  const rows=mockResult({...s,finished:endedAt},events.filter(e=>e.t<=endedAt)).rows;
  const snapshot:ExamSnapshotRow[]=rows.map(r=>({problemId:r.item.problemId,
    ...(r.answer?{answer:{...r.answer}}:{}),
    ...(r.attempt?{attempt:{...r.attempt,...(r.item.score>0?{score:r.attempt.score??{earned:r.earned,max:r.item.score,basis:'reference' as const}}:{})}}:{})}));
  return {kind:'exam',examId:s.id,action:'finish',endedAt,reason:s.mode==='strict'&&now>=examDeadline(s)?'timeout':'submitted',snapshot};
}
export type MockStart = Omit<Extract<ExamEvent,{action:'start'}>,'id'|'t'>;
