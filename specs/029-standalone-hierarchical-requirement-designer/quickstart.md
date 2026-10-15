# Quickstart: taking a task of feature 029 to a merged pull request

For the one developer who owns this feature until every task is done. The repositories sit side by side: `C:\git\etalii.adp` and `C:\git\etalii.adp.ide.standalone` locally, `/home/user/<repository>` in a cloud session.

## Before the first task

1. Check that spec 025 is done and that the maintainer has given the word. Neither is implied by this plan being merged.
2. Read, in this order: the specification; [plan.md](plan.md); [research.md](research.md); and in standalone, `CLAUDE.md`, `docs/architecture.md`, `docs/creating-a-designer-module.md` and the Knowledge designer under `src/designers/knowledge/`.
3. Do the re-read task (R1): find each path [tasks.md](tasks.md) names in the host as it is, and correct the ones spec 025 moved, in a pull request here.

## One pull request

1. **Worktree and identity**, in `etalii.adp.ide.standalone`:

   ```bash
   git worktree add .claude/worktrees/029-<pull-request> -b features/029-<pull-request> origin/develop
   ```

   ```bash
   git -C .claude/worktrees/029-<pull-request> config --worktree user.name "agent-<N>-029-<pull-request>"
   ```

   Build the fresh worktree once before changing anything.
2. **For a copy into the corpus**: copy the files from `etalii.adp` at the commit `tasks.md` names, unchanged, under `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/` in their source layout, and add the copy to the corpus `readme.md` with that commit.
3. **For a refusal or a guard**: write the test, run it against the code without the change, and keep the failing output for the description.
4. **Make the change**, with its tests, the browser check in `tests.md` for a user story, and the documentation it makes false.
5. **Run the gates and the inspection** as [contracts/pull-request.md](contracts/pull-request.md) lists them, each judged by its captured exit code.
6. **Push and open the pull request** into `develop`, naming this folder and the `etalii.adp` commit `tasks.md` was read at.
7. **After the merge**: delete the branch, retire the worktree, and tick the pull request's tasks here in a pull request of this repository.

## Checking this folder

In `etalii.adp`, after any edit here:

```bash
python .github/scripts/terminology-check.py --name etalii.adp
```

```bash
python .github/scripts/validate-examples.py
```

```bash
python .github/scripts/licence-check.py
```
