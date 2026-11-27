/* The contents list of a container. */
import { esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { K } from '../kinds';
import { BY } from '../model';
import { openDoc } from '../open';
import type { Tool } from './shared';

export const rContents: Tool = (d, x) => {
  const children = x.children || [];
  d.innerHTML = `<div class="tool"><div class="tb"><span class="tk">Contents · ${esc(x.name)}</span><span>${children.length} items</span></div><div class="scroll"><table class="grid"><thead><tr><th>Name</th><th>Kind</th><th>ID</th><th>Items</th><th>Git</th></tr></thead><tbody>${children.map(k => `<tr class="clk" data-id="${k.id}"><td>${ico(k.icon || K[k.kind].icon, 'c-' + K[k.kind].colour)}${esc(k.name)}</td><td class="wait">${K[k.kind].label}</td><td class="mono wait">${k.id}</td><td class="wait">${k.children ? k.children.length : ''}</td><td class="${k.vcs === 'A' ? 'ok' : ''}" style="${k.vcs === 'M' ? 'color:var(--blue)' : ''}">${k.vcs === 'M' ? 'Modified' : k.vcs === 'A' ? 'Added' : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  d.onclick = e => { const r = hit(e, 'tr[data-id]'); if (r) openDoc(BY[r.dataset.id!]); };
};
