/* The connection of the loopback backend: two ends that stay inside the page, with what can go wrong on the way for the tests of the wire. */
import type { Socket } from '../common/wire/socket';

/* what can go wrong on a pair of ends, for the tests of the wire */
export interface Faults {
  /* how many of the next messages from the page are lost on the way */
  loseRequests: number;
  /* how many of the next answers are lost on the way back; what is told of changes still arrives */
  loseAnswers: number;
  /* cuts the connection that is open now */
  cut: () => void;
}
export const noFaults = (): Faults => ({ loseRequests: 0, loseAnswers: 0, cut: () => { /* nothing is open */ } });

class End implements Socket {
  other!: End;
  open = true;
  onopen: (() => void) | null = null;
  onmessage: ((data: Uint8Array) => void) | null = null;
  onclose: (() => void) | null = null;
  constructor(private readonly lost: (data: Uint8Array) => boolean) {}
  send(data: Uint8Array): void {
    if (!this.open || this.lost(data)) return;
    /* a copy, and later: what arrives is never the object that was sent */
    const copy = data.slice();
    queueMicrotask(() => { if (this.other.open) this.other.onmessage?.(copy); });
  }
  close(): void {
    if (!this.open) return;
    this.open = false;
    queueMicrotask(() => { this.onclose?.(); this.other.close(); });
  }
}

/* two ends of one connection inside the page: what is sent on one arrives on the other. isAnswer says whether a message from the far end is an answer, so the faults can lose it. */
export function pair(faults: Faults, isAnswer: (data: Uint8Array) => boolean): [near: Socket, far: Socket] {
  const near = new End(() => faults.loseRequests > 0 && faults.loseRequests-- > 0);
  const far = new End(data => faults.loseAnswers > 0 && isAnswer(data) && faults.loseAnswers-- > 0);
  near.other = far; far.other = near;
  faults.cut = () => near.close();
  queueMicrotask(() => { near.onopen?.(); far.onopen?.(); });
  return [near, far];
}
