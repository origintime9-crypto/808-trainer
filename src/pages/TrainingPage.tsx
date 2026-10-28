import { useRef, useState } from 'react';
import { problemById } from '../content';
import { problemFamily } from '../content/families';
import { skillById, skillTrainings, type SkillTraining } from '../content/training';
import { trainingCandidates } from '../engine/training';
import { Md } from '../components/Markdown';
import { StudyNav } from '../components/StudyNav';
import { app, useEvents, useSettings } from '../state';
import { GRADE_LABELS, type Grade, type Problem } from '../types';
import { go } from '../format';

function Exercise({problem:p,skill,next,onNext}:{problem:Problem;skill:SkillTraining;next?:string;onNext:()=>void}) {
  const [answers,setAnswers]=useState<Record<string,string>>({}),[hint,setHint]=useState(false),[solution,setSolution]=useState(false);
  const [grade,setGrade]=useState<Grade|null>(null),[errors,setErrors]=useState<string[]>([]),[saved,setSaved]=useState(false),[error,setError]=useState('');
  const start=useRef(Date.now()),complete=skill.checkpoints.every(c=>answers[c.id]?.trim());
  const record=()=>{
    if(grade===null||saved)return;
    try {app.record({kind:'attempt',problemId:p.id,grade,tags:[],sec:Math.min(31536000,Math.max(0,Math.floor((Date.now()-start.current)/1000))),workMode:'reference',hintsUsed:true,skillErrors:errors});setSaved(true);setError('');}
    catch{setError('未能保存训练，请检查浏览器存储空间。');}
  };
  return <>
    <section className="card"><h2>{skill.id==='method'?'先判断解法，再计算':'先填关键步骤，再看提示'}</h2><Md>{p.stem}</Md>{p.figures?.map(f=><img className="figure" alt="题图" key={f} src={`${import.meta.env.BASE_URL}${f}`}/>)}
      {p.options?.map((o,i)=><p key={i}>{String.fromCharCode(65+i)}. <Md inline>{o}</Md></p>)}
      {skill.checkpoints.map(c=><label className="answer-input" key={c.id}>{c.prompt}<textarea value={answers[c.id]??''} maxLength={4000} disabled={hint} onChange={e=>setAnswers({...answers,[c.id]:e.target.value})}/></label>)}
      {!hint&&<button className="primary" disabled={!complete} onClick={()=>setHint(true)}>查看分步提示</button>}
      {hint&&<><ol className="training-hints">{skill.checkpoints.map(c=><li key={c.id}>{c.hint}</li>)}</ol><button onClick={()=>setSolution(true)}>查看本题完整解析</button></>}
    </section>
    {solution&&<section className="card answer"><h3>本题解答</h3><Md>{p.answer}</Md><Md>{p.solution}</Md><p className="muted small">将自己预先填写的条件与原稿逐项对照，记录仍会丢分的步骤。</p>
      {!saved&&<><div className="tag-buttons">{skill.errors.map(e=><label className="check-label" key={e.id}><input type="checkbox" checked={errors.includes(e.id)} onChange={v=>setErrors(v.target.checked?[...errors,e.id]:errors.filter(id=>id!==e.id))}/>{e.label}</label>)}</div>
        <div className="grade-buttons">{GRADE_LABELS.map((label,n)=><button key={n} className={`grade g${n} ${grade===n?'on':''}`} onClick={()=>setGrade(n as Grade)}>{label}</button>)}</div><button className="primary" disabled={grade===null} onClick={record}>记录本次训练</button></>}
      {saved&&<p className="hint">已记录为有提示训练，安排后续复习。本次不增加独立作答证据；请换一个家族闭卷作答，并在另一天复测。</p>}
      {error&&<p className="hint" role="alert">{error}</p>}
      <div className="actions"><button onClick={onNext} disabled={!next}>再练一个不同模型</button>{next&&<button className="primary" onClick={()=>go(`#/p/${next}`)}>去另一家族独立验证</button>}</div>
    </section>}
  </>;
}

export function TrainingPage({id}:{id:string}) {
  const events=useEvents(),settings=useSettings(),skill=skillById.get(id);
  const from=new URLSearchParams(window.location.hash.split('?')[1]??'').get('from')??undefined;
  const candidates=trainingCandidates(id,events,settings,from);
  const [selected,setSelected]=useState<string|null>(()=>candidates[0]?.id??null);
  const current=selected?problemById.get(selected):candidates[0];
  const next=current?candidates.find(p=>problemFamily(p.id)!==problemFamily(current.id)):undefined;
  if(!skill)return <section className="card">专项训练不存在。<a href="#/readiness">返回水平页</a></section>;
  return <div><StudyNav active="readiness"/><section className="card"><h1>{skill.title}专项训练</h1><p className="muted">先写关键条件，再逐步查看提示。训练记录用于补弱与安排复习；独立能力需用另一题验证。</p><div className="chips">{skillTrainings.map(s=><a className="chip" href={`#/train/${s.id}`} key={s.id}>{s.title}</a>)}</div></section>
    {current?<Exercise key={current.id} problem={current} skill={skill} next={next?.id} onNext={()=>next&&setSelected(next.id)}/>:<section className="card">当前保留卷及家族筛选下没有合适题目。可在设置中调整保留卷，或选择其他专项。</section>}
  </div>;
}
