# Quickstart: Proving the Alignment

How to check that the feature is done and nothing broke. Commands come from each repository's `CLAUDE.md`; the baseline is the one part 0 recorded ([data-model.md](data-model.md) § Baseline).

## Prerequisites

- Clean clones of all seven repositories on `develop` under `C:\git` (see the project's clone layout).
- .NET, Node.js 24, a JDK for Gradle, and `gh` signed in with read access to the organization.
- Access to the Notion "Tools" database (or an export of it, as `procedures/refresh-catalogue.md` describes).

## 1. No retired use remains (SC-001)

Run the terminology check across all repositories. Expected: no finding outside the allowed list.

## 2. Every repository still passes, with no fewer tests (SC-003)

| Repository | Commands | Expected |
|---|---|---|
| etalii.adp | its CI workflow's example validation | every example valid against its machine-readable specification |
| etalii.adp.ide.standalone | `npm test`; `npm run typecheck`; `dotnet format style --verify-no-changes --severity info`; `dotnet test --solution EtAlii.Adp.slnx` (from `src/backend/`) | all exit 0; counts ≥ baseline |
| etalii.adp.ide.intellij | `./gradlew build`; `./gradlew integrationTest` | exit 0; counts ≥ baseline |
| etalii.adp.site | `npm run build`; `npm test`; `npm run test:catalogue`; `npm run test:refresh`; `npm run check` | all exit 0; counts ≥ baseline |
| vscode, eclipse, .github | their CI workflows | green |

## 3. Documents round-trip (SC-002)

In each host, open and save unchanged every example and registration file; the SHA-256 of each equals the baseline.

## 4. Links still land (SC-004)

Request every URL of the baseline sitemap against the built site. Expected: the same page, or a permanent redirect to its new address (`/adp/designers/…` → `/adp/tools/…`, `/adp/dedl/…` → `/adp/disl/…`); the old schema address still serves the schema.

## 5. Settings survive (SC-005)

Restore the baseline IntelliJ settings file into a sandbox IDE (`./gradlew runIde`) on the renamed plug-in. Expected: the same tools are turned off and the same per-tool settings, grid and zoom apply; after a restart the file holds only the new keys.

## 6. Notion and the pipelines (SC-006)

Run `npm run refresh -- catalogue` in dry-run mode against the renamed Notion database. Expected: no missing column, no unclassified row, and pull request text in the new vocabulary.

## 7. One vocabulary in three places (User Story 1)

Compare `docs/terminology.md` in etalii.adp, the Notion "ADP terminology" page and `/adp/docs/terminology/`. Expected: the same definitions, each pointing to the markdown file as the source.
