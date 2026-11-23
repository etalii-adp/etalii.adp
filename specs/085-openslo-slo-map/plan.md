# Implementation Plan: The SLO Map over OpenSLO

**Branch**: `claude/project-thread-cj29ch` (a cloud session's branch, in place of `features/085-openslo-slo-map`) | **Date**: 2026-11-23 | **Spec**: [openslo-slo-map.spec.md](openslo-slo-map.spec.md)

**Input**: the specification, approved by the maintainer on 2026-11-23 ("Approve all three" on the decision card for specs 084 to 086).

## Summary

The SLO map reads OpenSLO `openslo/v1` files where they are and draws each object as an element, references as relations and inline objects as contained elements (research R3), with each objective's target, window and error budget stated in its budgeting method's own terms (R6). FBL binds only the first document of a YAML stream today, and OpenSLO files usually hold several, so FBL 0.22 adds `body.stream: "documents"` (R1, [contracts/fbl-yaml-stream.md](contracts/fbl-yaml-stream.md)), delivered first and on its own. Then the definition: a DISL specification with the budget functions (R5, R6) and findings, a shared `yaml` binding with the OpenSLO marker (R2), a folder reading for references across files (R4), an ATD description, a companion document, and fixtures vendored from OpenSLO's own repository under its Apache License 2.0 (R9).

## Technical Context

- **What changes**: `specifications/fbl/` (FBL 0.22: document, schema, fixtures `yaml-stream-*`), `.github/scripts/validate-examples.py` if its fixture replay needs the stream reading, and `definitions/diagrams/` (`openslo-slo.dis`, `.fbl`, `.md`, `.atd` with parts and trace), with fixtures under `specifications/fbl/fixtures/openslo-slo-*/`. Outside: the catalogue row in `etalii.adp.ide.standalone/docs/tools.md` and the Notion "Tools" page (FR-010).
- **What checks it**: `validate-examples.py` (schemas, fixture replay), the Build's `descriptions` job, `terminology-check.py`, `licence-check.py` (which must keep accepting a vendored `LICENSE.md` under `specifications/fbl/fixtures/`, as the standalone corpora do; checked in T004).
- **What the checks cannot see**: drawing, and the budgets a host evaluates. SC-003 is checked by hand against the companion's table here; SC-004 and SC-005 need a host and an agent and are carried to the first host's specification, with OpenSLO's validator for SC-005 (R10).
- **Hosts**: none change. A host that adopts FBL 0.22 implements the stream reading once, for every binding.

## Constitution Check

Checked against `.specify/memory/constitution.md` as it stands on `develop` at `91f6c0f`, before research and again after the design.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The stream reading is stated in FBL rather than in host code (R1); OpenSLO stays the format, not extended (FR-008). |
| II. Implementable from the document alone | PASS. FBL 0.22 comes with its schema and fixtures in one pull request; the definition with its companion and fixtures. |
| III. Precise normative language | PASS. RFC 2119 key words in FBL 4.3's new text; CEL for the budgets. |
| IV. Versioned specifications | PASS. FBL 0.22 is a superset of 0.21: a binding without `stream` reads as before. |
| V. Simplicity | PASS. `stream` is justified by a current tool's need (FR-002 over the files OpenSLO publishes), and is the smallest construct that states it; a plugin reader is not simpler (R1). |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |

After the design: PASS on every row.

## Project Structure

```text
specs/085-openslo-slo-map/
├── openslo-slo-map.spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/fbl-yaml-stream.md
└── checklists/requirements.md

specifications/fbl/
├── FBL-specification.md            (0.22: body.stream)
├── fbl.schema.json
└── fixtures/
    ├── yaml-stream-read/           (new)
    ├── yaml-stream-edits/          (new)
    ├── openslo-slo-read/           (new: OpenSLO's examples, LICENSE.md, README.md)
    ├── openslo-slo-edits/          (new)
    └── openslo-slo-folder/         (new: a folder of three files with references across them)

definitions/diagrams/
├── README.md                       (a row)
├── openslo-slo.dis
├── openslo-slo.fbl
├── openslo-slo.md                  (the companion, with the budget table)
├── openslo-slo.atd                 (and its parts: .notation.atd, .openslo.atd)
└── openslo-slo.trace.json

etalii.adp.ide.standalone/docs/tools.md   (the catalogue row)
```

**Structure Decision**: the definition's base name is `openslo-slo`, after its origin; the language change follows FBL's earlier versions: document, schema and fixtures together.

## Delivery

1. **This feature's documents.**
2. **FBL 0.22**, the documents of a YAML stream, with its fixtures.
3. **The definition**, its fixtures and the README row.
4. **The catalogue**: the standalone row and the Notion page.

## What is not done here

- Live budget consumption and metric queries (*What this feature is not*).
- OpenSLO `v2alpha` (R7).
- Building the diagram in a host, conformance cases, SC-004 and SC-005.
