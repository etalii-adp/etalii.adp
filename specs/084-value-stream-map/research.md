# Research: The Value Stream Map

Decisions taken while planning [value-stream-map.spec.md](value-stream-map.spec.md), each with its reason and the alternatives weighed. Section numbers are those of DISL 0.9 and FBL 0.21.

## R1. The document is YAML, read through the `yaml` family

- **Decision**: a value stream map is one YAML file with the extension `.vsm`, claimed by a declared FBL binding of the `yaml` family (FBL 4.3), not shared, so no marker is needed.
- **Rationale**: no published format for value stream maps exists (the research found wall charts, whiteboards and suite-internal workflow models only). YAML is what the Agent activity diagram, the functional decomposition graph and the pipeline bindings already use for files agents and people write by hand, and the `yaml` family keeps every byte an edit does not touch (FR-007, SC-005). `.vsm` is short, lowercase and not taken by any tool type here.
- **Alternatives**: a Markdown file read through `bullets` (readable without a tool, but times and shares in bullet text are fragile for agents to write); a DID document (DISL's own definition language, but it is JSON and not what an agent or a practitioner would edit by hand); a longer extension such as `.valuestream` (clearer, but out of line with the short extensions of section *Structure and Naming*).

## R2. One file holds both states, as two mappings

- **Decision**: the file holds `current:` and an optional `future:`, each a mapping with the stream's `steps:` and `flows:`. An element's state is read from the key its rule's selector passes through (`/current/steps/*` and `/future/steps/*` are two rules writing one attribute `state`). A kept canvas filter (DISL 6.13.1, `persist`) chooses the state shown; its value is view data in the binding's body (DISL 11.6, `persistence.view.bind`, as the Agent activity diagram keeps its view).
- **Rationale**: FR-006 asks for both states in one document, and User Story 3 for showing one at a time. Two mappings keep each state readable on its own and make "the future state" a diff of the file.
- **Alternatives**: one list of steps with a `state:` key on each (an agent must filter every list it reads); two files (FR-006 forbids it); DISL viewpoints (3.5), which select types rather than instances.

## R3. Creating the future state is a declared operation

- **Decision**: an operation `createFutureState` copies every step, trigger, outcome and flow of the current state into `future:` with DISL 9.4 actions: a `forEach` of `create` actions, each new element given `basedOn`, the id of the element it copies, then a `forEach` of `connect` actions that find each flow's new ends by `basedOn`. It is refused while a future state exists, with a reason.
- **Rationale**: every action needed exists (9.4: `forEach`, `create` with `as`, `connect`, `let`); `basedOn` also gives User Story 3's comparison and an agent a way to tell which future step replaced which current one.
- **Alternatives**: a plugin action (principle I: the copy would live in each host); the clipboard policy (9.5), which pastes into the same state.

## R4. Totals by expected visits, as DISL functions

- **Decision**: the figures of FR-004 are computed with the *expected number of visits* of each step. The trigger is visited once. A step's visits are the sum, over its incoming flows, of the source's visits times the flow's share (1 for an ordinary flow, the stated share for an alternative). A rework flow from step *b* back to step *a* with rate *r* multiplies the visits of every step on the forward path from *a* to *b* by 1 / (1 − *r*). Then lead time = Σ visits × (process time + wait time), process time = Σ visits × process time, flow efficiency = process time / lead time, and hand-offs = Σ over hand-off flows of the source's visits. These are DISL functions (3.4): `visits` with bounded recursion (`recursion.maxDepth` 64, the step budget of R10, `atMaxDepth` a value that makes the total fail with a finding), and the loop membership with the graph traversal functions of 12.4 (`reachable`).
- **Rationale**: FR-004 asks for expressions a host evaluates rather than code each host writes, and DISL 0.9 has everything needed: `duration` arithmetic and `sum()` (12.4), bounded recursion (3.4) and traversals. The expected-visits model is the textbook reading of a value stream with branches and rework and gives the numbers of the specification's worked scenarios: with no branches it is the plain sum (User Story 2, scenario 1: 240 minutes, 60 minutes, 25 %).
- **Alternatives**: a simulation (DISL 9.6), which is heavier and not deterministic in the sense the totals need; a plugin function (principle I); the plain sum ignoring shares (wrong for User Story 4).

## R5. A hand-off is a flow whose ends have different performers

- **Decision**: a hand-off is not stored as its own relation: it is a `Flow` whose source and target are steps with different `performer` values. The notation draws such a flow with the hand-off marker, and the hand-off count reads the same expression. The metamodel keeps the relation types `Flow`, `Alternative` (a subtype of `Flow` with `share`) and `Rework` (with `rate`).
- **Rationale**: User Story 1, scenario 3 already says a connection is drawn as a hand-off *because* its performers differ. A stored hand-off kind could contradict the performers, and an agent would have to keep both in step.
- **Amendment**: FR-001 named "a hand-off" among the relation types. The maintainer chose to amend it on 2026-11-23 ("Apply both"), and FR-001 now says a hand-off is derived from the performers.
- **Alternatives**: a stored `Handoff` relation type with a finding when it disagrees with the performers (two sources of one fact).

## R6. Times are ISO 8601 durations, shown as written

- **Decision**: `processTime` and `waitTime` are DISL `duration` attributes (4.2), written in ISO 8601 (`PT20M`, `PT3H`, `P2D`). A step shows each value in the unit it was written in, read from its written text (FBL 0.5, `text`): `PT180M` shows as 180 min, `PT3H` as 3 h. A value the tool writes from a form keeps the unit the user typed it in. Totals are shown in the diagram's `unit` (`minutes`, `hours` or `days`, default `hours`), an attribute of the diagram.
- **Rationale**: DISL's `duration` is ISO 8601 and has arithmetic; a shorthand such as `3h` would need a parser in CEL. The written text keeps "the unit the user entered" (User Story 1, scenario 2). Working-day calendars are out of scope (the specification's edge cases), so `calendar` is not set and `P1M` is refused.
- **Alternatives**: plain numbers with a unit key per step (an agent must keep two keys in step); duration shorthand strings parsed by a function (the OpenSLO map needs that, R7 of spec 085, but here the standard type suffices).

## R7. The vocabularies live in the file; the two starting lists are templates

- **Decision**: `activities:` and `practices:` are lists at the file's top, each entry a name and an optional colour. A step's `activity` and each of its `practices` is a string, checked by a constraint against the lists (a finding, never a refusal, so an agent's text is kept: the specification's edge cases). A new document is made from one of two templates (DISL 7.4): *Six-activity value chain* (plan, improve, engage, design and transition, obtain/build, deliver and support) and *Eight-activity lifecycle* (discover, design, acquire, build, transition, operate, deliver, support). The practice list starts with a short list of common practice names a user can change.
- **Rationale**: FR-003. DISL enumerations (4.5) are fixed in the specification and could not follow a user's changes. The template labels describe the lists rather than naming the framework (FR-011).
- **Alternatives**: one enumeration per framework version (the diagram would be bound to a version, which the specification rejects).

## R8. Layout: flow order left to right, waits below

- **Decision**: steps are placed by a placement binding (DISL 5.8): x from the step's depth in the forward flow (a recursive function like `visits`), y from its lane, the index of the alternative path it lies on. The wait time is a part of the step's custom shape (6.8), a band below the box whose length shows the wait relative to the longest wait. The summary and, with a future state, the comparison are derived nodes (4.11) placed after the outcome.
- **Rationale**: User Story 1 asks for flow order with the trigger first; a bound placement gives every host the same picture without a layout algorithm. Derived nodes hold the figures in the canvas, where an exported image keeps them.
- **Alternatives**: `tidyTree` (10.3), which draws a tree, not a flow with joins; free placement (the picture would drift from the flow).

## R9. Top three waits by rank

- **Decision**: a step is marked when fewer than three steps of its state have a strictly longer wait (`diagram.nodesOfType('Step').count(s, s.state == self.state && s.waitTime > self.waitTime) < 3`), so ties are all marked. The mark's tooltip names the wait.
- **Rationale**: FR-005 without sorting, which DISL's CEL library does not offer.
- **Alternatives**: exactly three with a tie-break by position (arbitrary for a reader).

## R10. Budgets

- **Decision**: a budget of 64 steps per state (DISL 3.2.1), the deepest recursion an ATD tool description may state (ATD7004); lowered from 200 on 2026-11-23. Beyond it the totals are not computed and one finding says so.
- **Rationale**: the bounded recursion of R4 needs a bound; value streams mapped by hand rarely exceed a few dozen steps.

## R11. Name and origin

- **Decision**: origin `generic/value-stream-map`, language id `net.etalii.adp.generic.value-stream-map` (`definitions/diagrams/README.md`, *Naming*), display name *Value stream map*, kind Diagram.
- **Rationale**: the specification's assumption; `generic/` is the vendor of tools no standard owns, as `generic/timeline`.

## R12. The tool description and its conformance cases

- **Decision**: the definition carries its ATD tool description (`value-stream-map.atd` with its parts and `value-stream-map.trace.json`), checked by `atd check` in the Build's `descriptions` job. Its conformance cases (`definitions/diagrams/conformance/value-stream-map/`) are recorded from a host's module, so they are left to the first host's specification and named there.
- **Rationale**: every type in `definitions/diagrams/` has a description (`definitions/diagrams/README.md`, *Tool descriptions*); conformance cases cannot be recorded before a host exists.

## R13. Worked examples

- **Decision**: two examples beside the definition, `examples/restore-service.vsm` (six steps, three hand-offs, a future state that removes one hand-off and shortens two waits) and `examples/request-fulfilment.vsm` (an 80/20 alternative and a 10 % rework loop), each with its totals worked by hand in the companion document. Both are invented and say so; no published example data under a permissive licence exists for this notation.
- **Rationale**: FR-010 and SC-002.
