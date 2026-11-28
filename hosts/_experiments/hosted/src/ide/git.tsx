/* What the Git tool window looks like: the branches, the log with its filters and its graph, and the commit that is selected. */
import type { VNode } from 'preact';
import { ico } from '../common/icons.tsx';
import type { Commit } from '../storage';
import { K } from './kinds';
import type { Item } from './types';

/* a branch or a tag in the list: what it is called, what it shows as, whether it is the one that is checked out and whether the log is kept to it; note is what stands behind it */
export interface RefRow { name: string; label: string; icon: string; current: boolean; selected: boolean; note?: string }
/* a label on a commit: a branch or a tag that is at it */
export interface RefLabel { name: string; colour: string; head: boolean }
/* a row of the log: a commit by its place in the log, the labels on it, and whether it is the selected one */
export interface LogRow { at: number; commit: Commit; labels: readonly RefLabel[]; selected: boolean }
/* the graph beside the log: a line from a commit to each of its parents, and a dot per commit */
export interface Graph { lines: readonly { d: string; colour: string }[]; dots: readonly { x: number; y: number; colour: string }[]; height: number }

/* what the Git tool window asks for; a filter gets its button, for the menu that goes under it */
export interface GitActions {
  search: (text: string) => void;
  branches: (button: HTMLElement) => void;
  users: (button: HTMLElement) => void;
  dates: (button: HTMLElement) => void;
  fetch: () => void;
  keepTo: (ref: string) => void;
  select: (commit: number) => void;
  open: (itemId: string) => void;
}

const Ref = ({ row: r, keepTo }: { row: RefRow; keepTo: (ref: string) => void }): VNode =>
  <div class={'row' + (r.selected ? ' sel' : '')} data-b={r.name} style="--d:0" onClick={() => keepTo(r.name)}>
    <span class="tw"></span>{ico(r.icon, r.current ? 'c-green' : 'c-muted')}<span class="nm">{r.label}</span>{r.note === undefined ? '' : <span class="ref">{r.note}</span>}
  </div>;

/* filters are what the three filter buttons say; shown is the commit whose details show */
export const Git = ({ local, remote, tags, linked, filters, rows, graph, shown, on }: {
  local: readonly RefRow[]; remote: readonly RefRow[]; tags: readonly RefRow[]; linked: readonly Item[];
  filters: { branch: string; user: string; date: string }; rows: readonly LogRow[]; graph: Graph; shown: Commit | undefined; on: GitActions;
}): VNode =>
  <div class="git">
    <div class="g-br" id="g-br">
      <h5>Local</h5>{local.map(r => <Ref row={r} keepTo={on.keepTo} />)}
      <h5>Remote · origin</h5>{remote.map(r => <Ref row={r} keepTo={on.keepTo} />)}
      <h5>Tags</h5>{tags.map(r => <Ref row={r} keepTo={on.keepTo} />)}
      <h5>Linked repositories</h5>{linked.map(k =>
        <div class="row" style="--d:0" data-open={k.id} onClick={() => on.open(k.id)}><span class="tw"></span>{ico('link', 'c-muted')}<span class="nm">{k.name}</span><span class="ref">{k.link!.ref}</span></div>)}
    </div>
    <div class="g-log">
      <div class="g-bar">
        <input class="in" id="g-q" placeholder="Text or hash" aria-label="Search commits" onInput={e => on.search(e.currentTarget.value)} />
        <button class="tbtn" id="g-fb" onClick={e => on.branches(e.currentTarget)}>Branch: <b>{filters.branch}</b></button>
        <button class="tbtn" id="g-fu" onClick={e => on.users(e.currentTarget)}>User: <b>{filters.user}</b></button>
        <button class="tbtn" id="g-fd" onClick={e => on.dates(e.currentTarget)}>Date: <b>{filters.date}</b></button>
        <span class="sp"></span>
        <button class="ib" id="g-fetch" title="Fetch all remotes" onClick={on.fetch}>{ico('fetch')}</button>
      </div>
      <div class="g-rows" id="g-rows">{rows.length
        ? <>
          <svg width="64" height={graph.height}>
            {graph.lines.map(l => <path d={l.d} style={`fill:none;stroke:${l.colour};stroke-width:1.6`} />)}
            {graph.dots.map(o => <circle cx={o.x} cy={o.y} r="4" style={`fill:${o.colour};stroke:var(--bg);stroke-width:1.5`} />)}
          </svg>
          {rows.map(({ at, commit: cm, labels, selected }) =>
            <button class={'g-row' + (selected ? ' on' : '')} data-c={at} onClick={() => on.select(at)}>
              {labels.map(l => <span class={'lbl c-' + l.colour}>{`${l.head ? 'HEAD → ' : ''}${l.name}`}</span>)}
              <span class="msg">{cm.m}</span><span class="who">{cm.a}</span><span class="when">{cm.w}</span>
            </button>)}
        </>
        : <div class="hint">No commits match these filters.</div>}</div>
    </div>
    <div class="g-det" id="g-det">{shown
      ? <>
        <h6>{shown.m}</h6>
        <p><span class="mono">{shown.h}</span>{` · ${shown.a} · ${shown.w}`}</p>
        {shown.touched.map(({ node: q, s }) => <div>{ico(q.icon || K[q.kind].icon, 'c-' + K[q.kind].colour)}<span class={'nm v' + s}>{q.name}</span></div>)}
      </>
      : ''}</div>
  </div>;
