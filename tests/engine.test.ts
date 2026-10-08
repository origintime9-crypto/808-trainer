import { describe, expect, it } from 'vitest';
import { computeMastery, priority, rankPatterns } from '../src/engine/mastery';
import { DAY, dayDiff, replay } from '../src/engine/scheduler';
import { mergeEvents, parseImport, exportJson } from '../src/engine/store';
import type { AttemptEvent, ReviewEvent, TrainerEvent } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/engine/store';
import { recommendNew } from '../src/engine/queue';
import { kpById, problemById } from '../src/content';

const T0 = new Date('2026-10-06T10:00:00').getTime();
const EXAM = '2026-12-20';
let seq = 0;
const attempt = (problemId: string, grade: 0 | 1 | 2 | 3, t: number, tags: AttemptEvent['tags'] = []): AttemptEvent => ({
  kind: 'attempt', id: `a${seq++}`, t, problemId, grade, tags, sec: 60,
});
const review = (cardId: string, rating: 1 | 2 | 3 | 4, t: number): ReviewEvent => ({ kind: 'review', id: `r${seq++}`, t, cardId, rating });

describe('回放调度', () => {
  it('同样的事件回放结果相同', () => {
    const ev: TrainerEvent[] = [attempt('zt2026-10', 1, T0), review('c1-delta-sift', 3, T0), review('c1-delta-sift', 3, T0 + DAY)];
    const a = replay(ev, EXAM);
    const b = replay([...ev].reverse(), EXAM);
    expect(a.problems.get('zt2026-10')!.card.due.getTime()).toBe(b.problems.get('zt2026-10')!.card.due.getTime());
    expect(a.cards.get('c1-delta-sift')!.card.due.getTime()).toBe(b.cards.get('c1-delta-sift')!.card.due.getTime());
  });

  it('部分对进入错题本，明天到期', () => {
    const s = replay([attempt('zt2026-10', 1, T0)], EXAM);
    const st = s.problems.get('zt2026-10')!;
    expect(st.inMistakes).toBe(true);
    expect(dayDiff(T0, st.card.due.getTime())).toBe(1);
  });

  it('错题连续两次全对才移出', () => {
    const ev = [attempt('p', 0, T0)];
    expect(replay(ev, EXAM).problems.get('p')!.inMistakes).toBe(true);
    ev.push(attempt('p', 3, T0 + DAY));
    expect(replay(ev, EXAM).problems.get('p')!.inMistakes).toBe(true);
    ev.push(attempt('p', 2, T0 + 2 * DAY));
    ev.push(attempt('p', 3, T0 + 3 * DAY));
    expect(replay(ev, EXAM).problems.get('p')!.inMistakes).toBe(true);
    ev.push(attempt('p', 3, T0 + 5 * DAY));
    const st = replay(ev, EXAM).problems.get('p')!;
    expect(st.inMistakes).toBe(false);
    expect(st.mastered).toBe(true);
  });

  it('第一次就全对不进错题本', () => {
    const st = replay([attempt('p', 3, T0)], EXAM).problems.get('p')!;
    expect(st.inMistakes).toBe(false);
    expect(st.mastered).toBe(true);
  });

  it('到期时间不超过考试日期', () => {
    const exam = '2026-10-11';
    let ev: TrainerEvent[] = [];
    for (let i = 0; i < 4; i++) ev = [...ev, review('c', 4, T0 + i * 60_000)];
    const due = replay(ev, exam).cards.get('c')!.card.due.getTime();
    expect(due).toBeLessThanOrEqual(new Date('2026-10-11T09:00:00').getTime());
  });
  it('考前最后一小时的错题不会排到考试之后', () => {
    const t = new Date('2026-12-20T08:00:00').getTime();
    expect(replay([attempt('p', 1, t)], EXAM).problems.get('p')!.card.due.getTime()).toBeLessThanOrEqual(new Date('2026-12-20T09:00:00').getTime());
  });
});

describe('掌握度与优先级', () => {
  it('没有记录时为先验 0.5、次数为 0', () => {
    const m = computeMastery([], T0).kp('4.6');
    expect(m.m).toBe(0.5);
    expect(m.attempts).toBe(0);
  });

  it('做错降低掌握度，做对提高', () => {
    const bad = computeMastery([attempt('zt2026-10', 0, T0, ['计算失误'])], T0).kp('4.6');
    const good = computeMastery([attempt('zt2026-10', 3, T0)], T0).kp('4.6');
    expect(bad.m).toBeLessThan(0.5);
    expect(good.m).toBeGreaterThan(0.5);
    expect(bad.tags['计算失误']).toBe(1);
  });

  it('遗忘不会把原来的错题回升为平均掌握', () => {
    const recent = computeMastery([attempt('zt2026-10', 0, T0)], T0).kp('4.6').m;
    const old = computeMastery([attempt('zt2026-10', 0, T0 - 42 * DAY)], T0).kp('4.6').m;
    expect(old).toBeLessThan(recent);
  });

  it('优先级随星级、薄弱程度、真题频次增大', () => {
    expect(priority(5, 0.5, 0).value).toBeGreaterThan(priority(3, 0.5, 0).value);
    expect(priority(5, 0.2, 0).value).toBeGreaterThan(priority(5, 0.8, 0).value);
    expect(priority(3, 0.5, 6).value).toBeGreaterThan(priority(3, 0.5, 0).value);
  });

  it('旧保持题进度合并教材来源后只归因于保持和卷积，频域抽样与存疑题分别统计', () => {
    const old = attempt('zt2016-4-4', 1, T0);
    const events = mergeEvents([old], parseImport(exportJson([old])));
    expect(events).toEqual([old]);
    const hold = problemById.get(old.problemId)!;
    expect(hold.sources.some(s => s.paper === 'wmq5' && s.no === '5.7(4)')).toBe(true);
    const mi = computeMastery(events, T0);
    expect(mi.kp('5.4').uniqueProblems).toBe(1);
    expect(mi.kp('2.4').uniqueProblems).toBe(1);
    expect(mi.pattern('sample-hold').uniqueProblems).toBe(1);
    expect(mi.kp('5.2').attempts).toBe(0);
    expect(mi.pattern('nyquist').attempts).toBe(0);
    expect(mi.pattern('filter-output').attempts).toBe(0);
    const cards = computeMastery([...events, review('pattern-sample-hold', 1, T0)], T0);
    expect(cards.kp('5.4').reviews).toBe(1);
    expect(cards.pattern('sample-hold').reviews).toBe(1);
    expect(cards.kp('5.2').reviews).toBe(0);
    expect(cards.pattern('filter-output').reviews).toBe(0);
    const ranked = rankPatterns(cards);
    expect(ranked.find(p => p.id === 'sample-hold')!.stars).toBe(1);
    expect(ranked.find(p => p.id === 'frequency-sampling')!.stars).toBe(1);
    expect(kpById.get('5.2')!.stars).toBe(3);
    const frequency = computeMastery([attempt('wmq5-5-5', 2, T0)], T0);
    expect(frequency.kp('5.5').uniqueProblems).toBe(1);
    expect(frequency.pattern('frequency-sampling').uniqueProblems).toBe(1);
    expect(frequency.kp('5.2').attempts).toBe(0);
    const uncertain = computeMastery([attempt('wmq5-5-4', 3, T0), attempt('wmq5-5-6', 3, T0)], T0);
    expect(uncertain.kp('5.2').attempts).toBe(2);
    expect(uncertain.kp('5.2').uniqueProblems).toBe(0);
    expect(uncertain.pattern('nyquist').uniqueProblems).toBe(0);
  });

  it('教材离散相关与卷积分开，旧单位样值题来源合并不增加作答，初态存疑保留记录但不增加能力证据', () => {
    const correlated = computeMastery([attempt('wmq6-6-20-2a', 1, T0)], T0);
    expect(correlated.kp('6.5').uniqueProblems).toBe(1);
    expect(correlated.pattern('correlation').uniqueProblems).toBe(1);
    expect(correlated.kp('6.2').attempts).toBe(0);
    expect(correlated.pattern('conv-sum').attempts).toBe(0);
    expect(rankPatterns(correlated).find(p => p.id === 'correlation')!.stars).toBe(1);
    expect(kpById.get('6.2')!.stars).toBe(5);
    expect(kpById.get('6.4')!.stars).toBe(5);
    const old = attempt('tk-key-17-2', 1, T0);
    const restored = mergeEvents([old], parseImport(exportJson([old])));
    expect(restored).toEqual([old]);
    expect(problemById.get(old.problemId)!.sources.some(s => s.paper === 'wmq6' && s.no === '6.16(1b)')).toBe(true);
    expect(problemById.has('wmq6-6-16-1b')).toBe(false);
    const merged = computeMastery(restored, T0);
    expect(merged.pattern('discrete-diagram').uniqueProblems).toBe(1);
    expect(merged.kp('6.5').attempts).toBe(0);
    const uncertain = computeMastery(['wmq6-6-15-1', 'wmq6-6-15-2', 'wmq6-6-16-1a'].map(id => attempt(id, 3, T0)), T0);
    expect(uncertain.kp('6.4').attempts).toBe(3);
    expect(uncertain.kp('6.4').uniqueProblems).toBe(0);
    expect(uncertain.pattern('diff-eq-solve').uniqueProblems).toBe(0);
  });
});

describe('导出导入', () => {
  it('无效事件整体拒绝，备份不包含密钥或照片', () => {
    const raw = JSON.stringify({ app: '808-trainer', version: 1, events: [{ ...attempt('p', 1, T0), grade: 99 }] });
    expect(() => parseImport(raw)).toThrow('无效');
    const value = JSON.stringify({ app: '808-trainer', version: 1, events: [{ ...attempt('p', 1, T0), photos: ['secret-photo'], syncKey: 'secret-pass' }] });
    expect(JSON.stringify(parseImport(value))).not.toContain('secret-');
  });
  it('合并按 id 去重并按时间排序', () => {
    const a = attempt('p', 1, T0 + 10);
    const b = attempt('p', 2, T0 + 5);
    const c = review('c', 3, T0);
    const merged = mergeEvents([a, b], [b, c]);
    expect(merged.map((e) => e.id)).toEqual([c.id, b.id, a.id]);
  });

  it('导出后能导入回来', () => {
    const ev = [attempt('p', 1, T0), review('c', 3, T0)];
    expect(parseImport(exportJson(ev))).toEqual(ev);
    expect(() => parseImport('{"foo":1}')).toThrow();
  });
});
describe('推荐队列', () => {
  it('不推荐已做题，同一道题不重复，题型允许补强', () => {
    const ev = [attempt('zt2026-10', 1, T0)];
    const queue = recommendNew(replay(ev, EXAM), ev, { ...DEFAULT_SETTINGS, newProblemsPerDay: 30 }, computeMastery(ev, T0), T0);
    expect(queue).not.toContain('zt2026-10');
    expect(new Set(queue).size).toBe(queue.length);
    expect(queue.every(id => problemById.has(id))).toBe(true);
  });
});
