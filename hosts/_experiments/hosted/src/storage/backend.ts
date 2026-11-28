/* What a store asks of a backend. A backend answers calls and tells what changed; where it keeps things is its own business. The calls are the methods of the contract (contract/adp/storage/v1), so every backend speaks in the same messages, whether it is in this page or behind a WebSocket. */
import type { DescMessage, DescMethodUnary, MessageInitShape, MessageShape } from '@bufbuild/protobuf';
import type { Event } from './gen/adp/storage/v1/envelope_pb';

/* a command that was understood and not carried out; the message is for the user */
export class Refused extends Error {
  constructor(readonly code: string, message: string, readonly actionLabel = '', readonly actionMethod = '') { super(message); this.name = 'Refused'; }
}
/* the backend did not answer: it is not reachable, or took too long */
export class Unreachable extends Error {
  constructor(message = 'The storage does not answer.') { super(message); this.name = 'Unreachable'; }
}

/* ready: it answers. connecting: a call waits. offline: calls fail until it is back. */
export type BackendState = 'ready' | 'connecting' | 'offline';

export interface CallOptions {
  /* the id of the call; a command keeps it when it is sent again */
  id?: string;
}

export interface Backend {
  /* what it is, for a page that says where its data is kept */
  readonly name: string;
  call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, options?: CallOptions): Promise<MessageShape<O>>;
  /* every change of every store, in order; the changes a command caused arrive before its answer */
  watch(listener: (event: Event) => void): () => void;
  readonly state: BackendState;
  onState(listener: (state: BackendState) => void): () => void;
  close(): void;
}

/* the name a method travels by: "adp.storage.v1.Solution/Rename" */
export const methodName = (method: { parent: { typeName: string }; name: string }): string => `${method.parent.typeName}/${method.name}`;

/* what backends share for their state */
export class StateSignal {
  private current: BackendState;
  private readonly listeners = new Set<(state: BackendState) => void>();
  constructor(start: BackendState = 'ready') { this.current = start; }
  get state(): BackendState { return this.current; }
  set(state: BackendState): void { if (state === this.current) return; this.current = state; for (const l of [...this.listeners]) l(state); }
  on(listener: (state: BackendState) => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
}
