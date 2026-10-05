# Implementation Plan: The ADP Plug-in for Visual Studio Code

**Branch**: `features/006-vscode-plugin` | **Date**: 2026-10-05 | **Spec**: [vscode-plugin.spec.md](vscode-plugin.spec.md)

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

## Project Structure

### Documentation (this feature)

```text
specs/006-vscode-plugin/
├── vscode-plugin.spec.md
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

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| The specification, plan and tasks are in `etalii.adp`; the code is in `etalii.adp.ide.vscode` | Peter asked for the specification here; the feature also changes two definitions here, and specs 001 and 002 set the precedent for work across repositories | Moving the feature folder to the VS Code repository would split it from the definition changes and from the request |
| An undo step that spans two files (a behavior model's Markdown and its registration) | FR-024 and FR-026: a drag changes both, and one undo must put both back | Keeping positions in the Markdown is forbidden by the definition; keeping them outside the undo history breaks FR-024 (R2) |
