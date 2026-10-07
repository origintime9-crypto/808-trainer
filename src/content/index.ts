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
import { tkExam01 } from './problems/tk-exam-01';
import { tkExam02 } from './problems/tk-exam-02';
import { tkExam03 } from './problems/tk-exam-03';
import { tkExam04 } from './problems/tk-exam-04';
import { tkExam05 } from './problems/tk-exam-05';
import { tkExam06 } from './problems/tk-exam-06';
import { tkExam07 } from './problems/tk-exam-07';
import { tkExam08 } from './problems/tk-exam-08';
import { tkExam09 } from './problems/tk-exam-09';
import { tkExam10 } from './problems/tk-exam-10';
import { tkExam11 } from './problems/tk-exam-11';
import { tkExam12 } from './problems/tk-exam-12';
import { tkExam13 } from './problems/tk-exam-13';
import { tkExam14 } from './problems/tk-exam-14';
import { tkExam15 } from './problems/tk-exam-15';
import { xaut2024, sau2024, sxu2024 } from './problems/external';

export { knowledge, CHAPTERS, papers, patterns };

const allProblems: Problem[] = [...zt2026, ...zt2023, ...zt2024, ...zt2025, ...zt2018, ...zt2017, ...zt2016, ...choicesShared, ...zpShared, ...tkReview, ...tkTotal, ...hw1, ...hw2, ...hw3, ...hw4, ...hw5, ...hw6, ...hw7, ...tkKey, ...tkExam01, ...tkExam02, ...tkExam03, ...tkExam04, ...tkExam05, ...tkExam06, ...tkExam07, ...tkExam08, ...tkExam09, ...tkExam10, ...tkExam11, ...tkExam12, ...tkExam13, ...tkExam14, ...tkExam15, ...xaut2024, ...sau2024, ...sxu2024];
// 完全同题合并来源，保留最早录入的编号；选项不同的变式仍保留。
const duplicateOf: Record<string, string> = {
  'ext-xaut2024-3-4': 'tk-key-9',
  'zt2024-3-2-1': 'zt2023-3-3', 'zt2016-1-5': 'zt2023-1-4',
  'zt2016-1-6': 'zt2017-1-5', 'zt2018-2-6': 'zt2023-2-7',
  'hw1-1-4-5': 'zt2024-1-2', 'hw1-1-13-7': 'zt2025-1-1',
  'hw3-3-13-1': 'zt2023-3-3',
  'hw4-4-19-1': 'zt2023-4-1', 'hw4-4-19-2': 'zt2023-4-2',
  'hw4-4-19-3': 'zt2023-4-3', 'hw4-4-19-4': 'zt2023-4-4',
  'tk-key-1-1': 'zt2023-1-1', 'tk-key-3': 'zt2023-1-3',
  'tk-key-15': 'zt2023-2-4', 'tk-key-18': 'hw7-7-3-1',
  'tk-exam-01-1-4': 'tk-review-16',
  'tk-exam-02-1-5': 'tk-review-6', 'tk-exam-02-2-1': 'tk-review-20',
  'tk-exam-02-1-7': 'tk-exam-01-1-7', 'tk-exam-02-1-8': 'tk-exam-01-1-8',
  'tk-exam-02-1-9': 'tk-exam-01-1-9', 'tk-exam-02-1-10': 'tk-exam-01-1-10',
  'tk-exam-03-1-1': 'tk-review-6', 'tk-exam-03-1-2': 'tk-exam-02-1-6',
  'tk-exam-03-1-3': 'tk-exam-02-1-3', 'tk-exam-03-1-4': 'tk-exam-02-1-4',
  'tk-exam-03-1-5': 'tk-exam-02-1-1', 'tk-exam-03-1-6': 'tk-exam-02-1-2',
  'tk-exam-03-2-1': 'tk-exam-01-2-5',
  'tk-exam-04-1-10': 'tk-exam-02-2-4',
  'tk-exam-05-1-3': 'zt2023-1-5', 'tk-exam-05-2-2': 'tk-review-12',
  'tk-exam-06-1-9': 'tk-review-17',
  'tk-exam-06-25-1': 'tk-exam-04-32-1', 'tk-exam-06-25-2': 'tk-exam-04-32-2',
  'tk-exam-06-25-3': 'tk-exam-04-32-3', 'tk-exam-06-25-4': 'tk-exam-04-32-4',
  'tk-exam-07-32-1': 'tk-review-23-1', 'tk-exam-07-32-3': 'tk-review-23-2',
  'tk-exam-08-1-9': 'hw5-5-2-2',
  'tk-exam-09-1-2': 'tk-exam-01-1-3',
  'tk-exam-09-1-5': 'tk-exam-07-1-3', 'tk-exam-09-1-6': 'tk-exam-08-1-7',
  'tk-exam-09-1-7': 'tk-exam-08-1-10', 'tk-exam-09-1-8': 'tk-exam-07-1-5',
  'tk-exam-09-1-9': 'tk-exam-07-1-6', 'tk-exam-09-1-10': 'tk-exam-07-1-8',
  'tk-exam-09-22-1': 'tk-exam-08-22-1', 'tk-exam-09-22-2': 'tk-exam-08-22-2',
  'tk-exam-09-24-1': 'tk-exam-07-22-1', 'tk-exam-09-24-2': 'tk-exam-07-22-2',
  'tk-exam-09-31-1': 'tk-review-23-1', 'tk-exam-09-31-3': 'tk-review-23-2',
  'tk-exam-09-31-2a': 'tk-exam-07-32-2a', 'tk-exam-09-31-2b': 'tk-exam-07-32-2b',
  'tk-exam-09-31-2c': 'tk-exam-07-32-2c', 'tk-exam-09-31-4': 'tk-exam-07-32-4',
  'tk-exam-09-32-1': 'tk-exam-06-32-1', 'tk-exam-09-32-2': 'tk-exam-06-32-2',
  'tk-exam-11-31-1': 'tk-exam-05-32-1', 'tk-exam-11-31-2': 'tk-exam-05-32-2',
  'tk-exam-11-32-A': 'tk-exam-03-32-A', 'tk-exam-11-32-B': 'tk-exam-03-32-B',
  'tk-exam-11-32-C': 'tk-exam-03-32-C', 'tk-exam-11-32-D': 'tk-exam-03-32-D',
  'tk-exam-11-32-E': 'tk-exam-03-32-E',
  'tk-exam-12-1-3': 'tk-exam-07-1-3', 'tk-exam-12-1-4': 'tk-exam-07-1-4',
  'tk-exam-12-1-6': 'tk-exam-11-1-10', 'tk-exam-12-1-9': 'hw5-5-2-2',
  'tk-exam-12-1-8': 'tk-exam-08-1-8',
  'tk-exam-12-1-10': 'tk-exam-08-1-10',
  'tk-exam-12-24-1': 'tk-exam-06-22-1', 'tk-exam-12-24-2': 'tk-exam-06-22-2',
  'tk-exam-12-2-5': 'tk-exam-06-2-4',
  'tk-exam-12-31-1a': 'tk-exam-06-31-1a', 'tk-exam-12-31-1b': 'tk-exam-06-31-1b',
  'tk-exam-12-31-1c': 'tk-exam-06-31-1c', 'tk-exam-12-31-2': 'tk-exam-06-31-2',
  'tk-exam-12-31-3': 'tk-exam-06-31-3',
  'tk-exam-12-32-1': 'tk-exam-10-32-1', 'tk-exam-12-32-2': 'tk-exam-10-32-2',
  'tk-exam-12-32-3': 'tk-exam-10-32-3',
  'tk-exam-13-1-9': 'zt2023-1-6',
  'tk-exam-14-1-10': 'tk-exam-06-1-6',
  'tk-exam-14-2-4': 'tk-exam-03-2-4',
  'tk-exam-15-1-1': 'zt2023-1-7',
  'tk-exam-15-2-1': 'tk-exam-11-1-5', 'tk-exam-15-2-2': 'tk-exam-01-2-2',
  'tk-exam-15-2-5': 'tk-exam-05-1-6',
  'tk-exam-15-31-1': 'tk-review-23-1',
  'tk-exam-15-31-2a': 'tk-exam-07-32-2a', 'tk-exam-15-31-2b': 'tk-exam-07-32-2b',
  'tk-exam-15-31-2c': 'tk-exam-07-32-2c', 'tk-exam-15-31-3': 'tk-review-23-2',
  'tk-exam-15-31-4': 'tk-exam-07-32-4',
  'tk-exam-15-32-1a': 'tk-exam-11-23-1a', 'tk-exam-15-32-1b': 'tk-exam-11-23-1b',
  'tk-exam-15-32-1c': 'tk-exam-11-23-1c', 'tk-exam-15-32-2': 'tk-exam-11-23-2',
};
for (const item of allProblems) {
  const target = allProblems.find(p => p.id === duplicateOf[item.id]);
  if (target) {
    for (const source of item.sources) {
      if (!target.sources.some(s => s.paper === source.paper && s.no === source.no)) target.sources.push(source);
    }
    // 同题仍保留各来源的题面缺字、单位和参考解说明。
    if (item.note && !target.note?.includes(item.note)) target.note = [target.note, item.note].filter(Boolean).join('；');
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
    const realPapers = p.sources.filter((s) => { const paper = paperById.get(s.paper); return paper?.kind === '真题' && !paper.school; }).map((s) => s.paper);
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
export const realPaperCount = papers.filter((p) => p.kind === '真题' && !p.school).length;

export function paperYears(set: Set<string> | undefined): number[] {
  if (!set) return [];
  return [...set].map((id) => paperById.get(id)?.year ?? 0).filter(Boolean).sort();
}
