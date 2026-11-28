/* Picks the backend a visit uses. Whatever is picked, the stores ask it the same calls; nothing else in the page knows which one it is. */
import type { Backend } from '../backend';
import { browserBackend } from './browser';
import { empty } from './empty';
import { example } from './example';
import { InPage } from './in-page';
import { makeWorld } from './server';
import { Slow } from './slow';
import { hosted, loopback } from './wire';

/* the backends by the name a visit asks for them with: ?backend=memory, browser, loopback, empty, slow or hosted. slow takes what it does after a colon: slow:1500 for the delay, slow:offline, slow:read-only. */
export const BACKENDS = ['memory', 'browser', 'loopback', 'empty', 'slow', 'hosted'] as const;
export type BackendName = typeof BACKENDS[number];
export const DEFAULT_BACKEND: BackendName = 'memory';

export async function backendFor(choice: string, service: string): Promise<Backend> {
  const [name, how = ''] = choice.split(':');
  switch (name as BackendName) {
    case 'browser': return browserBackend(example);
    case 'loopback': return loopback(makeWorld(example));
    case 'empty': return new InPage('empty', makeWorld(empty));
    case 'slow': return new Slow(new InPage('memory', makeWorld(example)), { delayMs: Number(how) || 700, offline: how === 'offline', refuseCommands: how === 'read-only' });
    case 'hosted': return hosted(service);
    default: return new InPage('memory', makeWorld(example));
  }
}
