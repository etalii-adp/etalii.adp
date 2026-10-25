# Feature Specification: The Sankey diagram as an ADP Tool Description

**Feature Branch**: in `etalii.adp`, `claude/project-thread-3z2lma` for this specification; the descriptions themselves are written on the branches of spec [035](../035-adp-tool-language/adp-tool-language.spec.md)'s batch 5 (T080, T081, T088)

**Created**: 2026-10-25

**Status**: Draft. This document is the specification only; a plan and tasks follow only after the maintainer approves it (Spec Kit process, 2026-10-12).

**Input**: The maintainer's request of 2026-10-25: "also, start creating spec kit specifications in etalii.adp to define .atd definitions for the other tools as well. One specification per tool."

## Context

**What exists.** The Sankey diagram (`etalii/sankey`, version 0.2.0) is a diagram type whose specification is `definitions/diagrams/sankey.dis` in DISL, read and written through `sankey.fbl#skv`, with the companion `sankey.md`, `sankey-report.md` listing what DISL and FBL cannot say. Its own summary reads: "How a quantity divides and combines on its way from where it comes from to where it ends up: nodes as bars as tall as what passes through them, and flows as bands as thick as their value."

The tool type has no tool description yet. Spec 035 (*One Language for Every Tool Type*) defines the ADP tool language and its `.atd` files, and its first description, the mind map's (`definitions/diagrams/mindmap.atd` with its parts `mindmap.notation.atd` and `mindmap.freeplane.atd`, its trace `mindmap.trace.json` and its conformance cases under `definitions/diagrams/conformance/mindmap/`), is the model this specification follows. Spec 035's tasks T080, T081, T088 name this tool type's description, trace and conformance cases in one line each.

**What this feature adds.** The account, for this one tool type, of what its complete tool description is: which constructs of `sankey.dis` it must carry, which behaviours of the companion and of the host code it must state, what its notation part and its binding part hold, which capabilities it may name, and which conformance cases show that it behaves as the reference host does. Spec 035 says that every tool type gets a complete description (its FR-020 to FR-024); this specification says what "complete" means for the Sankey diagram, item by item, so that the description can be written against it and accepted by it.

**Relation to spec 035.** This specification adds no language construct, no host behaviour and no capability of its own. Where the description needs a construct ATD 0.1 lacks, it is added to the language through spec 035's amendment route (its *How each description is written*), not here. The work of writing the files is the work of spec 035's T080, T081, T088; this specification is the per-tool acceptance reference those tasks are checked against.

**Words.** Those of spec 035 and of [docs/terminology.md](../../docs/terminology.md): tool description, script, capability, trace, conformance case, reference host, parity, diagram, specification, binding, companion, finding, refusal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the whole Sankey diagram in its tool description (Priority: P1)

A tool engineer opens `definitions/diagrams/sankey.atd` and finds everything the Sankey diagram is: what `sankey.dis` declares, what its binding reads and writes, what its companion lists in prose, and the logic the hosts write in code for it, without opening any of those files.

**Why this priority**: it is the description itself; every other story checks it.

**Independent Test**: take `sankey.dis` and its binding construct by construct, and the companion's sections listed under FR-020 item by item, and find each one's counterpart in the description; run `atd check` on it.

**Acceptance Scenarios**:

1. **Given** the description, **When** `atd check` runs on it, **Then** it reports no finding.
2. **Given** each element type, relation, enum, function, operation, rule and layout of `sankey.dis`, **When** the description is read, **Then** each has exactly one counterpart, with its CEL carried verbatim.
3. **Given** the description and `sankey.dis`, **When** their identity is compared, **Then** origin `etalii/sankey`, version `0.2.0`, id `net.etalii.adp.etalii.sankey` and label "Sankey diagram" are the same.

---

### User Story 2 - Show by conformance cases that the description behaves as the reference host (Priority: P1)

A tool engineer runs the Sankey diagram's conformance cases and sees, for a fixed set of documents and gestures, the readings, findings, splices and drawings the reference host produced, so that any later runtime that runs the description can be held to them.

**Why this priority**: without cases a description can be complete on paper and wrong in behaviour; spec 035's validation (its Story 4) runs on them.

**Independent Test**: list the cases under `definitions/diagrams/conformance/sankey/` and check that every operation, rule, refusal and binding rule named in FR-030 to FR-034 is exercised by at least one of them; validate them with `validate-examples.py`.

**Acceptance Scenarios**:

1. **Given** the cases, **When** they are validated against ATD's schema, **Then** each is a valid conformance fixture naming the host and commit of each of its parts.
2. **Given** each operation of the tool type, **When** the cases are listed, **Then** at least one case performs it and records its splice and the drawing after it.
3. **Given** each rule and refusal, **When** the cases are listed, **Then** at least one case produces that finding or that refusal.

---

### User Story 3 - Find the notation in a part of its own (Priority: P2)

A tool engineer who changes how the Sankey diagram looks opens `sankey.notation.atd`, as the mind map's `mindmap.notation.atd`, and finds every node, edge, style, theme token and mode there, apart from the model and the binding.

**Why this priority**: the notation is the largest part of the description and the one most often changed; it reads best apart, but the description is complete without the split.

**Independent Test**: open the part and compare it with the `notation` section of `sankey.dis`.

**Acceptance Scenarios**:

1. **Given** the root description, **When** it is read, **Then** it imports the notation part and the binding part, as `mindmap.atd` imports its two.
2. **Given** the notation part, **When** its drawings are compared with the cases' recorded drawings, **Then** they agree.

---

### User Story 4 - Trace every companion item and host behaviour (Priority: P2)

A reviewer opens `definitions/diagrams/sankey.trace.json` and finds, for each item the companion lists and each behaviour the hosts implement in code for the Sankey diagram, the part of the description that now states it, the host files it was read from, or a host's divergence from the reference behaviour.

**Why this priority**: the trace is the evidence that nothing was left in prose or in host code; spec 035's SC-003 counts it.

**Independent Test**: run `atd check --trace` and compare the trace's companion items with the headings and top-level list items of the sections FR-020 lists.

**Acceptance Scenarios**:

1. **Given** the trace, **When** `atd check --trace` runs, **Then** every `statedBy` resolves in the description.
2. **Given** each section FR-020 lists, **When** the trace is read, **Then** each of its `###` headings and top-level list items is traced exactly once, or marked as a host's concern with its reason.

### Edge Cases

- A document of the Sankey diagram that does not read (a foreign file, a broken body): reading does not fail; the description's binding reports what it could not read as findings, and a case records it.
- An entry whose reference names nothing: the description keeps it, reports it as its rules say, and draws or does not draw it as the reference host does; a case records it.
- A behaviour the hosts implement differently: the description states the reference host's, and the trace records the other as a divergence (spec 035, Q8).
- A behaviour that needs a construct ATD 0.1 lacks: the construct is added through spec 035's amendment route with an example and a refused case; this description does not work around it in a comment.
- A behaviour that is the host's concern (rendering, gestures, text measurement, file dialogs, opening links, the undo stack): it is marked so in the trace with its reason, never stated in the description.

## Requirements *(mandatory)*

### The description

- **FR-001**: The Sankey diagram **MUST** have a tool description whose root is `definitions/diagrams/sankey.atd`, beside `sankey.dis`, which stays unchanged (spec 035, FR-020, FR-031).
- **FR-002**: The root **MUST** declare the kind `diagram`, the origin `etalii/sankey`, the version `0.2.0`, the id `net.etalii.adp.etalii.sankey` and the label "Sankey diagram", and the file extension `skv`, as the specification does (spec 035, FR-025).
- **FR-003**: The description **MUST** be split as the mind map's is: the root, a notation part `sankey.notation.atd`, and one part per binding it carries; a part that stays under about 600 lines together with the root **MAY** be folded into it.
- **FR-004**: The model **MUST** carry every element type of the specification, 1 in all: `Node`; every relation type, 1 in all: `Flow`, each with its attributes, defaults, labels and documentation.
- **FR-005**: The description **MUST** carry the specification's 25 functions as script functions or CEL definitions of the same name and meaning: `labelOf`, `uniqueName`, `drawnNode`, `drawn`, `amount`, `isPaletteWord`, `isHex`, `isKnownColor`, `resolveColor`, `nodeColor`, `flowColor`, `paint`, `valueText`, `rowNumber`, `formatValue`, `nodeDisplay`, `flowDisplay`, `defaultStep`, `stepOf`, `remainder`, `drawnThickness`, `barHeight`, `bandThickness`, `colorChoice`, `readsAsAmount`.
- **FR-006**: The description **MUST** carry the coordinate systems `canvas`.
- **FR-008**: The extension settings `x-sankey`, `x-adp` **MUST** be carried in ATD's uniform `key: value` form (spec 035, FR-011), or, where the language now states what they stood for, by that construct, which the trace names.

### The notation

- **FR-010**: The notation part **MUST** carry every node of the notation, 1 in all: `Node`; and every edge, 1 in all: `Flow`, with their shapes, sizes, labels, conditions, states, markers, tooltips, accessibility and refusals.
- **FR-011**: The notation part **MUST** carry the theme's tokens, its modes (`dark`), its styles and the canvas, including its empty hint where one is declared.
- **FR-012**: The toolbox **MUST** carry its tools (`node`), its 4 context menus.
- **FR-013**: The description **MUST** carry the forms `node`, `flow`.
- **FR-014**: The description **MUST** carry the layouts `sankey` (`plugin:net.etalii.adp.etalii.sankeyLayout`), `sankeyArrange` (`plugin:net.etalii.adp.etalii.sankeyLayout`), with the default, trigger and respect the specification sets. A layout that the specification leaves to a `plugin:` **MUST** be a named capability, generic in its name and contract (spec 035, FR-018, Q7).

### Behaviour

- **FR-015**: The description **MUST** carry every operation, 7 in all: `rename`, `increaseValue`, `decreaseValue`, `thicker`, `thinner`, `arrange`, `addNodeHere`, each with its availability, parameters, form and actions, so that each is one command with an exact undo (spec 035, FR-016).
- **FR-016**: The description **MUST** carry the hooks `valueNewFlow`.
- **FR-017**: The description **MUST** carry the deletion and clipboard rules and the messages of the specification's `behavior`.
- **FR-018**: The description **MUST** carry every rule of the constraints, 11 in all: `selfFlow`, `danglingSource`, `danglingTarget`, `missingValue`, `negativeValue`, `unknownFlowColor`, `unknownNodeColor`, `backwardFlow`, `connectBetweenNodes`, `noSelfFlowWhileDrawing`, `noSecondFlowWhileDrawing`, and the settings of the built-in rules `std.unparseable`, `std.unreadableEntry`, `std.missingId`, `std.duplicateId`, `std.references`, `std.endpoints`, with the codes, severities, scopes and messages the specification gives them.

### The binding

- **FR-019**: The binding part **MUST** carry `sankey.fbl#skv` (as the desktop host vendors it from the standalone host), mapped onto the model as `persistence` maps it, with its id strategy `uuid-v4`; reading never fails on content, unmapped text is kept byte for byte, and every edit is a minimal splice (FBL's guarantees).

### What the companion and the hosts hold

- **FR-020**: Each item of the companion's gap sections **MUST** be stated in the description as a construct, a script function, a binding rule or a named capability, or marked in the trace as a host's concern with its reason (spec 035, FR-021, FR-022). The sections and items are:
  - `sankey.md`, *What DISL cannot express*: each of its top-level list items.
  - `sankey.md`, *Language gaps*: *1 and 2. FBL: written text and a value that will not read (closed)*; *3. DISL: reader findings for an entry that is still drawn*; *4. FBL and DISL: the header*; *5 and 6. FBL: a new entry*; *7. DISL: an entry that is kept, reported and not drawn*; *8. DISL: findings in the order of the file*; *9. DISL: a ribbon, a bezier reach, a reorder in a computed column, a drop that writes its point*; *10. DISL: what a dangling end was written with*; *11. FBL: the members of an entry written as a flow mapping*; *12. FBL and DISL: the id a model change names when the specification derives one*.
  - `sankey.md`, *Other differences a runtime will meet*: each of its top-level list items.
  - `sankey.md`, *What remains in the module, and why*: each of its top-level list items.
- **FR-021**: Each plugin the specification names **MUST** become a script function or a named capability, with no tool-specific code (spec 035, FR-018, SC-004): `net.etalii.adp.etalii.sankeyLayout` (provides layout, celFunctions); `net.etalii.adp.etalii.sankeyEnds` (provides celFunctions).
- **FR-022**: Every behaviour the reference host implements in code for this type and its specification does not state (layouts, naming, refusals, menus, read-only reasons, derived data, file reading and writing) **MUST** be stated in the description, and each other host's different behaviour recorded in the trace as a divergence (spec 035, FR-021, Q8).
- **FR-023**: The relaxation of the layered flow **MUST** be the capability `layout.flowRelaxation` (spec 035's T081), and the trace **MUST** name the companion report `sankey-report.md` beside `sankey.md`.

### Trace

- **FR-028**: `definitions/diagrams/sankey.trace.json` **MUST** name the companion files `sankey.md`, `sankey-report.md` and the sections FR-020 lists, trace each of their items exactly once, and name for each host behaviour the host, repository, commit, path and line range it was read from (spec 035, FR-023).

### Conformance cases

- **FR-030**: The cases **MUST** live under `definitions/diagrams/conformance/sankey/`, be recorded with `atd record etalii/sankey` from the reference host, never be edited by hand, and name the host and commit of each part (spec 035, FR-024).
- **FR-031**: There **MUST** be one case per parity edit script of the type in the desktop host's `parity/scripts/`, with its bytes taken unchanged from the matching golden where one exists.
- **FR-032**: Beyond those, the cases **MUST** together perform every operation of FR-015 and every tool of the toolbox, produce every finding of FR-018 that a document can produce, and meet every refusal the specification declares.
- **FR-033**: The cases **MUST** include the reading of a document that does not read, so that what the binding reports for it is recorded.
- **FR-034**: The cases **MUST** use the examples the companion names where it names any, and **MUST NOT** use a document whose licence does not permit it to be kept in this repository.

### Unchanged

- **FR-040**: `sankey.dis`, its binding and its companion **MUST NOT** change (spec 035, FR-031, SC-002), and no host's tool loading changes because the description exists.

### Key Entities

- **The Sankey diagram's tool description**: the root `sankey.atd` and its parts, one tool type of kind diagram, origin `etalii/sankey`.
- **Its trace**: `sankey.trace.json`, the account of every companion item and host behaviour.
- **Its conformance cases**: the folders under `conformance/sankey/`, each a document, gestures and the recorded readings, findings, splices and drawings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `atd check` and `atd check --trace` report zero findings on the description, in the Build workflow's `descriptions` job.
- **SC-002**: 100 % of the 45 named constructs counted in FR-004, FR-005, FR-015 and FR-018 have their counterpart in the description.
- **SC-003**: 100 % of the companion items of FR-020 (10 headed items, plus the top-level list items of their sections) are traced, once each.
- **SC-004**: Every operation and every rule is exercised by at least one conformance case, and 100 % of the cases pass in the desktop host's validation once spec 035's Story 4 runs them, every write byte-identical to the reference host's.
- **SC-005**: `git diff` over the feature shows no change to `sankey.dis`, its binding or its companion.

## Assumptions

- The reference host is spec 035's, split by part: bytes from the standalone host's goldens as the desktop host vendors them, readings, findings and drawings from the desktop host (spec 035, Q5).
- The description is written in ATD 0.1 as it stands when spec 035's batch 5 reaches it; a construct it lacks is added there, with its example and refused case, before this description uses it.
- The plan of this specification, if the maintainer asks for one, names the host files and lines the description is read from; this specification names only the definition's own files.
- The capabilities named here are those spec 035's tasks name; a new one is added only through spec 035's catalogue, generic in its name and contract.
