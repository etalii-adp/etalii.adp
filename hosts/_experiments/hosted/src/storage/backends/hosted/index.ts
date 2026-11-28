/* The hosted backend: every call goes as an encoded envelope over one WebSocket to a service that is hosted somewhere, and comes back as one. */
import { Wire, type WireOptions } from '../common/wire/client';
import { webSocket } from './web-socket';

/* by the address of the service's WebSocket */
export const hosted = (url: string, options: Partial<WireOptions> = {}): Wire => new Wire('hosted', () => webSocket(url), options);
