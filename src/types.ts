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
  /** 原始大题／共享模型，可覆盖由题号推导的保守分组。 */
  family?: string;
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
  family?: string;
  /** 分级提示和易错点是学习辅助；打开后不能作为独立作答。 */
  hints?: [string, string];
  pitfalls?: string[];
  prerequisites?: string[];
}

export interface Card {
  id: string;
  kps: string[];
  front: string;
  back: string;
}

/** 首页和调度使用的题目目录，不加载题干与解析。 */
export type ProblemInfo = Pick<Problem, 'id' | 'sources' | 'type' | 'kps' | 'pattern' | 'verified' | 'minutes' | 'family' | 'answerKey'> & {
  demand?: { level: 1 | 2 | 3 | 4; minutes: number; basis: '原卷参照' | '人工用时' | '规则估计' };
};
export type CardInfo = Pick<Card, 'id' | 'kps'>;

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

/** 由用户复核作答转写，独立于模型的评分建议。旧记录可不含此字段。 */
export type RecognitionReview =
  | { status: 'checked' | 'unreadable' }
  | { status: 'corrected'; transcript: string };

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
  recognition?: RecognitionReview;
  examId?: string;
  /** 缺省表示旧记录，不能补认为闭卷独立作答。 */
  workMode?: 'independent' | 'reference' | 'correction';
  hintsUsed?: boolean;
  score?: { earned: number; max: number; basis: 'reference'; steps?: { id: string; earned: number; max: number }[] };
  skillErrors?: string[];
}

export interface ExamItem {
  problemId: string;
  no: string;
  score: number;
  referenceId: string;
  match: 'pattern' | 'knowledge' | 'original';
  seenBefore?: boolean;
  familiarity?: 'new' | 'seen' | 'practiced';
}

export interface ExamAnswer {
  problemId: string;
  status: 'draft' | 'answered' | 'skipped';
  text: string;
  choice?: number;
  sec: number;
}

export interface ExamSnapshotRow {
  problemId: string;
  attempt?: AttemptEvent;
  answer?: ExamAnswer;
}

export type ExamEvent = EventBase & { kind: 'exam'; examId: string } & (
  { action: 'start'; title: string; template: string; minutes: number; items: ExamItem[]; mode?: 'strict' | 'practice'; origin?: 'mock' | 'paper' }
  | { action: 'navigate'; current: number }
  | { action: 'answer'; answer: ExamAnswer }
  | { action: 'finish'; reason?: 'submitted' | 'timeout'; endedAt?: number; snapshot?: ExamSnapshotRow[] }
  | { action: 'grade'; problemId: string; attempt: AttemptEvent }
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

/** 仅说明站内展示过题面，不是作答或掌握证据。 */
export interface ExposureEvent extends EventBase {
  kind: 'exposure';
  problemId: string;
}

export interface BookmarkEvent extends EventBase {
  kind: 'bookmark';
  problemId: string;
  active: boolean;
}

export type TrainerEvent = AttemptEvent | ReviewEvent | NoteEvent | ExamEvent | ExposureEvent | BookmarkEvent;

export interface Settings {
  examDate: string;
  newCardsPerDay: number;
  newProblemsPerDay: number;
  syncKey: string;
  aiEnabled: boolean;
  lastExport?: number;
  studyStage?: 'foundation' | 'strengthening' | 'sprint';
  dailyMinutes?: number;
  reservedPapers?: string[];
  planConfigured?: boolean;
}
