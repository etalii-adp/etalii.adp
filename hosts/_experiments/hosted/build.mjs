/* Builds the pages into dist/: the script of each page from its TypeScript modules, and every other file under src/ as it is. It builds nothing when a page reaches past the storage boundary (checks.mjs). */
import { build } from 'esbuild';
import { cp, rm } from 'node:fs/promises';
import { checkBoundary } from './checks.mjs';

const src = 'src', out = 'dist';
/* the script each page loads */
const pages = ['splash/splash', 'login/login', 'projects/projects', 'ide/main'];

const refused = await checkBoundary();
if (refused.length) { console.error(refused.join('\n')); process.exit(1); }

await rm(out, { recursive: true, force: true });
/* the storage has nothing a page loads as a file: its contract and its modules are built into the scripts */
await cp(src, out, { recursive: true, filter: file => !/\.tsx?$/.test(file) &&!file.replaceAll('\\', '/').startsWith(src + '/storage') });

/* A template file (.tsx) is written in JSX, which becomes calls of Preact. It has the name of its module, so a module is imported by its name alone and is looked for as a .ts file first, as TypeScript does; a template is imported with its extension. */
const shared = { outbase: src, outdir: out, bundle: true, resolveExtensions: ['.ts', '.tsx', '.mjs', '.js', '.json'], target: 'es2022', jsx: 'automatic', jsxImportSource: 'preact', minify: true, sourcemap: true, metafile: true, logLevel: 'info' };
/* boot runs in the head of every page, before the first paint, so it is a script of its own that waits for nothing */
const boot = await build({ ...shared, entryPoints: [`${src}/common/boot.ts`], format: 'iife' });
/* The pages are modules that share what they have in common as chunks, so a browser loads the storage once for all of them and the start page, which needs none of it, loads none of it. */
const result = await build({ ...shared, entryPoints: pages.map(e => `${src}/${e}.ts`), format: 'esm', splitting: true, chunkNames: 'common/chunks/[hash]' });

/* Modules may not import each other in a circle: a module in a circle can run before a module it reads from, and then finds its names empty. */
const imports = Object.fromEntries([boot, result].flatMap(r => Object.entries(r.metafile.inputs)).map(([file, input]) => [file, input.imports.map(i => i.path)]));
const state = {};
const circle = (file, trail) => {
  if (state[file] === 'done') return null;
  if (state[file] === 'open') return [...trail.slice(trail.indexOf(file)), file];
  state[file] = 'open';
  for (const next of imports[file] ?? []) { const found = circle(next, [...trail, file]); if (found) return found; }
  state[file] = 'done';
  return null;
};
for (const file of Object.keys(imports)) {
  const found = circle(file, []);
  if (found) { console.error('Modules import each other in a circle:\n  ' + found.join('\n  -> ')); process.exit(1); }
}

/* the start page stays light: nothing of the storage but what is kept in this browser */
const heavy = Object.keys(result.metafile.outputs[`${out}/splash/splash.js`].inputs).concat(result.metafile.outputs[`${out}/splash/splash.js`].imports.flatMap(i => Object.keys(result.metafile.outputs[i.path]?.inputs ?? {}))).filter(f => f.startsWith(`${src}/storage/`) && f !== `${src}/storage/local.ts`);
if (heavy.length) { console.error('The start page loads the storage:\n  ' + heavy.join('\n  ')); process.exit(1); }
