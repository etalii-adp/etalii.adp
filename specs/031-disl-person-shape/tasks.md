# Tasks: A Built-in Person Shape in DISL

**Input**: [disl-person-shape.spec.md](disl-person-shape.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/disl-person-shape.md](contracts/disl-person-shape.md), [quickstart.md](quickstart.md)

**Prerequisites**: the plan, merged into `develop` as `5301de2`, with the version ruled on 2026-10-19 ("Approve, open 0.5").

**Tests**: the specification asks for no test code. Every change is a document change, checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/licence-check.py` and `python .github/scripts/terminology-check.py --name etalii.adp` (the Build workflow runs all three), by the planted fault of quickstart step 3, and by the reading check of quickstart step 4.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (a different file, no dependency on an unfinished task).
- **[Story]**: the user story of the spec the task serves (US1, US2, US3).
- Every path is written with its repository, `etalii.adp/`. Line numbers are those of `develop` at `5301de2` and move as earlier tasks add text; the quoted text is the anchor.

---

## Phase 1: Setup

**Purpose**: a baseline to compare the finished change against.

- [x] T001 From the feature's worktree, run the three checks on the unchanged tree and record each exit code, the validator's example count (140) and the terminology check's review count, for comparison in T019 (quickstart step 1).

---

## Phase 2: Foundational (open DISL 0.5)

**Purpose**: the version every later task writes into (research R1, contract C0). Mirror `b408fbf`, where 0.4 was opened from 0.3, in each place.

**⚠️ CRITICAL**: the user-story phases mark their text *(DISL 0.5)* and add rows to the section T007 creates, so this phase comes first.

- [x] T002 In `etalii.adp/specifications/disl/DISL-specification.md`, change the header line 3 "**Specification, version 0.4 (Draft)**" to version 0.5, and the `Date` row (line 7) from 2026-10-09 to 2026-10-19 (contract C0).
- [x] T003 In the same file's *Status of this document* paragraph (line 19), change "This is a draft, version 0.4." to "version 0.5", and after the sentence on DISL 0.4 append one sentence: DISL 0.5 adds a built-in `person` shape (a rounded box with a round head above it, which the C4 diagram tool type needs); every valid 0.4 specification is a valid 0.5 specification with the same meaning, apart from the clarification in [Changes from 0.4](#changes-from-04) (contract C0, FR-010).
- [x] T004 In the same file's contents, add `- [Changes from 0.4](#changes-from-04)` directly after `- [Changes from 0.3](#changes-from-03)` (line 46) (contract C0).
- [x] T005 In the same file's section 2.9, first bullet (line 354), list the versions as `"0.1"`, `"0.2"`, `"0.3"`, `"0.4"` or `"0.5"`. Add no superset bullet, as 0.4 added none (research R1, contract C0).
- [x] T006 [P] In `etalii.adp/specifications/disl/disl.schema.json`, change the root `title` (line 4) to "DISL 0.5 (draft) — Diagram Specification Language", and the description of `$defs/Specification/properties/disl` (line 1368) to name 0.1, 0.2, 0.3, 0.4 or 0.5, say a 0.5 runtime reads 0.1, 0.2, 0.3 and 0.4 specifications with their meaning, and point at "DISL 0.5, section 2.9". Leave the `$id` (the 0.2 address), the version key's `pattern` and every shape construct unchanged: `$defs/ShapeRef` already accepts any shape name (research R2, contract C0, FR-008).
- [x] T007 In `etalii.adp/specifications/disl/DISL-specification.md`, add a section `## Changes from 0.4` after the end of *Changes from 0.3* and before the `---` that precedes `## 18. Deprecated aliases` (line 6125), in the shape of *Changes from 0.3*: an opening paragraph (DISL 0.5, draft, 2026-10-19, ruled by the maintainer on 2026-10-19 with the cards "Add to DISL" and "Approve, open 0.5"; the construct is optional and its absence is the 0.4 behaviour; every valid 0.4 specification is a valid 0.5 specification with the same meaning, apart from the clarification in the second table), an additions table with the header `| Construct | Section | Schema |` and a clarifications table with the header `| # | Change | 0.4 said | 0.5 says | Reason | Section |`, both left for T011 to fill, and a closing sentence that DISL 0.5 needs no change to DID or FBL (contract C5, FR-010, FR-011).

**Checkpoint**: the document and the schema say 0.5 everywhere a version is stated (quickstart step 5); the validator still passes, because nothing yet uses 0.5.

---

## Phase 3: User Story 1 - A tool engineer draws a person with one word (Priority: P1) 🎯 MVP

**Goal**: `"shape": "person"` gives the C4 person: a rounded box with the label inside and a round head above it.

**Independent Test**: a reader of section 6.7 and Appendix B.2 alone draws `person` for bounds of 160 by 100 and gives the head's centre (80, −8), its radius 10, the body's corner radius 8 and where the label goes (spec US1, SC-001).

- [x] T008 [US1] In section 6.7 of `etalii.adp/specifications/disl/DISL-specification.md`, add a table row directly after `cylinder` (line 2001): Shape `person`, Parameters `radius`, Notes "*(DISL 0.5)* A rounded box carrying the label, with a round head above its top edge; not `actor`, the stick figure with its label below." Leave the `actor` row unchanged (contract C1, FR-001, FR-007).
- [x] T009 [US1] In the same section, after the paragraph that begins "Every built-in shape defines its **outline**" (line 2025), add a paragraph headed **The person shape** *(DISL 0.5)* stating, with RFC 2119 key words in bold capitals (contract C3):
  - P1: the body **MUST** be a rounded rectangle exactly over the bounds with corner radius `radius`, the effective radius being the smaller of `radius` and half the smaller side of the bounds (data model: "Effective radius `r' = min(radius, min(w, h) / 2)`");
  - P2: the head **MUST** be a circle of radius 10 whose centre is on the vertical centre line of the bounds, 8 above the top edge, and its size and position **MUST NOT** follow the bounds or `radius`;
  - P3: the head **MUST** be painted before the body, so the body covers it where they overlap, and both take the node's style and states;
  - P6: the text area **MUST** be the body minus the node's padding, as for `roundedRect`;
  - P7: the bounds are the body; the head lies outside them, and anything that measures what the diagram draws, such as fitting it to the view or an export (11.11), **MUST** include the head;
  - P8: a negative `radius` is not a valid value ("`radius` below 0 is not a valid value"); a node narrower than the head is drawn with the head unchanged and raises no finding;
  - P9: a short example, `"shape": "person"` and `{ "type": "person", "params": { "radius": 4 } }`, with the figure for bounds of 160 by 100 at the origin (head centre (80, −8), top of the head at y = −18).

  Leave room for P4 and P5, which T013 adds. Do not restate section 6.8's shadowing rule; it already covers a custom shape named `person` (FR-002, FR-003, FR-005, FR-006, FR-007).
- [x] T010 [US1] In Appendix B.2 of the same file, add the row `| person | radius: 8 |` directly after `cylinder` (line 6846), in the table's column widths (contract C4, FR-003).
- [x] T011 [US1] In the section *Changes from 0.4* that T007 added, fill the additions table with one row, `` `person`, a built-in shape with the parameter `radius` `` | 6.7, B.2 | – (`$defs/ShapeRef` accepts any shape name), and the clarifications table with one row: 1 | A shape reference `"person"` with no custom shape of that name | An unknown shape | The built-in `person` | The C4 person needed a shape every host draws alike | 6.7 (contract C5, FR-010).

**Checkpoint**: quickstart step 4's first three questions and the label question are answered by the text alone.

---

## Phase 4: User Story 2 - Connections and pointing behave as C4 readers expect (Priority: P1)

**Goal**: relations end on the person's box, and a click on the head selects the person.

**Independent Test**: for a person and a relation arriving from straight above and from the side, the text alone says where each ends and which points select the node (spec US2, SC-002).

- [x] T012 [US2] In section 6.7 of `etalii.adp/specifications/disl/DISL-specification.md`, extend the sentence "Every built-in shape defines its **outline** (for edge anchoring and hit testing) and its **text area**" so that a shape may state a separate hit area, naming `person` as the built-in that does (research R4, contract C2, FR-004).
- [x] T013 [US2] In the person paragraph of T009, add P4, that relations **MUST** anchor on the body's outline alone, and P5, that hit testing **MUST** cover the body and the head, a hit on the head being a hit on the node, widened by `hitPaddingScreenPx` as for any outline (contract C3, FR-004).

**Checkpoint**: quickstart step 4's anchoring and hit questions are answered by the text alone.

---

## Phase 5: User Story 3 - The C4 definitions and the hosts can use it (Priority: P2)

**Goal**: the worked example uses the built-in, and nothing stops the C4 definitions and the hosts from doing the same in their follow-ups.

**Independent Test**: `c4-container.dis` with `"shape": "person"` and no `c4Person` validates, and `person` at its defaults describes the figure the definitions' `c4Person` draws (spec US3).

- [x] T014 [US3] Read the clarification tables of *Changes from 0.2*, *Changes from 0.3* and *Changes from 0.4* in `etalii.adp/specifications/disl/DISL-specification.md` against `etalii.adp/specifications/disl/c4-container.dis`, and record in the pull request each clarification that touches a construct the example uses and whether its meaning changes by declaring 0.5 instead of 0.2 (research R3).
- [x] T015 [US3] In `etalii.adp/specifications/disl/c4-container.dis`, change `"disl": "0.2"` (line 3) to `"0.5"`, remove `notation.shapes.c4Person` (lines 195–201, and `shapes` itself if nothing else remains in it), and give `notation.nodes.Person` `"shape": "person"`. Keep the file's formatting and line endings. The head moves from a centre 18 above the top edge to 8 above, which the pull request says (contract C6, FR-009).
- [x] T016 [US3] See the validator refuse a planted fault in the example (`"shape": { "type": "person", "params": 8 }`), then restore it and see it pass (quickstart step 3).
- [x] T017 [US3] Compare `person` at its defaults, as T009 to T013 state it, with the `c4Person` shape of `etalii.adp/definitions/diagrams/c4-context.dis` (head radius, head position, body corner radius, painting order, outline, hit area), and record the result in the pull request; any difference is a defect in T009 to T013 (spec US3 scenario 1, SC-004). Do not edit the definition.

**Checkpoint**: the example declares 0.5 and validates; quickstart step 2 prints `0.5 person False`.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T018 Do the reading check of quickstart step 4 on the finished text and record each answer with the sentence it comes from; an answer that has to be inferred from a definition or a host is a gap to fix (SC-001, SC-002).
- [x] T019 Run the three checks and compare them with T001: each exits 0, the example count is unchanged and `etalii.adp/specifications/disl/c4-container.dis` is `ok`, and the terminology check adds no error. Run quickstart steps 5 and 6: only `etalii.adp/specifications/disl/DISL-specification.md`, `etalii.adp/specifications/disl/disl.schema.json` and `etalii.adp/specifications/disl/c4-container.dis` changed under `specifications/` and `definitions/` (SC-003).
- [x] T020 Trace every FR-001 to FR-011 and SC-001 to SC-004 of the spec to the sentence, row or file that satisfies it, and read two of the traces back to their text to see that each is that requirement's evidence; record the trace in the pull request.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** has no dependency.
- **Phase 2** depends on Phase 1 and blocks every story: the stories write *(DISL 0.5)* text and fill the section T007 creates.
- **Phase 3 (US1)** depends on Phase 2.
- **Phase 4 (US2)** depends on T009 (it extends the person paragraph) and on Phase 2.
- **Phase 5 (US3)**: T014 and T015 depend on Phase 2 only (the example declares 0.5); T017 depends on Phases 3 and 4.
- **Phase 6** depends on everything before it.

### Within the phases

- T002 to T005 and T007 edit the same file and run in order; T006 is a different file.
- T008 to T011 and T012 to T013 edit the same file and run in order.
- T015 is a different file from Phases 3 and 4 and can run beside them once Phase 2 is done.

### Parallel opportunities

- T006 beside T002 to T005 and T007.
- T014 and T015 beside Phases 3 and 4.

## Parallel Example: after Phase 2

```text
One session:  T008 → T009 → T010 → T011 → T012 → T013   (DISL-specification.md)
Another:      T014 → T015 → T016                        (c4-container.dis)
Then:         T017 → T018 → T019 → T020
```

## Implementation Strategy

### MVP first (User Story 1)

Phases 1 and 2, then Phase 3: DISL 0.5 exists with the person shape drawn, labelled and defaulted. Stop and check against quickstart step 4's first questions.

### Incremental delivery

Phase 4 adds anchoring and hit testing, without which hosts could still draw differently; Phase 5 adds the worked example Principle II requires. All of it lands in one pull request in `etalii.adp`, because Principle II asks that the document, schema and examples change together.

## After this feature, elsewhere

Not tasks of this feature; listed so that they are not lost.

- `etalii.adp/definitions/diagrams/c4-*.dis` (six definitions): replace each `c4Person` custom shape by `"shape": "person"`, declare `"disl": "0.5"`, and update the companion pages `c4-*.md` that say "written at DISL 0.4". A change of its own in this repository, after this one is merged.
- `etalii.adp.ide.standalone`: the `person` entry in its DISL shape catalogue (`src/client/src/canvas/library/disl/shapeCatalog.ts`), mapping to the `person` shape its library draws, and the C4 module's bindings (`c4Bindings`), under task 11 / gap C1 of its specification `c4-disl-fbl`, with that repository's own process.
- `etalii.adp.ide.vscode`, `etalii.adp.ide.intellij`, `etalii.adp.ide.notion`: draw `person` when their own specifications take up DISL 0.5 or the C4 tool type.
