/* Menus with submenus, toasts and dialogs. */
import { h, type ComponentChild } from 'preact';
import { $$, $maybe, clamp, drop, hit, raise } from './dom';
import { Dialog, Menu, Toast } from './popups.template';

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
  drop(popEl);
  popEl = null;
  $$('.tbtn.open').forEach(b => b.classList.remove('open'));
}

/* places a popup that is on the page at a point, kept inside the window; it is the popup a click outside it closes */
export function place(m: HTMLElement, x: number, y: number): void {
  popEl = m;
  const r = m.getBoundingClientRect();
  if (x + r.width * 2 > innerWidth) m.classList.add('flip');
  m.style.left = clamp(x, 6, innerWidth - r.width - 6) + 'px';
  m.style.top = clamp(y, 6, innerHeight - r.height - 6) + 'px';
}

export function menu(items: MenuEntry[], x: number, y: number): void {
  closePop();
  place(raise(h(Menu, { items, choose: item => { closePop(); item.on?.(); } })), x, y);
}

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
  drop($maybe('.toast'));
  const t: HTMLElement = raise(h(Toast, { message: msg, action: act, act: () => { drop(t); fn?.(); } }));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => drop(t), act ? 7000 : 3600);
}

/* a dialog with a form; fn gets the dialog when it is confirmed */
export function dialog(title: string, body: ComponentChild, ok: string, fn: (dlg: HTMLElement) => void): void {
  const v: HTMLElement = raise(h(Dialog, { title, body, ok, cancel: () => drop(v), confirm: () => { fn(v); drop(v); } }));
  $maybe('input', v)?.focus();
}

export function copy(text: string): void {
  const done = () => toast('Copied ' + text);
  try { navigator.clipboard.writeText(text).then(done, done); } catch { done(); }
}

/* a click outside a popup closes it, and so does Escape */
export function wirePopups(): void {
  addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target as Node) && !hit(e, '.tbtn.open')) closePop(); }, true);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closePop(); drop($maybe('.veil')); } });
}
