# Tasks: An Insert Writes a Constant

**Input**: [fbl-insert-constant.spec.md](fbl-insert-constant.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

Paths carry their repository as prefix: `etalii.adp/...` and `etalii.adp.ide.standalone/...`, the clones side by side. Each repository gets its own branch `features/033-fbl-insert-constant` and its own pull request; the etalii.adp one merges first, and a task of `etalii.adp.ide.standalone` is ticked here only once that repository's pull request is merged.

Every etalii.adp task is checked by `python .github/scripts/validate-examples.py`, `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`, each exit code captured. Every standalone task is checked by that repository's four gates and by `bash .github/tools/inspect/inspect.sh` (constitution principle VI), and every test there is seen to fail before the code it covers.

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

## Phase 4: User Story 3, a host can be checked against it (P3)

**Goal**: the standalone FBL library writes the constant as the fixtures state, and the conversion that waits on it can start.
**Independent test**: the vendored `insert-constant-*` fixtures run green in `EtAlii.Adp.Specification.Fbl.Tests`, and each new test failed before the library change.

These tasks start once the etalii.adp pull request of Phases 1 to 3 is merged, in a worktree of `etalii.adp.ide.standalone` on `features/033-fbl-insert-constant` with `git config --worktree user.name "agent-<N>-fbl-insert-constant"`.

- [ ] T016 [US3] Vendor the four `insert-constant-*` fixture folders from the merged etalii.adp commit into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/fixtures/`, unchanged, and record them, the commit and why in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/readme.md`; add each new extension to `.gitattributes` there only if its existing rules under `Conformance/` do not already keep it as written. Run them and see the two add fixtures fail.
- [ ] T017 [US3] Write `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Planning/InsertConstant.Tests.cs` and add cases to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Loading/Loading.Tests.cs`, each seen to fail first: a constant at its place in `keys` and after them; a string that is not plain-safe; a number and a bool written as their JSON type in json and yaml; a set that leaves the constant; the refusals of T012 (a writable slot on the key, `id.from` on the key, a `lines` body, with `emit`) and the read-only binding that is not refused.
- [ ] T018 [US3] Implement the constant in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/FblModelTypes.cs` (`InsertSettings.Constant`, in member order), `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/BindingReader.cs` (read `constant`), `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Documents/BindingChecker.cs` (the checks of T012) and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Rules/FamilyReader.cs` (`InsertValues` yields the constants by research R2). In `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Json/JsonFamily.cs` and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/Files/Yaml/YamlFamily.cs`, write a constant's value as its JSON type: today a value with no binding is written as a string (`JsonFamily`, the `v.Binding is null` branch). Leave the minor version `FblDocumentLoader.cs` declares as it is (research R9). T016's fixtures and T017's tests pass; the four gates and `inspect.sh` exit zero, each by its captured exit code.
- [ ] T019 [US3] Open the standalone pull request into `develop`, its description linking `specs/033-fbl-insert-constant/` in etalii.adp and naming the etalii.adp commit these tasks were taken from; tick T016 to T018 here once it is merged.
- [ ] T020 [US3] In `etalii.adp.ide.standalone/.spec-workflow/specs/functional-decomposition-graph-disl-fbl/` (`tasks.md` task 9 and its L6 bullet, `design.md` row L6 and the waits table), say that the constant is in the library by this feature and task 9 no longer waits: a small amendment, sent to the Scrum master as a selection and applied by that specification's owner (SC-005).

## Phase 5: Polish

- [ ] T021 Confirm that no file under `etalii.adp/specifications/disl/`, `etalii.adp/specifications/desl/` or `etalii.adp/specifications/did/` changed, and that `persistence.typeMap` is untouched (FR-013).
- [ ] T022 Copy every `insert` object of the binding draft in the appendix of `etalii.adp.ide.standalone/.spec-workflow/specs/functional-decomposition-graph-disl-fbl/requirements.md` into a scratch FBL 0.8 document and validate it against T007's schema: the draft's `constant` is valid FBL (SC-002). Nothing of the scratch document is committed.
- [ ] T023 Run the three etalii.adp checks; confirm that every existing example and fixture keeps its result (SC-004), and read section 6.2 alone against `insert-constant-yaml` to say which bytes each add writes (SC-001).
- [ ] T024 Run the coverage diff: every FR and SC of the specification against the requirement references of these tasks, then read two traces back to their artefacts and ask whether the evidence is that criterion's. Open the etalii.adp pull request into `develop`.

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
| FR-013 | T021 |
| SC-001 | T023 |
| SC-002 | T022 |
| SC-003 | T011 |
| SC-004 | T023 |
| SC-005 | T020 |

## Dependencies and order

- T001 and T002 first; Phases 2 and 3 then in either order, except that T013's fixture check (T015) uses T008.
- T008 and T009 in parallel; T010 after both; T011 after T008.
- Phase 4 after the etalii.adp pull request is merged: T016, then T017, then T018, then T019; T020 after T019 is merged.
- MVP: Phases 1 and 2 make the construct specified and checkable; Phase 3 makes a wrong binding refused; Phase 4 is the one host whose tool needs it.

## After this feature, in other repositories

Not tasks of this feature (research R9); listed so that they are not lost.

- `etalii.adp.ide.vscode`: `src/core/fbl/documents/types.ts`, `src/core/fbl/documents/documentLoader.ts`, `src/core/fbl/families/yaml/yamlFamily.ts`, `src/core/fbl/families/json/jsonFamily.ts`, with the fixtures vendored into `fixtures/fbl/conformance/` and `fixtures/fbl/manifest.json`, when that host catches up to FBL 0.7 or a tool of it needs the constant.
- `etalii.adp.ide.notion`: nothing to edit; `node scripts/sync-fbl.mjs` refreshes `src/fbl/` and its `PROVENANCE.md` once Visual Studio Code has it.
- `etalii.adp.ide.intellij`: `fbl/src/main/java/etalii/adp/fbl/document/InsertSettings.java`, `BindingReader.java`, `BindingChecker.java` and the yaml and json families under `fbl/src/main/java/etalii/adp/fbl/family/`, with the fixtures in `fbl/testdata/conformance/` and its `SHA256SUMS`, when a tool of that host needs it.

## Forks

One choice in this plan is the maintainer's (research R9), with the recommended option taken until ruled otherwise:

- **A (recommended, planned above)**: etalii.adp and the standalone library now; the conversion's task 9 L6 takes the constant as given (T020). One library change, planned beside the fixtures that define it.
- **B**: every host now, Visual Studio Code, Notion (copy) and IntelliJ too. Three more pull requests and no tool that uses them; Visual Studio Code and IntelliJ would implement an 0.8 construct while 0.7 is missing.
- **C**: etalii.adp only, as specs 015 and 026 did; the library stays with the conversion's task 9 (L6). Phase 4 is dropped, and T020 is not needed.
- **Other.**
