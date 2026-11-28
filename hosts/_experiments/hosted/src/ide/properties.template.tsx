/* What the Properties tool window looks like: a head that says what the sheet is of, and groups of rows, each a label with a text or a control. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.template';
import { K } from './kinds';
import { modeOf, showAll } from './model';
import type { Item, PropControl, PropGroup, PropSheet, ViewMode } from './types';

/* what the controls of a sheet ask for; the name and the icon get their element, for what was typed and for where the icon picker goes */
export interface PropActions {
  rename: (field: HTMLInputElement) => void;
  icon: (button: HTMLElement) => void;
  mode: (mode: ViewMode) => void;
  all: (on: boolean) => void;
  ref: (ref: string) => void;
}

/* a control in place of a text, for the rows of an item that can be changed */
const Control = ({ control: v, item: x, on }: { control: PropControl; item: Item; on: PropActions }): VNode => {
  if ('name' in v) return <span><input class="in" id="p-name" value={x.name} aria-label="Name" disabled={v.lock} onChange={e => on.rename(e.currentTarget)} /></span>;
  if ('icon' in v) return <span><button class="tbtn" id="p-icon" style="height:22px;margin-left:-8px" disabled={v.lock} onClick={e => on.icon(e.currentTarget)}>{ico(x.icon || K[x.kind].icon, 'c-' + K[x.kind].colour)}{x.icon ? 'Custom' : 'Default'}</button></span>;
  if ('mode' in v) return <span>
    <select class="in" id="p-mode" aria-label="View as" value={modeOf(x)} onChange={e => on.mode(e.currentTarget.value as ViewMode)}><option value="logical">Logical Structure</option><option value="files">File System</option></select>
  </span>;
  if ('all' in v) return <span><input type="checkbox" id="p-all" aria-label="Show all files" checked={showAll(x)} disabled={modeOf(x) !== 'files'} onChange={e => on.all(e.currentTarget.checked)} /></span>;
  return <span><select class="in mono" id="p-ref" aria-label="Branch or tag" value={x.link?.ref} onChange={e => on.ref(e.currentTarget.value)}>{(x.link?.refs ?? []).map(r => <option>{r}</option>)}</select></span>;
};

/* a text; an id wraps, and a path or a commit hash is set in the monospaced font */
const Text = ({ text: v, red }: { text: string; red?: boolean | number }): VNode =>
  <span><span class={'v' + (red ? ' red' : '') + (/^[0-9a-z]{25}$/.test(v) ? ' mono wrap' : /[\/@]|^[a-f0-9]{7}$/.test(v) ? ' mono' : '')} title={v}>{v}</span></span>;

/* item is the selected item, which the controls of a sheet are about */
export const Properties = ({ sheet: P, item, on }: { sheet: PropSheet; item: Item; on: PropActions }): VNode =>
  <>
    <div class="pg-head">{ico(P.icon, 'c-' + (P.col || 'muted'))}<b>{P.title}</b><small>{P.sub}</small></div>
    <div class="pgrid">{P.g.filter((g): g is PropGroup => !!g).map(([title, rows]) => <>
      <div class="pc">{title}</div>
      {rows.map(([label, v, red]) => <div class="pr"><span><span class="v">{label}</span></span>{typeof v === 'string' ? <Text text={v} red={red} /> : <Control control={v} item={item} on={on} />}</div>)}
    </>)}</div>
  </>;
