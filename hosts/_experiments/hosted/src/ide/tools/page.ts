/* Designer: portal pages, shown as they will look. */
import { $, $$, esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { inspect } from '../open';
import { project } from '../storage';
import type { PageDocument, SectionType } from '../types';
import { tbar, waiting, type Tool } from './shared';

/* what each section of a page is called */
const BL: Record<SectionType, string> = { nav: 'Header', hero: 'Hero', cards: 'Card grid', map: 'Map', chart: 'Chart', form: 'Form', table: 'Table', footer: 'Footer', title: 'Heading', drop: 'Empty section' };

export const rPage: Tool = (d, x) => {
  const doc = project.content.doc<PageDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  /* a page nothing was written of yet is one empty section */
  const bs = doc?.sections ?? [{ type: 'drop' as const, html: '<div>Drag a component here.</div>', binding: 'Static', refresh: 'On load' }], components = doc?.components ?? [], from = doc?.from ?? '';
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${bs.length} sections</span><span class="sp"></span><div class="seg" id="pg-dev"><button class="on" data-w="880">Desktop</button><button data-w="620">Tablet</button><button data-w="360">Phone</button></div>`)}<div class="tbody"><div class="tbox"><h4>Components</h4>${components.map(k => `<div>${ico('puzzle', 'c-purple')}${esc(k)}</div>`).join('')}${from ? `<small>From ${esc(from)}</small>` : ''}</div><div class="pgwrap"><div class="pg" id="pg">${bs.map((s, i) => `<div class="bk ${s.type === 'footer' ? 'b-foot' : s.type === 'drop' ? 'b-drop' : s.type === 'nav' ? 'b-nav-w' : ''}" data-el="${i}"><span class="bl">${BL[s.type]}</span>${s.html}</div>`).join('')}</div></div></div></div>`;
  const page = $('#pg');
  $('#pg-dev').onclick = e => {
    const b = hit(e, 'button');
    if (!b) return;
    $$('#pg-dev button').forEach(k => k.classList.toggle('on', k === b));
    page.style.maxWidth = b.dataset.w + 'px';
  };
  page.onclick = e => {
    const b = hit(e, '.bk');
    if (!b) return;
    $$('.bk', d).forEach(k => k.classList.toggle('on', k === b));
    const at = Number(b.dataset.el), s = bs[at], name = BL[s.type];
    inspect({ icon: 'puzzle', title: name, sub: 'Section on ' + x.name, g: [['Component', [['Name', name], ['From', from], ['Position', (at + 1) + ' of ' + bs.length]]], ['Data', [['Binding', s.binding, s.unbound ? 1 : 0], ['Refresh', s.refresh]]], ['Layout', [['Width', 'Full'], ['Spacing', 'Comfortable'], ['Visible on', 'Desktop, tablet, phone']]]] });
  };
};
