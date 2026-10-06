import type { Card, Problem } from '../types';
import { coreCards } from './cards/core';
import { extraCards } from './cards/extra';
import { knowledge, CHAPTERS } from './knowledge';
import { papers } from './papers';
import { patterns } from './patterns';
import { zt2026 } from './problems/zt2026';
import { zpShared, zt2023 } from './problems/zt2023';
import { choicesShared, zt2024 } from './problems/zt2024';
import { zt2025 } from './problems/zt2025';
import { zt2018 } from './problems/zt2018';
import { zt2017 } from './problems/zt2017';
import { zt2016 } from './problems/zt2016';
import { tkReview } from './problems/tk-review';
import { tkTotal } from './problems/tk-total';
import { hw1 } from './problems/hw1';
import { hw2 } from './problems/hw2';
import { hw3 } from './problems/hw3';
import { hw4 } from './problems/hw4';
import { hw5 } from './problems/hw5';
import { hw6 } from './problems/hw6';
import { hw7 } from './problems/hw7';
import { tkKey } from './problems/tk-key';

export { knowledge, CHAPTERS, papers, patterns };

const allProblems: Problem[] = [...zt2026, ...zt2023, ...zt2024, ...zt2025, ...zt2018, ...zt2017, ...zt2016, ...choicesShared, ...zpShared, ...tkReview, ...tkTotal, ...hw1, ...hw2, ...hw3, ...hw4, ...hw5, ...hw6, ...hw7, ...tkKey];
// 完全同题合并来源，保留最早录入的编号；选项不同的变式仍保留。
const duplicateOf: Record<string, string> = {
  'zt2024-3-2-1': 'zt2023-3-3', 'zt2016-1-5': 'zt2023-1-4',
  'zt2016-1-6': 'zt2017-1-5', 'zt2018-2-6': 'zt2023-2-7',
  'hw1-1-4-5': 'zt2024-1-2', 'hw1-1-13-7': 'zt2025-1-1',
  'hw3-3-13-1': 'zt2023-3-3',
  'hw4-4-19-1': 'zt2023-4-1', 'hw4-4-19-2': 'zt2023-4-2',
  'hw4-4-19-3': 'zt2023-4-3', 'hw4-4-19-4': 'zt2023-4-4',
  'tk-key-1-1': 'zt2023-1-1', 'tk-key-3': 'zt2023-1-3',
  'tk-key-15': 'zt2023-2-4', 'tk-key-18': 'hw7-7-3-1',
};
for (const item of allProblems) {
  const target = allProblems.find(p => p.id === duplicateOf[item.id]);
  if (target) for (const source of item.sources) {
    if (!target.sources.some(s => s.paper === source.paper && s.no === source.no)) target.sources.push(source);
  }
}
export const problems = allProblems.filter(p => !duplicateOf[p.id]);

const patternCards: Card[] = patterns.map((p) => ({
  id: `pattern-${p.id}`,
  kps: p.kps,
  front: `题型套路：**${p.name}**，解题步骤是什么？`,
  back: p.method,
}));

export const cards: Card[] = [...coreCards, ...extraCards, ...patternCards];

export const kpById = new Map(knowledge.map((k) => [k.id, k]));
export const patternById = new Map(patterns.map((p) => [p.id, p]));
export const paperById = new Map(papers.map((p) => [p.id, p]));
export const problemById = new Map(problems.map((p) => [p.id, p]));
export const cardById = new Map(cards.map((c) => [c.id, c]));

// 每个知识点、题型在多少套真题里出现过
function countPapers(key: (p: Problem) => string[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const p of problems) {
    const realPapers = p.sources.filter((s) => paperById.get(s.paper)?.kind === '真题').map((s) => s.paper);
    for (const k of key(p)) {
      const set = m.get(k) ?? new Set<string>();
      realPapers.forEach((x) => set.add(x));
      m.set(k, set);
    }
  }
  return m;
}

export const kpPapers = countPapers((p) => p.kps);
export const patternPapers = countPapers((p) => (p.pattern ? [p.pattern] : []));
export const realPaperCount = papers.filter((p) => p.kind === '真题').length;

export function paperYears(set: Set<string> | undefined): number[] {
  if (!set) return [];
  return [...set].map((id) => paperById.get(id)?.year ?? 0).filter(Boolean).sort();
}
