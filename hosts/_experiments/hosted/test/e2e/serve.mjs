/* Serves a built dist/ folder on localhost, for the walks. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.map': 'application/json', '.json': 'application/json' };

/* answers with { url, close } once it listens; port 0 takes a free one */
export function serve(root, port = 0) {
  const server = createServer(async (request, response) => {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = join(root, normalize(path));
    if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
    } catch { response.writeHead(404).end('Not found'); }
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({ url: `http://localhost:${server.address().port}/`, close: () => new Promise(done => server.close(done)) })));
}

/* run by itself it serves a folder until it is stopped: node test/e2e/serve.mjs dist 8080 */
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const { resolve } = await import('node:path');
  const site = await serve(resolve(process.argv[2] ?? 'dist'), Number(process.argv[3] ?? 8080));
  console.log('Serving at ' + site.url);
}
