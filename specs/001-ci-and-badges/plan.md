# Implementation Plan: A Build Workflow and Status Badge for Every Repository

**Branch**: `features/001-ci-and-badges` | **Date**: 2026-09-27 | **Spec**: [ci-and-badges.spec.md](ci-and-badges.spec.md)

> **Scale note**: this change spans six repositories and roughly 22 files: a `build.yml` and a readme in each product repository, the runner cleanup in standalone and the site, the site's table data, the organization profile, and two documents here. Watch the ordering: tables change only after the repositories are public, and the visibility change waits for Peter's typed confirmation.

## Summary

Every product repository gets `.github/workflows/build.yml`, named "Build", that runs on pull requests into `develop` and on `develop`, on GitHub's hosted Ubuntu runners. What it runs depends on the repository: schema validation of every example in `etalii.adp`, the existing gates in standalone and the site, the Gradle build in IntelliJ, and file checks plus a prepared plug-in download job in VS Code and Eclipse. Each readme carries the badge for `build.yml` on `develop`, and both organization-wide tables show the same badge for all six repositories once they are public. `docs/new-repository.md` and this repository's constitution are updated so the rule holds for the next repository.

The one new dependency is the `jsonschema` Python package, installed in `etalii.adp`'s workflow to validate examples; see [research.md](research.md) R3.

## Technical Context

**Languages**: GitHub Actions YAML; Python 3 for `etalii.adp`'s validation script; Markdown for readmes and tables; TypeScript data in the site.
**Tools on the runner**: `actions/checkout`, `actions/setup-python`, `actions/setup-java`, `actions/setup-node`, `actions/upload-artifact`, `editorconfig-checker`, `gitleaks` (the scan before going public only).
**Runner**: `ubuntu-latest`, hosted, everywhere.
**Testing**: each workflow is proven by one passing and one deliberately failing pull request (spec US1 independent test); `actionlint` on every workflow file before it is pushed.
**Constraints**: no branch protection; hosted minutes are unavailable to private repositories until they go public.

## Constitution Check

The constitution governs this repository. Its principles are about specifications of formats; this feature adds no format, so most apply only to what this repository itself gains.

| Principle | Assessment |
| --- | --- |
| I. One Source of Truth | PASS. No format is defined or changed. |
| II. Implementable from the Document Alone | PASS, and strengthened: the new workflow enforces that every example validates against its schema. |
| III. Precise Normative Language | PASS. The spec uses RFC 2119 key words in bold capitals where it is normative. |
| IV. Versioned Specifications | PASS. No specification version changes. |
| V. Simplicity | PASS. One workflow per repository, one small script, no new mechanism; the runner switch is removed rather than added. The prepared plug-in job is scaffolding for code that does not exist yet, which Principle V would normally reject; Peter asked for it explicitly (answer 1a), so it is justified below. |
| Structure and Naming | PASS. The spec lives under `specs/001-ci-and-badges/`; nothing under `specifications/` moves. |
| Development Workflow: "When [a CI workflow] is added, it MUST at least validate every example against its schema on pull requests into `develop`" | PASS. That is exactly what `etalii.adp`'s `build.yml` does. The sentence "There is no build and no CI workflow yet" is amended through `/speckit-constitution` (FR-019), a PATCH bump. |

### Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
| --- | --- | --- |
| A `plugin` job in VS Code and Eclipse that builds nothing today | Peter asked for the workflows to be prepared for plug-in downloads (answer 1a) | Adding the job with the first plug-in code is simpler, but it is not what was asked |

## Project Structure

### Documentation (this feature)

```text
specs/001-ci-and-badges/
├── ci-and-badges.spec.md
├── plan.md                 # this file
├── research.md             # R1-R10
├── data-model.md           # the repository registry the tables and readmes follow
├── contracts/
│   ├── build-workflow.md   # what every build.yml must satisfy
│   └── badge.md            # exact badge and link strings
└── checklists/requirements.md
```

### Source (across the organization)

```text
etalii.adp/
├── .github/workflows/build.yml          # new: validate examples (R3)
├── .github/scripts/validate-examples.py # new
├── README.md                             # new, with badge
├── docs/new-repository.md                # public, build.yml, badge, both table rows (FR-018)
└── .specify/memory/constitution.md       # CI sentence amended (FR-019)

etalii.adp.ide.standalone/
├── .github/workflows/build.yml          # RUNS_ON removed (R7)
└── readme.md                             # badge gains ?branch=develop

etalii.adp.ide.intellij/
├── .github/workflows/build.yml          # new: JDK 25, xvfb-run ./gradlew build, zip uploaded (R6)
└── README.md                             # badge added

etalii.adp.ide.vscode/  and  etalii.adp.ide.eclipse/
├── .github/workflows/build.yml          # new: editorconfig and parse checks, prepared plugin job (R4, R5)
└── README.md                             # new, with badge

etalii.adp.site/
├── .github/workflows/build.yml          # renamed from ci.yml, push to develop added, RUNS_ON removed (R2, R7)
├── .github/workflows/deploy.yml         # RUNS_ON removed
├── .github/workflows/auto-assign.yml    # RUNS_ON removed if present
├── README.md                             # badge added
└── src/data/builds.ts                    # every repository public, workflow build.yml (after PR #14)

.github/
└── profile/README.md                     # six rows, all badges, no N/A
```

**Structure Decision**: one `build.yml` per repository at the same path with the same display name, so every badge and table row is derived from the repository name alone (see [contracts/badge.md](contracts/badge.md)). Everything else stays where each repository already keeps it.

## Delivery

One pull request per repository into its `develop`, in this order (research R10):

1. The four private repositories and `etalii.adp` and the site: workflow, readme badge, runner cleanup. Private repositories cannot run hosted jobs yet, so their pull requests are verified locally with `actionlint` and the same commands; `etalii.adp` and the site are checked by their own runs.
2. `gitleaks` scan of each private repository's history and a list of third-party files with their licences, reported to Peter.
3. On Peter's typed confirmation per repository: make it public. Its first hosted run follows.
4. The site's `builds.ts` (after PR #14 merges) and the `.github` profile table.
5. `docs/new-repository.md` and the constitution amendment, in this repository's feature pull request.
