/* Docks and tool windows: every panel can be shown, hidden and moved to another dock. */
import { $, $$, clamp, el, hit } from '../common/dom';
import { ico } from '../common/icons';
import { menu } from '../common/popups';
import { DOCK0, S } from './state';
import type { DockId, PanelId } from './types';

/* the tool windows: title and icon */
export const PAN: Record<PanelId, [title: string, icon: string]> = { explorer: ['Explorer', 'folder'], commit: ['Commit', 'commit'], properties: ['Properties', 'props'], problems: ['Problems', 'warning'], git: ['Git', 'branch'] };
export const panelIds = Object.keys(PAN) as PanelId[];
const docks: readonly DockId[] = ['left', 'right', 'bottom'];

const panel = (id: PanelId): HTMLElement => el(`<section class="panel" data-panel="${id}"><header class="ph"><b>${PAN[id][0]}</b><span data-pa style="display:flex;gap:2px"></span><button class="ib" data-pm title="Move or hide this tool window">${ico('more')}</button><button class="ib" data-hide title="Hide">${ico('minus')}</button></header><div class="pb"></div></section>`);
/* the element of each tool window */
export const pel = Object.fromEntries(panelIds.map(id => [id, panel(id)])) as Record<PanelId, HTMLElement>;
/* where a tool window draws its content */
export const body = (id: PanelId): HTMLElement => $('.pb', pel[id]);

export function layout(): void {
  for (const d of docks) { $('#dock-' + d).hidden = !S.act[d]; $(`[data-split="${d}"]`).hidden = !S.act[d]; }
  for (const id of panelIds) { const d = S.dock[id]; $('#dock-' + d).append(pel[id]); pel[id].hidden = S.act[d] !== id; }
  const sb = (id: PanelId) => `<button class="sb${S.act[S.dock[id]] === id ? ' on' : ''}" data-tw="${id}" title="${PAN[id][0]}" aria-label="${PAN[id][0]}">${ico(PAN[id][1])}</button>`;
  const ids = (d: DockId) => panelIds.filter(i => S.dock[i] === d).map(sb).join('');
  $('#stripe-l').innerHTML = `<div>${ids('left')}</div><div>${ids('bottom')}</div>`;
  $('#stripe-r').innerHTML = `<div>${ids('right')}</div>`;
  requestAnimationFrame(() => S.cvFit?.(true));
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
  const [dock, act] = JSON.parse(DOCK0) as [typeof S.dock, typeof S.act];
  S.dock = dock; S.act = act;
  for (const d of docks) { $('#dock-' + d).style.width = ''; $('#dock-' + d).style.height = ''; }
  layout();
}

/* puts the tool windows in their docks, and wires their buttons, the stripes and the splitters */
export function mountDocks(): void {
  for (const id of panelIds) {
    $('[data-hide]', pel[id]).onclick = () => toggle(id);
    $('[data-pm]', pel[id]).onclick = e => {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      menu([{ h: 'Move ' + PAN[id][0] + ' to' }, ...docks.map(d => ({ l: d[0].toUpperCase() + d.slice(1), chk: S.dock[id] === d, on: () => move(id, d) })), '-', { l: 'Hide', on: () => toggle(id) }], r.left - 120, r.bottom + 3);
    };
    $('#dock-' + S.dock[id]).append(pel[id]);
  }
  document.addEventListener('click', e => { const b = hit(e, '[data-tw]'); if (b) toggle(b.dataset.tw as PanelId); });
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
