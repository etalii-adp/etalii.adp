/* Designer: form-based settings (data sources, models, agents, environments, themes, components). */
import { esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { K } from '../kinds';
import { byId, ro, slug } from '../model';
import { openDoc } from '../open';
import { project } from '../storage';
import type { DeepReadonly, FormDocument, FormField } from '../types';
import { tbar, waiting, type Tool } from './shared';

export const rForm: Tool = (d, x) => {
  const doc = project.content.doc<FormDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  /* an item nothing was written of yet has its name to set, and no more */
  const secs: DeepReadonly<FormDocument['sections']> = doc?.sections ?? [['General', [['Name', 'text', x.name]]]], lock = ro(x) ? ' disabled' : '';
  const ctl = (f: DeepReadonly<FormField>, i: number): string => {
    const id = 'f' + i + '-' + slug(f[0]);
    let c: string;
    if (f[1] === 'sel') c = `<select class="in" id="${id}"${lock}><option>${esc(f[2])}</option><option>Other…</option></select>`;
    else if (f[1] === 'area') c = `<textarea class="in" id="${id}" rows="4"${lock}>${esc(f[2])}</textarea>`;
    else if (f[1] === 'tog') c = `<span><input type="checkbox" id="${id}" ${f[2] ? 'checked' : ''}${lock}></span>`;
    else if (f[1] === 'chips') c = `<span class="chips" id="${id}">${f[2].map(s => `<span class="chip">${esc(s)}</span>`).join('')}<button class="chip" type="button" data-nyi="Add">${ico('plus')}</button></span>`;
    else if (f[1] === 'ref') { const r = byId(f[3]); c = `<button type="button" class="lnk" id="${id}" data-ref="${r ? r.id : ''}">${r ? ico(r.icon || K[r.kind].icon, 'c-' + K[r.kind].colour) : ''}${esc(f[2])}</button>`; }
    else if (f[1] === 'secret') c = `<span class="mono" id="${id}" style="display:flex;gap:6px;align-items:center;color:var(--muted)">${ico('lock')}${esc(f[2])}</span>`;
    else c = `<input class="in${f[1] === 'mono' ? ' mono' : ''}" id="${id}" value="${esc(f[2])}"${f[1] === 'num' ? ' inputmode="decimal" style="max-width:120px"' : ''}${lock}>`;
    return `<div class="fl"><span>${esc(f[0])}</span>${c}</div>`;
  };
  let i = 0;
  d.innerHTML = `<div class="tool">${tbar(x)}<div class="scroll"><div class="form">${secs.map(([h, fs]) => `<h3>${h}</h3>${fs.map(f => ctl(f, i++)).join('')}`).join('')}</div></div></div>`;
  d.onclick = e => { const b = hit(e, '[data-ref]'), r = b?.dataset.ref && byId(b.dataset.ref); if (r) openDoc(r); };
};
