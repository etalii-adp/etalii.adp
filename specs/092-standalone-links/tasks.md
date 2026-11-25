# Tasks: Links Between Tools in the Standalone Host

**Input**: [standalone-links.spec.md](standalone-links.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as standalone principle III asks. Paths start with the repository they are in; `standalone` is `etalii.adp.ide.standalone`.

**Format**: `[ID] [P?] [Story] Description`. `[P]` runs beside the other `[P]` tasks of its phase. A task is ticked only once the pull request it landed in has merged.

## Phase 1: Read DISL 0.12 and FBL 17.2 (pull request B)

**Goal**: the host loads definitions and bindings with links, for every tool type.

- [ ] T001 [US1] Test first, then the attribute type `link` (a string), `linkable` with `nameProperty`, `linked` with `attribute`, and `persistence.documentId` in `standalone/src/backend/EtAlii.Adp.Specification.Disl/Loading/` and `Model/`; R0's two errors are the failing test (R2) [FR-005]
- [ ] T002 [US1] Test first, then the action `lookup` (`create`, `as: child | at`, `origins`, its `as` name) read in `DislActionReader.cs`, run by `ActionRunner.cs` against an optional lookup answer, and refused with a sentence when the host gives none (R2) [FR-005, FR-013]
- [ ] T003 [P] [US1] Test first, then the widget `lookup` in the form reader and `nanoid` with `alphabet` and `length` in id generation (DISL 11.5) [FR-005, FR-006]
- [ ] T004 [US1] Test first, then a binding's `document: { id }` for `yaml` and `json` keys and an `xml` root attribute, the id on the reading, `{newid:document}` in `Routing/TemplateWriter.cs`, and the id's insertion planned as a splice, in `standalone/src/backend/EtAlii.Adp.Specification.Fbl/` (R3) [FR-003]
- [ ] T005 [P] [US1] The FBL conformance copy under `EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/` refreshed to etalii.adp `develop`, with the binding fixtures of FBL 0.23 that the four served bindings use passing [FR-003]

## Phase 2: Re-bundle and serve (pull request B, User Story 1)

**Goal**: the served bindings carry links and the host still reads every file as before.

- [ ] T006 [US1] Before anything changes, record for every example and fixture of the timeline, dependency graph and mind map what is drawn (the element payloads), the findings and the bytes of an unchanged save, as a test that later tasks must keep green [SC-001]
- [ ] T007 [US1] Re-bundle `timeline`, `dependency-graph` and `mindmap` with `bash src/diagrams/tools/bundle-disl.sh <module> <etalii.adp at develop>` in `standalone/src/diagrams/*/definition/`; each module's tests pass [FR-004]
- [ ] T008 [US1] Served `timeline.fbl` and `dependency-graph.fbl`: `document.id` on the top-level `id`, the rules for an `elements` entry with a `link` key before the ordinary ones, the FBL version raised, the differences from the example kept in `doc`; compared by reading with the desktop host's copies (R4) [FR-001]
- [ ] T009 [US1] Test first, then the mind map plugin at 0.2.0 reading and writing the central topic's `adp-id` and a node's `adp-link` in place (`mindmap.md` 3.8), and the served `mindmap.fbl` naming `^0.2.0` (R7) [FR-002, SC-007]
- [ ] T010 [US1] Test first, then the canvas library mapping `has(self.link)` and `has(self.linked)` to the payload's generic `link` and `linked` members in `standalone/src/client/src/canvas/library/disl/compileNotation.ts`, and the backend sending them with the target's cached name as the label, so a linked element is drawn with its link mark without module code (R5) [FR-005, FR-011]
- [ ] T011 [US1] Open spec 089's worked workspace (`etalii.adp/specifications/fbl/links-example/`) in the module tests: every document opens with no finding of an unsupported construct; T006 still green [US1, SC-001]
- [ ] T012 [US1] Run the four gates, open pull request B naming this feature and the etalii.adp commit, close the gap recorded under spec 091's T003, turn auto-merge on

## Phase 3: The index and resolution (pull request E, User Story 4)

- [ ] T013 [US4] Test first, then the link's grammar, escaping (FR-006 of spec 089) and resolution (FBL 17.3) as pure functions in `standalone/src/backend/EtAlii.Adp.Specification.Fbl/Links/`, replayed against `specifications/fbl/fixtures/links-workspace/conformance.json` [FR-008, SC-004]
- [ ] T014 [US4] Create `standalone/src/backend/EtAlii.Adp.Links/` and `EtAlii.Adp.Links.Tests/` (`ILinkIndex`): per hierarchy root, the documents of tool types with a document id, their linkable elements by name property, and their links; following file events and an open document's unsaved state; a file over a size limit not read; update `docs/solution-structure.md` and `docs/architecture.md` (R1) [FR-007]
- [ ] T015 [US4] Test first, that a command can carry pending changes into its undo step in `EtAlii.Adp.History`, adding the generic part if it cannot (R6) [FR-010]
- [ ] T016 [US4] Test first, then load-time validation in the module sessions of `EtAlii.Adp.Diagram.Modules`: a document id where none is, stale link parts, written with the first edit, nothing written on open or for a read-only document [FR-003, FR-010, US6]
- [ ] T017 [US4] Test first, then the four findings at the element that holds the link, with their fixes, in the problems list; choosing a candidate of `link.ambiguous-document` gives the others new document ids [FR-009]
- [ ] T018 [US4] Test first, then a linked element's label and `shows` attributes following its target's changes while open, and the broken mark when it does not resolve [FR-011]
- [ ] T019 [US4] Rename, move and copy a target in a test hierarchy; links resolve on the next opening (SC-004); run the four gates, open pull request E, turn auto-merge on

## Phase 4: Lookup, navigation and backlinks (pull request F, User Stories 2 and 3)

- [ ] T020 [US2] Test first, then the lookup's search over the index (by name as typed, with document name and folder, `origins`) as a unary call in `standalone/src/api/` and `EtAlii.Adp.Links`, answered within SC-006's 30 seconds for 200 documents with room to spare [FR-012, SC-006]
- [ ] T021 [US2] Test first, then the `lookup` interaction kind on `ContextService` and one shared lookup component in `standalone/src/client/src/shell/`; picking runs the action (`as: child`, `as: at`) in one undo step, dismissing changes nothing [FR-012, FR-013]
- [ ] T022 [US3] Test first, then "Open linked element" on an element's context menu and from its link mark, opening the target's tool or bringing it to the front, with the element selected, through a `reveal` member of the workspace stream's message (R5) [FR-014]
- [ ] T023 [US3] Test first, then "Linked from (N)" on an element that links point at, listing and navigating each; and the delete confirmation that says how many links break [FR-015, FR-016]
- [ ] T024 [US2] Add a linked element to each of the three diagrams in a test hierarchy, connect one in the dependency graph, save, reopen, and compare the bytes with what the desktop host writes for the same steps [SC-003]; run the four gates, open pull request F, turn auto-merge on

## Phase 5: The knowledge designer, re-bundled (pull request G)

- [ ] T025 [US5] Re-bundle `knowledge.des` 0.2.0 and `knowledge.fbl` from etalii.adp into `standalone/src/designers/knowledge/definition/`, measure what the designer loader lacks of DESL 0.5 and DED 0.3, and record it here; split pull request G in two if it is more than the loader's reading (plan, *Complexity Tracking*) [FR-005]
- [ ] T026 [US5] Test first, then DESL 0.5's `link` value type, `documentId` and the relation picker's declarations, and DED 0.3's envelope `id`, read in the designer loader [FR-005]

## Phase 6: Knowledge relations as links (pull request G, User Story 5)

- [ ] T027 [US5] Test first, then relations naming their target by a link without an element and cells holding links, resolved through `ILinkIndex`, in `standalone/src/designers/knowledge/backend/` (`KnowledgeRelations`, `KnowledgeTargetRename`) [FR-017]
- [ ] T028 [US5] Test first, then the one-time conversion with the first edit, byte-compared with `specifications/fbl/fixtures/links-workspace/knowledge/cities.converted`, and `knowledge.unresolved-target` for a target without an id; the (row, related row) pairs of the standalone examples compared before and after [FR-018, SC-005]
- [ ] T029 [US5] Test first, then the counterpart column computed from backlinks and stored in no file [FR-019]
- [ ] T030 [US5] Test first, then the relation picker in `standalone/src/client/src/table/library/`: search by title as typed, chips, one replacing one for `limit: one`, *Create* as one undo step over both files [FR-020]
- [ ] T031 [US5] Run the four gates, open pull request G, turn auto-merge on

## Phase 7: The other hosts (pull requests C and D)

- [ ] T032 [P] Once B has merged, copy the served bindings into `etalii.adp.ide.vscode/definitions/{timeline,dependency-graph}/` with `npm run sync-definitions`, update `docs/disl-support.md`, `CHANGELOG.md` (Unreleased) and `README.md`, run its checks, open pull request C, turn auto-merge on [FR-021]
- [ ] T033 [P] Once B has merged, in `etalii.adp.ide.desktop` on the Mac mini, remove the copies of `timeline.fbl` and `dependency-graph.fbl`, read the bindings the definitions name, run its recordings, open pull request D, turn auto-merge on [FR-022, SC-009]
- [ ] T034 Host test of VS Code on the Mac mini: a timeline and a dependency graph linking to and from a knowledge file and a mind map, in both directions, with a new user's first link timed and every hurdle recorded [SC-008]

## Phase 8: Documents, host tests and ticks (pull requests H and I)

- [ ] T035 Host test of the standalone host on the Mac mini once F and G have merged: the 16 pairs (SC-002), a Freeplane round trip (SC-007), the lookup in a 200-document workspace (SC-006), and a new user's first link with no setting, message or hurdle (US6) [FR-023]
- [ ] T036 [P] `standalone/docs/tools.md` rows of the four tool types, `docs/creating-a-diagram-module.md` and `docs/creating-a-designer-module.md` where a touch point moved, and `tests.md` for what only a running app shows; open pull request H, turn auto-merge on [FR-024]
- [ ] T037 Trace every FR and SC to the files and strings that satisfy it, read two traces back to their artefacts, and record it here; tick this feature, spec 089's T060 to T062 and spec 091's T003 in one etalii.adp pull request I

## Coverage

Every functional requirement is claimed: FR-001 (T008), FR-002 (T009), FR-003 (T004, T005, T016), FR-004 (T007), FR-005 (T001, T002, T003, T010, T025, T026), FR-006 (T003), FR-007 (T014), FR-008 (T013), FR-009 (T017), FR-010 (T015, T016), FR-011 (T010, T018), FR-012 (T020, T021), FR-013 (T002, T021), FR-014 (T022), FR-015 (T023), FR-016 (T023), FR-017 (T027), FR-018 (T028), FR-019 (T029), FR-020 (T030), FR-021 (T032), FR-022 (T033), FR-023 (T035), FR-024 (T036). Success criteria: SC-001 (T006, T011), SC-002 (T035), SC-003 (T024), SC-004 (T013, T019), SC-005 (T028), SC-006 (T020, T035), SC-007 (T009, T035), SC-008 (T034), SC-009 (T033), SC-010 (held by review of every pull request: no core project names a tool type; T037 reads it back).
