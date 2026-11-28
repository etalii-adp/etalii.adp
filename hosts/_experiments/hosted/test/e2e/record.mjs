/* Walks a built dist/ folder and writes the trace: node record.mjs <dist> <out.json> [backend] */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { normalise, walk } from './walk.mjs';

const [dist, out, backend] = process.argv.slice(2);
const site = await serve(resolve(dist));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const { trace, problems } = await walk(await context.newPage(), site.url, { backend });
await browser.close();
await site.close();
await writeFile(out, JSON.stringify(normalise(trace), null, 1));
console.log(`${trace.length} steps, ${problems.length} problems`);
for (const p of problems) console.log('  ' + p);
process.exit(problems.length ? 1 : 0);
