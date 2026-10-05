# Contract: the frame and a diagram type

What the frame gives a diagram type and what a diagram type gives the frame (FR-005, FR-030 to FR-041, SC-011). It is the contract the third diagram type will be written against, so it is stated without reference to either of the first two. Shapes are given as TypeScript declarations because that is the form the contract takes in the repository (`src/frame/api.ts`); they are signatures, not implementations.

## The layer rule

| Layer | Folders | May import | Must not import |
|---|---|---|---|
| core | `src/frame/core/`, `src/diagrams/*/core/` | other core files, `yaml` | `vscode`, the DOM, `preact`, host, view |
| host | `src/frame/host/`, `src/diagrams/*/host/` | core, `vscode` | view, the DOM |
| view | `src/frame/view/`, `src/diagrams/*/view/` | core, `preact` | `vscode`, host |

And across diagram types: nothing under `src/diagrams/<a>/` imports from `src/diagrams/<b>/`, and nothing under `src/frame/` imports from `src/diagrams/`. ESLint's restricted-imports rule enforces both, and `npm run lint` fails on a breach. The one file that names the diagram types is `src/diagrams/index.ts`, the registration SC-011 allows a new type to change, together with the type's own contributions in `package.json`.

## What a diagram type supplies

```ts
/** One diagram type: its identity, and its three parts. */
interface DiagramType<Model, ViewState> {
  origin: string;                 // "gartner/hypecycle-graph"
  displayName: string;            // "Gartner hype cycle graph"
  viewType: string;               // "etalii.adp.gartner.hypecycle-graph"
  usesRegistration: boolean;      // whether placed positions are kept in the .adp
  core: DiagramCore<Model>;
  host: DiagramHost<Model>;
  view: () => Promise<DiagramView<Model, ViewState>>;   // resolved in the webview only
}

/** Pure. No vscode, no DOM. */
interface DiagramCore<Model> {
  /** Never throws. An unreadable body gives an empty model with `readOnly` set to the definition's explanation. */
  read(body: string, registration: Registration | undefined): Reading<Model>;
  /** The content of a new document. */
  create(name: string): string;
  /** An intent becomes splices, a refusal, or a question to ask first. */
  edit(state: DocumentState<Model>, intent: Intent, answer?: boolean): EditResult;
}

interface Reading<Model> {
  model: Model;
  findings: Finding[];            // rule id, severity, line range, message
  readOnly?: string;              // the sentence to show, when nothing may be edited
}

type EditResult =
  | { kind: "splices"; label: string; body: Splice[]; registration?: RegistrationChange; select?: string[]; editLabelOf?: string }
  | { kind: "refused"; sentence: string }
  | { kind: "question"; title: string; sentence: string; danger: boolean };

/** Runs in the extension host; computed from the model, not from the DOM. */
interface DiagramHost<Model> {
  toolbox(model: Model): ToolboxGroup[];
  properties(model: Model, selection: string[]): PropertyGroup[];
  actions(model: Model, selection: string[]): Action[];      // context menu and command enablement
}

/** Runs in the webview. */
interface DiagramView<Model, ViewState> {
  initialViewState(): ViewState;                              // never saved, never remembered
  scene(model: Model, view: ViewState, viewport: Rect): Scene;
  chrome?(model: Model, view: ViewState, set: (next: ViewState) => void): ChromeParts;   // filter, legend, switches, ruler rungs
  gestures: GestureTable<Model, ViewState>;                   // per element kind: snap, preview, and the intent on release
  drop(model: Model, view: ViewState, entry: string, at: Point): Intent | Refusal;
  stylesheet: string;                                         // the definition's theme tokens as CSS variables
}
```

Obligations on a diagram type:

- `read` followed by no edit leaves the document untouched, and `edit` returns splices that change only the lines the edit concerns (FR-009, FR-010).
- `edit` decides everything: the view's preview is a courtesy, and an intent the view would not have offered is refused with the definition's sentence, not applied.
- Sentences shown to the user (refusals, questions, the read-only explanation, finding messages) are the definition's, verbatim.
- `scene` is a pure function, so a test can ask what is drawn for any example without a browser.

## What the frame supplies

To core: `LineDocument` (text as lines with their endings, the dominant ending, the final newline), `Splice` (replace a range of lines by lines; its inverse), `Registration` and `RegistrationChange` (FBL section 8), `rowPacking`, `textWidth`.

To host, per open document, a **session** that:

- reads through the diagram type on every change of the text, whoever made it, and publishes the findings to the Problems panel;
- posts the model to every view of the document, stamped with the document's version;
- takes intents, drops those computed from an older version, runs `edit`, asks questions with the platform's dialog, applies splices as one `WorkspaceEdit`, and returns refusals to the view that sent the intent;
- holds the pending registration and the edit log that ties it to the document's undo history, writes it when the document is saved and drops it when the document is reverted (research R6);
- sets the context keys the commands and shortcuts depend on, and feeds the ADP Toolbox and ADP Properties from whichever diagram has the focus.

To view: the canvas (pan, zoom, selection, in-place text editing, drag and resize through the type's snap, drawing a relation, handles, tooltips, context menu, the refusal line, culling to the viewport), the ruler strip, the chrome slots, the shape helpers (`outline`, `segments`), and the seven property controls.

## Messages

The host and its webviews exchange JSON messages. Every message has a `type`; those that concern a document carry its `version`.

| Direction | `type` | Carries |
|---|---|---|
| host to canvas | `model` | version, model, read-only sentence, selection to make, label to edit |
| host to canvas | `refused` | the intent's id, the sentence |
| host to canvas | `command` | a command the workbench ran for this diagram (rename, remove, arrange, zoom) |
| host to canvas | `drop` | a toolbox entry to add at the middle of what is in view |
| canvas to host | `ready` | nothing; the host answers with `model` |
| canvas to host | `intent` | id, version, the intent |
| canvas to host | `selection` | the ids selected |
| host to toolbox | `toolbox` | groups and entries of the focused diagram, or none |
| toolbox to host | `add` | the entry, for the keyboard's add |
| host to properties | `properties` | groups and fields for the selection, or none; a refusal for a field |
| properties to host | `intent` | as from the canvas |

A drag from the toolbox carries the entry as drag data with the type `application/vnd.etalii.adp.toolbox`; the canvas that takes the drop turns it into an intent through the diagram type's `drop`.

Webviews are created with scripts enabled, local resources limited to `dist/`, and a content security policy that allows only the bundle's script, by nonce, and the bundle's stylesheet: no remote source of any kind (FR-001).

## The test seam

Registered only when the environment variable `ADP_TEST` is `1` at activation; not in `package.json`.

```ts
// vscode.commands.executeCommand("etalii.adp.test.drive", uri, steps) resolves to one result per step.
type Step =
  | { do: "pointer"; kind: "down" | "move" | "up" | "click" | "doubleClick" | "rightDrag"; x: number; y: number }   // canvas units
  | { do: "key"; key: string; alt?: boolean; ctrl?: boolean; shift?: boolean }
  | { do: "type"; text: string }                                   // into the in-place editor that is open
  | { do: "drop"; entry: string; x: number; y: number }            // a toolbox entry
  | { do: "field"; label: string; value: string }                  // a field of ADP Properties
  | { do: "viewState"; set: Record<string, unknown> }              // a chrome switch or the tag filter
  | { do: "query"; what: "elements" | "selection" | "refusal" | "properties" | "toolbox" | "chrome" };
```

Pointer and key steps are dispatched as DOM events on the canvas inside the webview, so they run the code a user's gesture runs. A `query` returns what is drawn: for `elements`, each element's id, kind, bounds, classes and label.
