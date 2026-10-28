import { problemById, problems } from '../content';
import { skillById, skillTrainings } from '../content/training';
import { fits808 } from '../content/target808';
import { problemDemand } from '../content/difficulty808';
import { problemFamily } from '../content/families';
import type { Settings, TrainerEvent } from '../types';
import { learningEvents } from './history';
import { startOfToday } from './scheduler';

export function trainingCandidates(skillId:string,events:TrainerEvent[],settings:Settings,from?:string) {
  const skill=skillById.get(skillId);if(!skill)return [];
  const attempted=new Set(learningEvents(events).filter(e=>e.kind==='attempt').map(e=>e.problemId));
  const previous=from&&problemById.has(from)?problemFamily(from):undefined;
  return problems.filter(p=>fits808(p.id)&&(!previous||problemFamily(p.id)!==previous)&&
    !p.sources.some(s=>(settings.reservedPapers??['zt2026']).includes(s.paper))&&
    (skillId==='method'?p.type!=='选择'&&p.type!=='填空'&&problemDemand(p).level>=2:skill.patterns.includes(p.pattern??'')))
    .sort((a,b)=>Number(attempted.has(a.id))-Number(attempted.has(b.id))||
      (skillId==='roc'?Number(b.pattern==='hz-roc-all')-Number(a.pattern==='hz-roc-all'):0)||
      problemDemand(a).level-problemDemand(b).level||a.id.localeCompare(b.id));
}

export function weakSkills(events:TrainerEvent[],now:number) {
  const counts=new Map<string,Set<string>>();
  for(const e of learningEvents(events.filter(e=>e.t<=now)))if(e.kind==='attempt'&&now-e.t<=45*86_400_000)
    for(const id of e.skillErrors??[]) {const rows=counts.get(id)??new Set();rows.add(e.problemId+':'+startOfToday(e.t));counts.set(id,rows);}
  return [...counts].map(([id,rows])=>({id,count:rows.size,training:skillTrainings.find(s=>s.errors.some(e=>e.id===id))}))
    .filter(r=>r.training).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));
}
