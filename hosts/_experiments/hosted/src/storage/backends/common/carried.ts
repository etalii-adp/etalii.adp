/* A world that keeps nothing starts from its seed on every page. A project that was made in this visit is the one thing it carries to the next page, as it was made: the visit holds it, and the world takes it from there when it starts. What is changed in it afterwards lasts as long as the page, like every other change here. */
import { visit } from '../../local';
import { makeWorld } from './server';
import type { World } from './server/core';
import type { Seed } from './server/seed';

const toText = (bytes: Uint8Array): string => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const toBytes = (text: string): Uint8Array => Uint8Array.from(atob(text), ch => ch.charCodeAt(0));

export function carried(seed: Seed): World {
  let made: Record<string, string> = {};
  try { made = (JSON.parse(visit.get('made') || '{}') as Record<string, Record<string, string>>)[seed.version] ?? {}; } catch { /* unreadable: nothing was made */ }
  let kept: [string, Uint8Array][] = [];
  try { kept = Object.entries(made).map(([id, text]) => [id, toBytes(text)]); } catch { made = {}; }
  const world = makeWorld(seed, kept);
  world.made = (id, bytes) => { made[id] = toText(bytes); visit.set('made', JSON.stringify({ [seed.version]: made })); };
  return world;
}
