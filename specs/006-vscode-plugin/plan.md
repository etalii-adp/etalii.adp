# Implementation Plan: The ADP Plug-in for Visual Studio Code

**Branch**: `features/006-vscode-plugin` | **Date**: 2026-10-05 | **Spec**: [vscode-plugin.spec.md](vscode-plugin.spec.md)
<<<<<<< HEAD
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
=======

**Input**: Feature specification from `specs/006-vscode-plugin/vscode-plugin.spec.md`

## Summary

`etalii.adp.ide.vscode` gets its first plug-in: one Visual Studio Code extension, `etalii.adp`, with the Gartner hype cycle graph and Agent Behavior Modelling diagrams. The two diagram types are written by hand in TypeScript against their definitions in `definitions/diagrams/` (research R3), in three layers: a `core` that knows files, models, layout, rules and edits and nothing of Visual Studio Code; an `extension` that puts each diagram in a custom text editor on the file's own text document, so undo, the modified state, save and the text editor's view come from the platform; and a `webview` that draws the canvas, the ADP Toolbox and ADP Properties. Tests run at three levels (core, webview in a simulated browser, the packaged plug-in in a real Visual Studio Code), one launch configuration starts debugging, and the Build workflow packages `etalii-adp-<version>.vsix`, offers it from the run and keeps a "Development build" pre-release in step with `develop`. In this repository the two definitions gain "Arrange diagram".

## Technical Context

**Language/Version**: TypeScript 5.x, strict, compiled for Node 22 (the extension host) and ES2022 browsers (webviews). Python 3.13 only for the repository's existing file check.

**Primary Dependencies**: the `vscode` extension API at `engines.vscode` `^1.140.0`, the release current at planning (R1). Build: esbuild. Packaging: `@vscode/vsce`. Two libraries are bundled into the plug-in: `yaml` (ISC), which reads YAML and never writes it, and `@mdi/js` (Apache-2.0), for the Material Design icons the definitions name. No UI framework (R4); nothing is fetched at runtime.

**Storage**: the user's own files. A `.ghg` YAML document or a Markdown file is the model; the `.adp` registration beside it keeps positions (FBL, section 8). No other state is persisted.

**Testing**: Vitest for `core` and, with jsdom, for `webview`; `@vscode/test-cli` with `@vscode/test-electron` and Mocha for the packaged plug-in, unpacked from the `.vsix`, in a real Visual Studio Code, under `xvfb-run` on Linux (R8). One command, `npm test`, runs all three.

**Target Platform**: desktop Visual Studio Code 1.140 or later on Windows, macOS and Linux.

**Project Type**: a Visual Studio Code extension (desktop app plug-in), one npm package.

**Performance Goals**: an example drawn within 2 seconds of opening (SC-005); an edit round trip (gesture, splice, re-read, redraw) under 100 ms on the largest example; only what is in view is drawn.

**Constraints**: byte-preserving line splices only (FR-009, FR-010); no network at runtime (FR-001); a strict content security policy in every webview; every user-visible sentence taken verbatim from the definitions.

**Scale/Scope**: two diagram types; about 8,500 lines of standalone module code and the parts of a 12,000-line canvas library they use, as reference; 13 example documents; 19 rules; 60 functional requirements across two repositories.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Against `etalii.adp`'s constitution, 1.2.0:

| Principle | Check | Result |
|---|---|---|
| I. One Source of Truth | The host implements the two definitions rather than a variant; differences go to the parity record or back here as changes (FR-006, FR-007). "Arrange diagram" is added to the definitions before the host builds it (FR-027). | Pass |
| II. Implementable from the Document Alone | The definition changes touch `.dis` files and their companions together; both stay valid against the schema (FR-028). No specification language changes. | Pass |
| III. Precise Normative Language | The companions are informative prose tied to code, as they are today; the `.dis` additions use DISL 0.1 constructs and CEL only. | Pass |
| IV. Versioned Specifications | DISL itself does not change. Each `.dis` raises its own `language.version` by a minor step for the added operation. | Pass |
| V. Simplicity | No DISL runtime, no UI framework, no shared-code package between hosts: each is justified only by a later need (R3, R4). | Pass |
| Workflow | One Spec Kit feature; work on `features/` branches; pull requests with merge commits into `develop` in both repositories. | Pass |

One deviation is recorded under Complexity Tracking: this feature's code lands in another repository than its specification.

`etalii.adp.ide.vscode` has no ratified constitution yet. Task T003 ratifies one, modelled on IntelliJ's (native citizenship, the text file is the source of truth, one frame and many tools, test-first against real files, simplicity), and this plan already follows those five. Re-checked after Phase 1: no new deviation.
>>>>>>> 2f6cea1c27eb05f0ac84ad244c8be4489751d5b4

## Project Structure

### Documentation (this feature)

```text
specs/006-vscode-plugin/
├── vscode-plugin.spec.md
<<<<<<< HEAD
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
=======
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── plugin-contributions.md   # what package.json contributes: editors, commands, views, keys
│   ├── frame.md                  # the seam between core, extension and webview
│   └── build-workflow.md         # the Build workflow's jobs, downloads and development build
├── checklists/requirements.md
└── tasks.md                      # /speckit-tasks
```

### Source Code (`etalii.adp.ide.vscode`)

```text
package.json                 # the extension manifest: name adp, publisher etalii, version
tsconfig.json, esbuild.mjs, eslint.config.mjs, vitest.config.ts, .vscode-test.mjs
.vscode/launch.json, tasks.json, extensions.json
src/
├── core/                    # no import of vscode or the DOM
│   ├── text/                # LineDocument, splices, line endings
│   ├── registration/        # the .adp registration: read, layout block, splices
│   ├── frame/               # DiagramType contract, view model, edits, findings, toolbox, forms
│   ├── gartner-hypecycle-graph/   # parser, writer, phases, scale, rules, edits, arrangement, mapper
│   └── agent-behavior-modelling/  # parser, writer, layout, rules, edits, arrangement, mapper
├── extension/               # runs in the extension host
│   ├── extension.ts         # activate: registers every diagram type from one list
│   ├── diagramEditor.ts     # the custom text editor shared by every diagram type
│   ├── registrationEditor.ts# opens a .adp on its body
│   ├── propertiesView.ts    # ADP Properties
│   ├── findings.ts          # findings to the Problems panel
│   └── commands.ts          # ADP: commands, new documents
└── webview/                 # runs in webviews
    ├── canvas/              # surface, pan and zoom, selection, gestures, shapes, labels, chrome
    ├── toolbox/             # ADP Toolbox, docked in the diagram's editor
    ├── properties/          # the property grid's controls
    ├── gartner-hypecycle-graph/   # notation: phased banner, trigger, note, influence, ruler, filter, legend, compact
    └── agent-behavior-modelling/  # notation: eleven shapes, parent line, drag preview
examples/                    # vendored from standalone, with PROVENANCE.md
fixtures/                    # rule and round-trip fixtures and scale-fixture.json, vendored unchanged
test/
├── core/ , webview/         # Vitest
└── vscode/                  # the packaged plug-in in a real Visual Studio Code
scripts/                     # sync-examples, prepare-debug-examples, skipped-tests
docs/tools.md, docs/parity.md
```

**Structure Decision**: one npm package with three source roots, bundled by esbuild into `dist/extension.js` and one script per webview. A diagram type is one folder under `src/core/` and one under `src/webview/`, plus one entry in the list `extension.ts` registers (FR-005, SC-011). `core` is importable by both other roots and by tests without Visual Studio Code.

## Delivery

Pull requests into `etalii.adp.ide.vscode`'s `develop`, each green before it is merged, in this order; each carries the tests for what it adds (FR-047):

1. **Skeleton and pipeline** (US1, US6): manifest, build, lint, the three test levels with one test each, launch configuration, constitution, readme, the Build workflow with the run download and the development build. After it, the plug-in installs and does nothing.
2. **Core for the hype cycle graph** (US2, US5): text splices, parser, writer, phases, scale, rules, edits, arrangement, with the vendored examples and fixtures.
3. **Frame and canvas, read-only** (US4): the custom text editor, the webview protocol, the canvas, findings; a `.ghg` is drawn.
4. **Hype cycle graph editing** (US2): gestures, toolbox, ADP Properties, chrome, compact, arrange.
5. **Core for Agent Behavior Modelling** (US3, US5).
6. **Agent Behavior Modelling in the frame** (US3): notation, gestures, registration, arrange, new document.
7. **Catalogue, parity record and polish** (US7): `docs/tools.md`, `docs/parity.md`, readme, high contrast, large documents.

One pull request into `etalii.adp`'s `develop` for the definitions (US7), independent of the seven.
>>>>>>> 2f6cea1c27eb05f0ac84ad244c8be4489751d5b4

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
<<<<<<< HEAD
| An edit log with marker edits ties the registration to the Markdown's undo history (R6) | FR-024 and FR-026 ask that one step of Edit > Undo puts the Markdown and the registration back together, including for a change that touches the registration alone, and FR-031 asks that it be the editor's own history | Editing the `.adp` as a second text document makes Visual Studio Code ask on every undo whether to undo across files, and leaves registration-only changes outside the diagram's history; writing the registration at once has no undo; an undo of the plug-in's own breaks FR-031 |
| A test seam command, present only when `ADP_TEST` is `1` | FR-045 asks for edits from the canvas and the property grid in a real Visual Studio Code, and a test in the extension host cannot reach a webview's DOM | Driving the window with a browser automation tool is slower and brittle across nested frames; testing only through commands would not exercise a drag |
| The plan lives in one repository and most of the code in another | the spec places it so, as specs 001 and 002 did, because the definitions and the host change together | a plan per repository would split one feature's tasks and lose the order between the definition change and the host |
=======
| The specification, plan and tasks are in `etalii.adp`; the code is in `etalii.adp.ide.vscode` | Peter asked for the specification here; the feature also changes two definitions here, and specs 001 and 002 set the precedent for work across repositories | Moving the feature folder to the VS Code repository would split it from the definition changes and from the request |
| An undo step that spans two files (a behavior model's Markdown and its registration) | FR-024 and FR-026: a drag changes both, and one undo must put both back | Keeping positions in the Markdown is forbidden by the definition; keeping them outside the undo history breaks FR-024 (R2) |
>>>>>>> 2f6cea1c27eb05f0ac84ad244c8be4489751d5b4
