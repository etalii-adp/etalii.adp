# Feature Specification: A DISL Function That Groups a List by Key

**Feature Branch**: `features/075-disl-grouping-function`

**Created**: 2026-11-01

**Status**: Completed (2026-11-06). Every task in [tasks.md](tasks.md) is ticked.

**Input**: Peter ruled on 2026-11-01 that the SKOS case `geographic-names` stays ignored and that a DISL grouping function is proposed as its own specification, and asked for that specification the same day.

## Context

The RDF, OWL, SHACL and SKOS descriptions read Turtle as stored triples, and their rules find what they need by filtering those triples. Each card, id or attribute filters all the triples again, so the work of one reading grows with the square of the number of triples. `w3c-rdf.md` records this as its gap 6.

A body of 157 KB shows the cost: the case `geographic-names` takes the SKOS description's rules 12 minutes in a release build, and they go over their evaluation budget. Spec 067 could not replay that case, so it is ignored in the native test and skipped in the WebAssembly check. `w3c-rdf.md` said this would be a gap only if a measurement on the largest bodies exceeded the cost limit, and this case is that measurement.

A description can say what it means today, but only at this cost. The language needs a way to gather a list by key once and look its groups up afterwards.

### What this feature is not

- **Not a change to what any description means**, but for FR-012's one addition. Every case gives the same result as before, only sooner.
- **Not the SKOS per-language label row.** `turtle-edits-skos` stays a listed quirk (Peter, 2026-11-01).
- **Not a general query language or an index the author manages.** One function, in the existing expression language.
- **Not a raised limit.** The cost limit stays as it is, and the case comes under it.

## Clarifications

### Session 2026-11-02

- Q: Step 2 of `geographic-names` sets a concept's definition, which the description refuses and the module writes. Quirk, or written? → A: Written: the SKOS description writes a definition set through its row, as the module does (Peter; FR-012).
- Q: What is SC-002's bound? → A: 60 seconds (Peter; research R9).
- Q: Does this feature build a validation-time cost estimator? → A: No: no host has one, so DISL states the rule and a too-costly description is caught when it runs (Peter; research R7, FR-005).
- Q: Does building start with the plan? → A: No: Peter holds implementation until he says so.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A tool engineer groups a list in one expression (Priority: P1)

A tool engineer writing a description has a list of elements and a key for each. They group the list once in one expression, then read a group by its key, rather than filtering the whole list again for every key.

**Why this priority**: Everything else rests on the language being able to say this, on every host alike.

**Independent Test**: A set of expression fixtures, each a list, a key and the groups expected, passes on each host that claims the DISL version.

**Acceptance Scenarios**:

1. **Given** a list and a key expression, **When** it is grouped, **Then** each distinct key has one group, holding the items with that key in their list order.
2. **Given** the same list and key, **When** it is grouped on two hosts or twice on one, **Then** the groups, their order and their contents are the same.
3. **Given** a key that is not in the groups, **When** it is read, **Then** the result is an empty group, not a failure.
4. **Given** an item whose key expression fails, **When** the list is grouped, **Then** the failure is handled as the context the expression stands in already handles a failing expression.

---

### User Story 2 - The largest bodies read within the limit (Priority: P1)

A person opens a large vocabulary in the SKOS tool, and a tool engineer validates it. The rules that used to filter the triples for every term now use the groups, so the reading finishes within the cost limit and in a time a person will wait for.

**Why this priority**: This is the reason for the feature. Without it the function is unused.

**Independent Test**: `atd validate` runs the case `geographic-names` on the changed SKOS description, with the time and the cost recorded.

**Acceptance Scenarios**:

1. **Given** the SKOS description using the function, **When** the case `geographic-names` is validated natively, **Then** it finishes within SC-002's bound and no expression goes over its cost limit.
2. **Given** the same case, **When** it is validated through the WebAssembly module, **Then** the result is the native one, and the case is no longer skipped.
3. **Given** the RDF, OWL and SHACL descriptions, **When** they use the function where the same filtering costs most, **Then** all their cases differ only as they are listed today.

---

### User Story 3 - The check tells an engineer what a grouping costs (Priority: P2)

A tool engineer writes a grouping in a description and checks it. The cost estimate treats it as one pass over the list, and a later read of a group as the size of that group, so a description written this way is not refused for a cost it does not have.

**Why this priority**: A check that overstates the cost would refuse the very descriptions this feature exists for, but the function is usable on hand-checked descriptions without it.

**Independent Test**: The check's findings on a description that groups a list of the limit's size are compared with an expected findings file.

**Acceptance Scenarios**:

1. **Given** a description that groups a list and reads its groups, **When** it is checked, **Then** no cost finding names the grouping.
2. **Given** a description that still filters a whole list once per item of it, **When** it is checked, **Then** its findings are as they are today.

### Edge Cases

- An empty list gives no groups, and every read gives an empty group.
- A key may be a string, a number or a boolean. A key of another kind is a failing key.
- A null key is a key like any other only if the plan shows a description needs it; otherwise it is a failing key.
- A grouping written inside a per-item expression costs one pass per item, and the cost estimate says so.
- A list changed by an edit is grouped again: a group never outlives the model state it was read from.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: DISL MUST gain, as a minor version, a function that groups a list by a key expression and gives a value from which a group is read by its key (DISL §12.4), available in every context the list functions are.
- **FR-002**: The groups MUST be deterministic: items within a group keep their list order, and listing the keys gives them in order of first appearance (DISL §12.5).
- **FR-003**: Reading an absent key MUST give an empty group.
- **FR-004**: A failing key MUST be handled as the expression's context already handles a failing expression (DISL §2.5); the function adds no failure handling of its own.
- **FR-005**: The cost of a grouping MUST count as one evaluation of the key per item, and the read of a group as no more than the size of that group, in the run-time cost. DISL MUST state the same rule for a validation-time estimate, which no host has and this feature does not build.
- **FR-006**: Every description valid before MUST stay valid with the same meaning.
- **FR-007**: The specification MUST carry the function with fixtures and with its schema and ATD changes where it has any, and ATD MUST state the DISL version it carries.
- **FR-008**: The desktop host's expression evaluator MUST implement the function, native and WebAssembly alike.
- **FR-009**: The SKOS description MUST use the function so that `geographic-names` runs to its end, and the RDF, OWL and SHACL descriptions MUST use it where the same filtering dominates, leaving no case's expected result changed.
- **FR-010**: The case `geographic-names` MUST then run in the native test and in the WebAssembly check, its remaining differences listed by name as a module's quirk if it has any.
- **FR-011**: `w3c-rdf.md`'s gap 6 MUST be closed or, if a body still goes over, say which and by how much.
- **FR-012**: The SKOS description MUST write a concept's definition set through its row `skos.doc:definition`, with the bytes the module writes, so that step 2 of `geographic-names` is no longer refused.

### Key Entities

- **Grouping**: a list gathered by a key expression, with its keys in order of first appearance and one group per key.
- **Group**: the items of the list with one key, in list order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every fixture of the function passes on the desktop host, native and WebAssembly.
- **SC-002**: `geographic-names` validates natively in under 60 seconds in a release build (13 minutes today), with no expression over its cost limit and no reading over its step budget.

  *Changed by the plan on 2026-11-02, from 30 seconds and "12 minutes today": a prototype takes 36 seconds, of which most is no longer in the expressions, and the case's measured time today is 789 seconds. What stops the card types today is ATD's step budget rather than the cost limit, so the criterion names both ([research R2 and R9](research.md#r9-whether-sc-002s-30-seconds-is-right)).*
- **SC-003**: `geographic-names` runs in the build's native and WebAssembly validation, and neither skips it.
- **SC-004**: The number of cases of the four W3C descriptions that pass does not fall, and no expected result changes.
- **SC-005**: Opening `stw/geographic-names.ttl` and `stw/business-economics.ttl` draws them within the description's budgets, with no finding of a cost exceeded.

## Assumptions

- The cost is in the rules' repeated filtering, as `w3c-rdf.md` says. The plan measures this first, and if something else dominates `geographic-names`, this specification comes back to Peter before anything is built. The plan measured it on 2026-11-02, and it holds: 98% of the time ([research R1](research.md#r1-what-was-measured)).
- 30 seconds was a first bound, chosen because the build runs the case on every pull request; Peter set 60 on 2026-11-02 from what the plan measured (SC-002).
- The standalone host follows under its own specification, as each host has for FBL. Until it does, a description using the function declares the DISL version that says so, and a host at an earlier version treats it as the versioning rules already say.
- The function's name and exact signature are the plan's to propose.
