import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestGet as health } from '../functions/api/health';
import { onRequestPost as sync } from '../functions/api/sync';
import { onRequestPost as grade } from '../functions/api/grade';
import type { Env, Statement } from '../server/shared';
import { buildGradeRequest, gradePhotos, normalizeAiMarkdown, parseAiResult } from '../src/ai/grade';
import { problemById } from '../src/content';
import type { TrainerEvent } from '../src/types';
import { generateMock, mockResult, mockSessions, validMockSession } from '../src/engine/mock';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Md } from '../src/components/Markdown';

class MemoryD1 {
  rows: { seq: number; id: string; data: string }[] = [];
  async batch(stmts: Statement[]) { return Promise.all(stmts.map(s => s.run())); }
  prepare(sql: string): Statement {
    let values: unknown[] = [];
    const statement: Statement = {
      bind: (...v) => { values = v; return statement; },
      run: async () => {
        if (!this.rows.some(r => r.id === values[0])) this.rows.push({ seq: this.rows.length + 1, id: values[0] as string, data: values[2] as string });
        return {};
      },
      first: async <T>() => ({ seq: this.rows.at(-1)?.seq ?? 0 } as T),
      all: async <T>() => ({ results: this.rows.filter(r => r.seq > Number(values[0]) && r.seq <= Number(values[1])).slice(0, 500) as T[] }),
    };
    expect(sql).toMatch(/INSERT OR IGNORE|SELECT/);
    return statement;
  }
}
const event = (id: string): TrainerEvent => ({ id, t: 1000, kind: 'attempt', problemId: 'zt2026-10', grade: 1, tags: ['计算失误'], sec: 90 });
const req = (body: unknown, token = 'test-pass') => new Request('https://test.local/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
afterEach(() => vi.unstubAllGlobals());

describe('云端接口', () => {
  it('健康检查只报告功能状态，不暴露密钥', async () => {
    const r = health({ request: req({}), env: { SYNC_KEY: 'secret-sync', AI_API_KEY: 'secret-ai', AI_BASE_URL: 'https://model.example/v1', AI_MODEL: 'vision' } });
    expect(await r.json()).toEqual({ ok: true, ai: true, model: 'vision', sync: false });
  });
  it('未授权请求在读写数据库和转发之前拒绝', async () => {
    const db = new MemoryD1();
    expect((await sync({ request: req({ since: 0, events: [event('a')] }, ''), env: { DB: db, SYNC_KEY: 'test-pass' } })).status).toBe(401);
    expect((await grade({ request: req({}), env: {} })).status).toBe(401);
    expect(db.rows.length).toBe(0);
  });
  it('重复上传去重，另一设备可以完整拉取，游标增量正确', async () => {
    const env: Env = { DB: new MemoryD1(), SYNC_KEY: 'test-pass' };
    const first = await (await sync({ request: req({ since: 0, events: [event('a'), event('b')] }), env })).json();
    expect(first.seq).toBe(2); expect(first.events).toHaveLength(2);
    const repeat = await (await sync({ request: req({ since: 2, events: [event('a')] }), env })).json();
    expect(repeat.seq).toBe(2); expect(repeat.events).toHaveLength(0);
    const other = await (await sync({ request: req({ since: 0, events: [event('c')] }), env })).json();
    expect(other.seq).toBe(3); expect(other.events.map((e: TrainerEvent) => e.id)).toEqual(['a', 'b', 'c']);
  });
  it('大量记录分页返回，游标不会跳过未返回的数据', async () => {
    const db = new MemoryD1();
    db.rows = Array.from({ length: 650 }, (_, i) => ({ seq: i + 1, id: String(i), data: JSON.stringify(event(String(i))) }));
    const env: Env = { DB: db, SYNC_KEY: 'test-pass' };
    const first = await (await sync({ request: req({ since: 0, events: [] }), env })).json();
    expect(first.seq).toBe(500); expect(first.hasMore).toBe(true);
    const next = await (await sync({ request: req({ since: first.seq, events: [] }), env })).json();
    expect(next.events).toHaveLength(150); expect(next.seq).toBe(650); expect(next.hasMore).toBe(false);
  });
  it('真实卷面配置、当前题位、作答与结束通过云接口往返后仍能还原估分', async () => {
    const env: Env = { DB: new MemoryD1(), SYNC_KEY: 'test-pass' };
    const items = generateMock('zt2026', 'mixed', 'cloud-protocol');
    const events: TrainerEvent[] = [
      { id: 'exam-start', t: 1000, kind: 'exam', examId: 'mock-cloud', action: 'start', title: '模拟卷', template: 'zt2026', minutes: 180, items },
      { id: 'exam-nav', t: 1100, kind: 'exam', examId: 'mock-cloud', action: 'navigate', current: 3 },
      { id: 'exam-answer', t: 1200, kind: 'attempt', examId: 'mock-cloud', problemId: items[3].problemId, grade: 3, sec: 30, tags: [] },
      { id: 'exam-finish', t: 1300, kind: 'exam', examId: 'mock-cloud', action: 'finish' },
    ];
    const upload = await sync({ request: req({ since: 0, events }), env });
    expect(upload.status).toBe(200);
    const first = await upload.json();
    const restored = await (await sync({ request: req({ since: 0, events: [] }), env })).json();
    expect(restored.events).toEqual(events);
    const session = mockSessions(restored.events)[0];
    expect(validMockSession(session)).toBe(true);
    expect(session.current).toBe(3); expect(session.finished).toBe(1300);
    expect(mockResult(session, restored.events)).toMatchObject({ done: 1, score: items[3].score, total: 150 });
    const duplicate = await (await sync({ request: req({ since: first.seq, events }), env })).json();
    expect(duplicate.events).toEqual([]);
    const bad = { ...events[0], items: [{ ...items[0], score: 999 }] };
    expect((await sync({ request: req({ since: 0, events: [bad] }), env })).status).toBe(400);
  });
  it('错误评分、错因、游标和批量大小不会污染数据', async () => {
    const env: Env = { DB: new MemoryD1(), SYNC_KEY: 'test-pass' };
    for (const body of [{ since: -1, events: [] }, { since: 0, events: [{ ...event('x'), grade: 9 }] }, { since: 0, events: [{ ...event('x'), tags: ['随便'] }] }, { since: 0, events: Array(201).fill(event('a')) }])
      expect((await sync({ request: req(body), env })).status).toBe(400);
    const reset = await sync({ request: req({ since: 50, events: [] }), env });
    expect(reset.status).toBe(409); expect((await reset.json()).reset).toBe(true);
  });
  it('批改原样转发请求体，使用服务端 Key，响应不泄露 Key', async () => {
    const forwarded = vi.fn(async (_target: unknown, init: RequestInit) => {
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-ai');
      expect(await new Response(init.body).text()).toBe('不需要在服务端解析的原始请求');
      return new Response(JSON.stringify({ choices: [{ message: { content: 'secret-ai' } }] }), { headers: { 'X-Secret': 'secret-ai' } });
    });
    vi.stubGlobal('fetch', forwarded);
    const request = new Request('https://test.local/api/grade', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-pass' }, body: '不需要在服务端解析的原始请求' });
    const r = await grade({ request, env: { SYNC_KEY: 'test-pass', AI_API_KEY: 'secret-ai', AI_BASE_URL: 'https://model.example/v1/', AI_MODEL: 'vision' } });
    expect(r.status).toBe(200); expect(forwarded).toHaveBeenCalledOnce(); expect(await r.text()).not.toContain('secret-ai'); expect(r.headers.get('X-Secret')).toBeNull();
  });
  it('Gemini 兼容接口接收照片与批改消息，Key 只用于服务端请求', async () => {
    const model = 'gemini-3.8-flash';
    const body = buildGradeRequest(problemById.get('zt2026-10')!, model, ['data:image/jpeg;base64,dGVzdA==']);
    const forwarded = vi.fn(async (target: string | URL, init: RequestInit) => {
      expect(String(target)).toBe('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-gemini-secret');
      const received = JSON.parse(await new Response(init.body).text());
      expect(received.model).toBe(model);
      expect(received).not.toHaveProperty('temperature');
      expect(received.response_format.type).toBe('json_schema');
      expect(received.messages[1].content).toContainEqual({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,dGVzdA==' } });
      expect(received.messages[1].content[0].text).toContain('【标准答案】');
      return Response.json({ choices: [{ message: { content: JSON.stringify({ transcript: '作答', grade: 1, tags: ['计算失误'], feedback: '检查系数' }) } }] });
    });
    vi.stubGlobal('fetch', forwarded);
    const request = new Request('https://test.local/api/grade', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-pass' }, body: JSON.stringify(body) });
    const r = await grade({ request, env: { SYNC_KEY: 'test-pass', AI_API_KEY: 'test-gemini-secret', AI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/openai/', AI_MODEL: model } });
    expect(r.status).toBe(200); expect(forwarded).toHaveBeenCalledOnce();
    const data = await r.json();
    expect(parseAiResult(data.choices[0].message.content, model)).toMatchObject({ grade: 1, model });
    expect(JSON.stringify(data)).not.toContain('test-gemini-secret');
  });
  it('上游错误和未配置模型均有可恢复结果', async () => {
    const env = { SYNC_KEY: 'test-pass', AI_API_KEY: 'secret-ai', AI_BASE_URL: 'https://model.example/v1', AI_MODEL: 'vision' };
    vi.stubGlobal('fetch', vi.fn(async () => new Response('secret-ai', { status: 401 })));
    const r = await grade({ request: req({}), env });
    expect(r.status).toBe(502); expect(await r.text()).not.toContain('secret-ai');
    expect((await grade({ request: req({}), env: { SYNC_KEY: 'test-pass' } })).status).toBe(503);
  });
  it('模型地址跳转时不把服务端 Key 转交其他网址', async () => {
    const forwarded = vi.fn(async (_target: unknown, init: RequestInit) => {
      expect(init.redirect).toBe('manual');
      return new Response(null, { status: 302, headers: { Location: 'https://other.example/collect' } });
    });
    vi.stubGlobal('fetch', forwarded);
    const r = await grade({ request: req({}), env: { SYNC_KEY: 'test-pass', AI_API_KEY: 'secret-ai', AI_BASE_URL: 'https://model.example/v1', AI_MODEL: 'vision' } });
    expect(r.status).toBe(502); expect(forwarded).toHaveBeenCalledOnce(); expect(await r.text()).not.toContain('secret-ai');
  });
});
describe('AI 输出解析', () => {
  const value = { transcript: '$x=1$', steps: [{ step: '计算', ok: false, comment: '符号错误' }], grade: 1, tags: ['计算失误'], feedback: '检查符号' };
  it('接受纯 JSON、代码块和正文包裹的 JSON', () => {
    for (const raw of [JSON.stringify(value), '```json\n' + JSON.stringify(value) + '\n```', '点评如下：' + JSON.stringify(value)])
      expect(parseAiResult(raw, 'vision')?.grade).toBe(1);
  });
  it('恢复模型少转义一次的分式命令，保留正常换行', () => {
    const transcript = '$X(z)=\\frac{10}{1+z^{-1}}$\n第二行 $y=-10u(n)+20\\times2^nu(n)$';
    const raw = JSON.stringify({ ...value, transcript }).replaceAll('\\\\', '\\');
    expect(parseAiResult(raw, 'vision')?.transcript).toBe(transcript);
    expect(parseAiResult(JSON.stringify({ ...value, transcript }), 'vision')?.transcript).toBe(transcript);
  });
  it('乱码与无效建议留给用户手动确认', () => {
    expect(parseAiResult('不是JSON', 'vision')).toBeNull();
    expect(parseAiResult(JSON.stringify({ ...value, grade: 5 }), 'vision')).toBeNull();
    expect(parseAiResult(JSON.stringify({ ...value, tags: ['其他'] }), 'vision')).toBeNull();
  });
  it('模型公式无法排版时保留可核对的原式，不猜写乘号或导数', () => {
    const render = (text: string) => renderToStaticMarkup(createElement(Md, { children: normalizeAiMarkdown(text), preserveBadMath: true }));
    const valid = '$X(z)=\\frac{10}{1+z^{-1}}$';
    expect(render(valid)).toContain('class="katex"');
    expect(render(valid)).not.toContain('math-original');
    expect(normalizeAiMarkdown('\\(x=1\\)')).toBe('$x=1$');
    const control = render('$y(n)=-10\u0007u(n)+20\u00072^n\u0007u(n)$');
    expect(control).toContain('公式原文（请核对）');
    expect(control).toContain('\\u0007');
    expect(control).not.toContain('\\cdot');
    const prime = render("$20'2^n'u(n)$");
    expect(prime).toContain('20&#x27;2^n&#x27;u(n)');
    expect(prime).toContain('公式原文（请核对）');
  });
  it('缺少题面分值或模型超出总分时不预填数字估分', async () => {
    for (const [id, proposed, expected] of [['tk-key-1-2', 3, undefined], ['zt2026-10', 100, undefined], ['zt2026-10', 4.5, 4.5]] as const) {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json({ choices: [{ message: { content: JSON.stringify({ ...value, score: proposed }) } }] })));
      const output = await gradePhotos(problemById.get(id)!, 'vision', 'test-pass', ['data:image/jpeg;base64,dGVzdA==']);
      expect(output.result?.grade).toBe(1); expect(output.result?.score).toBe(expected);
    }
  });
});
