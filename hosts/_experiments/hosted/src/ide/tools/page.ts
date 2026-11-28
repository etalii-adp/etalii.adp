/* Designer: portal pages, shown as they will look. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { inspect } from '../open';
import { project } from '../storage';
import type { Item, PageDocument } from '../types';
import { Page } from './page.template';
import { waiting, type Tool } from './shared';

/* the width the page is looked at in, once one was chosen, and the section that was clicked, by its place; a page that is drawn afresh starts without either */
let width: number | null = null, picked = -1;

function paint(d: HTMLElement, x: Item): void {
  const doc = project.content.doc<PageDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  /* a page nothing was written of yet is one empty section */
  const bs = doc?.sections ?? [{ type: 'drop' as const, name: 'Empty section', html: '<div>Drag a component here.</div>', binding: 'Static', refresh: 'On load' }], components = doc?.components ?? [], from = doc?.from ?? '';
  /* a click on a section marks it and shows it in the Properties */
  const pick = (at: number): void => {
    const s = bs[at], name = s.name;
    picked = at;
    paint(d, x);
    inspect({ icon: 'puzzle', title: name, sub: 'Section on ' + x.name, g: [['Component', [['Name', name], ['From', from], ['Position', (at + 1) + ' of ' + bs.length]]], ['Data', [['Binding', s.binding, s.unbound ? 1 : 0], ['Refresh', s.refresh]]], ['Layout', [['Width', 'Full'], ['Spacing', 'Comfortable'], ['Visible on', 'Desktop, tablet, phone']]]] });
  };
  draw(d, h(Page, { key: x.id, item: x, sections: bs, components, from, width, picked, setWidth: w => { width = w; paint(d, x); }, pick }));
}

export const rPage: Tool = (d, x) => { width = null; picked = -1; paint(d, x); };
