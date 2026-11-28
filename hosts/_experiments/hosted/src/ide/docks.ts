/* Docks and tool windows: every panel can be shown, hidden and moved to another dock. */
import { h } from 'preact';
import { $, $$, clamp, draw, el } from '../common/dom';
import { menu } from '../common/popups';
import { Panel, Stripe, type StripeButton } from './docks.tsx';
import { defaultLayout, keep, S } from './state';
import type { DockId, PanelId } from './types';

/* the tool windows: title and icon */
export const PAN: Record<PanelId, [title: string, icon: string]> = { explorer: ['Explorer', 'folder'], commit: ['Commit', 'commit'], properties: ['Properties', 'props'], problems: ['Problems', 'warning'], agent: ['Agent', 'bot'], git: ['Git', 'branch'] };
export const panelIds = Object.keys(PAN) as PanelId[];
const docks: readonly DockId[] = ['left', 'right', 'bottom'];

/* the menu of a tool window, under its button: the dock it goes to, or out of sight */
const whereTo = (id: PanelId, button: HTMLElement): void => {
  const r = button.getBoundingClientRect();
  menu([{ h: 'Move ' + PAN[id][0] + ' to' }, ...docks.map(d => ({ l: d[0].toUpperCase() + d.slice(1), chk: S.dock[id] === d, on: () => move(id, d) })), '-', { l: 'Hide', on: () => toggle(id) }], r.left - 120, r.bottom + 3);
};
/* the element of each tool window; it is made once, and moves from dock to dock with what was drawn in it */
export const pel = Object.fromEntries(panelIds.map(id => [id, el(h(Panel, { id, title: PAN[id][0], hide: () => toggle(id), more: button => whereTo(id, button) }))])) as Record<PanelId, HTMLElement>;
/* where a tool window draws its content */
export const body = (id: PanelId): HTMLElement => $('.pb', pel[id]);

export function layout(): void {
  for (const d of docks) { $('#dock-' + d).hidden = !S.act[d]; $(`[data-split="${d}"]`).hidden = !S.act[d]; }
  for (const id of panelIds) { const d = S.dock[id]; $('#dock-' + d).append(pel[id]); pel[id].hidden = S.act[d] !== id; }
  const buttons = (d: DockId): StripeButton[] => panelIds.filter(i => S.dock[i] === d).map(id => ({ id, title: PAN[id][0], icon: PAN[id][1], on: S.act[d] === id }));
  const toggled = (id: string): void => toggle(id as PanelId);
  draw($('#stripe-l'), h(Stripe, { docks: [buttons('left'), buttons('bottom')], toggle: toggled }));
  draw($('#stripe-r'), h(Stripe, { docks: [buttons('right')], toggle: toggled }));
  requestAnimationFrame(() => S.cvFit?.(true));
  keep();
}
export function toggle(id: PanelId): void { const d = S.dock[id]; S.act[d] = S.act[d] === id ? null : id; layout(); }
export function show(id: PanelId): void { S.act[S.dock[id]] = id; layout(); }
function move(id: PanelId, d: DockId): void {
  const o = S.dock[id];
  if (o === d) return;
  S.dock[id] = d;
  if (S.act[o] === id) S.act[o] = panelIds.find(i => S.dock[i] === o) || null;
  S.act[d] = id;
  layout();
}
export function resetLayout(): void {
  const [dock, act] = defaultLayout();
  S.dock = dock; S.act = act;
  for (const d of docks) { $('#dock-' + d).style.width = ''; $('#dock-' + d).style.height = ''; }
  layout();
}

/* puts the tool windows in their docks, and wires the splitters */
export function mountDocks(): void {
  for (const id of panelIds) $('#dock-' + S.dock[id]).append(pel[id]);
  $$('.split').forEach(s => s.addEventListener('pointerdown', e => {
    const d = s.dataset.split as DockId, box = $('#dock-' + d), w = box.offsetWidth, hh = box.offsetHeight, sx = e.clientX, sy = e.clientY;
    s.setPointerCapture(e.pointerId);
    const mv = (v: PointerEvent) => {
      if (d === 'left') box.style.width = clamp(w + v.clientX - sx, 180, 640) + 'px';
      if (d === 'right') box.style.width = clamp(w - (v.clientX - sx), 200, 640) + 'px';
      if (d === 'bottom') box.style.height = clamp(hh - (v.clientY - sy), 110, 620) + 'px';
    };
    s.addEventListener('pointermove', mv);
    s.addEventListener('pointerup', () => s.removeEventListener('pointermove', mv), { once: true });
  }));
}
