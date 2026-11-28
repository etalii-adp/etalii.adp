/* The checks of the build: they find a page that reaches past the storage, and they leave the storage itself alone. */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { test } from 'node:test';
// @ts-expect-error the checks are a script of the build, without types of their own
import { checkBoundary, findingsIn } from '../../checks.mjs';
import { BACKENDS } from '../../src/storage/backends';

const find = (file: string, text: string, names: string[] = []): string[] => findingsIn(file, text, names) as string[];

test('what a browser keeps and every way to a network belong to the storage', () => {
  for (const use of ['localStorage.getItem("a")', 'sessionStorage.x = 1', 'indexedDB.open("a")', 'new WebSocket(url)', 'new BroadcastChannel("a")', 'await fetch("/a")', 'navigator.locks.request("a", run)', 'new XMLHttpRequest()']) {
    assert.equal(find('src/ide/part.ts', `const a = 1;\n${use};`).length, 1, use);
    assert.match(find('src/ide/part.ts', `const a = 1;\n${use};`)[0], /^src\/ide\/part\.ts:2: /);
    assert.equal(find('src/storage/backends/browser/index.ts', use).length, 0, use + ' inside the storage');
  }
  assert.equal(find('src/ide/git.ts', 'void act(project.git.fetch());').length, 0, 'a command that happens to be called fetch is none of them');
  assert.equal(find('src/ide/part.ts', '/* nothing here uses localStorage */ const a = 1;').length, 0, 'a comment is not a use');
});

test('a page imports the stores, what is kept in this browser and the making of ids, and nothing behind them', () => {
  for (const open of ['../storage', '../storage/local', '../storage/ids', '../../storage/index']) assert.equal(find('src/ide/part.ts', `import { a } from '${open}';`).length, 0, open);
  for (const shut of ['../storage/backends', '../storage/backends/_example', '../storage/gen/adp/storage/v1/git_pb', '../storage/stores/git', '../storage/link', '../storage/backend']) assert.equal(find('src/ide/part.ts', `import { a } from '${shut}';`).length, 1, shut);
  assert.equal(find('src/storage/stores/git.ts', `import { a } from '../gen/adp/storage/v1/git_pb';`).length, 0);
});

test('a name of the example data is found outside its YAML files, as a whole name only', () => {
  const names = ['Atlas Platform', 'Card grid'];
  assert.equal(find('src/ide/part.ts', 'const a = "Atlas Platform";', names).length, 1);
  assert.equal(find('src/ide/index.html', '<title>Atlas Platform</title>', names).length, 1);
  assert.equal(find('src/ide/part.ts', 'const a = "Atlas Platforms"; const b = "Card grid-like";', names).length, 0);
  assert.equal(find('src/storage/backends/_example/index.ts', 'const a = "Atlas Platform";', names).length, 1, 'the code beside the YAML files names none of it either');
  assert.equal(find('src/storage/backends/_example/gen/data.ts', 'const a = "Atlas Platform";', names).length, 0, 'what the build writes from the YAML files');
});

test('the pages as they are pass', async () => {
  assert.deepEqual(await checkBoundary(), []);
});

test('every backend has a folder of its own, beside what they share and the example data', async () => {
  const dir = 'src/storage/backends/', entries = await readdir(dir, { withFileTypes: true });
  assert.deepEqual(entries.filter(e => e.isDirectory()).map(e => e.name).sort(), [...BACKENDS, '_example', 'common'].sort());
  assert.deepEqual(entries.filter(e => !e.isDirectory()).map(e => e.name), ['index.ts'], 'beside the folders there is only the module that picks a backend');
  for (const name of BACKENDS) assert.ok(existsSync(dir + name + '/index.ts'), name + ' has no index.ts');
});
