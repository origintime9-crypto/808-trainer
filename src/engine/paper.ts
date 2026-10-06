import { problems } from '../content';
import type { Problem } from '../types';

function order(no: string): number {
  const chinese = '一二三四五六七八九十';
  const head = chinese.includes(no[0]) ? chinese.indexOf(no[0]) + 1 : Number(no.match(/^\d+/)?.[0] ?? 0);
  const rest = no.replace(/^\d+|^[一二三四五六七八九十]/, '');
  const sub = Number(rest.match(/\d+/)?.[0] ?? 0);
  return head * 100 + sub;
}
export function paperProblems(id: string): Problem[] {
  return problems.filter(p => p.sources.some(s => s.paper === id)).sort((a, b) => order(a.sources.find(s => s.paper === id)!.no) - order(b.sources.find(s => s.paper === id)!.no));
}
export const SCORE_COEF = [0, 0.3, 0.7, 1];
