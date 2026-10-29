import { useProblemDetail } from '../content/details';
import { Md } from './Markdown';
import type { ExamItem } from '../types';
import { Suspense, useEffect, useState } from 'react';
import { recordProblemExposure } from '../state';
import { LoadBoundary } from './LoadBoundary';

export function MockPrint({title,items,minutes=180}:{title:string;items:ExamItem[];minutes?:number}) {
  const [exposureError,setExposureError]=useState('');
  useEffect(()=>{
    const beforePrint=()=>{
      try {for(const item of items)recordProblemExposure(item.problemId);setExposureError('');}
      catch {setExposureError('打印内容的见题记录未能保存，请检查本机存储空间。');}
    };
    window.addEventListener('beforeprint',beforePrint);
    return()=>window.removeEventListener('beforeprint',beforePrint);
  },[items]);
  return <>{exposureError&&<p className="hint" role="alert">{exposureError}</p>}<section className="mock-print"><h1>808 · {title}</h1><p>已标明分值合计 {items.reduce((v,i)=>v+i.score,0)} 分，建议时间 {minutes} 分钟。</p>{items.map(i=><LoadBoundary key={i.no} resetKey={i.problemId}><Suspense fallback={<p>正在载入题面…</p>}><PrintItem item={i}/></Suspense></LoadBoundary>)}</section></>;
}
function PrintItem({item:i}:{item:ExamItem}) {
  const p=useProblemDetail(i.problemId);
  if(!p)return null;
  return <article><h2>{i.no}（{i.score||'未标'}分）</h2><Md>{p.stem}</Md>{p.options?.map((o,n)=><p key={n}><b>{String.fromCharCode(65+n)}. </b><Md inline>{o}</Md></p>)}{p.figures?.map(f=><img src={`${import.meta.env.BASE_URL}${f}`} key={f} alt="题图"/>)}<div className="print-answer-space"/></article>;
}
