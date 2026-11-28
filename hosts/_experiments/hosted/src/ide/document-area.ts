/* The document area: tabs, breadcrumbs, and the open item in its tool or as a canvas. */
import { h } from 'preact';
import { $, $maybe, draw } from '../common/dom';
import { leaveCanvas, markCanvas, play, renderCanvas, tween } from './canvas';
import { Crumbs, Modes, Tabs } from './document-area.tsx';
import { K, WORD } from './kinds';
import { byId, crumbsOf, isBox, ROOT } from './model';
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
import { step, visited } from './trail';
import type { DocMode, Item, ToolName } from './types';

const tools: Record<ToolName, Tool> = { flow: rFlow, onto: rOnto, entity: rEntity, schema: rSchema, page: rPage, dash: rDash, form: rForm, check: rCheck, doc: rDoc, code: rCode };

/* a tab or a breadcrumb opens the item it stands for, as it is now */
const show = (x: Item): void => { const now = byId(x.id); if (now) openDoc(now); };
/* closes a tab; when it was the open one, the tab before it opens */
function close(tab: Item): void {
  const x = byId(tab.id);
  if (!x) return;
  const i = S.tabs.indexOf(x);
  S.tabs.splice(i, 1);
  if (S.doc === x) openDoc(S.tabs[Math.max(0, i - 1)] || ROOT); else renderEditor();
}
/* switches the open item between its tool and the canvas */
function choose(mode: DocMode): void {
  if (S.doc.pseudo) return;
  S.dm[S.doc.id] = mode;
  S.insp = null;
  repaint('editor', 'properties');
}

/* The back and forward buttons of a mouse step along the trail while the pointer is over the document area, a canvas or a tool alike: back shows what showed before, forward what was stepped back from. The browser's own answer to those buttons is taken away for the whole page (browser.ts), and with it the mouse events of such a button: a browser gives no mousedown or mouseup after a pointerdown that was answered, so the step is taken when the pointer lets go. */
export function mountDocumentArea(): void {
  $('#doc').addEventListener('pointerup', e => {
    if (e.button !== 3 && e.button !== 4) return;
    const to = step(e.button === 3 ? -1 : 1);
    if (to) openDoc(to.item, to.item.pseudo ? undefined : to.mode);
  });
}

/* the item the document area shows in its tool, when it shows no level: going higher from it zooms out of its card */
let inTool: Item | null = null;

export function renderEditor(): void {
  const x = S.doc, m = dmode(x), kindTool = K[x.kind].tool, word = x.entries ? 'Contents' : x.pseudo ? 'Editor' : isBox(x) ? 'Contents' : kindTool ? WORD[kindTool] : '';
  visited(x, m);
  draw($('#tabs'), h(Tabs, { tabs: S.tabs, open: x, show, close }));
  draw($('#dm'), h(Modes, { mode: m, word, list: isBox(x) || !!x.entries, choose }));
  $maybe('#tabs .on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const cr = crumbsOf(m === 'canvas' ? levelOf(x) : x);
  draw($('#crumbs'), h(Crumbs, { path: cr, show }));
  /* a model with child items shows that level in its own diagram, so it takes part in the level tweens just as a canvas does; an item that shows in its tool is zoomed into from the level it is in, and out of to a level above it */
  const d = $('#doc'), L = m === 'canvas' ? levelOf(x) : null, V = L || (x.children && !x.pseudo && !isBox(x) ? x : null), from = S.cvL ?? inTool, tw = from && from !== (V ?? x) && S.anim ? tween(from, V ?? x, d, !!V, !!S.cvL) : null;
  S.cvFit = null;
  S.cvL = V;
  inTool = V ? null : x;
  leaveCanvas();
  /* each draws the item as a piece of the page of its own: another item, or the same one in another way, starts from nothing */
  if (L) renderCanvas(d, L);
  else if (x.entries) rContents(d, x);
  else if (x.pseudo) rCode(d, x);
  else if (isBox(x)) rContents(d, x);
  else if (kindTool) tools[kindTool](d, x);
  else draw(d, null);
  if (tw) play(tw, d);
}

/* marks the selected item in what the document area shows, without drawing the open item again */
export function markSelected(): void { markCanvas(); }
