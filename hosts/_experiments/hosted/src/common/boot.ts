/* Runs in the head of every page, before the first paint. It applies the theme, font size and density chosen in the IDE's settings, and works out how this page was reached, so the style sheets can turn the page in from the right side. */
import { fromKey, here, pageOf, pages, seenKey, type PageName } from './pages';
import { applyPrefs } from './prefs';

applyPrefs();

const root = document.documentElement;
let from: PageName | null = null;
try { from = (sessionStorage.getItem(fromKey) || null) as PageName | null; sessionStorage.setItem(fromKey, ''); } catch { /* no session storage: the page turns in the forward way */ }
/* true when this page was reached from another of these pages */
const came = !!from;
const leftUrl = window.navigation?.activation?.from?.url;
if (leftUrl) from = pageOf(leftUrl);
if (from && pages.indexOf(from) > pages.indexOf(here)) root.classList.add('back');

/* a browser that runs a view transition between the two documents does the turn itself, so the page's own turn-in stays off; whether it did is remembered, so the next page knows if it has to turn out by itself */
addEventListener('pagereveal', e => {
  if (e.viewTransition) root.classList.add('vt');
  if (came) try { sessionStorage.setItem(seenKey, e.viewTransition ? 'yes' : 'no'); } catch { /* nothing to remember it in */ }
});
/* a page that comes back from the back/forward cache is shown as it was left */
addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('leaving'); root.classList.add('ready'); } });
/* a page shows itself once its scripts have drawn it (pageReady in nav.ts); should a script fail, it still shows */
addEventListener('load', () => setTimeout(() => root.classList.add('ready'), 60));
