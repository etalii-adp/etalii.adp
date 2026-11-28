/* Canvas mode: a card per child item on an infinite plane, with pan, zoom, drag and the tweens between levels. */
import { $, $$, $maybe, clamp, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { menu } from '../common/popups';
import { ctx } from './explorer';
import { K } from './kinds';
import { personal } from '../storage';
import { byId, crumbsOf, inside } from './model';
import { openDoc, pick } from './open';
import { repaint } from './repaint';
import { sev } from './severity';
import { keep, S } from './state';
import { project, refused } from './storage';
import { ARROW, curve, curveL } from './tools/shared';
import type { Item, Point, ToolName, View } from './types';

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

/* the small picture on the card of an item, by its tool */
const THUMB: Partial<Record<ToolName, string>> & { doc: string } = {
  flow: '<rect x="4" y="12" width="40" height="16" rx="3"/><rect x="76" y="12" width="40" height="16" rx="3"/><rect x="148" y="12" width="40" height="16" rx="3"/><path d="M44 20h32M116 20h32"/>',
  onto: '<rect x="8" y="2" width="46" height="14" rx="3"/><rect x="134" y="2" width="46" height="14" rx="3"/><rect x="70" y="24" width="46" height="14" rx="3"/><path d="M54 9h80M40 16l40 8M150 16l-40 8"/>',
  page: '<rect x="4" y="2" width="184" height="8" rx="2"/><rect x="4" y="15" width="184" height="12" rx="2"/><rect x="4" y="32" width="56" height="8" rx="2"/><rect x="68" y="32" width="56" height="8" rx="2"/><rect x="132" y="32" width="56" height="8" rx="2"/>',
  dash: '<path d="M4 36l30-16 30 8 34-22 30 12 30-10 30 6"/><path d="M4 39h184" opacity=".5"/>',
  form: '<path d="M4 6h40M60 6h128M4 20h40M60 20h128M4 34h40M60 34h80"/>',
  schema: '<path d="M4 3h184v36H4zM4 15h184M4 27h184M70 3v36M130 3v36"/>',
  check: '<path d="M6 8l4 4 7-8M28 8h150M6 22l4 4 7-8M28 22h120M8 34h6M28 36h140"/>',
  doc: '<path d="M4 5h90M4 15h184M4 24h170M4 33h120"/>',
  code: '<path d="M4 5h60M20 14h120M20 23h90M4 32h40"/>',
};

/* where the cards of a level are before anyone moved them: the shared layout, the places of a model's entity types, or a grid */
function defaultLayout(L: Item): Point[] {
  const children = L.children || [], cols = children.length > 6 ? 4 : 3, placed = children.every(q => q.ex !== undefined), deep = children.some(q => q.children);
  return children.map((k, i) => L.shared?.get(k.id) ?? (k.ex !== undefined && placed ? { x: k.ex * 1.12, y: k.ey ?? 0 } : { x: i % cols * 270, y: Math.floor(i / cols) * (deep ? 215 : 150) }));
}
/* where the cards of a level are: where a person put them, and for the rest where they are by themselves */
const layoutOf = (L: Item): Point[] => { const places = defaultLayout(L); return (L.children || []).map((k, i) => L.own?.get(k.id) ?? places[i]); };

export function renderCanvas(d: HTMLElement, L: Item): void {
  const children = L.children || [];
  /* a copy: a card that is dragged moves here, and its place is kept when it is let go */
  const pos = layoutOf(L).map(p => ({ ...p }));
  const card = (k: Item, i: number): string => {
    const sv = sev(k), t = K[k.kind];
    return `<div class="card${S.sel === k ? ' on' : ''}" data-id="${k.id}" data-i="${i}" style="left:${pos[i].x}px;top:${pos[i].y}px"><div class="ch">${ico(k.icon || t.icon, 'c-' + t.colour)}<b class="${k.vcs ? 'nm v' + k.vcs : ''}">${esc(k.name)}</b>${sv ? `<span class="dot ${sv}"></span>` : ''}</div><div class="ck">${t.label}${k.children ? ' · ' + k.children.length + ' items' : ''}${k.link ? `<span class="ref">${ico('link')}${esc(k.link.ref)}</span>` : ''}</div>${k.children ? `<ul>${k.children.slice(0, 5).map(q => `<li>${ico(q.icon || K[q.kind].icon, 'c-' + K[q.kind].colour)}${esc(q.name)}</li>`).join('')}${k.children.length > 5 ? `<li class="more">and ${k.children.length - 5} more</li>` : ''}${k.children.length ? '' : '<li class="more">Empty</li>'}</ul>` : k.attrs ? `<ul>${k.attrs.slice(0, 4).map(a => `<li class="mono">${esc(a)}</li>`).join('')}${k.attrs.length > 4 ? `<li class="more">and ${k.attrs.length - 4} more</li>` : ''}${k.attrs.length ? '' : '<li class="more">No attributes yet</li>'}</ul>` : `<div class="th"><svg viewBox="0 0 192 42" preserveAspectRatio="xMinYMid meet">${(t.tool && THUMB[t.tool]) || THUMB.doc}</svg></div>`}</div>`;
  };
  d.innerHTML = `<div class="cv" tabindex="0" aria-label="Canvas of ${esc(L.name)}"><div class="plane"><svg>${ARROW}<g id="cv-e"></g></svg>${children.map(card).join('')}</div>${children.length ? '' : `<div class="hint" style="position:absolute;inset:0;display:grid;place-items:center">${esc(L.name)} is empty. Right-click it in the Explorer and choose New.</div>`}</div>
   <div class="cv-tl"><button class="ib" id="cv-up" title="Up one level" ${L.parent ? '' : 'disabled'}>${ico('up')}</button><span>${esc(L.name)}</span></div>
   <div class="cv-bl" id="cv-note" hidden></div>
   <div class="cv-br"><button class="ib${S.anim ? ' on' : ''}" id="cv-an" title="Animate moving between levels: a short zoom when going deeper or higher, a short slide between neighbours" aria-pressed="${S.anim}">${ico('motion')}</button><button class="ib" id="cv-out" title="Zoom out">${ico('minus')}</button><span class="zl" id="cv-z"></span><button class="ib" id="cv-in" title="Zoom in">${ico('plus')}</button><button class="tbtn" style="height:24px" id="cv-fit">Fit</button></div>`;
  const cv = $('.cv', d), plane = $('.plane', d), cards = $$('.card', d), kept = S.view[L.id];
  let V: View = kept ?? { x: 0, y: 0, k: 1 };

  const note = (): void => {
    /* nothing is said of a layout that is the shared one: the note is there only with the way back to it */
    const el = $('#cv-note');
    el.hidden = !L.own;
    el.innerHTML = L.own ? `Your own layout, saved in .user.adp. <button id="cv-reset">Use shared layout</button>` : '';
    const reset = $maybe('#cv-reset');
    if (reset) reset.onclick = () => { project.levels.resetLayout(L).then(() => { delete S.view[L.id]; repaint('editor'); }, refused); };
  };
  /* the arrows: the relations of a model between its entity types, or the flows of a level between its children */
  const edges = (): void => {
    const pairs = (L.rels ?? L.flows ?? []).filter(r => children.includes(r[0]) && children.includes(r[1])).map((r): [number, number] => [children.indexOf(r[0]), children.indexOf(r[1])]);
    $<SVGGElement>('#cv-e', d).innerHTML = pairs.filter(([a, b]) => cards[a] && cards[b]).map(([a, b]) => {
      const A = cards[a], B = cards[b], pa = pos[a], pb = pos[b];
      if (Math.abs(pa.x - pb.x) < 140) { const dn = pb.y > pa.y, x1 = pa.x + A.offsetWidth / 2, y1 = pa.y + (dn ? A.offsetHeight : 0), x2 = pb.x + B.offsetWidth / 2, y2 = pb.y + (dn ? -3 : B.offsetHeight + 3), dy = (y2 - y1) / 2; return `<path marker-end="url(#ar)" d="M${x1} ${y1}C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}"/>`; }
      return `<path marker-end="url(#ar)" d="${pb.x < pa.x ? curveL(pa.x, pa.y + A.offsetHeight / 2, pb.x + B.offsetWidth + 3, pb.y + B.offsetHeight / 2) : curve(pa.x + A.offsetWidth, pa.y + A.offsetHeight / 2, pb.x - 3, pb.y + B.offsetHeight / 2)}"/>`;
    }).join('');
  };
  const apply = (): void => {
    plane.style.transform = `translate(${V.x}px,${V.y}px) scale(${V.k})`;
    cv.style.backgroundSize = `${24 * V.k}px ${24 * V.k}px`;
    cv.style.backgroundPosition = `${V.x}px ${V.y}px`;
    $('#cv-z').textContent = Math.round(V.k * 100) + '%';
    S.view[L.id] = V;
    keep();
  };
  const fit = (): void => {
    if (!cards.length) { V = { x: 0, y: 0, k: 1 }; return apply(); }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    cards.forEach((cd, i) => { x0 = Math.min(x0, pos[i].x); y0 = Math.min(y0, pos[i].y); x1 = Math.max(x1, pos[i].x + cd.offsetWidth); y1 = Math.max(y1, pos[i].y + cd.offsetHeight); });
    const W = cv.clientWidth, H = cv.clientHeight, k = clamp(Math.min((W - 70) / (x1 - x0), (H - 110) / (y1 - y0)), .3, 1);
    V = { k, x: (W - (x1 - x0) * k) / 2 - x0 * k, y: (H - (y1 - y0) * k) / 2 - y0 * k };
    apply();
  };
  /* a view the user set by hand is left alone when only the window changed */
  S.cvFit = auto => { if (!auto || !S.viewOwn.has(L.id)) fit(); };
  edges(); note();
  if (kept) apply(); else fit();
  const zoom = (f: number, mx = cv.clientWidth / 2, my = cv.clientHeight / 2): void => { const k = clamp(V.k * f, .25, 2); V = { k, x: mx - (mx - V.x) * k / V.k, y: my - (my - V.y) * k / V.k }; S.viewOwn.add(L.id); apply(); };

  const anim = $('#cv-an');
  anim.onclick = () => {
    S.anim = !S.anim;
    anim.classList.toggle('on', S.anim);
    anim.setAttribute('aria-pressed', String(S.anim));
    personal.set({ anim: S.anim });
  };
  $('#cv-in').onclick = () => zoom(1.2);
  $('#cv-out').onclick = () => zoom(1 / 1.2);
  $('#cv-fit').onclick = () => { S.viewOwn.delete(L.id); fit(); };
  $('#cv-up').onclick = () => { if (L.parent) openDoc(L.parent, 'canvas'); };
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoom(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  cv.addEventListener('pointerdown', e => {
    if (e.button) return;
    const cd = hit(e, '.card'), sx = e.clientX, sy = e.clientY, i = cd ? Number(cd.dataset.i) : -1, o: Point = cd ? { ...pos[i] } : { x: V.x, y: V.y };
    let moved = false;
    cv.setPointerCapture(e.pointerId);
    const mv = (v: PointerEvent): void => {
      const dx = v.clientX - sx, dy = v.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      if (cd) { pos[i] = { x: o.x + dx / V.k, y: o.y + dy / V.k }; cd.style.left = pos[i].x + 'px'; cd.style.top = pos[i].y + 'px'; edges(); }
      else { cv.classList.add('pan'); V = { ...V, x: o.x + dx, y: o.y + dy }; S.viewOwn.add(L.id); apply(); }
    };
    const up = (): void => {
      cv.removeEventListener('pointermove', mv);
      cv.classList.remove('pan');
      if (!cd) return;
      if (moved) { project.levels.setLayout(L, new Map(children.map((k, j) => [k.id, pos[j]]))).then(note, refused); return; }
      /* a second click on the same card within a moment goes into it */
      const k = byId(cd.dataset.id!), now = Date.now();
      if (!k) return;
      if (S.lastC === k.id && now - S.lastT < 450) { S.lastC = null; openDoc(k, k.children ? 'canvas' : 'editor'); }
      else { S.lastC = k.id; S.lastT = now; pick(k); }
    };
    cv.addEventListener('pointermove', mv);
    cv.addEventListener('pointerup', up, { once: true });
  });
  cv.addEventListener('contextmenu', e => {
    const cd = hit(e, '.card');
    e.preventDefault();
    const k = (cd && byId(cd.dataset.id!)) || L;
    if (cd) pick(k);
    menu(ctx(k), e.clientX, e.clientY);
  });
  cv.addEventListener('keydown', e => {
    if (e.key === 'Enter' && S.sel !== S.doc && inside(S.sel, L)) openDoc(S.sel, S.sel.children ? 'canvas' : 'editor');
    if (e.key === 'Backspace' && L.parent) openDoc(L.parent, 'canvas');
  });
}
