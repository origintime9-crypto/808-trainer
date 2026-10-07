import { useState } from 'react';
import { paperById } from '../content';
import { paperProblems, SCORE_COEF } from '../engine/paper';
import { go } from '../format';
import { setProblemList, useEvents } from '../state';
import { ProblemPage } from './ProblemPage';

interface Session { paper: string; started: number; current: string; finished: boolean }
const KEY = 'trainer808.exam.v1';
function load(paper: string): Session | null {
  try { const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); return s?.paper === paper && Number.isFinite(s.started) ? s : null; } catch { return null; }
}
export function ExamPage({ paper }: { paper: string }) {
  const list = paperProblems(paper), info = paperById.get(paper);
  const events = useEvents();
  const [session, setSession] = useState<Session | null>(() => load(paper));
  const save = (s: Session) => { sessionStorage.setItem(KEY, JSON.stringify(s)); setSession(s); setProblemList(list.map(p => p.id)); };
  const start = () => save({ paper, started: Date.now(), current: list[0].id, finished: false });
  const done = list.map(p => ({ p, a: events.filter(e => e.kind === 'attempt' && !e.examId && e.problemId === p.id && e.t >= (session?.started ?? Infinity)).at(-1) })).filter(x => x.a?.kind === 'attempt');
  const scored = done.reduce((sum, { p, a }) => sum + (p.sources.find(s => s.paper === paper)?.score ?? 0) * (a?.kind === 'attempt' ? SCORE_COEF[a.grade] : 0), 0);
  const uncertainScore = list.some(p => !p.sources.find(s => s.paper === paper)?.score);
  const subtotal = list.reduce((sum, p) => sum + (p.sources.find(s => s.paper === paper)?.score ?? 0), 0);
  const scoreNotice = !uncertainScore && info?.totalScore && subtotal !== info.totalScore ? `题面小题分值合计 ${subtotal} 分，卷面标注 ${info.totalScore} 分；估分按可核对的小题分值计算。` : '';
  if (!info || !list.length) return <section className="card">这套卷尚未录入。<a href="#/practice">返回题库</a></section>;
  if (!session) return <section className="card"><h2>{info.title} · 整卷练习</h2><p>{list.length} 个作答单元{info.totalScore && `，全卷 ${info.totalScore} 分`}。按卷面顺序作答，每题仍可确认自评并保存。</p><p className="muted">整卷估分只统计本次开始后的记录。{uncertainScore && '未标出的分值不计入估分。'}{scoreNotice}</p><button className="primary" onClick={start}>开始整卷练习</button></section>;
  if (session.finished) return <section className="card"><h2>本次整卷结果</h2><p>{info.title} · 完成 {done.length} / {list.length} 个作答单元</p><p>自评估分 <b>{Math.round(scored * 10) / 10}</b>{info.totalScore && ` / ${info.totalScore}`} 分</p><p className="muted small">按不会 0%、部分对 30%、大部分对 70%、全对 100% 估算。{uncertainScore && '未标明分值的题仅记录练习进度。'}{scoreNotice}</p><div className="actions"><button onClick={() => save({ ...session, finished: false })}>继续检查</button><button className="primary" onClick={start}>重新开始一卷</button><button onClick={() => go('#/mistakes')}>去错题本</button></div></section>;
  const current = list.find(p => p.id === session.current) ?? list[0];
  return <div><section className="card"><div className="card-head"><h2>{info.title}</h2><button onClick={() => save({ ...session, finished: true })}>结束并估分</button></div><p className="muted small">已做 {done.length} / {list.length} 个单元 · 本次估分 {Math.round(scored * 10) / 10}</p><div className="exam-progress">{list.map((p, i) => <button key={p.id} aria-label={`整卷第 ${i + 1} 单元`} className={p.id === current.id ? 'primary' : ''} onClick={() => save({ ...session, current: p.id })}>{done.some(x => x.p.id === p.id) ? '✓' : i + 1}</button>)}</div></section><ProblemPage key={`${session.started}-${current.id}`} id={current.id} onNavigate={id => save({ ...session, current: id })} onComplete={() => save({ ...session, finished: true })} /></div>;
}
