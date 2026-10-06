import { useSyncExternalStore } from 'react';
import { app } from '../state';
import { readEvents } from './events';
import type { TrainerEvent } from '../types';
import { apiUrl } from '../api';

export interface Health { ok: boolean; ai: boolean; model: string; sync: boolean }
interface SyncMeta { since: number; uploaded: string[]; lastSync?: number }
interface SyncStatus { phase: 'local' | 'idle' | 'syncing' | 'error' | 'done'; message: string; health: Health | null; lastSync?: number }
const META = 'trainer808.sync.v1';
let status: SyncStatus = { phase: 'local', message: '本机进度已保存', health: null };
const listeners = new Set<() => void>();
const update = (patch: Partial<SyncStatus>) => { status = { ...status, ...patch }; listeners.forEach(l => l()); };
export const useSyncStatus = () => useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, () => status);

function meta(): SyncMeta {
  try {
    const m = JSON.parse(localStorage.getItem(META) ?? '{}');
    return { since: Number.isSafeInteger(m.since) && m.since >= 0 ? m.since : 0, uploaded: Array.isArray(m.uploaded) ? m.uploaded.filter((id: unknown) => typeof id === 'string') : [], lastSync: m.lastSync };
  } catch { return { since: 0, uploaded: [] }; }
}
export async function refreshHealth(): Promise<Health | null> {
  try {
    const r = await fetch(apiUrl('health'), { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const h = await r.json();
    if (!r.ok || h.ok !== true || typeof h.ai !== 'boolean' || typeof h.model !== 'string') throw new Error();
    const health: Health = { ok: true, ai: h.ai, model: h.model, sync: h.sync === true };
    update({ health, phase: 'idle', message: health.sync ? (app.settings().syncKey ? '云同步已就绪' : '填写同步口令后可跨设备同步') : '本地模式，进度保存在此浏览器' });
    return health;
  } catch { update({ health: null, phase: 'local', message: '本地模式，进度保存在此浏览器' }); return null; }
}
let ongoing: Promise<void> | null = null;
export function syncNow(): Promise<void> {
  if (ongoing) return ongoing;
  ongoing = performSync().finally(() => { ongoing = null; });
  return ongoing;
}
async function performSync() {
  const key = app.settings().syncKey;
  if (!key) { update({ phase: 'local', message: '请在设置页填写同步口令' }); return; }
  const h = status.health ?? await refreshHealth();
  if (!h?.sync) { update({ phase: 'local', message: '当前未连接云同步，本机进度已保留' }); return; }
  update({ phase: 'syncing', message: '正在合并两端进度…' });
  let m = meta(), resets = 0;
  try {
    for (;;) {
      if (app.settings().syncKey !== key) throw new Error('口令已改变，请重新同步');
      const uploaded = new Set(m.uploaded);
      const pending = app.events().filter(e => !uploaded.has(e.id));
      const batch: TrainerEvent[] = [];
      let size = 0;
      for (const e of pending.slice(0, 200)) {
        const bytes = JSON.stringify(e).length;
        if (size + bytes > 1_800_000) break;
        batch.push(e); size += bytes;
      }
      const r = await fetch(apiUrl('sync'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ since: m.since, events: batch }), signal: AbortSignal.timeout(30000),
      });
      const data = await r.json();
      if (r.status === 409 && data.reset && resets++ === 0) { m = { since: 0, uploaded: [] }; continue; }
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : `同步失败（${r.status}）`);
      if (!Number.isSafeInteger(data.seq) || data.seq < m.since || !Array.isArray(data.accepted) || !data.accepted.every((id: unknown) => batch.some(e => e.id === id))) throw new Error('服务器返回了无效的同步结果');
      const received = readEvents(data.events);
      // 先保存进度，再移动游标。中途中断最多导致重复请求，不会丢掉记录。
      if (app.settings().syncKey !== key) throw new Error('口令已改变，请重新同步');
      app.importEvents(received);
      m = { since: data.seq, uploaded: [...new Set([...m.uploaded, ...data.accepted, ...received.map(e => e.id)])], lastSync: Date.now() };
      localStorage.setItem(META, JSON.stringify(m));
      if (!data.hasMore && pending.length <= batch.length) break;
    }
    update({ phase: 'done', message: '两端进度已同步', lastSync: m.lastSync });
  } catch (e) { update({ phase: 'error', message: `${e instanceof Error ? e.message : '网络异常'}；本机进度仍已保存` }); }
}

export function connectSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let signature = `${app.events().length}:${app.settings().syncKey}`;
  const stop = app.subscribe(() => {
    const next = `${app.events().length}:${app.settings().syncKey}`;
    if (next === signature) return;
    signature = next;
    clearTimeout(timer);
    if (app.settings().syncKey) timer = setTimeout(() => void syncNow(), 5000);
  });
  const online = () => { void refreshHealth().then(() => { if (app.settings().syncKey) void syncNow(); }); };
  const visible = () => { if (document.visibilityState === 'visible' && app.settings().syncKey) void syncNow(); };
  window.addEventListener('online', online);
  document.addEventListener('visibilitychange', visible);
  online();
  update({ lastSync: meta().lastSync });
  return () => { stop(); clearTimeout(timer); window.removeEventListener('online', online); document.removeEventListener('visibilitychange', visible); };
}
