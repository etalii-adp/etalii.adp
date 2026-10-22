# Data Model: An Insert Writes a Constant

## Insert (FBL section 6.2), one property added

| Property | Type | Rule |
|---|---|---|
| `constant` | object: key → string, number, bool or null; at least one member | *(FBL 0.8)* yaml and json only; not with `emit`. Every new entry of the rule carries each member as a key with that value. |

### Validation (section 14.1)

| Check | Where | Refusal names |
|---|---|---|
| `constant` beside `emit` | schema, `$defs/Insert` | the insert |
| `constant` on a binding whose body's family is not `yaml` or `json` | schema, `$defs/Binding`; step 6 | the rule and its family |
| a constant's key is the key of a `{key}` slot, without `child`, that the rule writes: a writable attribute binding, `id.from`, `source` or `target` | step 6 | the rule and the key |
| a constant's value is a mapping or a list | schema | the member |

A read-only attribute binding on a constant's key is allowed.

## New entry (section 6.2, `keys`)

The keys of a new entry, in order:

1. The keys `insert.keys` names, in its order, each with the value the add gives it (the id, an end, an attribute) or, for a constant's key, the constant's value. A key with no value is left out, as today; a constant always has one.
2. The constants whose key `insert.keys` does not name, in the member order of `constant`.
3. The `skeleton`, as today.

With no `insert.keys`, step 1 is the order section 6.2 already gives the entry's keys.

## Lifecycle of a constant's key

| Edit | The key |
|---|---|
| add (by the rule) | written, in the entry's one `insert-entry` splice |
| set, move, rename, reference rewrite | untouched |
| remove | removed with the entry |
| retype (remove and add, section 6.4) | removed with the old entry; the new rule's constants are written in the new one |
| undo, redo of the add | removed and written again with the entry, byte for byte |
| read | not consulted: `when` alone matches |
