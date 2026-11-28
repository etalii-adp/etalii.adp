/* Small DOM helpers every script uses. What is drawn comes from a template file (.tsx) as Preact components; draw, el and raise are the ways it reaches the page. */
import { render, type ComponentChild } from 'preact';

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

/* The field somebody is typing in: it was typed in since it got the focus, and what was typed was not handed over yet. */
type Field = HTMLInputElement | HTMLTextAreaElement;
let typing: Field | null = null;
if (typeof document !== 'undefined') {
  document.addEventListener('input', e => { const t = e.target; typing = t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && !/^(checkbox|radio|range|file|color)$/.test(t.type)) ? t : null; }, true);
  for (const over of ['change', 'focusout']) document.addEventListener(over, () => { typing = null; }, true);
}

/* Draws what an element holds. Drawn again, only what differs from the last time changes on the page: an element that is still there keeps its focus and where it was scrolled to. A field somebody is typing in keeps what was typed as well, and the place in it, whatever the page has for it by now: what was typed is taken or dropped when the field is left, and not while it is drawn again around the one who types. */
export const draw = (target: Element, what: ComponentChild): void => {
  const field = typing && target.contains(typing) ? typing : null, held = field && { value: field.value, from: field.selectionStart, to: field.selectionEnd, way: field.selectionDirection };
  render(what, target);
  if (!field || !held || document.activeElement !== field || field.value === held.value) return;
  field.value = held.value;
  if (held.from !== null) field.setSelectionRange(held.from, held.to, held.way ?? undefined);
};

/* The element a component stands for, made but not yet on the page. It is drawn once: the page puts it where it belongs, and nothing draws it again. */
export const el = <T extends Element = HTMLElement>(what: ComponentChild): T => {
  const made = document.createDocumentFragment();
  render(what, made);
  return made.firstElementChild as T;
};

/* What draws a popup: Preact draws into it as into an element, and what it draws lands at the end of the page, beside what is there. */
interface Layer { nodeType: 1; namespaceURI: string | null; ownerDocument: Document; firstChild: null; childNodes: Node[]; insertBefore(node: Node, before: Node | null): Node }
const layers = new WeakMap<Element, Layer>();
const layer = (): Layer => ({ nodeType: 1, namespaceURI: document.body.namespaceURI, ownerDocument: document, firstChild: null, childNodes: [], insertBefore: (node, before) => document.body.insertBefore(node, before) });

/* Puts a popup, a component with one element, at the end of the page and gives its element. The component may draw itself again while it is there. */
export const raise = <T extends Element = HTMLElement>(what: ComponentChild): T => {
  const into = layer();
  render(what, into as unknown as Element);
  const made = document.body.lastElementChild as T;
  layers.set(made, into);
  return made;
};
/* draws a popup again, in place */
export const redraw = (popup: Element, what: ComponentChild): void => { const into = layers.get(popup); if (into) render(what, into as unknown as Element); };
/* takes a popup, or any element, off the page */
export const drop = (popup: Element | null | undefined): void => {
  if (!popup) return;
  const into = layers.get(popup);
  if (into) { layers.delete(popup); render(null, into as unknown as Element); }
  popup.remove();
};

/* A text as the text of HTML. Only for what is kept or made as HTML and handed to an element as that: the lines of the highlighter, and a section of a page as the storage keeps it. Everything else is drawn by a template, which needs no escaping. */
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, ch => entities[ch]);
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
