/* Diagram: ontology models. Each model carries its entity types as child items, so the hierarchy and the diagram show the same things. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { byId } from '../model';
import { openDoc, pick } from '../open';
import { S } from '../state';
import type { Item, Point } from '../types';
import { heightOf, Ontology } from './ontology.tsx';
import type { Tool } from './shared';

/* Where each entity type of a model stands: where its model says, and one that has no place yet gets one under the others. */
function places(E: readonly Item[]): Map<Item, Point> {
  const at = new Map<Item, Point>();
  for (const e of E) if (e.ex !== undefined) at.set(e, { x: e.ex, y: e.ey ?? 0 });
  for (const e of E) {
    if (at.has(e)) continue;
    const placed = [...at.keys()];
    at.set(e, { x: (placed.filter(o => o.fresh).length % 4) * 250, y: Math.max(0, ...placed.filter(o => !o.fresh).map(o => at.get(o)!.y + heightOf(o))) + 40 });
  }
  return at;
}

/* the entity type that is marked in the diagram, by its id: the selected one when the diagram is drawn afresh, and then the one that was clicked */
let marked: string | null = null;

function paint(d: HTMLElement, x: Item): void {
  const E = x.children || [], at = places(E), R = (x.rels || []).filter(r => E.includes(r[0]) && E.includes(r[1]));
  draw(d, h(Ontology, {
    key: x.id, item: x, entities: E, relations: R, at: e => at.get(e) ?? { x: 0, y: 0 }, marked,
    pick: e => { const en = byId(e.id); if (!en) return; marked = en.id; paint(d, x); pick(en); },
    open: e => { const en = byId(e.id); if (en) openDoc(en); },
  }));
}

export const rOnto: Tool = (d, x) => { marked = (x.children || []).find(e => S.sel === e)?.id ?? null; paint(d, x); };

/* marks an entity type in the diagram of its model, which the document area shows */
export function markEntity(d: HTMLElement, e: Item): void { if (e.parent) { marked = e.id; paint(d, e.parent); } }
