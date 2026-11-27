/* Menus with submenus, toasts and dialogs. */
import { $, $$, $maybe, clamp, el, esc, hit } from './dom';
import { ico } from './icons';

/* One line of a menu: its label, and optionally a shortcut (k), an icon (i), a check mark (chk), a submenu (sub) and what choosing it does (on). d disables it; when d is a text, the text says why. */
export interface MenuItem {
  l: string;
  k?: string;
  i?: string;
  chk?: boolean;
  d?: string | boolean | null;
  sub?: MenuEntry[];
  on?: () => void;
}
/* a menu also takes a heading ({h}), a separator ('-'), and nothing at all where a line does not apply */
export type MenuEntry = MenuItem | { h: string } | '-' | false | null | undefined;

let popEl: HTMLElement | null = null;

export function closePop(): void {
  popEl?.remove();
  popEl = null;
  $$('.tbtn.open').forEach(b => b.classList.remove('open'));
}

function buildMenu(items: MenuEntry[]): HTMLElement {
  const m = el('<div class="menu" role="menu"></div>');
  for (const it of items) {
    if (!it) continue;
    if (it === '-') { m.append(el('<div class="msep"></div>')); continue; }
    if ('h' in it) { m.append(el(`<div class="mhead">${esc(it.h)}</div>`)); continue; }
    const dis = !!it.d, why = typeof it.d === 'string' ? it.d : null;
    const b = el(`<button class="mi${dis ? ' dis' : ''}" role="menuitem"><span class="lead">${it.chk ? ico('check') : it.i ? ico(it.i) : ''}</span><span>${esc(it.l)}</span>${why ? `<span class="why">${esc(why)}</span>` : it.k ? `<kbd>${it.k}</kbd>` : ''}${it.sub && !dis ? ico('chev', 'more') : ''}</button>`);
    if (why) b.title = why;
    if (it.sub && !dis) {
      b.append(buildMenu(it.sub));
      b.addEventListener('click', e => {
        if (hit(e, '.menu') !== m) return;
        e.stopPropagation();
        $$('.mi.open', m).forEach(o => { if (o !== b) o.classList.remove('open'); });
        b.classList.toggle('open');
      });
    } else b.addEventListener('click', e => { e.stopPropagation(); if (dis) return; closePop(); it.on?.(); });
    m.append(b);
  }
  return m;
}

/* puts a popup on the page at a point, kept inside the window */
export function place(m: HTMLElement, x: number, y: number): void {
  document.body.append(m);
  popEl = m;
  const r = m.getBoundingClientRect();
  if (x + r.width * 2 > innerWidth) m.classList.add('flip');
  m.style.left = clamp(x, 6, innerWidth - r.width - 6) + 'px';
  m.style.top = clamp(y, 6, innerHeight - r.height - 6) + 'px';
}

export function menu(items: MenuEntry[], x: number, y: number): void { closePop(); place(buildMenu(items), x, y); }

/* the menu of a button, under it; a second click on the button closes it */
export function menuAt(btn: HTMLElement, items: MenuEntry[]): void {
  const was = btn.classList.contains('open');
  closePop();
  if (was) return;
  const r = btn.getBoundingClientRect();
  menu(items, r.left, r.bottom + 3);
  btn.classList.add('open');
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/* a short message at the bottom of the page, with one action when act and fn are given */
export function toast(msg: string, act?: string, fn?: () => void): void {
  $maybe('.toast')?.remove();
  const t = el(`<div class="toast" role="status"><span>${esc(msg)}</span>${act ? `<button>${esc(act)}</button>` : ''}</div>`);
  if (act) $('button', t).onclick = () => { t.remove(); fn?.(); };
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), act ? 7000 : 3600);
}

/* a dialog with a form; fn gets the dialog when it is confirmed */
export function dialog(title: string, body: string, ok: string, fn: (dlg: HTMLElement) => void): void {
  const v = el(`<div class="veil"><form class="dlg"><h2>${esc(title)}</h2>${body}<div class="acts"><button type="button" class="btn" data-x>Cancel</button><button class="btn pri">${esc(ok)}</button></div></form></div>`);
  $('[data-x]', v).onclick = () => v.remove();
  $('form', v).onsubmit = e => { e.preventDefault(); fn(v); v.remove(); };
  document.body.append(v);
  $maybe('input', v)?.focus();
}

export function copy(text: string): void {
  const done = () => toast('Copied ' + text);
  try { navigator.clipboard.writeText(text).then(done, done); } catch { done(); }
}

/* a click outside a popup closes it, and so does Escape */
export function wirePopups(): void {
  addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target as Node) && !hit(e, '.tbtn.open')) closePop(); }, true);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closePop(); $maybe('.veil')?.remove(); } });
}
