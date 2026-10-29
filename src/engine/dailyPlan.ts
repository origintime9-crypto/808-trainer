import { problemById } from '../content/catalog';
import type { Settings, TrainerEvent } from '../types';
import { cardQueue, duePractice, recommendNew } from './queue';
import type { MasteryIndex } from './mastery';
import { startOfToday, type Schedule } from './scheduler';
import { timeEstimate } from './timing';
import { mockSessions } from './mock';
import { remediationPlan } from './remediation';

export const STAGE_LABELS={foundation:'基础阶段',strengthening:'强化阶段',sprint:'冲刺阶段'} as const;
export interface DailyTask {kind:'due-problem'|'new-problem'|'variant-problem'|'due-card'|'new-card';id:string;minutes:number;from?:string}

export function dailyPlan(sched:Schedule,events:TrainerEvent[],settings:Settings,mi:MasteryIndex,now:number) {
  const budget=settings.dailyMinutes??90,stage=settings.studyStage??'strengthening',today=startOfToday(now);
  const firstReview=new Set<string>();let spent=0,cardSpent=0;
  for(const e of [...events].sort((a,b)=>a.t-b.t||a.id.localeCompare(b.id))) {
    if(e.t>now)continue;
    if(e.kind==='review') {
      if(e.t>=today){const minutes=firstReview.has(e.cardId)?1:2;spent+=minutes;cardSpent+=minutes;}
      firstReview.add(e.cardId);
    }
    if(e.kind==='attempt'&&e.t>=today)spent+=Math.min(180,e.sec/60);
  }
  for(const s of mockSessions(events))if(s.mode==='strict'&&s.finished!==undefined&&s.finished>=today&&s.finished<=now)
    spent+=Math.max(0,(s.finished-Math.max(s.start,today))/60_000);
  const remaining=Math.max(0,budget-spent),tasks:DailyTask[]=[];let available=remaining;
  const add=(kind:DailyTask['kind'],id:string,minutes:number,from?:string)=>{
    if(tasks.some(t=>t.id===id)||minutes>available+.0001)return false;
    tasks.push({kind,id,minutes,...(from?{from}:{})});available-=minutes;return true;
  };
  const due=duePractice(sched,mi,now),q=cardQueue(sched,events,settings,mi,now),remediation=remediationPlan(events,settings,now);
  // 热身额度按全天已复习时间扣减，刷新或重新进卡片页不会不断补充新卡。
  const warmupTarget=Math.min(stage==='foundation'?15:10,Math.max(2,Math.floor(budget*.2)));
  let warmupAvailable=Math.min(remaining,Math.max(0,warmupTarget-cardSpent));
  for(const id of q.due) {
    const minutes=sched.cards.has(id)?1:2;
    if(minutes<=warmupAvailable&&add('due-card',id,minutes))warmupAvailable-=minutes;
  }
  for(const id of q.fresh)if(2<=warmupAvailable&&add('new-card',id,2))warmupAvailable-=2;
  for(const v of remediation.variants)if(v.id&&v.dueAt<=now)add('variant-problem',v.id,timeEstimate(v.id,events,now).minutes,v.from);
  for(const id of due)add('due-problem',id,timeEstimate(id,events,now).minutes);
  const fresh=recommendNew(sched,events,{...settings,dailyMinutes:available},mi,now);
  for(const id of fresh)add('new-problem',id,timeEstimate(id,events,now).minutes);
  const dueProblems=tasks.filter(t=>t.kind==='due-problem').map(t=>t.id),dueCards=tasks.filter(t=>t.kind==='due-card').map(t=>t.id);
  const deferredProblems=due.filter(id=>!tasks.some(t=>t.id===id)),deferredCards=q.due.filter(id=>!dueCards.includes(id));
  const variants=tasks.filter(t=>t.kind==='variant-problem');
  const deferredVariants=remediation.variants.filter(v=>v.id&&v.dueAt<=now&&!tasks.some(t=>t.id===v.id));
  const deferredMinutes=deferredProblems.reduce((v,id)=>v+timeEstimate(id,events,now).minutes,0)+deferredCards.reduce((sum,id)=>sum+(sched.cards.has(id)?1:2),0)+
    deferredVariants.reduce((sum,v)=>sum+timeEstimate(v.id!,events,now).minutes,0);
  if(stage==='sprint') {
    const warm=tasks.filter(t=>t.kind.includes('card')),pool=tasks.filter(t=>t.kind.includes('problem')),mixed:DailyTask[]=[];
    while(pool.length) {
      const previous=mixed.at(-1),last=previous?problemById.get(previous.id):undefined;
      const index=last?pool.findIndex(t=>problemById.get(t.id)?.pattern!==last.pattern):0;
      mixed.push(pool.splice(Math.max(0,index),1)[0]);
    }
    tasks.splice(0,tasks.length,...warm,...mixed);
  }
  const warmup=tasks.filter(t=>t.kind.includes('card')),deep=tasks.filter(t=>t.kind.includes('problem'));
  return {budget,stage,spentMinutes:Math.round(spent),remainingMinutes:Math.floor(remaining),expectedMinutes:tasks.reduce((v,t)=>v+t.minutes,0),tasks,
    warmup:{tasks:warmup,minutes:warmup.reduce((v,t)=>v+t.minutes,0),targetMinutes:warmupTarget,spentMinutes:cardSpent},
    deep:{tasks:deep,minutes:deep.reduce((v,t)=>v+t.minutes,0)},variants,remediation,
    dueProblems,newProblems:tasks.filter(t=>t.kind==='new-problem').map(t=>t.id),
    cards:{due:dueCards,fresh:tasks.filter(t=>t.kind==='new-card').map(t=>t.id),newToday:q.newToday,remedial:q.remedial},
    deferredProblems,deferredCards,deferredVariants,deferredMinutes,
    catchupDays:Math.max(Math.ceil(deferredCards.reduce((sum,id)=>sum+(sched.cards.has(id)?1:2),0)/warmupTarget),Math.ceil((deferredMinutes-deferredCards.reduce((sum,id)=>sum+(sched.cards.has(id)?1:2),0))/Math.max(1,(budget-warmupTarget)*.7)))};
}
