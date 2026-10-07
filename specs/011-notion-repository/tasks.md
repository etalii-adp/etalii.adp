# Tasks: A Notion Host Repository, Published at etalii.net/adp-notion

**Input**: [plan.md](plan.md), [notion-repository.spec.md](notion-repository.spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md), [contracts/published-tree.md](contracts/published-tree.md), [contracts/publication.md](contracts/publication.md), [contracts/repository-settings.md](contracts/repository-settings.md)

**Scale note**: 46 tasks over four repositories (`etalii.adp`, `etalii.adp.ide.notion`, `etalii.adp.site`, `.github`), about 25 files, five pull requests and a handful of GitHub settings that are no file. Watch the order: the glossary merges first, the Notion repository's first pull request second, and the site and the profile only after `Build` has run on the Notion repository's `develop`. Seven tasks are a maintainer's and are marked **Maintainer**: the four merges, the deployment token, the Claude project's resources, and the embed in a Notion page.

**Tests**: not requested as tests written first. The build script is checked by the `addons` job of `Build` on every pull request (T024), and the suites run once, in T040.

**Organization**: by user story. The stories are not independent slices: Story 2 publishes what Story 1 builds, and Stories 2 and 3 reach `etalii.net` in the one pull request of the site, which Phase 6 opens.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks of its wave (a different file, no unfinished dependency)
- **[US#]**: the user story of the specification the task serves

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session). The clone of `.github` is the folder `etalii-adp.github`.
- Every repository's work is on a branch named `features/011-notion-repository`, in its own worktree, started from a fetched `origin/develop`. The local clones of the site, `.github` and eclipse are behind.
- **The eclipse source** of every copied file is `origin/develop` of `etalii.adp.ide.eclipse`, read with `git -C ../etalii.adp.ide.eclipse show origin/develop:<path>`, never from its working tree.
- The pull requests: **1** `etalii.adp` (glossary and rules), **2** `etalii.adp.ide.notion`, **3** `etalii.adp.site`, **4** `.github`, **5** `etalii.adp` (the record). Each is merged with a merge commit. The description of 2, 3 and 4 names `specs/011-notion-repository/` and the `etalii.adp` commit its tasks were taken from.

> **Ticking**: a task whose file lands in another repository is ticked only after that repository's pull request is merged (T028 for pull request 2, T043 for 3 and 4), never when the file is written or pushed. Tasks of `etalii.adp` itself, and tasks that are a setting or a check, are ticked when done.

---

## Phase 1: Setup

**Purpose**: the worktrees and the source of the copied files.

**Wave 1 — independent (different repositories):**

- [x] **T001** [P] Fetch `etalii.adp.site` and create a worktree on a new branch `features/011-notion-repository` from `origin/develop`; run `npm ci` there · etalii.adp.site/.claude/worktrees/011-notion-repository
- [x] **T002** [P] Fetch `etalii-adp.github` and create a worktree on a new branch `features/011-notion-repository` from `origin/develop` · etalii-adp.github/.claude/worktrees/011-notion-repository
- [x] **T003** [P] Fetch `etalii.adp.ide.eclipse` and note the commit of its `origin/develop`: it is the eclipse source of T015, T017, T022, T023 and T024 · etalii.adp.ide.eclipse

---

## Phase 2: Foundational (the vocabulary and the rules, pull request 1)

**Purpose**: name Notion as a host in `etalii.adp` and merge it. The terminology job of every other repository reads the glossary from `develop`, so no story starts before T011.

Files: `etalii.adp/docs/terminology.md`, `etalii.adp/docs/new-repository.md`, `etalii.adp/CLAUDE.md`, `etalii.adp/.specify/memory/constitution.md`, `etalii.adp/.specify/memory/repositories/etalii.adp.ide.notion.md`, `etalii.adp/.specify/memory/repositories/etalii.adp.site.md`, `etalii.adp/specs/001-ci-and-badges/contracts/build-workflow.md`

- [x] **T004** Define **Host** as an environment that ADP's tools run in and list Notion with the four; keep **IDE host** for the four that are IDEs; define **Notion add-on** as a web page that shows one tool inside a Notion page; say "the Notion workspace" where the glossary means the workspace that holds the catalogue. Commit it alone, before any commit of T005 to T010 (FR-005, research D8) · etalii.adp/docs/terminology.md

**⟶ Wait for T004 to finish, then:**

**Wave 2 — independent (different files):**

- [x] **T005** [P] Name the Notion host in the name rule and in the Pages rule: `etalii.adp.ide.notion` has no Pages site of its own and is published by the site's `deploy` under `/adp-notion` (FR-006) · etalii.adp/docs/new-repository.md
- [x] **T006** [P] Add `etalii.adp.ide.notion` to the repositories whose features are specified here (FR-006) · etalii.adp/CLAUDE.md
- [x] **T007** [P] Write the Notion repository's principles, version 1.0.0, in the shape of the other principles files: the note on where it is amended, Terminology, the four Core Principles drafted in [data-model.md](data-model.md) (One Source of Truth, Every Address under `/adp-notion`, Truthful About What Exists, Simplicity), constraints, Development Workflow, Governance. RFC 2119 key words in plain capitals, as the other principles files write them (FR-007) · etalii.adp/.specify/memory/repositories/etalii.adp.ide.notion.md
- [x] **T008** [P] Add a row for `etalii.adp.ide.notion` to the per-repository table: checks `check-files.py`, artifact the `addons` job (research D9) · etalii.adp/specs/001-ci-and-badges/contracts/build-workflow.md

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — independent (different files), each through `/speckit-constitution`:**

- [x] **T009** [P] Amend the constitution from 1.5.0 to 1.6.0 (MINOR): the preamble names Notion as a host beside the four IDE hosts, and the list of principles files gains `etalii.adp.ide.notion.md` · etalii.adp/.specify/memory/constitution.md
- [x] **T010** [P] Amend the site's principles from 1.1.0 to 1.2.0 (MINOR): the host list of principle I gains Notion, and the constraint "this repository is the only one involved in `etalii.net`" allows the site's deployment to carry the Notion repository's published tree under `/adp-notion` (plan, Complexity Tracking) · etalii.adp/.specify/memory/repositories/etalii.adp.site.md

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T011** Commit this feature's folder and T005 to T010 on `features/011-notion-repository`, push it and open pull request 1 into `develop`. `Build` passes on it. **Maintainer**: merge it with a merge commit · etalii.adp/specs/011-notion-repository/

**⟶ Wait for T011 to be merged, then:**

- [ ] **T012** Update the Notion page "ADP terminology" to the merged glossary: Host, IDE host, Notion add-on (research D9). It is no file · Notion workspace, page "ADP terminology"

**Checkpoint**: the glossary on `develop` of `etalii.adp` names the Notion host, so the terminology job of the other repositories accepts the terms.

---

## Phase 3: User Story 1 - A contributor can deliver work to the Notion repository (Priority: P1) 🎯 MVP

**Goal**: `etalii.adp.ide.notion` is a regular repository of the organization: its name, its settings, its starting files, and a `Build` that reports on every pull request.

**Independent Test**: walk `docs/new-repository.md` against the repository and tick every rule; open a pull request and see a build result on it.

Files: everything in `etalii.adp.ide.notion/` (`CLAUDE.md`, `README.md`, `LICENSE`, `.gitattributes`, `.gitignore`, `.editorconfig`, `scripts/build.mjs`, `addons/README.md`, `.github/scripts/check-files.py`, `.github/workflows/build.yml`), and the repository's settings on GitHub.

### Implementation

- [ ] **T013** [US1] Rename `etalii-adp/etalii-adp-ide-notion` to `etalii.adp.ide.notion`; create no second repository. Set: merge commits on, squash and rebase off, head branches deleted on merge, wiki off, description with "add-ons". Check that the Claude GitHub app covers it and that `gh repo view etalii-adp/etalii-adp-ide-notion --json name` answers with the new name (FR-001, FR-002, research D10) · GitHub settings of etalii-adp/etalii.adp.ide.notion
- [ ] **T014** [US1] Clone the empty repository beside the others · etalii.adp.ide.notion/

**⟶ Wait for T014 to finish, then:**

**Wave 1 — independent (different files):**

- [ ] **T015** [P] [US1] Write the rules for agents, from the eclipse source's `CLAUDE.md` and adapted: `develop`, feature branches, pull requests only, merge commits, features specified in `etalii.adp`, the glossary's words. It names no tool as available · etalii.adp.ide.notion/CLAUDE.md
- [ ] **T016** [P] [US1] Write the name `etalii.adp.ide.notion`, the build badge on the line after the heading as [the badge contract of spec 001](../001-ci-and-badges/contracts/badge.md) gives it, and what the repository is for: the Notion add-ons, published at `https://etalii.net/adp-notion`, none yet. It is the source of the site's host entry (T032) · etalii.adp.ide.notion/README.md
- [ ] **T017** [P] [US1] Copy from the eclipse source, unchanged: Apache License 2.0 with the line `Copyright © Peter Vrenken 2026`, the `*.sh` LF rule, and the ignore rule for `.claude/settings.local.json` · etalii.adp.ide.notion/LICENSE, etalii.adp.ide.notion/.gitattributes, etalii.adp.ide.notion/.gitignore

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T018** [US1] Commit the five starting files as the first commit on `develop` and push it. It is the one push that is not a pull request: an empty repository has no branch to open one against. Set `develop` as the default branch and read the settings back with `gh api repos/etalii-adp/etalii.adp.ide.notion` (FR-002) · etalii.adp.ide.notion/ (branch `develop`)
- [ ] **T019** [US1] Create a worktree on a new branch `features/011-notion-repository` from `develop` · etalii.adp.ide.notion/.claude/worktrees/011-notion-repository

**⟶ Wait for T019 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T020** [P] [US1] Write the build script, Node with no dependency, to [contracts/published-tree.md](contracts/published-tree.md): `--out <dir>` required and created when missing, nothing written outside it; one `<id>/` per folder under `addons/`, files there ignored; a folder name that does not match `^[a-z0-9]+(-[a-z0-9]+)*$`, is `index`, or has no `index.html` fails the build; `index.html` generated with `id="addons"`, `id="no-addons"` when the list is empty, `id="revision"` holding the 40 characters of `git rev-parse HEAD`, and the name `etalii.adp.ide.notion`; relative links only, no `X-Frame-Options` or `frame-ancestors` meta, no script; exit code 0 only when the whole tree is written (FR-009, FR-010, FR-014) · etalii.adp.ide.notion/scripts/build.mjs
- [ ] **T021** [P] [US1] Say that each add-on is one folder here, named by the id of its tool type, served at `/adp-notion/<id>/`, and that there is none yet (FR-010) · etalii.adp.ide.notion/addons/README.md
- [ ] **T022** [P] [US1] Copy `check-files.py` from the eclipse source (FR-003) · etalii.adp.ide.notion/.github/scripts/check-files.py
- [ ] **T023** [P] [US1] Copy `.editorconfig` from the eclipse source · etalii.adp.ide.notion/.editorconfig

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T024** [US1] Write the workflow named `Build`, to [contracts/publication.md](contracts/publication.md) and the build-workflow contract of spec 001. `check`: `python .github/scripts/check-files.py`. `addons`, after `check`: `node scripts/build.mjs --out <temporary folder>`, failing unless `index.html` is there, holds the commit id of the checkout and there is one `<id>/index.html` per folder under `addons/`. `terminology`: pull requests only, copied from the eclipse source's `build.yml`. `publish`: as the contract gives it, on a push to `develop` only, after `check` and `addons`, with `SITE_DEPLOY_TOKEN`; no other job reads a secret. Run `actionlint` on it and run the `addons` commands locally (FR-003, FR-011, FR-013) · etalii.adp.ide.notion/.github/workflows/build.yml

**⟶ Wait for T024 to finish, then:**

**Wave 3 — independent (no shared file):**

- [ ] **T025** [P] [US1] Push the branch and open pull request 2 into `develop`. `Build` reports on it within 5 minutes with `check`, `addons` and `terminology`, and no `publish` job runs (SC-002, FR-011) · etalii.adp.ide.notion/ (pull request 2)
- [ ] **T026** [P] [US1] **Maintainer**: create a fine-grained personal access token limited to `etalii.adp.site` with "Actions: read and write" and no other permission, expiring within a year, and store it as the Actions secret `SITE_DEPLOY_TOKEN` of `etalii.adp.ide.notion`. Check with `gh secret list --repo etalii-adp/etalii.adp.ide.notion` (FR-011) · GitHub secret SITE_DEPLOY_TOKEN
- [ ] **T027** [P] [US1] **Maintainer**: add `etalii.adp.ide.notion` to the Claude project's resources (FR-002) · Claude project resources

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T028** [US1] **Maintainer**: merge pull request 2 with a merge commit. `Build` runs on `develop`, and its `publish` job starts a `deploy` run in `etalii.adp.site`, which republishes the site as it is · etalii.adp.ide.notion/ (pull request 2)

**⟶ Wait for T028 to finish, then:**

- [ ] **T029** [US1] Walk `docs/new-repository.md` and [contracts/repository-settings.md](contracts/repository-settings.md) against the repository, and run quickstart steps 1 to 3: 0 open items (SC-001) · etalii.adp/docs/new-repository.md (read only)

**Checkpoint**: the repository takes pull requests under the organization's rules, and its `Build` reports on each. Story 1 is testable on its own.

---

## Phase 4: User Story 2 - What is merged is served at etalii.net/adp-notion (Priority: P2)

**Goal**: every run of the site's `deploy` carries the Notion repository's published tree in `dist/adp-notion`.

**Independent Test**: merge a change to the index text, then open `https://etalii.net/adp-notion` in a browser and embed it in a Notion page; the change shows in both, and the site under `/adp` is unchanged. It can be run once pull request 3 is merged (T043).

Files: `etalii.adp.site/.github/workflows/deploy.yml`. The other half of this story, the `publish` job and the build script, is in the files of Phase 3.

### Implementation

- [ ] **T030** [US2] In the `build` job, after `npm run check` and before the upload, add the three steps of [contracts/publication.md](contracts/publication.md): check out `etalii-adp/etalii.adp.ide.notion` at `develop` into a side folder outside `dist` and outside what the site's build reads, with no token; run `node scripts/build.mjs --out "$GITHUB_WORKSPACE/dist/adp-notion"` in it; `test -f dist/adp-notion/index.html`. The site's checks have run by then, so they never read an add-on. Keep the triggers, the group `pages` and the single artifact; say in the header comment that the run publishes both. Run `actionlint` on it. Commit on the site's branch (FR-008, FR-012, FR-013) · etalii.adp.site/.github/workflows/deploy.yml

**Checkpoint**: the workflow builds both parts. It serves `/adp-notion` from the merge of pull request 3 on.

---

## Phase 5: User Story 3 - Notion is named as a host wherever hosts are listed (Priority: P3)

**Goal**: the site's host list and both build tables name the Notion host, with no tool claimed.

**Independent Test**: read `docs/terminology.md`, the organization profile and the site; each names the Notion host, and the two tables show its badge.

Files: `etalii.adp.site/src/data/order.ts`, `etalii.adp.site/src/data/hosts.yaml`, `etalii.adp.site/src/data/builds.ts`, `etalii.adp.site/src/content.config.ts`, `etalii.adp.site/src/components/HostList.astro`, `etalii.adp.site/src/content/docs/index.mdx`, `etalii.adp.site/CLAUDE.md`, the site's terminology pages, `etalii-adp.github/profile/README.md`. The glossary and the rules of this story are in the files of Phase 2.

Starts after T028: the host entry is sourced from a merged commit of the Notion repository, and a badge needs a run of `Build` on its `develop`. This phase and Phase 4 commit to the same branch of the site, in different files, one commit at a time.

### Implementation

**Wave 1 — independent (different files):**

- [ ] **T031** [P] [US3] Add `listedHostIds`: the four `hostIds` followed by `notion`. `hostIds` stays the four hosts of the tool catalogue (research D7) · etalii.adp.site/src/data/order.ts
- [ ] **T032** [P] [US3] Add the `notion` entry in the shape of the other four: name Notion, summary taken from the Notion repository's `README.md`, state `planned`, the note that no tool is available yet, and a source record with `etalii-adp/etalii.adp.ide.notion`, `README.md`, its commit on `develop`, the date taken and `Apache-2.0` (FR-015) · etalii.adp.site/src/data/hosts.yaml
- [ ] **T033** [P] [US3] Add `{ repository: 'etalii.adp.ide.notion', public: true, workflow: 'build.yml' }` after the eclipse entry (FR-004) · etalii.adp.site/src/data/builds.ts
- [ ] **T034** [P] [US3] Reword the sentence that says a tool type runs in each of four hosts, so that it stays true with Notion listed as a planned host and claims no tool in it (FR-015) · etalii.adp.site/src/content/docs/index.mdx
- [ ] **T035** [P] [US3] Name Notion in the host list of the first paragraph · etalii.adp.site/CLAUDE.md
- [ ] **T036** [P] [US3] Add one row for `etalii.adp.ide.notion` after the eclipse row, with the live badge of `build.yml`; commit it on the branch of `.github` (FR-004) · etalii-adp.github/profile/README.md

**⟶ Wait for T031 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T037** [P] [US3] Make the hosts collection use `listedHostIds` · etalii.adp.site/src/content.config.ts
- [ ] **T038** [P] [US3] Use `listedHostIds` for the list, and correct the comment that says "the four IDE hosts" · etalii.adp.site/src/components/HostList.astro

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T039** [US3] Run the site's refresh of the terminology pages against the glossary on `develop` of `etalii.adp` and commit what it changes; if it changes nothing, say so in pull request 3 (research D9) · etalii.adp.site/ (the terminology pages the refresh writes)

**Checkpoint**: the site's branch lists Notion as a planned host and both tables hold the row. Visitors see it from the merges of T043 on.

---

## Phase 6: Polish, delivery of the site and the profile, and validation

**Purpose**: check what Phases 4 and 5 put on the site's branch, publish it, and prove the feature by the quickstart.

- [ ] **T040** Run the suites, once. In the site's worktree: `npm run test`, `npm run build`, `npm run check:reference`, then build the Notion repository's `develop` into `dist/adp-notion` with the command of T030, then `npm run check`; open `/adp-notion/` and `/adp/` in `npm run preview`. `actionlint` on `deploy.yml` and on the Notion repository's `build.yml`. In `etalii.adp`: `python .github/scripts/validate-examples.py` and `python .github/scripts/licence-check.py`. All pass · etalii.adp.site/ (no file changes)

**⟶ Wait for T040 to finish, then:**

**Wave 1 — independent (different repositories):**

- [ ] **T041** [P] Push the site's branch and open pull request 3 into `develop`, holding T030 to T035 and T037 to T039; its `build` passes · etalii.adp.site/ (pull request 3)
- [ ] **T042** [P] Push the branch of `.github` and open pull request 4 into `develop`, holding T036 · etalii-adp.github/ (pull request 4)

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T043** **Maintainer**: merge pull request 3, then pull request 4, each with a merge commit. The `deploy` run of pull request 3 publishes `/adp-notion` for the first time, together with the site · etalii.adp.site/ and etalii-adp.github/ (pull requests 3 and 4)

**⟶ Wait for T043 to finish, then:**

- [ ] **T044** Run quickstart steps 4 to 14 and record each result against SC-002 to SC-007: a one-word pull request in the Notion repository that publishes within 15 minutes of its merge, the address with and without the slash, four pages of the site, a `deploy` started by hand, the two tables and the host list. **Maintainer**: step 10, the embed in a Notion page (FR-014, SC-004) · etalii.adp/specs/011-notion-repository/quickstart.md (read only)

**⟶ Wait for T044 to finish, then:**

- [ ] **T045** On a branch `features/011-notion-repository` made again from `develop` of `etalii.adp`: correct the title of the requirements checklist to `/adp-notion`, tick the tasks whose pull requests are merged, and open pull request 5 into `develop`. **Maintainer**: merge it · etalii.adp/specs/011-notion-repository/checklists/requirements.md, etalii.adp/specs/011-notion-repository/tasks.md
- [ ] **T046** Delete the branch `features/011-notion-repository` locally and on `origin` in each of the four repositories, and remove the worktrees of T001, T002 and T019 · the four clones

---

## Dependencies & Execution Order

**Phases**: Setup → Foundational → Story 1 → Stories 2 and 3 → Polish. Nothing in another repository starts before pull request 1 is merged (T011). Story 2's one file can be written as soon as Phase 2 is done, but it publishes only what Story 1 built. Story 3 waits for T028. Phase 6 waits for both.

**Maintainer steps**, in order: merge 1 (T011), token and resources (T026, T027), merge 2 (T028), merge 3 then 4 (T043), the embed (T044), merge 5 (T045).

| Phase | Waves |
| --- | --- |
| 1 Setup | T001 to T003 together |
| 2 Foundational | T004 → T005 to T008 → T009, T010 → T011 (merge) → T012 |
| 3 Story 1 | T013 → T014 → T015 to T017 → T018 → T019 → T020 to T023 → T024 → T025 to T027 → T028 (merge) → T029 |
| 4 Story 2 | T030 |
| 5 Story 3 | T031 to T036 → T037, T038 → T039 |
| 6 Polish | T040 → T041, T042 → T043 (merges) → T044 → T045 → T046 |

**The address during delivery**: `https://etalii.net/adp-notion` answers "not found" until T043. T028's `deploy` run republishes the site as it is, which is expected.
