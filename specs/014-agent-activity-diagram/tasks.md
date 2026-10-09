# Tasks: The Agent Activity Diagram's Definition

**Input**: [plan.md](plan.md), [agent-activity-diagram.spec.md](agent-activity-diagram.spec.md), [research.md](research.md), and tasks 1 to 4 of the standalone [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/08d917f9594cda164bec355da93592231d7fa732/.spec-workflow/specs/agent-activity-diagram/tasks.md), whose numbers are kept in brackets.

Each task names the defect its guard was seen to fail against before it was trusted (standalone Requirement 11.4). Tasks of this repository are ticked when done.

- [x] **T001** [1] Try the file shape against FBL and DISL · etalii.adp/definitions/diagrams/agent-activity-diagram.fbl, etalii.adp/specifications/fbl/fixtures/agent-activity-read/, etalii.adp/definitions/diagrams/agent-activity-diagram.dis (metamodel only), research R1 to R6
  - A relation as a key works with DISL 0.3 (R1); placements and group states are identified by what they name (R2); `view:` cannot hold the user's part in every file, put to the maintainer as a selection on 2026-10-09 (R3), with the binding following the recommended flat keys until the answer.
  - Guard: the validator passes on the draft binding, its read fixture and the draft specification.
  - Seen to fail against: the task rule's `parent` naming `specificatio` (reported at `/bindings/aad/elements/3/parent/rules`).
- [x] **T002** [2] DISL 0.4 · etalii.adp/specifications/disl/DISL-specification.md, etalii.adp/specifications/disl/disl.schema.json, etalii.adp/specifications/disl/work-board.dis, etalii.adp/specifications/fbl/work-board.fbl, etalii.adp/.github/scripts/validate-examples.py
  - `paths` on a `uri` (L6), `groupBy` with collapse defaults (L1, L2), `itemOrder` (L9), `itemLink` and activatable badges (L6), `persist` on a filter (L3), `pin`, `unpin`, `unpinAll` and `view.pinned` (L4), `view.groups`, the `open` action (L6), `force` with `tiers` (L5) and `view.bind` (L7), listed under *Changes from 0.3* with the three clarifications they make.
  - Guard: the schema validates `work-board.dis`, which uses every construct, and the validator resolves the names they refer to (DISL section 14.1, step 9).
  - Seen to fail against: `work-board.dis` with `groupBy` on `title`, a string (reported at `/notation/nodes/Item/compartments/0/groupBy/attribute`); and with a tier naming `Itm` and `filters` bound but not stored (reported at `/layout/algorithms/rings/force/tiers/1` and `/persistence/view/bind/filters`).
- [x] **T003** [3] The binding and its fixtures · etalii.adp/definitions/diagrams/agent-activity-diagram.fbl, etalii.adp/specifications/fbl/fixtures/agent-activity-*/
  - `agent-activity-read` reads every element of the example; `agent-activity-edits` adds, sets, clears and removes an element, a task, a reference drawn as a relation, a pinned position, a group state and the switch on that example, with comments, the unknown key and every other line kept byte for byte; `agent-activity-new` starts from the template and creates and removes each list. Both edit fixtures undo every step and redo one.
  - Guard: the validator replays every step and its undo against the bytes each one expects.
  - Seen to fail against: the expected bytes of the first edit with the comment line above a task dropped (reported as `step 2: the splices give a different document, first at byte 651`).
- [x] **T004** [4] `agent-activity-diagram.dis`, `.md`, the schema and the Notion page · etalii.adp/definitions/diagrams/, etalii.adp/.github/scripts/validate-examples.py, the Notion "Tools" database
  - Done in the files: `agent-activity-diagram.dis` at DISL 0.4 (notation, toolbox and menus, the connect, delete and link operations, constraints, the tiered layout, persistence with `view.bind`); `agent-activity-diagram.md` under its siblings' headings, with the complete example, the instruction text for agents, the reference layout and how each host opens a link; `agent-activity-diagram.schema.json`; and the validator checking the `.md`'s example against the schema, reading moments as strings. The Notion page follows the ruling on research R3 (T006).
  - Guard: the validator validates the `.dis`, and the `.md`'s example against the schema.
  - Seen to fail against: a task status `blocked` in the `.md`'s example (reported at `specifications/0/tasks/1/status`); and the same example read with PyYAML's `safe_load`, which turns three moments into timestamps the schema refuses.
- [x] **T005** FBL 0.4, by the ruling on research R3 · etalii.adp/specifications/fbl/FBL-specification.md, etalii.adp/specifications/fbl/fbl.schema.json
  - `create.at: "end"` on an insert creates every missing level of its container, outermost first; an attribute's `create` does the same for a yaml or json `child` mapping; `remove-empty-levels` removes the levels an entry's removal leaves empty. Listed in the status section as FBL 0.4; every 0.3 document keeps its meaning.
  - Guard: the schema validates the binding of T006, and its fixtures replay the splices section 6.2 now gives.
  - Seen to fail against: the switch's `insert-key` written without its indentation under `view` (reported as `step 7: the splices give a different document, first at byte 293`).
- [x] **T006** The user's part back under `view:` · etalii.adp/definitions/diagrams/agent-activity-diagram.fbl, .dis, .md, .schema.json, etalii.adp/specifications/fbl/fixtures/agent-activity-*/, the Notion "Tools" database
  - The binding at FBL 0.4 reads `view.showArchived`, `view.placements` and `view.groups`; `agent-activity-new` creates `view` with the first pin and removes it with the last, creates it with the switch, and adds placements and groups at its end; `agent-activity-edits` edits each under `view` and keeps `view` while it holds the switch.
  - Guard: the validator replays both edit fixtures and validates the `.md`'s example against the schema with `view`.
  - Seen to fail against: the same fault as T005, which is this binding's fixture.
