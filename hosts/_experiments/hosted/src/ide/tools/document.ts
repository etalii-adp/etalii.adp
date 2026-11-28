/* Editor: documentation, Markdown shown as rich text. */
import { esc } from '../../common/dom';
import { project } from '../storage';
import type { TextDocument } from '../types';
import { tbar, waiting, type Tool } from './shared';

export const rDoc: Tool = (d, x) => {
  const doc = project.content.doc<TextDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  const body = doc?.html || `<h1>${esc(x.name)}</h1><p style="color:var(--dim)">Start writing…</p>`;
  d.innerHTML = `<div class="tool">${tbar(x, `<span>Markdown, shown as rich text</span>`)}<div class="scroll"><article class="prose">${body}</article></div></div>`;
};
