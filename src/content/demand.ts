import type { Problem } from '../types';
import type { Demand, DemandLevel } from './difficulty808';

/** 按2026实际题面区分单步、常规和综合；分值只用于原卷的时间预算。 */
const referenceLevels: Record<string, DemandLevel> = {
  'zt2026-1-1': 1, 'zt2026-1-2': 1, 'zt2026-2-1': 2, 'zt2026-2-2': 2,
  'zt2026-3-1': 2, 'zt2026-3-2': 2, 'zt2026-3-3': 2,
  'zt2026-4-1': 1, 'zt2026-4-2': 1, 'zt2026-4-3': 1,
  'zt2026-5-1': 1, 'zt2026-5-2': 2,
  'zt2026-6': 3, 'zt2026-7': 3, 'zt2026-8': 2, 'zt2026-9': 3, 'zt2026-10': 3,
};
const basic = new Set(['delta-sift', 'ft-basic', 'ft-property', 'fourier-series', 'concept']);
const integrated = new Set(['full-response-decomp', 'hz-roc-all', 'zp-h0']);
export function estimateDemand(p: Problem): Demand {
  const anchorLevel = referenceLevels[p.id];
  const originalScore = p.sources.find(s => s.paper === 'zt2026')?.score;
  if (anchorLevel && originalScore) return { level: anchorLevel, minutes: originalScore * 1.2, basis: '原卷参照' };
  let level: DemandLevel = p.kps.some(k => k.startsWith('8.')) || p.pattern === 'routh' ? 4
    : integrated.has(p.pattern ?? '') ? 3 : basic.has(p.pattern ?? '') ? 1 : 2;
  const parts = (p.stem.match(/(?:^|\n)\s*[（(][1-9][)）]/g) ?? []).length;
  // 级数成对相位、复合性质以及高阶求导不能按一条基础变换对估算。
  if (parts >= 3 || /三次|二阶分布导数|二阶导数|三阶|四阶|三次谐波/.test(p.stem)) level = Math.max(level, 3) as DemandLevel;
  else if (parts >= 2 || p.kps.length >= 3 || /双边.*(?:谱|系数)|级数系数|f\^2|平方.*sin/.test(p.stem)) level = Math.max(level, 2) as DemandLevel;
  if (p.minutes && p.minutes > 30) level = 4;
  else if (p.minutes && p.minutes > 14) level = Math.max(level, 3) as DemandLevel;
  const estimated = p.type === '填空' || p.type === '选择' ? 4
    : level === 1 ? 6 : level === 2 ? Math.max(8, parts * 5) : level === 3 ? Math.max(15, parts * 6) : 30;
  return { level, minutes: p.minutes ?? estimated, basis: p.minutes ? '人工用时' : '规则估计' };
}
