import { useState } from 'react';
import { paperById } from '../content';
import { paperProblems } from '../engine/paper';
import { mockResult, mockSessions, validMockSession } from '../engine/mock';
import { newId } from '../engine/store';
import { app, useEvents } from '../state';
import { go } from '../format';
import { encounterIndex } from '../engine/encounters';

export function PaperExamPage({paper}:{paper:string}) {
  const events=useEvents(),info=paperById.get(paper),list=paperProblems(paper);
  const [mode,setMode]=useState<'strict'|'practice'>('strict'),[minutes,setMinutes]=useState(180),[error,setError]=useState('');
  const sessions=mockSessions(events).filter(s=>s.origin==='paper'&&s.template===paper&&validMockSession(s));
  const subtotal=list.reduce((v,p)=>v+(p.sources.find(s=>s.paper===paper)?.score??0),0);
  const missing=list.some(p=>p.sources.find(s=>s.paper===paper)?.score===undefined);
  const legacy=(()=>{try{return JSON.parse(sessionStorage.getItem('trainer808.exam.v1')??'null')?.paper===paper;}catch{return false;}})();
  const start=()=>{
    if(!list.length)return;
    try {
      const seen=encounterIndex(events,Date.now()),examId=newId();
      app.record({kind:'exam',examId,action:'start',title:info!.title+' · 整卷',template:paper,origin:'paper',mode,minutes,
        items:list.map(p=>{const s=p.sources.find(s=>s.paper===paper)!;return {problemId:p.id,referenceId:p.id,no:s.no,score:s.score??0,match:'original',seenBefore:seen.has(p.id),familiarity:seen.get(p.id)??'new'};})});
      go(`#/mock/${examId}`);
    }catch{setError('未能保存这次整卷，请检查本机存储空间。');}
  };
  if(!info||!list.length)return <section className="card">这套卷尚未录入。<a href="#/practice">返回题库</a></section>;
  return <div><section className="card"><h2>{info.title} · 整卷练习</h2><p>{list.length} 个作答单元，已标明分值合计 {subtotal} 分{info.totalScore&&`，卷面标注 ${info.totalScore} 分`}。</p>
    <div className="filters"><label>训练模式<select value={mode} onChange={e=>setMode(e.target.value as 'strict'|'practice')}><option value="strict">严格模考：交卷后统一评分</option><option value="practice">逐题练习：随做随订正</option></select></label><label>考试时长（分钟）<input type="number" min={1} max={360} value={minutes} onChange={e=>setMinutes(Math.max(1,Math.min(360,Math.round(Number(e.target.value)||1))))}/></label></div>
    <p className="muted small">每次整卷使用独立编号，结束时固定作答和成绩。后续练习不会改变历史成绩。{missing&&'未标明分值的题仅记录练习进度。'}{info.totalScore&&subtotal!==info.totalScore&&`小题分值合计${subtotal}分，与卷面不同，按已核对的小题分值计分。`}</p>
    {legacy&&<p className="hint">检测到旧版整卷进度。旧记录没有独立考试编号和结束时间，无法可靠恢复整卷成绩；原日常作答仍保留，请开始一次新的整卷。</p>}
    {error&&<p className="hint" role="alert">{error}</p>}<button className="primary" onClick={start}>开始整卷练习</button>
  </section>
    {!!sessions.length&&<section className="card"><h2>这套卷的历史考试</h2><ul className="rows">{sessions.map(s=>{const r=mockResult(s,events);return <li key={s.id}><a href={`#/mock/${s.id}`}><b>{new Date(s.start).toLocaleString('zh-CN')} · {s.mode==='strict'?'严格模考':'逐题练习'} · {s.finished!==undefined?'查看结果':'继续作答'}</b><span className="muted small">{r.done}/{s.items.length} 单元 · {r.pending?'待评分':`${Math.round(r.score*10)/10}/${r.total}分`}</span></a></li>;})}</ul></section>}
  </div>;
}
