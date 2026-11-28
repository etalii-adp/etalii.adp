/* The connection of the hosted backend: a WebSocket to the service. */
import type { Socket } from '../common/wire/socket';

export function webSocket(url: string): Socket {
  const ws = new WebSocket(url), socket: Socket = {
    send: data => { if (ws.readyState === WebSocket.OPEN) ws.send(data as Uint8Array<ArrayBuffer>); },
    close: () => ws.close(),
    onopen: null, onmessage: null, onclose: null,
  };
  ws.binaryType = 'arraybuffer';
  ws.onopen = () => socket.onopen?.();
  ws.onmessage = e => { if (e.data instanceof ArrayBuffer) socket.onmessage?.(new Uint8Array(e.data)); };
  ws.onclose = () => socket.onclose?.();
  return socket;
}
