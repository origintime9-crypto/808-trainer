import { knowledge, kpPapers, paperById, problemById, problems, realPaperCount } from './index';

/** 取已有完整中北原卷为结构基准，不能把外校808代号当作中北大纲。 */
export const TARGET_808_PAPER = 'zt2026';
export const target808Paper = paperById.get(TARGET_808_PAPER)!;
export const target808Units = problems.filter(p => p.sources.some(s => s.paper === TARGET_808_PAPER));
export const target808Total = target808Units.reduce((sum, p) => sum + (p.sources.find(s => s.paper === TARGET_808_PAPER)?.score ?? 0), 0);

// 综合题平均分摊考点权重，全部分值只计一次；这是排序估计，不是学校给出的分项配分。
export const target808Points = new Map<string, number>();
for (const p of target808Units) {
  const score = p.sources.find(s => s.paper === TARGET_808_PAPER)?.score ?? 0;
  for (const id of p.kps) target808Points.set(id, (target808Points.get(id) ?? 0) + score / Math.max(1, p.kps.length));
}
const largestShare = Math.max(1, ...target808Points.values());
export const target808Scope = knowledge.filter(k => k.chapter <= 7 && k.stars >= 3);

/** 最近原卷考察越重，在相同薄弱度下越优先；未出现在单年卷中仍保留重点表权重。 */
export function examEmphasis(id: string): number {
  return 1 + (target808Points.get(id) ?? 0) / largestShare;
}

export function importance808(id: string): number {
  const point = knowledge.find(k => k.id === id);
  if (!point || point.chapter > 7) return 0;
  return (point.stars / 5) ** 1.4 * (1 + (kpPapers.get(id)?.size ?? 0) / Math.max(1, realPaperCount)) * examEmphasis(id);
}

/** 正式808推荐排除状态变量拓展；仍可从题库手动练习。 */
export function fits808(problemId: string): boolean {
  const p = problemById.get(problemId);
  return !!p && p.verified !== 'uncertain' && p.kps.length > 0 && p.kps.every(k => !k.startsWith('8.'));
}
