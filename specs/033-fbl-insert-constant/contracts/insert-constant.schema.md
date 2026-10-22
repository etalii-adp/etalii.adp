# Contract: `constant` in `fbl.schema.json`

`$defs/Insert` gains one property and one exclusion; the `fbl` enum gains `"0.8"`.

```json
"constant": {
  "description": "FBL 0.8, section 6.2: keys every new entry of the rule is written with, each with its scalar value, that no attribute supplies. yaml and json only (section 14.1, step 6); not with emit.",
  "type": "object",
  "minProperties": 1,
  "additionalProperties": { "type": ["string", "number", "boolean", "null"] }
}
```

and, on `$defs/Insert`:

```json
"not": { "required": ["constant", "emit"] }
```

and, on `$defs/Binding`, a condition: when `body.family` is neither `yaml` nor `json`, no item of `elements` or `relations` has an `insert` with `constant` (`if`/`then` over `body.family`, `not` over `insert.required`).

What the schema cannot say, and section 14.1 step 6 and the validator check instead: the collision of a constant's key with a key the rule writes (data-model.md, *Validation*).

Every 0.7 document stays valid: `constant` is optional and new.

A binding that uses it, as the fixtures do:

```json
{
  "name": "task", "type": "Task", "at": "/elements/*",
  "when": "has(entry.type) && entry.type == 'task'",
  "id": { "from": { "key": "id" } },
  "attributes": { "name": { "key": "name", "empty": "keep" } },
  "insert": { "place": "end", "container": "/elements", "keys": ["id", "type", "name"], "constant": { "type": "task" } },
  "remove": {}
}
```
