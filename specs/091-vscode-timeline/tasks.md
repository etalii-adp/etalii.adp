# Tasks: The Timeline in VS Code, as the Standalone One

**Input**: [vscode-timeline.spec.md](vscode-timeline.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as VS Code principle IV asks. Paths start with the repository they are in.

**Format**: `[ID] [P?] [Story] Description`. `[P]` runs beside the other `[P]` tasks of its phase. A task is ticked only once the pull request it landed in has merged.

## Phase 1: The definition (pull requests B and C)

- [x] T001 [US1] In `etalii.adp/definitions/diagrams/timeline.dis`, drop `persist.yaml` from `language.requires.features` and raise `language.version` to 1.2.1 (R1); `python .github/scripts/validate-examples.py` passes [FR-001]
- [x] T002 [US1] Open pull request B, saying that the timeline's conformance fixtures may need re-recording by the ATD thread; turn auto-merge on. Note on issue #788 that the timeline's part is closed by it
- [ ] T003 [US1] Once B has merged, re-bundle `etalii.adp.ide.standalone/src/diagrams/timeline/definition/` with `bash src/diagrams/tools/bundle-disl.sh timeline <etalii.adp at develop>`, run the module's tests, and open pull request C with auto-merge on [FR-001]
  - Not done: standalone #830 re-bundled the definition, and the bundle also brought spec 089's link expressions, which the standalone client cannot compile yet. It was closed on 2026-11-25 and waits for the standalone links spec (spec 089, T060 to T062).

## Phase 2: Open and read (pull request D, User Story 1)

- [x] T004 [US1] Copy the definition into `etalii.adp.ide.vscode/definitions/timeline/` with `npm run sync-definitions -- <etalii.adp> <standalone> --add definitions/diagrams/timeline.dis`, keeping only that folder and its `package.json` entries [FR-001]
- [x] T005 [P] [US1] Copy `example-1`, `example-2`, `marvel-universe` and `marvel-universe-overview` with their readmes and registrations into `etalii.adp.ide.vscode/examples/timeline/` through `scripts/sync-examples.mjs` (R10) [FR-002]
- [x] T006 [P] [US1] Copy `definitions/diagrams/conformance/timeline/` into `etalii.adp.ide.vscode/fixtures/tools/timeline/` through `scripts/sync-definitions.mjs`, held by its `--check` (R9) [FR-017]
- [x] T007 [US1] Test first, then a diagram's `datetime` and `date` values reaching CEL as their written text in `etalii.adp.ide.vscode/src/core/disl/expressions.ts`, designers unchanged (R2) [FR-003]
- [x] T008 [US1] Test first, then `etalii.adp.ide.vscode/src/core/plugins/timeline-times/` (`readableTime`, `compareTimes`, `dateAfter`, `today`, `writtenEnd`), ported from standalone's `TimelineTimes.cs` and `TimelineInstants.cs` and registered in `src/core/plugins/index.ts`, checked against every time of the fixtures and the examples (R3) [FR-004]
- [x] T009 [US1] Test first, then a time axis of `datetime` values read in `etalii.adp.ide.vscode/src/core/disl/coordinates.ts` (origin, a day of 20 units, a time of day as a fraction) and `axis.time` listed in `src/core/disl/support.ts` (R4) [FR-001, FR-005]
- [x] T010 [US1] Test first, `etalii.adp.ide.vscode/test/core/disl/definitions/timeline.test.ts`: the definition reads with no finding, and every expression evaluates for every element of the four examples [FR-001, FR-003, SC-003]
- [x] T011 [P] [US1] The example tests open the four examples; `marvel-universe.tml` reads and builds its scene within a time budget (R10) [FR-002, SC-004]
- [x] T012 [US1] Rows under "Code for one tool type" in `etalii.adp.ide.vscode/docs/disl-support.md` for `timeline-times`, with its reason, and the section for `axis.time` [FR-016, SC-006]
- [x] T013 [US1] Open pull request D, naming this folder and the etalii.adp commit of these tasks; turn auto-merge on

## Phase 3: Draw (pull request E, User Story 1)

- [x] T014 [US1] Test first, then the ruler's levels decade, year, month, week and day for a `datetime` axis in `etalii.adp.ide.vscode/src/core/disl/coordinates.ts`, chosen by zoom as standalone's `timelineTicks.ts` chooses them, never finer than a day, and drawn by `src/webview/diagram/ruler.ts` (R4) [FR-006]
- [x] T015 [P] [US1] Test first, then the `diamond` shape in `etalii.adp.ide.vscode/src/core/disl/notation.ts` and `src/webview/diagram/scene.ts` (R5) [FR-007]
- [x] T016 [P] [US1] Test first, then a period drawn by `placement.bound` from its begin to its end on a `datetime` axis, its label cut with an ellipsis as the definition states, in `src/core/scene/scene.ts` (R5) [FR-008]
- [x] T017 [US1] Test first, then a connection between any two elements with its label, held to the drawings of the `roadmap` fixture for `roadmap.tml` [FR-008]
- [x] T018 [US1] Open pull request E; turn auto-merge on

## Phase 4: Gestures and Arrange diagram (pull request F, User Story 2)

- [x] T019 [US2] Test first, then `snap.calendar` in `etalii.adp.ide.vscode/src/core/scene/snapping.ts`: a date-only value to the nearest day, a value with a time of day unsnapped in whole seconds, the same for a dragged edge; listed in `src/core/disl/support.ts` (R6) [FR-010]
- [x] T020 [US2] Test first, then a drop's `position.x` given to `initial` as the date of the drop and `position.y` as its row, in `src/core/scene/scene.ts` and `src/core/tool/toolTypeFrom.ts`, so that Element writes "New element" two weeks long and Moment "New moment" as the `add` fixture records (R7) [FR-009]
- [x] T021 [US2] Test first, then a moved period moving `begin` and `end` by the same days and its `row`, and a dragged edge changing one of them and stopping at the other, each one edit writing the `roadmap` fixture's `move` bytes (R7) [FR-011, FR-015]
- [x] T022 [US2] Test first, then `etalii.adp.ide.vscode/src/core/plugins/timeline-row-arrange/`, ported from standalone's `TimelineArrangement.cs`, writing only `row` as one undo step, held to the `timeline.arrange` step of the `roadmap` fixture (R7) [FR-012]
- [x] T023 [US2] Test first, `etalii.adp.ide.vscode/test/vscode/timeline.test.ts`: a drop, a move and Arrange diagram are each one step of VS Code's undo [FR-015]
- [x] T024 [US2] A row under "Code for one tool type" in `docs/disl-support.md` for `timeline-row-arrange`, and the sections for `snap.calendar` and the diamond [FR-016, SC-006]
- [x] T025 [US2] Open pull request F; turn auto-merge on

## Phase 5: Properties, findings and the conformance replay (pull request G, User Story 3)

- [x] T026 [US3] Test first, `etalii.adp.ide.vscode/test/core/tool/timeline.test.ts`: the three fixtures replayed, each step's file byte for byte, its findings, and its drawing's types, shapes, labels and order with bounds after the axis's scale; differences listed in `docs/parity.md` with their reasons (R9) [FR-017, SC-002]
  - Done in vscode #120: `roadmap` and `findings` are replayed in `test/core/tool/timelineConformance.test.ts`. `add` is not replayed, because it needs the standalone host's project hierarchy (`docs/parity.md`). Steps 6 and 7 are raised in #846, and the findings about ids in #848.
- [x] T027 [US3] What the replay shows of label, begin, end and row in ADP Properties and their refusals, made to answer as the fixture does, in the shared form code where the definition states it and in `src/core/plugins/timeline-reading/` only where it does not (R8) [FR-013]
- [x] T028 [US3] What the replay shows of the `findings` fixture's codes, sentences and order, made to answer as it does, by the same rule (R8) [FR-014]
- [x] T029 [P] `docs/tools.md`, `README.md` (a Timeline section and its commands), `CHANGELOG.md` (Unreleased), `docs/disl-support.md` and `docs/parity.md` describe the timeline as built [FR-018]
- [x] T030 Open pull request G; turn auto-merge on
- [x] T031 Host test on the Mac mini: the four examples side by side with the standalone host in both themes (SC-001), `marvel-universe.tml` opened and timed, panned and zoomed (SC-004), and a new user's attempt from **New Timeline diagram** to three periods, a moment and a connection recorded (SC-005); the screenshot `docs/screenshots/timeline.png` in a last small VS Code pull request [FR-018, SC-001, SC-004, SC-005]
- [x] T032 Tick the merged tasks in this file, and set the specification's status to implemented, in pull request H
  - Done: the host test ran three times on the Mac mini (vscode #121, #126, #132, #134). The fixes between the runs were vscode #122, #123, #125, #127 and #133, and etalii.adp #854 and #855. The third run passed and moved the timeline to Prototype in `docs/tools.md`. T003 stays open, as noted under it.

## Coverage

Every functional requirement of the specification is claimed above: FR-001 (T001, T003, T004, T009, T010), FR-002 (T005, T011), FR-003 (T007, T010), FR-004 (T008), FR-005 (T009), FR-006 (T014), FR-007 (T015), FR-008 (T016, T017), FR-009 (T020), FR-010 (T019), FR-011 (T021), FR-012 (T022), FR-013 (T027), FR-014 (T028), FR-015 (T021, T023), FR-016 (held by `words.test.ts` and `supportRecord.test.ts` in every phase, and by T012 and T024), FR-017 (T006, T026), FR-018 (T029, T031). The success criteria: SC-001 (T031), SC-002 (T026), SC-003 (T010), SC-004 (T011, T031), SC-005 (T031), SC-006 (`words.test.ts`).
