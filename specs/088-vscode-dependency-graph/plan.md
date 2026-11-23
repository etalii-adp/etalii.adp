# Implementation Plan: The Dependency Graph in VS Code, as the Standalone One

**Branch**: `features/088-vscode-dependency-graph-plan` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-23 | **Spec**: [vscode-dependency-graph.spec.md](vscode-dependency-graph.spec.md)

**Input**: the specification, approved by Peter on 2026-11-23 (decision card "Approve, then build").

## Summary

VS Code gains the dependency graph by copying its definition, and by building what its DISL interpreter, scene and canvas lack of what that definition uses: a routing plugin with its fallback, an edge's `connect.from`, a library tool's `createSource` and `createTarget` on a release over empty canvas, a row's `validate` on the typed text, the binding's refusals passed through, and the built-in missing-id finding left to the definition's own rule. Each serves every diagram (FR-024).

What only this tool type needs is carried as code, as the companion's *What remains in the module* lists it for the standalone host: the dependency curve (plugin `net.etalii.adp.generic.dependencyCurve`), the written ends (`net.etalii.adp.generic.dependencyEnds`), and the reading the binding cannot state, carried by origin as the causal loop diagram's is: nodes before dependencies, the order of the findings, the X row's four decimals. The definition itself changes in etalii.adp in two places, the stale `persist.yaml` requirement and the colours, which take standalone's look in both themes. The tool type is held to the standalone transcript of 39 documents (SC-002).

## Technical Context

- **Language**: TypeScript 5, as the extension is; the webview is plain DOM and SVG.
- **What changes in etalii.adp**: `definitions/diagrams/dependency-graph.dis` (requires, theme tokens and `modes.dark`) and `dependency-graph.md` (section 4's X row, section 8's colours) (R1, R2, R4); this plan, its research and tasks; the ticks.
- **What changes in etalii.adp.ide.standalone**: `src/diagrams/dependency-graph/definition/`, re-bundled with `bundle-disl.sh`; nothing it draws changes.
- **What changes in `etalii.adp.ide.vscode`**:
  - `definitions/dependency-graph/` and `package.json`, by `npm run sync-definitions -- … --add definitions/diagrams/dependency-graph.dis` (only that folder kept); `examples/dependency-graph/` by `sync-examples`.
  - `src/core/tool/pluginRegistry.ts`: the plugin kind `routing` (R3), and `ReadingLogic.order` (R5).
  - `src/core/scene/`: a routing plugin called with its fallback (R3); the edge label's size and place.
  - `src/core/disl/notation.ts`, `toolbox.ts`, `behavior.ts`, `forms.ts`, `constraints.ts`: `connect.from`, `createSource`/`createTarget`, `validate` on text, the binding's refusals, the built-in missing-id (R5, R6, R7).
  - `src/core/tool/toolTypeFrom.ts`, `src/core/frame/toolType.ts`: `connect` to a point, the ask of a menu add with no point.
  - `src/webview/diagram/canvas.ts`: a release on empty canvas, Tab on a selected node.
  - `src/extension/commands.ts`, `package.json`: **ADP: Add node**.
  - `src/core/plugins/dependency-curve/`, `dependency-ends/`, `dependency-reading/`, registered in `src/core/plugins/index.ts`.
  - `fixtures/tools/dependency-graph/` and `test/core/tool/dependencyGraph.test.ts` (R8).
  - `docs/tools.md`, `README.md`, `docs/disl-support.md`, `docs/parity.md`, `docs/screenshots/dependency-graph.png`.
- **Tests**: vitest for the core and the plugins, jsdom for the webview, written first and seen failing; `words.test.ts` and `supportRecord.test.ts` as they are; `test/vscode/` for **ADP: Add node** and one undo step per gesture, which CI runs.
- **Checks**: `npm run check`, `npm run test:unit`, `npm run test:vscode`, `npm run sync-definitions -- --check`; the Build workflow runs them.
- **Constraints**: VS Code principle I (one edit of the text document per gesture, platform dialogs, theme colours); nothing under `src/core/disl/`, `scene/` or `tool/` names a tool type.
- **Unknowns**: none blocking. R5's reading of DISL 8.7 on built-in findings is checked against the text first.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The definition stays in etalii.adp and is copied unchanged; its two changes land there first. |
| II. Implementable from the document alone | Every behaviour is the definition's or the companion's; where the companion is wrong about standalone (the X row), the companion is corrected. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | The definition's version goes from 1.1.0 to 1.1.1, a correction. |
| V. Simplicity | Generic constructs once in the interpreter; three small plugins for the rest. |
| VI. No Rider warnings | No C# is written. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Every gesture is one edit and one undo step; **ADP: Add node** asks in an input box. |
| II. The text file is the source of truth | Edits stay FBL splices. |
| III. One frame, many tools | The constructs are generic; the dependency graph's own code is in its plugins. |
| IV. Test-first | Each task writes its test first and sees it fail. |
| V. Simplicity | No dependency is added. |

## Delivery

Each pull request is one branch, with auto-merge on (merge commit). A VS Code pull request names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request. The cloud session's harness names the branch `claude/project-thread-szzxho` in every repository; each pull request of a repository is made from it in turn, from `develop` after the one before has merged.

| Pull request | Repository | Holds | Phase |
|---|---|---|---|
| A | etalii.adp | This plan, its research and tasks | |
| B | etalii.adp | The definition's requirement and colours, the companion's corrections (FR-001, FR-008, FR-017) | 1 |
| C | standalone | The re-bundled definition | 1 |
| D | VS Code | Open, read and find: the definition and example, the reading logic, the written ends, the findings and their order, the refusals of a file that does not read (FR-001 – FR-004, FR-015, FR-020 – FR-022) | 2 |
| E | VS Code | Draw: routing plugins and the dependency curve, the ends, the label, the arrowhead (FR-005 – FR-009) | 3 |
| F | VS Code | Gestures and properties (FR-010 – FR-014, FR-016 – FR-019) | 4 |
| G | VS Code | The transcript test, the documents and the screenshot (FR-023 – FR-026, SC-001 – SC-005) | 5 |
| H | etalii.adp | The ticks | |

## Project Structure

```text
specs/088-vscode-dependency-graph/
├── vscode-dependency-graph.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

The definition is the contract; the view and request types are those of `src/core/frame/toolType.ts` and gain only optional members.

```text
etalii.adp.ide.vscode/
├── definitions/dependency-graph/, examples/dependency-graph/
├── src/core/disl/          connect.from, create on release, validate on text, built-in findings
├── src/core/scene/         routing plugins with fallback, edge label
├── src/core/tool/          routing plugin kind, reading order, connect to a point
├── src/core/plugins/dependency-curve/, dependency-ends/, dependency-reading/
├── src/webview/diagram/    release on empty canvas, Tab
├── src/extension/          ADP: Add node
├── fixtures/tools/dependency-graph/
└── test/core/…, test/webview/diagram/, test/vscode/
```

## Complexity Tracking

None is a violation. The risks are a curve that differs from standalone's by a control point (R3), which the side-by-side check of SC-001 shows, and a built-in finding whose default DISL does not state clearly (R5), which is raised in etalii.adp if so.
