# Contract: Build Workflow

What every product repository's `.github/workflows/build.yml` satisfies. Repository-specific steps are in [research.md](../research.md) R2 to R6.

## Shape

```yaml
name: Build

on:
  pull_request:
    branches: [develop]
  push:
    branches: [develop]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  <job>:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<current major>
      # one named step per check, so a failing run names the check (FR-004)
```

## Rules

| Rule | Requirement |
| --- | --- |
| File is `.github/workflows/build.yml` and `name:` is `Build` | FR-002 |
| Triggers are `pull_request` and `push` on `develop`, plus `workflow_dispatch` | FR-003, FR-006 (re-run from the Actions tab needs no push either way) |
| Every job has `runs-on: ubuntu-latest`; no `vars.RUNS_ON` | FR-008 |
| Top-level `permissions: contents: read`; a job that publishes asks for more itself and runs only when `github.event_name == 'push'` | FR-007 |
| Each check is its own named step, judged by its exit code | FR-004 |
| No step uses a secret in a `pull_request` run | FR-007 |
| Passes `actionlint` | Plan testing |

## Per repository

| Repository | Checks | Artifact |
| --- | --- | --- |
| `etalii.adp` | `python .github/scripts/validate-examples.py` | none |
| `etalii.adp.ide.standalone` | its existing four gates; release job unchanged apart from the runner | release on `develop`, as today |
| `etalii.adp.ide.intellij` | `xvfb-run ./gradlew build` on JDK 25 | the plug-in zip from `build/distributions/` |
| `etalii.adp.ide.vscode` | `check-files.py`: JSON and YAML parse, markdown links resolve | `plugin` job: `.vsix` once `package.json` exists, skipped with a notice before |
| `etalii.adp.ide.eclipse` | `check-files.py`: JSON and YAML parse, markdown links resolve | `plugin` job: update-site zip once `pom.xml` exists, skipped with a notice before |
| `etalii.adp.site` | the jobs of today's `ci.yml`, unchanged apart from the runner | none (deployment stays in `deploy.yml`) |

## Plug-in job (VS Code and Eclipse)

```yaml
  plugin:
    needs: check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<current major>
      - id: detect
        run: |
          if [ -f <build file> ]; then echo "present=true" >> "$GITHUB_OUTPUT"
          else echo "present=false" >> "$GITHUB_OUTPUT"
               echo "No plug-in code yet: nothing to build." >> "$GITHUB_STEP_SUMMARY"
               echo "::notice::No plug-in code yet: nothing to build."
          fi
      - name: Build the plug-in
        if: steps.detect.outputs.present == 'true'
        run: <packaging command>
      - name: Offer the plug-in for download
        if: steps.detect.outputs.present == 'true'
        uses: actions/upload-artifact@<current major>
        with:
          name: <repo>-plugin
          path: <package path>
          if-no-files-found: error
```

The upload only runs after the build step succeeded, because a failed step stops the job (FR-011).
