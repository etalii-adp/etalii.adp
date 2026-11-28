/* The near end of the wire: a backend that reaches its service with protobuf messages over one connection. Every message is an envelope: a hello to open, a request and its response by one id, a cancel, an event for what changed, and a ping to see that the other side is there. A request that got no answer is sent again under the same id when the connection is back, so a command is carried out once. */
import { create, fromBinary, toBinary, type DescMessage, type DescMethodUnary, type MessageInitShape, type MessageShape } from '@bufbuild/protobuf';
import { methodName, Refused, StateSignal, Unreachable, type Backend, type BackendState, type CallOptions } from '../../backend';
import { EnvelopeSchema, type Event } from '../../gen/adp/storage/v1/envelope_pb';
import { newCallId } from '../../ids';
import type { Socket } from './socket';

/* the version of the envelope both sides speak */
export const PROTOCOL = 1;

export interface WireOptions {
  /* how long a call may take before it counts as not answered */
  limitMs: number;
  /* how long to wait before connecting again, longer each time; after the last one the storage counts as offline, and the last wait repeats */
  retryMs: number[];
  /* how often an idle connection is checked, and how long the answer may take; 0 leaves it out */
  pingMs: number;
  pongMs: number;
}
export const wireDefaults: WireOptions = { limitMs: 8000, retryMs: [150, 400, 1000, 2500], pingMs: 15000, pongMs: 5000 };

interface Waiting { bytes: Uint8Array; done: (answer: Uint8Array) => void; fail: (reason: Error) => void; timer: ReturnType<typeof setTimeout> }

export class Wire implements Backend {
  private readonly signal = new StateSignal('connecting');
  private readonly listeners = new Set<(event: Event) => void>();
  private readonly waiting = new Map<string, Waiting>();
  private readonly options: WireOptions;
  private socket: Socket | null = null;
  private greeted = false;
  private failures = 0;
  private closed = false;
  private retry: ReturnType<typeof setTimeout> | undefined;
  private ping: ReturnType<typeof setInterval> | undefined;
  private pong: ReturnType<typeof setTimeout> | undefined;

  constructor(readonly name: string, private readonly connect: () => Socket, options: Partial<WireOptions> = {}) {
    this.options = { ...wireDefaults, ...options };
    this.open();
  }

  call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, options?: CallOptions): Promise<MessageShape<O>> {
    const id = options?.id ?? newCallId();
    const bytes = this.envelope({ case: 'request', value: { id, method: methodName(method), message: toBinary(method.input, create(method.input, request)), limitMs: this.options.limitMs } });
    return new Promise<Uint8Array>((done, fail) => {
      const timer = setTimeout(() => {
        this.waiting.delete(id);
        if (this.greeted) this.socket?.send(this.envelope({ case: 'cancel', value: { id } }));
        fail(new Unreachable());
      }, this.options.limitMs);
      this.waiting.set(id, { bytes, done, fail, timer });
      if (this.greeted) this.socket?.send(bytes);
    }).then(answer => fromBinary(method.output, answer));
  }
  watch(listener: (event: Event) => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  get state(): BackendState { return this.signal.state; }
  onState(listener: (state: BackendState) => void): () => void { return this.signal.on(listener); }
  close(): void {
    this.closed = true;
    clearTimeout(this.retry); clearInterval(this.ping); clearTimeout(this.pong);
    this.socket?.close();
    for (const [, w] of this.waiting) { clearTimeout(w.timer); w.fail(new Unreachable()); }
    this.waiting.clear();
  }

  private envelope(kind: MessageInitShape<typeof EnvelopeSchema>['kind']): Uint8Array { return toBinary(EnvelopeSchema, create(EnvelopeSchema, { kind })); }

  private open(): void {
    if (this.closed) return;
    let socket: Socket;
    try { socket = this.connect(); } catch { this.lost(null); return; }
    this.socket = socket;
    this.greeted = false;
    socket.onopen = () => socket.send(this.envelope({ case: 'hello', value: { protocol: PROTOCOL, peer: 'page' } }));
    socket.onmessage = data => { if (socket === this.socket) this.receive(data); };
    socket.onclose = () => this.lost(socket);
  }

  private lost(socket: Socket | null): void {
    if (this.closed || socket !== this.socket) return;
    this.socket = null;
    this.greeted = false;
    clearInterval(this.ping); clearTimeout(this.pong);
    const waits = this.options.retryMs, wait = waits[Math.min(this.failures, waits.length - 1)] ?? 1000;
    this.failures++;
    const offline = this.failures >= waits.length;
    this.signal.set(offline ? 'offline' : 'connecting');
    /* once the storage counts as offline, what waits for an answer is told so at once; it is asked again by whoever still wants it when the storage is back */
    if (offline) { for (const [, w] of this.waiting) { clearTimeout(w.timer); w.fail(new Unreachable()); } this.waiting.clear(); }
    this.retry = setTimeout(() => this.open(), wait);
  }

  private receive(data: Uint8Array): void {
    let kind;
    try { kind = fromBinary(EnvelopeSchema, data).kind; } catch { this.socket?.close(); return; }
    if (kind.case === 'hello') {
      if (kind.value.protocol !== PROTOCOL) { this.closed = true; this.signal.set('offline'); this.socket?.close(); return; }
      this.greeted = true;
      this.failures = 0;
      /* what was asked and not answered goes out again, under the ids it had */
      for (const [, w] of this.waiting) this.socket?.send(w.bytes);
      this.signal.set('ready');
      this.watchOver();
    } else if (kind.case === 'response') {
      const w = this.waiting.get(kind.value.id), { outcome } = kind.value;
      if (!w) return;
      this.waiting.delete(kind.value.id);
      clearTimeout(w.timer);
      if (outcome.case === 'result') w.done(outcome.value);
      else if (outcome.case === 'refusal') w.fail(new Refused(outcome.value.code, outcome.value.message, outcome.value.actionLabel, outcome.value.actionMethod));
      else w.fail(new Error(outcome.case === 'fault' ? outcome.value.message : 'The storage gave no answer.'));
    } else if (kind.case === 'event') {
      for (const listener of [...this.listeners]) listener(kind.value);
    } else if (kind.case === 'ping') {
      this.socket?.send(this.envelope({ case: 'pong', value: { nonce: kind.value.nonce } }));
    } else if (kind.case === 'pong') {
      clearTimeout(this.pong);
    }
  }

  /* an idle connection is asked now and then whether the other side is still there */
  private watchOver(): void {
    clearInterval(this.ping);
    if (!this.options.pingMs) return;
    let nonce = 0;
    this.ping = setInterval(() => {
      const socket = this.socket;
      if (!socket) return;
      socket.send(this.envelope({ case: 'ping', value: { nonce: ++nonce } }));
      clearTimeout(this.pong);
      this.pong = setTimeout(() => socket.close(), this.options.pongMs);
    }, this.options.pingMs);
  }
}
