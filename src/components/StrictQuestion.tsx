import { useRef, useState } from 'react';
import type { ExamAnswer, Problem } from '../types';
import { Md } from './Markdown';
import { useProblemExposure } from '../state';

export function StrictQuestion({ problem:p, initial, onDraft, onSave, onSkip }:{
  problem:Problem; initial?:ExamAnswer; onDraft:(answer:ExamAnswer)=>void; onSave:()=>void; onSkip:(answer:ExamAnswer)=>void;
}) {
  const exposureError=useProblemExposure(p.id);
  const [text,setText]=useState(initial?.text??'');
  const [choice,setChoice]=useState<number|undefined>(initial?.choice);
  const entered=useRef(Date.now()), base=useRef(initial?.sec??0);
  const answer=(nextText=text,nextChoice=choice,status:ExamAnswer['status']='draft'):ExamAnswer=>({
    problemId:p.id,text:nextText,...(nextChoice!==undefined?{choice:nextChoice}:{}),status,
    sec:Math.min(31536000,base.current+Math.max(0,Math.floor((Date.now()-entered.current)/1000))),
  });
  return <section className="card strict-question" data-strict-question>
    {exposureError&&<p className="hint" role="alert">{exposureError}</p>}
    <Md>{p.stem}</Md>
    {p.figures?.map(f=><img className="figure" key={f} src={`${import.meta.env.BASE_URL}${f.replace(/^\//,'')}`} alt="题图"/>)}
    {p.options&&<div className="options">{p.options.map((o,i)=><button key={i} className={`option ${choice===i?'selected':''}`} aria-pressed={choice===i} onClick={()=>{setChoice(i);onDraft(answer(text,i));}}><b>{String.fromCharCode(65+i)}.</b><Md inline>{o}</Md></button>)}</div>}
    <label className="answer-input">本题作答<textarea value={text} maxLength={20000} placeholder="记录关键推导、方法选择理由和结论；也可在纸上作答后标记完成。" onChange={e=>{setText(e.target.value);onDraft(answer(e.target.value));}} onBlur={onSave}/></label>
    <p className="muted small">内容自动保存；标记完成后仍可在交卷前修改。未完成的草稿会随卷保存。</p>
    <div className="actions">
      <button className="primary" onClick={()=>{const a=answer(text||'[已在纸上作答，交卷后对照原稿评分]',choice,'answered');setText(a.text);onDraft(a);onSave();}}>标记本题完成</button>
      <button onClick={()=>onSkip(answer(text,choice,'skipped'))}>跳过本题</button>
    </div>
  </section>;
}
