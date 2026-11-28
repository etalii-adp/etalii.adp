/* Compares two traces: node diff.mjs a.json b.json [how many to show] */
import { readFile } from 'node:fs/promises';
import { compare, normalise } from './walk.mjs';
const [a, b, show = '12'] = process.argv.slice(2);
const load = async f => normalise(JSON.parse(await readFile(f, 'utf8')));
const found = compare(await load(a), await load(b), 300);
console.log(found.length + ' differences');
console.log(found.slice(0, Number(show)).join('\n'));
process.exit(found.length ? 1 : 0);
