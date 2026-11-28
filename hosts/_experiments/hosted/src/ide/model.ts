/* The hierarchy as the IDE reads it: lookup, paths on disk, and the logical and file-system views of a level. The items come from the solution store; the files of the File System view that are no items are made here. */
import { shortGuidOf } from '../storage/ids';
import { K } from './kinds';
import { project } from './storage';
import type { Item, ViewMode } from './types';

/* the root of the project that is open */
export let ROOT: Item;
/* called once the project is open */
export function bindModel(): void { ROOT = project.solution.root; }

/* a file of the File System view that is no item of its own; made once per owner and name */
const files = new Map<string, Item>();
const filesById = new Map<string, Item>();

/* an item, or a file of the File System view, by its id */
export const byId = (id: string): Item | undefined => project.solution.byId(id) ?? filesById.get(id);
/* true while an item is part of the hierarchy; a file is as long as the item it belongs to is */
export const alive = (x: Item): boolean => x.pseudo ? alive(ownerOf(x)) : project.solution.has(x);
/* the nearest item that is still there: the item itself, or what it was in */
export const nearest = (x: Item): Item => { for (let p: Item | null = x; p; p = p.parent) if (alive(p)) return p; return ROOT; };
/* an ontology model by its name, as a reference to an entity type names it */
export const modelNamed = (name: string): Item | undefined => [...project.solution.all()].find(x => x.name === name && K[x.kind].tool === 'onto');
/* every item of a kind, in the order of the hierarchy */
export const ofKind = (kind: string): Item[] => {
  const found: Item[] = [];
  const look = (x: Item): void => { if (x.kind === kind) found.push(x); x.children?.forEach(look); };
  look(ROOT);
  return found;
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
export const filesOf = (x: Item): readonly string[] => { const s = K[x.kind].stored; return typeof s === 'object' ? s : []; };
export const suffixOf = (x: Item): string => { const s = K[x.kind].stored; return typeof s === 'string' ? s : ''; };
export const multi = (x: Item): boolean => typeof K[x.kind].stored === 'object';
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
  !x.parent ? project.solution.path
  : x.pseudo ? path(x.parent) + '/' + x.name
  : emb(x) ? path(x.parent) + '/' + filesOf(x.parent)[0] + '#' + x.name
  : x.link ? '../shared/' + x.link.repo.split('/').pop()!.replace('.git', '')
  : path(x.parent) + '/' + disk(x);
export const modeOf = (x: Item): ViewMode => x.mode || (x.parent ? modeOf(x.parent) : 'logical');
export const showAll = (x: Item): boolean => x.showAll ?? (x.parent ? showAll(x.parent) : false);
export const asFile = (x: Item): boolean => !!x.parent && modeOf(x.parent) === 'files';
export const crumbsOf = (x: Item): Item[] => { const a: Item[] = []; for (let p: Item | null = x; p; p = p.parent) a.unshift(p); return a; };
export const inside = (x: Item, a: Item): boolean => { for (let p: Item | null = x; p; p = p.parent) if (p === a) return true; return false; };

/* a file of the File System view that holds no text */
export const binary = (x: Item): boolean => !!x.pseudo && /\.(dll|pdb|exe|pyc)$/.test(x.name);
/* the item a file of the File System view belongs to, and the file's path from there */
export const ownerOf = (x: Item): Item => x.pseudo ? ownerOf(x.parent!) : x;
export const fileOf = (x: Item): string => x.parent?.pseudo ? fileOf(x.parent) + '/' + x.name : x.name;

/* a file under an item or under a folder of files; whether git ignores it is what a person said of it, or else what its place says */
const pf = (parent: Item, name: string, ignored = false): Item => {
  const key = parent.id + name;
  let f = files.get(key);
  if (!f) {
    const entries: Item[] = [];
    f = { pseudo: true, name, kind: 'file', parent, id: shortGuidOf('file/' + parent.id + '/' + name), get ignored(): boolean { return project.git.ignores(ownerOf(this), fileOf(this)) ?? ignored; }, get entries(): Item[] | undefined { return entries.length ? entries : undefined; } };
    files.set(key, f);
    filesById.set(f.id, f);
    folders.set(f, entries);
  }
  return f;
};
/* what each folder of files holds */
const folders = new WeakMap<Item, Item[]>();
/* the files of an owner by their paths; a path with folders in it, such as bin/Debug/app.dll, gives a folder that holds the rest */
const pfs = (owner: Item, paths: readonly string[], ignored: boolean): Item[] => {
  const top: Item[] = [];
  for (const p of paths) {
    const cut = p.indexOf('/'), f = pf(owner, cut < 0 ? p : p.slice(0, cut), ignored);
    if (!top.includes(f)) top.push(f);
    if (cut >= 0) { const inner = pfs(f, [p.slice(cut + 1)], ignored)[0], entries = folders.get(f)!; if (!entries.includes(inner)) entries.push(inner); }
  }
  return top;
};

/* what the Explorer shows under an item, in the view its level has */
export function kids(x: Item): Item[] {
  if (x.pseudo) return [...x.entries ?? []];
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
