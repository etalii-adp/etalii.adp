# Feature Specification: DISL 0.2, the declarative additions

**Feature Branch**: `features/004-disl-0-2`
**Created**: 2026-09-30
**Status**: Draft
**Input**: "Use GitHub Spec Kit to specify DISL 0.2. Cover themes 4 and 6 to 13 of the DISL gaps summary: id strategies and unstable ids, findings at file and line plus common rules, refusal and read-only reasons, templated confirmations, gestures, view state, hard budgets, notation, time, and derived nodes from theme 3. A parallel session specifies Format binding (themes 1 to 3, persistence, `.adp` registration, plugin contract) as a separate spec beside DISL; keep that out of scope and align the boundary with it." (Peter chose this on the "DISL gaps for working tools" thread, 2026-09-30, relayed by the project's coordinator.)

## Context

The DISL gaps summary (`disl-gaps/disl-gaps-summary.md` in the project files, 2026-09-30) read the 23 diagram specifications in `definitions/diagrams/` against DISL 0.1. Only the timeline can be run by a generic DISL runtime. The other 22 lean on plugins, on `x-adp` extension keys and on companion notes (`definitions/diagrams/*.md`) for things DISL 0.1 cannot say. The gaps fall into two groups:

- **Where the model comes from and how it is written back** (gaps 1 and 2, and the reading side of gap 3): foreign files, byte-preserving splices, `.adp` registration, view sidecars, one model with several readings, folders as subjects. These belong to **FBL, the Format Binding Language**, a new specification beside DISL in `specifications/fbl/`, specified as feature 005 on `features/005-format-binding`.
- **What the tool is, once it has a model** (gaps 4 and 6 to 13, and derived nodes from gap 3): identity, findings, explanations to the user, gestures, view state, scale, notation, time, and a handful of small items. That is this feature, DISL 0.2.

Layouts (gap 5, a family of banded and columned layered layouts) are neither this feature's nor FBL's; they are a later DISL feature.

The boundary with FBL, as agreed between the two specification sessions on 2026-09-30:

- FBL produces model elements whose ids follow the id strategies DISL 0.2 defines, and never stores positions for an element whose id DISL marks unstable.
- FBL reports read problems as DISL findings, using the source location DISL 0.2 defines; it does not define a location of its own.
- Derived nodes (this feature) are never written by definition. FBL owns the "not written back" status of a read element whose binding has no write rule; DISL 0.2 owns the "not persisted" mark on a fixed attribute.
- FBL owns the one change to DISL's persistence layer (section 11) that points a specification at an FBL document. DISL 0.2 changes section 11 only where identity requires it (section 11.5).
- Ids kept in a sidecar outside the model file (Wardley) are FBL's, because the sidecar is.

## User Scenarios & Testing *(mandatory)*

The actors are the **tool engineer**, who writes a DISL specification, the **host developer**, who implements a DISL runtime in one of the ADP hosts, and the **user** of a diagram built from a specification (docs/terminology.md).

### User Story 1 - Identity a tool engineer can declare (Priority: P1)

A tool engineer declares how the elements of a diagram are identified, in the terms the model already uses: a ShortGuid, a path, a natural key, an IRI, a triple with a repeat counter, a term form, a scope path, an id computed from a relation's ends, or a fixed singleton id. Where the model has no stable identity (an RDF blank node, an OWL class expression, an anonymous SPARQL term, a C4 relationship known only by its source line), the engineer marks those ids unstable, and every runtime then refuses to store, position or reference them. When a model arrives with missing or duplicate ids, it still opens, and each problem is reported.

**Why this priority**: 21 of the 23 specifications need an id strategy DISL does not list or an unstable id. Without it, identity is either a plugin or silently wrong, and every other part of the tool (positions, relations, findings, undo) rests on identity.

**Independent Test**: take the id declarations of the dependency graph (ShortGuid), the .NET dependency graph (paths), the RDF graph (IRIs and blank nodes) and C4 (relationship ids from source lines); express each with DISL 0.2 constructs alone and validate them against the 0.2 schema; check that the specification states the outcome of storing a position for an unstable id.

**Acceptance Scenarios**:

1. **Given** a specification that declares ShortGuid ids, **When** a user creates an element, **Then** the new id is a ShortGuid, and the specification alone says how it is formed.
2. **Given** a node type whose ids are declared unstable, **When** a user drags such a node, **Then** the node moves for this session only, no position is stored for it, and the specification says so.
3. **Given** a relation type whose id is declared as a formula over its ends, **When** the relation is read, **Then** its id is that formula's value and two readings of the same model give the same id.
4. **Given** a model in which two elements share an id and one has none, **When** the diagram opens, **Then** it opens, and a finding is reported for the second and later duplicates and for the missing id.

---

### User Story 2 - Findings that point at the file and explain themselves (Priority: P1)

A user sees each problem in the model where it actually is: on an element when it is drawn, and otherwise at a file and line, or on a named thing that is not drawn (a triple, a key). A file that cannot be parsed yields one finding that replaces all others. A rule over the whole diagram reports one finding per offending item, one per cycle naming the loop in order, or only the second and later duplicates, and findings come in a declared order. Rules that every tool needs (duplicate id, missing id, unreadable entry, mixed precision) exist without the engineer writing an expression.

**Why this priority**: all 23 specifications degrade here, and FBL depends on the location shape to report read problems. It is the seam between the two features.

**Independent Test**: express the CLD cycle rule, the C4 whole-model rules and the SKOS duplicate-label rule with DISL 0.2 constructs; validate a headless-validator output that contains a file-and-line finding, a parse-failure finding and a finding on an undrawn subject against the 0.2 finding shape.

**Acceptance Scenarios**:

1. **Given** a finding about an entry that is not drawn, **When** it is reported, **Then** it carries a file, a line and optionally a column and length, or a subject that names the undrawn thing, and no element id.
2. **Given** a model file that cannot be parsed, **When** the diagram opens, **Then** exactly one finding describes the parse failure and no other finding is reported for that file.
3. **Given** a diagram-scope rule that detects cycles, **When** the model has three cycles, **Then** three findings are reported, each naming its loop's elements in loop order.
4. **Given** a model with three elements that share an id, **When** the built-in duplicate-id rule runs, **Then** two findings are reported, for the second and third.
5. **Given** a C4 rule declared over the whole model, **When** a view shows only part of the model, **Then** the rule still sees the whole model.

---

### User Story 3 - The tool says why (Priority: P1)

When a user tries something the tool refuses, the tool says why in a sentence the engineer wrote, per gesture, per element kind and per selection. Every property row that cannot be edited says why, the first applicable reason in a declared order, and a value that is absent reads differently from one that is empty. A menu entry that does not apply is shown as unavailable with its reason instead of disappearing. A confirmation names what it is about ("Delete 'Checkout' and its 4 steps?"), differs for a branch and a leaf, and is skipped below a threshold. Menu labels change with state and carry counts. Dialogs have placeholders, pre-filled values, validated input and a button label.

**Why this priority**: it is the most repeated item in the notes (22 of 23 specifications), and today each host would invent its own wording.

**Independent Test**: express the delete confirmation of the functional decomposition graph (branch versus leaf, with a count), the SHACL "Remove shape (with 5 statements)" label, and the read-only reasons of the .NET dependency graph's property grid in DISL 0.2, and validate them against the schema.

**Acceptance Scenarios**:

1. **Given** a gesture constraint with a refusal sentence, **When** a user attempts the refused gesture, **Then** the runtime shows that sentence, with any names it interpolates.
2. **Given** a property with two applicable read-only reasons, **When** the property grid shows it, **Then** it shows the reason that comes first in the declared order.
3. **Given** a context menu entry whose condition does not hold and that declares a reason, **When** the menu opens, **Then** the entry is shown disabled with the reason, not hidden.
4. **Given** a deletion confirmation with a threshold of one element, **When** a user deletes a leaf, **Then** no confirmation is asked; **When** the user deletes a branch with 4 descendants, **Then** the confirmation names the branch and the count.

---

### User Story 4 - Elements computed from the model (Priority: P2)

A tool engineer declares nodes that are computed from the model rather than stored: a card, row or badge from triples, two elements from one IRI, one edge merged from several triples, a pseudo-node for an unresolved template, an unknown kind shown as a generic node, C4 view membership from include and exclude lists with wildcards, relationships lifted to the nearest drawn ancestor and merged. Derived nodes are drawn and can carry findings but are never written, and containment can be computed as well as stored. Where a computation needs recursion (OWL's expression text) or cycle enumeration (CLD), or needs a plugin function, the specification says how CEL reaches it.

**Why this priority**: 14 of the 23 specifications need it, but most of them also need FBL to read their models first, so it is worth most when FBL lands.

**Independent Test**: express C4 view membership and relationship lifting, and the RDF graph's badge-from-`rdf:type`, with DISL 0.2 constructs; validate them; confirm that the specification forbids storing a derived node.

**Acceptance Scenarios**:

1. **Given** a derived node type computed from the model, **When** the model changes, **Then** the derived nodes are recomputed in the same transaction and no derived node is ever written.
2. **Given** computed containment, **When** a user drags a derived child onto another container, **Then** the gesture is refused with its declared reason, unless the engineer declared an operation that changes the model so that the containment follows.
3. **Given** a CEL expression that calls a declared plugin function, **When** the plugin is absent, **Then** the runtime behaves as DISL's graceful degradation says for a missing plugin.

---

### User Story 5 - Gestures and menus (Priority: P2)

A tool engineer declares positional create ("insert after this sibling"), toolbox items dropped onto an element of a given type, a drop whose target is whatever lies under it, relation direction chosen by the anchor used, a node and its edge created in one step, a context tool answered by a picker of existing elements, reorder, one menu entry per list item, a context menu on empty canvas gated on a model fact, menu entries for transient targets, the choice between clamping a drag and refusing a typed value, and shape handles that write model attributes.

**Why this priority**: about 15 specifications need at least one of these; without them the behaviour is either missing or a host-specific plugin.

**Independent Test**: express the mindmap's "insert sibling after", the gartner phase-boundary handles and the dependency graph's "connect to existing" picker in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** a positional create tool, **When** a user invokes it on a sibling, **Then** the new element is inserted directly after that sibling in the model's order.
2. **Given** a shape handle bound to a model attribute, **When** a user drags the handle, **Then** the attribute changes, as one undo step, subject to the attribute's constraints.
3. **Given** an attribute declared to clamp on drag and refuse on typing, **When** a user drags past the bound, **Then** the value stops at the bound; **When** the user types a value past the bound, **Then** the change is refused with its reason.

---

### User Story 6 - View state and canvas chrome (Priority: P2)

A user folds, expands and filters a diagram without changing the model: that state belongs to the viewer, is never persisted and never enters undo. The canvas shows a legend computed from what is drawn, a computed title, a header band and a truncation banner outside the drawing, a status notice with its own buttons, a compact-mode toggle and an empty-canvas message; it can stretch to the pane and start zoomed to fit its content and then stay put.

**Why this priority**: about 12 specifications need it; each host otherwise draws its own chrome.

**Independent Test**: express the mindmap's fold state, the C4 tag-chip filter and legend, and the causal loop diagram's empty-canvas message in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** a node folded by the user, **When** the user undoes, **Then** the undo does not unfold it, and on reopening the diagram the fold state is whatever the viewer state rules say, never stored in the model.
2. **Given** a legend declared as computed from what is drawn, **When** a filter hides every node of a type, **Then** that type leaves the legend.

---

### User Story 7 - Hard budgets (Priority: P2)

A tool engineer declares a hard budget: beyond it the diagram is truncated in a declared order, a banner says so, and edits that would be wrong on a truncated view are withheld with a reason. A diagram can have two budgets with different measures (nodes and triples, say).

**Why this priority**: 9 specifications need it; DISL 0.1 has only a soft `maxElements` that warns.

**Independent Test**: express the RDF graph's two budgets and truncation order in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** a hard budget of 500 nodes and a model of 800, **When** the diagram opens, **Then** 500 nodes are drawn, chosen in the declared order, a truncation banner is shown, and the withheld edits are refused with their reason.

---

### User Story 8 - Notation details (Priority: P3)

A tool engineer can restrict anchors to some sides, draw containment as edges, draw a relation with no target as a stub, loop a bezier forward when the target lies behind, use superellipse and diode shapes, choose an arc's bow side, mirror icons, pack badge slots, show a problem glyph on a node, draw named unequal bands with labels and end labels on a linear axis, draw a multi-level ruler with adaptive tick formats, keep per-element label offsets in the model, mix colours in a paint, require a fill contrast, and name the text metric every host measures with.

**Why this priority**: each item is small and degrading, but together they are why the same specification looks different in two hosts.

**Independent Test**: express the Wardley axis bands, the FDG diode shape and the CLD arc bow in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** a specification that names a text metric, **When** two hosts lay out the same label, **Then** both measure it with that metric.
2. **Given** a relation declared as allowed without a target, **When** it has none, **Then** it is drawn as a stub, not reported as a dangling reference.

---

### User Story 9 - Time and coordinates (Priority: P3)

A tool engineer uses time units coarser than a year and years before 1, month precision without days, keeps a value's written precision when it is written back, declares snapping per gesture (a move rounds, a drop floors) and how halves round, and binds an anchor to model attributes (an influence attached to a phase, an edge and a fraction).

**Why this priority**: it is needed by two specifications, gartner and timeline, but those are the ones closest to running on a generic runtime.

**Independent Test**: express the timeline's decade ticks and month-precision dates, and the gartner influence anchors, in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** a date written with month precision, **When** a user moves the element and the date is written back, **Then** it is written with month precision.
2. **Given** a snap rule that floors on drop and rounds on move, **When** a value falls exactly between two steps during a move, **Then** it rounds as the declared half-rounding rule says.

---

### User Story 10 - The smaller 0.2 items (Priority: P3)

A tool engineer can declare a simulated, animated action that plays over time and never enters undo; a hook `forEach` that sees the claims of earlier iterations; enum wire values with hyphens (`run-job`); whether `acyclic` on an abstract relation type covers its subtypes; and a fixed attribute that is not persisted. The ordering of CEL `sort()` on strings is defined.

**Why this priority**: each is small; they are listed so DISL 0.2 closes them rather than leaving them in notes.

**Independent Test**: express the Databricks run simulation, the CLD hook and the FDG `acyclic` and not-persisted attribute in DISL 0.2 and validate them.

**Acceptance Scenarios**:

1. **Given** an enum whose wire value is `for-each`, **When** a specification is validated, **Then** it is valid, and CEL refers to the member by a valid identifier.
2. **Given** `acyclic` on an abstract relation type, **When** a user connects two nodes with two different subtypes so that they form a cycle, **Then** the result is what the specification states, one way for every runtime.

---

### Edge Cases

- A DISL 0.1 specification opened by a 0.2 runtime: it keeps its meaning; nothing in 0.2 changes what an existing 0.1 construct means unless the version table says so.
- An unstable id that a DID definition already stores a position for (a file written before 0.2): the position is ignored and a finding says so, and the definition still opens.
- A finding whose file is not the model file (an included file, a sibling in a folder subject): the location names that file.
- A derived node whose computation fails: it is not drawn, and one finding reports the failure; the rest of the diagram still draws.
- A hard budget and a filter together: the budget applies to what the filter leaves.
- A refusal sentence that interpolates a name the user cannot see (a truncated or filtered element): it still names it.
- A confirmation threshold of zero: every deletion asks.
- A snap rule and a hard bound disagree: the bound wins, and the specification says whether that is a clamp or a refusal.
- A plugin function called from CEL that is not available: the expression evaluates as graceful degradation (DISL 15.2) says, and the result is reported as a finding, never as a crash.

## Requirements *(mandatory)*

### Functional Requirements

General

- **FR-001**: DISL 0.2 **MUST** be delivered as the specification document, the JSON Schema and the examples together (constitution, principle II), with the version and status *0.2, Working Draft* at the top and a new schema `$id` for 0.2.
- **FR-002**: Every valid DISL 0.1 specification **MUST** remain valid under DISL 0.2 and keep its meaning, unless a change is listed with its reason in a "Changes from 0.1" section.
- **FR-003**: Each construct this feature adds **MUST** be shown in at least one example, drawn from a named diagram in `definitions/diagrams/`, that validates against the 0.2 schema.
- **FR-004**: DISL 0.2 **MUST** replace the `x-adp` keys and plugin declarations that the 23 specifications use for the themes in scope with constructs of its own, and **MUST** list which remain and why.
- **FR-005**: Where DID has to change to carry what DISL 0.2 adds (for example tolerated duplicate ids, or positions refused for unstable ids), DID **MUST** change in the same feature, with its own version.

Identity (gap 4)

- **FR-010**: DISL **MUST** offer id strategies for ShortGuid ids, ids built from a path, natural keys, IRIs, triples with a repeat counter, term forms, scope paths, ids computed from a relation's ends, and fixed singleton ids, in addition to those DISL 0.1 lists.
- **FR-011**: A specification **MUST** be able to mark the ids of a type unstable. A runtime **MUST NOT** store a position, a view override, a suppression or a reference for an element with an unstable id.
- **FR-012**: A runtime **MUST** open a model with missing or duplicate ids and report each through the built-in rules of FR-024; which element keeps a duplicated id **MUST** be defined.

Findings (gap 6)

- **FR-020**: A finding **MUST** be able to carry a source location: a file, and optionally a line, a column and a length, with the counting of each defined; and **MUST** be able to name a subject that is not drawn (a triple, a key) instead of an element. This location shape is the one FBL uses.
- **FR-021**: A parse failure **MUST** be reportable as a finding that replaces every other finding for the same file.
- **FR-022**: A diagram-scope rule **MUST** be able to report one finding per item it yields, including one per cycle with the cycle's elements in loop order, and a rule **MUST** be able to flag only the second and later members of a group of duplicates.
- **FR-023**: A specification **MUST** be able to declare an order among findings and whether a rule sees the whole model or only the current view.
- **FR-024**: DISL **MUST** define built-in rules, needing no expression, for duplicate id, missing id, unreadable entry and mixed precision.
- **FR-025**: A rule **MUST** be able to consult facts about files that a runtime provides (for example whether a referenced file exists), read-only and through declared functions; which facts exist **MUST** be listed.
- **FR-026**: The headless validator's output **MUST** carry the location and subject of FR-020.

Telling the user why (gap 7)

- **FR-030**: A gesture constraint **MUST** be able to carry a refusal sentence per gesture, per element kind and per selection, interpolating names and counts.
- **FR-031**: A property **MUST** be able to carry read-only reasons in priority order, of which the runtime shows the first that applies, and the property grid **MUST** distinguish an absent value from an empty one.
- **FR-032**: A menu entry, context tool or toolbox item **MUST** be able to declare that, when unavailable, it is shown disabled with a reason instead of being hidden.
- **FR-033**: A confirmation **MUST** be able to interpolate names and counts, differ by the kind of element (for example branch and leaf), and be skipped below a declared threshold. DISL 0.1's fixed `deletion.confirm` text **MUST** remain valid.
- **FR-034**: A menu label **MUST** be able to change with state and carry a count.
- **FR-035**: A dialog **MUST** be declarable with placeholders, pre-filled values, validated input and a button label.

Gestures and menus (gap 8)

- **FR-040**: DISL **MUST** offer positional create, drop onto an element of a given type, drop onto whatever lies under the pointer, relation direction chosen by the anchor used, creating a node and its edge in one step, a context tool answered by a picker of existing elements, reorder, one menu entry per list item, a context menu on empty canvas gated on a condition, and menu entries on transient targets.
- **FR-041**: A specification **MUST** be able to say, per attribute, whether a drag past a bound is clamped and whether a typed value past it is refused.
- **FR-042**: A shape handle **MUST** be able to write model attributes, as one undo step and subject to constraints.

View state and canvas chrome (gap 9)

- **FR-050**: DISL **MUST** define per-viewer state (fold, expand and collapse, user filters) that is never persisted and never enters undo, and **MUST** say what it is when a diagram opens.
- **FR-051**: DISL **MUST** offer a legend computed from what is drawn, a computed title, a header band, a truncation banner, a status notice with buttons, a compact-mode toggle, an empty-canvas message, a canvas that stretches to the pane, and an initial zoom fitted to content and then kept.

Scale (gap 10)

- **FR-060**: DISL **MUST** offer hard budgets, one or more per diagram, each with its own measure, a truncation order, and the edits it withholds on a truncated view with their reason. The soft `maxElements` **MUST** keep its meaning.

Notation (gap 11)

- **FR-070**: DISL **MUST** offer the notation details listed in User Story 8: anchors restricted to sides, containment drawn as edges, a relation with no target drawn as a stub, a bezier that loops forward, superellipse and diode shapes, arc bow side, mirrored icons, packing badge slots, a problem glyph on a node, named unequal axis bands with labels and end labels, a multi-level ruler with adaptive tick formats, per-element label offsets stored in the model, colour mixing in paints, a fill contrast requirement, and a named text metric.

Time and coordinates (gap 12)

- **FR-080**: DISL **MUST** offer time units coarser than a year, years before 1, month precision without days, keeping a value's written precision on write-back, snapping per gesture with a declared rounding of halves, and anchors bound to model attributes.

Derived nodes (from gap 3)

- **FR-090**: DISL **MUST** offer derived node types and derived edges computed from the model, and computed containment; they are drawn, can carry findings, and are never written.
- **FR-091**: DISL **MUST** say how a CEL expression calls a function a plugin provides, and **MUST** offer bounded recursion and cycle enumeration, either as CEL functions DISL defines or through declared functions.

Smaller items (gap 13)

- **FR-100**: DISL **MUST** offer a simulated, animated action that plays over time and never enters undo; a hook `forEach` that sees the claims of earlier iterations; enum wire values that are not identifiers; a statement of whether `acyclic` on an abstract relation type covers its subtypes; a fixed attribute that is not persisted; a defined ordering for CEL `sort()` on strings; and a language's origin (`<vendor>/<type>`), which FBL's registration names.

### Key Entities

- **Id strategy**: how the ids of a type are formed and whether they are stable; stable ids may be stored and referenced, unstable ones may not.
- **Finding**: a reported problem, with a severity, a message, the rule that raised it, and where it is: an element, an attribute, a source location, or an undrawn subject. DISL 0.1 calls these problems; the relation between the two words is settled in the plan and recorded in docs/terminology.md.
- **Source location**: a file, and optionally a line, a column and a length; the shape FBL also uses.
- **Reason**: a sentence, possibly interpolated, that tells the user why something is refused, read-only, unavailable, or needs confirming.
- **Derived element**: a node, edge or containment computed from the model, drawn but never written.
- **Viewer state**: state of one viewer's view (fold, filter, zoom) that is neither model nor stored view data.
- **Budget**: a hard limit on what a diagram draws, with its measure, truncation order and withheld edits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every item under gaps 4 and 6 to 13 of the gaps summary, and the derived-node items of gap 3, is either expressible in DISL 0.2 or listed in the specification as deliberately left to a plugin or to FBL, with the reason: 100% accounted for, checked item by item in a traceability table in the plan.
- **SC-002**: Every DISL 0.1 example and legacy fixture, and all 23 specifications in `definitions/diagrams/`, still validate against the 0.2 schema.
- **SC-003**: Each construct added is exercised by at least one example that validates in the Build workflow.
- **SC-004**: The 15 uses of `x-adp-ruleId` and the other `x-adp` keys in the 23 specifications that fall within these themes each have a DISL 0.2 replacement named in the specification.
- **SC-005**: A host developer can implement each added construct from the document alone: every construct has normative text, a schema entry and an example, and no construct refers to a host, IDE or language.
- **SC-006**: FBL and DISL 0.2 define no construct twice: the source location, id strategies and unstable ids are defined once, in DISL, and FBL references them.

## Assumptions

- Migrating the 23 specifications in `definitions/diagrams/` to the new constructs is a follow-up feature; this feature only shows that each can be expressed (FR-003, SC-001, SC-004) and keeps them valid (SC-002).
- Viewport delivery (what a connection to a remote model receives) is a runtime concern, not a DISL construct, and is out of scope; the budget of FR-060 is the only scale construct.
- The rule-id key and `definitions/` validation (gap 13, hygiene) were settled by pull request #40 and are not part of this feature.
- FBL's specification (feature 005) proceeds in parallel; where this feature needs an FBL construct, it names it and does not define it, and the reverse holds for FBL.
- DISL remains pre-1.0, so constructs may change, but this feature keeps 0.1 documents valid (FR-002) because 23 definitions depend on them.
- The standalone bugs the gaps summary lists are host bugs, not specification gaps, and are handled in their own threads.
