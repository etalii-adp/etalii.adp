/* What the editor of documentation looks like: Markdown, shown as rich text. */
import type { VNode } from 'preact';
import type { Item } from '../types';
import { ToolBar } from './shared.template';

/* html is the document as the rich text the storage keeps; a document nothing was written of yet shows its name and where to start */
export const TextEditor = ({ item, html }: { item: Item; html: string | undefined }): VNode =>
  <div class="tool">
    <ToolBar item={item}><span>Markdown, shown as rich text</span></ToolBar>
    <div class="scroll">
      {html
        ? <article class="prose" dangerouslySetInnerHTML={{ __html: html }} />
        : <article class="prose"><h1>{item.name}</h1><p style="color:var(--dim)">Start writing…</p></article>}
    </div>
  </div>;
