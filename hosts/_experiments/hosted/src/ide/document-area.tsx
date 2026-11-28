/* What the document area draws around the open item: the tabs, the switch between tool and canvas, and the breadcrumbs. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';
import { K } from './kinds';
import type { DocMode, Item } from './types';

const tabIcon = (x: Item): string => x.pseudo ? (x.entries ? 'folder' : 'file') : x.icon || K[x.kind].icon;
const tabColour = (x: Item): string => 'c-' + (x.pseudo ? 'muted' : K[x.kind].colour);

/* the tabs; show gets the item of the tab that was clicked, close the one whose cross was */
export const Tabs = ({ tabs, open, show, close }: { tabs: readonly Item[]; open: Item; show: (x: Item) => void; close: (x: Item) => void }): VNode =>
  <>{tabs.map(t =>
    <button key={t.id} class={'tab' + (t === open ? ' on' : '')} data-id={t.id} onClick={() => show(t)}>
      {ico(tabIcon(t), tabColour(t))}
      <span class={t.vcs ? 'nm v' + t.vcs : ''}>{t.name}</span>
      <span class="x" title="Close" onClick={e => { e.stopPropagation(); close(t); }}>{ico('x')}</span>
    </button>)}</>;

/* the two ways an item shows: in its tool, by the word for it, or as a canvas; list says that the first is a list of contents */
export const Modes = ({ mode, word, list, choose }: { mode: DocMode; word: string; list: boolean; choose: (mode: DocMode) => void }): VNode =>
  <>
    <button data-dm="editor" class={mode === 'editor' ? 'on' : ''} title="Alt+C switches between the two" onClick={() => choose('editor')}>{ico(list ? 'list' : 'edit')}{word}</button>
    <button data-dm="canvas" class={mode === 'canvas' ? 'on' : ''} title="Alt+C switches between the two" onClick={() => choose('canvas')}>{ico('canvas')}Canvas</button>
  </>;

/* the way from the root to the item that shows; show gets the item that was clicked */
export const Crumbs = ({ path, show }: { path: readonly Item[]; show: (x: Item) => void }): VNode =>
  <>{path.map((p, i) =>
    <>
      {i ? ico('chev') : ''}
      <button data-id={p.id} class={i === path.length - 1 ? 'cur' : ''} onClick={() => show(p)}>{ico(tabIcon(p), tabColour(p))}{p.name}</button>
    </>)}</>;
