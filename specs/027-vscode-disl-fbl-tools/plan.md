# Implementation Plan: The Tools on DISL and FBL in Visual Studio Code

**Branch**: `features/027-vscode-disl-fbl-tools` | **Date**: 2026-10-12 | **Spec**: [vscode-disl-fbl-tools.spec.md](vscode-disl-fbl-tools.spec.md)

**Read at**: `etalii.adp` `60fb7a0`, `etalii.adp.ide.vscode` `271a92c`, `etalii.adp.ide.notion` `4a0cdb4`, `etalii.adp.ide.standalone` `5756a07`. The five definitions in scope are unchanged since the `73ec4a7` the specification names.

## Summary

The Visual Studio Code plug-in learns to read a tool type from its definition instead of from code written for it. The definitions are copied unchanged into the plug-in and read from disk when it starts. A DISL interpreter, taken once from the Notion add-ons, turns a definition, its FBL binding and its plugins into one value of the frame's contract, so the frame that serves the two hand-coded diagrams today serves every tool type read this way. Every edit is planned by the FBL library as splices and applied as one edit of the text document.

Planning found one thing the specification assumed and the code does not have: the plug-in's FBL library implements FBL 0.1, and FBL is at 0.6. The mind map needs FBL 0.2 (a plugin that plans a move and a positioned add), and the bindings of the agent activity diagram and the Knowledge designer are FBL 0.4. So the library is brought to FBL 0.6 first, as a pull request of its own with no visible change ([research R1](research.md#r1-the-fbl-library-goes-to-fbl-06-first)).

The work adds one runtime dependency, `@marcbachmann/cel-js` 8 (MIT), which the interpreter evaluates DISL's CEL with. It arrives in six pull requests into `etalii.adp.ide.vscode`: the FBL library, the foundation with the mind map, the agent activity diagram, the Knowledge designer, the two existing diagrams, and the closing record.

## Technical Context

| | |
|---|---|
| Language | TypeScript 5.9, strict, Node.js 22 or later, as the repository has it |
| Dependencies | adds `@marcbachmann/cel-js` 8; keeps `yaml`, esbuild, ESLint, Vitest, `@vscode/test-cli`, `@vscode/vsce` |
| Storage | the file's text in Visual Studio Code's text document, and the `.adp` registration beside it |
| Tests | Vitest for `src/core` and the webviews; Mocha in a real Visual Studio Code against the packaged plug-in |
| Target | desktop Visual Studio Code 1.140 or later |
| Constraints | no network at runtime; nothing under `src/core/disl/`, `src/core/desl/`, `src/core/scene/` or `src/core/tool/` names a tool type, which a test holds by reading those folders for every name in the copied definitions |
| Scope | 5 tool types, 3 new to this host; 5 plugins carried as code; about 6,200 lines taken from the Notion add-ons |

## Constitution Check

Checked before research and again after the design documents were written. No gate fails.

### `etalii.adp` (1.6.0)

| Principle | Assessment |
|---|---|
| I. One Source of Truth | PASS. The definitions are copied unchanged, checked on every pull request and never edited in the plug-in. Seven differences found while planning are filed here before any of them is worked around ([research R14](research.md#r14-what-is-raised-with-etaliiadp)). |
| II. Implementable from the Document Alone | PASS. This feature is the first test of that for DISL 0.4 and DESL 0.1 outside standalone. Where a document is not enough, the question is filed here. |
| III. Precise Normative Language | PASS. No specification text is written. |
| IV. Versioned Specifications | PASS. The support record states the DISL, DESL and FBL versions read. |
| V. Simplicity | PASS. One interpreter taken, not written; one frame contract, not two. |
| VI. No JetBrains Rider Warnings in C# | PASS. No C# is written. |

### `etalii.adp.ide.vscode` (1.0.0)

| Principle | Assessment |
|---|---|
| I. Native Visual Studio Code Citizenship | PASS. Custom editors, the text document's undo, the Problems panel, the platform's dialogs and file picker. A file of a shared extension that its binding claims is reopened in its tool with the platform's own `vscode.openWith` ([research R6](research.md#r6-which-file-opens-in-which-tool)). |
| II. The Text File Is the Source of Truth | PASS. Edits are FBL splices on the document's text. A file with mixed line endings keeps the row it has in `docs/parity.md` ([research R5](research.md#r5-an-edit-is-fbl-splices-applied-as-one-edit-of-the-text-document)). |
| III. One Frame, Many Tools | PASS. The frame's contract is made generic over what a tool shows, so a designer is served by the same frame. "A tool type's behaviour MUST be what its definition states" becomes true by construction. |
| IV. Test-First, Against Real Files | PASS. Every tool type is tested against standalone's examples and fixtures, copied with their source recorded; each new type has tests in a real Visual Studio Code. |
| V. Simplicity | PASS, with the one entry below. |

### Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
|---|---|---|
| Two CEL evaluators in one plug-in: the FBL library's own and `@marcbachmann/cel-js` | DISL section 12 needs macros, optionals and a function library; the FBL library's evaluator implements the subset FBL 2.4 names and no more | Extending the FBL evaluator to all of CEL: it is copied byte for byte into the Notion add-ons, and its differences from standalone are a recorded list that would grow. Moving FBL onto `cel-js`: the FBL library would gain a dependency and lose the semantics its 86 baseline tests pin |

## Project Structure

### This feature

```text
specs/027-vscode-disl-fbl-tools/
├── vscode-disl-fbl-tools.spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── tool-type.md          # the frame contract a tool type implements
│   ├── definitions.md        # the copied definitions, their record and the sync command
│   └── support-record.md     # what docs/disl-support.md holds
└── checklists/requirements.md
```

### `etalii.adp.ide.vscode`

```text
definitions/<tool>/               # the copied .dis or .des, .fbl and .md, with PROVENANCE.md
scripts/sync-definitions.mjs      # copies, --check, and writes the manifest's contributions
scripts/sync-examples.mjs         # extended: the examples and fixtures of the three new types
src/core/fbl/                     # brought from FBL 0.1 to 0.6
src/core/disl/                    # the DISL interpreter, taken from the Notion add-ons, ORIGIN.md
src/core/desl/                    # the DESL interpreter
src/core/scene/                   # a model as a scene, taken from the Notion add-ons
src/core/tool/                    # a definition as a tool type; the plugin registry; the table view
src/core/plugins/<plugin>/        # freeplane-mm, mindmap-layout, abm-markdown, abm-arrange
src/core/frame/toolType.ts        # the contract, generic over what a tool shows (was diagramType.ts)
src/extension/toolTypes.ts        # reads definitions/ at start (was diagramTypes.ts)
src/extension/opening.ts          # claims, the reopening of a claimed shared file, "Open as Text"
src/extension/toolEditor.ts       # FBL splices as a WorkspaceEdit (was diagramEditor.ts)
src/webview/diagram/scene.ts      # draws a scene: shapes, parts, labels, markers, compartments
src/webview/table/                # the table surface of a designer
docs/disl-support.md              # the support record
docs/parity.md, docs/tools.md, docs/fbl.md
test/core/{fbl,disl,desl,scene,tool,plugins}/, test/webview/{diagram,table}/, test/vscode/
```

Removed by the last story: `src/core/gartner-hypecycle-graph/`, `src/core/agent-behavior-modelling/`, `src/webview/gartner-hypecycle-graph/`, `src/webview/agent-behavior-modelling/`, and what of `src/core/text/` and `src/core/registration/` nothing uses any more.

**Structure Decision**: everything that knows a definition stays under `src/core/` and imports neither Visual Studio Code nor a browser; the extension only opens, applies and reports, and the webviews only draw what they are sent.

## Delivery

Each pull request goes into `etalii.adp.ide.vscode` `develop` from `features/027-vscode-disl-fbl-tools`, names this folder and the etalii.adp commit its tasks were taken from, and is merged before the next branch is cut.

| Pull request | Holds | Story |
|---|---|---|
| 1 | The FBL library at 0.6, proven by etalii.adp's nineteen fixtures. Nothing a user sees changes. | foundation |
| 2 | The copied definitions and their check, the interpreter, the scene, the generic tool type, the plugin registry, opening by claim, the support record; the mind map and its plugins. | 1 |
| 3 | What DISL 0.4 adds; the agent activity diagram. | 2 |
| 4 | The DESL interpreter, the table surface, the reopening of a claimed shared file; the Knowledge designer. | 3 |
| 5 | The hype cycle graph and Agent Behavior Modelling read from their definitions; their hand-coded modules removed. | 4 |
| 6 | The native dialogs seen in a real window, `docs/tools.md`, and the last differences filed. | closing |

In etalii.adp: this folder, and one issue for each difference of [research R14](research.md#r14-what-is-raised-with-etaliiadp), filed before the pull request that meets it.
