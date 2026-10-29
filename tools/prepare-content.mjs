// 原始 TS 题库是唯一内容来源。生成首页目录和按资料分组的异步详情，不改题号与合并来源。
import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const server = await createServer({ server: { middlewareMode: true, hmr:false, ws:false }, appType: 'custom' });
const write = async (path, data) => {
  const text = JSON.stringify(data);
  if (await readFile(path, 'utf8').catch(() => '') !== text) await writeFile(path, text, 'utf8');
};
try {
  const { problems, cards } = await server.ssrLoadModule('/src/content/index.ts');
  const { estimateDemand } = await server.ssrLoadModule('/src/content/demand.ts');
  const { supportForProblem } = await server.ssrLoadModule('/src/content/learningSupport.ts');
  await mkdir('src/content/generated/problems', { recursive: true });
  const groups = new Map();
  for (const p of problems) {
    const key = p.sources[0].paper;
    if (!/^[a-z0-9-]+$/.test(key)) throw new Error('资料分组名无效');
    const rows = groups.get(key) ?? [];
    rows.push({ ...p, ...supportForProblem(p) }); groups.set(key, rows);
  }
  for (const [key, rows] of groups) await write(`src/content/generated/problems/${key}.json`, rows);
  const fields = ['id', 'sources', 'type', 'kps', 'pattern', 'verified', 'minutes', 'family', 'answerKey'];
  await write('src/content/generated/catalog.json', {
    problems: problems.map(p => ({ ...Object.fromEntries(fields.filter(k => p[k] !== undefined).map(k => [k, p[k]])), demand: estimateDemand(p) })),
    cards: cards.map(({ id, kps }) => ({ id, kps })),
  });
  console.log(`内容已准备：${problems.length}题 / ${groups.size}个详情分组 / ${cards.length}张卡片。`);
} finally { await server.close(); }
