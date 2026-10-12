# Research: The Tools on DISL and FBL in Visual Studio Code

Read on 2026-10-12: `etalii.adp` at `develop` `60fb7a0`, `etalii.adp.ide.vscode` at `271a92c`, `etalii.adp.ide.notion` at `4a0cdb4`, `etalii.adp.ide.standalone` at `5756a07`.

## R1. The FBL library goes to FBL 0.6 first

**Decision**: `src/core/fbl/` is brought from FBL 0.1 to FBL 0.6 before any tool is connected to it, in a pull request of its own that changes nothing a user sees. It is done as spec 009 did the first port: standalone's library is the worked example, FBL is the referee, and etalii.adp's fixtures are the proof.

**Rationale**: the specification takes "the FBL implementation of spec 009" as given. It is FBL 0.1: `documentLoader.ts` warns on any newer minor version, a model change is `add`, `set`, `remove`, `place` or `identify`, and `docs/fbl.md` lists moving an element to another parent as not built. Three of the five tool types need more.

| Tool type | Binding | Needs |
|---|---|---|
| Mind map | `fbl: "0.1"`, read by a plugin | FBL 0.2: a plugin plans a `move` and an `add` with a position (section 11.2) |
| Agent activity diagram | `fbl: "0.4"` | 0.3's `by: "id"`; 0.4's nested mappings created and removed with their entries (`at: "end"`, `child`, `remove-empty-levels`) |
| Knowledge designer | `fbl: "0.4"`, three bindings | 0.3's one binding per format family; the same 0.4 constructs |

The target is 0.6 and not 0.4 because the fixtures decide bytes, and etalii.adp's fixtures are written for 0.6: 0.5 says what a slot reads from a scalar, and 0.6 says what an empty value does on an insert. Stopping at 0.4 would leave the two places where 0.5 gives a meaning 0.4 left open to this host's guess.

The size is known. Standalone's library changed in 43 files between the commit spec 009 ported (`25fc7b4a`) and today, about 1,000 lines added; etalii.adp went from 8 fixture folders to 19. `npm run sync-fbl` already refreshes the fixtures and the real files.

**Alternatives considered**: a feature of its own, as 009 was. It would be cleaner to review, and it would hold the mind map back behind a second specification for work this one cannot be done without. Building only what each tool needs as its story arrives: three partial ports of one library, each claiming a version it does not fully read.

**Follows from it**: the Notion add-ons copy this library byte for byte. They take the newer copy with their own `sync-fbl`, in a change of their own.

## R2. The interpreter is taken from the Notion add-ons

**Decision**: the plug-in gets `src/core/disl/`, taken from `etalii.adp.ide.notion`'s `src/disl/` at `4a0cdb4` and owned here from then on, with its origin recorded in `src/core/disl/ORIGIN.md`. Its tests under `test/disl/` come with it.

**Rationale**: it is 4,967 lines in 14 files, one module per DISL section, each returning its value with findings. It imports no DOM and nothing of Notion: only `@marcbachmann/cel-js` and four files of `../fbl/`, and Notion's `src/fbl/` is a byte-for-byte copy of this plug-in's, so the imports resolve unchanged. It reads the whole of the hype cycle graph's definition. A second interpreter written here would be a third reading of DISL in TypeScript, beside standalone's client and Notion's.

**Owned, not copied**: Notion's FBL is a copy that is never edited, because the plug-in's is the complete one. The interpreter is the other way round: it has to grow here (R9, R10, R12). Whether Notion later takes it back, as it takes FBL, is that repository's call.

**Alternatives considered**: porting standalone's client compiler: it compiles notation only, and standalone's metamodel, behaviour and persistence are C#. Keeping Notion's files unedited: every feature the three new tool types need would be blocked.

## R3. A scene is computed in the core and drawn by the webview

**Decision**: `src/core/scene/` takes Notion's `scene.ts`, `geometry.ts` and `snapping.ts` (1,189 lines, no DOM). A scene is plain data: every node placed with its shape, parts and labels, every edge with its ends and its line. The generic tool type returns it as its view, and the webview's diagram library gets one renderer for it, `src/webview/diagram/scene.ts`, beside what it has: surface, pan and zoom, selection, in-place editing, menu, ruler.

**Rationale**: the webview draws today from a hand-written `DiagramDefinition` per type, with the hype cycle's phases as a special case (`segments`). Reading notation means custom and composite shapes, bezier edges anchored on parts, adaptive rulers and filters. Notion's scene does all of that from the interpreted notation and is tested against the nine hype cycle examples with recorded places. Computing it in the core keeps the webview free of anything that knows a definition, and makes what is drawn testable without a browser.

**Alternatives considered**: translating notation into the existing `DiagramDefinition` and teaching the library each missing shape and anchor. That is a second reading of DISL notation, written here, when one that is tested exists. Taking Notion's whole canvas: its gestures, in-place editor and panels are built for a page in Notion, and the plug-in has its own, which pass spec 006.

## R4. One frame contract, generic over what a tool shows

**Decision**: `DiagramType` becomes `ToolType<View, Request>` in `src/core/frame/toolType.ts`. A diagram is `ToolType<Scene, EditRequest>` and a designer is `ToolType<TableView, TableRequest>`. Findings, the toolbox, the fields of ADP Properties, actions, edit outcomes and new documents are the same for both. One function in `src/core/tool/`, `toolTypeFrom(definition, bindings, plugins)`, makes either from a definition.

**Rationale**: the frame already does everything around a type: registration, the text document as the only store, undo, Problems, the two views, confirmations. The contract is data in and data out, so the generic type is tested without Visual Studio Code. A table has rows, columns and views, not boxes and relations, so only what is shown and what a gesture asks differs.

**Alternatives considered**: a second contract for designers beside the first: the editor host, findings and properties would each be written twice. Forcing a table through the diagram's view model: every field would mean something else for one type.

## R5. An edit is FBL splices, applied as one edit of the text document

**Decision**: the body FBL reads is the UTF-8 encoding of the document's text as the editor holds it. A gesture becomes one model change, FBL plans it as splices at byte offsets, the offsets are converted to positions with the library's own `utf8.ts`, and all splices of the gesture go into one `WorkspaceEdit`. FBL's own history (section 7) is not used: Visual Studio Code's undo restores the previous text exactly, and drift cannot occur because the editor holds the only copy. This is what spec 009 left to the first feature that connects a tool.

- **Byte-order mark**: the editor keeps it outside the text and writes it back on save. FBL sees a body without one, which it reads as any other.
- **Mixed line endings**: the editor normalises them when it reads the file. The row `docs/parity.md` has for this stays, and now covers every tool type. A file with one kind of line ending, with or without a final newline, is kept byte for byte.
- **The registration**: a change of the `.adp` alone is planned by FBL's registration module and written by the extension. The plug-in's existing layout history keeps such a step among the document's edits, as it does today for Agent Behavior Modelling.
- **Unreadable body**: opens empty and read-only with its finding; nothing that edits is offered, so nothing is saved.

**Alternatives considered**: a custom editor over bytes instead of a text document, which would keep mixed line endings: the text editor would no longer share the document and its undo, against the plug-in's first two principles. Keeping FBL's history beside the editor's: two histories to keep in step for no gain.

## R6. Which file opens in which tool

**Decision**: the binding's `claims` decide, read from the copied binding.

| Claim | Registered as | Opens in the tool |
|---|---|---|
| An extension that is not `shared` (`.mm`, `.aad`, `.ghg`) | `priority: "default"` | Always, unless the binding has a marker the file does not match: then the editor hands the file back to the text editor with `vscode.openWith` and reports nothing |
| A `shared` extension with a marker (`.yaml`, `.yml`, `.json`, `.ded`, `.xml` for Knowledge) | `priority: "option"` | When the marker matches: the text tab is reopened in the tool with `vscode.openWith`. A file the user chose "Open as Text" for stays text for the session |
| A `shared` extension claimed `registrationOnly` (`.md` for Agent Behavior Modelling) | `priority: "option"` | By choice, as today: "Open With", the command, and the Explorer entry for files that look like one |

Only a tab on a file of the workspace is reopened: never a diff, a file from version control, or an untitled document. The existing `suggests` watcher is fed from `claims.suggest`.

**Rationale**: a manifest can select by file name only, and whether a YAML file is a Knowledge document is in its text. Registering the designer as the default for every YAML and JSON file would send every such file through a webview first, which is what SC-003 forbids.

**Alternatives considered**: writing `workbench.editorAssociations`: it is the user's setting and matches by glob. Offering the designer only through "Open With": User Story 3's first scenario says the file opens in the designer.

## R7. The definitions are files in the plug-in

**Decision**: `definitions/<tool>/` holds each tool type's specification, binding and companion, with `PROVENANCE.md` recording repository, path, commit and SHA-256 of each. `scripts/sync-definitions.mjs` copies them byte for byte from git objects of the sibling clones; `--check` copies nothing and fails on a difference, and the Build workflow runs it. `.gitattributes` marks the folder `-text`. The folder ships in the package, and the extension reads it from its own install folder when it starts. This is the shape of `sync-fbl.mjs` here and of `sync-specifications.mjs` in the Notion repository.

- **Where a binding comes from**: from where the specification's `persistence.binding` points. A relative reference is the file beside the specification; a URL into `etalii.adp.ide.standalone` is that path in the sibling clone; at runtime the reference is resolved to the copied file of that name and nothing is fetched.
- **The manifest**: Visual Studio Code reads custom editors and commands from `package.json` only. The same script writes those entries from the copied definitions, and `--check` fails when they differ. So adding or removing a tool type is running one command (FR-005, SC-005).

**Rationale**: reading files at start, and not bundling them as code, is what makes "remove the copy and the tool is gone" true without a generated module in between.

**Alternatives considered**: bundling the definitions as JSON modules: each needs an import by name, so a tool type would be listed in code again. Fetching them: the plug-in performs no network access.

## R8. Plugins

**Decision**: a plugin a definition names is code under `src/core/plugins/<plugin>/`, registered by its id in one registry that `toolTypeFrom` is given. A persistence plugin implements the FBL library's existing `PersistencePlugin`; a layout plugin and an action plugin get one small interface each. A definition that names a required plugin the registry lacks opens its documents read-only with FBL's `std.pluginMissing`, which names the plugin; an optional one falls back as the definition says.

| Plugin | Provides | Here |
|---|---|---|
| `net.etalii.adp.freeplane.mm` | persistence | `src/core/plugins/freeplane-mm/` (R9) |
| `net.etalii.adp.freeplane.mindmapLayout` | layout | `src/core/plugins/mindmap-layout/`, ported from standalone's `MindmapLayout` |
| `net.etalii.adp.ide.projectLinkPicker` | action | the extension's `showOpenDialog`, the platform's file and folder picker, storing the path relative to the map |
| `net.etalii.adp.etalii.abmMarkdown` | persistence | `src/core/plugins/abm-markdown/`, made from today's hand-coded parser and writer (R12) |
| `net.etalii.adp.etalii.abmArrange` | action | `src/core/plugins/abm-arrange/`, made from today's `layout.ts` |

## R9. The mind map

**Decision**: the plugin reads as standalone's `MindmapFreeplanePlugin` does, and, unlike it, plans.

**Rationale**: standalone's plugin refuses every plan, because standalone edits the XML in place through its module's commands. Here every edit has to be splices (R5). So `plan` is written for `add` with a position, `set` (text, notes, link), `remove` and `move`, with standalone's `FreeplaneXmlWriter` and `MindmapDocument` as the worked example. What each edit must do is standalone's to say. Its recorded `Parity/mindmap.transcript.json` holds the toolbox, the menus, the property rows, the placed nodes, 41 edits and their undo for `architecture.mm`, and is copied as a fixture with that map; the cases of its `Commands.Tests.cs` are written again as tests here.

**The interpreter grows** by what the mind map's definition uses and Notion's does not read: `autoSize: "fitContent"`, behaviour's `clipboard`, the `view` action (`toggleFold`), `persistence.view` for the viewer state `collapsed`, the id `prefix`, `descendants()`, and a layout named as a plugin.

**Open, and raised**: the binding the definition names claims every `.mm` file and has no marker, while FBL's own example binding for the same format has one. User Story 1's fifth scenario needs the marker (R14, item 1). Until the definition has it, a `.mm` file that is no map opens empty and read-only with the reader's finding, and the scenario's test is skipped with that reason.

## R10. The agent activity diagram

**Decision**: the interpreter learns what DISL 0.4 adds, each once for every tool type: the `force` layout with tiers, `onChange` and `respect: "pinned"`; compartments with `groupBy`, `itemOrder` and `itemLink`; a filter that is kept; the context entries `pin`, `unpin` and `unpinAll`; the `open` action; `persistence.view.bind`; `paths` on a `uri` attribute; the shapes `folder` and `hexagon`; icons. Each is added to `src/core/disl/support.ts` and the support record by the change that builds it. `open` opens the linked file with `vscode.open`.

**Positions**: the definition keeps what the user arranges in the file itself, in its `view` mapping, through `persistence.view.bind`; its binding has no `registration` block. So a dragged position is a splice of the `.aad` and an ordinary undo step. The specification's story says the registration keeps them; the definition is the reference, and the sentence is corrected in the specification (R14, item 6).

**The layout**: the companion document gives the reference algorithm and its numbers, and requires that the same file gives the same picture. The recorded places of standalone's three examples are the test.

## R11. The Knowledge designer

**Decision**: a DESL interpreter in `src/core/desl/`, reusing the metamodel and the expressions of `src/core/disl/`, which DESL shares with DISL; a table view in `src/core/tool/`; and a table surface in the webview, `src/webview/table/`, built on an HTML table with the grid role and the plug-in's existing controls. No grid library is added.

**Rationale**: `knowledge.des` declares `surface.kind: "table"`, DESL 0.1's only kind, with 9 value types and 55 operations. No host interprets DESL yet: standalone implements this designer in C# on a React table library, so both are worked examples and neither can be taken. The operations are DESL's transactions (section 10.3) over model changes, which is what the DISL interpreter's behaviour already runs, so `desl/` adds the surface and the operations' vocabulary, not a second engine.

**The three bindings**: the definition names one per format family. FBL routing chooses by the file each claims, which the library does once it is at 0.3 (R1).

**The proof that YAML, JSON and XML show the same thing** is etalii.adp's `knowledge-equivalence` fixture, read through each binding.

## R12. The two existing diagrams

**Decision**: each hand-coded module is replaced by its definition and its plugins, and its tests are kept. The hype cycle graph needs nothing more of the interpreter: Notion's reads all of it. Agent Behavior Modelling needs `anchor.sides`, the derived id strategy, the `tidyTree` layout, parent placements and retyping, and its two plugins, which are today's parser, writer and layout under a plugin's interface.

**Rationale**: these two give the interpreter its strictest comparison, a version that already passes spec 006. A test that named a hand-coded function is rewritten to name the same behaviour through the tool type (FR-013); every other test runs unchanged. What cannot be met from the definition is a row in the support record with its reason, or an issue here.

## R13. Colours

**Decision**: a definition's theme gives its tokens for the modes `light` and `dark`. The webview takes the mode from Visual Studio Code's theme kind: light and high contrast light read `light`, dark and high contrast read `dark`. In both high contrast kinds, outlines take the editor's contrast border and text its foreground, so nothing depends on a fill alone. A token the definition binds to no mode falls back to the editor's own colour for that role.

**Rationale**: the plug-in's principles require colours to follow the theme, high contrast included, and a definition states two modes. The rule is recorded in the support record as what this host does for a mode a definition does not state.

## R14. What is raised with etalii.adp

Planning found these. Each is filed as an issue before the pull request that meets it, and none is settled in the plug-in (FR-018).

1. The mind map's definition names standalone's `mindmap.fbl#mindmap`, whose claim has no marker; `specifications/fbl/mindmap.fbl#freeplane` has `^<map[\s>]` within five lines. Scenario 5 of User Story 1 needs it.
2. No fixture states the bytes of a mind map edit. Standalone's plugin does not plan, so two hosts can write different bytes for the same edit; standalone's command tests are the only statement of them.
3. `agent-behavior-modelling.dis` names its binding as `agent-behavior-modelling.fbl#abm`, relative, and no such file is beside it in etalii.adp: it is in standalone.
4. `mindmap.dis` names its binding by a URL into standalone's `develop` branch, as the hype cycle graph does (issue 92, which covers that one only).
5. The hype cycle graph and the mind map bindings are FBL 0.1 documents while the library and the fixtures are at 0.6; nothing says whether a binding is expected to follow.
6. This feature's own specification says the agent activity diagram's dragged positions are kept in the registration; its definition keeps them in the file.
7. A definition's theme states `light` and `dark` and nothing for high contrast (R13).

## R15. Tests and fixtures

- **FBL**: etalii.adp's 19 fixture folders, splice for splice, and the counterpart of every test standalone's library gained since `25fc7b4a`, listed in `test/core/fbl/baseline.json` as spec 009 did.
- **Interpreter and scene**: Notion's tests come with the code; each addition gets its test first.
- **Each tool type**: standalone's examples and test fixtures, copied by `sync-examples.mjs` with their source recorded. Every example opens and saves unchanged; every operation its behaviour lists changes the file as its fixture says and undoes exactly.
- **In a real Visual Studio Code**: for each new type, opening by claim, undo and redo, save, findings in Problems, against the packaged plug-in. The native dialogs are seen once in a window before the feature is called done (FR-015).
- **Nothing names a tool type**: one test reads `src/core/disl/`, `desl/`, `scene/` and `tool/` for every type, attribute and message id of the copied definitions, as Notion's `test/words.test.ts` does.
- **Adding a tool type needs no code** (FR-005, SC-005): one test adds `specifications/desl/minimal-table.des` with its binding to a temporary definitions folder and opens a document of it; another removes a folder and finds the type gone.
