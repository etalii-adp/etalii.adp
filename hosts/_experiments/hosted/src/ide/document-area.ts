/* The document area: tabs, breadcrumbs, and the open item in its tool or as a canvas. */
import { $, $maybe, esc, hit } from '../common/dom';
import { ico } from '../common/icons';
import { play, renderCanvas, tween } from './canvas';
import { K, WORD } from './kinds';
import { BY, crumbsOf, isBox, ROOT } from './model';
import { dmode, levelOf, openDoc } from './open';
import { repaint } from './repaint';
import { S } from './state';
import { rCheck } from './tools/check';
import { rCode } from './tools/code';
import { rContents } from './tools/contents';
import { rDash } from './tools/dashboard';
import { rDoc } from './tools/document';
import { rEntity } from './tools/entity';
import { rFlow } from './tools/flow';
import { rForm } from './tools/form';
import { rOnto } from './tools/ontology';
import { rPage } from './tools/page';
import { rSchema } from './tools/schema';
import type { Tool } from './tools/shared';
import type { DocMode, Item, ToolName } from './types';

const tools: Record<ToolName, Tool> = { flow: rFlow, onto: rOnto, entity: rEntity, schema: rSchema, page: rPage, dash: rDash, form: rForm, check: rCheck, doc: rDoc, code: rCode };

const tabIcon = (x: Item): string => x.pseudo ? (x.entries ? 'folder' : 'file') : x.icon || K[x.kind].icon;
const tabColour = (x: Item): string => 'c-' + (x.pseudo ? 'muted' : K[x.kind].colour);

export function renderEditor(): void {
  const x = S.doc, m = dmode(x), kindTool = K[x.kind].tool, word = x.entries ? 'Contents' : x.pseudo ? 'Editor' : isBox(x) ? 'Contents' : kindTool ? WORD[kindTool] : '';
  $('#tabs').innerHTML = S.tabs.map(t => `<button class="tab${t === x ? ' on' : ''}" data-id="${t.id}">${ico(tabIcon(t), tabColour(t))}<span class="${t.vcs ? 'nm v' + t.vcs : ''}">${esc(t.name)}</span><span class="x" title="Close">${ico('x')}</span></button>`).join('');
  $('#dm').innerHTML = `<button data-dm="editor" class="${m === 'editor' ? 'on' : ''}" title="Alt+C switches between the two">${ico(isBox(x) || x.entries ? 'list' : 'edit')}${word}</button><button data-dm="canvas" class="${m === 'canvas' ? 'on' : ''}" title="Alt+C switches between the two">${ico('canvas')}Canvas</button>`;
  $maybe('#tabs .on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const cr = crumbsOf(m === 'canvas' ? levelOf(x) : x);
  $('#crumbs').innerHTML = cr.map((p, i) => `${i ? ico('chev') : ''}<button data-id="${p.id}" class="${i === cr.length - 1 ? 'cur' : ''}">${ico(tabIcon(p), tabColour(p))}${esc(p.name)}</button>`).join('');
  /* a model with child items shows that level in its own diagram, so it takes part in the level tweens just as a canvas does */
  const d = $('#doc'), L = m === 'canvas' ? levelOf(x) : null, V = L || (x.children && !x.pseudo && !isBox(x) ? x : null), tw = V && S.cvL && S.cvL !== V && S.anim ? tween(S.cvL, V, d) : null;
  d.innerHTML = '';
  d.onclick = d.onchange = d.ondblclick = null;
  S.cvFit = null;
  S.cvL = V;
  if (L) renderCanvas(d, L);
  else if (x.entries) rContents(d, x);
  else if (x.pseudo) rCode(d, x);
  else if (isBox(x)) rContents(d, x);
  else if (kindTool) tools[kindTool](d, x);
  if (tw) play(tw, d);
}

/* wires the tabs, the breadcrumbs and the switch between tool and canvas */
export function mountDocumentArea(): void {
  $('#dm').onclick = e => {
    const b = hit(e, 'button');
    if (!b || S.doc.pseudo) return;
    S.dm[S.doc.id] = b.dataset.dm as DocMode;
    S.insp = null;
    repaint('editor', 'properties');
  };
  $('#tabs').onclick = e => {
    const t = hit(e, '.tab');
    if (!t) return;
    const x = BY[t.dataset.id!];
    if (hit(e, '.x')) {
      const i = S.tabs.indexOf(x);
      S.tabs.splice(i, 1);
      if (S.doc === x) openDoc(S.tabs[Math.max(0, i - 1)] || ROOT); else renderEditor();
      return;
    }
    openDoc(x);
  };
  $('#crumbs').onclick = e => { const b = hit(e, 'button'); if (b) openDoc(BY[b.dataset.id!]); };
}
