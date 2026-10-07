import { useEffect, useState } from 'react';
import { paperById } from '../content';
import { mockResult, mockSessions, validMockSession } from '../engine/mock';
import { GRADE_LABELS } from '../types';
import { kpLabel, sourceLabel } from '../format';
import { app, setProblemList, useEvents } from '../state';
import { StudyNav } from '../components/StudyNav';
import { MockPrint } from '../components/MockPrint';
import { ProblemPage } from './ProblemPage';

export function MockExamPage({id}:{id:string}) {
  const events=useEvents(),session=mockSessions(events).find(s=>s.id===id);
  const [clock,setClock]=useState(Date.now()), [error,setError]=useState('');
  useEffect(()=>{const t=window.setInterval(()=>setClock(Date.now()),1000);return ()=>window.clearInterval(t);},[]);
  useEffect(()=>{if(session)setProblemList(session.items.map(i=>i.problemId));},[id,!!session]);
  if (!session) return <div><StudyNav active="mock"/><section className="card">正在读取这套模拟卷。若它来自另一设备，请连接同一云同步口令后稍候。<a href="#/mock">返回组卷</a></section></div>;
  if (!validMockSession(session)) return <section className="card">模拟卷题目与当前题库不匹配，原进度已保留。<a href="#/mock">返回组卷</a></section>;
  const result=mockResult(session,events), current=result.rows[session.current]??result.rows[0];
  const elapsed=Math.max(0,Math.floor(((session.finished??clock)-session.start)/1000)),left=Math.max(0,session.minutes*60-elapsed);
  const mmss=(sec:number)=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  const record=(action:'navigate'|'finish',n?:number)=> {
    try {app.record(action==='finish'?{kind:'exam',examId:id,action}:{kind:'exam',examId:id,action,current:n!});}
    catch {setError('未能保存本次操作，请检查浏览器存储空间。');}
  };
  return <div><StudyNav active="mock"/>
    <section className="card"><div className="card-head"><h2>{session.title}</h2>{!session.finished&&<button onClick={()=>record('finish')}>结束并估分</button>}</div><p className="muted small">模板：{paperById.get(session.template)?.title} · 已记录 {result.done}/{session.items.length} 题</p><div className="mock-timer"><b>{session.finished?'总用时':'剩余'} {mmss(session.finished?elapsed:left)}</b><span>自评 {Math.round(result.score*10)/10} / {result.total} 分</span></div>
      {!left&&!session.finished&&<p className="hint">建议时间已到，可完成当前记录后结束并估分。</p>}{error&&<p role="alert" className="hint">{error}</p>}
      <p className="muted small">计时练习可逐题对照答案评分，也可打印空白卷线下作答。估分按自评档位计算。</p>
      {!session.finished&&<div className="exam-progress">{result.rows.map((r,n)=><button key={r.item.no} aria-label={`模拟卷第 ${n+1} 单元`} className={n===session.current?'primary':''} onClick={()=>record('navigate',n)}>{r.attempt?'✓':n+1}</button>)}</div>}
    </section>
    {session.finished?<section className="card"><h2>本次模拟卷结果</h2><p>完成 {result.done} / {session.items.length} 个作答单元，自评估分 <b>{Math.round(result.score*10)/10} / {result.total}</b> 分。</p><p className="muted small">不会 0%、部分对 30%、大部分对 70%、全对 100%；未作答题记 0 分。只计算这套卷结束前的记录，日常练习和其他模拟卷的评分不会混入。</p><ol className="mock-preview">{result.rows.map(r=><li key={r.item.no}><div className="card-head"><b>{r.item.no} · {r.item.score}分</b><span className={`badge ${r.attempt?.grade===3?'good':'warn'}`}>{r.attempt?GRADE_LABELS[r.attempt.grade]:'未作答'}</span></div><p className="small">{r.problem?.kps.map(kpLabel).join(' · ')}</p>{r.problem&&<a className="small" href={`#/p/${r.problem.id}`}>{sourceLabel(r.problem)} · 查看解答 →</a>}</li>)}</ol><div className="actions"><a className="button primary" href="#/mock">再组一卷</a><a className="button" href="#/mistakes">去错题本</a><button onClick={()=>window.print()}>打印本卷</button></div></section>:<><section className="card mock-slot"><b>本卷题位：{current.item.no}（{current.item.score}分）</b><span className={`badge ${current.item.match==='original'?'warn':''}`}>{current.item.match==='original'?'沿用模板原题':'替换题'}</span><p className="muted small">分值由中北模板题位决定，题干下方保留实际题源。</p></section><ProblemPage key={`${id}-${current.item.problemId}`} id={current.item.problemId} exam={{id,score:current.item.score,attempt:current.attempt}} onNavigate={target=>{const n=session.items.findIndex(i=>i.problemId===target);if(n>=0)record('navigate',n);}} onComplete={()=>record('finish')}/></>}
    <MockPrint title={session.title} items={session.items}/>
  </div>;
}
