export interface Statement {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}
export interface Env {
  ALLOWED_ORIGINS?: string;
  SYNC_KEY?: string;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
  DB?: { prepare(sql: string): Statement; batch(stmts: Statement[]): Promise<unknown[]> };
}
export interface Context { request: Request; env: Env }
export const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
export async function authorized({ request, env }: Context): Promise<boolean> {
  if (!env.SYNC_KEY || !request.headers.get('Authorization')?.startsWith('Bearer ')) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(request.headers.get('Authorization')!.slice(7))),
    crypto.subtle.digest('SHA-256', enc.encode(env.SYNC_KEY)),
  ]);
  const av = new Uint8Array(a), bv = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < av.length; i++) diff |= av[i] ^ bv[i];
  return diff === 0;
}
