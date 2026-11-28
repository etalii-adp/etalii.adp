/* What the tools of the document area share: how a tool draws, the curves of a diagram, and how a tool changes a document. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { repaint } from '../repaint';
import { act, project } from '../storage';
import type { Item } from '../types';
import { Waiting } from './shared.template';

/* A tool draws an item into the document area. It draws it under the item's id as its key: another item starts from nothing, and the same item drawn again keeps what is still there, with the focus and where it was scrolled to. */
export type Tool = (d: HTMLElement, x: Item) => void;

export const curve = (x1: number, y1: number, x2: number, y2: number): string => { const dx = Math.max(30, Math.abs(x2 - x1) / 2); return `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`; };
/* the same, drawn from right to left */
export const curveL = (x1: number, y1: number, x2: number, y2: number): string => { const dx = Math.max(30, Math.abs(x2 - x1) / 2); return `M${x1} ${y1}C${x1 - dx} ${y1} ${x2 + dx} ${y2} ${x2} ${y2}`; };

/* what a tool shows while the document of its item is on its way */
export const waiting = (d: HTMLElement, x: Item): void => draw(d, h(Waiting, { key: x.id, item: x }));

/* The edits of the tools, one after the other, so that each starts from what the one before it left. */
let edits: Promise<unknown> = Promise.resolve();
/* A tool changes the document of an item: change gets a copy of the document as it is now and changes it, and the copy is written. holder is the item that holds the document when that is not the item itself, as a model holds what its entity types are. The Explorer and the Properties show the item as changed afterwards. */
export function edit<T>(x: Item, empty: T, change: (doc: T) => void, holder: Item = x): Promise<unknown> {
  return edits = edits.then(async () => {
    const doc = structuredClone(project.content.doc<T>(holder) ?? empty) as T;
    change(doc);
    await act(project.content.write(holder, doc, holder === x ? undefined : x));
    repaint('explorer', 'properties');
  });
}
