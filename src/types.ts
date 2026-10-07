export type Stars = 1 | 2 | 3 | 4 | 5;

export interface KnowledgePoint {
  id: string;
  chapter: number;
  title: string;
  scope: string;
  stars: Stars;
}

export interface Pattern {
  id: string;
  name: string;
  kps: string[];
  method: string;
}

export interface Paper {
  id: string;
  year: number;
  examType: '初试' | '复试' | '—';
  kind: '真题' | '题库' | '习题';
  title: string;
  totalScore?: number;
  recall?: boolean;
  /** 外校精选题源；未设置时表示中北或本校课程资料。 */
  school?: string;
  selection?: string;
  referenceUrl?: string;
}

export type ProblemType = '填空' | '选择' | '计算' | '画图' | '分析' | '简答';

export interface Source {
  paper: string;
  no: string;
  score?: number;
}

export interface Problem {
  id: string;
  sources: Source[];
  type: ProblemType;
  kps: string[];
  pattern?: string;
  stem: string;
  options?: string[];
  answerKey?: number;
  figures?: string[];
  answer: string;
  solution: string;
  verified: 'checked' | 'corrected' | 'uncertain';
  note?: string;
  /** 人工评估的完整作答用时，用于模拟卷匹配计算量。 */
  minutes?: number;
}

export interface Card {
  id: string;
  kps: string[];
  front: string;
  back: string;
}

export type Grade = 0 | 1 | 2 | 3;
export type CardRating = 1 | 2 | 3 | 4;

export const GRADE_LABELS = ['不会', '部分对', '大部分对', '全对'] as const;
export const RATING_LABELS = ['忘了', '模糊', '记得', '很熟'] as const;
export const MISTAKE_TAGS = ['概念不清', '公式记错', '方法不会', '计算失误', '粗心审题'] as const;
export type MistakeTag = (typeof MISTAKE_TAGS)[number];

export interface AiResult {
  grade: Grade;
  tags: MistakeTag[];
  transcript: string;
  feedback: string;
  model: string;
  steps?: { step: string; ok: boolean; comment: string }[];
  score?: number;
}

interface EventBase {
  id: string;
  t: number;
}

export interface AttemptEvent extends EventBase {
  kind: 'attempt';
  problemId: string;
  grade: Grade;
  tags: MistakeTag[];
  sec: number;
  ai?: AiResult;
  examId?: string;
}

export interface ExamItem {
  problemId: string;
  no: string;
  score: number;
  referenceId: string;
  match: 'pattern' | 'knowledge' | 'original';
}

export type ExamEvent = EventBase & { kind: 'exam'; examId: string } & (
  { action: 'start'; title: string; template: string; minutes: number; items: ExamItem[] }
  | { action: 'navigate'; current: number }
  | { action: 'finish' }
);

export interface ReviewEvent extends EventBase {
  kind: 'review';
  cardId: string;
  rating: CardRating;
}

export interface NoteEvent extends EventBase {
  kind: 'note';
  problemId: string;
  text: string;
}

export type TrainerEvent = AttemptEvent | ReviewEvent | NoteEvent | ExamEvent;

export interface Settings {
  examDate: string;
  newCardsPerDay: number;
  newProblemsPerDay: number;
  syncKey: string;
  aiEnabled: boolean;
  lastExport?: number;
}
