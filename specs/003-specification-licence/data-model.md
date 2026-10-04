# Data Model: Specification Licence

Nothing here is a schema; these are the things the check reads and the rules it holds them to.

## Repository licence

| Field | Value | Rule |
|---|---|---|
| Path | `LICENSE` at the repository root | exists; no other licence file at the root or under `specifications/` (FR-001, FR-006) |
| Licence | Apache License 2.0, SPDX id `Apache-2.0` | the terms, up to and including `END OF TERMS AND CONDITIONS`, are the Apache text (research R5) |
| Address | `https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE` | what every licence statement links |

## Copyright notice

| Field | Value | Rule |
|---|---|---|
| Notice | `© Peter Vrenken 2026` | given by Peter, 2026-09-29 |
| Line in `LICENSE` | `Copyright © Peter Vrenken 2026` | exactly one line beginning with `Copyright ` and free of `[…]` placeholders; it is the line the site records (FR-002) |

## Specification document

| Field | Value | Rule |
|---|---|---|
| Path | `specifications/<name>/<NAME>-specification.md` | `<NAME>` is `<name>` in capitals; every folder directly under `specifications/` has one (constitution, Structure and Naming) |
| Header table | the first table in the document | holds exactly one licence statement |
| Today | `disl`, `did`, `desl`, `ded`, `edsl`, `edd`, `fbl` | found by the rule, never listed in the check (FR-005) |

## Licence statement

A row of a specification document's header table.

| Field | Value | Rule |
|---|---|---|
| Label | `Licence` | first cell, exactly |
| Name | `Apache License 2.0` | the link text |
| Link | the repository licence's address | FR-003 |
| SPDX id | `` `Apache-2.0` `` | in code form; equals the repository licence's id (FR-004) |
| Position | last row of the header table | by convention; the check does not depend on it |

## Relationships

- Each specification document has one licence statement; each statement refers to the one repository licence.
- The repository licence carries the one copyright notice.
- The site reads the repository licence and the notice (through GitHub); it reads the statement only as part of the prose it publishes.
