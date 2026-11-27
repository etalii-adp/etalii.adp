/* Designer: one entity type of an ontology model, with its attributes and relations. */
import { $$, esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { BY, find, ro } from '../model';
import { openDoc, pick } from '../open';
import { repaint } from '../repaint';
import { tbar, touch, type Tool } from './shared';

const TYPES = ['text', 'int', 'decimal', 'date', 'datetime', 'boolean', 'enum', 'geo', 'kV', 'A', 'kVA', 'EUR'];
/* an attribute is kept as "name: type" */
const splitAttr = (a: string): [name: string, type: string] => { const i = a.indexOf(': '); return i < 0 ? [a, 'text'] : [a.slice(0, i), a.slice(i + 2)]; };

export const rEntity: Tool = (d, x) => {
  const O = x.parent!, siblings = O.children || [], attrs = x.attrs ?? (x.attrs = []), req = x.req ?? (x.req = attrs.map((_, i) => i < 2));
  const lock = ro(x) || x.ext ? ' disabled' : '', rels = (O.rels || []).filter(r => (r[0] === x || r[1] === x) && siblings.includes(r[0]) && siblings.includes(r[1]));
  const src = x.ext ? find(x.ext) : undefined, orig = src && (src.children || []).find(k => k.name === x.name && !k.ext);
  d.innerHTML = `<div class="tool">${tbar(x, `<span>${attrs.length} attributes · in ${esc(O.name)}</span>${x.ext ? `<span class="chip">${ico('link')}Reference to ${esc(x.ext)}</span>` : ''}<span class="sp"></span><button class="btn" style="height:24px" id="e-dia">${ico('graph', 'c-purple')}Show in Diagram</button>`)}<div class="scroll"><table class="grid"><thead><tr><th>Attribute</th><th>Data type</th><th>Required</th><th></th></tr></thead><tbody>${attrs.map((a, i) => { const [nm, t] = splitAttr(a); return `<tr><td><input class="in mono cell" data-i="${i}" data-f="n" value="${esc(nm)}" aria-label="Attribute name"${lock}></td><td><select class="in mono cell" data-i="${i}" data-f="t" aria-label="Data type"${lock}>${[...new Set([t, ...TYPES])].map(o => `<option${o === t ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></td><td><input type="checkbox" data-i="${i}" data-f="r" aria-label="Required" ${req[i] ? 'checked' : ''}${lock}></td><td>${lock ? '' : `<button class="ib" data-del="${i}" title="Remove attribute">${ico('x')}</button>`}</td></tr>`; }).join('')}</tbody></table>
   <div style="padding:8px 10px">${lock ? (orig ? `<button class="lnk" data-ent="${orig.id}">${ico('shapes', 'c-purple')}Open ${esc(x.name)} in ${esc(x.ext)}</button>` : '') : `<button class="btn" id="e-add">${ico('plus')}Add Attribute</button>`}</div>
   ${rels.length ? `<table class="grid"><thead><tr><th>Relation</th><th>From</th><th>To</th></tr></thead><tbody>${rels.map(r => `<tr><td class="mono">${esc(r[2])}</td>${[r[0], r[1]].map(e => `<td><button class="lnk" data-ent="${e.id}">${ico(e.icon || 'shapes', 'c-purple')}${esc(e.name)}</button></td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}</div></div>`;
  d.onchange = e => {
    const t = e.target as HTMLInputElement | HTMLSelectElement, i = Number(t.dataset.i), f = t.dataset.f;
    if (!f) return;
    if (f === 'r') req[i] = (t as HTMLInputElement).checked;
    else { const [nm, ty] = splitAttr(attrs[i]); attrs[i] = f === 'n' ? (t.value.trim() || nm) + ': ' + ty : nm + ': ' + t.value; }
    touch(x);
  };
  d.onclick = e => {
    const dl = hit(e, '[data-del]'), en = hit(e, '[data-ent]');
    if (dl) { const i = Number(dl.dataset.del); attrs.splice(i, 1); req.splice(i, 1); touch(x); repaint('editor'); }
    else if (en) openDoc(BY[en.dataset.ent!]);
    else if (hit(e, '#e-add')) {
      attrs.push('newAttribute: text'); req.push(false);
      touch(x); repaint('editor');
      const added = $$<HTMLInputElement>('input[data-f="n"]', d).pop();
      added?.focus(); added?.select();
    }
    else if (hit(e, '#e-dia')) { openDoc(O, 'editor'); pick(x); $$('.en', d).forEach(k => k.classList.toggle('on', k.dataset.id === x.id)); }
  };
};
