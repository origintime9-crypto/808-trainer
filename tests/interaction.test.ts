import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { problems as sourceProblems, cards as sourceCards } from '../src/content';
import { problems, cards, problemById } from '../src/content/catalog';
import { problemDetail } from '../src/content/details';
import { estimateDemand } from '../src/content/demand';
import { mathMacros } from '../src/content/mathMacros';
import { reviewedHints, supportForProblem } from '../src/content/learningSupport';
import { transformConditions, transformRows } from '../src/content/transformSheet';
import { bookmarkedProblems } from '../src/engine/bookmarks';
import { remediationPlan } from '../src/engine/remediation';
import { rectangleOverlap, poleMagnitude, hasAliasing } from '../src/engine/signalLab';
import { readInk } from '../src/engine/scratchpad';
import { readEvent } from '../src/engine/events';
import { DEFAULT_SETTINGS, exportJson, parseImport } from '../src/engine/store';
import { dailyPlan } from '../src/engine/dailyPlan';
import { computeMastery } from '../src/engine/mastery';
import { DAY, replay, startOfToday } from '../src/engine/scheduler';
import { cardQueue } from '../src/engine/queue';
import { problemFamily } from '../src/content/families';
import type { AttemptEvent, TrainerEvent } from '../src/types';

const now=new Date('2026-10-29T10:00:00+08:00').getTime();
const attempt=(patch:Partial<AttemptEvent>={}):AttemptEvent=>({kind:'attempt',id:'error',t:now,problemId:'zt2026-9',grade:2,tags:[],sec:180,workMode:'independent',hintsUsed:false,...patch});
const plan=(events:TrainerEvent[],t=now)=>dailyPlan(replay(events,DEFAULT_SETTINGS.examDate),events,DEFAULT_SETTINGS,computeMastery(events,t),t);

describe('按需题库内容完整',()=>{
  it('目录保留所有 id、合并来源、作答量与卡片映射，不携带答案或题面',()=>{
    expect(problems.map(p=>p.id)).toEqual(sourceProblems.map(p=>p.id));
    expect(cards).toEqual(sourceCards.map(({id,kps})=>({id,kps})));
    for(const [i,p] of problems.entries()) {
      expect(p.sources).toEqual(sourceProblems[i].sources);
      expect(p.demand).toEqual(estimateDemand(sourceProblems[i]));
      expect('stem' in p||'answer' in p||'solution' in p).toBe(false);
    }
  });
  it('1171题按组加载仍得到原题干、解析和合并勘误，重试共用 Promise',async()=>{
    expect(problemDetail('zt2026-9')).toBe(problemDetail('zt2026-9'));
    for(const p of sourceProblems)expect(await problemDetail(p.id),p.id).toEqual({...p,...supportForProblem(p)});
    expect(problemDetail('missing')).toBe(problemDetail('missing'));
    expect(await problemDetail('missing')).toBeUndefined();
  });
  it('性质对照与逐题提示均可用同一宏配置渲染，前置引用指向既有卡片',()=>{
    const texts=[transformConditions,...transformRows.flatMap(r=>r.cells),...Object.values(reviewedHints).flat()];
    for(const text of texts) {
      const matches=text.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g);
      for(const m of matches)expect(()=>katex.renderToString(m[1]??m[2],{throwOnError:true,macros:{...mathMacros},displayMode:!!m[1],strict:'ignore'})).not.toThrow();
    }
    const ids=new Set(cards.map(c=>c.id));
    for(const p of sourceProblems)for(const id of supportForProblem(p).prerequisites)expect(ids.has(id),`${p.id}:${id}`).toBe(true);
  });
});

describe('错因驱动的真实后续任务',()=>{
  it('概念误用缩短原题间隔，并在次日插入 ROC 与部分分式基础卡；今天不偷跑',()=>{
    const e=attempt({tags:['概念不清']});
    expect(replay([e],DEFAULT_SETTINGS.examDate).problems.get(e.problemId)!.card.due.getTime()).toBeLessThanOrEqual(now+DAY);
    expect(remediationPlan([e],DEFAULT_SETTINGS,now).cards.every(c=>c.dueAt===startOfToday(now)+DAY)).toBe(true);
    const next=now+DAY,sched=replay([e],DEFAULT_SETTINGS.examDate);
    const q=cardQueue(sched,[e],DEFAULT_SETTINGS,computeMastery([e],next),next);
    expect(q.due).toEqual(expect.arrayContaining(['c7-roc','c7-pf','c7-causal-stable']));
    expect(cardQueue(sched,[e],DEFAULT_SETTINGS,computeMastery([e],now),now).remedial).toHaveLength(0);
  });
  it('完全不会且未选错因仍补前置；计算失误不额外缩短 FSRS 间隔',()=>{
    const normal=attempt(),calculation={...normal,tags:['计算失误'] as AttemptEvent['tags']};
    expect(replay([calculation],DEFAULT_SETTINGS.examDate).problems.get(normal.problemId)!.card.due.getTime()).toBe(replay([normal],DEFAULT_SETTINGS.examDate).problems.get(normal.problemId)!.card.due.getTime());
    expect(remediationPlan([attempt({grade:0})],DEFAULT_SETTINGS,now).cards.length).toBeGreaterThan(0);
    expect(remediationPlan([calculation],DEFAULT_SETTINGS,now).calculation.has(normal.problemId)).toBe(true);
  });
  it('三天后推荐另一个家族，排除保留卷；同日订正不能消除验证',()=>{
    const e=attempt({tags:['方法不会']});
    const correction=attempt({id:'correction',t:now+1000,grade:3,workMode:'correction',hintsUsed:true});
    const pending=remediationPlan([e,correction],DEFAULT_SETTINGS,now+3*DAY).variants[0];
    expect(pending.dueAt).toBe(startOfToday(now)+3*DAY);expect(pending.id).toBeTruthy();
    expect(problemFamily(pending.id!)).not.toBe(problemFamily(e.problemId));
    expect(problemById.get(pending.id!)!.sources.every(s=>s.paper!=='zt2026')).toBe(true);
    expect(plan([e],now+2*DAY).variants).toHaveLength(0);
    expect(plan([e],now+3*DAY).variants.some(v=>v.id===pending.id)).toBe(true);
    const check=attempt({id:'variant',problemId:pending.id!,t:now+3*DAY,grade:3});
    expect(remediationPlan([e,check],DEFAULT_SETTINGS,now+3*DAY).variants).toHaveLength(0);
    expect(remediationPlan([e,{...check,workMode:'reference',hintsUsed:true}],DEFAULT_SETTINGS,now+3*DAY).variants).toHaveLength(1);
    const originalPass=attempt({id:'original-pass',problemId:e.problemId,t:now+DAY,grade:3});
    expect(remediationPlan([e,originalPass],DEFAULT_SETTINGS,now+3*DAY).variants).toHaveLength(1);
    const after=attempt({id:'failed-again',problemId:e.problemId,t:now+4*DAY,tags:['方法不会']});
    expect(remediationPlan([e,check,after],DEFAULT_SETTINGS,now+4*DAY).variants[0].dueAt).toBe(startOfToday(now)+7*DAY);
  });
  it('补课只有真实次日 review 才完成，不伪造 FSRS 记录，独立成功解除旧错误',()=>{
    const e=attempt({grade:0,tags:['概念不清']});
    const reviews:TrainerEvent[]=['c7-roc','c7-pf','c7-causal-stable'].map((cardId,i)=>({kind:'review',id:'review'+i,cardId,t:now+DAY,rating:3}));
    expect(remediationPlan([e,...reviews],DEFAULT_SETTINGS,now+DAY).cards).toHaveLength(0);
    expect(remediationPlan([e,...reviews.map(r=>({...r,t:now+1000}))],DEFAULT_SETTINGS,now+DAY).cards.length).toBeGreaterThan(0);
    expect(replay([e],DEFAULT_SETTINGS.examDate).cards.size).toBe(0);
    expect(remediationPlan([e,attempt({id:'pass',t:now+DAY,grade:3})],DEFAULT_SETTINGS,now+DAY).cards).toHaveLength(0);
  });
  it('热身与推导共享总预算，刷新不补满已完成的热身额度',()=>{
    const initial=plan([]);expect(initial.warmup.minutes).toBeGreaterThan(0);expect(initial.deep.tasks.length).toBeGreaterThan(0);
    expect(initial.expectedMinutes).toBeLessThanOrEqual(DEFAULT_SETTINGS.dailyMinutes!);
    const events:TrainerEvent[]=cards.slice(0,5).map((c,i)=>({kind:'review',id:'warmup'+i,cardId:c.id,t:now,rating:3}));
    const after=plan(events);expect(after.warmup.minutes).toBe(0);expect(after.deep.tasks.length).toBeGreaterThan(0);
    expect(plan(events).tasks).toEqual(after.tasks);
  });
});

describe('收藏与本机草稿边界',()=>{
  it('收藏可取消、合并、导出，不增加解题与掌握证据，额外密钥字段被丢弃',()=>{
    const e=readEvent({kind:'bookmark',id:'save',t:now,problemId:'zt2026-9',active:true,secret:'must-not-save'})!;
    expect(JSON.stringify(e)).not.toContain('secret');expect(bookmarkedProblems([e]).has('zt2026-9')).toBe(true);
    expect(replay([e],DEFAULT_SETTINGS.examDate).problems.size).toBe(0);expect(computeMastery([e],now).kp('7.7').uniqueProblems).toBe(0);
    const events:TrainerEvent[]=[e,{...e,id:'remove',t:now+1,kind:'bookmark',problemId:'zt2026-9',active:false}];
    expect(bookmarkedProblems(parseImport(exportJson(events))).size).toBe(0);
    expect(readEvent({...e,active:'yes'})).toBeNull();
  });
  it('草稿只接受有界向量笔迹，拒绝照片数据、异常坐标和无限数',()=>{
    const strokes=[{erase:false,points:[{x:.5,y:0,pressure:.8}]}];expect(readInk(strokes)).toEqual(strokes);
    for(const bad of ['data:image/png;base64,AA',[{erase:false,points:[{x:NaN,y:0,pressure:1}]}],[{erase:false,points:[{x:2,y:0,pressure:1}]}]])expect(()=>readInk(bad)).toThrow();
  });
});

describe('交互实验使用确定的数学关系',()=>{
  it('卷积边界与面积正确，极点幅频响应保留真实增益，采样边界不误标重叠',()=>{
    expect([-1,0,.5,1,1.5,2,3].map(t=>rectangleOverlap(t).length)).toEqual([0,0,.5,1,.5,0,0]);
    expect(poleMagnitude(0,.5,2)).toBeCloseTo(1/4.25);expect(poleMagnitude(2,.1,2)).toBeGreaterThan(poleMagnitude(2,1,2));
    expect(hasAliasing(1,1.9)).toBe(true);expect(hasAliasing(1,2)).toBe(false);
  });
});
