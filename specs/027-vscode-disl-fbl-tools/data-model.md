# Data Model: The Tools on DISL and FBL in Visual Studio Code

**Feature**: [vscode-disl-fbl-tools.spec.md](vscode-disl-fbl-tools.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

The entities of a definition (tool type, metamodel, notation, behaviour, persistence, surface, operation) are defined by [DISL](../../specifications/disl/DISL-specification.md) and [DESL](../../specifications/desl/DESL-specification.md), and those of a binding (claims, rule, slot, splice, registration, plugin) by [FBL](../../specifications/fbl/FBL-specification.md); the words are those of [docs/terminology.md](../../docs/terminology.md). This file does not repeat them. It names what the plug-in holds of them, the entities this feature adds, the ones it reshapes from specs 006 and 009, and the rules a test checks on each. The library's own entities (body text, loaded document, reading, model change, plan, edit) are in [spec 009's data model](../009-vscode-fbl-implementation/data-model.md) and are changed here only as [The FBL library at 0.6](#the-fbl-library-at-06) says.

## Overview

```text
definitions/<tool>/  ── Copied definition ── Provenance record (one row per file)
        │
        ▼ read at start
   Tool definition ──┬── Binding (1 for a diagram, 1 per format family for a designer) ── Claim
                     └── Plugin reference ── Plugin (in the plugin registry)
        │
        ▼ toolTypeFrom(definition, bindings, plugins)
     Tool type <View, Request> ── Support entry (what of the definition was not read as written)
        │
        ▼ one per open file
   Open document ── Source (text, registration) ── View (Scene | Table view) ── Finding
        │
        ▼ one per gesture
     Request ── Model change ── Plan (splices) ── Document edit (one WorkspaceEdit) | Outcome
```

## Definitions in the plug-in

### Copied definition

One tool type's definition, held unchanged in `etalii.adp.ide.vscode` under `definitions/<tool>/` (FR-001, [research R7](research.md#r7-the-definitions-are-files-in-the-plug-in)).

| Field | Meaning |
|---|---|
| `folder` | `<tool>`, the specification's file name without its extension, such as `mindmap`. |
| `specification` | The `.dis` or `.des` file. Exactly one. |
| `bindings` | The `.fbl` file its `persistence.binding` names. One file; it may hold several bindings. |
| `companion` | The `.md` file beside the specification. |
| `provenance` | `PROVENANCE.md`, the record below. |

Rules:

- Every file is byte for byte the git object its provenance row names; the folder is marked `-text`, so no line ending is converted.
- No file is edited in the plug-in's repository. A change is made in its source and copied again.
- A folder without all three files and a provenance record is not a tool type: the check fails, and at runtime nothing is offered for it.
- Removing the folder and running the sync command removes the tool type with no other change; adding it back restores it (SC-005).

The five folders of this feature:

| Folder | Specification | Binding copied from | Bindings |
|---|---|---|---|
| `gartner-hype-cycle-graph` | DISL 0.3, etalii.adp | etalii.adp.ide.standalone, by URL | 1, FBL 0.1 |
| `agent-behavior-modelling` | DISL 0.3, etalii.adp | etalii.adp.ide.standalone, relative reference that resolves there | 1, read by a plugin |
| `mindmap` | DISL 0.3, etalii.adp | etalii.adp.ide.standalone, by URL | 1, FBL 0.1, read by a plugin |
| `agent-activity-diagram` | DISL 0.4, etalii.adp | etalii.adp, beside it | 1, FBL 0.4 |
| `knowledge` | DESL 0.1, etalii.adp | etalii.adp, beside it | 3, FBL 0.4: YAML, JSON, XML |

### Provenance record

One row per copied file.

| Field | Meaning |
|---|---|
| `file` | The file's name in the folder. |
| `repository` | The `etalii-adp` repository it was copied from. |
| `path` | Its path in that repository. |
| `commit` | The commit it was copied at. |
| `sha256` | The SHA-256 of its bytes. |

Rules: `sync-definitions.mjs <commit>` writes the copies and the rows together, from git objects of the sibling clones and never from a working tree; `--check` copies nothing and fails when a file's bytes do not hash to its row, when a file has no row or a row no file, or when the manifest's contributions differ from what the definitions give (FR-002). The Build workflow runs `--check` on every pull request.

### Manifest contribution

What `package.json` holds for a tool type, written by the sync command and never by hand, because Visual Studio Code reads custom editors and commands from the manifest only.

| Field | From |
|---|---|
| custom editor `viewType` | The tool type's origin. |
| `displayName` | The definition's display name. |
| `selector` | The extensions of every claim of its bindings. |
| `priority` | `default` or `option`, by the claim's kind (see [Claim](#claim)). |
| commands and menu entries | The tool type's "Open With" command, and "Open as Text" for a claimed shared file. |

Rule: the contributions are a function of the copied definitions alone; a contribution with no folder, or a folder with no contribution, fails the check.

### Example and fixture copy

The examples and test fixtures a tool type's standalone module publishes, copied unchanged by `sync-examples.mjs` with repository, path and commit recorded (FR-014). They include `Fixtures/architecture.mm` and `Parity/mindmap.transcript.json` for the mind map, the three `.aad` examples with their recorded places, the four Knowledge examples, and etalii.adp's `knowledge-equivalence` fixture.

Rules: every example opens in its tool type and saves byte-identical; every edit a fixture records produces the fixture's bytes and its undo restores the bytes before it.

## Read from a definition

### Tool definition

A copied specification after the interpreter has read it: `src/core/disl/` for a `.dis`, `src/core/desl/` for a `.des`, which reuses the first's metamodel and expressions.

| Field | Meaning |
|---|---|
| `kind` | `diagram` or `designer`, from the file's language. |
| `language`, `version` | `disl` 0.3 or 0.4, or `desl` 0.1. |
| `origin` | `<vendor>/<type>`, the same in every ADP host. |
| `displayName` | The one display name of the tool type. |
| `metamodel` | Element and relation types, their attributes, id strategy and rules. |
| `notation` | Diagrams: shapes, parts, labels, edges, layout, rulers, filters, theme tokens for `light` and `dark`. |
| `surface` | Designers: `kind: "table"` with its value types, views, sorts, filters and groups. |
| `behaviour` | Toolbox, context entries, actions, operations, refusals with their sentences, clipboard. |
| `persistence` | `format: "fbl"`, the binding reference, and `view` for what of the viewer state is kept and where. |
| `plugins` | The plugin references it names. |
| `findings` | What reading the definition itself reported. |

Rules:

- A definition is read once when the plug-in starts, from its install folder; nothing is fetched, and a URL in `persistence.binding` is resolved to the copied file of that name.
- A construct the interpreter does not read is read as the nearest supported one, yields a finding that says so, and has a [support entry](#support-entry); the document still opens (edge case 1).
- A definition whose `persistence.format` is not `fbl`, or whose binding cannot be loaded, is not offered as a tool type.
- Nothing under `src/core/disl/`, `desl/`, `scene/` or `tool/` contains a type name, attribute name or message id of any copied definition; one test reads those folders for every such name.

### Binding and claim

A binding is an FBL binding as the library loads it (spec 009). A diagram has one; the Knowledge designer has three, one per format family, and the library routes a file to the one that claims it.

<a id="claim"></a>A claim decides whether a file opens in the tool type (FR-008, [research R6](research.md#r6-which-file-opens-in-which-tool)).

| Field | Meaning |
|---|---|
| `extensions` | The extensions claimed, with the dot. |
| `shared` | True when other tools own the extension too. |
| `marker` | None, a pattern within the first lines, or a root key with a value. |
| `registrationOnly` | True when the file is this type only where a registration says so. |
| `suggest` | What the text contains when the file looks like one; feeds the Explorer entry. |

| Claim kind | Manifest priority | Opens in the tool |
|---|---|---|
| Not shared (`.mm`, `.aad`, `.ghg`) | `default` | Always; when the binding has a marker the file does not match, the editor hands the file back to the text editor and reports nothing. |
| Shared with a marker (`.yaml`, `.yml`, `.json`, `.xml`, and `.ded` as `knowledge.fbl` states it) | `option` | When the marker matches, the text tab is reopened in the tool. |
| Shared, registration only (`.md` for Agent Behavior Modelling) | `option` | By choice: "Open With", the command, the Explorer entry. |

Rules:

- A file opens in a tool type only when extension and marker both match. A file of a shared extension that no binding claims opens exactly as before this feature, and the tool is offered for it only under "Open With" (SC-003).
- Where two bindings claim one extension, each file goes to the binding whose marker it matches, and to none when no marker matches.
- Only a tab on a file of the workspace is reopened: never a diff, a file from version control or an untitled document.
- `knowledge.fbl` claims `.ded` together with `.json` as `shared: true`, so `.ded` is registered as `option` and opens in the designer by its marker, as a `.json` file does.
- The mind map's binding has no marker today, so scenario 5 of User Story 1 cannot hold until [research R14](research.md#r14-what-is-raised-with-etaliiadp) item 1 is settled here; until then a `.mm` file that is no map opens empty and read-only with the reader's finding.

### Plugin reference and plugin

A plugin reference is what a definition or a binding names: an id, what it provides (`persistence`, `layout` or `action`), and whether it is required. A plugin is the code for one id under `src/core/plugins/<plugin>/`, registered by that id in the one plugin registry ([research R8](research.md#r8-plugins)).

| Id | Provides | Named by |
|---|---|---|
| `net.etalii.adp.freeplane.mm` | persistence: reads, and plans `add` with a position, `set`, `remove` and `move` | mind map |
| `net.etalii.adp.freeplane.mindmapLayout` | layout | mind map |
| `net.etalii.adp.ide.projectLinkPicker` | action: the platform's file and folder picker, storing a path relative to the document | mind map |
| `net.etalii.adp.etalii.abmMarkdown` | persistence | Agent Behavior Modelling |
| `net.etalii.adp.etalii.abmArrange` | action | Agent Behavior Modelling |

Rules: a persistence plugin implements the library's `PersistencePlugin`; a required plugin the registry lacks makes every document of the tool type open read-only with FBL's `std.pluginMissing`, which names the plugin; an optional one falls back as the definition says; every plugin carried is listed in the support record (FR-003, FR-004). The registry is the only place a plugin's id appears outside its own folder.

## The frame's contract

### Tool type

`DiagramType` of spec 006 becomes `ToolType<View, Request>` in `src/core/frame/toolType.ts` ([research R4](research.md#r4-one-frame-contract-generic-over-what-a-tool-shows)). A diagram is `ToolType<Scene, EditRequest>`; a designer is `ToolType<TableView, TableRequest>`. One function, `toolTypeFrom(definition, bindings, plugins)`, makes either. The signatures are in [contracts/tool-type.md](contracts/tool-type.md).

| Field | Meaning | Changed from spec 006 |
|---|---|---|
| `origin`, `displayName` | From the definition. | From the definition, not from code. |
| `kind` | `diagram` or `designer`. | New. |
| `claims` | The claims of its bindings. | Replaces `extensions` and the one `shared` flag. |
| `view(source, options)` | What the webview draws: a `View`. | Generic; was `ViewModel`. |
| `findings(source)` | The findings of the document. | Unchanged. |
| `toolbox`, `fields`, `actions` | What the frame's panels show. | Unchanged in shape; read from behaviour. |
| `edit(source, request)` | An [outcome](#request-and-outcome). | Generic in the request; an applied outcome carries splices. |
| `newDocument()` | The text of an empty document. | From the binding. |

Rules: a tool type is data in and data out, imports neither Visual Studio Code nor a browser, and is tested without them; the extension's list of tool types is exactly the folders under `definitions/` that load (FR-005); the same source and request always give the same outcome.

### Source and open document

A source is `{text, registration?}`: the document's text as the editor holds it and, where the binding has a `registration` block, the text of the `.adp` beside it. An open document is one custom editor on one text document.

| Field | Meaning |
|---|---|
| `uri` | The file. |
| `toolType` | The tool type whose binding claimed it. |
| `binding` | The binding that claimed it. |
| `source` | As above. Rebuilt from the text document after every change; never patched. |
| `reading` | The library's reading of the body. |
| `state` | See below. |
| `viewOptions` | Per editor, never saved unless the definition's `persistence.view` keeps it. |

Rules: the text document is the only store (FR-007); the body FBL reads is the UTF-8 encoding of that text, without a byte-order mark, which the editor keeps and writes back; a file with one kind of line ending is kept byte for byte, with or without a final newline; a file with mixed line endings is normalised by the editor on reading, which stays a row of `docs/parity.md` and now covers every tool type ([research R5](research.md#r5-an-edit-is-fbl-splices-applied-as-one-edit-of-the-text-document)).

#### States of an open document

| State | Meaning | What is offered |
|---|---|---|
| unclaimed | The binding's marker does not match. | Nothing: the file is handed to the text editor, with no finding. |
| editable | Read through its binding. | Everything the definition offers. |
| read-only | The binding is read-only, or a required plugin is missing. | The view and the findings; every request is refused with the reason. |
| unreadable | FBL reads the body as unreadable (`std.unparseable`). | An empty view and the one finding; nothing that edits, so nothing is saved. |

```text
            open                  marker fails
(file) ──────────────▶ claimed? ──────────────▶ unclaimed ─▶ (text editor)
                          │ yes
                          ▼
      ┌──────────────▶ editable ◀───────────────┐
      │ text becomes     │  │                   │ plugin present,
      │ readable         │  │ required plugin   │ binding writable
      │                  │  │ missing           │
 unreadable ◀────────────┘  └──────────▶ read-only
        text becomes unreadable
```

Transitions are caused only by the text document changing (a gesture, an edit in the text editor beside the tool, undo, redo, revert, a change on disk) and are computed by reading the new text again. "Open as Text" on a claimed shared file moves it to unclaimed for the session.

### Request and outcome

A request is one gesture. For a diagram it is spec 006's `EditRequest` (drop, move, resize, connect, move an end, drag a handle, rename, set a field, invoke an action), to which this feature adds what the definitions need: reparenting a node, folding, pinning and unpinning, and opening a link. For a designer it is a `TableRequest`: one of the operations the definition lists, on a property, a row, a cell or a view.

| Outcome | Meaning | Changed |
|---|---|---|
| `applied` | The splices of the body, and of the registration where the edit changed it, with what to select next. | Was the whole new text; now splices at byte offsets. |
| `refused` | Nothing changed; the definition's sentence for the refusal. | The sentence comes from the definition. |
| `confirm` | Ask with the platform's dialog; when confirmed the request is made again. | Unchanged. |
| `editInPlace`, `showField` | The request continues in the canvas or in ADP Properties. | Unchanged. |
| `open` | A linked file or folder is to be opened by the extension. | New, for the `open` action and the project link picker. |

Rules: one gesture is one request and at most one model transaction; a refused request writes nothing (User Story 2, scenario 4); a request in a state other than editable is refused; a confirmation is never a dialog drawn in the webview (FR-010).

### Document edit

How an applied outcome reaches the file (FR-006, FR-007).

| Field | Meaning |
|---|---|
| `splices` | The library's splices, offsets in bytes of the body before the edit. |
| `ranges` | The same, as positions of the text document, converted with the library's `utf8.ts`. |
| `registration` | None, the new text of the `.adp`, or its removal. |
| `label` | The undo label, from the definition's name for the operation. |

Rules:

- All splices of one gesture go into one `WorkspaceEdit`, so one gesture is one undo step, and undo restores the previous text byte for byte (SC-002).
- An edit changes only the bytes of its splices; a save with no edit changes none (SC-001).
- FBL's own history (section 7) is not used; Visual Studio Code's undo is the only history of the document.
- A position the user drags is written where the definition keeps it. Where the binding has a `registration` block it goes into the `.adp`, planned by the library's registration module, and never into the document (FR-009); the plug-in's layout history keeps that step among the document's edits. Where the definition keeps it in the document through `persistence.view.bind`, as the agent activity diagram does in its `view` mapping, it is a splice of the document and an ordinary undo step. The specification's User Story 2 says the registration keeps them; the definition is the reference, and the sentence is raised as [research R14](research.md#r14-what-is-raised-with-etaliiadp) item 6.

### Finding

Unchanged in shape from spec 006: `{rule, severity, message, line}`, with the definitions' four severities and a zero-based line. Its sources grow.

| Source | Example |
|---|---|
| The library's reading | `std.unparseable`, `std.duplicateId`, `fbl.dangling-reference`. |
| A rule the definition states | A document that breaks it (User Story 2, scenario 5). |
| The interpreter | A construct read as its nearest supported one. |
| The plugin registry | A required plugin that is missing. |

Rules: every finding of an open document is in the Problems panel with the line of its cause (FR-010); the findings of a document are a function of its text and registration, recomputed on every change; a file that is unclaimed has none.

## What a tool shows

### Scene

What a diagram's `view` returns, computed in `src/core/scene/` and drawn by `src/webview/diagram/scene.ts` ([research R3](research.md#r3-a-scene-is-computed-in-the-core-and-drawn-by-the-webview)). It replaces spec 006's `ViewModel` with its hand-written `DiagramDefinition` per type.

| Field | Meaning |
|---|---|
| `nodes` | Each placed: id, type, bounds, shape, parts, labels, compartments with their items, icon, whether it is folded or pinned. |
| `edges` | Each: id, type, its two ends with the part each is anchored on, its line and its markers. |
| `chrome` | What the notation shows around the drawing: rulers, the filter and its kept value, a legend. |
| `readOnly`, `notice` | As spec 006. |
| `tokens` | The theme tokens in use, each with its value for `light` and for `dark`. |

Rules: a scene is plain data and holds nothing of a definition's vocabulary beyond ids; the same source and view options give the same scene, so the same file gives the same picture; a position comes from the registration or the document's view state where one is kept, and from the definition's layout (`force`, `tidyTree`, or a layout plugin) otherwise; a layout with `respect: "pinned"` never moves a pinned node. The webview reads `light` for the light and high contrast light theme kinds and `dark` for the dark and high contrast kinds; in both high contrast kinds outlines take the editor's contrast border and text its foreground; a token with no value for a mode takes the editor's colour for that role ([research R13](research.md#r13-colours)).

### Table view

What a designer's `view` returns, computed in `src/core/tool/` and drawn by `src/webview/table/` ([research R11](research.md#r11-the-knowledge-designer), FR-012).

| Field | Meaning |
|---|---|
| `properties` | The columns in order: id, name, value type (one of the definition's nine), its options, whether it can be edited. |
| `rows` | Each: id and its cells by property. |
| `views` | The definition's views of the table, and which is shown. |
| `sorts`, `filters`, `groups` | Those of the view shown, applied to `rows`. |
| `operations` | Which of the definition's operations are offered for the selection, each enabled or with the reason it is not. |
| `readOnly`, `notice` | As for a scene. |

Rules: every operation the definition lists is offered where the definition says, and none it does not list; an operation is one DESL transaction over model changes and so one request; the same knowledge read through the YAML, the JSON and the XML binding gives equal table views (User Story 3, scenario 3), proven by the `knowledge-equivalence` fixture; where the definition calls for properties of a selection, ADP Properties serves it with the same fields a diagram's selection gets.

## The support record

### Support entry

One row of `docs/disl-support.md`, whose form is in [contracts/support-record.md](contracts/support-record.md) (FR-003, FR-004). `src/core/disl/support.ts` holds the same list as data, so the record and what the interpreter reports cannot differ.

| Field | Meaning |
|---|---|
| `kind` | `feature` (of DISL or DESL), `plugin`, `difference` (between a tool type here and its definition) or `code` (code specific to one tool type). |
| `subject` | The feature and its section, the plugin's id, or the tool type and what differs. |
| `status` | `implemented`, `approximated` or `not implemented`. |
| `instead` | For anything not implemented as written: what the plug-in does instead. |
| `reason` | Required for `difference` and `code`. |
| `issue` | The etalii.adp issue, where one was filed. |

Rules: the record states the DISL, DESL and FBL versions read; every construct the five definitions use has an entry; every plugin in the registry has one; every place where code names one tool type has a `code` entry with its reason, and the only such places are plugins and what a definition cannot state; an entry is added by the change that builds or meets what it describes.

### Candidate change

A difference found between a definition and its standalone module, or a construct DISL, DESL or FBL could not state (FR-018).

| Field | Meaning |
|---|---|
| `subject` | The definition, specification or fixture concerned. |
| `found` | What was found, and where. |
| `issue` | The issue in etalii.adp. |
| `metBy` | The pull request in `etalii.adp.ide.vscode` that first meets it. |

States: found, then filed, then settled in etalii.adp. Rules: it is filed before the pull request that meets it and never settled in the plug-in; where two hosts write different bytes for one edit the question is settled here and by neither host; every one is filed before the feature's last pull request is merged (SC-006). Research R14 lists the seven found while planning.

## The FBL library at 0.6

Spec 009's entities stay; these change ([research R1](research.md#r1-the-fbl-library-goes-to-fbl-06-first)).

| Entity | Change |
|---|---|
| Loaded document | Accepts `fbl` 0.1 to 0.6 without a warning; a document may hold one binding per format family, and a file is routed to the binding that claims it (0.3). |
| Model change | Gains `move {id, parent, position?}`, and a position on `add` (0.2). `by: "id"` addresses an entry by its id (0.3). |
| Plan | A persistence plugin may plan `move` and a positioned `add` (0.2, section 11.2). Nested mappings are created and removed with their entries: `at: "end"`, `child`, `remove-empty-levels` (0.4). |
| Reading | A slot read from a scalar has the value 0.5 states; an empty value on an insert does what 0.6 states. |
| Fixture | etalii.adp's nineteen fixture folders, each splice for splice; `test/core/fbl/baseline.json` lists the counterpart of every test standalone's library gained since `25fc7b4a`. |

Rules: every rule of spec 009's data model still holds; nothing a user sees changes in the pull request that makes this change; a binding written for an older minor version (the hype cycle graph's and the mind map's are 0.1) is read as that version says, and whether a binding is expected to follow the library is [research R14](research.md#r14-what-is-raised-with-etaliiadp) item 5.

## Requirements to entities

| Requirement | Entity |
|---|---|
| FR-001, FR-002, SC-005 | Copied definition, provenance record, manifest contribution |
| FR-003, FR-004 | Tool definition, plugin, support entry |
| FR-005 | Tool type, manifest contribution |
| FR-006, FR-007, SC-001, SC-002 | Open document, document edit |
| FR-008, SC-003 | Claim, states of an open document |
| FR-009 | Document edit, source |
| FR-010 | Finding, outcome |
| FR-011, FR-012 | Scene, table view |
| FR-013, SC-004 | Tool type, plugin |
| FR-014, FR-015, FR-016 | Example and fixture copy |
| FR-017 | Tool definition (kind, display name, origin) |
| FR-018, SC-006 | Candidate change |
