# Tasks: The Post-Incident Review Designer

**Input**: [plan.md](plan.md), [post-incident-review-designer.spec.md](post-incident-review-designer.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/review-document.md](contracts/review-document.md), [contracts/desl-sections-surface.md](contracts/desl-sections-surface.md), [quickstart.md](quickstart.md)

**Tests**: not requested as tasks of their own. Every check this feature adds is seen to fail on a planted defect: each phase that adds one has a task that plants it by hand, sees the failure and restores the files.

**Organization**: Phase 2 is DESL 0.4 (pull request 2). Phase 3 lays the definition's skeleton. Phases 4 to 8 are one per user story, P1 first; Phase 9 closes pull request 3. Phase 10 is User Story 5, the folder overview (pull request 4). Phase 11 is the catalogue.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story the task serves (US1 to US6)

## Path conventions

- Every path starts with its repository; the clones sit side by side.
- Work on `features/086-post-incident-review-designer` (or a cloud session's `claude/<name>` branch), cut again from `origin/develop` for each pull request after the one before it merges.
- **The checks** are `validate-examples.py`, `terminology-check.py --name etalii.adp`, `licence-check.py` and the Build's `descriptions` job.
- Section numbers are DESL 0.3, DED 0.2 and FBL 0.21.

> **Ticking**: as spec 084's: tasks of `etalii.adp` when done, T040 to T042 when their pull request merges or their page changes.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened.

> **Shared files**: `DESL-specification.md`, `desl.schema.json` and `validate-examples.py` are changed in Phase 2 only.

---

## Phase 1: Setup

- [x] **T001** After the pull request carrying this file merges, cut the branch again from `origin/develop`, run the checks and note the validator's count of `ok` lines as the baseline · etalii.adp

---

## Phase 2: Foundational, DESL 0.4 (pull request 2)

**Purpose**: the `sections` surface (research R7).

- [x] **T002** [P] Make DESL 0.4: the status paragraph (what 0.4 adds, that every 0.3 specification keeps its meaning), `sections` in 7.1's table, and section 7.8 with parts, records, lists, `order`, `group`, `add`, `figures`, `marks`, `timeStrip` and mentions across parts, as [contracts/desl-sections-surface.md](contracts/desl-sections-surface.md) states · etalii.adp/specifications/desl/DESL-specification.md
- [x] **T003** [P] Add the `sections` kind and its properties to `$defs/Surface`, at the schema's current address · etalii.adp/specifications/desl/desl.schema.json
- [x] **T004** [P] Write the worked example: `minimal-sections.des` (a record part and a list part with a time strip, a figure and a mark), its binding and its Markdown document · etalii.adp/specifications/desl/minimal-sections.des, minimal-sections.fbl, minimal-sections.md
- [x] **T005** Teach the validator to read a `sections` surface: every part's `type` and `fields` exist in the metamodel, a `timeStrip.at` is a `datetime`, a record part's type is single · etalii.adp/.github/scripts/validate-examples.py
- [x] **T006** Plant a `timeStrip.at` naming a string attribute and a list part whose `type` does not exist; see each fail; restore · etalii.adp/specifications/desl/minimal-sections.des
- [x] **T007** Deliver pull request 2: run the checks, see the baseline keep its results, open it naming this folder, turn on auto-merge · etalii.adp

**Checkpoint**: DESL 0.4 on `develop`.

---

## Phase 3: Foundational, the definition's skeleton (pull request 3 begins)

- [x] **T008** [P] Start `post-incident-review.des`: `language` (origin `etalii/post-incident-review`, R10), the element types of data-model.md, the counters `E`, `F`, `A` (R2), and `persistence.bindings` · etalii.adp/definitions/designers/post-incident-review.des
- [x] **T009** [P] Start the binding: `bullets` family, `claims` `.md` `shared` with the envelope marker (R1), `sections` for the six headings, and the rules for each line form of the contract · etalii.adp/definitions/designers/post-incident-review.fbl
- [x] **T010** [P] Write the file schema for the parsed review · etalii.adp/definitions/designers/post-incident-review.schema.json
- [x] **T011** [P] Start the companion with the blameless intent first (FR-009, R9), then the file in full · etalii.adp/definitions/designers/post-incident-review.md
- [x] **T012** Add the README row; run the checks; plant a binding claiming `.md` without the marker, see it fail, restore · etalii.adp/definitions/designers/README.md

---

## Phase 4: User Story 1, read a review as structure (P1)

**Goal**: every part shown, the timeline in time order with its intervals (FR-001 to FR-005). **Independent test**: spec User Story 1.

- [x] **T013** [US1] Add the surface: the six parts of data-model.md, the time strip highlighting milestones, the factor grouping and marks, and mentions across parts · etalii.adp/definitions/designers/post-incident-review.des
- [x] **T014** [US1] Add the interval functions and the Summary part's figures (R4) · etalii.adp/definitions/designers/post-incident-review.des
- [x] **T015** [P] [US1] Write `certificate-expiry.md` (R12) and its intervals worked by hand in the companion · etalii.adp/definitions/designers/examples/certificate-expiry.md, post-incident-review.md
- [x] **T016** [US1] Write the read fixture over both examples, stating every element and attribute value, the entries out of file order kept in place (spec User Story 1, scenario 2) · etalii.adp/specifications/fbl/fixtures/post-incident-review-read/
- [x] **T017** [US1] Plant a wrong `kind` in one expected entry; see the replay fail; restore · etalii.adp

---

## Phase 5: User Story 6, a host builds the designer from its definition (P1)

- [ ] **T018** [US6] *(Handed to the ADP tool language's thread, Peter's choice of 2026-11-23: ATD has no `sections` surface yet.)* Write the tool description `post-incident-review.atd` with `post-incident-review.markdown.atd`, and its trace (R11) · etalii.adp/definitions/designers/
- [ ] **T019** [US6] *(With T018.)* Run `atd check`; plant a description that names a part the specification lacks, see it fail, restore · etalii.adp

---

## Phase 6: User Story 2, an agent assembles, a person judges (P1)

**Goal**: agent-written entries and proposed factors, accepted or rejected in the designer (FR-004, FR-007). **Independent test**: spec User Story 2.

- [x] **T020** [US2] Add the operations `addEntry`, `addFactor`, `acceptFactor` and `rejectFactor`, and the numbering of `E-NEW` and `F-NEW` lines on the next write · etalii.adp/definitions/designers/post-incident-review.des, post-incident-review.fbl
- [x] **T021** [P] [US2] Write `checkout-latency.md`, the agent-drafted review of R12, and its intervals in the companion · etalii.adp/definitions/designers/examples/checkout-latency.md, post-incident-review.md
- [x] **T022** [P] [US2] Write the edits fixture: append three entries as text, accept one factor, reject one, reword one; each with the bytes it writes, the rejected factor kept · etalii.adp/specifications/fbl/fixtures/post-incident-review-edits/
- [ ] **T023** [US2] *(The plant was seen to fail; the description and trace wait on T018.)* Plant an expected output in which rejecting removes the line; see it fail; restore; update description and trace · etalii.adp

---

## Phase 7: User Story 3, agree actions and follow them (P2)

- [x] **T024** [US3] Add `addAction` and `completeAction`, the `unaddressed` mark and `pir.action-incomplete` (FR-005) · etalii.adp/definitions/designers/post-incident-review.des
- [x] **T025** [P] [US3] Add to the edits fixture: an action added for a factor, one completed, one without an owner · etalii.adp/specifications/fbl/fixtures/post-incident-review-edits/
- [ ] **T026** [US3] *(The plant was seen to fail; the description and trace wait on T018.)* Plant a completed action whose expected bytes keep `[ ]`; see it fail; restore; update description and trace · etalii.adp

---

## Phase 8: User Story 4, start a review (P2)

- [x] **T027** [US4] Add the template a new review is made from: envelope, mark line, title, legend, every section, the starting categories (FR-008) · etalii.adp/definitions/designers/post-incident-review.fbl
- [x] **T028** [US4] Add the remaining findings of data-model.md with their codes and sentences, and one read-fixture input per finding · etalii.adp/definitions/designers/post-incident-review.des, specifications/fbl/fixtures/post-incident-review-read/
- [x] **T029** [US4] Complete the companion for agents: every line form, the numbering rule, the milestones, what an agent must not change (lines 1 and 2) · etalii.adp/definitions/designers/post-incident-review.md
- [x] **T030** [US4] Give an agent only the companion, have it add two entries and a factor to a new review; run the validator's reading; record the outcome in the companion's notes · etalii.adp/definitions/designers/post-incident-review.md

---

## Phase 9: Polish, and pull request 3

- [x] **T031** Check that no element type has an attribute for a person's fault (FR-009) and that the plain-text example reads as a review (quickstart step 5) · etalii.adp/definitions/designers/
- [x] **T032** Trace every FR and SC to the file and string that carries it, or to the host's specification for SC-003 and SC-005; record the trace at the end of this file · etalii.adp/specs/086-post-incident-review-designer/tasks.md
- [x] **T033** Deliver pull request 3: run the checks, open it naming this folder, turn on auto-merge · etalii.adp

---

## Phase 10: User Story 5, factors across reviews (P3, pull request 4)

**Goal**: counts per category across a folder (FR-010). **Independent test**: spec User Story 5. **First to cut** (R8).

**Cut** by Peter's choice of 2026-11-23 on a decision card: FBL cannot read it today, since a folder's file rule has no marker and no `bullets` sections, and no slot gives a factor the file of its review. T034 to T039 are not built, and FR-010 and User Story 5 are not delivered.

- [ ] **T034** *(cut)* [US5] Write `post-incident-review-overview.des`: origin `etalii/post-incident-review-overview`, one `sections` page with a list part of factors grouped by category, each row naming its review · etalii.adp/definitions/designers/post-incident-review-overview.des
- [ ] **T035** *(cut)* [US5] Add the folder reading to the binding: `kind: "folder"`, a file rule `*.md` with the envelope marker, the rules' `origins` (FBL 5.1) · etalii.adp/definitions/designers/post-incident-review.fbl
- [ ] **T036** *(cut)* [P] [US5] Write the folder fixture: five reviews, with the counts per category stated · etalii.adp/specifications/fbl/fixtures/post-incident-review-folder/
- [ ] **T037** *(cut)* [US5] Write its tool description and trace, and its README row · etalii.adp/definitions/designers/
- [ ] **T038** *(cut)* [US5] Plant a review without the envelope in the folder and an expected count that includes it; see the replay fail; restore · etalii.adp
- [ ] **T039** *(cut)* Deliver pull request 4 with auto-merge · etalii.adp

---

## Phase 11: The catalogue (pull request 5 and the Notion page)

- [x] **T040** [P] Add the row *Specified*, Designer, *Post-incident review designer*, `etalii/post-incident-review` to the catalogue, and open its pull request with auto-merge (FR-013) · etalii.adp.ide.standalone/docs/tools.md
- [x] **T041** [P] Add the designer's page to the Notion "Tools" database through an agent's own Notion connection · Notion "Tools"
- [x] **T042** Tick the tasks as their pull requests merge, and set the specification's status line · etalii.adp/specs/086-post-incident-review-designer/

---

## Dependencies & Execution Order

- Phase 1, then Phase 2 (DESL 0.4 merged before the definition starts), then Phase 3; Phases 4 and 5; then 6, 7 and 8 in order (8's findings complete 6 and 7's); Phase 9; Phase 10 after pull request 3 merges; Phase 11 after pull request 3 merges, independent of Phase 10.
- If DESL 0.4 is refused at review, stop: Phases 3 to 10 are written again over the surfaces that remain.

## What can be cut

Phase 10, the folder overview, entire: the review designer is complete without it.

---

## Trace of requirements and criteria (T032)

Traced to the file and string that carries each, not to a task. Paths are under `etalii.adp/`.

| Id | Carried by |
|---|---|
| FR-001 | `definitions/designers/post-incident-review.des`: `metamodel.document.attributes` `summary`, `affected`, `effect`, `duration`; types `Entry`, `Factor` (`evidence`), `Action`. |
| FR-002 | `Entry`: `time` (`datetime`, `timezone: "preserve"`), `kind` (`EntryKind`), `text`, `evidence`, `author` (`Author`); binding rule `entry`. |
| FR-003 | `functions.milestones`, `functions.between`; the Summary part's `figures` `timeToDetect`, `timeToEngage`, `timeToMitigate`, `timeToResolve`; companion *How the intervals are computed*. |
| FR-004 | `Factor`: `text`, `category`, `tags`, `entries` (`mentions` of `Entry`), `evidence`, `author`, `state` (`FactorState`); constraint `unknownCategory`. |
| FR-005 | `Action`: `text`, `addresses` (`mentions` of `Factor`), `owner`, `due`, `done`; the Factors part's mark `unaddressed` and the constraint `unaddressed`. |
| FR-006 | `post-incident-review.fbl`: `claims` `.md`, `shared: true`, `marker` on the envelope; the plant of T012 (a claim without the marker) refused by the schema. |
| FR-007 | The edits fixture `specifications/fbl/fixtures/post-incident-review-edits/fixture.json`, each step's splices and `expect`; the `unreadable-*` rules and the type map's `Unreadable`. |
| FR-008 | `template.text` of the binding (every section, the categories, the legend); the operation `addCategory`; companion *Categories*. |
| FR-009 | No attribute of fault in `post-incident-review.des` (T031: the attributes are listed in the schema `post-incident-review.schema.json`, none names blame, fault or a person's cause); companion *Blameless by intent*. |
| FR-010 | Phase 10, pull request 4 (not yet built). |
| FR-011 | `post-incident-review.des`, `.fbl`, `.schema.json`, `.md`, `examples/`; `definitions/designers/README.md` row. The tool description and trace wait on T018. |
| FR-012 | `examples/checkout-latency.md` (agent-drafted, eight entries, three proposed factors) and `examples/certificate-expiry.md` (complete), and the companion's *Worked intervals*. |
| FR-013 | Phase 11. |
| SC-001 | `validate-examples.py` reads both examples (`reviews_from_markdown`) and replays the read and edits fixtures; plants seen to fail: T012 (marker), T017 (a wrong kind and a wrong time zone), T023 (rejecting removes the line), T026 (a completed action keeps `[ ]`). The tool description checks wait on T018. |
| SC-002 | The companion's *Worked intervals* tables, computed by hand from the example files. |
| SC-003 | The host's measure; T030 recorded one attempt in the companion's *Notes*. |
| SC-004 | The edits fixture, whose replay compares every byte. |
| SC-005 | The examples read as plain Markdown: the summary says what happened, the intervals are in the timeline's times, and each action names its owner. |

Notes:

- The bullets family's reading check, `check_reading` with `BulletsModel`, was added to `validate-examples.py` outside Phase 2, as T016 and T017 need a reading to replay. It checks every bullets fixture whose input is a body, so the Hierarchical Requirement Designer's and the agent behavior model's fixtures are now read too; all pass.
- `pir.unknown-entry`, `pir.unknown-factor` and `pir.unread` are reported by DESL's built-ins `std.mentions` and `std.unreadableEntry` (data-model.md, amended); the review's title is not bound (data-model.md, amended).
- The timeline's time is RFC 3339 with its offset, by Peter's choice of 2026-11-23 on a decision card (research R3, amended; contracts/review-document.md).
