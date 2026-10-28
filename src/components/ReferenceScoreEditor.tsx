import { useState } from 'react';
import { referenceRubric } from '../content/rubrics';
import type { AttemptEvent } from '../types';

export function ReferenceScoreEditor({problemId,max,onChange}:{problemId:string;max:number;onChange:(score:AttemptEvent['score'],valid:boolean,lost:string[])=>void}) {
  const rubric=referenceRubric(problemId,max);
  const [useSteps,setUseSteps]=useState(false),[manual,setManual]=useState(''),[values,setValues]=useState<Record<string,string>>({});
  const update=(steps:boolean,rows:Record<string,string>,scoreText:string)=>{
    if(steps&&rubric) {
      const valid=rubric.steps.every(s=>rows[s.id]!==undefined&&rows[s.id]!==''&&Number.isFinite(Number(rows[s.id]))&&Number(rows[s.id])>=0&&Number(rows[s.id])<=s.max);
      const items=rubric.steps.map(s=>({id:s.id,earned:Number(rows[s.id]??0),max:s.max}));
      onChange(valid?{earned:items.reduce((v,s)=>v+s.earned,0),max,basis:'reference',steps:items}:undefined,valid,
        valid?rubric.steps.filter(s=>Number(rows[s.id])<s.max&&s.skillError).map(s=>s.skillError!):[]);
    }else {
      const earned=Number(scoreText),valid=scoreText===''||Number.isFinite(earned)&&earned>=0&&earned<=max;
      onChange(scoreText!==''&&valid?{earned,max,basis:'reference'}:undefined,valid,[]);
    }
  };
  return <div className="reference-score"><h3>考试参考得分</h3><p className="muted small">得分和下面的记忆/复习评级分别保存。评分表依据已复核题解拟定，配分为项目参考，未取得官方阅卷细则；不同正确解法应按实际步骤给分。</p>
    {rubric&&<label className="check-label"><input type="checkbox" checked={useSteps} onChange={e=>{setUseSteps(e.target.checked);update(e.target.checked,values,manual);}}/>使用分步参考评分</label>}
    {useSteps&&rubric?<><p className="muted small">每项都需要确认；允许0.5分等部分得分。版本：{rubric.revision}</p>
      {rubric.steps.map(s=><label className="rubric-step" key={s.id}><span>{s.label} <small>满分{s.max}</small></span><input aria-label={`${s.label}得分`} type="number" min={0} max={s.max} step={0.5} value={values[s.id]??''} placeholder="待核对" onChange={e=>{const next={...values,[s.id]:e.target.value};setValues(next);update(true,next,manual);}}/><small className="muted">{s.check}</small></label>)}
      <p>分步合计：{rubric.steps.every(s=>values[s.id]!==undefined&&values[s.id]!=='')?rubric.steps.reduce((v,s)=>v+Number(values[s.id]),0):'待核对'} / {max} 分</p>
    </>:<label className="score-input">本题参考得分<input type="number" min={0} max={max} step={0.5} value={manual} placeholder={`可选，0–${max}`} onChange={e=>{setManual(e.target.value);update(false,values,e.target.value);}}/><small className="muted">留空时才按四档比例粗估；未覆盖专用评分表的题可直接填写实际参考分。</small></label>}
  </div>;
}
