import { describe, expect, it } from 'vitest';
import { problems } from '../src/content';
import { fits808 } from '../src/content/target808';
import { learningPlan } from '../src/engine/learning';
import { computeMastery } from '../src/engine/mastery';
import { DAY } from '../src/engine/scheduler';
import type { AttemptEvent, MistakeTag, TrainerEvent } from '../src/types';

const now = new Date('2026-10-08T12:00:00+08:00').getTime();
const eligible = problems.filter(p => fits808(p.id) && p.kps.length === 1 && p.kps[0] === '1.8').slice(0,5);
function event(index: number, grade: AttemptEvent['grade'], tags: MistakeTag[] = [], t = now): AttemptEvent {
  return { kind:'attempt', id:'learning-'+index+'-'+grade+'-'+t, t, problemId:eligible[index].id, grade, tags, sec:240 };
}
function plan(events: TrainerEvent[]) {
  return learningPlan('1.8', computeMastery(events, now), events, now);
}

describe('808复习方法按有效表现调整', () => {
  it('没有证据及只有存疑/拓展历史时先测，不补造错因', () => {
    expect(plan([]).method).toBe('diagnostic');
    const uncertain = problems.find(p => p.verified === 'uncertain' && p.kps.includes('1.8'))!;
    const bad = {...event(0,3), problemId:uncertain.id};
    expect(plan([bad]).method).toBe('diagnostic');
  });
  it('不同近期错因对应概念解释、提示撤去、回忆或独立检查', () => {
    for (const [tag,method] of [
      ['概念不清','explanation'], ['方法不会','fading'], ['公式记错','retrieval'],
      ['计算失误','checking'], ['粗心审题','checking'],
    ] as const) expect(plan([event(0,1,[tag])]).method).toBe(method);
    expect(plan([event(0,1)]).method).toBe('diagnostic');
  });
  it('纠错后建议切换为换题验证，同日重复不会变成混合熟练', () => {
    const fail = event(0,0,['概念不清'],now-60_000);
    expect(plan([fail]).method).toBe('explanation');
    const correct = event(0,3,[],now);
    expect(plan([fail,correct]).method).toBe('verification');
    const same = Array.from({length:8},(_,i) => ({...correct,id:'repeat-'+i,t:now-10_000+i}));
    const outcome = plan(same);
    expect(outcome.method).toBe('verification');
    expect(outcome.recentProblems).toBe(1);
    expect(outcome.spacedDays).toBe(1);
  });
  it('至少三道换题且跨日全对后转混合；单日多题仍继续延迟验证', () => {
    expect(plan([event(0,3),event(1,3),event(2,3)]).method).toBe('verification');
    const result = plan([event(0,3,[],now-2*DAY),event(1,3,[],now-DAY),event(2,3)]);
    expect(result.method).toBe('interleaving');
    expect(result.recentProblems).toBe(3);
    expect(result.spacedDays).toBe(3);
  });
  it('长期未练的强项改为闭卷回忆，未来作答不影响当前建议', () => {
    const old = [0,1,2,3].map(i => event(i,3,[],now-90*DAY));
    expect(plan(old).method).toBe('retrieval');
    const baseline = plan([event(0,1,['公式记错'])]);
    expect(plan([event(0,1,['公式记错']),event(1,0,['概念不清'],now+DAY)])).toEqual(baseline);
  });
});
