import { problemById } from '../content';
import type { TrainerEvent } from '../types';

/** 只统计已保存作答；人工调整数量不是识别准确率。 */
export function gradingAudit(events: TrainerEvent[], now: number) {
  type Counts = { confirmed: number; adjusted: number; adjustedTags: number; unclear: number; reviewed: number; checkedTranscript: number; correctedTranscript: number; unreadable: number; unreviewed: number };
  const models = new Map<string, Counts & { model: string }>();
  const seen = new Set<string>();
  const counts: Counts = { confirmed: 0, adjusted: 0, adjustedTags: 0, unclear: 0, reviewed: 0, checkedTranscript: 0, correctedTranscript: 0, unreadable: 0, unreviewed: 0 };
  for (const e of events) {
    if (e.kind !== 'attempt' || !e.ai || e.t > now || !problemById.has(e.problemId) || seen.has(e.id)) continue;
    seen.add(e.id);
    const row = models.get(e.ai.model) ?? { model: e.ai.model || '模型未标注', confirmed: 0, adjusted: 0, adjustedTags: 0, unclear: 0, reviewed: 0, checkedTranscript: 0, correctedTranscript: 0, unreadable: 0, unreviewed: 0 };
    const add = (key: keyof Counts) => { counts[key]++; row[key]++; };
    add('confirmed');
    if (e.grade !== e.ai.grade) add('adjusted');
    if ([...new Set(e.tags)].sort().join('\0') !== [...new Set(e.ai.tags)].sort().join('\0')) add('adjustedTags');
    if (e.ai.transcript.includes('[看不清]')) add('unclear');
    add(e.recognition ? 'reviewed' : 'unreviewed');
    if (e.recognition?.status === 'checked') add('checkedTranscript');
    if (e.recognition?.status === 'corrected') add('correctedTranscript');
    if (e.recognition?.status === 'unreadable') add('unreadable');
    models.set(e.ai.model, row);
  }
  return { ...counts, models: [...models.values()].sort((a, b) => a.model.localeCompare(b.model, 'zh-CN')) };
}
