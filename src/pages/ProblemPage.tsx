import { useEffect, useRef, useState } from 'react';
import { buildExternalGradePrompt, copyText } from '../ai/prompt';
import { Md } from '../components/Markdown';
import { AiGradePanel } from '../components/AiGradePanel';
import { NoteEditor } from '../components/NoteEditor';
import { ReferenceScoreEditor } from '../components/ReferenceScoreEditor';
import { skillErrorLabel, trainingForProblem } from '../content/training';
import { familyMembers, problemFamily } from '../content/families';
import { timeEstimate } from '../engine/timing';
import { problems } from '../content/catalog';
import { useProblemDetail } from '../content/details';
import { suggestedMinutes } from '../engine/queue';
import { dateLabel, go, kpLabel, patternLabel, relDay, sourceLabel, stars } from '../format';
import { kpById } from '../content/catalog';
import { Scratchpad } from '../components/Scratchpad';
import { LearningDrawer } from '../components/LearningDrawer';
import { ProgressiveHints } from '../components/ProgressiveHints';
import { useStudyShortcuts } from '../components/useStudyShortcuts';
import { bookmarkedProblems } from '../engine/bookmarks';
import { errorRoutes } from '../content/learningSupport';
import { app, getProblemList, useDerived, useEvents, useProblemExposure } from '../state';
import { GRADE_LABELS, MISTAKE_TAGS, type AiResult, type AttemptEvent, type Grade, type MistakeTag, type RecognitionReview } from '../types';

function mmss(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function ProblemPage({ id, onNavigate, onComplete, exam }: { id: string; onNavigate?: (id: string) => void; onComplete?: () => void; exam?: { id: string; score: number; attempt?: AttemptEvent; locked?: boolean; assessmentSec?: number; choice?:number; onRecord?: (attempt: Omit<AttemptEvent,'id'|'t'>) => void } }) {
  const p = useProblemDetail(id);
  const { sched, now } = useDerived();
  const events=useEvents();
  const exposureError=useProblemExposure(id);
  const [shown, setShown] = useState(!!exam?.attempt || !!exam?.onRecord);
  const [chosen, setChosen] = useState<number | null>(exam?.choice??null);
  const [grade, setGrade] = useState<Grade | null>(exam?.attempt?.grade ?? (exam?.choice!==undefined?(exam.choice===p?.answerKey?3:0):null));
  const [tags, setTags] = useState<MistakeTag[]>(exam?.attempt?.tags ?? []);
  const [submitted, setSubmitted] = useState(!!exam?.attempt);
  const [copied, setCopied] = useState('');
  const [ai, setAi] = useState<AiResult | undefined>(exam?.attempt?.ai);
  const [recognition, setRecognition] = useState<RecognitionReview | undefined>(exam?.attempt?.recognition);
  const [aiRevision, setAiRevision] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [workMode, setWorkMode] = useState<NonNullable<AttemptEvent['workMode']>>(exam?.attempt?.workMode ?? 'independent');
  const [hintsUsed, setHintsUsed] = useState(exam?.attempt?.hintsUsed ?? false);
  const [score,setScore]=useState<AttemptEvent['score']>(exam?.attempt?.score),[scoreValid,setScoreValid]=useState(true);
  const [skillErrors,setSkillErrors]=useState<string[]>(exam?.attempt?.skillErrors??[]),[stepErrors,setStepErrors]=useState<string[]>([]);
  const startRef = useRef(Date.now()-(exam?.attempt?.sec??0)*1000);
  const [elapsed, setElapsed] = useState(exam?.attempt?.sec??0);
  const [hintLevel,setHintLevel]=useState(0),[scratchOpen,setScratchOpen]=useState(false);
  const [drawer,setDrawer]=useState<'transforms'|'lab'|null>(null);
  const bookmarked=bookmarkedProblems(events,now).has(id);
  const stopRef = useRef<number | null>(exam?.attempt ? Date.now() : null);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (stopRef.current === null) setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useStudyShortcuts({reveal:()=>{if(p&&!shown)advanceHint();},rate:n=>{if(shown&&!submitted)setGrade((n-1) as Grade);},
    save:()=>toggleBookmark(),confirm:()=>{if(shown&&!submitted)submit();},next:()=>{
      if(shown&&!submitted){setSaveError('请先记录本题评分，再切换下一题。');return;}
      if(nextId)navigate(nextId);
    }});

  if (!p) return <div className="card">题目不存在：{id}</div>;

  const st = sched.problems.get(id);
  const note = sched.notes.get(id) ?? '';
  const list = getProblemList();
  const idx = list.indexOf(id);
  const prevId = idx > 0 ? list[idx - 1] : undefined;
  const nextId = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;
  const similar = p.pattern ? problems.filter((x) => x.pattern === p.pattern && x.id !== p.id) : [];
  const estimate=timeEstimate(id,events,now);
  const limit = exam&&exam.score>0 ? Math.round(exam.score*1.2) : suggestedMinutes(id,events,now);
  const fullScore=exam?exam.score:p.sources.find(s=>s.score!==undefined)?.score;
  const trainings=trainingForProblem(p),family=familyMembers(id);
  const calculationRisk=st?.attempts.some(a=>errorRoutes(a).calculation);

  const assist=()=>{if(!shown){setHintsUsed(true);setWorkMode('reference');}};
  const advanceHint=()=>{assist();if(hintLevel>=2)reveal();else setHintLevel(n=>n+1);};
  const toggleBookmark=()=>{
    try{app.record({kind:'bookmark',problemId:id,active:!bookmarkedProblems(app.events()).has(id)});setSaveError('');}
    catch{setSaveError('收藏未能保存，请检查浏览器存储空间。');}
  };

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
    if (grade === null || !scoreValid || (ai && !recognition)) return;
    const sec = exam?.assessmentSec ?? Math.max(0, Math.round(((stopRef.current ?? Date.now()) - startRef.current) / 1000));
    const attempt:Omit<AttemptEvent,'id'|'t'>={ kind: 'attempt', problemId: id, grade, tags: grade < 3 ? tags : [], sec, workMode, hintsUsed,
      ...(score?{score}:{}),skillErrors:[...new Set([...skillErrors,...stepErrors])],
      ...(ai ? { ai } : {}), ...(recognition ? { recognition } : {}), ...(exam ? {examId:exam.id} : {}) };
    try { if(exam?.onRecord)exam.onRecord(attempt);else app.record(attempt);setSubmitted(true); }
    catch { setSaveError('浏览器未能保存记录，请先导出备份并检查存储空间。'); }
  };
  const navigate = (target: string) => onNavigate ? onNavigate(target) : go(`#/p/${target}`);

  const copyPrompt = async () => {
    if (!shown) { setHintsUsed(true); setWorkMode('reference'); }
    const ok = await copyText(buildExternalGradePrompt(p, exam?.score));
    setCopied(ok ? '已复制。粘贴到 Gemini 或 ChatGPT 并附上作答照片，再把返回的 JSON 粘贴到本页批改区。' : '复制失败，请检查浏览器权限。');
  };

  return (
    <div className={`problem ${scratchOpen?'with-scratch':''}`}>
      {exposureError&&<p className="hint" role="alert">{exposureError}</p>}
      <div className="toolbar">
        <button className="ghost" onClick={() => history.back()}>← 返回</button>
        <span className="spacer" />
        {prevId && <button className="ghost" onClick={() => navigate(prevId)}>上一题</button>}
        {nextId && <button className="ghost" onClick={() => navigate(nextId)}>下一题</button>}
      </div>

      <div className="solve-tools">
        <div className="actions">
          {!shown&&<button onClick={advanceHint}>分步提示</button>}
          <button onClick={()=>{assist();setDrawer('transforms');}}>变换对照</button>
          <button onClick={()=>{assist();setDrawer('lab');}}>交互实验</button>
          <button aria-expanded={scratchOpen} onClick={()=>setScratchOpen(v=>!v)}>{scratchOpen?'收起草稿板':'打开草稿板'}</button>
          <button aria-pressed={bookmarked} onClick={toggleBookmark}>{bookmarked?'已收藏':'收藏本题'} <kbd>S</kbd></button>
        </div>
        <p className="shortcut-legend small muted"><kbd>Space</kbd> 逐级提示 · <kbd>1–4</kbd> 选择评级 · <kbd>Enter</kbd> 记录 · <kbd>→</kbd> 下一题</p>
      </div>
      {scratchOpen&&<aside className="scratch-host"><Scratchpad key={id} storageKey={exam?`exam:${exam.id}:${id}`:`problem:${id}`}/></aside>}
      {drawer&&<LearningDrawer type={drawer} onClose={()=>setDrawer(null)}/>}

      <section className="card">
        <div className="meta">
          <span className="source">{sourceLabel(p)}</span>
          {(shown || workMode !== 'independent' || hintsUsed) && <span className="badge">{p.type}</span>}
          {exam && <span className="badge">本卷 {exam.score} 分</span>}
          {p.verified === 'corrected' && <span className="badge warn">资料答案有误，已修正</span>}
          {p.verified === 'uncertain' && <span className="badge warn">题干/答案存疑</span>}
          {st?.inMistakes && <span className="badge bad">错题本中</span>}
          {st?.mastered && <span className="badge good">已过关</span>}
          {calculationRisk&&<span className="badge warn">易算错</span>}
        </div>
        {(shown || workMode !== 'independent' || hintsUsed) && <div className="chips">
          {p.kps.map((k) => (
            <a key={k} className="chip" href={`#/practice?kp=${k}`} title={kpById.get(k)?.scope}>
              {kpLabel(k)} <span className="stars">{stars(kpById.get(k)?.stars ?? 1)}</span>
            </a>
          ))}
          {p.pattern && <a className="chip pattern" href={`#/practice?pattern=${p.pattern}`}>题型：{patternLabel(p.pattern)}</a>}
        </div>}

        {!shown && <div className="work-mode"><label>本次作答方式<select aria-label="本次作答方式" value={workMode} onChange={e => {
          const mode = e.target.value as NonNullable<AttemptEvent['workMode']>;
          setWorkMode(mode); if (mode !== 'independent') setHintsUsed(true);
        }}><option value="independent">独立作答</option><option value="reference">查资料完成</option><option value="correction">看解析后订正</option></select></label>
          <p className="muted small">独立作答时隐藏考点、方法与历史笔记。当天首次作答用于能力判断；订正只安排复习。{hintsUsed && '本次已使用提示。'}</p>
          {!hintsUsed && workMode === 'independent' && <button className="ghost small" onClick={() => { assist();setHintLevel(1); }}>查看提示与笔记</button>}
        </div>}
        {calculationRisk&&!shown&&<p className="calculation-alert">请动笔验算到最后一步，再用代回、单位或边界值检查计算。</p>}

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
          <span className="muted">建议 {limit} 分钟 · {exam?'卷面配时':estimate.basis}{estimate.calibrated&&`（${estimate.samples}次）`}</span>
        </div>

        {!shown && (
          <div className="actions">
            <button className="primary" onClick={()=>{if(p.options){setWorkMode('correction');setHintsUsed(true);}reveal();}}>{p.options ? '不确定，直接看答案' : '我做完了，看答案'}</button>
            {!p.options && <button onClick={advanceHint}>还不会，分步提示</button>}
            <button onClick={copyPrompt}>复制批改提示词</button>
          </div>
        )}
        {copied && <p className="hint">{copied}</p>}
      </section>

      {!shown&&hintLevel>0&&<ProgressiveHints problem={p} level={hintLevel} advance={advanceHint}/>}

      {!p.options && <AiGradePanel key={`${id}-${aiRevision}`} problem={p} maxScore={exam?.score} disabled={submitted} onResult={r => { setAi(r ?? undefined); setRecognition(undefined); setGrade(r?.grade ?? null); setTags(r?.tags ?? []); if (r) { if (!shown) { setWorkMode('reference'); setHintsUsed(true); } reveal(); } }} onRecognition={r => { setRecognition(r ?? undefined); if (!r || r.status !== 'checked') { setGrade(null); setTags([]); } }} />}

      {shown && (
        <section className="card answer">
          <h3>答案</h3>
          <Md>{p.answer}</Md>
          <h3>详细解答</h3>
          <Md>{p.solution}</Md>
          {!!p.pitfalls?.length&&<aside className="pitfall-alert" aria-label="易错红线"><h3>易错红线</h3><ul>{p.pitfalls.map(t=><li key={t}><Md>{t}</Md></li>)}</ul></aside>}
          {p.note && <p className="note-src">说明：{p.note}</p>}
          {!copied && !p.options && (
            <button className="ghost small" onClick={copyPrompt}>复制批改提示词（发给 Gemini 或 ChatGPT）</button>
          )}
        </section>
      )}

      {shown && !submitted && (
        <section className="card grade">
          <h3>{p.options ? '确认结果' : '对照答案，给自己打分'}</h3>
          {!p.options&&fullScore!==undefined&&fullScore>0&&<ReferenceScoreEditor problemId={id} max={fullScore} onChange={(value,valid,lost)=>{setScore(value);setScoreValid(valid);setStepErrors(lost);}}/>}
          <p className="muted small">记忆/复习评级</p>
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
              <div className="actions error-shortcuts">{[['概念/性质误用','概念不清'],['计算/代数失误','计算失误'],['思路卡壳','方法不会']].map(([label,value])=><button key={value} aria-pressed={tags.includes(value as MistakeTag)} className={tags.includes(value as MistakeTag)?'on':''} onClick={()=>setTags(tags.includes(value as MistakeTag)?tags.filter(t=>t!==value):[...tags,value as MistakeTag])}>{label}</button>)}</div>
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
              <p className="muted small">概念/公式错误会安排次日基础卡；方法卡壳会安排三天后换家族验证。计算失误保留正常评级间隔，下次提醒验算。</p>
            </>
          )}
          {ai && !recognition && <p className="muted small">请先在批改区选择转写复核情况。</p>}
          {(grade!==null&&grade<3||score&&score.earned<score.max)&&<div className="skill-errors"><p className="muted">具体失分步骤（可多选）</p><div className="tag-buttons">{trainings.flatMap(t=>t.errors).map(s=><label className="tag" key={s.id}><input type="checkbox" checked={skillErrors.includes(s.id)||stepErrors.includes(s.id)} onChange={e=>setSkillErrors(e.target.checked?[...new Set([...skillErrors,s.id])]:skillErrors.filter(id=>id!==s.id))}/>{s.label}</label>)}</div></div>}
          {!scoreValid&&<p className="hint">请核对参考得分，分步评分需逐项填写且不能超过各项满分。</p>}
          <button className="primary" disabled={grade === null || !scoreValid || !!(ai && !recognition)} onClick={submit}>记录</button>
          {saveError && <p className="hint" role="alert">{saveError}</p>}
        </section>
      )}

      {submitted && st && (
        <section className="card result">
          {st.inMistakes ? (
            <p>
              已记入错题本，<b>{relDay(now, st.card.due.getTime())}</b>重做。
              {st.streak === 1 && ' 隔天再全对一次就能移出错题本。'}
            </p>
          ) : (
            <p>
              <b>已过关。</b>
              {st.streak >= 2 && st.attempts.some(a=>a.grade<3) ? '隔日连续两次全对，已移出错题本。' : '知识点是否掌握，还需换题验证。'}
            </p>
          )}
          <div className="actions">
            {exam && !exam.locked && <button onClick={()=>{setSubmitted(false);setAi(undefined);setRecognition(undefined);setScore(undefined);setScoreValid(true);setSkillErrors([]);setStepErrors([]);setAiRevision(n=>n+1);}}>重新评分</button>}
            {nextId ? <button className="primary" onClick={() => navigate(nextId)}>下一题</button> : onComplete ? <button className="primary" onClick={onComplete}>查看整卷结果</button> : <button className="primary" onClick={() => go('#/today')}>回到今日</button>}
          </div>
        </section>
      )}

      {(shown||workMode!=='independent'||hintsUsed)&&<section className="card">
        <h3>我的笔记</h3>
        <NoteEditor key={id} problemId={id} note={note} onError={setSaveError} />
        {saveError && <p className="hint" role="alert">{saveError}</p>}
        {st && st.attempts.length > 0 && (
          <>
            <h3>做题记录</h3>
            <ul className="history">
              {[...st.attempts].reverse().map((a) => (
                <li key={a.id}>
                  {dateLabel(a.t)} · <span className={`g${a.grade}`}>{GRADE_LABELS[a.grade]}</span> · {mmss(a.sec)}
                  {' · '}{a.workMode === 'independent' && !a.hintsUsed ? '独立作答' : a.workMode === 'correction' ? '订正' : a.workMode === 'reference' || a.hintsUsed ? '使用资料/提示' : '旧记录：辅助条件未标注'}
                  {a.score&&` · 参考得分 ${a.score.earned}/${a.score.max}`}
                  {!!a.skillErrors?.length&&` · ${a.skillErrors.map(skillErrorLabel).join('、')}`}
                  {a.tags.length > 0 && ` · ${a.tags.join('、')}`}
                  {a.ai && <details><summary>AI 点评 · {a.ai.model}</summary><Md>{a.ai.transcript}</Md><Md>{a.ai.feedback}</Md><p className="muted small">转写复核：{a.recognition?.status === 'checked' ? '转写正确' : a.recognition?.status === 'corrected' ? '已修正' : a.recognition?.status === 'unreadable' ? '照片看不清' : '未标注'}</p>{a.recognition?.status === 'corrected' && <><h3>修正后的转写</h3><Md preserveBadMath>{a.recognition.transcript}</Md></>}</details>}
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
        {family.length>1&&<p><a href={`#/practice?family=${encodeURIComponent(problemFamily(id))}`}>连练同一原始大题/共享来源的 {family.length} 个单元 →</a></p>}
        {shown&&<div className="actions">{trainings.map(t=><a className="button small" key={t.id} href={`#/train/${t.id}?from=${id}`}>{t.title}专项训练 →</a>)}</div>}
      </section>}
    </div>
  );
}
