# Implementation Plan: An Insert Writes a Constant

**Branch**: `features/033-fbl-insert-constant-plan` (planning); the implementation's branches are named `features/033-fbl-insert-constant` in each repository it touches | **Date**: 2026-10-22 | **Spec**: [fbl-insert-constant.spec.md](fbl-insert-constant.spec.md)

**Input**: the specification, approved by the maintainer's merge of etalii.adp #420 (2026-10-22), with its three clarifications of 2026-10-22.

## Summary

FBL 0.8 lets an `insert` of the `yaml` and `json` families declare `constant`, a map from a key of the new entry to a scalar, written into every new entry of the rule at its place in `keys`, or after the keys when `keys` does not name it, and never written by any other edit. The change is to the FBL specification's prose and version, the schema, the validator, two fixture pairs and one refused binding in etalii.adp, and to the FBL library of `etalii.adp.ide.standalone`, whose functional decomposition graph conversion waits on it. The other hosts are listed, not changed (research R9).

## Technical Context

- **What changes in etalii.adp**: `specifications/fbl/FBL-specification.md` (0.7 to 0.8: the header, the status paragraph, sections 2.7, 5.2, 6.2, 6.4 and 14.1), `specifications/fbl/fbl.schema.json` (`"0.8"` in the `fbl` enum and its description; `constant` on `$defs/Insert`, exclusive of `emit`, and refused by `$defs/Binding` outside yaml and json), `.github/scripts/validate-examples.py` (the checks of section 14.1 that the schema cannot make, and the folder of refused bindings), and new files under `specifications/fbl/fixtures/` and `specifications/fbl/refused/`.
- **What changes in etalii.adp.ide.standalone**: `src/backend/EtAlii.Adp.Specification.Fbl/` (the insert settings, the binding reader and checker, the values a new entry writes) and `src/backend/EtAlii.Adp.Specification.Fbl.Tests/` (tests seen to fail first, and the vendored fixtures in `Conformance/`). C# 13 on .NET, xUnit v3; the four gates of that repository's `CLAUDE.md`.
- **What checks it**: `python .github/scripts/validate-examples.py` (schema, the names and rules of section 14.1, fixture replay with undo), `python .github/scripts/terminology-check.py --name etalii.adp`, `python .github/scripts/licence-check.py`, all in the Build workflow; in the standalone host, `dotnet test --solution EtAlii.Adp.slnx`, `dotnet format style --verify-no-changes --severity info`, `npm test`, `npm run typecheck`, and `jb inspectcode` (constitution principle VI).
- **What the validator cannot check**: that a host plans the stated splices. It replays them; each host's conformance run checks that it produces them.
- **Unknowns**: none left; every choice is in [research.md](research.md).

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The construct is defined here first; the standalone host implements it as written and invents nothing (its spec's task 9, "as etalii.adp defines it"). |
| II. Implementable from the document alone | Section 6.2 states where a constant goes, how it is written and when a binding is refused; the schema carries `constant`; two fixture pairs and a refused binding are the worked examples, changed in the same pull request. |
| III. Precise normative language | RFC 2119 key words in bold capitals in sections 5.2, 6.2, 6.4 and 14.1; the only expression involved, `when`, stays CEL and is unchanged. |
| IV. Versioned specifications | 0.8, a draft; every valid 0.7 document is a valid 0.8 document with the same meaning, said in the status paragraph and section 2.7. |
| V. Simplicity | One property on `insert`, justified by a current tool, the functional decomposition graph (spec Input); only the two families that need it (Q1); reading untouched (Q2); retype unchanged (Q3). The hosts with no tool that needs it are not changed now (R9). |
| VI. No JetBrains Rider warnings in C# | The standalone tasks change C#; `bash .github/tools/inspect/inspect.sh` there must exit zero, and a run that inspected nothing proves nothing. |

Repositories with principles of their own: `etalii.adp.ide.standalone` plans with spec-workflow and has none here; its `CLAUDE.md` rules (worktree, four gates, a test seen to fail first, vendored data never edited) are followed by the tasks. `etalii.adp.ide.vscode`, `etalii.adp.ide.intellij` and `etalii.adp.ide.notion` are not changed by this feature (R9), so their principles are not engaged; when they are, their principle IV (tests first, vendored fixtures) and Notion's principle I (the copy of `src/fbl/` is refreshed, never edited) apply.

No violation to track. Re-checked after Phase 1: the contracts add no construct beyond the one property and the validator's checks of it.

## Project Structure

### Documentation (this feature)

```text
specs/033-fbl-insert-constant/
├── fbl-insert-constant.spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── insert-constant.schema.md
│   └── fixtures.md
├── checklists/requirements.md
└── tasks.md
```

### Source code

```text
etalii.adp/
├── specifications/fbl/
│   ├── FBL-specification.md                 (0.8)
│   ├── fbl.schema.json                      ($defs/Insert.constant, "0.8")
│   ├── fixtures/
│   │   ├── insert-constant-yaml/            (board.fbl, board.yaml, fixture.json)
│   │   ├── insert-constant-yaml-read/       (board.fbl, board.yaml, fixture.json)
│   │   ├── insert-constant-json/            (board.fbl, board.json, fixture.json)
│   │   └── insert-constant-json-read/       (board.fbl, board.json, fixture.json)
│   └── refused/
│       ├── README.md
│       └── insert-constant-collision.fbl
└── .github/scripts/validate-examples.py

etalii.adp.ide.standalone/src/backend/
├── EtAlii.Adp.Specification.Fbl/
│   ├── Documents/FblModelTypes.cs           (InsertSettings.Constant)
│   ├── Documents/BindingReader.cs           (reads constant)
│   ├── Documents/BindingChecker.cs          (family, emit, collision)
│   └── Rules/FamilyReader.cs                (InsertValues places constants)
└── EtAlii.Adp.Specification.Fbl.Tests/
    ├── Planning/InsertConstant.Tests.cs     (new)
    ├── Loading/Loading.Tests.cs
    └── Conformance/                         (vendored fixtures, readme)
```

**Structure decision**: the construct is FBL's, so etalii.adp carries the document, schema, validator and fixtures; one host library implements it, the one whose tool needs it. The fixtures are self-contained folders with their own binding, as `insert-empty-yaml/` and `insert-empty-json/` are.

## Delivery

- etalii.adp: one pull request from `features/033-fbl-insert-constant` into `develop` with the specification, schema, validator and fixtures; the tasks of `etalii.adp/` are ticked in it.
- etalii.adp.ide.standalone: one pull request from its own `features/033-fbl-insert-constant`, after the etalii.adp one is merged (it vendors the merged fixtures), whose description links `specs/033-fbl-insert-constant/` here and names the etalii.adp commit the tasks were taken from. Its tasks are ticked here only once it is merged.
- The functional decomposition graph conversion's task 9 (L6) in `etalii.adp.ide.standalone` then takes the constant as given: a small amendment there, applied by that specification's owner (T020).

## Complexity Tracking

None.
