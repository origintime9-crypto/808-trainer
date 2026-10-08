import { problemById } from '../content';
import { fits808 } from '../content/target808';
import type { AttemptEvent, TrainerEvent } from '../types';
import type { MasteryIndex } from './mastery';
import { DAY, startOfToday } from './scheduler';

export type LearningMethod = 'diagnostic' | 'explanation' | 'fading' | 'retrieval' | 'checking' | 'verification' | 'interleaving';
export interface LearningPlan {
  method: LearningMethod;
  title: string;
  reason: string;
  steps: string[];
  recentProblems: number;
  spacedDays: number;
}

const methods: Record<LearningMethod, { title: string; steps: string[] }> = {
  diagnostic: { title: '先做短题定位', steps: [
    '闭卷尝试一道这个考点的短题，先写判断依据或第一步。',
    '评分时标出真正卡住的原因；没有把握的地方保留未掌握。',
    '次日换一道同考点题，再检查能否独立作答。',
  ] },
  explanation: { title: '解释概念与条件', steps: [
    '用自己的话解释概念、成立条件，以及一个不成立的反例。',
    '核对解析，找到原判断和正确判断之间的差别。',
    '关闭解析，换一道短题验证；次日再测。',
  ] },
  fading: { title: '逐步撤去解题提示', steps: [
    '看一道解析，并解释每一步为什么适用。',
    '遮住关键步骤，补全解题过程，再关闭解析完整重做。',
    '换一道参数或问法不同的题，独立选择方法。',
  ] },
  retrieval: { title: '闭卷回忆后应用', steps: [
    '不看资料写出公式、适用条件和容易混淆的符号。',
    '对照资料纠正遗漏，再用一道新题应用。',
    '按到期提醒跨日复测；当场重做只用于纠错。',
  ] },
  checking: { title: '建立作答检查点', steps: [
    '先写支撑区间、正负号、单位、初值或收敛域等关键条件。',
    '完成计算后，用首样本、极限、面积或代回原方程独立检查。',
    '下一道题保留这张检查清单，次日再闭卷检验。',
  ] },
  verification: { title: '换题与延迟验证', steps: [
    '换一道同考点的新题，关闭解析独立作答。',
    '留到另一天复测，确认不是只记住了这道题的答案。',
    '仍能做对后，逐步转向混合题型并延长间隔。',
  ] },
  interleaving: { title: '混合题型保持熟练', steps: [
    '将这一考点与其他808考点混合，不提前提示该用什么方法。',
    '根据题面选择解法，并检查与相似方法的适用条件差别。',
    '平时降低重复练习优先级；到期复习和整卷测评仍保留。',
  ] },
};

/**
 * 可审查的初始学习策略，依据近期有效错因、换题和跨日表现实时切换。
 * 不把标签推断为医学意义的遗忘，不声称已拟合个人方法效果；
 * 未采集的提示/独立作答信息不能补造。完整个性化方案见LEARNING_RESEARCH.md。
 */
export function learningPlan(kpId: string, mi: MasteryIndex, events: TrainerEvent[], now: number): LearningPlan {
  const daily = new Map<string, AttemptEvent>();
  for (const event of [...events].sort((a,b) => a.t-b.t || a.id.localeCompare(b.id))) {
    if (event.kind !== 'attempt' || event.t > now || !fits808(event.problemId)) continue;
    if (!problemById.get(event.problemId)?.kps.includes(kpId)) continue;
    daily.set(event.problemId+':'+startOfToday(event.t), event);
  }
  const recent = [...daily.values()].filter(e => now-e.t <= 45*DAY)
    .sort((a,b) => b.t-a.t || b.id.localeCompare(a.id)).slice(0,8);
  const latest = recent[0];
  const recentProblems = new Set(recent.map(e => e.problemId)).size;
  const spacedDays = new Set(recent.map(e => startOfToday(e.t))).size;
  const mastery = mi.kp(kpId);
  const result = (method: LearningMethod, reason: string): LearningPlan =>
    ({ method, ...methods[method], reason, recentProblems, spacedDays });

  if (!mastery.uniqueProblems) return result('diagnostic', '还没有有效做题证据，先测清卡点。');
  if (latest && latest.grade < 3) {
    if (latest.tags.includes('概念不清')) return result('explanation', '最近一次作答标记了概念不清，先核对定义与条件。');
    if (latest.tags.includes('方法不会')) return result('fading', '最近一次作答标记了方法不会，先练选方法和关键步骤。');
    if (latest.tags.includes('公式记错')) return result('retrieval', '最近一次作答标记了公式记错，先回忆公式并用新题验证。');
    if (latest.tags.includes('计算失误') || latest.tags.includes('粗心审题')) return result('checking', '最近一次作答标记了计算或审题失误，增加独立检查。');
    return result('diagnostic', '最近一道题还未全对，错因未明确，先用短题定位。');
  }
  if (mastery.ability >= 0.7 && mastery.forgetting >= 0.2) {
    return result('retrieval', '已有解题证据，但当前记忆保持估计下降，先闭卷回忆并验证。');
  }
  const latestPerProblem = new Map<string, AttemptEvent>();
  for (const event of recent) if (!latestPerProblem.has(event.problemId)) latestPerProblem.set(event.problemId, event);
  const full = [...latestPerProblem.values()].filter(e => e.grade === 3);
  if (mastery.ability >= 0.8 && full.length >= 3 && new Set(full.map(e => startOfToday(e.t))).size >= 2) {
    return result('interleaving', '已有至少三道不同题的近期全对记录，并分布在不同日；继续混合验证。');
  }
  return result('verification', '已有做题记录，继续换题、跨日验证能否保持；评分来自自评或确认后的批改。');
}
