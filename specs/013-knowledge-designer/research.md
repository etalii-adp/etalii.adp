# Research: The Knowledge Designer's Definition

Read against FBL 0.2 (`specifications/fbl/FBL-specification.md`) and DISL 0.3 at `ebb1f58`, and the validator `.github/scripts/validate-examples.py` as this feature extends it.

## R1. Can an attribute `reference` name a rule's stored id? (task 1, first open point)

**Yes.** FBL section 5.7 already treats a stored id as a referenced value: "When the referenced value changes (the `by` attribute of an entry of the `to` rules, or an id stored with `from`), every reference to the old value is rewritten". Section 6.2 cascades a removal to "elements whose reference names it". What the text leaves unsaid is how `by` spells the id; it says `by` is an attribute. DISL and DESL reserve `id` as a built-in field of every element and forbid it as an attribute's name (DISL section 4.3, *Reserved names*; DESL section 2.2), so `"by": "id"` cannot mean an attribute and names the element's id without ambiguity.

- The bindings write `"reference": { "to": ["property"], "by": "id" }` on a cell's, a column's, a sort's, a condition's and a view's `groupBy` property slot, and `{ "to": ["option"], "by": "id" }` on every option slot. Removing a property or an option therefore cascades to the cells, columns, sorts and conditions that name it, in one edit, with no code in the designer.
- The validator now checks it: `by` is an attribute every rule in `to` binds, or `id` when every rule in `to` stores its id with `id.from`. A `by: "id"` towards a rule without a stored id fails.
- FBL 0.3 (task 3) states the spelling in sections 5.2 and 5.7, a wording change: no host reads a 0.2 binding differently.

What the cascade does not reach, the designer does in the same transaction, and `knowledge.md` says so: a view's `groupBy` naming a removed property is cleared, and group settings (`groupOrder`, `hiddenGroups`, `collapsed`) whose key is a removed option's id are removed. Neither can be a cascade: `groupBy` is an attribute of a view, which must not go with the property, and a group key holds an option id, a row id or a checkbox state, so it is not a reference to one rule.

## R2. Can a rule at `/` bind the root's keys as `Table`'s attributes? (task 1, second open point)

**Yes, and one binding already does.** Section 4.2: "`/` alone selects the root." `specifications/fbl/databricks-pipeline.fbl` has the rule `pipeline` at `/`, binding the root keys `name`, `catalog`, `schema` and others, and the fixture `databricks-pipeline-json` sets `catalog` on it with a `replace-value` splice. The design's remark that no existing binding does it was mistaken. The knowledge bindings' `table` rule is at `/` for YAML and JSON, and at `/knowledge`, the root element, for XML.

## R3. A view's group and filter settings are keys of the view, not a nested mapping

The design's example nests them: `group: { by, hideEmpty, collapsed }` and `filter: { match, conditions }`. In FBL 0.2 the root group's `match` and `by` would be attribute slots reached through `child`, and setting one when the `group` or `filter` mapping is absent is not defined: `absent: insert` inserts a key into an entry's mapping, and `create` adds a container that holds entries, not a mapping that holds keys. Two hosts would write different bytes, against FBL's first principle.

The knowledge file therefore keeps them as keys of the view, each written and removed by `insert-key` and `remove-key`, which FBL defines exactly:

| Design | Knowledge file |
|---|---|
| `group.by` | `groupBy` |
| `group.hideEmpty` | `hideEmptyGroups` |
| `group.order`, `group.hidden`, `group.collapsed` | `groupOrder`, `hiddenGroups`, `collapsed`, lists of `{ key }` |
| `filter.match` | `filterMatch` (`all` when absent) |
| `filter.conditions` | `filter`, a list of conditions and groups; a group is `{ match, conditions }` |

Nothing the design asks a view to store is lost, and no language changes. By its Requirement 1.7 the definition wins, and the standalone design is amended to match.

## R4. Model attribute names avoid DESL's reserved names

DESL forbids `type`, `parent` and the other members of an element as attribute names (DESL section 2.2), and a binding's attribute names are the metamodel's unless `persistence.typeMap` maps them (DESL section 5.2). The file keeps its short keys, and the binding maps them to model names that are allowed: the key `type` of a property is the attribute `valueType`, `parent` is `isParent`, and `target` is `targetFile`, so that it never reads as the `target` of an action.

## R5. Ids of entries without a stored id

Properties, options, views and rows store a ShortGuid (`uuid-v4`, `base36`). The other types derive theirs (DESL section 5.3.2), and the fixtures list them in that form: a cell is `<row>/<property>`, a column `<view>/columns/<property>`, a sort `<view>/sorts/<property>`, a group setting `<view>/<list>/<key>`, a related row or option in a cell `<cell>/<value>`, and a filter condition or group `<view>/filter/<index>[/<index>…]`, which is ephemeral because it follows the entry's place. Nothing stores the id of a condition.

## R6. The fixture format lacks FBL 0.2's move

`$defs/Edit` in `fbl.schema.json` predates FBL 0.2: its `add` has `parent` and `after` but no `position`, and there is no `move`. FBL 0.2 defines both (section 11.2, `$defs/ModelChange`). Task 4's reorder steps need them, so FBL 0.3's schema lets a fixture's edit be `move` and an `add` carry `position`, in the shape `$defs/ModelChange` already gives. This adds no behaviour to FBL; it lets the fixtures test what 0.2 specifies.

## R7. DESL stands on its own (Peter, 2026-10-09)

The Knowledge designer is a designer, so DISL and DID are never used for it: DESL and DED are (Peter, in the project thread, 2026-10-09 00:21). This replaces language decision L4, by which DESL 0.1 adopted DISL's metamodel, ids, findings and transaction by reference. DESL 0.1 now defines each construct `knowledge.des` uses in its own sections and its own schema, with no reference to DISL's: element types, attributes, enumerations, containment and references (section 4), the type map and ids (section 5), constraints and findings (section 6), operations and actions (section 8), the CEL environment, in which the document is `document` and its elements are read with `elementsOfType` (section 9), and the processing model (section 10). FBL keeps serving every kind of tool: its schema no longer references DISL's, and its section 1.3 pairs every construct it relies on with its DISL section for a diagram and its DESL section for a designer. `knowledge.des` and `minimal-table.des` say `document` where they said `diagram`.

A knowledge file is a DED definition (2026-10-09, the recommended option of the question put to Peter in the project thread). DED 0.1 gets its first content: the envelope every definition begins with, `ded: "0.1"` and `designer: etalii/knowledge` as the first root keys in YAML and JSON and `<ded version="0.1" designer="etalii/knowledge">` as the root element in XML, in place of the `knowledge: "0.1"` header; its schema `ded.schema.json`, which `knowledge.schema.json` refines; and the example `library.ded`. The envelope is each binding's marker, so a knowledge file is recognised without its registration and its extensions are no longer `registrationOnly`; the JSON binding also claims `.ded`.
