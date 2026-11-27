/* What the IDE remembers while it is open: selection, tabs, expanded items, docks, git counters. */
import { must, ROOT } from './model';
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
  /* pan and zoom per canvas level, the levels whose view was set by hand, and the levels whose cards were moved */
  view: Record<string, View>;
  viewOwn: Set<string>;
  moved: Set<string>;
  /* the level the document area shows as a canvas or a diagram, and how to fit it; auto says the window changed, not the user */
  cvL: Item | null;
  cvFit: ((auto?: boolean) => void) | null;
  /* the last card clicked on a canvas and when, to tell a double click */
  lastC: string | null;
  lastT: number;
  /* whether moving between levels is animated */
  anim: boolean;
  /* commits not pushed and not pulled, and the commit message being written */
  ahead: number;
  behind: number;
  cmsg?: string;
  /* which severities the Problems show */
  pf: Record<Severity, boolean>;
  /* where each tool window is docked, and which one each dock shows */
  dock: Record<PanelId, DockId>;
  act: Record<DockId, PanelId | null>;
  git: { branch: string | null; user: string | null; days: number | null; q: string; sel: number };
}

export const S: State = {
  sel: ROOT, doc: ROOT, tabs: [], open: new Set(), dm: {}, q: '', insp: null, edit: null,
  view: {}, viewOwn: new Set(), moved: new Set(), cvL: null, cvFit: null, lastC: null, lastT: 0,
  anim: !matchMedia('(prefers-reduced-motion: reduce)').matches,
  ahead: 1, behind: 3, pf: { error: true, warning: true, info: true },
  dock: { explorer: 'left', commit: 'left', properties: 'right', problems: 'right', git: 'bottom' },
  act: { left: 'explorer', right: 'properties', bottom: 'git' },
  git: { branch: null, user: null, days: null, q: '', sel: 0 },
};

/* the layout a new window starts with, to go back to */
export const DOCK0 = JSON.stringify([S.dock, S.act]);

try { const a = localStorage.getItem('adp-ide-anim'); if (a !== null) S.anim = a === '1'; } catch { /* storage is off: the system's setting stands */ }
['Atlas Platform', 'Ingestion', 'Sources', 'Pipelines', 'Ontology', 'Asset model', 'Components'].forEach(name => S.open.add(must(name).id));
