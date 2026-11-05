# Tasks: Every Case Passes for Five More Tool Types

**Input**: [five-tools-pass.spec.md](five-tools-pass.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: plan and tasks by Peter on 2026-11-02; building by Peter on 2026-11-05 ("4a"), story 1 first. His answers to Q1 to Q4 are in research R21 and the specification's clarifications: Q1 listed (he did not rule, the default was taken), Q2 a new FBL `place`, Q3 a sentence of DESL, Q4 no split.

Every path carries its repository as prefix. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

**Checks**: before every desktop pull request, `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` and `python tools/sync-etalii-adp.py --check`, with `atd record --check`. Before every etalii.adp pull request, `python .github/scripts/validate-examples.py`, `python .github/scripts/atd-grammar.py --check` and `python .github/scripts/terminology-check.py --name etalii.adp`. A failure stops the pull request. A description's pull request is also checked by diff to touch no file under `conformance/` but a new case (FR-008).

**Format**: `- [ ] T### [P] [US#] description · file path`. `[P]`: parallel with the other `[P]` tasks of its phase. Tests come first in every phase and are seen failing before what they test is written. A tool type's test lists today's differences by name, each correction takes names off it, and only a difference Peter has ruled on stays at the end (FR-007).

---

## Phase 1: Setup

- [x] T001 Have Peter's answers to Q1, Q2, Q3 and Q4 (R21) recorded in research; a list or a language task below follows from them · etalii.adp/specs/076-five-tools-pass/research.md
- [x] T002 Measure R1's table again at the commit that starts, since the description and the runtime may have moved · etalii.adp/specs/076-five-tools-pass/research.md

---

## Phase 2: User Story 1, the behavior model (Priority: P1), pull requests A and B

**Goal**: FR-001, FR-006, FR-010, SC-001 for `agent-behavior-modelling`. **Independent test**: `cargo test -p adp-atd-validate --test agent_behavior`, and `atd validate` on the root.

### Tests first, in B

- [x] T003 [US1] Write the tool type's test as `c4.rs` is, with a list of what each of the 5 cases differs in today, by `step:part`, and with the number of cases held · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/agent_behavior.rs
- [x] T004 [P] [US1] Write the test that a rule's `within` lowers as `specifications/fbl/behavior-tree.fbl` states it, and see it fail · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/lowering.rs
- [ ] T005 [P] [US1] Write the test that an `Add` under a node with a derived id, and a `Move` into one, reach the planner by the id the binding read, and that a person's module gets the same bytes as before · etalii.adp.ide.desktop/crates/adp-diagram/tests/
- [x] T006 [P] [US1] Write the fixture run of `layout.tidyTree` by registering it in the test's expected names, and see it fail · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/capabilities.rs

### The reading and the drawing

- [x] T007 [US1] Lower `within` in a binding's rule (R2) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/fbl.rs
- [x] T008 [US1] Move the tree's `compute` and `pack` into the capability `layout.tidyTree`, with the module calling them there, and register it once its fixtures pass (R3) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/tidy_tree.rs, etalii.adp.ide.desktop/modules/diagrams/agent-behavior-modelling/src/layout.rs
- [x] T009 [US1] Run DISL's standard algorithm `tidyTree` through that code, with `spacing` as its gaps and `rows.stored` and `rows.minGap` from the registration's positions, and read a node's `size.default` (R3) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] T010 [US1] Add `attribute implicit from value "false"` to the rule `do`, and `args: { label: label }` to the menu's Rename, with the companion and the trace (R5) · etalii.adp/definitions/diagrams/agent-behavior-modelling.abm.atd, agent-behavior-modelling.notation.atd, agent-behavior-modelling.md, agent-behavior-modelling.trace.json

### The gestures

- [x] T011 [US1] Address the parent of an `Add` and the new parent of a `Move` by the id the binding read (R4) · etalii.adp.ide.desktop/crates/adp-diagram/src/document.rs
- [x] T012 [US1] Name a created element by the id it reads as once the edit is written, in what an operation hands back, with a test of `editLabel` on a new node under a derived id (R4) · etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs, etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [x] T013 [US1] Have a `connect` step that names the wire id of a derived relation's `edits.connect` run that operation, with its refusals, and test it on `refusals` steps 3 to 6 (R6) · etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs
- [x] T014 [US1] Write the test of a retype through a `bullets` binding as one `re-emit-line`, the item's continuation and children staying; then plan a declared retype as FBL §6.4 states, with its fixtures run · etalii.adp.ide.desktop/crates/adp-fbl/src/planning/planner.rs, etalii.adp.ide.desktop/crates/adp-fbl/src/planning/tests.rs
- [x] T015 [US1] Commit a form's `kind: type` row, reading its `refusals` before its options (R6) · etalii.adp.ide.desktop/crates/adp-disl/src/derivation/form_commit.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs
- [x] T016 [US1] Run the menu kinds `moveUp` and `moveDown` (R6) · etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs
- [x] T017 [US1] Give `self.view` of a description's element from the registration's positions and the layout's bounds, so that `n.view.pinned` and `candidate.view.bounds` read (DISL §11.6, R6) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] T018 [US1] Run a drop's and a `create`'s `place`, a parent placement of DISL §9.1, with its `refusal` (R6) · etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs, etalii.adp.ide.desktop/crates/adp-disl/src/behavior/
- [x] T019 [US1] Correct in the description what the steps then show, and take to Peter what no description can state (FR-007, edge cases) · etalii.adp/definitions/diagrams/agent-behavior-modelling*.atd
- [x] T086 [US1] Specify FBL 0.19's `place` `under-heading` for the bullets family, the first item of a section that holds none written right after its heading, with its fixture and the reference validator reading it, ATD's C.3 following (Q2, FR-009) · etalii.adp/specifications/fbl/FBL-specification.md, etalii.adp/specifications/fbl/fbl.schema.json, etalii.adp/specifications/fbl/fixtures/bullets-under-heading/, etalii.adp/.github/scripts/validate-examples.py, etalii.adp/specifications/atd/ATD-specification.md
- [x] T087 [US1] Write the test that the bullets planner writes a first item `under-heading` right after the heading, and `last-child` as before, and see it fail; then plan it, with the fixture run (Q2) · etalii.adp.ide.desktop/crates/adp-fbl/src/families/bullets/mod.rs, etalii.adp.ide.desktop/crates/adp-fbl/tests/
- [x] T088 [US1] Have the binding place a root `under-heading`, in the description and in `behavior-tree.fbl`, and see `empty-section` step 1's bytes pass (Q2) · etalii.adp/definitions/diagrams/agent-behavior-modelling.abm.atd, etalii.adp/specifications/fbl/behavior-tree.fbl
- [x] T020 [US1] List by name, with its reason, only what Peter has ruled on: `read:findings` of `no-behavior` and `empty-section` (Q1, listed by default) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/agent_behavior.rs
- [x] T021 [US1] Vendor A's merge commit · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/vendor/etalii.adp.lock

**Checkpoint**: all 5 cases pass, but for what Peter has ruled on. Today 0, and 1 by R1's corrections. *Reached 2026-11-05* (etalii.adp #712, desktop #155): 3 pass, and `no-behavior` and `empty-section` differ only at `read:findings`, listed by default (Q1). T004's test is in `crates/adp-atd-runtime/tests/tool.rs`, beside the mind map's; T005's session behaviour is held by the behavior model's cases and the parity goldens, with no test of its own yet.

---

## Phase 3: User Story 1, the causal loop diagram (Priority: P1), pull requests C and D

**Goal**: FR-001, FR-006, FR-009, FR-010, SC-001. **Independent test**: `cargo test -p adp-atd-validate --test causal_loop`.

- [x] T022 [US1] Write the tool type's test, with today's differences of its 4 cases listed · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/causal_loop.rs
- [x] T023 [P] [US1] Write the test that a variant with an `id` compiles as the same curve bowed otherwise, and that a variant changing anything else is still refused · etalii.adp.ide.desktop/crates/adp-scene/src/notation/
- [x] T024 [P] [US1] Write `layout.ring`'s contract: the seating by a depth-first walk of the relations, its start, its direction and its separation, as `ring.rs` does them · etalii.adp/specifications/atd/capabilities/layout.ring/contract.json
- [x] T025 [P] [US1] Add `layout.ring` to ATD §13's catalogue, with a line in *Changes* (FR-009, R8) · etalii.adp/specifications/atd/ATD-specification.md
- [x] T026 [US1] Add `layout.ring` to `atd record --capability`, from the module's `ring::compute` on every causal loop document of its parity scripts · etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/capability/ring.rs, etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/capability/mod.rs
- [x] T027 [US1] Record its fixtures from D's branch, for C (R22); never by hand · etalii.adp/specifications/atd/capabilities/layout.ring/fixtures/
- [x] T028 [US1] Allow a variant's `id` (R7) · etalii.adp.ide.desktop/crates/adp-scene/src/notation/compile.rs
- [x] T029 [US1] Move `ring.rs` into the capability, the module calling it there, registered once its fixtures pass, with the variable's fitted size given as its input (R8) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/ring.rs, etalii.adp.ide.desktop/modules/diagrams/causal-loop-diagram/src/
- [x] T030 [US1] Name the capability in the description's layout and in its `requires`, and close gap 5 in the companion, with the trace (R8) · etalii.adp/definitions/diagrams/causal-loop-diagram.notation.atd, causal-loop-diagram.atd, causal-loop-diagram.md, causal-loop-diagram.trace.json
- [x] T031 [US1] Give the session a description's unreadable entries as `std.unreadableEntry`, with their line and their text, the built-in's `code` and `message` wording them, and see `findings` pass (R9) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs
- [x] T032 [US1] Write the test of the extension point `arrange`: `arrange.selfOrganising`'s fixtures, its budget's refusal, and a `move` action per element · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/capabilities.rs
- [x] T033 [US1] Move `self_organizing.rs` into the capability, with the trait of its extension point, the module calling it there, registered once its fixtures pass (R10) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/self_organising.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/mod.rs, etalii.adp.ide.desktop/modules/diagrams/causal-loop-diagram/src/
- [x] T034 [US1] Carry out `HostAction::Plugin` through a `DiagramModule` method, which `RuntimeModule` answers with the capability's moves as registration writes, one undo, and see `on-call` steps 1, 2, 3 and 7 pass (R10) · etalii.adp.ide.desktop/crates/adp-diagram/src/module.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] T035 [US1] Vendor C's merge commit, and empty the test's list · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/causal_loop.rs

**Checkpoint**: all 4 cases pass. Today 0, and 3 by R1's corrections. *Reached 2026-11-05* (etalii.adp #714, #716, desktop #155). The Variable style states the padding its width is fitted with, and a `fitWidth` node is seated by its fitted width and drawn at its stated size.

---

## Phase 4: User Story 1, the hype cycle graph (Priority: P1), pull requests E and F

**Goal**: FR-001, FR-006, FR-010, SC-001. **Independent test**: `cargo test -p adp-atd-validate --test hype_cycle`.

- [x] T036 [US1] Write the tool type's test, with today's differences of its 4 cases listed · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/hype_cycle.rs
- [ ] T037 [P] [US1] Write the test of a time axis: a `yearMonth` value to canvas and back, in each `@unit`, on both sides of the origin · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/tool.rs
- [ ] T038 [P] [US1] Write the test that a change constraint refuses a property with its message and that a change hook's sets are one edit with it, on a description; and the test that a hand-written module sees neither (FR-010, R14) · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/tool.rs, etalii.adp.ide.desktop/crates/adp-diagram/tests/
- [x] T039 [US1] Read a time axis's scale as `{unit, size}` and its origin, in both directions, and write a gesture's value as the axis's value type (R13) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] T040 [US1] Read a placement's `offset`, and give the anchored point as the case records it, the Wardley map's list held (R16) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/databricks_wardley.rs
- [x] T041 [US1] Add the `DiagramModule` method that says the session runs a description's change rules, on in `RuntimeModule` only; run `gestures::change` with the domain value, and `hooks::after_change` on the assigned working element, in one edit (R14) · etalii.adp.ide.desktop/crates/adp-diagram/src/module.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [x] T042 [US1] Read `std.endpoints`' `refusal` for a connect gesture before an id is drawn, and see `refusals` steps 5, 6 and 7 pass (R15) · etalii.adp.ide.desktop/crates/adp-disl/src/derivation/gestures.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs
- [x] T043 [US1] Add a hook on connect for `Influence` that writes its ends as `edits.rs` does, the phases named, and say so in the companion and the trace (R15) · etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.atd, gartner-hype-cycle-graph.md, gartner-hype-cycle-graph.trace.json
- [x] T044 [US1] Give `position_in` from the description's axes and its snapping, a drop's `byGesture` included, and see steps 16, 19 and 20 of `coal-technologies` write the module's row and date (R16) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [ ] T045 [US1] Move `arrangement.rs` into the runtime as DISL's standard `rows`, the module calling it there, and answer a `layout` action with it, with a test against `coal-technologies` step 33 (R16) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/rows.rs, etalii.adp.ide.desktop/modules/diagrams/gartner-hype-cycle-graph/src/arrangement.rs
- [x] T047 [US1] Correct in the description what the steps then show, among them the module's clamp of a boundary and its range checks, and take to Peter what no description can state · etalii.adp/definitions/diagrams/gartner-hype-cycle-graph*.atd
- [x] T048 [US1] Vendor E's merge commit, and empty the test's list but for what Peter has ruled on · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/hype_cycle.rs

**Checkpoint**: SC-001: all 13 cases of the three diagrams pass, but for what Peter has ruled on. *Reached 2026-11-05* (etalii.adp #715, desktop #155): 4 of 4 pass. T045 runs DISL's `rows` through the shared row packer (`adp-layout`'s `row_packing`) rather than moving the module's `arrangement.rs`, which still feeds it its own way; T037 and T038 have no test of their own yet, their behaviour held by the cases and the hand-written module's tests.

---

## Phase 5: User Story 1, the WebAssembly check

**Goal**: story 1, scenario 4, SC-004. In each of B, D and F.

- [x] T049 [US1] Confirm that the Build's WebAssembly step gives the native result for each description, with the capabilities and the extension point registered in that build · etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs, etalii.adp.ide.desktop/crates/adp-atd-lsp/src/

---

## Phase 6: User Story 2, a designer's description can be validated (Priority: P2), pull requests G and H

**Goal**: FR-002, FR-003, FR-006, FR-009, FR-010, SC-002, SC-004. **Independent test**: `atd validate` on `hierarchical-requirement.atd` runs and reports each case; `cargo test -p adp-atd-validate --test hierarchical_requirement`.

### Tests first, in H

- [ ] T050 [US2] Write the tool type's test: all 12 cases, today's differences listed, and that a designer no longer answers "has no runtime" · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/hierarchical_requirement.rs
- [ ] T051 [US2] Write the seeded differences: a copy of the description with one seeded difference each, in a binding rule's attribute, a constraint's rule and an operation's action, each reporting exactly one difference at that construct (story 2, scenario 3) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/validate.rs
- [ ] T052 [P] [US2] Write the test that a lowered designer has its operations, constraints and ids, with `document` read as the diagram and a reserved attribute kept under an internal name that the reading shows as its own · etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/lowering.rs
- [ ] T053 [P] [US2] Write the test of the `counter` strategy: a number from the mark line, a placeholder numbered with the next edit in reading order, the mark written, `std.missingId` with its sentence · etalii.adp.ide.desktop/crates/adp-disl/tests/

### The language

- [ ] T054 [US2] State in ATD §2.3 what a designer's case states of a finding, `code` where a diagram's states `rule` · etalii.adp/specifications/atd/ATD-specification.md, etalii.adp/specifications/atd/atd.schema.json
- [ ] T055 [US2] State in DESL what a host names an element read with a placeholder, `line/<line>`, in one sentence, as a minor version with its fixture, and that every earlier designer means the same (Q3, FR-009) · etalii.adp/specifications/desl/DESL-specification.md, etalii.adp/specifications/desl/desl.schema.json

### The runtime

- [ ] T056 [US2] Lower a designer's description as `lowering::load_designer`: the guard lifted for `designer`, `document.elementsOfType` as `diagram.nodesOfType`, a name DISL §2.2 reserves under an internal one, no notation and a tool with no drawing (R17) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/designer.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/mod.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [ ] T057 [US2] Map DESL's `reorder`, `move` with its slot and `set` on the document onto what the runner does, and run a designer's built-in constraints (DESL §6, §8.2) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/designer.rs
- [ ] T058 [US2] Implement the `counter` strategy (DESL §5.3.5): `prefix`, `digits`, `mark`, `placeholder`, `missing: assign`, offered to a lowered designer only · etalii.adp.ide.desktop/crates/adp-disl/src/model/builder.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/designer.rs
- [ ] T059 [US2] Read the registration's blocks as elements with the description's derived ids, and write them through `OpenDocument`, for `tag/…`, `category/…`, `state/…`, `filter/…`, `column/…` and `collapsed` (FBL §8.4) · etalii.adp.ide.desktop/crates/adp-diagram/src/document.rs, etalii.adp.ide.desktop/crates/adp-atd-runtime/src/tool.rs
- [ ] T060 [US2] Take a step's `args` for an operation of several parameters, and run a step with no selection on the document · etalii.adp.ide.desktop/crates/adp-diagram/src/session.rs, etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [ ] T061 [US2] Have the validator's reading keep a `many` attribute a list and show a stated default, and compare a designer's finding by `code`, with no drawing · etalii.adp.ide.desktop/crates/adp-atd-validate/src/parts.rs, etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [ ] T062 [US2] Replay an `outside` step on the working copies, with the history starting afresh, and word a write over a changed file as the watcher does (ATD §2.3) · etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs, etalii.adp.ide.desktop/crates/adp-diagram/src/workspace.rs
- [ ] T063 [US2] Let `validate_description` run a designer, and the WebAssembly check validate it rather than report it cannot, with the native result (FR-002, SC-004) · etalii.adp.ide.desktop/crates/adp-atd-validate/src/cases.rs, etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs
- [ ] T046 [US2] Report in the pull request each place where the lowering had to say more than a name, and take the list to Peter if it shows DESL and DISL meaning different things (R17) · etalii.adp/specs/076-five-tools-pass/research.md
- [ ] T064 [US2] Correct in the description what the steps then show, with its trace and companion, and take to Peter what no description can state · etalii.adp/definitions/designers/hierarchical-requirement*.atd, hierarchical-requirement.md, hierarchical-requirement.trace.json
- [ ] T065 [US2] Vendor G's merge commit, empty the test's list but for what Peter has ruled on, and report any case's time · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/hierarchical_requirement.rs

**Checkpoint**: SC-002 holds, every write byte-identical.

---

## Phase 7: User Story 3, the Knowledge designer (Priority: P3), pull requests I, J and K

**Goal**: FR-004, FR-005, FR-006, FR-008, SC-003, SC-004. Takes over spec 035's T063 for this designer, and T064. **Independent test**: `atd check` and `atd validate` on `knowledge.atd`, and `atd record --check`.

### The recorder and its scripts, I

- [ ] T066 [US3] Write the test that `atd record etalii/knowledge` gives a case for each script, whose bytes equal the script's goldens, and see it fail · etalii.adp.ide.desktop/crates/adp-atd-cli/tests/record.rs
- [ ] T067 [US3] Record a designer of the `table` kind, its steps translated from `table` gestures to the operations of `knowledge.md`'s table, its reading the model's elements, its documents kept as inputs; name what cannot be translated · etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/table.rs, etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/mod.rs
- [ ] T068 [P] [US3] Add a parity script of refusals from the module, one step for each sentence it refuses with in `command.rs`, `edits.rs` and `validator.rs`, with its goldens · etalii.adp.ide.desktop/parity/scripts/etalii/knowledge/refusals.json, etalii.adp.ide.desktop/crates/adp-parity/
- [ ] T069 [P] [US3] Add a parity script over a body with each of `knowledge.md`'s findings, with its goldens · etalii.adp.ide.desktop/parity/scripts/etalii/knowledge/findings.json, etalii.adp.ide.desktop/crates/adp-parity/

### The description, J

- [ ] T070 [US3] Write the model, the persistence and the table surface from `knowledge.des`, with `atd check` clean at each step · etalii.adp/definitions/designers/knowledge.atd
- [ ] T071 [P] [US3] Write the three bindings from `knowledge.fbl`, each a part, a test holding the lowered form equal to the file · etalii.adp/definitions/designers/knowledge.yaml.atd, knowledge.json.atd, knowledge.xml.atd
- [ ] T072 [US3] Write the 55 operations and the constraints from `knowledge.des` and `knowledge.md`, with `knowledge.parent-cycle` as a script function (R20; spec 035, T064) · etalii.adp/definitions/designers/knowledge.atd
- [ ] T073 [US3] Write the trace, and say in the companion what the description cannot state and why that is no language gap (FR-004, R20) · etalii.adp/definitions/designers/knowledge.trace.json, etalii.adp/definitions/designers/knowledge.md, etalii.adp/definitions/designers/README.md
- [ ] T074 [US3] Record the cases with I's `atd record`, on a branch of the desktop named as J: reading, writes, undo, refusals and findings, in each format, never by hand (FR-005, FR-008) · etalii.adp/definitions/designers/conformance/knowledge/

### The validation, K

- [ ] T075 [US3] Write the tool type's test, with every case and what it differs in listed, and see it fail · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/knowledge.rs
- [ ] T076 [US3] Run a lowered table designer: nested `Cell` and `CellItem` elements, the three families, and a relation's row of another file read as a plain id (R20) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/designer.rs, etalii.adp.ide.desktop/crates/adp-atd-validate/src/parts.rs
- [ ] T077 [US3] Correct in the description until each case passes, and take to Peter what no description can state · etalii.adp/definitions/designers/knowledge*.atd
- [ ] T078 [US3] Vendor J's merge commit, empty the test's list but for what Peter has ruled on, and confirm that the WebAssembly check gives the native result (SC-004) · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/knowledge.rs, etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs

**Checkpoint**: SC-003 holds.

---

## Phase 8: Polish, pull request L and the last desktop pull request of each story

- [ ] T079 [P] Write the test for SC-005 in each tool type's file: a name removed from a list fails it and a difference not listed fails it, by the shape `c4.rs` has; confirm by seeding one in a copy (SC-005) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/
- [ ] T080 [P] Confirm that a person's document still opens on today's module for each of the five, and that every existing test and parity golden is green (FR-010, SC-006) · etalii.adp.ide.desktop/crates/adp-shell/src/shell.rs, etalii.adp.ide.desktop/crates/adp-parity/
- [ ] T081 [P] Add what moved and what is validated to the parity inventory and to what the desktop's runtimes state of themselves · etalii.adp.ide.desktop/parity/inventory.md, etalii.adp/hosts/desktop/specification-runtimes/
- [ ] T082 [P] Record the last measures beside R1's · etalii.adp/specs/076-five-tools-pass/research.md
- [ ] T083 Update spec 035's own tasks: its T063 and T064 ticked when story 3 is done, its T093's 36th root, its T125 for what moved, and what its T121 and T132 still wait on · etalii.adp/specs/035-adp-tool-language/tasks.md
- [ ] T084 Mark the feature's status, and regenerate ThinkRail's copy · etalii.adp/specs/076-five-tools-pass/.spec-context.json, etalii.adp/thinkrail/
- [ ] T085 Tick the merged tasks in one pull request · etalii.adp/specs/076-five-tools-pass/tasks.md

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T003 to T021, T022 to T035, T036 to T048 |
| FR-002 | T050, T056, T060 to T063, T049 |
| FR-003 | T050, T056 to T065, T046 |
| FR-004 | T070 to T073 |
| FR-005 | T066 to T069, T074 to T077 |
| FR-006 | T003, T022, T036, T050, T075, T079 |
| FR-007 | T001, T019, T020, T047, T048, T064, T065, T077, T078 |
| FR-008 | T027, T074, and the Checks line of this file |
| FR-009 | T024, T025, T054, T055, T086 |
| FR-010 | T005, T038, T041, T080 |
| SC-001 | T003, T020, T035, T048 |
| SC-002 | T050, T051, T065 |
| SC-003 | T070 to T078 |
| SC-004 | T049, T063, T078 |
| SC-005 | T051, T079 |
| SC-006 | T005, T038, T080, and the Checks line of this file |

---

## Dependencies

Phase 1, then each story on its own: a story's etalii.adp pull request merges first, is vendored, and then its desktop pull request merges (plan, *Delivery*). In Phases 2, 3 and 4 the tasks marked for etalii.adp go in A, C and E, and the rest in B, D and F; those three pairs can land in any order, and whichever first needs T041's method carries it. T026 goes before T027, and C opens once D's branch can record. Phase 6 needs T007, carried by H if B has not merged. Phase 7 needs Phase 6, and T074 needs I. T020, T055 and every list need Peter's answers (T001), given on 2026-11-05. T086 goes in A, T087 in B, and T088 in A once B's branch plans it, since the `descriptions` job builds `atd` from B's branch.

**MVP**: Phases 1 to 5, which pass the 13 cases of the three diagrams on runtime that already exists.
