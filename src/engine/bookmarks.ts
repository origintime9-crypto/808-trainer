import type { TrainerEvent } from '../types';

export function bookmarkedProblems(events: TrainerEvent[], now = Infinity): Set<string> {
  const active = new Set<string>();
  for (const e of [...events].filter(e => e.t <= now).sort((a,b) => a.t-b.t || a.id.localeCompare(b.id)))
    if (e.kind === 'bookmark') { if (e.active) active.add(e.problemId); else active.delete(e.problemId); }
  return active;
}
