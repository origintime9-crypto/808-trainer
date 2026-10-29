import { problemById } from './catalog';
import { fits808, TARGET_808_PAPER, target808Units } from './target808';
import { estimateDemand } from './demand';
import type { Problem, ProblemInfo } from '../types';

export type DemandLevel = 1 | 2 | 3 | 4;
export type ReferenceClass = 'near' | 'foundation' | 'stretch' | 'supplement' | 'uncertain' | 'outside';
export const REFERENCE_LABELS: Record<ReferenceClass, string> = {
  near: '贴近808题位', foundation: '基础补齐', stretch: '综合拓展',
  supplement: '其他考点补充', uncertain: '题面存疑', outside: '范围拓展',
};
export interface Demand {
  level: DemandLevel;
  minutes: number;
  basis: '原卷参照' | '人工用时' | '规则估计';
}
export function problemDemand(p: Problem | ProblemInfo): Demand {
  return (p as ProblemInfo).demand ?? estimateDemand(p as Problem);
}
const methods: Record<string, string> = {
  'delta-sift': 'delta', 'sys-prop': 'properties', waveform: 'waveform', period: 'period',
  'conv-integral': 'continuous-convolution', 'conv-sum': 'discrete-convolution',
  'ft-basic': 'fourier', 'ft-property': 'fourier', 'fourier-series': 'fourier-series', nyquist: 'sampling',
  'sine-steady': 'frequency-response', 'filter-output': 'frequency-response',
  'ft-exist-from-Hs': 'existence', 'block-to-Hs': 'continuous-diagram',
  'ode-to-diagram': 'continuous-diagram', 'zp-h0': 'pole-zero-response',
  'laplace-calc': 'laplace', 'z-calc': 'z-transform',
  'discrete-diagram': 'discrete-system', 'hz-roc-all': 'discrete-system',
  'full-response-decomp': 'initial-response', 'ode-s-solve': 'initial-response',
  'diff-eq-solve': 'initial-response', routh: 'extension', 'state-space': 'extension',
  concept: 'concept', 'inverse-system': 'inverse', correlation: 'correlation',
};
const discrete = (p: ProblemInfo) => p.kps.some(k => /^[67]\./.test(k));
const compatibleType = (a: ProblemInfo, p: ProblemInfo, shortAnswer: boolean) => a.type === p.type ||
  shortAnswer && a.type === '计算' && (p.type === '填空' || p.type === '选择');
/** 同知识点还不够：必须方法相关、连续/离散一致，且综合程度和作答量接近。 */
export function compareDemand(anchor: ProblemInfo, p: ProblemInfo, shortAnswer = false) {
  const a = problemDemand(anchor), b = problemDemand(p);
  const sameMethod = !!anchor.pattern && methods[anchor.pattern] === methods[p.pattern ?? ''] && !!methods[anchor.pattern];
  const overlap = p.kps.filter(k => anchor.kps.includes(k)).length;
  const ratio = b.minutes / a.minutes;
  const comparable = fits808(p.id) && compatibleType(anchor, p, shortAnswer) && discrete(anchor) === discrete(p) &&
    overlap > 0 && sameMethod && a.level === b.level && ratio >= 0.55 && ratio <= 1.5;
  return { comparable, sameMethod, overlap, ratio, levelGap: b.level - a.level,
    closeness: comparable ? 1 / (1 + Math.abs(Math.log(ratio))) : 0 };
}
export interface Reference808 {
  category: ReferenceClass;
  demand: Demand;
  referenceId?: string;
}
const cache = new Map<string, Reference808>();
export function reference808(problemId: string): Reference808 {
  const cached = cache.get(problemId);
  if (cached) return cached;
  const p = problemById.get(problemId);
  if (!p) return { category: 'outside', demand: { level: 4, minutes: 30, basis: '规则估计' } };
  const demand = problemDemand(p);
  const related = target808Units.filter(a => compareDemand(a, p).comparable);
  const category: ReferenceClass = p.verified === 'uncertain' ? 'uncertain' : !fits808(p.id) ? 'outside'
    : related.length ? 'near' : demand.level === 1 || demand.level === 2 && (p.type === '填空' || p.type === '选择') ? 'foundation'
      : demand.level >= 3 ? 'stretch' : 'supplement';
  const best = [...related].sort((a, b) => compareDemand(b, p).closeness - compareDemand(a, p).closeness || a.id.localeCompare(b.id))[0];
  const result = { category, demand, referenceId: best?.id };
  cache.set(problemId, result);
  return result;
}
/** 先补基础，再回到原卷难度；拓展题不抢占有限的日常训练时间。 */
export function referencePriority(problemId: string, ability: number): number {
  const {category, demand} = reference808(problemId);
  if (category === 'near') return demand.level === 3 && ability < 0.45 ? 0.85 : 1.2;
  if (category === 'foundation') return ability < 0.55 ? 1.05 : 0.65;
  if (category === 'stretch') return ability >= 0.8 ? 0.65 : 0.35;
  if (category === 'supplement') return 0.7;
  return 0;
}
