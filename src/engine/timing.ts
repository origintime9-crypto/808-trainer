import { problemById } from '../content';
import { problemDemand } from '../content/difficulty808';
import type { AttemptEvent, TrainerEvent } from '../types';
import { dailyEvidence, isIndependent } from './evidence';

/** 用本人的跨日首次独立作答校准用时；不将其称为群体难度校准。 */
const cache=new WeakMap<TrainerEvent[],{now:number;length:number;byProblem:Map<string,AttemptEvent[]>}>();
export function timeEstimate(problemId:string,events:TrainerEvent[]=[],now=Date.now()) {
  const p=problemById.get(problemId),initial=p?problemDemand(p):{minutes:6,basis:'规则估计'};
  let index=cache.get(events);
  if(!index||index.now!==now||index.length!==events.length) {
    const byProblem=new Map<string,AttemptEvent[]>();
    for(const e of dailyEvidence(events,now))if(isIndependent(e)){const rows=byProblem.get(e.problemId)??[];rows.push(e);byProblem.set(e.problemId,rows);}
    index={now,length:events.length,byProblem};cache.set(events,index);
  }
  const samples=(index.byProblem.get(problemId)??[]).filter(e=>
    (e.score?e.score.earned/e.score.max>=0.7:e.grade>=2)&&e.sec>=30&&e.sec<=Math.min(180*60,initial.minutes*4*60));
  if(samples.length<3)return {minutes:initial.minutes,basis:initial.basis,samples:samples.length,calibrated:false};
  const values=samples.map(e=>e.sec/60).sort((a,b)=>a-b),middle=Math.floor(values.length/2);
  const median=values.length%2?values[middle]:(values[middle-1]+values[middle])/2;
  return {minutes:Math.max(1,Math.ceil(median)),basis:'个人首次独立作答中位数',samples:samples.length,calibrated:true};
}
