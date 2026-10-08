import { describe, expect, it } from 'vitest';
import { problemById, problems } from '../src/content';
import { compareDemand, problemDemand, reference808 } from '../src/content/difficulty808';
import { target808Units } from '../src/content/target808';
import { generateMock, templatePapers } from '../src/engine/mock';
import { referenceEvidence808 } from '../src/engine/reference808';
import { DAY } from '../src/engine/scheduler';
import type { AttemptEvent } from '../src/types';

const NOW=new Date('2026-10-08T10:00:00+08:00').getTime();
const attempt=(id:string,problemId:string,grade:0|1|2|3,t=NOW,sec=300):AttemptEvent=>({
 id,problemId,kind:'attempt',grade,t,sec,tags:[],
});
describe('以808原题难度检验参考性',()=>{
 it('17个实际题位的用时预算合计180分钟，全卷作答验证守恒且不改变题源',()=>{
  const before=JSON.stringify(problems);
  expect(target808Units.reduce((sum,p)=>sum+problemDemand(p).minutes,0)).toBe(180);
  expect(target808Units.every(p=>reference808(p.id).category==='near')).toBe(true);
  const events=target808Units.map((p,i)=>attempt('original-'+i,p.id,3));
  const proof=referenceEvidence808(events,NOW);
  expect(proof.measured).toBe(17);expect(proof.full).toBe(17);expect(proof.timedFull).toBe(17);expect(proof.coverage).toBe(1);
  expect(proof.slots.every(s=>s.referenceId===s.attempt?.problemId)).toBe(true);
  expect(JSON.stringify(problems)).toBe(before);
 });
 it('同方法原题归回自己的题位，重复一题不能覆盖两个冲激计算题位',()=>{
  const events=Array.from({length:20},(_,i)=>attempt('repeat-'+i,'zt2026-1-2',3,NOW+i*1000));
  const proof=referenceEvidence808(events,NOW+60_000);
  expect(proof.measured).toBe(1);expect(proof.coverage).toBeCloseTo(5/150);
  expect(proof.slots.find(s=>s.measured)?.referenceId).toBe('zt2026-1-2');
 });
 it('日内纠正不充当首次全对，跨日复测更新一次，未来及乱序记录不污染结果',()=>{
  const events=[attempt('first','zt2026-1-1',0),attempt('correction','zt2026-1-1',3,NOW+1000),
   attempt('next-day','zt2026-1-1',3,NOW+DAY),attempt('future','zt2026-1-2',3,NOW+2*DAY)];
  const sameDay=referenceEvidence808(events,NOW+2000);
  expect(sameDay.measured).toBe(1);expect(sameDay.full).toBe(0);expect(sameDay.timedFull).toBe(0);
  const later=referenceEvidence808(events,NOW+DAY);
  expect(later.measured).toBe(1);expect(later.full).toBe(1);
  expect(referenceEvidence808([...events].reverse(),NOW+DAY)).toEqual(later);
 });
 it('共享稳定性考点的变换存在性判断不能替代零极点加稳态响应的综合题',()=>{
  const composite=problemById.get('zt2026-10')!,simple=problemById.get('zt2026-7')!;
  expect(simple.type).toBe(composite.type);expect(simple.kps.some(k=>composite.kps.includes(k))).toBe(true);
  expect(compareDemand(composite,simple).comparable).toBe(false);
 });
 it('基础补齐、题面存疑及状态变量拓展不能冒充原卷难度验证，暂停超时不冒充限时全对',()=>{
  const foundation=problems.find(p=>reference808(p.id).category==='foundation')!;
  const events=[attempt('foundation',foundation.id,3),attempt('uncertain','tk-exam-29-24-1a',3),
   attempt('outside','tk-exam-07-32-4',3)];
  const before=JSON.stringify(events),proof=referenceEvidence808(events,NOW);
  expect(proof.measured).toBe(0);expect(proof.foundation).toBe(1);expect(proof.latestDayFirstScores).toBe(1);
  expect(JSON.stringify(events)).toBe(before);
  const paused=referenceEvidence808([attempt('paused','zt2026-1-1',3,NOW,7200)],NOW);
  expect(paused.full).toBe(1);expect(paused.timedFull).toBe(0);
 });
 it('A/B/C和两份完整模板都保持难度方法约束、分值与独立题位',()=>{
  for (const template of templatePapers)for (const seed of ['selected-a','selected-b','selected-c'])
   for (const pool of ['mixed','local','selected'] as const){
    const items=generateMock(template.id,pool,seed);
    expect(items.reduce((sum,i)=>sum+i.score,0)).toBe(150);
    expect(new Set(items.map(i=>i.problemId)).size).toBe(items.length);
    for (const item of items)if(item.match!=='original')
     expect(compareDemand(problemById.get(item.referenceId)!,problemById.get(item.problemId)!).comparable).toBe(true);
   }
 });
});
