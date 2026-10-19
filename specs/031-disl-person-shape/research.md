# Research: A Built-in Person Shape in DISL

Phase 0 of the [plan](plan.md). The specification has no `[NEEDS CLARIFICATION]` left (both were answered on 2026-10-19), so the research settles the plan-level questions the spec left open: version, schema, example, and how the new shape fits the paragraphs around it.

## R1: Which version carries the shape

- **Decision**: amend the DISL 0.4 draft in place. The new paragraph is marked *(DISL 0.4)*, and a row is added to the first table of *Changes from 0.3*: `` `person`, a built-in shape (ruling of 2026-10-19, spec 031) | 6.7, B.2 | – ``. The header (version 0.4, date 2026-10-09), the status paragraph, section 2.9 and the schema's `$id` and `disl` description are unchanged.
- **Rationale**: Principle IV lets constructs change freely before 1.0, and drafts have been amended in place before: `3c5b1c4` ("Amend the DISL 0.3 draft …", 2026-10-06) and `467b458` (a 0.3 addition on 2026-10-17, after 0.4 was written), each listed in its version's table of additions. The six C4 definitions that will use `person` already declare `"disl": "0.4"`, so they adopt it without a version change.
- **Alternatives considered**: DISL 0.5. It would need a status paragraph, a *Changes from 0.4* section, 2.9 and the schema description naming 0.5, and every adopter declaring 0.5, for one optional shape. Kept as option B of the plan's open question.

## R2: The schema

- **Decision**: no change to `disl.schema.json`.
- **Rationale**: `$defs/ShapeRef` is `anyOf` a string, a `ShapeInstance` or a `ShapeDef`; the string is unconstrained, and `ShapeInstance.params` is `additionalProperties: true`. So `"shape": "person"` and `{ "type": "person", "params": { "radius": 6 } }` validate today. The descriptions of `ShapeRef` and `ShapeInstance` name `ellipse`, `roundedRect` and `polygon` as examples, not as a list. FR-008 is met without an edit, as it allows.
- **Alternatives considered**: an `enum` of built-in names on the string branch. It would refuse every custom shape name used as a string (`"c4Person"`), which the schema must accept, and would be a schema change of its own.

## R3: The worked example

- **Decision**: `specifications/disl/c4-container.dis` removes `notation.shapes.c4Person`, gives `nodes.Person` `"shape": "person"`, and changes `"disl": "0.2"` to `"0.4"`.
- **Rationale**: Principle II asks for a worked example with every change; this is the only example under `specifications/disl/` with a person. Section 2.9 says a specification that uses a construct new in a minor version **SHOULD** declare that version. The head moves: the example's head centre is 18 above the top edge (`y: -28`, `h: 20`), the built-in's is 8 above, so the head now overlaps the body as in the C4 definitions. Moving from 0.2 to 0.4 crosses the clarifications of *Changes from 0.2* and *Changes from 0.3*; the task that edits the example reads both tables against it, and the validator checks the result.
- **Alternatives considered**: keep `"disl": "0.2"` (a **SHOULD** ignored in the example meant to show the language); use `person` in `work-board.dis`, already 0.4 (it has no person, so the use would be invented); change a C4 definition under `definitions/` instead (the spec makes those a follow-up).

## R4: Outline and hit area

- **Decision**: section 6.7's sentence "Every built-in shape defines its **outline** (for edge anchoring and hit testing) and its **text area**" gains "unless the shape states a separate hit area"; the `person` paragraph states the outline (the body's rounded rectangle) and the hit area (body and head).
- **Rationale**: the ruling "Body, head clicks" separates the two, which the sentence as written does not allow for. Section 6.8 already separates them for custom shapes (`outline: true` and `hit` per part), so the built-in uses a distinction the language already has.
- **Alternatives considered**: stating it only in the `person` paragraph, which would contradict the general sentence a reader meets first.

## R5: The corner limit

- **Decision**: the `person` paragraph says the effective corner radius is the smaller of `radius` and half the smaller side of the bounds; a negative `radius` is not a valid value.
- **Rationale**: FR-002 and the edge case require the body never to turn inside out; section 6.7 states no such limit for `roundedRect`, so it is written for `person`.
- **Alternatives considered**: a general limit for `roundedRect`, `callout` and `person` together. It changes shapes outside the ruling.

## R6: Extent and conformance

- **Decision**: the paragraph says the bounds are the body, the head is drawn outside them, and anything that measures what the diagram draws (fitting to the view, an export of section 11.11) includes the head. Section 15 is unchanged: the Standard level's "all built-in shapes" covers `person`, and Core lists only five shapes.
- **Rationale**: FR-006 and the edge case on the head outside the bounds; the `callout` pointer is the precedent for drawing outside the bounds.
- **Alternatives considered**: enlarging the bounds to include the head. Sizes, layout and snapping would then differ from the C4 definitions' custom shape.

## R7: Consumers

- **Decision**: named in the specification's Scope only. The C4 definitions switch in a later change in this repository; the standalone catalogue entry is task 11 / gap C1 of its `c4-disl-fbl`.
- **Rationale**: the ruling asked for the language change; the spec states the rest as follow-ups.
