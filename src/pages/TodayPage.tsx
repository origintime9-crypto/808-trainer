import { rankKnowledge, recommendationReason, type MasteryIndex } from '../engine/mastery';
import { DAY, dayDiff, startOfToday } from '../engine/scheduler';
import { problemById } from '../content';
import { go, kpLabel, patternLabel, sourceLabel, stars } from '../format';
import { setProblemList, useDerived, useEvents, useSettings } from '../state';
import { sourceEvidenceLabel } from '../content/sourceEvidence';
import { dailyPlan, STAGE_LABELS } from '../engine/dailyPlan';
import { learningEvents } from '../engine/history';
import { exam808Schedule, examStartTimestamp } from '../content/revisionGuide';

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
              <span>{sourceLabel(p)}</span>
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

  return (
    <div className="today">
      <div className="page-intro"><div><p className="eyebrow">中北大学 · 2027 考研</p><h1>把今天的题，做扎实。</h1></div></div>
      <section className="hero">
        <div>
          <div className="big">{days}</div>
          <div className="muted">天后初试（{settings.examDate}）</div>
        </div>
        <div className="stats">
          <div><b>{doneProblems}</b><span>今日做题</span></div>
          <div><b>{doneCards}</b><span>今日卡片</span></div>
          <div><b>{[...sched.problems.values()].filter((s) => s.inMistakes).length}</b><span>错题本</span></div>
        </div>
      </section>
      <p className="muted small">{settings.examDate===exam808Schedule.date?'业务课（二）参考时段：12月20日14:00–17:00（北京时间），以准考证为准。':'复习截止按所选日期14:00（北京时间）安排。'} <a href="#/guide">查看复习依据与重点核对 →</a></p>

      <section className="card daily-plan" data-daily-plan><div className="card-head"><h2>今天怎么安排</h2><a href="#/settings">调整计划 →</a></div>
        <p><b>剩余安排约 {plan.expectedMinutes} 分钟</b> · {STAGE_LABELS[plan.stage]} · 每日预算 {plan.budget} 分钟 · 今日已用约 {plan.spentMinutes} 分钟</p>
        <p className="muted small">优先到期重做，再复习卡片、做新题。题目按参考或个人有效用时估计，卡片按1–2分钟估计。</p>
        {!settings.planConfigured&&<p className="hint">暂按{STAGE_LABELS[plan.stage]}、每天{plan.budget}分钟安排。请在设置中选择你的阶段与可用时间，再确认计划。</p>}
        {plan.tasks[0]&&<p>先完成：{plan.tasks[0].kind.includes('problem')?<a href={`#/p/${plan.tasks[0].id}`}>{sourceLabel(problemById.get(plan.tasks[0].id)!)} · 约{plan.tasks[0].minutes}分钟</a>:<a href="#/review">{plan.tasks[0].kind==='new-card'?'学习第一张新卡':'复习第一张到期卡片'}</a>}</p>}
        {plan.deferredMinutes>0&&<p className="hint">到期任务超出预算，暂缓 {plan.deferredProblems.length} 题、{plan.deferredCards.length} 张卡片（约{plan.deferredMinutes}分钟）。建议先暂停新增，后续每天留出约{Math.ceil(plan.budget*0.7)}分钟补偿；现有积压至少需约{plan.catchupDays}天，新增到期任务另计。</p>}
        {!plan.tasks.length&&<p className="muted">今日预算已用完，或没有可安排任务。可按需要调整预算，也可保留时间休息。</p>}
      </section>

      {needBackup && (
        <div className="banner" onClick={() => go('#/settings')}>
          {settings.lastExport ? '已超过 3 天没有导出备份。' : '还没有导出过备份。'}点这里备份进度，换设备或清理浏览器前留一份。
        </div>
      )}
      <section className="card"><div className="card-head"><h2>我对 808 准备得怎么样</h2><a href="#/readiness">查看适配水平 →</a></div><p className="muted small">按中北重点考点和原卷要求核对覆盖、掌握和薄弱项，也可以生成保持原卷结构的补强测评卷。</p></section>

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
  );
}
