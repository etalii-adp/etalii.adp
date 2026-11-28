/* Picks the backend a visit uses. Whatever is picked, the stores ask it the same calls; nothing else in the page knows which one it is. */
import type { Backend } from '../backend';
import { browserBackend } from './browser';
import { empty } from './empty';
import { example } from './example';
import { visit } from '../local';
import { InPage } from './in-page';
import { makeWorld } from './server';
import type { World } from './server/core';
import type { Seed } from './server/seed';
import { Slow } from './slow';
import { hosted, loopback } from './wire';

/* the backends by the name a visit asks for them with: ?backend=memory, browser, loopback, empty, slow or hosted. slow takes what it does after a colon: slow:1500 for the delay, slow:offline, slow:read-only. */
export const BACKENDS = ['memory', 'browser', 'loopback', 'empty', 'slow', 'hosted'] as const;
export type BackendName = typeof BACKENDS[number];
export const DEFAULT_BACKEND: BackendName = 'memory';

/* A world that keeps nothing starts from its seed on every page. A project that was made in this visit is the one thing it carries to the next page, as it was made: the visit holds it, and the world takes it from there when it starts. What is changed in it afterwards lasts as long as the page, like every other change here. */
const toText = (bytes: Uint8Array): string => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const toBytes = (text: string): Uint8Array => Uint8Array.from(atob(text), ch => ch.charCodeAt(0));
function carried(seed: Seed): World {
  let made: Record<string, string> = {};
  try { made = (JSON.parse(visit.get('made') || '{}') as Record<string, Record<string, string>>)[seed.version] ?? {}; } catch { /* unreadable: nothing was made */ }
  let kept: [string, Uint8Array][] = [];
  try { kept = Object.entries(made).map(([id, text]) => [id, toBytes(text)]); } catch { made = {}; }
  const world = makeWorld(seed, kept);
  world.made = (id, bytes) => { made[id] = toText(bytes); visit.set('made', JSON.stringify({ [seed.version]: made })); };
  return world;
}

export async function backendFor(choice: string, service: string): Promise<Backend> {
  const [name, how = ''] = choice.split(':');
  switch (name as BackendName) {
    case 'browser': return browserBackend(example);
    case 'loopback': return loopback(carried(example));
    case 'empty': return new InPage('empty', carried(empty));
    case 'slow': return new Slow(new InPage('memory', carried(example)), { delayMs: Number(how) || 700, offline: how === 'offline', refuseCommands: how === 'read-only' });
    case 'hosted': return hosted(service);
    default: return new InPage('memory', carried(example));
  }
}
