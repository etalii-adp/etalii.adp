/* Bundles the unit tests and runs them with Node's own test runner: node test/unit/run.mjs [name]. */
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';

const only = process.argv[2], out = 'test/out/unit';
const tests = readdirSync('test/unit').filter(f => f.endsWith('.test.ts') && (!only || f.includes(only)));
rmSync(out, { recursive: true, force: true });
await build({ entryPoints: tests.map(f => `test/unit/${f}`), outdir: out, bundle: true, platform: 'node', format: 'esm', target: 'node22', sourcemap: 'inline', logLevel: 'warning', outExtension: { '.js': '.mjs' } });
const run = spawnSync(process.execPath, ['--test', '--enable-source-maps', ...tests.map(f => `${out}/${f.replace(/\.ts$/, '.mjs')}`)], { stdio: 'inherit' });
process.exit(run.status ?? 1);
