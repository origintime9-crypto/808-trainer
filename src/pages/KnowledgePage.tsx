import { useState } from 'react';
import { knowledge, kpPapers, problems } from '../content';
import { domains, topics, matchesCategory } from '../content/taxonomy';
import { StudyNav } from '../components/StudyNav';
import { stars } from '../format';
import { useDerived } from '../state';

export function KnowledgePage() {
  const {sched,mi}=useDerived();
  const [domain,setDomain]=useState(''), [search,setSearch]=useState(''), [focus,setFocus]=useState(false);
  const query=search.trim().toLowerCase();
  const visible=domains.filter(d=>!domain||d.id===domain).map(d=>({...d,topics:topics.filter(t=>t.domain===d.id).map(t=>({...t,knowledge:knowledge.filter(k=>t.kps.includes(k.id)&&(!focus||k.stars>=3)&&(!query||`${k.id} ${k.title} ${k.scope} ${t.title} ${d.title}`.toLowerCase().includes(query)))})).filter(t=>t.knowledge.length)})).filter(d=>d.topics.length);
  const stats=(kps:string[])=> {
    const list=problems.filter(p=>p.kps.some(k=>kps.includes(k)));
    return {all:list.length,wrong:list.filter(p=>sched.problems.get(p.id)?.inMistakes).length,todo:list.filter(p=>!sched.problems.has(p.id)).length};
  };
  return <div><StudyNav active="knowledge"/>
    <section className="card"><h2>知识点分类</h2><p className="muted small">领域 → 专题 → 知识点。综合题可属于多个知识点，每个专题的题数按题目去重。星级沿用中北重点表，真题频次只统计中北卷。</p>
      <div className="knowledge-tools"><label>搜索考点<input type="search" value={search} placeholder="例如：零极点、帕塞瓦尔、初值" onChange={e=>setSearch(e.target.value)}/></label><label className="check-label"><input type="checkbox" checked={focus} onChange={e=>setFocus(e.target.checked)}/>只看 3–5 星重点</label></div>
      <div className="chips category-chips"><button className={!domain?'primary':''} onClick={()=>setDomain('')}>全部领域</button>{domains.map(d=><button key={d.id} className={domain===d.id?'primary':''} onClick={()=>setDomain(d.id)}>{d.title}</button>)}</div>
    </section>
    {visible.map(d=> {
      const count=problems.filter(p=>matchesCategory(p.kps,d.id)).length;
      return <section className="card knowledge-domain" key={d.id}><div className="card-head"><h2>{d.title}</h2><a href={`#/practice?domain=${d.id}`}>练习 {count} 题 →</a></div><p className="muted small">{d.description}</p>
        {d.topics.map(t=> {
          const total=stats(t.kps);
          return <div className="knowledge-topic" key={t.id}><div className="card-head"><h3>{t.title}</h3><a className="small" href={`#/practice?domain=${d.id}&topic=${t.id}`}>专题 {total.all} 题 →</a></div>
            <div className="knowledge-grid">{t.knowledge.map(k=> {
              const s=stats([k.id]),m=mi.kp(k.id),tested=m.attempts+m.reviews>0;
              return <article className="knowledge-node" key={k.id}><a className="knowledge-title" href={`#/practice?kp=${k.id}`}>{k.id} {k.title}</a><span className="stars" aria-label={`${k.stars}星`}>{stars(k.stars)}</span><p className="muted small">{k.scope}</p><div className="small">{s.all} 题 · {s.todo} 未做 · 中北真题 {kpPapers.get(k.id)?.size??0} 套</div><div className="knowledge-actions"><span className="small muted">{tested?`掌握度 ${Math.round(m.m*100)}%`:'尚未测评'}</span>{s.wrong>0&&<a className="badge bad" href={`#/practice?kp=${k.id}&status=wrong`}>错题 {s.wrong}</a>}<a className="small" href={`#/practice?kp=${k.id}&status=todo`}>练新题 →</a></div></article>;
            })}</div>
          </div>;
        })}</section>;
    })}
    {!visible.length&&<p className="muted">当前条件没有匹配考点，可更换关键词、领域或关闭重点筛选。</p>}
  </div>;
}
