import { describe, expect, it } from 'vitest';
import { buildGradeRequest } from '../src/ai/grade';
import { knowledge, kpPapers, paperById, problemById, problems, realPaperCount } from '../src/content';
import { domains, topics, matchesCategory } from '../src/content/taxonomy';
import { readEvent, readEvents } from '../src/engine/events';
import { generateMock, mockResult, mockSessions, selectedPapers, templatePapers, validMockSession } from '../src/engine/mock';
import { paperProblems } from '../src/engine/paper';
import { sourceLabel } from '../src/format';
import { exportJson, mergeEvents, parseImport } from '../src/engine/store';
import type { ExamEvent, TrainerEvent } from '../src/types';

const start=(id='mock-1',t=1000):ExamEvent=>({id:'start-'+id,t,kind:'exam',examId:id,action:'start',title:'验证模拟卷',template:'zt2026',minutes:180,items:generateMock('zt2026','mixed',id)});
describe('知识分类与外校题源',()=> {
  it('每个已有知识点恰好归属一个专题，跨领域题仍可从两个方向找到',()=> {
    const ids=topics.flatMap(t=>t.kps);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(knowledge.map(k=>k.id).sort());
    for(const t of topics)expect(domains.some(d=>d.id===t.domain)).toBe(true);
    expect(matchesCategory(['2.2','4.5'],'time')).toBe(true);
    expect(matchesCategory(['2.2','4.5'],'laplace','s-system')).toBe(true);
    expect(matchesCategory(['3.4'],'frequency','filter')).toBe(false);
    expect(problems.find(p=>p.sources.some(s=>s.paper==='tk-exam-14'&&s.no==='二1(2)'))?.kps).toContain('3.4');
    expect(problemById.get('tk-exam-15-1-9')?.kps).toContain('3.1');
  });
  it('三份整理卷33个来源，不虚造原分值，外校出现频次不混入中北重点',()=> {
    expect(selectedPapers).toHaveLength(3);
    const external=problems.filter(p=>p.sources.some(s=>paperById.get(s.paper)?.school));
    expect(external).toHaveLength(33);
    expect(external.flatMap(p=>p.sources).filter(s=>paperById.get(s.paper)?.school).every(s=>s.score===undefined)).toBe(true);
    expect(problemById.has('ext-xaut2024-3-4')).toBe(false);
    expect(problemById.get('tk-key-9')?.sources.some(s=>s.paper==='ext-xaut2024'&&s.no==='三4')).toBe(true);
    expect(sourceLabel(problemById.get('ext-xaut2024-1-1')!)).toContain('西安理工');
    expect(sourceLabel(problemById.get('ext-sau2024-1-5')!)).toContain('沈航');
    expect(realPaperCount).toBe(7);
    for(const ids of kpPapers.values())for(const id of ids)expect(paperById.get(id)?.school).toBeUndefined();
    expect(problemById.get('ext-sau2024-1-1')?.verified).toBe('uncertain');
  });
});
describe('按真实卷面组卷',()=> {
  it('2026模板保留10道大题、17单元与150分，2016缺1分不虚补',()=> {
    expect(templatePapers.map(p=>p.id)).toContain('zt2026');
    expect(templatePapers.map(p=>p.id)).not.toContain('zt2016');
    const items=generateMock('zt2026','mixed','selected-a');
    expect(items).toHaveLength(17);
    expect(new Set(items.map(i=>i.no[0])).size).toBe(10);
    expect(items.reduce((v,i)=>v+i.score,0)).toBe(150);
    expect(items.map(i=>[i.referenceId,i.no,i.score])).toEqual(paperProblems('zt2026').map(p=>[p.id,p.sources.find(s=>s.paper==='zt2026')!.no,p.sources.find(s=>s.paper==='zt2026')!.score]));
  });
  it('不同种子与取题范围均不重复、不混连续离散、不挑存疑，保留原题时如实标明',()=> {
    for (const template of templatePapers)for (const pool of ['mixed','selected','local'] as const)for (const seed of ['a','b','c','d','e']) {
      const items=generateMock(template.id,pool,seed);
      expect(new Set(items.map(i=>i.problemId)).size).toBe(items.length);
      for(const i of items) {
        const p=problemById.get(i.problemId)!,ref=problemById.get(i.referenceId)!;
        expect(p.verified).not.toBe('uncertain');
        expect(p.type).toBe(ref.type);
        expect(p.kps.some(k=>ref.kps.includes(k))).toBe(true);
        expect(p.kps.some(k=>/^[67]\./.test(k))).toBe(ref.kps.some(k=>/^[67]\./.test(k)));
        expect(i.match==='original').toBe(i.problemId===i.referenceId);
        if(pool==='selected'&&i.match!=='original')expect(p.sources.some(s=>paperById.get(s.paper)?.school)).toBe(true);
        if(pool==='local')expect(p.sources.some(s=>paperById.get(s.paper)?.school)).toBe(false);
      }
    }
  });
  it('选定模板和种子可复现，三套预览有差异且均实际使用外校题',()=> {
    const variants=['a','b','c'].map(s=>generateMock('zt2026','mixed','selected-'+s));
    expect(generateMock('zt2026','mixed','selected-a')).toEqual(variants[0]);
    expect(new Set(variants.map(v=>v.map(i=>i.problemId).join(','))).size).toBe(3);
    for (const items of variants)expect(items.filter(i=>problemById.get(i.problemId)!.sources.some(s=>paperById.get(s.paper)?.school)).length).toBeGreaterThanOrEqual(3);
  });
  it('模版分值用于AI批改，原题的来源与分值保持原样',()=> {
    const p=problemById.get('ext-xaut2024-1-5')!;
    const before=JSON.stringify(p);
    const request=buildGradeRequest(p,'gemini-test',['data:image/jpeg;base64,AA=='],5);
    expect(request.response_format?.json_schema.schema.properties.score?.maximum).toBe(5);
    expect(request.messages[1].content[0]).toMatchObject({text:expect.stringContaining('模拟卷题位满分 5 分')});
    expect(JSON.stringify(p)).toBe(before);
  });
});
describe('模拟卷保存、计分与同步协议',()=> {
  it('导航和结束能从乱序多设备事件还原，导出再导入保留完整卷面',()=> {
    const events:TrainerEvent[]=[start(),{id:'nav',t:1200,kind:'exam',examId:'mock-1',action:'navigate',current:4},{id:'finish',t:1500,kind:'exam',examId:'mock-1',action:'finish'}];
    const s=mockSessions(parseImport(exportJson(mergeEvents(events.slice(0,1),events.slice(1)))))[0];
    expect(s.current).toBe(4);expect(s.finished).toBe(1500);expect(validMockSession(s)).toBe(true);
    expect(mockSessions([...events].reverse())[0]).toEqual(s);
    expect(mockSessions([...events,{id:'late',t:1600,kind:'exam',examId:'mock-1',action:'navigate',current:8}])[0].current).toBe(4);
  });
  it('仅本卷结束前的作答计分，重评分取最后一次，旧练习与其他卷不能串分',()=> {
    const config=start(),a=config.action==='start'?config.items[0].problemId:'';
    const attempt=(id:string,t:number,grade:0|1|2|3,examId?:string):TrainerEvent=>({id,t,kind:'attempt',problemId:a,sec:5,grade,tags:[],...(examId?{examId}:{})});
    const events:TrainerEvent[]=[config,attempt('daily',1100,3),attempt('other',1150,3,'another'),attempt('old',900,3,'mock-1'),attempt('initial',1200,0,'mock-1'),attempt('corrected',1300,2,'mock-1'),{id:'finished',t:1400,kind:'exam',examId:'mock-1',action:'finish'},attempt('after-end',1450,3,'mock-1')];
    const r=mockResult(mockSessions(events)[0],events);
    expect(r.done).toBe(1);expect(r.score).toBe(3.5);expect(r.total).toBe(150);
    expect(r.rows[0].attempt?.id).toBe('corrected');
  });
  it('上传字段只保留卷面和评分，拒绝重复题、坏分值及无效会话',()=> {
    const valid=start();
    expect(readEvent({...valid,photo:'private',secret:'private'})).toEqual(valid);
    if(valid.action!=='start')throw new Error();
    expect(readEvent({...valid,items:[valid.items[0],valid.items[0]]})).toBeNull();
    expect(readEvent({...valid,items:[{...valid.items[0],score:NaN}]})).toBeNull();
    expect(readEvent({id:'bad',t:1200,kind:'attempt',problemId:'zt2026-10',grade:3,tags:[],sec:10,examId:42})).toBeNull();
    expect(()=>readEvents([valid,{id:'bad',t:1500,kind:'exam',examId:'mock-1',action:'navigate',current:-1}])).toThrow();
  });
});
