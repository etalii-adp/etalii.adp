# Implementation Plan: FBL Reads a Scalar as Written

**Branch**: `features/015-fbl-scalar-as-written` | **Date**: 2026-10-10 | **Spec**: [fbl-scalar-as-written.spec.md](fbl-scalar-as-written.spec.md)

## Summary

FBL 0.5 defines a scalar's **written text**, makes it what a text attribute, an id and a reference read, lets a binding ask for it or for the typed value with `read`, presents it to CEL, and lets a binding keep an entry readable when one value does not convert. The change is to the FBL specification, its schema, the timeline example binding and one new conformance fixture. No host changes here.

## Technical Context

- **What changes**: `specifications/fbl/FBL-specification.md` (0.4 to 0.5), `specifications/fbl/fbl.schema.json`, `specifications/fbl/timeline.fbl`, and the new `specifications/fbl/fixtures/timeline-written-text/`.
- **What checks it**: `python .github/scripts/validate-examples.py` (schema validation of every `*.fbl`, replay of every fixture's splices and their inverses), `python .github/scripts/terminology-check.py --name etalii.adp`, `python .github/scripts/licence-check.py`. All three run in the Build workflow.
- **What the validator cannot check**: a fixture's `read` is a statement for hosts to meet. The validator replays splices; it does not read a body through a binding. The `attributes` a fixture now lists are checked by each host's conformance run, first by `EtAlii.Adp.Specification.Fbl.Tests` in `etalii.adp.ide.standalone` when it vendors this revision.
- **Hosts**: no host is changed by this feature. `etalii.adp.ide.standalone` implements 0.5 through its own specifications, which wait on it (see the spec's *Input*).

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The need came from seven host specifications and comes back here as a change to FBL before any host reads YAML its own way through a binding. |
| II. Implementable from the document alone | The prose (sections 2.4, 4.1.5, 5.2, 5.3, 6.3, 7.4, 15.3), the schema (`read`, `quoted`, `fallback`, a fixture's `attributes`, version `0.5`) and a worked example with a fixture change in one pull request. |
| III. Precise normative language | The reading rule is one table in section 5.2 and normative sentences with RFC 2119 key words; conditions stay CEL, with two new variables. |
| IV. Versioned specifications | 0.5, a draft. Every valid 0.4 document stays valid. The two meanings 0.4 left open are named in section 5.2. |
| V. Simplicity | Three options on an attribute binding and two CEL variables, each tied to a tool that needs it (research.md). No new mechanism for findings: one FBL code, switchable per attribute. |

No violation to track.

## Decisions

Each is argued in [research.md](research.md).

1. **A text attribute reads the written text without being asked** (the spec's FR-002 left this to the plan). `read` overrides in both directions.
2. **An id and a reference are always written text.**
3. **CEL gets `text` and `style` beside `entry`**, the same shape as `entry`. `entry` keeps its 0.4 meaning.
4. **`fallback` is `{value, report}`**; the finding is `fbl.unconverted-value`, and a tool that words its own finding binds a second, read-only text attribute to the same key, as bindings already do for a stored id.
5. **`quoted: "convert"`** is opt-in per attribute.
6. **Writing keeps section 6.3's plain-safe rule** for a text attribute, so a file another tool reads keeps its meaning there; `style: "plain"` relaxes it for a format whose every reader takes the written text.
7. **A fixture's `read` may list `attributes`**, so that what was read can be stated at all.
8. **No change to DISL or DESL** (the spec's FR-011): the attribute types FBL reads by are theirs already, and the written text of a fallback reaches a rule as an ordinary attribute.
9. **User Story 3 stays in this feature.** It is three sentences and one option, and four tools need it.

## Project Structure

```text
specs/015-fbl-scalar-as-written/
├── fbl-scalar-as-written.spec.md
├── plan.md
├── research.md
└── tasks.md
specifications/fbl/
├── FBL-specification.md          (0.5)
├── fbl.schema.json
├── timeline.fbl
└── fixtures/timeline-written-text/
    ├── fixture.json
    └── written.tml
```

## What is not done here

- The hosts. Each implements 0.5 under its own specification.
- The example bindings other than the timeline's. None of them changes its meaning: their fixtures list ids and types only, and no id in them is a text the core schema types otherwise.
- The two neighbouring gaps the spec's *Assumptions* names.
