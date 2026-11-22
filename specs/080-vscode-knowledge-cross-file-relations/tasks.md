# Tasks: The VS Code Knowledge Designer Follows Relations into Other Files

**Input**: [vscode-knowledge-cross-file-relations.spec.md](vscode-knowledge-cross-file-relations.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: the specification by Peter on 2026-11-21, with the plan and tasks asked for.

Every path carries its repository as prefix; `vscode/` stands for `etalii.adp.ide.vscode/`. Tasks are ticked in etalii.adp once their pull request has merged. **Checks** and **Format** as in spec 079's tasks.

---

## Phase 1: Setup, pull request A

- [x] T001 Record how the core learns a second file, one undo over two files, finding the files that name this one, which files may be written, and what changes in VS Code's record (R1 – R5) · etalii.adp/specs/080-vscode-knowledge-cross-file-relations/research.md

---

## Phase 2: User Stories 1 and 2, related rows seen, opened and picked (P1), pull request B

**Goal**: FR-001 – FR-005; SC-001, SC-003. **Independent test**: `test/core/tool/tableRelated.test.ts`, the real-IDE link test.

- [x] T002 [P] [US1] Write the core tests on the vendored relations example: titles for related rows, the id for an unresolved one, the target's rows for the picker, `knowledge.unresolved-target` and `knowledge.unresolved-row`, a limit of one replacing · vscode/test/core/tool/tableRelated.test.ts
- [x] T003 [P] [US1] Write the real-IDE tests: pressing a related row opens `provinces.yaml` with that row selected; a change of `provinces.yaml` in another editor updates the titles · vscode/test/vscode/knowledge.test.ts
- [x] T004 [US1] Add `related` to `Source`, and read it through the binding (R1) · vscode/src/core/frame/toolType.ts, vscode/src/core/tool/toolTypeFrom.ts
- [x] T005 [US1] Titles, links and the target's rows in the table view; the two findings (FR-001, FR-003, FR-005) · vscode/src/core/tool/tableView.ts, vscode/src/core/tool/toolTypeFrom.ts
- [x] T006 [US2] A relation limited to one row replaces its value (FR-003) · vscode/src/core/plugins/knowledge-views/index.ts
- [x] T007 [US1] Gather the related texts from open documents and disk and follow their changes (FR-004) · vscode/src/extension/relatedFiles.ts, vscode/src/extension/toolEditor.ts
- [x] T008 [US1] The link opens the row where it lives (FR-002) · vscode/src/webview/table/rows.ts, vscode/src/extension/toolEditor.ts
- [x] T009 [US2] The searchable row picker (FR-003) · vscode/src/webview/table/cellList.ts
- [x] T010 [US1] Remove "A relation to another file" and "A relation limited to one row" from the record · vscode/docs/disl-support.md

**Checkpoint**: B merged; row 28 is closed.

---

## Phase 3: User Stories 3 and 4, two-file steps and moving targets (P1, P2), pull request C

**Goal**: FR-006 – FR-012; SC-002, SC-004. **Independent test**: `test/core/tool/tableTwoFiles.test.ts`, the real-IDE undo and rename tests.

- [x] T011 [P] [US3] Write the core tests: a two-way relation's splices of both files equal the standalone host's; either refused writes neither; both delete choices; the rows that relate to a row counted (FR-007 – FR-009) · vscode/test/core/tool/tableTwoFiles.test.ts
- [x] T012 [P] [US3] Write the real-IDE tests: one Undo after a two-way creation restores both files' bytes, and Redo both; a rename of `provinces.yaml` rewrites `target` in `cities.yaml` (SC-002, FR-010) · vscode/test/vscode/knowledge.test.ts
- [x] T013 [US3] Two-file outcomes in the core: splices per file, both planned before either is given (R2) · vscode/src/core/tool/toolTypeFrom.ts
- [x] T014 [US3] The new-property panel's relation steps: target among knowledge files, this file first, limit, other side and its name (FR-006) · vscode/src/webview/table/header.ts, vscode/src/extension/relatedFiles.ts
- [x] T015 [US3] Apply a two-file outcome as one `WorkspaceEdit` · vscode/src/extension/toolEditor.ts
- [x] T016 [US3] Delete one side of a two-way relation with the choice between its two ends (FR-008) · vscode/src/webview/table/columnMenu.ts
- [x] T017 [US4] Say how many rows relate before deleting rows (FR-009) · vscode/src/extension/relatedFiles.ts, vscode/src/extension/toolEditor.ts
- [x] T018 [US4] Rewrite `target` with a rename or move, in one step with it (FR-010, R3) · vscode/src/extension/relatedFiles.ts
- [x] T019 [US3] "Edit relation" in the column menu (FR-011) · vscode/src/webview/table/columnMenu.ts
- [x] T020 Restate the one-document rule with its exception and remove the rows this closes (FR-012, R5) · vscode/docs/disl-support.md, vscode/docs/parity.md

**Checkpoint**: C merged; row 19 is closed.

---

## Phase 4: Polish

- [x] T021 Compare the relations example between the two hosts, step by step (SC-002, SC-004) · vscode/docs/disl-support.md
- [x] T022 Record the platform's "Undo in all files" dialog once Peter has seen it · vscode/docs/parity.md
- [x] T023 Mark the feature's status and regenerate ThinkRail's copy · etalii.adp/specs/080-vscode-knowledge-cross-file-relations/.spec-context.json, etalii.adp/thinkrail/
- [x] T024 Tick the merged tasks in one pull request · etalii.adp/specs/080-vscode-knowledge-cross-file-relations/tasks.md

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T002, T005 |
| FR-002 | T003, T008 |
| FR-003 | T002, T005, T006, T009 |
| FR-004 | T003, T007 |
| FR-005 | T002, T005 |
| FR-006 | T014 |
| FR-007 | T011, T013, T015 |
| FR-008 | T011, T016 |
| FR-009 | T011, T017 |
| FR-010 | T012, T018 |
| FR-011 | T019 |
| FR-012 | T010, T020 |
| SC-001 | T002 |
| SC-002 | T011, T012, T021 |
| SC-003 | T003 |
| SC-004 | T021 |

## Dependencies

Phase 1 (A) first. Phase 2 (B) needs spec 079's pull request C. Phase 3 (C) follows B. Phase 4 follows C.

## Notes

Ticked: T001 (research.md, R1 to R5), T002 to T010 (etalii.adp.ide.vscode #52). T011 and T013 to T020 (etalii.adp.ide.vscode #53). "Edit relation" (T019) has no operation in the definition, raised as issue #739. Not ticked: T012, whose rename test is in #53 but whose one-undo test over both files waits on the platform's "Undo in all files" dialog (T022); T021 to T024.
