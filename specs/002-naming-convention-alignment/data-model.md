# Data Model: Naming Convention Alignment

The entities this feature names and moves. Definitions are in `docs/terminology.md`; this file adds their identifiers, relationships and the rules the parts check.

## Tool

- **Kind**: one of `diagram`, `designer`, `editor` ([classification.md](contracts/classification.md)).
- **Origin**: `<vendor>/<type>`, lower case, unique across all tools; editors use `editor/<id>`. Not renamed by this feature (rename map rule 7).
- **Display name**: one per tool type, a name and not a description; the same in every host, the catalogue, the site and Notion (FR-008).
- **Identifiers per host**: folder, module, class and id names derived from the display name (rename map rule 4).
- **Previous origin**: optional, in Notion; when set, the site redirects the old origin's page.

Rule: a tool has exactly one kind, and every place that shows the tool shows that kind.

## Tool engineer

The person who specifies how a tool type functions and looks, by writing a specification file in its kind's specification language. Replaces "language designer" and the first plan's "author".

## Language

Six languages, one specification language and one definition language per kind. `<name>` is the acronym in lowercase, and all six follow one pattern: folder `specifications/<name>/`, document `<NAME>-specification.md`, schema `<name>.schema.json`, `$id` `https://etalii.net/adp/<name>/schema/<version>/<name>.schema.json`, media type `application/vnd.<name>.<role>+json`, version key `"<name>": "<version>"`, extension `.<name>`.

| Field | DISL | DID | DESL | DED | EDSL | EDD |
|---|---|---|---|---|---|---|
| Name | Diagram Specification Language | Diagram Definition Language | Designer Specification Language | Designer Definition Language | Editor Specification Language | Editor Definition Language |
| Role | specification | definition | specification | definition | specification | definition |
| Kind | diagram | diagram | designer | designer | editor | editor |
| Extension | `.disl` | `.did` | `.desl` | `.ded` | `.edsl` | `.edd` |
| Folder | `specifications/disl/` | `specifications/did/` | `specifications/desl/` | `specifications/ded/` | `specifications/edsl/` | `specifications/edd/` |
| Schema | `disl.schema.json`, root `$defs/Specification` | `did.schema.json`, root `$defs/Definition` | none yet | none yet | none yet | none yet |
| Status | 0.1, Working Draft | 0.1, Working Draft | Placeholder | Placeholder | Placeholder | Placeholder |
| Origin | DEDL 0.1 definitions | DEDL 0.1 documents | new | new | new | new |

Relationship: a definition language is paired with the specification language of its kind. A definition file names the specification it was made from (DID keeps DEDL 0.1's `language` reference: id, version and optional URI of the `.disl` file).

## Specification file

One tool type as a tool engineer specifies how it functions and looks: a `.disl`, `.desl` or `.edsl` file carrying its language's version key (`"disl": "0.1"`). Today's `erd.dedl`, `statemachine.dedl` and `timeline.dedl` are specification files.

## Definition file

One diagram, designer or editor a user created of a type, stored as a `.did`, `.ded` or `.edd` file carrying its language's version key (`"did": "0.1"`). Today's `timeline.document.json` is a definition file.

## Document

One piece of content a user works on in a host, and its registration file (`.adp`) where the host uses one. For a diagram built on DISL, its stored form is a DID definition file. Documents that users stored are never renamed or rewritten by this feature; ADP's own example files are migrated once (research R3) and round-trip byte-identical from then on (FR-012).

## Persisted identifier

Anything stored outside the running program that carries a name: a file extension, an origin, a schema `$id`, a media type, a version key, a settings key or id, a public URL, a Notion column or option.

- **States**: `current` (written and read) → after a rename, the old identifier is `read-only` (read, never written) → after the next major version of its host or language, `retired` (no longer read).
- Rule: no identifier goes from `current` to `retired` in one step (FR-011).
- Rule: a `read-only` identifier is proven by a legacy fixture or a test that reads it.
- Special case: the retired DEDL 0.1 identifiers (`.dedl`, `https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json`, `/adp/dedl/…`) are read or redirected as DISL or DID and **MUST NOT** be given a new meaning (research R4).

## Legacy fixture

A file kept byte-for-byte in a retired form, checked in CI to prove that the form is still read. Carries the path of the file it is the old form of. Removed when its identifiers become `retired`.

## Baseline

Recorded by part 0 before any rename, per repository: the test count of every gate, a SHA-256 of every example and registration file, the site's sitemap, and one stored IntelliJ settings file. Every later part proves against it; files a part migrates on purpose are listed in its pull request (research R10).

## Finding

Output of the terminology check: repository, file, line, matched text, glossary entry, replacement ([terminology-check.md](contracts/terminology-check.md)).
