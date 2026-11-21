# Implementation Plan: The VS Code Knowledge Designer Looks and Works as the Standalone One

**Branch**: `claude/project-thread-bvf5w4` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-21 | **Spec**: [vscode-knowledge-table-parity.spec.md](vscode-knowledge-table-parity.spec.md)

**Input**: the specification, approved by Peter on 2026-11-21 (decision card "Approve both", for specs 079 and 080), with the plan and tasks asked for.

## Summary

The VS Code table surface becomes the table `knowledge.md` section *Layout and behaviour* describes and the standalone host draws: view tabs with a `+`, a view bar with a magnifier, one settings control and four editors, headers that open a full column menu and can be dragged and resized, a `+` for a property, rows with a handle and a checkbox, a selection bar, group headings with their controls, `+ New` lines, rounded option tags, a searchable option list that creates, findings on their cells, a calculation line, Shift+Enter, and only the rows in sight drawn.

Three things are added below the webview, all generic to a DESL table: a request of several steps written as one edit (research R2), gestures named by the table surface that a tool type's plugin maps to its operations (R1), and the view carrying its findings by element (R6). The Knowledge designer's plugin, which already says what a view shows, gains the gesture table, the calculations per type (R8), nested rows to any depth and the facts the group editor shows. The webview is rewritten in parts, one file per part, as the standalone table library is.

One finding goes to Peter: FR-017's amendment of `addRow` is not needed, because the definition already gives the host the step of setting a group's value (R3).

## Technical Context

- **Language**: TypeScript 5, as the extension is; the webview is plain DOM and CSS, no framework, as today.
- **What changes in `etalii.adp.ide.vscode`**:
  - `src/core/tool/tableView.ts`: the steps request (`steps`) and the gesture request (`gesture`); the view's `columnMenu`, `rowMenu`, `findings`, line kinds for nested rows and `+ New`, hidden groups and calculations.
  - `src/core/tool/toolTypeFrom.ts`: `editTable` runs `steps` and `gesture` as one write; the view carries findings.
  - `src/core/plugins/knowledge-views/`: the gesture table, calculations per type, nesting by parent to any depth, the group facts.
  - `src/core/desl/operations.ts`: only if a step needs the element a step before it created (`created` is already in an outcome).
  - `src/webview/table/`: `table.ts` split into `tabs.ts`, `viewBar.ts`, `editors/filter.ts`, `editors/sort.ts`, `editors/group.ts`, `editors/visibility.ts`, `header.ts`, `columnMenu.ts`, `options.ts`, `rows.ts`, `windowing.ts`, `selection.ts`, `calculations.ts`, `drag.ts`, `cellList.ts`; `table.css`.
  - `docs/disl-support.md`, `docs/parity.md`, `docs/screenshots/knowledge.png`, `README.md` where it describes the designer.
- **What changes in etalii.adp**: this plan, its research and tasks; the ticks. Nothing in `definitions/` unless Peter keeps FR-017's amendment (R3).
- **Tests**: vitest for the core (`test/core/tool/`, `test/core/plugins/`) and for the webview in jsdom (`test/webview/table/`), written first and seen failing; the real-IDE suite (`test/vscode/knowledge.test.ts`) for one undo step per gesture and the native dialogs; `test/core/tool/words.test.ts` and `supportRecord.test.ts` as they are.
- **Checks**: `npm run check` (types and lint), `npm run test:unit`, `npm run test:vscode` (the packaged plug-in in a real Visual Studio Code) and `npm run sync-definitions -- --check`; the Build workflow runs them.
- **Performance**: SC-003, 10,000 rows scrolled with no frame over 100 ms, measured in the webview harness and once in a real window.
- **Constraints**: principle I (every change an edit of the text document, platform dialogs, theme colours); nothing under `src/core/tool/` names a tool type; the view stays plain JSON.
- **Unknowns**: none blocking. R3 waits on Peter's word and changes nothing that is built.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The definition stays in etalii.adp and is vendored unchanged; the gesture table is VS Code's own code, recorded in `docs/disl-support.md` as code for one tool type. |
| II. Implementable from the document alone | `knowledge.md` already states every gesture's operation; R1 reads it into code and changes no document. |
| III. Precise normative language | No normative text changes, unless R3's amendment is kept. |
| IV. Versioned specifications | No specification's version changes. |
| V. Simplicity | Two generic request kinds and one plugin table, against one request kind per gesture. |
| VI. No Rider warnings | No C# is written. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Every gesture is one edit of the text document and one undo step; questions are platform dialogs (R4); colours are the theme's. |
| II. The text file is the source of truth | Edits stay FBL splices; nothing is written that a gesture did not change; the round-trip tests stay. |
| III. One frame, many tools | The table surface stays generic; the Knowledge designer's knowledge is in its plugin. |
| IV. Test-first | Each task writes its test first and sees it fail. |
| V. Simplicity | No dependency is added; the webview stays plain DOM. |

## Delivery

Each pull request is one branch in its own worktree, with auto-merge on (merge commit). A pull request in VS Code names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

| Pull request | Repository | Branch | Holds | Spec phase |
|---|---|---|---|---|
| A | etalii.adp | `claude/project-thread-bvf5w4` | This plan, its research and tasks, with spec 080's | |
| B | VS Code | `features/079-knowledge-table-layout` | Layout and look: tabs, view bar, search, items, no row numbers, header press, `+` property, rounded tags | 1 |
| C | VS Code | `features/079-knowledge-table-menus` | Steps and gestures in the core, the column menu, the four view editors, the options panel, the calculation line | 2 |
| D | VS Code | `features/079-knowledge-table-rows` | `+ New`, selection and bulk edit, row menu, nesting, group headings, option list, cell findings, Shift+Enter, windowing | 3 |
| E | VS Code | `features/079-knowledge-table-drag` | Drag and rename in place | 4 |
| F | etalii.adp | `features/079-knowledge-table-ticks` | The ticks | |

B, C, D and E follow each other, each from `develop` after the one before has merged; C's core work can start beside B.

## Project Structure

```text
specs/079-vscode-knowledge-table-parity/
├── vscode-knowledge-table-parity.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

There is no data model or contract of its own beyond the view and request types, which are `tableView.ts`'s and are listed in the tasks; the definition is the contract.

```text
etalii.adp.ide.vscode/
├── src/core/tool/tableView.ts          steps, gesture, columnMenu, rowMenu, findings, lines
├── src/core/tool/toolTypeFrom.ts       editTable: steps and gestures as one write
├── src/core/plugins/knowledge-views/   gesture table, calculations, nesting, group facts
├── src/webview/table/                  the surface, one file per part
├── test/core/…, test/webview/table/, test/vscode/knowledge.test.ts
└── docs/disl-support.md, docs/parity.md, docs/screenshots/knowledge.png
```

## Complexity Tracking

None is a violation. The risk is a gesture that writes a different file from the standalone host's; SC-004 compares the two on `cities.yaml` for every gesture, and a difference is either fixed or, where it is the definition's, raised in etalii.adp and recorded in `docs/disl-support.md`.
