# Tasks: The Hierarchical Requirement Designer in the Standalone Host

**Input**: [plan.md](plan.md), [standalone-hierarchical-requirement-designer.spec.md](standalone-hierarchical-requirement-designer.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md), [contracts/routing-and-adding.md](contracts/routing-and-adding.md), [contracts/pull-request.md](contracts/pull-request.md), [quickstart.md](quickstart.md)

**Scale note.** About sixty files in `etalii.adp.ide.standalone`, in five areas (the FBL library and its corpus, routing and adding, the designer session contracts and wire, a new client library, a new module), delivered as eleven pull requests merged one after another, plus one pull request here before the first and one after the last. Watch two things. Nothing starts before spec 025 is done and the maintainer gives the word, and T001 then corrects every path below. And a few files are extended by several phases: each phase lists them under `Extends:`, and because the phases are pull requests merged in order, no two phases are ever in work at once.

**Tests**: the standalone host requires them with every change, and a guard for a refusal or a defect is seen to fail first. Each story phase opens with its tests.

**Organization**: Phase 1 corrects the paths and takes a baseline. Phase 2 is the three foundational pull requests (the `bullets` family, declared registration blocks, routing by envelope): they block every story. Phases 3 to 10 are one pull request per user story, the three P1 stories first. Phase 11 measures and closes.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story of the specification a task serves

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- Paths are at spec 025's homes where it names one (`ToolRouter`, `DesignerAddOptions`, `EtAlii.Adp.Sessions`, `EtAlii.Adp.Workspace`, `WatchedFile`), otherwise as read at standalone `develop` `b35336639` (research R1). T001 corrects them before any standalone work starts.
- A copy into the conformance corpus is taken unchanged from `etalii.adp` at the commit T001 records, and logged with that commit in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`.

## The host read again (T001)

Read on 2026-10-22 at standalone `develop` `396c776c5`. Spec 025 was not finished then: its M7 rdf tasks, M8 (test consolidation) and M9 were open, and the maintainer chose to start this feature beside it ("Start 029 now"). The corpus copies of this feature are taken from `etalii.adp` `develop` `bee6f1f`, whose FBL specification is at 0.8; the fixtures this feature copies declare 0.7.

Corrected against that reading:

- `IDesignerSessionFactory` lives in `EtAlii.Adp.Sessions` (spec 025 T266), and `Open` takes a `ProjectRoot`, not a path string.
- `NaturalIds.cs` lives in `EtAlii.Adp.TestSupport`, so `DerivedIds.cs` goes beside it there.
- `useTableStream` lives in `src/client/src/designers/`, so `useHierarchySurfaceStream.ts` goes beside it there.
- The FBL loader holds no `KnownMinor`; the newest minor it reads in full is the `LanguageVersion` `Fbl` in `FblDocumentLoader.cs`, at 5.
- A flow that tests one module belongs in that module's test project by spec 025 T251 and T252, so `HierarchySurfaceFlow.Tests.cs` goes to the module's test project, referencing `EtAlii.Adp.TestSupport.Host`. New tests use `TestFolder.Create` and `RepositoryPaths` (T248 to T250).
- A shortcut is a `ContextShortcutDefinition`; `NestedRowToggle` is exported by `src/client/src/table/library/rows/NestedRow.tsx`.
- The corpus already holds fixtures up to FBL 0.8 (`insert-constant-*`), which the library loads with the newer-version warning.

Every other path these files name was found where they name it, or is new.

> **Ticking**: a task whose code lands in `etalii.adp.ide.standalone` is ticked here only once its pull request is merged, in a pull request of this repository. A task of `etalii.adp` is ticked when done.

> **Merging**: every pull request is merged by the maintainer, with a merge commit. A "deliver" task ends when the pull request is open with its four gates and the inspection green. The phase after it starts when it is merged.

---

## Phase 1: Setup

**Purpose**: paths that match the host, and a baseline to compare every later run with.

- [x] **T001** Once spec 025 is done and the maintainer has given the word, read standalone's `develop` again: find every path this file, [plan.md](plan.md), [data-model.md](data-model.md) and the contracts name, correct each one that moved, record the standalone commit and the `etalii.adp` commit the corpus copies are taken from, and deliver that as a pull request here · etalii.adp/specs/029-standalone-hierarchical-requirement-designer/tasks.md

**⟶ Wait for T001's pull request to merge, then:**

- [x] **T002** In a freshly created worktree of standalone `develop`, build once, run the four gates and `bash .github/tools/inspect/inspect.sh`, and note the number of tests and of conformance fixtures as the baseline · etalii.adp.ide.standalone (run, not changed)

---

## Phase 2: Foundational

**Purpose**: the library and routing every story stands on. No story starts before pull request 3 is merged.

### Pull request 1: `features/029-fbl-bullets`

Files: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Bullets/`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/bullets-read/`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/bullets-edits/`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/DerivedIds.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Bullets/BulletsFamily.Tests.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/History/OpenBodyDrift.Tests.cs`

Extends: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblModelTypes.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblDocumentLoader.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Rules/BodyReading.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/History/OpenBody.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/History/SplicedFile.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/ConformanceFixtures.Tests.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`, `etalii.adp.ide.standalone/src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/KnowledgeBody.cs`

**Wave 1, tests first (different files):**

- [x] **T003** [P] Copy `bullets-read/` and `bullets-edits/` with its `no-section/` sub-folder into the corpus in etalii.adp's layout, and log the copy (FR-029; R14) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/bullets-read/
- [x] **T004** [P] Teach the harness FBL 0.7: find `fixture.json` at any depth; read the edit forms `move`, `setting`, `position`, `slot`, `occurrence`, `expectFile` and an `edit` that is a list carrying its `x-operation`; compare `read.elements[].parent`; raise `MinimumFixtures` to the new count (FR-029; R14) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/ConformanceFixtures.Tests.cs
- [x] **T005** [P] Add the stand-in for the derived ids `tag/<name>`, `category/<name>`, `state/<name>`, `filter/<name>` and `assessment/<n>`, beside `NaturalIds.cs` (R14) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/DerivedIds.cs
- [x] **T006** [P] Write the drift guard: an edit planned after the body's bytes changed on disk is refused with the library's sentence and writes nothing. Run it against the code without T009 and keep the failing output (FR-024; R12) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/History/OpenBodyDrift.Tests.cs

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 (different files):**

- [x] **T007** [P] Write the `bullets` reader and writer on `FamilyReader`, mirroring `bullets_of` in `etalii.adp/.github/scripts/validate-examples.py`: sections by their first matching heading at any level, fences never read, setext lines not headings, a tab four columns, every list marker, the continuation slot and the word slots; a new bullet takes its previous sibling's marker and indent, else its next sibling's, else the parent's text column; a move re-indents every non-blank line and splits a tab the shift cuts into; an insert takes the line ending of the line it lands on, with its unit tests · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Bullets/BulletsFamily.cs
- [x] **T008** [P] Add `Family.Bullets`, parse `bullets` in `ParseFamily`, and raise the minor of its `LanguageVersion` `Fbl` from 5 to 7 (FR-029) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblDocumentLoader.cs
- [x] **T009** [P] Check before planning that the body's bytes are those read, refuse with one sentence owned by the library, and replace the module-local sentence in `KnowledgeBody.cs` with it (FR-024; R12) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/History/OpenBody.cs

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T010** Choose the `bullets` reader in `CreateFamily` · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Rules/BodyReading.cs

**⟶ Then:**

- [x] **T011** Run the conformance run: every `bullets-*` step passes and T006 now passes. Plant a wrong byte in one expected splice of a scratch copy outside the corpus, see the run fail at that step, and remove the copy · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests (run, not changed)
- [x] **T012** Deliver pull request 1 by [contracts/pull-request.md](contracts/pull-request.md), with the corrected pages that list the FBL families · etalii.adp.ide.standalone/docs/architecture.md

### Pull request 2: `features/029-fbl-registration-blocks`

Files: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/_Model/RegistrationBlockDeclaration.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/RegistrationCreation.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/registration-blocks/`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Registration/DeclaredBlocks.Tests.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Registration/RegistrationCreation.Tests.cs`

Extends: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblDocumentLoader.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/RegistrationDocument.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/OpenRegistration.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`

**Wave 1, tests first (different files):**

- [x] **T013** [P] Copy `registration-blocks/` into the corpus and log it (FR-028, FR-029) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/registration-blocks/
- [x] **T014** [P] Write the guards for declared blocks: reading goes on past a block the binding does not declare, keeps its bytes and reports `fbl.unknown-block` once at information; a value holding `: ` and a rename to an existing key are refused. Run them against the code without T017 and keep the output (FR-028; US3 scenario 3) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Registration/DeclaredBlocks.Tests.cs
- [x] **T015** [P] Write the guards for creating the registration on first placement: written before the edit is planned, outside the history, the origin line and `body:` only when the base names differ, in the body's dominant line ending; refused with a reason when a different file has that name (FR-004; R4) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Registration/RegistrationCreation.Tests.cs

**⟶ Wait for Wave 1 to finish, then:**

- [x] **T016** Read `registration.blocks` into declarations: name, order `kept` or `ordinal`, keys `names` or `ids`, `history` (FR-028) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/_Model/RegistrationBlockDeclaration.cs

**⟶ Then (different files):**

- [x] **T017** [P] Read the declared blocks, and keep every undeclared one as it is · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/RegistrationDocument.cs
- [x] **T018** [P] Act on `createOnFirstPlacement` (R4) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/RegistrationCreation.cs

**⟶ Wait for T017, then:**

- [x] **T019** Write the declared blocks as the fixtures state: a block absent or complete, its first change writing the whole list with its implicit members; a move in a kept block as insert before remove; ordinal blocks by key; an entry whose id is gone pruned with the next write; a change to a `history: false` block outside the history (FR-028) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Registration/OpenRegistration.cs

**⟶ Then:**

- [x] **T020** Run the conformance run: `registration-blocks` passes and T014 and T015 now pass; plant a wrong byte in a scratch copy and see it fail · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests (run, not changed)
- [x] **T021** Deliver pull request 2 · etalii.adp.ide.standalone (pull request 2)

### Pull request 3: `features/029-envelope-routing`

Files: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/FirstLineCache.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/EnvelopeRouting.Tests.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/DesignerAddOptions.Existing.Tests.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/DeleteEntryCommandHandler.Registration.Tests.cs`

Extends: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/ToolRouter.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/_Model/DesignerRouting.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/DesignerAddOptions.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/Commands/DeleteEntryCommandHandler.cs`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/IDesignerSessionFactory.cs`, `etalii.adp.ide.standalone/src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/KnowledgeSessionFactory.cs`, `etalii.adp.ide.standalone/docs/creating-a-designer-module.md`

**Wave 1, tests first (different files).** Each uses a test designer definition whose binding claims `.md` as shared with a line-1 marker, so that no module is needed yet.

- [x] **T022** [P] Write the routing guards: an enveloped `.md` without a registration routes to the designer with no registration; with an Agent Behavior Modelling registration, the body routes to the designer and that registration to `Unreadable` with the reason; a `.md` without the envelope routes as today; the first line is read up to 1,024 bytes and cached until the file changes (FR-002; R3; [contracts/routing-and-adding.md](contracts/routing-and-adding.md)) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/EnvelopeRouting.Tests.cs
- [x] **T023** [P] Write the add guards: an existing enveloped file is accepted and nothing is written; one without the envelope is refused with the line it needs; a new name writes the body only, with no registration, for a binding that creates it on first placement (FR-003, FR-005; R5) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/DesignerAddOptions.Existing.Tests.cs
- [x] **T024** [P] Write the delete guards: deleting the registration of a type that creates it on first placement keeps the body; the Knowledge designer's cascade is unchanged; deleting a body still deletes its registration (FR-004; R4) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/DeleteEntryCommandHandler.Registration.Tests.cs

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 (different files):**

- [x] **T025** [P] Cache the first line of each file of an extension a designer claims as shared, up to the first line break or 1,024 bytes, dropped when the file changes (R3) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/FirstLineCache.cs
- [x] **T026** [P] Make the registration optional in `DesignerRouted` and `IDesignerSessionFactory.Open`, and adapt the Knowledge designer's factory, which always passes one (R4) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/_Model/DesignerRouting.cs
- [x] **T027** [P] Accept an enveloped existing file without writing, refuse one without the envelope naming the line, and write no registration for a binding with `createOnFirstPlacement` (FR-003, FR-005; R5) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/DesignerAddOptions.cs
- [x] **T028** [P] Keep the body when the registration of such a type is deleted (FR-004) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/Commands/DeleteEntryCommandHandler.cs

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T029** Ask the FBL library's `Router` and `MarkerEvaluator` first, through the cache, before the routers of the three tool kinds; route another tool's registration whose body carries an envelope as `Unreadable` with the reason (FR-002; R3) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/ToolRouter.cs

**⟶ Then:**

- [x] **T030** Correct the module guide: a designer document recognised by its envelope, the optional registration, the delete rule; and the stale opening "No designer exists yet" · etalii.adp.ide.standalone/docs/creating-a-designer-module.md
- [x] **T031** Deliver pull request 3 · etalii.adp.ide.standalone (pull request 3)

**Checkpoint**: the library reads and writes the `bullets` family and declared blocks, and the host routes and adds a document by its envelope. Stories can start.

---

## Phase 3: User Story 3, the host passes the designer's conformance run (Priority: P1)

**Pull request 4**: `features/029-hierarchical-requirement-model`

**Goal**: every fixture of `bullets-read`, `bullets-edits`, `registration-blocks` and `hierarchical-requirement-*` passes, and the module reads a requirement document into its model with its findings.

**Independent Test**: run the conformance run with the FBL 0.7 fixtures in the corpus; plant a wrong byte in one expected result and see the run fail there.

Files: `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/definitions/designers/hierarchical-requirement.des`, `.fbl`, `.md`, `.schema.json`; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-*/`; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/HierarchicalRequirementFixtures.Tests.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/definition/`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/examples/`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/EtAlii.Adp.Designer.HierarchicalRequirement.csproj` and its `.csproj.DotSettings`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementDefinition.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementVocabulary.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementBody.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/_Model/`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/`; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Designer/DedEnvelope.cs`

Extends: `etalii.adp.ide.standalone/.gitattributes`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.slnx`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`, `etalii.adp.ide.standalone/docs/solution-structure.md`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Repository.Tests/ArchitecturePages.Tests.cs`

### Tests

**Wave 1 (different files):**

- [x] **T032** [P] [US3] Copy the four `definitions/designers/hierarchical-requirement.*` files and the twelve `hierarchical-requirement-*` folders, 23 fixtures, into the corpus and log the copy (SC-006; R14) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/specifications/fbl/fixtures/
- [x] **T033** [P] [US3] Write the designer's runner after `KnowledgeFixtures.Tests.cs`, with a planted-defect test after `TheRunnerFailsOnAnAttributeValueOfAnotherType` (US3 scenarios 1 and 2) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/HierarchicalRequirementFixtures.Tests.cs

### Implementation

**Wave 2 (different files):**

- [x] **T034** [P] [US3] Vendor the `.des`, `.fbl` and companion `.md` with `provenance.json` (the etalii.adp commit, a sha256 per file), and add `src/designers/*/definition/*.md -text` (R15) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/definition/
- [x] **T035** [P] [US3] Add `web-shop.md` and `web-shop.adp` with `LICENSE.md` and a `readme.md` saying what they do not demonstrate · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/examples/
- [x] **T036** [P] [US3] Check the envelope's DED version where the Knowledge designer checks its own, moving that check here if it is local to Knowledge: a later version is read-only with the reason, an envelope is never written (FR-031; R6) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Designer/DedEnvelope.cs

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T037** [US3] Create the module project: the definition as embedded resources with `LogicalName`, `InternalsVisibleTo` its tests, its `.csproj.DotSettings`, in the solution; no `Designer.cs` yet, so the type is not offered before it has a page · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/EtAlii.Adp.Designer.HierarchicalRequirement.csproj

**⟶ Then (different files):**

- [x] **T038** [P] [US3] Load the definition lazily, throwing when a resource is missing · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementDefinition.cs
- [x] **T039** [P] [US3] Write the model: the document with its marks, `Item`, `Requirement`, `Assessment`, `Tag`, `Category`, `State`, `Filter`, the findings, one type per file (data-model, The module) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/_Model/
- [x] **T040** [P] [US3] Write the vocabulary by hand from the `.des`, and its test, which reads the `.des` itself, differs in both directions and asserts a count; with the provenance hash test · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/DefinitionConformance.Tests.cs

**⟶ Wait, then:**

- [x] **T041** [US3] Read a requirement document through `OpenBody` and the binding into the model: numbers for `ITEM-NEW` and `REQ-NEW` in memory only, the mark line, every finding of the companion's "What reading reports" at its bullet with every other entry usable, a body without the envelope or not UTF-8 read-only with one finding; opening writes nothing (FR-027) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementBody.cs

**⟶ Then:**

- [x] **T042** [P] [US3] Test the reading: `web-shop.md` reads with exactly its `std.missingId`; each fault of `hierarchical-requirement-faults` gives one finding at one bullet or a read-only document; opening leaves both files' bytes as they were (FR-027; SC-007) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/HierarchicalRequirementBody.Tests.cs
- [x] **T043** [P] [US3] Test that the examples read as their readme says · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Examples.Tests.cs

**⟶ Then:**

- [x] **T044** [US3] Run the conformance run: all 27 fixtures pass, against T002's baseline count; correct a failure in the library of Phase 2, never in the corpus · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests (run, not changed)
- [x] **T045** [US3] Update the solution's page and the counts its test holds · etalii.adp.ide.standalone/docs/solution-structure.md
- [x] **T046** [US3] Deliver pull request 4 · etalii.adp.ide.standalone (pull request 4)

**Checkpoint**: User Story 3 is done: the conformance run passes every fixture of the four groups and fails on a planted defect.

---

## Phase 4: User Story 1, open an agent's requirement document and read it by its structure (Priority: P1) 🎯 MVP

**Pull request 5**: `features/029-hierarchy-surface`

**Goal**: an enveloped `.md` opens in the designer as one page of boxes, collapsible, with focus and its trail.

**Independent Test**: a hand-written requirement document three levels deep, with no registration, beside an ordinary Markdown file and an Agent Behavior Modelling document; open each, and pass 028's User Story 1.

Files: `etalii.adp.ide.standalone/src/api/designers.proto`, `etalii.adp.ide.standalone/src/api/workspace.proto`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/IDesignerSession.cs`, `ITableDesignerSession.cs`, `IHierarchySurfaceSession.cs`; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Designer/HierarchySurfaceModel/`; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Workspace/DesignerService.HierarchySurface.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/HierarchySurfaceFlow.Tests.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Designer.cs`, `ServiceCollection.AddHierarchicalRequirement.cs`, `HierarchicalRequirementSession.cs`, `HierarchicalRequirementSessionFactory.cs`, `HierarchicalRequirementSurfaceMapper.cs`, `HierarchicalRequirementGestures.cs`; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/HierarchicalRequirementSession.Tests.cs`; `etalii.adp.ide.standalone/src/client/src/designers/useHierarchySurfaceStream.ts`; `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx`, `HierarchySurfaceBox.tsx`, `HierarchySurfaceTrail.tsx`, `CollapseToggle.tsx`, `FindingList.tsx`, `hierarchySurface.css` and their tests; `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/client/`

Extends: `etalii.adp.ide.standalone/src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/KnowledgeSession.cs`, `etalii.adp.ide.standalone/src/client/src/table/library/declarativeDesignerModules.test.ts`, `etalii.adp.ide.standalone/src/package-lock.json`, `etalii.adp.ide.standalone/docs/tools.md`, `etalii.adp.ide.standalone/docs/architecture.md`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T047** [P] [US1] Write the flow test: the enveloped document opens in the designer with every entry in the model, the ordinary `.md` in the Markdown editor, the Agent Behavior Modelling document in its diagram; an existing enveloped file added as a designer document is accepted; nothing is written (US1 scenarios 2 to 4) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/HierarchySurfaceFlow.Tests.cs
- [x] **T048** [P] [US1] Write the session tests: the model's ids by the contract (`line/<n>` for an entry without a usable number); collapsing writes only the registration, creating it, outside the undo history, and the entry is collapsed again on reopening; a later DED version opens read-only with the reason (FR-010, FR-031; US1 scenario 5) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/HierarchicalRequirementSession.Tests.cs
- [x] **T049** [P] [US1] Write the page tests: one page and no tree; a box as high as what stands to its right, its requirements above its sub-items, borders shared; number beside the title, tags below, description under; as many levels as fit and the mark on an item that does not fit; focus by the control and by the mark, the trail leading back, nothing sent for focus; a collapsed entry showing number, title, tags and assessment icon only (FR-006 to FR-010) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.test.tsx

### Implementation

**Wave 2 (different files):**

- [x] **T050** [P] [US1] Split the session contract: what both kinds share stays in `IDesignerSession`, the table's members move unchanged to `ITableDesignerSession`, which the Knowledge designer's session implements, and `IHierarchySurfaceSession` is new (FR-032; R8) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/IHierarchySurfaceSession.cs
- [x] **T051** [P] [US1] Write the read model, one type per file, knowing no designer type (FR-032) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Designer/HierarchySurfaceModel/
- [x] **T052** [P] [US1] Add the messages and the `hierarchy_surface` member of [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md) · etalii.adp.ide.standalone/src/api/designers.proto

**⟶ Wait for Wave 2 to finish, then (different files):**

- [x] **T053** [P] [US1] Serve `OpenHierarchySurface`, `CloseHierarchySurface` and `HierarchySurfaceGesture`, sending the whole model on the connection's stream, with `// simplified: whole model per change, measured at 100 items and 500 requirements; send deltas when SC-003's test fails at a larger size` (R8) · etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Workspace/DesignerService.HierarchySurface.cs
- [x] **T054** [P] [US1] Write the module's `Designer.cs` (origin `etalii/hierarchical-requirement`, title `Hierarchical Requirement Designer`, icon `mdi-file-tree-outline`, the `.md` format) and its services, session, factory with the registration optional, the mapper to the read model, and the gesture table with `toggleCollapsed` (FR-001, FR-010) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Designer.cs

**⟶ Wait, then (different files):**

- [x] **T055** [P] [US1] Open and close the stream in one hook, beside `useTableStream`, with a guard that no other file opens it · etalii.adp.ide.standalone/src/client/src/designers/useHierarchySurfaceStream.ts
- [x] **T056** [P] [US1] Draw the page: the boxes, the trail, the focus control and the mark of R10, the collapse control after `NestedRowToggle`, tags with `OptionTag`, the findings list, the read-only reason; colours as theme tokens in both themes, no inline styles (FR-006 to FR-011) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx

**⟶ Then:**

- [x] **T057** [US1] Write the module's client: `register.ts`, the panel mounting the library, `hierarchicalRequirementDefinition.ts` with the note icons and the icon for several; raise `KNOWN_MODULE_CLIENTS` to 2 · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/client/register.ts

**⟶ Then:**

- [x] **T058** [US1] Check in the browser, in both themes, User Story 1 and the faults of SC-007: one finding at one bullet with the rest editable, or a read-only page with one finding; a document written from the companion alone without a finding but `std.missingId` (SC-009); the looks beside the Knowledge designer's (FR-011); record it · etalii.adp.ide.standalone/tests.md
- [x] **T059** [US1] Add the tool's row (kind Designer, origin `etalii/hierarchical-requirement`), the FBL families, the DESL surface kinds `table` and `hierarchy` and DED 0.2 it reads (FR-029, FR-030); the architecture page; retaken screenshots · etalii.adp.ide.standalone/docs/tools.md
- [x] **T060** [US1] Deliver pull request 5 · etalii.adp.ide.standalone (pull request 5)

**Checkpoint**: User Story 1 works on its own: a person opens an agent's file and reads it by its structure.

---

## Phase 5: User Story 2, a person and an agent work on the same file (Priority: P1)

**Pull request 6**: `features/029-two-writers`

**Goal**: an outside change is shown without reopening, an edit against a changed file is refused, the person chooses between reloading and keeping their text, and learns where undo stops.

**Independent Test**: the document open in the designer and in a text editor side by side; 028's User Story 2 with each kind of edit on each side.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/TextOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/RestoreRequirementFilesCommand.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/OutsideChange.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Drift.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Undo.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/LargeDocument.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/EntryTextField.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/ConflictBar.tsx` and their tests

Extends: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementSession.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T061** [P] [US2] Test reading again: an outside change is shown without reopening; collapsed entries kept by number, a collapsed item an agent moved still collapsed; the session's own write and identical bytes raise nothing; a change that makes the file unreadable keeps the last readable model read-only (FR-022; US2 scenario 2) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/OutsideChange.Tests.cs
- [x] **T062** [P] [US2] Test the refusal: a gesture made against a file an agent has since written is refused with the sentence of R10, nothing is written, and the new model is sent (FR-024) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Drift.Tests.cs
- [x] **T063** [P] [US2] Test undo: past an outside change it gives the history stack's `Outdated` message once and writes nothing (FR-025; US2 scenario 3) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Undo.Tests.cs
- [x] **T064** [P] [US2] Test SC-003: a generated document of 100 items and 500 requirements opens, and shows an outside change, each within two seconds · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/LargeDocument.Tests.cs
- [x] **T065** [P] [US2] Test the bar: a new model while a field is open shows it; "Show the file" drops the text; "Keep my text" keeps the field, and committing sends `setTitle` or `setDescription`, refused when the number is gone (FR-023; R11) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/ConflictBar.test.tsx

### Implementation

**Wave 2 (different files):**

- [x] **T066** [P] [US2] Write `setTitle` and `setDescription`, making the model changes and bytes the fixtures state (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/TextOperations.cs
- [x] **T067** [P] [US2] Write the restore of one or two files that returns `CommandResult.Outdated` after an outside change, after Knowledge's `RestoreKnowledgeFilesCommand` (FR-025; R17) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/RestoreRequirementFilesCommand.cs
- [x] **T068** [P] [US2] Write the title and description field and the bar of R10 · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/ConflictBar.tsx

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T069** [US2] Watch the body and the registration through `WatchedFile`, skip the session's own writes and identical bytes, send the whole model again, and close an open assessment list on a re-read (FR-022; R13) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementSession.cs

**⟶ Then:**

- [x] **T070** [US2] Check in the browser, side by side with a text editor, each kind of edit on each side; record it · etalii.adp.ide.standalone/tests.md
- [x] **T071** [US2] Deliver pull request 6 · etalii.adp.ide.standalone (pull request 6)

**Checkpoint**: User Stories 1 and 2 together are the problem spec 028 states, solved.

---

## Phase 6: User Story 4, start a document and shape the hierarchy (Priority: P2)

**Pull request 7**: `features/029-shaping`

**Goal**: a new document from the template; entries added without a dialog, dragged and deleted.

**Independent Test**: 028's User Story 4, then the created file compared with the binding's template.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementDocumentTemplate.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/StructureOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementContextActionProvider.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Template.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/StructureOperations.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/ContextActions.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/AddControl.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/useDragEntry.ts`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/ConfirmDelete.tsx` and their tests

Extends: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/ServiceCollection.AddHierarchicalRequirement.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T072** [P] [US4] Test the template: a new document's file is the binding's template with the file's base name as its title, CRLF, byte for byte, and no registration (FR-005; US4 scenario 2) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/Template.Tests.cs
- [x] **T073** [P] [US4] Test each structure operation against the step of `hierarchical-requirement-structure` and `-edits` that states it, `numbering` and `no-mark` included; `addRequirementBelow` on a top-level requirement refused with its message; an item moved into itself refused; giving a duplicate a new number (FR-026; R17) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/StructureOperations.Tests.cs
- [x] **T074** [P] [US4] Test the two context actions and their `ContextShortcutDefinition`s (FR-012; R10; US4 scenario 3) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/ContextActions.Tests.cs
- [x] **T075** [P] [US4] Test the page: the control at the end of every item adds without a dialog; the key adds directly below, ready for typing; an item dragged with everything in it, a requirement dragged alone; deleting an entry that holds anything or is named asks first (FR-012 to FR-014) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/AddControl.test.tsx

### Implementation

**Wave 2 (different files):**

- [x] **T076** [P] [US4] Write the template through `TemplateWriter.Produce` (FR-005) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementDocumentTemplate.cs
- [x] **T077** [P] [US4] Write `addTopItem`, `addItem`, `addItemBelow`, `addRequirement`, `addRequirementBelow`, `moveItem`, `moveRequirement`, `deleteEntry` and `renumberDuplicate` (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/StructureOperations.cs
- [x] **T078** [P] [US4] Write the context actions `Ctrl+Enter` and `Ctrl+Shift+Enter` (FR-012) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementContextActionProvider.cs
- [x] **T079** [P] [US4] Write the add control after `NewRow`, the drag on `usePointerGesture`, and the confirmation by the `.des` `confirm` of `deleteEntry` (FR-012 to FR-014) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/AddControl.tsx

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T080** [US4] Register the template and the context actions, and map the gestures to the operations · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs

**⟶ Then:**

- [x] **T081** [US4] Check in the browser: create, add by control and by key, drag, delete; compare the created file with the template; record it · etalii.adp.ide.standalone/tests.md
- [x] **T082** [US4] Deliver pull request 7 · etalii.adp.ide.standalone (pull request 7)

**Checkpoint**: a person can start a document as well as continue one.

---

## Phase 7: User Story 5, questions, remarks and warnings stay with what they concern (Priority: P2)

**Pull request 8**: `features/029-assessments`

**Goal**: the icon at an entry's top right, rolling up in a collapsed item, opening the list of its assessments.

**Independent Test**: 028's User Story 5.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/AssessmentOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/AssessmentOperations.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/notes/NoteIcon.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/notes/NoteList.tsx` and their tests

Extends: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurfaceBox.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T083** [P] [US5] Test `addAssessment`, `changeAssessment`, `resolveAssessment` and `removeAssessment` against `hierarchical-requirement-assessments` and `first-assessment`, which appends the section; resolving a line written without a checkbox (FR-026; R17) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/AssessmentOperations.Tests.cs
- [x] **T084** [P] [US5] Test the icon: none shows a way to add the first, one the kind's icon, two of different kinds the icon for several; a collapsed item's icon counts everything inside it; the list names each assessment's entry and adds, changes, removes and resolves (FR-015, FR-016; US5 scenario 2) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/notes/NoteIcon.test.tsx

### Implementation

**Wave 2 (different files):**

- [x] **T085** [P] [US5] Write the four assessment operations (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/AssessmentOperations.cs
- [x] **T086** [P] [US5] Write the icon and the list (FR-015, FR-016) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/notes/NoteList.tsx

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T087** [US5] Map the gestures, and place the icon at the top right of every box · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs
- [x] **T088** [US5] Check in the browser, record it, and deliver pull request 8 · etalii.adp.ide.standalone/tests.md

**Checkpoint**: the discussion with an agent stays with the requirement.

---

## Phase 8: User Story 6, refer to another requirement or item (Priority: P2)

**Pull request 9**: `features/029-references`

**Goal**: `#` opens the lookup, the pick stands as a box, selecting the box shows its target.

**Independent Test**: 028's User Story 6.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/References.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/ReferenceLookup.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/ReferenceBox.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/reveal.ts` and their tests

Extends: `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/EntryTextField.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T089** [P] [US6] Test that a description with a picked reference writes the bytes of `hierarchical-requirement-references`, and that a deleted target leaves the finding of `references/deleted` (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/References.Tests.cs
- [x] **T090** [P] [US6] Test the lookup and the reveal: typing `#` lists the requirements and items of the same document, narrowed by number or title; selecting a box whose target sits in a collapsed item outside the focus changes focus and expands as far as needed, and the Markdown file is not written (FR-017, FR-018; US6 scenario 2) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/reveal.test.ts

### Implementation

**Wave 2 (different files):**

- [x] **T091** [P] [US6] Write the lookup on `SearchList`, opened by `#` (FR-017) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/ReferenceLookup.tsx
- [x] **T092** [P] [US6] Write the box and the reveal: focus to the nearest item that keeps the target in sight, `toggleCollapsed` for each collapsed ancestor, the filter cleared as far as it hides it (FR-018) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/references/reveal.ts

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T093** [US6] Mount the lookup in the description field and the boxes in the description · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/editing/EntryTextField.tsx
- [x] **T094** [US6] Check in the browser, record it, and deliver pull request 9 · etalii.adp.ide.standalone/tests.md

**Checkpoint**: entries name each other, and a person follows a reference in one gesture.

---

## Phase 9: User Story 7, tag items and requirements (Priority: P2)

**Pull request 10**: `features/029-tags`

**Goal**: tags from a list that searches and creates, renames, recolours, reorders and deletes, in the Knowledge designer's looks; a deleted registration loses nothing an agent reads.

**Independent Test**: 028's User Story 7, and the tag field and list beside the Knowledge designer's selection property in both themes.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/TagOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/TagOperations.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/RegistrationDeleted.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/labels/TagField.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/labels/LabelListEditor.tsx` and their tests

Extends: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurfaceBox.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T095** [P] [US7] Test `addTag`, `removeTag`, `renameTag`, `recolourTag`, `moveTag` and `deleteTag` against `hierarchical-requirement-tags` and `-tag-list`; a rename or a delete that writes the `.md` and the `.adp` is one history step that one undo takes back (FR-026; R17) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/TagOperations.Tests.cs
- [x] **T096** [P] [US7] Test deleting the registration: the document stays; reopening creates none until a setting changes; deleted and created again, every tag, category, state, reference and assessment is there; an open page goes on with default colours and order (FR-004; US7 scenario 2; SC-008) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/RegistrationDeleted.Tests.cs
- [x] **T097** [P] [US7] Test the field and the list: searching, creating, renaming, recolouring, reordering, deleting (FR-011) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/labels/TagField.test.tsx

### Implementation

**Wave 2 (different files):**

- [x] **T098** [P] [US7] Write the six tag operations (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/TagOperations.cs
- [x] **T099** [P] [US7] Write the tag field on `SearchList` and the list editor on `OptionsEditor`, reused in place (FR-011; R9) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/labels/TagField.tsx

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T100** [US7] Map the gestures, and put the field below the title · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs
- [x] **T101** [US7] Check in the browser beside the Knowledge designer, in both themes, record it, and deliver pull request 10 · etalii.adp.ide.standalone/tests.md

**Checkpoint**: tags work, and the registration holds only what an agent does not need.

---

## Phase 10: User Story 8, categorise, set a state, narrow and sort (Priority: P3)

**Pull request 11**: `features/029-narrowing`

**Goal**: a requirement's category and state, narrowing by tag, category, state and item pattern, sorting within each item, stored filters.

**Independent Test**: 028's User Story 8.

Files: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/CategoryStateOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/FilterOperations.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/CategoryStateOperations.Tests.cs`, `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/FilterOperations.Tests.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/classification/ClassificationPicker.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/narrowing/FilterBar.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/narrowing/filterQuery.ts`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/narrowing/SortMenu.tsx` and their tests

Extends: `etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/HierarchicalRequirementGestures.cs`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/HierarchySurface.tsx`, `etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/FindingList.tsx`, `etalii.adp.ide.standalone/tests.md`

### Tests

**Wave 1 (different files):**

- [x] **T102** [P] [US8] Test the category and state operations against `hierarchical-requirement-category-state` and `list`, the first of several `category:` words counting (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/CategoryStateOperations.Tests.cs
- [x] **T103** [P] [US8] Test `storeFilter`, `renameFilter` and `removeFilter` against `hierarchical-requirement-filters` (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/FilterOperations.Tests.cs
- [x] **T104** [P] [US8] Test narrowing and sorting: by tag, category, state and an item pattern with `*` and `?` in any case; each remaining requirement shown with the items containing it; sorting by number, title, category or state sends nothing; a finding whose entry a filter hides stays listed and selecting it shows the entry (FR-019 to FR-021; US8 scenario 2) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/narrowing/filterQuery.test.ts

### Implementation

**Wave 2 (different files):**

- [x] **T105** [P] [US8] Write the category and state operations (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/CategoryStateOperations.cs
- [x] **T106** [P] [US8] Write the filter operations (FR-026) · etalii.adp.ide.standalone/src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement/Operations/FilterOperations.cs
- [x] **T107** [P] [US8] Write the category and state picker, with their lists on `LabelListEditor` · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/classification/ClassificationPicker.tsx
- [x] **T108** [P] [US8] Write the filter bar, the query in the notation of DESL section 7.7.3, and the sort menu (FR-019, FR-020) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/narrowing/FilterBar.tsx

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T109** [US8] Map the gestures, mount the bar, and make a selected finding reveal its entry (FR-021) · etalii.adp.ide.standalone/src/client/src/hierarchySurface/library/FindingList.tsx
- [x] **T110** [US8] Check in the browser, record it, and deliver pull request 11 · etalii.adp.ide.standalone/tests.md

**Checkpoint**: every story of the specification works in the host.

---

## Phase 11: Polish and measurement

- [x] **T111** On standalone `develop` after pull request 11, run the four gates, `inspect.sh` and the conformance run, and compare the counts with T002's baseline; SC-003's test and SC-006's run pass · etalii.adp.ide.standalone (run, not changed)
- [x] **T112** Set the tool's state in the catalogue · etalii.adp.ide.standalone/docs/tools.md
- [x] **T113** Write the measurements as they come in: SC-001 as two timed readings of one task on one document, text first, at least a day apart; SC-002 as the share of an agent's changes over the first four weeks read without a finding or a hand repair; SC-004 the maintainer's four weeks on a subject they name; SC-005 if a second person takes it up · etalii.adp/specs/029-standalone-hierarchical-requirement-designer/measurements.md

---

## Dependencies & Execution Order

- **Phase 1**: T001 (a pull request here), then T002.
- **Phase 2**: pull requests 1, 2 and 3, each merged before the next is cut. Pull request 1: Wave 1 (T003 to T006) → Wave 2 (T007 to T009) → T010 → T011 → T012. Pull request 2: Wave 1 (T013 to T015) → T016 → T017 and T018 → T019 → T020 → T021. Pull request 3: Wave 1 (T022 to T024) → Wave 2 (T025 to T028) → T029 → T030 → T031.
- **Phase 3 (US3)**: Wave 1 (T032, T033) → Wave 2 (T034 to T036) → T037 → T038 to T040 → T041 → T042, T043 → T044 → T045 → T046.
- **Phase 4 (US1)**: Wave 1 (T047 to T049) → Wave 2 (T050 to T052) → T053, T054 → T055, T056 → T057 → T058 → T059 → T060.
- **Phase 5 (US2)**: Wave 1 (T061 to T065) → Wave 2 (T066 to T068) → T069 → T070 → T071.
- **Phases 6 to 10 (US4 to US8)**: each Wave 1 of tests → Wave 2 → the mapping task → the browser check and the delivery. They need Phase 5's text field and restore command, and US8's picker uses US7's `LabelListEditor`, so they go in order.
- **Phase 11**: after pull request 11 is merged. T113 goes on over weeks.

Every phase is one pull request and the pull requests are merged in order, so the files under `Extends:` are never changed by two phases at once. Inside a phase, the `[P]` tasks of a wave can go to separate workers.

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T054, T059 |
| FR-002 | T022, T025, T029, T047 |
| FR-003 | T023, T027, T047 |
| FR-004 | T015, T018, T024, T026, T028, T096 |
| FR-005 | T023, T027, T072, T076 |
| FR-006 to FR-009 | T049, T056 |
| FR-010 | T048, T049, T054, T056 |
| FR-011 | T056, T058, T097, T099 |
| FR-012 | T074, T075, T078, T079 |
| FR-013, FR-014 | T075, T079 |
| FR-015, FR-016 | T084, T086 |
| FR-017, FR-018 | T090, T091, T092 |
| FR-019, FR-020 | T104, T108 |
| FR-021 | T104, T109 |
| FR-022 | T061, T069 |
| FR-023 | T065, T068 |
| FR-024 | T006, T009, T062 |
| FR-025 | T063, T067 |
| FR-026 | T066, T073, T077, T083, T085, T089, T095, T098, T102, T103, T105, T106 |
| FR-027 | T041, T042 |
| FR-028 | T013, T014, T016, T017, T019 |
| FR-029 | T003, T004, T007, T008, T010, T032, T044, T059 |
| FR-030 | T059 |
| FR-031 | T036, T048 |
| FR-032 | T050, T051, T053 |
| SC-001, SC-002, SC-004, SC-005 | T113 |
| SC-003 | T064 |
| SC-006 | T011, T020, T033, T044, T111 |
| SC-007 | T042, T058 |
| SC-008 | T096 |
| SC-009 | T058 |
