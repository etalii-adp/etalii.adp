# Tasks: The Hierarchical Requirement Designer

**Input**: [plan.md](plan.md), [hierarchical-requirement-designer.spec.md](hierarchical-requirement-designer.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/requirement-document.md](contracts/requirement-document.md), [contracts/language-changes.md](contracts/language-changes.md), [contracts/tool-type.md](contracts/tool-type.md), [contracts/host-handoff.md](contracts/host-handoff.md)

**Scale note.** About seventy files in five areas of this repository: three specification languages, one designer type's definition and the example validator, delivered as six more pull requests, each merged before the next begins. Watch two things. `FBL-specification.md`, `fbl.schema.json` and `validate-examples.py` are extended by several phases, never by two at once. And nothing here builds the designer, so no task shows what a person sees: that is Phase 15, in another repository.

**Tests**: not requested as tasks of their own. The plan asks instead that every check this feature adds is seen to fail (SC-008): each pull request's phase has one task that plants the named defects by hand, sees the named failures and restores the files.

**Organization**: by the pull requests of the plan's Delivery. Phases 2 to 5 are the three languages. They are foundational: they serve User Story 3 and block everything after them. Phase 6 is the definition (User Story 3). Phases 7 to 13 are one per remaining user story: the fixtures over the designer's binding that state that story's bytes. Phase 14 closes pull request 6. Phase 15 is the hand-off.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story of the specification a task serves (US1 to US8)

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- The work of this repository is done on the branch `features/028-hierarchical-requirement-designer`, in the worktree `etalii.adp/.claude/worktrees/028-hierarchical-requirement-designer`. The branch is cut from `origin/develop` again for each pull request, after the one before it is merged and its branch deleted.
- Section numbers are those of DED 0.1, DESL 0.1 and FBL 0.6. Where a contract leaves a section's number or a property's name to the task, the task settles it and the later tasks follow.
- **The three checks** are `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`.
- A fixture is a folder under `etalii.adp/specifications/fbl/fixtures/` with its `fixture.json` and its input files. Where a story's cases need more than one input, the folder holds one sub-folder per input, as `knowledge-equivalence` does.

> **Ticking**: a task of `etalii.adp` is ticked when done. The tasks of Phase 15 land in `etalii.adp.ide.standalone` and are ticked only after that repository's pull request is merged.

> **Merging**: every pull request is merged by the maintainer, with a merge commit. A "deliver" task ends when the pull request is open and its Build is green. The phase after it starts when the pull request is merged.

> **Shared files**: three files are extended by more than one phase: `etalii.adp/specifications/fbl/FBL-specification.md` and `fbl.schema.json` (Phases 3 and 4) and `etalii.adp/.github/scripts/validate-examples.py` (Phases 2 to 6). Those phases are separate pull requests, merged one after another, so no two are ever in work at once. Each phase opens with `Files:`, what it creates and owns, and `Extends:`, the shared files it adds to. Phases 7 to 13 own fixture folders only and can be handed to separate workers. A worker that finds the binding, the definition or a specification wrong reports it and does not edit a file another phase owns.

> **If a reserved construct is refused** at the review of pull request 3 or 4, stop. [contracts/language-changes.md](contracts/language-changes.md) says what changes, and the phases after it are written again with `/speckit-companion-tasks`.

---

## Phase 1: Setup

**Purpose**: a clean branch and a baseline to compare every later run with. The specification and the plan reached `develop` in pull request 172, and this file follows in a pull request of its own.

- [x] **T001** After the pull request that carries this file is merged, cut the branch again from `origin/develop`, run the three checks and note the validator's count of `ok` lines as the baseline · etalii.adp/.claude/worktrees/028-hierarchical-requirement-designer

---

## Phase 2: Foundational, DED 0.2 (pull request 2)

**Purpose**: DED says where the envelope stands in a Markdown file (FR-060, research R3). The smallest change, and nothing else depends on its review.

Files: `etalii.adp/specifications/ded/DED-specification.md`, `ded.schema.json`, `web-shop.md`. Extends: `etalii.adp/.github/scripts/validate-examples.py`.

**Wave 1: independent (different files):**

- [x] **T002** [P] Make DED 0.2: the header table and the status paragraph (what 0.2 adds, that every 0.1 definition stays valid), a Markdown paragraph in section 2 with the form `<!-- ded: 0.2 designer: <origin> -->` on line 1, `.md` among the shared extensions of section 4 step 1 with the kind of marker a Markdown binding uses, the version check of step 2, and what follows in sections 5 to 8, with `web-shop.md` as second example (FR-060, FR-061) · etalii.adp/specifications/ded/DED-specification.md
- [x] **T003** [P] Let `$defs/Definition` accept `"0.1"` and `"0.2"` for `ded`, at the schema's 0.1 address (research R3, R20) · etalii.adp/specifications/ded/ded.schema.json
- [x] **T004** [P] Write the worked example: the requirement document of research R1, with its envelope on line 1 and its mark line on line 2 (FR-061) · etalii.adp/specifications/ded/web-shop.md

**⟶ Wait for Wave 1 to finish, then:**

- [x] **T005** Teach the validator the Markdown envelope: `is_example` takes a `.md` under `specifications/ded/` that is not the specification document, line 1 is read into `ded` and `designer`, and the result is checked against `$defs/Definition`. A Markdown example without the envelope fails (research R20) · etalii.adp/.github/scripts/validate-examples.py
- [x] **T006** Plant and see fail, then restore: `web-shop.md` with `ded: 0.3` (reported at `ded`), and with line 1 removed (reported as having no envelope) (SC-008) · etalii.adp/specifications/ded/web-shop.md
- [x] **T007** Deliver pull request 2: run the three checks, see every example of the baseline keep its result, commit, push and open the pull request into `develop`, naming this folder, with a green Build (FR-062) · etalii.adp (pull request 2)

**Checkpoint**: DED 0.2 is on `develop` once the maintainer merges.

---

## Phase 3: Foundational, FBL 0.7: the `bullets` family (pull request 3)

**Purpose**: a sixth family that reads list items under named headings, shown on a second tool's file, and the refusal of an edit against a changed file (FR-058, FR-052, research R9 to R11).

Files: `etalii.adp/specifications/fbl/behavior-tree.fbl`, `fixtures/bullets-read/`, `fixtures/bullets-edits/`, `fixtures/behavior-tree-read/`. Extends: `etalii.adp/specifications/fbl/FBL-specification.md`, `fbl.schema.json`, `etalii.adp/.github/scripts/validate-examples.py`.

**⟶ Wait for pull request 2 to be merged, then Wave 1: independent (different files):**

- [x] **T008** [P] Look in `etalii.adp.site` for copies of the DED, DESL or FBL schemas. Record the answer in pull request 3's description, and when a copy exists open an issue in `etalii-adp/etalii.adp.site` that names this folder (plan, What is not done here) · etalii.adp.site
- [x] **T009** [P] Make the document 0.7 and state how the family is read: the header, the status paragraph and sections 2.1 and 2.7, six families in 1.5, `sections` in 3.1, `bullets` in 3.2, and a new section 4.8 with the line kinds, an entry's span, a tab as four columns and what is unbound: a fence, an item in no named section, a statement no rule matches (research R9) · etalii.adp/specifications/fbl/FBL-specification.md

**⟶ Wait for T009 to finish, then one after another (one file):**

- [x] **T010** State the rules of the family: `line` and `within` in section 5.1, the slot `{continuation: true}` in 5.2, `parent` by indentation in 5.5, and the header's `line` matched against line 1 in 5.6 and 7.5, where the family is never unreadable by itself (research R9, R8) · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T011** State how the family is written: the Families column of 6.1, `insert.create` with a heading as text in 6.2, the marker and indentation of a new item in 6.3, a move's bytes re-indented in 5.5 and 6.4, and what 2.4 and 15.1 need (research R9) · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T012** Add to section 7.2 that a host **MUST** compare the body on disk with the bytes an edit was planned against, and on a difference refuse with a reason, write nothing and read the body again. Section 7.3 stays as it is (FR-052, research R11) · etalii.adp/specifications/fbl/FBL-specification.md

**⟶ Wait for T012 to finish, then:**

- [x] **T013** Follow the document in the schema: `"0.7"` for `fbl`, `bullets` in `$defs/Family` and `$defs/Body`, the property that holds `sections`, a rule's `within` and the `continuation` slot (FR-061) · etalii.adp/specifications/fbl/fbl.schema.json

**⟶ Wait for T013 to finish, then Wave 2: independent (different files):**

- [x] **T014** [P] Declare Agent Behavior Modelling's file format as a binding: the keyword in bold with the label after it, Retry's count inside the keyword, a keyword-less item as an implicit Do through a second rule, ids derived from place, notes as continuation lines, and the section appended on the first add. It changes neither that tool's definition nor any host (research R10, User Story 3 scenario 3) · etalii.adp/specifications/fbl/behavior-tree.fbl
- [x] **T015** [P] Add the reading fixture, with a small binding of its own as `insert-empty-yaml` brings `cards.fbl`: the three markers, a tab, continuation lines with a blank line between them, a fenced block, a thematic break, an item outside every named section, a statement a `line` rule matches, and a section that ends at a heading of the same level (FR-061) · etalii.adp/specifications/fbl/fixtures/bullets-read/
- [x] **T016** [P] Add the edits fixture, with a small binding of its own: an add after a previous sibling, before a next sibling and as a first child, a set of a word and of the continuation slot, a remove of an entry with nested items, a move across depths, and a first add into a missing section, each with its undo (FR-061, FR-023) · etalii.adp/specifications/fbl/fixtures/bullets-edits/
- [x] **T017** [P] Let `resolve_names` resolve every `within` to a section its binding declares (FBL section 14.1 step 4) · etalii.adp/.github/scripts/validate-examples.py

**⟶ Wait for Wave 2 to finish, then:**

- [x] **T018** Add the fixture that reads the companion's example tree through `behavior-tree.fbl`, and confirm it shows each of the six things T014 lists. If one cannot be declared, correct the family in the document and the schema before T020. The example is not dropped (research R10) · etalii.adp/specifications/fbl/fixtures/behavior-tree-read/
- [x] **T019** Plant and see fail, then restore: the move step of `bullets-edits` with one column of indentation missing from its expected bytes (reported at its first differing byte), `behavior-tree.fbl` with a `within` that names no section (a name problem), and with `family` misspelt (a schema error) (SC-008) · etalii.adp/specifications/fbl/fixtures/bullets-edits/fixture.json, etalii.adp/specifications/fbl/behavior-tree.fbl
- [x] **T020** Deliver pull request 3: run the three checks, see every earlier example keep its result, commit, push and open the pull request into `develop`, naming this folder and saying that the family is one of the two constructs the decision reserved, with a green Build (FR-062) · etalii.adp (pull request 3)

**Checkpoint**: a second tool's Markdown is read by a declared binding. The family can be refused here without touching what Phase 4 adds.

---

## Phase 4: Foundational, FBL 0.7: declared blocks in the registration (pull request 4)

**Purpose**: a binding names further blocks of the registration, so that a tool type's settings for one document have a home (FR-059, research R12). A pull request of its own, so that this reserved construct can be refused without the family.

Files: `etalii.adp/specifications/fbl/registrations/requirements.adp`, `fixtures/registration-blocks/`. Extends: `etalii.adp/specifications/fbl/FBL-specification.md`, `fbl.schema.json`, `etalii.adp/.github/scripts/validate-examples.py`.

**⟶ Wait for pull request 3 to be merged, then one after another (one file):**

- [x] **T021** State what a declared block is: `registration.blocks` beside `registration.headers` with `order`, `keys` and `history`, the grammar in section 8.1, a value as one line without `: `, an undeclared block kept and reported as `fbl.unknown-block` in 7.4, and the status paragraph (FR-059, research R12) · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T022** State how a declared block is written: the sentence on other view data in 8.3, the blocks in declared order after `layout:` and `identities:` and `createOnFirstPlacement` widened to the first setting in 8.4, a stale entry of a block keyed by ids in 8.5, a move in a kept order as a `remove-entry` and an `insert-entry` in 6.1, a block outside the history in 7.1, the refusal of a value with `: `, and the fixture edit `setting` in 15.3 (research R12, R4, R25) · etalii.adp/specifications/fbl/FBL-specification.md

**⟶ Wait for T022 to finish, then:**

- [x] **T023** Follow the document in the schema: `blocks` in `$defs/RegistrationSettings`, the parsed blocks in `$defs/Registration`, and `setting` in `$defs/Edit` (FR-061) · etalii.adp/specifications/fbl/fbl.schema.json

**⟶ Wait for T023 to finish, then Wave 1: independent (different files):**

- [x] **T024** [P] Add the example registration of research R12, with its five blocks. It is parsed without a binding (FR-061) · etalii.adp/specifications/fbl/registrations/requirements.adp
- [x] **T025** [P] Add the fixture, with a small binding of its own that declares its blocks: the registration created by the first setting, an insert at a place and a move in a kept order, an ordinal order, a stale entry pruned with the next write, a write to a block outside the history, a refused value with `: `, and the undo of each step in the history (FR-061, research R12) · etalii.adp/specifications/fbl/fixtures/registration-blocks/
- [x] **T026** [P] Let `parse_registration` read every block into the parsed form and keep one it does not know, where today it fails the file (research R12, R20) · etalii.adp/.github/scripts/validate-examples.py

**⟶ Wait for Wave 1 to finish, then:**

- [x] **T027** Plant and see fail, then restore: `requirements.adp` with an entry that has no `: ` (reported at its line), and one step of `registration-blocks` with a wrong offset (reported at its first differing byte) (SC-008) · etalii.adp/specifications/fbl/registrations/requirements.adp, etalii.adp/specifications/fbl/fixtures/registration-blocks/fixture.json
- [ ] **T028** Deliver pull request 4: run the three checks, see every earlier example and registration keep its result, commit, push and open the pull request into `develop`, naming this folder and saying that declared blocks are the second reserved construct, with a green Build (FR-062) · etalii.adp (pull request 4)

**Checkpoint**: FBL 0.7 is complete on `develop` once the maintainer merges.

---

## Phase 5: Foundational, DESL 0.2 (pull request 5)

**Purpose**: the five constructs the definition needs and DESL 0.1 cannot state (FR-057, research R13 to R17).

Files: `etalii.adp/specifications/desl/DESL-specification.md`, `desl.schema.json`, `minimal-hierarchy.des`, `minimal-hierarchy.fbl`. Extends: `etalii.adp/.github/scripts/validate-examples.py`.

**⟶ Wait for pull request 4 to be merged, then one after another (one file):**

- [ ] **T029** Make the document 0.2: the header table, the status paragraph (the five constructs, that every 0.1 specification stays valid), `"0.1"` and `"0.2"` in sections 2.7 and 3.1, and section 1.3 where it names FBL (FR-057) · etalii.adp/specifications/desl/DESL-specification.md
- [ ] **T030** Add the facet `mentions` to section 4.3: a regular expression with a group `id` and the element types a mention may name, resolved by id, with the text never changed when an element is deleted, which sets it apart from a reference of 4.7. Add `std.mentions`, a warning, to 6.5 (research R6) · etalii.adp/specifications/desl/DESL-specification.md
- [ ] **T031** Add the id strategy `counter` to section 5.3: `prefix`, `digits`, `mark` and `placeholder`, a new id as one more than the higher of the mark and the highest number read, a missing mark, the exception to "**MUST NOT** decode" in 5.3.1, and in 5.3.4 the placeholder as a missing id and the offer of the next number on a duplicate (research R5, R25) · etalii.adp/specifications/desl/DESL-specification.md
- [ ] **T032** Add `persistence.settings` to section 5 in its two forms, a list (`type`, `key`, `value`, `initial`) and a state (`attribute`, `of`): an edit of the registration in the transaction of the body's change, a block absent or complete, an id from the key, and only a value that differs from the default stored (FR-059, research R13) · etalii.adp/specifications/desl/DESL-specification.md
- [ ] **T033** Add the surface kind `hierarchy`: `kind` in section 7.1, and a new section with the seven roles (`levels`, `entries`, `labels`, `notes`, `collapsed`, `filters`, `ids`), the six layout rules every host draws, implicit members, and the words of a filter's `query` with how they combine (research R14, R17) · etalii.adp/specifications/desl/DESL-specification.md
- [ ] **T034** Add the action `move` to section 8.2 (an element, a new `parent`, an optional `slot`, `after` or `before` a sibling, planned as FBL's `move`), the name checks of the new kind to 10.1 step 4, and the surface kinds a host states to section 11 (FR-023, research R15, R16) · etalii.adp/specifications/desl/DESL-specification.md

**⟶ Wait for T034 to finish, then:**

- [ ] **T035** Follow the document in the schema: `"0.2"` for `desl`, `$defs/Surface` as one shape per `kind` with definitions for the roles, `mentions` in `$defs/Attribute`, `counter` in `$defs/IdStrategy` and `$defs/IdRule`, `settings` in `$defs/Persistence`, and `move` in `$defs/Action` (FR-061) · etalii.adp/specifications/desl/desl.schema.json

**⟶ Wait for T035 to finish, then Wave 1: independent (different files):**

- [ ] **T036** [P] Write the worked example beside `minimal-table.des`: one level type and one entry type with counted ids, a label list kept in a settings block, a mention, a note type and a `move` operation (FR-061, research R16) · etalii.adp/specifications/desl/minimal-hierarchy.des
- [ ] **T037** [P] Write its binding in the `bullets` family, with the mark line as a statement and the declared blocks its settings name (FR-061) · etalii.adp/specifications/desl/minimal-hierarchy.fbl
- [ ] **T038** [P] Let `resolve_desl` branch on `surface.kind`: for `hierarchy` it resolves every type and attribute a role names, the types of each `mentions`, the document attribute of each `mark`, and each settings block to a block the binding declares (research R20, DESL section 10.1) · etalii.adp/.github/scripts/validate-examples.py

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T039** Plant and see fail, then restore: `minimal-hierarchy.des` with `surface.levels` naming a type its metamodel does not declare (reported at that path), with a settings block its binding does not declare, and with a `mark` that names no document attribute (SC-008) · etalii.adp/specifications/desl/minimal-hierarchy.des
- [ ] **T040** Deliver pull request 5: run the three checks, see `minimal-table.des` and `knowledge.des` keep their result, commit, push and open the pull request into `develop`, naming this folder and the three constructs FR-057 first left out, with a green Build (FR-062) · etalii.adp (pull request 5)

**Checkpoint**: the three languages can state the definition. Story work starts here.

---

## Phase 6: User Story 3, a host builds the designer from its definition (Priority: P1, pull request 6 begins)

**Goal**: the designer type is defined completely enough that a host builds it from these files alone, and an agent writes a valid requirement document from the companion alone (FR-056).

**Independent Test**: run the validator on the definition and its examples with one defect planted at a time, and validate a document an agent wrote from the companion only.

Files: `etalii.adp/definitions/designers/hierarchical-requirement.des`, `hierarchical-requirement.fbl`, `hierarchical-requirement.md`, `hierarchical-requirement.schema.json`, `examples/web-shop.md`, `examples/web-shop.adp`. Extends: `etalii.adp/.github/scripts/validate-examples.py`.

### Implementation

**⟶ Wait for pull request 5 to be merged, then Wave 1: independent (different files):**

- [ ] **T041** [P] [US3] Write the binding `markdown`: the family, the claim of `.md` with the envelope as marker, the required header, the sections `Requirements` and `Assessments`, the rules for an item, a requirement and an assessment with their trailing words and continuation slot, the mark line as a statement, and the five declared blocks with `createOnFirstPlacement` ([contracts/tool-type.md](contracts/tool-type.md), Persistence) · etalii.adp/definitions/designers/hierarchical-requirement.fbl
- [ ] **T042** [P] [US3] Write the schema of the JSON form a requirement document is read into: the envelope's two values, the two marks, `items` nested to any depth with their `requirements`, and `assessments`, refining DED's `$defs/Definition` (research R20, R25) · etalii.adp/definitions/designers/hierarchical-requirement.schema.json

**⟶ Wait for T041 to finish, then:**

- [ ] **T043** [US3] Add the template to the binding, with CRLF: the envelope, the mark line, the title `{base}`, the legend with its examples in a fenced block, the five top items with at most three requirements each and one sub-item under two of them, numbers written out, and an empty `Assessments` section (FR-006, FR-007, research R19) · etalii.adp/definitions/designers/hierarchical-requirement.fbl

**⟶ Wait for T043 to finish, then Wave 2: independent (different files):**

- [ ] **T044** [P] [US3] Write the DESL 0.2 specification: the label `Hierarchical Requirement Designer`, the seven types with the attribute names of research R25, the enumerations of colours and of assessment kinds with their icons, counted ids with `missing: "assign"`, the settings, the constraints, the `hierarchy` surface with every role, and one operation per gesture of [contracts/tool-type.md](contracts/tool-type.md) · etalii.adp/definitions/designers/hierarchical-requirement.des
- [ ] **T045** [P] [US3] Write the example document: a web shop three levels deep, with all three markers, descriptions, tags, categories and states, a reference, a `REQ-NEW` entry, assessments of each kind with one resolved, and a legend whose fenced examples are not read · etalii.adp/definitions/designers/examples/web-shop.md
- [ ] **T046** [P] [US3] Write its registration, with all five blocks · etalii.adp/definitions/designers/examples/web-shop.adp
- [ ] **T047** [P] [US3] Add the designer to the validator: a `.md` under `definitions/designers/examples/` is an example, a reader takes a requirement document into the JSON form of T042, and a check reports what reading would report: an unreadable bullet, a duplicate number, a mention or an assessment that names nothing, a requirement out of place. The DED example of T004 now reads through it too (research R20) · etalii.adp/.github/scripts/validate-examples.py

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T048** [US3] Write the companion: everything a person or an agent needs to write a valid requirement document from it alone, the mapping to the JSON form, the known limit of a title's last word, the looks taken from the Knowledge designer, and what DESL cannot express (FR-021, SC-007) · etalii.adp/definitions/designers/hierarchical-requirement.md
- [ ] **T049** [US3] Give a worker the companion and nothing else, ask it for a requirement document with an item, two requirements, a tag, a reference and an assessment, and run the validator's reader on the result. Correct the companion until the result reads without a finding. The document is not kept (SC-007, User Story 3 scenario 2) · etalii.adp/definitions/designers/hierarchical-requirement.md
- [ ] **T050** [US3] Plant in `web-shop.md` and see fail, one at a time, then restore: a bullet with an unknown prefix, a second `REQ-0001`, `[REQ-0999]` in a description, an assessment about `ITEM-0999`, a requirement at the top level, a bullet under a requirement, and no envelope. Plant in `hierarchical-requirement.des` a role that names an undeclared attribute (SC-005, SC-008) · etalii.adp/definitions/designers/examples/web-shop.md, etalii.adp/definitions/designers/hierarchical-requirement.des

**Checkpoint**: the definition validates, and a document written from the companion alone reads without a finding. Each phase from 7 to 13 can now start, in any order or at once.

---

## Phase 7: User Story 1, read the requirements of a subject by its structure (Priority: P1)

**Goal**: what a host reads from a document an agent wrote, and what it keeps of the collapsed state, is stated in bytes.

**Independent Test**: the validator replays both fixtures.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-read/`, `hierarchical-requirement-collapsed/`.

### Implementation

**Wave 1: independent (different files):**

- [ ] **T051** [P] [US1] Add the reading fixture: a document three levels deep whose items hold requirements at every depth, with descriptions, every marker and the author's text between the parts, read into its elements with their parents, and a document with no `Requirements` heading, read as empty with no finding (FR-008, FR-055) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-read/
- [ ] **T052** [P] [US1] Add the fixture for the `collapsed` block: the first collapse creates the registration, entries stand in ordinal order, an expand removes its entry, an entry whose number is not in the model is pruned with the next write, and no step joins the history (FR-020, research R12) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-collapsed/

**Checkpoint**: a host's conformance run can show User Story 1's reading.

---

## Phase 8: User Story 2, a person and an agent work on the same file (Priority: P1)

**Goal**: every fault an agent can leave has its finding, and an edit changes only the bytes it concerns.

**Independent Test**: the validator replays both fixtures.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-faults/`, `hierarchical-requirement-edits/`.

### Implementation

**Wave 1: independent (different files):**

- [ ] **T053** [P] [US2] Add the faults fixture: one document with every fault of the table "What reading reports" in [contracts/requirement-document.md](contracts/requirement-document.md), each read with its one finding and every other entry read as usual, and a file without its envelope, read as unreadable with one `std.unparseable` finding (FR-053, FR-054, SC-005) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-faults/
- [ ] **T054** [P] [US2] Add the edits fixture: a save without an edit has no splice, a change of one title splices that entry only, an edit while an entry is `REQ-NEW` numbers it in the same edit and rewrites the mark line, a missing mark line is written again with the next numbering, and a duplicate is given the next number (FR-013, FR-014, FR-025, SC-004) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-edits/

**Checkpoint**: a host's conformance run can show User Story 2's bytes.

---

## Phase 9: User Story 4, start a document and shape the hierarchy (Priority: P2)

**Goal**: a new document and every change of the hierarchy's shape are stated in bytes.

**Independent Test**: the validator replays both fixtures.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-new/`, `hierarchical-requirement-structure/`.

### Implementation

**Wave 1: independent (different files):**

- [ ] **T055** [P] [US4] Add the fixture that reads the template through its binding with no finding of severity warning or above, as `agent-activity-new` does, and counts its levels and its requirements against FR-007 (FR-006, FBL section 13) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-new/
- [ ] **T056** [P] [US4] Add the structure fixture: a requirement added below a selected one with its sibling's marker and indentation and its number from the mark, a sub-item added after the item's last child, the first item in a file without the heading, an item with everything in it moved across depths with no number changed, a delete, and an add undone with the mark restored. The mark starts above the highest number in the file, so the new number shows that a deleted one is not given again (FR-010, FR-011, FR-012, FR-022, FR-023, SC-003) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-structure/

**Checkpoint**: a host's conformance run can show User Story 4's bytes.

---

## Phase 10: User Story 5, questions, remarks and warnings stay with what they concern (Priority: P2)

**Goal**: an assessment is read and written the same by an agent and a person.

**Independent Test**: the validator replays the fixture.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-assessments/`.

### Implementation

- [ ] **T057** [US5] Add the assessments fixture: the four kinds read in any case, one about an item with no requirements, a checkbox left out, a detail, the first assessment appending the section at the end of the file, an add, a change, a resolve and a reopen as one `replace-value` of one character each, a remove, and an assessment whose entry is gone, kept and read with `std.mentions` (FR-032 to FR-035, FR-038, FR-039) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-assessments/

**Checkpoint**: a host's conformance run can show User Story 5's bytes.

---

## Phase 11: User Story 6, refer to another requirement or item (Priority: P2)

**Goal**: a reference is text that the designer reads and never rewrites.

**Independent Test**: the validator replays the fixture.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-references/`.

### Implementation

- [ ] **T058** [US6] Add the references fixture: mentions read in a description and in an assessment's text and detail and not in a title, a link with a target read as no mention, a description set with `[REQ-0002]` in it, a referred requirement moved with every reference unchanged, and a referred requirement deleted with the reference's text kept and `std.mentions` read afterwards (FR-041, FR-043, FR-044, SC-003) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-references/

**Checkpoint**: a host's conformance run can show User Story 6's bytes.

---

## Phase 12: User Story 7, tag items and requirements (Priority: P2)

**Goal**: the tags an entry carries are in the file, and their colours and order are not.

**Independent Test**: the validator replays both fixtures, and the Markdown file of the second has no splice.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-tags/`, `hierarchical-requirement-tag-list/`.

### Implementation

**Wave 1: independent (different files):**

- [ ] **T059** [P] [US7] Add the tags fixture over the Markdown file: a tag set on an item and on a requirement, written before the category and the state, a space typed in a name written as `-`, a tag removed from one entry, a tag carried by several entries renamed in one edit, and a tag deleted from every carrier in one edit (FR-026, FR-027, FR-028) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-tags/
- [ ] **T060** [P] [US7] Add the tag-list fixture over the registration: a document without a registration read with its tags as implicit members in order of first appearance, the first recolour creating the registration with the whole list, a recolour, a reorder as a `remove-entry` and an `insert-entry`, and a rename and a delete of the member's entry, with no splice in the Markdown file for a colour or a place (FR-005, FR-029, FR-049, SC-006) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-tag-list/

**Checkpoint**: a host's conformance run can show User Story 7's bytes.

---

## Phase 13: User Story 8, categorise, set a state, narrow and sort (Priority: P3)

**Goal**: a category, a state and a stored filter are stated in bytes. Narrowing and sorting write nothing, so no fixture states them: DESL does, in T033. This phase is the first to cut if the feature has to shrink.

**Independent Test**: the validator replays both fixtures.

Files: `etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-category-state/`, `hierarchical-requirement-filters/`.

### Implementation

**Wave 1: independent (different files):**

- [ ] **T061** [P] [US8] Add the category and state fixture: each set on a requirement and written after the tags, a second `category:` word read as not counting and kept as written, a state changed, both removed, a category renamed on every carrier in one edit, and the first change of a list writing the initial members with it (FR-030, FR-031) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-category-state/
- [ ] **T062** [P] [US8] Add the filters fixture over the registration: a filter stored with its sorting, a second one after it, one renamed, one removed, each a step of the history, and a name or a query with `: ` refused (FR-048, FR-049) · etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-filters/

**Checkpoint**: every case of "Examples and fixtures" in [contracts/tool-type.md](contracts/tool-type.md) is stated by a fixture.

---

## Phase 14: Polish, and pull request 6

**Purpose**: the prose that names the designer formats, the check of everything against the success criteria this repository can show, and the delivery of the definition.

Files: `etalii.adp/definitions/designers/README.md`, `etalii.adp/CLAUDE.md`, `etalii.adp/README.md`, `etalii.adp/docs/terminology.md`.

**⟶ Wait for Phases 6 to 13 to finish, then Wave 1: independent (different files):**

- [ ] **T063** [P] Add the designer's row, and say that a designer's document may be Markdown with its envelope on line 1 · etalii.adp/definitions/designers/README.md
- [ ] **T064** [P] Name Markdown among the formats of a designer type's example documents, where "Writing specifications" describes what the validator checks · etalii.adp/CLAUDE.md
- [ ] **T065** [P] Say in the designer's row what a DED definition's file may be, where the table names `.ded` · etalii.adp/README.md
- [ ] **T066** [P] Say the same where the glossary names the designer's definition file · etalii.adp/docs/terminology.md

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T067** Walk the twelve cases of "Examples and fixtures" in [contracts/tool-type.md](contracts/tool-type.md) and FR-001 to FR-063, and confirm that a fixture step, a section or an operation states each. What nothing states becomes a correction in the phase that owns the file, or a line for T070, and is listed in pull request 6's description (SC-003 to SC-007) · etalii.adp (pull request 6's description)
- [ ] **T068** Run the three checks. Then plant a wrong offset in one step of one `hierarchical-requirement-*` fixture, see the validator fail at that byte, and restore it (SC-008) · etalii.adp/.github/scripts/ (run, not changed)
- [ ] **T069** Deliver pull request 6: commit, push and open the pull request into `develop`, naming this folder, with a green Build · etalii.adp (pull request 6)

**Checkpoint**: the definition is on `develop` once the maintainer merges. Everything this repository delivers is done.

---

## Phase 15: The hand-off (pull request 7, in the standalone host)

**Purpose**: the designer is built first in the standalone host, which plans with spec-workflow in its own repository (FR-063). This phase waits for two things: pull request 6 merged, and spec 025-standalone-code-structure done with the maintainer's word to start.

Files: `etalii.adp.ide.standalone/.spec-workflow/specs/hierarchical-requirement-designer/`.

- [ ] **T070** Write the host's spec-workflow specification from the merged definition and [contracts/host-handoff.md](contracts/host-handoff.md): what the host builds, what it settles, the five success criteria only it can show (SC-001, SC-002, SC-009, SC-010, SC-011), the user-facing requirements FR-015 to FR-024, FR-036, FR-037, FR-040, FR-042, FR-045 to FR-047 and FR-050 to FR-052, and the conformance it declares · etalii.adp.ide.standalone/.spec-workflow/specs/hierarchical-requirement-designer/requirements.md
- [ ] **T071** Open the pull request in `etalii.adp.ide.standalone`, naming this folder and the etalii.adp commit of the merged definition. Tick T070 and this task once it is merged · etalii.adp.ide.standalone (pull request 7)

**Checkpoint**: the standalone host has its own specification of the designer, and this feature is complete.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** waits for the pull request that carries this file.
- **Foundational (Phases 2 to 5)** run in this order, each after the pull request of the phase before it is merged: DED 0.2, the `bullets` family, declared blocks, DESL 0.2. DESL's worked example needs both FBL changes. No story work begins before pull request 5 is merged.
- **User Story 3 (Phase 6)** needs all three languages. It blocks Phases 7 to 13, which replay fixtures over its binding.
- **Phases 7 to 13** need Phase 6 and nothing of each other. Each owns its fixture folders, so they can run at once, one worker per phase.
- **Polish (Phase 14)** needs Phases 6 to 13 and ends with pull request 6.
- **The hand-off (Phase 15)** needs pull request 6 merged, spec 025 done and the maintainer's word.

### Waves within each phase

- **Phase 1**: T001 alone.
- **Phase 2**: T002, T003 and T004 at once, then T005, T006, T007 in order.
- **Phase 3**: T008 and T009 at once. T010, T011 and T012 follow T009 in order, one file. Then T013. Then T014 to T017 at once. Then T018, T019, T020 in order.
- **Phase 4**: T021, T022 in order, one file. Then T023. Then T024, T025 and T026 at once. Then T027, T028.
- **Phase 5**: T029 to T034 in order, one file. Then T035. Then T036, T037 and T038 at once. Then T039, T040.
- **Phase 6**: T041 and T042 at once. Then T043, which adds to T041's file. Then T044 to T047 at once. Then T048, T049, T050 in order.
- **Phases 7, 8, 9, 12, 13**: the two tasks of each at once.
- **Phases 10, 11**: one task each.
- **Phase 14**: T063 to T066 at once, then T067, T068, T069 in order.
- **Phase 15**: T070, then T071.

### What can be cut

Phase 13 first, as the specification says of User Story 8. Cutting the story itself is a change to the specification first, and then takes its parts out of T033, T044 and T048 as well.
