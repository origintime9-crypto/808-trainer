import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { computeMastery } from './engine/mastery';
import { replay } from './engine/scheduler';
import { loadEvents, loadSettings, mergeEvents, newId, saveEvents, saveSettings } from './engine/store';
import type { Settings, TrainerEvent } from './types';

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewEvent = DistOmit<TrainerEvent, 'id' | 't'>;

let events = loadEvents();
let settings = loadSettings();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const app = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  events: () => events,
  settings: () => settings,
  record(e: NewEvent): TrainerEvent {
    const full = { ...e, id: newId(), t: Date.now() } as TrainerEvent;
    events = saveEvents([...events, full]);
    emit();
    return full;
  },
  importEvents(list: TrainerEvent[]): number {
    const before = events.length;
    const merged = mergeEvents(events, list);
    if (merged.length === before) return 0;
    events = saveEvents(merged);
    emit();
    return events.length - before;
  },
  clearEvents() {
    events = saveEvents([], true);
    localStorage.removeItem('trainer808.sync.v1');
    emit();
  },
  updateSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    if (next.syncKey !== settings.syncKey) localStorage.removeItem('trainer808.sync.v1');
    saveSettings(next);
    settings = next;
    emit();
  },
};

if (typeof window !== 'undefined') window.addEventListener('storage', e => {
  if (e.key && !['trainer808.events.v1', 'trainer808.settings.v1'].includes(e.key)) return;
  events = loadEvents();
  settings = loadSettings();
  emit();
});

export const useEvents = () => useSyncExternalStore(app.subscribe, app.events);
export const useSettings = () => useSyncExternalStore(app.subscribe, app.settings);

function useMinute(): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 60_000));
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 60_000));
    const id = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return now;
}

export function useDerived() {
  const ev = useEvents();
  const st = useSettings();
  const minute = useMinute();
  return useMemo(() => {
    const now = Date.now();
    const sched = replay(ev.filter(e => e.t <= now), st.examDate);
    return { now, sched, mi: computeMastery(ev, now, sched) };
    // minute 只用来让结果按分钟刷新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev, st.examDate, minute]);
}

// 当前题目列表（用于"上一题/下一题"）
const LIST_KEY = 'trainer808.list';
export function setProblemList(ids: string[]) {
  sessionStorage.setItem(LIST_KEY, JSON.stringify(ids));
}
export function getProblemList(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(LIST_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}
