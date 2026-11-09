# Tasks: The RDF Description Orders Its Cards Once per Reading

**Input**: [rdf-budget-order.spec.md](rdf-budget-order.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: the specification by Peter on 2026-11-09, with SC-001's 15 seconds kept as a first bound and the plan and tasks asked for (*Clarifications*). Two findings of the research wait on his word before B and C merge: the four cards of `business-economics` that move (R3) and the statements that are not derived (R5).

Every path carries its repository as prefix. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

**Checks**: before every desktop pull request, `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` and `python tools/sync-etalii-adp.py --check`. Before every etalii.adp pull request, `python .github/scripts/validate-examples.py` and `python .github/scripts/terminology-check.py --name etalii.adp`, and `atd fmt --check`, `atd check` and `atd check --trace` on the RDF description with desktop `develop`'s `atd`. A failure stops the pull request.

**Format**: `- [ ] T### [P] [US#] description · file path`. `[P]`: parallel with the other `[P]` tasks of its phase. Tests come first in every phase and are seen failing before what they test is written.

---

## Phase 1: Setup, pull request A

- [x] T001 Measure one reading of each STW body through the RDF description, with no step, in a release build, before anything changes, and find what dominates it (Assumptions, R1) · etalii.adp/specs/078-rdf-budget-order/research.md
- [x] T002 Confirm or revise SC-001's 15 seconds from that measurement, and report a revision rather than make it (R4) · etalii.adp/specs/078-rdf-budget-order/research.md

---

## Phase 2: User Story 1, a large RDF file opens in seconds (Priority: P1), pull request C's test and pull request B

**Goal**: FR-001 to FR-004, SC-001, SC-002, SC-004. **Independent test**: the desktop's `the_stw_vocabularies_place_every_rdf_card`, and R1's scratch case per body.

- [ ] T003 [US1] Write the test that the RDF description's readings of `geographic-names` and `business-economics` derive every card, 467 and 1,367, with no finding, each carrying a place and each place once; see it fail against the vendored description · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs
- [ ] T004 [US1] Give `Term` the attribute `place`, `readonly`, default 0, and write `rdfPlaced(terms, kind)`, which makes the order of the cards once and appends each term's card's place, with the card's id written out rather than through `cardId` (R2) · etalii.adp/definitions/diagrams/w3c-rdf.atd
- [ ] T005 [US1] Take `Resource`'s and `BlankNode`'s `from` from `rdfPlaced` and their `place` from `item[4]`; remove `rdfCardOrder` (FR-001) · etalii.adp/definitions/diagrams/w3c-rdf.atd
- [ ] T006 [US1] Have the layout `typeBands` read `sequence: (self.place)` (FR-003) · etalii.adp/definitions/diagrams/w3c-rdf.notation.atd
- [ ] T007 [US1] Compare every card's place with `rdfCardOrder`'s where it runs to its end, and the drawings of both bodies before and after, and say what differs (FR-002, FR-004, R3) · etalii.adp/specs/078-rdf-budget-order/research.md

**Checkpoint**: SC-001 and SC-002 hold on the scratch case; the desktop's test passes against B's description.

---

## Phase 3: User Story 2, the cases still say the same (Priority: P1), pull requests B and C

**Goal**: FR-005, FR-006, SC-003. **Independent test**: `atd validate` on the RDF description, and `the_rdf_cases_pass_but_for_what_is_listed`, natively and through the WebAssembly module.

- [ ] T008 [US2] Validate the RDF description's 22 cases before and after, and see the same 20 pass with the same differences in the other two (SC-003) · etalii.adp/definitions/diagrams/conformance/w3c-rdf/
- [ ] T009 [US2] State the new measurement of both bodies beside the 2026-11-05 one in section 6, and stop naming the budget order as what still grows with the body (FR-007) · etalii.adp/definitions/diagrams/w3c-rdf.md
- [ ] T010 [US2] Vendor B's merge commit with `tools/sync-etalii-adp.py`, never by hand · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/vendor/etalii.adp.lock
- [ ] T011 [US2] Hold `w3c.rs`'s lists as they are, and the Build's WebAssembly validation of the RDF description, with no case recorded again (FR-005, SC-003) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/w3c.rs, etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs

**Checkpoint**: C is merged; the RDF description's cases pass as before, natively and through the module.

---

## Phase 4: Polish

- [ ] T012 [P] Record the last measures beside R1's, from B's description as vendored by C (SC-001, SC-002) · etalii.adp/specs/078-rdf-budget-order/research.md
- [ ] T013 Mark the feature's status, and regenerate ThinkRail's copy · etalii.adp/specs/078-rdf-budget-order/.spec-context.json, etalii.adp/thinkrail/
- [ ] T014 Tick the merged tasks in one pull request · etalii.adp/specs/078-rdf-budget-order/tasks.md

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T004, T005 |
| FR-002 | T003, T007 |
| FR-003 | T006 |
| FR-004 | T007 |
| FR-005 | T008, T011 |
| FR-006 | T004, T011 |
| FR-007 | T009 |
| SC-001 | T001, T002, T012 |
| SC-002 | T001, T012 |
| SC-003 | T008, T011 |
| SC-004 | T003, T007 |

---

## Dependencies

Phase 1 (A) first. T003 goes on C's branch and is seen failing against the vendored description before B is written. T004 to T009 are B, which merges once C's branch, with B's description in a scratch copy of the vendor, passes the desktop's checks; then T010 and T011 complete C. T012 to T014 follow C's merge. B and C wait on Peter's word on R3 and R5.

**MVP**: Phases 1 to 3; nothing else is in the feature.
