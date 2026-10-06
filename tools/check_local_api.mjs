// 在真实本地 Cloudflare 运行时检查路由与 D1；不会请求远程地址或真实模型。
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:8788');
assert(base.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(base.hostname), '只允许本机测试地址');
const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer 808-local-test-only' };
const post = (path, body, auth = true) => fetch(new URL(path, base), { method: 'POST', headers: auth ? headers : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const h = await (await fetch(new URL('/api/health', base))).json();
assert.equal(h.ok, true); assert.equal(h.sync, true);
assert.equal((await post('/api/sync', { since: 0, events: [] }, false)).status, 401);
assert.equal((await post('/api/grade', {}, false)).status, 401);
console.log('OK health 与两条路由鉴权');
const prefix = `local-check-${randomUUID()}`;
const list = [
  { id: `${prefix}-a`, t: Date.now(), kind: 'attempt', problemId: 'zt2026-10', grade: 1, sec: 60, tags: ['计算失误'] },
  { id: `${prefix}-b`, t: Date.now()+1, kind: 'note', problemId: 'zt2026-10', text: '本地接口测试记录' },
];
await mkdir('work', { recursive: true });
await writeFile('work/clean-local-test.sql', `DELETE FROM events WHERE id IN (${list.map(e => `'${e.id}'`).join(',')});\n`);
const upload = await post('/api/sync', { since: 0, events: list });
assert.equal(upload.status, 200);
const first = await upload.json();
assert.equal(first.events.filter(e => e.id.startsWith(prefix)).length, 2);
const repeated = await (await post('/api/sync', { since: 0, events: list })).json();
assert.equal(repeated.events.filter(e => e.id.startsWith(prefix)).length, 2);
const delta = await (await post('/api/sync', { since: repeated.seq, events: [] })).json();
assert.equal(delta.events.length, 0); assert.equal(delta.seq, repeated.seq);
console.log('OK D1 上传、幂等去重和增量游标');
if (!h.ai) assert.equal((await post('/api/grade', {})).status, 503);
assert.equal((await post('/api/sync', { since: 0, events: [{ ...list[0], grade: 99 }] })).status, 400);
console.log('OK 未配置 AI 的降级与无效记录拒绝');
console.log('本地接口检查通过；清理测试行：npx wrangler d1 execute 808-trainer --local --file work/clean-local-test.sql');
