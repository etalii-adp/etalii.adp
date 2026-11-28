/* What the stores share: one way to a backend. It gives every call an id, knows which changes this page caused itself, hands each change to the store it belongs to, and says when the page is waiting and when the storage cannot be reached. */
import type { DescMessage, DescMethodUnary, MessageInitShape, MessageShape } from '@bufbuild/protobuf';
import type { Backend, BackendState } from './backend';
import type { Event } from './gen/adp/storage/v1/envelope_pb';
import { newCallId } from './ids';

/* after this long without an answer the page says it is waiting */
const WAITING_MS = 350;

export class Link {
  private readonly own = new Set<string>();
  private readonly stores = new Map<string, (event: Event) => void>();
  private readonly foreign = new Set<() => void>();
  private readonly waits = new Set<(waiting: boolean) => void>();
  private readonly resyncs = new Set<() => Promise<void>>();
  private pending = 0;
  private waiting = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private told = false;
  private wasDown = false;

  constructor(readonly backend: Backend) {
    backend.watch(event => this.route(event));
    /* what was missed while the storage could not be reached is read again when it is back */
    backend.onState(state => {
      if (state !== 'ready') { this.wasDown = true; return; }
      if (!this.wasDown) return;
      this.wasDown = false;
      void Promise.all([...this.resyncs].map(read => read().catch(() => undefined))).then(() => this.tell());
    });
  }

  async call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, id = newCallId()): Promise<MessageShape<O>> {
    this.own.add(id);
    this.count(1);
    try { return await this.backend.call(method, request, { id }); } finally { this.own.delete(id); this.count(-1); }
  }

  /* a store takes the changes of one store of the contract, of one project or of none */
  listen(store: string, projectId: string, apply: (event: Event) => void, reread: () => Promise<void>): void {
    this.stores.set(store + '/' + projectId, apply);
    this.resyncs.add(reread);
  }
  /* told once after changes this page did not cause: another window, another user, or a connection that was away */
  onForeign(listener: () => void): () => void { this.foreign.add(listener); return () => { this.foreign.delete(listener); }; }
  /* tells the page of a change it did not ask for and has to draw */
  tell(): void {
    if (this.told) return;
    this.told = true;
    queueMicrotask(() => { this.told = false; for (const l of [...this.foreign]) l(); });
  }
  onWaiting(listener: (waiting: boolean) => void): () => void { this.waits.add(listener); return () => { this.waits.delete(listener); }; }
  get state(): BackendState { return this.backend.state; }
  onState(listener: (state: BackendState) => void): () => void { return this.backend.onState(listener); }

  private route(event: Event): void {
    const apply = this.stores.get(event.store + '/' + event.projectId);
    if (!apply) return;
    apply(event);
    if (!this.own.has(event.cause)) this.tell();
  }
  private count(by: number): void {
    this.pending += by;
    if (this.pending && !this.timer && !this.waiting) this.timer = setTimeout(() => { this.timer = undefined; if (this.pending) this.setWaiting(true); }, WAITING_MS);
    if (!this.pending) { clearTimeout(this.timer); this.timer = undefined; this.setWaiting(false); }
  }
  private setWaiting(on: boolean): void {
    if (on === this.waiting) return;
    this.waiting = on;
    for (const l of [...this.waits]) l(on);
  }
}
