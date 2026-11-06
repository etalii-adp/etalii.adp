# Tasks: A DISL Function That Groups a List by Key

**Input**: [disl-grouping-function.spec.md](disl-grouping-function.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: plan and tasks by Peter on 2026-11-02, and building on 2026-11-05. Every task is ticked: etalii.adp #711, #713, #717, #718; etalii.adp.ide.desktop #153 (the vendor's catch-up it needed), #154, #156, #157.

Every path carries its repository as prefix. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

**Checks**: before every desktop pull request, `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` and `python tools/sync-etalii-adp.py --check`. Before every etalii.adp pull request, `python .github/scripts/validate-examples.py` and `python .github/scripts/terminology-check.py --name etalii.adp`. A failure stops the pull request.

**Format**: `- [ ] T### [P] [US#] description · file path`. `[P]`: parallel with the other `[P]` tasks of its phase. Tests come first in every phase and are seen failing before what they test is written.

---

## Phase 1: Setup

- [x] T001 Check that DISL is still at 0.8 on `develop`; if another version has appeared, this feature's version is the next one, and every 0.9 below changes with it · etalii.adp/specifications/disl/DISL-specification.md

---

## Phase 2: User Story 1, the language (Priority: P1), pull request A

**Goal**: FR-001 to FR-004, FR-006, FR-007. **Independent test**: `validate-examples.py` validates every fixture against its `$defs`, and the worked example against its findings.

- [x] T002 [P] [US1] Write the fixtures of order and reading: each distinct key one group in list order, keys in order of first appearance, an absent key's empty group, an empty list (FR-002, FR-003) · etalii.adp/specifications/disl/fixtures/grouping/order-*.json, absent-*.json, empty.json
- [x] T003 [P] [US1] Write the fixtures of keys: a string, a bool and a number, an int and a double of one value being one key, 0.0 and -0.0 being one key, and null, NaN, a list and a map each being a failing key (R8) · etalii.adp/specifications/disl/fixtures/grouping/key-*.json
- [x] T004 [P] [US1] Write the fixtures of failure: a key expression that fails on one item fails the whole grouping, and `&&` and `||` absorb a failure in a key as they do elsewhere (FR-004) · etalii.adp/specifications/disl/fixtures/grouping/failing-*.json
- [x] T005 [US1] Add `$defs/GroupingFixture`, and DISL 0.9 to the schema's title and to the version key's text, and have `validate-examples.py` validate the fixtures and refuse one that does not validate · etalii.adp/specifications/disl/disl.schema.json, etalii.adp/.github/scripts/validate-examples.py
- [x] T006 [US1] State `l.groupBy(x, key)`, `g.get(k)` and `g.keys()` in §12.4 with their order, their absent key, their keys' kinds and their failure, name the macro in §12.1, and add the feature id `cel.groupBy` to Appendix B.8 (R3, R4, R8) · etalii.adp/specifications/disl/DISL-specification.md
- [x] T007 [US1] State in §12.4 and §12.5 that a grouping is free of side effects and deterministic, that a runtime MAY keep one while its list and what its key read are unchanged, and that the result MUST equal grouping again (R5, R6) · etalii.adp/specifications/disl/DISL-specification.md
- [x] T008 [US1] State the cost in §12.4, at run time and for an estimate, the charge being the same whether or not a runtime kept the grouping (FR-005, R7) · etalii.adp/specifications/disl/DISL-specification.md
- [x] T009 [US1] Add 0.9 to §2.9, the header's version and date, and *Changes from 0.8*, saying that every 0.8 specification is a 0.9 specification with the same meaning (FR-006) · etalii.adp/specifications/disl/DISL-specification.md
- [x] T010 [US1] Add the worked example: a small specification that derives terms through the macro, its definition, and its findings, one derived type's key failing to show §2.5's row (FR-004, Constitution II) · etalii.adp/specifications/disl/grouping-terms.dis, grouping-terms.did, grouping-terms.findings.json
- [x] T011 [US1] State that ATD carries DISL 0.9, add `groupBy` to the macros of §6.3, and add a line to *Changes* (FR-007) · etalii.adp/specifications/atd/ATD-specification.md

**Checkpoint**: pull request A is merged; the desktop can vendor it.

---

## Phase 3: User Story 1, the desktop host (Priority: P1), pull request B

**Goal**: FR-005, FR-008, SC-001. **Independent test**: `cargo test -p adp-disl --test grouping_fixtures`, native and WebAssembly.

- [x] T012 [US1] Vendor A's merge commit with `tools/sync-etalii-adp.py`, never by hand · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/vendor/etalii.adp.lock
- [x] T013 [US1] Write the test that runs every grouping fixture, with its files included at compile time so that it builds for WebAssembly; see it fail · etalii.adp.ide.desktop/crates/adp-disl/tests/grouping_fixtures.rs
- [x] T014 [US1] Add `Macro::GroupBy` and the value it gives, with `get` and `keys`, offered in DISL's environment and not in FBL's (R3, R4, R8) · etalii.adp.ide.desktop/crates/adp-cel/src/eval.rs, function.rs, group.rs, etalii.adp.ide.desktop/crates/adp-disl/src/expressions/library.rs
- [x] T015 [US1] Write the test of the charge: a grouping charges one evaluation of its key per item, a `get` the size of its group, and a kept grouping the same as a fresh one; then implement it (FR-005, R7) · etalii.adp.ide.desktop/crates/adp-disl/tests/grouping_cost.rs, etalii.adp.ide.desktop/crates/adp-cel/src/eval.rs
- [x] T016 [US1] Write the tests of what is kept: a grouping is made once over an unchanged list, and made again after an attribute, a parent, a type or an end changes, and after a node of the list is added or removed; then keep `nodesOfType` and `relationsOfType` lists while their elements are the same, and forget groupings where the budgets are forgotten for an element's value (edge case, R5) · etalii.adp.ide.desktop/crates/adp-disl/tests/grouping_kept.rs, etalii.adp.ide.desktop/crates/adp-disl/src/model/diagram.rs, element.rs
- [x] T017 [US1] Write the tests of what is not kept: a key that reads a variable other than its own, `diagram`, an element's `id`, a derived attribute, another element or a description's function is grouped again each time and gives the same result as ever; then implement the check, made during the pass (R5, R6) · etalii.adp.ide.desktop/crates/adp-disl/tests/grouping_kept.rs, etalii.adp.ide.desktop/crates/adp-cel/src/eval.rs
- [x] T018 [US1] Teach ATD's lowering that `groupBy` is a macro and that it lowers to DISL 0.9, and its check the macro, the methods and their types, with a test that an `.atd` using them checks clean and has an abstract tree the schema accepts · etalii.adp.ide.desktop/crates/adp-atd-syntax/src/lower.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/disl.rs, etalii.adp.ide.desktop/crates/adp-atd-check/src/cel.rs, etalii.adp.ide.desktop/crates/adp-atd-check/tests/
- [x] T019 [US1] Run the fixtures for WebAssembly in the Build, with `wasm-bindgen-test` as a development dependency only (R10, SC-001) · etalii.adp.ide.desktop/crates/adp-disl/Cargo.toml, etalii.adp.ide.desktop/.github/workflows/build.yml
- [x] T020 [US1] Add the macro to the parity inventory, and to what the desktop's DISL runtime states of itself · etalii.adp.ide.desktop/parity/inventory.md, etalii.adp/hosts/desktop/specification-runtimes/disl.md

**Checkpoint**: SC-001 holds.

---

## Phase 4: User Story 3, the check (Priority: P2), in pull request B

**Goal**: FR-005's estimate. **Independent test**: `atd check` on the two descriptions below equals their findings files. No host has an estimator today (R7), so this story holds what is true and states the rule any estimator follows; Peter ruled on 2026-11-02 that none is built.

- [x] T021 [US3] Add a description that groups a list of the limit's size and reads its groups, with a findings file naming no cost; check it · etalii.adp/specifications/atd/fixtures/grouping-at-limit/, etalii.adp.ide.desktop/crates/adp-atd-check/tests/
- [x] T022 [US3] Add a description that still filters a whole list once per item, with a findings file equal to what `atd check` gives before this feature · etalii.adp/specifications/atd/fixtures/filtering-per-item/, etalii.adp.ide.desktop/crates/adp-atd-check/tests/

**Checkpoint**: pull request B is merged.

---

## Phase 5: User Story 2, the SKOS description (Priority: P1), pull requests C and D

**Goal**: FR-009 and FR-010 for SKOS, SC-002, SC-003, SC-005. **Independent test**: `atd validate --case geographic-names` in the time SC-002 states, the case's differences being those `w3c.rs` lists.

- [x] T023 [US2] On D's branch, before the description moves, remove `#[ignore]` from `the_geographic_names_case` and make it compare its differences with what is listed; record the failure in the pull request's description · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs
- [x] T024 [US2] Write the test for SC-005: `stw/geographic-names.ttl` and `stw/business-economics.ttl` draw through the description, with no finding of a cost exceeded and no derived type failing, and the budget's notice on the second; see it fail · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs
- [x] T025 [US2] Move the SKOS description's whole-list reads onto groups with inline keys: `repeatSuffix`, `isCell`, `collectionMembers`, `skosIsTyped`, `skosDrawable`, `skosMember`, `skosTops`, `skosChildren`, the broader ends, `skosLabels` and each derived type's attributes and `sources` (R11) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T026 [US2] Walk once per `from`, each item carrying its place, and read the place in the budget's `order` (R11) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T027 [US2] Replace `distinct()` on long lists of strings by `groupBy(x, x).keys()`, `familyTruncated` among them, so that nothing goes over `limits.celCost` (R2, R11) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T028 [US2] Draw a `Related` edge from the end whose id sorts first, as its own `doc` says and the case records (R12) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T045 [US2] Add a test that setting `skos.doc:definition` writes the triple with the module's bytes, seen failing first, from step 2 of `geographic-names` (FR-012) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs
- [x] T046 [US2] Let the SKOS description write a concept's definition set through its row, and stop if DISL or FBL cannot state it, for Peter's ruling (FR-012, R12) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T029 [US2] Declare `cel.groupBy` in the description's `requires.features` (R11) · etalii.adp/definitions/diagrams/w3c-skos.atd
- [x] T030 [US2] Say in the companion that the rules read groups, update the trace's items where they moved, and confirm by diff that no `conformance/` file changed (FR-009, SC-004) · etalii.adp/definitions/diagrams/w3c-skos.md, w3c-skos.trace.json
- [x] T031 [US2] Vendor C's merge commit · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/vendor/etalii.adp.lock
- [x] T032 [US2] Remove `TOO_LONG` and its filter, and let `the_skos_cases_pass_but_for_what_is_listed` count all 25 cases; list what still differs in the case by name, which is the label row's refusal and the bytes that follow from it (FR-010, SC-003, R12) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs
- [x] T033 [US2] Remove the skip from the WebAssembly check: `TOO_LONG`, its comment, its test in the loop and `--except`, and confirm the result equals the native one (FR-010, SC-003, story 2 scenario 2) · etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs
- [x] T034 [US2] Remove the comment at the head of `w3c.rs` that says the rules are quadratic, and `Cargo.toml`'s note of the same, if the dev profile's time no longer needs the optimised packages they name; keep whichever the measure says is still needed · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs, etalii.adp.ide.desktop/Cargo.toml
- [x] T035 [US2] Hold SC-002 in the Build: a step that runs `atd validate --case geographic-names` in the release build under a time limit, its wall time in the log · etalii.adp.ide.desktop/.github/workflows/build.yml

**Checkpoint**: SC-002, SC-003 and SC-005 hold.

---

## Phase 6: User Story 2, the other three descriptions (Priority: P1), pull requests E and F

**Goal**: FR-009 and FR-011, SC-004. **Independent test**: `w3c.rs`'s four description tests with unchanged lists, and each description's reading of `stw/geographic-names.ttl` measured beside R1's figures.

- [x] T036 [P] [US2] Move the RDF description: `repeatSuffix`, `isCell`, `collectionMembers`, the per-item `distinct().indexOf(id)` that goes over its cost on this body, and the attributes' whole-list filters (R1) · etalii.adp/definitions/diagrams/w3c-rdf.atd
- [x] T037 [P] [US2] Move the OWL description: `repeatSuffix` and the per-IRI `exists` reads that take 150 seconds of its 160; check whether `celCost: 100000000` is still needed, and say so rather than change it (R1) · etalii.adp/definitions/diagrams/w3c-owl.atd
- [x] T038 [P] [US2] Move the SHACL description: `repeatSuffix`, which is nearly all its time, and no more unless a measure asks (R1) · etalii.adp/definitions/diagrams/w3c-shacl.atd
- [x] T039 [US2] Close gap 6: state how the case and each body measured, or which body still goes over and by how much, and correct the sentence after the table that says the case stays ignored; say the same in the other companions and traces where it applies (FR-011) · etalii.adp/definitions/diagrams/w3c-rdf.md, w3c-owl.md, w3c-shacl.md, w3c-skos.md, and their `.trace.json`
- [x] T040 [US2] Confirm by diff that no `conformance/` file changed, then vendor E's merge commit, each description's list staying what it is (SC-004) · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs

**Checkpoint**: SC-004 holds; gap 6 is closed or says what remains.

---

## Phase 7: Polish

- [x] T041 [P] Confirm the native and WebAssembly validations agree on all four descriptions at F's commit, with the Build's log as the record (SC-001, SC-003) · etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs
- [x] T042 [P] Record the last measures beside R1's, in a release build on the same machine where possible (SC-002) · etalii.adp/specs/075-disl-grouping-function/research.md
- [x] T043 Mark the feature's status, and regenerate ThinkRail's copy · etalii.adp/specs/075-disl-grouping-function/.spec-context.json, etalii.adp/thinkrail/
- [x] T044 Tick the merged tasks in one pull request · etalii.adp/specs/075-disl-grouping-function/tasks.md, and spec 067's note on `geographic-names` where it says the case stays ignored · etalii.adp/specs/067-desktop-fbl-bindings/tasks.md

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T006, T014, T018 |
| FR-002 | T002, T006, T013 |
| FR-003 | T002, T006, T013 |
| FR-004 | T004, T006, T010, T013 |
| FR-005 | T008, T015, T021, T022 |
| FR-006 | T009, T017, T023, T030, T040 |
| FR-007 | T005, T009, T010, T011 |
| FR-008 | T014 to T019 |
| FR-009 | T025 to T030, T036 to T038 |
| FR-010 | T023, T032, T033 |
| FR-011 | T039 |
| FR-012 | T045, T046 |
| SC-001 | T013, T019, T041 |
| SC-002 | T023, T035, T042 |
| SC-003 | T032, T033, T041 |
| SC-004 | T030, T032, T040 |
| SC-005 | T024 |

---

## Dependencies

Phase 1, then A (Phase 2), then B (Phases 3 and 4), then C and D (Phase 5), then E and F (Phase 6). T023 and T024 go on D's branch before C merges, and are seen failing against the vendored description as it stands. In C, T025 to T027 and T028 can be reviewed apart but land together. T045 and T046 come before T032. Implementation waits on Peter's word.

**MVP**: Phases 1 to 5, which take `geographic-names` off the ignored list.
