# Contract: Repository Settings

The state of `etalii.adp.ide.notion` on GitHub that is no file, and the files it starts with. It is [docs/new-repository.md](../../../docs/new-repository.md) applied to this repository; where the two differ, that document rules. Each row can be read back with `gh api repos/etalii-adp/etalii.adp.ide.notion` unless it says otherwise.

## Identity

| Setting | Value | Requirement |
| --- | --- | --- |
| Owner | `etalii-adp` | FR-001 |
| Name | `etalii.adp.ide.notion` | FR-001, Verbatim Constraints |
| How it got the name | the existing repository `etalii-adp-ide-notion` renamed; no second repository | FR-001 |
| Old name | `etalii-adp/etalii-adp-ide-notion` redirects to it; nothing is created under the old name afterwards, since that would end the redirect | US1 scenario 4 |
| Visibility | public | FR-002 |
| Description | uses the glossary's term "add-ons", not "addons" | D10 |

## Settings

| Setting | API field | Value | Requirement |
| --- | --- | --- | --- |
| Default branch | `default_branch` | `develop` | FR-002 |
| Allow merge commits | `allow_merge_commit` | `true` | FR-002 |
| Allow squash merging | `allow_squash_merge` | `false` | FR-002 |
| Allow rebase merging | `allow_rebase_merge` | `false` | FR-002 |
| Automatically delete head branches | `delete_branch_on_merge` | `true` | FR-002 |
| Wiki | `has_wiki` | `false` | D10 |
| Branch protection and rulesets | none | none | `docs/new-repository.md` |
| GitHub Pages | none | not enabled | FR-008: the domain is served by the site's Pages site alone |
| Actions secret | `gh secret list --repo etalii-adp/etalii.adp.ide.notion` | `SITE_DEPLOY_TOKEN`, as [publication.md](publication.md) gives it | FR-011 |

## Branches

| Branch | Rule |
| --- | --- |
| `develop` | Created by the first commit, which holds the starting files. It is the one push that is not a pull request, because an empty repository has no branch to open one against. Everything after it arrives by pull request, merged with a merge commit |
| `features/011-notion-repository` | The branch of the first pull request, named after this feature |

## Starting files

In the first commit on `develop`:

| File | Content | Requirement |
| --- | --- | --- |
| `CLAUDE.md` | The branch and delivery rules, and the section saying the repository's features are specified in `etalii.adp`; copied from `etalii.adp.ide.eclipse/CLAUDE.md` and adapted | FR-002 |
| `LICENSE` | Apache License 2.0, with the line `Copyright © Peter Vrenken 2026` | FR-002 |
| `README.md` | The name `etalii.adp.ide.notion`, one line on what it is for, and the build badge on the line after the heading, as [the badge contract of spec 001](../../001-ci-and-badges/contracts/badge.md) gives it | FR-002 |
| `.gitattributes` | Keeps `*.sh` LF | FR-002 |
| `.gitignore` | Ignores `.claude/settings.local.json` | FR-002 |

In the first pull request:

| File | Content | Requirement |
| --- | --- | --- |
| `.github/workflows/build.yml` | The workflow named `Build`, as [publication.md](publication.md) gives it | FR-003 |
| `.github/scripts/check-files.py` | Copied from `etalii.adp.ide.eclipse` | FR-003 |
| `scripts/build.mjs` | The command of [published-tree.md](published-tree.md) | FR-009 |
| `addons/README.md` | Says that each add-on is one folder here, named by the id of its tool type, and that there is none yet | FR-010 |
| `.editorconfig` | As the other host repositories have it | Plan |

Not there: `.specify/`, `specs/`, `.claude/skills/` or any other Spec Kit setup (FR-002). The repository's principles are in `etalii.adp`, at `.specify/memory/repositories/etalii.adp.ide.notion.md` (FR-007).

## Access for Claude

| Item | State | Who |
| --- | --- | --- |
| The Claude GitHub app | Covers the repository under its new name | Checked by whoever walks the checklist; the app is installed on all repositories of the organization |
| The Claude project's resources | List `etalii.adp.ide.notion` | A maintainer; an agent cannot set it |

## Where the repository is named

Each of these names `etalii.adp.ide.notion` once this feature is delivered, and a rename would change them all in one change:

| Place | Repository |
| --- | --- |
| `README.md` build badge | `etalii.adp.ide.notion` |
| `profile/README.md`, a row in the build table after the Eclipse row | `.github` |
| `src/data/builds.ts`, one entry | `etalii.adp.site` |
| `.github/workflows/deploy.yml`, the checkout | `etalii.adp.site` |
| `CLAUDE.md`, `docs/new-repository.md`, `.specify/memory/constitution.md`, `.specify/memory/repositories/etalii.adp.ide.notion.md` | `etalii.adp` |
| `specs/001-ci-and-badges/contracts/build-workflow.md`, a row in the per-repository table: checks `check-files.py`, artifact `addons` job | `etalii.adp` |
