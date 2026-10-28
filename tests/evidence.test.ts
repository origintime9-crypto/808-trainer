import { describe, expect, it } from 'vitest';
import { problems } from '../src/content';
import { problemFamily } from '../src/content/families';
import { sourceEvidence } from '../src/content/sourceEvidence';
import { computeMastery, masteryStatus } from '../src/engine/mastery';
import { dailyEvidence } from '../src/engine/evidence';
import { parseImport, exportJson } from '../src/engine/store';
import { DAY, replay } from '../src/engine/scheduler';
import type { AttemptEvent } from '../src/types';

const now = new Date('2026-10-28T10:00:00+08:00').getTime();
const choices = [...new Map(problems.filter(p => p.verified !== 'uncertain' && p.kps.length === 1 && p.kps[0] === '1.4').map(p => [problemFamily(p.id), p])).values()].slice(0, 3);
const attempt = (problemId: string, grade: AttemptEvent['grade'], t: number, workMode: AttemptEvent['workMode'] = 'independent'): AttemptEvent =>
  ({ id: `${problemId}-${grade}-${t}-${workMode}`, kind: 'attempt', problemId, grade, t, tags: [], sec: 120, workMode, hintsUsed: workMode !== 'independent' });

describe('能力证据修正', () => {
  it('三题先错后当日订正，能力和当前掌握不会由订正抬高', () => {
    expect(choices).toHaveLength(3);
    const first = choices.map(p => attempt(p.id, 0, now));
    const corrected = choices.map(p => attempt(p.id, 3, now + 60_000, 'correction'));
    const a = computeMastery(first, now + 120_000).kp('1.4');
    const b = computeMastery([...first, ...corrected], now + 120_000).kp('1.4');
    expect(b.ability).toBeCloseTo(a.ability); expect(b.m).toBeCloseTo(a.m);
    expect(b.attempts).toBe(6); expect(masteryStatus(b)).toBe('需补强');
    expect(computeMastery([...first, ...corrected.map(e => ({...e, workMode: undefined, hintsUsed: undefined}))], now + 120_000).kp('1.4').ability).toBeCloseTo(a.ability);
  });
  it('看提示后当日重新声称独立作答，也不能建立能力证据', () => {
    const p = choices[0];
    expect(dailyEvidence([attempt(p.id, 1, now, 'reference'), attempt(p.id, 3, now + 1000)], now + 2000)).toHaveLength(0);
    expect(computeMastery([attempt(p.id, 3, now, 'correction')], now).kp('1.4').uniqueProblems).toBe(0);
  });
  it('稳固需要不同家族、明确无提示和跨日，旧记录不补造独立条件', () => {
    const singleDay = choices.map(p => attempt(p.id, 3, now));
    expect(masteryStatus(computeMastery(singleDay, now).kp('1.4'))).not.toBe('较稳固');
    const spaced = singleDay.map((e, i) => ({...e, t: now - (i % 2) * DAY}));
    const m = computeMastery(spaced, now).kp('1.4');
    expect(m.verifiedFamilies).toBe(3); expect(m.independentDays).toBe(2); expect(masteryStatus(m)).toBe('较稳固');
    expect(masteryStatus(computeMastery(spaced.map(e => ({...e, workMode: undefined, hintsUsed: undefined})), now).kp('1.4'))).not.toBe('较稳固');
  });
  it('2017第三大题的五小问共享家族，不能冒充三个独立模型', () => {
    const ids = ['zt2017-3-1', 'zt2017-3-2', 'zt2017-3-3', 'zt2017-3-4'];
    expect(new Set(ids.map(problemFamily)).size).toBe(1);
    const m = computeMastery(ids.map(id => attempt(id, 3, now)), now).kp('4.6');
    expect(m.uniqueProblems).toBe(4); expect(m.uniqueFamilies).toBe(1); expect(masteryStatus(m)).not.toBe('较稳固');
  });
  it('初试和复试（含回忆）分开，订正不让错题直接过关，备份保留条件', () => {
    const source = sourceEvidence('4.6');
    expect([...source.initial]).toEqual(['zt2026']); expect(source.interview.size).toBeGreaterThan(0); expect(source.insufficient).toBe(true);
    const events = [attempt(choices[0].id, 0, now - DAY), attempt(choices[0].id, 3, now, 'correction')];
    expect(replay(events, '2026-12-20').problems.get(choices[0].id)?.inMistakes).toBe(true);
    expect(parseImport(exportJson(events))).toEqual(events);
  });
});
