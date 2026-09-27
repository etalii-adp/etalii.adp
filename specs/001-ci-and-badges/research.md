# Research: A Build Workflow and Status Badge for Every Repository

Findings from reading each repository's `develop` on 2026-09-27, and the decisions the plan builds on.

## Current state

| Repository | Visibility | Workflows today | Readme | Badge in readme | Licence file |
| --- | --- | --- | --- | --- | --- |
| `etalii.adp` | public | none | none | no | none |
| `etalii.adp.ide.standalone` | private | `build.yml` ("Build": gates on PRs and `develop`, release on `develop`) | `readme.md` | yes, without a branch | none |
| `etalii.adp.ide.intellij` | private | none | `README.md` | no | `LICENSE` |
| `etalii.adp.ide.vscode` | private | none | none | no | none |
| `etalii.adp.ide.eclipse` | private | none | none | no | none |
| `etalii.adp.site` | public | `ci.yml` (PRs only), `deploy.yml` (`develop`), `auto-assign.yml` | `README.md` | no | `LICENSE` |

The organization profile (`.github`, `profile/README.md`) has a six-row table with badges for standalone and the site's `deploy.yml`, and "N/A" for the rest. The site renders its table from `src/data/builds.ts` through `src/components/BuildList.astro`; its open pull request #14 ("Show live build status badges on the home page") swaps the workflow links for badges and adds a privacy exception for badge images. Every existing workflow chooses its runner with `fromJSON(vars.RUNS_ON || '"ubuntu-latest"')`.

## Decisions

### R1. One workflow file name and display name everywhere: `build.yml`, "Build"

- **Decision**: every product repository's build workflow is `.github/workflows/build.yml` with `name: Build`.
- **Rationale**: standalone already uses exactly this, so it keeps its badge URL; one name makes every badge URL predictable from the repository name alone (FR-002).
- **Alternatives considered**: `ci.yml`, which the site uses, would rename standalone's workflow and break its existing badge and run history.

### R2. The site's `ci.yml` becomes its `build.yml`; `deploy.yml` stays

- **Decision**: rename the site's `ci.yml` to `build.yml`, name it "Build", and add `push` to `develop` as a trigger. `deploy.yml` and `auto-assign.yml` are unchanged apart from their runner.
- **Rationale**: FR-003 needs the build workflow to run on `develop` too, and `ci.yml` already runs every check. `deploy.yml` publishes, so it cannot be the badge on pull requests.
- **Alternatives considered**: using `deploy.yml` as the badge, as the profile does today, which shows nothing about pull requests and turns red for Pages outages; merging deploy into build, which mixes publishing into the check that forks run.

### R3. `etalii.adp` validates examples with a short Python script

- **Decision**: `.github/scripts/validate-examples.py` finds every `*.dedl` and `*.json` example under `specifications/`, reads its `$schema`, resolves the `#/$defs/<Name>` fragment against the specification's local `*.schema.json`, and validates with the `jsonschema` package's Draft 2020-12 validator. It prints one line per file and exits non-zero naming each invalid example (US1 scenario 4).
- **Rationale**: the examples point `$schema` at a published URL with a `$defs` fragment (`…/dedl.schema.json#/$defs/Definition`, `…#/$defs/Document`). Off-the-shelf CLIs pick the metaschema from `$schema` and do not map a fragment to a local file. Python and pip are on every hosted runner.
- **Alternatives considered**: `check-jsonschema` or `ajv-cli`, which would need a per-example mapping list kept by hand, the kind of drift principle II exists to prevent; fetching the schema from etalii.net, which checks the published schema rather than the one in the pull request.

### R4. VS Code and Eclipse check their files with editorconfig-checker and a parse check

- **Decision**: until they hold code, their build job runs `editorconfig-checker` against the repository's own `.editorconfig`, and parses every JSON and YAML file.
- **Rationale**: both repositories already carry an `.editorconfig`, so the rule set exists and is theirs. A broken JSON or YAML file under `.specify/` breaks Spec Kit, which is what these repositories currently hold (US1 scenario 5).
- **Alternatives considered**: markdownlint, whose default rules contradict the house rule of not wrapping markdown lines and would need configuring; a placeholder that always passes, rejected by Peter (answer 1a).

### R5. Plug-in download step, prepared and skipped

- **Decision**: a second job, `plugin`, runs after the checks. Its first step looks for the plug-in's build file (`package.json` for VS Code, `pom.xml` for Eclipse). When absent it writes a notice ("No plug-in code yet: nothing to build") to the job summary and the remaining steps are skipped by their `if`. When present it builds the plug-in (`npx @vscode/vsce package` producing a `.vsix`; `mvn -B verify` producing the Tycho update-site zip) and uploads it with `actions/upload-artifact`, which only runs when the build step succeeded (FR-009 to FR-011).
- **Rationale**: the step exists now, so the first code pull request fills in a known place; the conventional packaging tool of each ecosystem is the default. A skipped step does not fail the run (FR-010).
- **Alternatives considered**: a job-level `if` on a file check, which GitHub cannot evaluate before checkout; leaving the step out until code exists, which Peter asked not to do.
- **Open**: the packaging commands are provisional; the first pull request with plug-in code confirms or replaces them.

### R6. IntelliJ: a minimal `build.yml` now, spec 005 grows it

- **Decision**: `build.yml` sets up JDK 25 (`javaVersion` in `gradle.properties`), caches Gradle, and runs `xvfb-run ./gradlew build`, which already depends on the integration tests, `verifyPlugin` and the licence check. The plug-in zip is uploaded from each successful run. Releases stay with spec 005.
- **Rationale**: this feature only needs the workflow, its name, its runner and its badge; spec 005 owns what IntelliJ's CI does beyond that, so this does not pre-empt its plan.
- **Alternatives considered**: implementing spec 005 here, which would merge two features' reviews.
- **Risk**: the real-IDE tests may need more than a virtual display on a hosted runner, or run long. If they cannot pass there, the run reports them as skipped with the reason, as spec 005's FR-005 already requires, and spec 005's plan settles it.

### R7. Hosted runners only; `RUNS_ON` is removed

- **Decision**: every job in every workflow says `runs-on: ubuntu-latest`. The `RUNS_ON` expression and its comment are removed from standalone's `build.yml` and the site's three workflows.
- **Rationale**: Peter's answer 3c. Public repositories get hosted minutes free, so the switch has nothing left to switch (FR-008, SC-005).
- **Alternatives considered**: keeping the switch with a hosted default, which Peter declined.

### R8. Badge URL pinned to `develop`

- **Decision**: every badge is `https://github.com/etalii-adp/<repo>/actions/workflows/build.yml/badge.svg?branch=develop`, linked to `https://github.com/etalii-adp/<repo>/actions/workflows/build.yml?query=branch%3Adevelop`. The exact strings are in [contracts/badge.md](contracts/badge.md).
- **Rationale**: without `?branch=` a badge shows the latest run on any branch, including a red pull request, which is not the status of `develop`.

### R9. Going public is gated on a scan and on Peter's word

- **Decision**: before any repository's visibility changes, run `gitleaks detect` over its full history and list third-party files with their licences. The results go to Peter; each repository goes public only on his typed confirmation, with `gh repo edit --visibility public --accept-visibility-change-consequences`.
- **Rationale**: going public cannot be undone once the content has been seen or cloned. The scan is what "confirms it holds nothing that must stay private" in the spec's assumptions.
- **Outcome (2026-09-27)**: Peter asked for Apache-2.0 licences in every repository and for the repositories to be made public. A pattern scan of every branch's full history (cloud keys, private keys, GitHub, Anthropic, OpenAI, Slack and Google tokens, password and secret assignments, storage account keys) found only placeholder values in vendored Ansible and Helm examples and the `changeme`/`developer` development credentials in standalone's `appsettings.developer.json`. Every vendored example in standalone carries its own licence (Apache-2.0, MIT, CC0, CC BY, W3C), all permitting redistribution. `gitleaks` was not installed, so the scan used `git log -G` with those patterns. The four repositories were made public the same day.
- **Licence**: standalone, vscode, eclipse and `etalii.adp` gain the Apache License 2.0 text that intellij, the site and `.github` already carry (FR-020).

### R10. Delivery order

- **Decision**: one pull request per product repository (workflow, readme badge, runner cleanup) first; then the scan and the visibility change; then the two tables (`.github` profile and the site's `builds.ts`, after site PR #14); then `docs/new-repository.md` and the constitution amendment in `etalii.adp`.
- **Rationale**: a table row can only show a badge once the workflow has run on `develop` and the repository is public (spec edge case on ordering). Every step before the visibility change is reversible.
- **Consequence**: while the private repositories have no hosted minutes, their new workflows queue or fail to start on their pull requests. Those pull requests are reviewed on a local run of the same commands, and their first hosted run happens once the repository is public. `etalii.adp` and the site are public already, so their pull requests are checked at once.
