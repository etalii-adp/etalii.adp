# Implementation Plan: A Relation Type Inherits Its Flags

**Branch**: `features/034-disl-relation-flag-inheritance-plan` (planning); the implementation's branches are named `features/034-disl-relation-flag-inheritance` in each repository it touches | **Date**: 2026-10-22 | **Spec**: [disl-relation-flag-inheritance.spec.md](disl-relation-flag-inheritance.spec.md)

**Input**: the specification, merged with its clarifications at `ff0e90e` and approved by the maintainer on 2026-10-22 with "Approve, all hosts": plan the DISL change and every host's change.

## Summary

DISL 0.6 says, in sections 4.7 and 4.9, that a relation type's `directed`, `allowSelfLoops` and `allowParallel` are inherited along its C3 linearisation with the section 4.9 default as fallback, that a subtype may state one only to narrow it, and that supertypes whose values differ are a specification error unless the subtype states the flag. It adds no construct (research R1). In etalii.adp the change is the document, the schema's descriptions, the validator's checks, one example with a DID document and its findings, and three specifications that must be refused; no definition changes, since `azure-devops-pipeline.dis` and `wardley-map.dis` get under the rule what their authors stated (research R5). Every host that interprets DISL then takes the rule up: Visual Studio Code and Notion, which already inherit, add the two checks; the standalone backend and the desktop host, which read each type's own declaration, inherit and check; the standalone client, which inherits along single `extends` names only, follows the linearisation and refuses what the checks refuse. IntelliJ interprets no DISL and has no task (research R8).

## Technical Context

- **What changes in etalii.adp**: `specifications/disl/DISL-specification.md` (0.5 to 0.6: header, status paragraph, contents, sections 2.9, 4.7, 4.9, 14.1 step 6, 17, and a new *Changes from 0.5*), `specifications/disl/disl.schema.json` (title, the `disl` description, the descriptions of `$defs/RelationType` and its three flags), `.github/scripts/validate-examples.py` (the flag checks in `resolve_disl` and the `disl/refused/` folder), and new files `specifications/disl/service-calls.dis`, `service-calls.did`, `service-calls.findings.json` and `specifications/disl/refused/` (README and three `.dis`).
- **What changes in etalii.adp.ide.standalone**: `src/backend/EtAlii.Adp.Specification.Disl/Loading/DislMetamodel.cs` and `Loading/DislInheritance.cs` (effective flags and the checks, at load), `Derivation/ConstraintEvaluator.cs` and `Derivation/GestureConstraintEvaluator.cs` (read the effective values), `src/backend/EtAlii.Adp.Specification.Disl.Tests/` (a test file and the vendored documents in `Definitions/`); `src/client/src/canvas/library/disl/compileNotation.ts` and `disTypes.ts`, with a vitest beside them. C# on .NET with xUnit v3, TypeScript with vitest; that repository's four gates and `bash .github/tools/inspect/inspect.sh`. Standalone plans with spec-workflow in its own repository; its work is named here as tasks of this feature, as spec 033 named it (research R8).
- **What changes in etalii.adp.ide.vscode**: `src/core/disl/metamodel.ts`, `test/core/disl/metamodel.test.ts`, `test/core/disl/constraints.test.ts`, `fixtures/disl/flag-inheritance/`, `docs/disl-support.md`. `npm run check`, `npm run test:unit`.
- **What changes in etalii.adp.ide.notion**: `src/disl/metamodel.ts`, `test/disl/metamodel.test.ts`, `test/disl/constraints.test.ts`, `docs/disl-support.md`. `npm test`, `npm run lint`, `npm run typecheck`, the build and `check-tree`.
- **What changes in etalii.adp.ide.desktop**: `crates/adp-disl/src/loading/metamodel.rs`, `crates/adp-disl/src/loading/inheritance.rs`, `crates/adp-disl/src/derivation/constraints.rs`, `crates/adp-scene/src/notation/compile.rs`, a test in `crates/adp-disl/tests/`, `vendor/etalii.adp/` and `vendor/etalii.adp.lock` through `tools/sync-etalii-adp.py`, and `parity/inventory.md` if it lists the flags. `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, `python tools/sync-etalii-adp.py --check`.
- **What checks it**: `python .github/scripts/validate-examples.py`, `python .github/scripts/licence-check.py`, `python .github/scripts/terminology-check.py --name etalii.adp`, in the Build workflow; each host's own gates, above.
- **What the validator cannot check**: that a host computes `std.endpoints` over E2 as E3 states; each host's test does (contracts/examples.md E5, fork F1).
- **Unknowns**: none; every choice is in [research.md](research.md). The spec's table of hosts is a snapshot: the standalone backend's `allowSelfLoops` default was corrected on 2026-10-22 (`21cab799b`), and the desktop host, not in that table, has the same own-declaration reading and the old default (research R8).

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The rule is stated here first; five interpreters that read it two ways are brought to the one reading, each by its own task. |
| II. Implementable from the document alone | Sections 4.7 and 4.9 state the lookup, the narrowing and the conflict; the schema's descriptions point at them; the example, its document, its findings and the refused specifications are the worked examples, all in the same pull request. SC-001's reading check is quickstart step 4. |
| III. Precise normative language | F1 to F3 with **MUST**, **MUST NOT** and **MAY**; the informative sentences marked as such; no expression involved. |
| IV. Versioned specifications | 0.6, a draft; the status paragraph says which 0.5 specifications keep their meaning (all in the organization, research R5) and names the reading 0.5 left open. |
| V. Simplicity | No construct; the validator gains checks it needs to show the refused documents are refused, and does not reimplement `std.endpoints` (F1). Hosts do not raise their DISL minor (R10). |
| VI. No JetBrains Rider warnings in C# | The standalone backend tasks change C#; `bash .github/tools/inspect/inspect.sh` there must exit zero, and a run that inspected nothing proves nothing. |

Repositories with principles of their own:

| Repository | Principle | How the tasks meet it |
|---|---|---|
| `etalii.adp.ide.vscode` | III. A tool type's behaviour is what its definition states; `src/core` depends on no editor. IV. Test-first, against real files | The change is in `src/core/disl/` only. T035 vendors the example and the refused documents unchanged with their SHA-256; T036's tests fail first. I and II are untouched. |
| `etalii.adp.ide.notion` | I. One source of truth: a difference is raised in etalii.adp, never settled here; the shared parts name no tool type | The difference is settled by this spec; the tests state their small specifications inline, and no name of a tool type enters `src/` (`test/words.test.ts`). III: no add-on claims anything new. |
| `etalii.adp.ide.desktop` | III. A tool type's behaviour is what its definition in etalii.adp states, the differences in `parity/inventory.md`; IV. test-first, against real files and the standalone host; VI. no clippy warnings | T042 re-vendors etalii.adp at the merged commit with the sync script; T043's tests fail first; the rule matches the standalone host's after Phase 5, so parity holds; clippy is a gate of T046. |
| `etalii.adp.ide.intellij` | – | No task: it interprets no DISL (research R8). |

`etalii.adp.ide.standalone` plans with spec-workflow and has no principles file here; its `CLAUDE.md` rules (a worktree, the four gates, a test seen to fail first, `inspect.sh`, a guard for every bug) are followed by T028 to T034.

No violation to track. Re-checked after Phase 1: the contracts add no construct; the refused folder follows spec 033's.

## Project Structure

### Documentation (this feature)

```text
specs/034-disl-relation-flag-inheritance/
├── disl-relation-flag-inheritance.spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── disl-relation-flags.md
│   └── examples.md
├── checklists/requirements.md
└── tasks.md
```

### Source code

```text
etalii.adp/
├── specifications/disl/
│   ├── DISL-specification.md              (0.6: 2.9, 4.7, 4.9, 14.1, 17, Changes from 0.5)
│   ├── disl.schema.json                   (title, descriptions)
│   ├── service-calls.dis                  (new)
│   ├── service-calls.did                  (new)
│   ├── service-calls.findings.json        (new)
│   └── refused/                           (new: README.md and three .dis)
└── .github/scripts/validate-examples.py

etalii.adp.ide.standalone/src/
├── backend/EtAlii.Adp.Specification.Disl/
│   ├── Loading/DislMetamodel.cs           (effective flags on DislType)
│   ├── Loading/DislInheritance.cs         (lookup and checks)
│   ├── Derivation/ConstraintEvaluator.cs
│   └── Derivation/GestureConstraintEvaluator.cs
├── backend/EtAlii.Adp.Specification.Disl.Tests/
│   ├── RelationFlagInheritance.Tests.cs   (new)
│   └── Definitions/                       (vendored example and refused documents)
└── client/src/canvas/library/disl/
    ├── compileNotation.ts                 (C3, the checks)
    ├── disTypes.ts                        (extends as a list)
    └── compileNotation.flags.test.ts      (new)

etalii.adp.ide.vscode/
├── src/core/disl/metamodel.ts
├── test/core/disl/{metamodel,constraints}.test.ts
├── fixtures/disl/flag-inheritance/        (new, README.md)
└── docs/disl-support.md

etalii.adp.ide.notion/
├── src/disl/metamodel.ts
├── test/disl/{metamodel,constraints}.test.ts
└── docs/disl-support.md

etalii.adp.ide.desktop/
├── crates/adp-disl/src/loading/{metamodel,inheritance}.rs
├── crates/adp-disl/src/derivation/constraints.rs
├── crates/adp-disl/tests/relation_flags.rs  (new)
├── crates/adp-scene/src/notation/compile.rs
└── vendor/etalii.adp/, vendor/etalii.adp.lock
```

**Structure decision**: the rule is DISL's, so etalii.adp carries the document, the schema, the validator and the worked documents; each host implements the same rule against the same documents. The example's DID document sits beside the specification rather than under `specifications/did/`, so that no file of another language changes (FR-009).

## Delivery

- etalii.adp: one pull request from `features/034-disl-relation-flag-inheritance` into `develop`, T001 to T027, ticked in it.
- Then one pull request per host, each from its own `features/034-disl-relation-flag-inheritance`, after the etalii.adp one is merged (they take the merged documents): standalone, Visual Studio Code, Notion and desktop in parallel. Each description links `specs/034-disl-relation-flag-inheritance/` here and names the etalii.adp commit its tasks were taken from; its tasks are ticked here only once it is merged.
- Visual Studio Code and Notion keep their own copies of the interpreter (Visual Studio Code's `src/core/disl/ORIGIN.md`); neither pull request waits on the other.

## Complexity Tracking

None.
