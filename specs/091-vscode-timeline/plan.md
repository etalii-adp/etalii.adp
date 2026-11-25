# Implementation Plan: The Timeline in VS Code, as the Standalone One

**Branch**: `claude/project-thread-bp4mae` (the cloud session's harness names it in every repository); the implementation's pull requests are named in *Delivery* | **Date**: 2026-11-25 | **Spec**: [vscode-timeline.spec.md](vscode-timeline.spec.md)

**Input**: the specification, approved by Peter on 2026-11-25 (decision card "Approve and plan").

## Summary

VS Code gains the timeline by copying its definition, its examples and its conformance fixtures, and by building what its DISL interpreter, scene and canvas lack of what that definition uses: a time axis of dates with an adaptive ruler down to days, calendar snapping, a diamond, and a date that reaches CEL as the text the file writes. Each serves every diagram (FR-016).

What only this tool type needs is carried as the plugins its definition names, ported from the standalone module: the time functions (`net.etalii.adp.generic.timelineTimes`) and the row arrangement behind Arrange diagram (`net.etalii.adp.generic.timelineRowArrange`). The definition changes in etalii.adp in one place, the stale `persist.yaml` requirement. The tool type is held to the ATD conformance fixtures `roadmap`, `add` and `findings` (FR-017).

## Technical Context

- **Language**: TypeScript 5, as the extension is; the webview is plain DOM and SVG.
- **What changes in etalii.adp**: `definitions/diagrams/timeline.dis` (requires, version 1.2.1) (R1); this plan, its research and tasks; the ticks.
- **What changes in etalii.adp.ide.standalone**: `src/diagrams/timeline/definition/`, re-bundled with `bundle-disl.sh`; nothing it draws changes.
- **What changes in `etalii.adp.ide.vscode`**:
  - `definitions/timeline/` and `package.json`, by `npm run sync-definitions -- … --add definitions/diagrams/timeline.dis`; `fixtures/tools/timeline/` from the conformance folder (R9); `examples/timeline/` by `sync-examples` (R10).
  - `src/core/disl/support.ts`: `axis.time`, `snap.calendar`.
  - `src/core/disl/coordinates.ts`: the time axis of `datetime` values and the ruler's levels down to a day (R4).
  - `src/core/disl/expressions.ts`: a diagram's dates as text (R2).
  - `src/core/disl/notation.ts`, `src/webview/diagram/scene.ts`: the `diamond` shape (R5).
  - `src/core/scene/snapping.ts`: calendar snapping of a position and of a dragged edge (R6).
  - `src/core/scene/scene.ts`, `src/core/tool/toolTypeFrom.ts`: a drop's position as a date, a bound period moved and resized in days (R7).
  - `src/core/plugins/timeline-times/`, `timeline-row-arrange/` and, if the replay asks for it, `timeline-reading/`, registered in `src/core/plugins/index.ts`.
  - `test/core/tool/timeline.test.ts` (R9), and tests beside each change.
  - `docs/tools.md`, `README.md`, `CHANGELOG.md`, `docs/disl-support.md`, `docs/parity.md`, `docs/screenshots/timeline.png`.
- **Tests**: vitest for the core and the plugins, jsdom for the webview, written first and seen failing; `words.test.ts` and `supportRecord.test.ts` as they are; `test/vscode/` for one undo step per gesture, which CI runs.
- **Checks**: `npm run check`, `npm run test:unit`, `npm run test:vscode`, `npm run sync-definitions -- --check`; the Build workflow runs them.
- **Constraints**: VS Code principle I (one edit of the text document per gesture, theme colours); nothing under `src/core/disl/`, `scene/` or `tool/` names a tool type.
- **Unknowns**: none blocking. What .NET's time reading accepts beyond the fixtures and examples (R3) is recorded, not imitated; whether the timeline needs reading logic (R8) is answered by the replay.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The definition and the conformance fixtures stay in etalii.adp and are copied unchanged; the definition's one change lands there first. |
| II. Implementable from the document alone | Every behaviour is the definition's, its companion's, or a plugin it names, ported from the module the companion points to. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | The definition's version goes from 1.2.0 to 1.2.1, a correction. |
| V. Simplicity | Generic constructs once in the interpreter; two plugins the definition already names. |
| VI. No Rider warnings | No C# is written. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Every gesture is one edit and one undo step; colours follow the theme. |
| II. The text file is the source of truth | Edits stay FBL splices; the written text of a date keeps its precision. |
| III. One frame, many tools | The time axis, snapping and the diamond are generic; the timeline's own code is in its plugins. |
| IV. Test-first | Each task writes its test first and sees it fail. |
| V. Simplicity | No dependency is added. |

## Delivery

Each pull request is one branch, with auto-merge on (merge commit). A VS Code pull request names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request. Each pull request of a repository is made from `claude/project-thread-bp4mae` in turn, restarted from `develop` after the one before has merged.

| Pull request | Repository | Holds | Phase |
|---|---|---|---|
| A | etalii.adp | This plan, its research and tasks | |
| B | etalii.adp | The definition's requirement (FR-001) | 1 |
| C | standalone | The re-bundled definition | 1 |
| D | VS Code | Open and read: the definition, examples and fixtures, dates as text, the time functions, `axis.time` read (FR-001 – FR-004) | 2 |
| E | VS Code | Draw: the time axis and its ruler, the diamond, the period bar (FR-005 – FR-008) | 3 |
| F | VS Code | Gestures and Arrange diagram: drop, move, resize, calendar snapping, the row arrangement (FR-009 – FR-012, FR-015) | 4 |
| G | VS Code | Properties, findings, the conformance replay and the documents (FR-013, FR-014, FR-017, FR-018) | 5 |
| H | etalii.adp | The ticks | |

The side-by-side check of the four examples, the screenshot, the Marvel universe's opening time and the new-user attempt (SC-001, SC-004, SC-005) run on the Mac mini after G, in a host test that needs Peter to start it there; its screenshot goes in with a last small VS Code pull request if G has merged by then.

## Project Structure

```text
specs/091-vscode-timeline/
├── vscode-timeline.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

The definition is the contract; the view and request types are those of `src/core/frame/toolType.ts` and gain only optional members.

```text
etalii.adp.ide.vscode/
├── definitions/timeline/, examples/timeline/, fixtures/tools/timeline/
├── src/core/disl/          axis.time, ruler levels to a day, dates as text, diamond
├── src/core/scene/         calendar snapping, bound periods in days
├── src/core/tool/          a drop's date, edits of begin and end
├── src/core/plugins/timeline-times/, timeline-row-arrange/
├── src/webview/diagram/    the diamond, the ruler
└── test/core/…, test/webview/diagram/, test/vscode/
```

## Complexity Tracking

None is a violation. The risks are .NET's time reading accepting text the port does not (R3), which the fixtures and examples bound and `docs/parity.md` records, and the size of the Marvel universe (R10), which a unit test with a time budget watches before the Mac mini measures it.
