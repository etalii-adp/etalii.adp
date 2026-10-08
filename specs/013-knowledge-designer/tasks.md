# Tasks: The Knowledge Designer's Definition

**Input**: [plan.md](plan.md), [knowledge-designer.spec.md](knowledge-designer.spec.md), [research.md](research.md), and tasks 1 to 5 of the standalone [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/fdcff792dc8c7ed3948311c4bfc7395de5594f80/.spec-workflow/specs/knowledge-designer/tasks.md), whose numbers are kept in brackets.

Each task names the defect its guard was seen to fail against before it was trusted (standalone Requirement 11.4). Tasks of this repository are ticked when done.

- [x] **T001** [1] Draft the YAML binding, with its first fixture, and settle its two open points · etalii.adp/definitions/designers/knowledge.fbl, etalii.adp/specifications/fbl/fixtures/knowledge-yaml/, etalii.adp/.github/scripts/validate-examples.py, research R1, R2
  - Guard: the validator passes on the binding and the fixture, and resolves every rule name and every `by` (FBL 14.1 step 4).
  - Seen to fail against: the option rule's `parent` naming `propertee` (reported at `/bindings/yaml/elements/2/parent/rules`), and an option reference `by: "id"` towards the `column` rule, which stores no id.
- [ ] **T002** [2] Measure a ten-thousand-row file in the standalone host's FBL runtime · etalii.adp.ide.standalone (its own thread, against T001's binding)
- [x] **T003** [3] FBL 0.3 wording and DESL 0.1 · etalii.adp/specifications/fbl/, etalii.adp/specifications/desl/, etalii.adp/definitions/designers/README.md, etalii.adp/specifications/ded/DED-specification.md
  - Guard: the validator accepts `specifications/desl/minimal-table.des` and every existing `.fbl` and fixture unchanged, and resolves every type and attribute a DESL surface names and every binding it lists (DESL section 9.1).
  - Seen to fail against: `minimal-table.des` with `surface.rows` naming `Novel`, which its metamodel does not declare (reported at `/surface/rows/type`), and with `Book` renamed in the metamodel only (the binding's rule `book` reported as producing an undeclared type).
- [x] **T004** [4] The three bindings, their templates and their fixtures · etalii.adp/definitions/designers/knowledge.fbl, etalii.adp/specifications/fbl/fixtures/knowledge-*/, etalii.adp/.gitattributes
  - `knowledge-yaml`, `knowledge-json` and `knowledge-xml` each read the same table and take it through the same 65 edits and one refusal, one per kind of edit the requirements name, then undo every one; `knowledge-equivalence` reads the Cities example in all three formats; `knowledge-kept` keeps an unknown key and an unreadable cell through the edits around them. A json list written on one line is created and removed around its entry in three splices (FBL 6.2, worded in 0.3).
  - Guard: the validator replays every step's splices against its expected bytes and the undo against the input, and checks that the fixtures of an `*-equivalence` folder read the same elements.
  - Seen to fail against: step 41 of `knowledge-xml` with one space added to its expected bytes (reported at byte 964), and the json equivalence fixture with one element fewer.
- [ ] **T005** [5] `knowledge.des`, `knowledge.md`, the file's schema, the examples and the terminology · etalii.adp/definitions/designers/, etalii.adp/docs/terminology.md
