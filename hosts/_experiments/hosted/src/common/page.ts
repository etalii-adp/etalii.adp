/* What every page does when it starts: the ADP mark, the links and buttons that go to another page, and the popups. */
import { hit } from './dom';
import { mountMark } from './icons';
import { go, wireNav } from './nav';
import type { PageName } from './pages';
import { toast, wirePopups } from './popups';

/* what a project other than Atlas Platform answers */
export const only = (): void => toast('Only Atlas Platform is available on this computer.');

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
