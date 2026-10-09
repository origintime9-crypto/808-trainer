export const GRADE_FAILURE_KINDS = ['limited', 'daily-quota', 'busy', 'key', 'billing', 'model', 'request', 'connection', 'unavailable'] as const;
export interface GradeDiagnostic {
  kind: (typeof GRADE_FAILURE_KINDS)[number];
  upstreamStatus?: number;
  retryAfterSeconds?: number;
}

/** 只读取固定故障类别与数值；上游正文不进入页面、进度或日志。 */
export function readGradeDiagnostic(value: unknown): GradeDiagnostic | null {
  if (!value || typeof value !== 'object') return null;
  const x = value as Record<string, unknown>;
  if (!GRADE_FAILURE_KINDS.includes(x.kind as GradeDiagnostic['kind'])) return null;
  return {
    kind: x.kind as GradeDiagnostic['kind'],
    ...(typeof x.upstreamStatus === 'number' && Number.isInteger(x.upstreamStatus) && x.upstreamStatus >= 400 && x.upstreamStatus <= 599 ? { upstreamStatus: x.upstreamStatus } : {}),
    ...(typeof x.retryAfterSeconds === 'number' && Number.isInteger(x.retryAfterSeconds) && x.retryAfterSeconds >= 1 && x.retryAfterSeconds <= 86400 ? { retryAfterSeconds: x.retryAfterSeconds } : {}),
  };
}

export class GradeApiError extends Error {
  constructor(message: string, readonly diagnostic: GradeDiagnostic | null) { super(message); this.name = 'GradeApiError'; }
}
