import { describe, expect, it } from 'vitest';
import { parseExternalGrade } from '../src/ai/grade';
import { buildExternalGradePrompt } from '../src/ai/prompt';
import { gradingAudit } from '../src/engine/grading';
import { problemById } from '../src/content';
import { exportJson, parseImport } from '../src/engine/store';
import { replay } from '../src/engine/scheduler';
import { computeMastery } from '../src/engine/mastery';
import { readEvent } from '../src/engine/events';
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
  it('转写修正与评分修正分别统计，旧记录未标注复核仍正常还原', () => {
    const base: AttemptEvent = { id: 'old', t: now, kind: 'attempt', problemId: p.id, grade: 1, tags: ['计算失误'], sec: 300, ai: { ...result, grade: 1 } };
    const checked: AttemptEvent = { ...base, id: 'checked', recognition: { status: 'checked' } };
    const corrected: AttemptEvent = { ...base, id: 'corrected', grade: 3, tags: [], recognition: { status: 'corrected', transcript: '$H(s)=2/(s+1)$' } };
    const unreadable: AttemptEvent = { ...base, id: 'unreadable', recognition: { status: 'unreadable' } };
    const restored = parseImport(exportJson([base, checked, corrected, unreadable]));
    const audit = gradingAudit([...restored, corrected], now);
    expect(audit).toMatchObject({ confirmed: 4, adjusted: 1, reviewed: 3, correctedTranscript: 1, unreadable: 1, unreviewed: 1 });
    expect(audit.models[0]).toMatchObject({ reviewed: 3, correctedTranscript: 1, unreadable: 1 });
    expect(restored.find(e => e.id === 'old')).not.toHaveProperty('recognition');
    expect(restored.find(e => e.id === 'corrected')).toMatchObject({ grade: 3, ai: { grade: 1, transcript: payload.transcript }, recognition: corrected.recognition });
    const manual = restored.map(e => e.kind === 'attempt' ? { ...e, ai: undefined, recognition: undefined } : e);
    expect(computeMastery(restored, now).kp('4.6')).toEqual(computeMastery(manual, now).kp('4.6'));
    expect(replay(restored, '2026-12-20').problems.get(p.id)?.inMistakes).toBe(replay(manual, '2026-12-20').problems.get(p.id)?.inMistakes);
  });
  it('转写修正必须有原批改和真正修改的文字，不接受空白或照片字符串', () => {
    const base: AttemptEvent = { id: 'review', t: now, kind: 'attempt', problemId: p.id, grade: 3, tags: [], sec: 90, ai: result };
    for (const recognition of [{ status: 'other' }, { status: 'corrected', transcript: '' }, { status: 'corrected', transcript: payload.transcript }, { status: 'corrected', transcript: 'data:image/png;base64,AAAA' }])
      expect(readEvent({ ...base, recognition })).toBeNull();
    expect(readEvent({ ...base, ai: undefined, recognition: { status: 'checked' } })).toBeNull();
    expect(readEvent({ ...base, recognition: { status: 'checked', photo: 'data:image/png;base64,AAAA', secret: 'should-drop' } })).toMatchObject({ recognition: { status: 'checked' } });
    expect(JSON.stringify(readEvent({ ...base, recognition: { status: 'checked', photo: 'data:image/png;base64,AAAA' } }))).not.toContain('data:image');
  });
  it('模型在返回值中自称复核正确，不产生用户复核标记', () => {
    const parsed = parseExternalGrade(JSON.stringify({ ...payload, recognition: { status: 'checked' }, reviewed: true }), p, 'Gemini')!;
    expect(parsed).not.toHaveProperty('recognition');
    const event: AttemptEvent = { id: 'model-claim', t: now, kind: 'attempt', problemId: p.id, grade: 3, tags: [], sec: 30, ai: parsed };
    expect(gradingAudit([event], now)).toMatchObject({ reviewed: 0, unreviewed: 1 });
  });
  it('转写正确、修正、看不清互斥计数；错因调整与评分调整分别计算', () => {
    const base: AttemptEvent = { id: 'checked', t: now, kind: 'attempt', problemId: p.id, grade: 3, tags: ['计算失误', '粗心审题'], sec: 120, ai: { ...result, tags: ['粗心审题', '计算失误'] }, recognition: { status: 'checked' } };
    const tagChanged: AttemptEvent = { ...base, id: 'tag-changed', tags: ['公式记错'] };
    const corrected: AttemptEvent = { ...base, id: 'corrected', grade: 0, recognition: { status: 'corrected', transcript: '$H(s)=2$' } };
    const unreadable: AttemptEvent = { ...base, id: 'unreadable', recognition: { status: 'unreadable' } };
    const old: AttemptEvent = { ...base, id: 'old', recognition: undefined };
    const restored = parseImport(exportJson([base, tagChanged, corrected, unreadable, old]));
    const audit = gradingAudit([...restored, tagChanged], now);
    expect(audit).toMatchObject({ confirmed: 5, reviewed: 4, checkedTranscript: 2, correctedTranscript: 1, unreadable: 1, unreviewed: 1, adjusted: 1, adjustedTags: 1 });
    expect(audit.reviewed).toBe(audit.checkedTranscript + audit.correctedTranscript + audit.unreadable);
    expect(audit.confirmed).toBe(audit.reviewed + audit.unreviewed);
  });
});
