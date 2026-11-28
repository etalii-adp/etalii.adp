/* Canvas mode: a card per child item on an infinite plane, with pan, zoom, drag and the tweens between levels. */
import { h } from 'preact';
import { $, $$, $maybe, clamp, draw, hit } from '../common/dom';
import { menu } from '../common/popups';
import { personal } from '../storage';
import { Canvas, type CanvasActions } from './canvas.tsx';
import { ctx } from './explorer';
import { byId, crumbsOf, inside } from './model';
import { openDoc, pick } from './open';
import { repaint } from './repaint';
import { keep, S } from './state';
import { project, refused } from './storage';
import { curve, curveL } from './tools/shared';
import type { Item, Point, View } from './types';

/* Tweens between canvas levels: zoom when going deeper or higher, a short move in the direction the two levels have on their shared ancestor's canvas, and both when the target sits in another branch. */
export type Tween = { k: 'in'; ox: number; oy: number } | { k: 'out'; id: string } | { k: 'move'; dx: number; dy: number; s: number };

const cardOf = (id: string, d: HTMLElement): HTMLElement | null => $maybe(`.card[data-id="${id}"],.en[data-id="${id}"]`, d);

/* works out the tween from one level to another; asked before the document area is drawn again, so it can still measure the card that is left */
export function tween(from: Item, to: Item, d: HTMLElement): Tween {
  const pa = crumbsOf(from), pb = crumbsOf(to);
  let i = 0;
  while (pa[i] && pa[i] === pb[i]) i++;
  const a = pa[i], b = pb[i], A = pa[i - 1];
  if (!a) { const r = cardOf(b.id, d)?.getBoundingClientRect(), o = d.getBoundingClientRect(); return { k: 'in', ox: r ? r.left + r.width / 2 - o.left : o.width / 2, oy: r ? r.top + r.height / 2 - o.top : o.height / 2 }; }
  if (!b) return { k: 'out', id: a.id };
  const levels = A.children || [], P = layoutOf(A), va = P[levels.indexOf(a)], vb = P[levels.indexOf(b)], dx = vb.x - va.x, dy = vb.y - va.y, len = Math.hypot(dx, dy) || 1;
  const dd = pb.length - pa.length;
  return { k: 'move', dx: dx / len, dy: dy / len, s: dd < 0 ? 1.6 : dd > 0 ? .55 : a !== from ? .8 : 1 };
}

/* plays a tween on what the document area shows now */
export function play(t: Tween, d: HTMLElement): void {
  const cv = $maybe('.cv', d) || $maybe('.surf', d);
  if (!cv) return;
  const o = cv.getBoundingClientRect();
  let f: Keyframe;
  if (t.k === 'in') { const q = d.getBoundingClientRect(); cv.style.transformOrigin = `${t.ox - (o.left - q.left)}px ${t.oy - (o.top - q.top)}px`; f = { transform: 'translate(0px,0px) scale(.5)', opacity: .1 }; }
  else if (t.k === 'out') { const r = cardOf(t.id, d)?.getBoundingClientRect() ?? o; cv.style.transformOrigin = `${r.left + r.width / 2 - o.left}px ${r.top + r.height / 2 - o.top}px`; f = { transform: 'translate(0px,0px) scale(1.9)', opacity: .1 }; }
  else { cv.style.transformOrigin = '50% 50%'; f = { transform: `translate(${t.dx * (t.s === 1 ? 90 : 140)}px,${t.dy * (t.s === 1 ? 90 : 140)}px) scale(${t.s})`, opacity: .15 }; }
  cv.animate([f, { transform: 'translate(0px,0px) scale(1)', opacity: 1 }], { duration: t.k !== 'move' ? 230 : t.s === 1 ? 210 : 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
}

/* where the cards of a level are before anyone moved them: the shared layout, the places of a model's entity types, or a grid */
function defaultLayout(L: Item): Point[] {
  const children = L.children || [], cols = children.length > 6 ? 4 : 3, placed = children.every(q => q.ex !== undefined), deep = children.some(q => q.children);
  return children.map((k, i) => L.shared?.get(k.id) ?? (k.ex !== undefined && placed ? { x: k.ex * 1.12, y: k.ey ?? 0 } : { x: i % cols * 270, y: Math.floor(i / cols) * (deep ? 215 : 150) }));
}
/* where the cards of a level are: where a person put them, and for the rest where they are by themselves */
const layoutOf = (L: Item): Point[] => { const places = defaultLayout(L); return (L.children || []).map((k, i) => L.own?.get(k.id) ?? places[i]); };

/* The canvas the document area shows: its level and the items on it, where each card is (a copy: a card that is dragged moves here, and its place is kept when it is let go), how far the plane is moved and zoomed, whether it is being moved now, and the arrows as they were last drawn. */
interface Live { d: HTMLElement; L: Item; items: readonly Item[]; pos: Point[]; V: View; panning: boolean; paths: string[] }
/* none while the document area shows something else; a canvas that is drawn afresh is another one */
let live: Live | null = null;

/* the arrows: the relations of a model between its entity types, or the flows of a level between its children, from card to card as large as the cards are on the page */
function edges({ d, L, items, pos }: Live): string[] {
  const cards = $$('.card', d);
  const pairs = (L.rels ?? L.flows ?? []).filter(r => items.includes(r[0]) && items.includes(r[1])).map((r): [number, number] => [items.indexOf(r[0]), items.indexOf(r[1])]);
  return pairs.filter(([a, b]) => cards[a] && cards[b]).map(([a, b]) => {
    const A = cards[a], B = cards[b], pa = pos[a], pb = pos[b];
    if (Math.abs(pa.x - pb.x) < 140) { const dn = pb.y > pa.y, x1 = pa.x + A.offsetWidth / 2, y1 = pa.y + (dn ? A.offsetHeight : 0), x2 = pb.x + B.offsetWidth / 2, y2 = pb.y + (dn ? -3 : B.offsetHeight + 3), dy = (y2 - y1) / 2; return `M${x1} ${y1}C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`; }
    return pb.x < pa.x ? curveL(pa.x, pa.y + A.offsetHeight / 2, pb.x + B.offsetWidth + 3, pb.y + B.offsetHeight / 2) : curve(pa.x + A.offsetWidth, pa.y + A.offsetHeight / 2, pb.x - 3, pb.y + B.offsetHeight / 2);
  });
}

/* Draws the canvas as it is now. The arrows follow from how large the cards turned out, so when they differ from the ones that were drawn, it is drawn once more with them. */
function paint(): void {
  const c = live;
  if (!c) return;
  const show = (): void => draw(c.d, h(Canvas, { key: c.L.id, level: c.L, items: c.items, at: c.pos, view: c.V, panning: c.panning, paths: c.paths, selected: S.sel, animated: S.anim, on }));
  show();
  const paths = edges(c);
  if (paths.join('|') !== c.paths.join('|')) { c.paths = paths; show(); }
}

/* shows the plane as it was moved or zoomed, and keeps that for the level */
function apply(c: Live): void {
  S.view[c.L.id] = c.V;
  keep();
  paint();
}
function fit(c: Live): void {
  const cards = $$('.card', c.d);
  if (!cards.length) { c.V = { x: 0, y: 0, k: 1 }; apply(c); return; }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  cards.forEach((cd, i) => { x0 = Math.min(x0, c.pos[i].x); y0 = Math.min(y0, c.pos[i].y); x1 = Math.max(x1, c.pos[i].x + cd.offsetWidth); y1 = Math.max(y1, c.pos[i].y + cd.offsetHeight); });
  const cv = $('.cv', c.d), W = cv.clientWidth, H = cv.clientHeight, k = clamp(Math.min((W - 70) / (x1 - x0), (H - 110) / (y1 - y0)), .3, 1);
  c.V = { k, x: (W - (x1 - x0) * k) / 2 - x0 * k, y: (H - (y1 - y0) * k) / 2 - y0 * k };
  apply(c);
}
/* zooms around a point of the canvas, or around its middle */
function zoom(c: Live, f: number, mx?: number, my?: number): void {
  const cv = $('.cv', c.d), x = mx ?? cv.clientWidth / 2, y = my ?? cv.clientHeight / 2, k = clamp(c.V.k * f, .25, 2);
  c.V = { k, x: x - (x - c.V.x) * k / c.V.k, y: y - (y - c.V.y) * k / c.V.k };
  S.viewOwn.add(c.L.id);
  apply(c);
}

/* what the pointer, the wheel, the keys and the buttons do on the canvas that shows */
const on: CanvasActions = {
  wheel: e => {
    const c = live;
    if (!c) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    zoom(c, Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top);
  },
  press: e => {
    const c = live;
    if (!c || e.button) return;
    const cv = e.currentTarget as HTMLElement, cd = hit(e, '.card'), sx = e.clientX, sy = e.clientY, i = cd ? Number(cd.dataset.i) : -1, o: Point = cd ? { ...c.pos[i] } : { x: c.V.x, y: c.V.y };
    let moved = false;
    cv.setPointerCapture(e.pointerId);
    const mv = (v: PointerEvent): void => {
      /* the canvas was drawn afresh under the pointer: what was being moved is no longer what shows */
      if (live !== c) { cv.removeEventListener('pointermove', mv); return; }
      const dx = v.clientX - sx, dy = v.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      if (cd) { c.pos[i] = { x: o.x + dx / c.V.k, y: o.y + dy / c.V.k }; paint(); }
      else { c.panning = true; c.V = { ...c.V, x: o.x + dx, y: o.y + dy }; S.viewOwn.add(c.L.id); apply(c); }
    };
    const up = (): void => {
      cv.removeEventListener('pointermove', mv);
      if (live !== c) return;
      if (c.panning) { c.panning = false; paint(); }
      if (!cd) return;
      if (moved) { project.levels.setLayout(c.L, new Map(c.items.map((k, j) => [k.id, c.pos[j]]))).then(() => { if (live === c) paint(); }, refused); return; }
      /* a second click on the same card within a moment goes into it */
      const k = byId(cd.dataset.id!), now = Date.now();
      if (!k) return;
      if (S.lastC === k.id && now - S.lastT < 450) { S.lastC = null; openDoc(k, k.children ? 'canvas' : 'editor'); }
      else { S.lastC = k.id; S.lastT = now; pick(k); }
    };
    cv.addEventListener('pointermove', mv);
    cv.addEventListener('pointerup', up, { once: true });
  },
  menu: e => {
    const c = live;
    if (!c) return;
    const cd = hit(e, '.card');
    e.preventDefault();
    const k = (cd && byId(cd.dataset.id!)) || c.L;
    if (cd) pick(k);
    menu(ctx(k), e.clientX, e.clientY);
  },
  key: e => {
    const L = live?.L;
    if (!L) return;
    if (e.key === 'Enter' && S.sel !== S.doc && inside(S.sel, L)) openDoc(S.sel, S.sel.children ? 'canvas' : 'editor');
    if (e.key === 'Backspace' && L.parent) openDoc(L.parent, 'canvas');
  },
  up: () => { const L = live?.L; if (L?.parent) openDoc(L.parent, 'canvas'); },
  animate: () => {
    S.anim = !S.anim;
    paint();
    personal.set({ anim: S.anim });
  },
  zoom: by => { if (live) zoom(live, by); },
  fit: () => { if (live) { S.viewOwn.delete(live.L.id); fit(live); } },
  shared: () => { const L = live?.L; if (L) project.levels.resetLayout(L).then(() => { delete S.view[L.id]; repaint('editor'); }, refused); },
};

/* Draws the canvas of a level afresh: the cards where the layout has them, and the plane where it was left, or so that every card fits. */
export function renderCanvas(d: HTMLElement, L: Item): void {
  const kept = S.view[L.id], c: Live = live = { d, L, items: L.children || [], pos: layoutOf(L).map(p => ({ ...p })), V: kept ?? { x: 0, y: 0, k: 1 }, panning: false, paths: [] };
  /* a view the user set by hand is left alone when only the window changed */
  S.cvFit = auto => { if (live === c && (!auto || !S.viewOwn.has(L.id))) fit(c); };
  if (kept) apply(c); else { paint(); fit(c); }
}
/* the document area shows something else from here on */
export function leaveCanvas(): void { live = null; }
/* shows the selected item as the marked card, on the canvas that shows */
export function markCanvas(): void { paint(); }
