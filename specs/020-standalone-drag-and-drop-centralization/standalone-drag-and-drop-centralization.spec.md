# Feature Specification: Drag-and-Drop Centralization and Gesture Frame Cost

**Feature Branch**: none of its own: specified with spec-workflow in `etalii.adp.ide.standalone` and delivered on that repository's `develop`
**Created**: 2026-09-06
**Status**: Completed (2026-09-06)
**Input**: The spec-workflow specification `drag-and-drop-centralization` of `etalii.adp.ide.standalone`: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/drag-and-drop-centralization/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/drag-and-drop-centralization/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/drag-and-drop-centralization/tasks.md), read at that repository's commit `9a64600`. Its requirements, design and tasks were all approved in that repository's spec-workflow dashboard on 2026-09-06. Migrated to Spec Kit on 2026-10-10; the text below is the source's, rearranged into Spec Kit's sections.

## Context

Everything the source's Requirements Document says before its requirements, verbatim.

### Introduction

This specification began as two things the prompting report treated as one: a **structural** consolidation — every canvas hand-rolled its own pointer gestures — and a **per-frame render discipline**, because the measured slowness tracked drawn-element count, not which canvas was drawing.

**The user restated the symptom as a benchmark while reviewing this revision (2026-09-06):** *"Prefer the timeline/dependency graph/causal loop diagram drag and drop above the ones from owl/rdf/shacl. Reason is that the latter is slow, not realtime and annoying."* That preference is this specification's acceptance bar in the user's own words. The felt difference is document size meeting a per-frame cost that scales with it: per drawn element every canvas costs the same (0.012–0.020 ms per DOM node in the survey below), but the rdf-family readings routinely draw hundreds of elements where a timeline draws tens — the laureates model's 65.5 ms per frame is 15 frames per second, which is exactly "not realtime". There is now one gesture implementation for all fifteen canvases, so the requirement is that it costs everywhere what it costs on the diagrams the user named as feeling right.

**The structural half has been delivered by another specification, and this document now asks only for the performance half.** On 2026-09-06, `diagram-library-adoption` landed `src/client/src/canvas/library/DiagramCanvas.tsx` (`9769cfd4`) and migrated **all fifteen canvas files** onto it. Its requirements cite this specification's survey by name — "after full adoption those counts are zero, and that is checkable" — and `library/noPrivateGestures.test.ts` is that check. What this document previously asked for structurally is recorded below as delivered, so it is not re-done; what remains is the render discipline, which survived the consolidation intact and now lives in exactly one file.

### The survey, in three readings

**2026-09-03 (this document's first version).** 13 canvas files; eight private `dragRef`, ten `panRef`, four `connectRef`, seven `zoomBy`; nothing shared existed. The per-frame measurement (below) showed cost tracking drawn elements at 0.012–0.020 ms per DOM node in every canvas measured, because each pointer move wrote React state and re-rendered the whole canvas.

**2026-09-05.** 18 canvas files and 12/12/6/12 — five canvases created on 2026-09-04 had each hand-rolled drag and pan. `selection-after-drag` had landed the click-or-drag arbiter (`gesture/usePointerGesture.ts`, `b9295b0a`), adopted by six canvases, three of them for relations only, leaving two click-or-drag boundaries live at once.

**2026-09-06 (current).** All fifteen canvas files render through `DiagramCanvas`. Private `dragRef`, `panRef`, `connectRef` and `zoomBy` in module sources: **zero, zero, zero, zero** — the only remaining matches in `src/diagrams/` are module *test* files exercising the shared layer. `DiagramCanvas` composes `usePointerGesture`, so one click-or-drag boundary remains (4 client pixels by hypotenuse). `noPrivateGestures.test.ts` guards the zeros, walking the tree and failing once naming every offender, with its text-reading limit stated in its own doc-comment.

**What survived the consolidation, confirmed in `DiagramCanvas` at HEAD.** The gesture-frame mechanism this specification measured in ten canvases now exists once, unchanged in kind:

- `onDragMove` writes React state **per pointer frame** — `setDragOffset` for a reposition, `setView` for a pan, `setConnect` for a connect preview, `setResizePreview` for a span resize, and the connection-adjust case likewise — so every pointer frame re-renders the whole canvas, rebuilding every element rather than the one under the pointer. **This document's first approved version counted three of these five.** The enumeration stopped at the setters named in the reposition, pan and connect paths, and the implementation honoured that boundary exactly — Developer 1's completion note is what surfaced the other two, both present in the file the survey read. The count was short, not the boundary deliberate, and Requirement 1.5 was amended on 2026-09-06 to say so.
- `unitsPerPixel`, called on every drag move to turn pointer deltas into canvas units, performs a synchronous `getBoundingClientRect` — **at least one layout read per pointer frame, and two on the pan path**, which calls it a second time for the view held at press.

Centralization did not fix the cost; it made the fix a change to one file instead of ten. That is the whole remaining scope.

#### The measurement (2026-09-03, quoted)

A drag was measured in jsdom over 30 pointer frames on realistic models, counting rendered DOM nodes and milliseconds per frame:

| Canvas and model | DOM nodes | ms per frame | ms per DOM node |
|---|---|---|---|
| RDF, Wikidata shape (101 cards, 763 literal rows on one) | 1,577 | 32.0 | 0.020 |
| RDF, laureates shape (1,000 cards) | 5,011 | 65.5 | 0.013 |
| Timeline, 100 spans | 308 | 5.3 | 0.017 |
| Timeline, 1,000 spans | 3,008 | 34.6 | 0.012 |

Cost tracks the number of drawn elements, not which canvas draws them. These figures predate the library; Requirement 4 re-measures on the same models rather than comparing against this quote.

### Delivered elsewhere, recorded so it is not re-done

The first version of this document carried requirements for a `drag/` folder of five gesture derivatives, diagram-neutral naming, module-owned semantics, behaviour-preserving per-canvas migrations, a no-private-implementation guard, and a self-documenting readme. **`diagram-library-adoption` delivered the substance of all of them by a different route** — a declarative diagram definition consumed by one `DiagramCanvas`, rather than composable derivative hooks — and the five-folder shape is withdrawn as overtaken:

- One gesture layer exists, inside `DiagramCanvas`, built on `gesture/usePointerGesture`; module sources hold none.
- Diagram-specific semantics cross as the definition's typed fields and callbacks; shared code names no diagram type.
- `noPrivateGestures.test.ts` keeps the private-gesture count at zero: it walks every module's client sources — the databricks wrappers included, which pass by holding no gesture state rather than by being excluded — and its canary is the named-member form, asserting `rdf` and `timeline` are in the walked set by name.
- The Helm canvas — whose `viewBox` viewport this document once treated as its hardest case — is migrated with the rest.

Nothing in this specification SHALL re-create, duplicate or re-migrate any of that. Where this document's remaining requirements touch `DiagramCanvas`, they change how it schedules gesture frames, never what a gesture means.

### Alignment with Product Vision

`structure.md` requires that canvas rendering infrastructure not depend on any single diagram type's schema. The gesture layer now satisfies that structurally; this specification makes its **cost** satisfy it too — a drag on a big diagram is the report that prompted all of this, and the reader who dragged it is still waiting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A drag costs the same on a large diagram as on a small one (Priority: P1)

Source: **Requirement 1 — A drag costs the same on a large diagram as on a small one**

**User Story:** As a user dragging on a big diagram, I want the canvas to keep up with my pointer, so that arranging a large graph is not slower than arranging a small one.

**Why this priority**: This is the reported symptom: a drag on a large diagram cannot keep up with the pointer, and the user named it as the acceptance bar.

**Independent Test**: Drag, pan, connect, resize a span and adjust a connection on a large model and count renders: the elements outside the gesture render zero times per pointer frame, and no layout is read per frame.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **1.1** WHEN an element is dragged THEN the elements that are not part of the gesture SHALL NOT be re-rendered for each pointer frame; the per-frame cost SHALL be a function of the gesture, not of how many elements the diagram draws.
2. **1.2** WHEN pointer events arrive faster than the display refreshes THEN they SHALL be coalesced, one rendered frame per displayed frame — and it is recorded here that coalescing alone does NOT satisfy criterion 1: it caps how often the whole canvas is rebuilt without stopping each rebuild being proportional to element count.
3. **1.3** WHEN a gesture is in flight THEN no synchronous layout read SHALL be performed per pointer frame; the surface rectangle SHALL be read once at gesture start and cached for the gesture's life. `unitsPerPixel`'s per-move `getBoundingClientRect` is the named offender.
4. **1.4** WHEN the discipline is implemented THEN it SHALL live in `DiagramCanvas` — never pushed into diagram definitions or modules — so every canvas, present and future, gets it from the one gesture layer.
5. **1.5** WHEN any gesture kind previews per pointer frame — reposition, pan, connect, **span resize and connection-adjust** — THEN the same discipline SHALL apply to it, because every kind left outside keeps the report's symptom reproducible through that kind on a large diagram. *Amended 2026-09-06: the approved version enumerated three kinds; the survey's count was short, and resize and connection-adjust — both writing per-frame state in the same `onDragMove` when it was surveyed — join the enumeration rather than being recorded as a non-goal, since a non-goal would enshrine an enumeration error as a decision.*

### User Story 2 - Nothing a gesture means changes (Priority: P2)

Source: **Requirement 2 — Nothing a gesture means changes**

**User Story:** As a user of any existing diagram, I want every gesture to behave exactly as it does today, so that a scheduling change costs me nothing.

**Why this priority**: The change is to scheduling only; the source requires that nothing a gesture means or dispatches changes, so a regression here would turn a performance fix into a behaviour change.

**Independent Test**: Run the existing module and library tests unchanged, and check a completed gesture dispatches exactly once while an abandoned one dispatches nothing.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **2.1** WHEN the discipline lands THEN the existing module and library tests SHALL pass unchanged, and any test that must change SHALL be treated as evidence of a behaviour change rather than as a test to update.
2. **2.2** WHEN a gesture completes THEN it SHALL dispatch exactly what it dispatches today — the same command, the same action id, the same one-undo-per-gesture contract — and the still-click-selects rule, the Escape-abandons rule and the authored-position-is-stored-unrounded rule SHALL be untouched.
3. **2.3** WHEN a gesture is abandoned mid-flight — Escape, lost capture, unmount — THEN it SHALL leave no state behind and dispatch nothing, including whatever transient visual the discipline was showing.

### User Story 3 - The improvement is guarded, not just achieved (Priority: P2)

Source: **Requirement 3 — The improvement is guarded, not just achieved**

**User Story:** As a maintainer, I want the performance property pinned by a test, so that a later change to the one gesture layer cannot quietly reintroduce the per-element cost.

**Why this priority**: It keeps the improvement from being lost by a later change to the one gesture layer.

**Independent Test**: Run the same-run ratio test on a small and a large model, then restore the per-frame state write and see the ratio blow its tolerance.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **3.1** WHEN the discipline is in place THEN a test SHALL drag on a large model and a small model of the same diagram type in one run and SHALL fail if the per-frame cost regains its scaling with element count — and the guard SHALL exercise **every gesture kind the discipline covers**, so a kind sitting outside the guard cannot silently mean the guard asserts less than it appears to.
2. **3.2** WHEN that test is written THEN it SHALL assert a machine-independent property — a ratio between the two measurements from the same run, with its tolerance stated in the test — never an absolute millisecond budget, which becomes a flaky test on a slower machine.
3. **3.3** WHEN the guard is accepted THEN it SHALL first have been seen to fail for the right reason, by restoring the per-frame state write and watching the ratio blow its tolerance; a ratio test that has never failed is asserting arithmetic, not a property.

### User Story 4 - The report's own diagrams are verified, not assumed (Priority: P2)

Source: **Requirement 4 — The report's own diagrams are verified, not assumed**

**User Story:** As the person who reported that RDF and Helm feel slow, I want the fix demonstrated on the diagrams I complained about, so that the work is judged against the symptom that prompted it.

**Why this priority**: It judges the work against the diagrams the user complained about rather than against an assumption.

**Independent Test**: Measure a drag on the Wikidata, laureates, `owl-time` and Helm models before and after, with a timeline drag at a comparable element count in the same run, and follow the `tests.md` entry in a real browser.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **4.1** WHEN the discipline lands THEN the RDF and Helm canvases SHALL be measured again on the same models as the 2026-09-03 survey, with fresh before-and-after figures recorded — new measurements on both sides, not comparisons against the quote above — and the owl reading SHALL be included (the `owl-time` example), because the user named owl, rdf and shacl as the readings where dragging annoys.
2. **4.2** WHEN the after figures are recorded THEN a timeline drag at a comparable element count SHALL be measured in the same run and recorded beside them, so "feels like the timeline" — the user's stated benchmark — is answered with a number rather than an impression.
3. **4.3** WHEN the measurement is repeated THEN a manual check SHALL be added to `tests.md` for dragging on the Wikidata and laureates examples, so the improvement is confirmed in a real browser and not only in jsdom.

### Edge Cases

- Pointer events arriving faster than the display refreshes are coalesced to one rendered frame per displayed frame (criterion 1.2).
- A gesture abandoned mid-flight by Escape, lost capture or unmount leaves no state behind, dispatches nothing and removes any transient visual (criterion 2.3).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A gesture MUST NOT re-render the elements outside it per pointer frame, MUST coalesce pointer events to the display's frames, MUST read the surface rectangle once per gesture, and MUST do so in `DiagramCanvas` for every gesture kind that previews per frame (reposition, pan, connect, span resize and connection-adjust) (User Story 1; criteria 1.1–1.5).
- **FR-002**: The discipline MUST NOT change what any gesture means: existing tests pass unchanged, a completed gesture dispatches exactly what it dispatches today, and an abandoned one leaves nothing behind and dispatches nothing (User Story 2; criteria 2.1–2.3).
- **FR-003**: A test MUST guard the property on a large and a small model in one run, for every gesture kind covered, as a ratio with a stated tolerance rather than an absolute time, and MUST have been seen to fail first (User Story 3; criteria 3.1–3.3).
- **FR-004**: The RDF, owl and Helm canvases MUST be measured afresh before and after on the 2026-09-03 models, with a timeline drag at comparable size recorded beside them, and a manual browser check MUST be added to `tests.md` (User Story 4; criteria 4.1–4.3).

### Non-Functional Requirements

#### Code Architecture and Modularity

- The change is to how `DiagramCanvas` schedules gesture frames; its definition contract, its event handlers and the module boundary are untouched.
- No module gains gesture code, and `noPrivateGestures.test.ts` continues to hold that at zero.

#### Performance

- Per-frame gesture cost independent of drawn-element count (Requirement 1), asserted by a same-run ratio (Requirement 3).
- No per-frame synchronous layout reads (Requirement 1.3).

#### Reliability

- An abandoned gesture reverts its transient visual and dispatches nothing (Requirement 2.3).

#### Usability

- Nothing the user does changes; the only difference is that large diagrams keep up with the pointer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: During reposition, pan, span resize and connection-adjust on a hundred-element model, every element outside the gesture renders zero times (Requirements 1.1 and 1.5, the deterministic half of the guard).
- **SC-002**: Per-frame cost on a large and a small model of the same diagram type stays within the ratio tolerance stated in the guard, and the guard was seen to fail with the per-frame state writes restored (Requirements 3.1 to 3.3).
- **SC-003**: Fresh before-and-after figures for the Wikidata, laureates, `owl-time` and Helm models are recorded with a timeline drag at comparable size beside them, and a `tests.md` entry covers the real-browser check (Requirements 4.1 to 4.3).
- **SC-004**: Every existing module and library test passes unchanged (Requirement 2.1), and the four gates exit zero on the merged tree before each landing.

### Outcome

Tasks 1 to 6 landed on develop as `058bb0ca` on 2026-09-06: the gesture-frame scheduler `gestureFrame.ts`, reposition through a scoped re-render (the user's ruling of 2026-09-06, recorded under the design's Deviations), pan and connect preview through the scheduler, and the `dragCost.test.tsx` guard, seen to fail first. Task 5's fresh measurements showed the per-frame cost flat after the change, for example the laureates model from 47.779 ms to 0.334 ms per frame against 0.244 ms and 0.490 ms for the 100-span and 1,000-span timelines. The amendment's tasks 7 and 8 brought span resize and connection-adjust inside the discipline and widened the guard, landing as `353f4d6a` the same day.
