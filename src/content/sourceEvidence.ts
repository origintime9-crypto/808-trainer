import { initialPaperCount, kpCoursePapers, kpInitialPapers, kpInterviewPapers, paperById, patternCoursePapers, patternInitialPapers, patternInterviewPapers } from './index';

export function sourceEvidence(id: string, kind: 'kp' | 'pattern' = 'kp') {
  const initial = (kind === 'kp' ? kpInitialPapers : patternInitialPapers).get(id) ?? new Set<string>();
  const interview = (kind === 'kp' ? kpInterviewPapers : patternInterviewPapers).get(id) ?? new Set<string>();
  const course = (kind === 'kp' ? kpCoursePapers : patternCoursePapers).get(id) ?? new Set<string>();
  const recall = [...interview].filter(p => paperById.get(p)?.recall).length;
  return { initial, interview, course, recall, insufficient: initialPaperCount < 3 };
}
export function sourceEvidenceLabel(id: string, kind: 'kp' | 'pattern' = 'kp'): string {
  const s = sourceEvidence(id, kind);
  return `初试 ${s.initial.size}/${initialPaperCount} 套${s.insufficient ? '（证据不足）' : ''} · 复试 ${s.interview.size} 套${s.recall ? `（含回忆版${s.recall}套）` : ''} · 课程/习题 ${s.course.size} 份`;
}
