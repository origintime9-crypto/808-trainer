import type { ExamEvent, ExamItem, TrainerEvent } from '../types';
import { learningEvents } from './history';

export type Familiarity = NonNullable<ExamItem['familiarity']>;
export const FAMILIARITY_LABELS:Record<Familiarity,string>={new:'首次记录见题',seen:'见过未作答',practiced:'以前练过'};

/** 纯浏览不等于作答；旧考试可由首题、导航或答卷确认曾展示的题，不能把整卷都算见过。 */
export function encounterIndex(events:TrainerEvent[],before:number):Map<string,Familiarity> {
  const prior=events.filter(e=>e.t<=before).sort((a,b)=>a.t-b.t||a.id.localeCompare(b.id));
  const result=new Map<string,Familiarity>();
  const starts=new Map<string,Extract<ExamEvent,{action:'start'}>>();
  const seen=(id:string|undefined)=>{if(id&&!result.has(id))result.set(id,'seen');};
  const answer=(row:Extract<ExamEvent,{action:'answer'}>['answer'])=>{
    seen(row.problemId);
    if(row.status==='answered'||row.text.trim()||row.choice!==undefined)result.set(row.problemId,'practiced');
  };
  for(const e of prior) {
    if(e.kind==='exposure')seen(e.problemId);
    if(e.kind!=='exam')continue;
    if(e.action==='start'&&!starts.has(e.examId)){starts.set(e.examId,e);seen(e.items[0]?.problemId);}
    if(e.action==='navigate')seen(starts.get(e.examId)?.items[e.current]?.problemId);
    if(e.action==='answer')answer(e.answer);
    if(e.action==='finish')for(const row of e.snapshot??[])if(row.answer)answer(row.answer);
  }
  for(const e of learningEvents(prior))if(e.kind==='attempt')result.set(e.problemId,'practiced');
  return result;
}
