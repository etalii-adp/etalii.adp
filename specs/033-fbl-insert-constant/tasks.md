# Tasks: An Insert Writes a Constant

**Input**: [fbl-insert-constant.spec.md](fbl-insert-constant.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

Paths carry their repository as prefix: `etalii.adp/...`, `etalii.adp.ide.standalone/...`, `etalii.adp.ide.vscode/...`, `etalii.adp.ide.intellij/...` and `etalii.adp.ide.notion/...`, the clones side by side. Each repository gets its own branch `features/033-fbl-insert-constant` and its own pull request, whose description links `specs/033-fbl-insert-constant/` here and names the etalii.adp commit its tasks were taken from. The etalii.adp one merges first; Visual Studio Code's before Notion's. A task of another repository is ticked here only once that repository's pull request is merged (the maintainer's ruling "Approve, all hosts", 2026-10-22, puts every host in this feature).

Every etalii.adp task is checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`, each exit code captured. Every standalone task is checked by that repository's four gates and by `bash .github/tools/inspect/inspect.sh` (constitution principle VI); every Visual Studio Code task by `npm run check` and `npm run test:unit`, and `npm run test:vscode` (a real Visual Studio Code) where the container can run it; every IntelliJ task by `./gradlew build`; every Notion task by `npm test`, `npm run lint`, `npm run typecheck`, `node scripts/sync-fbl.mjs --check` and `node scripts/build.mjs --out <dir>` with `node scripts/check-tree.mjs <dir>`. In every host, a test is seen to fail before the code it covers, and a gate the container cannot run is named as not run and left to that repository's CI.

## Phase 1: Foundational, the version

- [ ] T001 Make `etalii.adp/specifications/fbl/FBL-specification.md` 0.8: the header's version and date, the status paragraph (FBL 0.8, 2026-10-22, spec 033, for the functional decomposition graph: `constant` on an insert of the yaml and json families; every valid 0.7 document is a valid 0.8 document with the same meaning), and section 2.7's list of versions (FR-012).
- [ ] T002 Add `"0.8"` to the `fbl` enum of `etalii.adp/specifications/fbl/fbl.schema.json`, and 0.8 to that property's description (FR-012).

## Phase 2: User Story 1, a new entry carries the value that chose its rule (P1)

**Goal**: an insert with a constant writes it, where and as FBL says, and the entry reads back by its rule.
**Independent test**: the four `insert-constant-*` fixtures replay, and the `-read` bodies are the bodies the adds wrote.

- [ ] T003 [US1] In section 6.2 of `etalii.adp/specifications/fbl/FBL-specification.md`, add the `constant` row to the Insert table: a map from a key of the new entry to a scalar, *(FBL 0.8)* yaml and json only and not with `emit`; and extend the `keys` row with the order of research R2: a constant whose key `keys` names at that place, the others after the entry's other keys in the member order of `constant`, before `skeleton` (FR-001, FR-003, FR-008).
- [ ] T004 [US1] In the same section, say that the constants are written in the entry's one `insert-entry` splice, each value as section 6.3 writes a new value of its JSON type with the binding's `text` defaults and no attribute options (R3), and that a constant takes no part in reading: `when` alone decides the match (FR-002, FR-004, FR-009).
- [ ] T005 [US1] In section 6.4, say that no edit but the add that creates the entry writes a constant (a set, a move, a rename and a reference rewrite leave its key and value as they are; a remove removes it with the entry), and that a retype's add under the new rule writes that rule's constants (FR-005, FR-010).
- [ ] T006 [US1] In section 5.2, after the sentence that a `fixed` DISL attribute **MUST NOT** be bound, say that a value of the file's layout that no attribute holds is written with an insert's `constant` (section 6.2) (FR-007).
- [ ] T007 [US1] Add `constant` to `$defs/Insert` of `etalii.adp/specifications/fbl/fbl.schema.json`, its exclusion of `emit`, and the condition on `$defs/Binding` that refuses it outside yaml and json, as `contracts/insert-constant.schema.md` gives them (FR-001, FR-008).
- [ ] T008 [P] [US1] Add `etalii.adp/specifications/fbl/fixtures/insert-constant-yaml/` (`board.fbl`, `board.yaml`, `fixture.json`), CRLF, with the rules and steps of research R8: the task add, the note add, the set of the new task's name, and the undo and redo of the first add (FR-002 to FR-005, FR-011).
- [ ] T009 [P] [US1] Add `etalii.adp/specifications/fbl/fixtures/insert-constant-json/`, the same binding in the json family and the same steps, the new entries with the same keys in the same order as T008's (FR-011).
- [ ] T010 [US1] Add `etalii.adp/specifications/fbl/fixtures/insert-constant-yaml-read/` and `etalii.adp/specifications/fbl/fixtures/insert-constant-json-read/`: each body byte for byte the document the last step of T008 or T009 expects (compare with `cmp`), each `read` naming every element with its type and attributes, the new ones read by the rules that added them (FR-009).
- [ ] T011 [US1] See the validator fail on a planted wrong offset in `insert-constant-yaml/fixture.json` and on `emit` beside `constant` in its binding, and pass again when each is restored (SC-003).

## Phase 3: User Story 2, a binding that misuses a constant is refused when it is loaded (P2)

**Goal**: section 14.1 and the validator refuse a constant on a key the rule writes, or in a family without keys.
**Independent test**: `refused/insert-constant-collision.fbl` is reported refused; made read-only, it is accepted and the run fails.

- [ ] T012 [US2] In step 6 of section 14.1 of `etalii.adp/specifications/fbl/FBL-specification.md`, add the two checks of data-model.md *Validation*: a constant's key is not the key of a `{key}` slot without `child` that the rule writes (a writable attribute binding, `id.from`, `source`, `target`), and a constant stands only on a binding whose body is `yaml` or `json`; a read-only attribute binding may read the key (FR-006, FR-008).
- [ ] T013 [US2] In `etalii.adp/.github/scripts/validate-examples.py`, add the collision check of T012 (the family is the schema's, T007) to the checks it makes of every `*.fbl` that validates, and the folder `specifications/fbl/refused/`: every document there must validate against the schema and fail a check of section 14.1; print its refusal, and fail the run when one is accepted or refused by the schema instead (research R7). Update the module's docstring to say so.
- [ ] T014 [US2] Add `etalii.adp/specifications/fbl/refused/README.md` (what the folder is, the validator's contract of `contracts/fixtures.md`) and `etalii.adp/specifications/fbl/refused/insert-constant-collision.fbl`: a yaml binding with one rule whose `constant` key `type` is bound by a writable attribute, and one whose `type` is read by a read-only attribute, its `doc` naming the check it fails (FR-006, FR-011).
- [ ] T015 [US2] See the validator fail when the colliding attribute in T014 is made read-only, and when a copy of T008's binding declares a `lines` body (the schema refuses it), and pass again when each is restored (FR-006, FR-008).

## Phase 4: Closing the etalii.adp change

- [ ] T016 Confirm that no file under `etalii.adp/specifications/disl/`, `etalii.adp/specifications/desl/` or `etalii.adp/specifications/did/` changed, and that `persistence.typeMap` is untouched (FR-013).
- [ ] T017 Copy every `insert` object of the binding draft in the appendix of `etalii.adp.ide.standalone/.spec-workflow/specs/functional-decomposition-graph-disl-fbl/requirements.md` into a scratch FBL 0.8 document and validate it against T007's schema: the draft's `constant` is valid FBL (SC-002). Nothing of the scratch document is committed.
- [ ] T018 Run the three etalii.adp checks; confirm that every existing example and fixture keeps its result (SC-004), and read section 6.2 alone against `insert-constant-yaml` to say which bytes each add writes (SC-001).
- [ ] T019 Run the coverage diff: every FR and SC of the specification against the requirement references of these tasks, then read two traces back to their artefacts and ask whether the evidence is that criterion's. Open the etalii.adp pull request into `develop`; tick T001 to T019 in it.

## Phase 5: User Story 3 in etalii.adp.ide.standalone (P3)

**Goal**: the standalone FBL library writes the constant as the fixtures state, and the conversion that waits on it can start.
**Independent test**: the vendored `insert-constant-*` fixtures run green in `EtAlii.Adp.Specification.Fbl.Tests`, the refused binding is refused, and each new test failed before the library change.

From here on, each host starts once the etalii.adp pull request is merged, in a worktree of its repository on `features/033-fbl-insert-constant` with `git config --worktree user.name "agent-<N>-fbl-insert-constant"`.

- [ ] T020 [US3] Vendor the four `insert-constant-*` fixture folders and `refused/insert-constant-collision.fbl` from the merged etalii.adp commit into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/`, unchanged, and record them, the commit and why in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`; add a rule to `.gitattributes` there only if its existing rules under `Conformance/` do not already keep them as written. Run them and see the two add fixtures fail.
- [ ] T021 [US3] Write `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Planning/InsertConstant.Tests.cs` and add cases to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Loading/Loading.Tests.cs`, each seen to fail first: a constant at its place in `keys` and after them; a string that is not plain-safe; a number and a bool written as their JSON type in json and yaml; a set that leaves the constant; the refusals of T012 (a writable slot on the key, `id.from` on the key, a `lines` body, with `emit`), the vendored refused binding, and the read-only binding that is not refused.
- [ ] T022 [US3] Implement the constant in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblModelTypes.cs` (`InsertSettings.Constant`, in member order), `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/BindingReader.cs` (read `constant`), `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/BindingChecker.cs` (the checks of T012) and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Rules/FamilyReader.cs` (`InsertValues` yields the constants by research R2). In `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Json/JsonFamily.cs` and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Yaml/YamlFamily.cs`, write a constant's value as its JSON type: today a value with no binding is written as a string (`JsonFamily`, the `v.Binding is null` branch). Leave the minor version `FblDocumentLoader.cs` declares as it is (research R9). T020's fixtures and T021's tests pass; the four gates and `inspect.sh` exit zero, each by its captured exit code.
- [ ] T023 [US3] Open the standalone pull request into `develop`; tick T020 to T022 here once it is merged.
- [ ] T024 [US3] In `etalii.adp.ide.standalone/.spec-workflow/specs/functional-decomposition-graph-disl-fbl/` (`tasks.md` task 9 and its L6 bullet, `design.md` row L6 and the waits table), say that the constant is in the library by this feature and task 9 no longer waits: a small amendment, sent to the Scrum master as a selection and applied by that specification's owner, once T023 is merged (SC-005).

## Phase 6: User Story 3 in etalii.adp.ide.vscode (P3)

**Goal**: the Visual Studio Code FBL library, and through it the Notion copy, writes the constant as the fixtures state.
**Independent test**: the vendored fixtures run green in `test/core/fbl/conformanceFixtures.test.ts`, the refused binding is refused in `test/core/fbl/loading.test.ts`, and each new test failed first.

This library reads FBL 0.6 (`supportedMinor = 6`). It implements the 0.8 constant only, not what 0.7 added: the constant depends on nothing of 0.7 (research R9). It does not raise `supportedMinor`, so a binding that declares 0.8 still loads with the newer-version warning section 2.7 asks for.

- [ ] T025 [US3] Vendor the four `insert-constant-*` fixture folders and `refused/insert-constant-collision.fbl` from the merged etalii.adp commit into `etalii.adp.ide.vscode/fixtures/fbl/conformance/`, unchanged, recording them under a new source of that commit, with each file's SHA-256, in `etalii.adp.ide.vscode/fixtures/fbl/manifest.json`; the older sources stay at their commits. Run the conformance test and see the two add fixtures fail.
- [ ] T026 [US3] Add to `etalii.adp.ide.vscode/test/core/fbl/planning.test.ts` and `etalii.adp.ide.vscode/test/core/fbl/loading.test.ts` the cases of T021, each seen to fail first.
- [ ] T027 [US3] Implement the constant in `etalii.adp.ide.vscode/src/core/fbl/documents/types.ts` (`constant` on the insert settings), `etalii.adp.ide.vscode/src/core/fbl/documents/documentLoader.ts` (read it, and the checks of T012), `etalii.adp.ide.vscode/src/core/fbl/families/yaml/yamlFamily.ts` and `etalii.adp.ide.vscode/src/core/fbl/families/json/jsonFamily.ts` (a new entry's keys by research R2, each constant written as its JSON type). T025's fixtures and T026's tests pass; `npm run check` and `npm run test:unit` exit zero; `npm run test:vscode`, which needs a real Visual Studio Code, is run if the container can, and otherwise named as left to CI.
- [ ] T028 [US3] Open the Visual Studio Code pull request into `develop`; tick T025 to T027 here once it is merged. It does not touch spec 027's branch.

## Phase 7: User Story 3 in etalii.adp.ide.intellij (P3)

**Goal**: the IntelliJ FBL library writes the constant as the fixtures state.
**Independent test**: the vendored fixtures run green in `ConformanceFixturesTest`, the refused binding is refused in `LoadingTest`, and each new test failed first.

This library reads FBL 0.1 and warns on any newer minor. It implements the 0.8 constant only, not what 0.2 to 0.7 added: the constant depends on none of it, since it uses `keys`, `skeleton`, `emit`, the yaml and json writing of section 6.3 and the one-place rule, all of 0.1. The one later construct the fixtures use is the `attributes` a fixture's `read` states (0.5, section 15.3); the read-back fixtures still prove FR-009 by the element types, which the runner compares today, and the runner compares `attributes` too if T030 shows it can at no cost to the existing corpus (research R9).

- [ ] T029 [US3] Vendor the four `insert-constant-*` fixture folders and `refused/insert-constant-collision.fbl` from the merged etalii.adp commit, unchanged, into `etalii.adp.ide.intellij/fbl/testdata/conformance-0.8/`, with its own `README.md` (source, commit, licence, why it sits apart) and `SHA256SUMS`, so that `fbl/testdata/conformance/`, the whole-corpus copy of FBL 0.1, keeps its rule; extend `CorpusUnchangedTest` and `ConformanceFixturesTest` under `etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/conformance/` to read it. See the two add fixtures fail.
- [ ] T030 [US3] Add the cases of T021 to `etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/document/LoadingTest.java` and a new `etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/plan/InsertConstantTest.java`, each seen to fail first.
- [ ] T031 [US3] Implement the constant in `etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/document/InsertSettings.java`, `etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/document/BindingReader.java`, `etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/document/BindingChecker.java` (the checks of T012), `etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/yaml/YamlFamily.java` and `etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/json/JsonFamily.java` (a new entry's keys by research R2). T029's fixtures and T030's tests pass; `./gradlew build` exits zero, or the gate the container cannot run is named and left to CI.
- [ ] T032 [US3] Open the IntelliJ pull request into `develop`; tick T029 to T031 here once it is merged.

## Phase 8: User Story 3 in etalii.adp.ide.notion (P3)

**Goal**: the Notion add-ons' copy of the FBL library has the constant, refreshed, never edited.
**Independent test**: `node scripts/sync-fbl.mjs --check` passes against the new `PROVENANCE.md`, and the add-ons build and test as before.

- [ ] T033 [US3] After T028 is merged, run `node scripts/sync-fbl.mjs etalii.adp.ide.vscode=<its merge commit>` in `etalii.adp.ide.notion`, which rewrites `etalii.adp.ide.notion/src/fbl/` and `etalii.adp.ide.notion/src/fbl/PROVENANCE.md`; no file under `src/fbl/` is edited by hand. `node scripts/sync-fbl.mjs --check`, `npm test`, `npm run lint`, `npm run typecheck` and `node scripts/build.mjs --out <dir>` with `node scripts/check-tree.mjs <dir>` exit zero.
- [ ] T034 [US3] Open the Notion pull request into `develop`; tick T033 here once it is merged.

## Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T003, T007 |
| FR-002 | T004, T008 |
| FR-003 | T003, T008 |
| FR-004 | T004, T008 |
| FR-005 | T005, T008 |
| FR-006 | T012, T013, T014, T015 |
| FR-007 | T006 |
| FR-008 | T003, T007, T012, T015 |
| FR-009 | T004, T010 |
| FR-010 | T005 |
| FR-011 | T008, T009, T014 |
| FR-012 | T001, T002 |
| FR-013 | T016 |
| SC-001 | T018 |
| SC-002 | T017 |
| SC-003 | T011 |
| SC-004 | T018 |
| SC-005 | T024 |

User Story 3 (a host can be checked against it) is claimed by T020 to T034 in the four hosts; its acceptance scenarios are each host's conformance run of the vendored fixtures.

## Dependencies and order

- T001 and T002 first; Phases 2 and 3 then in either order, except that T015 uses T008. T008 and T009 in parallel; T010 after both; T011 after T008. Phase 4 closes the etalii.adp pull request.
- Once it is merged, Phases 5, 6 and 7 in parallel, one repository each; within each, vendor, then tests, then code, then the pull request. T024 after T023 is merged; Phase 8 after T028 is merged.
- MVP: Phases 1 to 4 make the construct specified and checkable; Phase 5 is the host whose tool needs it; Phases 6 to 8 keep every host conforming.

## Forks

- **How IntelliJ vendors the new fixtures** (T029). Its corpus README says a newer FBL is taken up by copying the whole corpus again, and that library reads 0.1, so a whole copy would bring in the fixtures of 0.2 to 0.7, which it does not pass.
  - **A (recommended, planned above)**: a second folder, `fbl/testdata/conformance-0.8/`, with its own README and `SHA256SUMS`; the 0.1 corpus and its rule stay as they are.
  - **B**: copy the whole corpus at the new commit, and report every fixture the library does not pass as skipped with its reason (that repository's principle IV); the 0.1 corpus rule holds, at the cost of a long skip list.
  - **C**: add the five files to `fbl/testdata/conformance/` and its `SHA256SUMS`, and change its README to allow a partial copy.
  - **Other.**
