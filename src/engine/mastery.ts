import { cardById, kpById, kpPapers, knowledge, patternById, patternPapers, patterns, problemById, realPaperCount } from '../content';
import type { MistakeTag, TrainerEvent } from '../types';
import { MISTAKE_TAGS } from '../types';
import { DAY } from './scheduler';

export interface Mastery {
  /** 掌握度 0~1，带先验 0.5 */
  m: number;
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
  factors: { star: number; gap: number; freq: number };
}

const HALF_LIFE_DAYS = 21;
const CARD_WEIGHT = 0.3;
const CARD_SCORE = [0, 0, 0.5, 1, 1];

function emptyTags(): Record<MistakeTag, number> {
  return Object.fromEntries(MISTAKE_TAGS.map((t) => [t, 0])) as Record<MistakeTag, number>;
}

interface Acc {
  ws: number;
  w: number;
  attempts: number;
  reviews: number;
  tags: Record<MistakeTag, number>;
}

export function computeMastery(events: TrainerEvent[], now: number) {
  const kp = new Map<string, Acc>();
  const pat = new Map<string, Acc>();
  const get = (m: Map<string, Acc>, id: string) => {
    let a = m.get(id);
    if (!a) {
      a = { ws: 0, w: 0, attempts: 0, reviews: 0, tags: emptyTags() };
      m.set(id, a);
    }
    return a;
  };
  for (const e of events) {
    const decay = Math.pow(0.5, Math.max(0, now - e.t) / DAY / HALF_LIFE_DAYS);
    if (e.kind === 'attempt') {
      const p = problemById.get(e.problemId);
      if (!p) continue;
      const s = e.grade / 3;
      const targets = [...p.kps.map((id) => get(kp, id)), ...(p.pattern ? [get(pat, p.pattern)] : [])];
      for (const a of targets) {
        a.ws += decay * s;
        a.w += decay;
        a.attempts += 1;
        if (e.grade < 3) for (const t of e.tags) a.tags[t] = (a.tags[t] ?? 0) + 1;
      }
    } else if (e.kind === 'review') {
      const c = cardById.get(e.cardId);
      if (!c) continue;
      const s = CARD_SCORE[e.rating];
      const w = decay * CARD_WEIGHT;
      const targets = c.kps.map((id) => get(kp, id));
      if (c.id.startsWith('pattern-')) targets.push(get(pat, c.id.slice('pattern-'.length)));
      for (const a of targets) {
        a.ws += w * s;
        a.w += w;
        a.reviews += 1;
      }
    }
  }
  const finish = (a: Acc | undefined): Mastery =>
    a
      ? { m: (a.ws + 0.5) / (a.w + 1), attempts: a.attempts, reviews: a.reviews, tags: a.tags }
      : { m: 0.5, attempts: 0, reviews: 0, tags: emptyTags() };
  return { kp: (id: string) => finish(kp.get(id)), pattern: (id: string) => finish(pat.get(id)) };
}

export type MasteryIndex = ReturnType<typeof computeMastery>;

export function priority(stars: number, m: number, paperCount: number): Ranked['factors'] & { value: number } {
  const star = stars / 5;
  const gap = 1 - m;
  const freq = 1 + paperCount / Math.max(7, realPaperCount);
  return { star, gap, freq, value: star * gap * freq };
}

export function rankKnowledge(mi: MasteryIndex): Ranked[] {
  return knowledge
    .map((k) => {
      const mastery = mi.kp(k.id);
      const years = kpPapers.get(k.id)?.size ?? 0;
      const pr = priority(k.stars, mastery.m, years);
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
      const pr = priority(stars, mastery.m, years);
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
  if (!p) return 0;
  const kpScores = p.kps.map((id) => {
    const k = kpById.get(id);
    return priority(k?.stars ?? 1, mi.kp(id).m, kpPapers.get(id)?.size ?? 0).value;
  });
  const pat = p.pattern ? patternById.get(p.pattern) : undefined;
  const patScore = pat ? priority(Math.max(...pat.kps.map((id) => kpById.get(id)?.stars ?? 1)), mi.pattern(pat.id).m, patternPapers.get(pat.id)?.size ?? 0).value : 0;
  return Math.max(0, ...kpScores, patScore);
}
