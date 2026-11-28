/* What the build refuses before it builds: a page that reaches past the storage boundary, a name of the example data anywhere but in its YAML files, a script that draws without a template, and a template that holds state. */
import { readdir, readFile } from 'node:fs/promises';
import { exampleData } from './example.mjs';

const src = 'src', storage = 'src/storage/', example = 'src/storage/backends/_example/';
/* what the build writes: the code of the contract, and the example data as its YAML files have it */
const written = [storage + 'gen/', example + 'gen/'];

async function files(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = dir + '/' + entry.name;
    if (entry.isDirectory()) found.push(...await files(path));
    else if (/\.(tsx?|html|css)$/.test(entry.name)) found.push(path);
  }
  return found;
}
/* a source without its comments, with every line still on its own line number */
const bare = text => text.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')).replace(/<!--[\s\S]*?-->/g, c => c.replace(/[^\n]/g, ' '));
const lineOf = (text, at) => text.slice(0, at).split('\n').length;

/* What only the storage may use: what a browser keeps, and every way of reaching a network or another tab. */
const KEPT = /\b(localStorage|sessionStorage|indexedDB|WebSocket|BroadcastChannel|EventSource|XMLHttpRequest)\b|(?<![.\w])fetch\(|navigator\.(locks|storage|sendBeacon)/g;
/* The modules of the storage a page may import: the stores, what is kept in this browser, and the making of ids. */
const OPEN = new Set(['storage', 'storage/index', 'storage/local', 'storage/ids']);

/* the names the example data gives its projects, its people and its items, read from its YAML files */
async function exampleNames() {
  const { workspace, git, solution } = await exampleData();
  const names = new Set([...workspace.projects.map(p => p.name), ...git.people]);
  const walk = x => { names.add(x.name); x.children?.forEach(walk); };
  walk(solution.root);
  /* a name of one common word says nothing about where it came from */
  return [...names].filter(n => /\s/.test(n));
}

const pattern = names => new RegExp('(?<![\\w-])(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|') + ')(?![\\w-])', 'g');

/* What a script draws is in the template file beside it. A script that sets the HTML of an element itself draws without one. */
const DRAWN = /\.(innerHTML|outerHTML|insertAdjacentHTML)\b/g;
/* A template says what something looks like, and asks for what a click does through what it is handed. It holds no state and changes none: not the state of the page, not the storage, not what is open or drawn. */
const HELD = /^import\s+(?!type\b)[^;]*?from\s+'(?:[^']*\/)?(state|storage|repaint|open)'/gm;

/* what is wrong with one file, by its path from here and its text; names are the names of the example data */
export function findingsIn(file, source, names) {
  const found = [], text = bare(source);
  if (!file.startsWith(storage)) {
    for (const m of text.matchAll(KEPT)) found.push(`${file}:${lineOf(text, m.index)}: ${m[0].replace('(', '')} is used outside ${storage}`);
    for (const m of text.matchAll(/from\s+'([^']*\/)?(storage(?:\/[\w./-]+)?)'/g)) if (!OPEN.has(m[2])) found.push(`${file}:${lineOf(text, m.index)}: a page imports ${m[2]}; pages read through storage/index`);
  }
  if (file.endsWith('.ts') && !file.startsWith(storage)) for (const m of text.matchAll(DRAWN)) found.push(`${file}:${lineOf(text, m.index)}: a script sets ${m[1]}; what it draws belongs in its template file`);
  if (file.endsWith('.template.tsx')) for (const m of text.matchAll(HELD)) found.push(`${file}:${lineOf(text, m.index)}: a template imports ${m[1]}; it is handed what it shows and what it can ask for`);
  if (names.length && !written.some(dir => file.startsWith(dir))) for (const m of text.matchAll(pattern(names))) found.push(`${file}:${lineOf(text, m.index)}: "${m[0]}" is a name of the example data, outside the YAML files of ${example}`);
  return found;
}

export async function checkBoundary() {
  const found = [], names = await exampleNames();
  for (const file of await files(src)) found.push(...findingsIn(file, await readFile(file, 'utf8'), names));
  return found;
}
