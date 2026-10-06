import { json, type Context } from '../../server/shared';

interface MiddlewareContext extends Context { next(): Promise<Response> }

// 为 GitHub Pages 前端开放明确的来源；Bearer 口令仍由各接口验证。
export async function onRequest(ctx: MiddlewareContext): Promise<Response> {
  const origin = ctx.request.headers.get('Origin');
  const allowed = (ctx.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (origin && origin !== new URL(ctx.request.url).origin && !allowed.includes(origin))
    return json({ error: '此网址未获准连接后端' }, 403);

  let response: Response;
  if (ctx.request.method === 'OPTIONS') {
    const method = ctx.request.headers.get('Access-Control-Request-Method');
    const headers = (ctx.request.headers.get('Access-Control-Request-Headers') ?? '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (!origin || !method || !['GET', 'POST'].includes(method) || headers.some(h => !['authorization', 'content-type'].includes(h)))
      return json({ error: '跨域请求格式无效' }, 400);
    response = new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '600',
    } });
  } else {
    const upstream = await ctx.next();
    response = new Response(upstream.body, upstream);
  }
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    const vary = response.headers.get('Vary');
    response.headers.set('Vary', vary ? vary + ', Origin' : 'Origin');
  }
  return response;
}
