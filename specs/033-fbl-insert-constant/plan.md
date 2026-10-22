# Implementation Plan: An Insert Writes a Constant

**Branch**: `features/033-fbl-insert-constant-plan` (planning); the implementation's branches are named `features/033-fbl-insert-constant` in each repository it touches | **Date**: 2026-10-22 | **Spec**: [fbl-insert-constant.spec.md](fbl-insert-constant.spec.md)

**Input**: the specification, approved by the maintainer's merge of etalii.adp #420 (2026-10-22), with its three clarifications of 2026-10-22.

## Summary

FBL 0.8 lets an `insert` of the `yaml` and `json` families declare `constant`, a map from a key of the new entry to a scalar, written into every new entry of the rule at its place in `keys`, or after the keys when `keys` does not name it, and never written by any other edit. The change is to the FBL specification's prose and version, the schema, the validator, two fixture pairs and one refused binding in etalii.adp, and to the FBL library of every host, by the maintainer's ruling "Approve, all hosts" (2026-10-22): `etalii.adp.ide.standalone`, whose functional decomposition graph conversion waits on it, `etalii.adp.ide.vscode` and `etalii.adp.ide.intellij`, and `etalii.adp.ide.notion` through its refreshed copy of Visual Studio Code's library. Each host implements the 0.8 constant only, which depends on no construct of 0.2 to 0.7 (research R9).

## Technical Context

- **What changes in etalii.adp**: `specifications/fbl/FBL-specification.md` (0.7 to 0.8: the header, the status paragraph, sections 2.7, 5.2, 6.2, 6.4 and 14.1), `specifications/fbl/fbl.schema.json` (`"0.8"` in the `fbl` enum and its description; `constant` on `$defs/Insert`, exclusive of `emit`, and refused by `$defs/Binding` outside yaml and json), `.github/scripts/validate-examples.py` (the checks of section 14.1 that the schema cannot make, and the folder of refused bindings), and new files under `specifications/fbl/fixtures/` and `specifications/fbl/refused/`.
- **What changes in etalii.adp.ide.standalone**: `src/backend/EtAlii.Adp.Specification.Fbl/` (the insert settings, the binding reader and checker, the values a new entry writes) and `src/backend/EtAlii.Adp.Specification.Fbl.Tests/` (tests seen to fail first, and the vendored fixtures in `Conformance/`). C# 13 on .NET, xUnit v3; the four gates of that repository's `CLAUDE.md`.
- **What changes in etalii.adp.ide.vscode**: `src/core/fbl/` (insert settings, loader and its checks, the yaml and json families), `test/core/fbl/`, and `fixtures/fbl/conformance/` with `fixtures/fbl/manifest.json`. TypeScript; `npm run check`, `npm run test:unit`, and `npm run test:vscode` where a real Visual Studio Code can run.
- **What changes in etalii.adp.ide.intellij**: `fbl/src/main/java/etalii/adp/fbl/` (document and family classes), `fbl/src/test/java/etalii/adp/fbl/`, and a new `fbl/testdata/conformance-0.8/`. Java with Gradle; `./gradlew build`.
- **What changes in etalii.adp.ide.notion**: `src/fbl/` and its `PROVENANCE.md`, written by `node scripts/sync-fbl.mjs` only; `npm test`, `npm run lint`, `npm run typecheck`, the copy check and the build.
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
| V. Simplicity | One property on `insert`, justified by a current tool, the functional decomposition graph (spec Input); only the two families that need it (Q1); reading untouched (Q2); retype unchanged (Q3). The other hosts take the constant alone, not the 0.7 constructs they lack (R9). |
| VI. No JetBrains Rider warnings in C# | The standalone tasks change C#; `bash .github/tools/inspect/inspect.sh` there must exit zero, and a run that inspected nothing proves nothing. |

Repositories with principles of their own:

| Repository | Principle | How the tasks meet it |
|---|---|---|
| `etalii.adp.ide.vscode` | IV. Test-first, against real files; vendored fixtures with their source | T025 vendors the fixtures unchanged under a new manifest source; T026's tests fail first. I to III are untouched: no editor, frame or tool changes. |
| `etalii.adp.ide.intellij` | IV. Test-first, against real files; II. the text file is the source of truth | T029 vendors the fixtures unchanged with their SHA-256; T030's tests fail first; the splices are the fixtures'. Headless-IDE tests are run where the container can, and named as left to CI where it cannot. |
| `etalii.adp.ide.notion` | I. One source of truth: the copy of `src/fbl/` is taken by a script and never edited | T033 runs `sync-fbl.mjs` against Visual Studio Code's merge commit and its `--check`. III. Truthful: no add-on claims a tool it does not have; none changes. |

`etalii.adp.ide.standalone` plans with spec-workflow and has no principles file here; its `CLAUDE.md` rules (worktree, four gates, a test seen to fail first, vendored data never edited, `inspect.sh`) are followed by T020 to T023.

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

etalii.adp.ide.vscode/
├── src/core/fbl/documents/{types,documentLoader}.ts
├── src/core/fbl/families/{yaml/yamlFamily,json/jsonFamily}.ts
├── test/core/fbl/{planning,loading}.test.ts
└── fixtures/fbl/{conformance/,manifest.json}

etalii.adp.ide.intellij/fbl/
├── src/main/java/etalii/adp/fbl/document/{InsertSettings,BindingReader,BindingChecker}.java
├── src/main/java/etalii/adp/fbl/family/{yaml/YamlFamily,json/JsonFamily}.java
├── src/test/java/etalii/adp/fbl/{document/LoadingTest,plan/InsertConstantTest,conformance/*}.java
└── testdata/conformance-0.8/                (new, README.md, SHA256SUMS)

etalii.adp.ide.notion/src/fbl/                   (refreshed by scripts/sync-fbl.mjs)
```

**Structure decision**: the construct is FBL's, so etalii.adp carries the document, schema, validator and fixtures; every host library implements it from the same vendored fixtures. The fixtures are self-contained folders with their own binding, as `insert-empty-yaml/` and `insert-empty-json/` are.

## Delivery

- etalii.adp: one pull request from `features/033-fbl-insert-constant` into `develop` with the specification, schema, validator and fixtures; T001 to T019 are ticked in it.
- Then one pull request per host, each from its own `features/033-fbl-insert-constant`, after the etalii.adp one is merged (they vendor the merged fixtures): standalone, Visual Studio Code and IntelliJ in parallel, Notion after Visual Studio Code's is merged. Each description links `specs/033-fbl-insert-constant/` here and names the etalii.adp commit its tasks were taken from; its tasks are ticked here only once it is merged.
- The functional decomposition graph conversion's task 9 (L6) in `etalii.adp.ide.standalone` then takes the constant as given: a small amendment there, applied by that specification's owner (T024).

## Complexity Tracking

None.
