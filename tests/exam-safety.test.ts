import { describe, expect, it } from 'vitest';
import type { AttemptEvent, ExamEvent, TrainerEvent } from '../src/types';
import { examDeadline, finishExam, mockResult, mockSessions, validMockSession } from '../src/engine/mock';
import { paperProblems } from '../src/engine/paper';
import { exportJson, parseImport } from '../src/engine/store';
import { learningEvents } from '../src/engine/history';
import { readEvent } from '../src/engine/events';
import { encounterIndex } from '../src/engine/encounters';
import { computeMastery } from '../src/engine/mastery';
import { replay } from '../src/engine/scheduler';

const start=(mode:'strict'|'practice'):ExamEvent=>({id:'start',kind:'exam',examId:'paper-test',t:1000,action:'start',origin:'paper',mode,title:'整卷回归',template:'zt2026',minutes:1,
  items:paperProblems('zt2026').map(p=>{const s=p.sources.find(s=>s.paper==='zt2026')!;return {problemId:p.id,referenceId:p.id,no:s.no,score:s.score!,match:'original',seenBefore:p.id==='zt2026-10'};})});
const attempt=(id:string,t:number,grade:AttemptEvent['grade'],examId='paper-test'):AttemptEvent=>({id,t,kind:'attempt',examId,problemId:'zt2026-1-1',grade,tags:[],sec:20,workMode:'independent',hintsUsed:false});

describe('整卷快照与严格模考',()=>{
  it('纯浏览、旧作答与未批改模考分别判断，不能把未展示的整卷题都算见过',()=>{
    const events:TrainerEvent[]=[{id:'seen',kind:'exposure',problemId:'zt2026-1-2',t:500},attempt('old',600,1,'daily'),start('strict'),
      {id:'nav',kind:'exam',examId:'paper-test',t:1100,action:'navigate',current:2},
      {id:'ungraded',kind:'exam',examId:'paper-test',t:1150,action:'answer',answer:{problemId:'zt2026-2-2',status:'answered',text:'未评分纸稿',sec:10}}];
    const known=encounterIndex(events,1200),items=mockSessions(events)[0].items;
    expect(known.get('zt2026-1-2')).toBe('seen');expect(known.get('zt2026-1-1')).toBe('practiced');
    expect(known.get(items[2].problemId)).toBe('seen');expect(known.get(items[3].problemId)).toBe('practiced');expect(known.has(items[4].problemId)).toBe(false);
    expect(encounterIndex(events,400).size).toBe(0);
    const browsing=[events[0]];
    expect(readEvent({...events[0],photos:['data:image/png;base64,AA'],syncKey:'local-secret'})).toEqual(events[0]);
    expect(computeMastery(browsing,1200).kp('1.4').uniqueProblems).toBe(0);
    expect(replay(browsing,'2026-12-20').problems.size).toBe(0);
    expect(parseImport(exportJson(events))).toEqual(events);
  });
  it('开考固定三类见题情况，后来补到的浏览记录不改报告',()=>{
    const event=start('strict');if(event.action!=='start')throw new Error('开始事件');
    const events:TrainerEvent[]=[{...event,items:event.items.map((i,n)=>({...i,seenBefore:n<2,familiarity:n===0?'practiced':n===1?'seen':'new'}))}];
    const first=mockResult(mockSessions(events)[0],events);
    expect(first).toMatchObject({fresh:15,seenOnly:1,practiced:1});
    events.push({id:'late-seen',kind:'exposure',t:500,problemId:event.items[2].problemId});
    expect(mockResult(mockSessions(events)[0],events)).toMatchObject({fresh:15,seenOnly:1,practiced:1});
    expect(readEvent({...events[0],items:[{...event.items[0],familiarity:'invalid'}]})).toBeNull();
    expect(parseImport(exportJson(events))).toEqual([events[1],events[0]]);
  });
  it('原卷使用独立编号，结束后重练和后补的同卷旧时间记录都不能改分',()=>{
    const events:TrainerEvent[]=[start('practice'),attempt('wrong',2000,0)];
    const session=mockSessions(events)[0];expect(validMockSession(session)).toBe(true);
    events.push({...finishExam(session,events,3000),id:'finished',t:3000});
    const initial=mockResult(mockSessions(events)[0],events);
    expect(initial.score).toBe(0);expect(initial.done).toBe(1);
    const later=[...events,attempt('daily',4000,3,'daily'),attempt('same-exam',4500,3),attempt('late-sync',2500,3)];
    expect(mockResult(mockSessions(later)[0],later).score).toBe(0);
    expect(mockResult(mockSessions(later)[0],later).rows[0].attempt?.id).toBe('wrong');
    expect(parseImport(exportJson(events))).toEqual(events);
  });
  it('严格卷保存跳题、未完成与首次作答，超过deadline的输入不计入',()=>{
    const events:TrainerEvent[]=[start('strict'),{id:'answer',kind:'exam',examId:'paper-test',t:2000,action:'answer',answer:{problemId:'zt2026-1-1',status:'answered',text:'独立推导',sec:20}},
      {id:'skip',kind:'exam',examId:'paper-test',t:3000,action:'answer',answer:{problemId:'zt2026-1-2',status:'skipped',text:'',sec:10}},
      {id:'late',kind:'exam',examId:'paper-test',t:62000,action:'answer',answer:{problemId:'zt2026-1-1',status:'answered',text:'超时修改',sec:61}}];
    const session=mockSessions(events)[0];expect(examDeadline(session)).toBe(61000);
    const end={...finishExam(session,events,65000),id:'end',t:65000};events.push(end);
    expect(end.reason).toBe('timeout');expect(end.endedAt).toBe(61000);
    const result=mockResult(mockSessions(events)[0],events);
    expect(result).toMatchObject({done:1,skipped:1,unanswered:16,pending:1,fresh:16,score:0});
    expect(result.rows[0].answer?.text).toBe('独立推导');
    expect(mockResult(mockSessions(parseImport(exportJson(events)))[0],events).rows[0].answer?.text).toBe('独立推导');
  });
  it('交卷后统一评分，后续重练或再次评分不修改考试成绩，学习调度只接收一次',()=>{
    const events:TrainerEvent[]=[start('strict'),{id:'answer',kind:'exam',examId:'paper-test',t:2000,action:'answer',answer:{problemId:'zt2026-1-1',status:'answered',text:'纸上原稿',sec:20}}];
    events.push({...finishExam(mockSessions(events)[0],events,3000),id:'end',t:3000});
    events.push({id:'assessment',kind:'exam',examId:'paper-test',t:4000,action:'grade',problemId:'zt2026-1-1',attempt:{...attempt('graded-once',3000,2),score:{earned:3,max:5,basis:'reference'}}});
    expect(mockResult(mockSessions(events)[0],events)).toMatchObject({score:3,pending:0,graded:1});
    events.push(attempt('daily',5000,3,'daily'),{id:'grade-again',kind:'exam',examId:'paper-test',t:6000,action:'grade',problemId:'zt2026-1-1',attempt:attempt('graded-again',3000,3)});
    expect(mockResult(mockSessions(events)[0],events).score).toBe(3);
    expect(learningEvents(events).filter(e=>e.kind==='attempt'&&e.examId==='paper-test')).toHaveLength(1);
    const restored=parseImport(exportJson(events));
    expect(mockResult(mockSessions(restored)[0],restored).score).toBe(3);
  });
  it('拒绝无效嵌套评分、坏快照、照片内容及超过满分的分步分数',()=>{
    expect(readEvent({...attempt('bad',1000,3),score:{earned:6,max:5,basis:'reference'}})).toBeNull();
    expect(readEvent({id:'image',kind:'exam',examId:'x',t:1000,action:'answer',answer:{problemId:'p',status:'draft',text:'data:image/png;base64,AA',sec:1}})).toBeNull();
    expect(readEvent({id:'bad-end',kind:'exam',examId:'x',t:1000,action:'finish',endedAt:2000})).toBeNull();
    expect(readEvent({id:'bad-grade',kind:'exam',examId:'x',t:1000,action:'grade',problemId:'p',attempt:attempt('bad',900,3)})).toBeNull();
  });
});
