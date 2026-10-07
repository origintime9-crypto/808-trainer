import { MISTAKE_TAGS, type AiResult, type ExamItem, type TrainerEvent } from '../types';

const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown, max: number) => typeof x === 'string' && x.length <= max;
const int = (x: unknown, low: number, high: number) => typeof x === 'number' && Number.isInteger(x) && x >= low && x <= high;
const tags = (x: unknown) => Array.isArray(x) && x.length <= 5 && x.every(t => MISTAKE_TAGS.includes(t));

export function readAiResult(x: unknown): AiResult | null {
  if (!record(x) || !int(x.grade, 0, 3) || !tags(x.tags) || !str(x.transcript, 50000) || !str(x.feedback, 50000)) return null;
  if (x.score !== undefined && (typeof x.score !== 'number' || !Number.isFinite(x.score) || x.score < 0 || x.score > 150)) return null;
  if (x.steps !== undefined && (!Array.isArray(x.steps) || x.steps.length > 100 || !x.steps.every(s => record(s) && str(s.step, 10000) && typeof s.ok === 'boolean' && str(s.comment, 10000)))) return null;
  return {
    grade: x.grade as AiResult['grade'], tags: [...new Set(x.tags as AiResult['tags'])],
    transcript: x.transcript as string, feedback: x.feedback as string,
    model: str(x.model, 200) ? x.model as string : '',
    ...(x.steps ? { steps: x.steps as AiResult['steps'] } : {}),
    ...(x.score !== undefined ? { score: x.score as number } : {}),
  };
}

/** 只保留进度字段，禁止把照片、口令等额外数据写入事件。 */
export function readEvent(x: unknown): TrainerEvent | null {
  if (!record(x) || !str(x.id, 200) || !x.id || !int(x.t, 0, 8640000000000000)) return null;
  const base = { id: x.id as string, t: x.t as number };
  if (x.kind === 'attempt' && str(x.problemId, 200) && x.problemId && int(x.grade, 0, 3) && tags(x.tags) && int(x.sec, 0, 31536000)) {
    if (x.examId !== undefined && (!str(x.examId, 200) || !x.examId)) return null;
    const ai = x.ai === undefined ? undefined : readAiResult(x.ai);
    if (ai === null) return null;
    return { ...base, kind: 'attempt', problemId: x.problemId as string, grade: x.grade as 0 | 1 | 2 | 3, tags: [...new Set(x.tags as AiResult['tags'])], sec: x.sec as number, ...(ai ? { ai } : {}), ...(x.examId ? { examId: x.examId as string } : {}) };
  }
  if (x.kind === 'review' && str(x.cardId, 200) && x.cardId && int(x.rating, 1, 4))
    return { ...base, kind: 'review', cardId: x.cardId as string, rating: x.rating as 1 | 2 | 3 | 4 };
  if (x.kind === 'note' && str(x.problemId, 200) && x.problemId && str(x.text, 50000))
    return { ...base, kind: 'note', problemId: x.problemId as string, text: x.text as string };
  if (x.kind === 'exam' && str(x.examId, 200) && x.examId) {
    const exam = { ...base, kind: 'exam' as const, examId: x.examId as string };
    if (x.action === 'finish') return { ...exam, action: 'finish' };
    if (x.action === 'navigate' && int(x.current, 0, 59)) return { ...exam, action: 'navigate', current: x.current as number };
    if (x.action === 'start' && str(x.title, 200) && str(x.template, 200) && x.template && int(x.minutes, 1, 360) && Array.isArray(x.items) && x.items.length > 0 && x.items.length <= 60) {
      const items: ExamItem[] = [];
      for (const i of x.items) {
        if (!record(i) || !str(i.problemId, 200) || !i.problemId || !str(i.referenceId, 200) || !i.referenceId || !str(i.no, 40) || !i.no || typeof i.score !== 'number' || !Number.isFinite(i.score) || i.score <= 0 || i.score > 150 || !['pattern', 'knowledge', 'original'].includes(i.match as string)) return null;
        items.push({ problemId: i.problemId as string, referenceId: i.referenceId as string, no: i.no as string, score: i.score, match: i.match as ExamItem['match'] });
      }
      if (new Set(items.map(i => i.problemId)).size !== items.length || new Set(items.map(i => i.no)).size !== items.length || items.reduce((v,i)=>v+i.score,0) > 150) return null;
      return { ...exam, action: 'start', title: x.title as string, template: x.template as string, minutes: x.minutes as number, items };
    }
  }
  return null;
}

export function readEvents(x: unknown): TrainerEvent[] {
  if (!Array.isArray(x)) throw new Error('进度记录格式错误');
  const out = x.map(readEvent);
  if (out.some(e => !e)) throw new Error('包含无效的进度记录，未导入任何数据');
  return out as TrainerEvent[];
}
