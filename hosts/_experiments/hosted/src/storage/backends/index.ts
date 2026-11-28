/* Picks the backend a visit uses. Every backend has a folder of its own here; what more than one of them uses is in common/, and the example data most of them start from is in _example/. Whatever is picked, the stores ask it the same calls; nothing else in the page knows which one it is. */
import type { Backend } from '../backend';
import { example } from './_example';
import { browserBackend } from './browser';
import { carried } from './common/carried';
import { emptyBackend } from './empty';
import { hosted } from './hosted';
import { loopback } from './loopback';
import { memory } from './memory';
import { Slow } from './slow';

/* the backends by the name a visit asks for them with: ?backend=memory, browser, loopback, empty, slow or hosted. slow takes what it does after a colon: slow:1500 for the delay, slow:offline, slow:read-only. */
export const BACKENDS = ['memory', 'browser', 'loopback', 'empty', 'slow', 'hosted'] as const;
export type BackendName = typeof BACKENDS[number];
export const DEFAULT_BACKEND: BackendName = 'memory';

export async function backendFor(choice: string, service: string): Promise<Backend> {
  const [name, how = ''] = choice.split(':');
  switch (name as BackendName) {
    case 'browser': return browserBackend(example);
    case 'loopback': return loopback(carried(example));
    case 'empty': return emptyBackend();
    case 'slow': return new Slow(memory(example), { delayMs: Number(how) || 700, offline: how === 'offline', refuseCommands: how === 'read-only' });
    case 'hosted': return hosted(service);
    default: return memory(example);
  }
}
