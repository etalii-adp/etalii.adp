# Implementation Plan: The Value Stream Map

**Branch**: `claude/project-thread-cj29ch` (a cloud session's branch, in place of `features/084-value-stream-map`) | **Date**: 2026-11-23 | **Spec**: [value-stream-map.spec.md](value-stream-map.spec.md)

**Input**: the specification, approved by the maintainer on 2026-11-23 ("Approve all three" on the decision card for specs 084 to 086).

## Summary

A value stream map is a YAML file, `.vsm`, holding a stream's vocabularies, its current state and an optional future state, each a trigger, steps with times and performers, an outcome and flows (research R1, R2). This feature defines the diagram type `generic/value-stream-map` in `definitions/diagrams/`: a DISL specification whose functions compute lead time, process time, flow efficiency and hand-offs by expected visits (R4), a declared `yaml` binding, an ATD tool description, a companion document and two worked examples with their totals worked by hand. No language changes: DISL 0.9 and FBL 0.21 state everything the diagram needs. No host builds it here.

## Technical Context

- **What changes**: `definitions/diagrams/` only: `value-stream-map.dis`, `.fbl`, `.schema.json`, `.md`, `.atd` with its parts and `.trace.json`, `examples/`, fixtures under `specifications/fbl/fixtures/value-stream-map-*/`, and the README's table. Outside this repository, the tool catalogue row in `etalii.adp.ide.standalone/docs/tools.md` and the Notion "Tools" page (FR-012).
- **What checks it**: `python .github/scripts/validate-examples.py` (the specification against DISL's schema, the binding and its fixtures replayed, the examples against the file schema), the Build's `descriptions` job (`atd check` and the abstract trees), `terminology-check.py` and `licence-check.py`.
- **What the checks cannot see**: that a host draws what the notation states, and the totals a host evaluates. SC-002 is checked by hand against the companion document's worked figures in this feature, and again by the first host's conformance cases; SC-003 and SC-004 need a host and are carried to its specification.
- **Planted defects** (SC-001): each task that adds a check names the defect to plant by hand and the failure to see, as specs 028 and 033 did.
- **Hosts**: none change. The first host is chosen after this definition merges (the specification's assumption).

## Constitution Check

Checked against `.specify/memory/constitution.md` as it stands on `develop` at `91f6c0f`, before research and again after the design.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The diagram, its file and its computations are stated here before any host builds them; the totals are DISL functions, not host code (R4). |
| II. Implementable from the document alone | PASS. The definition comes with its file schema, fixtures, examples and a companion document with worked totals. |
| III. Precise normative language | PASS. Expressions are CEL; no new syntax. |
| IV. Versioned specifications | PASS. No language moves a version. |
| V. Simplicity | PASS. One file, one binding, no plugin; hand-offs are derived rather than stored (R5); the future state is a declared operation (R3). |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |

After the design: PASS on every row. FR-001 was amended on 2026-11-23 so that a hand-off is a derived flow (R5).

## Project Structure

```text
specs/084-value-stream-map/
├── value-stream-map.spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/value-stream-document.md
├── checklists/requirements.md
└── tasks.md

definitions/diagrams/
├── README.md                              (a row)
├── value-stream-map.dis
├── value-stream-map.fbl
├── value-stream-map.schema.json
├── value-stream-map.md                    (the companion, with the worked totals)
├── value-stream-map.atd                   (and its parts: .notation.atd, .vsm.atd)
├── value-stream-map.trace.json
└── examples/
    ├── restore-service.vsm
    └── request-fulfilment.vsm

specifications/fbl/fixtures/
├── value-stream-map-read/
└── value-stream-map-edits/

etalii.adp.ide.standalone/docs/tools.md    (the catalogue row, a pull request there)
```

**Structure Decision**: the definition follows the files every diagram type in `definitions/diagrams/` has, under one base name, as the Agent activity diagram's did (spec 014).

## Delivery

Each pull request is cut from `develop` after the one before it merges, with auto-merge on.

1. **This feature's documents**: plan, research, data model, contract, quickstart and tasks.
2. **The definition**: specification, binding, schema, fixtures, examples, companion, tool description and trace, and the README row.
3. **The catalogue**: the row in `etalii.adp.ide.standalone/docs/tools.md` (*Specified*, Diagram, *Value stream map*, `generic/value-stream-map`) and the Notion "Tools" page, once pull request 2 merges.

## What is not done here

- Building the diagram in a host, its conformance cases, and SC-003 and SC-004.
- Calendars and working hours (the specification's edge cases).
- Collecting times from a ticketing system (*What this feature is not*).
