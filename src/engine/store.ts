import type { Settings, TrainerEvent } from '../types';
import { readEvents } from './events';

const EVENTS_KEY = 'trainer808.events.v1';
const SETTINGS_KEY = 'trainer808.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  examDate: '2026-12-20',
  newCardsPerDay: 20,
  newProblemsPerDay: 3,
  syncKey: '',
  aiEnabled: false,
};

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadEvents(): TrainerEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? mergeEvents([], readEvents(JSON.parse(raw))) : [];
  } catch {
    return [];
  }
}

/** 损坏的原始记录留在原位置，必须由用户导出后显式清空，不能被新记录覆盖。 */
export function eventStorageError(): string {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) readEvents(JSON.parse(raw));
    return '';
  } catch {
    return '本机记录暂时无法读取。请在设置中下载原始记录，再恢复备份；新记录暂停保存。';
  }
}

export function rawEventStorage(): string {
  return localStorage.getItem(EVENTS_KEY) ?? '[]';
}

export function saveEvents(events: TrainerEvent[], replace = false): TrainerEvent[] {
  if (!replace && eventStorageError()) throw new Error(eventStorageError());
  const merged = replace ? events : mergeEvents(loadEvents(), events);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(merged));
  return merged;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const value = raw ? JSON.parse(raw) as Partial<Settings> : {};
    return {
      ...DEFAULT_SETTINGS,
      examDate: typeof value.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.examDate) && Number.isFinite(new Date(value.examDate).getTime()) ? value.examDate : DEFAULT_SETTINGS.examDate,
      newCardsPerDay: Number.isInteger(value.newCardsPerDay) && value.newCardsPerDay! >= 0 && value.newCardsPerDay! <= 100 ? value.newCardsPerDay! : 20,
      newProblemsPerDay: Number.isInteger(value.newProblemsPerDay) && value.newProblemsPerDay! >= 0 && value.newProblemsPerDay! <= 30 ? value.newProblemsPerDay! : 3,
      syncKey: typeof value.syncKey === 'string' ? value.syncKey : '',
      aiEnabled: value.aiEnabled === true,
      ...(typeof value.lastExport === 'number' ? { lastExport: value.lastExport } : {}),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/** 按 id 去重合并，结果按时间排序 */
export function mergeEvents(a: TrainerEvent[], b: TrainerEvent[]): TrainerEvent[] {
  const map = new Map<string, TrainerEvent>();
  for (const e of [...a, ...b]) if (e && typeof e.id === 'string' && !map.has(e.id)) map.set(e.id, e);
  return [...map.values()].sort((x, y) => x.t - y.t || (x.id < y.id ? -1 : 1));
}

export interface ExportFile {
  app: '808-trainer';
  version: 1;
  exportedAt: number;
  events: TrainerEvent[];
}

export function exportJson(events: TrainerEvent[]): string {
  const file: ExportFile = { app: '808-trainer', version: 1, exportedAt: Date.now(), events };
  return JSON.stringify(file);
}

export function parseImport(text: string): TrainerEvent[] {
  const data = JSON.parse(text) as Partial<ExportFile>;
  if (data.app !== '808-trainer' || data.version !== 1 || !Array.isArray(data.events)) throw new Error('不是本程序支持的进度文件');
  return mergeEvents([], readEvents(data.events));
}
