import data from './generated/catalog.json' with { type:'json' };
import type { CardInfo, ProblemInfo, Paper } from '../types';
import { knowledge, CHAPTERS } from './knowledge';
import { papers } from './papers';
import { patterns } from './patterns';
export { knowledge, CHAPTERS, papers, patterns };
// 构建前由原始 TS 题库生成，仅含调度所需字段。
export const problems = data.problems as ProblemInfo[];
export const cards = data.cards as CardInfo[];
export const kpById = new Map(knowledge.map(k => [k.id, k]));
export const patternById = new Map(patterns.map(p => [p.id, p]));
export const paperById = new Map(papers.map(p => [p.id, p]));
export const problemById = new Map(problems.map(p => [p.id, p]));
export const cardById = new Map(cards.map(c => [c.id, c]));
// 每个知识点、题型在多少套真题里出现过
function countPapers(key: (p: ProblemInfo) => string[], include: (paper: Paper) => boolean = p => p.kind === '真题' && !p.school): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const p of problems) {
    const realPapers = p.sources.filter((s) => { const paper = paperById.get(s.paper); return paper && include(paper); }).map((s) => s.paper);
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
const initial = (p: Paper) => p.kind === '真题' && !p.school && p.examType === '初试';
const interview = (p: Paper) => p.kind === '真题' && !p.school && p.examType === '复试';
const course = (p: Paper) => p.kind !== '真题' && !p.school;
export const initialPaperCount = papers.filter(initial).length;
export const kpInitialPapers = countPapers(p => p.kps, initial);
export const patternInitialPapers = countPapers(p => p.pattern ? [p.pattern] : [], initial);
export const kpInterviewPapers = countPapers(p => p.kps, interview);
export const patternInterviewPapers = countPapers(p => p.pattern ? [p.pattern] : [], interview);
export const kpCoursePapers = countPapers(p => p.kps, course);
export const patternCoursePapers = countPapers(p => p.pattern ? [p.pattern] : [], course);

export function paperYears(set: Set<string> | undefined): number[] {
  if (!set) return [];
  return [...set].map((id) => paperById.get(id)?.year ?? 0).filter(Boolean).sort();
}
