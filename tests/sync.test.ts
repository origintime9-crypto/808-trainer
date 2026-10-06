import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainerEvent } from '../src/types';

const state = vi.hoisted(() => ({
  events: [] as TrainerEvent[],
  key: 'test-sync-only',
  listeners: new Set<() => void>(),
}));
vi.mock('../src/state', () => ({
  app: {
    events: () => state.events,
    settings: () => ({ syncKey: state.key }),
    subscribe: (l: () => void) => { state.listeners.add(l); return () => state.listeners.delete(l); },
    importEvents: (incoming: TrainerEvent[]) => {
      const fresh = incoming.filter(e => !state.events.some(x => x.id === e.id));
      state.events = [...state.events, ...fresh];
      if (fresh.length) state.listeners.forEach(l => l());
      return fresh.length;
    },
  },
}));

const META = 'trainer808.sync.v1';
const event = (id: string): TrainerEvent => ({ id, t: 1000, kind: 'attempt', problemId: 'zt2026-10', grade: 1, tags: [], sec: 10 });
const add = (id: string) => { state.events.push(event(id)); state.listeners.forEach(l => l()); };
let client: typeof import('../src/engine/sync');
let stop: (() => void) | undefined;
let visible: EventTarget & { visibilityState: string };
let network: { onLine: boolean };
let cloud: TrainerEvent[];
let failing: number;
let posts: { since: number; events: TrainerEvent[] }[];
let afterPost: (() => Promise<void>) | undefined;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  state.events = []; state.key = 'test-sync-only'; state.listeners.clear();
  cloud = []; posts = []; failing = 0; afterPost = undefined;
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
  });
  vi.stubGlobal('window', new EventTarget());
  visible = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  network = { onLine: true };
  vi.stubGlobal('document', visible); vi.stubGlobal('navigator', network);
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/health')) return Response.json({ ok: true, ai: false, model: '', sync: true });
    const body = JSON.parse(init!.body as string);
    posts.push(body);
    if (afterPost) await afterPost();
    if (failing) return Response.json({ error: '测试连接中断' }, { status: failing });
    for (const e of body.events) if (!cloud.some(c => c.id === e.id)) cloud.push(e);
    return Response.json({ seq: cloud.length, events: cloud.slice(body.since), accepted: body.events.map((e: TrainerEvent) => e.id), hasMore: false });
  }));
  client = await import('../src/engine/sync');
});
afterEach(() => { stop?.(); stop = undefined; vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const connect = async () => { stop = client.connectSync(); await vi.advanceTimersByTimeAsync(0); };

describe('进度自动同步', () => {
  it('作答后短时间内上传，连续操作不会延后，接收云记录不重复上传', async () => {
    await connect();
    add('first');
    await vi.advanceTimersByTimeAsync(100);
    add('second');
    expect(client.getSyncStatus().pending).toBe(2);
    await vi.advanceTimersByTimeAsync(50);
    expect(cloud.map(e => e.id)).toEqual(['first', 'second']);
    expect(client.getSyncStatus().phase).toBe('done');
    const length = posts.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(posts.length).toBe(length + 1);
    expect(posts.at(-1)!.events).toEqual([]);
  });

  it('上传进行时的新作答也必须传完，才能显示云端已保存', async () => {
    add('first');
    let release!: () => void;
    const held = new Promise<void>(r => { release = r; });
    afterPost = async () => { afterPost = undefined; await held; };
    const syncing = client.syncNow();
    await vi.advanceTimersByTimeAsync(0);
    expect(posts).toHaveLength(1);
    add('during-request');
    release();
    await syncing;
    expect(posts).toHaveLength(2);
    expect(posts[1].events.map(e => e.id)).toEqual(['during-request']);
    expect(cloud).toHaveLength(2);
    expect(client.getSyncStatus()).toMatchObject({ phase: 'done', pending: 0 });
  });

  it('页面保持打开时每五秒获取远端进度，后台暂停，回到前台立即获取', async () => {
    await connect();
    cloud.push(event('remote-first'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(state.events.map(e => e.id)).toEqual(['remote-first']);
    visible.visibilityState = 'hidden';
    visible.dispatchEvent(new Event('visibilitychange'));
    const n = posts.length;
    cloud.push(event('remote-second'));
    await vi.advanceTimersByTimeAsync(15000);
    expect(posts).toHaveLength(n);
    visible.visibilityState = 'visible';
    visible.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(state.events.map(e => e.id)).toEqual(['remote-first', 'remote-second']);
  });

  it('断网作答先留在本机，联网事件触发补传并去重', async () => {
    network.onLine = false;
    await connect(); add('offline');
    await vi.advanceTimersByTimeAsync(10000);
    expect(cloud).toEqual([]);
    expect(client.getSyncStatus()).toMatchObject({ phase: 'offline', pending: 1 });
    network.onLine = true;
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(0);
    expect(cloud.map(e => e.id)).toEqual(['offline']);
    expect(client.getSyncStatus().phase).toBe('done');
    await vi.advanceTimersByTimeAsync(5000);
    expect(cloud).toHaveLength(1);
  });

  it('服务短暂失败会自动重试，不依赖点击或重新联网，并保留待上传状态', async () => {
    await connect(); failing = 503; add('retry');
    await vi.advanceTimersByTimeAsync(150);
    expect(client.getSyncStatus()).toMatchObject({ phase: 'error', pending: 1 });
    const n = posts.length;
    failing = 0;
    await vi.advanceTimersByTimeAsync(4999);
    expect(posts).toHaveLength(n);
    await vi.advanceTimersByTimeAsync(1);
    expect(cloud.map(e => e.id)).toEqual(['retry']);
    expect(client.getSyncStatus()).toMatchObject({ phase: 'done', pending: 0 });
  });

  it('错误口令停止自动请求，改正确口令后恢复且不丢本机记录', async () => {
    failing = 401; await connect(); add('keep');
    await vi.advanceTimersByTimeAsync(150);
    const n = posts.length;
    await vi.advanceTimersByTimeAsync(20000);
    expect(posts).toHaveLength(n);
    expect(state.events.map(e => e.id)).toEqual(['keep']);
    failing = 0; state.key = 'changed-test-key'; localStorage.removeItem(META);
    state.listeners.forEach(l => l());
    await vi.advanceTimersByTimeAsync(150);
    expect(cloud.map(e => e.id)).toEqual(['keep']);
    expect(client.getSyncStatus().phase).toBe('done');
  });

  it('未获服务端确认的记录不标为已保存，也不丢弃本机事件', async () => {
    add('unacknowledged');
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('/health')
      ? Response.json({ ok: true, ai: false, model: '', sync: true })
      : Response.json({ seq: 0, events: [], accepted: [], hasMore: false })));
    await client.syncNow();
    expect(client.getSyncStatus()).toMatchObject({ phase: 'error', pending: 1 });
    expect(state.events.map(e => e.id)).toEqual(['unacknowledged']);
    expect(JSON.parse(localStorage.getItem(META)!).uploaded).not.toContain('unacknowledged');
  });

  it('断开云同步或卸载页面后停止后台请求，仍保留本机进度', async () => {
    await connect(); add('kept'); await vi.advanceTimersByTimeAsync(150);
    state.key = ''; localStorage.removeItem(META); state.listeners.forEach(l => l());
    const n = posts.length;
    await vi.advanceTimersByTimeAsync(15000);
    expect(posts).toHaveLength(n);
    expect(client.getSyncStatus().phase).toBe('local');
    expect(state.events).toHaveLength(1);
    stop!(); stop = undefined;
    window.dispatchEvent(new Event('online'));
    visible.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(15000);
    expect(posts).toHaveLength(n);
  });
});
