# Contract: the seam with FBL, the Format Binding Language

FBL (feature 005, `specifications/fbl/`, branch `features/005-format-binding`) reads foreign files into a model and writes them back. DISL 0.2 says what a tool is once it has that model. This contract, agreed between the two specification sessions on 2026-09-30, lists what each defines and what the other only references. A construct is defined once (SC-006).

## Defined by DISL 0.2, referenced by FBL

| Construct | DISL place | How FBL uses it |
|---|---|---|
| Id strategies, `persistence.ids.types` and the `derived` strategy with its `identity` CEL context | 11.5, 12.3 | Elements FBL reads get their ids from these rules. |
| `ephemeral` ids | 11.5 | FBL never stores a position or other view data for an ephemeral element in its registration or sidecar. |
| `SourceLocation` `{file, line?, column?, length?}`, and a finding's `subject` | 8.6, `$defs/SourceLocation` | FBL's reader records each element's location (read by `self.location()`) and reports read problems as findings with a location. |
| The finding shape, `code`, `severity`, and the built-ins `std.unparseable`, `std.unreadableEntry`, `std.missingId`, `std.duplicateId`, `std.pluginMissing` | 8.6, 8.7 | FBL raises these; it defines no finding shape or built-in of its own. |
| Derived elements | 4.11 | Never written; FBL has nothing to write for them. |
| `fixed` attributes | 4.3 | Never persisted; FBL writes nothing for them. |
| `language.origin` (`<vendor>/<type>`) | 3.2 | An `.adp` registration names the tool type by this origin; hosts map origin to specification. |
| Plugin functions in CEL (`celFunctions`) | 13.1 | FBL's plugin contract for formats that stay plugins (Turtle, MSBuild) reuses DISL's plugin declarations. |

## Defined by FBL, referenced by DISL 0.2

| Construct | Note |
|---|---|
| The subject of a diagram (a file or a folder) | A `SourceLocation.file` is relative to the subject. |
| Which file is primary | `std.unparseable` on the primary file stops all rule evaluation. |
| Reading order of elements | `e.positionIn(list)`, repeat counters and "second and later duplicates" rely on it. |
| "Not written back" for a read element whose binding has no write rule | Distinct from DISL's `fixed` and from derived elements. |
| Sidecar-keyed ids (Wardley's `identities`) | Stored in the registration's `identities:` block. |
| `persistence.format: "fbl"` and `persistence.binding` in DISL 11 | FBL's one change to DISL, landing in the 0.1 schema first; DISL 0.2 carries it over. |

## Confirmed by FBL (2026-09-30)

- FBL's rule `id` says only where an id is stored in the file (its `from` slot) or that it lives in the registration's `identities` block; the strategy, `derived` expressions and `ephemeral` come from DISL's `persistence.ids.types`.
- FBL raises DISL's built-ins and adds only `fbl.*` codes for file-side findings (dangling reference, unbound statement, header mismatch, missing body, stale view data, unknown registration header).
- `SourceLocation.file` is relative to the subject and `/`-separated; for a file body it is the body's own name.
- The primary file is the body for a file body. A folder subject has no primary file: `std.unparseable` on one of its files is located at that file and never stops rule evaluation; only an unrecognisable or missing folder does.
- Reading order is document order (byte offset) within a file, and for a folder the files in ordinal order of their relative paths, then document order.
- FBL fills `self.location()` with the entry's span: start line and column, and length.

## Versioning

DISL 0.2 moves the schema `$id` to `/0.2/` in this feature's implement step. If FBL's persistence hook lands on `develop` first, it lands in the 0.1 schema and this feature carries it into 0.2 unchanged.
