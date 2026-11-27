/* Builds the pages into dist/: one script per page from its TypeScript modules, and every other file under src/ as it is. */
import { build } from 'esbuild';
import { cp, rm } from 'node:fs/promises';

const src = 'src', out = 'dist';
/* the script each page loads; boot runs in the head of every page, before the first paint */
const entries = ['common/boot', 'splash/splash', 'login/login', 'projects/projects', 'ide/main'];

await rm(out, { recursive: true, force: true });
await cp(src, out, { recursive: true, filter: file => !file.endsWith('.ts') });

const result = await build({
  entryPoints: entries.map(e => `${src}/${e}.ts`),
  outbase: src,
  outdir: out,
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  metafile: true,
  logLevel: 'info',
});

/* Modules may not import each other in a circle: a module in a circle can run before a module it reads from, and then finds its names empty. */
const imports = Object.fromEntries(Object.entries(result.metafile.inputs).map(([file, input]) => [file, input.imports.map(i => i.path)]));
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
