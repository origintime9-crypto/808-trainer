import { useEffect, useRef, useState } from 'react';
import { buildGradePrompt, copyText } from '../ai/prompt';
import { Md } from '../components/Markdown';
import { AiGradePanel } from '../components/AiGradePanel';
import { problemById, problems } from '../content';
import { suggestedMinutes } from '../engine/queue';
import { dateLabel, go, kpLabel, patternLabel, relDay, sourceLabel, stars } from '../format';
import { kpById } from '../content';
import { app, getProblemList, useDerived } from '../state';
import { GRADE_LABELS, MISTAKE_TAGS, type AiResult, type Grade, type MistakeTag } from '../types';

function mmss(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function ProblemPage({ id, onNavigate, onComplete }: { id: string; onNavigate?: (id: string) => void; onComplete?: () => void }) {
  const p = problemById.get(id);
  const { sched, now } = useDerived();
  const [shown, setShown] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [tags, setTags] = useState<MistakeTag[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');
  const [ai, setAi] = useState<AiResult | undefined>();
  const [saveError, setSaveError] = useState('');
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const stopRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (stopRef.current === null) setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!p) return <div className="card">题目不存在：{id}</div>;

  const st = sched.problems.get(id);
  const note = sched.notes.get(id) ?? '';
  const list = getProblemList();
  const idx = list.indexOf(id);
  const prevId = idx > 0 ? list[idx - 1] : undefined;
  const nextId = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;
  const similar = p.pattern ? problems.filter((x) => x.pattern === p.pattern && x.id !== p.id) : [];
  const limit = suggestedMinutes(id);

  const reveal = () => {
    if (stopRef.current === null) stopRef.current = Date.now();
    setShown(true);
  };

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    setGrade(i === p.answerKey ? 3 : 0);
    reveal();
  };

  const submit = () => {
    if (grade === null) return;
    const sec = Math.max(0, Math.round(((stopRef.current ?? Date.now()) - startRef.current) / 1000));
    try { app.record({ kind: 'attempt', problemId: id, grade, tags: grade < 3 ? tags : [], sec, ...(ai ? { ai } : {}) }); setSubmitted(true); }
    catch { setSaveError('浏览器未能保存记录，请先导出备份并检查存储空间。'); }
  };
  const navigate = (target: string) => onNavigate ? onNavigate(target) : go(`#/p/${target}`);

  const copyPrompt = async () => {
    const ok = await copyText(buildGradePrompt(p));
    setCopied(ok ? '已复制。打开 ChatGPT，粘贴后附上作答照片即可。' : '复制失败，请检查浏览器权限。');
  };

  return (
    <div className="problem">
      <div className="toolbar">
        <button className="ghost" onClick={() => history.back()}>← 返回</button>
        <span className="spacer" />
        {prevId && <button className="ghost" onClick={() => navigate(prevId)}>上一题</button>}
        {nextId && <button className="ghost" onClick={() => navigate(nextId)}>下一题</button>}
      </div>

      <section className="card">
        <div className="meta">
          <span className="source">{sourceLabel(p)}</span>
          <span className="badge">{p.type}</span>
          {p.verified === 'corrected' && <span className="badge warn">资料答案有误，已修正</span>}
          {p.verified === 'uncertain' && <span className="badge warn">题干/答案存疑</span>}
          {st?.inMistakes && <span className="badge bad">错题本中</span>}
          {st?.mastered && <span className="badge good">已过关</span>}
        </div>
        <div className="chips">
          {p.kps.map((k) => (
            <a key={k} className="chip" href={`#/practice?kp=${k}`} title={kpById.get(k)?.scope}>
              {kpLabel(k)} <span className="stars">{stars(kpById.get(k)?.stars ?? 1)}</span>
            </a>
          ))}
          {p.pattern && <a className="chip pattern" href={`#/practice?pattern=${p.pattern}`}>题型：{patternLabel(p.pattern)}</a>}
        </div>

        <Md>{p.stem}</Md>
        {p.figures?.map((f) => {
          const url = `${import.meta.env.BASE_URL}${f.replace(/^\//, '')}`;
          return <a key={f} href={url} target="_blank" rel="noopener noreferrer" title="查看题图原图"><img className="figure" src={url} alt="题图，点击查看原图" /></a>;
        })}
        {!!p.figures?.length && <p className="muted small center">点图可查看原图。</p>}

        {p.options && (
          <div className="options">
            {p.options.map((o, i) => (
              <button
                key={i}
                className={`option ${chosen !== null && i === p.answerKey ? 'right' : ''} ${chosen === i && i !== p.answerKey ? 'wrong' : ''}`}
                onClick={() => choose(i)}
              >
                <b>{String.fromCharCode(65 + i)}.</b> <Md inline>{o}</Md>
              </button>
            ))}
          </div>
        )}

        <div className="timer">
          <span className={elapsed > limit * 60 ? 'over' : ''}>用时 {mmss(elapsed)}</span>
          <span className="muted">建议 {limit} 分钟</span>
        </div>

        {!shown && (
          <div className="actions">
            <button className="primary" onClick={reveal}>{p.options ? '不确定，直接看答案' : '我做完了，看答案'}</button>
            <button onClick={copyPrompt}>复制批改提示词</button>
          </div>
        )}
        {copied && <p className="hint">{copied}</p>}
      </section>

      {!p.options && <AiGradePanel problem={p} disabled={submitted} onResult={r => { setAi(r); setGrade(r.grade); setTags(r.tags); reveal(); }} />}

      {shown && (
        <section className="card answer">
          <h3>答案</h3>
          <Md>{p.answer}</Md>
          <h3>详细解答</h3>
          <Md>{p.solution}</Md>
          {p.note && <p className="note-src">说明：{p.note}</p>}
          {!copied && !p.options && (
            <button className="ghost small" onClick={copyPrompt}>复制批改提示词（发给 ChatGPT 帮你看步骤）</button>
          )}
        </section>
      )}

      {shown && !submitted && (
        <section className="card grade">
          <h3>{p.options ? '确认结果' : '对照答案，给自己打分'}</h3>
          <div className="grade-buttons">
            {GRADE_LABELS.map((label, g) => (
              <button key={label} className={`grade g${g} ${grade === g ? 'on' : ''}`} onClick={() => setGrade(g as Grade)}>
                {label}
              </button>
            ))}
          </div>
          {grade !== null && grade < 3 && (
            <>
              <p className="muted">错在哪里？（可多选）</p>
              <div className="tag-buttons">
                {MISTAKE_TAGS.map((t) => (
                  <label key={t} className={`tag ${tags.includes(t) ? 'on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={tags.includes(t)}
                      onChange={(e) => setTags(e.target.checked ? [...tags, t] : tags.filter((x) => x !== t))}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </>
          )}
          <button className="primary" disabled={grade === null} onClick={submit}>记录</button>
          {saveError && <p className="hint" role="alert">{saveError}</p>}
        </section>
      )}

      {submitted && st && (
        <section className="card result">
          {st.inMistakes ? (
            <p>
              已记入错题本，<b>{relDay(now, st.card.due.getTime())}</b>重做。
              {st.streak === 1 && ' 再全对一次就能移出错题本。'}
            </p>
          ) : (
            <p>
              <b>已过关。</b>
              {st.attempts.length > 1 ? '连续两次全对，已移出错题本。' : ''}
            </p>
          )}
          <div className="actions">
            {nextId ? <button className="primary" onClick={() => navigate(nextId)}>下一题</button> : onComplete ? <button className="primary" onClick={onComplete}>查看整卷结果</button> : <button className="primary" onClick={() => go('#/today')}>回到今日</button>}
          </div>
        </section>
      )}

      <section className="card">
        <h3>我的笔记</h3>
        <textarea
          key={`${id}-${note}`}
          className="note"
          defaultValue={note}
          placeholder="记下这道题的关键点、易错点……（离开输入框自动保存）"
          onBlur={(e) => {
            const text = e.target.value.trim();
            if (text !== note) {
              try { app.record({ kind: 'note', problemId: id, text }); setSaveError(''); }
              catch { setSaveError('笔记未保存，请检查浏览器存储空间并导出备份。'); }
            }
          }}
        />
        {saveError && <p className="hint" role="alert">{saveError}</p>}
        {st && st.attempts.length > 0 && (
          <>
            <h3>做题记录</h3>
            <ul className="history">
              {[...st.attempts].reverse().map((a) => (
                <li key={a.id}>
                  {dateLabel(a.t)} · <span className={`g${a.grade}`}>{GRADE_LABELS[a.grade]}</span> · {mmss(a.sec)}
                  {a.tags.length > 0 && ` · ${a.tags.join('、')}`}
                  {a.ai && <details><summary>AI 点评 · {a.ai.model}</summary><Md>{a.ai.transcript}</Md><Md>{a.ai.feedback}</Md></details>}
                </li>
              ))}
            </ul>
          </>
        )}
        {similar.length > 0 && (
          <>
            <h3>同题型的其他题</h3>
            <ul className="links">
              {similar.map((x) => (
                <li key={x.id}>
                  <a href={`#/p/${x.id}`}>{sourceLabel(x)}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
