import { problemById } from '../content';
import { Md } from './Markdown';
import type { ExamItem } from '../types';

export function MockPrint({title,items}:{title:string;items:ExamItem[]}) {
  return <section className="mock-print"><h1>808 · {title}</h1><p>满分 {items.reduce((v,i)=>v+i.score,0)} 分，建议时间 180 分钟。分值依中北模板设置。</p>{items.map(i=> {
    const p=problemById.get(i.problemId);
    if (!p) return null;
    return <article key={i.no}><h2>{i.no} · {p.type}（{i.score}分）</h2><Md>{p.stem}</Md>{p.options?.map((o,n)=><p key={n}><b>{String.fromCharCode(65+n)}. </b><Md inline>{o}</Md></p>)}{p.figures?.map(f=><img src={`${import.meta.env.BASE_URL}${f}`} key={f} alt="题图"/>)}<div className="print-answer-space"/></article>;
  })}</section>;
}
