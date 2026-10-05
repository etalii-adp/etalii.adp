# Contract: the Build workflow of `etalii.adp.ide.vscode`

What the workflow `.github/workflows/build.yml` offers to contributors, maintainers and users (FR-053 to FR-057, user story 1). It is modelled on `etalii.adp.ide.intellij`'s `specs/005-continuous-integration/contracts/ci-interface.md` and keeps what `etalii.adp` spec 001 gives every Build workflow. Versioned releases by a version mark are out of scope (spec, Out of Scope) and are not in this contract.

## Workflow

| Item | Value |
|---|---|
| File and name | `.github/workflows/build.yml`, `name: Build` |
| Triggers | `pull_request` into `develop`; `push` to `develop`; `workflow_dispatch` |
| Permissions | `contents: read` for the workflow; `contents: write` on the `development-build` job only |
| Concurrency | `group: build-${{ github.ref }}`, `cancel-in-progress` for pull requests only |
| Runners | `ubuntu-latest`, hosted |
| Node.js | 22, the lowest release `@vscode/vsce` 4 runs on (research R12) |

## Jobs

| Job | Runs | Needs | Steps, by name |
|---|---|---|---|
| `check` | always | | "Check JSON, YAML and markdown links" (`.github/scripts/check-files.py`, unchanged from spec 001 apart from the allowance in research R14) |
| `build` | always | `check` | `npm ci`; "Build, check and test the plug-in" (`npm run check`: type check, lint, levels 1 and 2 of the tests, production bundles); "Package the plug-in" (`npm run package`, which writes `etalii-adp-<version>.vsix`); "Report the skipped tests"; "Keep the test reports"; "Offer the plug-in for download" |
| `real-ide-tests` | always | `build` | "Take the plug-in the build job made"; `npm ci`; "Run the real-IDE tests" (`xvfb-run -a npm run test:real-ide -- --vsix <file>`); "Report the skipped tests"; "Keep the test reports"; "Keep the IDE logs" (on failure) |
| `development-build` | `github.ref == 'refs/heads/develop'` | `build`, `real-ide-tests` | "Take the plug-in the build job made"; "Publish the development build" |
| `terminology` | pull requests | | as in every repository (spec 002, FR-017), unchanged |

The `plugin` job of today's workflow, which reports itself as skipped until a `package.json` exists, is replaced by `build`; the name follows the IntelliJ workflow. `real-ide-tests` runs after `build` rather than beside it, because it installs the file `build` packaged (FR-042, FR-045) instead of building a second one.

## Downloads from a run

| Item | Value |
|---|---|
| The plug-in | `etalii-adp-<version>.vsix`, uploaded by `actions/upload-artifact` with `archive: false` and no `name`, so the download is the installable file itself, named after the file (FR-054) |
| When | only when the "Package the plug-in" step succeeded; the upload step has no `if:` and `if-no-files-found: error` |
| Retention | GitHub's default, 90 days |
| Test reports | `test-reports` (levels 1 and 2) and `real-ide-test-reports` (level 3): JUnit XML and the HTML report, uploaded with `if: ${{ !cancelled() }}` (FR-056) |
| IDE logs | `real-ide-logs`, on failure of the real-IDE tests only |

## Job summary

Each test job appends to its summary a `## Skipped tests` table (`Test`, `Reason`) or the sentence "No tests were skipped.", on passing runs too (FR-046, FR-056). The script is `.github/scripts/skipped-tests.py`, taken from the IntelliJ repository with its glob set to `reports/**/*.xml`. A failing step names itself in the pull request's check, and its log names the failing test.

## Development build

| Item | Value |
|---|---|
| Tag | `development` |
| Kind | pre-release, `--latest=false` |
| Title | `Development build <version> (<short sha>, <yyyy-mm-dd>)` |
| Notes | the commit with its link and the UTC date; the commit's subject, quoted; a link to the run and "Every merge into develop replaces this build." |
| Asset | exactly one, `etalii-adp-<version>.vsix`, the file the `build` job of the same run packaged |
| Moves forward only | published only when `compare development...<sha>` is `ahead`; otherwise a notice and success (FR-055, the edge case of two merges close together) |
| Order | upload the new asset, delete any other asset, edit title and notes, move the tag last, so a job stopped half-way is not taken for published when re-run |
| A failing change | `development-build` does not run, so the previous build stays as it was |
| Mechanism | the `gh` command line with the workflow's own token; no release action |

The `<version>` is the `version` of `package.json`, unchanged for development builds, as IntelliJ's is its `pluginVersion` (research R12).

## Secrets and forks

No repository secret is used. `development-build` runs only for `refs/heads/develop`, never for a pull request's ref, and is the only job with `contents: write` (FR-057). A pull request from a fork gets the read-only token GitHub gives it.

## Readme

The readme's "Install from a file" section points to the Releases page for the development build and to a pull request's Build run for that pull request's plug-in, and its "Build" section lists the commands of [dev-interface.md](dev-interface.md) (FR-058).
