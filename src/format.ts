import { kpById, paperById, patternById } from './content';
import { dayDiff } from './engine/scheduler';
import type { Problem } from './types';

export function sourceLabel(p: Problem): string {
  return p.sources
    .map((s) => {
      const paper = paperById.get(s.paper);
      const name = paper ? (paper.kind === '真题' ? `${paper.year}${paper.examType === '初试' ? '初试' : ''}` : paper.title) : s.paper;
      return `${name} ${s.no}${s.score ? `（${s.score}分）` : ''}`;
    })
    .join(' / ');
}

export function problemScore(p: Problem): number {
  return p.sources.find((s) => s.score)?.score ?? 0;
}

export function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export function kpLabel(id: string): string {
  const k = kpById.get(id);
  return k ? `${k.id} ${k.title}` : id;
}

export function patternLabel(id?: string): string {
  return id ? (patternById.get(id)?.name ?? id) : '';
}

export function relDay(now: number, t: number): string {
  const d = dayDiff(now, t);
  if (d <= 0) return '今天';
  if (d === 1) return '明天';
  if (d === 2) return '后天';
  return `${d} 天后`;
}

export function dateLabel(t: number): string {
  const d = new Date(t);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function go(hash: string) {
  window.location.hash = hash;
}
