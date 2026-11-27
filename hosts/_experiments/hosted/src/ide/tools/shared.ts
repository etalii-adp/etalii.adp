/* What the tools of the document area share: the bar at the top of a tool, and the arrows of a diagram. */
import { esc } from '../../common/dom';
import { ico } from '../../common/icons';
import { K, WORD } from '../kinds';
import { linkOf, ro } from '../model';
import { repaint } from '../repaint';
import type { Item } from '../types';

/* a tool draws an item into the document area */
export type Tool = (d: HTMLElement, x: Item) => void;

/* the bar of a tool: what it is, a note when the item is read-only, and whatever the tool adds */
export const tbar = (x: Item, extra = ''): string => {
  const tool = K[x.kind].tool, from = ro(x) || x.link ? linkOf(x) : null;
  return `<div class="tb"><span class="tk">${tool ? WORD[tool] : ''} · ${K[x.kind].label}</span>${from?.link ? `<span class="chip">${ico('lock')}Read-only, from ${esc(from.name)} @ ${esc(from.link.ref)}</span>` : ''}${extra}</div>`;
};

export const curve = (x1: number, y1: number, x2: number, y2: number): string => { const dx = Math.max(30, Math.abs(x2 - x1) / 2); return `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`; };
/* the same, drawn from right to left */
export const curveL = (x1: number, y1: number, x2: number, y2: number): string => { const dx = Math.max(30, Math.abs(x2 - x1) / 2); return `M${x1} ${y1}C${x1 - dx} ${y1} ${x2 + dx} ${y2} ${x2} ${y2}`; };
export const ARROW = `<defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--muted);stroke:none"/></marker></defs>`;

/* a tool that changed an item marks it modified, and the Explorer and the Properties show it */
export function touch(x: Item): void {
  if (!x.vcs) x.vcs = 'M';
  repaint('explorer', 'properties');
}
