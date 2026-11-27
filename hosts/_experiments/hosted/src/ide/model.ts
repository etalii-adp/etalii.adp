/* The hierarchy as the IDE reads it: ids, lookup, paths on disk, and the logical and file-system views of a level. */
import { ONTO } from './data/ontology';
import { solution } from './data/solution';
import { K } from './kinds';
import type { Draft, Item, ViewMode } from './types';

/* every item by its id; an item that is deleted stays in it, so Undo finds it again */
export const BY: Record<string, Item> = {};

/* An item's id is a ShortGuid, as in the other ADP hosts (ShortGuid in the standalone host; "encoding": "base36" in DISL 11.5.1): a UUID, written as its 128-bit value in lowercase base 36 and left-padded with 0 to 25 characters, the smallest width every UUID fits in. */
const SHORT_GUID_LENGTH = 25;
const shortGuid = (bytes: Uint8Array): string => bytes.reduce((n, b) => n << 8n | BigInt(b), 0n).toString(36).padStart(SHORT_GUID_LENGTH, '0');
/* a new item gets a random UUID (version 4) */
export const newShortGuid = (): string => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128;
  return shortGuid(b);
};
/* an example item gets a UUID made from its place in the hierarchy (version 8), so it has the same id on every load, as ShortGuid.FromName gives one name one id in the standalone host */
export const shortGuidOf = (name: string): string => {
  const b = new Uint8Array(16), v = new DataView(b.buffer);
  for (let i = 0; i < 4; i++) {
    let h = 2166136261 ^ Math.imul(i + 1, 0x9e3779b1);
    for (const ch of name) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    v.setUint32(i * 4, h >>> 0);
  }
  b[6] = b[6] & 15 | 128; b[8] = b[8] & 63 | 128;
  return shortGuid(b);
};

/* Takes a draft and everything under it into the hierarchy below parent. idOf gives each item its id from its place: example data gets the same ids on every load, and what is made while the page is open gets new ones. */
export function adopt(draft: Draft, parent: Item | null, place: string, idOf: (place: string) => string = shortGuidOf): Item {
  const { children, ...own } = draft;
  const x: Item = { ...own, id: idOf(place), parent };
  BY[x.id] = x;
  if (children) x.children = children.map(k => adopt(k, x, place + '/' + k.name, idOf));
  return x;
}

export const ROOT = adopt(solution, null, 'atlas');

/* Each ontology model carries its entity types as child items, so the hierarchy and the diagram show the same things. */
for (const x of Object.values(BY).filter(o => o.kind === 'ontology')) {
  const O = ONTO[x.name] ?? { e: [], r: [] };
  x.accepts = ['entity'];
  const entities = O.e.map(([name, ex, ey, attrs, ext]): Item => ({ name, kind: 'entity', parent: x, ex, ey, attrs: [...attrs], ext, id: shortGuidOf('entity/' + x.id + '/' + name), ...(ext ? { icon: 'link' } : {}) }));
  x.children = entities;
  entities.forEach(k => { BY[k.id] = k; });
  x.rels = O.r.map(([a, b, label]) => [entities[a], entities[b], label]);
}

export const find = (name: string): Item | undefined => Object.values(BY).find(x => x.name === name && !x.pseudo);
/* an item the example data counts on */
export const must = (name: string): Item => {
  const x = find(name);
  if (!x) throw new Error(`The example data has no item named ${name}`);
  return x;
};
/* the repositories linked into the project, at whatever level, in the order of the hierarchy */
export const linkedRepos = (): Item[] => {
  const found: Item[] = [];
  const look = (x: Item): void => { if (x.link) found.push(x); x.children?.forEach(look); };
  look(ROOT);
  return found;
};

export const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* the files of an item that is stored as a folder of files, and the suffix of one that is stored as a single file */
export const filesOf = (x: Item): string[] => { const s = K[x.kind].stored; return Array.isArray(s) ? s : []; };
export const suffixOf = (x: Item): string => { const s = K[x.kind].stored; return typeof s === 'string' ? s : ''; };
export const multi = (x: Item): boolean => Array.isArray(K[x.kind].stored);
/* stored inside its parent's file */
export const emb = (x: Item): boolean => K[x.kind].stored === '@';
/* a pure container, with no tool of its own */
export const isBox = (x: Item): boolean => !!x.children && !K[x.kind].tool;
/* the name an item has on disk: the one it was given, or one made from its name */
export const disk = (x: Item): string => x.file ?? (x.children || multi(x) ? slug(x.name) : slug(x.name) + suffixOf(x));
/* the linked repository an item is, or is in */
export const linkOf = (x: Item | null): Item | null => !x ? null : x.link ? x : linkOf(x.parent);
/* the linked repository that makes an item read-only: one it is in, not one it is itself */
export const ro = (x: Item): Item | null => linkOf(x.parent);
export const path = (x: Item): string =>
  !x.parent ? 'atlas-platform'
  : x.pseudo ? path(x.parent) + '/' + x.name
  : emb(x) ? path(x.parent) + '/' + filesOf(x.parent)[0] + '#' + x.name
  : x.link ? '../shared/' + x.link.repo.split('/').pop()!.replace('.git', '')
  : path(x.parent) + '/' + disk(x);
export const modeOf = (x: Item): ViewMode => x.mode || (x.parent ? modeOf(x.parent) : 'logical');
export const showAll = (x: Item): boolean => x.showAll ?? (x.parent ? showAll(x.parent) : false);
export const asFile = (x: Item): boolean => !!x.parent && modeOf(x.parent) === 'files';
export const crumbsOf = (x: Item): Item[] => { const a: Item[] = []; for (let p: Item | null = x; p; p = p.parent) a.unshift(p); return a; };
export const inside = (x: Item, a: Item): boolean => { for (let p: Item | null = x; p; p = p.parent) if (p === a) return true; return false; };

/* a file of the File System view that is no item of its own; made once per owner and name */
const pfCache: Record<string, Item> = {};
const pf = (owner: Item, name: string, ignored = false): Item => {
  const key = owner.id + name;
  if (!pfCache[key]) { const id = shortGuidOf('file/' + owner.id + '/' + name); pfCache[key] = BY[id] = { pseudo: true, name, kind: 'file', parent: owner, id, ignored }; }
  return pfCache[key];
};
/* the files of an owner by their paths; a path with folders in it, such as bin/Debug/app.dll, gives a folder that holds the rest */
const pfs = (owner: Item, paths: string[], ignored: boolean): Item[] => {
  const top: Item[] = [];
  for (const p of paths) {
    const cut = p.indexOf('/'), f = pf(owner, cut < 0 ? p : p.slice(0, cut), ignored);
    if (!top.includes(f)) top.push(f);
    if (cut >= 0) { const inner = pfs(f, [p.slice(cut + 1)], ignored)[0], entries = f.entries ?? (f.entries = []); if (!entries.includes(inner)) entries.push(inner); }
  }
  return top;
};
/* a file of the File System view that holds no text */
export const binary = (x: Item): boolean => !!x.pseudo && /\.(dll|pdb|exe|pyc)$/.test(x.name);
/* the item a file of the File System view belongs to */
export const ownerOf = (x: Item): Item => x.pseudo ? ownerOf(x.parent!) : x;

/* what the Explorer shows under an item, in the view its level has */
export function kids(x: Item): Item[] {
  if (x.pseudo) return x.entries ?? [];
  const fm = x.children ? modeOf(x) === 'files' : asFile(x);
  if (!fm) return x.children ? [...x.children] : [];
  const r = (x.children || []).filter(k => !emb(k));
  if (multi(x)) r.push(...filesOf(x).map(f => pf(x, f)));
  if (x.files) r.push(...pfs(x, x.files, false));
  if (x.children || multi(x)) {
    r.push(pf(x, '.adp'));
    if (showAll(x)) { if (x.ignoredFiles) r.push(...pfs(x, x.ignoredFiles, true)); r.push(pf(x, '.user.adp', true)); if (multi(x)) r.push(pf(x, 'preview.cache', true)); }
  }
  return r;
}
