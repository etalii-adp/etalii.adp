# Contract: the frame and a tool type

**Feature**: [vscode-disl-fbl-tools.spec.md](../vscode-disl-fbl-tools.spec.md) | **Plan**: [plan.md](../plan.md) | **Research**: [R4](../research.md#r4-one-frame-contract-generic-over-what-a-tool-shows), [R5](../research.md#r5-an-edit-is-fbl-splices-applied-as-one-edit-of-the-text-document), [R6](../research.md#r6-which-file-opens-in-which-tool), [R8](../research.md#r8-plugins)

What the frame asks of a tool type and what the extension registers for it (FR-003, FR-005 to FR-012). It replaces `DiagramType` of `src/core/frame/diagramType.ts` (spec 006, [contracts/frame-api.md](../../006-vscode-plugin/contracts/frame-api.md)) and is the contract every test of a tool type is written against. Paths are in `etalii.adp.ide.vscode`. Shapes are TypeScript declarations because that is the form the contract takes in the repository; they are signatures, not implementations.

## The layer rule

| Layer | Folders | May import | Must not import |
|---|---|---|---|
| core | `src/core/` | other core files, `yaml`, `@marcbachmann/cel-js` | `vscode`, the DOM, `src/extension/`, `src/webview/` |
| extension | `src/extension/` | core, `vscode` | the DOM, `src/webview/` |
| webview | `src/webview/` | `src/core/frame/`, `src/core/scene/` (types only) | `vscode`, `src/extension/`, anything that reads a definition |

Nothing under `src/core/disl/`, `src/core/desl/`, `src/core/scene/` or `src/core/tool/` names a tool type: no origin, no type, attribute or message id of a copied definition. One test reads those folders for every such name and fails on a match. Code that belongs to one tool type lives only under `src/core/plugins/<plugin>/` and is reached only through the plugin registry.

## The contract

In `src/core/frame/toolType.ts`:

```ts
/** One tool type as the frame sees it, generic over what it shows and what a gesture asks. */
export interface ToolType<View, Request> {
  /** The tool type's origin, `<vendor>/<type>`, the same in every ADP host. */
  readonly origin: string;
  /** The tool's kind, as docs/terminology.md has it. */
  readonly kind: 'diagram' | 'designer';
  /** The one display name of the tool type. */
  readonly displayName: string;
  /** What the binding claims: one entry per binding of the definition. */
  readonly claims: readonly Claim[];
  /** Whether a file is this tool type's: extension and marker both (FR-008). */
  claimed(fileName: string, text: string): boolean;
  /** Whether a file of a shared extension looks like this type, from the binding's `claims.suggest`. */
  suggests(fileName: string, text: string): boolean;
  /** Everything wrong with the document. Never throws. */
  findings(source: Source): Finding[];
  /** What to show. Never throws. */
  view(source: Source, options: ViewOptions): View;
  toolbox(source: Source): ToolboxEntry[];
  /** The rows of ADP Properties for a selection; empty when there is nothing to show. */
  fields(source: Source, selection: readonly string[]): Field[];
  /** What can be done to the selection, or to the document when it is empty. */
  actions(source: Source, selection: readonly string[]): Action[];
  /** Applies one request to the document as it is now. `confirmed` answers an earlier `confirm`. */
  edit(source: Source, request: Request, options: ViewOptions, confirmed: boolean): EditOutcome;
  /** The text of a new document, from the binding's template. */
  newDocument(name: string): string;
}

/** A diagram and a designer. */
export type DiagramToolType = ToolType<Scene, EditRequest>;
export type DesignerToolType = ToolType<TableView, TableRequest>;

/** One binding's claim, as its FBL `claims` states it. */
export interface Claim {
  /** File extensions without the dot. */
  readonly extensions: readonly string[];
  /** True when the extensions belong to other tools too. */
  readonly shared: boolean;
  /** True when the binding has a marker a file must match. */
  readonly marker: boolean;
  /** True when the binding claims the extension for its registration only. */
  readonly registrationOnly: boolean;
}

/** A document as a tool type reads it: its text and, where one exists, its registration's. */
export interface Source {
  readonly fileName: string;
  readonly text: string;
  readonly registration?: string;
}

/** The identifier a tool type registers under: `etalii.adp.<vendor>.<type>`. */
export function viewTypeOf(type: Pick<ToolType<unknown, unknown>, 'origin'>): string;
```

`Finding`, `Severity`, `Box`, `ViewOptions`, `ToolboxEntry`, `Control`, `Field`, `Action` and `EditRequest` keep the shapes they have in `diagramType.ts` today. `ViewElement`, `ViewRelation` and `ViewModel` are removed with the two hand-coded diagrams (User Story 4); until then `DiagramType` stays as `ToolType<ViewModel, EditRequest>`.

`Scene` is what `src/core/scene/` computes: plain data, every node placed with its shape, parts and labels, every edge with its ends and its line. `TableView` and `TableRequest` are what `src/core/tool/` declares for DESL's `table` surface: properties, rows and cells with the views, sorts, filters and groups of the definition, and a request that names one of the definition's operations with its arguments. Both carry `readOnly` and an optional `notice`, as `ViewModel` does today.

### The outcome of an edit

```ts
export type EditOutcome =
  /** The splices of the gesture, and the registration's new text when the edit changed it (null removes it). */
  | { readonly kind: 'applied'; readonly splices: readonly TextSplice[]; readonly registration?: string | null; readonly select?: string; readonly editLabel?: boolean; readonly multiline?: boolean }
  /** Nothing changed, and this is the definition's sentence to show. */
  | { readonly kind: 'refused'; readonly sentence: string }
  /** Ask first; when confirmed, the same request is made again with `confirmed`. */
  | { readonly kind: 'confirm'; readonly title: string; readonly message: string; readonly confirmLabel: string; readonly danger: boolean }
  /** The request asks for text edited in place before anything is written. */
  | { readonly kind: 'editInPlace'; readonly id: string; readonly multiline: boolean }
  /** The request is answered in ADP Properties: the named field is where the user goes on. */
  | { readonly kind: 'showField'; readonly field: string }
  /** A linked file or folder is opened by the extension, with `vscode.open`; nothing is written. */
  | { readonly kind: 'open'; readonly path: string };

/** One FBL splice of the body: a range of UTF-8 bytes of `Source.text` and what replaces it. */
export interface TextSplice {
  readonly offset: number;
  readonly length: number;
  readonly text: string;
}
```

`applied` carries splices where it carried the whole new text: the extension converts each byte offset to a position with the FBL library's `utf8.ts` and puts every splice of the gesture into one `WorkspaceEdit` (`src/extension/toolEditor.ts`).

### Making a tool type from a definition

In `src/core/tool/`:

```ts
/** A definition, its bindings and the plugins it may name, as one tool type. Never throws. */
export function toolTypeFrom(definition: Definition, bindings: readonly FblBinding[], plugins: PluginRegistry): ToolType<Scene, EditRequest> | ToolType<TableView, TableRequest>;
```

`definition` is the parsed `.dis` or `.des` file with its companion; `bindings` are those its `persistence.binding` or `persistence.bindings` names, resolved to the copied file of that name. `src/extension/toolTypes.ts` calls it once for every folder of `definitions/` when the plug-in starts, and nothing else lists the tool types.

## Obligations on a tool type

- **Read and save unchanged.** `view` and `findings` followed by no edit leave the document untouched; a save without an edit writes the bytes that were read (FR-006, SC-001).
- **Splices only.** `edit` returns the splices its binding plans for one model change, and nothing outside them changes (FR-006, SC-002). FBL's own history is not used.
- **One gesture, one undo step.** Every splice of a request is in one `applied` outcome (FR-007).
- **`edit` decides everything.** A request the view would not have offered is refused with the definition's sentence, not applied.
- **The definition's words.** Refusals, confirmations, the read-only notice and finding messages are the definition's sentences, verbatim (FR-010).
- **Positions.** Where a definition keeps positions in a registration, a dragged position is in `registration` and never in a splice (FR-009). Where a definition keeps them in the document through `persistence.view.bind`, as the agent activity diagram does, it is a splice.
- **Unreadable body.** `view` gives an empty view with `readOnly` true and the reader's finding as `notice`; `toolbox` and `actions` give nothing that edits; `edit` refuses.
- **Unsupported construct.** The document still opens, the construct is read as the nearest supported one, and `findings` holds one finding that says so: `disl.unsupported-feature` for a feature of `language.requires`, `disl.unsupported-conformance` for a higher conformance class.
- **Pure.** Every method is a function of its arguments, so each is tested without Visual Studio Code and without a browser.

## Plugins

A plugin a definition names is code under `src/core/plugins/<plugin>/`, registered by its id.

```ts
export interface PluginRegistry {
  persistence(id: string): PersistencePlugin | undefined;   // the FBL library's own interface
  layout(id: string): LayoutPlugin | undefined;
  action(id: string): ActionPlugin | undefined;
}
```

| Plugin id | Provides | Folder |
|---|---|---|
| `net.etalii.adp.freeplane.mm` | persistence | `src/core/plugins/freeplane-mm/` |
| `net.etalii.adp.freeplane.mindmapLayout` | layout | `src/core/plugins/mindmap-layout/` |
| `net.etalii.adp.ide.projectLinkPicker` | action | the extension's `showOpenDialog` |
| `net.etalii.adp.etalii.abmMarkdown` | persistence | `src/core/plugins/abm-markdown/` |
| `net.etalii.adp.etalii.abmArrange` | action | `src/core/plugins/abm-arrange/` |

A definition that names a plugin with `required: true` that the registry lacks gives a tool type whose every document is read-only, with FBL's `std.pluginMissing`, which names the plugin. An optional plugin the registry lacks falls back as the definition's `fallback` says.

## What the extension registers

Every entry below is written into `package.json` by `scripts/sync-definitions.mjs` from the copied definitions ([definitions.md](definitions.md)); none is written by hand.

### Custom editors

The `viewType` is `viewTypeOf` of the origin. The selector and priority follow each claim:

| Claim | `priority` | Opens in the tool |
|---|---|---|
| An extension that is not `shared` | `default` | Always, unless the binding has a marker the file does not match: then the file is handed back to the text editor with `vscode.openWith` and nothing is reported |
| A `shared` extension with a marker | `option` | When the marker matches, the text tab is reopened in the tool with `vscode.openWith`. A file the user chose "Open as Text" for stays text for the session |
| A `shared` extension claimed `registrationOnly` | `option` | By choice: "Open With", the command, and the Explorer entry for files `suggests` accepts |

Only a tab on a file of the workspace is reopened: never a diff, a file from version control, or an untitled document.

| Tool type | Kind | Origin | `viewType` | `filenamePattern` | `priority` |
|---|---|---|---|---|---|
| Gartner hype cycle graph | Diagram | `gartner/hypecycle-graph` | `etalii.adp.gartner.hypecycle-graph` | `*.ghg` | `default` |
| Agent Behavior Modelling | Diagram | `etalii/agent-behavior-modelling` | `etalii.adp.etalii.agent-behavior-modelling` | `*.md` | `option` |
| Mind map | Diagram | `freeplane/mindmap` | `etalii.adp.freeplane.mindmap` | `*.mm` | `default` |
| Agent activity diagram | Diagram | `etalii/agent-activity-diagram` | `etalii.adp.etalii.agent-activity-diagram` | `*.aad` | `default` |
| Knowledge | Designer | `etalii/knowledge` | `etalii.adp.etalii.knowledge` | `*.yaml`, `*.yml`, `*.json`, `*.ded`, `*.xml` | `option` |

`etalii.adp.registration` for `*.adp` stays as it is.

### Commands

| Command | For |
|---|---|
| `etalii.adp.new.<vendor>.<type>` | every tool type whose binding has a template: a new document |
| `etalii.adp.openAs.<vendor>.<type>` | every tool type with a `shared` claim: open the active file in the tool |
| `etalii.adp.openAsText` | every tool type: the file in the text editor, and for a claimed shared file, text for the session |

`<vendor>.<type>` is the origin with its `/` as `.`, as in the `viewType`. The commands the plug-in has today (`etalii.adp.rename`, `etalii.adp.remove`, `etalii.adp.arrangeDiagram`, `etalii.adp.focusProperties`, `etalii.adp.focusToolbox`, `etalii.adp.undoLayout`, `etalii.adp.redoLayout` and the rest) keep their identifiers; an action a definition states that has no command of its own is reached through the canvas, the table and their menus.

### Findings

A finding is a diagnostic in the Problems panel on the line of its cause, with the finding's `rule` as its code, the definition's message as its text and `Finding.severity` mapped one to one (`error`, `warning`, `information`, `hint`).

## Messages

The messages of `src/core/frame/protocol.ts` keep their `type` names and directions. Two payloads become the tool type's own: `view` carries the tool type's `View` (a `Scene` or a `TableView`) with the `kind` of the tool beside `origin`, and `edit` carries its `Request`. Because the payload of `view` changes, `protocolVersion` and every message's `v` become `2`.

| Direction | `type` | Carries |
|---|---|---|
| extension to canvas or table | `view` | `origin`, `kind`, `view`, `actions`, `version` |
| extension to canvas or table | `outcome` | `seq`, `result` (`applied`, `refused`, `cancelled`), `sentence` |
| extension to canvas or table | `reveal` | `id`, `editLabel`, `multiline` |
| extension to canvas or table | `command` | `command` |
| extension to canvas or table | `addAtCentre` | `entry` |
| canvas or table to extension | `ready` | nothing |
| canvas or table to extension | `viewOptions` | `options` |
| canvas or table to extension | `selection` | `ids` |
| canvas or table to extension | `editing` | `active` |
| canvas or table to extension | `edit` | `seq`, `request`, `version` |

The messages of ADP Properties (`fields`, `fieldOutcome`, `ready`, `setField`) and of the ADP Toolbox (`entries`, `ready`, `add`) are unchanged, and serve a designer as they serve a diagram (FR-012).

## Colours

A webview takes the mode of a definition's theme from Visual Studio Code's theme kind: light and high contrast light read `light`, dark and high contrast read `dark`. In both high contrast kinds outlines take the editor's contrast border and text its foreground. A token the definition binds to no mode falls back to the editor's own colour for that role.
