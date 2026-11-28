/* What a page shows when the storage does not answer while the page starts: there is nothing to draw the page from, so it says so and offers to try again. */
import { h } from 'preact';
import { Away } from './away.tsx';
import { raise } from './dom';
import { pageReady } from './nav';
import { reason } from './reason';

/* runs a page's start; when the storage cannot be reached, the page comes up with the notice instead */
export function startStored(start: () => Promise<void>): void {
  start().catch((e: unknown) => {
    const v = raise(h(Away, { why: reason(e), again: () => location.reload() }));
    pageReady();
    v.querySelector('button')!.focus();
  });
}
