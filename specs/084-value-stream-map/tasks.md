# Tasks: The Value Stream Map

**Input**: [plan.md](plan.md), [value-stream-map.spec.md](value-stream-map.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/value-stream-document.md](contracts/value-stream-document.md), [quickstart.md](quickstart.md)

**Tests**: not requested as tasks of their own. Every check this feature adds is seen to fail on a planted defect (SC-001): each phase that adds one has a task that plants it by hand, sees the failure and restores the files.

**Organization**: Phase 2 lays the definition's skeleton, which every story needs. Phases 3 to 8 are one per user story, in priority order, each adding to the same definition files what its story needs. Phase 9 closes pull request 2; Phase 10 is the catalogue.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story the task serves (US1 to US6)

## Path conventions

- Every path starts with its repository; the clones sit side by side (`C:\git\adp\<repository>` locally, `/home/user/<repository>` in a cloud session).
- Work on `features/084-value-stream-map` (or the `claude/<name>` branch a cloud session is handed), cut again from `origin/develop` for each pull request after the one before it merges.
- **The checks** are `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp`, `python .github/scripts/licence-check.py` and the Build's `descriptions` job (`atd check`).
- Section numbers are DISL 0.9 and FBL 0.21.

> **Ticking**: a task of `etalii.adp` is ticked when done; T034 to T036 land in other places and are ticked when their pull request is merged or their page is changed.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened. A "deliver" task ends when the pull request is open and its Build is green.

---

## Phase 1: Setup

- [x] **T001** After the pull request carrying this file merges, cut the branch again from `origin/develop`, run the checks and note the validator's count of `ok` lines as the baseline · etalii.adp

---

## Phase 2: Foundational, the definition's skeleton (pull request 2 begins)

**Purpose**: the files every story adds to. Nothing here draws or computes yet.

- [x] **T002** [P] Start `value-stream-map.dis`: `language` (origin `generic/value-stream-map`, id `net.etalii.adp.generic.value-stream-map`, extension `vsm`), the diagram attributes, the node types `Trigger`, `Step`, `Outcome` and the relation types `Flow`, `Alternative`, `Rework` of data-model.md, and `persistence.binding` naming the binding (R1, R11) · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T003** [P] Start the binding `vsm` in the `yaml` family: `claims.extensions` `[".vsm"]`, the rules for `/current/trigger`, `/current/steps/*`, `/current/outcome`, `/current/flows/*` and the same under `/future/`, each writing `state` (R2), and the vocabularies at the root · etalii.adp/definitions/diagrams/value-stream-map.fbl
- [x] **T004** [P] Write the file schema from contracts/value-stream-document.md: required keys, the flow's `share` and `rework` exclusive, durations without months or years · etalii.adp/definitions/diagrams/value-stream-map.schema.json
- [x] **T005** [P] Start the companion: what the diagram is for, the file in full, and *What this diagram does not do* (FR-009) · etalii.adp/definitions/diagrams/value-stream-map.md
- [x] **T006** Add the row to the README's table of diagram types · etalii.adp/definitions/diagrams/README.md
- [x] **T007** Run the checks; plant `origin: generic/value-stream` in the specification and a `.vsm` claimed twice in the binding, see each fail, restore · etalii.adp

**Checkpoint**: the definition loads and validates, empty of behaviour.

---

## Phase 3: User Story 6, a host builds the diagram from its definition (P1)

**Goal**: the definition is complete enough to build from (FR-008). **Independent test**: quickstart steps 1 to 3 pass and fail on each planted defect.

- [x] **T008** [US6] Write the tool description from the specification and binding: `value-stream-map.atd` with `value-stream-map.notation.atd` and `value-stream-map.vsm.atd`, and its `value-stream-map.trace.json` (R12) · etalii.adp/definitions/diagrams/
- [x] **T009** [US6] Write the read fixture over a file with every key, stating the elements and attribute values a reading yields · etalii.adp/specifications/fbl/fixtures/value-stream-map-read/
- [x] **T010** [US6] Plant a description that names an attribute the specification lacks, and a fixture whose expected `state` is wrong; see `atd check` and the validator fail; restore · etalii.adp

---

## Phase 4: User Story 1, draw a value stream as it runs (P1)

**Goal**: trigger, steps and outcome in flow order with times, practices and hand-offs. **Independent test**: spec User Story 1.

- [x] **T011** [US1] Add the notation: the step box with name, activity colour and practice labels, the wait band below it (R8), the trigger and outcome shapes, the flow, alternative and rework edges, and the hand-off marker on a flow whose steps' performers differ (R5) · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T012** [US1] Add the placement binding by flow depth and lane (R8), as functions beside the others · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T013** [US1] Add the toolbox, the step form (FR-002) and the context menus, and the binding's inserts and removals for steps and flows, with the next free id (contract, *Rules*) · etalii.adp/definitions/diagrams/value-stream-map.dis, value-stream-map.fbl
- [x] **T014** [P] [US1] Write the edits fixture: add a step, connect it, set a wait time in hours, remove a flow; each with the bytes it writes (SC-005) · etalii.adp/specifications/fbl/fixtures/value-stream-map-edits/
- [x] **T015** [US1] Update the description and trace for T011 to T013, run the checks, plant a wrong byte in one edit's expected output, see it fail, restore · etalii.adp

---

## Phase 5: User Story 2, see where the stream loses time (P1)

**Goal**: the summary and the marked waits (FR-004, FR-005). **Independent test**: spec User Story 2 against the worked examples.

- [x] **T016** [US2] Add the functions `visits`, `leadTime`, `processTotal`, `flowEfficiency` and `handoffs` with bounded recursion and the budget of 64 steps (R4, R10) · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T017** [US2] Add the derived `Summary` node and the long-wait mark (R9), in the diagram's `unit` · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T018** [US2] Add the findings `vsm.empty-stream`, `vsm.missing-trigger`, `vsm.missing-outcome`, `vsm.second-trigger`, `vsm.second-outcome`, `vsm.unconnected-step`, `vsm.missing-wait`, `vsm.missing-process-time`, `vsm.unmarked-cycle` and `vsm.too-many-steps` with their sentences (data-model.md) · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T019** [P] [US2] Write `restore-service.vsm` (R13) and, in the companion, its totals worked by hand, matching spec User Story 2's scenarios · etalii.adp/definitions/diagrams/examples/restore-service.vsm, value-stream-map.md
- [x] **T020** [US2] Check the functions by hand against T019's table (quickstart step 4); plant a step outside the flow and see `vsm.unconnected-step` stated for it in the companion's walk-through; update description and trace · etalii.adp

---

## Phase 6: User Story 3, compare the current and the future stream (P2)

**Goal**: two states in one file (FR-006). **Independent test**: spec User Story 3.

- [x] **T021** [US3] Add the kept filter `state` with `persist` and `persistence.view.bind` on `view:`, and the operations `createFutureState` (R3), `showState` and `removeFutureState` with its confirmation · etalii.adp/definitions/diagrams/value-stream-map.dis, value-stream-map.fbl
- [x] **T022** [US3] Add the derived `Comparison` node with each figure, both states and the difference · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T023** [P] [US3] Add the future state to `restore-service.vsm` and its comparison to the companion's table · etalii.adp/definitions/diagrams/examples/restore-service.vsm, value-stream-map.md
- [x] **T024** [US3] Add to the edits fixture the bytes `createFutureState` writes for a two-step stream; plant a missing `basedOn`, see it fail, restore; update description and trace · etalii.adp/specifications/fbl/fixtures/value-stream-map-edits/

---

## Phase 7: User Story 4, alternatives and rework (P2)

**Goal**: weighted totals (FR-004). **Independent test**: spec User Story 4.

- [x] **T025** [US4] Add the share and rate forms and the findings `vsm.shares` and `vsm.rework-forward`; refuse a flow with both a share and a rate · etalii.adp/definitions/diagrams/value-stream-map.dis
- [x] **T026** [P] [US4] Write `request-fulfilment.vsm` with an 80/20 alternative and a 10 % rework loop, and its weighted totals by hand in the companion · etalii.adp/definitions/diagrams/examples/request-fulfilment.vsm, value-stream-map.md
- [x] **T027** [US4] Check T016's functions against T026's table by hand; plant shares of 80/30 and see the schema accept and the companion's walk-through name `vsm.shares`; update description and trace · etalii.adp

---

## Phase 8: User Story 5, a person and an agent work on the same map (P2)

**Goal**: an agent writes a valid map from the companion alone (FR-009). **Independent test**: quickstart step 6.

- [x] **T028** [US5] Complete the companion for agents: a legend of every key, the id rule, the duration form, what an agent must not write (`view:`), and the vocabulary findings · etalii.adp/definitions/diagrams/value-stream-map.md
- [x] **T029** [US5] Add the vocabulary constraints `vsm.unknown-activity` and `vsm.unknown-practice` (R7) and the two templates *Six-activity value chain* and *Eight-activity lifecycle* (R7, FR-011) · etalii.adp/definitions/diagrams/value-stream-map.dis
- [ ] **T030** [US5] Give an agent only the companion, have it write a five-step stream, and run the validator on it; record the outcome in the companion's notes · etalii.adp/definitions/diagrams/value-stream-map.md

---

## Phase 9: Polish, and pull request 2

- [x] **T031** Read every file of the definition for text taken from the framework's publications and remove any (FR-011) · etalii.adp/definitions/diagrams/
- [x] **T032** Trace every FR and SC of the specification to the file and string that carries it, or to the host's specification for SC-003 and SC-004, and record the trace at the end of this file · etalii.adp/specs/084-value-stream-map/tasks.md
- [ ] **T033** Deliver pull request 2: run the checks, see the baseline's examples keep their result, open the pull request naming this folder, turn on auto-merge · etalii.adp

---

## Phase 10: The catalogue (pull request 3 and the Notion page)

- [ ] **T034** [P] Add the row *Specified*, Diagram, *Value stream map*, `generic/value-stream-map` to the catalogue, and open its pull request with auto-merge (FR-012) · etalii.adp.ide.standalone/docs/tools.md
- [ ] **T035** [P] Add the diagram's page to the Notion "Tools" database through an agent's own Notion connection: kind Diagram, state Specified, focus areas *Service management* and *Technology assessment* · Notion "Tools"
- [ ] **T036** Tick T001 to T035 as their pull requests merge, and set the specification's status line · etalii.adp/specs/084-value-stream-map/

---

## Dependencies & Execution Order

- Phase 1, then Phase 2 (blocks everything), then Phase 3; Phases 4 and 5 in order (5 computes over 4's flows); Phases 6, 7 and 8 after 5, in any order, but one at a time because they share `value-stream-map.dis`; Phase 9 after all; Phase 10 after pull request 2 merges.
- Within a phase, tasks marked [P] touch different files and can run together.

## What can be cut

User Story 4's weighting (Phase 7) is the first to cut if the review of pull request 2 finds the functions too costly: the totals then ignore shares and rates, and the companion says so.

## Trace of requirements and criteria (T032)

Traced on 2026-11-23 to the file and string that carries each, read back from the artefacts rather than from the tasks above.

| Requirement | Carried by |
|---|---|
| FR-001 | `value-stream-map.dis`: node types `Trigger`, `Step`, `Outcome`; relation types `Flow`, `Alternative` (`share`), `Rework` (`rate`); function `isHandoff` and the edge condition `isHandoff(self)` (a hand-off is derived, not stored) |
| FR-002 | `value-stream-map.dis`: `Step` attributes `name`, `activity`, `practices` (many), `performer`, `processTime`, `waitTime`, `note`; form `step` |
| FR-003 | `value-stream-map.dis`: node types `Activity`, `Practice`; `toolbox.templates` `sixActivities` and `eightActivities`, both `starters`; `value-stream-map.fbl` rules `activity` and `practice` |
| FR-004 | `value-stream-map.dis` functions `visits`, `baseVisits`, `loopFactor`, `leadTime`, `processTotal`, `flowEfficiency`, `handoffs`, `flowTraversals`; derived `Summary`; companion *How the totals are computed* |
| FR-005 | `value-stream-map.dis` function `longWait` and badge `longWait` of `Step` |
| FR-006 | `value-stream-map.dis` enum `State`, kept filter `state`, operations `createFutureState`, `showCurrent`, `showFuture`, `removeFutureState`, derived `Comparison`; binding rules `future*` |
| FR-007 | `value-stream-map.fbl` (`family: yaml`, `unknownKeys` host attributes); fixtures `value-stream-map-read` (save writes the bytes read), `value-stream-map-edits`; companion *Findings* (never a refusal) |
| FR-008 | `definitions/diagrams/value-stream-map.{dis,fbl,schema.json,md,atd,notation.atd,vsm.atd,trace.json}`, `examples/`; language id `net.etalii.adp.generic.value-stream-map`, checked against the origin by `validate-examples.py` |
| FR-009 | companion *Instructions for agents* and *What this diagram does not do* |
| FR-010 | `examples/restore-service.vsm`, `examples/request-fulfilment.vsm`, each with `current` and `future`; companion *Worked examples* |
| FR-011 | T031: no text of the framework's publications in any file; activity and practice names only in `toolbox.templates` and the examples, as editable values |
| FR-012 | T034, T035 (pull request 3 and the Notion page) |
| SC-001 | `validate-examples.py` and the Build's `descriptions` job pass; planted defects seen to fail: the origin (language id check), `.vsm` claimed twice, a fixture's wrong byte, a missing `basedOn` in the future-state fixture, a flow with share and rework in an example, a form field naming no attribute (`atd check`) |
| SC-002 | companion *Worked examples*, worked by hand and recomputed independently of the functions |
| SC-003, SC-004 | carried to the first host's specification (plan, *What is not done here*) |
| SC-005 | fixture `value-stream-map-edits`: each edit's splices touch only the edited value or entry |

