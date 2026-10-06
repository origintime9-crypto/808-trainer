import type { Problem } from '../../types';
export function problem(paper: string, no: string, kps: string[], pattern: string, stem: string, answer: string, solution: string, extra: Partial<Problem> = {}): Problem {
  const serial = no.replace(/^[一二三四五六七八九十]/, c => String('一二三四五六七八九十'.indexOf(c) + 1)).replace(/[()（）.]/g, '-').replace(/-$/, '');
  return { id: `${paper}-${serial}`, sources: [{ paper, no }], kps, pattern, type: '计算', stem, answer, solution, verified: 'checked', ...extra };
}
