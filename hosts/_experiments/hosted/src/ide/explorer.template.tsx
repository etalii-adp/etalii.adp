/* What the Explorer looks like: its search field and the rows of the tree, what it adds to the header of its tool window, the icon picker and the dialog that links a repository. */
import type { VNode } from 'preact';
import { hit } from '../common/dom';
import { ico } from '../common/icons.template';
import type { IconChoice, IconGroup } from '../storage';
import { K } from './kinds';
import { asFile, disk, multi } from './model';
import { sev } from './severity';
import type { Item } from './types';

/* a row of the tree: an item at its depth, whether it has rows under it and whether those show */
export interface TreeLine { item: Item; depth: number; has: boolean; open: boolean }
/* The name that is being typed in the tree: what was typed so far, and why the storage refused it when it did. done ends the typing, and takes the name when it says so; left is the field losing the focus. */
export interface Naming { item: Item; draft: string; refused: string | null; typed: (draft: string) => void; done: (apply: boolean) => void; left: () => void }
/* what the Explorer asks for; an item is named by its id, and twisty says that the click was on the arrow that opens a row */
export interface ExplorerActions {
  search: (text: string) => void;
  click: (id: string, twisty: boolean) => void;
  menu: (id: string, x: number, y: number) => void;
  key: (e: KeyboardEvent) => void;
}

const Row = ({ line: { item: x, depth, has, open }, selected, naming, on }: { line: TreeLine; selected: boolean; naming: Naming | null; on: ExplorerActions }): VNode => {
  const f = !x.pseudo && asFile(x), box = x.children || (!x.pseudo && multi(x));
  const icon = x.pseudo ? (x.entries ? 'folder' : 'file') : f ? (box ? 'folder' : 'file') : (x.icon || K[x.kind].icon), sv = x.pseudo ? null : sev(x);
  return <div class={'row' + (selected ? ' sel' : '') + (x.ignored ? ' ign' : '')} data-id={x.id} style={`--d:${depth}`} role="treeitem"
    onClick={e => { if (!hit(e, '.rn')) on.click(x.id, !!hit(e, '.tw')); }}
    onContextMenu={e => { e.preventDefault(); on.menu(x.id, e.clientX, e.clientY); }}>
    <span class={'tw' + (open ? ' open' : '')}>{has ? ico('chev') : ''}</span>
    {ico(icon, 'c-' + (x.pseudo ? 'muted' : K[x.kind].colour))}
    {naming
      /* a key typed in the name is no key for the tree */
      ? <input class={'in rn' + (naming.refused === null ? '' : ' bad')} id="rn" value={naming.draft} aria-label="Name"
        onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') naming.done(true); if (e.key === 'Escape') naming.done(false); }}
        onBlur={naming.left} onInput={e => naming.typed(e.currentTarget.value)} />
      : <span class={'nm' + (x.vcs ? ' v' + x.vcs : '') + (f || x.pseudo ? ' mono' : '')}>{x.pseudo ? x.name : f ? disk(x) : x.name}</span>}
    {x.link ? <span class="ref" title={'Linked repository ' + x.link.repo}>{ico('link')}{x.link.ref}</span> : ''}
    {x.mode ? <span class="tag" title="This level has its own view setting">{x.mode}</span> : ''}
    {sv ? <span class={'dot ' + sv} title={`Has ${sv}s`}></span> : ''}
  </div>;
};

/* the search field, and the tree as the rows that show, with the selected item and the name that is being typed; why a name was refused shows under its row */
export const Explorer = ({ lines, selected, naming, on }: { lines: readonly TreeLine[]; selected: Item; naming: Naming | null; on: ExplorerActions }): VNode =>
  <>
    <div class="ex-q"><input class="in" id="ex-q" placeholder="Search items" aria-label="Search items" onInput={e => on.search(e.currentTarget.value)} /></div>
    <div class="tree" id="tree" tabindex={0} role="tree" aria-label="Explorer" onKeyDown={on.key}>
      {lines.flatMap(line => {
        const named = naming?.item === line.item ? naming : null;
        return [
          <Row key={line.item.id} line={line} selected={line.item === selected} naming={named} on={on} />,
          named && named.refused !== null ? <div key="refused" class="rnerr" style={`--d:${line.depth}`}>{named.refused}</div> : null,
        ];
      })}
    </div>
  </>;

/* what the Explorer adds to the header of its tool window */
export const ExplorerButtons = ({ locate, collapse }: { locate: () => void; collapse: () => void }): VNode =>
  <>
    <button class="ib" id="ex-loc" title="Select the open document" onClick={locate}>{ico('target')}</button>
    <button class="ib" id="ex-col" title="Collapse all" onClick={collapse}>{ico('collapse')}</button>
  </>;

const Categories = ({ groups }: { groups: readonly IconGroup[] }): VNode => <>{groups.map(([category]) => <option>{category}</option>)}</>;

/* what the icon picker asks for: a search, a category or domain to keep to, the icon the pointer is over by its label, the first icon that was found, and an icon by its name, where no name is the icon of the kind */
export interface IconActions {
  search: (query: string) => void;
  only: (category: string) => void;
  over: (label: string | null) => void;
  first: () => void;
  choose: (icon: string) => void;
}

/* The icon picker of an item: search, a choice of one category or domain, the icons that were found category by category, and the way back to the icon of its kind. note is the line under the icons: the icon the pointer is over, or the current one. */
export const IconPicker = ({ name, kind, count, general, domains, found, current, query, only, note, on }: {
  name: string; kind: string; count: number; general: readonly IconGroup[]; domains: readonly IconGroup[];
  found: readonly (readonly [category: string, icons: readonly IconChoice[]])[]; current: string; query: string; only: string; note: string; on: IconActions;
}): VNode =>
  <div class="menu ipick" onClick={e => { const b = hit(e, '[data-ic]'); if (b) on.choose(b.dataset.ic ?? ''); }}>
    <div class="mhead">{`Icon for ${name}`}</div>
    <div class="ip-top">
      <input class="in" id="ip-q" placeholder={`Search ${count} icons`} aria-label="Search icons" autocomplete="off"
        onInput={e => on.search(e.currentTarget.value)} onKeyDown={e => { if (e.key === 'Enter') on.first(); }} />
      <select class="in" id="ip-cat" aria-label="Category or domain" onChange={e => on.only(e.currentTarget.value)}>
        <option value="">All categories</option>
        <optgroup label="General"><Categories groups={general} /></optgroup>
        <optgroup label="Domains"><Categories groups={domains} /></optgroup>
      </select>
    </div>
    <div class="ip-list" id="ip-list" onMouseOver={e => on.over(hit(e, '[data-ic]')?.title ?? null)} onMouseLeave={() => on.over(null)}>
      {found.length
        ? found.map(([category, icons]) =>
          <>
            <h6>{category}</h6>
            <div class="icongrid">{icons.map(o => <button class={'ib' + (o.nm === current ? ' on' : '')} data-ic={o.nm} title={o.label} aria-label={o.label}>{ico(o.nm)}</button>)}</div>
          </>)
        : <div class="hint">{`No icon matches "${query}"${only ? ' in ' + only : ''}.`}</div>}
    </div>
    <div class="ip-foot" id="ip-name">{note}</div>
    <div class="msep"></div>
    <button class="mi" data-ic=""><span class="lead"></span>{`Use the default for ${kind}`}</button>
  </div>;

/* what the dialog that links a repository asks, filled in with what the storage suggests */
export const LinkRepository = ({ offer }: { offer: { repo: string; name: string; refs: readonly string[] } }): VNode =>
  <>
    <label for="lr-u">Repository</label>
    <input class="in mono" id="lr-u" value={offer.repo} />
    <label for="lr-n">Show as</label>
    <input class="in" id="lr-n" value={offer.name} />
    <label for="lr-r">Branch or tag</label>
    <select class="in" id="lr-r">{offer.refs.map(r => <option>{r}</option>)}</select>
  </>;
