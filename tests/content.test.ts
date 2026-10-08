import { existsSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { cards, knowledge, paperById, papers, patternById, patterns, problems, kpById } from '../src/content';

function mathSegments(text: string): { tex: string; display: boolean }[] {
  const out: { tex: string; display: boolean }[] = [];
  const rest = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => {
    out.push({ tex, display: true });
    return ' ';
  });
  rest.replace(/\$([^$\n]+?)\$/g, (_, tex: string) => {
    out.push({ tex, display: false });
    return ' ';
  });
  return out;
}

function checkTex(where: string, text: string) {
  const dollars = (text.replace(/\\\$/g, '').match(/\$/g) ?? []).length;
  expect(dollars % 2, `${where}：$ 数量不成对`).toBe(0);
  for (const { tex, display } of mathSegments(text)) {
    try {
      katex.renderToString(tex, { throwOnError: true, displayMode: display, strict: 'ignore' });
    } catch (e) {
      throw new Error(`${where} 公式错误：${tex}\n${(e as Error).message}`);
    }
  }
}

describe('内容完整性', () => {
  it('真题与题库作答单元齐全，同一来源题号只出现一次', () => {
    // 从题面清单独立登记的作答单元数；同题多来源仍分别计入卷面。
    const expected: Record<string, number> = { zt2016: 28, zt2017: 30, zt2018: 30, zt2023: 22, zt2024: 23, zt2025: 25, zt2026: 17, 'tk-review': 34, 'tk-total': 24, hw1: 27, hw2: 6, hw3: 24, hw4: 47, hw5: 4, hw6: 19, hw7: 28, 'tk-key': 29, 'tk-exam-01': 21, 'tk-exam-02': 25, 'tk-exam-03': 24, 'tk-exam-04': 25, 'tk-exam-05': 24, 'tk-exam-06': 26, 'tk-exam-07': 31, 'tk-exam-08': 27, 'tk-exam-09': 28, 'tk-exam-10': 19, 'tk-exam-11': 30, 'tk-exam-12': 26, 'tk-exam-13': 25, 'tk-exam-14': 24, 'tk-exam-15': 28 };
    const all = problems.flatMap(p => p.sources);
    expect(new Set(all.map(s => `${s.paper}:${s.no}`)).size).toBe(all.length);
    Object.assign(expected, { 'tk-exam-16': 22, 'tk-exam-17': 27, 'tk-exam-18': 23, 'tk-exam-19': 22, 'tk-exam-20': 27, 'tk-exam-21': 27, 'tk-exam-22': 21, 'tk-exam-23': 20, 'tk-exam-24': 25, 'ext-xaut2024': 13, 'ext-sau2024': 12, 'ext-sxu2024': 8 });
    for (const paper of papers) expect(all.filter(s => s.paper === paper.id).length, paper.id).toBe(expected[paper.id]);
    expect(cards.filter(c => !c.id.startsWith('pattern-'))).toHaveLength(100);
    expect(all.filter(s => s.paper === 'zt2026').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(150);
    expect(all.filter(s => s.paper === 'zt2017').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(150);
    // 2016 原卷小题合计 149，保持原分值，不擅自加分。
    expect(all.filter(s => s.paper === 'zt2016').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(149);
    // 课程 04 的二(1)和综合题拆问，原题未给小问分值，已知部分只计 70 分。
    expect(all.filter(s => s.paper === 'tk-exam-04').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(70);
    // 课程 05 仅填空与二(1)、二(2)给出独立分值，拆问不擅自平分。
    expect(all.filter(s => s.paper === 'tk-exam-05').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    // 课程 06 的二(2)、二(5)及综合题拆问无独立分值，已知部分60分。
    expect(all.filter(s => s.paper === 'tk-exam-06').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
    // 第7套原卷未编号，明确独立分值只有填空和计算一、三。
    expect(all.filter(s => s.paper === 'tk-exam-07').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    // 课程8只给填空及计算一、三、四的独立分值；拆问不虚分。
    expect(all.filter(s => s.paper === 'tk-exam-08').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
    // 第9套原卷未编号，只给填空和计算三的独立分值。
    expect(all.filter(s => s.paper === 'tk-exam-09').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(40);
    // 课程10综合一同时标10/15分而冲突；其余综合拆问也不虚分，已知部分80分。
    expect(all.filter(s => s.paper === 'tk-exam-10').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(80);
    // 课程11只有填空和计算四、五有单独分值；其余拆问不擅自平分。
    expect(all.filter(s => s.paper === 'tk-exam-11').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    // 课程12采样三问、响应分解与综合拆问无独立分值，已知部分60分。
    expect(all.filter(s => s.paper === 'tk-exam-12').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
    // 课程13仅填空及计算一、三有独立分值，其余拆问不虚分。
    expect(all.filter(s => s.paper === 'tk-exam-13').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    expect(all.filter(s => s.paper === 'tk-exam-14').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    expect(all.filter(s => s.paper === 'tk-exam-15').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
    // 课程16计算四及两个综合题无小问分值，保留已知部分70分。
    expect(all.filter(s => s.paper === 'tk-exam-16').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(70);
    // 课程17计算二/五及综合拆问无小问分值，已知部分60分。
    expect(all.filter(s => s.paper === 'tk-exam-17').reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
    // 课程18只有填空、计算一/二标独立分值，其余拆问不虚分。
    const course18 = all.filter(s => s.paper === 'tk-exam-18');
    expect(course18.filter(s => s.score !== undefined)).toHaveLength(12);
    expect(course18.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    // 顺序第19套只有填空及计算二/三/四/五独立标分，二1和综合拆问不虚分。
    const course19 = all.filter(s => s.paper === 'tk-exam-19');
    expect(course19.filter(s => s.score !== undefined)).toHaveLength(14);
    expect(course19.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(70);
    // 课程20只有十填空和计算一、五有独立分值，拆问不虚分。
    const course20 = all.filter(s => s.paper === 'tk-exam-20');
    expect(course20.filter(s => s.score !== undefined)).toHaveLength(12);
    expect(course20.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(50);
    // 课程21只给十填空及计算三独立分值，其他小问无分值，累计阶跃题保留条件提示。
    const course21 = all.filter(s => s.paper === 'tk-exam-21');
    expect(course21.filter(s => s.score !== undefined)).toHaveLength(11);
    expect(course21.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(40);
    // 课程22十填空和计算一至四有独立分值；计算五和综合拆问不虚分。
    const course22 = all.filter(s => s.paper === 'tk-exam-22');
    expect(course22.filter(s => s.score !== undefined)).toHaveLength(14);
    expect(course22.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(70);
    // 课程23十填空与五计算整问均有独立分值，综合拆问不虚分。
    const course23 = all.filter(s => s.paper === 'tk-exam-23');
    expect(course23.filter(s => s.score !== undefined)).toHaveLength(15);
    expect(course23.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(80);
    // 课程24十填空与计算一/三/四有独立分值，其余拆问不虚分。
    const course24 = all.filter(s => s.paper === 'tk-exam-24');
    expect(course24.filter(s => s.score !== undefined)).toHaveLength(13);
    expect(course24.reduce((sum, s) => sum + (s.score ?? 0), 0)).toBe(60);
  });
  it('id 唯一', () => {
    for (const list of [knowledge, patterns, problems, cards]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('题目引用的知识点、题型、试卷、图片都存在', () => {
    for (const p of problems) {
      expect(p.kps.length, p.id).toBeGreaterThan(0);
      for (const k of p.kps) expect(kpById.has(k), `${p.id} 知识点 ${k}`).toBe(true);
      if (p.pattern) expect(patternById.has(p.pattern), `${p.id} 题型 ${p.pattern}`).toBe(true);
      for (const s of p.sources) expect(paperById.has(s.paper), `${p.id} 试卷 ${s.paper}`).toBe(true);
      for (const f of p.figures ?? []) expect(existsSync(join('public', f)), `${p.id} 图片 ${f}`).toBe(true);
      if (p.type === '选择') {
        expect(p.options?.length, p.id).toBeGreaterThan(1);
        expect(p.answerKey, p.id).toBeGreaterThanOrEqual(0);
        expect(p.answerKey!, p.id).toBeLessThan(p.options!.length);
      }
      if (p.verified !== 'checked') expect(p.note, `${p.id} 需要写明修正或存疑原因`).toBeTruthy();
    }
  });

  it('卡片和题型引用的知识点存在', () => {
    for (const c of cards) for (const k of c.kps) expect(kpById.has(k), `${c.id} 知识点 ${k}`).toBe(true);
    for (const p of patterns) for (const k of p.kps) expect(kpById.has(k), `${p.id} 知识点 ${k}`).toBe(true);
  });

  it('所有公式都能被 KaTeX 渲染', () => {
    for (const p of problems) {
      for (const field of ['stem', 'answer', 'solution'] as const) checkTex(`${p.id}.${field}`, p[field]);
      p.options?.forEach((o, i) => checkTex(`${p.id}.options[${i}]`, o));
      for (const text of [p.stem, p.answer, p.solution]) {
        for (const match of text.matchAll(/!\[[^\]]*\]\((figures\/[^)]+)\)/g)) {
          expect(existsSync(join('public', match[1])), `${p.id} 答案图 ${match[1]}`).toBe(true);
        }
      }
    }
    for (const c of cards) {
      checkTex(`${c.id}.front`, c.front);
      checkTex(`${c.id}.back`, c.back);
    }
    for (const p of patterns) checkTex(`pattern ${p.id}`, p.method);
  });
});
