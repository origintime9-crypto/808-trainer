import { describe, expect, it, vi } from 'vitest';
import { resolveApiUrl } from '../src/api';
import { onRequest } from '../functions/api/_middleware';

describe('独立前后端部署', () => {
  it('GitHub 子目录保留相对路径，独立后端地址不受网页路径影响', () => {
    expect(resolveApiUrl('health')).toBe('./api/health');
    expect(resolveApiUrl('sync', 'https://808-trainer.pages.dev/')).toBe('https://808-trainer.pages.dev/api/sync');
    expect(resolveApiUrl('grade', 'https://backend.example/trainer')).toBe('https://backend.example/trainer/api/grade');
    for (const base of ['http://remote.example', 'https://user:secret@backend.example', 'https://backend.example?key=secret'])
      expect(() => resolveApiUrl('sync', base)).toThrow('后端地址配置无效');
  });
  it('只允许指定前端的预检，预检不执行后端', async () => {
    const next = vi.fn(async () => new Response('不会执行'));
    const response = await onRequest({
      request: new Request('https://backend.example/api/sync', { method: 'OPTIONS', headers: {
        Origin: 'https://origintime9-crypto.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      } }), env: { ALLOWED_ORIGINS: 'https://origintime9-crypto.github.io' }, next,
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://origintime9-crypto.github.io');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    expect(next).not.toHaveBeenCalled();
  });
  it('错误来源在访问数据库前拒绝；授权失败响应仍让指定前端读到', async () => {
    const next = vi.fn(async () => new Response('口令错误', { status: 401 }));
    const env = { ALLOWED_ORIGINS: 'https://origintime9-crypto.github.io' };
    const bad = await onRequest({ request: new Request('https://backend.example/api/sync', { headers: { Origin: 'https://evil.example' } }), env, next });
    expect(bad.status).toBe(403); expect(next).not.toHaveBeenCalled();
    const good = await onRequest({ request: new Request('https://backend.example/api/sync', { headers: { Origin: env.ALLOWED_ORIGINS } }), env, next });
    expect(good.status).toBe(401); expect(await good.text()).toBe('口令错误');
    expect(good.headers.get('Access-Control-Allow-Origin')).toBe(env.ALLOWED_ORIGINS);
    expect(good.headers.get('Vary')).toContain('Origin');
    const same = await onRequest({ request: new Request('https://backend.example/api/health'), env: {}, next: async () => new Response('ok') });
    expect(await same.text()).toBe('ok');
  });
});
