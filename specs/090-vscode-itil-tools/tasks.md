# Tasks: The Three Service Management Tools in VS Code

**Input**: [vscode-itil-tools.spec.md](vscode-itil-tools.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as VS Code principle IV asks. Paths start with the repository they are in.

**Format**: `[ID] [P?] [Story] Description`. `[P]` runs beside the other `[P]` tasks of its phase. A task is ticked only once the pull request it landed in has merged.

## Phase 1: Plan (pull request A)

- [x] T001 Open pull request A with this plan, research and tasks; turn auto-merge on

## Phase 2: The value stream map (pull request B, User Story 2)

- [x] T002 [US2] Copy the definition into `etalii.adp.ide.vscode/definitions/value-stream-map/` with `npm run sync-definitions -- <etalii.adp> <standalone> --add definitions/diagrams/value-stream-map.dis`, and its two examples into `examples/value-stream-map/` [FR-001]
- [x] T003 [P] [US2] Copy `value-stream-map-read`, `-edits` and `-future` from `etalii.adp/specifications/fbl/fixtures/` into `etalii.adp.ide.vscode/fixtures/tools/value-stream-map/` with a `PROVENANCE.md` (R7) [FR-002]
- [x] T004 [US2] Test first, `etalii.adp.ide.vscode/test/core/tool/valueStreamMap.test.ts`: each read case's elements, attributes and findings, and each edit step's bytes; see it fail [FR-002]
- [x] T005 [US2] Test first, then whole-number `max`, `min` and `sum` in `etalii.adp.ide.vscode/src/core/disl/expressions.ts` (R1) [FR-003]
- [x] T006 [US2] Test first, then `reachable`, `inCycle`, `successors`, `predecessors`, `neighbors` and `hasCycle` in `src/core/disl/expressions.ts` and `cycles.ts`, subtypes included and memoised per run (R2) [FR-004]
- [x] T007 [US2] Make the reading of T004 pass: the derived ids and the step's name, fixed where the first failure points (R3) [FR-005]
- [x] T008 [US2] Make the edit steps of T004 pass, each one edit and one undo step [FR-012]
- [x] T009 [US2] `docs/disl-support.md` and `docs/fbl.md` record what was built; open pull request B naming this folder and the etalii.adp commit; turn auto-merge on

## Phase 3: The review's reading (pull request C, User Story 1)

- [x] T010 [US1] Copy the definition into `etalii.adp.ide.vscode/definitions/post-incident-review/` and both examples into `examples/post-incident-review/` [FR-001]
- [x] T011 [P] [US1] Copy `post-incident-review-read` and `-edits` into `etalii.adp.ide.vscode/fixtures/tools/post-incident-review/` with a `PROVENANCE.md` [FR-002]
- [x] T012 [US1] Test first, `etalii.adp.ide.vscode/test/core/tool/postIncidentReview.test.ts`: the read cases' elements, attributes, the four intervals and findings; see it fail [FR-002]
- [x] T013 [US1] Test first, then a `bullets` word slot of a `many` attribute holding every match, a case-insensitive `map` applied, and constant `value` attributes, in `etalii.adp.ide.vscode/src/core/fbl/families/bullets/` (R6) [FR-011]
- [x] T014 [US1] Test first, then DESL 0.4 read in `src/core/desl/specification.ts`, and what DESL 0.3 adds that the review uses (R5) [FR-009]
- [x] T015 [US1] Open pull request C; turn auto-merge on

## Phase 4: The sections page (pull request D, User Story 1)

- [x] T016 [US1] Test first, then `interpretSections` in `etalii.adp.ide.vscode/src/core/desl/surface.ts` with DESL 10.1's checks: record and list parts, order, group, figures, marks, time strip, add (R5) [FR-009]
- [x] T017 [US1] Test first, then `SectionsView` in `src/core/tool/sectionsView.ts`, served by `toolTypeFrom.ts`, with the operations each part offers [FR-009, FR-010]
- [x] T018 [US1] Test first (jsdom), then `src/webview/designer/sections/`: the page, its parts, the time strip, marks and figures, keyboard and screen reader names, theme colours [FR-009]
- [x] T019 [US1] Test first, then the gestures: accept, reject, add an entry, a factor, an action, an action for a factor, complete, edit a field, each one edit and one undo step; the edit steps of T012 pass [FR-010, FR-012]
- [x] T020 [US1] Open pull request D; turn auto-merge on

## Phase 5: The SLO map (pull request E, User Story 3)

- [x] T021 [US3] Copy the definition into `etalii.adp.ide.vscode/definitions/openslo-slo/` and the read fixtures' streams as examples into `examples/openslo-slo/` [FR-001]
- [x] T022 [P] [US3] Copy `openslo-slo-read`, `-edits` and `-folder` into `etalii.adp.ide.vscode/fixtures/tools/openslo-slo/` with a `PROVENANCE.md` [FR-002]
- [x] T023 [US3] Test first, `etalii.adp.ide.vscode/test/core/tool/sloMap.test.ts`: every read case, `findings-*` included with each finding's element and severity, and each edit step; see it fail [FR-002]
- [x] T024 [US3] Test first, then CEL `distinct` and any other function the binding uses in the FBL expression environment, `src/core/fbl/expressions/` (R4) [FR-007]
- [x] T025 [US3] Test first, then `body.stream: "documents"` in `src/core/fbl/families/yaml/`: every document read, a new one after the last with its `---` line, a removed one with its span (R4) [FR-006]
- [x] T026 [US3] Test first, then the folder subject of FBL 10 for a declared binding, opened from a folder in `src/extension/` and edited file by file (R4) [FR-008]
- [x] T027 [US3] Every file the edit steps write passes `oslo validate` (SC-003); open pull request E; turn auto-merge on

## Phase 6: Documents and the catalogue (pull requests F and G)

- [x] T028 [P] `etalii.adp.ide.vscode/docs/tools.md`, `README.md`, `docs/disl-support.md` and `docs/parity.md` describe the three tools as built [FR-013]
- [x] T029 Host test on the Mac mini: each example in both themes, and a new user's attempt with each tool recorded (SC-004); a screenshot of each in `docs/screenshots/` [FR-013, SC-004]
- [x] T030 Open pull request F; turn auto-merge on
- [x] T031 [P] The VS Code state of the three tools in `etalii.adp.ide.standalone/docs/tools.md` (pull request G) and in the "VS Code" column of their Notion "Tools" pages [FR-014]
- [x] T032 Tick the merged tasks here, and set the specification's status, in pull request H

## Coverage

Every functional requirement is claimed: FR-001 (T002, T010, T021), FR-002 (T003, T004, T011, T012, T022, T023), FR-003 (T005), FR-004 (T006), FR-005 (T007), FR-006 (T025), FR-007 (T024), FR-008 (T026), FR-009 (T014, T016, T017, T018), FR-010 (T017, T019), FR-011 (T013), FR-012 (T008, T019), FR-013 (T028, T029), FR-014 (T031). The success criteria: SC-001 (T029, after T009, T020 and T027), SC-002 (T004, T012, T023), SC-003 (T027), SC-004 (T029), SC-005 (the existing word check, run by every pull request).
