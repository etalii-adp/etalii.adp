# Contract: What the DISL Document Says About `person`

The interface this feature exposes is the text of `specifications/disl/DISL-specification.md`, which every host implements, and the example that shows it. This contract gives the substance each place must carry. The exact wording is the implementer's, as long as every obligation below can be found in it with its key word.

## C1. Section 6.7, the shape table

A row directly after `cylinder`:

| Shape | Parameters | Notes |
|-------|------------|-------|
| `person` | `radius` | *(DISL 0.4)* A rounded box carrying the label, with a round head above its top edge; not `actor`, the stick figure with its label below. |

## C2. Section 6.7, the outline sentence

The sentence "Every built-in shape defines its outline (for edge anchoring and hit testing) and its text area" gains that a shape may state a separate hit area, and names `person` as the shape that does.

## C3. Section 6.7, a `person` paragraph after the outline sentence

Marked *(DISL 0.4)*, carrying each of these, normative where marked:

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

## C5. *Changes from 0.3*, first table

A row: `person`, a built-in shape (the ruling of 2026-10-19, spec 031) | 6.7, B.2 | –. The paragraph after the tables, or the row, says that every valid 0.4 specification keeps its meaning, and that a specification naming `person` without declaring it, previously an unknown shape, now draws the built-in.

## C6. The worked example `specifications/disl/c4-container.dis`

- `"disl": "0.4"`.
- No `c4Person` in `notation.shapes`.
- `notation.nodes.Person.shape` is `"person"`.
- It validates against `disl.schema.json`.

## Unchanged

`actor`; section 6.8's shadowing rule; section 15; `disl.schema.json`; every other example; `definitions/`.
