/* What every page does when it starts: the ADP mark, the links and buttons that go to another page, and the popups. */
import { hit } from './dom';
import { mountMark } from './icons';
import { go, wireNav } from './nav';
import type { PageName } from './pages';
import { toast, wirePopups } from './popups';
import { Refused, Unreachable } from '../storage';

/* the reason the storage gave for not doing something, in words for the user; anything else is a fault of the page and is thrown on */
export const reason = (e: unknown): string => { if (e instanceof Refused || e instanceof Unreachable) return e.message; throw e; };

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
