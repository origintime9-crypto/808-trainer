import { describe, expect, it } from 'vitest';
import { parseExternalGrade } from '../src/ai/grade';
import { buildExternalGradePrompt } from '../src/ai/prompt';
import { gradingAudit } from '../src/engine/grading';
import { problemById } from '../src/content';
import { exportJson, parseImport } from '../src/engine/store';
import { replay } from '../src/engine/scheduler';
import { computeMastery } from '../src/engine/mastery';
import type { AttemptEvent, TrainerEvent } from '../src/types';

const p = problemById.get('zt2026-10')!;
const now = new Date('2026-10-08T10:00:00+08:00').getTime();
const payload = { problemId: p.id, transcript: '$H(s)=1/(s+1)$', steps: [{ step: '计算', ok: true, comment: '代入' }], grade: 3, tags: [], feedback: '核对系数', score: 15 };
const result = parseExternalGrade(JSON.stringify(payload), p, 'Gemini')!;

describe('外部批改与统计复核', () => {
  it('提示词包含当前题号，正常JSON和代码块能恢复公式与批改字段', () => {
    expect(buildExternalGradePrompt(p)).toContain('"problemId": "zt2026-10"');
    for (const text of [JSON.stringify(payload), '```json\n' + JSON.stringify(payload) + '\n```']) {
      expect(parseExternalGrade(text, p, 'Gemini')).toMatchObject({ grade: 3, model: 'Gemini（手动导入）', score: 15 });
    }
    const source = JSON.stringify({ ...payload, transcript: '$\\frac{1}{s+1}$' }).replaceAll('\\\\', '\\');
    expect(parseExternalGrade(source, p, 'ChatGPT')?.transcript).toBe('$\\frac{1}{s+1}$');
  });
  it('其他题号、缺题号、无效评分、错因或照片字符串不能进入批改记录', () => {
    for (const bad of [{ ...payload, problemId: 'zt2026-9' }, { ...payload, problemId: undefined }, { ...payload, grade: 9 }, { ...payload, tags: ['其他'] }, { ...payload, transcript: 'data:image/png;base64,AAAA' }])
      expect(parseExternalGrade(JSON.stringify(bad), p, 'Gemini')).toBeNull();
    expect(parseExternalGrade('不是JSON', p, 'Gemini')).toBeNull();
  });
  it('未提供题目满分或超出题位分值时丢弃数字估分，保留评分档', () => {
    const noScore = problemById.get('tk-key-1-2')!;
    expect(parseExternalGrade(JSON.stringify({ ...payload, problemId: noScore.id }), noScore, 'Gemini')?.score).toBeUndefined();
    expect(parseExternalGrade(JSON.stringify({ ...payload, score: 100 }), p, 'Gemini')?.score).toBeUndefined();
    expect(parseExternalGrade(JSON.stringify({ ...payload, score: 5 }), p, 'Gemini', 6)?.score).toBe(5);
  });
  it('未知附加字段不保存，导出导入后保留最终评分及原AI建议', () => {
    const parsed = parseExternalGrade(JSON.stringify({ ...payload, photos: ['data:image/png;base64,AAAA'], privateKey: 'not-a-key' }), p, 'Gemini')!;
    const event: AttemptEvent = { id: 'manual-confirmed', t: now, kind: 'attempt', problemId: p.id, grade: 0, tags: ['方法不会'], sec: 300, ai: parsed };
    const saved = exportJson([event]);
    expect(saved).not.toContain('data:image'); expect(saved).not.toContain('privateKey');
    const restored = parseImport(saved);
    expect(restored[0]).toMatchObject({ grade: 0, ai: { grade: 3 } });
    expect(replay(restored, '2026-12-20').problems.get(p.id)?.inMistakes).toBe(true);
    const withoutAi = [{ ...event, ai: undefined }];
    expect(computeMastery(restored, now).kp('4.6')).toEqual(computeMastery(withoutAi, now).kp('4.6'));
  });
  it('复核统计按已确认事件去重，不把将来、未知题或纯手动记录当成AI结果', () => {
    const base: AttemptEvent = { id: 'a', t: now, kind: 'attempt', problemId: p.id, grade: 0, tags: ['方法不会'], sec: 300, ai: result };
    const events: TrainerEvent[] = [base, base, { ...base, id: 'b', grade: 3, ai: { ...result, model: 'gemini-3.8-flash', transcript: '[看不清]' } }, { ...base, id: 'future', t: now + 1 }, { ...base, id: 'unknown', problemId: 'missing' }, { ...base, id: 'manual', ai: undefined }];
    const audit = gradingAudit(events, now);
    expect(audit).toMatchObject({ confirmed: 2, adjusted: 1, unclear: 1 });
    expect(audit.models).toHaveLength(2);
  });
});
