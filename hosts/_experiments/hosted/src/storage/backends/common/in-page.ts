/* A backend that lives in this page: a world that answers every call from memory. The call still goes through the encoded form of its messages, as it would over a connection, so a page never holds an object the world holds. */
import { create, fromBinary, toBinary, type DescMessage, type DescMethodUnary, type MessageInitShape, type MessageShape } from '@bufbuild/protobuf';
import { methodName, StateSignal, type Backend, type BackendState, type CallOptions } from '../../backend';
import type { Event } from '../../gen/adp/storage/v1/envelope_pb';
import { newCallId } from '../../ids';
import type { World } from './server/core';

export class InPage implements Backend {
  protected readonly signal = new StateSignal();
  constructor(readonly name: string, protected readonly world: World) {}

  async call<I extends DescMessage, O extends DescMessage>(method: DescMethodUnary<I, O>, request: MessageInitShape<I>, options?: CallOptions): Promise<MessageShape<O>> {
    const answer = await this.world.server.handle(methodName(method), toBinary(method.input, create(method.input, request)), options?.id ?? newCallId());
    return fromBinary(method.output, answer);
  }
  watch(listener: (event: Event) => void): () => void { return this.world.server.watch(listener); }
  get state(): BackendState { return this.signal.state; }
  onState(listener: (state: BackendState) => void): () => void { return this.signal.on(listener); }
  close(): void { /* nothing is held open */ }
}
