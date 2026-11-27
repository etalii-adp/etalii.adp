/* Going from one page to another without a hard cut. Where the browser runs a view transition between two documents (transitions.css asks for it), a link simply navigates. Elsewhere the page turns out before it leaves and the next one turns in. */
import { hit } from './dom';
import { base, fromKey, here, pageOf, pages, seenKey, type PageName } from './pages';
import { closePop } from './popups';

const pageUrl = (page: PageName): string => base + (page === 'start' ? '' : page + '/') + 'index.html';
/* the browser knows view transitions between documents, and the last arrival did not show otherwise (boot.ts) */
const smooth = 'CSSViewTransitionRule' in window && (() => { try { return sessionStorage.getItem(seenKey) !== 'no'; } catch { return true; } })();
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

function leave(url: string): void {
  try { sessionStorage.setItem(fromKey, here); } catch { /* the next page turns in the forward way */ }
  if (smooth || still) { location.href = url; return; }
  const r = document.documentElement;
  r.classList.toggle('back', pages.indexOf(pageOf(url)) < pages.indexOf(here));
  r.classList.add('leaving');
  setTimeout(() => { location.href = url; }, 200);
}

export function go(page: PageName): void {
  if (page === here) return;
  closePop();
  leave(pageUrl(page));
}

/* a page calls this once it has drawn itself */
export function pageReady(): void { document.documentElement.classList.add('ready'); }

/* links between the pages carry data-nav */
export function wireNav(): void {
  document.addEventListener('click', e => {
    const a = hit<HTMLAnchorElement>(e, 'a[data-nav]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (pageOf(a.href) !== here) leave(a.href);
  });
}
