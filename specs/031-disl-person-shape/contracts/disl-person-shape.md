# Contract: What the DISL Document Says About `person`

The interface this feature exposes is the text of `specifications/disl/DISL-specification.md`, which every host implements, and the example that shows it. This contract gives the substance each place must carry, in DISL 0.5 (research R1). The exact wording is the implementer's, as long as every obligation below can be found in it with its key word.

## C0. The version

As 0.4 was opened from 0.3 (`b408fbf`):

- The header reads "Specification, version 0.5 (Draft)" and its `Date` row 2026-10-19.
- The status paragraph begins "This is a draft, version 0.5" and ends its account of the versions with a sentence saying that DISL 0.5 adds a built-in `person` shape (a rounded box with a head above, which the C4 diagram tool type needs) and that every valid 0.4 specification is a valid 0.5 specification with the same meaning, apart from the clarification in [Changes from 0.4](#changes-from-04).
- The contents list `Changes from 0.4` after `Changes from 0.3`.
- Section 2.9's first bullet lists `"0.1"`, `"0.2"`, `"0.3"`, `"0.4"` or `"0.5"`.
- `disl.schema.json`: the `title` is "DISL 0.5 (draft) — Diagram Specification Language", and the `disl` property's description names 0.1 to 0.5, says a 0.5 runtime reads 0.1, 0.2, 0.3 and 0.4 specifications with their meaning, and points at DISL 0.5, section 2.9. The `$id` and the version key's pattern are unchanged.

## C1. Section 6.7, the shape table

A row directly after `cylinder`:

| Shape | Parameters | Notes |
|-------|------------|-------|
| `person` | `radius` | *(DISL 0.5)* A rounded box carrying the label, with a round head above its top edge; not `actor`, the stick figure with its label below. |

## C2. Section 6.7, the outline sentence

The sentence "Every built-in shape defines its outline (for edge anchoring and hit testing) and its text area" gains that a shape may state a separate hit area, and names `person` as the shape that does.

## C3. Section 6.7, a `person` paragraph after the outline sentence

Marked *(DISL 0.5)*, carrying each of these, normative where marked:

| # | Obligation | Spec |
|---|------------|------|
| P1 | The body **MUST** be a rounded rectangle exactly over the bounds, with corner radius `radius`, limited to half the smaller side of the bounds. | FR-002, FR-003 |
| P2 | The head **MUST** be a circle of radius 10 whose centre lies on the vertical centre line of the bounds, 8 above the top edge. Its size and position are fixed and **MUST NOT** follow the bounds or `radius`. | FR-002, FR-003 |
| P3 | The head **MUST** be painted before the body, so the body covers it where they overlap. Both take the node's style and states. | FR-002 |
| P4 | Relations **MUST** anchor on the body's outline alone. | FR-004 |
| P5 | Hit testing **MUST** cover the body and the head; a hit on the head is a hit on the node. | FR-004 |
| P6 | The text area **MUST** be the body minus the node's padding, as for `roundedRect`. | FR-005 |
| P7 | The bounds are the body. The head lies outside them; anything that measures what the diagram draws, such as fitting it to the view or exporting it, **MUST** include the head. | FR-006 |
| P8 | A negative `radius` is not a valid value. A node narrower than the head is drawn with the head unchanged and raises no finding. | Edge cases |
| P9 | A short example, `"shape": "person"` with the figure it gives for bounds of 160 by 100 (head centre at (80, −8)). | SC-001 |

## C4. Appendix B.2

A row `person` | `radius`: 8, after `cylinder`.

## C5. A new section *Changes from 0.4*

After *Changes from 0.3* and before section 18, in the shape of *Changes from 0.3*:

- A paragraph: DISL 0.5 (draft, 2026-10-19) adds the construct below, ruled by the maintainer on 2026-10-19 (the card "Add to DISL", and "Approve, open 0.5" for the version); it is optional, and its absence is the 0.4 behaviour. Every valid 0.4 specification is a valid 0.5 specification with the same meaning, apart from the clarification in the second table.
- A table of additions with one row: `person`, a built-in shape with the parameter `radius` | 6.7, B.2 | – (`$defs/ShapeRef` accepts any shape name).
- A table of clarifications with one row: a shape reference `"person"` with no custom shape of that name | 0.4: an unknown shape | 0.5: the built-in `person` | the C4 person needed a shape every host draws alike | 6.7.
- A sentence that DISL 0.5 needs no change to DID or FBL.

## C6. The worked example `specifications/disl/c4-container.dis`

- `"disl": "0.5"`.
- No `c4Person` in `notation.shapes`.
- `notation.nodes.Person.shape` is `"person"`.
- It validates against `disl.schema.json`.

## Unchanged

`actor`; section 6.8's shadowing rule; section 15; the schema's `$id` and every construct of it; the *(DISL 0.4)* markings and *Changes from 0.3*; every other example; `definitions/`.
