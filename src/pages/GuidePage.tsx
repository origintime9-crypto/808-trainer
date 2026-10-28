import { StudyNav } from '../components/StudyNav';
import { kpById } from '../content';
import { target808Basis } from '../content/target808';
import { exam808Schedule, guideCheckedAt, guideComparisons, guideSources } from '../content/revisionGuide';

export function GuidePage() {
  return <div className="revision-guide"><StudyNav active="guide"/>
    <section className="card">
      <h1>808复习依据与重点核对</h1>
      <p>核对日期：{guideCheckedAt} · 目标：中北大学2027年信号与系统初试复习。</p>
      <p className="hint">{target808Basis.label}课程资料与经验指南支持现有核心主线；有分歧的章节保留补查入口。</p>
      <p><b>专业课时间参考：{exam808Schedule.date} {exam808Schedule.time}（{exam808Schedule.zone}）。</b><a href={exam808Schedule.source} target="_blank" rel="noreferrer">查看招生简章 ↗</a></p>
      <p className="muted small">按业务课（二）下午场、180分钟安排；具体科目和时间以报考专业目录及准考证为准。网站的星级来自经验圈画，不能视为官方不考清单。</p>
    </section>
    <section className="card">
      <h2>先按这条路线练</h2>
      <ol className="guide-route">
        <li><b>基础：</b>按目标教材补概念，每次先独立写出关键条件，再看解析。<a href="#/knowledge">按章节找题 →</a></li>
        <li><b>强化：</b>先练卷积边界、初态、ROC和频谱，再做不同原始大题；当天订正用来安排复习，隔天无提示复测。<a href="#/readiness">开始补弱训练 →</a></li>
        <li><b>冲刺：</b>保留至少一份原卷，尽量在14:00–17:00完整闭卷作答，交卷后统一评分。<a href="#/settings">设置保留卷 →</a> <a href="#/exam/zt2026">开始原卷模考 →</a></li>
      </ol>
      <p className="muted small">这是结合现有题库与资料作出的复习安排建议；每日任务按你设置的阶段、时间和有效作答调整。</p>
    </section>
    <section className="card">
      <h2>与现有题库是否相符</h2>
      <p className="muted small">相关考点表示站内归类与练习入口，不表示每一项都已有完整专题覆盖。</p>
      {guideComparisons.map(row=><article className="guide-comparison" key={row.id}>
        <h3>{row.title}<span className="badge">{row.status}</span></h3>
        <p>{row.evidence}</p><p><b>复习安排：</b>{row.decision}</p>
        <div className="chips">{row.kps.map(id=><a className="chip" key={id} href={`#/practice?kp=${id}`}>{id} {kpById.get(id)?.title}</a>)}</div>
        <a href={row.href}>{row.action} →</a>
      </article>)}
    </section>
    <section className="card">
      <h2>来源与可用范围</h2>
      <p>初试频次只按初试卷计；旧复试题和课程题库分别显示。单年原卷、网络经验和未标注年份的重点表，都不足以证明多年初试高频。</p>
      <div className="guide-local"><b>两份已有重点资料</b><p className="small">站内星级沿用“2027院校重点圈画·中北大学808”；另核对了用户资料中的两页《信号与系统考试重点》。后者未见可确认的年份、作者或官方署名，保留分歧，不把两表星级求平均。</p></div>
      {guideSources.map(source=><details key={source.id} className="guide-source">
        <summary>{source.title}<span className="badge">{source.kind}</span></summary>
        <p>{source.finding}</p><p className="muted small">核验边界：{source.limit}</p>
        <a href={source.url} target="_blank" rel="noreferrer">阅读来源 ↗</a>
      </details>)}
    </section>
  </div>;
}
