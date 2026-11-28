/* The far end of the wire: serves a world over a connection, one envelope in and one out. A hosted service does the same behind a WebSocket; here it runs in the page, so the wire can be shown and tested without one. */
import { create, fromBinary, toBinary, type MessageInitShape } from '@bufbuild/protobuf';
import { Refused } from '../../backend';
import { EnvelopeSchema, type Envelope } from '../../gen/adp/storage/v1/envelope_pb';
import type { World } from '../server/core';
import { PROTOCOL } from './client';
import type { Socket } from './socket';

export function serve(world: World, socket: Socket): void {
  const send = (kind: MessageInitShape<typeof EnvelopeSchema>['kind']): void => socket.send(toBinary(EnvelopeSchema, create(EnvelopeSchema, { kind })));
  /* what changes is told to every connection, in the order it happened; a command's own changes leave before its answer does */
  const stop = world.server.watch(event => send({ case: 'event', value: event }));
  socket.onclose = stop;
  socket.onmessage = data => {
    let envelope: Envelope;
    try { envelope = fromBinary(EnvelopeSchema, data); } catch { socket.close(); return; }
    const { kind } = envelope;
    if (kind.case === 'hello') send({ case: 'hello', value: { protocol: PROTOCOL, peer: 'in-page service' } });
    else if (kind.case === 'ping') send({ case: 'pong', value: { nonce: kind.value.nonce } });
    else if (kind.case === 'request') {
      const { id, method, message } = kind.value;
      world.server.handle(method, message, id).then(
        result => send({ case: 'response', value: { id, outcome: { case: 'result', value: result } } }),
        (e: unknown) => send({
          case: 'response', value: {
            id, outcome: e instanceof Refused
              ? { case: 'refusal', value: { code: e.code, message: e.message, actionLabel: e.actionLabel, actionMethod: e.actionMethod } }
              : { case: 'fault', value: { message: e instanceof Error ? e.message : String(e) } },
          },
        }));
    }
    /* a cancel has nothing to stop: every call is answered at once */
  };
}
