/* What every page does when it starts: the ADP mark, the links and buttons that go to another page, and the popups. */
import { h } from 'preact';
import { $$, draw, el, hit } from './dom';
import { Mark, MarkAsPageIcon } from './icons.template';
import { go, wireNav } from './nav';
import type { PageName } from './pages';
import { toast, wirePopups } from './popups';

/* every .logo-slot on the page gets the mark at its data-size, and the browser tab gets it too */
function mountMark(): void {
  $$('.logo-slot').forEach(slot => { draw(slot, h(Mark, { size: slot.dataset.size ?? '24' })); });
  document.head.append(el(h(MarkAsPageIcon, null)));
}

export function startPage(): void {
  mountMark();
  wireNav();
  wirePopups();
  /* a button with data-go goes to that page; one with data-nyi names something that is not there yet */
  document.addEventListener('click', e => {
    const to = hit(e, '[data-go]');
    if (to) go(to.dataset.go as PageName);
    const ny = hit(e, '[data-nyi]');
    if (ny) toast(ny.dataset.nyi + ' is not available yet.');
  });
}
