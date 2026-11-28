/* A backend around another one that answers late, or not at all. It is there to show what the pages do while they wait, and when the storage cannot be reached. */
import type { DescMessage, DescMethodUnary, MessageInitShape, MessageShape } from '@bufbuild/protobuf';
import { StateSignal, Unreachable, type Backend, type BackendState, type CallOptions } from '../backend';
import type { Event } from '../gen/adp/storage/v1/envelope_pb';

export interface Slowness {
  /* how long every answer takes */
  delayMs: number;
  /* nothing is answered: the storage is not reachable */
  offline?: boolean;
  /* what is read is answered, and nothing that changes anything */
  refuseCommands?: boolean;
}

const wait = (ms: number): Promise<void> => new Promise(done => setTimeout(done, ms));
/* a call that changes nothing a person made, by the name the contract gives its method: one that reads, and opening a project */
const reads = (method: { name: string }): boolean => method.name.startsWith('Read') || method.name === 'Open';

export class Slow implements Backend {
  readonly name: string;
  private readonly signal: StateSignal;
  constructor(private readonly inner: Backend, private readonly how: Slowness) {
    this.name = `slow ${inner.name}`;
    this.signal = new StateSignal(how.offline ? 'offline' : 'ready');
  }
  async call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, options?: CallOptions): Promise<MessageShape<O>> {
    await wait(this.how.delayMs);
    if (this.how.offline || (this.how.refuseCommands && !reads(method))) throw new Unreachable();
    return this.inner.call(method, request, options);
  }
  watch(listener: (event: Event) => void): () => void { return this.inner.watch(listener); }
  get state(): BackendState { return this.signal.state; }
  onState(listener: (state: BackendState) => void): () => void { return this.signal.on(listener); }
  close(): void { this.inner.close(); }
}
