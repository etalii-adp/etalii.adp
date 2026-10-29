# Contract: views, the legacy sidecars and identities (pull requests A and C)

FBL sections 4.7, 4.9, 8.6, 8.7 and 9.3, and `fbl.schema.json`. Research: R10, R15, R16.

## Views of a `grammar` binding (FR-008, FR-009, FR-011, FR-012), pull request A

`$defs/BlockRule` gains `at`, `origins` and `insert`, and its `view` takes a Slot in the `grammar` family. One of the rewritten `structurizr.fbl`'s block rules:

```json
"blocks": [
  {
    "name": "containerView",
    "at": "/workspace/views/container_view",
    "origins": ["c4/container"],
    "view": { "node": "key", "match": "\"(?<value>[^\"]*)\"" },
    "insert": {
      "place": "end",
      "container": "/workspace/views",
      "emit": "container {scope} \"{key}\" {\n    include *\n    autoLayout lr\n}"
    }
  }
]
```

and a rule read for the selected view only, mapped `as: "diagram"` by the C4 definitions' `typeMap`:

```json
{
  "name": "viewInclude",
  "type": "ViewInclude",
  "at": "/workspace/views/*/include_statement",
  "selectedView": true,
  "attributes": { "members": { "node": "ARG", "many": true, "readOnly": true } }
}
```

(Selectors and node names are settled with the grammar, research R3.)

Normative text, in section 4.9 after *Entries, values and selectors*:

- The binding's `blocks` name nodes that produce no element: a BlockRule of the family has `at` and no `line`. With `view`, its entries are **views** of the body, named by the slot's value, which a registration's `view` header selects (section 9.3). With `origins`, it is a view for readings of those origins only.
- An element or relation rule with `selectedView: true` matches only entries inside the entry of the view the reading shows (section 9.3); in every other view the same entries are not read, and are unbound for that reading.
- Every view is still an entry of the body, whichever view a reading shows, so a rule about the model (DISL's `View`) sees all of them; an element rule may select the same node.
- A BlockRule's `insert` adds one of its entries with its `emit`, planned and undone as an element's insert is (section 6.2); the new entry produces no element. Adding a view does not create a registration (section 8.4 is unchanged).

Section 9.3, rewritten:

> The registration's `view` header selects which view of the body the reading shows, for bindings whose `blocks` define views (sections 4.7 and, *(FBL 0.10)*, 4.9), matched ignoring the case of ASCII letters; without it, the first view in document order of the block rules whose `origins` include the reading's origin, or of every view block when none has `origins`. Which elements a view draws is the reading's DISL viewpoint's. What FBL reads of the selected view is what the rules with `selectedView` read inside it (section 4.9). *(FBL 0.10)* A registration whose `view` names no view of the body opens a reading that shows no view's content; no finding is reported for it; a change of view data (a placement) is refused with the reason "This view is not in the document, so its positions cannot be stored." and nothing is written.

(The C4 module's own sentence for the empty canvas, which the conversion keeps, is the tool type's; the refusal's text above is informative where a host has its own, as section 15.3 says of refusals.)

## The legacy layout (FR-010), section 8.7, pull request A

The `legacyLayout` bullet is replaced by:

> `registration.legacyLayout`, such as `{base}.layout.json` for the C4 types: a JSON object keyed by view key, then by element id, each `{"x": …, "y": …}`. Positions of the registration's view are read from it when the registration has no `layout:` block, and written back to it, by json splices (section 6), as long as it exists. *(FBL 0.10)* View keys and element keys are matched with a view's key and an element's id ignoring the case of ASCII letters. When two keys of one view match one id, the first in the file applies; the others are neither applied nor written, and each is reported as `fbl.duplicate-key`. A number is written as section 6.3 writes it with `number: "shortest"`. A move is a `replace-value` of `x` and of `y`; a first placement an `insert-entry` of the element's member, laid out as the member before it in its view is (on one line, or one key per line), and an `ensure-container` of the view's object, at the end of the root object, when the file has none for the view; undoing it removes them. An entry of the view being written whose key names no element of the body is **stale**: it is reported as `fbl.stale-view-data` and removed at that write, in the same edit, as section 8.5 removes a layout entry; entries of the other views of the file are not touched.

## The legacy identities file and identities (FR-026 to FR-029), sections 8.6 and 8.7, pull request C

`$defs/IdBinding`'s `sidecar` gains `kind` and `ordinal`:

```json
"sidecar": {
  "type": "object",
  "properties": {
    "key": { "$ref": "#/$defs/Expression" },
    "kind": { "description": "FBL 0.10, section 8.6: the key space of this rule's identities.", "$ref": "#/$defs/Name" },
    "ordinal": { "description": "FBL 0.10, section 8.6: appended to the key of each later holder of one key; {n} is its ordinal in decimal.", "type": "string", "pattern": "\\{n\\}" }
  },
  "required": ["key"],
  "additionalProperties": false
}
```

The Wardley map's component rule, in the new `wardley-map.fbl`:

```json
"id": { "sidecar": { "key": "entry.name", "kind": "component", "ordinal": "\u001f{n}\t" } }
```

Section 8.6, rewritten:

> `identities:` holds ids for bindings whose rules use `id.sidecar` (section 5.3): one entry per element, `<natural key>: <id>`, where the natural key is the value of the rule's `sidecar.key` expression and the id is made by DISL's strategy the first time the element is read without one. *(FBL 0.10)* When the rule declares `kind`, its entries' keys are `<kind>:<natural key>`, so that two rules' elements with one natural key keep entries of their own. Entries are written, ordered and pruned like layout entries. Two elements of one kind with the same natural key: without `ordinal`, the second is reported as DISL's `std.duplicateId` and gets an id that is not stored; *(FBL 0.10)* with `ordinal`, holders are counted per kind in document order and each later holder's natural key is followed by `ordinal` with `{n}` replaced by its ordinal (2 for the second), so each holder has an entry of its own. When an attribute a natural key is computed from changes, the element's entry moves to the new key in the same edit (a `replace-value` of its key), and an undo moves it back. An id first stored for an element is written with the next write of the body and is no step of the history (section 7.1).

The `legacyIdentities` bullet of section 8.7, rewritten:

> `registration.legacyIdentities`, such as `{base}.identities.json` for the Wardley map: *(FBL 0.10)* a JSON array of entries `{"id": …, "kind": …, "key": …}`, in which `kind` is a rule's `sidecar.kind` and `key` its natural key as section 8.6 makes it, `ordinal` included. It is read when the registration has no `identities:` block and written back to it while it exists, by json splices: a new entry is an `insert-entry` after the array's last item, laid out as that item is; a moved key a `replace-value` of `key`; a pruned entry a `remove-entry` with one separator. An entry whose `kind` no rule declares is kept as written and reported as `fbl.stale-view-data`. FBL 0.9 described the file as an object from natural key to id; no tool wrote that form.

Both files keep the rule that ends the section: a host **MUST NOT** create either file for a new document.
