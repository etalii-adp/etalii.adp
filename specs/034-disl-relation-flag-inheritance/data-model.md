# Data Model: A Relation Type Inherits Its Flags

No stored format changes: DID stores relations as before, FBL binds them as before (FR-009). What follows is the model a reader of a DISL specification builds, and the rules it checks.

## Entities

### Relation flag

| Flag | Default (4.9) | Narrower value | A subtype may state |
|---|---|---|---|
| `directed` | `true` | none | only the supertypes' effective value |
| `allowSelfLoops` | `false` | `false` | `false` always; `true` only where every direct supertype's effective value is `true` |
| `allowParallel` | `true` | `false` | `false` always; `true` only where every direct supertype's effective value is `true` |

`acyclic` is not one of the three: it keeps section 4.9's rule (a subtype of an acyclic type is acyclic and **MUST NOT** state `acyclic: false`), restated beside them (FR-005).

### Relation type, as read

| Field | From | Meaning |
|---|---|---|
| `name` | its key under `metamodel.relations` | |
| `supertypes` | `extends`, a TypeRef or TypeRef[] | its direct supertypes, in the order written |
| `linearisation` | C3 over `supertypes` (4.7) | the type first, then its supertypes, nearest first |
| `stated[flag]` | its own declaration | `true`, `false` or absent |
| `effective[flag]` | the first type of `linearisation` with `stated[flag]`, else the default | the value every host uses |

## Validation rules (section 4.7, checked at section 14.1 step 6)

For every relation type `T`, every flag `f`, and `P` ranging over `T`'s direct supertypes:

- **V1 (narrow only, FR-002)**: when `stated[f]` is present: for `directed`, it **MUST** equal `effective[f]` of every `P`; for `allowSelfLoops` and `allowParallel`, it **MUST NOT** be `true` where `effective[f]` of some `P` is `false`.
- **V2 (conflict, FR-003)**: when `stated[f]` is absent, `effective[f]` **MUST** be equal for every `P`.
- A failure of V1 or V2 is a specification error: the specification is unusable (14.1, "`error` makes the specification unusable"), reported with the JSON Pointer of `T`'s declaration (`/metamodel/relations/<T>`, or `/metamodel/relations/<T>/<f>` for V1), the flag, and the supertype or supertypes involved.
- A relation type without supertypes is free to state any value. `abstract` and `derived` make no difference to V1, V2 or the lookup (spec Edge Cases).
- Effective values are compared with defaults included: a supertype that states nothing anywhere has the default.

## Worked values

`specifications/disl/service-calls.dis` (research R7):

| Relation type | Supertypes | `directed` | `allowSelfLoops` | `allowParallel` |
|---|---|---|---|---|
| `Call` (abstract) | – | true (default) | true (stated) | false (stated) |
| `SyncCall` | `Call` | true (default) | true (from `Call`) | false (from `Call`) |
| `AsyncCall` | `Call` | true (default) | true (from `Call`) | false (from `Call`) |
| `Observation` (abstract) | – | true (default) | false (default) | true (default) |
| `TracedCall` | `SyncCall`, `Observation` | true (default; both agree) | false (stated; narrows `SyncCall`'s true, equals `Observation`'s false) | false (stated; equals `SyncCall`'s false, narrows `Observation`'s true) |

Removing either statement from `TracedCall` makes it a V2 error; stating `allowSelfLoops: true` on it is a V1 error (it widens `Observation`'s `false`).

The definitions' values are in research R5.
