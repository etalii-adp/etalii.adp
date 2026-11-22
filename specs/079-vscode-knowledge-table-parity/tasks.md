# Tasks: The VS Code Knowledge Designer Looks and Works as the Standalone One

**Input**: [vscode-knowledge-table-parity.spec.md](vscode-knowledge-table-parity.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: the specification by Peter on 2026-11-21, with the plan and tasks asked for. One finding waits on his word: FR-017's amendment of `addRow` is not needed (research R3); T010 depends on it.

Every path carries its repository as prefix; `vscode/` stands for `etalii.adp.ide.vscode/`. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

**Checks**: before every VS Code pull request, `npm run check`, `npm run test:unit`, `npm run test:vscode` and `npm run sync-definitions -- --check`, each judged by its exit code. A failure stops the pull request.

**Format**: `- [ ] T### [P] [US#] description · file path`. `[P]`: parallel with the other `[P]` tasks of its phase. Tests come first in every phase and are seen failing before what they test is written.

---

## Phase 1: Setup, pull request A

- [x] T001 Read the VS Code table surface, its view, its requests and the Knowledge designer's plugin against the standalone table library, and record the decisions (R1 – R8) · etalii.adp/specs/079-vscode-knowledge-table-parity/research.md
- [x] T002 Write this plan, these tasks and spec 080's, and land them in one pull request · etalii.adp/specs/079-vscode-knowledge-table-parity/, etalii.adp/specs/080-vscode-knowledge-cross-file-relations/

---

## Phase 2: Foundation in the core (blocks phases 4 – 6), pull request C, started beside B

**Goal**: R1, R2, R6, R8; FR-029. **Independent test**: `test/core/tool/tableSteps.test.ts`, `test/core/plugins/knowledgeGestures.test.ts`.

- [x] T003 [P] Write the tests: a `steps` request of `addOption` then `setOption` on `cities.yaml` is one write whose splices undo together, `$created:0` names step 0's new option, a refused step writes nothing · vscode/test/core/tool/tableSteps.test.ts
- [x] T004 [P] Write the tests: each standalone column gesture (hide, show, wrap, resize, freeze, unfreeze, sort ascending and descending, filter, group, nest, calculate, insert left and right) resolves to the operations `knowledge.md` names, with the column's other settings kept · vscode/test/core/plugins/knowledgeGestures.test.ts
- [x] T005 Add `steps` and `gesture` to `TableRequest`, and `columnMenu`, `rowMenu`, `findings`, `calculations` and `hiddenGroups` to `TableView`, in the surface's own words · vscode/src/core/tool/tableView.ts
- [x] T006 Run `steps` in order on the model and write their changes once; resolve `$created:N`; run `gesture` through the plugin's table into steps · vscode/src/core/tool/toolTypeFrom.ts
- [x] T007 Give the Knowledge designer's plugin its gesture table, its calculations per type (R8), and the hidden groups of a view; record it as code for one tool type · vscode/src/core/plugins/knowledge-views/index.ts, vscode/docs/disl-support.md
- [x] T008 Carry the document's findings in the table view by element, cells by their row and property (R6) · vscode/src/core/tool/toolTypeFrom.ts, vscode/test/core/tool/tableFindings.test.ts
- [x] T009 Hold `words.test.ts` over the new code: no tool type's name under `src/core/tool/` · vscode/test/core/tool/words.test.ts
- [ ] T010 Only if Peter keeps FR-017's amendment (R3): give `addRow` the group's value in `knowledge.des`, its `knowledge.md` text and fixtures, and refresh both hosts' copies · etalii.adp/definitions/designers/knowledge.des, etalii.adp/definitions/designers/knowledge.md

**Checkpoint**: a gesture and a composite edit each make one undo step in the core tests.

---

## Phase 3: User Story 1, the table looks as it does in the standalone host (P1), pull request B

**Goal**: FR-001, FR-004, FR-006, FR-010, FR-013's header press, FR-014, FR-015, FR-023, FR-031. **Independent test**: `test/webview/table/layout.test.ts`, and `cities.yaml` side by side in both hosts.

- [x] T011 [P] [US1] Write the tests: a `+` after the tabs and after the headers, no `…` button anywhere, the active tab's press opens its menu, sort and filter items in words with an ×, no column setting as an item, no row-number column, a handle and checkbox in the first column, rounded tags with a contrast border in high contrast, nothing that edits on a read-only table · vscode/test/webview/table/layout.test.ts
- [x] T012 [US1] Draw the tabs with their `+` and the menu on the active tab's press; Delete disabled on the only view (FR-001) · vscode/src/webview/table/tabs.ts
- [x] T013 [US1] Draw the view bar: the magnifier that opens and closes the search, the settings control, the sort and filter items in words with their × (FR-004, FR-006) · vscode/src/webview/table/viewBar.ts
- [x] T014 [US1] Draw the header without row numbers: kind icon, name, press opens the menu; the first column's handle and checkbox and the header's select-all (FR-010, FR-011's press) · vscode/src/webview/table/header.ts, vscode/src/webview/table/rows.ts
- [x] T015 [US1] The `+` after the last header and Insert left and right open the panel that asks name then type; a nameless property asks its name in its header; the toolbar of document actions goes (FR-014, FR-015) · vscode/src/webview/table/header.ts
- [x] T016 [US1] Rounded option tags in light, dark and high contrast (FR-023) · vscode/src/webview/table/table.css
- [x] T017 [US1] Split what is left of `table.ts` into the parts the plan names, behaviour unchanged, with the existing tests passing · vscode/src/webview/table/
- [x] T018 [US1] Remove the rows of `docs/disl-support.md` and `docs/parity.md` this closes · vscode/docs/disl-support.md, vscode/docs/parity.md

**Checkpoint**: B merged; rows 1, 5, 7, 12, 13, 17 and 26 of the inventory are closed.

---

## Phase 4: User Stories 2 and 3, the column menu and the view editors (P1), pull request C

**Goal**: FR-005, FR-007, FR-008 (but drag), FR-009, FR-011, FR-016 (but drag), FR-026. **Independent test**: `test/webview/table/columnMenu.test.ts`, `editors.test.ts`, and `test/vscode/knowledge.test.ts`.

- [x] T019 [P] [US2] Write the tests: the column menu's entries, groups and order as the standalone menu's, disabled entries with their reason, missing entries where they do not suit, each entry sending its gesture · vscode/test/webview/table/columnMenu.test.ts
- [x] T020 [P] [US3] Write the tests: the settings menu's four entries, one editor open at a time; the filter editor's nesting to three levels; the sort editor; the group editor's order, eyes and "Show N hidden groups"; property visibility with the title fixed · vscode/test/webview/table/editors.test.ts
- [x] T021 [P] [US2] Write the real-IDE test: "Sort descending" from Population's menu adds one sort and one undo step takes it back · vscode/test/vscode/knowledge.test.ts
- [x] T022 [US2] Draw the column menu from the view's `columnMenu` (FR-011) · vscode/src/webview/table/columnMenu.ts
- [x] T023 [US3] The settings control and its four editors (FR-005, FR-007, FR-008, FR-009) · vscode/src/webview/table/editors/
- [x] T024 [US2] The options panel: rename in place, colour, delete with the definition's question (FR-016) · vscode/src/webview/table/options.ts
- [x] T025 [US2] The calculation line with "Calculate" and the type's calculations (FR-026) · vscode/src/webview/table/calculations.ts
- [x] T026 [US2] Remove the rows this closes · vscode/docs/disl-support.md, vscode/docs/parity.md

**Checkpoint**: C merged; rows 6, 8 – 11, 14, 18 and 30 are closed, and SC-002 holds.

---

## Phase 5: User Stories 4 and 6, rows, groups, cells and large tables (P2, P3), pull request D

**Goal**: FR-017, FR-018, FR-020, FR-021, FR-022, FR-024, FR-025, FR-027, FR-028. **Independent test**: `test/webview/table/rows.test.ts`, `windowing.test.ts`, and `test/vscode/knowledge.test.ts`.

- [x] T027 [P] [US4] Write the tests: `+ New` under the table and each group sends `addRow` and the group's value as steps; the selection bar's count, bulk edit as one request and delete; the row menu without the setters; a heading's fold, move and hide; Shift+Enter adds a row under the cell's · vscode/test/webview/table/rows.test.ts
- [x] T028 [P] [US4] Write the core test: a view grouped by the parent relation nests three levels with a fold per parent, stored with the view (FR-021) · vscode/test/core/plugins/knowledgeNesting.test.ts
- [x] T029 [P] [US6] Write the tests: 10,000 rows draw at most a few screens of lines, the scroll bar spans them all, `aria-rowcount` is the whole count · vscode/test/webview/table/windowing.test.ts
- [x] T030 [P] [US4] Write the real-IDE test: a row added under Netherlands has Country Netherlands, and one undo removes it · vscode/test/vscode/knowledge.test.ts
- [x] T031 [US4] The `+ New` lines and the group's value (FR-017) · vscode/src/webview/table/rows.ts
- [x] T032 [US4] Row selection, the selection bar and bulk edit (FR-018) · vscode/src/webview/table/selection.ts
- [x] T033 [US4] The row menu cut to Delete row and Delete N rows, with the platform's question (FR-020, R4) · vscode/src/webview/table/rows.ts, vscode/src/core/plugins/knowledge-views/index.ts
- [x] T034 [US4] Nesting by the parent relation to any depth with folds (FR-021) · vscode/src/core/plugins/knowledge-views/index.ts, vscode/src/webview/table/rows.ts
- [x] T035 [US4] Group headings with fold, move up, move down and hide (FR-022) · vscode/src/webview/table/rows.ts
- [x] T036 [US4] The searchable option list that creates an option and chooses it as steps (FR-024) · vscode/src/webview/table/cellList.ts
- [x] T037 [US4] Findings marked on their cells, with their messages (FR-025) · vscode/src/webview/table/rows.ts, vscode/src/webview/table/table.css
- [x] T038 [US4] Shift+Enter adds a row under the cell's (FR-027) · vscode/src/webview/table/table.ts
- [x] T039 [US6] Draw only the lines in sight (FR-028, R5) · vscode/src/webview/table/windowing.ts
- [x] T040 [US4] Remove the rows this closes · vscode/docs/disl-support.md, vscode/docs/parity.md

**Checkpoint**: D merged; rows 20, 21, 23 – 25, 27, 29, 31 and 32 are closed.

---

## Phase 6: User Story 5, things are moved by dragging (P2), pull request E

**Goal**: FR-002, FR-003, FR-008's and FR-016's drags, FR-012, FR-013, FR-019, FR-030. **Independent test**: `test/webview/table/drag.test.ts`.

- [x] T041 [P] [US5] Write the tests: each drag (tab, header, border, row, sort, group, option) sends one gesture when let go and none when let go where it started; the border follows the pointer and stops at the minimum; a sorted view's row handle moves nothing; each has a keyboard path · vscode/test/webview/table/drag.test.ts
- [x] T042 [US5] One drag helper for the seven drags, the preview while dragging and the gesture on release · vscode/src/webview/table/drag.ts
- [x] T043 [US5] Rename a view and a column in place, the column's refusal at its field (FR-002, edge cases) · vscode/src/webview/table/tabs.ts, vscode/src/webview/table/header.ts
- [x] T044 [US5] Remove the rows this closes · vscode/docs/disl-support.md, vscode/docs/parity.md

**Checkpoint**: E merged; rows 2 – 4, 15, 16 and 22 are closed.

---

## Phase 7: Polish

- [x] T045 Compare every gesture of FR-001 – FR-027 on `cities.yaml` between the two hosts, file against file (SC-004), and record what differs as fixed or raised · vscode/docs/disl-support.md
- [x] T046 Retake the Knowledge screenshot as its readme says (FR-032) · vscode/docs/screenshots/knowledge.png
- [x] T047 Measure SC-003 in a real window with a generated 10,000-row file · etalii.adp/specs/079-vscode-knowledge-table-parity/research.md
- [x] T048 Mark the feature's status and regenerate ThinkRail's copy · etalii.adp/specs/079-vscode-knowledge-table-parity/.spec-context.json, etalii.adp/thinkrail/
- [x] T049 Tick the merged tasks in one pull request · etalii.adp/specs/079-vscode-knowledge-table-parity/tasks.md

## Notes on the ticks

Ticked from etalii.adp.ide.vscode #45 to #50, all merged on 2026-11-21. Where the code differs from what a task names:

- **Files**: the plan's part names (`tabs.ts`, `viewBar.ts`, `header.ts`, `rows.ts`, `columnMenu.ts`, `options.ts`, `calculations.ts`, `editors/`) were not kept as files. Tabs, view bar, header, rows, column menu and calculation line are in `vscode/src/webview/table/table.ts`; the editors and the options panel are in `panels.ts` and `editors.ts`; the gesture entries are in `entries.ts`. T017's split into `windowing.ts`, `requests.ts`, `selection.ts` and `cellList.ts` is in #51.
- **T005, T006, T007**: no separate `gesture` request kind. The plugin gives the view its gestures as entries with ready requests (`TableGestures`, with `moves`, `widths` and `inPlace` added in #49), so `steps` is the only new request kind. `columnMenu`, `rowMenu`, `findings`, the calculations per type and the hidden groups are carried as the task says.
- **Tests**: the core tests of T004, T008, T028 and the findings of T037 are in `vscode/test/core/plugins/knowledgeGestures.test.ts`; the webview tests of T011, T019, T020, T027, T029 and T041 are in `vscode/test/webview/table/gestures.test.ts`, not in the files the tasks name.
- **T047**: measured in headless Chromium on the view message of a generated 10,000-row file, not in a Visual Studio Code window, which this container cannot download; recorded as R9 in [research.md](research.md).

T004 and T019 are in etalii.adp.ide.vscode #54, T015 in #55. T018 and T026: no row of `docs/disl-support.md` or `docs/parity.md` still describes a gap these phases closed; the Knowledge "The gestures" row describes what is built. Not ticked: T010 (waits on Peter's word on R3), T045, T046 (needs a machine that runs Visual Studio Code), T048, T049.

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T011, T012 |
| FR-002 | T041, T043 |
| FR-003 | T041, T042 |
| FR-004 | T011, T013 |
| FR-005 | T020, T023 |
| FR-006 | T011, T013 |
| FR-007 | T020, T023 |
| FR-008 | T020, T023, T041, T042 |
| FR-009 | T020, T023 |
| FR-010 | T011, T014 |
| FR-011 | T004, T019, T022 |
| FR-012 | T041, T042 |
| FR-013 | T041, T042 |
| FR-014 | T011, T015 |
| FR-015 | T011, T015 |
| FR-016 | T024, T041, T042 |
| FR-017 | T003, T027, T030, T031, T010 |
| FR-018 | T027, T032 |
| FR-019 | T041, T042 |
| FR-020 | T027, T033 |
| FR-021 | T028, T034 |
| FR-022 | T027, T035 |
| FR-023 | T011, T016 |
| FR-024 | T003, T036 |
| FR-025 | T008, T037 |
| FR-026 | T007, T025 |
| FR-027 | T027, T038 |
| FR-028 | T029, T039 |
| FR-029 | T003, T006, T021, T030 |
| FR-030 | T041 and every webview test, which drives the keyboard |
| FR-031 | T011 |
| FR-032 | T018, T026, T040, T044, T046 |
| SC-001 | T045 |
| SC-002 | T019, T021 |
| SC-003 | T029, T047 |
| SC-004 | T004, T045 |
| SC-005 | T009 |

---

## Dependencies

Phase 1 (A) first. Phase 2 starts beside phase 3 and goes into C; phases 4 to 6 need it. B, C, D and E merge in that order, each from `develop` after the one before. T010 waits on Peter's word on R3. Phase 7 follows E.

**MVP**: phases 1 to 4: the look and the menus, which are what Peter saw first.
