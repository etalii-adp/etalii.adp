# Tasks: The Hierarchical Requirement Designer in the Desktop Host

**Input**: [desktop-hierarchical-requirement.spec.md](desktop-hierarchical-requirement.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Prerequisites**: the maintainer's word before building (spec 036 card, 2026-10-25: "Approve, plan and tasks next"; building waits for a further word).

**Tests**: required. Desktop Principle IV: every test is written before the behaviour it covers and seen failing first; a port names the standalone test it ports.

**Organization**: by user story, after the setup and the foundation every story rests on. Every path is in `etalii.adp.ide.desktop/` unless it says otherwise. "Port X" means: port the standalone host's file X at `a7fdf03`, naming it and the commit in the Rust file's doc comment, as spec 030's ports do. Every task's pull request runs the four checks of [quickstart.md](quickstart.md); none is listed again per task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: the user story of the spec it serves (US1 to US7)

---

## Phase 1: Setup (pull request 1)

**Purpose**: the definition with pull request 508 in the desktop host, the recorder able to record at `a7fdf03`, and the module crate in the workspace.

- [x] T001 Refresh `etalii.adp.ide.desktop/vendor/etalii.adp/` and `etalii.adp.ide.desktop/vendor/etalii.adp.lock` with `python tools/sync-etalii-adp.py <etalii.adp develop commit>` (research R2); run the whole suite; fix what fails by loading or counting (`etalii.adp.ide.desktop/crates/adp-core/tests/catalogue.rs`, a new fixture such as `sankey-written-text` set aside in `etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs` with its reason); if another tool type's behaviour changes, stop and ask the maintainer as a selection (R2's three options)
- [x] T002 [P] Let the recorder take the reference commit from a `reference` file beside a script folder, falling back to `8b6ccfc`, and refuse a worktree at another commit, in `etalii.adp.ide.desktop/parity/recorder/Program.cs`, and say so in `etalii.adp.ide.desktop/parity/recorder/README.md` and `etalii.adp.ide.desktop/parity/README.md` (research R3)
- [x] T003 [P] Add `etalii.adp.ide.desktop/parity/scripts/etalii/hierarchical-requirement/reference` (`a7fdf039c204535e9fc3a14f456e6f5a36a685ce`) and the web shop fixture `etalii.adp.ide.desktop/parity/fixtures/etalii/hierarchical-requirement/web-shop/` (`web-shop.md`, `web-shop.adp`, copied from `vendor/etalii.adp/definitions/designers/examples/`)
- [x] T004 Create the crate `adp-designer-hierarchical-requirement` in `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/` (`Cargo.toml`, `src/lib.rs` with `ORIGIN`), add it to the workspace in `etalii.adp.ide.desktop/Cargo.toml`, and vendor the web shop and NIST SP 800-53 examples with their `LICENSE.md` and readme from the standalone host's `src/examples/designers/hierarchical-requirement/` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/examples/`

**Checkpoint**: the suite is green on the refreshed definitions; nothing of the designer runs yet.

---

## Phase 2: Foundational (pull requests 2, 3 and 4)

**Purpose**: the FBL library, the surface's contract and the module's reading, which every story needs.

### The bullets family (pull request 2)

- [x] T005 Write the tests of the bullets family first: port the standalone host's `EtAlii.Adp.Specification.Fbl.Tests` cases for `Files/Bullets/` into `etalii.adp.ide.desktop/crates/adp-fbl/src/families/bullets/tests.rs`, and see them fail
- [x] T006 Port `Files/Bullets/{Bullet,BulletsParser,Heading,Columns}.cs` into `etalii.adp.ide.desktop/crates/adp-fbl/src/families/bullets/parser.rs` (research R1)
- [x] T007 Port `Files/Bullets/BulletsFamily.cs` (reading and edit planning) into `etalii.adp.ide.desktop/crates/adp-fbl/src/families/bullets/mod.rs`, registered in `etalii.adp.ide.desktop/crates/adp-fbl/src/families/mod.rs` and read by `etalii.adp.ide.desktop/crates/adp-fbl/src/rules/reading.rs`
- [x] T008 Remove `bullets-read`, `bullets-edits`, `bullets-edits/no-section`, `behavior-tree-read` and `behavior-tree-read/first-add` from `NOT_SUPPORTED` in `etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs` and make them pass

### Registration blocks and drift (pull request 3)

- [x] T009 Write the tests first: the `registration-blocks` fixture and the standalone host's `Registration/` and `History/` tests for declared blocks, creation by the first setting and drift before an edit, in `etalii.adp.ide.desktop/crates/adp-fbl/src/registration/tests.rs` and `etalii.adp.ide.desktop/crates/adp-fbl/src/history/tests.rs`; see them fail
- [x] T010 Port `Documents/_Model/RegistrationBlockDeclaration.cs` and the binding reader's block declarations into `etalii.adp.ide.desktop/crates/adp-fbl/src/documents/types.rs` and `etalii.adp.ide.desktop/crates/adp-fbl/src/documents/loader.rs`
- [x] T011 Port `Registration/{RegistrationDocument,OpenRegistration,DeclaredBlockWriter}.cs` into `etalii.adp.ide.desktop/crates/adp-fbl/src/registration/blocks.rs`: read and write each declared block, keep an undeclared block as it was and report it as information (FBL 0.7 section 8.1)
- [x] T012 Port `Registration/RegistrationCreation.cs` into `etalii.adp.ide.desktop/crates/adp-fbl/src/registration/mod.rs`: the registration created by the first setting, outside the history (section 8.4)
- [x] T013 Port the drift check of `History/{EditHistory,SplicedFile}.cs` and `Planning/EditPlanner.cs` into `etalii.adp.ide.desktop/crates/adp-fbl/src/history/mod.rs` and `etalii.adp.ide.desktop/crates/adp-fbl/src/planning/planner.rs`: an edit planned against a file that has changed since it was read is refused with section 7.2's sentence, and an outside change ends the history (section 7.3)

### The surface's contract and the module's reading (pull request 4)

- [x] T014 [P] Write `etalii.adp.ide.desktop/crates/adp-desl/src/hierarchy/model.rs` (the structs of [data-model.md](data-model.md), "In `adp-desl::hierarchy`", ported from `EtAlii.Adp.Designer/HierarchySurfaceModel/*.cs`) and `etalii.adp.ide.desktop/crates/adp-desl/src/hierarchy/session.rs` (the trait of [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md)), exported from `etalii.adp.ide.desktop/crates/adp-desl/src/lib.rs`, with a test that no designer type's name appears in them
- [x] T015 [P] Port `HierarchicalRequirementVocabulary.cs`, `HierarchicalRequirementDefinition.cs` and the test `DefinitionConformance.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/{vocabulary,definition}.rs` and `tests/definition_conformance.rs`: the module's names against the vendored `.des`
- [x] T016 Port `_Model/*.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/model.rs`, and the tests `HierarchicalRequirementBody.Tests.cs`, `Examples.Tests.cs` and `RegistrationDeleted.Tests.cs` into `tests/`; see them fail
- [x] T017 Port `HierarchicalRequirementBody.cs` and `HierarchicalRequirementDocuments.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/{body,documents}.rs`: the document read through the binding into the JSON form, the registration's lists, collapsed block, filters and `widths` (only 120 to 2000), and every finding of the companion's "What reading reports"
- [x] T018 Port `HierarchicalRequirementSurfaceMapper.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/mapper.rs` (document to `SurfaceModel`), and `HierarchicalRequirementSession.cs`, `HierarchicalRequirementSessionFactory.cs` and `HierarchicalRequirementGestures.cs` into `src/session.rs` and `src/gestures.rs`, implementing `HierarchySurfaceSession` with no operation yet but `toggleCollapsed`; port `HierarchicalRequirementSession.Tests.cs` and `HierarchySurfaceFlow.Tests.cs`

**Checkpoint**: a requirement document reads into a `SurfaceModel` in tests; the FBL fixtures of the bullets family, the registration blocks and the designer pass.

---

## Phase 3: User Story 3 - The desktop host passes the designer's conformance run (Priority: P1)

**Goal**: every fixture of `bullets-*`, `behavior-tree-read`, `registration-blocks` and `hierarchical-requirement-*` passes, a planted defect fails, and the designer's scripts replay against goldens.

**Independent Test**: [quickstart.md](quickstart.md), "The checks" and "Plant a defect".

- [x] T019 [US3] Remove every `hierarchical-requirement-*` and `registration-blocks` entry from `NOT_SUPPORTED` in `etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs` and make them pass; the list then holds only what is not this feature's (pull request 3)
- [x] T020 [US3] Add a test in `etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs` that plants one wrong byte in a copy of a `hierarchical-requirement-edits` expected result and sees the run fail at that step (029: Story 3, scenario 2) (pull request 3)
- [x] T021 [US3] Add `etalii.adp.ide.desktop/parity/recorder/Replay.Hierarchy.cs` (a `hierarchy`, `undo`, `redo` and `outside` step sent through the standalone host's `DesignerService` hierarchy surface, as [contracts/parity-scripts.md](contracts/parity-scripts.md) states) and the replay of the same steps through `HierarchySurfaceSession` in `etalii.adp.ide.desktop/crates/adp-parity/src/` (pull request 4)

**Checkpoint**: SC-002 holds; the parity harness can record and replay a hierarchy script.

---

## Phase 4: User Story 1 - Open an agent's requirement document and read it by its structure (Priority: P1) MVP

**Goal**: a `.md` with the envelope opens in the designer as one page of boxes, which the person reads, collapses and focuses (pull request 5).

**Independent Test**: open the web shop example and a hand-written document three levels deep beside an ordinary `.md` and an Agent Behavior Modelling document; pass 029's Story 1 and this spec's Story 1.

### Tests for User Story 1

- [x] T022 [P] [US1] Write the tests first: the catalogue lists `etalii/hierarchical-requirement` with the standalone host's name, vendor and state, and `unlisted` is empty, in `etalii.adp.ide.desktop/crates/adp-core/tests/catalogue.rs`; a `.md` with the envelope routes to the designer and one without to the Markdown editor or Agent Behavior Modelling, in `etalii.adp.ide.desktop/crates/adp-core/tests/`; see them fail
- [x] T023 [P] [US1] Port the layout rules' tests (`layout.test.ts`, `iconsLayout.test.ts`) into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/tests.rs`: levels that fit, the icon row or column, the 6 and 12 pixel paddings and margins (Story 7, scenarios 4 to 6); see them fail

### Implementation for User Story 1

- [x] T024 [US1] Move the designer from `unlisted` to the catalogue's types in `etalii.adp.ide.desktop/crates/adp-core/src/catalogue.rs`, with the standalone host's `docs/tools.md` row at `a7fdf03`, and let the router ask a `shared` claim's marker before the extension's other owners (research R6) in `etalii.adp.ide.desktop/crates/adp-core/src/workspace.rs` or `etalii.adp.ide.desktop/crates/adp-fbl/src/routing.rs`, whichever holds the extension's owners
- [x] T025 [US1] Accept an existing requirement document unchanged in `etalii.adp.ide.desktop/crates/adp-add/src/lib.rs` (029: FR-003), with its test in `etalii.adp.ide.desktop/crates/adp-add/src/tests.rs`
- [x] T026 [P] [US1] Subset the `@mdi/font` 7.4.47 font to the 37 glyphs the standalone designer names, after reading its licence from the package's own `LICENSE` (research R7), into `etalii.adp.ide.desktop/crates/adp-shell/assets/` with the licence verbatim, and register it with egui in `etalii.adp.ide.desktop/crates/adp-shell/src/theme.rs`
- [x] T027 [US1] Port `layout.ts` and `iconsLayout.ts` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/layout.rs`, with the spec's sizes as constants (research R8)
- [x] T028 [US1] Port `HierarchySurface.tsx`, `HierarchySurfaceBox.tsx`, `CollapseToggle.tsx`, `HierarchySurfaceTrail.tsx` and `FindingList.tsx` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/{mod,box_view}.rs`: the page, boxes as high as what stands to their right with shared borders, the number beside the title, labels below it, the description under them, the one icon list as a row or a column, the title wrapping under the handle with the hanging indent of research R8, levels that fit and the mark of those that do not, focus with the trail (items only, following the selection), collapse, findings, and a read-only page with its reason; colours from `adp-theme`
- [x] T029 [US1] Open a requirement document as a `HierarchyTab` in `etalii.adp.ide.desktop/crates/adp-shell/src/shell.rs`, draining the session's changes each frame as the table tab does, with a test that the web shop opens in the designer and an ordinary `.md` in the Markdown editor
- [x] T030 [US1] Record a script that opens the web shop, collapses `ITEM-0002` and expands it again in `etalii.adp.ide.desktop/parity/scripts/etalii/hierarchical-requirement/collapse.json`, its golden from the standalone host at `a7fdf03`, and its replay test in `etalii.adp.ide.desktop/crates/adp-parity/tests/parity.rs`

**Checkpoint**: Story 1 passes on its own: the MVP.

---

## Phase 5: User Story 2 - A person and an agent work on the same file (Priority: P1)

**Goal**: changes from outside appear, edits against a changed file are refused, undo stops at the outside change (pull request 6).

**Independent Test**: the web shop open in the desktop host and in a text editor; pass 029's Story 2.

- [x] T031 [P] [US2] Port `OutsideChange.Tests.cs`, `Drift.Tests.cs` and `Undo.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/`; see them fail
- [x] T032 [US2] Read the file again on the watcher's news in `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/session.rs` (`file_changed`), keeping collapsed state by number, ending the history, and refusing a gesture planned against a changed file
- [x] T033 [US2] Port `ConflictBar.tsx` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/mod.rs`: the choice between reloading and keeping one's version, and the sentence shown the first time undo meets the end of the history (029: FR-023, FR-025)
- [x] T034 [US2] Record `etalii.adp.ide.desktop/parity/scripts/etalii/hierarchical-requirement/two-writers.json` (an outside change, an edit refused after drift, an undo past the change) with its golden and replay test

**Checkpoint**: Stories 1 and 2 pass: an agent's file can be kept by a person.

---

## Phase 6: User Story 4 - Start a document and shape the hierarchy (Priority: P2)

**Goal**: a new document from the template; adding, dragging and deleting entries (pull request 7).

**Independent Test**: pass 029's Story 4 and compare the created file with the binding's template; Story 4, scenario 2 of this spec.

- [x] T035 [P] [US4] Port `Template.Tests.cs`, `StructureOperations.Tests.cs` and `TextOperations.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/`; see them fail
- [x] T036 [US4] Port `HierarchicalRequirementDocumentTemplate.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/template.rs`, and create a new document from it in `etalii.adp.ide.desktop/crates/adp-add/src/lib.rs`, byte for byte with the file's base name as its title
- [x] T037 [US4] Port `Operations/{StructureOperations,TextOperations,BodyEdit}.cs` and `Commands/*` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/operations/{structure,text,body_edit}.rs` and `src/commands.rs`: `addTopItem`, `addItem`, `addItemBelow`, `addRequirement`, `addRequirementBelow`, `setTitle`, `setDescription`, `moveItem`, `moveRequirement`, `deleteEntry`, each one step of undo on `adp-history`
- [x] T038 [US4] Port `AddControl.tsx`, `EntryTextField.tsx`, `entryEditing.ts`, `useDragEntry.ts` and `ConfirmDelete.tsx` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/editing.rs`: add item and add requirement as icons, the add key from a selected entry named in the host's help, the title field one line high after the number (#707), the description field where its text stood and as high as it, ending short of the icons, a drag by the handle with the drop shown, the delete icon in its kept slot 6 pixels from the bottom on the selected box, a confirmation that names what goes with the entry, and a new entry revealed and selected; with tests that the box height is the same unselected, selected and editing (Story 7, scenario 7)
- [x] T039 [US4] Record `structure.json` (CRLF and an LF copy) and `text.json` in `etalii.adp.ide.desktop/parity/scripts/etalii/hierarchical-requirement/`, and `new-document.json` for the template, with their goldens and replay tests

**Checkpoint**: Story 4 passes; a person can start and shape a document.

---

## Phase 7: User Story 5 - Questions, remarks and warnings stay with what they concern (Priority: P2)

**Goal**: the assessment icon, the notes list and its four gestures (pull request 8).

**Independent Test**: pass 029's Story 5 and this spec's Story 5, scenario 2, beside the standalone host.

- [x] T040 [P] [US5] Port `AssessmentOperations.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/`; see it fail
- [x] T041 [US5] Port `Operations/AssessmentOperations.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/operations/assessments.rs`: `addAssessment`, `changeAssessment`, `resolveAssessment`, `removeAssessment`
- [x] T042 [US5] Port `notes/{NoteIcon,NoteList}.tsx` and `noteMark.ts` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/notes.rs`: the icon of one kind, the one for several, the icon of a collapsed item standing for what it hides, and the list over every pane with each kind's icon, a three-line text field with Add below it on the right, and resolve, change and remove as icons with tooltips, beside a note of several lines and below a note of one
- [x] T043 [US5] Record `assessments.json` with its golden and replay test

**Checkpoint**: Story 5 passes.

---

## Phase 8: User Story 6 - Refer, tag, categorise, set a state, narrow and sort (Priority: P2)

**Goal**: references, tags, categories, states, their lists, the filter with `@` and completion, sort and stored filters (pull request 9).

**Independent Test**: pass 029's Stories 6, 7 and 8 and this spec's Story 6.

- [ ] T044 [P] [US6] Port `References.Tests.cs`, `TagOperations.Tests.cs`, `CategoryStateOperations.Tests.cs`, `FilterOperations.Tests.cs` and `EntrySelection.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/`, and `filterQuery.test.ts`, `FilterBar.test.tsx` (its completion rules) and `reveal.test.ts` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/tests.rs`; see them fail
- [ ] T045 [US6] Port `Operations/{TagOperations,CategoryStateOperations,ListEdit,FilterOperations,RegistrationEdit}.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/operations/{tags,classification,lists,filters,registration}.rs`: the tag, category and state gestures and their lists, and `storeFilter`, `renameFilter`, `removeFilter`
- [ ] T046 [US6] Port `references/{ReferenceLookup,ReferenceBox}.tsx` and `reveal.ts` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/references.rs`: `#` in a description opens the lookup under the field, a reference stands as a box, selecting it shows its target by changing focus and expanding as far as needed without writing the file
- [ ] T047 [US6] Port `labels/{TagField,listEditing}.tsx`/`.ts` and `classification/ClassificationPicker.tsx` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/labels.rs`, reusing the table's option widgets in `etalii.adp.ide.desktop/crates/adp-shell/src/table/header.rs`: a tag with `#`, a category as a badge, a state as a dot, the list editor with an even first column and a preview while an option is dragged
- [ ] T048 [US6] Port `narrowing/{filterQuery,FilterBar,SortMenu}` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/narrowing.rs`: the query with `@` for a state, `item:` with `*` and `?`, `sort:`, the completion from the labels' members, the prefixes, `item:`, `sort:` and the sort keys, Tab or Enter, the arrows and Escape, a stored filter as a gesture, and a finding whose entry is hidden still listed and shown when selected
- [ ] T049 [US6] Record `references.json`, `tags.json`, `classification.json` and `filters.json` with their goldens and replay tests

**Checkpoint**: Story 6 passes.

---

## Phase 9: User Story 7 - The page as the maintainer shaped it (Priority: P2)

**Goal**: column widths, and every point of the feedback of 2026-10-24 checked against the standalone host (pull request 10).

**Independent Test**: [quickstart.md](quickstart.md), "Walk a story by hand", for Story 7's eleven points; a column dragged in both hosts writes the same `.adp`.

- [ ] T050 [P] [US7] Port `ColumnOperations.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/` and `useColumnWidths` and `ColumnEdge` tests into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/tests.rs`; see them fail
- [ ] T051 [US7] Port `Operations/ColumnOperations.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/operations/columns.rs`: `addColumnWidth`, `setColumnWidth`, `resetColumnWidth`, each writing the `widths` block alone and one step of undo
- [ ] T052 [US7] Port `columns/{useColumnWidths,ColumnEdge}` into `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/layout.rs` and `mod.rs`: each column's right edge dragged with every box of that depth following, one gesture on release, a double click or Home resetting, the arrows moving a focused edge by 16 pixels, a refused gesture putting the column back, and the levels that fit counted with the widths
- [ ] T053 [US7] Record `columns.json` with its golden and replay test
- [ ] T054 [US7] Walk Story 7 beside the standalone host at `a7fdf03`, in light and dark, and record the eleven points with screenshots and REQ-0003's three heights in `etalii.adp.ide.desktop/parity/walks.md` (SC-004); a point that differs is fixed in `etalii.adp.ide.desktop/crates/adp-shell/src/hierarchy/` or recorded as a difference in `etalii.adp.ide.desktop/parity/inventory.md`

**Checkpoint**: Story 7 passes; the page is the maintainer's.

---

## Phase 10: Polish & Cross-Cutting Concerns (pull request 11)

- [ ] T055 [P] Expose every box, control, field, list, column edge and the trail to AccessKit with role, name and state in `etalii.adp.ide.desktop/crates/adp-shell/src/a11y.rs`, with tests in the style of the table's (FR-011)
- [ ] T056 [P] Port `LargeDocument.Tests.cs` and `NistControls.Tests.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/tests/` with SC-005's bounds, and add `etalii.adp.ide.desktop/benches/hierarchy.rs` as a bench of `adp-shell` (research R10)
- [ ] T057 [P] Port `ContextActions.Tests.cs`, `HierarchicalRequirementContextActionProvider.cs` and `HierarchicalRequirementEntrySourceResolver.cs` into `etalii.adp.ide.desktop/modules/designers/hierarchical-requirement/src/{context_actions,selection}.rs`, wired into the explorer's and the properties pane's actions in `etalii.adp.ide.desktop/crates/adp-shell/src/`
- [ ] T058 Add the inventory rows of this feature, P-071 onwards, to `etalii.adp.ide.desktop/parity/inventory.md`, one per behaviour with its tests and scripts (FR-009), and their states
- [ ] T059 Walk Stories 1 to 6 beside the standalone host, in both themes and once with a screen reader for Story 1, and record them in `etalii.adp.ide.desktop/parity/walks.md`; set the rows they cover to `checked` (SC-001, SC-006)
- [ ] T060 Update the desktop host's `etalii.adp.ide.desktop/README.md` tool list, and the spec's status line in `etalii.adp/specs/036-desktop-hierarchical-requirement/desktop-hierarchical-requirement.spec.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: none. T001 first; T002 and T003 beside it; T004 after T001.
- **Foundational (Phase 2)**: after Setup. T005 to T008 (pull request 2), then T009 to T013 (pull request 3, with T019 and T020 of US3), then T014 to T018 (pull request 4, with T021). T014 and T015 can start beside pull request 2.
- **US3 (Phase 3)**: its tasks ride in pull requests 3 and 4.
- **US1 (Phase 4)**: after Foundational. The MVP.
- **US2 (Phase 5)**: after US1.
- **US4 (Phase 6)**, **US5 (Phase 7)**, **US6 (Phase 8)**: after US1; in any order, one at a time, since each touches `adp-shell/src/hierarchy/` and the module's `operations/mod.rs`.
- **US7 (Phase 9)**: after US4, whose editing fields its height checks measure.
- **Polish (Phase 10)**: after the stories it covers.

### Within each story

Tests first and seen failing; the module's operations before the view that sends them; the parity script last, since it needs both.

### Parallel opportunities

- T002, T003 beside T001.
- T014 and T015 beside pull request 2.
- In each story, the module's ported tests [P] beside the view's ported tests.
- T055, T056 and T057 beside each other.

## Parallel example: User Story 1

```text
T022 catalogue and routing tests      | T023 layout rule tests | T026 icon font
then T024 → T025, and T027 → T028 → T029, then T030
```

## Implementation Strategy

### MVP first

1. Phase 1 and Phase 2 (pull requests 1 to 4).
2. Phase 4, Story 1 (pull request 5): stop and walk it; a person can read an agent's document in the desktop host.

### Incremental delivery

Pull request 6 (Story 2) makes it a shared file; pull requests 7 to 9 (Stories 4 to 6) add every gesture; pull request 10 (Story 7) is the maintainer's page; pull request 11 closes parity. Each pull request merges on its own with the four checks green, and its tasks are ticked here only once it is merged.

### Requirement coverage

Every spec requirement is claimed: FR-001 by Phases 2 to 9 together (029's FR-001 to FR-032, each traced to its standalone port), FR-002 T022/T024, FR-003 T001, FR-004 T050 to T053, FR-005 T044/T048, FR-006 T023/T027/T028/T038, FR-007 T038/T042/T047/T048, FR-008 T027, FR-009 T030/T034/T039/T043/T049/T053/T058, FR-010 T008/T019, FR-011 T055, FR-012 T014. Success criteria: SC-001 T059, SC-002 T019/T020, SC-003 the replay tests, SC-004 T054, SC-005 T056, SC-006 T059.
