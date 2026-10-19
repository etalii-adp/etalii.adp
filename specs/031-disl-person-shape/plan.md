# Implementation Plan: A Built-in Person Shape in DISL

**Branch**: `features/031-disl-person-shape` | **Date**: 2026-10-19 | **Spec**: [disl-person-shape.spec.md](disl-person-shape.spec.md)

**Input**: The feature specification, approved by the maintainer on 2026-10-19 (card "Approve") and merged into `develop` as `2298b71`, with both clarifications of the session of 2026-10-19 ("Corner only", "Body, head clicks"). The plan was approved the same day with the card option "Approve, open 0.5": the shape opens DISL 0.5 rather than amending the 0.4 draft.

## Summary

DISL gains the built-in shape `person` in a **new version, DISL 0.5 (draft)**, opened from 0.4 the way 0.4 was opened from 0.3 (`b408fbf`), by the maintainer's ruling of 2026-10-19 ("Approve, open 0.5"). The body is a rounded rectangle over the bounds with one parameter, `radius` (default 8, limited to half the smaller side). The head is a fixed circle of radius 10 whose centre is 8 above the top edge, painted under the body. Relations anchor on the body alone; hit testing covers body and head; the label's text area is the body minus padding; the bounds stay the body and a measure of what is drawn includes the head. The change is prose in `specifications/disl/DISL-specification.md` (the version, date and status paragraph, the contents, section 2.9, sections 6.7 and B.2, and a new *Changes from 0.4*), two version strings in `disl.schema.json` (its title and the `disl` property's description; it enumerates no shape names, so no shape construct changes), and one worked example, `specifications/disl/c4-container.dis`, which drops its `c4Person` custom shape for `"shape": "person"` and declares `"disl": "0.5"`. No host and no definition under `definitions/` changes here.

## Technical Context

- **What changes**: `specifications/disl/DISL-specification.md`: the header ("version 0.5 (Draft)", date 2026-10-19), a 0.5 sentence at the end of the status paragraph, `Changes from 0.4` in the contents, `"0.5"` in 2.9's list of versions, the shape table and the outline paragraph of 6.7, a new `person` paragraph after it, the B.2 row, and a new section *Changes from 0.4* after *Changes from 0.3*. `specifications/disl/disl.schema.json`: the title ("DISL 0.5 (draft)") and the `disl` description (versions up to 0.5, a 0.5 runtime reading 0.1 to 0.4, section 2.9 of DISL 0.5). `specifications/disl/c4-container.dis`: `"disl": "0.2"` becomes `"0.5"`, the `c4Person` custom shape is removed, and `Person` takes `"shape": "person"`.
- **What does not change**: the schema's shape constructs and its `$id`, which stays at the 0.2 address as it did for 0.3 and 0.4 (R1, R2); the *(DISL 0.4)* markings and the *Changes from 0.3* section; section 15's conformance levels (R6); `definitions/diagrams/c4-*.dis`, which declare 0.5 when they adopt the shape, and every host (follow-ups named in the spec's Scope).
- **What checks it**: `python .github/scripts/validate-examples.py` (the changed example against the schema), `python .github/scripts/licence-check.py` (the DISL document's Licence row is untouched), `python .github/scripts/terminology-check.py --name etalii.adp`. All three run in the Build workflow.
- **What the validator cannot check**: that the prose says what the spec requires. The [quickstart](quickstart.md) gives a reading check against [contracts/disl-person-shape.md](contracts/disl-person-shape.md), and the tasks trace every FR to the sentence that satisfies it.
- **Storage, performance, platforms**: not applicable; this is a document change.

## Constitution Check

*Gate before Phase 0, re-checked after Phase 1: passes both times.*

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | Two definitions of the same figure already differ in this repository (head centre 8 above in `definitions/`, 18 above in the example) and the standalone host draws a third copy. The figure is defined here once, before the C4 definitions and the hosts adopt it. |
| II. Implementable from the document alone | Section 6.7 states geometry, outline, hit area, text area and extent in DISL's own terms, with numbers; B.2 gives the default. The schema already accepts the shape (R2) and names 0.5 in its title and version description; the worked example uses the shape, declares 0.5 and validates. |
| III. Precise normative language | The new paragraph uses **MUST** for every obligation; no CEL is needed, since the geometry has no computed values beyond the one Bindable parameter. |
| IV. Versioned specifications | A new minor version, 0.5 (Draft), stated at the top of the document. Every valid 0.4 specification is a valid 0.5 specification with the same meaning; the one clarification, that a specification naming `person` without declaring it now draws the built-in, is listed in *Changes from 0.4* (R1). |
| V. Simplicity | One parameter, as ruled; the head is fixed. No new schema construct, no new conformance level. |
| VI. No JetBrains Rider warnings in C# | No C# in this feature. |

No repository principles file applies: the code of this feature lands only in `etalii.adp`. No violation to track.

## Decisions

The reasoning and the alternatives are in [research.md](research.md).

1. **R1, DISL 0.5**, by the ruling of 2026-10-19, opened as 0.4 was opened from 0.3.
2. **R2, no change to the schema's shape constructs.** `$defs/ShapeRef` accepts any string and `$defs/ShapeInstance` any `params`; the descriptions name examples, not a list. Only the version strings change (R1).
3. **R3, the example adopts it.** `c4-container.dis` is the only example with a person; it declares 0.5 because section 2.9 says a specification using a construct new in a minor version **SHOULD** declare it.
4. **R4, the outline sentence names its exception.** Section 6.7's "every built-in shape defines its outline (for edge anchoring and hit testing)" gains: except where a shape states a separate hit area, as `person` does.
5. **R5, the corner limit is stated for `person` only.** Section 6.7 does not state one for `roundedRect`; adding it there is outside this feature.
6. **R6, conformance unchanged.** The Standard level already means "all built-in shapes".

## Project Structure

```text
specs/031-disl-person-shape/
├── disl-person-shape.spec.md
├── plan.md                          (this file)
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── disl-person-shape.md         the wording the DISL document must carry
├── checklists/requirements.md
└── tasks.md                         (next step, /speckit-tasks; not written yet)
specifications/disl/
├── DISL-specification.md            0.5: header, status, 2.9, 6.7, B.2, Changes from 0.4
├── disl.schema.json                 title and the disl description
└── c4-container.dis                 the worked example
```

**Structure Decision**: a single-repository document change, in the shape of spec 026 (FBL 0.6), a new version with its prose, schema and example: the existing validators are the checks.

## What is not done here

- `definitions/diagrams/c4-*.dis` switching from `c4Person` to `"shape": "person"` and declaring `"disl": "0.5"`: a change of its own after this one is merged. Their companion pages (`c4-*.md`, "written at DISL 0.4") change with them.
- The standalone host's catalogue entry (`shapeCatalog.ts`, task 11 / gap C1 of `c4-disl-fbl`) and any other host.
- A corner limit for `roundedRect`, and a general rule for unknown shape names; neither is asked for.

## Ruled

The version question this plan raised was ruled on 2026-10-19 with the card option "Approve, open 0.5" (research R1). No question is open.
