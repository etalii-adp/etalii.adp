# Tasks: An Insert Applies a Binding's Empty Rule

**Input**: [fbl-insert-empty.spec.md](fbl-insert-empty.spec.md), [plan.md](plan.md)

All paths are in `etalii.adp`. Every task is checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`.

## Phase 1: the specification

- [x] T001 [US1] In section 6.2 of `specifications/fbl/FBL-specification.md`, extend the `keys` row: an attribute the add does not give is left out; an attribute given its empty value is written or left out by its binding's `empty` rule, with a set's defaults (FR-001, FR-002, FR-003).
- [x] T002 [US1] In section 5.2, say in the `empty` row that the rule applies to an insert as well as to a set (FR-004).
- [x] T003 [US1] Add `empty: "refuse"` on an insert to the reasons a change cannot be planned in section 6.4 (FR-005).
- [x] T004 Make the document 0.6: the header, the status paragraph (what changes, that every valid 0.5 document stays valid, the reading 0.5 left open), and section 2.7 (FR-007).

## Phase 2: the schema

- [x] T005 Add `"0.6"` to the `fbl` enum of `specifications/fbl/fbl.schema.json` (FR-007).

## Phase 3: the fixtures

- [x] T006 [US2] Add `specifications/fbl/fixtures/insert-empty-yaml/`: a binding with four string attributes, one each with `empty: "keep"`, `"remove"`, `"refuse"` and none, a body, an add that gives each an empty value and is refused, the same add without the refused attribute with its splices and undo, and an add that omits every attribute (FR-006, SC-002).
- [x] T007 [US2] Add `specifications/fbl/fixtures/insert-empty-json/`: the same binding in the json family and the same adds, so that the new entries have the same keys (FR-006, SC-002).
- [x] T008 [US2] See the validator fail on a planted wrong offset in one of the new fixtures, and pass again when it is restored (SC-002).

## Phase 4: check

- [x] T009 Run the three checks; confirm no other fixture or example changes its result (SC-003).
- [x] T010 Point row B-09 of `specs/025-standalone-code-structure/behaviour-changes.md` at the FBL 0.6 section that settles it (SC-004).

## After this feature, in other repositories

Not tasks of this feature; listed so that they are not lost.

- `etalii.adp.ide.standalone`: vendor this revision into `EtAlii.Adp.Specification.Fbl.Tests/Conformance/`, and correct `YamlFamily.WireValue` and `JsonFamily.WireValue` in spec 025's T216 with the two fixtures as the guard.
- `etalii.adp.ide.vscode` and `etalii.adp.ide.intellij`: the same for their FBL implementations (specs 009 and 010).
