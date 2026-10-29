import { problems } from './catalog';
import type { ProblemInfo, Source } from '../types';

/** 按原始大题保守合并；同题的多个来源会连接家族，避免拆小问增加迁移证据。 */
export function sourceFamily(p: ProblemInfo, source: Source): string {
  if (p.family) return p.family;
  if (source.family) return `${source.paper}:${source.family}`;
  const no = source.no.replace(/（/g, '(').replace(/）/g, ')');
  const group = p.type === '填空' || p.type === '选择' ? no
    : no.replace(/\(.*$/, '').replace(/^([一二三四五六七八九十]+)[.．]\d+.*$/, '$1');
  return `${source.paper}:${group}`;
}

const parent = new Map<string, string>();
function root(id: string): string {
  const value = parent.get(id);
  if (!value) { parent.set(id, id); return id; }
  if (value === id) return id;
  const found = root(value); parent.set(id, found); return found;
}
for (const p of problems) {
  const keys = p.sources.map(s => sourceFamily(p, s));
  if (!keys.length) keys.push(p.family ?? p.id);
  const first = root(keys[0]);
  for (const key of keys.slice(1)) {
    const other = root(key);
    if (first !== other) parent.set(other, first);
  }
}
export const familyByProblem = new Map(problems.map(p => [p.id, root(p.sources[0] ? sourceFamily(p, p.sources[0]) : p.family ?? p.id)]));
export const problemFamily = (id: string): string => familyByProblem.get(id) ?? id;
export function familyMembers(id: string): ProblemInfo[] {
  const family = problemFamily(id);
  return problems.filter(p => problemFamily(p.id) === family);
}
