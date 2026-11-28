/* A backend in this page that keeps what changes in the browser's IndexedDB, so a project is as it was left after a reload, and that tells the other tabs of this browser. One write of a whole project per command keeps a command all or nothing; a lock over the tabs lets one of them write at a time, and a tab first takes in what another one wrote. */
import type { DescMessage, DescMethodUnary, MessageInitShape, MessageShape } from '@bufbuild/protobuf';
import type { CallOptions } from '../../backend';
import { InPage } from '../common/in-page';
import { adoptAgent } from '../common/server/agent';
import type { World } from '../common/server/core';
import { tellProjects } from '../common/server/create';
import { putBack } from '../common/server/history';
import { makeWorld } from '../common/server';
import { sealHistory } from '../common/server/project';
import type { Seed } from '../common/server/seed';

const DATABASE = 'adp-hosted', TABLE = 'projects', LOCK = 'adp-hosted-write', CHANNEL = 'adp-hosted';

/* A project as it is kept: its encoded state, a stamp that changes when the project changed, and one that changes when the conversations with the agent did. A window's own state is written under the stamps that are there, so no other tab takes it for a change. */
interface Kept { bytes: Uint8Array; stamp: string; talk?: string }
/* the stamps of a project as this tab last wrote or took it in */
interface Marks { stamp: string; talk: string }
/* what a call changed of a project */
interface Change { id: string; project: boolean; talk: boolean }
const fresh = (): string => `${Date.now()}-${Math.random()}`;
const marksOf = (kept: Kept): Marks => ({ stamp: kept.stamp, talk: kept.talk ?? '' });

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
  private readonly marks = new Map<string, Marks>();
  private readonly waiting: Change[] = [];
  private readonly channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  /* the writes of this tab, one after the other, where the browser has no lock over the tabs */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(world: World, private readonly db: IDBDatabase, private readonly prefix: string, marks: Iterable<[string, Marks]>) {
    super('browser', world);
    for (const [id, m] of marks) this.marks.set(id, m);
    world.server.applied = (ids, quiet, talked) => { this.waiting.push(...ids.map(id => ({ id, project: true, talk: false })), ...talked.map(id => ({ id, project: false, talk: true })), ...quiet.map(id => ({ id, project: false, talk: false }))); };
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
        const was = this.marks.get(id), mine = changed.filter(c => c.id === id);
        const m: Marks = { stamp: mine.some(c => c.project) ? fresh() : was?.stamp ?? '', talk: mine.some(c => c.talk) ? fresh() : was?.talk ?? '' };
        this.marks.set(id, m);
        store.put({ bytes: this.world.keep(id), ...m } satisfies Kept, this.prefix + id);
      }
      await new Promise<void>((done, fail) => { store.transaction.oncomplete = () => done(); store.transaction.onerror = () => fail(store.transaction.error); });
    } catch { /* the browser keeps nothing: the project lasts as long as the page */ }
    if (changed.some(c => c.project || c.talk)) this.channel?.postMessage('changed');
  }

  /* Takes in what another tab wrote to a project that is open here, and the projects it made, and tells this tab's stores. What another tab kept of its own window is no change here, and a conversation with the agent is taken in while the project, and what can be taken back in it, stay as they are. */
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
      if (made && this.world.adopt(id, made.bytes)) { this.marks.set(id, marksOf(made)); listed = true; }
    }
    if (listed) { tellProjects(this.world, from); this.world.server.changed.clear(); this.world.server.talked.clear(); }
    for (const id of this.world.opened()) {
      let kept: Kept | undefined;
      try { kept = await asked<Kept | undefined>(table(this.db, 'readonly').get(this.prefix + id)); } catch { return; }
      if (!kept) continue;
      const theirs = marksOf(kept), mine = this.marks.get(id), project = theirs.stamp !== (mine?.stamp ?? ''), talk = theirs.talk !== (mine?.talk ?? '');
      if (!project && !talk) continue;
      this.marks.set(id, theirs);
      let state = this.world.project(id);
      /* nobody caused it here, and what could be taken back here no longer fits */
      if (project) { state = putBack(this.world, state, kept.bytes, from); sealHistory(this.world, state, from); }
      if (talk) adoptAgent(this.world, state, kept.bytes, from);
      /* what was taken in is kept already */
      this.world.server.changed.clear(); this.world.server.talked.clear();
    }
  }
}

/* the backend, with what was kept of this seed; where the browser has no IndexedDB it keeps nothing and still works */
export async function browserBackend(seed: Seed): Promise<InPage> {
  const prefix = seed.version + '/';
  try {
    const db = await openDatabase(), store = table(db, 'readwrite'), keys = await asked(store.getAllKeys()) as string[];
    const kept: [string, Uint8Array][] = [], marks: [string, Marks][] = [];
    for (const key of keys) {
      /* what an older seed left behind is cleared away */
      if (!key.startsWith(prefix)) { store.delete(key); continue; }
      const found = await asked<Kept | undefined>(table(db, 'readonly').get(key));
      if (found) { kept.push([key.slice(prefix.length), found.bytes]); marks.push([key.slice(prefix.length), marksOf(found)]); }
    }
    return new Browser(makeWorld(seed, kept), db, prefix, marks);
  } catch {
    return new InPage('browser', makeWorld(seed));
  }
}
