# Research: The Tools on DISL and FBL in Visual Studio Code

Read on 2026-10-12: `etalii.adp` at `develop` `73ec4a7`, `etalii.adp.ide.vscode` at `develop` `271a92c`, `etalii.adp.ide.notion` at `develop` `4a0cdb4`, `etalii.adp.ide.standalone` at `develop` `eae4c22`.

## R1. Start the interpreter from the Notion add-ons' `src/disl`

**Decision**: the plug-in gets `src/core/disl/`, seeded from `etalii.adp.ide.notion`'s `src/disl/` at `4a0cdb4`, and owned here from then on.

**Rationale**: Notion's interpreter is about 4,900 lines of TypeScript in 14 files, one `interpretX` function per DISL section, each returning its value with findings. It imports no DOM and nothing of Notion: only `@marcbachmann/cel-js` and three files of `../fbl/`, and Notion's `src/fbl/` is a byte-for-byte copy of this plug-in's `src/core/fbl/`, so the relative imports resolve unchanged under `src/core/`. It interprets the whole of the hype cycle graph's definition and all of the mind map's but its layout plugin (`test/disl/reuse.test.ts` there). Writing a second interpreter would be a third reading of DISL in TypeScript beside standalone's client and Notion's.

**Owned, not copied**: Notion's FBL is a copy that is never edited, because this plug-in's FBL is complete. Its DISL interpreter is not: this feature has to extend it (R3, R4). So it is taken once, with its origin recorded in `src/core/disl/ORIGIN.md`, and grows here. Whether Notion later takes it back from here, as it takes FBL, is that repository's call and is raised with it, not decided in this feature.

**Alternatives considered**: port standalone's client compiler (`src/client/src/canvas/library/disl/`, 3,000 lines): it compiles notation only, and standalone's metamodel, behaviour and persistence are C#. Copy Notion's code and never edit it: blocks every feature R3 and R4 need.

## R2. One generic diagram type behind the frame's contract

**Decision**: a tool type read from a definition is one value of the frame's existing `DiagramType` contract (`src/core/frame/diagramType.ts`), made by one function, `diagramTypeFrom(definition, binding, plugins)` in `src/core/disl-tool/`. `view` comes from notation, coordinates, layout and viewpoints; `toolbox` from the toolbox; `fields` from forms; `actions` and `edit` from behaviour, whose changes are planned as FBL splices and returned as the document's new text; `findings` from constraints and the reading's own findings.

**Rationale**: the frame already does everything around a type (custom editor registration, the text document as the only store, undo, Problems, ADP Toolbox and Properties, confirmations). The contract is data in, data out, so the generic type is testable without Visual Studio Code (constitution III). Adding a tool type stays "add it to `diagramTypes` and `package.json`" (FR-005).

**The webview**: the webview's diagram library already draws from a data definition (`src/webview/diagram/definition.ts`), "this host's counterpart of the standalone host's `DiagramDefinition`". The generic type sends that definition, derived from the DISL notation, with the view; the library learns the shapes, anchors and routes the definitions use that it does not yet draw (custom path shapes, `folder`, `hexagon`, icons), each once for every type.

## R3. What the mind map needs beyond the interpreter

- **`net.etalii.adp.freeplane.mm`**: the binding `mindmap.fbl` is an `xml` binding with `reader.plugin`. The plug-in's FBL has the plugin interface (`src/core/fbl/plugins/persistencePlugin.ts`) and no plugin; this feature writes the first, ported from standalone's `MmParser` and its writer, under `src/core/plugins/freeplane-mm/`.
- **`net.etalii.adp.freeplane.mindmapLayout`**: the layout plugin, ported from standalone; the definition's fallback `mrtree` is used if the plugin fails.
- **`net.etalii.adp.ide.projectLinkPicker`**: a link to another file of the workspace, offered with Visual Studio Code's own Quick Open, which is the platform mechanism for picking a file (constitution I).
- **DISL features** Notion does not read: `autoSize: "fitContent"`, behaviour's `clipboard`, the `view` action (`toggleFold`), `persistence.view` for the viewer state `collapsed`, the id `prefix`, `descendants()`.

## R4. What the agent activity diagram needs: DISL 0.4

The definition is DISL 0.4 and uses nearly every 0.4 addition (DISL "Changes from 0.3"): the `force` layout with `tiers`, `trigger: "onChange"`, `respect: "pinned"` and `animate`; compartments with `groupBy`, `itemOrder` and `itemLink` with badges and `onClick`; a filter with `persist`; the context entries `pin`, `unpin` and `unpinAll`; the `open` action; `persistence.view.bind`, which stores `pinned` and `groups` in the body; `paths` on a `uri` attribute; the shapes `folder` and `hexagon`; about 40 icons. It names no plugin, and its binding is declared YAML (`fbl: "0.4"`). Each feature is added to `src/core/disl/support.ts` and to the support record when it is built.

**`open`** opens the linked file in Visual Studio Code's own editor (`vscode.open`), the platform's way of opening a file.

## R5. The Knowledge designer: the first DESL host

**Decision**: a second contract beside `DiagramType`, `DesignerType`, in `src/core/frame/designerType.ts`, and a table surface in the webview, `src/webview/table/`. The DESL interpreter is `src/core/desl/`, reusing `src/core/disl/`'s metamodel and expressions, which DESL shares with DISL.

**Rationale**: `knowledge.des` declares `surface.kind: "table"` (DESL 0.1 section 7, its only kind) with columns of a property type, rows, cells and views with sorts, filters and groups, 13 value types each with an editor, and 55 operations. None of that is a canvas, so it does not fit `DiagramType`'s view of boxes and relations. Nothing outside standalone implements DESL, and standalone implements the Knowledge designer in C# (about 5,600 lines) on a shared table library (about 4,000 lines of TypeScript client): those are the worked example.

**Files of shared extensions** (`.yaml`, `.yml`, `.json`, `.xml`): the custom editor is registered with `priority: "option"`, as Agent Behavior Modelling's is for `.md`, and the frame's existing `suggests` offers it where the binding's claim (the DED envelope naming `etalii/knowledge`, or the XML marker) matches. `.ded` is the designer's own extension and opens in it by default.

**Bindings**: the definition names three (`bindings`), one per family; Notion's persistence reads only `binding`. The binding is chosen by FBL routing (section 10.1), which the plug-in's FBL already implements.

## R6. The definitions in the plug-in

**Decision**: `definitions/<tool>/` in the plug-in holds each tool type's specification, binding and companion, copied by `scripts/sync-definitions.mjs` byte for byte from git objects of the sibling clones (`etalii.adp`, and `etalii.adp.ide.standalone` for the bindings that live there), with `PROVENANCE.md` recording repository, path, commit and SHA-256. `--check` copies nothing and fails on a differing copy; the Build workflow runs it. This is the shape of `sync-fbl.mjs` and `sync-specifications.mjs` in the Notion repository, which this plug-in's own `sync-examples.mjs` already follows.

The definitions are bundled into the extension as JSON at build time; nothing is read over the network (constitution, platform constraints).

## R7. Mixed line endings

Spec 009 left this to the first feature that connects a tool to FBL. Visual Studio Code's text document keeps one line ending per file. FBL works on bytes. **Decision**: the generic type reads the document's text as the editor holds it and plans splices against it; a file with mixed line endings is normalised by the editor when it is opened, as `docs/parity.md` already records for the two existing diagrams. The parity record keeps that row for every type.

## R8. History

The frame's undo is Visual Studio Code's: every edit is a `WorkspaceEdit` of the text document (constitution I). FBL's own history (section 7) is not used for undo here; the splices of each edit are applied to the document, and the editor's undo restores the previous text exactly. Drift (section 7.2) cannot occur, since the editor holds the only copy. This is what the hand-coded types do today.

## R9. The two existing diagrams (User Story 4)

The hype cycle graph is fully interpreted by Notion's interpreter. Agent Behavior Modelling needs `anchor.sides`, the derived id strategy, and its two plugins (`net.etalii.adp.etalii.abmMarkdown`, which the plug-in's hand-coded parser and writer become, and `net.etalii.adp.etalii.abmArrange`). The move replaces each `src/core/<type>/` with its definition and plugins; tests that name the old modules are rewritten to name the behaviour (FR-013), and the rest run unchanged.

## R10. Delivery

Four pull requests into `etalii.adp.ide.vscode` `develop`, one per user story, in order, each with the foundation it first needs: (1) definitions, interpreter, generic type, the mind map; (2) DISL 0.4 and the agent activity diagram; (3) DESL, the table surface and the Knowledge designer; (4) the two existing diagrams moved. Each links this folder and the commit its tasks were taken from.
