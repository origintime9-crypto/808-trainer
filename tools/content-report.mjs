// 用 Vite 读取实际 TS 题库，统计发布内容，供交付核对。
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { problems, papers, cards } = await server.ssrLoadModule('/src/content/index.ts');
  const report = {
    problems: problems.length,
    sources: problems.reduce((n, p) => n + p.sources.length, 0),
    knowledgeCards: cards.filter(c => !c.id.startsWith('pattern-')).length,
    patternCards: cards.filter(c => c.id.startsWith('pattern-')).length,
    papers: papers.map(paper => {
      const units = problems.flatMap(p => p.sources.filter(s => s.paper === paper.id).map(s => ({ id: p.id, no: s.no, score: s.score, verified: p.verified })));
      return { ...paper, count: units.length, scored: units.filter(s => s.score !== undefined).length, subtotal: units.reduce((n, s) => n + (s.score ?? 0), 0), units };
    }),
    errata: problems.filter(p => p.verified !== 'checked').map(p => ({ id: p.id, sources: p.sources, verified: p.verified, note: p.note })),
  };
  await mkdir('work', { recursive: true });
  await writeFile('work/content-report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ ...report, papers: report.papers.map(({ units, ...paper }) => paper), errata: report.errata.length }, null, 2));
} finally { await server.close(); }
