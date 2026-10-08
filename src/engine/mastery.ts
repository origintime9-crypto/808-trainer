import { cardById, kpById, kpPapers, knowledge, patternById, patternPapers, patterns, problemById, realPaperCount } from '../content';
import type { MistakeTag, TrainerEvent } from '../types';
import { MISTAKE_TAGS } from '../types';
import { replay, retrievability, startOfToday, type Schedule } from './scheduler';
import { examEmphasis, fits808 } from '../content/target808';

export interface Mastery {
  /** 当前掌握估计 0~1；无证据时先验0.5，并显示待测。 */
  m: number;
  ability: number;
  retention: number;
  forgetting: number;
  confidence: number;
  uniqueProblems: number;
  dueCount: number;
  lastPractice?: number;
  /** 做题次数 */
  attempts: number;
  /** 卡片复习次数 */
  reviews: number;
  tags: Record<MistakeTag, number>;
}

export interface Ranked {
  id: string;
  name: string;
  stars: number;
  years: number;
  mastery: Mastery;
  priority: number;
  factors: { star: number; gap: number; freq: number; memory: number; exploration: number; exam: number };
}

const CARD_WEIGHT = 0.3;
const MAX_CARD_EVIDENCE = 1.2;
const CARD_SCORE = [0, 0, 0.5, 1, 1];

function emptyTags(): Record<MistakeTag, number> {
  return Object.fromEntries(MISTAKE_TAGS.map((t) => [t, 0])) as Record<MistakeTag, number>;
}

interface Acc {
  ws: number;
  w: number;
  retentionSum: number;
  cardWeight: number;
  cardScore: number;
  cardRetention: number;
  uniqueProblems: number;
  dueCount: number;
  lastPractice?: number;
  attempts: number;
  reviews: number;
  tags: Record<MistakeTag, number>;
}

/**
 * 能力证据与记忆分开估计：按题目/卡片及日去重，最近一次日成绩占65%；
 * 同一题的总证据封顶，卡片证据每个知识点最多1.2，综合题分摊归因。
 * 记忆来自每道题自己的FSRS稳定度，不把忘却的错题恢复成平均掌握。
 * 仅由原事件派生，既有进度及跨设备同步不需要迁移。
 */
export function computeMastery(events: TrainerEvent[], now: number, schedule?: Schedule) {
  const valid = events.filter(e => e.t <= now);
  const sched = schedule && valid.length === events.length ? schedule : replay(valid, '9999-12-31');
  const kp = new Map<string, Acc>();
  const pat = new Map<string, Acc>();
  const get = (m: Map<string, Acc>, id: string) => {
    let a = m.get(id);
    if (!a) {
      a = { ws: 0, w: 0, retentionSum: 0, cardWeight: 0, cardScore: 0, cardRetention: 0,
        uniqueProblems: 0, dueCount: 0, attempts: 0, reviews: 0, tags: emptyTags() };
      m.set(id, a);
    }
    return a;
  };
  const evidence = new Map<string, { score: number; t: number; event: TrainerEvent }[]>();
  for (const e of [...valid].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id))) {
    if (e.kind === 'attempt') {
      const p = problemById.get(e.problemId);
      if (!p) continue;
      const targets = [...p.kps.map((id) => get(kp, id)), ...(p.pattern ? [get(pat, p.pattern)] : [])];
      for (const a of targets) {
        a.attempts += 1;
        if (e.grade < 3) for (const t of e.tags) a.tags[t] = (a.tags[t] ?? 0) + 1;
      }
    } else if (e.kind === 'review') {
      const c = cardById.get(e.cardId);
      if (!c) continue;
      const targets = c.kps.map((id) => get(kp, id));
      if (c.id.startsWith('pattern-')) targets.push(get(pat, c.id.slice('pattern-'.length)));
      for (const a of targets) a.reviews += 1;
    } else continue;
    const id = e.kind === 'attempt' ? 'p:' + e.problemId : 'c:' + e.cardId;
    const rows = evidence.get(id) ?? [];
    const row = { score: e.kind === 'attempt' ? e.grade / 3 : CARD_SCORE[e.rating], t: e.t, event: e };
    if (rows.length && startOfToday(rows[rows.length - 1].t) === startOfToday(e.t)) rows[rows.length - 1] = row;
    else rows.push(row);
    evidence.set(id, rows);
  }
  for (const rows of evidence.values()) {
    const last = rows[rows.length - 1], e = last.event;
    let quality = rows[0].score;
    for (const row of rows.slice(1)) quality = 0.65 * row.score + 0.35 * quality;
    const problem = e.kind === 'attempt' ? problemById.get(e.problemId) : undefined;
    const card = e.kind === 'review' ? cardById.get(e.cardId) : undefined;
    const state = e.kind === 'attempt' ? sched.problems.get(e.problemId) : e.kind === 'review' ? sched.cards.get(e.cardId) : undefined;
    const retention = state ? retrievability(state.card, now) : 1;
    const kps = problem?.kps ?? card?.kps ?? [];
    const targets = kps.map(id => ({ acc: get(kp, id), fraction: 1 / Math.max(1, kps.length) }));
    const pattern = problem?.pattern ?? (card?.id.startsWith('pattern-') ? card.id.slice('pattern-'.length) : undefined);
    if (pattern) targets.push({ acc: get(pat, pattern), fraction: 1 });
    for (const { acc: a, fraction } of targets) {
      a.lastPractice = Math.max(a.lastPractice ?? 0, last.t);
      if (state && state.card.due.getTime() <= now) a.dueCount++;
      if (problem) {
        a.w += fraction; a.ws += quality * fraction; a.retentionSum += retention * fraction;
        a.uniqueProblems++;
      } else {
        const weight = CARD_WEIGHT * fraction;
        a.cardWeight += weight; a.cardScore += quality * weight; a.cardRetention += retention * weight;
      }
    }
  }
  const finish = (a: Acc | undefined): Mastery => {
    if (!a) return { m: 0.5, ability: 0.5, retention: 1, forgetting: 0, confidence: 0,
      uniqueProblems: 0, dueCount: 0, attempts: 0, reviews: 0, tags: emptyTags() };
    const scale = a.cardWeight ? Math.min(1, MAX_CARD_EVIDENCE / a.cardWeight) : 1;
    const weight = a.w + a.cardWeight * scale;
    const ability = (a.ws + a.cardScore * scale + 0.5) / (weight + 1);
    const retention = weight ? (a.retentionSum + a.cardRetention * scale) / weight : 1;
    return { m: ability * (0.25 + 0.75 * retention), ability, retention, forgetting: 1 - retention,
      confidence: weight / (weight + 2), uniqueProblems: a.uniqueProblems, dueCount: a.dueCount,
      lastPractice: a.lastPractice, attempts: a.attempts, reviews: a.reviews, tags: a.tags };
  };
  return { kp: (id: string) => finish(kp.get(id)), pattern: (id: string) => finish(pat.get(id)) };
}

export type MasteryIndex = ReturnType<typeof computeMastery>;

export function priority(stars: number, m: number, paperCount: number, evidence?: Mastery, exam = 1): Ranked['factors'] & { value: number } {
  const star = Math.max(1, Math.min(5, stars)) / 5;
  const gap = Math.max(0, Math.min(1, 1 - m));
  const freq = 1 + Math.max(0, Math.min(realPaperCount, paperCount)) / Math.max(1, realPaperCount);
  const memory = 0.45 * (evidence?.forgetting ?? 0);
  const exploration = 0.15 * (1 - (evidence?.confidence ?? 1));
  return { star, gap, freq, memory, exploration, exam, value: star * freq * exam * (gap ** 1.4 + memory + exploration) };
}

export function masteryStatus(m: Mastery): '待测' | '需补强' | '巩固中' | '较稳固' | '需复习' {
  if (!m.attempts && !m.reviews) return '待测';
  if (m.ability >= 0.7 && m.forgetting >= 0.2) return '需复习';
  if (m.ability < 0.55 || m.m < 0.5) return '需补强';
  if (m.uniqueProblems >= 3 && m.ability >= 0.8 && m.m >= 0.72 && m.retention >= 0.85) return '较稳固';
  return '巩固中';
}

export function rankKnowledge(mi: MasteryIndex): Ranked[] {
  return knowledge
    .map((k) => {
      const mastery = mi.kp(k.id);
      const years = kpPapers.get(k.id)?.size ?? 0;
      const pr = priority(k.stars, mastery.m, years, mastery, examEmphasis(k.id));
      return { id: k.id, name: `${k.id} ${k.title}`, stars: k.stars, years, mastery, priority: pr.value, factors: pr };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function rankPatterns(mi: MasteryIndex): Ranked[] {
  return patterns
    .map((p) => {
      const mastery = mi.pattern(p.id);
      const stars = Math.max(...p.kps.map((id) => kpById.get(id)?.stars ?? 1));
      const years = patternPapers.get(p.id)?.size ?? 0;
      const pr = priority(stars, mastery.m, years, mastery, Math.max(1, ...p.kps.map(examEmphasis)));
      return { id: p.id, name: p.name, stars, years, mastery, priority: pr.value, factors: pr };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function tagTotals(events: TrainerEvent[]): Record<MistakeTag, number> {
  const t = emptyTags();
  for (const e of events) if (e.kind === 'attempt' && e.grade < 3) for (const x of e.tags) t[x] += 1;
  return t;
}

export function problemPriority(problemId: string, mi: MasteryIndex): number {
  const p = problemById.get(problemId);
  if (!p || !fits808(problemId)) return 0;
  const kpScores = p.kps.map((id) => {
    const k = kpById.get(id);
    const m = mi.kp(id);
    return priority(k?.stars ?? 1, m.m, kpPapers.get(id)?.size ?? 0, m, examEmphasis(id)).value;
  });
  const pat = p.pattern ? patternById.get(p.pattern) : undefined;
  const pm = pat ? mi.pattern(pat.id) : undefined;
  const patScore = pat && pm ? priority(Math.max(...pat.kps.map((id) => kpById.get(id)?.stars ?? 1)), pm.m, patternPapers.get(pat.id)?.size ?? 0, pm, Math.max(1, ...pat.kps.map(examEmphasis))).value : 0;
  const knowledgeScore = 0.7 * Math.max(0, ...kpScores) + 0.3 * (kpScores.reduce((sum, value) => sum + value, 0) / Math.max(1, kpScores.length));
  return Math.max(knowledgeScore, patScore);
}

/** 给用户可读的推荐原因，避免只显示一个不透明分数。 */
export function recommendationReason(problemId: string, mi: MasteryIndex): string {
  const p = problemById.get(problemId);
  if (!p) return '';
  const top = p.kps.map(id => ({ id, m: mi.kp(id), k: kpById.get(id) }))
    .sort((a, b) => priority(b.k?.stars ?? 1, b.m.m, kpPapers.get(b.id)?.size ?? 0, b.m, examEmphasis(b.id)).value - priority(a.k?.stars ?? 1, a.m.m, kpPapers.get(a.id)?.size ?? 0, a.m, examEmphasis(a.id)).value)[0];
  if (!top) return '补充练习';
  const status = masteryStatus(top.m);
  const reason = status === '待测' ? '补充测评' : status === '需复习' ? '临近遗忘，安排复习' : status === '需补强' ? '薄弱考点补强' : '换题巩固';
  return (top.k?.title ?? top.id) + ' · ' + reason + (top.k && top.k.stars >= 4 ? ' · 重点考点' : '');
}
