/* A hosted service for the tests: the backend the pages carry, behind a real WebSocket on localhost. It serves one world to every connection, as a service would, and can be stopped and started again to show what a page does meanwhile. */
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';

export async function startService() {
  const out = 'test/out/e2e/service.mjs';
  await build({ stdin: { contents: `export { makeWorld } from './src/storage/backends/common/server'; export { example } from './src/storage/backends/_example'; export { serve } from './src/storage/backends/common/wire/service';`, resolveDir: '.', loader: 'ts' }, outfile: out, bundle: true, packages: 'external', platform: 'node', format: 'esm', target: 'node22', logLevel: 'warning' });
  const { makeWorld, example, serve } = await import(pathToFileURL(resolve(out)).href);
  const world = makeWorld(example), service = { world, connections: 0, url: '', port: 0, stop: async () => {}, start: async () => {} };
  let server = null;
  service.start = () => new Promise(done => {
    server = new WebSocketServer({ host: '127.0.0.1', port: service.port }, () => { service.port = server.address().port; service.url = `ws://127.0.0.1:${service.port}`; done(); });
    server.on('connection', ws => {
      service.connections++;
      ws.binaryType = 'nodebuffer';
      const socket = { send: data => { if (ws.readyState === WebSocket.OPEN) ws.send(data); }, close: () => ws.close(), onopen: null, onmessage: null, onclose: null };
      serve(world, socket);
      ws.on('message', data => socket.onmessage?.(new Uint8Array(data)));
      ws.on('close', () => socket.onclose?.());
    });
  });
  service.stop = () => new Promise(done => { for (const ws of server.clients) ws.terminate(); server.close(() => done()); });
  await service.start();
  return service;
}
