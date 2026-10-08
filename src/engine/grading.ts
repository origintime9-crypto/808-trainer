import { problemById } from '../content';
import type { TrainerEvent } from '../types';

/** 只统计已保存作答；人工调整数量不是识别准确率。 */
export function gradingAudit(events: TrainerEvent[], now: number) {
  const models = new Map<string, { model: string; confirmed: number; adjusted: number; unclear: number }>();
  const seen = new Set<string>();
  let confirmed = 0, adjusted = 0, unclear = 0;
  for (const e of events) {
    if (e.kind !== 'attempt' || !e.ai || e.t > now || !problemById.has(e.problemId) || seen.has(e.id)) continue;
    seen.add(e.id);
    const row = models.get(e.ai.model) ?? { model: e.ai.model || '模型未标注', confirmed: 0, adjusted: 0, unclear: 0 };
    confirmed++; row.confirmed++;
    if (e.grade !== e.ai.grade) { adjusted++; row.adjusted++; }
    if (e.ai.transcript.includes('[看不清]')) { unclear++; row.unclear++; }
    models.set(e.ai.model, row);
  }
  return { confirmed, adjusted, unclear, models: [...models.values()].sort((a, b) => a.model.localeCompare(b.model, 'zh-CN')) };
}
