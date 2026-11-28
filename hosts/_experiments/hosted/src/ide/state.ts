/* What the IDE remembers while it is open: selection, tabs, expanded items, docks, filters. It starts from the window's state the workbench store kept, and is handed back to that store a moment after it changed. */
import { personal, type WindowState } from '../storage';
import { alive, byId, nearest, ROOT } from './model';
import { project } from './storage';
import type { DockId, DocMode, Item, PanelId, PropSheet, Severity, View } from './types';

export interface State {
  /* the selected item, and the item the document area shows */
  sel: Item;
  doc: Item;
  tabs: Item[];
  /* the ids of the items that are expanded in the Explorer */
  open: Set<string>;
  /* tool or canvas, per item, where it differs from what its kind gives */
  dm: Record<string, DocMode>;
  /* the Explorer's search text */
  q: string;
  /* the part of a tool the Properties show, in place of the selected item */
  insp: PropSheet | null;
  /* the item being renamed in the Explorer */
  edit: Item | null;
  /* pan and zoom per canvas level, and the levels whose view was set by hand */
  view: Record<string, View>;
  viewOwn: Set<string>;
  /* the level the document area shows as a canvas or a diagram, and how to fit it; auto says the window changed, not the user */
  cvL: Item | null;
  cvFit: ((auto?: boolean) => void) | null;
  /* the last card clicked on a canvas and when, to tell a double click */
  lastC: string | null;
  lastT: number;
  /* whether moving between levels is animated */
  anim: boolean;
  /* the commit message being written; undefined before anything was typed */
  cmsg?: string;
  /* which severities the Problems show */
  pf: Record<Severity, boolean>;
  /* where each tool window is docked, and which one each dock shows */
  dock: Record<PanelId, DockId>;
  act: Record<DockId, PanelId | null>;
  /* the filters of the Git log, and the commit that is selected in it, by its place in the log */
  git: { branch: string | null; user: string | null; days: number | null; q: string; sel: number };
  /* what the run button starts */
  run: Item | null;
}

/* the layout a new window starts with, to go back to */
const DOCKS: Record<PanelId, DockId> = { explorer: 'left', commit: 'left', properties: 'right', problems: 'right', git: 'bottom' };
const ACTIVE: Record<DockId, PanelId | null> = { left: 'explorer', right: 'properties', bottom: 'git' };
export const defaultLayout = (): [State['dock'], State['act']] => [{ ...DOCKS }, { ...ACTIVE }];

const severities: readonly Severity[] = ['error', 'warning', 'info'];
const docks: readonly DockId[] = ['left', 'right', 'bottom'];

export const S = {} as State;

/* fills the state from what the workbench store kept; called once the project is open */
export function bindState(): void {
  const w = project.workbench.state, item = (id: string): Item | undefined => project.solution.byId(id), [dock, act] = defaultLayout();
  for (const id of Object.keys(dock) as PanelId[]) if (docks.includes(w.docks[id] as DockId)) dock[id] = w.docks[id] as DockId;
  for (const d of docks) if (d in w.active) act[d] = (w.active[d] in dock ? w.active[d] : null) as PanelId | null;
  Object.assign(S, {
    sel: item(w.selectedId) ?? ROOT, doc: item(w.documentId) ?? ROOT, tabs: w.tabIds.map(item).filter((x): x is Item => !!x), open: new Set(w.expandedIds),
    dm: { ...w.documentModes } as Record<string, DocMode>, q: '', insp: null, edit: null, view: { ...w.views }, viewOwn: new Set(w.ownViews), cvL: null, cvFit: null, lastC: null, lastT: 0,
    anim: personal.get().anim ?? !matchMedia('(prefers-reduced-motion: reduce)').matches, cmsg: w.commitMessage,
    pf: Object.fromEntries(severities.map(s => [s, !w.hiddenSeverities.includes(s)])) as Record<Severity, boolean>, dock, act,
    git: { branch: w.git.branch || null, user: w.git.user || null, days: w.git.days || null, q: '', sel: 0 }, run: item(w.runTargetId) ?? null,
  } satisfies State);
}

/* the state as the workbench store keeps it; a file of the File System view is kept as the item it belongs to */
const kept = (x: Item): string => nearest(x.pseudo ? x.parent! : x).id;
export function windowState(): WindowState {
  return {
    selectedId: kept(S.sel), documentId: kept(S.doc), tabIds: S.tabs.filter(t => !t.pseudo && alive(t)).map(t => t.id), expandedIds: [...S.open].filter(id => !!project.solution.byId(id)),
    documentModes: { ...S.dm }, views: { ...S.view }, ownViews: [...S.viewOwn], docks: { ...S.dock }, active: Object.fromEntries(docks.map(d => [d, S.act[d] ?? ''])),
    hiddenSeverities: severities.filter(s => !S.pf[s]), git: { branch: S.git.branch ?? '', user: S.git.user ?? '', days: S.git.days ?? 0 }, runTargetId: S.run?.id ?? '', commitMessage: S.cmsg,
  };
}
/* hands the state to the workbench store, which keeps it a moment later */
export function keep(): void { project.workbench.keepSoon(windowState); }

/* After the hierarchy changed under the window: what is selected, open or in a tab and is no longer there gives way to the nearest item that is. */
export function settle(): void {
  S.tabs = S.tabs.filter(alive);
  if (!alive(S.doc)) { S.doc = nearest(S.doc); S.insp = null; if (!S.tabs.includes(S.doc)) S.tabs.push(S.doc); }
  if (!alive(S.sel)) { S.sel = nearest(S.sel); S.insp = null; }
  if (S.edit && !alive(S.edit)) S.edit = null;
  if (S.run && !alive(S.run)) S.run = null;
  if (S.cvL && !alive(S.cvL)) S.cvL = null;
}
/* an item by the id a part of the page kept in its markup */
export const itemAt = (id: string | undefined): Item | undefined => id ? byId(id) : undefined;
