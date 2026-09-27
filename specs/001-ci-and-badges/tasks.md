# Tasks: A Build Workflow and Status Badge for Every Repository

**Input**: [plan.md](plan.md), [ci-and-badges.spec.md](ci-and-badges.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

> **Scale note**: 30 tasks across six repositories and the `.github` profile. Paths are prefixed with their repository. Each repository's changes go to `develop` in one pull request, so tasks in different phases that touch the same repository still ship together; what matters here is that no file has two owners. The tables (Phase 5) need the workflows merged and run on `develop` first.

## Phase 1: Setup

**Wave 1: independent (different repositories):**

- [x] **T001** [P] Scan every private repository's full history for secrets and list vendored files with their licences (research R9) · scratchpad scan only
- [x] **T002** Make `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` public on Peter's instruction (FR-001) · repository settings

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2: independent (different repositories):**

- [x] **T003** [P] Add the Apache License 2.0 text (FR-020) · `etalii.adp/LICENSE`
- [x] **T004** [P] Add the Apache License 2.0 text (FR-020) · `etalii.adp.ide.standalone/LICENSE`
- [x] **T005** [P] Add the Apache License 2.0 text (FR-020) · `etalii.adp.ide.vscode/LICENSE`
- [x] **T006** [P] Add the Apache License 2.0 text (FR-020) · `etalii.adp.ide.eclipse/LICENSE`

## Phase 2: Foundational

No shared code: every workflow is its own file and follows [contracts/build-workflow.md](contracts/build-workflow.md). Nothing blocks the story phases beyond Phase 1.

## Phase 3: User Story 1 - Every pull request in every repository gets a result (P1)

Files: `etalii.adp/.github/workflows/build.yml`, `etalii.adp/.github/scripts/validate-examples.py`, `etalii.adp.ide.standalone/.github/workflows/build.yml`, `etalii.adp.ide.intellij/.github/workflows/build.yml`, `etalii.adp.site/.github/workflows/build.yml` (from `ci.yml`), `etalii.adp.site/.github/workflows/deploy.yml`, `etalii.adp.site/.github/workflows/auto-assign.yml`

**Goal**: four repositories run "Build" on pull requests and `develop`, on hosted runners. VS Code and Eclipse get theirs in Phase 6.
**Independent Test**: a pull request in each repository shows a Build result; a deliberately broken DEDL example fails `etalii.adp`'s run naming the file.

### Implementation

**Wave 1: independent (different files):**

- [x] **T007** [P] [US1] Write the example validator: resolve each example's `$schema` fragment against the local schema, validate with Draft 2020-12, name every invalid file (R3) · `etalii.adp/.github/scripts/validate-examples.py`
- [x] **T008** [P] [US1] Remove `RUNS_ON` from both jobs and its comment; `runs-on: ubuntu-latest` (R7, FR-008) · `etalii.adp.ide.standalone/.github/workflows/build.yml`
- [x] **T009** [P] [US1] New Build workflow: JDK 25, Gradle cache, `xvfb-run ./gradlew build`, upload the plug-in zip (R6) · `etalii.adp.ide.intellij/.github/workflows/build.yml`
- [x] **T010** [P] [US1] Rename `ci.yml` to `build.yml`, name it Build, add `push` to `develop` and `workflow_dispatch`, `runs-on: ubuntu-latest` (R2, R7) · `etalii.adp.site/.github/workflows/build.yml`
- [x] **T011** [P] [US1] Replace `RUNS_ON` with `ubuntu-latest` (R7) · `etalii.adp.site/.github/workflows/deploy.yml`, `etalii.adp.site/.github/workflows/auto-assign.yml`

**⟶ Wait for Wave 1 to finish, then:**

- [x] **T012** [US1] New Build workflow running the validator on Python 3 with `jsonschema` (FR-004, FR-005) · `etalii.adp/.github/workflows/build.yml`

**Checkpoint**: four repositories show a Build result on their pull requests.

## Phase 4: User Story 2 - Each readme shows its repository's status (P1)

Files: `etalii.adp/README.md`, `etalii.adp.ide.standalone/readme.md`, `etalii.adp.ide.intellij/README.md`, `etalii.adp.ide.vscode/README.md`, `etalii.adp.ide.eclipse/README.md`, `etalii.adp.site/README.md`

**Goal**: every readme carries the badge from [contracts/badge.md](contracts/badge.md).
**Independent Test**: signed out, each repository's front page shows its badge for `develop`.

### Implementation

**Wave 1: independent (different files):**

- [x] **T013** [P] [US2] New readme: name, one-line purpose, badge, licence line (FR-013) · `etalii.adp/README.md`
- [x] **T014** [P] [US2] Pin the existing badge to `develop` (FR-012) · `etalii.adp.ide.standalone/readme.md`
- [x] **T015** [P] [US2] Add the badge under the heading (FR-012) · `etalii.adp.ide.intellij/README.md`
- [x] **T016** [P] [US2] New readme: name, one-line purpose, badge, licence line (FR-013) · `etalii.adp.ide.vscode/README.md`
- [x] **T017** [P] [US2] New readme: name, one-line purpose, badge, licence line (FR-013) · `etalii.adp.ide.eclipse/README.md`
- [x] **T018** [P] [US2] Add the badge under the heading (FR-012) · `etalii.adp.site/README.md`

**Checkpoint**: every readme shows a loading badge.

## Phase 5: User Story 3 - The organization-wide tables agree with the repositories (P1)

Files: `.github/profile/README.md`, `etalii.adp.site/src/data/builds.ts`

**Goal**: both tables show six badges, no N/A, no broken images.
**Independent Test**: signed out, each row matches its readme's badge (SC-004).

### Implementation

**Wave 1: independent (different repositories), after Phases 3, 4 and 6 are merged and have run on `develop`:**

- [x] **T019** [P] [US3] Six rows, each with the contract badge (FR-014 to FR-016) · `.github/profile/README.md`
- [x] **T020** [P] [US3] Every repository `public: true`, `workflow: 'build.yml'`, after site PR #14 merges (FR-014 to FR-016) · `etalii.adp.site/src/data/builds.ts`

**Checkpoint**: both tables agree with the readmes.

## Phase 6: User Story 4 - Plug-in downloads are ready for VS Code and Eclipse (P2)

Files: `etalii.adp.ide.vscode/.github/workflows/build.yml`, `etalii.adp.ide.eclipse/.github/workflows/build.yml`

**Goal**: Build checks the files these repositories hold and carries a `plugin` job that skips with a notice until there is plug-in code. These workflows also deliver US1 for these two repositories.
**Independent Test**: a run shows the checks passing and the plug-in step skipped with "No plug-in code yet: nothing to build."

### Implementation

**Wave 1: independent (different files):**

- [x] **T021** [P] [US4] Build workflow: `check` job (`check-files.py`: JSON and YAML parse, markdown links) and `plugin` job keyed on `package.json`, packaging a `.vsix` (R4, R5, FR-009 to FR-011) · `etalii.adp.ide.vscode/.github/workflows/build.yml`
- [x] **T022** [P] [US4] Build workflow: `check` job and `plugin` job keyed on `pom.xml`, packaging the update-site zip (R4, R5, FR-009 to FR-011) · `etalii.adp.ide.eclipse/.github/workflows/build.yml`

**Checkpoint**: both repositories pass Build with the plug-in step visibly skipped.

## Phase 7: User Story 5 - A new repository starts with its workflow and badge (P3)

Files: `etalii.adp/docs/new-repository.md`

- [x] **T023** [US5] Require public, Apache-2.0 `LICENSE`, `build.yml` named Build from the first pull request, the contract badge in the readme, and a row in both tables (FR-018) · `etalii.adp/docs/new-repository.md`

**Checkpoint**: the checklist names every place this feature covers.

## Phase 8: Polish

Files: `etalii.adp/.specify/memory/constitution.md`

**Wave 1: independent (different files):**

- [x] **T024** [P] Amend the Development Workflow sentence about CI through `/speckit-constitution`, PATCH bump (FR-019) · `etalii.adp/.specify/memory/constitution.md`
- [x] **T025** [P] Run `actionlint` on every new or changed workflow file · all `build.yml`, `deploy.yml`, `auto-assign.yml`

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T026** Open one pull request per repository into `develop` (six, plus `.github` for T019), and see each Build run pass on hosted runners (SC-001, SC-005)
- [ ] **T027** Break one example in a throwaway `etalii.adp` pull request and confirm Build fails naming it; close without merging (US1 scenario 4)

**⟶ Wait for the pull requests to merge, then:**

- [ ] **T028** Signed out, check all six readmes and both tables: every badge loads and matches the contract (SC-002 to SC-004)
- [ ] **T029** Confirm the VS Code and Eclipse runs show the plug-in step skipped with its notice (SC-006)
- [ ] **T030** Validate against Success Criteria SC-001 to SC-007 and record the outcome

## Dependencies & Execution Order

- Setup (T001 to T006) → Phases 3, 4, 6 and 7 in parallel → Phase 5 (needs the workflows merged and run on `develop`, and site PR #14) → Polish.
- Phase 3: T007 to T011 in parallel, then T012.
- Phases 4 and 6: one wave each, all parallel.
- Phase 5: T019 and T020 in parallel.
- Polish: T024 and T025, then T026 and T027, then T028 to T030 after merges.
