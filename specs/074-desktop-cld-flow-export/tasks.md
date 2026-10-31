# Tasks: Export a Causal Loop Diagram as an Animated Flow Page from the Desktop Host

**Input**: [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md) and the [specification](desktop-cld-flow-export.spec.md).

**Tests**: written first and seen failing, as desktop Principle IV and the standalone host's rules require.

**Pull requests**: the letters of plan.md's table (A, S, D1, D2, D3, W1, W2, T). A task is ticked here only once its pull request is merged.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel with the other [P] tasks of its phase (different files).
- **[Story]**: US1 to US9 of the specification.

## Phase 1: Setup

- [ ] T001 Check R2 against the current binding: add an FBL fixture in which an older copy of `etalii.adp/specifications/fbl/causal-loop-diagram.fbl` reads `variable a "A" start=0.7`, and record whether the line is kept with its rest reported or refused. Amend research R2 and the contract if it is refused (PR A)
- [ ] T002 [P] Make the template from `etalii.adp/specs/074-desktop-cld-flow-export/reference/mental-health-cld-flows.html`, changing only FR-035's places (a) to (f); a test diffs the template against the reference and fails on any other change (FR-035, FR-036) (PR D2)

## Phase 2: Foundational, the flow properties in the definition (PR A) — blocks every story

- [ ] T003 [US8] Write the fixtures `etalii.adp/specifications/fbl/fixtures/causal-loop-flow-{read,set,default,range,unknown,legacy}/` as contracts/cld-flow-statements.md lists them; see `validate-examples.py` fail on them
- [ ] T004 [US8] Add the `title` and `flow` rules and the `start=`/`push=` words to `etalii.adp/specifications/fbl/causal-loop-diagram.fbl`, with their insert, set and remove behaviour (FR-028); the fixtures of T003 pass
- [ ] T005 [US8] Add the diagram attributes, the enum `HeatmapReading`, the variable attributes `start` and `push`, their ranges as constraints with the sentence of data-model.md, the `typeMap` entries `Title` and `Flow` as `diagram`, and the new doc of `weight` to `etalii.adp/definitions/diagrams/causal-loop-diagram.dis`; raise its `language.version` by a minor step (FR-025, FR-026, FR-027)
- [ ] T006 [P] [US8] Reword "simulates nothing" and add the flow properties to `etalii.adp/definitions/diagrams/causal-loop-diagram.md`
- [ ] T007 [P] [US8] Describe the same properties and statements in `etalii.adp/definitions/diagrams/causal-loop-diagram.atd` and `causal-loop-diagram.cld.atd`, and regenerate `causal-loop-diagram.trace.json` as spec 035 says (FR-030)
- [ ] T008 [US8] Add an example that sets every flow property beside the definition's examples, and check that every existing `.cld` example round-trips byte-identical (FR-029, FR-030, SC-009); `validate-examples.py` and `atd-grammar.py --check` pass

## Phase 3: User Story 8 in the standalone host (PR S)

- [ ] T009 [US8] Sync the standalone host's copies (`etalii.adp.ide.standalone/src/diagrams/causal-loop-diagram/definition/causal-loop-diagram.{dis,md}`, the backend's `causal-loop-diagram.fbl`, `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/causal-loop-diagram.fbl`) from PR A's merge commit; the FBL conformance tests run the new fixtures
- [ ] T010 [US8] Write a test that an empty selection on a causal loop diagram shows the diagram's attributes in the property grid, and see it fail or pass (R5); if it fails, add the generic diagram section to the property grid for every DISL diagram with diagram attributes
- [ ] T011 [US8] Write tests for User Story 8 scenarios 1 to 6 in the causal loop diagram module's tests (set, undo, default removal, out-of-range finding, legacy round-trip), and make them pass
- [ ] T012 [US8] Record goldens with the parity recorder for the edits of `causal-loop-flow-set` and `causal-loop-flow-default` at PR S's head, for the desktop host's `parity/goldens/` (FR-031, SC-008)
- [ ] T013 [US8] Run the four gates and update `docs/tools.md`'s causal loop diagram row to mention the flow properties

## Phase 4: User Story 8 in the desktop host (PR D1)

- [ ] T014 [US8] Sync `etalii.adp.ide.desktop/vendor/etalii.adp/` to PR A's merge commit with `python tools/sync-etalii-adp.py <commit>`; the conformance run reads the new fixtures, and nothing else changes
- [ ] T015 [US8] Write a test in `crates/adp-shell/src/properties/` that an empty selection shows the diagram's attributes for a tool type with any and keeps "Select an element to see its properties." for one without; make it pass with a generic diagram section (R5)
- [ ] T016 [US8] Add the parity scripts and the goldens of T012 under `parity/scripts/` and `parity/goldens/`, with a `reference` file naming PR S's commit; `cargo test -p adp-parity` replays them byte for byte (SC-008)
- [ ] T017 [US8] Add the rows of User Story 8 to `parity/inventory.md` with their tests

## Phase 5: User Stories 2 to 7, the generator (PR D2)

- [ ] T018 [P] [US1] Write `modules/diagrams/causal-loop-diagram/tests/flow_page.rs`: for each fixture example and the mental health example, the embedded `DATA` holds every variable, link and loop by count, and positions equal the canvas's (FR-007, FR-008, SC-002); see it fail
- [ ] T019 [P] [US7] Test that two runs give byte-identical pages and that the page holds no `src=`, `href=` or `url(` that leaves the file (FR-009, FR-010, SC-004, SC-005)
- [ ] T020 [P] [US7] Test that a label of `</script><script>alert(1)</script>` and `&amp;"` arrives escaped (FR-009, SC-006)
- [ ] T021 [P] [US5] Test that declared loops are carried with their kind, and that a diagram without any carries the cycles the module's cycle finder returns (FR-007, User Story 5 scenario 2)
- [ ] T022 [P] [US8] Test that the flow properties, or their defaults, are the data's `settings`, `start`, `push` and `weight`, limited to their ranges (FR-017, FR-027, User Story 8 scenario 7)
- [ ] T023 Test the edge cases: no links, a self-link, two opposite links, a link naming no variable (counted in `omitted`), a link of unstated polarity, weights of 0, -3 and 1e21
- [ ] T024 Write `modules/diagrams/causal-loop-diagram/src/flow_page.rs` (the data from the open session, serialised as contracts/flow-page.md says) and `flow_page.html` (T002's template, held with `include_str!`); T018 to T023 pass
- [ ] T025 [US2] [US3] [US4] [US6] Write `etalii.adp.ide.desktop/tools/flow-page-check/check.mjs` (R6): it generates pages from the fixtures and asserts no request; the counts; dots on every link, teal for positive and pink for negative, larger from a higher source (FR-014); a raised source raising a positive link's target and lowering a negative one's, a plain link's target answering before a delayed one's, and a delayed link holding more dots (FR-011 to FR-013); every heatmap reading recolouring (FR-015); the loop list and its gains, marked at 1 (FR-016); every control of contracts/flow-page.md changing its state and nothing leaving the page (FR-017, FR-019); pan, zoom, dragging a variable and the hover texts (FR-018); the chart's seven series; see it fail against a template with the model stubbed, then pass
- [ ] T026 [US7] Extend the check with the 200-variable, 600-link fixture measuring frame time (SC-003), and the phone width with no sideways scroll (FR-020)
- [ ] T027 Run the check in the desktop host's `Build` workflow after `cargo test`, on Linux

## Phase 6: User Story 1, the button (PR D3)

- [ ] T028 [US1] Test in `crates/adp-diagram` that a module's `exports()` reaches the session, and in `crates/adp-shell` that the ribbon shows one button per export of the active tab, disabled with the reason for a tab whose module has none or for no tab (FR-001, FR-002, User Story 1 scenario 4); see them fail
- [ ] T029 [US1] Add `Export`/`ExportOutput` and `DiagramModule::exports` to `crates/adp-diagram/src/module.rs` and `Command::Export(id)` to `crates/adp-shell/src/ribbon.rs`; T028 passes
- [ ] T030 [US1] Return the `Export flow page` export from the causal loop diagram module, with the name `FILENAME {yyyy-mm-dd hh.mm}.html` from the local clock; test the name for a fixed time, with spaces and non-ASCII in the file name, and the disabled state for a diagram with no file (FR-004, edge cases)
- [ ] T031 [US1] Test and write the shell's handling: the bytes written beside the document, only a file of the same name replaced, a read-only folder reported, the unsaved canvas exported without touching the `.cld` or `.adp` (FR-003, FR-004, User Story 1 scenario 2)
- [ ] T032 [US1] Add `crates/adp-shell/src/platform_open.rs` (R4) and the status sentence naming the file, also when opening fails (FR-005, User Story 1 scenario 5); test the command line per platform
- [ ] T033 [US1] Expose the button to AccessKit with its role, name and state, and test it in `crates/adp-shell`'s accessibility tests (FR-006)
- [ ] T034 [US1] Add the export's rows to `parity/inventory.md` as desktop-only, with no standalone counterpart, and their tests (FR-023)
- [ ] T035 [US1] Walk quickstart sections 1 and 2 on the mental health example in the desktop host on one platform, and record the walk with its screenshots in `parity/walks.md` (SC-001, SC-007)

## Phase 7: User Story 9, the website (PRs W1, W2)

- [ ] T036 [US9] Export the mental health example from the desktop host, let it run for 20 seconds under Backlog, and capture the browser at the size `docs/screenshots/readme.md` asks; commit it as `etalii.adp.ide.standalone/docs/screenshots/causal-loop-flow-page.png` with its readme row: what it shows, the document, and "exported from the desktop host" (FR-032, R8)
- [ ] T037 [US9] Run "Refresh the screenshots" in `etalii.adp.site`; in its pull request, answer the decision linking the image to `systems/causal-loop-diagram` and write its `whyItMatters` in `src/content/catalogue/screenshot-notes.json` with User Story 9 scenarios 2 and 3: one self-contained page from the desktop host's ribbon, offline; watching influence flow and delays hold it; the four heatmap readings; external variables and the dynamics; pushing or jolting a variable; changing a link; loops and their gain; the chart; pan, zoom and moving variables; numbers from a simple model (FR-033, FR-034)
- [ ] T038 [US9] Check the published tool page as quickstart section 4 says (SC-010)

## Phase 7a: User Story 10, the published flow pages (PR W3)

- [ ] T041 [US10] Generate the flow page of each example under `etalii.adp.ide.standalone/src/examples/diagrams/causal-loop-diagram/` (business-philosophy, mental-health, on-call, reference) with the desktop host's generator and its registration, and commit each as `etalii.adp.site/public/docs/causal-loop-flow-pages/<example>.html`, with a test that the folder holds one page per example and each loads nothing from outside itself (FR-037, FR-040)
- [ ] T042 [US10] Write `etalii.adp.site/src/content/docs/docs/causal-loop-flow-pages.mdx` listing them, with its entry in the documentation's sidebar (FR-038)
- [ ] T043 [US10] Put one link per published flow page, named for its example, on the causal loop diagram's tool page by the route `etalii.adp.site`'s rules for a tool allow, with a test that the tool page holds a link to every page in the folder (FR-039)
- [ ] T044 [US10] Check the published pages as User Story 10 says (SC-011)

## Phase 8: Polish

- [ ] T039 Update `etalii.adp.ide.desktop/README.md` with the export, and `docs/tools.md` in etalii.adp.ide.standalone if T013 left it short
- [ ] T040 Tick the merged tasks here and set the specification's status to Implemented (PR T)

## Dependencies & Execution Order

- Phase 2 (PR A) blocks everything. Phase 3 (S) needs A. Phase 4 (D1) needs A and the goldens of S. Phase 5 (D2) needs D1 for the properties in the data. Phase 6 (D3) needs D2. Phase 7 needs D3. T040 follows each merge, batched.
- T002 can start at once. T018 to T023 can be written together. T036 needs the page as D3 ships it.

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001, FR-002 | T028, T029 |
| FR-003 | T031 |
| FR-004 | T030, T031 |
| FR-005 | T032 |
| FR-006 | T033 |
| FR-007, FR-008 | T018, T021, T024 |
| FR-009, FR-010 | T019, T020, T024 |
| FR-011, FR-012, FR-013, FR-014, FR-015, FR-016 | T025 |
| FR-017 | T022 (starting values), T025 (controls) |
| FR-018, FR-019 | T025 |
| FR-020 | T026 |
| FR-021 | withdrawn (FR-036) |
| FR-035, FR-036 | T002, T024 |
| FR-022 | T004, T005 (no language construct), plan's Constitution Check |
| FR-023 | T034 |
| FR-024 | T032 |
| FR-025, FR-026, FR-027 | T005, T022 |
| FR-028 | T003, T004 |
| FR-029 | T003, T008, T011 |
| FR-030 | T007, T008 |
| FR-031 | T009 to T017 |
| FR-032 | T036 |
| FR-033, FR-034 | T037 |
| SC-001, SC-007 | T035 |
| SC-002 | T018 |
| SC-003 | T026 |
| SC-004, SC-005 | T019 |
| SC-006 | T020 |
| SC-008 | T012, T016 |
| SC-009 | T008 |
| SC-010 | T038 |
| FR-037, FR-040 | T041 |
| FR-038 | T042 |
| FR-039 | T043 |
| SC-011 | T044 |
