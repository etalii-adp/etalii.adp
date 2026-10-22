# Tasks: A Relation Type Inherits Its Flags

**Input**: [disl-relation-flag-inheritance.spec.md](disl-relation-flag-inheritance.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

Paths carry their repository as prefix: `etalii.adp/...`, `etalii.adp.ide.standalone/...`, `etalii.adp.ide.vscode/...`, `etalii.adp.ide.notion/...` and `etalii.adp.ide.desktop/...`, the clones side by side. Each repository gets its own branch `features/034-disl-relation-flag-inheritance` and its own pull request, whose description links `specs/034-disl-relation-flag-inheritance/` here and names the etalii.adp commit its tasks were taken from. The etalii.adp one merges first. A task of another repository is ticked here only once that repository's pull request is merged (the maintainer's ruling "Approve, all hosts", 2026-10-22). `etalii.adp.ide.intellij` interprets no DISL and has no task (research R8).

Every etalii.adp task is checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/licence-check.py` and `python .github/scripts/terminology-check.py --name etalii.adp`, each exit code captured. Every standalone task is checked by that repository's four gates (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test --solution EtAlii.Adp.slnx`) and by `bash .github/tools/inspect/inspect.sh` (constitution principle VI); every Visual Studio Code task by `npm run check` and `npm run test:unit`; every Notion task by `npm test`, `npm run lint`, `npm run typecheck` and `node scripts/build.mjs --out <dir>` with `node scripts/check-tree.mjs <dir>`; every desktop task by `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` and `python tools/sync-etalii-adp.py --check`. In every host, a test is seen to fail against `origin/develop` before the code it covers, and a gate the container cannot run is named as not run and left to that repository's CI.

**Tests**: the specification asks for no test code in etalii.adp; its checks are the validator, the planted faults of T018 and T023 and the reading check of T025. In the hosts, every behaviour change comes with a test, by each repository's principles.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (a different file, no dependency on an unfinished task).
- **[Story]**: the user story of the spec the task serves (US1, US2).

---

## Phase 1: Setup

- [x] T001 From the feature's worktree of etalii.adp, run the three checks on the unchanged tree and record each exit code and the validator's count of examples, for comparison in T026 (quickstart step 1).

---

## Phase 2: Foundational, DISL 0.6

**Purpose**: the version every later task writes into (research R1, contract C0). Mirror spec 031's T002 to T007.

- [x] T002 In `etalii.adp/specifications/disl/DISL-specification.md`, change the header "**Specification, version 0.5 (Draft)**" to version 0.6 and the `Date` row from 2026-10-19 to 2026-10-22 (contract C0, FR-008).
- [x] T003 In the same file's *Status of this document*, change "This is a draft, version 0.5." to "version 0.6", and after the sentence on DISL 0.5 append the sentence of contract C0: DISL 0.6 adds no construct and settles where a relation type's three flags come from; 0.5 left it open and two readings were in use (inherited, and the type's own declaration only); every valid 0.5 specification that neither widens a flag nor inherits two different values of one is a valid 0.6 specification with the meaning of the first reading, apart from the clarifications in [Changes from 0.5](#changes-from-05) (FR-008).
- [x] T004 In the same file's contents, add `- [Changes from 0.5](#changes-from-05)` directly after `- [Changes from 0.4](#changes-from-04)` (contract C0).
- [x] T005 In the same file's section 2.9, first bullet, list the versions as `"0.1"`, `"0.2"`, `"0.3"`, `"0.4"`, `"0.5"` or `"0.6"`; add no superset bullet (contract C0).
- [x] T006 [P] In `etalii.adp/specifications/disl/disl.schema.json`, change the root `title` to "DISL 0.6 (draft) — Diagram Specification Language" and the description of `$defs/Specification/properties/disl` to name 0.1 to 0.6, say that a 0.6 runtime reads 0.1 to 0.5 specifications with their meaning, and point at "DISL 0.6, section 2.9". Leave the `$id` (the 0.2 address) and the `pattern` unchanged (contract C0, FR-008).
- [x] T007 In `etalii.adp/specifications/disl/DISL-specification.md`, add `## Changes from 0.5` after the end of *Changes from 0.4* and before the `---` that precedes `## 18. Deprecated aliases`: its opening paragraph (DISL 0.6, draft, 2026-10-22, ruled by the maintainer on 2026-10-22 with the answers to Q1 to Q3 of spec 034 and "Approve, all hosts"; no construct is added), an empty table with the header `| # | Change | 0.5 said | 0.6 says | Reason | Section |` for T022 to fill, and the closing sentence that DISL 0.6 needs no change to DID, DESL or FBL (contract C4, FR-008, FR-009).

**Checkpoint**: the document and the schema say 0.6 wherever a version is stated; the validator still passes.

---

## Phase 3: User Story 1, a subtype has the flags its supertype states (Priority: P1) 🎯 MVP

**Goal**: sections 4.7 and 4.9 say that an unstated flag is inherited along the C3 linearisation, else the default, and that a subtype only narrows; the example shows it with findings.

**Independent test**: `service-calls.dis` validates; its document has a finding for the second `SyncCall` on one pair and none for the `ledger` loop (spec US1 Independent Test).

- [x] T008 [US1] In section 4.7 of `etalii.adp/specifications/disl/DISL-specification.md`, after the bullet that begins "A subtype MAY redeclare an inherited attribute to *narrow* it", add the bullet **Relation flags** with F1 of contract C1: a relation type that does not state `directed`, `allowSelfLoops` or `allowParallel` **MUST** be read with the value of the nearest type in its C3 linearisation that states it, and with the section 4.9 default when none does, the lookup notation, forms and constraints use; and the informative sentence that `abstract` and `derived` make no difference, and that a supertype stating a flag with its default value changes nothing (FR-001).
- [x] T009 [US1] In the same bullet, add F2 of contract C1: a relation type **MAY** state a flag its supertypes have only to narrow it, `allowSelfLoops` and `allowParallel` from `true` to `false`; it **MUST NOT** state `true` where a direct supertype's value is `false`, and **MUST NOT** state a `directed` that differs from a direct supertype's; "the supertype's value" is its value by F1, the default included (data model V1); a relation type that does is a specification error (FR-002).
- [x] T010 [US1] In section 4.9 of the same file, add "Inherited (4.7)." to the Description of the rows `directed`, `allowSelfLoops` and `allowParallel`, keeping their defaults word for word (FR-004); rename the paragraph **Acyclic over subtypes** to **Flags over subtypes**, saying first that the three flags are inherited and only narrowed (4.7), then `acyclic`'s rule unchanged, the `Owns` example kept (FR-005); and add the informative sentence of contract C2 that `allowParallel` counts relations of the same type, so two subtypes of one type on one pair are not parallel to each other (research R4).
- [x] T011 [US1] In section 14.1, step 6, of the same file, name the relation flags among what is merged and checked: "merge attributes, ports, containment and relation flags; check narrowing rules and conflicting inherited declarations (4.7)" (contract C3, FR-001).
- [x] T012 [P] [US1] In `etalii.adp/specifications/disl/disl.schema.json`, give `$defs/RelationType/properties/directed`, `allowSelfLoops` and `allowParallel` each a `description` stating its default and that an unstated value is inherited along the supertypes (DISL 0.6, section 4.7), and extend the defaults sentence of `$defs/RelationType`'s `description` to say so; change no other keyword (contract C5, FR-001, FR-006).
- [x] T013 [P] [US1] Add `etalii.adp/specifications/disl/service-calls.dis` as contract E1 gives it: `"disl": "0.6"`, language `org.example.service-calls` `1.0.0`, `Service`, abstract `Call` (`allowParallel: false`, `allowSelfLoops: true`), `SyncCall` and `AsyncCall` (`extends: "Call"`, no flag), abstract `Observation` (no flag), `TracedCall` (`extends: ["SyncCall", "Observation"]`, `allowParallel: false`, `allowSelfLoops: false`), each relation type's `doc` saying where its flags come from, and the least notation and toolbox that make it usable. LF, as the examples beside it (FR-006).
- [x] T014 [P] [US1] Add `etalii.adp/specifications/disl/service-calls.did`, a DID 0.1 definition of `org.example.service-calls` `1.0.0` with the records of contract E2, in that order (FR-006).
- [x] T015 [US1] Add `etalii.adp/specifications/disl/service-calls.findings.json`, the object form of `$defs/ValidatorOutput` with exactly the two findings of contract E3, in that order, each with `constraintId`, `severity`, `message`, `elementId` and `pointer` (FR-006, SC-002).
- [x] T016 [US1] In section 17 of `etalii.adp/specifications/disl/DISL-specification.md`, add the row of contract C4 for `service-calls.dis`, `service-calls.did` and `service-calls.findings.json`, and correct the sentence before the table that counts the files it lists (FR-006).
- [x] T017 [US1] In `etalii.adp/.github/scripts/validate-examples.py`, extend `resolve_disl` with the C3 linearisation of `metamodel.relations` (a cycle or an order C3 cannot make is a problem, as 14.1 step 6 says) and with V1 of data-model.md, each problem `at /metamodel/relations/<T>/<flag>: ...` naming the flag and the supertype it widens; update the module docstring's paragraph on what every `*.dis` is checked for (FR-001, FR-002, research R6).
- [x] T018 [US1] See the run fail when `"allowSelfLoops": true` is added to `TracedCall` in `service-calls.dis` (it widens `Observation`'s `false`), and pass when it is removed; record the output in the pull request (SC-002).

**Checkpoint**: the rule of US1 reads from 4.7 and 4.9 alone, and the example shows it.

---

## Phase 4: User Story 2, a host implementer can tell from the document alone (Priority: P2)

**Goal**: the text says what a relation type with several supertypes that differ has, and the validator refuses what it refuses.

**Independent test**: a reader of 4.7 and 4.9 alone, given `relation-flag-conflict.dis`, says it is in error; the validator reports each document of `refused/` as refused (spec US2 Independent Test).

- [x] T019 [US2] In the **Relation flags** bullet of section 4.7 of `etalii.adp/specifications/disl/DISL-specification.md`, add F3 of contract C1: a relation type whose direct supertypes have different values of a flag by F1 is a specification error unless it states that flag itself, as for conflicting inherited attributes (FR-003).
- [x] T020 [P] [US2] Add `etalii.adp/specifications/disl/refused/README.md` and the three documents of contract E4, `relation-flag-widened.dis`, `relation-flag-directed.dis` and `relation-flag-conflict.dis`, each DISL 0.6, valid against the schema, failing one check only, its root `doc` naming that check (FR-002, FR-003).
- [x] T021 [US2] In `etalii.adp/.github/scripts/validate-examples.py`, add V2 of data-model.md to `resolve_disl`, and widen the `refused` handling, today `root / "fbl" / "refused"` only, to `root / "disl" / "refused"` with the same contract and messages (a document there must validate and be refused; the run fails otherwise); update the docstring to say so (FR-003, contract E5).
- [x] T022 [US2] Fill the table of *Changes from 0.5* in `etalii.adp/specifications/disl/DISL-specification.md` with the three rows of contract C4, and end the section with the sentence naming `refused/` (FR-008).
- [x] T023 [US2] See the run fail when `Both` in `relation-flag-conflict.dis` states `"allowSelfLoops": false` (the document is then accepted), and when `"allowParallel": false` is deleted from `TracedCall` in `service-calls.dis` (V2), and pass again when each is restored (quickstart step 3).

**Checkpoint**: every rule of the Clarifications is a sentence of 4.7, a check of the validator, and a document it accepts or refuses.

---

## Phase 5: Closing the etalii.adp change

- [x] T024 Read `etalii.adp/definitions/diagrams/azure-devops-pipeline.dis` and `etalii.adp/definitions/diagrams/wardley-map.dis` under the finished 4.7 and confirm research R5's table: no correction, since `DependsOn`, `DefaultOrder`, `Dependency` and `Flow` inherit `allowParallel: false` as their authors stated it; record the table in the pull request (FR-007, spec US1 scenario 5). Confirm that `git diff --stat origin/develop -- specifications/did specifications/desl specifications/ded specifications/fbl definitions` prints nothing (FR-009).
- [x] T025 Do the reading check of quickstart step 4 with sections 4.7 and 4.9 alone, and record each answer with the sentence it comes from; an answer that must be inferred is a gap in T008 to T010 or T019 (SC-001).
- [x] T026 Run the three checks and compare with T001: each exits 0, the example count has grown by the new files only, and every earlier example keeps its result (SC-002).
- [x] T027 Run the coverage diff: every FR and SC of the specification against the requirement references of these tasks, then read two traces back to their artefacts and ask whether the evidence is that criterion's. Open the etalii.adp pull request into `develop`; tick T001 to T027 in it. Done: [etalii-adp/etalii.adp#439](https://github.com/etalii-adp/etalii.adp/pull/439), merged as `4aa0522b195d5d0ee3139f8dc54f741a5bbb858b`.

---

## Phase 6: User Story 1 in etalii.adp.ide.standalone (P1)

**Goal**: the backend and the client of the standalone host read the flags by the rule, and refuse what it refuses.

**Independent test**: with the vendored `azure-devops-pipeline.dis`, two `DependsOn` on one pair give one `std.endpoints` `parallel` finding in the backend, and a connect gesture for the second is refused, as the client already refuses it on the canvas (SC-004); each refused document fails to load.

From here on, each host starts once the etalii.adp pull request is merged, in a worktree of its repository on `features/034-disl-relation-flag-inheritance` with `git config --worktree user.name "agent-<N>-relation-flag-inheritance"`. Standalone plans with spec-workflow; this phase is its work under this feature, as spec 033 named it.

- [x] T028 [US1] Copy `service-calls.dis` and the three documents of `specifications/disl/refused/` from the merged etalii.adp commit, unchanged, into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/`, each with a `.provenance.json` in the shape of `narrow-reading.provenance.json` naming `etalii-adp/etalii.adp`, its path and the commit, and its SHA-256.
- [x] T029 [US1] Write `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl.Tests/RelationFlagInheritance.Tests.cs`, each case seen to fail against `origin/develop` first: a subtype inherits `allowParallel: false` (a finding for the second of two on one pair, through `ConstraintEvaluator.Evaluate`, and a refusal through `GestureConstraintEvaluator.Connect`); a subtype inherits `allowSelfLoops: true` (no finding, no refusal); `directed: false` inherited, under `allowParallel: false`, makes an opposite pair parallel; the model of contract E2 built on the vendored `service-calls.dis` gives exactly E3's two findings in E3's order; and each vendored refused document loads with one error diagnostic naming its relation type and flag. Keep `SelfLoopDefault.Tests.cs` passing.
- [x] T030 [US1] In `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/Loading/DislMetamodel.cs`, make `DislType.Directed`, `AllowSelfLoops` and `AllowParallel` the effective values, `bool` and not `bool?`, set at load, and keep what the declaration states for the checks; in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/Loading/DislInheritance.cs`, after `Linearise`, compute them along `Linearisation` with the 4.9 defaults, and add the checks V1 and V2 of data-model.md as `DislLoader.Error` diagnostics at `/metamodel/relations/<T>` citing DISL §4.7, worded as the existing "inherits ... differently, and does not redeclare it" diagnostic. JSON stays read in `Loading/` only (`RawJsonOutsideLoading.Tests.cs`).
- [x] T031 [US1] In `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/Derivation/ConstraintEvaluator.cs` (`Endpoints`) and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/Derivation/GestureConstraintEvaluator.cs` (`Endpoints`, `Parallel`), read the effective values and drop the `?? false` and `?? true` fallbacks. T029's tests pass; the four gates and `inspect.sh` exit zero, each by its captured exit code.
- [x] T032 [P] [US1] Write `etalii.adp.ide.standalone/src/client/src/canvas/library/disl/compileNotation.flags.test.ts`, each case seen to fail first: a relation type with `extends: ["A", "B"]` takes its ends and flags along the C3 linearisation (today it inherits nothing); `perPair` and `allowSelf` follow inherited values; and a widening and a conflict are refused by `compileNotation` with a message naming the type and the flag (fork F2).
- [x] T033 [US1] In `etalii.adp.ide.standalone/src/client/src/canvas/library/disl/disTypes.ts`, type a relation's `extends` as `string | readonly string[]`; in `etalii.adp.ide.standalone/src/client/src/canvas/library/disl/compileNotation.ts`, replace the walk of single `extends` names in `relation()` with the C3 linearisation of the relation types, the nearest stating type winning for every key of `INHERITED_RELATION_KEYS`, and `fail(...)` on V1 and V2 for the three flags. T032's tests and the existing `compileNotation*.test.ts` pass; the four gates exit zero.
- [x] T034 [US1] Open the standalone pull request into `develop`; tick T028 to T033 here once it is merged. Done: [etalii-adp/etalii.adp.ide.standalone#595](https://github.com/etalii-adp/etalii.adp.ide.standalone/pull/595), merged as `b5b4f594bb32cefbce4c2a0974f17f1901407b57`.

---

## Phase 7: User Story 1 in etalii.adp.ide.vscode (P1)

**Goal**: Visual Studio Code's interpreter, which already inherits, refuses a widening and a conflict.

**Independent test**: the vendored refused documents each give one `problem` from `interpretMetamodel`; `service-calls.dis` gives none and the effective values of data-model.md.

- [x] T035 [US1] Copy `service-calls.dis`, `service-calls.did`, `service-calls.findings.json` and the three refused documents from the merged etalii.adp commit, unchanged, into `etalii.adp.ide.vscode/fixtures/disl/flag-inheritance/`, with `etalii.adp.ide.vscode/fixtures/disl/flag-inheritance/README.md` naming the source, the commit, the licence and each file's SHA-256.
- [x] T036 [US1] Add to `etalii.adp.ide.vscode/test/core/disl/metamodel.test.ts` the effective values of `service-calls.dis` and one case per refused document, and to `etalii.adp.ide.vscode/test/core/disl/constraints.test.ts` the model of contract E2 with E3's two `std.endpoints` findings in order; see the refusals fail first (the lookup already passes, research R8).
- [x] T037 [US1] In `etalii.adp.ide.vscode/src/core/disl/metamodel.ts`, in `interpretMetamodel` where the relations' flags are set, add V1 and V2 against the effective values of `parents(name)`, each a `problem(...)` naming the type, the flag and the supertypes; in `etalii.adp.ide.vscode/docs/disl-support.md`, say in the `metamodel` row that relation flags are inherited and narrowed (DISL 0.6, 4.7). Do not raise `dislMinor` (research R10). T036's tests pass; `npm run check` and `npm run test:unit` exit zero.
- [x] T038 [US1] Open the Visual Studio Code pull request into `develop`; tick T035 to T037 here once it is merged. It does not touch spec 027's branch. Done: [etalii-adp/etalii.adp.ide.vscode#31](https://github.com/etalii-adp/etalii.adp.ide.vscode/pull/31), merged as `6ebc91d0707c23c273918c882269a6a9923a26f7`.

---

## Phase 8: User Story 1 in etalii.adp.ide.notion (P1)

**Goal**: Notion's interpreter, its own copy of the same rule, refuses a widening and a conflict.

**Independent test**: as Phase 7, with the specifications stated inline.

- [x] T039 [US1] Add to `etalii.adp.ide.notion/test/disl/metamodel.test.ts` the effective values of a specification shaped as `service-calls.dis` and one case per refused document of contract E4, stated inline as the file's other cases are, and to `etalii.adp.ide.notion/test/disl/constraints.test.ts` the model of contract E2 with E3's two findings; see the refusals fail first. No name of these test specifications enters `src/` (`test/words.test.ts`).
- [x] T040 [US1] In `etalii.adp.ide.notion/src/disl/metamodel.ts`, add V1 and V2 as in T037; in `etalii.adp.ide.notion/docs/disl-support.md`, the same sentence as T037's. Do not raise `minor` in `src/disl/specification.ts` (research R10). `npm test`, `npm run lint`, `npm run typecheck`, the build and `check-tree` exit zero.
- [x] T041 [US1] Open the Notion pull request into `develop`; tick T039 and T040 here once it is merged. Done: [etalii-adp/etalii.adp.ide.notion#12](https://github.com/etalii-adp/etalii.adp.ide.notion/pull/12), merged as `dfadec399f7b91f698b2e2104c43613043d04147`.

---

## Phase 9: User Story 1 in etalii.adp.ide.desktop (P1)

**Goal**: the desktop core and scene read the flags by the rule, as the standalone host does after Phase 6.

**Independent test**: `cargo test -p adp-disl` runs the cases of T029 against the vendored documents.

- [x] T042 [US1] Run `python tools/sync-etalii-adp.py` in `etalii.adp.ide.desktop` at the merged etalii.adp commit, which rewrites `etalii.adp.ide.desktop/vendor/etalii.adp/` and `etalii.adp.ide.desktop/vendor/etalii.adp.lock`; no vendored file is edited by hand. Done in [etalii-adp/etalii.adp.ide.desktop#66](https://github.com/etalii-adp/etalii.adp.ide.desktop/pull/66), which synced `vendor/etalii.adp/` to `43862a0`, merged as `29a14b0a171f2b35d3b1291c10dc91333415af2c`.
- [x] T043 [US1] Write `etalii.adp.ide.desktop/crates/adp-disl/tests/relation_flags.rs` with the cases of T029, reading `vendor/etalii.adp/specifications/disl/service-calls.dis` and `refused/`, and a case that a relation type stating no `allowSelfLoops` anywhere forbids a loop; each seen to fail first.
- [x] T044 [US1] In `etalii.adp.ide.desktop/crates/adp-disl/src/loading/metamodel.rs`, add the effective `directed`, `allow_self_loops` and `allow_parallel` to `DislType`; in `etalii.adp.ide.desktop/crates/adp-disl/src/loading/inheritance.rs`, compute them along `linearisation` with the 4.9 defaults and add V1 and V2 as diagnostics; in `etalii.adp.ide.desktop/crates/adp-disl/src/derivation/constraints.rs`, read them instead of `flag(&t, ...)`, which also ends today's `allowSelfLoops` fallback of `true` (research R8, fork F3).
- [x] T045 [US1] In `etalii.adp.ide.desktop/crates/adp-scene/src/notation/compile.rs`, `relation_type`, take `directed`, `allowSelfLoops` and `allowParallel` from the metamodel's effective values instead of `relation_json`; extend `etalii.adp.ide.desktop/crates/adp-scene/tests/notation_compilation.rs` with an inherited `allowParallel: false`, seen to fail first. Record the change in `etalii.adp.ide.desktop/parity/inventory.md` where it lists `std.endpoints` or the relation flags.
- [x] T046 [US1] The four desktop checks exit zero; open the desktop pull request into `develop`; tick T042 to T045 here once it is merged. Done: [etalii-adp/etalii.adp.ide.desktop#68](https://github.com/etalii-adp/etalii.adp.ide.desktop/pull/68), merged as `64661cbc2da880d74d512989bb22cdebac77cc61`.

---

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T008, T011, T012, T017 |
| FR-002 | T009, T017, T018, T020 |
| FR-003 | T019, T020, T021, T023 |
| FR-004 | T010 |
| FR-005 | T010 |
| FR-006 | T012, T013, T014, T015, T016 |
| FR-007 | T024 |
| FR-008 | T002, T003, T006, T007, T022 |
| FR-009 | T007, T024 |
| SC-001 | T025 |
| SC-002 | T015, T018, T026 |
| SC-003 | T028 to T046, one phase per host that interprets DISL, each naming its files (research R8); IntelliJ has none |
| SC-004 | T029, T032, T036, T039, T043 |

User Story 1's scenarios 1 to 4 are claimed by T008 to T010 in the text and by each host's tests; scenario 5 by T024. User Story 2's scenarios are T008 (1) and T019 (2).

## Dependencies and order

- T001, then Phase 2 (T002 to T005 and T007 in order, one file; T006 beside them). Phases 3 and 4 then; within them, the edits of `DISL-specification.md` run in order, T012 to T014 and T020 in parallel, T015 after T014, T017 before T018, T021 before T023. Phase 5 closes the etalii.adp pull request.
- Once it is merged, Phases 6 to 9 in parallel, one repository each; within each, vendor, then tests, then code, then the pull request. In Phase 6, the client tasks T032 and T033 can run beside the backend tasks T029 to T031.
- MVP: Phases 1 to 5 make the rule specified and checkable; Phase 6 removes the known disagreement (SC-004's `DependsOn`); Phases 7 to 9 keep every host conforming.

## Parallel example: after the etalii.adp merge

```text
Standalone:  T028 → T029 → T030 → T031   and   T032 → T033   → T034
VS Code:     T035 → T036 → T037 → T038
Notion:      T039 → T040 → T041
Desktop:     T042 → T043 → T044 → T045 → T046
```

## Forks

- **F1. Does the validator derive the example's findings?** (T015, T017)
  - **A (recommended, planned above)**: no. `service-calls.findings.json` is validated against `$defs/ValidatorOutput`, and its content is checked by the hosts' tests (T029, T036, T039, T043), which build the model and compare. Nothing in Python reimplements `std.endpoints` (principle V).
  - **B**: the validator reads `service-calls.did` against `service-calls.dis` and computes the `selfLoop` and `parallel` findings of `std.endpoints`, failing when they differ from the file: the document checks itself here, at the cost of a second interpreter of that built-in.
  - **Other.**
- **F2. What does the standalone client do with a widening or a conflict?** (T032, T033)
  - **A (recommended, planned above)**: it inherits along C3 and refuses with `fail(...)`, as it refuses what it cannot draw unambiguously; the backend reports the same specification as an error, so the two never draw different tools.
  - **B**: it inherits along C3 only and leaves the checks to the backend, which loads the same `.dis`; smaller, but a client compiled from a refused specification still draws one of the two readings.
  - **Other.**
- **F3. The desktop host's `allowSelfLoops` default of `true`** (T044). The spec records that defect for the standalone backend, where it is fixed (`21cab799b`); the desktop host still has it.
  - **A (recommended, planned above)**: correct it in T044: the same function reads the flag, and T043's tests cannot pass while it stands.
  - **B**: correct it in a pull request of its own first, under spec 030, and let T044 depend on it.
  - **Other.**
