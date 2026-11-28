/* The Properties tool window: a property grid for the selected item or the selected part of a tool. */
import { h } from 'preact';
import { draw } from '../common/dom';
import { body } from './docks';
import { iconPick, setMode } from './explorer';
import { K } from './kinds';
import { emb, fileOf, filesOf, linkOf, multi, ownerOf, path, ro } from './model';
import { Properties } from './properties.template';
import { repaint, repaintAll } from './repaint';
import { S } from './state';
import { act, project, refused } from './storage';
import type { Falsy, Item, PropGroup, PropRow, PropSheet } from './types';

const present = <T>(list: (T | Falsy)[]): T[] => list.filter(Boolean) as T[];

/* the sheet of an item: what it is, how it is stored, where it comes from, and what git and validation say of it */
function nodeProps(x: Item): PropSheet {
  if (x.pseudo) {
    const owner = ownerOf(x), what = x.entries ? 'Folder' : 'File';
    return { icon: x.entries ? 'folder' : 'file', col: 'muted', title: x.name, sub: what, g: [[what, [['Name', x.name], ['Path on disk', path(x)], ['Ignored by git', x.ignored ? 'Yes' : 'No'], ['Belongs to', owner.name]]], ['Purpose', [['Holds', (x.entries ? '' : project.content.file(owner, fileOf(x))?.holds) || 'Part of the stored form of ' + owner.name]]]] };
  }
  const L = linkOf(x), box = !!x.children, R = ro(x), mine = project.status.problems.filter(p => p.node === x);
  const general: PropGroup = ['General', [['Name', { name: 1, lock: !!R }], ['Kind', K[x.kind].label], ['ID', x.id], ['Icon', { icon: 1, lock: !!R }]]];
  const entity: PropGroup | false = x.kind === 'entity' && !!x.parent && ['Entity type', present<PropRow>([['Model', x.parent.name], ['Attributes', String(x.attrs?.length ?? 0)], x.ext && ['Defined in', x.ext]])];
  const storage: PropGroup = ['Storage', present<PropRow>([['Path on disk', path(x)], ['Stored as', emb(x) && x.parent ? 'Inside ' + filesOf(x.parent)[0] + ' of ' + x.parent.name : multi(x) ? filesOf(x).length + ' files in a folder' : box ? 'Folder with a .adp file' : 'One file'], box && ['View as', { mode: 1 }], box && ['Show all files', { all: 1 }], ['Settings from', x.mode || x.own ? '.adp, overridden by .user.adp' : '.adp']])];
  const linked: PropGroup | false = !!L?.link && ['Linked repository', [['Repository', L.link.repo], ['Branch or tag', L === x ? { ref: 1 } : L.link.ref], ['Resolved commit', L.link.resolved], ['Access', L === x ? 'Items inside are read-only' : 'Read-only, from ' + L.name]]];
  const git: PropGroup = ['Git', [['Status', x.vcs === 'M' ? 'Modified' : x.vcs === 'A' ? 'Added, not committed' : 'Unchanged'], ['Branch', L?.link ? L.link.ref : project.git.branch], ['Last change', x.lastChange ?? '']]];
  const problems: PropGroup | false = mine.length > 0 && ['Problems', mine.map((p): PropRow => [p.s[0].toUpperCase() + p.s.slice(1), p.m, p.s === 'error' ? 1 : 0])];
  return { icon: x.icon || K[x.kind].icon, col: K[x.kind].colour, title: x.name, sub: K[x.kind].label, g: [general, entity, storage, linked, git, problems] };
}

/* true while something that arrived waits to be shown until nobody is in a field of the Properties */
let waiting = false;

/* The Properties are drawn again for something that arrived, not for something done in them. A field somebody is in is not taken away under them: a field that is removed commits what was typed in it so far and loses the focus. They are drawn when the focus leaves them, or with the next thing done in them. */
export function showArrivedInProps(): void {
  if (body('properties').contains(document.activeElement)) waiting = true; else repaint('properties');
}

export function mountProps(): void {
  const b = body('properties');
  /* the window losing the focus leaves the field as it is: nobody left it */
  b.addEventListener('focusout', e => { if (waiting && !b.contains(e.relatedTarget as Node | null) && !b.contains(document.activeElement)) repaint('properties'); });
}

/* how often the sheet was drawn */
let draws = 0;

/* Draws the sheet of the selected item, or of the part of a tool that was picked. Every draw is of new elements (its key): a field that showed is taken away, which commits what was typed in it, and that is what showArrivedInProps waits with. */
export function renderProps(): void {
  const x = S.sel;
  waiting = false;
  draw(body('properties'), h(Properties, {
    key: ++draws, sheet: S.insp || nodeProps(x), item: x,
    on: {
      /* a name the storage does not take is put back, with the reason */
      rename: field => { project.solution.rename(x, field.value.trim()).then(repaintAll, (e: unknown) => { refused(e); field.value = x.name; }); },
      icon: button => { const r = button.getBoundingClientRect(); iconPick(x, r.left - 120, r.bottom + 3); },
      mode: mode => void setMode(x, mode),
      all: on => { project.levels.setShowAll(x, on).then(repaintAll, refused); },
      ref: ref => { void act(project.solution.setRef(x, ref)).then(repaintAll); },
    },
  }));
}
