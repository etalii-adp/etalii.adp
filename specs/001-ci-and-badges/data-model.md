# Data Model: A Build Workflow and Status Badge for Every Repository

There is no stored data. The one structure is the registry of product repositories that both build tables and every readme follow. It lives as a table in the `.github` profile and as `src/data/builds.ts` in the site; this document is its definition.

## Repository

| Field | Meaning | Rule |
| --- | --- | --- |
| `repository` | The repository's name in `etalii-adp` | One of the six product repositories; unique (FR-014) |
| `public` | Whether visitors can see it | `true` for every row once this feature lands (FR-001) |
| `workflow` | The build workflow's file name | Always `build.yml` (FR-002) |
| `readme` | The readme file at the root | `readme.md` in standalone, `README.md` elsewhere (FR-012) |

The six rows, in the order both tables use today:

| repository | public (today → after) | readme |
| --- | --- | --- |
| `etalii.adp` | yes → yes | `README.md` (new) |
| `etalii.adp.ide.intellij` | no → yes | `README.md` |
| `etalii.adp.ide.standalone` | no → yes | `readme.md` |
| `etalii.adp.ide.vscode` | no → yes | `README.md` (new) |
| `etalii.adp.ide.eclipse` | no → yes | `README.md` (new) |
| `etalii.adp.site` | yes → yes | `README.md` |

## Derived values

Every badge and link is derived from `repository` and `workflow` only, by the strings in [contracts/badge.md](contracts/badge.md). Nothing else is stored per row.

## State transitions

A repository row moves through: **no workflow** → **workflow, private** → **workflow, public**. The tables show a badge only in the last state. Moving back to private is a change that must update the readme and both tables in the same pull request (FR-017).
