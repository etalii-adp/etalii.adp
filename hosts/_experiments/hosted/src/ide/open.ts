/* Selecting and opening: which item is selected, which one the document area shows, and whether it shows as its tool or as a canvas. */
import { show } from './docks';
import { isBox } from './model';
import { repaint, repaintAll } from './repaint';
import { S } from './state';
import type { DocMode, Item, PropSheet } from './types';

/* a container opens as a canvas and everything else in its tool, unless the item was switched */
export const dmode = (x: Item): DocMode => x.pseudo ? 'editor' : S.dm[x.id] || (isBox(x) ? 'canvas' : 'editor');
/* the level an item belongs to: itself when it has children, else its parent */
export const levelOf = (x: Item): Item => x.pseudo ? levelOf(x.parent!) : x.children ? x : x.parent!;
export function reveal(x: Item): void { for (let p = x.parent; p; p = p.parent) S.open.add(p.id); }

/* opens an item in the document area and selects it; mode says tool or canvas */
export function openDoc(x: Item, mode?: DocMode): void {
  S.doc = S.sel = x;
  S.insp = null;
  if (mode && !x.pseudo) S.dm[x.id] = mode;
  if (!S.tabs.includes(x)) { S.tabs.push(x); if (S.tabs.length > 7) S.tabs.splice(S.tabs.findIndex(t => t !== x), 1); }
  reveal(x);
  repaintAll();
}

/* selects an item without opening it */
export function pick(x: Item): void {
  S.sel = x;
  S.insp = null;
  reveal(x);
  repaint('explorer', 'properties', 'status', 'marks');
}

/* shows a part of the open tool in the Properties, and brings the Properties up when there is room */
export function inspect(sheet: PropSheet): void {
  S.insp = sheet;
  repaint('properties');
  if (S.act.right !== 'properties' && S.dock.properties === 'right' && innerWidth > 900) show('properties');
}

/* switches the open document between its tool and the canvas */
export function flip(): void {
  const x = S.doc;
  if (x.pseudo) return;
  S.dm[x.id] = dmode(x) === 'canvas' ? 'editor' : 'canvas';
  S.insp = null;
  repaint('editor', 'properties');
}
