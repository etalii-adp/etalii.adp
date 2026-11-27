/* Small DOM helpers every script uses. */

/* the one element a selector names; a page that lacks it is a mistake in the page, and the error says which selector */
export const $ = <T extends Element = HTMLElement>(selector: string, within: ParentNode = document): T => {
  const found = within.querySelector<T>(selector);
  if (!found) throw new Error(`No element matches ${selector}`);
  return found;
};
/* the same, for an element that is not always there */
export const $maybe = <T extends Element = HTMLElement>(selector: string, within: ParentNode = document): T | null => within.querySelector<T>(selector);
export const $$ = <T extends Element = HTMLElement>(selector: string, within: ParentNode = document): T[] => [...within.querySelectorAll<T>(selector)];
/* the element an event happened in or under, by selector */
export const hit = <T extends Element = HTMLElement>(e: Event, selector: string): T | null => e.target instanceof Element ? e.target.closest<T>(selector) : null;
export const el = <T extends Element = HTMLElement>(html: string): T => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as T;
};
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, ch => entities[ch]);
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
