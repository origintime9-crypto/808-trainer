import { useState } from 'react';
import { CHAPTERS, knowledge, kpById, problemById } from '../content';
import { relDay, sourceLabel } from '../format';
import { setProblemList, useDerived } from '../state';
import { GRADE_LABELS, MISTAKE_TAGS } from '../types';

export function MistakesPage() {
  const { sched, now } = useDerived();
  const [tag, setTag] = useState('');
  const [chapter, setChapter] = useState('');
  const [kp, setKp] = useState('');

  const entries = [...sched.problems.entries()]
    .filter(([, st]) => st.inMistakes)
    .filter(([id, st]) => {
      const p = problemById.get(id);
      if (!p) return false;
      if (chapter && !p.kps.some((k) => String(kpById.get(k)?.chapter) === chapter)) return false;
      if (kp && !p.kps.includes(kp)) return false;
      if (tag && !st.attempts.some((a) => a.tags.includes(tag as (typeof MISTAKE_TAGS)[number]))) return false;
      return true;
    })
    .sort((a, b) => a[1].card.due.getTime() - b[1].card.due.getTime());
  const ids = entries.map(([id]) => id);
  const graduated = [...sched.problems.values()].filter((s) => s.mastered && s.attempts.some((a) => a.grade < 3)).length;

  return (
    <div>
      <section className="card filters">
        <label>知识点<select value={kp} onChange={e => setKp(e.target.value)}><option value="">全部</option>{knowledge.map(k => <option key={k.id} value={k.id}>{k.id} {k.title}</option>)}</select></label>
        <label>
          章节
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option value="">全部</option>
            {Object.entries(CHAPTERS).map(([n, name]) => <option key={n} value={n}>{name}</option>)}
          </select>
        </label>
        <label>
          错因
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">全部</option>
            {MISTAKE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </section>

      <section className="card">
        <h2>错题本 <span className="count">{entries.length}</span></h2>
        <p className="muted small">错题按复习时间排序；连续两次全对后自动移出。已移出 {graduated} 题。</p>
        <ul className="rows">
          {entries.map(([id, st]) => {
            const p = problemById.get(id)!;
            const last = st.attempts.at(-1)!;
            const allTags = [...new Set(st.attempts.flatMap((a) => a.tags))];
            const note = sched.notes.get(id);
            const due = st.card.due.getTime();
            return (
              <li key={id}>
                <a href={`#/p/${id}`} onClick={() => setProblemList(ids)}>
                  <span>
                    {sourceLabel(p)}
                    <span className={`badge ${due <= now ? 'bad' : ''}`}>{due <= now ? '今天到期' : `${relDay(now, due)}重做`}</span>
                  </span>
                  <span className="muted small">
                    上次：{GRADE_LABELS[last.grade]}
                    {allTags.length > 0 && ` · 错因：${allTags.join('、')}`}
                    {st.streak === 1 && ' · 已全对 1 次'}
                    {note && ` · 笔记：${note.slice(0, 30)}${note.length > 30 ? '…' : ''}`}
                    {last.ai && ` · AI：${last.ai.feedback.slice(0, 60)}`}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        {entries.length === 0 && <p className="muted">错题本是空的。</p>}
      </section>
    </div>
  );
}
