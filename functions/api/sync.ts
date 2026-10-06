import { readEvents } from '../../src/engine/events';
import { authorized, json, type Context } from '../../server/shared';

export async function onRequestPost(ctx: Context): Promise<Response> {
  if (!await authorized(ctx)) return json({ error: '同步口令不正确或未设置' }, 401);
  const db = ctx.env.DB;
  if (!db) return json({ error: '尚未配置云同步数据库' }, 503);
  if (!ctx.request.headers.get('Content-Type')?.includes('application/json')) return json({ error: '请发送 JSON 数据' }, 415);
  let body;
  try {
    const raw = await ctx.request.text();
    if (raw.length > 2_000_000) return json({ error: '本次同步数据太多，请分批同步' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: '同步数据格式错误' }, 400); }
  if (!body || !Number.isSafeInteger(body.since) || body.since < 0 || !Array.isArray(body.events) || body.events.length > 200)
    return json({ error: '同步游标或记录数量无效' }, 400);
  let events;
  try { events = readEvents(body.events); } catch { return json({ error: '包含无效的进度记录' }, 400); }
  try {
    if (events.length) await db.batch(events.map(e => db.prepare('INSERT OR IGNORE INTO events(id,t,data) VALUES(?,?,?)').bind(e.id, e.t, JSON.stringify(e))));
    const latest = (await db.prepare('SELECT COALESCE(MAX(seq),0) AS seq FROM events').first<{ seq: number }>())?.seq ?? 0;
    // 数据库更换或恢复后，拒绝越界游标，客户端重新拉取并上传。
    if (body.since > latest) return json({ error: '云端游标已重置，请重新同步', reset: true }, 409);
    const { results } = await db.prepare('SELECT seq,data FROM events WHERE seq > ? AND seq <= ? ORDER BY seq LIMIT 500').bind(body.since, latest).all<{ seq: number; data: string }>();
    const seq = results.at(-1)?.seq ?? body.since;
    return json({ seq, events: results.map(r => JSON.parse(r.data)), accepted: events.map(e => e.id), hasMore: seq < latest });
  } catch { return json({ error: '云同步暂时不可用，本机进度已保留' }, 503); }
}
