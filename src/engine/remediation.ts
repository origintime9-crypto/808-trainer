import { cardById, cards, problemById, problems } from '../content/catalog';
import { prerequisiteCards, errorRoutes } from '../content/learningSupport';
import { compareDemand } from '../content/difficulty808';
import { problemFamily } from '../content/families';
import type { AttemptEvent, Settings, TrainerEvent } from '../types';
import { dailyEvidence, isFullCredit, isIndependent } from './evidence';
import { learningEvents } from './history';
import { DAY, startOfToday } from './scheduler';

export function remediationPlan(events:TrainerEvent[],settings:Settings,now:number) {
  const valid=learningEvents(events.filter(e=>e.t<=now));
  const independent=dailyEvidence(events,now).filter(isIndependent);
  const successful=new Set(independent.filter(isFullCredit).map(e=>e.id));
  const pending=new Map<string,AttemptEvent[]>(),methods=new Map<string,AttemptEvent>(),reviews=new Map<string,number>(),attempted=new Set<string>();
  for(const e of valid) {
    if(e.kind==='review')reviews.set(e.cardId,e.t);
    if(e.kind!=='attempt'||!problemById.has(e.problemId))continue;
    attempted.add(e.problemId);
    if(errorRoutes(e).method) {
      const previous=methods.get(e.problemId),source=problemById.get(e.problemId)!;
      const completed=previous&&independent.some(a=>{
        const candidate=problemById.get(a.problemId);
        return candidate&&a.t<=e.t&&a.t>=startOfToday(previous.t)+3*DAY&&problemFamily(a.problemId)!==problemFamily(e.problemId)&&candidate.pattern===source.pattern&&compareDemand(source,candidate).comparable;
      });
      if(!previous||completed)methods.set(e.problemId,e);
    }
    if(successful.has(e.id))pending.delete(e.problemId);
    else if(errorRoutes(e).failed)pending.set(e.problemId,[...(pending.get(e.problemId)??[]),e]);
  }
  const requestedCards=new Map<string,{id:string;dueAt:number;from:string}>();
  const variants:{from:string;id?:string;dueAt:number}[]=[];
  const calculation=new Set<string>();
  for(const [id,failures] of pending) {
    const p=problemById.get(id)!;
    if(failures.some(e=>errorRoutes(e).calculation))calculation.add(id);
    const backtrack=failures.filter(e=>errorRoutes(e).backtrack).at(-1);
    if(backtrack) {
      const dueAt=startOfToday(backtrack.t)+DAY;
      const prerequisite=prerequisiteCards(p);
      const ids=prerequisite.length?prerequisite:cards.filter(c=>!c.id.startsWith('pattern-')&&c.kps.some(k=>p.kps.includes(k))).slice(0,2).map(c=>c.id);
      for(const cardId of ids)if(cardById.has(cardId)&&(reviews.get(cardId)??-1)<dueAt) {
        const old=requestedCards.get(cardId);
        if(!old||old.dueAt>dueAt)requestedCards.set(cardId,{id:cardId,dueAt,from:id});
      }
    }
  }
  // 原题即使隔日独立全对，也只解除原题补课；方法迁移仍需另一个家族验证。
  for(const [id,method] of methods) {
    const p=problemById.get(id)!;
    if(p.pattern) {
      const dueAt=startOfToday(method.t)+3*DAY;
      const completed=independent.some(e=>{
        const v=problemById.get(e.problemId);
        return v&&v.pattern===p.pattern&&e.t>=dueAt&&problemFamily(e.problemId)!==problemFamily(id)&&compareDemand(p,v).comparable;
      });
      if(completed)continue;
      const candidates=problems.filter(v=>v.id!==id&&v.pattern===p.pattern&&problemFamily(v.id)!==problemFamily(id)&&
        !v.sources.some(s=>(settings.reservedPapers??['zt2026']).includes(s.paper))&&compareDemand(p,v).comparable)
        .sort((a,b)=>Number(attempted.has(a.id))-Number(attempted.has(b.id))||a.id.localeCompare(b.id));
      variants.push({from:id,id:candidates[0]?.id,dueAt});
    }
  }
  return {cards:[...requestedCards.values()].sort((a,b)=>a.dueAt-b.dueAt||a.id.localeCompare(b.id)),
    variants:variants.sort((a,b)=>a.dueAt-b.dueAt||a.from.localeCompare(b.from)),calculation};
}
