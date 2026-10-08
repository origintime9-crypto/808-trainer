import { useMemo, useState } from 'react';
import { paperById, problemById } from '../content';
import { kpLabel, sourceLabel, go } from '../format';
import { generateMock, mockResult, mockSessions, selectedPapers, templatePapers, validMockSession, type MockPool } from '../engine/mock';
import { newId } from '../engine/store';
import { app, useEvents } from '../state';
import { StudyNav } from '../components/StudyNav';
import { MockPrint } from '../components/MockPrint';
import { useDerived } from '../state';

export function MockPage() {
  const events=useEvents();
  const {mi}=useDerived();
  const [mode,setMode]=useState<'standard'|'adaptive'>(()=>new URLSearchParams(window.location.hash.split('?')[1]??'').get('mode')==='adaptive'?'adaptive':'standard');
  const [template,setTemplate]=useState('zt2026'), [pool,setPool]=useState<MockPool>('mixed'), [seed,setSeed]=useState('selected-a'), [name,setName]=useState('精选模拟卷 A'), [error,setError]=useState('');
  const preview=useMemo(()=> {
    try {return {items:generateMock(template,pool,seed,new Set(events.filter(e=>e.kind==='attempt').map(e=>e.problemId)),mode==='adaptive'?mi:undefined),error:''};}
    catch(e) {return {items:[],error:(e as Error).message};}
  },[template,pool,seed,events,mode,mi]);
  const sessions=mockSessions(events).filter(validMockSession), original=preview.items.filter(i=>i.match==='original').length;
  const count=new Map<string,number>();
  for (const i of preview.items) {
    const p=problemById.get(i.problemId)!;
    const source=p.sources.find(s=>paperById.get(s.paper)?.school)??p.sources[0];
    count.set(source.paper,(count.get(source.paper)??0)+1);
  }
  function start() {
    if (!preview.items.length) return;
    try {
      const examId=newId();
      app.record({kind:'exam',examId,action:'start',title:mode==='adaptive'?'808补强测评 · '+name:name,template,minutes:180,items:preview.items});
      go(`#/mock/${examId}`);
    } catch {setError('未能保存模拟卷，请检查本机存储或先导出备份。');}
  }
  return <div><StudyNav active="mock"/>
    <section className="card"><h2>按真题结构组模拟卷</h2><p className="muted">保留中北原卷的题号、题型与分值，按考点、解题方法和作答量匹配题目。整卷不重复选同一道题，存疑题默认排除。</p>
      <label className="mock-mode">组卷目标<select value={mode} onChange={e=>setMode(e.target.value as 'standard'|'adaptive')}><option value="standard">标准模拟卷</option><option value="adaptive">808薄弱考点补强</option></select></label>
      {mode==='adaptive'&&<p className="hint">在中北原卷结构内，优先挑选薄弱、临近遗忘和待测的808考点。题位数量与分值不变；若只选外校，取题仍受三份精选范围限制。</p>}
      <div className="filters"><label>真题模板<select value={template} onChange={e=>setTemplate(e.target.value)}>{templatePapers.map(p=><option value={p.id} key={p.id}>{p.title} · 150分</option>)}</select></label><label>取题范围<select value={pool} onChange={e=>setPool(e.target.value as MockPool)}><option value="mixed">精选外校 + 中北题库</option><option value="selected">优先用三份外校精选</option><option value="local">中北真题与课程题库</option></select></label></div>
      <div className="actions">{['A','B','C'].map((v,i)=><button key={v} className={seed===`selected-${v.toLowerCase()}`?'primary':''} onClick={()=>{setSeed(`selected-${v.toLowerCase()}`);setName(`精选模拟卷 ${v}`);}} aria-label={`选择精选模拟卷 ${v}`}>精选 {i+1}</button>)}<button onClick={()=>{setSeed(newId());setName('随机模拟卷');}}>再换一套</button></div>
      <p className="muted small">“优先外校”仅从这三份精选选替换题，题位不足时沿用对应中北原题。原题未标明的分值不会补写到题源。2016 卷小题合计 149 分、回忆卷缺独立分值，暂未列作 150 分模板。</p>
    </section>
    <section className="card"><h2>本次选取的三份题源</h2><p className="muted small">难度为对照中北 2026 题面的人工判断；链接用于核对考试科目或范围，学校没有发布“与中北难度相同”的结论。</p><ul className="source-cards">{selectedPapers.map(p=><li key={p.id}><b>{p.title}</b><p className="muted small">{p.selection}</p><div className="actions"><a href={`#/practice?paper=${p.id}`}>查看精选题 →</a><a className="small" href={p.referenceUrl} target="_blank" rel="noreferrer">学校资料 ↗</a></div></li>)}</ul></section>
    <section className="card"><div className="card-head"><h2>{name} · 组卷预览</h2><span className="badge">{preview.items.reduce((v,i)=>v+i.score,0)}分</span></div>
      {(error||preview.error)&&<p role="alert" className="hint">{error||preview.error}</p>}
      {!!preview.items.length&&<><p>{preview.items.length} 个作答单元 · 建议 180 分钟 · {original?`含 ${original} 个沿用原题的题位`:'所有题位已替换'}</p><div className="chips">{[...count].map(([id,n])=><span className="chip" key={id}>{paperById.get(id)?.title} · {n}题</span>)}</div>
        <ol className="mock-preview">{preview.items.map(i=> {
          const p=problemById.get(i.problemId)!;
          return <li key={i.no}><div className="card-head"><b>{i.no} · {p.type} · {i.score}分</b><span className={`badge ${i.match==='original'?'warn':''}`}>{i.match==='original'?'沿用原题':i.match==='pattern'?'同解题方法':'同知识点'}</span></div><p className="small muted">{p.kps.map(kpLabel).join(' · ')}</p><p className="small">取自：{sourceLabel(p)}</p></li>;
        })}</ol><div className="actions"><button className="primary" onClick={start}>保存并开始模拟卷</button><button onClick={()=>window.print()}>打印空白卷</button></div><p className="muted small">开始后会保存这套卷的题目顺序，刷新或返回仍可继续。已连接云同步时，模拟卷和作答进度会自动上传。</p></>}
    </section>
    {!!sessions.length&&<section className="card"><h2>我的模拟卷</h2><ul className="rows">{sessions.map(s=> {
      const r=mockResult(s,events);
      return <li key={s.id}><a href={`#/mock/${s.id}`}><b>{s.title} · {s.finished?'查看结果':'继续作答'}</b><span className="muted small">{new Date(s.start).toLocaleDateString('zh-CN')} · {r.done}/{s.items.length}题 · 自评 {Math.round(r.score*10)/10}/{r.total}分</span></a></li>;
    })}</ul></section>}
    <MockPrint title={name} items={preview.items}/>
  </div>;
}
