# Implementation Plan: The Knowledge Designer's Definition

**Branch**: `claude/project-thread-rmr2na` | **Date**: 2026-10-09 | **Spec**: [knowledge-designer.spec.md](knowledge-designer.spec.md)

## Summary

Deliver the definition the standalone Knowledge designer specification asks of this repository, in the order of its tasks 1 to 5: the YAML binding first, with the two open points settled ([research.md](research.md) R1, R2); FBL 0.3's wording and DESL 0.1; the JSON and XML bindings and the fixtures for every edit; then `knowledge.des`, `knowledge.md`, the file's JSON Schema, the examples and the terminology. Task 2, a measurement in the standalone host, runs there against the draft binding as soon as it is pushed.

The approved design is followed with its language decisions L1 to L5 at their defaults. Where reading FBL showed that a part of the file's shape could not be written the same way by every host, the file's shape changed and the language did not (R3).

## Technical Context

- **Languages**: JSON (FBL, DESL, JSON Schema draft 2020-12), CEL for expressions, Markdown for prose; the knowledge file in YAML 1.2, JSON (RFC 8259) and XML 1.0.
- **Checks**: `python .github/scripts/validate-examples.py`, which this feature extends with FBL's name resolution (section 14.1 step 4), DESL documents and the knowledge examples; the terminology and licence checks of the Build workflow.
- **Consumers**: the standalone host first (its tasks 6 to 33), then the other hosts.

## Constitution Check

| Principle | How this plan meets it |
|---|---|
| I. One source of truth | The knowledge file is defined once, here; the standalone documents defer to these files (their Requirement 1.7). |
| II. Implementable from the document alone | DESL 0.1 comes with `desl.schema.json` and an example; the knowledge file with `knowledge.md`, `knowledge.schema.json` and an example per format; every binding with fixtures. Each change updates its document, schema and examples in the same pull request. |
| III. Precise normative language | DESL uses the RFC 2119 key words; expressions are CEL; schemas are draft 2020-12. |
| IV. Versioned specifications | FBL goes to 0.3 (draft) and DESL starts at 0.1 (draft); every 0.2 FBL document stays valid with its meaning. |
| V. Simplicity | DESL holds what `knowledge.des` needs and nothing more, defined in its own sections and schema rather than taken from DISL (R7, which replaces L4); FBL gains no behaviour (L1 to L5). |
| VI. No Rider warnings | No C# in this repository's change. |

## Complexity Tracking

None. The departure from the design's file shape (R3) removes a construct rather than adding one.
