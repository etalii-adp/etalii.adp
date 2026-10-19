# Implementation Plan: A Built-in Person Shape in DISL

**Branch**: `features/031-disl-person-shape` | **Date**: 2026-10-19 | **Spec**: [disl-person-shape.spec.md](disl-person-shape.spec.md)

**Input**: The feature specification, approved by the maintainer on 2026-10-19 (card "Approve") and merged into `develop` as `2298b71`, with both clarifications of the session of 2026-10-19 ("Corner only", "Body, head clicks").

## Summary

DISL gains the built-in shape `person`, written into the **0.4 draft in place**, as the 0.3 draft was amended after it was written (`3c5b1c4`, `467b458`). The body is a rounded rectangle over the bounds with one parameter, `radius` (default 8, limited to half the smaller side). The head is a fixed circle of radius 10 whose centre is 8 above the top edge, painted under the body. Relations anchor on the body alone; hit testing covers body and head; the label's text area is the body minus padding; the bounds stay the body and a measure of what is drawn includes the head. The change is prose in `specifications/disl/DISL-specification.md` (sections 6.7 and B.2, the list of DISL 0.4's additions) and one worked example, `specifications/disl/c4-container.dis`, which drops its `c4Person` custom shape for `"shape": "person"` and declares `"disl": "0.4"`. `disl.schema.json` needs no change, because it enumerates no shape names. No host and no definition under `definitions/` changes here.

## Technical Context

- **What changes**: `specifications/disl/DISL-specification.md`: the shape table and the outline paragraph of 6.7, a new `person` paragraph after it, the B.2 row, and a row in the first table of *Changes from 0.3*. `specifications/disl/c4-container.dis`: `"disl": "0.2"` becomes `"0.4"`, the `c4Person` custom shape is removed, and `Person` takes `"shape": "person"`.
- **What does not change**: `specifications/disl/disl.schema.json` (research R2); the DISL version number, header date and schema address (R1); section 15's conformance levels (R6); `definitions/diagrams/c4-*.dis` and every host (follow-ups named in the spec's Scope).
- **What checks it**: `python .github/scripts/validate-examples.py` (the changed example against the schema), `python .github/scripts/licence-check.py` (the DISL document's Licence row is untouched), `python .github/scripts/terminology-check.py --name etalii.adp`. All three run in the Build workflow.
- **What the validator cannot check**: that the prose says what the spec requires. The [quickstart](quickstart.md) gives a reading check against [contracts/disl-person-shape.md](contracts/disl-person-shape.md), and the tasks trace every FR to the sentence that satisfies it.
- **Storage, performance, platforms**: not applicable; this is a document change.

## Constitution Check

*Gate before Phase 0, re-checked after Phase 1: passes both times.*

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | Two definitions of the same figure already differ in this repository (head centre 8 above in `definitions/`, 18 above in the example) and the standalone host draws a third copy. The figure is defined here once, before the C4 definitions and the hosts adopt it. |
| II. Implementable from the document alone | Section 6.7 states geometry, outline, hit area, text area and extent in DISL's own terms, with numbers; B.2 gives the default. The schema already accepts the shape (R2), and the worked example uses it and validates. |
| III. Precise normative language | The new paragraph uses **MUST** for every obligation; no CEL is needed, since the geometry has no computed values beyond the one Bindable parameter. |
| IV. Versioned specifications | An addition to the 0.4 draft, marked *(DISL 0.4)* and listed with 0.4's additions. Every valid 0.4 specification stays valid with the same meaning; only one that named `person` without declaring it, which was an unknown shape, now draws (R1). |
| V. Simplicity | One parameter, as ruled; the head is fixed. No new schema construct, no new conformance level. |
| VI. No JetBrains Rider warnings in C# | No C# in this feature. |

No repository principles file applies: the code of this feature lands only in `etalii.adp`. No violation to track.

## Decisions

The reasoning and the alternatives are in [research.md](research.md).

1. **R1, 0.4 amended in place**, not a 0.5. See the open question below.
2. **R2, no schema change.** `$defs/ShapeRef` accepts any string and `$defs/ShapeInstance` any `params`; the descriptions name examples, not a list.
3. **R3, the example adopts it.** `c4-container.dis` is the only example with a person; it declares 0.4 because section 2.9 says a specification using a construct new in a minor version **SHOULD** declare it.
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
├── DISL-specification.md            6.7, B.2, Changes from 0.3
└── c4-container.dis                 the worked example
```

**Structure Decision**: a single-repository document change, in the shape of spec 026 (FBL 0.6): prose, the example beside it, and the existing validators as the checks.

## What is not done here

- `definitions/diagrams/c4-*.dis` switching from `c4Person` to `"shape": "person"`: a change of its own after this one is merged.
- The standalone host's catalogue entry (`shapeCatalog.ts`, task 11 / gap C1 of `c4-disl-fbl`) and any other host.
- A corner limit for `roundedRect`, and a general rule for unknown shape names; neither is asked for.

## Open question for the maintainer

**Which DISL version carries `person`?** The plan is written against option A.

| Option | Answer | Implications |
|--------|--------|--------------|
| A (recommended) | Amend the 0.4 draft in place, marked *(DISL 0.4)*, with a row in *Changes from 0.3* | Follows the precedent of the 0.3 draft's amendments (`3c5b1c4`, `467b458`); no version, header, schema address or `disl` value changes; the C4 definitions already declare 0.4. A host that implemented 0.4 before the amendment lacks one shape, as hosts did after the 0.3 amendments |
| B | Open DISL 0.5 for it | A new version, status paragraph, *Changes from 0.4* section, 2.9 and the schema's `disl` description updated; the C4 definitions would have to declare 0.5 when they adopt it. More text for one shape |
| Other | Another arrangement | |
