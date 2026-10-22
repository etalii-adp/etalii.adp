# Feature Specification: An Insert Writes a Constant

**Feature Branch**: `features/033-fbl-insert-constant`

**Created**: 2026-10-22

**Status**: FBL 0.8 in etalii.adp ([plan.md](plan.md), [tasks.md](tasks.md)); the hosts follow in their own pull requests (T020 to T034)

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

## Clarifications

### Session 2026-10-22

The maintainer said "make sure all work continues" (2026-10-22, 10:51), and on that the recommended option of each question was taken.

- Q: In which families may a constant be declared? → A: `yaml` and `json` only, on an insert that writes by keys; `emit` already writes literal text everywhere else (FR-008).
- Q: Does a constant take part in reading? → A: No. It only writes; `when` alone decides the match, and a round-trip fixture shows each new entry read back by the rule that added it (FR-009).
- Q: How is a retype between two rules that differ by their constant planned? → A: As today: a remove and an add under the new type's rule (section 6.4), with the host's warning; a retype in place stays with `supply-chain-disl-fbl` gap 6 (FR-010).

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
- **A rule whose `when` does not hold for the entry its insert writes.** A binding can declare `type: comment` while its `when` asks for `type == 'ui-element'`; the new entry would then be read by another rule, or by none. The binding is valid all the same: a constant only writes and `when` alone decides the match (Q2), so keeping the two in agreement is the tool engineer's, and a round-trip fixture is what shows it.
- **A retype.** A retype in a family with keys is planned as a remove and an add under the new type's rule (section 6.4), so the new entry carries the new rule's constant, and the host warns as section 11.2 says (Q3). A retype that only replaces the constant's value, keeping the entry's other keys, is not in this feature.
- **A constant on a rule without an `insert`.** Such a rule cannot add, so a constant is meaningless there; the constant belongs to the insert.
- **A constant that is a mapping or a list.** The need is a scalar. A structure a new entry needs, such as a Databricks task's `notebook_task`, is what `skeleton` already writes.
- **A constant reached through `child`.** The need is a key of the entry itself. A nested key is not in scope.
- **The entry is edited by hand.** A user who edits the key in the file changes how the entry reads, as today; FBL never rewrites a constant after the add.
- **An `emit` family.** In `lines`, `blocks`, `xml` and `bullets`, and for a json item written on one line, `emit` writes literal text, which already serves, and a constant is not offered there (Q1). An insert that writes its entry with `emit` in a json body writes its literal text with `emit` too.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: An element rule's or relation rule's insert **MUST** be able to declare one or more constants: a key of the new entry and the scalar value it is written with, which no attribute of the rule supplies. The construct's name and shape are the plan's; the standalone draft calls it `constant`.
- **FR-002**: A new entry written by that insert **MUST** carry every constant of it, in the same insert-entry splice as its other keys, so that it is added, undone and redone with the entry and no other splice is planned for it.
- **FR-003**: A constant **MUST** take its place among the new entry's keys from the insert's key order when that order names its key, and **MUST** have a place FBL states when the order does not, so that every host writes the same bytes.
- **FR-004**: A constant's value **MUST** be written by the rules of section 6.3 for a new value of its kind (a string by the yaml scalar and json value rules, a number by the number rules, a bool as itself), and **MUST** read back through the same body's reading as the same value.
- **FR-005**: A constant **MUST NOT** be written by any edit other than the add that creates its entry: a set, a move or a rename leaves the constant's key and value as they are, and a remove removes it with the entry.
- **FR-006**: A binding **MUST** be refused when it is loaded if a constant's key is also the key a writable attribute binding of the same rule writes. A read-only attribute binding **MAY** read the constant's key.
- **FR-007**: Section 5.2's rule that a `fixed` DISL attribute **MUST NOT** be bound **MUST** stay as it is, and the specification **MUST** say that a value of the file's layout that no attribute holds is written with a constant instead.
- **FR-008**: The families in which a constant may be declared **MUST** be the `yaml` and `json` families, and only an insert that writes its entry by keys rather than by `emit`; the specification and the schema **MUST** refuse a constant anywhere else (Q1).
- **FR-009**: The specification **MUST** say that a constant only writes: it takes no part in reading, and `when` alone decides which rule matches an entry, so that the reading of a body is the same with or without an `insert`. The round-trip fixtures of FR-011 **MUST** show each new entry read back by the rule that added it (Q2).
- **FR-010**: The specification **MUST** plan a retype between two rules that differ by their constant as section 6.4 plans every retype in these families: a remove and an add under the new type's rule, the new entry carrying the new rule's constants, with the host's warning (Q3).
- **FR-011**: The round-trip fixtures **MUST** include an add of an entry of each of two rules that share a container and differ by their constant, with the constant at its place in the key order and one constant whose key the order does not name, in the yaml family and in the json family; and the examples **MUST** include a binding the validator refuses under FR-006.
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
