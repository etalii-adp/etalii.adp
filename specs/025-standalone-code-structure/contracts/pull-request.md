# Contract: a pull request of this feature in `etalii.adp.ide.standalone`

Every pull request that carries a task of this feature meets all of this (FR-003 to FR-008). It restates standalone's own rules, from its `CLAUDE.md` at `develop` `a421ed4`, and adds what this feature needs. Where the two ever disagree, standalone's `CLAUDE.md` wins and this file is corrected.

## Before the first commit

- A dedicated worktree `.claude/worktrees/<short-name>/` on a branch `features/025-<task>`, created from the current `develop`. Never the main checkout.
- `git config --worktree user.name "agent-<N>-<task>"` set the moment the worktree is created, and read back with plain `git config user.name`. Never `--global`; never `user.email`.
- The newly created worktree is built once before anything is changed, so that a break upstream of code generation is seen as such.

## What the change holds

- **One purpose.** A shared type with its first consumer and its contract test, or one module's adoption, or one defect with its guard. Not two modules, and not a type without a consumer (FR-008).
- **No behaviour change**, unless the change is a defect's correction or a ruled row of [behaviour-changes.md](../behaviour-changes.md) (FR-001, FR-002). A row found on the way is added to the register, and the task waits for its ruling.
- **A guard seen to fail** for every defect corrected, with the failing output in the description (FR-005). A guard that passes against the defect is deleted, not kept.
- **The documentation it makes false**: `docs/architecture.md`, `docs/solution-structure.md`, `docs/creating-a-diagram-module.md`, `docs/creating-a-designer-module.md`, `docs/creating-an-editor-module.md`, `docs/dependencies.md` for a package, `docs/tools.md` for a tool type's state, and the figures in `ArchitecturePages.Tests` (FR-004).
- **Comments in the files it touches**: what the code does and why stays; when and under which task goes to the commit message (FR-007). No file is opened only for this.
- **A module that keeps a type of its own** where a shared one exists says why in one sentence at that type.
- **`.DotSettings` entries** move with the folders they name, and a new project gets its own.
- **No warning**: nothing new at severity Warning or higher in JetBrains InspectCode, and nothing silenced at the place it occurs.

## Before pushing

Each of the four gates exits zero, judged by an exit code captured into a variable before any other command runs:

1. `npm test` (in `src/client`)
2. `npm run typecheck` (in `src/client`)
3. `dotnet format style --verify-no-changes --severity info` (in `src/backend`, against `EtAlii.Adp.slnx`)
4. `dotnet test --solution EtAlii.Adp.slnx` (in `src/backend`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`); "Zero tests ran" is a broken build

And `bash .github/tools/inspect/inspect.sh` exits zero, after `dotnet tool restore`. It is what the `inspection` job of the Build workflow runs.

Commits are made with an explicit pathspec that names files.

## The description

```markdown
<attribution lines, as the session's instructions give them>

Spec: etalii-adp/etalii.adp `specs/025-standalone-code-structure/`, tasks T<nnn>[, T<nnn>] as of etalii.adp `<commit>`.

Before: <what the code was, in a sentence or two, for a reader who has not seen the report>.

After: <what it is now>.

How: <the types added, moved or deleted; the modules touched>.

Measured: <lines and files removed, from `git diff --shortstat`; for a module adoption, the role classes deleted>.

Behaviour: unchanged | corrected defect D<n> | register row B-<nn>, ruled <date>.

Guard: <for a defect: the test, and its failing output against the uncorrected code>.

Documentation: <the pages changed, or "none made false">.

Gates: format <exit>, npm test <exit>, typecheck <exit>, dotnet test <exit>, inspect <exit>.

Not included: <what a reader might expect here and will find in a later task>.
```

## After the merge

- Merged with a merge commit, never a squash or a rebase.
- The branch is deleted locally and on `origin`, and the worktree retired with `.github/tools/gate/retire.sh <name>`, after the main checkout's `develop` is brought up to date.
- The task is ticked in `etalii.adp`'s `specs/025-standalone-code-structure/tasks.md`, in the next review's pull request or in a small pull request of its own. Not before the merge (FR-014).
