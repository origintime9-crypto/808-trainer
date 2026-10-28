import type { Settings, TrainerEvent } from '../types';
import { cardQueue, duePractice, recommendNew } from './queue';
import type { MasteryIndex } from './mastery';
import { startOfToday, type Schedule } from './scheduler';
import { timeEstimate } from './timing';
import { mockSessions } from './mock';

export const STAGE_LABELS={foundation:'基础阶段',strengthening:'强化阶段',sprint:'冲刺阶段'} as const;
export interface DailyTask {kind:'due-problem'|'new-problem'|'due-card'|'new-card';id:string;minutes:number}

export function dailyPlan(sched:Schedule,events:TrainerEvent[],settings:Settings,mi:MasteryIndex,now:number) {
  const budget=settings.dailyMinutes??90,stage=settings.studyStage??'strengthening',today=startOfToday(now);
  const firstReview=new Set<string>();let spent=0;
  for(const e of [...events].sort((a,b)=>a.t-b.t||a.id.localeCompare(b.id))) {
    if(e.t>now)continue;
    if(e.kind==='review') {if(e.t>=today)spent+=firstReview.has(e.cardId)?1:2;firstReview.add(e.cardId);}
    if(e.kind==='attempt'&&e.t>=today)spent+=Math.min(180,e.sec/60);
  }
  for(const s of mockSessions(events))if(s.mode==='strict'&&s.finished!==undefined&&s.finished>=today&&s.finished<=now)
    spent+=Math.max(0,(s.finished-Math.max(s.start,today))/60_000);
  const remaining=Math.max(0,budget-spent),tasks:DailyTask[]=[];let available=remaining;
  const add=(kind:DailyTask['kind'],id:string,minutes:number)=>{
    if(minutes>available+0.0001)return false;
    tasks.push({kind,id,minutes});available-=minutes;return true;
  };
  const due=duePractice(sched,mi,now),q=cardQueue(sched,events,settings,mi,now);
  for(const id of due)add('due-problem',id,timeEstimate(id,events,now).minutes);
  for(const id of q.due)add('due-card',id,1);
  const cardAllowance=Math.min(available,remaining*(stage==='foundation'?0.35:stage==='sprint'?0.1:0.2));let cardUsed=0;
  for(const id of q.fresh)if(cardUsed+2<=cardAllowance&&add('new-card',id,2))cardUsed+=2;
  const fresh=recommendNew(sched,events,{...settings,dailyMinutes:available},mi,now);
  for(const id of fresh)add('new-problem',id,timeEstimate(id,events,now).minutes);
  const dueProblems=tasks.filter(t=>t.kind==='due-problem').map(t=>t.id),dueCards=tasks.filter(t=>t.kind==='due-card').map(t=>t.id);
  const deferredProblems=due.filter(id=>!dueProblems.includes(id)),deferredCards=q.due.filter(id=>!dueCards.includes(id));
  const deferredMinutes=deferredProblems.reduce((v,id)=>v+timeEstimate(id,events,now).minutes,0)+deferredCards.length;
  return {budget,stage,spentMinutes:Math.round(spent),remainingMinutes:Math.floor(remaining),expectedMinutes:tasks.reduce((v,t)=>v+t.minutes,0),tasks,
    dueProblems,newProblems:tasks.filter(t=>t.kind==='new-problem').map(t=>t.id),
    cards:{due:dueCards,fresh:tasks.filter(t=>t.kind==='new-card').map(t=>t.id),newToday:q.newToday},
    deferredProblems,deferredCards,deferredMinutes,
    catchupDays:Math.ceil(deferredMinutes/Math.max(1,budget*0.7))};
}
