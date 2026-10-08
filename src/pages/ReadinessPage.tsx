import { StudyNav } from '../components/StudyNav';
import { target808Paper } from '../content/target808';
import { mockResult, mockSessions, validMockSession } from '../engine/mock';
import { readiness808 } from '../engine/readiness';
import { stars } from '../format';
import { useDerived, useEvents } from '../state';

const percent = (value: number) => Math.round(value * 100) + '%';

export function ReadinessPage() {
  const {mi,now} = useDerived(), events = useEvents();
  const profile = readiness808(mi, events, now);
  const sessions = mockSessions(events).filter(validMockSession);
  const finished = sessions.filter(s => s.finished).sort((a,b) => b.start - a.start);
  const latest = finished[0], result = latest ? mockResult(latest, events) : undefined;
  return <div><StudyNav active="readiness"/>
    <section className="card">
      <div className="card-head readiness-head"><h1>我的 808 适配水平</h1><span className="badge">{profile.level}</span></div>
      <p className="muted">围绕中北信号与系统的重点考点、真题频次和原卷分值，检查你能做什么、哪些地方还没验证。</p>
      <div className="readiness-stats">
        <div><b>{percent(profile.coverage)}</b><span>重点已测覆盖</span><small>至少做过一道相关题</small></div>
        <div><b>{percent(profile.validatedCoverage)}</b><span>换题验证覆盖</span><small>至少三道不同题的证据</small></div>
        <div><b>{profile.measuredMastery === null ? '待测' : percent(profile.measuredMastery)}</b><span>已测掌握估计</span><small>计入当前记忆保持情况</small></div>
      </div>
      <p className="muted small">覆盖按重要程度加权，水平估计只采用题面明确、符合808范围的作答证据。未做题的考点单列待测；只复习卡片还不能验证解题能力。这些是根据自评与批改记录的估计，不能当作预测考试分数。</p>
      <div className="actions"><a className="button primary" href="#/mock?mode=adaptive">做一套 808 补强测评卷</a><a href="#/mock">标准模拟卷 →</a></div>
    </section>
    <section className="card">
      <h2>最影响 808 准备的考点</h2>
      <p className="muted small">优先显示重要且薄弱、可能遗忘或尚未测过的点；熟练考点会后移。同一天重复一道题只算一份证据。</p>
      <ul className="rows readiness-gaps">{profile.points.slice(0,10).map(k => <li key={k.id} data-kp={k.id}>
        <a href={'#/practice?kp=' + k.id}>
          <span><b>{k.id} {k.title}</b> <span className="stars">{stars(k.stars)}</span> <span className={'badge ' + (k.status==='需补强'?'bad':k.status==='较稳固'?'good':'')}>{k.status}</span></span>
          <span className="small muted">{k.measured ? '掌握估计 ' + percent(k.mastery.m) + ' · ' + k.mastery.uniqueProblems + ' 道不同题' : '尚未做题验证'} · 中北真题 {k.years} 套</span>
          <span className="small muted">{k.mastery.uniqueProblems+k.mastery.reviews ? '记忆保持估计 ' + percent(k.mastery.retention) + ' · ' : ''}{k.examPoints>0 ? '最近原卷约 ' + k.examPoints.toFixed(1) + ' 分权重' : '重点表考点，仍需覆盖'}</span>
        </a>
      </li>)}</ul>
      <p className="muted small">基准：现有中北重点表、已录入中北真题及{target808Paper.title}。综合题的分值按涉及考点平均分配，仅用于估计权重；拓展状态变量题不计入本页。</p>
      <a href="#/knowledge">查看全部知识点 →</a>
    </section>
    <section className="card">
      <h2>原卷题型适配</h2>
      <p className="muted small">按最近完整原卷的作答单元和分值核对；“全对”采用每道题最近一次自评或确认后的批改记录。</p>
      <ul className="rows">{profile.types.map(t => <li key={t.type}><a href={'#/practice?type='+encodeURIComponent(t.type)}>
        <b>{t.type} · 原卷 {t.count} 个单元 / {t.score} 分</b>
        <span className="muted small">已练 {t.practiced} 道不同题 · 最近全对 {t.full} 道</span>
      </a></li>)}</ul>
    </section>
    <section className="card"><h2>整卷验证</h2>
      {latest && result ? <p>最近完成：<a href={'#/mock/'+latest.id}>{latest.title}</a>，自评 {Math.round(result.score*10)/10} / {result.total} 分，完成 {result.done}/{latest.items.length} 单元。</p> : <p className="muted">还没有完成模拟卷。单题会做之外，还需要用 150 分、180 分钟整卷检验题型和作答量。</p>}
      <p className="muted small">补强卷保持中北原卷题型、题位和分值，优先换入适合你薄弱考点的题；标准卷用于完整结构验证。</p>
    </section>
  </div>;
}
