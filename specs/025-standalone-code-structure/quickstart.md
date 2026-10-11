# Quickstart: taking a task of feature 025 to a merged pull request

For the developer who owns this feature, and for the Architect who writes its reviews. The two repositories sit side by side: `C:\git\etalii.adp` and `C:\git\etalii.adp.ide.standalone` locally, `/home/user/<repository>` in a cloud session.

## Before the first task

1. Read, in this order: the specification's *Milestones* and *Decision points*; [plan.md](plan.md); the section of the report, [analysis-2026-10-10.md](analysis-2026-10-10.md), that your milestone cites; and in standalone, `CLAUDE.md`, `docs/architecture.md` and `docs/solution-structure.md`.
2. Check the decision points. A task whose line in [tasks.md](tasks.md) names `DP-n` does not start until the specification records the maintainer's ruling for it (FR-013).
3. Check that the previous milestone's review is merged in `etalii.adp` (FR-010). For M0 there is none.

## One task

1. **Worktree and identity**, in `etalii.adp.ide.standalone`:

   ```bash
   git worktree add .claude/worktrees/025-<task> -b features/025-<task> origin/develop
   ```

   ```bash
   git -C .claude/worktrees/025-<task> config --worktree user.name "agent-<N>-025-<task>"
   ```

   Build the fresh worktree once before changing anything.
2. **Read the task's evidence.** Each task names its report section. Open the files it cites and confirm they still say what the report says: `develop` has moved since `fcb64c9`. If they do not, the task is reduced or struck at the next review, and you say so now rather than refactor from a stale reading.
3. **For a task under FR-012** (a parser, a writer, an action or property provider): read the module's `.spec-workflow/specs/<module>-disl-fbl/` first. If it has implementation logs, stop and report.
4. **For a defect**: write the guard, run it against the uncorrected code, keep the failing output. Then correct.
5. **For a join of copies**: diff the copies first. A difference that is a decision becomes a named parameter. A difference that is drift is a row in [behaviour-changes.md](behaviour-changes.md), and the task waits for its ruling.
6. **Make the change**, with its tests, and the documentation it makes false.
7. **Run the gates and the inspection**, as [contracts/pull-request.md](contracts/pull-request.md) lists them, each judged by its captured exit code.
8. **Push and open the pull request** into `develop`, with the description of the contract. Name the feature folder and the `etalii.adp` commit your `tasks.md` was read at.
9. **After the merge**: delete the branch, retire the worktree, and note the task for ticking.

## Closing a milestone

1. Run the measurements on the last merge:

   ```bash
   bash .github/tools/analysis/measure.sh --out ../etalii.adp/specs/025-standalone-code-structure/reviews/M<n>-measurements.json
   ```

2. In `etalii.adp`, on `features/025-review-m<n>`, write `reviews/M<n>-review.md` by [contracts/milestone-review.md](contracts/milestone-review.md), update `tasks.md`, and open the pull request into `develop`.
3. Wait for the merge. It is the maintainer's go-ahead for the next milestone.

## Checking the feature's own documents

In `etalii.adp`, after any edit to this folder:

```bash
python .github/scripts/terminology-check.py --name etalii.adp
```

```bash
python .github/scripts/validate-examples.py
```

```bash
python .github/scripts/licence-check.py
```

And the coverage check of [tasks.md](tasks.md), *Coverage*: every `FR-` of the specification appears beside at least one task, or in the list of requirements no task can claim.
