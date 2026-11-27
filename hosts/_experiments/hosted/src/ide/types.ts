/* The shapes the IDE page works with: an item of the hierarchy, a kind of item, and what the tool windows show. */

export type KindName =
  | 'solution' | 'area' | 'group' | 'source' | 'pipeline' | 'schema' | 'entity' | 'ontology' | 'vocabulary' | 'model' | 'prompt' | 'agent' | 'evalset'
  | 'dashboard' | 'notebook' | 'page' | 'theme' | 'component' | 'csapp' | 'csharp' | 'pyproject' | 'python' | 'release' | 'environment' | 'testsuite' | 'procedure' | 'doc' | 'code' | 'file';

/* the tools the document area has; every kind of item that opens in a tool names one */
export type ToolName = 'flow' | 'onto' | 'entity' | 'schema' | 'form' | 'check' | 'dash' | 'page' | 'code' | 'doc';

export interface KindInfo {
  label: string;
  icon: string;
  colour: string;
  /* how an item of this kind is stored: a file suffix, the files of its folder, or '@' for inside its parent's file */
  stored?: string | string[];
  tool?: ToolName;
}

/* modified, or added and not committed */
export type Vcs = 'M' | 'A';
export type ViewMode = 'logical' | 'files';
export type DocMode = 'editor' | 'canvas';
export type Severity = 'error' | 'warning' | 'info';
export interface Point { x: number; y: number }

/* a repository from outside the project, linked in at an item and following a branch or a tag */
export interface RepoLink { repo: string; ref: string; refs: string[] }

export type Relation = [from: Item, to: Item, label: string];
export type SchemaField = [name: string, type: string, required: boolean, constraint: string, mapsTo: string];
export interface SchemaSettings { format: string; version: string; compat: string }

/* One item of the hierarchy. Every item has an id, a name, a kind and a parent; the rest is there for the items it applies to. */
export interface Item {
  /* a ShortGuid: it stays the same when the item is renamed or moved */
  id: string;
  name: string;
  kind: KindName;
  parent: Item | null;
  children?: Item[];
  /* an icon chosen for this item, in place of the icon of its kind */
  icon?: string;
  vcs?: Vcs;
  /* made in this session, so it has no content yet */
  fresh?: boolean;

  /* a level: the kinds it takes, how it is shown, and the repository it comes from */
  accepts?: KindName[];
  mode?: ViewMode;
  showAll?: boolean;
  link?: RepoLink;

  /* a level on the canvas: the flows between its children by their index, the shared layout, and where the cards are now */
  flows?: [from: number, to: number][];
  layout0?: [x: number, y: number][];
  pos?: Point[];

  /* an ontology model: the relations between its entity types */
  rels?: Relation[];
  /* an entity type: its attributes as "name: type", which of them are required, the model it is defined in when it is a reference, and its place in the diagram */
  attrs?: string[];
  req?: boolean[];
  ext?: string;
  ex?: number;
  ey?: number;

  /* a data schema, once it has been opened */
  fields?: SchemaField[];
  sf?: SchemaSettings;
  sview?: 'designer' | 'json';

  /* an application's source: the name it has on disk where that is not made from the item's name, the files its folder holds beside its items, and the ones git ignores */
  file?: string;
  files?: string[];
  ignoredFiles?: string[];

  /* a file of the File System view that is not an item of its own, such as .adp; a folder of such files has entries */
  pseudo?: true;
  ignored?: boolean;
  entries?: Item[];
}

/* what an item starts as in the example data, before it has an id and a parent */
export interface Draft extends Pick<Item, 'name' | 'kind' | 'icon' | 'vcs' | 'accepts' | 'mode' | 'link' | 'flows' | 'layout0' | 'file' | 'files' | 'ignoredFiles'> {
  children?: Draft[];
}

export interface Problem { s: Severity; m: string; node: Item }

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

export type PanelId = 'explorer' | 'commit' | 'properties' | 'problems' | 'git';
export type DockId = 'left' | 'right' | 'bottom';
/* pan and zoom of a canvas */
export interface View { x: number; y: number; k: number }
