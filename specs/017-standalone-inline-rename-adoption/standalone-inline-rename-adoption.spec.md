# Feature Specification: Inline rename adopted by every diagram whose label is its own

**Feature Branch**: none of its own: specified with spec-workflow in `etalii.adp.ide.standalone` and delivered on that repository's `develop`
**Created**: 2026-09-05
**Status**: Completed (2026-09-05)
**Input**: The spec-workflow specification `inline-rename-adoption` of `etalii.adp.ide.standalone`: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/inline-rename-adoption/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/inline-rename-adoption/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/inline-rename-adoption/tasks.md), read at that repository's commit `9a64600`. Only its tasks.md has a recorded dashboard approval, on 2026-09-05. Migrated to Spec Kit on 2026-10-10; the text below is the source's, rearranged into Spec Kit's sections.

## Context

Everything the source's Requirements Document says before its requirements, verbatim.

### Introduction

`inline-rename` built one editor and shipped it on two canvases. This specification takes it to the rest — in the user's words: *"Apply the element and connection inline rename editor to all other diagrams where it makes sense. Centralize the logic and UI, make it generic and reusable, and apply it at as many diagrams as possible."*

**The centralization asked for is already done, and that is the most important fact here.** `InlineLabelEditor`, `InlineLabelPlacementContext`, the `ShellPromptHost` deferral and the `noPrivateLabelEditors` guard all live in the shared client library today, and nothing under `src/diagrams/` carries a copy. So this is an **adoption** specification, not a build: a module adopts by marking the prompts whose value is the label it draws, and its canvas by registering a placement resolver. Anything beyond those two steps is a signal that something belongs in the shared piece, not in the module.

**Where "as many as possible" meets "where it makes sense" is the whole substance**, and the line is already drawn. A prompt may be rendered in place when the value it asks for **is** the text on screen. A label that decorates one authored value qualifies — C4 draws a relationship as `description [technology]` and the editor edits the description alone. **A label with no single authored value beneath it does not qualify at all**, and that is the sentence to disagree with if any of the exclusions below look wrong.

#### What the tree actually holds

Seventeen `*Canvas.tsx` files, but **fourteen real canvases across ten modules**: databricks' `JobCanvas`, `BundleCanvas` and `PipelineCanvas` are four-line wrappers around one `DatabricksCanvas`, so adopting there covers three readings at once. Every path below is under `src/diagrams/<module>/`, so the count can be rechecked as fast as it was made.

| | Modules | What was found |
| --- | --- | --- |
| **Adopted** | c4, mindmap | Both halves in place. |
| **Ready to adopt** | timeline, dependency-graph | `Rename` on the element's own `Label` and `Relabel` on the relation's own `Label`, F2 already forwarded, elements selectable, and connections already carrying a hit target. Nothing is missing. |
| **Ready, elements only** | databricks | `Rename task` and `Rename bundle` on authored values, F2 forwarded, elements selectable — but **no connection selection**, so its edges are out of reach until that exists. |
| **Reach missing** | azure-pipeline | `Rename` on a display name, elements selectable, but **F2 is not forwarded**. |
| **Selection missing entirely** | wardley-map | `Rename element` exists on the backend and `WardleyCanvas` imports nothing from the context channel at all — no selection, no menu, no shortcut. The backend has been offering a rename that no gesture on that canvas can reach. |
| **Out: the label is derived** | rdf, owl, shacl, skos | `Rename resource` edits an **IRI**; what is drawn is a prefixed name computed from it. Four canvases, all forwarding F2 — the most tempting group in the tree and the one the rule most clearly excludes. |
| **Out: nothing to rename** | ansible-structure, helm-charts, sparql | ansible-structure and helm-charts register no context action provider at all; sparql registers one and asks for no input. Their labels come from the structure of the source documents. |

**The selection gap is not hypothetical and has already cost a round.** C4 relationships had no click handler, so the backend offered `Relabel` on one and nothing could invoke it; that was found by running the app, after the unit tests for inline relabel were written and green. Wardley-map is the same defect one size larger. A specification that assumes selection will produce adopters that render correctly in tests and do nothing at all in the product.

### Alignment with Product Vision

* [product.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/steering/product.md)'s **direct manipulation** — renaming should be changing the text you are looking at, not filling in a form about it, and that should be true wherever a label is yours to change.
* [structure.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/steering/structure.md)'s **core-vs-module boundary** — the editor and the registry are core and stay core; which labels are renameable is each module's own knowledge and stays there.
* [tech.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/steering/tech.md)'s **Context** section — a module offers what a user can do through its action provider, and this feature adds a presentation for one kind of answer rather than a second path to the backend.
* `view-delta-adoption` (specification removed from the tree; in history before `53f68611`) is the shape this follows: the shared half first, then one independently landable adopter per module, then a guard.

## User Scenarios & Testing *(mandatory)*

One story per requirement of the source, in its order. Each story's acceptance scenarios are the source's Acceptance Criteria, verbatim, numbered as in the source.

### User Story 1 - Which labels qualify, decided by a rule rather than a list (Priority: P1)

Source: Requirement 1 — Which labels qualify, decided by a rule rather than a list

**User Story:** As a module author, I want a test I can apply to my own labels, so that adoption does not depend on someone else's judgement of my diagram.

**Why this priority**: The source calls where "as many as possible" meets "where it makes sense" the whole substance; every adoption depends on this rule.

**Independent Test**: Apply criteria 1 to 4 to one module's prompts and check that the marked set and the recorded exclusions in its client readme follow from them, as rdf's unmarked `Rename resource` does.

**Acceptance Scenarios**:

1. **1.1** WHEN a prompt asks for a value that **is** the text drawn on the element or connection it targets THEN it SHALL be markable.
2. **1.2** WHEN the drawn label decorates one authored value — a suffix, a bracketed technology, a leading number — THEN it SHALL still be markable, and the editor SHALL replace the whole drawn string on screen while editing the one authored value the module names in `initial_value`.
3. **1.3** WHEN a label has no single authored value beneath it — a projection of several fields, type badges, a computed summary — THEN it SHALL NOT be marked.
4. **1.4** WHEN a label is **derived** from a value of a different kind THEN it SHALL NOT be marked. The RDF family is the worked case: the drawn text is a prefixed name computed from an IRI, and changing it renames that term across the whole document with collision and prefix rules whose refusals need more room than a textbox has.
5. **1.5** WHEN this specification is implemented THEN the in-scope set SHALL follow from criteria 1 to 4 applied per module, and a module added later SHALL be judged the same way rather than added to a list here.
6. **1.6** WHEN a module is judged out THEN the reason SHALL be recorded in that module's own client readme, so the next reader meets the decision before wondering about it.

### User Story 2 - Nothing is rebuilt, and an adopter that needs more says so (Priority: P1)

Source: Requirement 2 — Nothing is rebuilt, and an adopter that needs more says so

**User Story:** As a maintainer, I want adoption to be two small steps, so that fourteen canvases do not become fourteen variants.

**Why this priority**: The centralization the user asked for already exists, so keeping adoption to two small steps is what keeps it centralized.

**Independent Test**: Check that an adopting change touches only the module's provider, canvas and readme, and that `noPrivateLabelEditors.test.ts` still passes unrelaxed.

**Acceptance Scenarios**:

1. **2.1** WHEN a module adopts THEN it SHALL add the marker to the qualifying prompts and register a placement resolver, and SHALL make no other change to shared code.
2. **2.2** WHEN a canvas cannot adopt without a change to `src/client/src/canvas/label/` or to `InlineLabelPlacementContext` THEN that SHALL be a **stop-and-report**, not a workaround: the permitted outcomes are that the shared piece grows once, centrally, serving every consumer, or that the canvas is documented as unable with its specific reason.
3. **2.3** WHEN adoption is complete THEN no module SHALL render an editable text field of its own, and `noPrivateLabelEditors.test.ts` SHALL still pass without being relaxed.
4. **2.4** WHEN a module's placement resolver is written THEN it SHALL supply only geometry and text — the rectangle in the canvas's own units and the value the editor opens with — and SHALL decide nothing about what may be renamed.

### User Story 3 - Selection is a prerequisite, and it SHALL be checked before adoption is claimed (Priority: P1)

Source: Requirement 3 — Selection is a prerequisite, and it SHALL be checked before adoption is claimed

**User Story:** As a user, I want the rename I am offered to be one I can actually reach, so that a menu entry is not a promise the canvas cannot keep.

**Why this priority**: The source records that a missing selection already cost a round on C4 and that wardley-map has none, so an adopter without it does nothing in the product.

**Independent Test**: On an adopted canvas, select an element and a connection by clicking, and check that the backend's actions for each, rename included, become available.

**Acceptance Scenarios**:

1. **3.1** WHEN a module is assessed for adoption THEN its canvas SHALL be checked for whether the thing carrying the label can be **selected** — elements and connections separately — and the finding SHALL be recorded before any editor work begins.
2. **3.2** IF the label's owner cannot be selected THEN selection SHALL be added first, using the pattern already in the tree — a wrapping group carrying the element id, an invisible fat hit path on the shared `canvas-connection-hit` class for a line, and the ordinary `elementSelectionOf` push — and SHALL NOT be invented per canvas.
3. **3.3** WHEN `wardley-map` is adopted THEN its canvas SHALL gain context-channel selection, which it has none of today; this is the largest single piece of work in this specification and SHALL be planned as its own task rather than folded into an adoption.
4. **3.4** WHEN `databricks` is adopted THEN its elements SHALL be in scope and its connections SHALL be out until connection selection exists there, and that SHALL be stated rather than left as an omission.
5. **3.5** WHEN selection is added for this feature THEN it SHALL serve every action on that thing, not only rename — the backend already offers others, and they become reachable by the same change.

### User Story 4 - Reach, where the module already has it and where it does not (Priority: P2)

Source: Requirement 4 — Reach, where the module already has it and where it does not

**User Story:** As a user, I want to start an inline rename the ways I already start a rename, so that nothing I know stops working.

**Why this priority**: It keeps the ways a user already starts a rename working; only two canvases need new forwarding.

**Independent Test**: Select an element on azure-pipeline or wardley-map, press `F2`, and check that the rename opens in place; check the context menu does the same.

**Acceptance Scenarios**:

1. **4.1** WHEN a rename is invoked from the context menu THEN it SHALL open the editor where Requirements 1 to 3 allow it, and the dialog otherwise.
2. **4.2** WHEN `F2` is pressed on a selected thing THEN it SHALL do the same. Nine canvases forward `F2` today and SHALL need no change; `azure-pipeline` and `wardley-map` SHALL gain the forwarding, through the existing `structuralShortcutFor` seam and with no key-to-action table on the client.
3. **4.3** WHEN a canvas forwards `F2` THEN it SHALL continue to decline keys whose target is a text field, so the editor's own keys reach it.

### User Story 5 - Connections, where a relation's label is its own (Priority: P2)

Source: Requirement 5 — Connections, where a relation's label is its own

**User Story:** As a user, I want to relabel a connection in place, because a connection's label is as much a label as an element's.

**Why this priority**: Connection labels are in scope only where a relation carries an authored label, which two modules do.

**Independent Test**: On timeline or dependency-graph, relabel a connection in place and check the editor sits at the line's midpoint.

**Acceptance Scenarios**:

1. **5.1** WHEN a relation carries an **authored** label THEN it SHALL be in scope on the same terms as an element's — `timeline` and `dependency-graph` both offer `Relabel` on the relation's own `Label`, and both canvases already give their connections a hit target.
2. **5.2** WHEN a connection's label has no box of its own THEN its placement SHALL be measured from the rendered text where the browser can measure it, falling back to the per-character estimate the shared element components use, and the fallback SHALL be commented as the path unit tests exercise.
3. **5.3** WHEN a connection is drawn with the shared straight or bezier components THEN those components SHALL NOT be changed to carry selection; the wrapping-group pattern SHALL be used instead, because several modules draw with each of them.

### User Story 6 - Every adopter inherits the same behaviour, including the parts that surprise (Priority: P2)

Source: Requirement 6 — Every adopter inherits the same behaviour, including the parts that surprise

**User Story:** As a user, I want in-place editing to behave the same on every diagram, so that I learn it once.

**Why this priority**: Consistency comes from the shared editor; this story states what every adopter inherits rather than new behaviour.

**Independent Test**: On an adopted canvas, check Enter, Escape, blur, a refused value, an unchanged value and a canvas gesture, and that one rename is one undo.

**Acceptance Scenarios**:

1. **6.1** WHEN an adopter is complete THEN the editor SHALL behave there exactly as it does on mindmap and c4: open focused with the label selected, Enter commits, Escape abandons, **blur commits**, a refusal keeps it open with the text intact, an unchanged value dispatches nothing, and focus returns to the canvas.
2. **6.2** WHEN a value has already been judged and refused by the module THEN it SHALL NOT be submitted — the refusal is shown and the editor stays open. This is not optional politeness: `ValidateAsync` runs on propose and `SubmitInteraction` does not run it again, so an editor that submits anyway writes a value its own module rejected.
3. **6.3** WHEN a gesture that moves the canvas begins THEN an open editor SHALL commit first, and the mechanism SHALL be taking the focus rather than a second copy of the commit rule.
4. **6.4** WHEN an inline edit commits THEN the selection SHALL be unchanged by the edit itself, and one rename SHALL be one undo.

### User Story 7 - The hazards an adopter will meet, stated once here (Priority: P3)

Source: Requirement 7 — The hazards an adopter will meet, stated once here

**User Story:** As an implementer picking up one adopter, I want the traps written down, so that I do not rediscover them one canvas at a time.

**Why this priority**: It records known traps for implementers; the shared code already handles them.

**Independent Test**: Read the hazards in criterion 7.1 and check that no adopter reimplements placement, registration or commit.

**Acceptance Scenarios**:

1. **7.1** WHEN an implementer reads this specification THEN it SHALL name the failure modes already paid for, because every one of them is inherited rather than introduced:
   - **The registry is two contexts, not one.** A single context must change identity when a canvas mounts so readers re-render, and a canvas whose registration effect depends on that value then re-registers on every change. That is an infinite loop, and it presents as the vitest worker dying rather than as a failing assertion.
   - **Registration is per canvas and never passes through empty.** An empty registry means no canvas is mounted, which is not evidence about any element; reading it as a disappearance abandons an edit that nothing happened to.
   - **`StrictMode` runs every effect as mount, clean up, mount.** A teardown that latches a flag latches it at first paint, and the editor then accepts typing and silently discards every commit.
   - **Blur commits and Enter commits, and Enter is followed by the blur that closing causes.** One rename, two commands, two undo entries. Both behaviours are individually correct and their interaction is not.
2. **7.2** WHEN an adopter is implemented THEN it SHALL NOT reimplement placement, registration or commit; these hazards live in the shared code and are already handled there.

### User Story 8 - One adopter per module, independently landable (Priority: P3)

Source: Requirement 8 — One adopter per module, independently landable

**User Story:** As the one developer who owns this specification, I want each module's adoption to land on its own, so that I can take them in whatever order the work suggests and let each pattern harden before copying it.

**Amended 2026-09-05, after approval.** This story originally read *"As a team running several agents … so that adopters can go in parallel"*. The user has since settled ownership: one developer works a specification through every task, and no other developer works on it until it is done (`3a8df481`). **Independently landable therefore buys ordering freedom and clean merges, not extra hands** — which is a smaller claim than the original and a truer one. The acceptance criteria below are unchanged and were already right; only the reason for wanting them was wrong.

**Why this priority**: It shapes how the work is split and ordered rather than what the product does.

**Independent Test**: Check that the tasks are one per module, each naming its own files, tests and labels, and that landing one leaves the other modules and the shared code unchanged.

**Acceptance Scenarios**:

1. **8.1** WHEN the tasks are written THEN there SHALL be one task per module rather than one per canvas, since a module's readings share a canvas (databricks) or a family (rdf).
2. **8.2** WHEN a task is written THEN it SHALL name that module's own files, its own tests and the specific labels it marks, so that an implementer needs this document and the module and nothing else.
3. **8.3** WHEN the order is chosen THEN the modules needing no prerequisite SHALL come first, so that the pattern the later ones copy is a landed one rather than a described one.
4. **8.4** WHEN a module's adoption lands THEN every other module SHALL be unaffected, and the shared code SHALL be unchanged by it.

### User Story 9 - Guarded, and the guards proven (Priority: P2)

Source: Requirement 9 — Guarded, and the guards proven

**User Story:** As a maintainer, I want the guards to be ones that would have failed, so that green means something.

**Why this priority**: Guards that pass against the defect convert unverified into verified while nothing has changed, which the source has already seen happen three times.

**Independent Test**: Perturb each adopter's guard, watch it fail, restore it; run the coverage diff both ways; read one `tests.md` check per adopted module.

**Acceptance Scenarios**:

1. **9.1** WHEN a test is written for a defect THEN it SHALL be **seen to fail against that defect** before the fix is accepted. On `inline-rename` three tests passed against broken code — one whose window React batched away, one whose blur jsdom never delivered, and one that omitted `StrictMode`, outside which the bug cannot exist — and the third was deleted rather than kept.
2. **9.2** WHEN an adopter is tested THEN its tests SHALL cover the marked-versus-unmarked contrast in its own provider, in one test, because a marker on the right action proves nothing if a neighbouring one quietly acquired one too.
3. **9.3** WHEN a canvas's placement is tested THEN a wrong placement SHALL fail it — an editor over the whole element rather than over its label is the defect to catch.
4. **9.4** WHEN the specification is complete THEN the mechanical requirement-coverage diff SHALL be run **both ways**: against the tasks document before implementing, and against the finished code afterwards, since the second pass asks whether the code shows a requirement rather than whether a task claimed it.
5. **9.5** WHEN the feature ships THEN `tests.md` SHALL carry one manual check per adopted module, executable against a local developer build, and the check SHALL note that a synthesised Return does not reach an input inside a `foreignObject` — an automated pass will otherwise watch Enter do nothing and be wrong about it.

### User Story 10 - What must not change (Priority: P2)

Source: Requirement 10 — What must not change

**User Story:** As a user of every other dialog in the app, I want this feature to be invisible to them.

**Why this priority**: Most input sites carry no marker, and nothing about them may change.

**Independent Test**: Invoke an unmarked prompt, a marked prompt with no canvas able to place it, and a rename from the explorer or a ribbon, and check each shows today's dialog.

**Acceptance Scenarios**:

1. **10.1** WHEN a prompt carries no marker THEN it SHALL render exactly the dialog it renders today. These are the majority of the input sites and SHALL be unaffected.
2. **10.2** WHEN a marked prompt arrives and no canvas can place it THEN the dialog SHALL be shown, silently, and the interaction SHALL behave as it does today.
3. **10.3** WHEN a rename is invoked from the explorer or a ribbon THEN it SHALL keep its dialog.
4. **10.4** WHEN this specification is complete THEN no diagram SHALL have lost an action, a shortcut or a dialog it had before.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A prompt MUST be marked for inline editing only when the value it asks for is the drawn text or the one authored value the drawn text decorates, never for a projection or a derived label, and a module judged out MUST have its reason recorded in its own client readme. (User Story 1; criteria 1.1–1.6)
- **FR-002**: An adopting module MUST only mark its qualifying prompts and register a placement resolver that supplies geometry and text, MUST stop and report when shared code would need to change, and MUST NOT render a text field of its own. (User Story 2; criteria 2.1–2.4)
- **FR-003**: Before adoption is claimed, each canvas MUST be checked for element and connection selection, and missing selection MUST be added first with the existing pattern, as its own task for wardley-map, serving every action on the selected thing. (User Story 3; criteria 3.1–3.5)
- **FR-004**: An inline rename MUST open from the context menu and from `F2`, with `azure-pipeline` and `wardley-map` gaining `F2` forwarding through `structuralShortcutFor`, and canvases MUST keep declining keys aimed at a text field. (User Story 4; criteria 4.1–4.3)
- **FR-005**: A relation carrying an authored label MUST be relabelled in place on the same terms as an element, placed from the measured rendered text with a commented per-character fallback, without changing the shared connection components. (User Story 5; criteria 5.1–5.3)
- **FR-006**: Every adopter MUST inherit the shared editor's behaviour unchanged: opening, committing, abandoning, refusing, committing before a canvas gesture, preserving selection and making one rename one undo. (User Story 6; criteria 6.1–6.4)
- **FR-007**: The specification MUST name the failure modes already paid for, and no adopter MUST reimplement placement, registration or commit. (User Story 7; criteria 7.1–7.2)
- **FR-008**: The tasks MUST be one per module, each naming its own files, tests and labels, ordered with the modules needing no prerequisite first, and each adoption MUST land without affecting other modules or shared code. (User Story 8; criteria 8.1–8.4)
- **FR-009**: Every guard MUST be seen to fail against its defect, each adopter MUST test its marked-versus-unmarked contrast and its placement, the coverage diff MUST be run both ways, and `tests.md` MUST carry one manual check per adopted module. (User Story 9; criteria 9.1–9.5)
- **FR-010**: Unmarked prompts, unplaceable marked prompts and renames invoked from the explorer or a ribbon MUST keep today's dialog, and no diagram MUST lose an action, shortcut or dialog. (User Story 10; criteria 10.1–10.4)

### Non-Functional Requirements

#### Code Architecture and Modularity

- **Single Responsibility**: the editor renders a textbox and reports intent; the canvas supplies geometry and text; the module decides what is renameable. Adoption changes only the second and third.
- **Modular Design**: a module adopts without any other module changing, and without the shared code changing.
- **Clear Interfaces**: the marker on the prompt and the placement resolver are the whole contract between a module and this feature.

#### Performance

- An open editor SHALL NOT cause its canvas to re-render its elements on every keystroke, and validation SHALL stay debounced.
- Registering a placement resolver SHALL NOT re-register on every render; it SHALL be memoized on what it reads.

#### Reliability

- An abandoned edit dispatches nothing and leaves the document untouched, on every adopted canvas.
- An edit whose element vanished mid-flight fails safely and visibly rather than writing to something that is no longer there.

#### Usability

- The editor looks like the label it replaces on every canvas that adopts it, so that editing feels like changing the thing rather than filling in a form about it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Five modules adopt inline rename (timeline, dependency-graph, databricks, azure-pipeline and wardley-map), each with a marked-versus-unmarked contrast test in its provider and a placement test that a wrong placement fails.
- **SC-002**: C4's existing placement tests pass with zero edits after its private helpers are extracted into the shared placement helpers.
- **SC-003**: `noPrivateLabelEditors.test.ts` passes unchanged, and no module renders an editable text field of its own.
- **SC-004**: Every exclusion is recorded with its reason in the module's own client readme, and databricks' connections are recorded as pending rather than exempt.
- **SC-005**: The requirement-coverage diff is run against the tasks before implementing and against the finished code afterwards.
- **SC-006**: `tests.md` carries one manual check per adopted module, with the `foreignObject` Enter caveat.
- **SC-007**: The four gates exit zero on the merged tree.

### Outcome

Task 1 extracted C4's two private placement helpers into the shared label library, with all 37 C4 tests passing unmodified. Tasks 2 to 5 adopted timeline, dependency-graph, databricks and azure-pipeline; timeline's instants needed a fourth shared helper, `asideLabelPlacement`, which the shared library gained once under Requirement 2.2, and azure-pipeline's merge also carried a field-reported core fix to nested `.adp` paths. Task 6 gave wardley-map context-channel selection and task 7 adopted it. Task 8 recorded the adoptions and exclusions, added the manual checks (written, not executed, by that session), ran the coverage diff both ways and landed the work as `2eddf038` on 2026-09-05 with all four gates green.
