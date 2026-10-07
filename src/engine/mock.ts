import { paperById, papers, problemById, problems } from '../content';
import { paperProblems, SCORE_COEF } from './paper';
import type { AttemptEvent, ExamEvent, ExamItem, Problem, TrainerEvent } from '../types';

export type MockPool = 'mixed' | 'selected' | 'local';
export const templatePapers = papers.filter(p => p.kind === '真题' && !p.school && p.totalScore === 150 && paperProblems(p.id).every(q => q.sources.find(s => s.paper === p.id)?.score) && paperProblems(p.id).reduce((v,q)=>v+(q.sources.find(s=>s.paper===p.id)?.score??0),0) === 150);
export const selectedPapers = papers.filter(p => !!p.school);

function workload(p: Problem): number {
  if (p.minutes) return p.minutes;
  const scores = p.sources.flatMap(s => s.score ? [s.score] : []);
  if (scores.length) return Math.max(...scores)*1.2;
  const questions = (p.stem.match(/\([1-9]\)|（[1-9]）/g) ?? []).length;
  return p.type === '分析' ? Math.max(10, questions*4) : p.type === '画图' ? 8 : Math.max(6,questions*4);
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
  const target = score*1.2, time = workload(p);
  return time <= Math.max(8,target*1.5) && time >= (score>=10 ? target*.55 : 2);
}
function noise(seed: string, id: string): number {
  let hash = 2166136261;
  for (const c of `${seed}:${id}`) hash = Math.imul(hash^c.charCodeAt(0),16777619);
  return (hash>>>0)/4294967296;
}
export function generateMock(template: string, pool: MockPool, seed: string, attempted = new Set<string>()): ExamItem[] {
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
      const value = p.id===a.id ? -1000 : (same?40:0)+p.kps.filter(k=>a.kps.includes(k)).length*8+(external?22:0)+(attempted.has(p.id)?0:6)-Math.abs(workload(p)-score*1.2)*2+noise(seed,p.id)*16;
      return { p, value };
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
}
export function mockSessions(events: TrainerEvent[]): MockSession[] {
  const sessions=new Map<string,MockSession>();
  for (const e of [...events].sort((a,b)=>a.t-b.t || a.id.localeCompare(b.id))) {
    if (e.kind!=='exam') continue;
    if (e.action==='start') {
      if (!sessions.has(e.examId)) sessions.set(e.examId,{id:e.examId,start:e.t,title:e.title,template:e.template,minutes:e.minutes,items:e.items,current:0});
    } else {
      const s=sessions.get(e.examId);
      if (!s) continue;
      if (e.action==='navigate' && !s.finished && e.current<s.items.length) s.current=e.current;
      if (e.action==='finish' && !s.finished) s.finished=e.t;
    }
  }
  return [...sessions.values()].sort((a,b)=>b.start-a.start || b.id.localeCompare(a.id));
}
export function mockResult(session: MockSession, events: TrainerEvent[]) {
  const attempts=new Map<string,AttemptEvent>();
  for (const e of events) {
    if (e.kind!=='attempt' || e.examId!==session.id || e.t<session.start || (session.finished!==undefined && e.t>session.finished)) continue;
    const prev=attempts.get(e.problemId);
    if (!prev || e.t>prev.t || (e.t===prev.t && e.id>prev.id)) attempts.set(e.problemId,e);
  }
  const rows=session.items.map(item=>({item,problem:problemById.get(item.problemId),attempt:attempts.get(item.problemId)}));
  return { rows, done:rows.filter(r=>r.attempt).length, score:rows.reduce((v,r)=>v+r.item.score*SCORE_COEF[r.attempt?.grade??0],0), total:session.items.reduce((v,i)=>v+i.score,0) };
}
export function validMockSession(s: MockSession): boolean {
  const anchor=paperProblems(s.template);
  return templatePapers.some(p=>p.id===s.template) && s.items.length===anchor.length && s.items.every((i,n)=>i.referenceId===anchor[n].id && i.no===anchor[n].sources.find(x=>x.paper===s.template)?.no && i.score===anchor[n].sources.find(x=>x.paper===s.template)?.score && problemById.has(i.problemId));
}
export type MockStart = Omit<Extract<ExamEvent,{action:'start'}>,'id'|'t'>;
