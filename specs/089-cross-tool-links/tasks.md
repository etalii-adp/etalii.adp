# Tasks: Links Between Tools

**Input**: [plan.md](plan.md), [cross-tool-links.spec.md](cross-tool-links.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/link-form.md](contracts/link-form.md), [contracts/resolution.md](contracts/resolution.md), [contracts/language-constructs.md](contracts/language-constructs.md), [quickstart.md](quickstart.md)

**Tests**: not requested as tasks of their own. Every check this feature adds is seen to fail on a planted defect: each phase that adds one has a task that plants it by hand, sees the failure for the right reason and restores the files.

**Organization**: one phase per pull request, in the order of research R12. Phase 2 is FBL 0.23 with the resolution fixture, the foundation every story needs. Phases 3 to 6 are the other languages. Phases 7 to 10 are the four tool types, P1 stories first. Phase 11 closes the feature.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its phase (different files, no dependency on an unfinished task)
- **[US#]**: the user story the task serves (US1 to US7); requirement numbers (FR-###) in brackets at the end of a task

## Path conventions

- Every path starts with its repository; the clones sit side by side.
- Work on `features/089-cross-tool-links` (or a cloud session's `claude/<name>` branch), cut again from `origin/develop` for each pull request after the one before it merges.
- **The checks** are `validate-examples.py`, `atd-grammar.py --check`, `terminology-check.py --name etalii.adp`, `licence-check.py` and the Build's `descriptions` job.
- Section numbers are FBL 0.22, DISL 0.11, DESL 0.4, DED 0.2 and ATD 0.1 as they stand before this feature.

> **Ticking**: tasks of `etalii.adp` when their pull request merges; T060 to T062 (etalii.adp.ide.standalone) when that repository's pull request merges.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened.

> **Shared files**: `FBL-specification.md` and `fbl.schema.json` are changed in Phase 2 only; `validate-examples.py` in Phase 2, and in Phases 7 to 10 only to list fixture rows.

---

## Phase 1: Setup

- [x] **T001** After the pull request carrying this file merges, cut the branch again from `origin/develop`, run the checks and record the validator's count of `ok` lines as the baseline (done: 2725 before Phase 2) · etalii.adp

---

## Phase 2: Foundational, FBL 0.23 and the resolution fixture (pull request 1)

**Purpose**: the one definition of a link (research R1, R3, R11). Blocks every later phase.

- [x] **T002** Make FBL 0.23: the status paragraph (what 0.23 adds; every 0.22 binding keeps its meaning) and the table of contents · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T003** Add section 17.1 *The link*: the ABNF, escaping and examples of [contracts/link-form.md](contracts/link-form.md) [FR-005, FR-006] · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T004** Add sections 17.2 *Workspace and index* and 17.3 *Resolution*, as [contracts/resolution.md](contracts/resolution.md): the root that holds the consuming document, several roots, steps 1 to 4, ids compared by the target type's `compare` [FR-008, FR-009, FR-010, FR-011, FR-012] · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T005** Add section 17.4 *Load-time validation*: steps 0 to 4 as one undoable step, read-only documents unchanged, nothing written when nothing differs, following target changes while open [FR-002, FR-013, FR-014] · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T006** Add section 17.5 *Backlinks* (computed, never stored; the count before a delete) and 17.6 *Findings* with the four codes, severities, messages and fixes, the ambiguous fix re-identifying the other candidates [FR-010, FR-017, FR-018, FR-029] · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T007** Add `document.id` to a binding in section 3.1 and 5.3 (where the body keeps its document id; written with the template and by step 0), and state in 1.3's table that links are FBL's for both kinds [FR-001, FR-007, FR-028] · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T008** [P] Add `document` with `id` to `$defs/Binding` · etalii.adp/specifications/fbl/fbl.schema.json
- [x] **T009** [P] Write the fixture workspace: two knowledge files (one under the name the other had), a mind map, a timeline, a dependency graph, a renamed and moved target, a copy with a new name, a copy with the same name in another folder, a document without an id, a link to a deleted element, a malformed link, a stale cached name and a duplicate element id; the knowledge file in today's form joins in Phase 7 (T041), with a `README.md` saying what it does not demonstrate · etalii.adp/specifications/fbl/fixtures/links-workspace/
- [x] **T010** Write `conformance.json`: per link its expected target path and element id or finding, and per link its text after load (SC-002, SC-003); the (row, related row) pairs of the converted knowledge file are added in Phase 7 (SC-004) · etalii.adp/specifications/fbl/fixtures/links-workspace/conformance.json
- [x] **T011** Extend the validator: parse every link under `definitions/examples/links/` and the fixture against 17.1, replay 17.3 and 17.4 over the fixture and compare with `conformance.json` · etalii.adp/.github/scripts/validate-examples.py
- [x] **T012** Plant three defects by hand, one at a time (a link without `$`; a resolution that tries the name before the id; a copy resolved silently), see each fail with its own message, restore (done: the name-first defect passed at first, because no case told the two orders apart; `knowledge/regions.yaml`, a second file under the first one's old name, was added, after which all three fail) · etalii.adp
- [x] **T013** Run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 3: DED 0.3 (pull request 2)

- [x] **T014** Make DED 0.3: the envelope gains `id` (YAML and JSON key, XML root attribute), the document id of FBL 17 [FR-001] · etalii.adp/specifications/ded/DED-specification.md
- [x] **T015** [P] Add `id` to the envelope in the schema, optional, with FBL 17's pattern · etalii.adp/specifications/ded/ded.schema.json
- [x] **T016** Run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 4: DISL 0.12 (pull request 3)

- [x] **T017** Make DISL 0.12: status paragraph, *Changes from 0.11* · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T018** In 11.5, give `nanoid` the properties `alphabet` (`base36` among them) and `length`, and add `persistence.documentId` with the same rule [FR-001, FR-003] · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T019** Add the attribute type `link` (a string of FBL 17.1), `linkable: { nameProperty }` and `linked: { attribute, shows }` to element types, with how a linked element is drawn (the target's current name, a link badge, `shows` values, a broken mark) and that its own gestures move, connect and delete it [FR-016, FR-023] · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T020** Add the standard action `lookup` (`create`, `as: child | at`, `origins`), and activation of a linked element's badge as navigation to the target with it selected [FR-015, FR-019, FR-020] · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T021** Mark appendix D.2 question 1 answered, pointing at FBL 17 [FR-028] · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T022** [P] Schema: `nanoid`'s `alphabet` and `length`, `documentId`, the `link` type, `linkable`, `linked`, the `lookup` action · etalii.adp/specifications/disl/disl.schema.json
- [x] **T023** [P] A minimal example that declares a linkable type, a linked type and the `lookup` action, and validates · etalii.adp/specifications/disl/minimal-links.dis
- [x] **T024** Plant a `lookup` without `create`, see the schema refuse it, restore; run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 5: DESL 0.5 (pull request 4)

- [x] **T025** Make DESL 0.5: status paragraph; `nanoid` with `alphabet` and `length` in 5.3, and `persistence.documentId` [FR-001, FR-003] · etalii.adp/specifications/desl/DESL-specification.md
- [x] **T026** Add the value type `link`, `linkable: { nameProperty }`, and a relation property's `target` (a document link), `limit` and `backlinkName` [FR-025] · etalii.adp/specifications/desl/DESL-specification.md
- [x] **T027** Add the standard relation picker: type-ahead over the target's linkable rows by name property, chips, "create new row" as one step over two documents (5.4), `limit: one` replacing; and backlinks shown as a column named by `backlinkName` [FR-017, FR-021] · etalii.adp/specifications/desl/DESL-specification.md
- [x] **T028** Point section 4.7's cross-document reference at FBL 17 [FR-028] · etalii.adp/specifications/desl/DESL-specification.md
- [x] **T029** [P] Schema for T025 to T027 · etalii.adp/specifications/desl/desl.schema.json
- [x] **T030** Run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 6: ATD (pull request 5)

- [x] **T031** Add the action `lookup` to the grammar; `link`, `linkable`, `linked` and `documentId` are settings of the constructs that carry their neighbours, with no new construct [FR-027] · etalii.adp/specifications/atd/grammar/
- [x] **T032** Map each new member to its JSON construct in ATD's tables (sections 7.6, 7.10, 7.13 and the canvas section) · etalii.adp/specifications/atd/ATD-specification.md
- [x] **T033** Regenerate the tables and highlighting with `atd-grammar.py`, and see `--check` pass and the keyword probe hold · etalii.adp/specifications/atd/
- [x] **T034** Run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 7: User Story 3, the Knowledge designer (Priority: P1) (pull request 6)

**Goal**: relations become links, picked as in Notion; old files converted once.

**Independent Test**: the relations example (cities and provinces) converts with no related row lost; the picker is stated in the definition.

- [x] **T035** [US3] Declare `documentId` (nanoid, base36, 8), rows `linkable` by the title property, relation properties with `target`, `limit`, `backlinkName` and link cells, replacing `targetFile` and `counterpart` [FR-001, FR-022, FR-025, FR-027] · etalii.adp/definitions/designers/knowledge.des
- [x] **T036** [US3] Binding: the envelope's `id` as `document.id`; read both relation forms, write only the new one [FR-007, FR-026] · etalii.adp/definitions/designers/knowledge.fbl
- [x] **T037** [US3] Companion: rewrite *Relations and the steps that write two files* as links, the picker (FR-021), and the one-time conversion of research R9 with its order and what happens to a target without an id [FR-021, FR-026] · etalii.adp/definitions/designers/knowledge.md
- [x] **T038** [P] [US3] Schema: `id` in the envelope, link cells, the relation's new keys · etalii.adp/definitions/designers/knowledge.schema.json
- [x] **T039** [P] [US3] Tool descriptions and trace with the new members · etalii.adp/definitions/designers/knowledge*.atd, knowledge.trace.json
- [ ] **T040** [P] [US3] Convert the examples `cities.*` to the new form and keep one old-form copy in the fixture (T009) · etalii.adp/definitions/designers/examples/
- [x] **T041** [US3] Add the knowledge rows to `conformance.json`, plant a conversion that drops a cell's second row, see SC-004's comparison fail, restore; run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 8: User Story 1, the Mind map (Priority: P1) (pull request 7, with Phase 11's standalone pull request)

**Goal**: add elements from other documents as linked nodes.

**Independent Test**: the definition declares the linked node and the `lookup` action on a node; a fixture map with a linked node round-trips its `adp-id` and `adp-link`.

- [x] **T042** [US1] Declare `documentId`, nodes `linkable` by `text`, a linked node (`linked` with its `link` attribute), and the `lookup` action with `as: child` in the node's context menu [FR-020, FR-022, FR-024, FR-027] · etalii.adp/definitions/diagrams/mindmap.dis
- [x] **T043** [US1] Companion: the root node's `adp-id`, a linked node as an ordinary Freeplane node with `TEXT` the cached name and attribute `adp-link`, and the plugin contract's two new operations (research R7, R8) [FR-001, FR-024] · etalii.adp/definitions/diagrams/mindmap.md
- [x] **T044** [P] [US1] Example binding: its `doc` names the plugin contract (mindmap.md 3.8) that holds `adp-id` and `adp-link`; the example is declared and FBL 17.2 gives an `xml` binding only a root attribute as its slot, so the document id stays the plugin's (as research R8 says), and the plugin version `^0.2.0` is in mindmap.dis · etalii.adp/specifications/fbl/mindmap.fbl
- [x] **T045** [P] [US1] Tool descriptions and trace · etalii.adp/definitions/diagrams/mindmap*.atd, mindmap.trace.json
- [x] **T046** [US1] Mind map rows in `conformance.json`; run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 9: User Story 4, the Timeline and the Dependency graph (Priority: P2) (pull request 8)

**Goal**: linked elements placed on the canvas.

- [x] **T047** [P] [US4] Timeline: `documentId`, events `linkable` by `label`, `LinkedEvent` with its own `begin`, `end`, `row` and a `link`, the canvas `lookup` with `as: at` [FR-020, FR-022, FR-023, FR-027] · etalii.adp/definitions/diagrams/timeline.dis
- [x] **T048** [P] [US4] Dependency graph: `documentId`, nodes `linkable` by `label`, `LinkedNode` with its own `x`, `row` and a `link`, dependencies allowed to and from it, the canvas `lookup` [FR-020, FR-022, FR-023, FR-027] · etalii.adp/definitions/diagrams/dependency-graph.dis
- [x] **T049** [P] [US4] Example bindings: the top-level `id` as `document.id`, and the rule that reads an `elements` entry with a `link` key as the linked type [FR-001, FR-007] · etalii.adp/specifications/fbl/timeline.fbl, dependency-graph.fbl
- [x] **T050** [P] [US4] Companions: the file shape with `id` and linked entries · etalii.adp/definitions/diagrams/timeline.md, dependency-graph.md
- [x] **T051** [P] [US4] Tool descriptions and traces · etalii.adp/definitions/diagrams/timeline*.atd, dependency-graph*.atd, *.trace.json
- [x] **T052** [US4] Timeline and graph rows in `conformance.json`; run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 10: User Stories 2, 5, 6 and 7 across the four types (pull request 9)

**Goal**: moves, copies, backlinks, broken links and the tool engineer's view, checked across all four.

- [x] **T053** [US2] [US6] Complete `conformance.json` with the cross-type cases (a mind map linking a knowledge row, a timeline linking a graph node, each of the four as a target of each other) and the four findings on each type [FR-009, FR-010, FR-011, FR-012] · etalii.adp/specifications/fbl/fixtures/links-workspace/
- [x] **T054** [US5] State in each of the four companions what "Linked from" lists and where, and that a delete says how many links break [FR-017, FR-018] · etalii.adp/definitions/designers/knowledge.md, definitions/diagrams/{mindmap,timeline,dependency-graph}.md
- [x] **T055** [US6] State in each companion how a broken linked element is drawn (cached name, broken mark) [FR-011] · the same four files
- [x] **T056** [US7] Write the worked workspace for readers: one document of each type linking the others, with a `README.md`; placed beside FBL rather than under `definitions/`, whose `SPEC.md` keeps that folder to shipped tool types and a language's worked examples beside the language, and checked by `validate-examples.py` (every link resolves and is current) · etalii.adp/specifications/fbl/links-example/
- [x] **T057** [US7] Confirm by reading that no other tool type's definition changed, and that every construct the four use is in a language document, not a host [FR-022, SC-007] · etalii.adp
- [x] **T058** Run the checks, open the pull request, turn on auto-merge · etalii.adp

---

## Phase 11: Polish and the standalone bindings

- [x] **T059** Add the four types' link support to the tool catalogue rows and to `docs/terminology.md` (link, linked element, backlink, workspace) · etalii.adp/definitions/*/README.md, docs/terminology.md
- [ ] **T060** [P] Apply T044's binding change to the served mind map binding · etalii.adp.ide.standalone/src/diagrams/mindmap/backend/EtAlii.Adp.Diagram.Mindmap/mindmap.fbl
- [ ] **T061** [P] Apply T049's binding changes to the served timeline and dependency graph bindings · etalii.adp.ide.standalone/src/diagrams/timeline/backend/EtAlii.Adp.Diagram.Timeline/timeline.fbl, src/diagrams/dependency-graph/backend/EtAlii.Adp.Diagram.DependencyGraph/dependency-graph.fbl
- [ ] **T062** Run standalone's four gates, open its pull request naming this feature's folder and the etalii.adp commit, turn on auto-merge · etalii.adp.ide.standalone
- [x] **T063** Trace every FR and SC to the files and strings that satisfy it, read two traces back to their artefacts, and record the result in this file · etalii.adp/specs/089-cross-tool-links/tasks.md

---

## Requirement coverage

Every functional requirement is claimed: FR-001 (T007, T014, T018, T025, T035, T043, T049), FR-002 (T005), FR-003 (T018, T025), FR-004 (no task can claim it: each tool type's existing duplicate-id finding already says it; T053 checks a link to such an id), FR-005 (T003), FR-006 (T003), FR-007 (T007, T036, T049), FR-008 (T004), FR-009 (T004, T053), FR-010 (T004, T006, T053), FR-011 (T004, T053, T055), FR-012 (T004, T053), FR-013 (T005), FR-014 (T005), FR-015 (T020), FR-016 (T019), FR-017 (T006, T027, T054), FR-018 (T006, T054), FR-019 (T020), FR-020 (T020, T042, T047, T048), FR-021 (T027, T037), FR-022 (T035, T042, T047, T048, T057), FR-023 (T019, T047, T048), FR-024 (T042, T043), FR-025 (T026, T035), FR-026 (T036, T037), FR-027 (T031, T035, T042, T047, T048), FR-028 (T007, T021, T028), FR-029 (T006).

T057, read on 2026-11-23: the pull requests of this feature changed the definitions of the knowledge designer (with its examples `cities.*` and `provinces.yaml`), the mind map, the timeline and the dependency graph, and no other tool type's; every construct the four use is in a language document (DISL 4.12 and 9.4, DESL 4.2 and 7.5.1, FBL 17, ATD 7.5, 7.13 and 12.3), and what a host does beyond them, drawing a link mark, the lookup, Linked from, is stated as a host's duty in DISL 4.12 and FBL 17.5, not left to one host.

Success criteria: SC-002 to SC-004 by T010 and T053; SC-007 by T057; SC-001, SC-005 and SC-006 need a host and are carried to each host's specification (plan, *What the checks cannot see*).

## Trace after implementing (T063, 2026-11-23)

Each requirement traced to the file and the string that satisfy it, on `develop` after #807 to #819 and this pull request:

| Requirement | Where it holds |
|---|---|
| FR-001 | `persistence.documentId` `{ strategy: nanoid, alphabet: base36, length: 8 }` in `knowledge.des`, `mindmap.dis`, `timeline.dis`, `dependency-graph.dis`; the slot in `knowledge.fbl` (`"document": { "id": …}`), `timeline.fbl`, `dependency-graph.fbl` (key `id`) and `mindmap.md` 3.8 (`adp-id` on the central topic); DED 0.3 envelope `id` |
| FR-002 | FBL 17.4 step 1, "give the body a document id … in one edit that is one step of the history" |
| FR-003 | `persistence.ids` `nanoid`, `base36`, `8` in the four definitions (the mind map with Freeplane's prefix `ID_`), "kept as written" in each `ids.doc` |
| FR-004 | each type's existing duplicate-id finding; `link.ambiguous-document` for a link to such an id (FBL 17.3 step 4), fixture rows `plan/release.tml` l7 and `knowledge/towns.yaml` hn/p3 |
| FR-005 | FBL 17.1 grammar; `LINK_PATTERN` in `validate-examples.py` |
| FR-006 | FBL 17.1 `text-char` and the reserved characters per part (`LINK_RESERVED`); the narrower escaping awaits Peter's card on link escaping |
| FR-007 | FBL 17 "stored only in the document that holds it"; each binding's link slot (`link` key, `adp-link`, cell `row`, relation `target`) |
| FR-008 | FBL 17.3 workspace, "MUST NOT resolve to a file outside the workspace" |
| FR-009 | FBL 17.3 steps 2 and 3; fixture rows ID_5 (by name) and l1 (by id under another name) |
| FR-010 | FBL 17.6 `link.ambiguous-document` fix "Choose one of the candidates … every other candidate is given a new document id"; fixture `candidates` |
| FR-011 | FBL 17.6 `link.broken-document`, `link.broken-element` with their fixes; the broken mark in the four companions (T055) |
| FR-012 | FBL 17.6 `link.malformed`, "The value is kept as written"; fixture rows on each type |
| FR-013 | FBL 17.4; `after` in every fixture row, compared by `validate-examples.py` |
| FR-014 | DISL 4.12 *Linked* (label is the target's current name, `shows` live); DESL 7.5.1 |
| FR-015 | FBL 17.5 "Activating a link opens the target document … with the target element selected"; DISL 4.12 link mark |
| FR-016 | DISL 4.12 `linked.shows`; ATD 7.5 |
| FR-017 | FBL 17.5 backlinks; *Linked from* in `knowledge.md`, `mindmap.md` 3.8, `timeline.md`, `dependency-graph.md` |
| FR-018 | FBL 17.5 "Before deleting an element that has backlinks, a host MUST say how many links the delete breaks"; the four companions |
| FR-019 | DISL 9.4 action `lookup`; ATD `lookup` statement; `addLinked`, `addLinkedHere` in the three diagrams |
| FR-020 | `mindmap.dis` `lookup … "as": "child"`; `timeline.dis` and `dependency-graph.dis` `lookup … "as": "at"` |
| FR-021 | DESL 7.5.1 relation picker; `knowledge.md` *The relation picker* |
| FR-022 | T057's reading above |
| FR-023 | `LinkedNode extends Node` in the mind map and in the dependency graph, `LinkedPeriod extends Period` and `LinkedMoment extends Moment` in the timeline; DISL 4.12 "Deleting it deletes the link and nothing of the target" |
| FR-024 | `mindmap.md` 3.8 "Its `TEXT` is the name the link caches"; `check_mindmap_linked_text` |
| FR-025 | `knowledge.des` relation `valueType` `link { target, limit, backlinkName }`; `knowledge.schema.json` `Link` |
| FR-026 | `knowledge.md` five conversion steps; `knowledge_convert` and the fixture `cities.yaml` → `cities.converted` |
| FR-027 | `linkable`, `linked`, `documentId` in the four definitions and their `.atd` descriptions; no type shows target attributes (`shows` is empty) |
| FR-028 | FBL 17, referred to by DISL 4.12, DESL 4.2, ATD 7.5 |
| FR-029 | FBL 17.6 table, four codes |
| SC-002, SC-003 | `fixtures/links-workspace/conformance.json`: renamed and moved targets resolve; every copy with one id and name gives `link.ambiguous-document` |
| SC-004 | `check_knowledge_conversions`, seen to fail on a dropped row |
| SC-007 | T057; no host code was written |
| SC-001, SC-005, SC-006 | need a host; carried to each host's specification |

Two traces read back to their artefacts: FR-024 leads to `definitions/diagrams/mindmap.md` line 111, "Its `TEXT` is the name the link caches, so Freeplane shows the name ADP shows", and to `check_mindmap_linked_text` in `validate-examples.py`, which found `ID_3` of the fixture with another text; that is FR-024's own evidence. FR-029 leads to FBL 17.6's table, whose four rows are the codes `link.malformed`, `link.broken-document`, `link.broken-element` and `link.ambiguous-document`, the same four that `conformance.json` names; that is FR-029's own evidence, not another requirement's.

## Dependencies

Phase 2 blocks all. Phases 3 to 6 depend on Phase 2 and may run in any order. Phase 7 needs 3, 5 and 6; Phase 8 and 9 need 4 and 6; Phase 10 needs 7 to 9; Phase 11's T060 to T062 follow Phases 8 and 9.
