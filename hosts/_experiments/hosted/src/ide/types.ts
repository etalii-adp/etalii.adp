/* The shapes the IDE page works with. What comes from the storage is defined there and passed on here; the rest is what the page's own parts show. */
import type { Item, Severity } from '../storage';

export type { CanvasView as View, CheckDocument, DashboardDocument, DeepReadonly, DocMode, FlowDocument, FormDocument, FormField, Item, KindInfo, KindName, OntologyDocument, PageDocument, Point, Problem, Relation, RepoLink, SchemaDocument, SchemaField, SchemaSettings, SectionType, Severity, StepType, TextDocument, ToolName, ViewMode, Vcs } from '../storage';

/* The Properties tool window shows a sheet: groups of rows, and a row is a label with a text or a control. */
export type PropControl = { name: 1; lock: boolean } | { icon: 1; lock: boolean } | { mode: 1 } | { all: 1 } | { ref: 1 };
export type PropRow = [label: string, value: string | PropControl, red?: boolean | number];
export type PropGroup = [title: string, rows: PropRow[]];
export type Falsy = false | null | undefined | '' | 0;
export interface PropSheet {
  icon: string;
  col?: string;
  title: string;
  sub: string;
  g: (PropGroup | Falsy)[];
}

export type PanelId = 'explorer' | 'commit' | 'properties' | 'problems' | 'agent' | 'git';
export type DockId = 'left' | 'right' | 'bottom';
/* a file of the File System view, as the page makes it for an item */
export type FileItem = Item & { readonly pseudo: true };
export type SeverityFilter = Record<Severity, boolean>;
