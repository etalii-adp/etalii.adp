# Data Model: A Notion Host Repository, Published at etalii.net/adp-notion

**Feature**: [notion-repository.spec.md](notion-repository.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

This feature stores no data and defines no file format. Its entities are of four kinds. The **repository entities** are the Notion host repository and what GitHub holds about it. The **published entities** are what a visitor can open under `https://etalii.net/adp-notion`. The **publication entities** are the runs and the secret that carry a merge to that address. The **record entities** are the entries in other files that name the Notion host: the glossary, the principles, the rules, the two build tables and the site's host list. The words tool, tool type, host and Notion add-on keep the meaning [docs/terminology.md](../../docs/terminology.md) gives them once this feature's glossary change is merged.

`FR-` and `SC-` numbers are those of the spec; `D` numbers are the decisions of the research. Where a detail is fixed by a contract, the contract is named and is not repeated here.

## Overview

```text
etalii.adp.ide.notion (Notion host repository)
  ├── starting files, Build workflow, scripts/build.mjs
  └── addons/<id>/  ──one folder per──> Notion add-on ──belongs to──> one tool type (DISL, FBL in etalii.adp)
          │
          │ node scripts/build.mjs --out <dir>
          ▼
     Published tree ── index.html (Add-on index: add-ons, revision)
          │           └── <id>/ (one per add-on)
          │
          │ placed in dist/adp-notion by the site's deploy workflow
          ▼
     Pages deployment of etalii.adp.site ──serves──> https://etalii.net/adp  and  https://etalii.net/adp-notion

merge into develop ──Build passes──> publish job ──SITE_DEPLOY_TOKEN──> Deploy run (etalii.adp.site)

Records that name the host: glossary entry ──first──> repository principles, rules, constitution,
                            build-table rows (profile, site), site host entry
```

## Repository entities

### Notion host repository

`etalii-adp/etalii.adp.ide.notion`, the repository that builds and publishes the Notion add-ons. One of the organization's host repositories.

| Field | Value |
| --- | --- |
| Name | `etalii.adp.ide.notion` |
| Former name | `etalii-adp-ide-notion`, redirected by GitHub |
| Organization | `etalii-adp` |
| Visibility | public |
| Default branch | `develop` |
| Merge methods | merge commit only; squash and rebase off |
| Head branches | deleted on merge |
| Wiki | off (D10) |
| Description | uses the glossary's term "add-ons" (D10) |
| GitHub Pages | none: the repository has no Pages site of its own (D2) |
| Spec Kit setup | none: its features are specified in `etalii.adp` |
| Access for Claude | the Claude GitHub app, and the repository among the Claude project's resources |

**Rules**

- There is exactly one repository for the Notion host. The existing one is renamed; a second **MUST NOT** be created (FR-001).
- Every rule of [docs/new-repository.md](../../docs/new-repository.md) holds for it, with 0 open items when the checklist is walked (FR-002, SC-001). The settings are listed one by one in [contracts/repository-settings.md](contracts/repository-settings.md).
- A link to the former name arrives at the repository (Story 1, scenario 4).
- Its content reaches `develop` only through a pull request merged with a merge commit. The one exception is the first commit with the starting files, because an empty repository has no branch to open a pull request against (plan, Delivery Order 2).

### Starting files

The files the repository has on `develop` before its first pull request.

| File | Holds |
| --- | --- |
| `CLAUDE.md` | The rules for agents: `develop`, feature branches, pull requests only, merge commits, and that features are specified in `etalii.adp` |
| `LICENSE` | Apache License 2.0 |
| `README.md` | What the repository is, with its build badge; the source of the site's host entry |
| `.gitattributes` | Line-ending rules |
| `.gitignore` | The ignore rule |

**Rules**

- The set is the one `docs/new-repository.md` names (FR-002). `.editorconfig` comes with the first pull request, not with the first commit.
- `README.md` **MUST NOT** claim a tool that is not published (FR-007, principle III below).

### Build workflow

`.github/workflows/build.yml`, named `Build`. It follows the build-workflow contract of spec 001 and gains a row in that contract's per-repository table (D9).

| Job | Runs on | Does |
| --- | --- | --- |
| `check` | pull request, push, manual dispatch | `check-files.py`: JSON and YAML parse, markdown links resolve |
| `addons` | the same | `node scripts/build.mjs --out <dir>` and an assertion on its output |
| `terminology` | pull request only | the terminology job of spec 002, against the glossary on `develop` of `etalii.adp` |
| `publish` | push to `develop` only, after the other jobs pass | starts the site's `deploy` workflow (see Publication entities) |

**Rules**

- It is added by the repository's first pull request (FR-003).
- It runs on the latest commit of every pull request into `develop` without anyone starting it, and shows its result on the pull request within 5 minutes (Story 1, scenario 3; SC-002).
- No pull-request run sees a secret, so a pull request, also one from a fork, publishes nothing (FR-011, edge cases).
- The job that the eclipse workflow calls `plugin` is named `addons` here (D10).

### Add-on folder

`addons/<id>/` in the repository: the source of one Notion add-on.

| Field | Meaning |
| --- | --- |
| `<id>` | The id of the add-on's tool type, lowercase with dashes (D5) |
| content | The add-on's own files; their shape is for the first add-on's feature |

**Rules**

- One folder is one add-on, and the folder's name alone decides its address (FR-010).
- This feature creates no add-on folder. `addons/` holds only `README.md`, which is not an add-on (spec, Assumptions).
- An add-on **MUST** take its tool type from a DISL specification and its file formats from FBL bindings in `etalii.adp`, and **MUST NOT** restate them (FR-007).

## Published entities

### Notion add-on

A web page that shows one ADP tool inside a Notion page, through Notion's embed block.

| Field | Meaning |
| --- | --- |
| id | The id of its tool type; the name of its folder |
| tool type | The one tool type it shows |
| address | `https://etalii.net/adp-notion/<id>/` |

**Relationships**: belongs to one tool type; built from one add-on folder; listed once in the add-on index.

**Rules**

- Its address **MUST NOT** change when another add-on is added or removed (FR-010).
- It **MUST** be displayable as an embed inside a Notion page: no page it serves refuses to be framed (FR-014, D6).
- Every address it uses works under `/adp-notion`, never under the root of the domain (FR-007).
- This feature publishes none.

### Add-on index

The page at `https://etalii.net/adp-notion`, written by the build script as `index.html` at the root of the published tree.

| Field | Meaning |
| --- | --- |
| add-ons | One entry per add-on folder, each with its address; the empty list when there is none |
| "none yet" statement | Shown when the list is empty |
| revision | The commit of `etalii.adp.ide.notion` the tree was built from, taken from `git rev-parse HEAD` of its own checkout (D4) |
| language | English |

**Rules**

- It lists every published add-on with its address and says so when there is none (FR-009; Story 2, scenario 2).
- It names the revision of `etalii.adp.ide.notion`, not that of the site, although the site's workflow builds it (FR-009, D4).
- It is generated from the folders found, never written by hand, so it cannot disagree with them (D4).
- It is embeddable like every other published page (FR-014, SC-004).

### Published tree

What `node scripts/build.mjs --out <dir>` writes into `<dir>`. Its exact layout is in [contracts/published-tree.md](contracts/published-tree.md).

| Path | Holds |
| --- | --- |
| `index.html` | The add-on index |
| `<id>/` | One folder per add-on folder, served at `/adp-notion/<id>/` |

**Rules**

- The command line is the contract between the two repositories: the site's workflow knows the command and the output folder and nothing of what is inside (D4; plan, Structure Decision).
- The same command runs in `Build` on every pull request, so a tree that cannot be built is found before it is merged (D4).
- A tree without `index.html` is not published: the site's workflow checks for it and fails (D2).
- The script has no dependency beyond Node (plan, Technical Context).

## Publication entities

### Pages deployment

The one GitHub Pages deployment of `etalii.adp.site`, which serves the whole domain `etalii.net`.

| Part | Source | Served at |
| --- | --- | --- |
| `dist/adp` | The site's own build | `https://etalii.net/adp` |
| `dist/adp-notion` | The published tree of `etalii.adp.ide.notion` at `develop` | `https://etalii.net/adp-notion` |
| the rest of `dist` | The site's `root/` and its 404 page | `https://etalii.net/` |

**Rules**

- A deployment replaces everything on the domain, so every deployment **MUST** contain both parts (FR-012, D2).
- It is served over HTTPS by GitHub Pages and by no other hosting service (FR-008).
- Publishing the Notion repository changes nothing under `/adp`, and publishing the site changes nothing under `/adp-notion`, because both are the same run with both parts in it (FR-012, SC-005).
- From the first deployment that carries `dist/adp-notion`, neither address answers "not found" in between (edge cases; plan, Delivery Order 4).

### Deploy run

One run of `deploy.yml` in `etalii.adp.site`.

| Field | Meaning |
| --- | --- |
| trigger | A push to the site's `develop`, or a `workflow_dispatch`: by the Notion repository's `publish` job or by a maintainer |
| site revision | The site commit the run builds |
| add-on revision | `develop` of `etalii.adp.ide.notion` at the time of its checkout |
| concurrency group | `pages`, without cancelling |
| result | success or failure, shown on GitHub |

**Rules**

- Runs that arrive together are serialised by the concurrency group, and each checks out the latest `develop` of both, so neither repository publishes a state that lacks the other's latest content (edge cases, D2).
- A failed run uploads nothing: the previous version stays served and the failure shows as a failed run (FR-013).
- The site's tests and checks run before every publication, so a failing site check holds back an add-on (D2, accepted consequence).
- The checkout of the Notion repository needs no token, because the repository is public (D2).

### Publish job

The `publish` job of `Build` in `etalii.adp.ide.notion`.

| Field | Meaning |
| --- | --- |
| condition | `push` to `develop`, after every other job passed |
| action | `gh workflow run deploy.yml --repo etalii-adp/etalii.adp.site --ref develop` |
| credential | The secret `SITE_DEPLOY_TOKEN` |

**Rules**

- A merge into `develop` publishes without a manual step, within 15 minutes (FR-011, SC-003).
- It never runs for a pull request (FR-011; Story 2, scenario 3).
- When it fails, for instance on an expired token, the failure is visible and nothing published changes; the next site deployment still carries the latest add-ons (D3).

### Deployment token

The secret `SITE_DEPLOY_TOKEN` of `etalii.adp.ide.notion`.

| Field | Value |
| --- | --- |
| kind | Fine-grained personal access token of the maintainer |
| repository access | `etalii.adp.site` only |
| permission | "Actions: read and write", and no other |
| lifetime | Expires, at most a year after it is made |
| used by | The `publish` job, on `push` only |

**Rules**

- It is created and stored by a maintainer, once, before the Notion repository's first pull request merges; an agent cannot do this (plan, Scale note).
- It is the only secret this feature adds (plan, Constraints).

### State transitions: one change to an add-on or the index

```text
pull request open ──Build fails──> not mergeable                      (nothing published)
        │
        │ Build passes, maintainer merges
        ▼
merged into develop ──Build on push fails──> not published            (previous version served)
        │
        │ publish job starts the site's deploy
        ▼
Deploy run queued ──> running ──fails──> not published                (previous version served, failed run on GitHub)
                         │
                         │ succeeds
                         ▼
                    served at https://etalii.net/adp-notion
```

The details of each step are in [contracts/publication.md](contracts/publication.md).

### State transitions: the address during delivery

| After | `https://etalii.net/adp-notion` |
| --- | --- |
| The `etalii.adp` pull request merges | not found |
| The Notion repository's first pull request merges | not found: its `publish` job republishes the site as it is |
| The site's pull request merges | serves the index, with no add-on |
| Any later publication of either repository | serves the index and every add-on on `develop` |

## Record entities

### Glossary entries

In `docs/terminology.md` of `etalii.adp`.

| Term | After this feature |
| --- | --- |
| **Host** | An environment that ADP's tools run in: standalone, IntelliJ, VS Code, Eclipse or Notion |
| **IDE host** | Kept, for the four hosts that are IDEs |
| **Notion add-on** | A web page that shows one tool inside a Notion page |
| "the Notion workspace" | The wording used where the glossary means the workspace that holds the catalogue, not the host |

**Rules**

- The definition of a host **MUST NOT** require it to be an IDE (FR-005).
- This change is made before any other file uses the terms: it is the first commit of the first pull request (FR-005; plan, Delivery Order 1).
- "IDE host" keeps its meaning wherever it is used today, so the FBL specification, the tool definitions and the site's principle III are not changed (D8).
- The glossary's two mirrors follow: the Notion page "ADP terminology" when the pull request merges, and the site's terminology pages through the site's refresh (D9).

### Repository principles

`.specify/memory/repositories/etalii.adp.ide.notion.md` in `etalii.adp`, version 1.0.0: the rules a plan for the Notion host repository is checked against. The file has the shape of the other repositories' principles: the note that says where it is amended, Terminology, Core Principles, constraints, Development Workflow and Governance. The draft of its principles:

| Principle | States |
| --- | --- |
| I. One Source of Truth | An add-on **MUST** take its tool type from a DISL specification and its file formats from FBL bindings in `etalii.adp`, and **MUST NOT** restate them. A difference is raised as a change in `etalii.adp`, never settled in the add-on. |
| II. Every Address under `/adp-notion` | Every address the repository publishes **MUST** work under `https://etalii.net/adp-notion`. Each add-on has one address, `/adp-notion/<id>/`, which **MUST NOT** change when another is added or removed. A published page **MUST NOT** refuse to be shown inside a Notion page. |
| III. Truthful About What Exists | The repository, its `README.md` and its index **MUST NOT** claim a tool that is not published. The index is generated from what is there. |
| IV. Simplicity | A dependency, a build step or a hosting service **MUST** be justified by a current requirement. Publication is by GitHub Pages only, through the site's deployment. |

**Rules**

- Principles I to III are the minimum FR-007 names; none may be left out.
- The file writes the RFC 2119 key words in plain capitals, as the other principles files do; the bold in the table above is this document's (plan, Constitution Check III).
- The plan of this feature is checked against this draft, and a later plan for the repository against the merged file.

### Rule and constitution entries

| File in `etalii.adp` | Change |
| --- | --- |
| `CLAUDE.md` | `etalii.adp.ide.notion` joins the repositories whose features are specified here (FR-006) |
| `docs/new-repository.md` | The name rule and the Pages rule name the Notion host (FR-006) |
| `.specify/memory/constitution.md` | The preamble and the list of principles files gain the repository; 1.5.0 to 1.6.0 |
| `.specify/memory/repositories/etalii.adp.site.md` | The host list gains Notion, and the constraint that only the site's repository is involved in `etalii.net` is amended; 1.1.0 to 1.2.0 |
| `specs/001-ci-and-badges/contracts/build-workflow.md` | The per-repository table gains a row (D9) |

**Rules**

- The two amendments are MINOR and are made through `/speckit-constitution` (plan, Constitution Check and Complexity Tracking).
- After them, a contributor can start the first add-on's feature without changing a rule, a glossary entry or a repository setting (SC-007).

### Build-table row

One row for `etalii.adp.ide.notion` in each of the two build tables.

| Table | Where | Entry |
| --- | --- | --- |
| Organization profile | `profile/README.md` in `.github` | One row, after eclipse, with the live badge of `build.yml` |
| Site home page | `src/data/builds.ts` in `etalii.adp.site` | `{ repository: 'etalii.adp.ide.notion', public: true, workflow: 'build.yml' }` |

**Rules**

- Both tables gain the row, and the two stay in step (FR-004; Story 3, scenario 2).
- A row is added only after `Build` has run on the Notion repository's `develop`, so its badge shows a status (plan, Scale note).

### Site host entry

The `notion` entry in `src/data/hosts.yaml` of `etalii.adp.site`, in the shape the other four entries have.

| Field | Value |
| --- | --- |
| `id` | `notion` |
| `name` | Notion |
| `summary` | What the host is, taken from the Notion repository's `README.md` |
| `state` | `planned` |
| note | No tool is available yet |
| `source` | `etalii-adp/etalii.adp.ide.notion`, `README.md`, at its merged commit, with the date taken and the licence `Apache-2.0` |

**Relationships**: its place in the list comes from `listedHostIds` in `src/data/order.ts`, which is the four `hostIds` followed by `notion`. The hosts collection and `HostList.astro` use `listedHostIds`; the tool catalogue keeps `hostIds` (D7).

**Rules**

- The site names Notion as a host and states that no tool is available in it (FR-015; Story 3, scenario 3).
- Notion is a listed host, not a catalogue host: no tool gets a Notion state, redirect or column until the first add-on (D7).
- The entry is sourced, never retyped: its source record points at a merged commit of the Notion repository (site principle II).

## What this feature does not model

- A tool, a tool type or an add-on's own files: the first add-on is a feature of its own.
- Where an add-on's document and its model are stored.
- An integration with Notion's programming interface, or a listing in a Notion marketplace.
- Notion as a fifth host of the site's tool catalogue.
