import { describe, expect, it } from 'vitest';
import { gradeFigures } from '../src/ai/figures';
import { buildGradeRequest } from '../src/ai/grade';
import { problemById } from '../src/content';

describe('带图题的批改上下文', () => {
  it('题图和答案图去重，题图优先且与作答照片分别标注', () => {
    const p = problemById.get('zt2026-10')!;
    const figureProblem = { ...p, stem: p.stem + '\n![同一题图](figures/zt2026/q10-zp.png)', answer: '![参考图](figures/wmq6/a6-1-1.svg)', solution: '![重复参考图](figures/wmq6/a6-1-1.svg)' };
    const figures = gradeFigures(figureProblem);
    expect(figures).toEqual([{ source: 'figures/zt2026/q10-zp.png', kind: '题图' }, { source: 'figures/wmq6/a6-1-1.svg', kind: '参考解答图' }]);
    const body = buildGradeRequest(figureProblem, 'gemini-3.8-flash', ['student-photo'], undefined, figures.map((f, i) => ({ ...f, image: 'rasterized-' + i })));
    const content = body.messages[1].content as { type: string; text?: string; image_url?: { url: string } }[];
    expect(content.filter(c => c.type === 'image_url').map(c => c.image_url?.url)).toEqual(['rasterized-0', 'rasterized-1', 'student-photo']);
    expect(content[1].text).toContain('题目给定的条件');
    expect(content[3].text).toContain('标准答案的参考图');
    expect(content[5].text).toContain('仅对下面的作答进行转写和评分');
  });
});
