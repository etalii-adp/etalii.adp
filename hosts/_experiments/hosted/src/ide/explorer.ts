/* The Explorer: the tree, its two views, rename, add, delete, the icon picker and the context menu. A level's view is set from its context menu (View As) or in the Properties. */
import { $, $$, $maybe, clamp, el, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { reason } from '../common/reason';
import { closePop, copy, dialog, menu, place, toast, type MenuEntry } from '../common/popups';
import { body, pel, show } from './docks';
import { acceptsOf, inSentence, K } from './kinds';
import { asFile, byId, disk, fileOf, inside, isBox, kids, modeOf, multi, ownerOf, path, ro, ROOT, showAll } from './model';
import { levelOf, openDoc, pick, reveal } from './open';
import { repaint, repaintAll } from './repaint';
import { sev } from './severity';
import { settle, S } from './state';
import { act, project, refused, storage } from './storage';
import type { Item, KindName, ViewMode } from './types';

const match = (x: Item): boolean => x.name.toLowerCase().includes(S.q) || kids(x).some(match);
const expanded = (x: Item): boolean => S.open.has(x.id);
const expand = (x: Item, on = !expanded(x)): void => { if (on) S.open.add(x.id); else S.open.delete(x.id); };
const itemOf = (row: HTMLElement): Item => byId(row.dataset.id!) ?? ROOT;
const tree = (): HTMLElement => $('#tree');

function rowHTML(x: Item, d: number, has: boolean, open: boolean): string {
  const f = !x.pseudo && asFile(x), box = x.children || (!x.pseudo && multi(x));
  const icon = x.pseudo ? (x.entries ? 'folder' : 'file') : f ? (box ? 'folder' : 'file') : (x.icon || K[x.kind].icon), sv = x.pseudo ? null : sev(x);
  return `<div class="row${S.sel === x ? ' sel' : ''}${x.ignored ? ' ign' : ''}" data-id="${x.id}" style="--d:${d}" role="treeitem"><span class="tw${open ? ' open' : ''}">${has ? ico('chev') : ''}</span>${ico(icon, 'c-' + (x.pseudo ? 'muted' : K[x.kind].colour))}` +
    (S.edit === x ? `<input class="in rn" id="rn" value="${esc(x.name)}" aria-label="Name">` : `<span class="nm${x.vcs ? ' v' + x.vcs : ''}${f || x.pseudo ? ' mono' : ''}">${esc(x.pseudo ? x.name : f ? disk(x) : x.name)}</span>`) +
    (x.link ? `<span class="ref" title="Linked repository ${esc(x.link.repo)}">${ico('link')}${esc(x.link.ref)}</span>` : '') + (x.mode ? `<span class="tag" title="This level has its own view setting">${x.mode}</span>` : '') + (sv ? `<span class="dot ${sv}" title="Has ${sv}s"></span>` : '') + `</div>`;
}

export function renderExplorer(): void {
  const out: string[] = [];
  const rows = (x: Item, d: number): void => {
    const ks = kids(x), vis = S.q ? ks.filter(match) : ks, open = S.q ? true : expanded(x);
    out.push(rowHTML(x, d, ks.length > 0, open));
    if (open) vis.forEach(k => rows(k, d + 1));
  };
  rows(ROOT, 0);
  tree().innerHTML = out.join('');
  const r = $maybe<HTMLInputElement>('#rn');
  if (r) {
    r.focus(); r.select();
    r.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') void endRename(true); if (e.key === 'Escape') void endRename(false); };
    r.onblur = () => { if (S.edit) void endRename(true, true); };
    r.oninput = () => { r.classList.remove('bad'); $maybe('.rnerr')?.remove(); };
  }
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
      const row = r.closest<HTMLElement>('.row')!;
      r.classList.add('bad');
      $maybe('.rnerr')?.remove();
      row.after(el(`<div class="rnerr" style="--d:${row.style.getPropertyValue('--d')}">${esc(why)}</div>`));
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
  const { general: GENERAL, byDomain: BY_DOMAIN, all: ICONSET, count: ICON_COUNT } = storage.catalogue.icons;
  const cur = x.icon || K[x.kind].icon, all = ICONSET.flatMap(group => group[1]), nameOf = (i: string) => (all.find(o => o.nm === i) || { label: i }).label;
  const options = (groups: typeof ICONSET): string => groups.map(([cat]) => `<option>${esc(cat)}</option>`).join('');
  const m = el(`<div class="menu ipick"><div class="mhead">Icon for ${esc(x.name)}</div><div class="ip-top"><input class="in" id="ip-q" placeholder="Search ${ICON_COUNT} icons" aria-label="Search icons" autocomplete="off"><select class="in" id="ip-cat" aria-label="Category or domain"><option value="">All categories</option><optgroup label="General">${options(GENERAL)}</optgroup><optgroup label="Domains">${options(BY_DOMAIN)}</optgroup></select></div><div class="ip-list" id="ip-list"></div><div class="ip-foot" id="ip-name"></div><div class="msep"></div><button class="mi" data-ic=""><span class="lead"></span>Use the default for ${esc(inSentence(x.kind))}</button></div>`);
  const list = $('#ip-list', m), foot = $('#ip-name', m), q = $<HTMLInputElement>('#ip-q', m), only = $<HTMLSelectElement>('#ip-cat', m), rest = () => { foot.textContent = 'Current: ' + nameOf(cur); };
  const draw = () => {
    const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML = ICONSET.filter(([cat]) => !only.value || cat === only.value).map(([cat, items]) => {
      const found = items.filter(o => words.every(w => o.kw.includes(w)));
      return found.length ? `<h6>${esc(cat)}</h6><div class="icongrid">${found.map(o => `<button class="ib${o.nm === cur ? ' on' : ''}" data-ic="${o.nm}" title="${esc(o.label)}" aria-label="${esc(o.label)}">${ico(o.nm)}</button>`).join('')}</div>` : '';
    }).join('') || `<div class="hint">No icon matches "${esc(q.value.trim())}"${only.value ? ' in ' + esc(only.value) : ''}.</div>`;
    list.scrollTop = 0;
    rest();
  };
  /* no name gives the item the icon of its kind again */
  const choose = (i: string | undefined) => {
    closePop();
    void act(project.solution.setIcon(x, i ?? '')).then(done => { if (done) repaintAll(); });
  };
  q.oninput = draw;
  only.onchange = draw;
  q.onkeydown = e => { if (e.key === 'Enter') { const first = $maybe('[data-ic]', list); if (first) choose(first.dataset.ic); } };
  list.onmouseover = e => { const b = hit(e, '[data-ic]'); if (b) foot.textContent = b.title; else rest(); };
  list.onmouseleave = rest;
  m.onclick = e => { const b = hit(e, '[data-ic]'); if (b) choose(b.dataset.ic); };
  draw();
  place(m, ax, ay);
  q.focus();
}

/* links a repository from outside the project into a level; its items continue the hierarchy there */
export function linkRepo(p: Item): void {
  const offer = project.solution.suggestedLink;
  dialog('Link Repository into ' + p.name, `<label for="lr-u">Repository</label><input class="in mono" id="lr-u" value="${esc(offer.repo)}"><label for="lr-n">Show as</label><input class="in" id="lr-n" value="${esc(offer.name)}"><label for="lr-r">Branch or tag</label><select class="in" id="lr-r">${offer.refs.map(r => `<option>${esc(r)}</option>`).join('')}</select>`, 'Link', v => {
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

/* draws the Explorer's frame into its tool window and wires the tree */
export function mountExplorer(): void {
  body('explorer').innerHTML = `<div class="ex-q"><input class="in" id="ex-q" placeholder="Search items" aria-label="Search items"></div><div class="tree" id="tree" tabindex="0" role="tree" aria-label="Explorer"></div>`;
  $('[data-pa]', pel.explorer).innerHTML = `<button class="ib" id="ex-loc" title="Select the open document">${ico('target')}</button><button class="ib" id="ex-col" title="Collapse all">${ico('collapse')}</button>`;
  const t = tree(), search = $<HTMLInputElement>('#ex-q');
  search.oninput = () => { S.q = search.value.trim().toLowerCase(); renderExplorer(); };
  $('#ex-loc').onclick = () => { pick(S.doc); $maybe('#tree .sel')?.scrollIntoView({ block: 'nearest' }); };
  $('#ex-col').onclick = () => { S.open = new Set([ROOT.id]); renderExplorer(); };

  t.addEventListener('click', e => {
    const r = hit(e, '.row');
    if (!r || hit(e, '.rn')) return;
    const x = itemOf(r);
    if (hit(e, '.tw') && kids(x).length) { expand(x); renderExplorer(); return; }
    if (S.sel === x && kids(x).length) expand(x);
    openDoc(x);
  });
  t.addEventListener('contextmenu', e => {
    const r = hit(e, '.row');
    if (!r) return;
    e.preventDefault();
    const x = itemOf(r);
    if (S.sel !== x) pick(x);
    menu(ctx(x), e.clientX, e.clientY);
  });
  t.addEventListener('keydown', e => {
    if ((e.target as Element).id === 'rn') return;
    const rows = $$('.row', t), i = rows.findIndex(r => r.classList.contains('sel')), x = S.sel;
    const go = (j: number) => { const r = rows[clamp(j, 0, rows.length - 1)]; if (r) openDoc(itemOf(r)); $maybe('#tree .sel')?.scrollIntoView({ block: 'nearest' }); t.focus(); };
    if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight' && kids(x).length) { expand(x, true); renderExplorer(); }
    else if (e.key === 'ArrowLeft') { if (expanded(x) && kids(x).length) { expand(x, false); renderExplorer(); } else if (x.parent) openDoc(x.parent); }
    else if (e.key === 'F2' && !x.pseudo && !ro(x)) { e.preventDefault(); rename(x); }
    else if (e.key === 'Delete' && !x.pseudo && !ro(x) && x !== ROOT) void del(x);
    else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); const r = rows[i].getBoundingClientRect(); menu(ctx(x), r.left + 60, r.bottom); }
  });
}
