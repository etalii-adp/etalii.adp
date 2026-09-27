# Feature Specification: A Build Workflow and Status Badge for Every Repository

**Feature Branch**: `features/001-ci-and-badges`
**Created**: 2026-09-27
**Status**: Draft
**Input**: "add in etalii.adp repo a spec kit specification that all repos should have a github action, include badges and update them everywhere accordingly, also the corresponding badge in each of the repo's readme.md"

## Context

The `etalii-adp` organization has seven repositories: `etalii.adp`, `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`, `etalii.adp.site` and `.github`. Only two of them run a GitHub Actions workflow today: `etalii.adp.ide.standalone` (its build) and `etalii.adp.site` (its checks and its deployment). The other five check nothing, so a pull request into their `develop` shows no result and a reviewer takes the author's word that it works.

Build status is shown in two places that list every repository: the table in the organization profile (`.github`) and the table on the site's home page. Both say "N/A" for the five repositories without a workflow. Only `etalii.adp.ide.standalone` shows a badge in its own readme. `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` have no readme at all.

Two constraints shape the feature. Five repositories are private, and GitHub's hosted runners stopped starting jobs for private repositories on 2026-09-27 when the organization's included minutes ran out; `etalii.adp.ide.standalone` and `etalii.adp.site` answered that by letting a repository variable choose between a hosted and a self-hosted runner. And GitHub serves the status badge of a private repository only to people who can see that repository, so a public page cannot show it to a visitor.

This feature makes every repository run a build workflow on its pull requests and on `develop`, shows that workflow's status as a badge in the repository's own readme, and keeps the two organization-wide tables in step with it. It also makes the rule part of how a new repository is created, so the eighth repository starts with it.

Three roles appear below. A **contributor** is a person or agent who opens a pull request. A **maintainer** reviews and merges pull requests and runs the organization. A **visitor** reads the organization profile or the site, usually without access to the private repositories.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every pull request in every repository gets a result (Priority: P1)

A contributor opens a pull request into `develop` in any repository of the organization. Without anyone doing anything, that repository's build workflow runs on the pull request's latest commit and shows a pass or a fail on the pull request. A failure names the step that failed and links to its output. What the workflow checks depends on what the repository holds: the IDE hosts build and test their code, `etalii.adp` validates every example against its schema as its constitution requires, the site runs its existing checks, and a repository with nothing to build yet checks what it does hold.

**Why this priority**: it is the substance of the ask. A badge with no workflow behind it has nothing to show.

**Independent Test**: in each repository, open one pull request that changes nothing and one that breaks what that repository checks; the first shows a pass and the second a fail.

**Acceptance Scenarios**:

1. **Given** a pull request into `develop` in any of the seven repositories, **When** it is opened or a new commit is pushed to it, **Then** the repository's build workflow runs on its latest commit and the result is shown on the pull request.
2. **Given** a change to `develop` in any repository, **When** it lands, **Then** the build workflow runs on it too, so the status of `develop` is always known.
3. **Given** a change that breaks what a repository checks, **When** the workflow runs, **Then** it fails and names the failing step.
4. **Given** `etalii.adp`, **When** a pull request changes a specification's schema so that one of its examples no longer validates, **Then** the workflow fails and names the example.

---

### User Story 2 - Each readme shows its repository's status (Priority: P1)

Someone opens a repository on GitHub. At the top of its readme is a badge showing whether the build workflow passes on `develop`, and the badge links to that workflow's runs. A repository that had no readme now has one, with at least its name, one line on what it is for, and the badge.

**Why this priority**: named in the ask; it is where a contributor looks first.

**Independent Test**: open each repository's front page and follow its badge to the workflow's runs on `develop`.

**Acceptance Scenarios**:

1. **Given** any of the seven repositories, **When** its front page is opened by someone who can see the repository, **Then** its readme shows the build badge for `develop`, linked to the workflow's runs.
2. **Given** the build on `develop` fails, **When** the readme is opened, **Then** the badge shows the failure.
3. **Given** `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse`, which have no readme today, **When** this feature lands, **Then** each has a readme carrying its badge.

---

### User Story 3 - The organization-wide tables agree with the repositories (Priority: P1)

A maintainer or visitor reads the build table on the organization profile or on the site's home page. Every repository has a row. Where the reader is allowed to see a repository's status, the row shows the same badge as that repository's readme, linked to the same runs. No row says "N/A" because a workflow is missing.

**Why this priority**: "update them everywhere" is part of the ask, and two tables that disagree with the readmes are worse than none.

**Independent Test**: compare each row of both tables with the badge in that repository's readme: same workflow, same branch, same link.

**Acceptance Scenarios**:

1. **Given** the organization profile and the site's home page, **When** either is read, **Then** it lists every repository in the organization exactly once.
2. **Given** a repository whose status the reader may see, **When** its row is read, **Then** it shows that repository's build badge for `develop`, linked to its runs, identical to the readme's.
3. **Given** a private repository and a visitor without access, **When** they read either table, **Then** its row says plainly that the repository is not public rather than showing a broken image.
4. **Given** a repository whose visibility changes, **When** the tables are next updated, **Then** its row changes with it.

---

### User Story 4 - A workflow can run while hosted minutes are unavailable (Priority: P2)

Hosted runner minutes for the private repositories run out, as they did on 2026-09-27. A maintainer switches a repository's workflow to the organization's self-hosted runner without changing the workflow, and switches it back when minutes return. A public repository keeps using hosted runners, which cost nothing.

**Why this priority**: without it, most of the new workflows fail within seconds for a reason that has nothing to do with the change, and the badges turn red for the wrong reason. It follows the P1 stories because it only matters while minutes are short.

**Independent Test**: in one private repository, set the switch to the self-hosted runner and see the next run use it; clear the switch and see the next run use a hosted runner.

**Acceptance Scenarios**:

1. **Given** any repository's build workflow, **When** the maintainer has not set the switch, **Then** the workflow runs on a hosted runner.
2. **Given** the switch set to the self-hosted runner, **When** the workflow runs, **Then** every job in it runs there.
3. **Given** a run that could not start because no runner was available, **When** a reader looks at it, **Then** it is visible as a run that did not start, not mistaken for a broken change.

---

### User Story 5 - A new repository starts with its workflow and badge (Priority: P2)

A maintainer creates the eighth repository by following `docs/new-repository.md`. The checklist tells them to add a build workflow, put its badge in the new readme, and add a row to both organization-wide tables, so the new repository never appears as "N/A".

**Why this priority**: it keeps the rule true after this feature lands, but no new repository is planned right now.

**Independent Test**: read `docs/new-repository.md` and follow it for a hypothetical repository; every place this feature covers is named.

**Acceptance Scenarios**:

1. **Given** `docs/new-repository.md`, **When** a maintainer reads its list of starting files, **Then** it requires a build workflow from the first pull request, a readme carrying its badge, and a row in both organization-wide tables.

---

### Edge Cases

- A repository with nothing to build yet (`etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`, `.github`): its workflow still runs and checks what it holds, so that when code arrives it is extended rather than created.
- A repository with more than one workflow (`etalii.adp.site` has its checks, its deployment and an auto-assign workflow): exactly one of them is the build workflow whose badge represents the repository everywhere.
- A pull request from a fork: the workflow runs without the repository's secrets and publishes nothing.
- The self-hosted runner is offline while a repository is switched to it: runs queue and do not start, and the badge keeps showing the last finished result.
- A repository is renamed or its workflow is renamed: every badge and table row pointing at it is updated in the same change, since a stale badge shows an error image rather than a status.
- A public page embeds a private repository's badge: a visitor sees a broken image, which is what the tables avoid today and must keep avoiding.
- A workflow is added in a repository whose `develop` has never been built: the badge shows no status until the first run on `develop` finishes, and that first run happens when this feature's pull request is merged.

## Requirements *(mandatory)*

### Functional Requirements

**Workflows**

- **FR-001**: Every repository in the organization MUST have exactly one designated build workflow, known by the same name in every repository.
- **FR-002**: The build workflow MUST run on every pull request into `develop`, on every new commit pushed to such a pull request, and on every change that reaches `develop`.
- **FR-003**: The build workflow MUST show its result on the pull request as pass or fail, and a failure MUST name the failing step and link to its output.
- **FR-004**: The build workflow MUST check what the repository holds: in `etalii.adp` it MUST validate every example against its specification's schema; in an IDE host it MUST build the host and run its tests; in `etalii.adp.site` it MUST include the site's existing checks; in a repository with no code yet it MUST check the files the repository does hold.
- **FR-005**: A maintainer MUST be able to run the build workflow again for a commit without pushing a change.
- **FR-006**: Pull requests from forks MUST NOT receive the repository's secrets, and nothing MUST be published from a pull request's run.

**Runners**

- **FR-007**: Every job in every build workflow MUST run on the runner chosen by one repository-level switch, the same switch in every repository, and on a hosted runner when the switch is not set.

**Badges**

- **FR-008**: Every repository MUST have a readme at its root that shows, near its top, the status badge of its build workflow on `develop`, linked to that workflow's runs.
- **FR-009**: `etalii.adp`, `etalii.adp.ide.vscode` and `etalii.adp.ide.eclipse` MUST each gain a readme that names the repository, says in one line what it is for, and carries its badge.
- **FR-010**: The organization profile's build table and the site's home page build table MUST each list every repository in the organization exactly once.
- **FR-011**: In both tables, a public repository's row MUST show the same badge as its readme, with the same link.
- **FR-012**: In both tables, a private repository's row MUST show a plain-text note that its status is not public, and MUST NOT embed an image a visitor cannot load.
- **FR-013**: A row in either table MUST NOT say "N/A" once this feature lands.
- **FR-014**: A change that renames a repository or its build workflow MUST update every badge and table row that points at it in the same change.

**Keeping it true**

- **FR-015**: `docs/new-repository.md` MUST require every new repository to start with a build workflow, a readme carrying its badge, and a row in both organization-wide tables.
- **FR-016**: `etalii.adp`'s constitution MUST no longer say there is no CI workflow, once its workflow exists.

### Key Entities

- **Repository**: one of the organization's seven repositories; has a visibility (public or private), a `develop` branch, one build workflow and one readme.
- **Build workflow**: the one workflow per repository whose result on `develop` stands for the repository's status; runs on pull requests and on `develop`.
- **Runner switch**: the repository-level setting that chooses where every job of the build workflow runs; unset means hosted.
- **Status badge**: the image showing the build workflow's latest result on `develop`, linked to its runs; visible only to readers who can see the repository.
- **Build table**: a list of every repository and its status badge or note; there are two, on the organization profile and on the site's home page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 7 of 7 repositories run their build workflow on pull requests into `develop`, and every pull request opened after this feature lands shows a result before it is merged.
- **SC-002**: 7 of 7 readmes show a badge that, for a reader with access, displays the current status of `develop`.
- **SC-003**: Both build tables have 7 rows, 0 of them "N/A", and 0 broken images for a visitor without access.
- **SC-004**: Every badge in both tables and in the readmes points at the same workflow and branch as its repository's readme; a check of every badge finds no mismatch.
- **SC-005**: When hosted minutes are unavailable, a maintainer moves one repository's builds to the self-hosted runner with one setting change and no edit to the workflow.
- **SC-006**: A repository created by following `docs/new-repository.md` has its workflow, badge and both table rows in its first merged pull request.

## Assumptions

- "All repos" means the seven repositories in the `etalii-adp` organization today, `.github` included, because it too has a readme and appears in the tables' organization. The profile table lists six today; `.github` gains a row.
- The badge shows the status of `develop`, the default branch and the integration branch, not of feature branches.
- The runner switch is the one `etalii.adp.ide.standalone` and `etalii.adp.site` already use (the `RUNS_ON` repository variable), so every repository behaves the same way; setting up the self-hosted runner itself is outside this feature.
- The repositories stay private or public as they are. Making a repository public so its badge shows on public pages is a separate decision.
- A repository with no code yet runs a check of the files it holds, such as its markdown and its Spec Kit setup, rather than a placeholder that always passes, because a badge that is always green says nothing.
- Branch protection is not available (the organization is on the free plan), so a failing workflow informs the maintainer but cannot block a merge. This matches how every repository already delivers.
- What `etalii.adp.ide.intellij` builds, tests and publishes is specified in detail by its own spec 005 (continuous integration and plug-in downloads); this feature only requires that its build workflow exists, carries the shared name and switch, and has its badge. Likewise the site's own spec decides how its home page renders the table.
- The work is delivered as one pull request per repository, each into that repository's `develop`, once this specification is approved.

## Out of Scope

- Releases, downloads and deployments. They stay as each repository specifies them.
- Badges other than build status, such as coverage, licence or version badges.
- Setting up, securing or maintaining the self-hosted runner.
- Changing any repository's visibility.
