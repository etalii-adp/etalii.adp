# Tasks: The SLO Map over OpenSLO

**Input**: [plan.md](plan.md), [openslo-slo-map.spec.md](openslo-slo-map.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/fbl-yaml-stream.md](contracts/fbl-yaml-stream.md), [quickstart.md](quickstart.md)

**Tests**: not requested as tasks of their own. Every check this feature adds is seen to fail on a planted defect: each phase that adds one has a task that plants it by hand, sees the failure and restores the files.

**Organization**: Phase 2 is FBL 0.22 (pull request 2), foundational for everything after it. Phase 3 lays the definition's skeleton. Phases 4 to 8 are one per user story, in priority order. Phase 9 closes pull request 3; Phase 10 is the catalogue.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story the task serves (US1 to US5)

## Path conventions

- Every path starts with its repository; the clones sit side by side.
- Work on `features/085-openslo-slo-map` (or a cloud session's `claude/<name>` branch), cut again from `origin/develop` for each pull request after the one before it merges.
- **The checks** are `validate-examples.py`, `terminology-check.py --name etalii.adp`, `licence-check.py` and the Build's `descriptions` job.
- OpenSLO is read at commit `e0259752f252276485cfa2708dac2db00c2f3464` of `github.com/OpenSLO/OpenSLO`.

> **Ticking**: as spec 084's: tasks of `etalii.adp` when done, T034 to T036 when their pull request merges or their page changes.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened.

> **Shared files**: `FBL-specification.md`, `fbl.schema.json` and `validate-examples.py` are changed in Phase 2 only.

---

## Phase 1: Setup

- [x] **T001** After the pull request carrying this file merges, cut the branch again from `origin/develop`, run the checks and note the validator's count of `ok` lines as the baseline · etalii.adp

---

## Phase 2: Foundational, FBL 0.22 (pull request 2)

**Purpose**: every document of a YAML stream can be bound (research R1).

- [x] **T002** [P] Make FBL 0.22: the status paragraph (what 0.22 adds, that every 0.21 document keeps its meaning), `body.stream` in section 3.2's table, the stream reading in section 4.3, the root insert and document removal in section 6.2, the marker on the first document in section 12.2, and the load-time refusal of `stream` outside the `yaml` family in section 14.1, as [contracts/fbl-yaml-stream.md](contracts/fbl-yaml-stream.md) states · etalii.adp/specifications/fbl/FBL-specification.md
- [x] **T003** [P] Add `stream` to `$defs/Body`, an enum of `first` and `documents`, allowed only with `family: "yaml"`, at the schema's current address · etalii.adp/specifications/fbl/fbl.schema.json
- [x] **T004** [P] Write the fixtures `yaml-stream-read` and `yaml-stream-edits` of the contract, with a binding of their own · etalii.adp/specifications/fbl/fixtures/yaml-stream-read/, yaml-stream-edits/
- [x] **T005** Teach the validator's fixture replay the stream reading, if T004's cases do not already replay · etalii.adp/.github/scripts/validate-examples.py
- [x] **T006** Plant `stream: "documents"` on a `json` binding; see the validator refuse it at load; restore · etalii.adp
- [x] **T007** Plant a removal of the last document that keeps its `---` line in the expected bytes; see the replay fail; restore · etalii.adp/specifications/fbl/fixtures/yaml-stream-edits/
- [x] **T008** Deliver pull request 2: run the checks, see the baseline keep its results, open it naming this folder, turn on auto-merge · etalii.adp

**Checkpoint**: FBL 0.22 on `develop`.

---

## Phase 3: Foundational, the definition's skeleton (pull request 3 begins)

- [x] **T009** [P] Start `openslo-slo.dis`: `language` (origin `openslo/slo`, id `net.etalii.adp.openslo.slo`), the node and relation types of data-model.md, `persistence.binding` and `persistence.typeMap` for names DISL reserves (R11) · etalii.adp/definitions/diagrams/openslo-slo.dis
- [x] **T010** [P] Start the binding: `yaml` family with `stream: "documents"`, `claims` `.yaml` and `.yml`, `shared`, marker `apiVersion: openslo/v1` (R2), one rule per kind by `when`, objectives and inline objects as contained entries, ids by `metadata.name` per kind (R3) · etalii.adp/definitions/diagrams/openslo-slo.fbl
- [x] **T011** [P] Start the companion: what the diagram is for, which OpenSLO version and objects it draws, and what it does not do · etalii.adp/definitions/diagrams/openslo-slo.md
- [x] **T012** Vendor OpenSLO's three `examples/` files and the multi-object samples of `website/docs/specification.md` as the read fixture's inputs, with OpenSLO's `LICENSE` copied verbatim as `LICENSE.md` and a `README.md` recording the repository, commit, source paths and what the corpus does not show; read the licence from that `LICENSE` again before copying (R9) · etalii.adp/specifications/fbl/fixtures/openslo-slo-read/
- [x] **T013** Add the README row; run the checks; plant a second binding claiming `.yaml` without a marker, see it fail, restore · etalii.adp/definitions/diagrams/README.md

---

## Phase 4: User Story 1, read a service's objectives as one picture (P1)

**Goal**: every object an element, every reference a relation, every objective stated (FR-001, FR-004). **Independent test**: spec User Story 1.

- [x] **T014** [US1] Add the relation rules of data-model.md, references and containment alike · etalii.adp/definitions/diagrams/openslo-slo.fbl
- [x] **T015** [US1] Add the functions `windowSeconds`, `targetShare`, `budgetTime`, `budgetSlices` and `budgetText` (R5, R6) · etalii.adp/definitions/diagrams/openslo-slo.dis
- [x] **T016** [US1] Add the notation: one shape per kind, the objective's sentence on its SLO, inline objects joined to their owner and marked, the placeholder `Missing` dashed (R4), and the layout in tiers (R8) · etalii.adp/definitions/diagrams/openslo-slo.dis
- [x] **T017** [US1] State the read fixture's expected elements, relations and attribute values for every input of T012 · etalii.adp/specifications/fbl/fixtures/openslo-slo-read/fixture.json
- [x] **T018** [P] [US1] Write the folder fixture: a Service, its SLIs and its SLOs in three files, read through a registration whose body is the folder (R4) · etalii.adp/specifications/fbl/fixtures/openslo-slo-folder/
- [x] **T019** [US1] Write the companion's budget table for every objective of the fixtures, worked by hand (SC-003); plant a wrong `target` in one expected value, see the replay fail, restore · etalii.adp/definitions/diagrams/openslo-slo.md

---

## Phase 5: User Story 5, a host builds the diagram from its definition (P1)

- [x] **T020** [US5] Write the tool description `openslo-slo.atd`, `openslo-slo.notation.atd` and `openslo-slo.openslo.atd`, and its trace (R12) · etalii.adp/definitions/diagrams/
- [x] **T021** [US5] Run `atd check`; plant a description that names a kind the specification lacks, see it fail, restore · etalii.adp

---

## Phase 6: User Story 2, edit an objective through a form (P1)

**Goal**: byte-preserving edits (FR-002). **Independent test**: spec User Story 2.

- [x] **T022** [US2] Add the forms for Service, SLO, Objective and SLI, the toolbox (a new SLO writes a document with its service and an SLI referenced), and the deletion confirmation that names referring SLOs · etalii.adp/definitions/diagrams/openslo-slo.dis
- [x] **T023** [US2] Add the binding's inserts and removals: a new document at the stream's end, a new objective in `spec.objectives`, the removal of a document with its separator · etalii.adp/definitions/diagrams/openslo-slo.fbl
- [x] **T024** [P] [US2] Write the edits fixture: change a target, change a window, add an SLO, add an objective, remove an SLI; each with the bytes it writes, comments kept · etalii.adp/specifications/fbl/fixtures/openslo-slo-edits/
- [x] **T025** [US2] Plant an expected output that drops a comment; see it fail; restore; update description and trace · etalii.adp

---

## Phase 7: User Story 3, see what is missing or inconsistent (P2)

- [x] **T026** [US3] Add the findings of data-model.md with their codes and sentences (FR-005), and the read-only state for another `apiVersion` (R7) · etalii.adp/definitions/diagrams/openslo-slo.dis
- [x] **T027** [P] [US3] Add one input per finding to the read fixture, each stating the finding and where it stands, and one with a `v2alpha` document · etalii.adp/specifications/fbl/fixtures/openslo-slo-read/
- [ ] **T028** [US3] Plant a finding expected at the wrong element; see it fail; restore; update description and trace · etalii.adp

---

## Phase 8: User Story 4, a person and an agent work on the same file (P2)

- [x] **T029** [US4] Complete the companion for agents: every object's keys, references versus inline, the duration shorthand, the budgeting methods, and `oslo validate` as the check of a written file (R10) · etalii.adp/definitions/diagrams/openslo-slo.md
- [ ] **T030** [US4] Give an agent only the companion, have it write a Service with one SLO and one SLI, run the validator's reading and `oslo validate`; record the outcome in the companion's notes · etalii.adp/definitions/diagrams/openslo-slo.md

---

## Phase 9: Polish, and pull request 3

- [x] **T031** Check that no file of the definition adds a key to OpenSLO's documents, and that a pinned position goes to a registration's layout block only (FR-008, R8) · etalii.adp/definitions/diagrams/
- [x] **T032** Trace every FR and SC to the file and string that carries it, or to the host's specification for SC-004 and SC-005; record the trace at the end of this file · etalii.adp/specs/085-openslo-slo-map/tasks.md
- [x] **T033** Deliver pull request 3: run the checks, open it naming this folder, turn on auto-merge · etalii.adp

---

## Phase 10: The catalogue (pull request 4 and the Notion page)

- [ ] **T034** [P] Add the row *Specified*, Diagram, *SLO map*, `openslo/slo` to the catalogue with its links to openslo.com, and open its pull request with auto-merge (FR-010) · etalii.adp.ide.standalone/docs/tools.md
- [ ] **T035** [P] Add the diagram's page to the Notion "Tools" database through an agent's own Notion connection · Notion "Tools"
- [ ] **T036** Tick the tasks as their pull requests merge, and set the specification's status line · etalii.adp/specs/085-openslo-slo-map/

---

## Dependencies & Execution Order

- Phase 1, then Phase 2 (FBL 0.22 merged before the definition starts), then Phase 3; Phases 4 and 5; then 6, 7 and 8 in any order, one at a time since they share `openslo-slo.dis`; Phase 9; Phase 10 after pull request 3 merges.
- If FBL 0.22 is refused at review, stop: the definition then reads single-document files only, and Phases 3 to 9 are written again with that limit.

## Trace of requirements and criteria (T032)

Traced on 2026-11-23 to the file and string that carries each, read back from the artefacts rather than from the tasks above.

| Requirement | Carried by |
|---|---|
| FR-001 | `openslo-slo.dis`: node types `Service`, `SLO`, `Objective`, `SLI`, `DataSource`, `AlertPolicy`, `AlertCondition`, `AlertNotificationTarget` (attribute `inline` on the inlinable ones), placeholder `Missing`; derived relation types `OfService`, `Measures`, `ReadsFrom`, `AlertsWith`, `OnCondition`, `Notifies`; `openslo-slo.fbl` rules `inlineSli`, `inlineAlertPolicy`, `inlineAlertCondition`, `inlineAlertNotificationTarget` with `parent` |
| FR-002 | `openslo-slo.fbl` binding `openslo` (`body.stream: "documents"`, attribute bindings by OpenSLO key, rule `other` with `readOnly`); fixtures `openslo-slo-edits` (each edit's splices touch only its value or entry; the comments stay, seen to fail when one is dropped) and `openslo-slo-read/*` |
| FR-003 | `openslo-slo.fbl` `claims`: `.yaml`, `.yml`, `shared: true`, marker `{rootKey: apiVersion, value: openslo/v1}`; `validate-examples.py`'s check that a binding claiming a shared extension is `shared` (seen to fail with `shared: false`) |
| FR-004 | `openslo-slo.dis` functions `windowSeconds`, `sliceSeconds`, `targetShare`, `targetText`, `windowText`, `budgetTime`, `budgetSlices`, `budgetText`; the objective's labels; companion *How the error budget is computed* |
| FR-005 | `openslo-slo.dis` `constraints.rules`, codes `openslo.missing-reference` to `openslo.name` with their messages; fixtures `openslo-slo-read/findings-*`, one per code; companion *Findings* |
| FR-006 | `definitions/diagrams/openslo-slo.{dis,fbl,md,atd,notation.atd,openslo.atd,trace.json}`; language id `net.etalii.adp.openslo.slo`, origin `openslo/slo` |
| FR-007 | `definitions/diagrams/vendored/openslo/` (`LICENSE.md` verbatim from OpenSLO's `LICENSE` at `e0259752`, Apache-2.0, re-read at acquisition; `README.md` with commit, source paths and what the corpus does not show); read by `openslo-slo-read/{occurrences,ratio-timeslices,timeslices,low-traffic,specification-samples}` |
| FR-008 | companion *Gaps*; `openslo-slo.dis` `persistence.view.store: ["bounds"]` (pinned positions in the registration's layout block); T031: every key the binding's inserts and skeleton write is OpenSLO's |
| FR-009 | companion *The file, for agents*; T030 (an agent writing from the companion alone) not yet run |
| FR-010 | T034, T035 (pull request 4 and the Notion page) |
| SC-001 | `validate-examples.py` passes; planted defects seen to fail: a wrong target and a wrong owner in a read fixture, a target and a removed file in the folder fixture, a dropped comment in the edits fixture, a shared extension claimed without `shared`, a marker removed from the shared binding; `atd check` in the Build's `descriptions` job (T021) |
| SC-002 | the read, folder and edits fixtures: every document read, each reference's target named; the edits fixture's save writes the bytes read |
| SC-003 | companion *Worked budgets*, worked by hand for every objective of the fixtures |
| SC-004, SC-005 | carried to the first host's specification; SC-005's agent run is T030 |

T021's plant, a form for the kind Budget, was seen to fail in the Build's `descriptions` job (ATD2002, No element type `Budget`) and nothing else did; it was reverted. Not done here: T028 cannot fail mechanically: the repository's validator replays what a fixture reads and writes, not a definition's findings, which only a host evaluates; the findings each `findings-*` fixture states are for that host. `validate-examples.py` was changed after Phase 2, contrary to *Shared files*: the reading check of a YAML stream and of a folder of YAML files (T017, T018, T019) and the check of a shared extension (T013) needed it.
