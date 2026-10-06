// 明确访问本项目的远程接口；仅输出检查结果，不输出口令或学习记录。
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const base = 'https://808-trainer.pages.dev';
const origin = 'https://origintime9-crypto.github.io';
const key = readFileSync(new URL('../同步口令.txt', import.meta.url), 'utf8').trim();
const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, Origin: origin };
const post = (body, auth = true) => fetch(base + '/api/sync', {
  method: 'POST', headers: auth ? headers : { 'Content-Type': 'application/json', Origin: origin },
  body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
});
const health = await (await fetch(base + '/api/health', { signal: AbortSignal.timeout(30000) })).json();
assert.equal(health.ok, true); assert.equal(health.sync, true);
assert.equal((await post({ since: 0, events: [] }, false)).status, 401);
const preflight = await fetch(base + '/api/sync', { method: 'OPTIONS', headers: {
  Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type',
}, signal: AbortSignal.timeout(30000) });
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
assert.equal((await fetch(base + '/api/health', { headers: { Origin: 'https://unapproved.example' }, signal: AbortSignal.timeout(30000) })).status, 403);
const initial = await (await post({ since: 0, events: [] })).json();
assert.ok(Number.isSafeInteger(initial.seq));
const run = 'cloud-check-' + randomUUID();
const list = [
  { id: run + '-attempt', t: Date.now(), kind: 'attempt', problemId: 'zt2026-10', grade: 1, tags: ['计算失误'], sec: 90 },
  { id: run + '-note', t: Date.now() + 1, kind: 'note', problemId: 'zt2026-10', text: '临时云同步验收记录' },
];
mkdirSync(new URL('../work/', import.meta.url), { recursive: true });
writeFileSync(new URL('../work/clean-remote-api-check.sql', import.meta.url),
  'DELETE FROM events WHERE id IN (' + list.map(e => "'" + e.id + "'").join(',') + ');\n');
const firstResponse = await post({ since: initial.seq, events: list });
assert.equal(firstResponse.status, 200);
assert.equal(firstResponse.headers.get('Access-Control-Allow-Origin'), origin);
const first = await firstResponse.json();
assert.deepEqual(first.accepted, list.map(e => e.id));
const other = await (await post({ since: initial.seq, events: [] })).json();
assert.ok(list.every(e => other.events.some(r => r.id === e.id)));
const repeated = await (await post({ since: first.seq, events: list })).json();
assert.equal(repeated.seq, first.seq); assert.equal(repeated.events.length, 0);
assert.equal((await post({ since: repeated.seq, events: [{ ...list[0], id: run + '-invalid', grade: 99 }] })).status, 400);
writeFileSync(new URL('../work/remote-api-result.json', import.meta.url), JSON.stringify({
  checkedAt: new Date().toISOString(), base, origin, health,
  checks: ['health', 'Bearer 鉴权', '跨域预检', '来源限制', '实际 D1 上传', '另一设备拉取', '重复去重', '增量游标', '无效记录拒绝'],
  cleanupFile: 'work/clean-remote-api-check.sql', testIds: list.map(e => e.id),
}, null, 2));
console.log('远程接口检查通过：健康、鉴权、CORS、D1 上传/拉取/去重、增量游标和无效数据保护。');
