import { useSyncExternalStore } from 'react';
import { app } from '../state';
import { readEvents } from './events';
import type { TrainerEvent } from '../types';
import { apiUrl } from '../api';

export interface Health { ok: boolean; ai: boolean; model: string; sync: boolean }
interface SyncMeta { since: number; uploaded: string[]; lastSync?: number }
export interface SyncStatus {
  phase: 'local' | 'idle' | 'pending' | 'syncing' | 'offline' | 'error' | 'done';
  message: string;
  health: Health | null;
  pending: number;
  lastSync?: number;
  retryAt?: number;
}
const META = 'trainer808.sync.v1';
const POLL_MS = 5000;
let status: SyncStatus = { phase: 'local', message: '本机进度已保存', health: null, pending: 0 };
const listeners = new Set<() => void>();
const update = (patch: Partial<SyncStatus>) => { status = { ...status, ...patch }; listeners.forEach(l => l()); };
export const getSyncStatus = () => status;
export const useSyncStatus = () => useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, getSyncStatus);

export function syncStatusLabel(s: SyncStatus): string {
  if (s.phase === 'done') return '✓ 云端已保存';
  if (s.phase === 'syncing') return s.pending ? '正在上传' : '正在连接';
  if (s.phase === 'pending') return '待上传 ' + s.pending + ' 条';
  if (s.phase === 'offline') return s.pending ? '离线 · 待上传 ' + s.pending + ' 条' : '离线 · 本机保存';
  if (s.phase === 'error') return '同步待重试';
  return '本机已保存';
}

function meta(): SyncMeta {
  try {
    const m = JSON.parse(localStorage.getItem(META) ?? '{}');
    return {
      since: Number.isSafeInteger(m.since) && m.since >= 0 ? m.since : 0,
      uploaded: Array.isArray(m.uploaded) ? m.uploaded.filter((id: unknown) => typeof id === 'string') : [],
      lastSync: typeof m.lastSync === 'number' && Number.isFinite(m.lastSync) ? m.lastSync : undefined,
    };
  } catch { return { since: 0, uploaded: [] }; }
}
const pendingEvents = (m = meta()) => {
  const uploaded = new Set(m.uploaded);
  return app.events().filter(e => !uploaded.has(e.id));
};
const isOnline = () => navigator.onLine !== false;
let failures = 0;
let rejectedKey = '';
let mergingCloud = false;
let ongoing: Promise<void> | null = null;
let activeKey = '';
let controller: AbortController | null = null;

export async function refreshHealth(): Promise<Health | null> {
  try {
    const r = await fetch(apiUrl('health'), { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const h = await r.json();
    if (!r.ok || h.ok !== true || typeof h.ai !== 'boolean' || typeof h.model !== 'string') throw new Error();
    const health: Health = { ok: true, ai: h.ai, model: h.model, sync: h.sync === true };
    update({ health });
    if (!app.settings().syncKey || !health.sync) update({
      phase: 'local', message: health.sync ? '连接云同步后，进度会自动上传' : '本地模式，进度保存在此浏览器',
    });
    return health;
  } catch { update({ health: null }); return null; }
}

// 手动同步可立即重试；自动同步遵守退避，错误口令不反复请求服务器。
export function syncNow(force = true): Promise<void> {
  const key = app.settings().syncKey;
  if (ongoing) return key === activeKey ? ongoing : ongoing.then(() => syncNow(force));
  if (!force && key && (key === rejectedKey || (status.retryAt ?? 0) > Date.now())) return Promise.resolve();
  activeKey = key;
  ongoing = performSync(key).finally(() => { ongoing = null; activeKey = ''; controller = null; });
  return ongoing;
}

async function performSync(key: string): Promise<void> {
  if (!key) { update({ phase: 'local', pending: 0, retryAt: undefined, message: '本机进度已保存；连接云同步后会自动上传' }); return; }
  if (!isOnline()) {
    update({ phase: 'offline', pending: pendingEvents().length, message: '已离线，本机进度仍已保存；联网后自动上传' });
    return;
  }
  let m = meta(), resets = 0;
  try {
    const h = status.health ?? await refreshHealth();
    if (app.settings().syncKey !== key) return;
    if (!h) throw new Error('暂时无法连接云端');
    if (!h.sync) { update({ phase: 'local', message: '当前未连接云同步，本机进度已保留' }); return; }
    const pending = pendingEvents(m).length;
    // 定时获取没有新记录时保留已保存状态，避免每五秒闪烁。
    if (pending || status.phase !== 'done') update({ phase: 'syncing', pending, message: pending ? '正在上传 ' + pending + ' 条进度…' : '正在连接云进度…' });
    for (;;) {
      if (app.settings().syncKey !== key) return;
      const batch: TrainerEvent[] = [];
      let size = 0;
      for (const e of pendingEvents(m).slice(0, 200)) {
        const bytes = JSON.stringify(e).length;
        if (size + bytes > 1_800_000) break;
        batch.push(e); size += bytes;
      }
      controller = new AbortController();
      const body = JSON.stringify({ since: m.since, events: batch });
      const r = await fetch(apiUrl('sync'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
        // 小批次允许在页面关闭后完成上传；大批次不超过浏览器的 keepalive 限额。
        keepalive: new TextEncoder().encode(body).length <= 60_000,
      });
      const data = await r.json();
      if (app.settings().syncKey !== key) return;
      if (r.status === 409 && data.reset && resets++ === 0) { m = { since: 0, uploaded: [] }; continue; }
      if (r.status === 401) { rejectedKey = key; throw new Error('同步口令不正确，请在设置中重新填写'); }
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : '同步失败（' + r.status + '）');
      if (!Number.isSafeInteger(data.seq) || data.seq < m.since || typeof data.hasMore !== 'boolean'
        || (data.hasMore && data.seq <= m.since) || !Array.isArray(data.accepted)
        || !data.accepted.every((id: unknown) => batch.some(e => e.id === id))) throw new Error('服务器返回了无效的同步结果');
      const received = readEvents(data.events);
      // 先保存进度，再移动游标。中途中断最多导致重复请求，不会丢掉记录。
      mergingCloud = true;
      try { app.importEvents(received); } finally { mergingCloud = false; }
      m = { since: data.seq, uploaded: [...new Set([...m.uploaded, ...data.accepted, ...received.map(e => e.id)])], lastSync: Date.now() };
      localStorage.setItem(META, JSON.stringify(m));
      const remaining = pendingEvents(m);
      update({ pending: remaining.length });
      if (batch.some(e => remaining.some(p => p.id === e.id))) throw new Error('服务器尚未保存全部进度');
      // 请求途中也可能新增作答，必须重新计算，不能用请求前的数量判断已保存。
      if (!data.hasMore && !remaining.length) break;
    }
    failures = 0; rejectedKey = '';
    update({ phase: 'done', message: '两端进度已同步，云端已保存；新进度会自动上传', pending: 0, retryAt: undefined, lastSync: m.lastSync });
  } catch (e) {
    if (app.settings().syncKey !== key) return;
    const unauthorized = rejectedKey === key;
    const retryAt = unauthorized ? undefined : Date.now() + Math.min(POLL_MS * 2 ** Math.min(failures++, 4), 60_000);
    update({
      phase: isOnline() ? 'error' : 'offline', pending: pendingEvents().length, retryAt,
      message: (e instanceof Error ? e.message : '网络异常') + '；本机进度仍已保存' + (unauthorized ? '' : '，恢复连接后自动重试'),
    });
  }
}

export function connectSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let key = app.settings().syncKey;
  let count = app.events().length;
  const schedule = () => {
    clearTimeout(timer);
    if (stopped || !app.settings().syncKey || !isOnline() || document.visibilityState !== 'visible' || app.settings().syncKey === rejectedKey) return;
    const delay = status.retryAt ? Math.max(0, status.retryAt - Date.now()) : POLL_MS;
    timer = setTimeout(run, delay);
  };
  const run = () => { if (!stopped) void syncNow(false).finally(schedule); };
  const stop = app.subscribe(() => {
    const nextKey = app.settings().syncKey;
    const nextCount = app.events().length;
    if (key === nextKey && count === nextCount) return;
    const changedKey = key !== nextKey;
    key = nextKey; count = nextCount;
    if (mergingCloud) return;
    if (changedKey) {
      controller?.abort(); failures = 0; rejectedKey = '';
      update({ lastSync: meta().lastSync, retryAt: undefined });
    }
    const pending = key ? pendingEvents().length : 0;
    const waiting = key === rejectedKey || (status.retryAt ?? 0) > Date.now();
    update({ phase: !key ? 'local' : !isOnline() ? 'offline' : waiting ? 'error' : 'pending', pending,
      message: !key ? '本机进度已保存；连接云同步后会自动上传' : !isOnline() ? '已离线，本机进度仍已保存；联网后自动上传' : waiting ? status.message : '本机已保存，正在准备上传进度…',
    });
    clearTimeout(timer);
    // 固定短窗口合并同一操作的记录，持续作答不会无限延后上传。
    if (key && pushTimer === undefined) pushTimer = setTimeout(() => { pushTimer = undefined; run(); }, 150);
  });
  const online = () => {
    if (!isOnline()) return;
    failures = 0; update({ retryAt: undefined });
    void refreshHealth().then(() => { if (!stopped) run(); });
  };
  const offline = () => {
    clearTimeout(timer);
    if (app.settings().syncKey) update({ phase: 'offline', pending: pendingEvents().length, message: '已离线，本机进度仍已保存；联网后自动上传' });
  };
  const visible = () => {
    clearTimeout(timer);
    if (document.visibilityState === 'visible') run();
    else if (app.settings().syncKey && pendingEvents().length) run();
  };
  const pagehide = () => { if (app.settings().syncKey && pendingEvents().length) run(); };
  window.addEventListener('online', online);
  window.addEventListener('offline', offline);
  window.addEventListener('pagehide', pagehide);
  document.addEventListener('visibilitychange', visible);
  update({ lastSync: meta().lastSync, pending: key ? pendingEvents().length : 0 });
  if (isOnline()) online(); else offline();
  return () => {
    stopped = true; stop(); clearTimeout(timer); clearTimeout(pushTimer);
    window.removeEventListener('online', online);
    window.removeEventListener('offline', offline);
    window.removeEventListener('pagehide', pagehide);
    document.removeEventListener('visibilitychange', visible);
  };
}
