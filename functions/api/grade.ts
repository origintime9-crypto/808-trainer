import { authorized, json, type Context } from '../../server/shared';

export async function onRequestPost(ctx: Context): Promise<Response> {
  if (!await authorized(ctx)) return json({ error: '请先填写正确的同步口令' }, 401);
  const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = ctx.env;
  if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) return json({ error: '服务端尚未开启 AI，可使用复制批改提示词' }, 503);
  if (!ctx.request.headers.get('Content-Type')?.includes('application/json')) return json({ error: '批改请求格式错误' }, 415);
  if (Number(ctx.request.headers.get('Content-Length') || 0) > 10_000_000) return json({ error: '图片过大，请减少图片数量' }, 413);
  let target: URL;
  try {
    target = new URL(`${AI_BASE_URL.replace(/\/$/, '')}/chat/completions`);
    if (target.protocol !== 'https:' || target.username || target.password) throw new Error();
  } catch { return json({ error: '服务端模型地址配置无效' }, 503); }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    // 保留原始 JSON 字节；已知长度的请求体兼容模型上游，不解码照片。
    const body = await ctx.request.arrayBuffer();
    if (body.byteLength > 10_000_000) return json({ error: '图片过大，请减少图片数量' }, 413);
    const upstream = await fetch(target.href, {
      method: 'POST', body,
      headers: { Authorization: `Bearer ${AI_API_KEY}`, 'Content-Type': 'application/json' },
      signal: controller.signal, redirect: 'manual',
    });
    if (!upstream.ok) return json({ error: `模型暂时无法批改（${upstream.status}），请稍后重试或复制提示词` }, 502);
    // 只读取文本响应，不透传上游响应头，也不把异常或密钥返回前端。
    let response = await upstream.text();
    for (const secret of [AI_API_KEY, ctx.env.SYNC_KEY]) if (secret) response = response.split(secret).join('[已隐藏]');
    return new Response(response, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    // 仅记录固定诊断词，不记录异常原文、口令或图片请求。
    const hints = error instanceof Error ? ['stream', 'duplex', 'redirect', 'fetch', 'header', 'timeout', 'abort', 'illegal invocation', 'url', 'certificate', 'connection', 'protocol', 'body', 'character'].filter(word => error.message.toLowerCase().includes(word)) : [];
    console.error('808-grade-upstream', error instanceof Error ? error.name : 'unknown', hints);
    return json({ error: '模型连接失败或超时，请稍后重试；也可以复制批改提示词' }, 502);
  }
  finally { clearTimeout(timeout); }
}
