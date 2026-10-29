import { coreCards } from './cards/core';
import { extraCards } from './cards/extra';
import { patterns } from './patterns';
import type { Card } from '../types';
export const cards: Card[] = [...coreCards, ...extraCards, ...patterns.map(p => ({ id: `pattern-${p.id}`, kps: p.kps, front: `题型套路：**${p.name}**，解题步骤是什么？`, back: p.method }))];
export const cardById = new Map(cards.map(c => [c.id, c]));
