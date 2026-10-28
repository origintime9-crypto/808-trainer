import { problemById } from '../content';
import { Md } from './Markdown';
import type { ExamItem } from '../types';

export function MockPrint({title,items,minutes=180}:{title:string;items:ExamItem[];minutes?:number}) {
  return <section className="mock-print"><h1>808 · {title}</h1><p>已标明分值合计 {items.reduce((v,i)=>v+i.score,0)} 分，建议时间 {minutes} 分钟。</p>{items.map(i=> {
    const p=problemById.get(i.problemId);
    if (!p) return null;
    return <article key={i.no}><h2>{i.no}（{i.score||'未标'}分）</h2><Md>{p.stem}</Md>{p.options?.map((o,n)=><p key={n}><b>{String.fromCharCode(65+n)}. </b><Md inline>{o}</Md></p>)}{p.figures?.map(f=><img src={`${import.meta.env.BASE_URL}${f}`} key={f} alt="题图"/>)}<div className="print-answer-space"/></article>;
  })}</section>;
}
