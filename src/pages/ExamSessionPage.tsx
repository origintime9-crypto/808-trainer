import { useEffect, useRef, useState } from 'react';
import { paperById } from '../content';
import { examDeadline, finishExam, mockResult, mockSessions, validMockSession } from '../engine/mock';
import { GRADE_LABELS, type AttemptEvent, type ExamAnswer } from '../types';
import { kpLabel, sourceLabel } from '../format';
import { app, setProblemList, useEvents } from '../state';
import { newId } from '../engine/store';
import { SCORE_COEF } from '../engine/paper';
import { StudyNav } from '../components/StudyNav';
import { MockPrint } from '../components/MockPrint';
import { StrictQuestion } from '../components/StrictQuestion';
import { ProblemPage } from './ProblemPage';

const mmss=(sec:number)=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

export function ExamSessionPage({id}:{id:string}) {
  const events=useEvents(), session=mockSessions(events).find(s=>s.id===id);
  const [clock,setClock]=useState(Date.now()), [error,setError]=useState(''), [grading,setGrading]=useState<string|null>(null);
  const pending=useRef<{answer:ExamAnswer;t:number}|null>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const finishRef=useRef(false);
  const flush=()=>{
    if(!pending.current)return;
    const s=mockSessions(app.events()).find(s=>s.id===id),draft=pending.current;
    if(!s||s.finished!==undefined||draft.t>=examDeadline(s)){pending.current=null;return;}
    app.record({kind:'exam',examId:id,action:'answer',answer:draft.answer},draft.t);
    pending.current=null;clearTimeout(timer.current);
  };
  const finish=()=>{
    try {
      flush();
      const s=mockSessions(app.events()).find(s=>s.id===id);
      if(!s||s.finished!==undefined)return;
      app.record(finishExam(s,app.events(),Date.now()));setError('');
    } catch {finishRef.current=false;setError('未能保存交卷，请检查存储空间后点击重试交卷。作答暂留本机。');}
  };
  useEffect(()=>{
    const tick=()=>setClock(Date.now()),t=window.setInterval(tick,1000);
    document.addEventListener('visibilitychange',tick);
    return()=>{window.clearInterval(t);document.removeEventListener('visibilitychange',tick);};
  },[]);
  useEffect(()=>{if(session)setProblemList(session.items.map(i=>i.problemId));},[id,!!session]);
  useEffect(()=>{
    if(session?.mode==='strict'&&session.finished===undefined&&clock>=examDeadline(session)&&!finishRef.current){finishRef.current=true;finish();}
  },[clock,session?.finished,id]);
  useEffect(()=>{
    const persist=()=>{try{flush();}catch{setError('作答未能保存，请检查浏览器存储空间。');}};
    window.addEventListener('pagehide',persist);
    return()=>{window.removeEventListener('pagehide',persist);clearTimeout(timer.current);persist();};
  },[id]);
  if(!session)return <div><StudyNav active="mock"/><section className="card">正在读取这套卷。若来自另一设备，请先获取同步进度。<a href="#/mock">返回组卷</a></section></div>;
  if(!validMockSession(session))return <section className="card">卷面与当前题库不匹配，原进度已保留。<a href="#/mock">返回组卷</a></section>;
  const result=mockResult(session,events),current=result.rows[session.current]??result.rows[0];
  const finished=session.finished!==undefined,strict=session.mode==='strict',expired=strict&&clock>=examDeadline(session);
  const elapsed=Math.max(0,Math.floor(((session.finished??clock)-session.start)/1000)),left=Math.max(0,session.minutes*60-elapsed);
  const navigate=(n:number)=>{try{flush();app.record({kind:'exam',examId:id,action:'navigate',current:n});}catch{setError('未能保存作答或题位，请检查本机存储。');}};
  const draft=(answer:ExamAnswer)=>{
    if(finished||Date.now()>=examDeadline(session))return;
    pending.current={answer,t:Date.now()};clearTimeout(timer.current);
    timer.current=setTimeout(()=>{try{flush();setError('');}catch{setError('自动保存失败，请检查本机存储。');}},600);
  };
  const gradeRow=result.rows.find(r=>r.item.problemId===grading);
  const assess=(a:Omit<AttemptEvent,'id'|'t'>)=>{
    const r=result.rows.find(r=>r.item.problemId===a.problemId);
    if(!finished||!strict||!r?.answer||r.attempt)throw new Error('该提交已评分或没有作答。');
    app.record({kind:'exam',examId:id,action:'grade',problemId:a.problemId,attempt:{...a,id:newId(),t:session.finished!,
      workMode:'independent',hintsUsed:false,...(r.item.score>0?{score:r.answer.choice!==undefined?{earned:r.answer.choice===r.problem?.answerKey?r.item.score:0,max:r.item.score,basis:'reference'}:a.score??{earned:r.item.score*SCORE_COEF[a.grade],max:r.item.score,basis:'reference'}}:{})}});
    setGrading(null);
  };
  return <div>{!strict||finished?<StudyNav active="mock"/>:null}
    <section className="card"><div className="card-head"><h2>{session.title}</h2>{!finished&&<button onClick={finish}>{strict?'交卷':'结束并估分'}</button>}</div>
      <p className="muted small">{paperById.get(session.template)?.title} · {strict?'严格模考':'逐题练习'} · 已{strict?'完成':'记录'} {result.done}/{session.items.length} 题</p>
      <div className="mock-timer"><b>{finished?'总用时':'剩余'} {mmss(finished?elapsed:left)}</b>{(!strict||finished)&&<span>{result.pending?'已评分':'自评'} {Math.round(result.score*10)/10} / {result.total} 分</span>}</div>
      {!strict&&!finished&&<p className="muted small">已做 {result.done} / {session.items.length} 个单元 · 本次估分 {Math.round(result.score*10)/10}</p>}
      {strict&&!finished&&<p className="muted small">考试期间隐藏考点、方法、笔记、解析和辅助批改；截止自动交卷。交卷后统一对照原作答评分。</p>}
      {error&&<p className="hint" role="alert">{error} {expired&&!finished&&<button onClick={finish}>重试交卷</button>}</p>}
      {!finished&&<div className="exam-progress">{result.rows.map((r,n)=><button key={r.item.no} aria-label={`模拟卷第 ${n+1} 单元`} disabled={expired} className={n===session.current?'primary':''} onClick={()=>navigate(n)}>{r.attempt||r.answer?.status==='answered'?'✓':r.answer?.status==='skipped'?'跳':r.answer?'…':n+1}</button>)}</div>}
    </section>
    {finished?<>
      <section className="card exam-report" data-exam-report><h2>{session.origin==='paper'?'本次整卷结果':'本次模拟卷结果'}</h2>
        <p>完成 {result.done} / {session.items.length} 个作答单元 · 跳题 {result.skipped} · 未完成 {result.unanswered}（含跳题） · {session.finishReason==='timeout'?'已超时自动交卷':'已主动交卷'}</p>
        <p>{result.pending?'已评分小计':'自评估分'} <b>{Math.round(result.score*10)/10} / {result.total}</b> 分{result.pending>0&&`，还有 ${result.pending} 题待评分。`}</p>
        <p>首次作答 {result.fresh} 题 · 以前练过 {session.items.length-result.fresh} 题</p>
        <p className="muted small">首次作答按开始前的本机学习记录判断，无法知道纸上或站外接触情况。{strict?'提交内容已固定，每题确认评分后保存参考得分。':'结束时已保存成绩快照。'}日常重练及后来同步的学习记录不改写本次提交；未作答计0分，缺少分值的题只记进度。</p>
        <ol className="mock-preview">{result.rows.map(r=><li key={r.item.no}>
          <div className="card-head"><b>{r.item.no} · {r.item.score||'未标'}分</b><span className="badge">{r.attempt?`${GRADE_LABELS[r.attempt.grade]} · ${Math.round(r.earned*10)/10}分`:r.answer?.status==='answered'?'待评分':r.answer?.status==='skipped'?'跳过':r.answer?'未完成草稿':'未作答'}</span></div>
          <p className="small muted">{r.problem?.kps.map(kpLabel).join(' · ')} · {r.seenBefore?'以前练过':'首次作答'}</p>
          {r.answer&&<details><summary>查看本次提交</summary><pre className="submitted-answer">{r.answer.text||'未填写文字'}{r.answer.choice!==undefined&&`\n选项：${String.fromCharCode(65+r.answer.choice)}`}</pre></details>}
          {strict&&r.answer&&r.answer.status!=='skipped'&&(r.answer.text.trim()||r.answer.choice!==undefined)&&!r.attempt&&<button className="small" onClick={()=>setGrading(r.item.problemId)}>对照原作答评分</button>}
          {r.problem&&<a className="small" href={`#/p/${r.problem.id}`}>{sourceLabel(r.problem)} · 日常重练 →</a>}
        </li>)}</ol>
        <div className="actions"><a className="button primary" href={session.origin==='paper'?`#/exam/${session.template}?new=1`:'#/mock'}>再练一卷</a><a className="button" href="#/mistakes">去错题本</a><button onClick={()=>window.print()}>打印本卷</button></div>
      </section>
      {gradeRow?.problem&&!gradeRow.attempt&&<div className="exam-assessment"><section className="card"><h2>交卷后评分 · {gradeRow.item.no}</h2><pre className="submitted-answer">{gradeRow.answer?.text}{gradeRow.answer?.choice!==undefined&&`\n选项：${String.fromCharCode(65+gradeRow.answer.choice)}`}</pre><button onClick={()=>setGrading(null)}>收起评分</button><p className="muted small">请按交卷时的纸稿或已保存作答评分。确认后固定本题参考得分。选择题按提交选项计分。</p></section><ProblemPage key={`assessment-${id}-${grading}`} id={gradeRow.item.problemId} exam={{id,score:gradeRow.item.score,locked:true,assessmentSec:gradeRow.answer?.sec,choice:gradeRow.answer?.choice,onRecord:assess}} onComplete={()=>setGrading(null)}/></div>}
    </>:!expired&&current?.problem?<>
      <section className="card mock-slot"><b>本卷题位：{current.item.no}（{current.item.score||'未标'}分）</b></section>
      {strict?<StrictQuestion key={`${id}-${current.item.problemId}`} problem={current.problem} initial={current.answer} onDraft={draft} onSave={()=>{try{flush();}catch{setError('未能保存本题作答。');}}} onSkip={answer=>{draft(answer);try{flush();if(session.current<session.items.length-1)navigate(session.current+1);}catch{setError('未能保存跳题记录。');}}}/>
        :<ProblemPage key={`${id}-${current.item.problemId}`} id={current.item.problemId} exam={{id,score:current.item.score,attempt:current.attempt}} onNavigate={target=>{const n=session.items.findIndex(i=>i.problemId===target);if(n>=0)navigate(n);}} onComplete={finish}/>}
    </>:<section className="card">考试时间已到，正在保存交卷。</section>}
    <MockPrint title={session.title} items={session.items} minutes={session.minutes}/>
  </div>;
}
