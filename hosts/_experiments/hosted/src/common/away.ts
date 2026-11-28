/* What a page shows when the storage does not answer while the page starts: there is nothing to draw the page from, so it says so and offers to try again. */
import { el, esc } from './dom';
import { pageReady } from './nav';
import { reason } from './reason';

/* runs a page's start; when the storage cannot be reached, the page comes up with the notice instead */
export function startStored(start: () => Promise<void>): void {
  start().catch((e: unknown) => {
    const why = reason(e);
    const v = el(`<div class="veil"><form class="dlg" role="alertdialog" aria-labelledby="away-t"><h2 id="away-t">No connection to the storage</h2><p style="margin:0;color:var(--muted)">${esc(why)} What this page shows is kept there, so there is nothing to show yet.</p><div class="acts"><button class="btn pri">Try Again</button></div></form></div>`);
    v.querySelector('form')!.onsubmit = submit => { submit.preventDefault(); location.reload(); };
    document.body.append(v);
    pageReady();
    v.querySelector('button')!.focus();
  });
}
