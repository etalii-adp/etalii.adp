# Implementation Plan: The Causal Loop Diagram in VS Code, as the Standalone One

**Branch**: `claude/project-thread-h0g13s` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-22 | **Spec**: [vscode-causal-loop-diagram.spec.md](vscode-causal-loop-diagram.spec.md)

**Input**: the specification, approved by Peter on 2026-11-22 (decision card "Approve, then build").

## Summary

VS Code gains the causal loop diagram by copying its definition, and by building what its DISL interpreter, scene and canvas lack of what that definition uses: the `natural` id strategy and relation ends found by key, the `bounds` store kept in the registration, the `circular` layout, curved routing with its variants, edge labels, mid markers, self-loops, node icons with `flip`, a wavy underline, the canvas's empty text, drop targets, operation dialogs, the diagram's own form, the parsed form rows, `constraints.order`, and the CEL functions the definition calls (`avg`, `cel.bind`, `lists.range`, `diagram.cycles`, `diagram.cyclesTruncated`). Each of these serves every diagram (FR-041).

What only this tool type needs is carried as code, as the companion's *What stays code* lists it for the standalone host: the cycle finder (plugin `net.etalii.adp.systems.cldCycles`, a new plugin kind for CEL functions), the self-organizing layout of Arrange diagram (plugin `net.etalii.adp.systems.cld`, a layout plugin), and the reading the binding cannot state (a link's note, the four unreadable-line sentences, a weight's exponent), carried by origin as the Knowledge designer's view logic is. The tool type is held to the standalone transcript of 23 documents, as the mind map is (SC-002).

## Technical Context

- **Language**: TypeScript 5, as the extension is; the webview is plain DOM and SVG, no framework.
- **What changes in `etalii.adp.ide.vscode`**:
  - `definitions/causal-loop-diagram/` and `package.json`, by `npm run sync-definitions -- … --add definitions/diagrams/causal-loop-diagram.dis`; `examples/causal-loop-diagram/` by `sync-examples`.
  - `src/core/disl/persistence.ts`, `metamodel.ts`: natural ids, relation ends by key (R1).
  - `src/core/disl/expressions.ts`: the CEL functions, and functions a plugin provides (R4).
  - `src/core/disl/layout.ts`, `src/core/scene/`: `circular` (R2), `onLoadIfMissing`, `respect: all`; the `bounds` store in `src/core/tool/registrationLayout.ts` and `toolTypeFrom.ts` (R3).
  - `src/core/disl/notation.ts`, `src/core/scene/scene.ts`, `src/webview/diagram/canvas.ts`, `scene.ts`, `canvas.css`: curved routing, variants, edge labels, mid markers, self-loops, node icons and `flip`, the wavy underline, the empty text (R5, R9).
  - `src/core/disl/toolbox.ts`, `behavior.ts`, `forms.ts`, `src/extension/`: drop targets, operation dialogs, the diagram's form, parsed rows, the move refusal (R6, R7, R8).
  - `src/core/disl/constraints.ts`, `support.ts`: `constraints.order` and the feature ids as each is built.
  - `src/core/tool/pluginRegistry.ts`: the plugin kind `functions` (R4) and the origin-keyed `reading` logic (R10).
  - `src/core/plugins/cld-cycles/`, `cld-layout/`, `cld-reading/`, registered in `src/core/plugins/index.ts`.
  - `fixtures/tools/causal-loop-diagram/`: the standalone transcript and its fixtures (R11).
  - `docs/tools.md`, `README.md`, `docs/disl-support.md`, `docs/parity.md`, `docs/screenshots/causal-loop.png`.
- **What changes in etalii.adp**: this plan, its research and tasks; the ticks. Nothing in `definitions/`.
- **Tests**: vitest for the core (`test/core/disl/definitions/causalLoopDiagram.test.ts`, `test/core/tool/causalLoopDiagram.test.ts`, `test/core/plugins/`) and the webview in jsdom (`test/webview/diagram/`), written first and seen failing; `test/vscode/` for the dialogs and one undo step per gesture; `words.test.ts` and `supportRecord.test.ts` as they are.
- **Checks**: `npm run check`, `npm run test:unit`, `npm run test:vscode`, `npm run sync-definitions -- --check`; the Build workflow runs them.
- **Performance**: SC-004, `uk-cod-population.cld` drawn within two seconds and arranged within five, measured in the unit harness.
- **Constraints**: VS Code principle I (one edit of the text document per gesture, platform dialogs, theme colours); nothing under `src/core/disl/`, `scene/` or `tool/` names a tool type; the view stays plain JSON.
- **Unknowns**: none blocking. R6's exactness of a ported layout across .NET and V8 is measured, not assumed.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The definition stays in etalii.adp and is copied unchanged; the companion's *What stays code* is followed for what a definition cannot state. |
| II. Implementable from the document alone | Every behaviour is the definition's or the companion's; where the companion records the standalone host's choice, that is followed (R2, R10). |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | No specification's version changes. |
| V. Simplicity | Generic constructs once in the interpreter; three small plugins for the rest. |
| VI. No Rider warnings | No C# is written. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Every gesture is one edit and one undo step; the operation dialogs are VS Code input boxes (R7); colours are the theme's. |
| II. The text file is the source of truth | Edits stay FBL splices; positions stay in the registration. |
| III. One frame, many tools | The constructs are generic; the causal loop diagram's own code is in its plugins. |
| IV. Test-first | Each task writes its test first and sees it fail. |
| V. Simplicity | No dependency is added. |

## Delivery

Each pull request is one branch, with auto-merge on (merge commit). A VS Code pull request names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request. The cloud session's harness names the branch `claude/project-thread-h0g13s` in every repository; each VS Code pull request is made from it in turn, from `develop` after the one before has merged.

| Pull request | Repository | Holds | Spec phase |
|---|---|---|---|
| A | etalii.adp | The specification, this plan, its research and tasks | |
| B | VS Code | Open and draw: the definition and examples, natural ids, the bounds store, the ring, the drawing (FR-001 – FR-007, FR-011 – FR-021) | 1 |
| C | VS Code | Loops and findings: CEL functions and plugin functions, the cycle finder, `constraints.order`, the reading plugin (FR-008 – FR-010, FR-030 – FR-033) | 2 |
| D | VS Code | Gestures, menus and dialogs (FR-022 – FR-029) | 3 |
| E | VS Code | Properties and Arrange, tooltips (FR-034 – FR-039) | 4 |
| F | VS Code | The transcript test, the documents and the screenshot (FR-040 – FR-042, SC-001 – SC-005) | 5 |
| G | etalii.adp | The ticks | |

## Project Structure

```text
specs/081-vscode-causal-loop-diagram/
├── vscode-causal-loop-diagram.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

The definition is the contract; the view and request types are those of `src/core/frame/toolType.ts` and gain only optional members.

```text
etalii.adp.ide.vscode/
├── definitions/causal-loop-diagram/, examples/causal-loop-diagram/
├── src/core/disl/          natural ids, CEL functions, circular, notation, toolbox, forms, order
├── src/core/scene/         curved edges, labels, markers, self-loops, icons, empty text
├── src/core/tool/          bounds store, plugin kinds, drop targets, dialogs' requests
├── src/core/plugins/cld-cycles/, cld-layout/, cld-reading/
├── src/webview/diagram/    drawing, dialogs' triggers, empty text
├── src/extension/          input boxes for operation forms
├── fixtures/tools/causal-loop-diagram/
└── test/core/…, test/webview/diagram/, test/vscode/
```

## Complexity Tracking

None is a violation. The risks are a ported algorithm that differs in the last digit (R6) and a reading the binding cannot state (R10); SC-002 measures both against the transcript, and a difference that remains is recorded in `docs/parity.md` with its reason.
