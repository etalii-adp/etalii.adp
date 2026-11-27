/* The Properties tool window: a property grid for the selected item or the selected part of a tool. */
import { $maybe, esc } from '../common/dom';
import { ico } from '../common/icons';
import { toast } from '../common/popups';
import { HOLDS } from './data/applications';
import { WHO } from './data/commits';
import { PROBLEMS } from './data/problems';
import { body } from './docks';
import { iconPick, nameError, setMode } from './explorer';
import { gitHashOf } from './git';
import { K } from './kinds';
import { emb, filesOf, linkOf, modeOf, multi, ownerOf, path, ro, showAll } from './model';
import { repaintAll } from './repaint';
import { S } from './state';
import type { Falsy, Item, PropControl, PropGroup, PropRow, PropSheet, ViewMode } from './types';

const present = <T>(list: (T | Falsy)[]): T[] => list.filter(Boolean) as T[];

/* the sheet of an item: what it is, how it is stored, where it comes from, and what git and validation say of it */
function nodeProps(x: Item): PropSheet {
  if (x.pseudo) {
    const owner = ownerOf(x), what = x.entries ? 'Folder' : 'File';
    return { icon: x.entries ? 'folder' : 'file', col: 'muted', title: x.name, sub: what, g: [[what, [['Name', x.name], ['Path on disk', path(x)], ['Ignored by git', x.ignored ? 'Yes' : 'No'], ['Belongs to', owner.name]]], ['Purpose', [['Holds', x.name === '.adp' ? 'Shared settings and canvas layout' : x.name === '.user.adp' ? 'Your personal overrides' : HOLDS[x.name] ?? 'Part of the stored form of ' + owner.name]]]] };
  }
  const L = linkOf(x), box = !!x.children, hsh = parseInt(x.id.slice(-6), 36), R = ro(x), mine = PROBLEMS.filter(p => p.node === x);
  const general: PropGroup = ['General', [['Name', { name: 1, lock: !!R }], ['Kind', K[x.kind].label], ['ID', x.id], ['Icon', { icon: 1, lock: !!R }]]];
  const entity: PropGroup | false = x.kind === 'entity' && !!x.parent && ['Entity type', present<PropRow>([['Model', x.parent.name], ['Attributes', String(x.attrs?.length ?? 0)], x.ext && ['Defined in', x.ext]])];
  const storage: PropGroup = ['Storage', present<PropRow>([['Path on disk', path(x)], ['Stored as', emb(x) && x.parent ? 'Inside ' + filesOf(x.parent)[0] + ' of ' + x.parent.name : multi(x) ? filesOf(x).length + ' files in a folder' : box ? 'Folder with a .adp file' : 'One file'], box && ['View as', { mode: 1 }], box && ['Show all files', { all: 1 }], ['Settings from', x.mode || S.moved.has(x.id) ? '.adp, overridden by .user.adp' : '.adp']])];
  const linked: PropGroup | false = !!L?.link && ['Linked repository', [['Repository', L.link.repo], ['Branch or tag', L === x ? { ref: 1 } : L.link.ref], ['Resolved commit', gitHashOf(L.link.ref + L.name)], ['Access', L === x ? 'Items inside are read-only' : 'Read-only, from ' + L.name]]];
  const git: PropGroup = ['Git', [['Status', x.vcs === 'M' ? 'Modified' : x.vcs === 'A' ? 'Added, not committed' : 'Unchanged'], ['Branch', L?.link ? L.link.ref : 'develop'], ['Last change', WHO[hsh % 4] + ', ' + (hsh % 9 + 2) + ' days ago']]];
  const problems: PropGroup | false = mine.length > 0 && ['Problems', mine.map((p): PropRow => [p.s[0].toUpperCase() + p.s.slice(1), p.m, p.s === 'error' ? 1 : 0])];
  return { icon: x.icon || K[x.kind].icon, col: K[x.kind].colour, title: x.name, sub: K[x.kind].label, g: [general, entity, storage, linked, git, problems] };
}

export function renderProps(): void {
  const x = S.sel, P = S.insp || nodeProps(x), b = body('properties');
  /* a control in place of a text, for the rows that can be changed */
  const control = (v: PropControl): string => {
    if ('name' in v) return `<span><input class="in" id="p-name" value="${esc(x.name)}" aria-label="Name"${v.lock ? ' disabled' : ''}></span>`;
    if ('icon' in v) return `<span><button class="tbtn" id="p-icon" style="height:22px;margin-left:-8px"${v.lock ? ' disabled' : ''}>${ico(x.icon || K[x.kind].icon, 'c-' + K[x.kind].colour)}${x.icon ? 'Custom' : 'Default'}</button></span>`;
    if ('mode' in v) return `<span><select class="in" id="p-mode" aria-label="View as"><option value="logical"${modeOf(x) === 'logical' ? ' selected' : ''}>Logical Structure</option><option value="files"${modeOf(x) === 'files' ? ' selected' : ''}>File System</option></select></span>`;
    if ('all' in v) return `<span><input type="checkbox" id="p-all" aria-label="Show all files"${showAll(x) ? ' checked' : ''}${modeOf(x) === 'files' ? '' : ' disabled'}></span>`;
    return `<span><select class="in mono" id="p-ref" aria-label="Branch or tag">${(x.link?.refs ?? []).map(r => `<option${r === x.link?.ref ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select></span>`;
  };
  /* an id wraps, and a path or a commit hash is set in the monospaced font */
  const text = (v: string, red?: boolean | number): string => `<span><span class="v${red ? ' red' : ''}${/^[0-9a-z]{25}$/.test(v) ? ' mono wrap' : /[\/@]|^[a-f0-9]{7}$/.test(v) ? ' mono' : ''}" title="${esc(v)}">${esc(v)}</span></span>`;
  b.innerHTML = `<div class="pg-head">${ico(P.icon, 'c-' + (P.col || 'muted'))}<b>${esc(P.title)}</b><small>${esc(P.sub)}</small></div><div class="pgrid">${present(P.g).map(([h, rows]) => `<div class="pc">${h}</div>${rows.map(([k, v, red]) => `<div class="pr"><span><span class="v">${esc(k)}</span></span>${typeof v === 'string' ? text(v, red) : control(v)}</div>`).join('')}`).join('')}</div>`;
  const nm = $maybe<HTMLInputElement>('#p-name', b), ic = $maybe('#p-icon', b), md = $maybe<HTMLSelectElement>('#p-mode', b), al = $maybe<HTMLInputElement>('#p-all', b), rf = $maybe<HTMLSelectElement>('#p-ref', b);
  if (nm) nm.onchange = () => {
    const v = nm.value.trim(), err = nameError(x, v);
    if (err) { toast(err); nm.value = x.name; return; }
    x.name = v;
    if (!x.vcs) x.vcs = 'M';
    repaintAll();
  };
  if (ic) ic.onclick = () => { const r = ic.getBoundingClientRect(); iconPick(x, r.left - 120, r.bottom + 3); };
  if (md) md.onchange = () => setMode(x, md.value as ViewMode);
  if (al) al.onchange = () => { x.showAll = al.checked; repaintAll(); };
  if (rf) rf.onchange = () => { if (!x.link) return; x.link.ref = rf.value; repaintAll(); toast(`${x.name} now follows ${rf.value}`); };
}
