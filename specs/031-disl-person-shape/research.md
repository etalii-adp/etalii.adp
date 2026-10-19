# Research: A Built-in Person Shape in DISL

Phase 0 of the [plan](plan.md). The specification has no `[NEEDS CLARIFICATION]` left (both were answered on 2026-10-19), so the research settles the plan-level questions the spec left open: version, schema, example, and how the new shape fits the paragraphs around it.

## R1: Which version carries the shape

- **Decision**: a new version, **DISL 0.5 (draft)**. The maintainer ruled it on 2026-10-19, approving this plan with the card option "Approve, open 0.5", in place of the amendment of the 0.4 draft the plan first proposed.
- **How 0.5 is opened**: as 0.4 was opened from 0.3 in `b408fbf` (2026-10-09), which changed, and only changed, these places for the version itself:
  - the document's header, "Specification, version 0.4 (Draft)", and its `Date` row;
  - the status paragraph, "This is a draft, version 0.4", with one sentence appended saying what 0.4 adds and that every valid 0.3 specification is a valid 0.4 specification with the same meaning, apart from the clarifications in *Changes from 0.3*;
  - the contents, with a `Changes from 0.3` entry;
  - section 2.9's first bullet, whose list of versions gained `"0.4"`;
  - a new section *Changes from 0.3* after *Changes from 0.2*: a paragraph naming the ruling and date, a table of additions (construct, section, schema), and a table of clarifications (what 0.3 said, what 0.4 says, why);
  - in `disl.schema.json`, the `title` ("DISL 0.4 (draft) — …") and the `disl` property's description ("… 0.1, 0.2, 0.3 or 0.4. A 0.4 runtime reads 0.1, 0.2 and 0.3 specifications with their meaning. See DISL 0.4, section 2.9."). The `$id` stayed at the 0.2 address, as 2.9 says of drafts since 0.3, and the version key keeps its `major.minor` pattern, so no enum changed.

  0.5 mirrors each: header "version 0.5 (Draft)" with date 2026-10-19; a status sentence "DISL 0.5 adds a built-in `person` shape …; every valid 0.4 specification is a valid 0.5 specification with the same meaning, apart from the clarification in Changes from 0.4"; a `Changes from 0.4` contents entry; `"0.5"` in 2.9; a section *Changes from 0.4* after *Changes from 0.3*; the schema title and `disl` description naming 0.5. New text is marked *(DISL 0.5)*. 0.4 added no superset bullet of its own to 2.9 and neither does 0.5; the status paragraph carries the statement, as it did for 0.4.
- **Rationale**: the ruling. Principle IV requires the version and status at the top of the document, which the header and status paragraph give.
- **Alternatives considered**: amending the 0.4 draft in place, as the 0.3 draft was amended (`3c5b1c4`, `467b458`). Proposed first and not chosen by the maintainer.

## R2: The schema

- **Decision**: no change to the shape constructs of `disl.schema.json`; only its version strings change (R1).
- **Rationale**: `$defs/ShapeRef` is `anyOf` a string, a `ShapeInstance` or a `ShapeDef`; the string is unconstrained, and `ShapeInstance.params` is `additionalProperties: true`. So `"shape": "person"` and `{ "type": "person", "params": { "radius": 6 } }` validate today. The descriptions of `ShapeRef` and `ShapeInstance` name `ellipse`, `roundedRect` and `polygon` as examples, not as a list. FR-008 is met without an edit to them, as it allows.
- **Alternatives considered**: an `enum` of built-in names on the string branch. It would refuse every custom shape name used as a string (`"c4Person"`), which the schema must accept, and would be a schema change of its own.

## R3: The worked example

- **Decision**: `specifications/disl/c4-container.dis` removes `notation.shapes.c4Person`, gives `nodes.Person` `"shape": "person"`, and changes `"disl": "0.2"` to `"0.5"`.
- **Rationale**: Principle II asks for a worked example with every change; this is the only example under `specifications/disl/` with a person. Section 2.9 says a specification that uses a construct new in a minor version **SHOULD** declare that version. The head moves: the example's head centre is 18 above the top edge (`y: -28`, `h: 20`), the built-in's is 8 above, so the head now overlaps the body as in the C4 definitions. Moving from 0.2 to 0.5 crosses the clarifications of *Changes from 0.2*, *Changes from 0.3* and *Changes from 0.4*; the task that edits the example reads the three tables against it, and the validator checks the result.
- **Alternatives considered**: keep `"disl": "0.2"` (a **SHOULD** ignored in the example meant to show the language); use `person` in `work-board.dis`, a 0.4 example (it has no person, so the use would be invented); change a C4 definition under `definitions/` instead (the spec makes those a follow-up).

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

- **Decision**: named in the specification's Scope only. The C4 definitions switch in a later change in this repository, declaring `"disl": "0.5"` then; the standalone catalogue entry is task 11 / gap C1 of its `c4-disl-fbl`.
- **Rationale**: the ruling asked for the language change; the spec states the rest as follow-ups.
