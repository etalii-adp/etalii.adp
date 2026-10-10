# Feature Specification: Selection After a Drag

**Feature Branch**: none of its own: specified with spec-workflow in `etalii.adp.ide.standalone` and delivered on that repository's `develop`
**Created**: 2026-09-05
**Status**: Completed (2026-09-05)
**Input**: The spec-workflow specification `selection-after-drag` of `etalii.adp.ide.standalone`: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/selection-after-drag/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/selection-after-drag/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/selection-after-drag/tasks.md), read at that repository's commit `9a64600`. Its requirements were approved in that repository's spec-workflow dashboard on 2026-09-05, its design was rejected once and then approved on 2026-09-05, and its tasks were approved on 2026-09-05. Migrated to Spec Kit on 2026-10-10; the text below is the source's, rearranged into Spec Kit's sections.

## Context

Everything the source's Requirements Document says before its requirements, verbatim.

### Introduction

The report: after selecting and then dragging an element, the next element clicked is not
selected. The same happens around relations. The reporter suspected a wider problem, and the
analysis below confirms it - but the width is not one bug appearing in many places. It is two
different gesture models coexisting across the canvases, each wrong at the drag/click boundary
in its own direction, plus disagreement between handlers inside a single canvas.

Every claim below was verified against the tree, with the file and line it rests on.

### What the analysis found

**Two selection models coexist.** Eleven of the fourteen dragging canvases decide selection at
pointer-up, from the gesture's own record: a press that never exceeded the movement threshold
is a click and selects (`RdfCanvas.tsx:322`, `DatabricksCanvas.tsx:415`,
`DependencyGraphCanvas.tsx:469`). No flag, no reliance on the browser's trailing `click`
event, correct by construction. Two canvases - `C4Canvas.tsx` (serving all seven C4 types)
and `MindmapCanvas.tsx` - instead decide selection in `click` handlers, guarded by a one-shot
`dragJustEndedRef` armed when a drag ends (`C4Canvas.tsx:92,241`, `MindmapCanvas.tsx:66,271,288`).
`PipelineCanvas.tsx:84` carries the same shape for pan alone.

**The one-shot flag has no guaranteed consumer, and that is the reported bug.** The flag is
consumed by the *next* click on a guarded handler - but the trailing click of a drag is not
guaranteed to fire at all (release outside the browser window), not guaranteed to land on the
dragged element (the DOM fires `click` on the common ancestor when press and release targets
differ), and on the C4 canvas is armed by `onMouseLeave={onSurfacePointerUp}`
(`C4Canvas.tsx:439`) - a mid-drag exit from the surface arms the flag at a moment when no
click can possibly follow. An unconsumed flag latches, and the next legitimate click on any
guarded handler is silently swallowed: exactly "the next element that then gets clicked on is
no longer selected". On the mindmap the reparent gesture moves the dropped node away under
the pointer by layout, so the trailing click routinely misses and the latch is the common
case, not the corner.

**Handlers inside one canvas disagree about the flag.** C4 guards node clicks
(`C4Canvas.tsx:274`) but not relationship clicks (`:307`), and its background click is guarded
against a trailing pan but not a trailing drag (`:264`). Mindmap arms the flag when a drag
ends on a node (`:271`) and when a pan ends (`:288`) but not when a node drag ends over empty
canvas (`:279-290`) - so that release lets the trailing background click deselect the node
that was just dragged.

**The relation half of the report lives in the majority model.** In the pointer-up canvases,
elements select at pointer-up but relations still select through raw `click`
(`DependencyGraphCanvas.tsx:540`, and the same shape wherever connections are selectable). A
drag that ends over a relation therefore fires a trailing click on that relation and steals
the selection from the element that was just dropped. Symmetric gestures, asymmetric models.

**Even the agreement disagrees.** The wobble threshold that separates a click from a drag is
4px by hypotenuse on C4 (`C4Canvas.tsx:207`) and 3px by Manhattan distance on databricks
(`DatabricksCanvas.tsx:363`) - the same rule, hand-copied into divergence.

**The root cause, in one sentence:** selection at the drag/click boundary is decided by the
browser's trailing `click` event - directly in two canvases, for relations in the rest - and
that event is the wrong witness, because whether it fires and where it lands depend on DOM
geometry after the drop rather than on the gesture the user made.

### Alignment with the existing specifications

`drag-and-drop-centralization` already owns *where* gesture code lives: one folder per gesture
in the central canvas library, names that describe mechanisms, semantics staying in the
modules. This specification deliberately does not restate any of that. But that specification's
Requirement 4.2 pledges to preserve "the still-click-selects rule ... exactly as they are
today" - and today's rule is the defect described above. Executed alone, the migration would
faithfully centralize the bug. The interlock in Requirement 6 exists so the two specifications
compose instead of colliding: this one defines what the boundary behaviour *is*; that one
defines where the single implementation of it lives.

`multi-select` extends what a selection can hold. It consumes click/press verdicts and adds
modifiers; nothing here precludes it, and Requirement 3.4 keeps the seam it will need.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A finished gesture leaves no trace on the next one (Priority: P1)

Source: **Requirement 1 - A finished gesture leaves no trace on the next one**

**User Story:** As a user, I want each click and drag judged on its own, so that what I did a
moment ago never changes what my next gesture means.

**Why this priority**: This is the reported bug itself: a finished drag leaves a latch that swallows the next click.

**Independent Test**: Drag an element, end the drag in each of the ways criterion 1.1 lists, then click another element, a relation and empty canvas; each click must select or deselect as it would with no drag before it.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **1.1** WHEN a drag completes - ending on the dragged element, off it, over a relation, over empty
   canvas, outside the surface, or outside the window - THEN the next click on any element or
   relation SHALL select it, and the next click on empty canvas SHALL deselect.
2. **1.2** WHEN a gesture ends, for any reason including abandonment THEN no state armed by that
   gesture SHALL remain that can alter the interpretation of a later gesture.
3. **1.3** THE mechanism SHALL make such state unrepresentable rather than reviewed away: one-shot
   suppression flags consumed by a later event (`dragJustEndedRef`, `panJustEndedRef` and
   kin) SHALL NOT exist in any canvas or in the shared library, because a flag whose consumer
   is not guaranteed is a latch by construction - three of the four carriers today already
   have a path that arms without consuming.

### User Story 2 - Ending a drag is not a click (Priority: P1)

Source: **Requirement 2 - Ending a drag is not a click**

**User Story:** As a user, I want letting go of a drag to mean only "the drag is over", so
that dropping an element never selects something else or throws my selection away.

**Why this priority**: This is the relation half of the report: a drag that ends over a relation steals the selection, and a node drag released over empty canvas on the mindmap deselects.

**Independent Test**: End an element drag over a relation and over empty canvas and check the selection is unchanged; press and release without moving and check what was pressed is selected.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **2.1** WHEN a drag that exceeded the movement threshold ends THEN it SHALL NOT change the
   selection by itself: not select whatever sits under the release point (today's relation
   theft in the pointer-up canvases), and not deselect when the release lands on empty canvas
   (today's mindmap behaviour after a node drag ends there).
2. **2.2** WHEN a press ends without ever exceeding the movement threshold THEN it SHALL select what
   was pressed - element and relation alike - which is the rule eleven canvases already apply
   to elements at pointer-up.
3. **2.3** THE movement threshold SHALL be one shared constant with one distance rule, not a
   per-canvas copy: today's 4px-hypotenuse versus 3px-Manhattan split is the same intent
   diverged by duplication.

### User Story 3 - One arbiter, at gesture end, shared (Priority: P2)

Source: **Requirement 3 - One arbiter, at gesture end, shared**

**User Story:** As a developer, I want the click-or-drag decision made in one place from the
gesture's own record, so that no canvas can reintroduce the trailing-click model by copying
an old one.

**Why this priority**: The arbiter is the mechanism that makes Requirements 1 and 2 hold everywhere; the source presents it as the means rather than the defect.

**Independent Test**: Unit-test the shared arbiter alone: an unmoved release is a click, a moved release is a drag, a release off the surface still ends the gesture under pointer capture, and it never subscribes to `click`.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **3.1** THE decision "was this gesture a click or a drag" SHALL be made when the gesture ends,
   from what the gesture itself recorded (where it started, whether it exceeded the
   threshold), and never from the browser's trailing `click` event. The shared implementation
   SHALL NOT subscribe to `click` for selection at all.
2. **3.2** THE arbiter SHALL live in the central canvas library beside `selection.ts`, whose own
   header states the house rule this follows: the mechanics are shared once, and what an
   element *is* stays each module's business. Within `drag-and-drop-centralization`'s folder
   plan it is the one place its gesture derivatives obtain their click-versus-drag verdict.
3. **3.3** WHEN a gesture begins THEN the arbiter SHALL capture the pointer, so that a release
   outside the surface still ends the gesture through the ordinary path - which retires
   mouseleave-as-pointerup (`C4Canvas.tsx:439`) and the leave-handler state-flush
   (`MindmapCanvas.tsx:292`) rather than repairing them. `AnsibleCanvas` already captures;
   it is today the only one that does.
4. **3.4** WHEN elements and relations are pressed THEN both SHALL travel the same gesture path with
   the same verdicts, differing only in what the owning module does with a verdict - the seam
   `multi-select` will later widen with modifiers, unchanged in shape by this specification.

### User Story 4 - The fix subtracts code (Priority: P2)

Source: **Requirement 4 - The fix subtracts code**

**User Story:** As a maintainer, I want this defect's fix to remove the defective mechanism,
so that less code exists afterwards and the wrong model is not available to copy.

**Why this priority**: It keeps the defective mechanism from being copied again by deleting it, rather than fixing the observed symptom.

**Independent Test**: Search `src/` for `JustEndedRef` after the conversions and find nothing; check the converted canvases adopt the arbiter rather than gaining guards.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **4.1** WHEN this specification is complete THEN a search of `src/` for `JustEndedRef` SHALL
   return nothing: the C4 drag and pan flags, the mindmap drag flag and the azure-pipeline
   pan flag are deleted along with the guarded-click plumbing that consumed them, not
   bypassed.
2. **4.2** WHEN the two flag-model canvases are converted THEN their conversion SHALL consist of
   adopting the shared arbiter, not of writing a third model; relation click handlers in the
   pointer-up canvases SHALL likewise move onto the arbiter rather than gaining guards of
   their own.
3. **4.3** THE full migration of all fourteen canvases' gesture mechanics remains
   `drag-and-drop-centralization`'s scope. This specification converts the defect carriers -
   C4, mindmap, azure-pipeline's pan flag, and every relation-selecting click handler - and
   SHALL leave the remaining pointer-up element paths untouched for that specification to
   migrate onto the same arbiter.

### User Story 5 - The defect is guarded by tests that failed against it (Priority: P2)

Source: **Requirement 5 - The defect is guarded by tests that failed against it**

**User Story:** As a maintainer, I want the reported bug pinned by tests that demonstrably
catch it, so that neither the flag model nor the trailing-click model can return unnoticed.

**Why this priority**: The reproductions are what prove the defect is gone and keep it gone; the source requires them to have failed against the old code first.

**Independent Test**: Run the three reproductions against the code before the fix and see them fail, then against the fixed code and see them pass; sabotage the fix and see exactly the matching reproduction redden.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **5.1** THE deterministic reproductions SHALL exist as client tests and SHALL have been seen to
   fail against today's code before the fix: (a) on the C4 canvas, drag an element, let the
   pointer leave the surface, release, then click a different element - today the second
   element is not selected; (b) on the mindmap, drag a node onto a parent so the layout moves
   it from under the pointer, then click another node - today that click is swallowed; (c) on
   a pointer-up canvas with selectable relations, end an element drag over a relation - today
   the relation steals the selection.
2. **5.2** WHEN these tests are written THEN each SHALL be verified against the specific defect it
   guards - a sabotage restoring the old model must redden exactly it - because three client
   tests in this repository have already passed against the code they were written to catch.

### User Story 6 - Interlock with drag-and-drop-centralization (Priority: P3)

Source: **Requirement 6 - Interlock with drag-and-drop-centralization**

**User Story:** As the owner of either specification, I want the two to compose by
construction, so that neither preserves what the other exists to change.

**Why this priority**: It orders this specification against `drag-and-drop-centralization` so that one does not preserve what the other changes; it describes sequencing, not behaviour.

**Independent Test**: Check that this specification landed before that specification's migration began, and that its gesture derivatives take their click-versus-drag verdict from this arbiter.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **6.1** THIS specification SHALL land before, or as the first act of,
   `drag-and-drop-centralization`'s migration - never after it - so that the
   behaviour-preservation its Requirement 4.2 rightly demands is preservation of the
   corrected boundary, not of the latch.
2. **6.2** WHEN `drag-and-drop-centralization` builds its gesture derivatives THEN the arbiter this
   specification creates SHALL be the single source of their click-versus-drag verdicts, and
   its own Requirement 4.2 SHALL be read with this document as the definition of the
   still-click-selects rule.
3. **6.3** NEITHER specification claims the other's remaining scope, and this section exists so
   neither does - the shape `file-io-centralization` and `backend-consistency` already use
   for the same situation.

### Edge Cases

- A drag that ends outside the surface or outside the browser window, where no trailing `click` may fire at all (criterion 1.1, and the source's "What the analysis found").
- A gesture abandoned before it ends, which must leave no armed state behind (criterion 1.2).
- A press and a release on different targets, where the DOM fires `click` on their common ancestor (the source's "What the analysis found" and "Method and its limits").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A finished gesture MUST leave no state that changes how a later gesture is read, and one-shot suppression flags such as `dragJustEndedRef` MUST NOT exist in any canvas or in the shared library (User Story 1; criteria 1.1–1.3).
- **FR-002**: The end of a drag that exceeded the movement threshold MUST NOT change the selection by itself, a press that never exceeded it MUST select what was pressed, and the threshold MUST be one shared constant with one distance rule (User Story 2; criteria 2.1–2.3).
- **FR-003**: The click-or-drag verdict MUST be made once, in a shared arbiter in the central canvas library, at gesture end from the gesture's own record, with the pointer captured at press and without subscribing to `click` (User Story 3; criteria 3.1–3.4).
- **FR-004**: The fix MUST delete the flag model and its guarded-click plumbing in the C4, mindmap and azure-pipeline canvases and move every relation click handler onto the arbiter, leaving the other pointer-up element paths to `drag-and-drop-centralization` (User Story 4; criteria 4.1–4.3).
- **FR-005**: The defect MUST be guarded by three client reproductions (C4, mindmap, relation theft) that were seen to fail against the code before the fix and that a sabotage of the fix reddens (User Story 5; criteria 5.1–5.2).
- **FR-006**: This specification MUST land before `drag-and-drop-centralization`'s migration, and its arbiter MUST be the single source of that specification's click-versus-drag verdicts (User Story 6; criteria 6.1–6.3).

### Non-Functional Requirements

The source's Non-functional requirements section, verbatim.

#### Scope

Client only: `src/client/src/canvas/` and the canvases under `src/diagrams/*/client/`. The
context protocol, the selection wire shape and the backend resolvers are untouched - the
defect is entirely in who decides that a gesture was a click.

#### What is deliberately preserved

The still-click-selects experience, Escape abandoning a gesture, the context menu's
right-click path, inline edit ending before a gesture begins, and pan - all exactly as they
behave today outside the defective boundary. Requirement 2 changes only what a *completed
drag* and a *swallowed click* do, which is the defect, not the design.

#### Method and its limits

The two-model survey was made by reading every `*Canvas.tsx` under `src/diagrams/*/client/`
for its drag state, movement latch and selection call sites; the counts and line numbers
above are from that pass at the current tip. The browser-behaviour claims (click on the
common ancestor of differing press/release targets; no click after an off-window release)
are standard DOM semantics relied on, not measured here; the deterministic C4 latch does not
depend on them, only on `onMouseLeave` arming a flag no click can follow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The three deterministic reproductions of Requirement 5.1 (the C4 latch, the mindmap latch and the relation theft) fail against the code before the fix and pass after it.
- **SC-002**: A sabotage that restores the old model in the smallest way that compiles reddens exactly the reproduction that guards it (Requirement 5.2).
- **SC-003**: A search of `src/` for `JustEndedRef` returns nothing once the conversions land (Requirement 4.1), checked once rather than as a standing test (design, "Guard Testing").
- **SC-004**: All four gates (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test`) exit zero on the merged tree before it lands.

### Outcome

All six tasks were done on 2026-09-05. Task 1 added the arbiter `usePointerGesture` in `src/client/src/canvas/gesture/`, with one 4px threshold by hypotenuse; tasks 2, 3 and 5 moved the C4, mindmap and azure-pipeline canvases onto it and deleted their `JustEndedRef` flags; task 4 moved relation selection onto it in the dependency-graph, timeline and causal-loop canvases, after a grep showed the rdf family selects on mousedown and was out of scope. Each reproduction was seen to fail before its fix. Task 6 landed the work on develop as `b9295b0a` with the four gates at zero (990 client tests), found no `JustEndedRef` left in `src/`, and sent the notice for `drag-and-drop-centralization` to the Scrum master because no session owned that specification.
