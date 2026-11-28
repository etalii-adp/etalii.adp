/* What the wire needs of a connection: bytes go out, bytes come in, and it opens and closes. A WebSocket is one; so is the pair of ends that stays inside the page. */
export interface Socket {
  send(data: Uint8Array): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((data: Uint8Array) => void) | null;
  onclose: (() => void) | null;
}
