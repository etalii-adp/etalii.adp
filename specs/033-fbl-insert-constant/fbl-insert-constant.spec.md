# Feature Specification: An Insert Writes a Constant

**Feature Branch**: `features/033-fbl-insert-constant`

**Created**: 2026-10-22

**Status**: Draft

**Input**: Gap 2 of the conversion specification `functional-decomposition-graph-disl-fbl` of `etalii.adp.ide.standalone`, which plans with spec-workflow: `.spec-workflow/specs/functional-decomposition-graph-disl-fbl/requirements.md` at commit `592827920`, finding B3 and section C, gap 2 ("a rule chosen by a value cannot write that value"), and the same specification's `design.md` (*The stand-ins*) and `tasks.md` task 9, which waits on "a constant written by an `insert`". The maintainer ruled on 2026-10-22 ("Specify gap 2") that FBL gets that construct.

## Context

Many hand-written YAML and JSON formats keep entries of several kinds in one list and tell them apart by a key whose value names the kind. The functional decomposition graph's `.fdg` file is one: every entry of `elements` has a `type` key, `ui-element`, `data-element`, `action`, `function` or `comment`, and every entry of `connections` likewise names its relation. The tool writes `type` as the second key of a new entry, after `id`.

FBL 0.7 reads such a file well. A binding gives each kind a rule of its own, told apart by `when` (section 5.1: "rules of the same node type are how a type is written in several shapes"), and `persistence.typeMap` maps each rule's type onto the metamodel (DISL §11.2).

FBL 0.7 cannot **write** such a file. When a user adds a UI element, the new entry has to carry `type: ui-element`, and nothing in the binding can put it there:

- `insert.keys` (section 6.2) orders the keys of attributes, and "a key the new entry has no value for is left out". The kind is not an attribute: it is what chose the rule, and no attribute holds it.
- An attribute that held it would put a detail of the file's layout into the metamodel, as a value a user could see or edit. The construct DISL has for a value that is the same for every element of a type, `fixed` (DISL §4.3), **MUST NOT** be bound (section 5.2, last paragraph; section 14.1, check 6).
- `{value: cel}` is read-only and never written (section 3.3).
- `skeleton` writes fixed text after the keys (section 6.2), so it cannot put `type` second, and it writes text rather than a value, which a JSON body would also need separators and quoting for.
- `emit` writes literal text, but only in the families without keys (`lines`, `blocks`, `xml`, `bullets`) and for JSON items written on one line.

So a binding that reads ten kinds from one list cannot add any of them, and a tool converted to FBL would lose its add gestures or keep its own writer in module code. The functional decomposition graph's conversion waits on this (task 9), and its binding draft already marks the place, as a property that is not FBL.

### What this feature is not

- **Not a rule whose type is read from a key.** The requirements list a second candidate for gap 2: one rule whose `type` is read from a key through a map, which would make ten rules two. That is a change to how a body is read, and is the same need as `supply-chain-disl-fbl`'s gap 6 ("one binding type read as several model types by the value of a key, retyped in place"). The ruling names the constant written by an insert; the other candidate stays a gap of its own.
- **Not gap 1.** A slot that reads a scalar as written is FBL 0.5 (section 4.1.5, the written text; section 5.2, `read`), specified as spec [015](../015-fbl-scalar-as-written/), whose input names this same conversion's finding B1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A new entry carries the value that chose its rule (Priority: P1)

A tool engineer writes a binding whose rules share one list and are told apart by the value of a key. For each rule they declare, once, the key and value a new entry of that rule carries. A user who adds an element of that kind gets an entry with that key and value, at the place among its keys that the binding names, and the entry reads back as an element of the same rule.

**Why this priority**: it is the whole of the gap. Without it the binding cannot add an element of any kind its list holds.

**Independent Test**: a round-trip fixture adds one entry of each of two rules that share a container and differ by the value of one key, and states the splices: each new entry holds its rule's value at the stated place among its keys. Read again through the same binding, each new entry is an element of the rule that added it.

**Acceptance Scenarios**:

1. **Given** a rule that declares a constant `type: ui-element` and orders its new keys `id`, `type`, `name`, **When** a user adds an element of that rule with a name, **Then** the new entry is `id`, `type: ui-element`, `name`, in that order.
2. **Given** two rules over the same list that declare different constants for the same key, **When** a user adds an element of each, **Then** each new entry holds its own rule's value.
3. **Given** a new entry written with a constant, **When** the body is read again, **Then** the entry is matched by the rule that added it, and its element has the attributes the add gave it.
4. **Given** a constant whose value is not plain-safe in YAML (such as `yes` or `1.0`), **When** it is written, **Then** it is written as section 6.3 writes a new value of that kind, so that it reads back as the same value.
5. **Given** an add of an element with a constant, **When** the user undoes it, **Then** the entry, its constant with it, is gone, and a redo writes the same bytes again.
6. **Given** an element added with a constant, **When** the user changes one of its attributes, **Then** the constant's key is left as it is.

---

### User Story 2 - A binding that misuses a constant is refused when it is loaded (Priority: P2)

A tool engineer who gives a constant a key that the same rule also writes through an attribute is told so when the binding is loaded, not when a user's add writes the key twice.

**Why this priority**: the one-place rule (section 3.3) is what makes write-back defined; a constant that also had a writable slot would be two places for one key.

**Independent Test**: the validator refuses an example binding whose constant's key is also the key of a writable attribute binding of the same rule, and accepts the same binding with that attribute read-only.

**Acceptance Scenarios**:

1. **Given** a rule whose constant's key is the key of one of its writable attribute bindings, **When** the binding is loaded, **Then** it is refused, naming the rule and the key.
2. **Given** a rule whose constant's key is read by a read-only attribute binding, **When** the binding is loaded, **Then** it is accepted, and the attribute reads the value the entry holds.
3. **Given** a constant on a rule of a family where it is not allowed, **When** the binding is loaded, **Then** it is refused, as the schema says.

---

### User Story 3 - A host can be checked against it (Priority: P3)

A host implementer runs FBL's round-trip fixtures and learns whether their insert writes a constant where and as FBL says, without reading another host's code.

**Why this priority**: two hosts that place a key differently write different bytes for the same add, which is what section 6.3 exists to prevent.

**Independent Test**: the new fixtures replay through `python .github/scripts/validate-examples.py`, and a fixture with one planted wrong offset fails it.

**Acceptance Scenarios**:

1. **Given** the new fixtures, **When** the validator runs, **Then** their splices and inverses replay to the bodies they state.
2. **Given** a host that writes the constant after every other key instead of at its place in the key order, **When** it runs the fixture, **Then** its splices differ from the fixture's.

### Edge Cases

- **A constant's key not named in the key order.** The binding gives the new keys an order and the constant's key is not in it. The new entry still carries it, at a place FBL states, so that two hosts write the same bytes.
- **A rule with a constant and a `skeleton`.** Both are written; the constant is a key of the entry like the others, and the skeleton follows the keys as today.
- **A rule whose `when` does not hold for the entry its insert writes.** A binding can declare `type: comment` while its `when` asks for `type == 'ui-element'`; the new entry would then be read by another rule, or by none. How FBL treats that is clarification Q2.
- **A retype.** A retype in a family with keys is planned as a remove and an add under the new type's rule (section 6.4), so the new entry carries the new rule's constant. Whether a retype between two rules over the same list should instead only replace the constant's value is clarification Q3.
- **A constant on a rule without an `insert`.** Such a rule cannot add, so a constant is meaningless there; the constant belongs to the insert.
- **A constant that is a mapping or a list.** The need is a scalar. A structure a new entry needs, such as a Databricks task's `notebook_task`, is what `skeleton` already writes.
- **A constant reached through `child`.** The need is a key of the entry itself. A nested key is not in scope.
- **The entry is edited by hand.** A user who edits the key in the file changes how the entry reads, as today; FBL never rewrites a constant after the add.
- **An `emit` family.** In `lines`, `blocks`, `xml` and `bullets`, and for a json item written on one line, `emit` writes literal text, which already serves; whether the constant is also offered there is clarification Q1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: An element rule's or relation rule's insert **MUST** be able to declare one or more constants: a key of the new entry and the scalar value it is written with, which no attribute of the rule supplies. The construct's name and shape are the plan's; the standalone draft calls it `constant`.
- **FR-002**: A new entry written by that insert **MUST** carry every constant of it, in the same insert-entry splice as its other keys, so that it is added, undone and redone with the entry and no other splice is planned for it.
- **FR-003**: A constant **MUST** take its place among the new entry's keys from the insert's key order when that order names its key, and **MUST** have a place FBL states when the order does not, so that every host writes the same bytes.
- **FR-004**: A constant's value **MUST** be written by the rules of section 6.3 for a new value of its kind (a string by the yaml scalar and json value rules, a number by the number rules, a bool as itself), and **MUST** read back through the same body's reading as the same value.
- **FR-005**: A constant **MUST NOT** be written by any edit other than the add that creates its entry: a set, a move or a rename leaves the constant's key and value as they are, and a remove removes it with the entry.
- **FR-006**: A binding **MUST** be refused when it is loaded if a constant's key is also the key a writable attribute binding of the same rule writes. A read-only attribute binding **MAY** read the constant's key.
- **FR-007**: Section 5.2's rule that a `fixed` DISL attribute **MUST NOT** be bound **MUST** stay as it is, and the specification **MUST** say that a value of the file's layout that no attribute holds is written with a constant instead.
- **FR-008**: The families in which a constant may be declared **MUST** be stated in the specification and in the schema: [NEEDS CLARIFICATION: Q1, the yaml and json families only, those and xml, or every family].
- **FR-009**: The specification **MUST** say how a constant relates to the rule's matching: [NEEDS CLARIFICATION: Q2, whether a constant only writes, with `when` alone deciding the match, or also takes part in matching].
- **FR-010**: The specification **MUST** say how a retype between two rules that differ by their constant is planned: [NEEDS CLARIFICATION: Q3, as today's remove and add, or as one replacement of the constant's value].
- **FR-011**: The round-trip fixtures **MUST** include an add of an entry of each of two rules that share a container and differ by their constant, with the constant at its place in the key order and one constant whose key the order does not name, in every family where a constant is allowed; and the examples **MUST** include a binding the validator refuses under FR-006.
- **FR-012**: The change **MUST** be a new FBL version, 0.8, its status paragraph saying what it adds and that every valid 0.7 document is a valid 0.8 document with the same meaning; the schema and the examples change in the same pull request (constitution, principle II).
- **FR-013**: No other specification language changes: DISL and DESL need no construct for this, and `persistence.typeMap` maps a rule's type as before.

### Key Entities

- **Constant**: a key and a scalar value that an insert writes into every new entry of its rule, and that no attribute of the rule's type holds.
- **Kind key**: the key whose value tells apart rules that share a container, such as `type` in an `.fdg` file. A constant is how a rule writes its own value of that key; FBL does not name such a key specially.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reader of section 6.2 alone can say, for an insert with a constant, which bytes its new entry gets and in which order its keys stand.
- **SC-002**: The functional decomposition graph's binding draft (the requirements' appendix) can be written in valid FBL 0.8 for its adds: every one of its insert properties that is "not FBL" today has an FBL construct.
- **SC-003**: The new fixtures pass the validator, and fail it with one planted wrong offset.
- **SC-004**: Every existing example and fixture still passes the validator unchanged.
- **SC-005**: Task 9 of `functional-decomposition-graph-disl-fbl` in `etalii.adp.ide.standalone` can point at the section that defines the construct, so that its library step (L6) has a rule and a fixture to implement against.

## Assumptions

- The maintainer's ruling of 2026-10-22 decides that the construct is added; this feature writes down what it means.
- A constant's value is a scalar: a string, a number, a bool or null. Structures stay `skeleton`'s.
- A constant is a key of the new entry itself, not of a mapping inside it.
- The hosts change under their own specifications: `etalii.adp.ide.standalone` in `functional-decomposition-graph-disl-fbl` task 9 (L6), with this feature's fixtures as its guard; Visual Studio Code and IntelliJ under their FBL implementation specs, 009 and 010; the Notion add-ons through their copy of the Visual Studio Code library.
- No existing example binding adds an entry whose rule is chosen by a value, so no existing fixture changes its splices.
- Gap 1 of the same conversion, a slot that reads a scalar as written, is answered by FBL 0.5 and is not part of this feature; the conversion's binding draft, written against FBL 0.2, says `"as": "text"` where FBL 0.5 says `read: "text"` or nothing for a string attribute.

## Clarifications needed

### Q1: In which families may a constant be declared? (FR-008)

| Option | Answer | Implications |
|--------|--------|--------------|
| A (recommended) | yaml and json | The families with keys, and the ones a current tool needs (the `.fdg` file is yaml). Constitution principle V asks for no more. `emit` already writes literal text everywhere else. |
| B | yaml, json and xml (as an attribute of the new element) | Covers an XML format whose elements share a name and differ by an attribute; no current tool needs it, and it adds fixtures in a third family. |
| C | Every family | `lines`, `blocks` and `bullets` would get two ways to write the same literal (`emit` and the constant), which hosts must order against each other. |
| Other | Provide your own answer | |

### Q2: Does a constant take part in reading? (FR-009)

| Option | Answer | Implications |
|--------|--------|--------------|
| A (recommended) | It only writes. `when` alone decides which rule matches an entry; a fixture shows that the new entry reads back by the rule that added it. | The smallest change; reading is untouched, and a binding keeps its `when` and its constant in agreement itself. A binding where they disagree is valid and writes an entry another rule reads. |
| B | It only writes, and a binding **MUST** be refused when its rule's `when` does not hold for the entry its insert writes. | Catches the disagreement at load, but needs the loader to evaluate `when` over an entry made of the constants and placeholder attribute values, which a `when` over attributes cannot always be evaluated against. |
| C | It also matches: an entry is matched by the rule only when it holds the rule's constants, and `when` adds further conditions. | The draft's `when` shrinks to nothing, and the round trip holds by construction, but a property of `insert` changes how a body is read, and a rule without an insert reads differently from one with it. |
| Other | Provide your own answer | |

### Q3: How is a retype between two rules that differ by their constant planned? (FR-010)

| Option | Answer | Implications |
|--------|--------|--------------|
| A (recommended) | As today: a remove and an add under the new type's rule (section 6.4), the new entry carrying the new rule's constant, and the host warns. | Nothing new; keys no attribute holds are lost in the retype, as today. A retype in place is left to the neighbouring gap (`supply-chain-disl-fbl` gap 6). |
| B | When both rules share a container and their bindings write the same keys, as one replacement of the constant's value, and the host does not warn. | Keeps the entry's other keys and its place, as `bullets` already does for a retype through `emit` (0.7), but enlarges this feature into part of gap 6. |
| Other | Provide your own answer | |
