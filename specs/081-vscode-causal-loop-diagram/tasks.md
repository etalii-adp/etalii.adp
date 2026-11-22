# Tasks: The Causal Loop Diagram in VS Code, as the Standalone One

**Input**: [vscode-causal-loop-diagram.spec.md](vscode-causal-loop-diagram.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as VS Code principle IV asks. Paths start with the repository they are in.

**Format**: `[ID] [P?] [Story] Description`. `[P]` runs beside the other `[P]` tasks of its phase. A task is ticked only once the pull request it landed in has merged.

## Phase 1: Open and draw (pull request B, User Story 1)

- [ ] T001 [US1] Copy the definition into `etalii.adp.ide.vscode/definitions/causal-loop-diagram/` with `npm run sync-definitions -- <etalii.adp> <standalone> --add definitions/diagrams/causal-loop-diagram.dis`, which writes the editor, **New Causal loop diagram** and the menu entries into `etalii.adp.ide.vscode/package.json` [FR-001]
- [ ] T002 [P] [US1] Copy the six standalone examples with their registrations, readme, `LICENSE.md` and `SOURCE.md` into `etalii.adp.ide.vscode/examples/causal-loop-diagram/` through `etalii.adp.ide.vscode/scripts/sync-examples.mjs` [FR-002]
- [ ] T003 [US1] Test first, `etalii.adp.ide.vscode/test/core/disl/definitions/causalLoopDiagram.test.ts`: the definition reads with no finding apart from those later phases remove, and each of the six examples gives `variable:<name>` ids, every link joined, and a caption on every variable [FR-003 – FR-005]
- [ ] T004 [US1] The `natural` id strategy and relation ends found by key in `etalii.adp.ide.vscode/src/core/disl/persistence.ts` and `metamodel.ts` (research R1) [FR-003, FR-004]
- [ ] T005 [US1] Derived attributes evaluated on reading, so that `display` is filled, in `etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts` [FR-005]
- [ ] T006 [US1] Test first, then the `bounds` store kept as corners in the registration's `layout:` block, read on opening and written by a move, in `etalii.adp.ide.vscode/src/core/tool/registrationLayout.ts` and `toolTypeFrom.ts` (R3) [FR-006]
- [ ] T007 [US1] Test first, then the `circular` layout with the `adp.ring.*` options and `trigger: onLoadIfMissing`, in `etalii.adp.ide.vscode/src/core/disl/layout.ts` and a new `src/core/scene/circular.ts`, its seats and radius held to standalone's `CausalLoopLayout` for `on-call.cld` and `reference.cld` (R2) [FR-007]
- [ ] T008 [P] [US1] Test first, then the pill outline and `autoSize: fitWidth` of a node, in `etalii.adp.ide.vscode/src/core/scene/scene.ts` and `src/webview/diagram/canvas.ts` [FR-011]
- [ ] T009 [US1] Test first, then `routing: curved` with `curvature`, edge variants and a computed stroke width, in `etalii.adp.ide.vscode/src/core/disl/notation.ts`, `src/core/scene/scene.ts`, `geometry.ts` and `src/webview/diagram/canvas.ts` (R5) [FR-012, FR-013, FR-016]
- [ ] T010 [US1] Test first, then edge labels at `at`, `side` and `distance`, and mid markers of type `bar` with `visible`, in the scene and the canvas (R5) [FR-014, FR-015]
- [ ] T011 [P] [US1] Test first, then a self-loop drawn as an arc of its `size` on its `side` [FR-017]
- [ ] T012 [US1] Test first, then a node's `icon` with `position`, `size`, `color` and `flip`, and `avg()` on a list in `etalii.adp.ide.vscode/src/core/disl/expressions.ts`, so a loop stands at the centre of its variables and follows them [FR-018, FR-019]
- [ ] T013 [P] [US1] Test first, then a label's `decoration: underline`, drawn wavy where the tool type's reading logic asks (R9), in `etalii.adp.ide.vscode/src/core/scene/scene.ts` and `src/webview/diagram/canvas.ts`; the logic itself lands in T024 [FR-020]
- [ ] T014 [P] [US1] Test first, then the canvas's `empty` text under its `when`, in the scene and `src/webview/diagram/canvas.ts`, `canvas.css` [FR-021]
- [ ] T015 [US1] Add each feature built here to `etalii.adp.ide.vscode/src/core/disl/support.ts` and its row of `docs/disl-support.md` (`persist.typeMap`, `canvas.chrome`, `label.editText` where read), so `supportRecord.test.ts` holds them
- [ ] T016 [US1] Open pull request B, naming this folder and the etalii.adp commit of these tasks; turn auto-merge on

## Phase 2: Loops and findings (pull request C, User Story 3)

- [ ] T017 [US3] Test first, `etalii.adp.ide.vscode/test/core/tool/causalLoopDiagram.test.ts`: the findings of `reference.cld`, `unreadable-lines.cld`, `two-notes.cld` and `weight-forms.cld` against the transcript's, codes, sentences, lines and order [FR-030 – FR-033]
- [ ] T018 [US3] `lists.range`, `cel.bind`, `diagram.cycles` and `diagram.cyclesTruncated` in DISL's order, in `etalii.adp.ide.vscode/src/core/disl/expressions.ts` (R4) [FR-030]
- [ ] T019 [US3] The plugin kind `functions` for a plugin that provides `celFunctions`, in `etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts` and `expressions.ts`, with its fallback when not carried (R4) [FR-030]
- [ ] T020 [US3] Test first, then the plugin `etalii.adp.ide.vscode/src/core/plugins/cld-cycles/` (`net.etalii.adp.systems.cldCycles`, `causalCycles`): Johnson's algorithm as standalone's `CycleFinder`, bounded, in its order; registered in `src/core/plugins/index.ts` [FR-030]
- [ ] T021 [US3] A loop's computed polarity and the seven findings evaluated, checked over all six examples [FR-031, FR-032]
- [ ] T022 [US3] `constraints.order` read as the definition declares it, and added to the supported features [FR-033]
- [ ] T023 [US3] The reading logic carried by origin, a registry member beside `views`, in `etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts` and `toolTypeFrom.ts` (R10)
- [ ] T024 [US3] Test first, then `etalii.adp.ide.vscode/src/core/plugins/cld-reading/`: a link's note reread as standalone's `CausalLoopNote` and written over the word it was read from, the four unreadable-line sentences of `CausalLoopUnreadable`, a weight with an exponent in .NET's form, and the wavy underline of a disagreeing loop [FR-008, FR-009, FR-010, FR-020]
- [ ] T025 [US3] A row under "Code for one tool type" in `etalii.adp.ide.vscode/docs/disl-support.md` for each of the three plugins, with its reason
- [ ] T026 [US3] Open pull request C; turn auto-merge on

## Phase 3: Gestures, menus and dialogs (pull request D, User Story 2)

- [ ] T027 [US2] Test first: each toolbox drop and menu entry of the transcript on `on-call.cld` makes the transcript's bytes, in `etalii.adp.ide.vscode/test/core/tool/causalLoopDiagram.test.ts` [FR-022 – FR-029]
- [ ] T028 [US2] A Variable dropped and Add variable at a point: the statement and the position as one edit, in `etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts` [FR-022]
- [ ] T029 [US2] `drop.targets` with `elsewhere: refuse` and its refusal, in `etalii.adp.ide.vscode/src/core/disl/toolbox.ts` and the webview's drop [FR-023]
- [ ] T030 [US2] The `connect` hook's loops claimed in the same edit as the new link, from a drop, a menu and a right-drag [FR-024]
- [ ] T031 [P] [US2] Menu labels computed with `cel.bind`, the reference count of Remove variable included, and the confirm dialog's count [FR-025]
- [ ] T032 [US2] Test first in `etalii.adp.ide.vscode/test/vscode/`, then operation forms as VS Code input boxes with `initial`, `validate` and the form's title, in `etalii.adp.ide.vscode/src/extension/` and `src/core/disl/forms.ts` (R7) [FR-026]
- [ ] T033 [P] [US2] Arrange diagram on the canvas menu, disabled with its reason under two variables [FR-027]
- [ ] T034 [P] [US2] Inline rename from `editText`, refused by the label's own `parse` [FR-028]
- [ ] T035 [P] [US2] A loop's drag refused with its type's `refusals.move` [FR-029]
- [ ] T036 [US2] Open pull request D; turn auto-merge on

## Phase 4: Properties and Arrange (pull request E, User Story 4)

- [ ] T037 [US4] Test first: every property row of the transcript, set and read back, makes the transcript's bytes and refusals [FR-035 – FR-038]
- [ ] T038 [US4] The diagram's own form in ADP Properties with nothing selected, in `etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts` and `src/webview/panels/` (R8) [FR-035]
- [ ] T039 [US4] A row's `parse` held: `accepts`, `write` with `set` and `unset` under `when`, `refusal`; `form.parse` and `form.rowId` added to the supported features [FR-036, FR-037]
- [ ] T040 [US4] Computed rows with their reasons and a loop's Variables as a choice of the cycles through it [FR-038]
- [ ] T041 [US4] Test first, then `etalii.adp.ide.vscode/src/core/plugins/cld-layout/` (`net.etalii.adp.systems.cld`): standalone's self-organizing layout, its positions compared with standalone's for the six examples to three decimals, written to the registration as one edit (R6) [FR-034]
- [ ] T042 [P] [US4] Tooltips drawn as the definition states, and the difference recorded in `etalii.adp.ide.vscode/docs/parity.md` (R12) [FR-039]
- [ ] T043 [US4] Open pull request E; turn auto-merge on

## Phase 5: Parity and documents (pull request F)

- [ ] T044 Copy standalone's `causal-loop.transcript.json` and its 11 fixtures into `etalii.adp.ide.vscode/fixtures/tools/causal-loop-diagram/` with a provenance record (R11)
- [ ] T045 The transcript test over all 23 documents: toolbox, menus, rows, findings, payloads and every edit's bytes, with each remaining difference listed in `docs/parity.md` [FR-040, SC-002]
- [ ] T046 [P] Every expression of the definition evaluated with no finding, and the definition read with no unsupported-feature finding [SC-003]
- [ ] T047 [P] `uk-cod-population.cld` drawn within two seconds and arranged within five [SC-004]
- [ ] T048 [P] `words.test.ts` passes with the causal loop diagram's names [FR-041, SC-005]
- [ ] T049 `etalii.adp.ide.vscode/docs/tools.md` row, `README.md`, `docs/disl-support.md` and `docs/parity.md` describe the tool as built [FR-042]
- [ ] T050 Side-by-side check of the six examples in both hosts on the Mac mini, and `etalii.adp.ide.vscode/docs/screenshots/causal-loop.png` [FR-042, SC-001]
- [ ] T051 Open pull request F; turn auto-merge on

## Phase 6: Ticks (pull request G)

- [ ] T052 Tick every task whose pull request merged, and set the specification's status to Implemented

## Dependencies

Phase 1 comes first: nothing of a causal loop diagram draws without it. Phase 2 needs T004 (ids) and T012 (`avg`). Phase 3 needs Phase 2 for the hook's cycles (T030) and the menu labels (T031). Phase 4 needs Phase 2 for the loop's rows (T040). Phase 5 needs the four before it.

## Coverage

Every requirement is claimed: FR-001 T001; FR-002 T002; FR-003 – FR-005 T003 – T005; FR-006 T006; FR-007 T007; FR-008 – FR-010 T024; FR-011 T008; FR-012, FR-013, FR-016 T009; FR-014, FR-015 T010; FR-017 T011; FR-018, FR-019 T012; FR-020 T013, T024; FR-021 T014; FR-022 T028; FR-023 T029; FR-024 T030; FR-025 T031; FR-026 T032; FR-027 T033; FR-028 T034; FR-029 T035; FR-030 T018 – T020; FR-031, FR-032 T021; FR-033 T022; FR-034 T041; FR-035 T038; FR-036, FR-037 T039; FR-038 T040; FR-039 T042; FR-040 T045; FR-041 T048; FR-042 T049, T050. SC-001 T050; SC-002 T045; SC-003 T046; SC-004 T047; SC-005 T048.
