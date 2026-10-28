import { describe, expect, it } from 'vitest';
import { problemById, problems } from '../src/content';
import { rubrics, referenceRubric } from '../src/content/rubrics';
import { problemFamily } from '../src/content/families';
import { skillTrainings } from '../src/content/training';
import { computeMastery } from '../src/engine/mastery';
import { dailyPlan } from '../src/engine/dailyPlan';
import { trainingCandidates } from '../src/engine/training';
import { timeEstimate } from '../src/engine/timing';
import { DEFAULT_SETTINGS, exportJson, parseImport } from '../src/engine/store';
import { DAY, replay } from '../src/engine/scheduler';
import type { AttemptEvent } from '../src/types';

const now=new Date('2026-10-28T10:00:00+08:00').getTime();
const attempt=(id:string,t:number,sec=120,mode:AttemptEvent['workMode']='independent'):AttemptEvent=>({id:`${id}-${t}-${mode}-${sec}`,kind:'attempt',problemId:id,t,sec,grade:3,tags:[],workMode:mode,hintsUsed:mode!=='independent'});

describe('按预算与阶段安排学习',()=>{
  it('基础阶段在15分钟内安排，保留2026整卷及其合并来源不被提前消耗',()=>{
    const settings={...DEFAULT_SETTINGS,studyStage:'foundation' as const,dailyMinutes:15,newProblemsPerDay:20};
    const plan=dailyPlan(replay([],settings.examDate),[],settings,computeMastery([],now),now);
    expect(plan.expectedMinutes).toBeLessThanOrEqual(15);expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.newProblems.every(id=>!problemById.get(id)!.sources.some(s=>s.paper==='zt2026'))).toBe(true);
    expect(plan.newProblems.every(id=>timeEstimate(id).minutes<=12)).toBe(true);
  });
  it('到期任务过多会延期并给补偿计划，已用完预算不再添加任务',()=>{
    const events=problems.slice(0,25).map(p=>attempt(p.id,now-30*DAY));
    const settings={...DEFAULT_SETTINGS,dailyMinutes:10};
    const plan=dailyPlan(replay(events,settings.examDate),events,settings,computeMastery(events,now),now);
    expect(plan.expectedMinutes).toBeLessThanOrEqual(10);expect(plan.deferredMinutes).toBeGreaterThan(0);expect(plan.catchupDays).toBeGreaterThan(0);
    const spent=[attempt('zt2026-10',now,900)];
    expect(dailyPlan(replay(spent,settings.examDate),spent,settings,computeMastery(spent,now),now).tasks).toHaveLength(0);
  });
  it('个人用时仅由三次跨日首次独立成功作答校准，订正/同日重复不算',()=>{
    const events=[attempt('zt2026-10',now-2*DAY,120),attempt('zt2026-10',now-DAY,180),attempt('zt2026-10',now,240)];
    expect(timeEstimate('zt2026-10',events,now)).toMatchObject({minutes:3,samples:3,calibrated:true});
    expect(timeEstimate('zt2026-10',events.map(e=>({...e,workMode:'correction',hintsUsed:true})),now).calibrated).toBe(false);
    expect(timeEstimate('zt2026-10',events.map((e,i)=>({...e,t:now+i})),now+100).samples).toBe(1);
  });
});
describe('参考步骤得分与专项训练',()=>{
  it('六份配分均与已核对原题满分一致，换配分不套用不匹配评分表',()=>{
    expect(rubrics).toHaveLength(6);
    for(const r of rubrics){expect(problemById.has(r.problemId)).toBe(true);expect(r.steps.reduce((v,s)=>v+s.max,0)).toBe(r.max);expect(new Set(r.steps.map(s=>s.id)).size).toBe(r.steps.length);}
    expect(referenceRubric('zt2026-10',15)).toBeUndefined();
  });
  it('五种专项都能开始新家族，排除保留卷；训练不冒充独立证据',()=>{
    for(const skill of skillTrainings){
      const candidates=trainingCandidates(skill.id,[],DEFAULT_SETTINGS,'zt2017-3-1');
      expect(candidates.length).toBeGreaterThan(0);expect(candidates.every(p=>problemFamily(p.id)!==problemFamily('zt2017-3-1'))).toBe(true);
      expect(candidates.every(p=>!p.sources.some(s=>s.paper==='zt2026'))).toBe(true);
    }
    const e={...attempt('zt2026-10',now,120,'reference'),skillErrors:['roc-missing']};
    expect(computeMastery([e],now).kp('4.6').uniqueProblems).toBe(0);expect(parseImport(exportJson([e]))).toEqual([e]);
  });
  it('复习评级全对但具体得分有失分时，能力按得分比例且不能移出错题本',()=>{
    const e:AttemptEvent={...attempt('zt2026-10',now),score:{earned:9,max:20,basis:'reference'},skillErrors:['roc-stability']};
    expect(computeMastery([e],now).kp('4.6').ability).toBeLessThan(0.5);
    expect(replay([e],DEFAULT_SETTINGS.examDate).problems.get(e.problemId)?.inMistakes).toBe(true);
    expect(parseImport(exportJson([e]))).toEqual([e]);
  });
});
