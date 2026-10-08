import { describe, expect, it } from 'vitest';
import { cards, kpById, problems } from '../src/content';
import { examEmphasis, fits808, target808Points, target808Scope, target808Total, target808Units } from '../src/content/target808';
import { computeMastery, masteryStatus, priority, type Mastery, type MasteryIndex } from '../src/engine/mastery';
import { generateMock } from '../src/engine/mock';
import { cardQueue, duePractice, recommendNew } from '../src/engine/queue';
import { readiness808 } from '../src/engine/readiness';
import { DEFAULT_SETTINGS } from '../src/engine/store';
import { DAY, replay, targetRetention } from '../src/engine/scheduler';
import type { AttemptEvent, ReviewEvent, TrainerEvent } from '../src/types';

const NOW = new Date('2026-10-08T10:00:00+08:00').getTime(), EXAM='2026-12-20';
let seq=0;
const attempt=(problemId:string,grade:0|1|2|3,t=NOW):AttemptEvent=>({kind:'attempt',id:'adaptive-'+seq++,problemId,grade,t,tags:[],sec:300});
const review=(cardId:string,t=NOW):ReviewEvent=>({kind:'review',id:'adaptive-card-'+seq++,cardId,rating:4,t});
const single=problems.filter(p=>p.kps.length===1&&p.kps[0]==='1.8'&&fits808(p.id)).slice(0,4);
const measured=(m:number):Mastery=>({m,ability:m,retention:1,forgetting:0,confidence:0.85,uniqueProblems:4,attempts:4,reviews:0,dueCount:0,tags:computeMastery([],NOW).kp('1.8').tags});
const profile=(weak:string):MasteryIndex=>({kp:id=>measured(id===weak?0.15:0.9),pattern:()=>measured(0.9)});

describe('808依据与水平画像',()=>{
  it('结构依据为17单元150分，综合考点配分总和守恒',()=>{
    expect(target808Units).toHaveLength(17);expect(target808Total).toBe(150);
    expect([...target808Points.values()].reduce((a,b)=>a+b,0)).toBeCloseTo(150);
    expect(target808Scope.every(k=>k.chapter<=7&&k.stars>=3)).toBe(true);
    const all=readiness808(computeMastery([],NOW),[],NOW);
    expect(all.types.reduce((s,t)=>s+t.score,0)).toBe(150);
  });
  it('未测及只背卡片都不能冒充已测808水平',()=>{
    const empty=readiness808(computeMastery([],NOW),[],NOW);
    expect(empty.coverage).toBe(0);expect(empty.measuredMastery).toBeNull();expect(empty.level).toBe('仍需补测');
    const events=cards.slice(0,25).map(c=>review(c.id));
    const cardOnly=readiness808(computeMastery(events,NOW),events,NOW);
    expect(cardOnly.coverage).toBe(0);expect(cardOnly.validatedCoverage).toBe(0);expect(cardOnly.measuredMastery).toBeNull();
  });
  it('四道不同808题增加验证覆盖，拓展状态变量不计入',()=>{
    expect(single).toHaveLength(4);
    const events=single.map(p=>attempt(p.id,3));
    const current=readiness808(computeMastery(events,NOW),events,NOW);
    expect(current.coverage).toBeGreaterThan(0);expect(current.validatedCoverage).toBeGreaterThan(0);
    expect(current.points.find(p=>p.id==='1.8')?.validated).toBe(true);
    const outside=problems.find(p=>p.kps.every(k=>k.startsWith('8.')))!;
    const extra=[...events,attempt(outside.id,3)];
    expect(readiness808(computeMastery(extra,NOW),extra,NOW).coverage).toBe(current.coverage);
  });
  it('808星级、真题频次和原卷分值共同决定重要性',()=>{
    expect(priority(5,0.5,6).value).toBeGreaterThan(priority(3,0.5,1).value);
    expect(priority(5,0.5,4,undefined,2).value).toBeGreaterThan(priority(5,0.5,4,undefined,1).value);
    const emphasized=[...target808Points].sort((a,b)=>b[1]-a[1])[0][0];
    expect(examEmphasis(emphasized)).toBeGreaterThan(examEmphasis('1.1'));
    expect(targetRetention([emphasized])).toBeGreaterThan(targetRetention(['1.1']));
  });
});

describe('不同题证据与个人记忆',()=>{
  it('日内反复做同一道题不提高掌握证据或FSRS稳定度',()=>{
    const p=single[0], first=attempt(p.id,3), repeated=Array.from({length:30},(_,i)=>attempt(p.id,3,NOW+i*1000));
    const a=computeMastery([first],NOW+60_000).kp('1.8'), b=computeMastery(repeated,NOW+60_000).kp('1.8');
    expect(b.uniqueProblems).toBe(1);expect(b.m).toBeCloseTo(a.m);expect(masteryStatus(b)).not.toBe('较稳固');
    expect(replay(repeated,EXAM).problems.get(p.id)!.card.stability).toBeCloseTo(replay([first],EXAM).problems.get(p.id)!.card.stability);
    const diverse=computeMastery(single.map(p=>attempt(p.id,3)),NOW).kp('1.8');
    expect(diverse.m).toBeGreaterThan(b.m);expect(masteryStatus(diverse)).toBe('较稳固');
  });
  it('旧错题不会随时间变熟；旧会题会显出遗忘风险',()=>{
    const events=single.map(p=>attempt(p.id,3));
    const recent=computeMastery(events,NOW).kp('1.8'), old=computeMastery(events,NOW+90*DAY).kp('1.8');
    expect(old.ability).toBeCloseTo(recent.ability);expect(old.m).toBeLessThan(recent.m);expect(old.forgetting).toBeGreaterThan(recent.forgetting);
    expect(masteryStatus(old)).toBe('需复习');
    const wrong=[attempt(single[0].id,0)];
    expect(computeMastery(wrong,NOW+90*DAY).kp('1.8').m).toBeLessThan(computeMastery(wrong,NOW).kp('1.8').m);
  });
  it('最近做错及时降低掌握；跨天修正又会提高',()=>{
    const history=single.map(p=>attempt(p.id,3,NOW-2*DAY));
    const baseline=computeMastery(history,NOW).kp('1.8');
    const failure=[...history,attempt(single[0].id,0)];
    const bad=computeMastery(failure,NOW).kp('1.8');
    expect(bad.ability).toBeLessThan(baseline.ability);
    const correction=[...failure,attempt(single[0].id,3,NOW+DAY)];
    expect(computeMastery(correction,NOW+DAY).kp('1.8').ability).toBeGreaterThan(bad.ability);
  });
  it('未来记录和不认识的题号不产生掌握证据',()=>{
    const events=[attempt(single[0].id,3,NOW+DAY),attempt('missing-question',3)];
    expect(computeMastery(events,NOW).kp('1.8').attempts).toBe(0);
    expect(readiness808(computeMastery(events,NOW),events,NOW).coverage).toBe(0);
    const mixed=[attempt(single[0].id,0,NOW-30*DAY),attempt(single[0].id,3,NOW+DAY)];
    expect(computeMastery(mixed,NOW,replay(mixed,EXAM)).kp('1.8').m).toBeCloseTo(computeMastery([mixed[0]],NOW).kp('1.8').m);
  });
  it('事件逆序回放稳定且不修改同步原始记录',()=>{
    const events:TrainerEvent[]=[attempt(single[0].id,0,NOW-DAY),attempt(single[0].id,3),attempt(single[1].id,3)];
    const before=JSON.stringify(events);
    expect(computeMastery([...events].reverse(),NOW).kp('1.8')).toEqual(computeMastery(events,NOW).kp('1.8'));
    expect(JSON.stringify(events)).toBe(before);
  });
  it('同日两次全对仍在错题本，隔日再全对才移出',()=>{
    const events=[attempt(single[0].id,0,NOW),attempt(single[0].id,3,NOW+1000),attempt(single[0].id,3,NOW+2000)];
    expect(replay(events,EXAM).problems.get(single[0].id)!.inMistakes).toBe(true);
    events.push(attempt(single[0].id,3,NOW+DAY));
    expect(replay(events,EXAM).problems.get(single[0].id)!.inMistakes).toBe(false);
  });
  it('相同全对反馈，重要考点的到期日更早',()=>{
    const low=problems.find(p=>p.kps.length===1&&kpById.get(p.kps[0])?.stars===1)!;
    const high=single[0];
    const states=replay([attempt(low.id,3),attempt(high.id,3)],EXAM);
    expect(states.problems.get(high.id)!.card.due.getTime()).toBeLessThan(states.problems.get(low.id)!.card.due.getTime());
  });
});

describe('补弱、保熟和结构约束',()=>{
  it('薄弱4.6出题增多，同类允许连练，掌握好则后移',()=>{
    const settings={...DEFAULT_SETTINGS,newProblemsPerDay:12}, state=replay([],EXAM);
    const weak=recommendNew(state,[],settings,profile('4.6'),NOW);
    const other=recommendNew(state,[],settings,profile('2.4'),NOW);
    const count=(ids:string[])=>ids.filter(id=>problems.find(p=>p.id===id)!.kps.includes('4.6')).length;
    expect(count(weak)).toBeGreaterThanOrEqual(4);expect(count(weak)).toBeGreaterThan(count(other));
    const patterns=weak.map(id=>problems.find(p=>p.id===id)!.pattern).filter(Boolean);
    expect(new Set(patterns).size).toBeLessThan(patterns.length);
    expect(new Set(weak).size).toBe(weak.length);expect(weak.every(fits808)).toBe(true);
  });
  it('已过关题会在到期后回到复习队列，未到期不会提前安排',()=>{
    const events=[attempt(single[0].id,3)],state=replay(events,EXAM);
    expect(state.problems.get(single[0].id)!.mastered).toBe(true);
    expect(duePractice(state,computeMastery(events,NOW,state),NOW)).not.toContain(single[0].id);
    expect(duePractice(state,computeMastery(events,NOW+30*DAY,state),NOW+30*DAY)).toContain(single[0].id);
  });
  it('新卡优先补808重点弱项，已练和今日额度仍生效',()=>{
    const events=[attempt(single[0].id,3,NOW-DAY),attempt(single[0].id,3,NOW),attempt(single[1].id,3,NOW)];
    const state=replay(events,EXAM),mi=computeMastery(events,NOW,state);
    const picked=recommendNew(state,[...events].reverse(),{...DEFAULT_SETTINGS,newProblemsPerDay:3},mi,NOW);
    expect(picked).toHaveLength(2);expect(picked).not.toContain(single[0].id);expect(picked).not.toContain(single[1].id);
    const fresh=cardQueue(replay([],EXAM),[],{...DEFAULT_SETTINGS,newCardsPerDay:8},profile('4.6'),NOW).fresh;
    expect(fresh.some(id=>cards.find(c=>c.id===id)?.kps.includes('4.6'))).toBe(true);
  });
  it('补强组卷仍满足808原卷题型、题位、分值、去重及存疑排除',()=>{
    for (const template of ['zt2026','zt2017']) for (const pool of ['mixed','selected','local'] as const) {
      const items=generateMock(template,pool,'adaptive-contract',new Set(),profile('4.6'));
      expect(items.reduce((sum,i)=>sum+i.score,0)).toBe(150);
      expect(new Set(items.map(i=>i.problemId)).size).toBe(items.length);
      for (const item of items) {
        const p=problems.find(p=>p.id===item.problemId)!,anchor=problems.find(p=>p.id===item.referenceId)!;
        expect(p.type).toBe(anchor.type);expect(p.verified).not.toBe('uncertain');expect(p.kps.some(k=>k.startsWith('8.'))).toBe(false);
      }
    }
  });
  it('只有练过的少量点不能宣称整体适配稳固',()=>{
    const events=single.map(p=>attempt(p.id,3));
    const snapshot=readiness808(computeMastery(events,NOW),events,NOW);
    expect(snapshot.measuredMastery).toBeGreaterThan(0.8);expect(snapshot.coverage).toBeLessThan(0.7);expect(snapshot.level).toBe('仍需补测');
  });
});
