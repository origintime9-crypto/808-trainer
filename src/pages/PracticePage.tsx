import { CHAPTERS, knowledge, kpById, paperById, papers, patterns, problems } from '../content';
import { go, patternLabel, sourceLabel } from '../format';
import { setProblemList, useDerived } from '../state';
import { GRADE_LABELS } from '../types';
import { paperProblems } from '../engine/paper';

const STATUS = { all: '全部', todo: '未做', wrong: '错题本', done: '已过关' } as const;
type Status = keyof typeof STATUS;
const SCORE_COEF = [0, 0.3, 0.7, 1];

function readQuery(): URLSearchParams {
  return new URLSearchParams(window.location.hash.split('?')[1] ?? '');
}

function setQuery(patch: Record<string, string>) {
  const q = readQuery();
  for (const [k, v] of Object.entries(patch)) {
    if (v) q.set(k, v);
    else q.delete(k);
  }
  const s = q.toString();
  go(`#/practice${s ? `?${s}` : ''}`);
}

export function PracticePage() {
  const { sched } = useDerived();
  const q = readQuery();
  const paper = q.get('paper') ?? '';
  const chapter = q.get('ch') ?? '';
  const kp = q.get('kp') ?? '';
  const pattern = q.get('pattern') ?? '';
  const status = (q.get('status') ?? 'all') as Status;

  const list = (paper ? paperProblems(paper) : problems).filter((p) => {
    if (paper && !p.sources.some((s) => s.paper === paper)) return false;
    if (chapter && !p.kps.some((k) => String(kpById.get(k)?.chapter) === chapter)) return false;
    if (kp && !p.kps.includes(kp)) return false;
    if (pattern && p.pattern !== pattern) return false;
    const st = sched.problems.get(p.id);
    if (status === 'todo' && st) return false;
    if (status === 'wrong' && !st?.inMistakes) return false;
    if (status === 'done' && !st?.mastered) return false;
    return true;
  });
  const ids = list.map((p) => p.id);

  let estimate: { got: number; done: number; total: number } | null = null;
  if (paper) {
    estimate = { got: 0, done: 0, total: paperById.get(paper)?.totalScore ?? 0 };
    for (const p of problems.filter((x) => x.sources.some((s) => s.paper === paper))) {
      const score = p.sources.find((s) => s.paper === paper)?.score ?? 0;
      const last = sched.problems.get(p.id)?.attempts.at(-1);
      if (last) {
        estimate.got += score * SCORE_COEF[last.grade];
        estimate.done += score;
      }
    }
  }

  const kpOptions = knowledge.filter((k) => !chapter || String(k.chapter) === chapter);

  return (
    <div>
      <section className="card filters">
        <label>
          试卷
          <select value={paper} onChange={(e) => setQuery({ paper: e.target.value })}>
            <option value="">全部</option>
            {papers.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </label>
        <label>
          章节
          <select value={chapter} onChange={(e) => setQuery({ ch: e.target.value, kp: '' })}>
            <option value="">全部</option>
            {Object.entries(CHAPTERS).map(([n, name]) => <option key={n} value={n}>{name}</option>)}
          </select>
        </label>
        <label>
          知识点
          <select value={kp} onChange={(e) => setQuery({ kp: e.target.value })}>
            <option value="">全部</option>
            {kpOptions.map((k) => <option key={k.id} value={k.id}>{k.id} {k.title}</option>)}
          </select>
        </label>
        <label>
          题型
          <select value={pattern} onChange={(e) => setQuery({ pattern: e.target.value })}>
            <option value="">全部</option>
            {patterns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>
          状态
          <select value={status} onChange={(e) => setQuery({ status: e.target.value === 'all' ? '' : e.target.value })}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </section>

      {estimate && (
        <section className="card estimate">
          最近练习估分：<b>{Math.round(estimate.got)}</b> / 已做部分满分 {estimate.done}
          {estimate.total ? `（全卷 ${estimate.total} 分）` : ''}
          <span className="muted small">　按最近一次自评：不会 0、部分对 30%、大部分对 70%、全对 100%</span>
          <div className="actions"><button className="primary" onClick={() => go(`#/exam/${paper}`)}>整卷练习</button></div>
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h2>共 {list.length} 题</h2>
          {list.length > 0 && (
            <button className="primary" onClick={() => { setProblemList(ids); go(`#/p/${ids[0]}`); }}>按顺序开始</button>
          )}
        </div>
        <ul className="rows">
          {list.map((p) => {
            const st = sched.problems.get(p.id);
            const last = st?.attempts.at(-1);
            return (
              <li key={p.id}>
                <a href={`#/p/${p.id}`} onClick={() => setProblemList(ids)}>
                  <span>
                    {sourceLabel(p)}
                    {st?.inMistakes && <span className="badge bad">错题</span>}
                    {st?.mastered && <span className="badge good">过关</span>}
                    {p.verified !== 'checked' && <span className="badge warn">{p.verified === 'corrected' ? '已勘误' : '存疑'}</span>}
                  </span>
                  <span className="muted small">
                    {p.type} · {patternLabel(p.pattern) || p.kps.join('、')}
                    {last ? ` · 上次：${GRADE_LABELS[last.grade]}` : ''}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && <p className="muted">没有符合条件的题。</p>}
      </section>
    </div>
  );
}
