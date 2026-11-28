/* What a page gets from the stores: plain shapes it reads and never writes. An item is the same object for as long as it exists, so a page can keep hold of it; a store brings it up to date in place when the backend tells of a change. Every field is read-only: a page changes something by asking a store, which asks the backend. */

export type KindName = string;
/* the tools the document area has; every kind of item that opens in a tool names one */
export type ToolName = 'flow' | 'onto' | 'entity' | 'schema' | 'form' | 'check' | 'dash' | 'page' | 'code' | 'doc';
export type ToolWord = 'Diagram' | 'Designer' | 'Editor';

export interface KindInfo {
  readonly name: KindName;
  readonly label: string;
  readonly icon: string;
  readonly colour: string;
  /* how an item of this kind is stored: a file suffix, the files of its folder, or '@' for inside its parent's file */
  readonly stored?: string | readonly string[];
  readonly tool?: ToolName;
}

/* modified, or added and not committed */
export type Vcs = 'M' | 'A';
export type ViewMode = 'logical' | 'files';
export type Severity = 'error' | 'warning' | 'info';
export interface Point { readonly x: number; readonly y: number }

/* a repository from outside the project, linked in at an item and following a branch or a tag */
export interface RepoLink { readonly repo: string; readonly ref: string; readonly refs: readonly string[]; readonly resolved: string }

export type Relation = readonly [from: Item, to: Item, label: string];

/* One item of the hierarchy. Every item has an id, a name, a kind and a parent; the rest is there for the items it applies to. */
export interface Item {
  /* a ShortGuid: it stays the same when the item is renamed or moved */
  readonly id: string;
  readonly name: string;
  readonly kind: KindName;
  readonly parent: Item | null;
  readonly children?: readonly Item[];
  /* an icon chosen for this item, in place of the icon of its kind */
  readonly icon?: string;
  /* made and not yet given content */
  readonly fresh?: boolean;
  /* a level: the kinds it takes, and the repository it comes from */
  readonly accepts?: readonly KindName[];
  readonly link?: RepoLink;
  /* a level on the canvas: the flows between its children */
  readonly flows?: readonly (readonly [from: Item, to: Item])[];
  /* an application's source: the name it has on disk where that is not made from the item's name, the files its folder holds beside its items, and the ones git ignores */
  readonly file?: string;
  readonly files?: readonly string[];
  readonly ignoredFiles?: readonly string[];

  /* from the levels: how it shows where it has a setting of its own, the layout its canvas shares, and the places of the cards a person moved */
  readonly mode?: ViewMode;
  readonly showAll?: boolean;
  readonly shared?: ReadonlyMap<string, Point>;
  readonly own?: ReadonlyMap<string, Point>;

  /* from git: whether it has changes that are not committed, and who last changed it */
  readonly vcs?: Vcs;
  readonly lastChange?: string;

  /* from the content of an ontology model: its relations; and for an entity type its attributes as "name: type", which of them are required, the model it is defined in when it is a reference, and its place in the diagram */
  readonly rels?: readonly Relation[];
  readonly attrs?: readonly string[];
  readonly req?: readonly boolean[];
  readonly ext?: string;
  readonly ex?: number;
  readonly ey?: number;

  /* a file of the File System view that is not an item of its own, such as .adp; a folder of such files has entries. A page makes these itself. */
  readonly pseudo?: true;
  readonly ignored?: boolean;
  readonly entries?: readonly Item[];
}
/* an item as the store that owns a field writes it */
export type Writable<T> = { -readonly [K in keyof T]: T[K] };

export interface Problem { readonly s: Severity; readonly m: string; readonly node: Item }

export interface IconChoice { readonly nm: string; readonly label: string; readonly kw: string }
export type IconGroup = readonly [category: string, icons: readonly IconChoice[]];

export interface UserInfo { readonly id: string; readonly name: string; readonly email: string; readonly initials: string }
export interface ProjectInfo { readonly id: string; readonly name: string; readonly initials: string; readonly colour: string; readonly path: string; readonly branch: string; readonly about: string; readonly opened: string; readonly asset: boolean; readonly errors: number }

export interface Commit {
  /* its hash as git abbreviates it, the lane it is drawn in, and its parents by their hashes */
  readonly h: string; readonly l: number; readonly p: readonly string[];
  readonly m: string; readonly a: string; readonly w: string;
  /* how many days ago */
  readonly d: number;
  readonly touched: readonly { readonly node: Item; readonly s: Vcs }[];
}
export interface GitRef { readonly name: string; readonly label: string; readonly kind: 'local' | 'remote' | 'tag'; readonly hash: string }
export interface Change { readonly node: Item; readonly files: readonly { readonly f: string; readonly s: Vcs }[] }

/* a file beside the items: its text, what it holds in a few words, and how to colour it where its name does not say */
export interface FileText { readonly text: string; readonly holds: string; readonly syntax: string }

/* What the New Project wizard asks, and the recipes it makes a project of. A size says how large the solution is; a question offers options; a recipe is a set of elements that go in one area of the hierarchy. */
export interface SolutionSizeInfo { readonly id: string; readonly label: string; readonly about: string; readonly icon: string; readonly scale: number; readonly parts: readonly string[]; readonly suggests: readonly string[] }
export interface WizardOptionInfo { readonly id: string; readonly label: string; readonly about: string }
export interface WizardQuestionInfo { readonly id: string; readonly title: string; readonly about: string; readonly step: 'technology' | 'delivery'; readonly options: readonly WizardOptionInfo[] }
export interface RecipeElementInfo { readonly name: string; readonly kind: KindName; readonly icon: string; readonly children: readonly RecipeElementInfo[] }
export interface RecipeInfo { readonly id: string; readonly name: string; readonly about: string; readonly area: string; readonly elements: readonly RecipeElementInfo[]; readonly count: number }
export interface RecipeAreaInfo { readonly name: string; readonly icon: string }
/* the answers of the wizard, as a project is made of them */
export interface ProjectAnswers { readonly name: string; readonly path?: string; readonly branch?: string; readonly sizeId: string; readonly optionIds: readonly string[]; readonly recipeIds: readonly string[] }

/* one thing said in a conversation with the agent: by the user or by the agent, about which items, and for the agent what it did to get there */
export interface AgentMessage { readonly id: string; readonly mine: boolean; readonly text: string; readonly time: string; readonly items: readonly Item[]; readonly steps: readonly string[] }
/* a conversation as a list shows it: the day it was last spoken in, how much was said, and whether the agent is still answering */
export interface ConversationInfo { readonly id: string; readonly title: string; readonly day: string; readonly time: string; readonly messages: number; readonly last: string; readonly answering: boolean }

/* what a command answers: a few words for the user, when it has any */
export interface Done { readonly message: string }

export type DocMode = 'editor' | 'canvas';
export interface CanvasView { x: number; y: number; k: number }
/* a window's own state, as it is kept between visits; every id is the id of an item */
export interface WindowState {
  selectedId: string;
  documentId: string;
  tabIds: string[];
  expandedIds: string[];
  documentModes: Record<string, string>;
  views: Record<string, CanvasView>;
  ownViews: string[];
  docks: Record<string, string>;
  active: Record<string, string>;
  hiddenSeverities: string[];
  git: { branch: string; user: string; days: number };
  runTargetId: string;
  commitMessage?: string;
  /* the conversation the Agent tool window shows; empty for one that was not started yet */
  agentConversationId: string;
}

/* a document as a tool reads it: nothing in it can be written to; a tool that changes one makes a copy and hands it to the store */
export type DeepReadonly<T> = T extends (infer E)[] ? (number extends T['length'] ? readonly DeepReadonly<E>[] : { readonly [K in keyof T]: DeepReadonly<T[K]> }) : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
