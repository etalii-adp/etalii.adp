# Tasks: The Tools on DISL and FBL in Visual Studio Code

**Input**: [vscode-disl-fbl-tools.spec.md](vscode-disl-fbl-tools.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: required (constitution IV of `etalii.adp.ide.vscode`, FR-014 to FR-016): every test is written first and seen failing.

**Paths**: every file names its repository. A task whose code lands in `etalii.adp.ide.vscode` is ticked only once that repository's pull request is merged.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Add `@marcbachmann/cel-js` to `etalii.adp.ide.vscode/package.json` and confirm the bundle and licence check accept it (research R1)
- [ ] T002 Write `etalii.adp.ide.vscode/scripts/sync-definitions.mjs`: copy each tool type's specification, binding and companion from git objects of the sibling clones into `definitions/<tool>/`, write `PROVENANCE.md`, and `--check` (R6)
- [ ] T003 Mark `definitions/**` as `-text` in `etalii.adp.ide.vscode/.gitattributes`, add `sync-definitions --check` to `etalii.adp.ide.vscode/.github/workflows/build.yml`, and bundle the definitions as JSON in `esbuild.mjs`

## Phase 2: Foundational (blocks every story)

- [ ] T004 Take Notion's `src/disl/` at `4a0cdb4` into `etalii.adp.ide.vscode/src/core/disl/` with its tests into `test/core/disl/`, record `ORIGIN.md`, and make both pass unchanged (R1)
- [ ] T005 [P] Write `etalii.adp.ide.vscode/test/core/disl-tool/words.test.ts`: no file under `src/core/disl/`, `src/core/desl/` or `src/core/disl-tool/` names an element, attribute, relation or enum value of a copied definition
- [ ] T006 Write the tests of `diagramTypeFrom` against the hype cycle graph's definition in `etalii.adp.ide.vscode/test/core/disl-tool/` (view, toolbox, fields, actions, edit as splices, findings), seen failing
- [ ] T007 Implement `diagramTypeFrom(definition, binding, plugins)` in `etalii.adp.ide.vscode/src/core/disl-tool/` against the frame's `DiagramType` contract (R2, R8)
- [ ] T008 Derive the webview's diagram definition from DISL notation in `etalii.adp.ide.vscode/src/core/disl-tool/webviewDefinition.ts`, and teach `src/webview/diagram/` custom path shapes (R2)
- [ ] T009 Write `etalii.adp.ide.vscode/docs/disl-support.md`, generated from `src/core/disl/support.ts` where it can be, and the rows of `docs/parity.md` that apply to every DISL type (FR-004, R7)

## Phase 3: User Story 1 - Work on a mind map (P1) 🎯 MVP

- [ ] T010 [P] [US1] Copy the mind map's `mindmap.dis`, `mindmap.md` and the binding its `persistence.binding` names into `etalii.adp.ide.vscode/definitions/mindmap/` with T002
- [ ] T011 [P] [US1] Copy the standalone mind map examples and fixtures (`example 1/`, `Fixtures/architecture.mm`, the `mindmap-nodes` conformance fixture) into `etalii.adp.ide.vscode/test/` with `scripts/sync-examples.mjs`
- [ ] T012 [US1] Port `net.etalii.adp.freeplane.mm` from standalone's `MmParser` and writer to `etalii.adp.ide.vscode/src/core/plugins/freeplane-mm/` with its tests first: every example reads, saves byte-identical, and each edit and its undo match the conformance fixture (R3)
- [ ] T013 [US1] Port `net.etalii.adp.freeplane.mindmapLayout` to `etalii.adp.ide.vscode/src/core/plugins/mindmap-layout/`, tests first, with `mrtree` as the fallback (R3)
- [ ] T014 [US1] Add to `etalii.adp.ide.vscode/src/core/disl/` what the mind map uses and Notion does not read: `autoSize: "fitContent"`, `clipboard`, the `view` action, `persistence.view`, the id `prefix`, `descendants()`; each in `support.ts` and `docs/disl-support.md` (R3)
- [ ] T015 [US1] Offer `net.etalii.adp.ide.projectLinkPicker` through Visual Studio Code's Quick Open in `etalii.adp.ide.vscode/src/extension/` (R3)
- [ ] T016 [US1] Register the mind map for `.mm` in `etalii.adp.ide.vscode/package.json` and `src/extension/diagramTypes.ts`; a `.mm` file the binding's marker does not claim opens as text (FR-008)
- [ ] T017 [US1] In-editor tests in `etalii.adp.ide.vscode/test/vscode/mindmap.test.ts`: opens by default, save unchanged, edit and undo, Problems; check the native dialogs once in a real window (FR-015)
- [ ] T018 [US1] Add the mind map's row to `etalii.adp.ide.vscode/docs/tools.md` and the readme, and file every difference found against `etalii.adp` (FR-017, FR-018)

## Phase 4: User Story 2 - Work on an agent activity diagram (P1)

- [ ] T019 [P] [US2] Copy `agent-activity-diagram.dis`, `.fbl` and `.md` into `etalii.adp.ide.vscode/definitions/agent-activity-diagram/`, and the three standalone examples, the `findings/*.aad` fixtures and the `agent-activity-*` conformance fixtures into `test/`
- [ ] T020 [US2] DISL 0.4 in `etalii.adp.ide.vscode/src/core/disl/`, each with its tests first: the `force` layout with tiers, `onChange`, `respect: "pinned"`; compartments with `groupBy`, `itemOrder`, `itemLink` and badges; filter `persist`; `pin`, `unpin`, `unpinAll`; `groups` and `pinned` on `view`; `open`; `persistence.view.bind`; `paths` (R4)
- [ ] T021 [P] [US2] Draw `folder`, `hexagon` and the definition's icons in `etalii.adp.ide.vscode/src/webview/diagram/`, for every type
- [ ] T022 [US2] Run `open` with `vscode.open` in `etalii.adp.ide.vscode/src/extension/` (R4)
- [ ] T023 [US2] Register the agent activity diagram for `.aad`, with in-editor tests in `etalii.adp.ide.vscode/test/vscode/agent-activity-diagram.test.ts` and its rows in `docs/tools.md`, `docs/disl-support.md` and `docs/parity.md`; file every difference against `etalii.adp`

## Phase 5: User Story 3 - Work in the Knowledge designer (P2)

- [ ] T024 [P] [US3] Copy `knowledge.des`, `knowledge.fbl`, `knowledge.md` and `knowledge.schema.json` into `etalii.adp.ide.vscode/definitions/knowledge/`, and the standalone examples and `knowledge-*` conformance fixtures into `test/`
- [ ] T025 [US3] Write the `DesignerType` contract in `etalii.adp.ide.vscode/src/core/frame/designerType.ts`, and let the frame's editor provider serve either contract (R5)
- [ ] T026 [US3] Write the DESL interpreter in `etalii.adp.ide.vscode/src/core/desl/`, tests first, reusing `src/core/disl/`'s metamodel and expressions: the `table` surface, the value types and their editors, comparisons and conversions, and the operations (R5)
- [ ] T027 [US3] Implement `designerTypeFrom` in `etalii.adp.ide.vscode/src/core/desl-tool/`, choosing among the three bindings by FBL routing; tests: the same knowledge in YAML, JSON and XML shows the same table (R5)
- [ ] T028 [US3] Build the table surface in `etalii.adp.ide.vscode/src/webview/table/`, after standalone's table library, with its tests in `test/webview/table/`
- [ ] T029 [US3] Register the designer for `.ded` by default and as an option for `.yaml`, `.yml`, `.json` and `.xml`, suggested only where the binding claims the file; in-editor tests in `etalii.adp.ide.vscode/test/vscode/knowledge.test.ts` that a YAML, JSON and XML file without the envelope opens as text (FR-008, SC-003)
- [ ] T030 [US3] Add the designer to `etalii.adp.ide.vscode/docs/tools.md`, a `docs/desl-support.md`, and file every difference against `etalii.adp`

## Phase 6: User Story 4 - The two existing diagrams read their definitions (P3)

- [ ] T031 [P] [US4] Copy the hype cycle graph's and Agent Behavior Modelling's definitions and bindings into `etalii.adp.ide.vscode/definitions/`
- [ ] T032 [US4] Move the hype cycle graph onto `diagramTypeFrom`; the existing tests in `etalii.adp.ide.vscode/test/` pass, apart from those rewritten to name behaviour (FR-013)
- [ ] T033 [US4] Turn Agent Behavior Modelling's parser and writer into `net.etalii.adp.etalii.abmMarkdown` and its arrangement into `net.etalii.adp.etalii.abmArrange` under `etalii.adp.ide.vscode/src/core/plugins/`; add `anchor.sides` and the derived id strategy to `src/core/disl/` (R9)
- [ ] T034 [US4] Move Agent Behavior Modelling onto `diagramTypeFrom`, remove `src/core/gartner-hypecycle-graph/` and `src/core/agent-behavior-modelling/` from `etalii.adp.ide.vscode`, and update `docs/parity.md`

## Phase 7: Polish

- [ ] T035 Check SC-005 in `etalii.adp.ide.vscode`: removing one tool type's copied definitions removes it without another change, and adding them back restores it
- [ ] T036 Raise with `etalii.adp.ide.notion` whether it takes its DISL interpreter from this plug-in, as it takes FBL (R1)

## Dependencies & Execution Order

- Phase 1 then Phase 2 block everything. Each story then follows in order, one pull request each (R10): US1 needs T004 to T009; US2 builds on US1's interpreter work; US3 needs Phase 2 only and could run beside US2, but goes after it to keep one change in review at a time; US4 goes last.
- Within a story: copies, then tests, then implementation, then registration and in-editor tests, then documentation.

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001, FR-002 | T002, T003, T010, T019, T024, T031 |
| FR-003, FR-005 | T005, T007, T008, T035 |
| FR-004 | T009, T014, T020, T030 |
| FR-006, FR-007 | T007, T012, T027 |
| FR-008 | T016, T029 |
| FR-009 | T020, T023 |
| FR-010 | T007, T017, T023 |
| FR-011 | T016, T023, T029 |
| FR-012 | T025 to T029 |
| FR-013 | T032 to T034 |
| FR-014 | T011, T012, T019, T024 |
| FR-015 | T017, T023, T029 |
| FR-016 | every test task |
| FR-017 | T018, T023, T030 |
| FR-018 | T018, T023, T030 |
