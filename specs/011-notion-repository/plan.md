# Implementation Plan: A Notion Host Repository, Published at etalii.net/adp-notion

**Branch**: `features/011-notion-repository` | **Date**: 2026-10-07 | **Spec**: [notion-repository.spec.md](notion-repository.spec.md)

**Scale note**: this change spans four repositories (`etalii.adp`, `etalii.adp.ide.notion`, `etalii.adp.site`, `.github`), about twenty files, four pull requests and a handful of GitHub settings that are no file at all. Watch the order: the glossary merges first, the Notion repository's first pull request second, and the site and the profile only after `Build` has run on the Notion repository's `develop`. Two steps need a maintainer and cannot be done by an agent: creating the token that lets the Notion repository start the site's deployment, and adding the repository to the Claude project's resources.

## Summary

The empty repository `etalii-adp-ide-notion` is renamed to `etalii.adp.ide.notion`, given the organization's settings and starting files, and its first pull request adds the `Build` workflow and a build script that writes what the repository publishes: an index and one folder per add-on.

GitHub Pages serves one site per domain, and `etalii.net` belongs to the Pages site of `etalii.adp.site`. A deployment replaces everything on the domain. So the add-ons are published through the site's existing `deploy` workflow: it checks out `etalii.adp.ide.notion` at `develop`, runs its build script, and places the result in `dist/adp-notion` beside `dist/adp` before uploading the one artifact. A merge into the Notion repository's `develop` starts that workflow with a token. Both publications are then the same run, which is what keeps either from removing the other's pages.

The glossary, the rules, the constitution, the site's principles and the two build tables are updated to name Notion as a host. The site lists Notion on its home page as a planned host with no tool; it does not become a column of the tool catalogue until the first add-on.

The Notion repository's build script is Node with no dependencies, because the site's deployment job already has Node and runs it.

## Technical Context

**Language/Version**: Node 24 for the build script (the version in the site's `.nvmrc`); Python 3.13 for the copied `check-files.py` and terminology job; static HTML for the index.
**Primary Dependencies**: none in the Notion repository. GitHub Actions: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/setup-python@v7`, and in the site `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`, all already in use.
**Storage**: none.
**Testing**: the build script run by `Build` on every pull request, with an assertion on its output; `actionlint` on the workflows; the site's own `npm run test`, `npm run build`, `npm run check`; a manual embed in a Notion page for FR-014.
**Target Platform**: GitHub Pages at `https://etalii.net/adp-notion`, shown in Notion's embed block.
**Constraints**: GitHub Pages only (FR-008); no manual step per publication (FR-011); one secret, used only on `push`.

## Constitution Check

*Gate before Phase 0, re-checked after Phase 1.*

`etalii.adp` constitution 1.4.0:

| Principle | Assessment |
| --- | --- |
| I. One Source of Truth | PASS. The Notion principles forbid an add-on from restating DISL or FBL (FR-007). No specification changes. |
| II. Implementable from the Document Alone | PASS. No specification, schema or example is touched. |
| III. Precise Normative Language | PASS. The new principles file uses the RFC 2119 key words as the other repository principles do. |
| IV. Versioned Specifications | PASS. No specification version changes. |
| V. Simplicity | PASS. One build script with no dependency, one added step in an existing workflow, no new hosting service, no catalogue column before a tool needs it. |
| Structure and Naming | PASS after amendment. The preamble names four IDE hosts and the list of repositories with principles names three; both gain the Notion repository through `/speckit-constitution` (1.4.0 to 1.5.0, MINOR). |
| Development Workflow | PASS. One feature here, one branch and pull request per repository, merge commits. |

`etalii.adp.site` principles 1.1.0:

| Principle | Assessment |
| --- | --- |
| I. Front door and reference | PASS after amendment: its host list gains Notion. |
| II. Sourced, Never Retyped | PASS. The Notion host entry carries a source record pointing at the Notion repository's `README.md` at a merged commit. |
| III. Truthful About What Exists | PASS. Notion is listed as `planned` with the note that no tool is available. The rule on availability "per IDE host" is untouched: Notion is not an IDE host and has no tool to state. |
| Simplicity | PASS. One workflow step and one script-free copy; no new dependency. |
| Hosting and Content Constraints | Justified violation, removed by amendment. See Complexity Tracking. |

`etalii.adp.ide.notion` has no principles yet; this feature writes them (FR-007), and the design below is checked against the draft in [data-model.md](data-model.md).

Re-check after Phase 1: unchanged. The design adds no file or dependency beyond those named here.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
| --- | --- | --- |
| Site principle "This repository is the only one involved" in `etalii.net`: the site's deployment now also carries the Notion repository's output | A Pages deployment replaces the whole domain, so content under `/adp-notion` survives a site deployment only if that deployment contains it | A Pages site of its own for the Notion repository is served at `etalii-adp.github.io/etalii.adp.ide.notion`, not on `etalii.net`. Moving the domain to an organization site would serve each repository under its own name, which gives neither `/adp` nor `/adp-notion`. The principle is amended to 1.2.0 in this feature. |

## Project Structure

### Documentation (this feature)

```text
specs/011-notion-repository/
├── notion-repository.spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── published-tree.md
    ├── publication.md
    └── repository-settings.md
```

### Source Code

```text
etalii.adp/
├── docs/terminology.md                                         # Host redefined, Notion listed, "Notion add-on" defined (first)
├── docs/new-repository.md                                      # name rule and the Pages rule gain the Notion host
├── CLAUDE.md                                                   # list of repositories specified here
├── .specify/memory/constitution.md                             # preamble and list of principles files, 1.5.0
├── .specify/memory/repositories/etalii.adp.ide.notion.md       # new, 1.0.0
├── .specify/memory/repositories/etalii.adp.site.md             # host list and hosting constraint, 1.2.0
└── specs/001-ci-and-badges/contracts/build-workflow.md         # per-repository table gains a row

etalii.adp.ide.notion/                                          # new clone, C:\git\etalii.adp.ide.notion
├── CLAUDE.md, LICENSE, README.md, .gitattributes, .gitignore   # first commit on develop
├── .editorconfig
├── .github/workflows/build.yml                                 # Build: check, addons, terminology, publish
├── .github/scripts/check-files.py                              # copied from etalii.adp.ide.eclipse
├── scripts/build.mjs                                           # writes the published tree
└── addons/README.md                                            # one folder per add-on goes here; none yet

etalii.adp.site/
├── .github/workflows/deploy.yml                                # checks out and builds the Notion repository into dist/adp-notion
├── src/data/builds.ts                                          # one entry
├── src/data/order.ts                                           # listedHostIds = the four hosts and notion
├── src/content.config.ts                                       # hosts collection uses listedHostIds
├── src/components/HostList.astro                               # uses listedHostIds; comment no longer says four IDE hosts
├── src/data/hosts.yaml                                         # notion entry, state planned
├── src/content/docs/index.mdx                                  # "four hosts" sentence
└── CLAUDE.md                                                   # host list in the first paragraph

etalii-adp.github/                                              # the .github repository
└── profile/README.md                                           # one table row, after eclipse
```

Not in a file: the rename and settings of the repository on GitHub, the secret `SITE_DEPLOY_TOKEN`, the Claude project's resources, and the Notion page "ADP terminology", which repeats the glossary.

**Structure Decision**: the Notion repository holds add-ons under `addons/<id>/` and a build script; the site's `deploy` workflow is the single publisher of the domain and pulls the Notion repository in. Nothing in the site's `src/` knows about add-ons.

## Delivery Order

1. `etalii.adp`: one pull request with the glossary change as its first commit, then the rules, the constitution, both principles files and the contract row. Merged first, because the terminology job of every other repository reads the glossary from `develop`.
2. GitHub: rename, settings, first commit on `develop` with the starting files. This is the one push that is not a pull request: an empty repository has no branch to open one against.
3. `etalii.adp.ide.notion`: first pull request with `Build`, the build script and `addons/`. The maintainer adds `SITE_DEPLOY_TOKEN` before it merges. Its `publish` job starts the site's `deploy`, which is harmless before step 4: it republishes the site as it is.
4. `etalii.adp.site`: pull request with the `deploy` step, the build-table entry and the host entry. Merging it publishes `/adp-notion` for the first time, with the site, so neither address answers "not found" in between.
5. `.github`: pull request with the profile row.
6. Verification by [quickstart.md](quickstart.md), then the tasks of steps 3 to 5 are ticked as each pull request merges.
