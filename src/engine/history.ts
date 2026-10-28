import type { AttemptEvent, ExamEvent, TrainerEvent } from '../types';

/** 严格模考的交卷后评分也可用于学习调度，但同一份提交只接受首次确认评分。 */
export function learningEvents(events: TrainerEvent[]): TrainerEvent[] {
  const starts = new Map<string, Extract<ExamEvent, { action: 'start' }>>();
  const finishes = new Map<string, Extract<ExamEvent, { action: 'finish' }>>();
  const sorted = [...events].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id));
  for (const e of sorted) if (e.kind === 'exam') {
    if (e.action === 'start' && !starts.has(e.examId)) starts.set(e.examId, e);
    if (e.action === 'finish' && !finishes.has(e.examId)) finishes.set(e.examId, e);
  }
  const accepted = new Set<string>();
  const graded: AttemptEvent[] = [];
  for (const e of sorted) if (e.kind === 'exam' && e.action === 'grade') {
    const start = starts.get(e.examId), finish = finishes.get(e.examId), key = e.examId + ':' + e.problemId;
    const end = finish?.endedAt ?? finish?.t;
    if (!start || start.mode !== 'strict' || !finish || end === undefined || e.t < finish.t || accepted.has(key)) continue;
    const row = finish.snapshot?.find(r => r.problemId === e.problemId);
    if (!row?.answer || row.answer.status === 'skipped' || !row.answer.text.trim() && row.answer.choice===undefined || !start.items.some(i => i.problemId === e.problemId) ||
      e.attempt.problemId !== e.problemId || e.attempt.examId !== e.examId || e.attempt.t < start.t || e.attempt.t > end) continue;
    accepted.add(key); graded.push(e.attempt);
  }
  return [...events.filter(e => e.kind !== 'exam' && (e.kind!=='attempt'||!e.examId||starts.get(e.examId)?.mode!=='strict')), ...graded].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id));
}
