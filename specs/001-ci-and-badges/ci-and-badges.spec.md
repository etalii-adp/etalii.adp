# Feature Specification: A Build Workflow and Status Badge for Every Repository

**Feature Branch**: `features/001-ci-and-badges`
**Created**: 2026-09-27
**Status**: Draft
**Input**: "add in etalii.adp repo a spec kit specification that all repos should have a github action, include badges and update them everywhere accordingly, also the corresponding badge in each of the repo's readme.md"

## Context

The `etalii-adp` organization holds six product repositories: `etalii.adp`, `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse` and `etalii.adp.site`. Only two of them run a GitHub Actions workflow today: `etalii.adp.ide.standalone` (its build) and `etalii.adp.site` (its checks and its deployment). The other four check nothing, so a pull request into their `develop` shows no result and a reviewer takes the author's word that it works.

Build status is shown in two places that list every repository: the table in the organization profile and the table on the site's home page. Both say "N/A" for the four repositories without a workflow. Only `etalii.adp.ide.standalone` shows a badge in its own readme. `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` have no readme at all.

Four of the six repositories are private. GitHub serves a private repository's status badge only to people who can see the repository, so the public profile and site cannot show it to a visitor. And GitHub's hosted runners stopped starting jobs for the private repositories on 2026-09-27, when the organization's included minutes ran out. Making the repositories public answers both: every badge loads for every visitor, and hosted runners are free for public repositories.

This feature makes every product repository public, runs a build workflow on its pull requests and on `develop` on GitHub's hosted runners, shows that workflow's status as a badge in the repository's own readme, and keeps the two organization-wide tables in step with it. The VS Code and Eclipse hosts have no code yet; their workflows are laid out so that, once plug-in code arrives, each run also offers the installable plug-in as a download. The rule becomes part of how a new repository is created.

Three roles appear below. A **contributor** is a person or agent who opens a pull request. A **maintainer** reviews and merges pull requests and runs the organization. A **visitor** reads the organization profile, the site or a repository without being a member of the organization.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every pull request in every repository gets a result (Priority: P1)

A contributor opens a pull request into `develop` in any product repository. Without anyone doing anything, that repository's build workflow runs on the pull request's latest commit and shows a pass or a fail on the pull request. A failure names the step that failed and links to its output. What the workflow checks depends on what the repository holds: the IDE hosts with code build and test it, `etalii.adp` validates every example against its schema as its constitution requires, the site runs its existing checks, and the VS Code and Eclipse hosts check the files they hold until they have code.

**Why this priority**: it is the substance of the ask. A badge with no workflow behind it has nothing to show.

**Independent Test**: in each repository, open one pull request that changes nothing and one that breaks what that repository checks; the first shows a pass and the second a fail.

**Acceptance Scenarios**:

1. **Given** a pull request into `develop` in any of the six repositories, **When** it is opened or a new commit is pushed to it, **Then** the repository's build workflow runs on its latest commit and the result is shown on the pull request.
2. **Given** a change to `develop` in any repository, **When** it lands, **Then** the build workflow runs on it too, so the status of `develop` is always known.
3. **Given** a change that breaks what a repository checks, **When** the workflow runs, **Then** it fails and names the failing step.
4. **Given** `etalii.adp`, **When** a pull request changes a specification's schema so that one of its examples no longer validates, **Then** the workflow fails and names the example.
5. **Given** `etalii.adp.ide.vscode` or `etalii.adp.ide.eclipse`, **When** a pull request breaks one of the files the repository holds, such as malformed markdown or a broken Spec Kit setup, **Then** the workflow fails and names the file.

---

### User Story 2 - Each readme shows its repository's status (Priority: P1)

Someone opens a repository on GitHub. At the top of its readme is a badge showing whether the build workflow passes on `develop`, and the badge links to that workflow's runs. A repository that had no readme now has one, with at least its name, one line on what it is for, and the badge.

**Why this priority**: named in the ask; it is where a contributor looks first.

**Independent Test**: open each repository's front page while signed out and follow its badge to the workflow's runs on `develop`.

**Acceptance Scenarios**:

1. **Given** any of the six repositories, **When** its front page is opened by anyone, signed in or not, **Then** its readme shows the build badge for `develop`, linked to the workflow's runs.
2. **Given** the build on `develop` fails, **When** the readme is opened, **Then** the badge shows the failure.
3. **Given** `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse`, which have no readme today, **When** this feature lands, **Then** each has a readme carrying its badge.

---

### User Story 3 - The organization-wide tables agree with the repositories (Priority: P1)

A visitor reads the build table on the organization profile or on the site's home page. Every product repository has a row, and every row shows the same badge as that repository's readme, linked to the same runs. No row says "N/A" and no image is broken.

**Why this priority**: "update them everywhere" is part of the ask, and two tables that disagree with the readmes are worse than none.

**Independent Test**: signed out, compare each row of both tables with the badge in that repository's readme: same workflow, same branch, same link, and the image loads.

**Acceptance Scenarios**:

1. **Given** the organization profile and the site's home page, **When** either is read, **Then** it lists each of the six product repositories exactly once.
2. **Given** any row, **When** a visitor who is not signed in reads it, **Then** it shows that repository's build badge for `develop`, loaded and linked to its runs, identical to the readme's.

---

### User Story 4 - Plug-in downloads are ready for VS Code and Eclipse (Priority: P2)

A contributor adds the first plug-in code to `etalii.adp.ide.vscode` or `etalii.adp.ide.eclipse`. The build workflow already has a place for building the installable plug-in and offering it as a download from each run, so the contributor fills that place in rather than designing the workflow. Until then, every run shows that step as skipped, with the reason that there is no plug-in to build yet. A maintainer reviewing a pull request that adds plug-in code downloads the plug-in from the run and installs it in their IDE.

**Why this priority**: asked for as preparation. Nothing can be downloaded until there is code, so it follows the stories that deliver today.

**Independent Test**: in either repository, look at a run today and see the plug-in step reported as skipped with its reason. Once plug-in code exists, see a successful run offer the plug-in for download.

**Acceptance Scenarios**:

1. **Given** `etalii.adp.ide.vscode` or `etalii.adp.ide.eclipse` with no plug-in code, **When** the build workflow runs, **Then** the plug-in step is shown as skipped with the reason, and the run still passes.
2. **Given** plug-in code in the repository, **When** the build workflow succeeds, **Then** the run offers the installable plug-in built from that commit as a download.
3. **Given** a run in which the plug-in did not build, **When** a maintainer opens it, **Then** no plug-in is offered for download.

---

### User Story 5 - A new repository starts with its workflow and badge (Priority: P3)

A maintainer creates the next product repository by following `docs/new-repository.md`. The checklist tells them to make it public, add a build workflow, put its badge in the new readme, and add a row to both organization-wide tables, so the new repository never appears as "N/A".

**Why this priority**: it keeps the rule true after this feature lands, but no new repository is planned right now.

**Independent Test**: read `docs/new-repository.md` and follow it for a hypothetical repository; every place this feature covers is named.

**Acceptance Scenarios**:

1. **Given** `docs/new-repository.md`, **When** a maintainer reads it, **Then** it requires a public repository, a build workflow from the first pull request, a readme carrying its badge, and a row in both organization-wide tables.

---

### Edge Cases

- A repository with more than one workflow (`etalii.adp.site` has its checks, its deployment and an auto-assign workflow): exactly one of them is the build workflow whose badge represents the repository everywhere.
- A pull request from a fork, which becomes possible once the repositories are public: the workflow runs without the repository's secrets and publishes nothing.
- A repository is renamed or its build workflow is renamed: every badge and table row pointing at it is updated in the same change, since a stale badge shows an error image rather than a status.
- A repository is made public before its workflow exists, or the other way round: its row shows "no status" rather than "N/A" until the first run on `develop` finishes, which happens when this feature's pull request for that repository is merged.
- A repository goes back to private later: its badges break for visitors, so that change must also update its readme and both tables.

## Requirements *(mandatory)*

### Functional Requirements

**Visibility**

- **FR-001**: Every product repository in the organization MUST be public.
- **FR-020**: Every product repository MUST carry the Apache License 2.0 in a `LICENSE` file at its root (Peter, 2026-09-27).

**Workflows**

- **FR-002**: Every product repository MUST have exactly one designated build workflow, known by the same name in every repository.
- **FR-003**: The build workflow MUST run on every pull request into `develop`, on every new commit pushed to such a pull request, and on every change that reaches `develop`.
- **FR-004**: The build workflow MUST show its result on the pull request as pass or fail, and a failure MUST name the failing step and link to its output.
- **FR-005**: The build workflow MUST check what the repository holds: in `etalii.adp` it MUST validate every example against its specification's schema; in an IDE host with code it MUST build the host and run its tests; in `etalii.adp.site` it MUST include the site's existing checks; in `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` it MUST check the files they hold until they have code.
- **FR-006**: A maintainer MUST be able to run the build workflow again for a commit without pushing a change.
- **FR-007**: Pull requests from forks MUST NOT receive the repository's secrets, and nothing MUST be published from a pull request's run.
- **FR-008**: Every job in every build workflow MUST run on GitHub's hosted runners.

**Plug-in downloads (VS Code and Eclipse)**

- **FR-009**: The build workflows of `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` MUST include a step that builds the installable plug-in and offers it as a download from the run.
- **FR-010**: While a repository holds no plug-in code, that step MUST be reported as skipped with the reason, and MUST NOT fail the run.
- **FR-011**: A run in which the plug-in did not build MUST NOT offer a plug-in download.

**Badges**

- **FR-012**: Every product repository MUST have a readme at its root that shows, near its top, the status badge of its build workflow on `develop`, linked to that workflow's runs.
- **FR-013**: `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` MUST each gain a readme that names the repository, says in one line what it is for, and carries its badge.
- **FR-014**: The organization profile's build table and the site's home page build table MUST each list every product repository exactly once.
- **FR-015**: In both tables, every row MUST show the same badge as its repository's readme, with the same link.
- **FR-016**: A row in either table MUST NOT say "N/A" once this feature lands.
- **FR-017**: A change that renames a repository or its build workflow, or makes a repository private, MUST update every badge and table row that points at it in the same change.

**Keeping it true**

- **FR-018**: `docs/new-repository.md` MUST require every new product repository to be public and to start with a build workflow, a readme carrying its badge, and a row in both organization-wide tables.
- **FR-019**: `etalii.adp`'s constitution MUST no longer say there is no CI workflow, once its workflow exists.

### Key Entities

- **Product repository**: one of the organization's six repositories that make up ADP; public, with a `develop` branch, one build workflow and one readme.
- **Build workflow**: the one workflow per repository whose result on `develop` stands for the repository's status; runs on pull requests and on `develop`, on hosted runners.
- **Plug-in download**: the installable VS Code or Eclipse plug-in built by a successful run, offered from that run; absent until the repository holds plug-in code.
- **Status badge**: the image showing the build workflow's latest result on `develop`, linked to its runs; visible to everyone once the repository is public.
- **Build table**: a list of every product repository and its status badge; there are two, on the organization profile and on the site's home page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 6 of 6 product repositories are public and run their build workflow on pull requests into `develop`, and every pull request opened after this feature lands shows a result before it is merged.
- **SC-002**: 6 of 6 readmes show a badge that, for a visitor who is not signed in, displays the current status of `develop`.
- **SC-003**: Both build tables have 6 rows, 0 of them "N/A", and 0 broken images for a visitor who is not signed in.
- **SC-004**: Every badge in both tables points at the same workflow and branch as its repository's readme; a check of all 12 table badges finds no mismatch.
- **SC-005**: 0 runs fail to start for lack of runner minutes after the repositories are public.
- **SC-006**: In `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse`, the first pull request that adds plug-in code offers the plug-in as a download from its run without restructuring the workflow.
- **SC-007**: A repository created by following `docs/new-repository.md` has its workflow, badge and both table rows in its first merged pull request.

## Assumptions

- "All repos" means the six product repositories. The organization's `.github` repository, which holds only the profile, gets no workflow and no row (Peter, 2026-09-27).
- The badge shows the status of `develop`, the default branch and the integration branch, not of feature branches.
- Making a repository public is a maintainer's action in the repository's settings, done once per repository before its badges appear on public pages. Before a repository goes public, a maintainer confirms it holds nothing that must stay private, such as secrets in its history or files whose licence forbids publishing. This was done on 2026-09-27: the four private repositories were scanned and made public on Peter's instruction.
- Hosted runners are free for public repositories, so the workflows need no self-hosted runner. The `RUNS_ON` switch that `etalii.adp.ide.standalone` and `etalii.adp.site` added while minutes were short becomes unnecessary; removing it, so every repository runs the same way, is part of this feature.
- The VS Code and Eclipse plug-in downloads are offered from each run only, for reviewers. Publishing them on a Releases page or a marketplace is left to each host's own specification, as `etalii.adp.ide.intellij`'s spec 005 does for its plug-in.
- Branch protection is not available (the organization is on the free plan), so a failing workflow informs the maintainer but cannot block a merge. Public repositories on the free plan can use branch protection; turning it on is a separate decision.
- What `etalii.adp.ide.intellij` builds, tests and publishes is specified in detail by its own spec 005 (continuous integration and plug-in downloads); this feature only requires that its build workflow exists, carries the shared name, runs on hosted runners and has its badge. Likewise the site's own specification decides how its home page renders the table, and its privacy rule needs an exception for the badge images.
- The work is delivered as one pull request per repository, each into that repository's `develop`, once this specification is approved.

## Out of Scope

- Releases, deployments and marketplace publishing. They stay as each repository specifies them.
- Badges other than build status, such as coverage, licence or version badges.
- The organization's `.github` repository.
