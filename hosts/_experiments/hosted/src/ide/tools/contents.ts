/* The contents list of a container. */
import { esc, hit } from '../../common/dom';
import { ico } from '../../common/icons';
import { K } from '../kinds';
import { byId } from '../model';
import { openDoc } from '../open';
import type { Item } from '../types';
import type { Tool } from './shared';

/* an item's child items, or what a folder of the File System view holds */
export const rContents: Tool = (d, x) => {
  const children = x.entries ?? x.children ?? [];
  const icon = (k: Item): string => k.pseudo ? (k.entries ? 'folder' : 'file') : k.icon || K[k.kind].icon;
  const git = (k: Item): string => k.vcs === 'M' ? 'Modified' : k.vcs === 'A' ? 'Added' : k.ignored ? 'Ignored' : '';
  d.innerHTML = `<div class="tool"><div class="tb"><span class="tk">Contents · ${esc(x.name)}</span><span>${children.length} items</span></div><div class="scroll"><table class="grid"><thead><tr><th>Name</th><th>Kind</th><th>ID</th><th>Items</th><th>Git</th></tr></thead><tbody>${children.map(k => `<tr class="clk" data-id="${k.id}"><td>${ico(icon(k), 'c-' + K[k.kind].colour)}${esc(k.name)}</td><td class="wait">${k.entries ? 'Folder' : K[k.kind].label}</td><td class="mono wait">${k.id}</td><td class="wait">${(k.entries ?? k.children)?.length ?? ''}</td><td class="${k.vcs === 'A' ? 'ok' : k.ignored ? 'wait' : ''}" style="${k.vcs === 'M' ? 'color:var(--blue)' : ''}">${git(k)}</td></tr>`).join('')}</tbody></table></div></div>`;
  d.onclick = e => { const r = hit(e, 'tr[data-id]'); const x = r && byId(r.dataset.id!); if (x) openDoc(x); };
};
