/* The loopback backend: every call crosses a connection as an encoded envelope and comes back as one, to a service that runs in this page. It shows and tests the wire without anything hosted. */
import { fromBinary } from '@bufbuild/protobuf';
import { EnvelopeSchema } from '../../gen/adp/storage/v1/envelope_pb';
import type { World } from '../common/server/core';
import { Wire, type WireOptions } from '../common/wire/client';
import { serve } from '../common/wire/service';
import { noFaults, pair, type Faults } from './pair';

const isAnswer = (data: Uint8Array): boolean => { try { return fromBinary(EnvelopeSchema, data).kind.case === 'response'; } catch { return false; } };

export function loopback(world: World, options: Partial<WireOptions> = {}, faults: Faults = noFaults()): Wire {
  return new Wire('loopback', () => {
    const [near, far] = pair(faults, isAnswer);
    serve(world, far);
    return near;
  }, options);
}
