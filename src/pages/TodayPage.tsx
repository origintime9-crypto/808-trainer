import { cardQueue, duePractice, recommendNew } from '../engine/queue';
import { rankKnowledge, recommendationReason, type MasteryIndex } from '../engine/mastery';
import { DAY, dayDiff, startOfToday } from '../engine/scheduler';
import { problemById } from '../content';
import { go, kpLabel, patternLabel, sourceLabel, stars } from '../format';
import { setProblemList, useDerived, useEvents, useSettings } from '../state';

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
  const days = Math.max(0, dayDiff(now, new Date(`${settings.examDate}T09:00:00`).getTime()));
  const q = cardQueue(sched, events, settings, mi, now);
  const mistakes = duePractice(sched, mi, now);
  const fresh = recommendNew(sched, events, settings, mi, now);
  const weak = rankKnowledge(mi).filter((r) => r.stars >= 3 && !r.id.startsWith('8.')).slice(0, 5);
  const today = startOfToday(now);
  const doneProblems = events.filter((e) => e.kind === 'attempt' && e.t >= today).length;
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
        <p className="muted small">按808考点的重要程度、薄弱情况和遗忘风险挑题；弱项可连续练，熟练考点后移，预留少量待测点。</p>
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
                  {r.mastery.attempts + r.mastery.reviews === 0 ? '未测' : `掌握 ${Math.round(r.mastery.m * 100)}%`} · 真题出现 {r.years} 套
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
