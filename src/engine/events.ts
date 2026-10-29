import { MISTAKE_TAGS, type AiResult, type AttemptEvent, type ExamAnswer, type ExamItem, type ExamSnapshotRow, type RecognitionReview, type TrainerEvent } from '../types';

const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown, max: number) => typeof x === 'string' && x.length <= max;
const int = (x: unknown, low: number, high: number) => typeof x === 'number' && Number.isInteger(x) && x >= low && x <= high;
const tags = (x: unknown) => Array.isArray(x) && x.length <= 5 && x.every(t => MISTAKE_TAGS.includes(t));
const finite = (x: unknown, low: number, high: number): x is number => typeof x === 'number' && Number.isFinite(x) && x >= low && x <= high;

function readAnswer(x: unknown): ExamAnswer | null {
  if (!record(x) || !str(x.problemId,200) || !x.problemId || !['draft','answered','skipped'].includes(x.status as string) ||
    !str(x.text,20000) || /data:image\//i.test(x.text as string) || !int(x.sec,0,31536000) ||
    (x.choice!==undefined&&!int(x.choice,0,19))) return null;
  return {problemId:x.problemId as string,status:x.status as ExamAnswer['status'],text:x.text as string,sec:x.sec as number,
    ...(x.choice!==undefined?{choice:x.choice as number}:{})};
}

export function readAiResult(x: unknown): AiResult | null {
  if (!record(x) || !int(x.grade, 0, 3) || !tags(x.tags) || !str(x.transcript, 50000) || !str(x.feedback, 50000)) return null;
  if (x.score !== undefined && (typeof x.score !== 'number' || !Number.isFinite(x.score) || x.score < 0 || x.score > 150)) return null;
  if (x.steps !== undefined && (!Array.isArray(x.steps) || x.steps.length > 100 || !x.steps.every(s => record(s) && str(s.step, 10000) && typeof s.ok === 'boolean' && str(s.comment, 10000)))) return null;
  const result: AiResult = {
    grade: x.grade as AiResult['grade'], tags: [...new Set(x.tags as AiResult['tags'])],
    transcript: x.transcript as string, feedback: x.feedback as string,
    model: str(x.model, 200) ? x.model as string : '',
    ...(x.steps ? { steps: x.steps as AiResult['steps'] } : {}),
    ...(x.score !== undefined ? { score: x.score as number } : {}),
  };
  return /data:image\//i.test(JSON.stringify(result)) ? null : result;
}

/** 只保留进度字段，禁止把照片、口令等额外数据写入事件。 */
export function readEvent(x: unknown): TrainerEvent | null {
  if (!record(x) || !str(x.id, 200) || !x.id || !int(x.t, 0, 8640000000000000)) return null;
  const base = { id: x.id as string, t: x.t as number };
  if (x.kind === 'bookmark' && str(x.problemId, 200) && x.problemId && typeof x.active === 'boolean')
    return { ...base, kind: 'bookmark', problemId: x.problemId as string, active: x.active };
  if (x.kind === 'exposure' && str(x.problemId, 200) && x.problemId)
    return { ...base, kind: 'exposure', problemId: x.problemId as string };
  if (x.kind === 'attempt' && str(x.problemId, 200) && x.problemId && int(x.grade, 0, 3) && tags(x.tags) && int(x.sec, 0, 31536000)) {
    if (x.examId !== undefined && (!str(x.examId, 200) || !x.examId)) return null;
    if (x.workMode !== undefined && !['independent', 'reference', 'correction'].includes(x.workMode as string)) return null;
    if (x.hintsUsed !== undefined && typeof x.hintsUsed !== 'boolean') return null;
    let score: AttemptEvent['score'];
    if(x.score!==undefined) {
      const s=x.score;
      if(!record(s)||s.basis!=='reference'||!finite(s.max,0.01,150)||!finite(s.earned,0,s.max))return null;
      if(s.steps!==undefined&&(!Array.isArray(s.steps)||s.steps.length>30||!s.steps.every(v=>record(v)&&str(v.id,100)&&v.id&&finite(v.max,0.01,150)&&finite(v.earned,0,v.max))))return null;
      if(Array.isArray(s.steps)&&(new Set(s.steps.map(v=>v.id)).size!==s.steps.length||Math.abs(s.steps.reduce((v,r)=>v+r.earned,0)-s.earned)>0.01||Math.abs(s.steps.reduce((v,r)=>v+r.max,0)-s.max)>0.01))return null;
      score={earned:s.earned,max:s.max,basis:'reference',...(s.steps?{steps:s.steps as NonNullable<AttemptEvent['score']>['steps']}:{})};
    }
    if(x.skillErrors!==undefined&&(!Array.isArray(x.skillErrors)||x.skillErrors.length>20||!x.skillErrors.every(s=>str(s,100))))return null;
    const ai = x.ai === undefined ? undefined : readAiResult(x.ai);
    if (ai === null) return null;
    let recognition: RecognitionReview | undefined;
    if (x.recognition !== undefined) {
      const r = x.recognition;
      if (!ai || !record(r)) return null;
      if (r.status === 'checked' || r.status === 'unreadable') recognition = { status: r.status };
      else if (r.status === 'corrected' && str(r.transcript, 50000) && (r.transcript as string).trim() &&
        (r.transcript as string).trim() !== ai.transcript.trim() && !/data:image\//i.test(r.transcript as string))
        recognition = { status: 'corrected', transcript: r.transcript as string };
      else return null;
    }
    return { ...base, kind: 'attempt', problemId: x.problemId as string, grade: x.grade as 0 | 1 | 2 | 3, tags: [...new Set(x.tags as AiResult['tags'])], sec: x.sec as number,
      ...(x.workMode !== undefined ? { workMode: x.workMode as 'independent' | 'reference' | 'correction' } : {}),
      ...(x.hintsUsed !== undefined ? { hintsUsed: x.hintsUsed as boolean } : {}),
      ...(score?{score}:{}),...(x.skillErrors?{skillErrors:[...new Set(x.skillErrors as string[])]}:{}),
      ...(ai ? { ai } : {}), ...(recognition ? { recognition } : {}), ...(x.examId ? { examId: x.examId as string } : {}) };
  }
  if (x.kind === 'review' && str(x.cardId, 200) && x.cardId && int(x.rating, 1, 4))
    return { ...base, kind: 'review', cardId: x.cardId as string, rating: x.rating as 1 | 2 | 3 | 4 };
  if (x.kind === 'note' && str(x.problemId, 200) && x.problemId && str(x.text, 50000))
    return { ...base, kind: 'note', problemId: x.problemId as string, text: x.text as string };
  if (x.kind === 'exam' && str(x.examId, 200) && x.examId) {
    const exam = { ...base, kind: 'exam' as const, examId: x.examId as string };
    if (x.action === 'answer') {const answer=readAnswer(x.answer);return answer?{...exam,action:'answer',answer}:null;}
    if (x.action === 'grade') {
      if(!str(x.problemId,200)||!record(x.attempt)||x.attempt.kind!=='attempt')return null;
      const attempt=readEvent(x.attempt);
      return attempt?.kind==='attempt'&&attempt.examId===exam.examId&&attempt.problemId===x.problemId?{...exam,action:'grade',problemId:x.problemId as string,attempt}:null;
    }
    if (x.action === 'finish') {
      if(x.reason!==undefined&&!['submitted','timeout'].includes(x.reason as string))return null;
      if(x.endedAt!==undefined&&!int(x.endedAt,0,base.t))return null;
      let snapshot:ExamSnapshotRow[]|undefined;
      if(x.snapshot!==undefined) {
        if(!Array.isArray(x.snapshot)||x.snapshot.length>200)return null;
        snapshot=[];
        for(const r of x.snapshot) {
          if(!record(r)||!str(r.problemId,200)||!r.problemId)return null;
          const answer=r.answer===undefined?undefined:readAnswer(r.answer);
          if(r.attempt!==undefined&&(!record(r.attempt)||r.attempt.kind!=='attempt'))return null;
          const attempt=r.attempt===undefined?undefined:readEvent(r.attempt);
          if(answer===null||attempt===null||(answer&&answer.problemId!==r.problemId)||(attempt&&(attempt.kind!=='attempt'||attempt.problemId!==r.problemId||attempt.examId!==exam.examId)))return null;
          snapshot.push({problemId:r.problemId as string,...(answer?{answer}:{}),...(attempt?.kind==='attempt'?{attempt}:{})});
        }
        if(new Set(snapshot.map(r=>r.problemId)).size!==snapshot.length)return null;
      }
      return { ...exam, action: 'finish',...(x.reason?{reason:x.reason as 'submitted'|'timeout'}:{}),...(x.endedAt!==undefined?{endedAt:x.endedAt as number}:{}),...(snapshot?{snapshot}:{}) };
    }
    if (x.action === 'navigate' && int(x.current, 0, 199)) return { ...exam, action: 'navigate', current: x.current as number };
    if (x.action === 'start' && str(x.title, 200) && str(x.template, 200) && x.template && int(x.minutes, 1, 360) && Array.isArray(x.items) && x.items.length > 0 && x.items.length <= 200) {
      if(x.mode!==undefined&&!['strict','practice'].includes(x.mode as string)||x.origin!==undefined&&!['mock','paper'].includes(x.origin as string))return null;
      const items: ExamItem[] = [];
      for (const i of x.items) {
        if (!record(i) || !str(i.problemId, 200) || !i.problemId || !str(i.referenceId, 200) || !i.referenceId || !str(i.no, 40) || !i.no || !finite(i.score,x.origin==='paper'?0:0.01,150) || !['pattern', 'knowledge', 'original'].includes(i.match as string) || i.seenBefore!==undefined&&typeof i.seenBefore!=='boolean') return null;
        if(i.familiarity!==undefined&&!['new','seen','practiced'].includes(i.familiarity as string))return null;
        items.push({ problemId: i.problemId as string, referenceId: i.referenceId as string, no: i.no as string, score: i.score, match: i.match as ExamItem['match'],...(i.seenBefore!==undefined?{seenBefore:i.seenBefore as boolean}:{}),...(i.familiarity!==undefined?{familiarity:i.familiarity as ExamItem['familiarity']}:{}) });
      }
      if (new Set(items.map(i => i.problemId)).size !== items.length || new Set(items.map(i => i.no)).size !== items.length || items.reduce((v,i)=>v+i.score,0) > 150) return null;
      return { ...exam, action: 'start', title: x.title as string, template: x.template as string, minutes: x.minutes as number, items,
        ...(x.mode?{mode:x.mode as 'strict'|'practice'}:{}),...(x.origin?{origin:x.origin as 'mock'|'paper'}:{}) };
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
