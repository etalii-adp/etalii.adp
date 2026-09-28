# Data Model: Naming Convention Alignment

The entities this feature names and moves. Definitions are in `docs/terminology.md`; this file adds their identifiers, relationships and the rules the parts check.

## Tool

- **Kind**: one of `diagram`, `designer`, `editor` ([classification.md](contracts/classification.md)).
- **Origin**: `<vendor>/<type>`, lower case, unique across all tools; editors use `editor/<id>`. Not renamed by this feature (rename map rule 7).
- **Display name**: one per tool, a name and not a description; the same in every host, the catalogue, the site and Notion (FR-008).
- **Identifiers per host**: folder, module, class and id names derived from the display name (rename map rule 4).
- **Previous origin**: optional, in Notion; when set, the site redirects the old origin's page.

Rule: a tool has exactly one kind, and every place that shows the tool shows that kind.

## Specification language

| Field | DISL | DESL | EDSL |
|---|---|---|---|
| Kind specified | diagram | designer | editor |
| Folder | `specifications/disl/` | `specifications/desl/` | `specifications/edsl/` |
| Document | `DISL-specification.md` | `DESL-specification.md` | `EDSL-specification.md` |
| Machine-readable specification | `disl.disl` | none yet | none yet |
| Status | 0.1, Working Draft | Placeholder | Placeholder |
| Definition format | DIFL, `.difl` | DEFL, `.defl` | EDFL, `.edfl` |

DISL keeps reading the deprecated DEDL forms (research R3).

## Definition

One tool type described according to its kind's specification language: a `.difl`, `.defl` or `.edfl` file carrying the version key of its language (`"disl": "0.1"`).

## Document

One piece of content a user works on with a tool, and its registration file (`.adp`) where the host uses one. Documents are never renamed or rewritten by this feature; after it, each is opened and written back byte-identical (FR-012).

## Persisted identifier

Anything stored outside the running program that carries a name: a file extension, an origin, a schema `$id`, a media type, a version key, a settings key or id, a public URL, a Notion column or option.

- **States**: `current` (written and read) → after a rename, the old identifier is `read-only` (read, never written) → after the next major version of its host, `retired` (no longer read).
- Rule: no identifier goes from `current` to `retired` in one step (FR-011).

## Baseline

Recorded by part 0 before any rename, per repository: the test count of every gate, a SHA-256 of every example and registration file, the site's sitemap, and one stored IntelliJ settings file. Every later part proves against it.

## Finding

Output of the terminology check: repository, file, line, matched text, glossary entry, replacement ([terminology-check.md](contracts/terminology-check.md)).
