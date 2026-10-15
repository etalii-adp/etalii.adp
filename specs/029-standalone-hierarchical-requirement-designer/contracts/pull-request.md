# Contract: a pull request of this feature in `etalii.adp.ide.standalone`

Every pull request that carries a task of this feature meets all of this. It restates standalone's own rules, from its `CLAUDE.md` at `develop` `b35336639`, the way [spec 025's pull-request contract](../../025-standalone-code-structure/contracts/pull-request.md) does, and adds what this feature needs. Where the two ever disagree, standalone's `CLAUDE.md` wins and this file is corrected.

## Which pull request

Eleven, in this order, each cut from `develop` after the one before it is merged (R2, plan, Delivery). No two are in work at once, because `designers.proto`, the conformance harness and `src/client/src/hierarchySurface/library/` are extended by several of them.

| # | Branch | Closes | Requirements |
|---|---|---|---|
| 1 | `features/029-fbl-bullets` | | FR-024 (library), FR-029 (part) |
| 2 | `features/029-fbl-registration-blocks` | | FR-028, FR-029 |
| 3 | `features/029-envelope-routing` | | FR-002, FR-003, FR-004 |
| 4 | `features/029-hierarchical-requirement-model` | US3 | FR-026, FR-027, FR-029, FR-031, SC-006 |
| 5 | `features/029-hierarchy-surface` | US1 | FR-001, FR-006 to FR-011, FR-030, FR-032, SC-007, SC-009 |
| 6 | `features/029-two-writers` | US2 | FR-022 to FR-025, SC-003 |
| 7 | `features/029-shaping` | US4 | FR-005, FR-012 to FR-014 |
| 8 | `features/029-assessments` | US5 | FR-015, FR-016 |
| 9 | `features/029-references` | US6 | FR-017, FR-018 |
| 10 | `features/029-tags` | US7 | FR-011 (tags), FR-004 (deleting the registration), SC-008 |
| 11 | `features/029-narrowing` | US8 | FR-019 to FR-021 |

None is opened before spec 025 is done, the maintainer has given the word, and the paths in `tasks.md` have been corrected against the host as it is then, by a pull request in `etalii.adp` (R1).

## Before the first commit

- A dedicated worktree `.claude/worktrees/<short-name>/` on the branch of the table, created from the current `develop`. Never the main checkout.
- `git config --worktree user.name "agent-<N>-<task>"` set the moment the worktree is created, and read back with plain `git config user.name`. Never `--global`; never `user.email`.
- The new worktree is built once before anything is changed, so that a break upstream of code generation is seen as such.
- One Developer owns this feature until every task is done; no other Developer works on it.

## What the change holds

- **One story, or one foundation**, as the table gives it. A shared type comes with its first consumer in the same pull request: `IHierarchySurfaceSession` with the module's session, the `bullets` reader with its fixtures (constitution V, R2).
- **Every byte written is the one a fixture states.** No pull request writes a file in a way that `specifications/fbl/fixtures/` does not fix (plan, Constraints).
- **The corpus copies are unchanged.** Fixtures and definition files are copied under `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/` in etalii.adp's layout, byte for byte, and the copy is logged in the corpus `readme.md` with the etalii.adp commit it came from (R14). What the work finds wrong in a fixture, a language or the definition goes back to `etalii.adp`, not into the copy (spec, Out of Scope).
- **The vendored definition** in `src/designers/hierarchical-requirement/definition/` is a byte copy of `etalii.adp/definitions/designers/hierarchical-requirement.*`, with `provenance.json` naming the commit; `.gitattributes` gains `src/designers/*/definition/*.md -text` in the pull request that first vendors it (R15).
- **A guard seen to fail first**: the planted defect of User Story 3 and every refusal test run against the code without the change, and the failing output is in the description.
- **Every new contract follows the identifiers of** [hierarchy-surface.md](hierarchy-surface.md) and [routing-and-adding.md](routing-and-adding.md). A pull request that has to differ from them corrects the contract here first.
- **A browser check per story** in `tests.md`, in both themes, for pull requests 5 to 11.
- **The documentation it makes false**: `docs/tools.md`, `docs/creating-a-designer-module.md` (already stale, corrected in pull request 4), `docs/architecture.md`, `docs/solution-structure.md`, and the figures in `ArchitecturePages.Tests`.
- **One entity per file, no nested types, POCOs in `_Model/`**; a new project gets its own `.csproj.DotSettings`.
- **No warning**: nothing new at severity Warning or higher in JetBrains InspectCode, and nothing silenced at the place it occurs.

## Before pushing

Each of the four gates exits zero, judged by an exit code captured into a variable before any other command runs:

1. `npm test` (in `src/client`)
2. `npm run typecheck` (in `src/client`)
3. `dotnet format style --verify-no-changes --severity info` (in `src/backend`, against `EtAlii.Adp.slnx`)
4. `dotnet test --solution EtAlii.Adp.slnx` (in `src/backend`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`); "Zero tests ran" is a broken build

And `bash .github/tools/inspect/inspect.sh` exits zero, after `dotnet tool restore`.

Commits are made with an explicit pathspec that names files.

## The description

```markdown
Spec: etalii-adp/etalii.adp `specs/029-standalone-hierarchical-requirement-designer/`, tasks T<nnn>[, T<nnn>] as of etalii.adp `<commit>`.

Pull request <n> of 11: <its title from the table>. Closes: <User Story n, or "a foundation">.

Requirements: <the FR and SC it satisfies>.

What: <the types, messages, folders and files added or changed>.

Fixtures: <the fixture folders the conformance run replays after this change, and the count that pass>.

Guard: <the planted defect or refusal test, and its failing output against the code without the change>.

Browser check: <the tests.md entry, run in the light and the dark theme>, or "none: no client change".

Documentation: <the pages changed, or "none made false">.

Gates: format <exit>, npm test <exit>, typecheck <exit>, dotnet test <exit>, inspect <exit>.

Not included: <what a reader might expect here and will find in a later pull request>.

<attribution lines, as the session's instructions give them>
```

## After the merge

- Merged with a merge commit, never a squash or a rebase. The merge is the maintainer's.
- The branch is deleted locally and on `origin`, and the worktree retired with `bash C:/git/EtAlii.Adp/.github/tools/gate/retire.sh <name>`, after the main checkout's `develop` is brought up to date.
- The task is ticked in etalii.adp's `specs/029-standalone-hierarchical-requirement-designer/tasks.md` only once this pull request is merged, never when its code is merely written or pushed.
- After pull request 11, SC-001, SC-002, SC-004 and SC-005 are observed and recorded in `measurements.md` in this folder, by a pull request in `etalii.adp` (R18).
