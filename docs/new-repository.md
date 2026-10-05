# Creating a new repository in etalii-adp

The rules every repository in the `etalii-adp` GitHub organization follows. Work through the list when a repository is created, so none of them is forgotten.

## Name

- All lowercase, dot-separated, starting with `etalii.adp`: `etalii.adp` for the specifications, `etalii.adp.ide.<ide>` for an IDE host (`standalone`, `intellij`, `vscode`, `eclipse`).
- Public, in the `etalii-adp` organization, not under a personal account (every repository was made public on 2026-09-27, so its build badge shows to every visitor and its workflows run on GitHub's hosted runners for free).
- `etalii.adp.site`, the website, serves GitHub Pages with the `etalii.net` domain, under `/adp`, and redirects the root there.

## Branches

- **Default branch: `develop`.** Create it as the first branch, or rename `main`/`master` to it straight away (Settings → General → Default branch).
- **Feature work on `features/<name>`**, one branch per feature, in its own worktree. The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.

## Delivery

- **Nothing reaches `develop` except through a pull request.** A feature branch is never merged locally into `develop`, by a person or an agent.
- **Merge with a merge commit**, never a squash or a rebase, so a worktree's branch can be recognised as landed afterwards.
- **After the pull request is merged or closed**, delete the branch locally and on `origin`, and remove the worktree.

## GitHub settings (Settings → General)

- **Pull Requests:** tick only "Allow merge commits"; untick "Allow squash merging" and "Allow rebase merging".
- **Tick "Automatically delete head branches".**
- **No branch protection or rulesets.** They were not available while the repositories were private on the free plan, and the paid plan was declined (2026-09-26). The pull-request rule above is kept by convention, in the repository's `CLAUDE.md`, so agents must never push to `develop` directly.

## Files the repository starts with

- **`CLAUDE.md`** stating the branch and delivery rules above, so every agent reads them. `etalii.adp.ide.eclipse/CLAUDE.md` is the smallest complete example to copy, including its section saying that the repository's specifications are written in `etalii.adp`.
- **No Spec Kit setup of its own.** Every repository's features are specified in `etalii.adp`'s `specs/`, with `etalii.adp`'s `.specify/` and skills (since 2026-10-05). If the new repository has principles of its own, they go in `etalii.adp/.specify/memory/repositories/<repository>.md`. Add a `.gitattributes` that keeps `*.sh` LF, and ignore `.claude/settings.local.json`. `etalii.adp.ide.standalone` keeps its own planning, with spec-workflow.
- **`LICENSE`** with the Apache License 2.0 text, copied from any other repository, with the appendix's copyright line filled in as `Copyright © Peter Vrenken 2026` rather than left as the template's `Copyright [yyyy] [name of copyright owner]`, so the site can record the copyright holder beside the licence.
- **`.github/workflows/build.yml`, named `Build`, in the first pull request**, following `specs/001-ci-and-badges/contracts/build-workflow.md` in `etalii.adp`: it runs on pull requests into `develop`, on `develop` and on manual dispatch, every job on `ubuntu-latest`, and checks whatever the repository holds, even before there is code to build. On pull requests it also runs a `terminology` job that checks the repository against the ADP glossary, fetching `.github/scripts/terminology-check.py` and `docs/terminology-check.json` from `etalii.adp`'s `develop` (spec 002); copy that job from any existing repository's `build.yml`.
- **`README.md`** with the repository's name, one line on what it is for, and its build badge on the line after the heading, exactly as `specs/001-ci-and-badges/contracts/badge.md` in `etalii.adp` gives it.
- **A row in both build tables**: the organization profile (`.github`, `profile/README.md`) and the site (`etalii.adp.site`, `src/data/builds.ts`). Renaming the repository or its workflow, or making it private, updates the readme and both tables in the same change.

## Access for Claude

- **The Claude GitHub app** is installed on the organization; check the new repository is covered (all repositories, or add it to the selected list).
- **Add the repository to the Claude project's settings** (Project settings → Resources), so threads can clone it.
- **Name clash:** a cloud session checks every repository out at `<name>`, so two repositories with the same name under different owners cannot share a session.
