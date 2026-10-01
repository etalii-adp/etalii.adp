# Implementation Plan: DISL 0.2, the declarative additions

**Branch**: `features/004-disl-0-2` | **Date**: 2026-09-30 | **Spec**: [disl-0-2.spec.md](disl-0-2.spec.md)
**Input**: Feature specification from `specs/004-disl-0-2/disl-0-2.spec.md`.

## Summary

DISL 0.2 adds what the 23 diagram specifications in `definitions/diagrams/` need once they have a model: identity, findings, explanations to the user, gestures, view state, budgets, notation, time, derived elements and a handful of small items (gaps 4 and 6 to 13, and derived elements from gap 3). Reading and writing foreign files is FBL's (feature 005); layouts are a later feature.

The approach is to extend 0.1 constructs wherever one exists (research R1) and add only four new mechanisms: derived node types, per-viewer state, hard budgets and simulated runs. Two shared shapes carry most of the user-facing work: `Message` for any text the tool shows and `Reason` for why something is refused, read-only or unavailable (R7). One location shape, `SourceLocation`, is defined in DISL and used by FBL (R4). DISL and DID move to 0.2 as supersets of 0.1, each keeping one schema file (R2).

The design is in [research.md](research.md) and the four detail files under [research/](research/); the entities are in [data-model.md](data-model.md); the contracts are the [construct map](contracts/constructs.md), the [FBL seam](contracts/fbl-seam.md), the [changes from 0.1](contracts/changes-from-0.1.md) and the [traceability table](contracts/traceability.md) behind SC-001; [quickstart.md](quickstart.md) says how the result is proven.

## Technical Context

**Language/Version**: Markdown (the DISL and DID documents), JSON Schema draft 2020-12, CEL for every expression; the examples validator is Python 3 (`.github/scripts/validate-examples.py`).
**Primary Dependencies**: none new; the validator's `jsonschema` and `referencing` packages.
**Storage**: files in this repository: `specifications/disl/`, `specifications/did/`, `docs/terminology.md`.
**Testing**: the examples validator in the Build workflow (every `*.dis` and `*.did` example, the legacy fixtures and the 23 definitions must validate); the traceability table checked item by item against the gaps summary; a check that no 0.1 example changes validity.
**Target Platform**: the four ADP hosts, which implement the specification; nothing here runs in a host.
**Project Type**: a specification change (document, schema, examples) across two languages.
**Performance Goals**: none for this repository. The document states the cost of derived elements (incremental recomputation permitted) and keeps `cost` hints on expensive rules.
**Constraints**: every 0.1 document stays valid with its meaning (FR-002); a construct FBL uses is defined once, here (SC-006); no construct names a host, IDE or language (SC-005); markdown lines are not wrapped (CLAUDE.md).
**Scale/Scope**: DISL 0.1 is 4,989 lines of prose and 9,411 lines of schema; about 90 gap items across 11 themes; 7 new DISL examples, 1 validator-output example and 1 new DID example; DID changes in five places.

## Constitution Check

*GATE: checked before research and again after design.*

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | Needs found in the definitions come back here as specification changes. The location shape, id strategies and ephemeral ids are defined once, in DISL, and FBL references them ([contracts/fbl-seam.md](contracts/fbl-seam.md)). |
| II. Implementable from the Document Alone | Pass | Every construct gets normative text, a schema entry and an example in the same pull request (FR-001, FR-003, SC-005). |
| III. Precise Normative Language | Pass | RFC 2119 key words in bold capitals; one schema file per specification, `$defs` per structure; every computed value is CEL, including recursion, cycles and plugin calls (R9), rather than a new expression syntax. |
| IV. Versioned Specifications | Pass | DISL and DID state *0.2, Working Draft*; the schemas' `$id` move to `/0.2/`; 0.1 documents stay valid (R2). |
| V. Simplicity | Pass, with four new mechanisms justified | Each construct cites the definitions that need it today (research files). The four new mechanisms are justified in Complexity Tracking. |
| Structure and Naming | Pass | Files stay in `specifications/disl/` and `specifications/did/`; new examples follow `*.dis` and `*.did`. |
| Development Workflow | Pass | One Spec Kit feature on `features/004-disl-0-2`; one pull request into `develop`, merged with a merge commit. |

Re-check after design: unchanged. The spec has no NEEDS CLARIFICATION; the points the research left open are settled in research.md (R4 on files and the primary file, R9 on cycle names, R8 on the FBL line).

## Project Structure

### Documentation (this feature)

```text
specs/004-disl-0-2/
├── disl-0-2.spec.md
├── plan.md                      # this file
├── research.md                  # cross-cutting decisions R1–R16
├── research/                    # per-gap research, item by item
│   ├── identity-and-findings.md
│   ├── reasons-and-gestures.md
│   ├── view-scale-notation-time.md
│   └── derived-and-small.md
├── data-model.md                # the new shapes and their rules
├── quickstart.md                # how the result is proven
├── contracts/
│   ├── constructs.md            # every construct: section, schema $def, example
│   ├── fbl-seam.md              # what FBL references and what it owns
│   ├── changes-from-0.1.md      # the "Changes from 0.1" section's content
│   └── traceability.md          # gap item → construct or owner (SC-001)
├── checklists/requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source (repository root)

```text
specifications/
├── disl/
│   ├── DISL-specification.md    # 0.1 → 0.2: new sections and extended tables
│   ├── disl.schema.json         # $id /0.2/; new and extended $defs
│   ├── statemachine.dis, timeline.dis, erd.dis        # unchanged, still valid
│   └── mindmap.dis, c4-container.dis, rdf-graph.dis, gartner-hype-cycle.dis,
│       functional-decomposition.dis, causal-loop.dis, databricks-job.dis   # new excerpts (R14)
│   └── findings.json            # validator output example (R16)
└── did/
    ├── DID-specification.md     # 0.1 → 0.2: tolerant reading, value forms, subjects
    ├── did.schema.json          # $id /0.2/
    └── <new>.did                # DID 0.2 value forms
docs/terminology.md              # adds "finding"
.github/scripts/validate-examples.py   # reads the 0.1 $id against the 0.2 schema
```

**Structure Decision**: the change stays inside the two specification folders, the terminology and the validator; the definitions are not migrated here (spec, Assumptions).

### Order of work

1. Shared foundations first, because the others use them: versioning and the validator (R2), `Message`, `Reason` and `Confirmation` (R7), `SourceLocation` and findings (R3 to R5), identity (R6).
2. Then the P1 stories' remaining constructs, then P2 (derived elements, gestures, viewer state, budgets), then P3 (notation, time, small items); each story's constructs land with their example so each story can be checked alone.
3. DID 0.2 and terminology alongside the constructs that need them.
4. Last: the "Changes from 0.1" section, the traceability check and a full validator run.

The document's sections can be edited in parallel by story, since each story touches mostly its own sections; the schema is edited per `$def`, and the shared `$defs` of step 1 land first.

## Complexity Tracking

| New mechanism | Why needed | Simpler alternative rejected because |
|---|---|---|
| Derived node types (`derived` on a node type) | 14 definitions draw nodes that are not stored (R8). | Derived attributes and relations (0.1) cannot create a node; a plugin per definition is what the gaps summary set out to remove. |
| Per-viewer state (`persistence.view.viewer`, `view` action) | Fold, filters and toggles must stay off undo and out of the file (about 12 definitions). | 0.1 `transient` view data is still shared and still on undo. |
| Hard budgets (`limits.budgets`) | 9 definitions truncate and withhold edits; the SHACL case needs two measures. | The soft `maxElements` only warns and has one measure. |
| Simulated runs (`simulate` on operations) | Three Databricks definitions replay a run over time without touching undo. | An operation's actions are one transaction; a plugin per host is four implementations. |
