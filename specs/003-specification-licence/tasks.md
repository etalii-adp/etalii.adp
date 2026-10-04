# Tasks: Specification Licence

**Input**: design documents in `specs/003-specification-licence/` (spec, plan, research, data-model, contracts, quickstart).
**Tests**: the spec asks for deliberate faults that the Build workflow must catch (User Story 3, SC-004); they are run in the story that introduces the check. No other test tasks.

## Phase 1: Setup

- [X] T001 Record the baseline before any change: `python .github/scripts/validate-examples.py` exits 0, and `gh api "repos/etalii-adp/etalii.adp/license?ref=develop" --jq .license.spdx_id` gives `Apache-2.0`; confirm `LICENSE` has the single line `Copyright © Peter Vrenken 2026` (research R1). `LICENSE` is not edited by any task.

## Phase 2: Foundational

- [X] T002 Create `.github/scripts/licence-check.py` (Python standard library only, no arguments, no network) with the frame of contracts/licence-check.md: the repository root two folders up from the script, a docstring saying what it checks and why, `ok   <path>` and `FAIL <path>: <cause>` lines with paths relative to the root and forward slashes, every failure reported rather than only the first, the summary line `<n> specification document(s), <m> failure(s).`, exit code 0 only when nothing failed and at least one specification document was found

**Checkpoint**: the script runs and exits 1 with `0 specification document(s)`, because it checks nothing yet.

## Phase 3: User Story 1 - the site can publish every version with its licence and copyright (P1) 🎯 MVP

**Goal**: the repository licence stays in the form the site's refresh recognises: `Apache-2.0` for GitHub, `Copyright © Peter Vrenken 2026` for the copyright holder.
**Independent test**: the script prints `ok   LICENSE: Apache-2.0, Copyright © Peter Vrenken 2026`, and `LICENSE` is the file GitHub identifies as `Apache-2.0` on `develop`, unchanged.

- [X] T003 [US1] Add checks 1 to 3 of contracts/licence-check.md to `.github/scripts/licence-check.py`: `LICENSE` exists at the root (`FAIL LICENSE: missing`); its text up to and including `END OF TERMS AND CONDITIONS`, runs of whitespace collapsed, has the SHA-256 pinned in the script, computed once from `LICENSE` at `3396177`, which GitHub identifies as `Apache-2.0` (`FAIL LICENSE: its terms are not the Apache License 2.0`); it has "exactly one line beginning with `Copyright ` and free of `[…]` placeholders", reading `Copyright © Peter Vrenken 2026` with © as U+00A9 (`FAIL LICENSE: expected one copyright line, 'Copyright © Peter Vrenken 2026', found <what was found>`). The file is read as UTF-8
- [X] T004 [US1] Add check 4 to `.github/scripts/licence-check.py`: from `git ls-files`, any tracked file other than the root `LICENSE` whose name starts with `LICENSE`, `LICENCE`, `COPYING` or `UNLICENSE` (any case) at the root or anywhere under `specifications/` fails with `FAIL <path>: a second licence file; the repository keeps one, LICENSE at its root`; `.specify/extensions/companion/LICENSE` is outside both places and passes (research R5)
- [X] T005 [US1] Verify User Story 1 on the branch: run `.github/scripts/licence-check.py` and see the line `ok   LICENSE: Apache-2.0, Copyright © Peter Vrenken 2026`, and confirm `git diff develop -- LICENSE` is empty, so what GitHub and the site read is what T001 recorded

**Checkpoint**: the licence file is guarded; nothing the site reads has changed.

## Phase 4: User Story 2 - a reader of a specification sees its licence in the document (P2)

**Goal**: each of the seven specification documents states the licence in its header table.
**Independent test**: open each document and find the `Licence` row, naming Apache License 2.0, giving `Apache-2.0` and linking the repository's `LICENSE`.

The row, from contracts/licence-statement.md, added as the last row of the header table, cells padded to the column widths where the table is aligned; no version or `Date` row changes (research R3):

```markdown
| Licence | [Apache License 2.0](https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE) (`Apache-2.0`) |
```

- [X] T006 [P] [US2] Add the `Licence` row after `File extension` in the header table of `specifications/disl/DISL-specification.md`
- [X] T007 [P] [US2] Add the `Licence` row after `File extension` in the header table of `specifications/did/DID-specification.md`
- [X] T008 [P] [US2] Add the `Licence` row after `File extension` in the header table of `specifications/fbl/FBL-specification.md`
- [X] T009 [P] [US2] Add the `Licence` row after `Schema` in the header table of the placeholder `specifications/desl/DESL-specification.md`
- [X] T010 [P] [US2] Add the `Licence` row after `Schema` in the header table of the placeholder `specifications/ded/DED-specification.md`
- [X] T011 [P] [US2] Add the `Licence` row after `Schema` in the header table of the placeholder `specifications/edsl/EDSL-specification.md`
- [X] T012 [P] [US2] Add the `Licence` row after `Schema` in the header table of the placeholder `specifications/edd/EDD-specification.md`

**Checkpoint**: seven documents state the licence; `python .github/scripts/validate-examples.py` still exits 0.

## Phase 5: User Story 3 - a missing or wrong licence statement is caught before it reaches `develop` (P3)

**Goal**: the Build workflow fails a pull request whose specification document lacks the statement or names another licence, and names the document.
**Independent test**: the faults of quickstart section 2, each failing the check with its cause.

- [X] T013 [US3] Add checks 5 and 6 to `.github/scripts/licence-check.py`: every folder directly under `specifications/` must hold `<NAME>-specification.md`, `<NAME>` being the folder name in capitals (`FAIL specifications/<name>: no <NAME>-specification.md`), with no list of languages in the script; in each such document, the first table must have exactly one row whose first cell is exactly `Licence` (`no Licence row in its header table`, `more than one Licence row in its header table`), whose value gives the SPDX id in code form equal to `Apache-2.0` (`states <found>, the repository's licence is Apache-2.0`, `<found>` being the id given or `no SPDX id`), names `Apache License 2.0` (`the Licence row does not name the Apache License 2.0`) and links `https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE` (`the Licence row does not link <address>`); one `ok   <document>` line per passing document
- [X] T014 [US3] Add the `licence` job to `.github/workflows/build.yml` as contracts/licence-check.md gives it (checkout, Python 3.13, `python .github/scripts/licence-check.py`), on the same events as the `examples` job, and say in the file's header comment what the job checks (spec 003)
- [X] T015 [US3] Run the faults of `specs/003-specification-licence/quickstart.md` section 2 in the working copy, reverting each with `git restore` (and removing the added files): the `Licence` row deleted from `specifications/desl/DESL-specification.md`; `` `Apache-2.0` `` changed to `` `MIT` `` in `specifications/did/DID-specification.md`; a paragraph of the terms deleted from `LICENSE`; a staged copy of `LICENSE` at `specifications/disl/LICENSE`; a new `specifications/xyz/XYZ-specification.md` with the row, which must pass without any other change. Each failure must read as the quickstart expects; `git status` is clean afterwards

**Checkpoint**: the check passes on the branch with seven `ok` documents and fails for each fault.

## Phase 6: Polish

- [X] T016 Amend the constitution through `/speckit-constitution` in `.specify/memory/constitution.md`, 1.2.0 → 1.3.0 (MINOR) with its Sync Impact Report (research R6): Structure and Naming gains that a specification document states the repository's licence in its header table, placeholders included, and that the repository keeps one licence file, at its root; the Build bullet of Development Workflow gains that the workflow also checks each specification's licence statement and the licence file (spec 003-specification-licence)
- [X] T017 [P] Add to "Writing specifications" in `CLAUDE.md`: every specification document carries the `Licence` row in its header table, and `python .github/scripts/licence-check.py` checks the rows and the licence file, run by the Build workflow on every pull request
- [X] T018 [P] Extend the `LICENSE` bullet in `docs/new-repository.md`: the appendix's copyright line is filled in as `Copyright © Peter Vrenken 2026`, not left as the template, so the site can record it
- [X] T019 Run `specs/003-specification-licence/quickstart.md` sections 1 and 3: `licence-check.py` prints seven `ok` documents and exits 0 (SC-001); `validate-examples.py` and `terminology-check.py --name etalii.adp` exit 0; follow the `Licence` link of one working draft and one placeholder
- [ ] T020 Push `features/003-specification-licence`, open the pull request into `develop`, and confirm the Build workflow's `examples`, `terminology` and `licence` jobs pass on it (SC-005), and that `gh api "repos/etalii-adp/etalii.adp/license?ref=features/003-specification-licence" --jq .license.spdx_id` gives `Apache-2.0` (quickstart section 4, first command)
- [ ] T021 After the merge, run `specs/003-specification-licence/quickstart.md` sections 4 and 5: GitHub gives `Apache-2.0` for `develop` (SC-003); in `etalii.adp.site`, `npm run reference:refresh -- disl --dry-run` and `-- did --dry-run` report `Licence: Apache-2.0` and refuse nothing, the copyright line reads `Copyright © Peter Vrenken 2026`, and the header table with its `Licence` row is in the first section of each (SC-002; User Story 2, scenario 3); commit nothing in `etalii.adp.site` (FR-008)

## Dependencies

- T002 before T003, T004 and T013: they all edit `.github/scripts/licence-check.py`, in that order.
- User Story 1 (T003 to T005) depends only on T002.
- User Story 2 (T006 to T012) depends on nothing; the seven tasks touch seven files.
- User Story 3: T013 after T004 (same file); T014 after T013; T015 after T013 and after T006 to T012, because the faults start from a passing check.
- T016 to T018 depend on nothing but belong with the check they describe; T019 after everything before it; T020 after T019; T021 after the pull request is merged.

## Parallel opportunities

- T006 to T012 together, and alongside T003 and T004.
- T017 and T018 together, alongside T016.

## Implementation strategy

- **MVP**: phases 1 to 3. The licence file the site reads is guarded; this alone keeps the site able to publish.
- **Then** User Story 2, the visible change for readers, and User Story 3, which keeps both true.
- One pull request delivers all of it; T021 is the only task after the merge.

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T001, T003, T004, T005, T020, T021 |
| FR-002 | T001, T003, T021 |
| FR-003 | T006 to T012 |
| FR-004 | T006 to T012, T013 |
| FR-005 | T013, T014, T015 |
| FR-006 | T003, T004, T014, T015 |
| FR-007 | T016, T017, T018 |
| FR-008 | T021 (nothing is changed or committed in `etalii.adp.site`) |
| SC-001 | T019 |
| SC-002, SC-003 | T021 |
| SC-004 | T015 |
| SC-005 | T020 |
