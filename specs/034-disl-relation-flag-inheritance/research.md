# Research: A Relation Type Inherits Its Flags

Every decision below was taken against the code at these commits, read on 2026-10-22: etalii.adp `8e32e83` (develop), etalii.adp.ide.vscode `97e403d`, etalii.adp.ide.notion `421077b`, etalii.adp.ide.standalone `6c129a0af`, etalii.adp.ide.intellij `255c57c` and etalii.adp.ide.desktop `a959be4`, each its `origin/develop`.

## R1. The version: DISL 0.6, a clarification with no new construct

- **Decision**: DISL 0.6, draft, dated 2026-10-22. It adds no property and no `$defs` entry; it settles what 0.5 left open. *Changes from 0.5* has no additions table, only the clarifications table, with one row per answer of the Clarifications section (Q1 to Q3). The schema keeps its `$id` (the 0.2 address) and its version `pattern`; its root `title` and the description of `$defs/Specification/properties/disl` say 0.6, and the three flags gain descriptions that name 4.7.
- **Rationale**: FR-008 asks for a new version. Spec 031 opened 0.5 in exactly these places (its tasks T002 to T007): the header, the date, the status paragraph, the contents, section 2.9's list, the schema's title and version description, and a *Changes from* section. Mirroring it keeps the document's version history in one shape.
- **Alternatives considered**: a patch note inside 0.5 (refused: the constitution's principle IV and FR-008 ask for a stated version, and three hosts change behaviour); 1.0 (refused: nothing is being published as stable).

## R2. Where the text goes

- **Decision**:
  - Section 4.7 gets a fourth bullet, **Relation flags**, carrying FR-001, FR-002 and FR-003 in that order, written as the attribute bullet is written (narrowing, then the conflict rule).
  - Section 4.9's table rows for `directed`, `allowSelfLoops` and `allowParallel` keep their defaults (FR-004) and add "Inherited (4.7)."; the paragraph **Acyclic over subtypes** is renamed **Flags over subtypes** and lists the four flags as one list, `acyclic` keeping its own rule word for word (FR-005, which allows the restatement).
  - Section 14.1 step 6 adds "the relation flags (4.7)" to what is checked while flattening inheritance.
  - Section 17's table names the new example and its document (R7); *Changes from 0.5* names the refused specifications (R6).
- **Rationale**: section 4.7 is where an implementer looks for what a subtype has (spec User Story 2); 4.9 is where the flags are listed, so a reader of either finds the rule. Step 6 is where hosts already check attribute narrowing; the flags are checked in the same pass.
- **Alternatives considered**: putting the whole rule in 4.9 (refused: 4.7 already says what is inherited and what may be narrowed, and a second list elsewhere is how the silence arose).

## R3. The effective value, and why the three rules agree

- **Decision**: the effective value of a flag of a relation type `T` is the value of the first type in `T`'s C3 linearisation, `T` itself first, that states it; when none does, the section 4.9 default. A specification is in error when, for some flag:
  1. `T` states it and a direct supertype's effective value is narrower: `allowSelfLoops` or `allowParallel` stated `true` where the supertype's is `false`, or `directed` stated differently from the supertype's (FR-002);
  2. `T` does not state it and two direct supertypes have different effective values (FR-003).
- **Defaults count.** A supertype that states nothing anywhere has the default as its effective value, so `D extends [B, C]`, with `B` inheriting `allowParallel: false` and `C` stating nothing, is a conflict: `C`'s `allowParallel` is `true`. A subtype that states `directed: false` under a supertype that states nothing has widened nothing but differs from `true`, and is in error. The contract says so in so many words, since it is the case an implementer gets wrong.
- **Why C3 and the conflict rule never disagree**: when the direct supertypes agree, the first stating type in `T`'s linearisation is the first stating type in the linearisation of the supertype it belongs to (C3 keeps each supertype's linearisation as a subsequence), so the effective value is that supertype's, which is the agreed value. The C3 lookup therefore only ever decides between values that are equal, or is overruled by an error; a host may compute either way and give the same answer.
- **Rationale**: Q1 to Q3 of the Clarifications. The narrowing direction follows from what each flag permits: `true` permits more for `allowSelfLoops` and `allowParallel`; `directed` changes what a pair is, so neither direction narrows.
- **Alternatives considered**: comparing the stated value with the nearest stating supertype only (refused: under several supertypes it lets a subtype widen the farther one).

## R4. What counts as parallel is not changed

- **Decision**: no change. `allowParallel` keeps counting relations of the same type between the same pair, and every interpreter counts by the relation's own type: Visual Studio Code and Notion `constraints.ts` (key `[relation.type, ...ends]`), the standalone backend `ConstraintEvaluator.Endpoints` (key `(type, source, target)`) and `GestureConstraintEvaluator.Parallel` (`ReferenceEquals(relation.Type, type)`), and the desktop `derivation/constraints.rs` (key `(t.name, a, b)`). So a Wardley `Dependency` and a `Flow` on one pair stay two relations of different types, as `wardley-map.dis` says ("one pair may carry one dependency and one flow"), while two `Dependency` relations on one pair become a finding.
- **Rationale**: the spec asks where a flag's value comes from, not what it counts; every host already agrees on the count.
- **Alternatives considered**: counting a supertype's flag over all its subtypes, as `acyclic` does (refused: it would change the Wardley map's meaning and was not asked).

## R5. The definitions: nothing to correct

- **Decision**: no definition changes. Under the rule:

  | Definition | Relation type | `directed` | `allowSelfLoops` | `allowParallel` | Own-declaration reading |
  |---|---|---|---|---|---|
  | `azure-devops-pipeline.dis` | `Dependency` (abstract) | true (stated) | true (stated) | false (stated) | same |
  | | `DependsOn` | true (from `Dependency`) | true (stated) | **false (from `Dependency`)** | `allowParallel` true |
  | | `DefaultOrder` (derived) | true (from `Dependency`) | true (stated) | **false (from `Dependency`)** | `allowParallel` true |
  | `wardley-map.dis` | `Link` (abstract) | true (default) | false (stated) | false (stated) | same |
  | | `Dependency` | true (default) | false (from `Link`) | **false (from `Link`)** | `allowParallel` true |
  | | `Flow` | true (default) | false (from `Link`) | **false (from `Link`)** | `allowParallel` true |

  Neither definition widens or conflicts: every subtype that states a flag (`allowSelfLoops: true` on `DependsOn` and `DefaultOrder`) states the supertype's value. The authors stated `allowParallel: false` on the abstract type so that it applies below it, as the Wardley `Link`'s `doc` says; the rule gives them that, so the "meaning that changes" of FR-007 is only the standalone backend's and the desktop host's reading, which the host tasks correct. `DefaultOrder` is derived; whether a count means anything for a computed relation is section 4.11's (spec Edge Cases), and every host already skips derived relations in `std.endpoints`.
- **The wider scan**: a script computing C3 and the three checks over every `.dis` at `origin/develop` found no widening, no conflict and no relation type with several supertypes, in etalii.adp (definitions and specifications, 4 inherited non-default values, the four above), etalii.adp.ide.standalone (28 files; its copy of `azure-devops-pipeline.dis` has the same two), etalii.adp.ide.vscode (6) and etalii.adp.ide.notion (2); etalii.adp.ide.intellij has none. So every valid 0.5 specification in the organization stays valid under 0.6 (FR-008's "whether every valid 0.5 specification keeps its meaning": it keeps it in the reading Visual Studio Code and Notion already had).
- **Alternatives considered**: restating `allowParallel: false` on the four subtypes (refused: it adds nothing under the rule and hides the very case the rule is for).

## R6. The validator, and specifications that must be refused

- **Decision**: `resolve_disl` in `.github/scripts/validate-examples.py` gains the three checks of R3 for every `*.dis` that validates, computing the C3 linearisation of the relation types (a cycle or an inconsistent order is reported, as 14.1 step 6 says). A new folder `specifications/disl/refused/` holds specifications that are valid against the schema and must be refused by one of these checks, with a README in the shape of `specifications/fbl/refused/README.md`; the validator's existing `refused` handling, which today names `fbl/refused` only, is widened to `disl/refused` with the same contract (reported as refused with its first problem; the run fails when one is accepted or refused by the schema). Three documents, each failing one check only: `relation-flag-widened.dis` (`allowParallel: true` under `false`), `relation-flag-directed.dis` (`directed: false` under a supertype that states nothing, the defaults case of R3) and `relation-flag-conflict.dis` (two supertypes, `allowSelfLoops` effective `true` and `false`, not restated).
- **Rationale**: the constitution's principle II wants the rule checkable from this repository; the rules are ones JSON Schema cannot express (Appendix A.1 already lists "inheritance narrowing" as the validator's job). Spec 033 set the pattern of a `refused/` folder whose documents hosts load and expect refused.
- **Alternatives considered**: no validator change (refused: the refused documents would then prove nothing here); a validator that also derives the example document's findings (left as fork F1 in tasks.md, not planned: the findings file is checked by every host's conformance test instead, and a second interpreter of `std.endpoints` in Python is a construct no current tool needs).

## R7. The example and its document

- **Decision**: `specifications/disl/service-calls.dis`, DISL 0.6, a small service map:
  - node type `Service` (attribute `name`, key);
  - abstract relation type `Call`, `allowParallel: false`, `allowSelfLoops: true` (a service may call itself, and one pair has one call of each kind);
  - `SyncCall` and `AsyncCall`, each `extends: "Call"`, stating no flag;
  - abstract `Observation`, stating no flag;
  - `TracedCall`, `extends: ["SyncCall", "Observation"]`, which must restate `allowParallel: false` and `allowSelfLoops: false` (its supertypes' effective values differ for both, R3) and does, narrowing each.

  Beside it, `specifications/disl/service-calls.did`, a DID definition of that language: services `checkout`, `payments`, `ledger`; two `SyncCall` from `checkout` to `payments`; one `AsyncCall` on the same pair; a `SyncCall` from `ledger` to itself; a `TracedCall` from `payments` to itself. And `specifications/disl/service-calls.findings.json`, the object form of `$defs/ValidatorOutput`, with exactly two `std.endpoints` findings in the order of section 8.6: `parallel` on the second `SyncCall`, `selfLoop` on the `TracedCall`. The `AsyncCall` and the `ledger` loop give none. Both new files are validated by the run as they stand (by extension and by `$schema`).
- **Rationale**: the spec's Independent Test of User Story 1 (an abstract type with `allowParallel: false` and `allowSelfLoops: true`, a concrete subtype stating neither, a finding for the second parallel and none for the loop) and User Story 2's case of two supertypes, in one readable tool. The document sits beside the specification, not in `specifications/did/`, so that FR-009 is checkable as "no file under `did/` changed".
- **Alternatives considered**: extending `functional-decomposition.dis` (refused: its relation hierarchy uses the defaults only, R5's caution about default-valued examples).

## R8. Each host at `origin/develop`, against the rule

| Host | Where | Effective value today | Narrow-only and conflict checks | Default of `allowSelfLoops` |
|---|---|---|---|---|
| etalii.adp.ide.vscode | `src/core/disl/metamodel.ts`, `interpretMetamodel`, the `stated` helper | C3, nearest stating type, else 4.9's default: conforms | none | false |
| etalii.adp.ide.notion | `src/disl/metamodel.ts`, the same helper (its own copy; Visual Studio Code took it at `4a0cdb4` and owns its own since) | conforms | none | false |
| etalii.adp.ide.standalone, backend | `src/backend/EtAlii.Adp.Specification.Disl/Loading/DislMetamodel.cs`, `DislType` reads `Flag(json, ...)` of its own declaration; read by `Derivation/ConstraintEvaluator.cs` (`Endpoints`) and `Derivation/GestureConstraintEvaluator.cs` (`Endpoints`, `Parallel`) | own declaration only | none | **false since `21cab799b`** (2026-10-22): the spec's table, taken at `a28656e45`, says `?? true`; that defect is already fixed |
| etalii.adp.ide.standalone, client | `src/client/src/canvas/library/disl/compileNotation.ts`, `relation()` with `INHERITED_RELATION_KEYS` | the chain of single `extends` names; nothing through an `extends` list (`disTypes.ts` types `extends?: string`) | none | false |
| etalii.adp.ide.desktop, core | `crates/adp-disl/src/derivation/constraints.rs`, `flag(&t, name, fallback)` over `t.json` | own declaration only | none | **true** (`flag(&t, "allowSelfLoops", true)`), against 4.9: ported before standalone's fix |
| etalii.adp.ide.desktop, scene | `crates/adp-scene/src/notation/compile.rs`, `relation_type`, reads `relation_json` | own declaration only | none | false |
| etalii.adp.ide.intellij | no DISL interpreter: its tools are hand-written, and `ToolOrigin.BundledSpecification` only names a specification | – | – | – |

- **Decision**: a phase per host that interprets DISL: standalone (backend and client), Visual Studio Code, Notion and desktop. IntelliJ has no task (SC-003 names a host only where the rules put it in conflict). The desktop host is included because the ruling is "Approve, all hosts" and its runtime reads the flags; its `allowSelfLoops` default is corrected in the same task, since it is the same function and a test of the rule cannot pass while the default is wrong (fork F3 lets the maintainer split it out).
- **Rationale**: SC-003 and SC-004: a second `DependsOn` between one pair is a finding in every host that interprets DISL.

## R9. Where each host checks, and how it computes

- **Decision**:
  - **Visual Studio Code and Notion**: in `interpretMetamodel`, after the relations' `lineage` is known, compute each flag's effective value as today and add the two checks, each a `problem(...)` naming the type, the flag and the supertypes, as the existing "cannot be put in one order" problem is worded. The direct supertypes are `parents(name)`.
  - **Standalone backend**: compute the effective values in `Loading/DislInheritance.cs` (a new step after `Linearise`, beside `End`), and keep them on `DislType` as non-nullable `Directed`, `AllowSelfLoops`, `AllowParallel`, so the evaluators drop their `?? true` / `?? false` fallbacks; the checks are `DislLoader.Error` diagnostics at the relation's pointer. JSON stays read in `Loading/` only (`RawJsonOutsideLoading.Tests.cs`, spec 025's rule).
  - **Standalone client**: replace the walk of single `extends` names in `relation()` with the C3 linearisation of the relation types, read from `extends` as a string or a list (`disTypes.ts`), for every key of `INHERITED_RELATION_KEYS` (the ends included, which keeps their current inheritance and extends it to lists). A widening or a conflict is refused with `fail(...)`, as `compileNotation` refuses what it cannot draw unambiguously (fork F2).
  - **Desktop**: compute the effective values in `crates/adp-disl/src/loading/inheritance.rs` beside `end`, keep them on `DislType` in `loading/metamodel.rs`, read them in `derivation/constraints.rs` instead of `flag(...)`, and have `adp-scene`'s `relation_type` read them from the metamodel instead of `relation_json`; the checks are diagnostics in `inheritance.rs`.
- **Rationale**: each host checks where it already checks attribute narrowing, so a reader finds the two rules side by side.

## R10. Host versions are not raised

- **Decision**: no host raises the DISL minor version it reads (Visual Studio Code `dislMinor = 4`, Notion `minor = 3`; the standalone backend and the desktop host check the major only). The rule applies to a specification of any version, because 0.6 states what 0.1 to 0.5 meant (2.9: a later runtime reads an earlier specification with its meaning, apart from the listed clarifications).
- **Rationale**: as spec 033's research R9: a host takes up the clarification alone; raising a minor would claim the rest of 0.5 (`person`), which not every host draws.

## R11. How hosts take the example and the refused specifications

- **Decision**: the standalone backend copies `service-calls.dis` and the three refused specifications into `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/` with a `.provenance.json` each, the shape `narrow-reading.provenance.json` has, naming etalii.adp and the merged commit. Visual Studio Code copies them into `fixtures/disl/flag-inheritance/` with a `README.md` naming the commit and each file's SHA-256. The desktop host takes them with `python tools/sync-etalii-adp.py` at the merged commit, which re-vendors all of `specifications/`. Notion's tests state the same small specifications inline, as its `test/disl/metamodel.test.ts` already does, since its `sync-examples.mjs` copies only the examples of its add-ons' tool types.
- **Rationale**: every host tests against the documents etalii.adp checks, unchanged (Visual Studio Code's and desktop's principle IV), without adding a copy script.
