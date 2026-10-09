# Contract: Shared Parts

What a second Notion add-on codes against: the parts under `src/` of `etalii.adp.ide.notion` that every add-on shares, and what is left for an add-on to bring. A contributor (User Story 5) and the tests for SC-007 read this. Decisions are in [research.md](../research.md) D3, D4, D5, D9, D12, D13 and D15.

## What an add-on consists of

A second add-on is one folder, `addons/<id>/`, and nothing under `src/`:

| File | Content |
| --- | --- |
| `index.html` | The page below, the same for every add-on but for its title |
| `addon.json` | The names of its specification and its binding, as [published-tree.md](published-tree.md) gives it |
| `<id>.dis`, `<name>.fbl`, `PROVENANCE.md` | Written by `node scripts/sync-specifications.mjs`, never by hand |

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gartner hype cycle graph</title>
    <link rel="stylesheet" href="addon.css">
  </head>
  <body data-state="loading">
    <script type="module" src="addon.js"></script>
  </body>
</html>
```

| Rule | Requirement |
| --- | --- |
| `addon.js` reads `addon.json` beside it, loads the two files it names, and builds the whole page; the add-on's page calls nothing | FR-028 |
| An add-on writes no script and no style. What a tool type needs and the shared parts lack is added to the shared parts, for every add-on | FR-027, NFR-005 |
| A specification that requires a feature the interpreter does not support opens with a finding that names the feature, and `docs/disl-support.md` lists it | FR-005, D5 |

## The parts

| Part | Folder | Takes | Gives |
| --- | --- | --- | --- |
| FBL library | `src/fbl/` | A binding and a body as bytes | Elements, findings and edits as splices. A copy of `src/core/fbl` of `etalii.adp.ide.vscode`, never edited here |
| DISL interpreter | `src/disl/` | A specification | The metamodel, the notation, the toolbox, the forms, the constraints, the behavior, and expressions evaluated |
| History | `src/history/` | Commands, and the handlers another part registers | A dispatcher and a history stack: run, undo, redo, and what is available. It names no tool type and knows neither Notion nor a store |
| Store | `src/store/` | A binding, a specification and a database id | An open document and the handlers of its commands: read, edit, undo, redo, as [store.md](store.md) keeps it |
| Canvas | `src/canvas/` | An interpreted specification and a model | The drawing and its gestures |
| Panels | `src/panels/` | An interpreted specification | The toolbox and the property grid, with their styles |
| Frame | `src/frame/` | `addon.json` and the address | The page of [addon-address.md](addon-address.md): states, keys, status, findings. A story's wiring is a module of its own under `src/frame/parts/`, attached through `src/frame/page.ts`; the build bundles those modules with `src/frame/main.ts` |

| Rule | Requirement |
| --- | --- |
| No file under `src/` names an element, attribute, relation, enum value, rule or sentence of a tool type | FR-004, US5 scenario 3 |
| `test/words.test.ts` enforces it: it takes those names from every specification and binding under `addons/` and fails when a file under `src/` holds one as a word of its own. `src/fbl/` is a copy and is checked as well | D15 |
| A name is held as a word of its own when it is a whole identifier, or a whole word of a string literal or a template literal, whatever its case; a part of a longer identifier and a word of a comment do not count | FR-004 |
| A name that DISL, FBL, TypeScript or the web platform uses as a word too, such as `id`, `name`, `text`, `width` or `from`, is exempt only by a line of `test/words.exempt.json`, which gives the name and which of the four uses it. A name that none of them uses is never exempt | FR-004 |
| The copied FBL library is another repository's code and uses ordinary words of its own. A name it uses so, such as a path's `segment`, is exempt inside `src/fbl/` only, by a line of the same file with the reason `library` and that scope. Outside `src/fbl/` the name is not exempt | FR-004, D4 |
| An icon is named by a specification with an id of Material Design Icons, and the panels hold the drawing of each id in one table. A word of such an id is exempt inside `src/panels/icons.ts` only, by a line with the reason `icons` and that scope | FR-004, NFR-001 |
| A part imports only parts above it in the table, the history imports no other part, and the frame alone imports all | FR-028 |
| The panels import neither the store nor the canvas, so that they serve an add-on with another canvas or another store | FR-027 |
| Nothing under `src/` but `src/store/session.ts` and `src/store/notion.ts` knows the service or a token | FR-010 |

## Interfaces

The names a second add-on, or a test, may rely on. A change to one of them is a change to this contract.

```ts
// src/disl/specification.ts
export function loadSpecification(json: unknown): Loaded<Specification>;
export interface Loaded<T> { readonly value: T; readonly findings: readonly Finding[]; }

// src/history/command.ts
export interface Command { readonly type: string; }             // plain data that cannot change: what is to happen, never how
export type CommandResult =
  | { readonly done: true; readonly inverse?: Command }         // no inverse: nothing changed, and nothing is recorded
  | { readonly done: false; readonly sentence: string };
export interface CommandHandler<C extends Command = Command> {
  readonly type: C['type'];                                     // exactly one handler per command type
  handle(command: C): CommandResult;                            // checks its own preconditions each time it runs
}
export interface HistoryEntry { readonly command: Command; readonly inverse: Command; }

// src/history/dispatcher.ts
export interface Dispatcher {
  register(handler: CommandHandler): void;
  dispatch(command: Command): CommandResult;                    // records nothing
}

// src/history/historyStack.ts
export function createHistoryStack(dispatcher: Dispatcher): HistoryStack;
export interface HistoryStack {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  run(command: Command): CommandResult;                         // dispatches, and keeps the entry when an inverse is reported
  undo(): CommandResult;                                        // dispatches the newest entry's inverse
  redo(): CommandResult;                                        // dispatches the newest undone entry's command again
  clear(): void;
  subscribe(listener: () => void): () => void;                  // told when canUndo or canRedo changes
}

// src/store/document.ts
export function openDocument(options: {
  specification: Specification;
  binding: FblDocument;          // the FBL document; the binding used is the fragment of persistence.binding
  database: string;              // the store parameter of the address
  notion: NotionCalls;           // src/store/notion.ts, or the in-memory Notion of the tests
}): Promise<OpenDocument>;

export interface OpenDocument {
  readonly model: Model;                       // elements and relations, as the specification's metamodel types them
  readonly findings: readonly Finding[];
  readonly state: 'ready' | 'read-only' | 'unreadable' | 'unprepared';
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  register(handler: CommandHandler): void;     // the handlers of this document's commands, brought by the store and by a part
  edit(change: ModelChange | readonly ModelChange[]): EditResult;   // one gesture, one command, one step, however many entries it changes
  undo(): EditResult;
  redo(): EditResult;
  readonly lacking: readonly LackingProperty[];   // what an unprepared database lacks, each with the existing properties it could be projected from
  prepare(project?: Readonly<Record<string, string>>): Promise<void>;   // needed name to existing name, for the properties the person chose to project
  reload(): Promise<void>;
  subscribe(listener: (event: DocumentEvent) => void): () => void;
  close(): void;
}

export type EditResult =
  | { readonly done: true }
  | { readonly done: false; readonly sentence: string };   // the specification's or the binding's sentence

export type DocumentEvent =
  | { readonly kind: 'changed' }                                   // the model differs; draw again
  | { readonly kind: 'status'; readonly status: 'idle' | 'loading' | 'storing' | 'offline' | 'failed' }
  | { readonly kind: 'reloaded'; readonly sentence: string };      // the store was read again; the history is empty

// src/panels/toolbox.ts
export function createToolbox(host: HTMLElement, options: {
  specification: Specification;
  readOnly: boolean;
  onPick(tool: string): void;                  // the tool's id in the specification's toolbox
}): Panel;

// src/panels/propertyGrid.ts
export function createPropertyGrid(host: HTMLElement, options: {
  specification: Specification;
  readOnly: boolean;
  onChange(element: string, form: string, attribute: string, value: unknown): EditResult;
  onChangeAll?(elements: readonly string[], form: string, attribute: string, value: unknown): EditResult;   // several selected elements, one edit
}): PropertyGrid;

export interface Panel {
  collapsed: boolean;
  dispose(): void;
}
export interface PropertyGrid extends Panel {
  show(selection: readonly string[], model: Model): void;   // element ids; empty shows the diagram's own form
}
```

`Finding` and `ModelChange` are the FBL library's types, with `severity`, the sentence and the element a finding concerns.

| Rule | Requirement |
| --- | --- |
| `edit`, `undo` and `redo` answer at once, with the model already changed or the refusal's sentence; the store is written afterwards, and `status` events say how that goes | SC-004, FR-019 |
| An edit that cannot be stored arrives as `status: 'failed'` followed by `reloaded` | FR-020 |
| `edit`, `undo` and `redo` of an open document are dispatches through its history stack: an edit runs a command, an undo dispatches the newest entry's inverse, and a redo dispatches its command again. There is no second way of applying a change | FR-026, FR-028 |
| A panel's `collapsed` is kept in the browser's local storage per add-on and per panel, under the key [addon-address.md](addon-address.md) names, and restored when a page of the add-on opens. Where the browser refuses the storage, the panel opens expanded | FR-017 |
| The toolbox shows every tool of the specification's `toolbox`, in its groups and order, with its `label`, `icon` and `doc` | FR-016, US5 scenario 1 |
| The property grid shows the form of the specification's `forms` whose `for` is the selection's type and whose `usage` holds `inspector`, with each item's `widget`, `visible`, `display`, `validate` and `parse` honoured | FR-016, US5 scenario 2 |
| A panel given `readOnly: true` shows no control that changes anything; the toolbox is then not created by the frame | FR-021 |
| Both panels work with a specification of another tool type with no line of them changed; the tests give them the mind map's | SC-007 |

## Styles

| Rule | Requirement |
| --- | --- |
| `src/panels/notion.css` is the only place a colour, a type size, a spacing, a corner or a focus ring is stated, as CSS custom properties whose names begin with `--notion-` | NFR-001, D13 |
| It states them twice: a light set, and a dark set under `:root[data-theme="dark"]`. The frame sets `data-theme` on `<html>` from the address's `theme`, else from the browser's `prefers-color-scheme`, and follows a change of the latter while the page is open | NFR-003 |
| `src/panels/panels.css` and every other style use those properties and no literal colour | NFR-005, US5 scenario 5 |
| The drawing takes its colours from the specification's theme tokens, not from these properties; only what the specification leaves open, such as the canvas background and the selection mark, uses them | NFR-002 |
| Every class the shared parts write begins with `adp-`; an add-on's page has none of its own | NFR-005 |
| Every departure from Notion's own styling is a row in `docs/styling.md`, with its reason | NFR-004, SC-011 |

## Keyboard and assistive technology

| Rule | Requirement |
| --- | --- |
| Every control of the toolbox and the property grid is reached with Tab and used with the keyboard alone, a toolbox item included: Enter on a tool places its element where the specification's toolbox says a keyboard drop goes, or at the centre of what the canvas shows | NFR-006, SC-012 |
| The focus is visible, drawn with `--notion-focus-ring` | NFR-006 |
| Each panel is a region with an accessible name, each control has one, and `id="message"` is announced as an alert | NFR-006 |
| Text and controls keep Notion's contrast in both appearances; `docs/styling.md` gives the measured pairs | NFR-007 |

## Scripts

| Command | Does |
| --- | --- |
| `node scripts/sync-specifications.mjs` | For each `addons/<id>/addon.json`: copies the specification from `etalii.adp` and its binding from the repository `persistence.binding` names, from the clones beside this one, and writes `PROVENANCE.md` |
| `node scripts/sync-fbl.mjs` | Copies `src/core/fbl` of `etalii.adp.ide.vscode` into `src/fbl/` and writes its `PROVENANCE.md` |
| `node scripts/sync-examples.mjs` | Copies the examples of each add-on's tool type into `test/examples/`, with the places the Visual Studio Code host computes for them. It runs that host's view module of the tool type, unchanged, from the clone beside this one at the recorded commit. A place is, per node and per part of a composite shape, its box (x, y, width and height), and per edge its two ends, in the canvas's unit at zoom 1. Two places are equal when no number differs by 0.5 or more |
| `node scripts/store.mjs put\|take <database> <file>` | As [store.md](store.md) gives it |
| `node scripts/service.mjs [--memory]` | Runs the service of [service.md](service.md) on `http://localhost:8787`; with `--memory`, against an in-memory Notion |
| `node scripts/build.mjs --out <dir>` | As [published-tree.md](published-tree.md) gives it |
| `npm test` | vitest: the interpreter, the store against an in-memory Notion, the history, the panels, the examples and the words test |

Each `sync` script takes `--check`, which copies nothing and exits with a code other than 0 when a copy differs from its record; `Build` runs the check that needs no other repository, the comparison with `PROVENANCE.md`.
