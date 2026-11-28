/* What menus, toasts and dialogs look like, and what a click in one of them does. */
import type { ComponentChild, VNode } from 'preact';
import { useState } from 'preact/hooks';
import { hit } from './dom';
import { ico } from './icons.template';
import type { MenuEntry, MenuItem } from './popups';

/* one line of a menu; a line with a submenu shows it while it is open */
const MenuLine = ({ item, open, toggle, choose }: { item: MenuItem; open: boolean; toggle: () => void; choose: (item: MenuItem) => void }): VNode => {
  const disabled = !!item.d, why = typeof item.d === 'string' ? item.d : null, sub = item.sub && !disabled ? item.sub : null;
  return <button class={'mi' + (disabled ? ' dis' : '') + (open ? ' open' : '')} role="menuitem" title={why ?? undefined} onClick={e => {
    /* a click in the submenu is not a click on the line that holds it */
    if (sub && hit(e, '.menu') !== e.currentTarget.parentElement) return;
    e.stopPropagation();
    if (sub) toggle(); else if (!disabled) choose(item);
  }}>
    <span class="lead">{item.chk ? ico('check') : item.i ? ico(item.i) : ''}</span>
    <span>{item.l}</span>
    {why ? <span class="why">{why}</span> : item.k ? <kbd>{item.k}</kbd> : ''}
    {sub ? ico('chev', 'more') : ''}
    {sub ? <Menu items={sub} choose={choose} /> : ''}
  </button>;
};

/* a menu: lines, headings and separators; one submenu is open at a time */
export const Menu = ({ items, choose }: { items: readonly MenuEntry[]; choose: (item: MenuItem) => void }): VNode => {
  const [open, setOpen] = useState(-1);
  return <div class="menu" role="menu">
    {items.map((it, i) => !it ? '' : it === '-' ? <div class="msep"></div> : 'h' in it ? <div class="mhead">{it.h}</div>
      : <MenuLine item={it} open={open === i} toggle={() => setOpen(open === i ? -1 : i)} choose={choose} />)}
  </div>;
};

/* a short message at the bottom of the page, with one action when there is one */
export const Toast = ({ message, action, act }: { message: string; action?: string; act: () => void }): VNode =>
  <div class="toast" role="status"><span>{message}</span>{action ? <button onClick={act}>{action}</button> : ''}</div>;

/* a dialog with a form around its body */
export const Dialog = ({ title, body, ok, cancel, confirm }: { title: string; body: ComponentChild; ok: string; cancel: () => void; confirm: () => void }): VNode =>
  <div class="veil">
    <form class="dlg" onSubmit={e => { e.preventDefault(); confirm(); }}>
      <h2>{title}</h2>
      {body}
      <div class="acts"><button type="button" class="btn" data-x="" onClick={cancel}>Cancel</button><button class="btn pri">{ok}</button></div>
    </form>
  </div>;
