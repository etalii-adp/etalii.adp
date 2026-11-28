/* A backend's inside, when the backend is in this page: one object that answers every call of the contract from state it holds in memory. It takes and gives encoded messages, as a service behind a connection would, so nothing a caller holds is shared with it. What it starts from is a seed; keeping its state, or not, is up to the backend around it. */
import { create, fromBinary, toBinary, type DescMessage, type DescMethodUnary, type MessageInitShape, type MessageShape } from '@bufbuild/protobuf';
import { methodName, Refused } from '../../backend';
import type { CatalogueSnapshot, IconsSnapshot, Kind } from '../../gen/adp/storage/v1/catalogue_pb';
import { EventSchema, type Event } from '../../gen/adp/storage/v1/envelope_pb';
import type { HistoryEntry } from '../../gen/adp/storage/v1/history_pb';
import { KeptProjectSchema, type KeptProject } from '../../gen/adp/storage/v1/kept_pb';
import { ProjectsSnapshotSchema, type ProjectsSnapshot } from '../../gen/adp/storage/v1/projects_pb';
import type { Document } from '../../gen/adp/storage/v1/content_pb';
import type { Item } from '../../gen/adp/storage/v1/solution_pb';
import type { Seed } from './seed';

/* one call: its id, and the user it is made for */
export interface Call { id: string; user: string }

interface Handler { input: DescMessage; output: DescMessage; run: (request: never, call: Call) => unknown }

/* how many answers are remembered, so a command that is sent again is not carried out twice */
const REMEMBERED = 400;

export class Server {
  private readonly handlers = new Map<string, Handler>();
  private readonly listeners = new Set<(event: Event) => void>();
  private readonly answered = new Map<string, Uint8Array | Refused>();
  /* told after a call changed something that is kept: the ids of the projects it changed, and of those where only a window's own state changed, which nobody else needs to hear of */
  applied: (projectIds: string[], quietIds: string[]) => void = () => { /* nothing keeps it */ };
  readonly changed = new Set<string>();
  readonly quiet = new Set<string>();
  user = '';

  on<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, run: (request: MessageShape<I>, call: Call) => MessageInitShape<O> | Promise<MessageInitShape<O>>): void {
    this.handlers.set(methodName(method), { input: method.input, output: method.output, run: run as Handler['run'] });
  }

  /* answers one call: the encoded response, or a Refused thrown */
  async handle(method: string, request: Uint8Array, id: string): Promise<Uint8Array> {
    const before = this.answered.get(id);
    if (before) { if (before instanceof Refused) throw before; return before; }
    const handler = this.handlers.get(method);
    if (!handler) throw new Error(`No such call: ${method}`);
    try {
      const result = await handler.run(fromBinary(handler.input, request) as never, { id, user: this.user });
      const bytes = toBinary(handler.output, create(handler.output, result as MessageInitShape<DescMessage>));
      this.remember(id, bytes);
      return bytes;
    } catch (e) {
      if (e instanceof Refused) this.remember(id, e);
      throw e;
    } finally { this.settle(); }
  }
  /* says which projects changed since it was last said */
  settle(): void {
    if (!this.changed.size && !this.quiet.size) return;
    const ids = [...this.changed], quiet = [...this.quiet].filter(q => !this.changed.has(q));
    this.changed.clear(); this.quiet.clear();
    this.applied(ids, quiet);
  }
  /* Carries out something nobody called for at that moment, such as an answer that is ready later. A backend that keeps its state puts its own way of doing that here, so the change is kept as a call's would be. */
  later: (run: () => void) => void = run => { run(); this.settle(); };
  private remember(id: string, answer: Uint8Array | Refused): void {
    this.answered.set(id, answer);
    if (this.answered.size > REMEMBERED) this.answered.delete(this.answered.keys().next().value!);
  }

  /* tells what changed in a store */
  emit<D extends DescMessage>(store: string, projectId: string, revision: number, call: Call, schema: D, changes: MessageInitShape<D> | MessageShape<D>): void {
    const event = create(EventSchema, { store, projectId, revision, cause: call.id, user: call.user, changes: toBinary(schema, create(schema, changes as MessageInitShape<D>)) });
    for (const listener of [...this.listeners]) listener(event);
  }
  watch(listener: (event: Event) => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
}

/* one step that can be taken back: the project as it was before it, and after once it was taken back */
export interface Step { entry: HistoryEntry; before: Uint8Array; after?: Uint8Array }

/* an open project: what is kept of it, and what is worked out from that */
export interface ProjectState {
  id: string;
  kept: KeptProject;
  items: Map<string, Item>;
  documents: Map<string, Document>;
  steps: Step[];
  undone: Step[];
  historyRevision: number;
}

export class World {
  readonly server = new Server();
  readonly kinds = new Map<string, Kind>();
  readonly projects: ProjectsSnapshot;
  private readonly open = new Map<string, ProjectState>();
  signedIn = false;

  constructor(readonly seed: Seed, readonly catalogue: CatalogueSnapshot, readonly icons: IconsSnapshot, kept: Iterable<[string, Uint8Array]> = []) {
    for (const k of catalogue.kinds) this.kinds.set(k.name, k);
    this.projects = create(ProjectsSnapshotSchema, { revision: 1, projects: seed.projects, lastOpenedId: seed.lastOpenedId });
    this.server.user = seed.user.name ?? '';
    for (const [id, bytes] of kept) this.adopt(id, bytes);
  }

  /* an open project, opened from the seed when it is asked for the first time */
  project(id: string): ProjectState {
    const known = this.open.get(id);
    if (known) return known;
    const about = this.projects.projects.find(p => p.id === id);
    if (!about) throw new Refused('unknown', 'That project is not here.');
    const start = this.seed.project(about, this);
    if (typeof start === 'string') throw new Refused('unavailable', start);
    return this.index(id, create(KeptProjectSchema, { ...start, seed: this.seed.version }));
  }
  /* takes kept state in place of what is open; kept state of another seed is left behind */
  adopt(id: string, bytes: Uint8Array): boolean {
    let kept: KeptProject;
    try { kept = fromBinary(KeptProjectSchema, bytes); } catch { return false; }
    if (kept.seed !== this.seed.version || !kept.solution) return false;
    this.index(id, kept);
    return true;
  }
  /* the projects that are open here */
  opened(): string[] { return [...this.open.keys()]; }
  /* what is kept of a project, encoded */
  keep(id: string): Uint8Array { return toBinary(KeptProjectSchema, this.project(id).kept); }

  private index(id: string, kept: KeptProject): ProjectState {
    const was = this.open.get(id);
    const state: ProjectState = { id, kept, items: new Map(kept.solution!.items.map(x => [x.id, x])), documents: new Map(kept.documents.map(d => [d.itemId, d])), steps: was?.steps ?? [], undone: was?.undone ?? [], historyRevision: was?.historyRevision ?? 1 };
    this.open.set(id, state);
    return state;
  }
  /* puts back what a step holds, keeping the window's own state, the conversations with the agent and the revisions of the stores */
  restore(state: ProjectState, bytes: Uint8Array): ProjectState {
    const kept = fromBinary(KeptProjectSchema, bytes);
    kept.workbench = state.kept.workbench;
    kept.agent = state.kept.agent;
    /* the revisions only ever go up: a store that already heard of a later one would take what is put back for old news */
    kept.solution!.revision = state.kept.solution!.revision;
    kept.levels!.revision = state.kept.levels!.revision;
    kept.git!.revision = state.kept.git!.revision;
    kept.status!.revision = state.kept.status!.revision;
    kept.contentRevision = state.kept.contentRevision;
    return this.index(state.id, kept);
  }
}
