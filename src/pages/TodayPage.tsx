import { rankKnowledge, recommendationReason, type MasteryIndex } from '../engine/mastery';
import { DAY, dayDiff, startOfToday } from '../engine/scheduler';
import { problemById } from '../content';
import { go, kpLabel, patternLabel, sourceLabel, stars } from '../format';
import { setProblemList, useDerived, useEvents, useSettings } from '../state';
import { sourceEvidenceLabel } from '../content/sourceEvidence';
import { dailyPlan, STAGE_LABELS } from '../engine/dailyPlan';
import { learningEvents } from '../engine/history';
import { exam808Schedule, examStartTimestamp } from '../content/revisionGuide';
import { Icon } from '../components/Icon';

function ProblemLinks({ ids, empty, mi }: { ids: string[]; empty: string; mi?: MasteryIndex }) {
  if (ids.length === 0) return <p className="muted">{empty}</p>;
  return (
    <ul className="rows">
      {ids.map((id) => {
        const p = problemById.get(id);
        if (!p) return null;
        return (
          <li key={id}>
            <a
              href={`#/p/${id}`}
              onClick={() => setProblemList(ids)}
            >
              <span>{sourceLabel({...p,sources:p.sources.slice(0,1)})}{p.sources.length>1&&<span className="source-count">另{p.sources.length-1}个来源</span>}</span>
              <span className="muted small">{patternLabel(p.pattern) || p.kps.map(kpLabel).join('，')}</span>
              {mi&&<span className="adaptive-reason small">{recommendationReason(id, mi)}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function TodayPage() {
  const { sched, mi, now } = useDerived();
  const settings = useSettings();
  const events = useEvents();
  const days = Math.max(0, dayDiff(now, examStartTimestamp(settings.examDate)));
  const plan = dailyPlan(sched, events, settings, mi, now);
  const q = plan.cards, mistakes=plan.dueProblems, fresh=plan.newProblems;
  const weak = rankKnowledge(mi).filter((r) => r.stars >= 3 && !r.id.startsWith('8.')).slice(0, 5);
  const today = startOfToday(now);
  const doneProblems = learningEvents(events).filter((e) => e.kind === 'attempt' && e.t >= today&&e.t<=now).length;
  const doneCards = events.filter((e) => e.kind === 'review' && e.t >= today).length;
  const needBackup = events.length > 0 && (!settings.lastExport || now - settings.lastExport > 3 * DAY);
  const first=plan.tasks[0],firstProblem=first?problemById.get(first.id):undefined;
  const firstHref=first?(first.kind.includes('problem')?`#/p/${first.id}`:'#/review'):'#/analysis';
  const firstLabel=first?(firstProblem?sourceLabel({...firstProblem,sources:firstProblem.sources.slice(0,1)}):first.kind==='new-card'?'学习第一张新卡':'复习第一张到期卡片'):'今天的预算已用完，或暂无待安排任务。';

  return (
    <div className="today">
      <div className="page-intro"><div><p className="eyebrow">中北大学 · 2027 考研</p><h1>把今天的题，做扎实。</h1><p className="intro-description">从今天的计划开始，用独立作答检验学习效果。</p></div></div>
      <div className="dashboard-overview">
        <section className="card daily-plan" data-daily-plan>
          <div className="card-head"><h2><Icon name="today"/>今天怎么安排</h2><span className="stage-pill">{STAGE_LABELS[plan.stage]}</span></div>
          <p className="plan-duration">剩余安排约 <b>{plan.expectedMinutes}</b> 分钟</p>
          <div className="plan-budget"><span>今日已用约 {plan.spentMinutes} 分钟</span><span>每日预算 {plan.budget} 分钟</span></div>
          <div className="budget-track" role="progressbar" aria-label="今日预算已用分钟" aria-valuemin={0} aria-valuemax={plan.budget} aria-valuenow={Math.min(plan.budget,plan.spentMinutes)}><i style={{width:Math.min(100,plan.spentMinutes/plan.budget*100)+'%'}}/></div>
          <div className="plan-next"><span className="task-kicker">{first?'下一步':'今日安排'}</span><span>{firstLabel}</span>{first&&<small>约 {first.minutes} 分钟</small>}</div>
          <div className="plan-actions"><a className="button primary" href={firstHref} onClick={()=>first?.kind.includes('problem')&&setProblemList(plan.tasks.filter(t=>t.kind.includes('problem')).map(t=>t.id))}>{first?'开始今日任务':'查看学习记录'}<Icon name="arrow"/></a><a href="#/settings">调整计划</a></div>
          {!settings.planConfigured&&<p className="plan-note">暂按{STAGE_LABELS[plan.stage]}、每天{plan.budget}分钟安排。<a href="#/settings">确认你的计划 →</a></p>}
          {plan.deferredMinutes>0&&<details className="plan-backlog"><summary>暂缓 {plan.deferredProblems.length} 题、{plan.deferredCards.length} 张卡片，查看补偿安排</summary><p>到期任务超出预算约{plan.deferredMinutes}分钟。建议先暂停新增，后续每天留出约{Math.ceil(plan.budget*0.7)}分钟补偿；现有积压至少需约{plan.catchupDays}天，新增到期任务另计。</p></details>}
        </section>
        <section className="hero countdown-card">
          <div className="countdown-label"><span>距离专业课初试</span><Icon name="target"/></div>
          <div className="countdown-number"><b className="big">{days}</b><span>天</span></div>
          <div className="countdown-date">{settings.examDate}<span>中北大学 · 808</span></div>
          <svg className="countdown-wave" viewBox="0 0 320 90" fill="none" aria-hidden="true"><path d="M-10 48C20 48 20 4 50 4S80 84 110 84 140 4 170 4 200 84 230 84 260 4 290 4 320 48 340 48" stroke="currentColor" strokeWidth="1.5"/><path d="M-10 62C20 62 20 18 50 18S80 98 110 98 140 18 170 18 200 98 230 98 260 18 290 18 320 62 340 62" stroke="currentColor" strokeWidth="1" opacity=".45"/></svg>
          <a href="#/guide">复习依据与重点核对 <Icon name="arrow"/></a>
        </section>
      </div>
      <p className="exam-schedule-note"><Icon name="clock"/>{settings.examDate===exam808Schedule.date?'专业课参考时段：12月20日14:00–17:00（北京时间），以准考证为准。':'复习截止按所选日期14:00（北京时间）安排。'}</p>
      <div className="today-metrics">
        <div><span className="metric-icon"><Icon name="practice"/></span><div><span>今日做题</span><b>{doneProblems}<small>道</small></b></div></div>
        <div><span className="metric-icon teal"><Icon name="review"/></span><div><span>今日卡片</span><b>{doneCards}<small>张</small></b></div></div>
        <div><span className="metric-icon amber"><Icon name="mistakes"/></span><div><span>待巩固错题</span><b>{[...sched.problems.values()].filter(s=>s.inMistakes).length}<small>道</small></b></div></div>
      </div>

      {needBackup && (
        <div className="banner" onClick={() => go('#/settings')}>
          {settings.lastExport ? '已超过 3 天没有导出备份。' : '还没有导出过备份。'}点这里备份进度，换设备或清理浏览器前留一份。
        </div>
      )}
      <section className="card readiness-entry"><span className="entry-icon"><Icon name="target"/></span><div><h2>我对 808 准备得怎么样</h2><p>核对重点覆盖与独立作答证据，找到下一步该补的内容。</p></div><a className="button" href="#/readiness">查看适配水平 <Icon name="arrow"/></a></section>

      <div className="today-sections">
      <section className="card">
        <div className="card-head">
          <h2>卡片复习</h2>
          <button className="primary" disabled={q.due.length + q.fresh.length === 0} onClick={() => go('#/review')}>
            开始复习
          </button>
        </div>
        <p>
          到期 <b>{q.due.length}</b> 张，新卡 <b>{q.fresh.length}</b> 张
          <span className="muted">（今日已学新卡 {q.newToday} / {settings.newCardsPerDay}）</span>
        </p>
      </section>

      <section className="card">
        <h2>到期重做 <span className="count">{mistakes.length}</span></h2>
        <p className="muted small">错题优先；已过关的题也会到期复习，防止“当时会、现在忘了”。</p>
        <ProblemLinks ids={mistakes} mi={mi} empty="今天没有需要重做的题。" />
      </section>

      <section className="card">
        <h2>推荐新题</h2>
        <p className="muted small">按阶段、剩余时间、808重点和薄弱情况挑题；弱项可连续练，熟练考点后移。已保留的整卷不从这里抽题。</p>
        <ProblemLinks ids={fresh} mi={mi} empty="今日新题额度已完成，或适合808的题都做过了。可以去「刷题」页按卷练习。" />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>当前最该补的知识点</h2>
          <a href="#/analysis">全部 →</a>
        </div>
        <ul className="rows">
          {weak.map((r) => (
            <li key={r.id}>
              <a href={`#/practice?kp=${r.id}`}>
                <span>{r.name} <span className="stars">{stars(r.stars)}</span></span>
                <span className="muted small">
                  {r.mastery.uniqueProblems === 0 ? '未测' : `掌握 ${Math.round(r.mastery.m * 100)}%`} · {sourceEvidenceLabel(r.id)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  );
}
