# Implementation Plan: The Agent Activity Diagram's Definition

**Branch**: `claude/project-thread-cqez7b` | **Date**: 2026-10-09 | **Spec**: [agent-activity-diagram.spec.md](agent-activity-diagram.spec.md)

## Summary

Deliver the definition the standalone Agent activity diagram specification asks of this repository, in the order of its tasks 1 to 4: try the activity file's shape against FBL and DISL first, with each answer that is no put to the maintainer ([research.md](research.md)); then DISL 0.4 with the seven constructs its design decided (L1 to L7, and L9's item order); then the binding `aad` and its fixtures; then `agent-activity-diagram.dis`, `agent-activity-diagram.md`, the file's JSON Schema and the Notion page. The four tasks go in one pull request, since all of them wait on the maintainer's answer on where the user's part of the file lives (research R3); it is merged only after that answer, with the files amended to it.

The approved design is followed with its language decisions at their defaults. Where reading FBL showed that a part of the file's shape could not be written the same way by every host, the shape changes and the language does not (R5), as spec 013 did; for the user's part (R3) the maintainer ruled that the language changes instead, and FBL goes to 0.4.

## Technical Context

- **Languages**: JSON (FBL, DISL, JSON Schema draft 2020-12), CEL for expressions, Markdown for prose; the activity file in YAML 1.2.
- **Checks**: `python .github/scripts/validate-examples.py`, which this feature extends with the names DISL 0.4's constructs refer to (DISL section 14.1, step 9) and the activity file's own schema; the terminology and licence checks of the Build workflow.
- **Consumers**: the standalone host first (its tasks 5 to 29, which wait on these files being merged), then the other hosts.

## Constitution Check

| Principle | How this plan meets it |
|---|---|
| I. One source of truth | The activity file and the diagram type are defined once, here; the standalone documents defer to these files (their Requirement 1.6). |
| II. Implementable from the document alone | DISL 0.4 comes with its schema and the worked example `work-board.dis` with its binding; the activity file with `agent-activity-diagram.md`, `agent-activity-diagram.schema.json`, the binding and its fixtures. |
| III. Precise normative language | DISL 0.4 uses the RFC 2119 key words; expressions are CEL; schemas are draft 2020-12. |
| IV. Versioned specifications | DISL goes to 0.4 (draft); every 0.3 specification stays valid with its meaning, and the three places 0.4 says more are listed under *Changes from 0.3*. |
| V. Simplicity | Each DISL construct is one the design decided and this diagram uses, named for what it does; FBL 0.4 adds only what keeping `view:` needs, by the ruling on R3. |
| VI. No Rider warnings | No C# in this repository's change. |

## Complexity Tracking

FBL 0.4 (R3) is the one added construct beyond DISL 0.4: creating and removing missing nested levels, which the maintainer chose over flattening the user's part. R5's departure removes a construct rather than adding one.
