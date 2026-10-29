# Contract: one binding, several readings, and the `yaml` family's writes (pull request B)

FBL sections 4.3, 5.1, 5.2, 6.2, 6.3, 8.2, 9.1, 9.2 and 13, and `fbl.schema.json`. Research: R12 to R14.

## Readings with different metamodels (FR-014, FR-015)

`$defs/ElementRule` and `$defs/RelationRule` gain `origins` (and `$defs/BlockRule` with pull request A):

```json
"origins": {
  "description": "FBL 0.10, section 5.1: the readings this rule is read for, as origins of the binding's claims.origins. Absent: every reading.",
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "uniqueItems": true
}
```

Two rules of `databricks.fbl#configuration` over one entry:

```json
{ "name": "pipelineResource", "type": "PipelineResource", "at": "/resources/pipelines/{pipeline}",
  "origins": ["databricks/bundle"], "attributes": { "key": { "capture": "pipeline", "readOnly": true } } },
{ "name": "pipeline", "type": "Pipeline", "at": "/resources/pipelines/{pipeline}",
  "origins": ["databricks/pipeline"], "attributes": { "name": { "key": "name", "empty": "refuse" } } }
```

Section 5.1 gains: a rule with `origins` is matched only for a reading whose origin it lists; the first rule in the binding's order whose `origins` admit the reading and whose `when` holds takes an entry, so an entry becomes at most one element **per reading**. A validator checks that every origin listed is one of `claims.origins` (section 14.1).

Section 9.1, rewritten:

> A **reading** is one tool type's view of a body. A host keeps one **open body** per pair of canonical body path and binding: its bytes, its lossless reading, its findings, its history, and *(FBL 0.10)* one model for each origin it is read for, which the binding's rules give for that origin (section 5.1). Every reading of the body is a view of that open body: an edit made in any of them is planned once against the body's bytes, applied once, recorded in the one history, and shown in every other open reading, of its own origin and of every other, without a reload. Undo in any reading undoes the most recent edit of the body, whichever reading made it. *(FBL 0.10)* A registration's resource selection (section 8.2) is a view of its origin's model, so two registrations of one origin that select different resources show and edit their own while sharing the body's history.

Section 9.2 keeps its rule (a specification that names another binding for an open body is read-only) and adds that readings of different origins through one binding are all editable.

## The resource each reading selects (FR-016, FR-017)

`$defs/RegistrationSettings/properties/resource`:

```json
"resource": {
  "type": "object",
  "properties": {
    "capture": { "type": "string" },
    "byOrigin": {
      "description": "FBL 0.10, section 8.2: the capture per reading's origin; null: readings of that origin select no resource and see every one.",
      "type": "object",
      "additionalProperties": { "oneOf": [ { "type": "null" }, { "type": "object", "properties": { "capture": { "type": "string" } }, "required": ["capture"], "additionalProperties": false } ] }
    }
  },
  "oneOf": [ { "required": ["capture"] }, { "required": ["byOrigin"] } ],
  "additionalProperties": false
}
```

```json
"resource": { "byOrigin": { "databricks/job": { "capture": "job" }, "databricks/pipeline": { "capture": "pipeline" }, "databricks/bundle": null } }
```

Section 8.2: `resource` binds the capture that `byOrigin` gives the reading's origin (or `capture` for every origin); without the header, the first entry in document order that the capture matches, per origin; an origin mapped to `null`, or one `byOrigin` does not list, selects none. A header naming a resource the body does not hold opens the reading empty with a finding, as a missing `resource` does today (edge case).

## Inserts into YAML flow sequences (FR-018)

Section 4.3's flow-collection bullet adds, and section 6.2 states as the insert and removal rules:

- An insert into an **empty flow sequence** (`key: []`) is a `replace-value` of the value and the whitespace before it by nothing, then the `insert-entry` of the new entry as a block sequence entry under the key, at the end of the key's line and after any comment on it, with the body's line endings and the indentation of section 6.3. The fixture `dependency-graph-empty-flow-sequence` already records these splices.
- An insert into a **one-line flow sequence** (`key: [a, b]`) is one `insert-entry` before its `]`, of `, ` and the new item; a mapping item is written `{k: v, …}` in `insert.keys` order, each value by section 6.3's scalar rules. Removing an item of a one-line flow sequence is a `remove-entry` of the item and one separator: the one after it, or for the last item the one before it with the whitespace between.
- A flow sequence written over several lines, and a flow mapping, take no insert: the insert is refused with a reason.
- Each has its exact inverse (section 7.1).

## Refusal sentences (FR-019)

```json
"refusals": {
  "description": "FBL 0.10, section 6.4: the sentence a host shows for each refusal this binding causes, as readOnly gives one.",
  "type": "object",
  "properties": { "empty": { "$ref": "#/$defs/LocalizedText" }, "absent": { "$ref": "#/$defs/LocalizedText" } },
  "additionalProperties": false
}
```

on `$defs/AttributeBinding`, and on `$defs/Insert` with the properties `when` and `container`:

```json
"insert": { "place": "after-last", "container": "tasks", "refusals": { "container": "The job has no tasks section to add into." } }
```

Section 6.4 lists the refusals with a binding's sentence; section 15.3 says a fixture's `refused` is that sentence where the binding gives one.

## An add writes a nested mapping (FR-020)

Section 6.2's `keys` row adds: *(FBL 0.10)* an attribute bound with `child` that the add gives a value is written in the new entry under the levels of `child`, which the entry gets as a set creates them (section 5.2, `create`): the outermost level's key at its place in `keys` when `keys` names it, else after the entry's other keys and before its constants and `skeleton`, each deeper level one indentation step deeper, in the entry's one `insert-entry`. So a library added to a YAML pipeline is `- notebook:` with `  path: …` below it, and reads back as the library added (scenario 9).

## A slot read when another is absent (FR-021)

```json
"secondary": {
  "description": "FBL 0.10, section 5.2: a second slot read only when the attribute's slot is absent. Writing the attribute writes its slot and removes this one (remove-key). Not with override.",
  "$ref": "#/$defs/Slot"
}
```

```json
"schema": { "key": "schema", "empty": "remove", "secondary": { "key": "target" } }
```

## A lowercased key placeholder (FR-022)

Section 13, step 2 adds `{key:lower}`: `{key}` with every ASCII letter in lower case, so `My_Job.yml` gives `my_job`.
