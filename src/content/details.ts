import { use } from 'react';
import { problemById } from './catalog';
import type { Problem } from '../types';

const modules = import.meta.glob<Problem[]>('./generated/problems/*.json', { import: 'default' });
const groups = new Map<string, Promise<Problem[]>>();
const promises = new Map<string, Promise<Problem | undefined>>();
const loaded = new Map<string, Problem>();
export function problemDetail(id: string): Promise<Problem | undefined> {
  const existing = promises.get(id);
  if (existing) return existing;
  const info = problemById.get(id);
  const key = info?.sources[0].paper;
  if (!key) { const missing=Promise.resolve(undefined);promises.set(id,missing);return missing; }
  let group = groups.get(key);
  if (!group) {
    group = modules[`./generated/problems/${key}.json`]().then(rows=>{for(const p of rows)loaded.set(p.id,p);return rows;});
    groups.set(key, group);
    group.catch(() => { groups.delete(key); promises.delete(id); });
  }
  const promise = group.then(rows => rows.find(p => p.id === id));
  promises.set(id, promise);
  return promise;
}
// 同一资料加载后，其余题面同步命中，避免连练每题都经历 Suspense 的等待。
export const useProblemDetail = (id: string) => loaded.has(id)?loaded.get(id):use(problemDetail(id));
