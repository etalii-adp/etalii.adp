# Implementation Plan: Format Binding

**Branch**: `features/005-format-binding` | **Date**: 2026-09-30 | **Spec**: [format-binding.spec.md](format-binding.spec.md)
**Input**: Feature specification from `specs/005-format-binding/format-binding.spec.md`.

## Summary

Add FBL, the Format Binding Language, as a new specification beside DISL: a JSON document in which a tool engineer declares how a foreign text format maps to a language's model in both directions. Every binding has claims (routing), a body (a file of one of five families, or a folder), a reader (declared rules, or a persistence plugin under a written contract) and rules that bind each writable attribute to exactly one place in the file. The host writes every change as named splices from a fixed catalogue of eleven, formats new text by fixed inference rules, keeps undo as inverse splices with whole-document drift refusal, reads tolerantly, stores view data in the `.adp` registration, and shares one open body between all readings of it (research R3 to R13). DISL gains only `persistence.format: "fbl"` and `persistence.binding` (contracts/disl-hook.md). Proof is by examples drawn from today's definitions and by round-trip fixtures whose consistency CI checks (R14).

## Technical Context

**Language/Version**: Markdown (normative prose, RFC 2119 key words), JSON Schema draft 2020-12, CEL for conditions and computed values, RE2-common regular expressions (R6); the example validator in Python 3.13 (CI).
**Primary Dependencies**: `jsonschema` (already used by CI); DISL 0.2's findings, source locations, id strategies, unstable ids and derived nodes (feature 004), referenced by name.
**Storage**: files: `specifications/fbl/` (document, schema, examples, registrations, fixtures).
**Testing**: `validate-examples.py` validates `*.fbl`, parsed `*.adp` and fixtures, and checks fixture consistency (contracts/validator.md).
**Target Platform**: the four ADP hosts, which implement FBL in later features.
**Project Type**: a specification in a specification repository.
**Performance Goals**: none normative; folder subjects state a settle delay (default 400 ms).
**Constraints**: byte-identical no-edit saves; identical output across hosts; no construct owned by DISL 0.2 defined here; one DISL change only.
**Scale/Scope**: 25 definitions surveyed ([inventory.md](inventory.md)); five format families; eleven splice operations; about eight examples and a dozen fixtures.

## Constitution Check

*GATE: checked before research and again after design.*

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | FBL becomes the single source for foreign-file persistence, replacing 24 implicit plugin contracts and the `x-adp` routing keys (inventory.md). |
| II. Implementable from the Document Alone | Pass | Document, `fbl.schema.json` and examples in one pull request. The registration's line form has no JSON schema of its own; `$defs/Registration` describes its parsed form and CI parses the `.adp` examples into it (R12). |
| III. Precise Normative Language | Pass | RFC 2119 key words; JSON Schema 2020-12 with `$defs` per top-level structure; CEL for every condition and computed value (R5). Regular expressions are not an expression language in the constitution's sense; they are the match syntax CEL itself uses (R6). |
| IV. Versioned Specifications | Pass | FBL 0.1, Working Draft. The DISL hook is additive. |
| V. Simplicity | Pass | Every construct traces to a definition that needs it (inventory.md). Rejected: a general grammar formalism, paired read/write expressions, a reference engine (R4, R5, R14). |
| Structure and Naming | **Amendment** | The section lists six tool languages. FBL follows every naming rule (`specifications/fbl/`, `FBL-specification.md`, `fbl.schema.json`, `$id`, version key `fbl`, extension `.fbl`), but the section does not yet say a cross-cutting language may sit beside the six. Amended through `/speckit-constitution` in this feature, MINOR (R1). |
| Development Workflow | Pass | One Spec Kit feature, `features/005-format-binding`, merged into `develop` by pull request with a merge commit. The Build workflow validates the new examples. |

Re-check after design: unchanged; the only amendment is the Structure and Naming sentence.

## Project Structure

### Documentation (this feature)

```text
specs/005-format-binding/
├── format-binding.spec.md
├── plan.md               # this file
├── research.md           # decisions R1–R15
├── inventory.md          # the 25 definitions and what they become
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── disl-hook.md      # the one DISL change
│   ├── plugin-contract.md
│   └── validator.md      # what CI checks
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source (this repository)

```text
specifications/fbl/
├── FBL-specification.md
├── fbl.schema.json
├── timeline.fbl                 # yaml, ADP-owned
├── databricks-job.fbl           # yaml, shared extension, resource selector
├── databricks-pipeline.fbl      # json and yaml
├── mindmap.fbl                  # xml
├── causal-loop-diagram.fbl      # lines
├── structurizr.fbl              # blocks, shared by six readings
├── w3c-turtle.fbl               # plugin reader, shared by four readings, markers
├── helm-chart.fbl               # folder, plugin reader
├── registrations/*.adp          # registration examples
└── fixtures/<name>/             # fixture.json, input and expected files
specifications/disl/DISL-specification.md, disl.schema.json   # the hook only
.github/scripts/validate-examples.py                          # *.fbl, *.adp, fixtures
.gitattributes                                                # fixtures byte-exact
.specify/memory/constitution.md, CLAUDE.md, README.md, docs/terminology.md
```

**Structure Decision**: one new folder under `specifications/`, following the DISL model; no host code.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Registration defined as a line format, schema on its parsed form | Existing users' `.adp` files must keep working (FR-046, SC-005) | A JSON registration would break every registration hosts have written |
