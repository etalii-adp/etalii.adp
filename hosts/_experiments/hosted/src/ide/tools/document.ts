/* Editor: documentation, Markdown shown as rich text. */
import { h } from 'preact';
import { draw } from '../../common/dom';
import { project } from '../storage';
import type { TextDocument } from '../types';
import { TextEditor } from './document.template';
import { waiting, type Tool } from './shared';

export const rDoc: Tool = (d, x) => {
  const doc = project.content.doc<TextDocument>(x);
  if (doc === undefined) { waiting(d, x); return; }
  draw(d, h(TextEditor, { key: x.id, item: x, html: doc?.html || undefined }));
};
