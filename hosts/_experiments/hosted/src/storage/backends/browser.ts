/* A backend in this page that keeps what changes in the browser's IndexedDB, so a project is as it was left after a reload, and that tells the other tabs of this browser. One write of a whole project per command keeps a command all or nothing; a lock over the tabs lets one of them write at a time, and a tab first takes in what another one wrote. */
import type { DescMessage, DescMethodUnary, MessageInitShape, MessageShape } from '@bufbuild/protobuf';
import type { CallOptions } from '../backend';
import { InPage } from './in-page';
import { adoptAgent } from './server/agent';
import type { World } from './server/core';
import { tellProjects } from './server/create';
import { putBack } from './server/history';
import { makeWorld } from './server';
import { sealHistory } from './server/project';
import type { Seed } from './server/seed';

const DATABASE = 'adp-hosted', TABLE = 'projects', LOCK = 'adp-hosted-write', CHANNEL = 'adp-hosted';

/* a project as it is kept: its encoded state, and a stamp that changes with every write */
interface Kept { bytes: Uint8Array; stamp: string }

const asked = <T>(request: IDBRequest<T>): Promise<T> => new Promise((done, fail) => { request.onsuccess = () => done(request.result); request.onerror = () => fail(request.error); });
function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DATABASE, 1);
  request.onupgradeneeded = () => { request.result.createObjectStore(TABLE); };
  return asked(request);
}
const table = (db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore => db.transaction(TABLE, mode).objectStore(TABLE);
/* a call that only reads, by the name the contract gives its method */
const reads = (method: { name: string }): boolean => method.name.startsWith('Read');

class Browser extends InPage {
  private readonly stamps = new Map<string, string>();
  private readonly waiting: { id: string; tell: boolean }[] = [];
  private readonly channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  /* the writes of this tab, one after the other, where the browser has no lock over the tabs */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(world: World, private readonly db: IDBDatabase, private readonly prefix: string, stamps: Iterable<[string, string]>) {
    super('browser', world);
    for (const [id, stamp] of stamps) this.stamps.set(id, stamp);
    world.server.applied = (ids, quiet) => { this.waiting.push(...ids.map(id => ({ id, tell: true })), ...quiet.map(id => ({ id, tell: false }))); };
    /* what happens outside a call is kept as a call's changes are: alone, and after what another tab wrote was taken in */
    world.server.later = run => { void this.alone(async () => { await this.catchUp(); try { run(); } finally { world.server.settle(); await this.keep(); } }); };
    if (this.channel) this.channel.onmessage = () => { void this.catchUp(); };
  }

  override async call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, options?: CallOptions): Promise<MessageShape<O>> {
    if (reads(method)) return super.call(method, request, options);
    return this.alone(async () => {
      await this.catchUp();
      try { return await super.call(method, request, options); } finally { await this.keep(); }
    });
  }
  override close(): void { this.channel?.close(); this.db.close(); }

  private alone<T>(run: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(LOCK, run) as Promise<T>;
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  /* writes the projects the last call changed, and tells the other tabs of the changes they show */
  private async keep(): Promise<void> {
    const changed = this.waiting.splice(0);
    if (!changed.length) return;
    try {
      const store = table(this.db, 'readwrite');
      for (const id of new Set(changed.map(c => c.id))) {
        const stamp = `${Date.now()}-${Math.random()}`;
        this.stamps.set(id, stamp);
        store.put({ bytes: this.world.keep(id), stamp } satisfies Kept, this.prefix + id);
      }
      await new Promise<void>((done, fail) => { store.transaction.oncomplete = () => done(); store.transaction.onerror = () => fail(store.transaction.error); });
    } catch { /* the browser keeps nothing: the project lasts as long as the page */ }
    if (changed.some(c => c.tell)) this.channel?.postMessage('changed');
  }

  /* takes in what another tab wrote to a project that is open here, and the projects it made, and tells this tab's stores */
  private async catchUp(): Promise<void> {
    /* a project another tab made is taken in whole, and listed */
    let keys: string[];
    try { keys = await asked(table(this.db, 'readonly').getAllKeys()) as string[]; } catch { return; }
    const open = new Set(this.world.opened()), from = { id: '', user: '' };
    let listed = false;
    for (const key of keys) {
      const id = key.slice(this.prefix.length);
      if (!key.startsWith(this.prefix) || open.has(id)) continue;
      let made: Kept | undefined;
      try { made = await asked<Kept | undefined>(table(this.db, 'readonly').get(key)); } catch { return; }
      if (made && this.world.adopt(id, made.bytes)) { this.stamps.set(id, made.stamp); listed = true; }
    }
    if (listed) { tellProjects(this.world, from); this.world.server.changed.clear(); }
    for (const id of this.world.opened()) {
      let kept: Kept | undefined;
      try { kept = await asked<Kept | undefined>(table(this.db, 'readonly').get(this.prefix + id)); } catch { return; }
      if (!kept || kept.stamp === this.stamps.get(id)) continue;
      this.stamps.set(id, kept.stamp);
      /* nobody caused it here, and what could be taken back here no longer fits */
      const next = putBack(this.world, this.world.project(id), kept.bytes, from);
      sealHistory(this.world, next, from);
      adoptAgent(this.world, next, kept.bytes, from);
      this.world.server.changed.clear();
    }
  }
}

/* the backend, with what was kept of this seed; where the browser has no IndexedDB it keeps nothing and still works */
export async function browserBackend(seed: Seed): Promise<InPage> {
  const prefix = seed.version + '/';
  try {
    const db = await openDatabase(), store = table(db, 'readwrite'), keys = await asked(store.getAllKeys()) as string[];
    const kept: [string, Uint8Array][] = [], stamps: [string, string][] = [];
    for (const key of keys) {
      /* what an older seed left behind is cleared away */
      if (!key.startsWith(prefix)) { store.delete(key); continue; }
      const found = await asked<Kept | undefined>(table(db, 'readonly').get(key));
      if (found) { kept.push([key.slice(prefix.length), found.bytes]); stamps.push([key.slice(prefix.length), found.stamp]); }
    }
    return new Browser(makeWorld(seed, kept), db, prefix, stamps);
  } catch {
    return new InPage('browser', makeWorld(seed));
  }
}
