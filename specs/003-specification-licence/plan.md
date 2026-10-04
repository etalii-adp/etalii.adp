# Implementation Plan: Specification Licence

**Branch**: `features/003-specification-licence` | **Date**: 2026-10-04 | **Spec**: [specification-licence.spec.md](specification-licence.spec.md)
**Input**: Feature specification from `specs/003-specification-licence/specification-licence.spec.md`.

## Summary

Every specification document states, in the last row of its header table, that it is published under the Apache License 2.0, with the SPDX id and a link to the repository's `LICENSE`. A new check in the Build workflow, `.github/scripts/licence-check.py`, fails a pull request when a document found by the naming rule lacks that row or names another licence, when the terms of `LICENSE` are no longer the Apache text, when its copyright line is gone, or when a second licence file appears at the root or under `specifications/`. The constitution records the rule. `LICENSE` itself is not changed: since the feature was specified it has gained `Copyright © Peter Vrenken 2026`, GitHub still identifies it as `Apache-2.0`, and the site has published DISL 0.1 and DID 0.1 with both (research R1). FBL, added by feature 005, is the seventh document and is covered.

## Technical Context

**Language/Version**: Markdown (the specification documents, constitution, guidance); Python 3.13 in CI for the check (3.12 or later locally); GitHub Actions YAML.
**Primary Dependencies**: none new; the check uses the Python standard library and `git ls-files`.
**Storage**: files: seven `specifications/<name>/<NAME>-specification.md`, `.github/scripts/licence-check.py`, `.github/workflows/build.yml`, `.specify/memory/constitution.md`, `CLAUDE.md`, `docs/new-repository.md`.
**Testing**: the check run against the repository; deliberate faults made and reverted in a working copy; the existing examples and terminology checks; GitHub's licence API; the site's refresh as a dry run ([quickstart.md](quickstart.md)).
**Target Platform**: GitHub (the Build workflow, licence identification) and `etalii.adp.site`, which reads this repository through GitHub.
**Project Type**: a specification repository; this feature adds one header row per document and one CI check.
**Performance Goals**: none; the check reads eight files.
**Constraints**: no change to `etalii.adp.site` (FR-008); no network in the check; no per-language configuration (FR-005); no change to any language's version, schema or examples (research R3).
**Scale/Scope**: seven documents, one script of about a hundred lines, one job, one constitution amendment.

## Constitution Check

*GATE: checked before research and again after design.*

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The licence is stated in the documents that are the source of truth, and refers to the one licence file. |
| II. Implementable from the Document Alone | Pass | No construct, schema or example changes, so there is nothing to update together (research R3). |
| III. Precise Normative Language | Pass | The row is informative header content, like the version and extension rows; no normative statement is added to a language. |
| IV. Versioned Specifications | Pass | No version or status changes. |
| V. Simplicity | Pass | One table row and one standard-library script beside the two the repository has; no new dependency. Rejected: a Markdown linter, a network call to GitHub from CI, a stored second copy of the licence text (research R4, R5). |
| Structure and Naming | **Amendment** | The section gains the rule that a specification states the repository's licence in its header table and that the repository has one licence file at its root (FR-007). Amended through `/speckit-constitution`, 1.2.0 → 1.3.0, MINOR (research R6). |
| Development Workflow | **Amendment** | One Spec Kit feature on `features/003-specification-licence`, delivered by pull request with a merge commit. The Build bullet gains the licence check, in the same amendment. |

Re-check after design: unchanged; the two amendments are one MINOR change, required by FR-007, and nothing deviates from a principle.

## Project Structure

### Documentation (this feature)

```text
specs/003-specification-licence/
├── specification-licence.spec.md
├── plan.md               # this file
├── research.md           # decisions R1–R8
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── licence-check.md      # what the Build check reads, prints and returns
│   └── licence-statement.md  # the header row
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source (this repository)

```text
specifications/disl/DISL-specification.md   # + Licence row
specifications/did/DID-specification.md     # + Licence row
specifications/fbl/FBL-specification.md     # + Licence row
specifications/desl/DESL-specification.md   # + Licence row (placeholder)
specifications/ded/DED-specification.md     # + Licence row (placeholder)
specifications/edsl/EDSL-specification.md   # + Licence row (placeholder)
specifications/edd/EDD-specification.md     # + Licence row (placeholder)
.github/scripts/licence-check.py            # new
.github/workflows/build.yml                 # + licence job, header comment
.specify/memory/constitution.md             # 1.3.0
CLAUDE.md                                   # Writing specifications: the row and the check
docs/new-repository.md                      # LICENSE bullet: the copyright line
LICENSE                                     # unchanged, verified
```

**Structure Decision**: no new folder. The check sits beside `validate-examples.py` and `terminology-check.py` and runs as its own job, so its failure is named in the pull request's checks.

## Design

- **The statement** ([contracts/licence-statement.md](contracts/licence-statement.md), research R2): a `Licence` row, the last of the header table, naming the Apache License 2.0, linking `https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE` and giving `Apache-2.0`. The link is absolute so it works on GitHub, in a copy and on the site.
- **The check** ([contracts/licence-check.md](contracts/licence-check.md), research R4 and R5): six checks, every failure reported with its cause, exit 1 on any. The licence file is held to the Apache terms by a pinned hash of everything up to `END OF TERMS AND CONDITIONS`, which is stricter than GitHub's own comparison and needs no network.
- **The rule** (research R6): constitution Structure and Naming and the Build bullet; `CLAUDE.md` and `docs/new-repository.md` follow.
- **The site** (research R7, R8): untouched. Proof is a dry run of its refresh after the merge and one read of GitHub's licence API.

## Order of work

1. The script and its checks of the licence file (User Story 1).
2. The seven rows (User Story 2).
3. The checks of the statements, the job, and the faults of quickstart section 2 (User Story 3).
4. The constitution amendment and the guidance.
5. The proofs that need GitHub and the site (quickstart sections 4 and 5), the last of them after the merge.

## Complexity Tracking

No deviation from a principle; nothing to justify.
