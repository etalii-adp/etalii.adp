# Tasks: Folded Groups, the Archive Switch and Unknown Values in a Description

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: the desktop's are written first and seen to fail; etalii.adp's fixtures are planted wrong once and seen to fail.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- Every path starts with its repository; the clones sit side by side.
- Section numbers are DISL 0.10 and ATD 0.1.

> **Ticking**: etalii.adp's tasks when their pull request merges; the desktop's when its pull request merges.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened.

---

## Phase 1: Setup

- [x] **T001** Cut `features/087-aad-folds-and-filters` from `origin/develop` in both repositories; in the desktop note `atd validate`'s results for every description as the baseline · etalii.adp, etalii.adp.ide.desktop

## Phase 2: DISL 0.11 (etalii.adp)

- [x] **T002** [P] [US1] Make DISL 0.11: the status paragraph, `self.view.groups` in 12.2 and 6.9 (stored state else default, a map by group key, deterministic where `groups` is stored), as plan R1 states · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T003** [P] [US4] Add `std.notAValue` to 9.1's standard messages and to 7.5's refusal of a value not among a row's choices, `value` bound · etalii.adp/specifications/disl/DISL-specification.md
- [x] **T004** [P] Add both to the schema at its current address · etalii.adp/specifications/disl/disl.schema.json
- [x] **T005** [P] Fixtures: a node whose height reads a folded group, and a row refusing a value with `std.notAValue`; plant a wrong expected result in each, see it fail, restore · etalii.adp/specifications/disl/fixtures/view-groups/, fixtures/not-a-value/

## Phase 3: ATD §2.3 (etalii.adp)

- [x] **T006** [US2] [US3] Amend §2.3: the wire-id block's `headings` and `filters`, and `elements.diagram`, for a case recorded from a module; §1.3 carries DISL 0.11; an amendment line · etalii.adp/specifications/atd/ATD-specification.md

## Phase 4: The agent activity description (etalii.adp)

- [x] **T007** [US1] Give Specification and Location a `size.height` expression: the base height, 18 per shown row, 22 per shown heading, the folder row of a location, by `self.view.groups` · etalii.adp/definitions/diagrams/agent-activity-diagram.notation.atd
- [x] **T008** [US2] [US3] Name the heading gestures, the view element and its filter gestures in `x-aad` · etalii.adp/definitions/diagrams/agent-activity-diagram.atd
- [x] **T009** [US4] Word `std.notAValue` as the module does · etalii.adp/definitions/diagrams/agent-activity-diagram.atd
- [x] **T010** Deliver: run the checks, open the pull request naming this folder, turn on auto-merge · etalii.adp

## Phase 5: The desktop host (etalii.adp.ide.desktop)

- [x] **T011** Vendor T010's merge · etalii.adp.ide.desktop/vendor/etalii.adp
- [x] **T012** [P] [US1] Test first: `self.view.groups` reads a stored state and a default; then implement it · etalii.adp.ide.desktop/crates/adp-disl/
- [x] **T013** [P] [US4] Test first: a row refuses with `std.notAValue`; then implement it · etalii.adp.ide.desktop/crates/adp-disl/src/derivation/form_commit.rs
- [x] **T014** [US1] A force layout places a node at its computed size, and the drawing draws it there · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] **T015** [US2] [US3] `view.bind.groups` and `view.bind.filters` kept in the body, as pinned positions are · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/view_bind.rs
- [x] **T016** [US2] [US3] The validator maps a heading id and the view element's filter gestures, as T006 states · etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [x] **T017** The agent activity test: its case against what is listed, each listed difference with its reason, and the list held both ways · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/agent_activity.rs
- [x] **T018** See every description keep its baseline natively and through WebAssembly (SC-002); run fmt, clippy, the tests, `atd record --check`; open the pull request naming this folder and the etalii.adp commit; turn on auto-merge · etalii.adp.ide.desktop

## Phase 6: Close

- [x] **T019** Tick T001 to T018 once T018's pull request merges · etalii.adp/specs/087-aad-folds-and-filters/tasks.md
