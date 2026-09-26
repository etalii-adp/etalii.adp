# Creating a new repository in etalii-adp

The rules every repository in the `etalii-adp` GitHub organization follows. Work through the list when a repository is created, so none of them is forgotten.

## Name

- All lowercase, dot-separated, starting with `etalii.adp`: `etalii.adp` for the specifications, `etalii.adp.ide.<ide>` for an IDE host (`standalone`, `intellij`, `vscode`, `eclipse`).
- Private, in the `etalii-adp` organization, not under a personal account.
- One exception: `etalii-adp.github.io`, the organization's GitHub Pages site, is public, because the free plan serves Pages only from public repositories. It holds the `etalii.net` domain, redirects its root to `/adp`, and receives the website built in `etalii.adp.site` in its `adp/` folder.

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
- **No branch protection or rulesets.** On the free plan they are not enforced on private repositories, and the paid plan was declined (2026-09-26). The pull-request rule above is kept by convention, in the repository's `CLAUDE.md`, so agents must never push to `develop` directly.

## Files the repository starts with

- **`CLAUDE.md`** stating the branch and delivery rules above, so every agent reads them. `etalii.adp.ide.eclipse/CLAUDE.md` is the smallest complete example to copy, Spec Kit section included.
- **GitHub Spec Kit with the SpecKit Companion extension**, copied from `etalii.adp.ide.intellij`: `.specify/` and the `speckit-*` skills under `.claude/skills/`, with `branch_prefix: "features"` in `.specify/extensions/git/git-config.yml` so Spec Kit's branches are `features/<number>-<name>`. Start `.specify/memory/constitution.md` from the template and ratify it with `/speckit-constitution`. Add a `.gitattributes` that keeps `*.sh` LF, and ignore `__pycache__/`, `*.pyc`, `.claude/settings.local.json` and `.trace.jsonl`. The one repository without it is `etalii.adp.ide.standalone`, which plans with spec-workflow.
- **A CI workflow** once there is something to build or test, running on pull requests into `develop`, so a pull request shows whether it is green before it is merged.

## Access for Claude

- **The Claude GitHub app** is installed on the organization; check the new repository is covered (all repositories, or add it to the selected list).
- **Add the repository to the Claude project's settings** (Project settings → Resources), so threads can clone it.
- **Name clash:** a cloud session checks every repository out at `<name>`, so two repositories with the same name under different owners cannot share a session.
