/* Reads the YAML files of the example data and writes them as one module, which the seed beside them (index.ts) imports and the type check holds against the shapes in shape.ts: node example.mjs. */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

const dir = 'src/storage/backends/_example/';

/* every YAML file of the example data, by its name without the ending */
export async function exampleData() {
  const data = {};
  for (const file of (await readdir(dir)).filter(f => f.endsWith('.yaml')).sort()) {
    try { data[file.replace(/\.yaml$/, '')] = parse(await readFile(dir + file, 'utf8'), { prettyErrors: true, strict: true, uniqueKeys: true }); }
    catch (e) { throw new Error(`${dir}${file}: ${e.message}`); }
  }
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = await exampleData();
  await mkdir(dir + 'gen', { recursive: true });
  await writeFile(dir + 'gen/data.ts', `/* Written by example.mjs from the YAML files of this folder. Change those, not this. */\nimport type { Data } from '../shape';\n\nexport const data: Data = ${JSON.stringify(data, null, 1)};\n`);
}
