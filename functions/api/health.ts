import { json, type Context } from '../../server/shared';

export function onRequestGet({ env }: Context): Response {
  return json({ ok: true, ai: !!(env.AI_API_KEY && env.AI_BASE_URL && env.AI_MODEL), model: env.AI_MODEL ?? '', sync: !!(env.DB && env.SYNC_KEY) });
}
