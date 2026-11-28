/* The pages, in the order a visit runs, and what a script needs to know of the page it is on. */

export type PageName = 'start' | 'login' | 'projects' | 'ide';

/* going to an earlier page turns the other way */
export const pages: readonly PageName[] = ['start', 'login', 'projects', 'ide'];

const root = document.documentElement;
export const here = root.dataset.page as PageName;
/* the way from this page to the folder the start page is in, as its data-root says */
export const base = root.dataset.root ?? '';

export const pageOf = (url: string): PageName => {
  const m = /\/(login|projects|ide)\/(?:index\.html)?(?:[?#].*)?$/.exec(url);
  return m ? m[1] as PageName : 'start';
};
