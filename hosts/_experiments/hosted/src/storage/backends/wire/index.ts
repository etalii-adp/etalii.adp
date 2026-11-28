/* The two backends that speak over the wire: one to a service behind a WebSocket, and one to a service that runs in this page, which shows and tests the wire without anything hosted. */
import { fromBinary } from '@bufbuild/protobuf';
import { EnvelopeSchema } from '../../gen/adp/storage/v1/envelope_pb';
import type { World } from '../server/core';
import { Wire, type WireOptions } from './client';
import { serve } from './service';
import { noFaults, pair, webSocket, type Faults } from './socket';

const isAnswer = (data: Uint8Array): boolean => { try { return fromBinary(EnvelopeSchema, data).kind.case === 'response'; } catch { return false; } };

/* every call crosses a connection as an encoded envelope, and comes back as one */
export function loopback(world: World, options: Partial<WireOptions> = {}, faults: Faults = noFaults()): Wire {
  return new Wire('loopback', () => {
    const [near, far] = pair(faults, isAnswer);
    serve(world, far);
    return near;
  }, options);
}

/* a service that is hosted somewhere, by the address of its WebSocket */
export const hosted = (url: string, options: Partial<WireOptions> = {}): Wire => new Wire('hosted', () => webSocket(url), options);
