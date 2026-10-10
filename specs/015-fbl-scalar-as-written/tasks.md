# Tasks: FBL Reads a Scalar as Written

**Input**: [fbl-scalar-as-written.spec.md](fbl-scalar-as-written.spec.md), [plan.md](plan.md), [research.md](research.md)

All paths are in `etalii.adp`. Every task is checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`.

## Phase 1: the specification

- [x] T001 [US1] Define a scalar's written text as section 4.1.5 of `specifications/fbl/FBL-specification.md`, and say in 4.1.4 that a key with no value is present with the value null (FR-001, FR-004).
- [x] T002 [US1] Add `read` to the attribute binding options of section 5.2 with the paragraph **Reading a scalar** and its table, naming the two meanings 0.4 left open (FR-002, FR-009, SC-005).
- [x] T003 [US1] State in section 5.3 that an id is its slot's written text, and in 5.2 that a reference is compared as written text (FR-003).
- [x] T004 [US2] Add `text` and `style` to the variables of section 2.4 (FR-004).
- [x] T005 [US1] Say in section 6.3 how a value read as text is written, and what `style: "plain"` changes (FR-005).
- [x] T006 [US3] Add `fallback` and `quoted` to section 5.2, the exception to the unreadable entry and the finding `fbl.unconverted-value` to section 7.4 (FR-006, FR-007, FR-008).
- [x] T007 Let a fixture's `read` list `attributes` in section 15.3 (FR-010).
- [x] T008 Make the document 0.5: the header, the status paragraph, sections 2.1 and 2.7 (FR-009, FR-010).

## Phase 2: the schema

- [x] T009 In `specifications/fbl/fbl.schema.json`: `"0.5"` in the `fbl` enum; `read`, `quoted` and `fallback` on `$defs/AttributeBinding`; `attributes` on an element of `$defs/Fixture`'s `read` (FR-010).

## Phase 3: the example and its fixture

- [x] T010 Bring `specifications/fbl/timeline.fbl` to 0.5: `begin` and `end` read as text, `row` with `quoted` and a silent `fallback` (FR-012).
- [x] T011 Add `specifications/fbl/fixtures/timeline-written-text/`: a body whose labels, ids, times and rows a YAML reader would type otherwise, what reading it yields with `attributes`, a save without change, four edits and their undo (FR-010, SC-003).
- [x] T012 See the validator fail on a planted wrong offset in the new fixture, and pass again when it is restored (SC-001, to the extent the validator can check; research.md R7).

## Phase 4: check

- [x] T013 Run the three checks; confirm no other fixture or example changes its result (SC-004).

## After this feature, in other repositories

Not tasks of this feature; listed so that they are not lost.

- `etalii.adp.ide.standalone`: vendor this revision into `EtAlii.Adp.Specification.Fbl.Tests/Conformance/` and implement 0.5 in `EtAlii.Adp.Specification.Fbl`, under the specification that owns that library change. The seven conversion specifications named in the spec's *Input* then have the construct their second half waits on.
- `etalii.adp.ide.vscode` and `etalii.adp.ide.intellij`: the same for their FBL implementations (specs 009 and 010).
