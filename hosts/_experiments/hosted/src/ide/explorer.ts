/* The Explorer: the tree, its two views, rename, add, delete, the icon picker and the context menu. A level's view is set from its context menu (View As) or in the Properties. */
import { h } from 'preact';
import { $, $$, $maybe, clamp, draw, raise, redraw } from '../common/dom';
import { reason } from '../common/reason';
import { closePop, copy, dialog, menu, place, toast, type MenuEntry } from '../common/popups';
import { body, pel, show } from './docks';
import { Explorer, ExplorerButtons, IconPicker, LinkRepository, type ExplorerActions, type Naming, type TreeLine } from './explorer.template';
import { acceptsOf, inSentence, K } from './kinds';
import { byId, fileOf, inside, isBox, kids, modeOf, ownerOf, path, ro, ROOT, showAll } from './model';
import { levelOf, openDoc, pick, reveal } from './open';
import { repaint, repaintAll } from './repaint';
import { settle, S } from './state';
import { act, project, refused, storage } from './storage';
import type { Item, KindName, ViewMode } from './types';

const match = (x: Item): boolean => x.name.toLowerCase().includes(S.q) || kids(x).some(match);
const expanded = (x: Item): boolean => S.open.has(x.id);
const expand = (x: Item, on = !expanded(x)): void => { if (on) S.open.add(x.id); else S.open.delete(x.id); };
const itemOf = (row: HTMLElement): Item => byId(row.dataset.id!) ?? ROOT;
const tree = (): HTMLElement => $('#tree');

/* the item whose name is being typed in the tree, the name as far as it was typed, and why the storage refused it when it did */
let named: Item | null = null, draft = '', refusal: string | null = null;

/* what a click, a key and the search field do in the Explorer */
const on: ExplorerActions = {
  search: text => { S.q = text.trim().toLowerCase(); renderExplorer(); },
  click: (id, twisty) => {
    const x = byId(id) ?? ROOT;
    if (twisty && kids(x).length) { expand(x); renderExplorer(); return; }
    if (S.sel === x && kids(x).length) expand(x);
    openDoc(x);
  },
  menu: (id, x, y) => {
    const item = byId(id) ?? ROOT;
    if (S.sel !== item) pick(item);
    menu(ctx(item), x, y);
  },
  key: e => {
    if ((e.target as Element).id === 'rn') return;
    const t = tree(), rows = $$('.row', t), i = rows.findIndex(r => r.classList.contains('sel')), x = S.sel;
    const go = (j: number) => { const r = rows[clamp(j, 0, rows.length - 1)]; if (r) openDoc(itemOf(r)); $maybe('#tree .sel')?.scrollIntoView({ block: 'nearest' }); t.focus(); };
    if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight' && kids(x).length) { expand(x, true); renderExplorer(); }
    else if (e.key === 'ArrowLeft') { if (expanded(x) && kids(x).length) { expand(x, false); renderExplorer(); } else if (x.parent) openDoc(x.parent); }
    else if (e.key === 'F2' && !x.pseudo && !ro(x)) { e.preventDefault(); rename(x); }
    else if (e.key === 'Delete' && !x.pseudo && !ro(x) && x !== ROOT) void del(x);
    else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); const r = rows[i].getBoundingClientRect(); menu(ctx(x), r.left + 60, r.bottom); }
  },
};

/* draws the Explorer as it is now, with the name that is being typed as far as it was typed */
function paint(): void {
  const lines: TreeLine[] = [];
  const rows = (x: Item, d: number): void => {
    const ks = kids(x), vis = S.q ? ks.filter(match) : ks, open = S.q ? true : expanded(x);
    lines.push({ item: x, depth: d, has: ks.length > 0, open });
    if (open) vis.forEach(k => rows(k, d + 1));
  };
  rows(ROOT, 0);
  const naming: Naming | null = S.edit && {
    item: S.edit, draft, refused: refusal,
    /* typing takes away why the name before it was refused */
    typed: text => { draft = text; if (refusal !== null) { refusal = null; paint(); } },
    done: apply => void endRename(apply),
    left: () => { if (S.edit) void endRename(true, true); },
  };
  draw(body('explorer'), h(Explorer, { lines, selected: S.sel, naming, on }));
}

/* Draws the Explorer afresh. A name that is started shows the name the item has, with all of it selected; a name that is being typed stays as far as it was typed, whatever else changed in the tree. */
export function renderExplorer(): void {
  const started = S.edit !== named;
  if (started) { named = S.edit; draft = S.edit?.name ?? ''; refusal = null; }
  paint();
  const r = started ? $maybe<HTMLInputElement>('#rn') : null;
  if (r) { r.focus(); r.select(); }
}

/* sets how a level and everything under it is shown; a level that shows as its parent does keeps no setting of its own */
export async function setMode(t: Item, m: ViewMode): Promise<void> {
  if (!await act(project.levels.setView(t, m))) return;
  S.open.add(t.id);
  repaintAll();
}

export function rename(x: Item): void { S.edit = x; reveal(x); renderExplorer(); }
/* true while a new name is on its way to the storage */
let renaming = false;
/* ends the renaming in the tree: the storage takes the name, or says why it cannot be given, and that shows under the row */
async function endRename(apply: boolean, blur = false): Promise<void> {
  const x = S.edit, r = $maybe<HTMLInputElement>('#rn');
  if (!x || !r || renaming) return;
  if (apply) {
    renaming = true;
    try { await project.solution.rename(x, r.value.trim()); } catch (e) {
      const why = reason(e);
      if (blur || !r.isConnected) { S.edit = null; renderExplorer(); return; }
      refusal = why;
      paint();
      return;
    } finally { renaming = false; }
  }
  S.edit = null;
  repaintAll();
  tree().focus();
}

async function add(p: Item, kind: KindName): Promise<void> {
  const made = await act(project.solution.add(p, kind));
  if (!made) return;
  S.open.add(p.id);
  openDoc(made.item);
  rename(made.item);
}
async function del(x: Item): Promise<void> {
  const p = x.parent;
  if (!p) return;
  let done;
  try { done = await project.solution.remove(x); } catch (e) { refused(e); return; }
  const undo = done.undo;
  S.tabs = S.tabs.filter(t => !inside(t, x));
  if (inside(S.doc, x) || inside(S.sel, x)) openDoc(p); else repaintAll();
  /* Undo takes the delete back while it is the last change, and opens the item again */
  toast(done.message, 'Undo', () => { project.history.undo(undo).then(() => { settle(); openDoc(x); }, refused); });
}

/* the icon picker, at a point: every icon of the library by category, with search and a choice of one category or domain */
export function iconPick(x: Item, ax: number, ay: number): void {
  closePop();
  const { general, byDomain, all: groups, count } = storage.catalogue.icons;
  const current = x.icon || K[x.kind].icon, all = groups.flatMap(group => group[1]), nameOf = (i: string) => (all.find(o => o.nm === i) || { label: i }).label;
  /* what was searched for, the category or domain the search is kept to, and the icon the pointer is over, by its label */
  let query = '', only = '', over: string | null = null;
  const found = () => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return groups.filter(([category]) => !only || category === only).map(([category, icons]) => [category, icons.filter(o => words.every(w => o.kw.includes(w)))] as const).filter(([, icons]) => icons.length);
  };
  /* no name gives the item the icon of its kind again */
  const choose = (icon: string): void => {
    closePop();
    void act(project.solution.setIcon(x, icon)).then(done => { if (done) repaintAll(); });
  };
  /* another search starts at the top of what it finds */
  const searched = (): void => { over = null; redraw(m, view()); $('#ip-list', m).scrollTop = 0; };
  const view = () => h(IconPicker, {
    name: x.name, kind: inSentence(x.kind), count, general, domains: byDomain, found: found(), current, query, only, note: over ?? 'Current: ' + nameOf(current),
    on: {
      search: text => { query = text.trim(); searched(); },
      only: category => { only = category; searched(); },
      over: label => { if (label !== over) { over = label; redraw(m, view()); } },
      first: () => { const first = found()[0]?.[1][0]; if (first) choose(first.nm); },
      choose,
    },
  });
  const m: HTMLElement = raise(view());
  place(m, ax, ay);
  $('#ip-q', m).focus();
}

/* links a repository from outside the project into a level; its items continue the hierarchy there */
export function linkRepo(p: Item): void {
  const offer = project.solution.suggestedLink;
  dialog('Link Repository into ' + p.name, h(LinkRepository, { offer }), 'Link', v => {
    const value = (id: string) => $<HTMLInputElement | HTMLSelectElement>(id, v).value;
    void act(project.solution.linkRepository(p, value('#lr-u'), value('#lr-n').trim(), value('#lr-r'))).then(made => {
      if (!made) return;
      S.open.add(p.id); S.open.add(made.item.id);
      openDoc(made.item);
    });
  });
}

const changed = (x: Item): boolean => !!x.vcs || (x.children || []).some(changed);

/* the context menu of an item: what it offers depends on the item */
export function ctx(x: Item): MenuEntry[] {
  if (x.pseudo) return [{ l: 'Open', k: 'Enter', on: () => openDoc(x) }, '-', { l: 'Git', i: 'branch', sub: [{ l: 'Show History', on: () => show('git') }, { l: x.ignored ? 'Remove from .gitignore' : 'Add to .gitignore', d: x.name === '.adp' ? '.adp files are always committed' : null, on: () => { project.git.setIgnored(ownerOf(x), fileOf(x), !x.ignored).then(() => repaint('explorer', 'properties'), refused); } }] }, { l: 'Copy Path', on: () => copy(path(x)) }];
  const box = !!x.children, pure = isBox(x), R = ro(x), why = R ? `Read-only, from ${R.name} @ ${R.link!.ref}` : null, m = box ? modeOf(x) : null, link = x.link;
  return [
    box && { l: 'New', i: 'plus', d: why, sub: acceptsOf(x).map(k => ({ l: K[k].label, i: K[k].icon, on: () => void add(x, k) })) },
    { l: 'Open', k: 'Enter', i: pure ? 'canvas' : 'edit', on: () => openDoc(x) },
    { l: pure ? 'Open as Contents List' : 'Show in Canvas', k: 'Alt+C', i: pure ? 'list' : 'canvas', on: () => openDoc(x, pure ? 'editor' : 'canvas') }, '-',
    { l: 'Rename…', k: 'F2', d: why, on: () => rename(x) },
    { l: 'Change Icon…', d: why, on: () => { const r = $maybe(`.row[data-id="${x.id}"]`)?.getBoundingClientRect(); iconPick(x, r ? r.left + 40 : 200, r ? r.bottom : 200); } },
    { l: 'Delete', k: 'Del', d: x === ROOT ? 'The project root stays' : why, on: () => void del(x) }, '-',
    box && { l: 'View As', i: 'eye', sub: [{ l: 'Logical Structure', chk: m === 'logical', on: () => void setMode(x, 'logical') }, { l: 'File System', chk: m === 'files', on: () => void setMode(x, 'files') }, '-', { l: 'Show All Files', chk: m === 'files' && showAll(x), d: m !== 'files' ? 'File System view only' : null, on: () => { project.levels.setShowAll(x, !showAll(x)).then(repaintAll, refused); } }] },
    link && { l: 'Switch Branch or Tag', i: 'branch', sub: link.refs.map(r => ({ l: r, chk: r === link.ref, on: () => { void act(project.solution.setRef(x, r)).then(done => { if (done) repaintAll(); }); } })) },
    link && { l: 'Update from Remote', i: 'fetch', on: () => void act(project.solution.updateLink(x)) },
    link && { l: 'Unlink Repository', on: () => void del(x) },
    pure && !link && { l: 'Link Repository…', i: 'link', d: why, on: () => linkRepo(x) }, '-',
    { l: 'Git', i: 'branch', sub: [{ l: 'Commit…', k: 'Ctrl+K', d: changed(x) ? null : 'No local changes', on: () => show('commit') }, { l: 'Show History', on: () => show('git') }, { l: 'Compare with Branch…', on: () => toast('Comparing ' + x.name + ' with ' + project.git.upstream) }, { l: 'Rollback…', d: changed(x) ? null : 'No local changes', on: () => { void act(project.git.rollback(x)).then(done => { if (done) repaintAll(); }); } }] },
    box && { l: `Find in ${x.name}…`, k: 'Ctrl+Shift+F', i: 'search', on: () => { show('explorer'); const q = $<HTMLInputElement>('#ex-q'); q.placeholder = 'Search in ' + x.name; q.focus(); } },
    { l: 'Copy', sub: [{ l: 'Name', on: () => copy(x.name) }, { l: 'Path on Disk', on: () => copy(path(x)) }, { l: 'ID', on: () => copy(x.id) }] }, '-',
    { l: 'Properties', k: 'Alt+Enter', i: 'props', on: () => { pick(x); show('properties'); } }];
}

/* the menu File > New Item offers: what the level of the selection takes */
export function newItemMenu(): MenuEntry[] {
  const t = levelOf(S.sel);
  return acceptsOf(t).map(k => ({ l: K[k].label, i: K[k].icon, on: () => void add(t, k) }));
}

/* draws what the Explorer adds to the header of its tool window */
export function mountExplorer(): void {
  draw($('[data-pa]', pel.explorer), h(ExplorerButtons, {
    locate: () => { pick(S.doc); $maybe('#tree .sel')?.scrollIntoView({ block: 'nearest' }); },
    collapse: () => { S.open = new Set([ROOT.id]); renderExplorer(); },
  }));
}
