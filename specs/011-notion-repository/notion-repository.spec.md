# Feature Specification: A Notion Host Repository, Published at etalii.net/adp-notion

**Feature Branch**: `features/011-notion-repository`
**Created**: 2026-10-07
**Status**: Draft
**Input**: "Incorporate the git repo etalii.adp.ide.notion so that it can start delivering notion web based 'tool' addons based on DISL and FBL specifications. The addons should be hosted under https://etalii.net/adp/notion using the github pages approach."

## Context

ADP's tools run in four hosts today: standalone, IntelliJ, VS Code and Eclipse. Notion is to become a fifth: a tool shown inside a Notion page, as a web page Notion embeds. Such a web page is called a **Notion add-on** below. Like every host, it draws a tool type from its DISL specification and reads and writes other tools' files through FBL bindings, both taken from `etalii.adp`.

A repository for it exists on GitHub, but it cannot receive work yet. It is named `etalii-adp-ide-notion`, with dashes where the organization's rule asks for dots. It is empty: no `develop` branch, no build, no rules for agents. Nothing names Notion as a host: not the glossary, not the list of repositories whose features are specified here, not the two build tables, not the site. And an add-on has nowhere to be served from. The domain `etalii.net` belongs to the one GitHub Pages site of `etalii.adp.site`, which publishes only its own pages under `/adp`. The add-ons get an address of their own beside it, `/adp-notion`, so that no address of the site can clash with one of an add-on.

This feature makes the repository a regular member of the organization and gives it a published address. It delivers no tool. When it is done, the first add-on can be specified as a feature of its own and reach users by a merged pull request.

Three roles appear below. A **contributor** is a person or agent who opens a pull request. A **maintainer** merges pull requests and runs the organization. A **visitor** opens a published address, in a browser or inside a Notion page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A contributor can deliver work to the Notion repository (Priority: P1)

A contributor clones `etalii.adp.ide.notion`, reads its `CLAUDE.md`, and finds the same rules as in every other repository: `develop`, feature branches, pull requests only, merge commits, and features specified in `etalii.adp`. They open a pull request into `develop` and its build workflow reports a pass or a fail without anyone starting it.

**Why this priority**: nothing else can land until the repository takes pull requests under the organization's rules.

**Independent Test**: walk `docs/new-repository.md` against the repository and tick every rule; open a pull request and see a build result on it.

**Acceptance Scenarios**:

1. **Given** the organization's repository list, **When** a contributor looks for the Notion host, **Then** they find exactly one repository, named `etalii.adp.ide.notion`, public, with `develop` as its default branch.
2. **Given** the checklist in `docs/new-repository.md`, **When** a maintainer walks it against the repository, **Then** every rule holds: settings, starting files and access for Claude.
3. **Given** a pull request into `develop`, **When** it is opened or updated, **Then** the workflow named `Build` runs on its latest commit, including the terminology check, and shows its result on the pull request.
4. **Given** a link to the old name `etalii-adp-ide-notion`, **When** someone follows it, **Then** they arrive at `etalii.adp.ide.notion`.

---

### User Story 2 - What is merged is served at etalii.net/adp-notion (Priority: P2)

A maintainer merges a pull request into the Notion repository's `develop`. Without a further step, what the repository publishes is served under `https://etalii.net/adp-notion`. A visitor who opens that address sees an index of the published add-ons, which says there are none yet. A visitor who pastes an address under it into a Notion page sees the page inside Notion.

**Why this priority**: an add-on that cannot be reached by a stable address cannot be embedded, so this is what "start delivering" means. It needs the repository of Story 1.

**Independent Test**: merge a change to the index text, then open `https://etalii.net/adp-notion` in a browser and embed it in a Notion page; the change shows in both, and the rest of the site under `/adp` is unchanged.

**Acceptance Scenarios**:

1. **Given** a pull request merged into `develop` of `etalii.adp.ide.notion`, **When** publication finishes, **Then** `https://etalii.net/adp-notion` serves the merged content, and nobody ran a manual step.
2. **Given** no add-on has been published, **When** a visitor opens `https://etalii.net/adp-notion`, **Then** the index says that none is available yet and names the revision it was published from.
3. **Given** an open pull request that is not merged, **When** its build runs, **Then** nothing under `https://etalii.net/adp-notion` changes.
4. **Given** the address pasted into a Notion page as an embed, **When** the Notion page is opened, **Then** the published page is shown inside it.
5. **Given** a publication of the Notion repository, **When** it finishes, **Then** every page of the site under `https://etalii.net/adp` that existed before is still served unchanged; and **Given** a publication of the site, **Then** everything under `/adp-notion` is still served unchanged.
6. **Given** a publication that fails, **When** a visitor opens the address, **Then** the previously published version is still served, and the failure is visible to maintainers on GitHub.

---

### User Story 3 - Notion is named as a host wherever hosts are listed (Priority: P3)

A reader of the glossary finds Notion among the hosts and finds what a Notion add-on is. A visitor to the organization profile or the site's home page sees the new repository's build status in the table beside the others. A visitor to the site reads that Notion is a host with no tool available yet.

**Why this priority**: the repository works without it, but the organization's rules ask that the vocabulary is defined first and that both build tables list every repository.

**Independent Test**: read `docs/terminology.md`, the organization profile and the site; each names the Notion host, and the two tables show its badge.

**Acceptance Scenarios**:

1. **Given** `docs/terminology.md`, **When** a reader looks up "host", **Then** Notion is listed, the definition no longer says a host is always an IDE, and "Notion add-on" is defined.
2. **Given** the organization profile and the site's home page, **When** a visitor reads the build tables, **Then** each has a row for `etalii.adp.ide.notion` with its live build badge.
3. **Given** the site's description of the hosts, **When** a visitor reads it, **Then** Notion is named as a host and no tool is claimed as available in it.
4. **Given** a new feature for the Notion host, **When** a contributor reads `CLAUDE.md` and `docs/new-repository.md` in `etalii.adp`, **Then** both name `etalii.adp.ide.notion` among the repositories whose features are specified there, and its principles are in `.specify/memory/repositories/etalii.adp.ide.notion.md`.

### Edge Cases

- The site and the Notion repository publish at nearly the same time: neither may publish a state that lacks the other's latest content.
- The Notion repository publishes for the first time before the site has been republished, or the reverse: the address must not answer "not found" in between once the feature is delivered.
- A page is served with a rule that forbids showing it inside another site: Notion would then show an empty embed, so the published pages must permit embedding.
- A pull request from a fork: its build runs, and it can publish nothing.
- A clone or a bookmark still uses the old repository name after the rename.

## Requirements *(mandatory)*

### Functional Requirements

**The repository**

- **FR-001**: The Notion host's repository MUST be named `etalii.adp.ide.notion`, in the `etalii-adp` organization. The existing empty repository `etalii-adp-ide-notion` MUST be renamed to it; a second repository MUST NOT be created.
- **FR-002**: The repository MUST satisfy every rule in `docs/new-repository.md`: public, `develop` as default branch, merge commits only, head branches deleted on merge, the starting files (`CLAUDE.md`, `LICENSE`, `README.md` with its build badge, `.gitattributes`, the ignore rule), no Spec Kit setup of its own, and access for Claude.
- **FR-003**: The repository's first pull request MUST add the workflow named `Build`, following the build-workflow contract of spec 001, including the terminology job of spec 002.
- **FR-004**: The build tables in the organization profile and on the site MUST each gain a row for `etalii.adp.ide.notion`.

**Vocabulary and rules**

- **FR-005**: `docs/terminology.md` MUST list Notion as a host, MUST define a host without requiring it to be an IDE, and MUST define "Notion add-on". This change MUST be made before any other file uses the terms.
- **FR-006**: `CLAUDE.md` and `docs/new-repository.md` in `etalii.adp` MUST name `etalii.adp.ide.notion` among the host repositories whose features are specified in `etalii.adp`.
- **FR-007**: The repository's principles MUST be recorded in `.specify/memory/repositories/etalii.adp.ide.notion.md`. They MUST state at least: an add-on takes its tool type from a DISL specification and its file formats from FBL bindings in `etalii.adp` and never restates them; every address it publishes works under `/adp-notion`; and it claims no tool that is not published.

**Publication**

- **FR-008**: What the repository publishes MUST be served at `https://etalii.net/adp-notion`, over HTTPS, by GitHub Pages and by no other hosting service.
- **FR-009**: `https://etalii.net/adp-notion` itself MUST serve an index that lists every published add-on with its address, says so when there is none, and names the revision of `etalii.adp.ide.notion` it was published from.
- **FR-010**: Each add-on MUST have its own address under `https://etalii.net/adp-notion/`, which MUST NOT change when other add-ons are added or removed.
- **FR-011**: A merge into `develop` of `etalii.adp.ide.notion` MUST publish its content without a manual step. A pull request that is not merged MUST NOT publish anything.
- **FR-012**: Publishing the Notion repository MUST NOT change or remove any page under `https://etalii.net/adp`, and publishing the site MUST NOT change or remove anything under `/adp-notion`.
- **FR-013**: A failed publication MUST leave the previously published version in place and MUST show as a failed run on GitHub.
- **FR-014**: Every page published under `/adp-notion` MUST be displayable as an embed inside a Notion page.
- **FR-015**: The site MUST name Notion as a host and MUST state that no tool is available in it yet.

### Key Entities

- **Notion host repository**: `etalii.adp.ide.notion`, the repository that builds and publishes the Notion add-ons. One of the organization's host repositories.
- **Notion add-on**: a web page that shows one ADP tool inside a Notion page. It has one stable address under `https://etalii.net/adp-notion/` and belongs to one tool type.
- **Add-on index**: the page at `https://etalii.net/adp-notion`. Lists the published add-ons and the revision they were published from.
- **Repository principles**: the rules a plan for this repository is checked against, kept in `etalii.adp`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every rule in `docs/new-repository.md` holds for `etalii.adp.ide.notion`: 0 open items when the checklist is walked.
- **SC-002**: A pull request into its `develop` shows a build result within 5 minutes of being opened.
- **SC-003**: A merged change is served at `https://etalii.net/adp-notion` within 15 minutes, with 0 manual steps.
- **SC-004**: The address, embedded in a Notion page, shows the published index.
- **SC-005**: After one publication of each repository, in either order, 100% of the site's existing pages and the add-on index still answer.
- **SC-006**: The glossary, the organization profile, the site's build table and the site's hosts each name the Notion host: 4 of 4.
- **SC-007**: A contributor can start the first add-on's feature with `/speckit-companion-specify` without first changing any rule, glossary entry or repository setting.

## Assumptions

- A Notion add-on is a web page that Notion shows through its embed block. An integration that uses Notion's own programming interface, or a listing in a Notion marketplace, is not part of this feature.
- This feature delivers no tool. The first add-on, and the question of where its document's model is stored, are features of their own.
- The domain `etalii.net` stays with the one GitHub Pages site it is attached to today. How the Notion repository's content comes to be served on that domain under `/adp-notion`, beside the site's `/adp`, is for the plan, as is any amendment to the site principle that says no other repository is involved in the site.
- The repository keeps the `ide` segment in its name although Notion is not an IDE, because the name was given and matches the other hosts.
- The index and the add-ons are in English, as the site is.
- The repository is empty, so renaming it loses nothing; GitHub redirects the old name.

## Verbatim Constraints

- Repository name: `etalii.adp.ide.notion`
- Published address: `https://etalii.net/adp-notion`
