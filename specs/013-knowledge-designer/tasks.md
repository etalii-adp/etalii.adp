# Tasks: The Knowledge Designer's Definition

**Input**: [plan.md](plan.md), [knowledge-designer.spec.md](knowledge-designer.spec.md), [research.md](research.md), and tasks 1 to 5 of the standalone [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/fdcff792dc8c7ed3948311c4bfc7395de5594f80/.spec-workflow/specs/knowledge-designer/tasks.md), whose numbers are kept in brackets.

Each task names the defect its guard was seen to fail against before it was trusted (standalone Requirement 11.4). Tasks of this repository are ticked when done.

- [x] **T001** [1] Draft the YAML binding, with its first fixture, and settle its two open points · etalii.adp/definitions/designers/knowledge.fbl, etalii.adp/specifications/fbl/fixtures/knowledge-yaml/, etalii.adp/.github/scripts/validate-examples.py, research R1, R2
  - Guard: the validator passes on the binding and the fixture, and resolves every rule name and every `by` (FBL 14.1 step 4).
  - Seen to fail against: the option rule's `parent` naming `propertee` (reported at `/bindings/yaml/elements/2/parent/rules`), and an option reference `by: "id"` towards the `column` rule, which stores no id.
- [x] **T002** [2] Measure a ten-thousand-row file in the standalone host's FBL runtime · etalii.adp.ide.standalone (its own thread, against T001's binding)
  - Merged in standalone pull request [150](https://github.com/etalii-adp/etalii.adp.ide.standalone/pull/150) on 2026-10-09: `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Measurements/LargeTable.Tests.cs`, with the measurements in that repository's implementation log of its task 2.
- [x] **T003** [3] FBL 0.3 wording and DESL 0.1 · etalii.adp/specifications/fbl/, etalii.adp/specifications/desl/, etalii.adp/definitions/designers/README.md, etalii.adp/specifications/ded/DED-specification.md
  - Guard: the validator accepts `specifications/desl/minimal-table.des` and every existing `.fbl` and fixture unchanged, and resolves every type and attribute a DESL surface names and every binding it lists (DESL section 9.1).
  - Seen to fail against: `minimal-table.des` with `surface.rows` naming `Novel`, which its metamodel does not declare (reported at `/surface/rows/type`), and with `Book` renamed in the metamodel only (the binding's rule `book` reported as producing an undeclared type).
- [x] **T004** [4] The three bindings, their templates and their fixtures · etalii.adp/definitions/designers/knowledge.fbl, etalii.adp/specifications/fbl/fixtures/knowledge-*/, etalii.adp/.gitattributes
  - `knowledge-yaml`, `knowledge-json` and `knowledge-xml` each read the same table and take it through the same 65 edits and one refusal, one per kind of edit the requirements name, then undo every one; `knowledge-equivalence` reads the Cities example in all three formats; `knowledge-kept` keeps an unknown key and an unreadable cell through the edits around them. A json list written on one line is created and removed around its entry in three splices (FBL 6.2, worded in 0.3).
  - Guard: the validator replays every step's splices against its expected bytes and the undo against the input, and checks that the fixtures of an `*-equivalence` folder read the same elements.
  - Seen to fail against: step 41 of `knowledge-xml` with one space added to its expected bytes (reported at byte 964), and the json equivalence fixture with one element fewer.
- [x] **T005** [5] `knowledge.des`, `knowledge.md`, the file's schema, the examples and the terminology · etalii.adp/definitions/designers/, etalii.adp/docs/terminology.md, etalii.adp/.github/scripts/validate-examples.py
  - `knowledge.des` holds the metamodel, the three bindings, ShortGuid ids with derived ids for the rest (R5), thirteen constraints, the table surface with its nine value types and their conversions, and 51 operations, one per gesture. DESL's `parse` conversion gains checkbox (`true`, `false`).
  - Guard: the validator over `knowledge.des` (DESL section 9.1); each example against `knowledge.schema.json` (XML through the mapping `knowledge.md` gives) and checked for what reading it would report; the equivalence fixture reading all three; the terminology check.
  - Seen to fail against: each example with one cell's `property` changed to `p99`, which names no property (reported at `/rows/0/cells/8/property` in all three).

## After the definition was first merged

Each of these was merged while the standalone host built the designer. None was planned beforehand, and each is recorded here as done.

- [x] **T006** Duplicating a view is `duplicateView`'s transaction · etalii.adp/definitions/designers/knowledge.fbl, etalii.adp/specifications/fbl/fixtures/knowledge-*/, research R8 (pull request [111](https://github.com/etalii-adp/etalii.adp/pull/111))
  - The fixtures take the copy, then its first column, sort and condition, as four steps; the YAML and JSON bindings create a view's lists at the end of the view, and `knowledge.fbl` declares FBL 0.4.
  - Seen to fail against: the standalone host's FBL runtime, which failed the one-splice step in all three fixtures.
- [x] **T007** A fixture's `add` names the slot it fills · etalii.adp/specifications/fbl/FBL-specification.md, etalii.adp/specifications/fbl/fbl.schema.json, etalii.adp/specifications/fbl/fixtures/knowledge-*/, research R9 (pull request [116](https://github.com/etalii-adp/etalii.adp/pull/116))
  - Guard: the schema validates the three fixtures with `slot` on four steps each.
  - Seen to fail against: the schema as it was, which refuses `slot`.
- [x] **T008** The examples follow the standalone showcase · etalii.adp/definitions/designers/examples/, etalii.adp/definitions/designers/knowledge.md, etalii.adp/specifications/fbl/fixtures/knowledge-equivalence/, research R10 (pull request [120](https://github.com/etalii-adp/etalii.adp/pull/120))
  - Guard: the validator over the three examples and the equivalence fixture, which lists the new elements in reading order.
- [x] **T009** Column calculations and frozen columns · etalii.adp/definitions/designers/knowledge.des, knowledge.fbl, knowledge.md, knowledge.schema.json, etalii.adp/specifications/fbl/fixtures/knowledge-*/, research R11 (pull request [124](https://github.com/etalii-adp/etalii.adp/pull/124))
  - `knowledge.des` now holds fourteen constraints and 55 operations. Each of the three fixtures has 150 steps: 74 edits, each followed by its undo, one read that writes nothing and one refusal.
  - Guard: the validator replays the six new steps of each fixture, three for a calculation and three for a freeze.
  - Seen to fail against: one expected splice written with the enumeration's own value in place of the name the binding's `map` gives it.
