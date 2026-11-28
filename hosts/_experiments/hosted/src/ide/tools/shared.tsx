/* What the tools of the document area share in how they look: the bar at the top of a tool, and the arrowhead of a diagram. */
import type { ComponentChildren, VNode } from 'preact';
import { ico } from '../../common/icons.tsx';
import { K, WORD } from '../kinds';
import { linkOf, ro } from '../model';
import type { Item } from '../types';

/* the bar of a tool: what it is, a note when the item is read-only, and whatever the tool adds */
export const ToolBar = ({ item: x, children }: { item: Item; children?: ComponentChildren }): VNode => {
  const tool = K[x.kind].tool, from = ro(x) || x.link ? linkOf(x) : null;
  return <div class="tb">
    <span class="tk">{`${tool ? WORD[tool] : ''} · ${K[x.kind].label}`}</span>
    {from?.link ? <span class="chip">{ico('lock')}{`Read-only, from ${from.name} @ ${from.link.ref}`}</span> : ''}
    {children}
  </div>;
};

/* the arrowhead the lines of a diagram end with; it goes first in the svg that draws them */
export const Arrow = (): VNode =>
  <defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--muted);stroke:none" /></marker></defs>;

/* what a tool shows while the document of its item is on its way: its bar, and nothing under it */
export const Waiting = ({ item }: { item: Item }): VNode => <div class="tool"><ToolBar item={item} /></div>;
