# Implementation Plan: The ADP Plug-in for Visual Studio Code

**Branch**: `features/006-vscode-plugin` | **Date**: 2026-10-05 | **Spec**: [vscode-plugin.spec.md](vscode-plugin.spec.md)
**Input**: Feature specification from `specs/006-vscode-plugin/vscode-plugin.spec.md`.

## Summary

Give `etalii.adp.ide.vscode` its first plug-in: one Visual Studio Code extension, "ADP: A Different Perspective", that brings the Gartner hype cycle graph and Agent Behavior Modelling as their definitions here state them, with tests at three levels, one-step debugging and a pipeline that offers the plug-in from every run and as a development build.

The plug-in is written in TypeScript in three layers: a pure **core** that reads, splices, checks and lays out; a **host** in the extension host that owns the document; a **view** in webviews that draws SVG. Each diagram type is implemented by hand against a shared frame, with the standalone host's C# logic ported function by function and its tests ported as the checklist (research R2, R3). Each diagram opens in a custom text editor over Visual Studio Code's own text document, so undo, the dirty marker, save and hot exit are the platform's (R4). The view only sends intents; the host turns each into line splices applied as one `WorkspaceEdit` and reads the text again after every change (R5). A behavior model's dragged positions live in the `.adp` registration as FBL section 8 defines it, held pending until the Markdown is saved and tied to the Markdown's undo history by an edit log (R6, R7). The ADP Toolbox and ADP Properties are webview views that follow the focused diagram (R10). The pipeline takes the IntelliJ workflow's shape (R12).

Before the host is built, the two definitions here gain "Arrange diagram" and the hype cycle companion is re-read against the standalone `develop` it then names (R17). The work arrives as one pull request here and six into the VS Code repository (R1).

## Technical Context

**Language/Version**: TypeScript 7 in strict mode, for the extension host (Node, as Visual Studio Code ships it) and for the webviews (the browser Visual Studio Code ships); Node.js 22 or later to build. In this repository: DISL 0.1 JSON and Markdown for the two definitions.
**Primary Dependencies**: the Visual Studio Code extension API, `engines.vscode` `^1.140.0`. At runtime, bundled: `yaml` 2 (reading `.ghg` with positions), `preact` 11 (the view), `@mdi/js` 7 (the definitions' icons, by name). To build and test: `esbuild`, `eslint`, `vitest` 5 with `jsdom`, `@vscode/test-electron` 3 with Mocha, `@vscode/vsce` 4 (R15).
**Storage**: files only. `*.ghg` and Markdown bodies, written by line splices; the `.adp` registration, written by splices as FBL section 8 states. A pending registration is kept in the extension's workspace state across a restart, with the unsaved text it belongs to. No settings, no database, no network.
**Testing**: three levels (R13): Vitest in Node for core; Vitest with jsdom for the frame's parts; the packaged `.vsix` installed into a downloaded Visual Studio Code, driven through a test seam. Vendored from the standalone host: 13 examples, 23 `.ghg` fixtures, `scale-fixture.json`, three cross-tier fixtures. In this repository: `validate-examples.py` on the two `.dis` files.
**Target Platform**: desktop Visual Studio Code 1.140 or later on Windows, macOS and Linux; Restricted Mode supported. The pipeline runs on GitHub's hosted Linux runner.
**Project Type**: a Visual Studio Code extension (extension host plus webviews), with a supporting change to two definitions in this specification repository.
**Performance Goals**: an example drawn within 2 seconds of opening and a gesture reflected without a visible pause (SC-005); reading, checking and building the scene of the 200-trend example under 100 ms (R16); the full test run within 10 minutes locally and 15 on a hosted runner (SC-008).
**Constraints**: a save without an edit is byte-identical, and an edit changes only the lines it concerns (FR-009, FR-010); every user-visible change is one step of Edit > Undo (FR-031); the definitions' sentences verbatim (FR-006); no network at runtime (FR-001); nothing under `src/frame/` names a diagram type, and no diagram type imports another (FR-005, SC-011).
**Scale/Scope**: 2 diagram types; about 9,000 lines of C# ported to core with 184 backend and 90 client tests as its checklist; a canvas, a toolbox and a property grid with 7 controls; about 20 commands; 60 functional requirements; 7 pull requests across 2 repositories.

## Constitution Check

*GATE: checked before research and again after design.*

### This repository (`etalii.adp`, constitution 1.3.0)

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The host is built against the definitions, not against the standalone code: what the standalone host does and the definitions do not yet say ("Arrange diagram") is written into the definitions first (pull request A), differences this host cannot avoid go into its parity record, and a disagreement found while planning (research O1, the leaf colours) is raised here rather than settled in the host. FBL section 8 is implemented as written, including where the standalone writer differs (R7). |
| II. Implementable from the Document Alone | Pass | No specification under `specifications/` changes. The definitions are not specifications, but the change follows the same discipline: each `.dis` and its companion change together, and the companion describes the arrangement rule in enough detail to implement it ([contracts/definitions-change.md](contracts/definitions-change.md)). |
| III. Precise Normative Language | Pass | The `.dis` files stay valid DISL 0.1 JSON with CEL for their conditions; `validate-examples.py` checks them. The companions are informative prose, as they are today. |
| IV. Versioned Specifications | Pass | No specification's version changes. Each definition's `language.version` rises by a minor step for the added operation. |
| V. Simplicity | Pass | No DISL runtime (R2), three runtime dependencies each replacing something that would otherwise be written (R15), no settings, one runner. The two mechanisms that are more than the obvious are justified below. |
| Structure and Naming | Pass | Nothing is added under `specifications/`. Files change under `definitions/diagrams/` and `specs/006-vscode-plugin/` only. Registered identifiers follow the definitions' language ids. |
| Development Workflow | Pass, with a note | One Spec Kit feature; this folder holds the plan and tasks for work that lands in two repositories, as specs 001 and 002 did. Everything reaches each `develop` by pull request with a merge commit. The branch `features/006-vscode-plugin` carried the specification and was merged (pull request 55); the plan and the definition changes travel on a branch of the same name, made again from `develop`. |

### The VS Code repository (constitution not yet ratified)

Its constitution is still the template, and FR-060 asks that it be ratified before this plan is checked against it. Pull request 0 ratifies [contracts/vscode-constitution.md](contracts/vscode-constitution.md). The check below is against that proposal and is repeated against the ratified text before pull request 1 is opened; a principle changed in ratification brings the plan back here.

| Principle (proposed) | Status | Note |
|---|---|---|
| I. The Definition Is the Reference | Pass | R2's conformance tests, the vendored definitions, `docs/parity.md`. |
| II. Native Visual Studio Code Citizenship | Pass | Custom text editors, the text document's undo and save, diagnostics, contributed commands and keybindings, webview views, theme variables, the platform's dialogs (R4, R10, R11). Built here: the canvas, the toolbox, the property grid, and nothing else. |
| III. The Text File Is the Source of Truth | Pass | Line splices only; the model is read again from the text after every change (R5). |
| IV. One Frame, Many Tools | Pass | The layer rule and the rule between diagram types are enforced by the linter ([contracts/frame-api.md](contracts/frame-api.md)); the frame's tests register a diagram type of their own. |
| V. Test-First, Against Real Files | Pass | Three levels, vendored examples and fixtures with provenance, shared fixtures read unchanged, the packaged file tested in a real Visual Studio Code, skips reported (R13). |
| VI. Simplicity | Pass, with two entries in Complexity Tracking | The edit log and the test seam. |

Re-check after design: unchanged. The design added no principle-level deviation; the three platform behaviours it depends on without a documented guarantee are spikes with fallbacks decided in advance (research, Spikes).

## Project Structure

### Documentation (this feature)

```text
specs/006-vscode-plugin/
├── vscode-plugin.spec.md
├── plan.md                        # this file
├── research.md                    # decisions R1–R18, spikes S1–S3, open points
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── frame-api.md               # the frame and a diagram type; messages; the test seam
│   ├── package-manifest.md        # what the plug-in contributes to Visual Studio Code
│   ├── ci-interface.md            # the Build workflow, downloads, the development build
│   ├── dev-interface.md           # commands, reports, debug configurations
│   ├── definitions-change.md      # "Arrange diagram" in the two definitions
│   └── vscode-constitution.md     # the constitution the VS Code repository ratifies first
├── checklists/requirements.md
└── tasks.md                       # /speckit-tasks
```

### Source (this repository, pull request A)

```text
definitions/diagrams/
├── gartner-hype-cycle-graph.dis   # arrange operation, arrangeRows layout plugin, version 1.1.0
├── gartner-hype-cycle-graph.md    # re-read at standalone 13b517b3; "Arrange diagram" section
├── agent-behavior-modelling.dis   # arrange operation as a plugin action, version 0.2.0
└── agent-behavior-modelling.md    # commit named; "Arrange diagram"; the leaf colours settled or listed
```

### Source (`etalii.adp.ide.vscode`, pull requests 0 to 5)

```text
package.json                       # the manifest (contracts/package-manifest.md) and the scripts (contracts/dev-interface.md)
package-lock.json
tsconfig.json  tsconfig.view.json  eslint.config.mjs  vitest.config.ts  esbuild.mjs
.vscodeignore  .gitattributes  .gitignore
.vscode/
├── launch.json                    # Run the plug-in; Debug this unit test file; Debug the real-IDE tests
├── tasks.json                     # watch (with its problem matcher), examples
└── extensions.json
.github/
├── workflows/build.yml            # check, build, real-ide-tests, development-build, terminology
└── scripts/
    ├── check-files.py             # as today, skipping the vendored folders
    └── skipped-tests.py           # from the IntelliJ repository
scripts/
├── vendor.mjs                     # refreshes examples/, fixtures/, definitions/ and their PROVENANCE.md
├── examples.mjs                   # copies examples/ to .debug/examples/
└── real-ide.mjs                   # downloads Visual Studio Code, installs the .vsix, runs tests/real-ide
src/
├── extension.ts                   # activate: registers the frame and the diagram types
├── frame/
│   ├── api.ts                     # DiagramType, Intent, EditResult, Scene, messages
│   ├── core/                      # lineDocument, splice, registration, rowPacking, textMetric, hash
│   ├── host/                      # editorProvider, session, editLog, registrationStore, diagnostics,
│   │                              # commands, contextKeys, toolboxView, propertiesView, behaviorFiles,
│   │                              # registrationEditor, newDocument, testSeam
│   └── view/                      # main, bridge, canvas/ (viewport, selection, drag, connect, inlineEditor,
│                                  # handles, contextMenu, refusalLine, ruler, chrome), shapes/ (outline, segments),
│                                  # toolbox/, properties/ (the seven controls), frame.css
├── diagrams/
│   ├── index.ts                   # the one file that names the diagram types
│   ├── gartner-hype-cycle-graph/
│   │   ├── core/                  # model, parser, writer, phases, scale, rules, arrangement, edits, create
│   │   ├── host/                  # toolbox, properties, actions
│   │   ├── view/                  # scene, compact (row-packed layout), gestures, chrome (filter, legend, ruler rungs), ghg.css
│   │   └── index.ts
│   └── agent-behavior-modelling/
│       ├── core/                  # model, kinds, parser, writer, layout, rules, arrangement, edits, create
│       ├── host/                  # toolbox, properties, actions
│       ├── view/                  # scene, drag (from abmDrag.ts), gestures, abm.css
│       └── index.ts
tests/
├── unit/                          # levels 1 and 2, mirroring src/; a fake diagram type; a fake of the vscode API
└── real-ide/                      # level 3: a driver extension and the Mocha suites
examples/                          # vendored: 9 graphs, 4 agents, their .adp files; PROVENANCE.md
fixtures/                          # vendored: 23 .ghg, scale-fixture.json, cross-tier/; written here: agent-behavior-modelling/
definitions/                       # vendored: the two .dis files and companions; PROVENANCE.md
docs/
├── tools.md                       # the tool catalogue (FR-059)
└── parity.md                      # the parity record (FR-007)
README.md  CLAUDE.md  LICENSE  .specify/memory/constitution.md
```

**Structure Decision**: one extension in one package, split by layer inside the frame and inside each diagram type, with `src/diagrams/index.ts` as the only place a diagram type is named. Core is plain TypeScript bundled into both the host and the view. Tests sit beside the source tree, not inside it, so the `.vsix` carries none; the vendored folders sit at the root because tests, the debug copy and the readme all point at them.

## Delivery

| Pull request | Into | Carries | Proves |
|---|---|---|---|
| A | `etalii.adp` | this plan and its tasks; the definition changes | user story 7 (first half), SC-010 |
| 0 | vscode | the ratified constitution, `CLAUDE.md` | FR-060 |
| 1 | vscode | the skeleton, the three test levels, debugging, the pipeline, the readme, the vendored folders; spike S3 | user stories 1, 5, 6; SC-001, SC-006 to SC-009 |
| 2 | vscode | the frame, with a fake diagram type in its tests; spikes S1 and S2 | user story 4; SC-011 |
| 3 | vscode | the Gartner hype cycle graph | user story 2 |
| 4 | vscode | Agent Behavior Modelling | user story 3 |
| 5 | vscode, then `etalii.adp` | `docs/tools.md`, the parity record completed; the companions name this host | user story 7 (second half); SC-002 to SC-005 |

Pull requests 3 and 4 are independent of each other. Each pull request into the VS Code repository is mergeable on its own and leaves `develop` with a plug-in that installs.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| An edit log with marker edits ties the registration to the Markdown's undo history (R6) | FR-024 and FR-026 ask that one step of Edit > Undo puts the Markdown and the registration back together, including for a change that touches the registration alone, and FR-031 asks that it be the editor's own history | Editing the `.adp` as a second text document makes Visual Studio Code ask on every undo whether to undo across files, and leaves registration-only changes outside the diagram's history; writing the registration at once has no undo; an undo of the plug-in's own breaks FR-031 |
| A test seam command, present only when `ADP_TEST` is `1` | FR-045 asks for edits from the canvas and the property grid in a real Visual Studio Code, and a test in the extension host cannot reach a webview's DOM | Driving the window with a browser automation tool is slower and brittle across nested frames; testing only through commands would not exercise a drag |
| The plan lives in one repository and most of the code in another | the spec places it so, as specs 001 and 002 did, because the definitions and the host change together | a plan per repository would split one feature's tasks and lose the order between the definition change and the host |
