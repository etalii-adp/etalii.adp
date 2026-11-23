# Implementation Plan: The Three Service Management Tools in VS Code

**Branch**: `claude/project-thread-cj29ch` in every repository (the cloud session's branch) | **Date**: 2026-11-23 | **Spec**: [vscode-itil-tools.spec.md](vscode-itil-tools.spec.md)

**Input**: the specification, approved by Peter on 2026-11-23 (decision card "Approve, then build").

## Summary

VS Code gains the value stream map, the post-incident review designer and the SLO map by copying their definitions and building, once for every tool type, what its interpreter and FBL library lack of what they use:

- CEL's whole-number `max`, `min` and `sum`, and DISL's graph members `reachable`, `inCycle` and their kin (R1, R2).
- DESL 0.4's `sections` surface, laid out in the webview (R5).
- FBL's `bullets` word slots of `many` attributes and mapped values (R6).
- FBL 0.22's YAML streams, the folder subject, and CEL `distinct` in bindings (R4).

Each tool is held to its own read and edit fixtures from etalii.adp (R7). No tool type gets code of its own unless a test shows the definition cannot state it.

## Technical Context

- **Language**: TypeScript 5, as the extension is; the webview is plain DOM and SVG.
- **What changes in etalii.adp**: this plan, its research and tasks, and the ticks. Any definition found wrong is corrected in its own pull request first.
- **What changes in `etalii.adp.ide.vscode`**:
  - `definitions/value-stream-map/`, `definitions/openslo-slo/`, `definitions/post-incident-review/` and `package.json`, by `npm run sync-definitions -- … --add <definition>`; `examples/` by `sync-examples`.
  - `src/core/disl/expressions.ts` and `cycles.ts`: R1, R2.
  - `src/core/fbl/`: the `bullets` family (R6), the `yaml` family's streams, the folder subject and the expression environment (R4); `docs/fbl.md`.
  - `src/core/desl/specification.ts`, `surface.ts`, a new `src/core/tool/sectionsView.ts`, and `src/webview/designer/sections/` (R5).
  - `fixtures/tools/value-stream-map/`, `openslo-slo/`, `post-incident-review/` and one test per tool (R7).
  - `docs/tools.md`, `README.md`, `docs/disl-support.md`, `docs/parity.md`, `docs/screenshots/`.
- **Tests**: vitest, written first and seen failing; jsdom for the webview; `words.test.ts` and `supportRecord.test.ts` as they are; `test/vscode/` for one undo step per gesture.
- **Checks**: `npm run check`, `npm run test:unit`, `npm run test:vscode`, `npm run sync-definitions -- --check`; the Build workflow runs them.
- **Constraints**:
  - VS Code principle I: every gesture is one edit of the text document.
  - Nothing under `src/core/disl/`, `desl/`, `scene/` or `tool/` names a tool type.
  - `src/core/fbl/` stays the one library the Notion add-ons copy.
- **Unknowns**: none blocking. R3 and R6 are settled by the first failing fixture test, not by a guess.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The definitions stay in etalii.adp and are copied unchanged. |
| II. Implementable from the document alone | Every behaviour is the definition's, the companion's or a fixture's. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | No version changes, unless a definition must be corrected. |
| V. Simplicity | Generic constructs once; no plugin unless a test shows one is needed. |
| VI. No Rider warnings | No C# is written. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Every gesture is one edit and one undo step; findings are diagnostics. |
| II. The text file is the source of truth | Edits stay FBL splices; the fixtures hold the bytes. |
| III. One frame, many tools | `sections`, streams, folders and graph members serve every tool type. |
| IV. Test-first, against real files | Each task writes its test first and sees it fail; the fixtures are etalii.adp's own. |
| V. Simplicity | No dependency is added. |

## Delivery

Each pull request has auto-merge on (merge commit). A VS Code pull request names this folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp once their pull request has merged, in one tick pull request per phase. One branch per repository, so a repository's next pull request starts once the one before has merged.

| Pull request | Repository | Holds | Phase |
|---|---|---|---|
| A | etalii.adp | This plan, its research and tasks | |
| B | VS Code | The value stream map: CEL numbers, graph members, its reading, definition, example and fixtures (FR-001 – FR-005) | 2 |
| C | VS Code | The review's reading: `bullets` `many` and mapped values, DESL 0.4 read, definition and fixtures (FR-011) | 3 |
| D | VS Code | The `sections` page and its gestures (FR-009, FR-010) | 4 |
| E | VS Code | The SLO map: FBL 0.22 streams, `distinct`, the folder subject, definition and fixtures (FR-006 – FR-008) | 5 |
| F | VS Code | Documents, examples and screenshots (FR-013) | 6 |
| G | standalone | The catalogue's VS Code states (FR-014) | 6 |
| H | etalii.adp | The ticks | |

## Project Structure

```text
specs/090-vscode-itil-tools/
├── vscode-itil-tools.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

```text
etalii.adp.ide.vscode/
├── definitions/value-stream-map/, openslo-slo/, post-incident-review/
├── src/core/disl/              whole-number max/min/sum, graph members
├── src/core/fbl/               bullets many and map, yaml streams, folder subject, distinct
├── src/core/desl/              DESL 0.4, sections
├── src/core/tool/sectionsView.ts
├── src/webview/designer/sections/
├── fixtures/tools/<tool>/      copied from etalii.adp, with PROVENANCE.md
└── test/core/…, test/webview/designer/, test/vscode/
```

## Complexity Tracking

None is a violation. The risks:

- The `sections` page is the largest new part. Its first pull request reads and serves the view, and its second draws and edits, so a review shows early.
- The FBL library is shared with the Notion add-ons. A change there is kept to the constructs the three bindings use, and the Notion copies refresh by their own script.
- Spec 088 works in the same folders at the same time (R8).
