# DISL 0.2 research: telling the user why (gap 7) and gestures and menus (gap 8)

Research input for the plan of `specs/004-disl-0-2` (User Stories 3 and 5, FR-030 to FR-035 and FR-040 to FR-042). Sources: DISL 0.1 (`specifications/disl/DISL-specification.md`, sections 2.3, 2.5, 5.8, 5.10, 6.8, 6.9, 7, 8, 9, 12.3, 14.4) and its schema, DID 0.1, and the 23 definitions and companion notes in `definitions/diagrams/`. Line numbers are those of the files on `features/004-disl-0-2` at 8036c5f.

## 0. Summary of the design

Principle V (extend, do not invent) drives every choice below. Almost every item is an extension of a 0.1 construct:

| Need | 0.1 construct extended | New shape |
|---|---|---|
| Any sentence the tool shows (refusal, reason, label, confirmation, placeholder) | LocalizedText, and the `{cel}` form already used for constraint messages (2.3) | `$defs/Message` = LocalizedText or CelValue, accepted in every user-facing text position |
| Why something is refused, read-only or unavailable | `enabled`, `readOnly`, gesture constraint `message` | `$defs/Reason` (a Message, or `{when, message}`, or `{reason: id}`), used as ordered `Reason[]` lists |
| Confirmations | `deletion.confirm`, `Operation.confirm`, button `confirm` (LocalizedText) | `$defs/Confirmation` object; a plain LocalizedText stays valid and keeps its meaning |
| Dialogs | operation `params` + `paramsForm` + form `placeholder` / `validate` | `Form.submitLabel`, `Form.cancelLabel`, `FormItem.initial`, `FieldValidation.timing` |
| Drop onto an element, drop target is what lies under it, transient targets | Tool `mode`, ContextTool kinds, `contextMenus` | Tool `mode: "drop"` + `Tool.drop` dispatch table whose entries are ContextTools; ContextToolSet `for` keywords `diagram` and `connection` |
| Positional create, reorder | `create` / `reparent` actions, `children.ordered`, DID `order` | `after` / `before` on `create` and `reparent`; new `reorder` action; ContextTool kinds `moveUp` / `moveDown`; gesture kind `reorder` |
| Direction by anchor, node plus edge in one step | anchor `points[].id`, `createSource` / `createTarget` | `EdgeNotation.connect {from, tool}`; `createSource` / `createTarget` accept `{type, initial}` |
| Picker, one entry per list item | ContextTool, operation params with a `reference` widget | ContextTool `target: "pick"` + `candidates`; ContextTool `forEach` / `as` / `args` |
| Clamp versus refuse | snap rule `min`/`max`, `std.axisBounds`, `std.facets` | `outOfRange {drag, typed, message}` on Attribute and Axis |
| Handles writing the model | Handle, two-way `{attribute}` binding (2.5b), placement `write` (5.8) | Handle `write: Action[]`, `visible`, and a statement that an `{attribute}`-bound parameter is written through |

One shared text shape (`Message`) and one shared reason shape (`Reason`) are reused everywhere: gesture constraints, notation refusals, read-only rows, unavailable entries, confirmations, labels, dialogs and the diagram's edit gate. That is also the "Reason" key entity of the feature spec.

Two findings the plan should act on:

1. **The `{cel}` object already slips through LocalizedText.** LocalizedText's schema accepts any object whose keys look like language tags (`^[A-Za-z]{2,3}(-...)*$`), and `cel` matches. So nine places in the definitions that write `{ "cel": ... }` where 0.1 only allows LocalizedText validate today, but a 0.1 runtime must read them as a one-entry locale map with the tag `cel` and show the CEL source as text: FormItem `label` in `azure-devops-pipeline.dis:600,653`, `dotnet-dependency-graph.dis:275,291`, `gartner-hype-cycle-graph.dis:738,744,750`; ContextTool `label` in `mindmap.dis:267,268,270`; Tool `label` in `causal-loop-diagram.dis:418`. Widening these positions to `Message` gives them the meaning their authors intended; it changes their 0.1 reading, so it goes in "Changes from 0.1" (see 7.0).
2. **Gesture checks have no declared order in 0.1.** FDG (`functional-decomposition-graph.md:67`) and OWL (`w3c-owl.md:130`) need "the first refusal in a fixed order". 0.1 says the order of constraints is significant (2.1) but not what it means for gestures. Defining it (7.1) adds meaning where 0.1 had none, so it does not change a 0.1 document.

---

## 7. Telling the user why (gap 7)

### 7.0 The shared shapes: Message and Reason

**Needed by:** every item in this section and in section 8.

**Construct (DISL 2.3, "Localized text", extended):**

- **Message**: a LocalizedText, or a CelValue (`{ "cel": ..., "resultType"?, "doc"? }`) returning `string` or `map(string, string)` keyed by locale. This is what 0.1 already allows for constraint messages, field validation messages and quick-fix labels; 0.2 names it and uses it in every human-facing text position.
- **Reason**: one of
  - a Message (always applies);
  - `{ "when": Expression, "message": Message, "id"?: SimpleId, "doc"?: Doc }` (applies when `when` holds; `when` absent means always);
  - `{ "reason": "<id>" }` (a reference to a named reason in `behavior.reasons`).
- `behavior.reasons`: map id → `{ when, message, doc }`, a library of named reasons, so one sentence is declared once and reused wherever it is reachable (CLD R4.6 `causal-loop-diagram.md:110`, SHACL "both layers say the identical sentence" `w3c-shacl.md:225`).
- `behavior.editGate`: `Reason[]`, diagram-level reasons that withhold every model-changing gesture, tool, operation and field while one applies (truncation `w3c-rdf.md:196`, read-only file `wardley-map.md:154`, "changes nothing in it" `dotnet-dependency-graph.md:181`, `ansible-structure.md:199`, `helm-chart.md:110`, `sparql-query.md:123`). Context `diagram`, `env`. The budgets of gap 10 add their withheld-edit reason here.

**Normative text:**

- In a Message position, an object that has a `cel` property **MUST** be read as a CelValue, never as a LocalizedText map. A LocalizedText map **MUST NOT** use `cel` as a language tag.
- A CEL Message is type-checked in the context of the property that holds it (each position below names it); it **MUST** return `string` or `map(string, string)`. If it fails to evaluate, the runtime **MUST** fall back to the position's default text (for a label, the label derived from the identifier; for a reason or refusal, a runtime-localised sentence naming the rule or reason id) and log a diagnostic, as for visual properties in 2.5.
- A list of Reasons is read in order: the **applicable** reason is the first one whose `when` holds. A `{reason: id}` entry applies when the named reason's `when` holds.
- Messages are evaluated against the model, not the view: a Message **MUST** be able to name an element that is truncated or filtered out of view (spec edge case "a refusal sentence that interpolates a name the user cannot see").
- `behavior.editGate`: while any of its reasons applies, a runtime **MUST** treat every model-changing tool, context tool, operation, form field and gesture as unavailable with that reason (the first applicable one). Moves that write only view data are not model changes and are not withheld (`w3c-rdf.md:194`: "Moves stay allowed on a truncated document").
- A runtime **MUST** show a refusal or unavailability sentence where the user is looking (the refusal line, a tooltip on the disabled entry, the property row), and **MUST** show the same sentence wherever the same reason is reachable.

**Schema $defs:** new `Message` (`anyOf: [LocalizedText, CelValue]`), `Reason` (`anyOf: [Message, {when, message, id, doc}, {reason}]`), `NamedReason`; `LocalizedText` gains `propertyNames: { not: { const: "cel" } }`; `Behavior` gains `reasons` and `editGate`.

**Example (w3c-rdf, the truncation gate, `w3c-rdf.md:196`):**

```json
"behavior": {
  "reasons": {
    "truncated": { "when": "diagram.editsWithheld",
      "message": "The diagram shows only the first part of this file under the drawn-element budget, so edits through it are withheld - an edit through a partial view could touch what the view does not show. Edit the file as text instead." }
  },
  "editGate": [ { "reason": "truncated" } ]
}
```

**0.1 compatibility:** every 0.1 LocalizedText is a Message with the same meaning. The one exception is an object with a `cel` key in a position 0.1 types as LocalizedText (the nine places listed in section 0): 0.1 reads it as a locale map, 0.2 as CEL. List it in "Changes from 0.1" with the reason (the key was never a usable locale and every known use means CEL). The schema change to LocalizedText makes a 0.1 document with a literal `cel` locale invalid; none exists in the repository.

**DID:** none.

### 7.1 Refusal sentence per gesture, per element kind and per selection

**Needed by:**

- per gesture, conditional: C4 "Dragging changes where an element is drawn, not what contains it." (`c4-container.md:83`, `c4-container.dis:2114` as a placement constraint); C4 placement refusals interpolating the kind under the drop (`c4-container.md:112`); FDG connect refusals in a fixed order type, cardinality, cycle, interpolating names (`functional-decomposition-graph.md:67-69`); dependency graph "A node cannot depend on itself." and the other refusals (`dependency-graph.md:135`); databricks-job connect refusals (`databricks-job.md:160`); gartner refusals (`gartner-hype-cycle-graph.md:199-210`); SKOS gesture refusals (`w3c-skos.md:159-160`); RDF relation refusals (`w3c-rdf.md:192`); timeline "Self relations are refused" (`timeline.md:117`); mindmap "The root node cannot be moved.", "A node cannot be moved into its own branch." (`mindmap.md:185`).
- per element kind, static ("this kind never does that"): SPARQL move refusals per kind: edge, annotation, header band, banner, anonymous variable (`sparql-query.md:116-122`); OWL refusals 3 to 5 in order (`w3c-owl.md:130-136`), and "cannot say that refusal 3 applies to edges" (`w3c-owl.md:138`); RDF "That element is not something this diagram can move." for an edge (`w3c-rdf.md:194`); Ansible (`ansible-structure.md:156-160`); Helm "That element is not something this diagram can move." (`helm-chart.md:77`); OWL `w3c-owl.dis:658-670` carries them as placement constraints.
- per selection: RDF "'{actionId}' does not apply to this selection." (`w3c-rdf.md:190`), dependency graph "That action is not available for this item." (`dependency-graph.md:175`), SHACL "does not apply" (`w3c-shacl.md:205`).
- invoked operations refusing with a sentence: Azure add refusals "which DISL operations cannot return as messages" (`azure-devops-pipeline.md:104`) (they can, through `abort`; see below), SHACL `abort` with `rdfTermRefusal` (`w3c-shacl.dis:444`).

**Construct.** Four parts, all extensions:

1. **Gesture constraints (8.4) keep their `message`** (already LocalizedText or `{cel}`, now typed as Message). Add to the gesture contexts: `create` gains `dropTarget` (the element under the pointer, which may differ from `parent` when it is not a container) and `tool` (the tool id); `placement` gains `gesture` (`"move"`, `"resize"`, `"reparent"`); new kind `reorder` (8.2 below).
2. **Order of gesture checks (new normative text in 8.4).** When several checks refuse one gesture, the runtime **MUST** show the message of the first failing check in this order: the notation's refusal for a switched-off gesture (below); the edit gate (7.0); built-in constraints in the order `std.endpoints`, `std.containment`, `std.multiplicity`, `std.acyclic`, `std.axisBounds`, `std.facets`; then declared gesture constraints in declaration order. It **MAY** list the others. This gives FDG its type-cardinality-cycle order with no declaration at all.
3. **Built-in messages can be overridden.** `constraints.builtIn[id]` gains `message: Message`, evaluated in the gesture's context plus `violation` (a map: `rule` = the built-in id; for `std.multiplicity` `max`, `min`, `count`, `relationType`, `end`; for `std.acyclic` `cycle` = list(Element) in loop order; for `std.endpoints` `relationType`; for `std.axisBounds` `min`, `max`, `axis`).
4. **Notation refusals per element kind (6.9, 6.10).** NodeNotation and EdgeNotation gain `refusals`: a map gesture → Message, for gestures the notation or placement switches off: `move` (placement `movable: false`, any edge, a derived or `{layout}`-placed element), `resize`, `reparent`, `delete` (`deletable: false`), `connect` (`connectable: false`), `reconnect` (`reconnectable: false`), `copy` (`copyable: false`), `editLabel` (label `editable: false`). Context `element`. A runtime **MUST** show the refusal when a user attempts that gesture on an element of that kind, and **MUST NOT** fall back to silence when one is declared.
5. **Operation refusals** stay `abort` actions (9.4), whose `message` is an Expression and is already interpolated. Add the normative sentence the Azure note found missing: "A runtime **MUST** show the `abort` message to the user as the refusal of the gesture or command, in the words given." Refusals that apply before anything runs are unavailability reasons (7.3), not aborts.
6. **Standard messages.** `behavior.messages`: map standard message id → Message, overriding the sentences a runtime otherwise words itself: `std.notApplicable` (an action invoked on a selection it does not apply to; context `operation` + `operationId`), `std.readOnly` (the diagram is opened read-only; context `diagram`, `env`). FBL owns the ids for "no registration, nowhere to store a position", "does not parse" and "changed too much to undo".

**Normative text (8.4):**

- A gesture constraint with enforcement `prevent` **MUST** refuse the gesture before it is applied and **MUST** show its `message`, interpolated in the gesture context.
- A refusal about a selection of several elements **MUST** be evaluated once for the gesture, with `selection` bound to all of them; `self` is the element under the pointer (or the first of the selection).

**Schema $defs:** `Constraint.kind` gains `reorder`; `Constraint.message` retyped to `Message` (same set of values); `Constraints.builtIn` values gain `message`; `NodeNotation` and `EdgeNotation` gain `refusals` (new `$defs/GestureRefusals`, properties `move`, `resize`, `reparent`, `delete`, `connect`, `reconnect`, `copy`, `editLabel`, each Message); `Behavior` gains `messages`.

**Example (sparql-query, per element kind, `sparql-query.md:118-121`; FDG, built-in override, `functional-decomposition-graph.md:68`):**

```json
"edges": {
  "TriplePattern": { "refusals": { "move": "An edge is drawn between its endpoints; move one of those instead." } }
},
"nodes": {
  "Annotation": { "refusals": { "move": "An annotation stays with what it constrains; move that instead." } },
  "Variable":   { "refusals": { "reparent": "A query's structure comes from its text, so nothing here can be moved into a different group. Dragging changes where an element sits on the canvas." } }
}
```

```json
"constraints": { "builtIn": {
  "std.multiplicity": { "message": { "cel": "'Refused by the cardinality check: `' + target.name + '` already has its `' + violation.relationType + '` parent, and may have ' + string(violation.max) + '.'" } },
  "std.acyclic":      { "message": { "cel": "'Refused by the cycle check: `' + target.name + '` already owns `' + source.name + '`, so this link would make an ownership loop.'" } }
} }
```

**0.1 compatibility:** all additions are optional properties; no 0.1 check changes outcome, only which message is shown first where 0.1 left it open.

**DID:** none.

**Leave to FBL or the host:** refusals that depend on the host rather than the model ("This diagram is read-only." without a project history, "opened without a registration" `w3c-rdf.md:194`, `w3c-shacl.md:69`, `w3c-shacl.md:341`); DISL provides `env.readOnly` and the `std.readOnly` message, FBL says when a view cannot be stored.

### 7.2 Read-only reason per property-grid row, in priority order; absent versus empty

**Needed by:** Ansible "Every row is read-only and carries a reason naming the file its value lives in" (`ansible-structure.md:199`), absent rows not contributed (`ansible-structure.md:200`); Azure per-row reasons including inherited pool "Set on the stage, not here." and implicit elements (`azure-devops-pipeline.md:120`), "This waits for several things…" and "There is nothing before this for it to wait for." (`azure-devops-pipeline.md:117`), expression-decided enabled (`azure-devops-pipeline.md:118`); C4 Tags, Kind, Identifier (`c4-container.md:113`); CLD loop members (`causal-loop-diagram.md:108`), stated polarity row shown only when it disagrees (`causal-loop-diagram.md:192`); databricks-job Key, Type and Source reasons (`databricks-job.md:175`); .NET "Every row carries a read-only reason, cause then remedy" and "An absence is a row that says so" (`dotnet-dependency-graph.md:179-180`, approximated with `placeholder` and `doc` in `dotnet-dependency-graph.dis:268-299`); Helm (`helm-chart.md:110`); mindmap Collapsed and Identifier (`mindmap.md:197`); SPARQL one reason for every row (`sparql-query.md:124`); OWL, RDF, SHACL and SKOS row tables with reasons, the truncation sentence and the blank-node sentence (`w3c-owl.md:140`, `w3c-rdf.md:200-209`, `w3c-shacl.md:234-248`), SKOS "in priority order" with the truncation reason in the middle (`w3c-skos.md:175`, and `w3c-skos.md:289`); timeline From and To (`timeline.md:141`); Wardley "Every read-only row carries its reason as a full sentence" (`wardley-map.md:179`, `wardley-map.md:227`); SHACL target chips "(not described in this file)" (`w3c-shacl.md:244`).

**Construct (4.3 Attribute and 7.5 Field):**

- `readOnlyReasons: Reason[]` on Attribute and on a form Field. Context `form` for fields (`self`, `value`, `diagram`, `env`) and `element` for attributes.
- `absentText: Message` and `emptyText: Message` on Attribute and Field; `showAbsent: bool` on Field (default `true`).

**Normative text:**

- A field is read-only when its `readOnly` evaluates to `true`, when its attribute is `readOnly`, `derived` or bound to a computed placement, or when any of its reasons applies (field reasons, then attribute reasons, then `behavior.editGate`).
- The reason a runtime shows is the first applicable one in this order: the field's `readOnlyReasons`, the attribute's `readOnlyReasons`, then the edit gate. A `{reason: id}` entry that names a gate reason places that reason where it is listed instead of last (SKOS: SKOS-XL, then truncation, then "Alternate and hidden labels are edited as triples.").
- A runtime at level Standard or above **MUST** show the applicable read-only reason with the field (beside it, or as its explanation) and **MUST** refuse a write to a read-only field with that same reason, whatever the write's origin (form, inline label edit, paste, plugin). If a field is read-only and no reason applies, the runtime **SHOULD** show `doc.summary`.
- An attribute is **absent** for an element when it has no stored value and no `default` (DID omits it); it is **empty** when its stored value is `""`, `[]` or `{}`. A runtime **MUST** show `absentText` for an absent value and `emptyText` for an empty one, and **MUST NOT** show them the same way unless both are unset. With `showAbsent: false` the row is not shown while the value is absent. A validator **SHOULD** warn about `absentText` on an attribute that has a `default`.
- In CEL, absence remains `!has(self.attr)`; no new function is needed.

**Schema $defs:** `Attribute` and `FormItem` gain `readOnlyReasons` (array of `Reason`), `absentText`, `emptyText`; `FormItem` gains `showAbsent`.

**Example (w3c-skos, preferred label row, `w3c-skos.md:175`; .NET description, `dotnet-dependency-graph.md:177-180`):**

```json
{ "attribute": "altLabels",
  "readOnlyReasons": [
    { "when": "self.labelledThroughXl", "message": "This concept's labels are stated through SKOS-XL, which this reading does not resolve (Requirement 3.6). Edit them as triples in the graph reading." },
    { "reason": "truncated" },
    "Alternate and hidden labels are edited as triples."
  ] }
```

```json
{ "attribute": "description", "widget": "readonly",
  "readOnlyReasons": [ "Published by the package's author and read from the local NuGet cache; nothing in this workspace defines it." ],
  "absentText": "Not available - this package is not in the local NuGet cache" }
```

**0.1 compatibility:** additive; a 0.1 field with `readOnly` and no reasons behaves as before. The `placeholder` approximation in the .NET definition keeps its 0.1 meaning (hint text in an empty input).

**DID:** none. DID 3 already omits unset attributes, which is what "absent" means; the definition must not declare a `default` where absence matters (a migration note for the follow-up feature, not a DID change).

### 7.3 Unavailable-with-reason menu entries instead of hidden ones

**Needed by:** CLD "Every action that cannot apply is shown disabled with its reason rather than hidden" and "disabled with 'There is nothing to arrange until this diagram has two variables.'" (`causal-loop-diagram.md:110,117`; `causal-loop-diagram.dis:612-615` has a bare `enabled`); SHACL edit gate entries "available or unavailable with the gate's reason" (`w3c-shacl.md:179,184`, `w3c-shacl.md:337`); RDF R6.4 "never silently absent" (`w3c-rdf.md:280`); C4 deployment toolbox kinds disabled with "Adding a `<kind>` from the toolbox is not supported yet." (`c4-deployment.md:28`); gartner "Even phases" refused with "This trend's phases are already even." (`gartner-hype-cycle-graph.md:99`); Azure "Remove is offered only when the parent keeps more than one" and "Move up" withheld at the ends (`azure-devops-pipeline.md:110,119`); timeline "reported as not applicable rather than failing silently" (`timeline.md:137`). The opposite is needed too: mindmap "Actions that do not apply are not offered rather than disabled" (`mindmap.md:169`), yet `mindmap.dis:264,270` uses `enabled`.

**Construct (7.2 Tool, 7.3 ContextTool, 9.3 Operation, 7.5 button):**

- `visible: Expression` on ContextTool (Tool already has it): whether the entry is offered at all.
- `unavailable: Reason[]` on Tool, ContextTool, Operation and form `button`: the entry is shown disabled when one applies, with its message.
- An entry that invokes an operation inherits the operation's `enabled` and `unavailable`, so the reason is declared once.

**Normative text:**

- An entry whose `visible` is false (or whose operation's `for` does not match the target) **MUST NOT** be shown.
- An entry is **unavailable** when its `enabled` (or its operation's) is false, or when a reason in its `unavailable` list, its operation's list, or the edit gate applies. A runtime **MUST** show an unavailable visible entry disabled, **MUST** show the first applicable reason with it (tooltip, inline text or status line), and **MUST NOT** run it. Invoking it anyway, by shortcut or from another surface, **MUST** be refused with the same reason.
- An entry whose `enabled` is false and to which no reason applies is disabled as in 0.1; the runtime **MAY** show a generic reason.
- Reasons are evaluated in the context of the entry's target: `element` for context tools, `diagram` for toolbox tools, `operation` (without `p`) for operations.

**Schema $defs:** `ContextTool` gains `visible`, `unavailable`; `Tool` and `Operation` gain `unavailable`; `FormItem` (button) gains `unavailable`.

**Example (causal-loop-diagram, `causal-loop-diagram.md:117`):**

```json
"arrange": {
  "label": "Arrange diagram", "for": "diagram",
  "unavailable": [ { "when": "diagram.nodesOfType('Variable').size() < 2",
                     "message": "There is nothing to arrange until this diagram has two variables." } ],
  "actions": [ { "layout": { "scope": "diagram.nodes", "algorithm": "'selfOrganizing'" } } ]
}
```

and mindmap's "not offered rather than disabled": `{ "kind": "operation", "operation": "addSibling", "visible": "self.parent != null" }`.

**0.1 compatibility:** `enabled` keeps its meaning (disabled). `visible` on ContextTool and `unavailable` are new and optional.

**DID:** none.

### 7.4 Confirmations that interpolate, differ by element, and are skipped below a threshold

**Needed by:** mindmap "Deleting a leaf happens without a question. Deleting a branch asks 'Delete branch?' with 'Delete '<text>' and the N nodes under it? You can undo this.'" (`mindmap.md:189`, `mindmap.md:261`; `mindmap.dis:402-407` has none); FDG "only when it has connections, naming how many" (`functional-decomposition-graph.md:57,87`; `functional-decomposition-graph.dis:527-533`); dependency graph (`dependency-graph.md:136`, the `.dis` leaves it out); timeline (`timeline.md:130`; `timeline.dis:528` fixed text); gartner titled "Remove", count, skipped with none (`gartner-hype-cycle-graph.md:212`; `gartner-hype-cycle-graph.dis:918,922`); databricks-job (`databricks-job.md:165,172`; `databricks-job.dis:337`); RDF, OWL and SKOS remove resource with a count, skipped for one statement, danger button "Remove" (`w3c-rdf.md:172,178`, `w3c-owl.md:126`, `w3c-skos.md:163`; `w3c-rdf.dis:443`, `w3c-owl.dis:750`, `w3c-skos.dis:514`); SKOS disconnect, "not styled as dangerous" (`w3c-skos.md:162`; `w3c-skos.dis:515`); Wardley "Remove '{name}', and every link and evolution that names it?" (`wardley-map.md:159,226`; `wardley-map.dis:789`); CLD (`causal-loop-diagram.md:106`; `causal-loop-diagram.dis:623`).

**Construct (9.5 Deletion, 9.3 Operation, 7.5 button).** `confirm` accepts a Message (0.1 form) or a **Confirmation**:

| Property | Type | Default | Meaning |
|---|---|---|---|
| `message` | Message | **required** | The question. |
| `title` | Message | the operation's label, or "Delete" | Dialog title. |
| `confirmLabel` | Message | runtime's "OK"/"Delete" | Label of the confirming button. |
| `cancelLabel` | Message | runtime's "Cancel" | |
| `danger` | bool | `true` for deletion, `false` otherwise | Style the confirming button as destructive. |
| `count` | Expression → int | absent | A number the confirmation is about, bound as `count` in the texts. |
| `threshold` | int | `0` | Ask only when `count >= threshold`. Ignored without `count`. |
| `when` | Expression → bool | `true` | Ask only when it holds. |
| `doc` | Doc | | |

Contexts: in `behavior.deletion`, the `delete` gesture context (`self`, `selection`, `diagram`, `env`) plus `count`; on an operation, the `operation` context (`self` or `selection`, `p` after the parameter dialog, `diagram`, `env`, `position`) plus `count`; on a button, the `form` context plus `count`.

**Normative text (9.5):**

- A runtime **MUST** ask for confirmation before the transaction when `when` holds and, if `count` is given, `count >= threshold`; otherwise it **MUST** proceed without asking. A threshold of `0` asks every time.
- A plain Message in `confirm` is a Confirmation with only `message`, and asks every time, as in 0.1.
- One deletion transaction asks at most once. With several elements selected, the runtime uses the confirmation of the first element in selection order whose confirmation asks, with `selection` bound to all of them.
- Branch versus leaf is expressed with `count` and `threshold` (or `when`) and CEL in the texts, because the deletion policy is already per type.

**Schema $defs:** new `Confirmation`; `DeletionPolicy.confirm`, `Operation.confirm` and `FormItem.confirm` become `anyOf: [Message, Confirmation]`.

**Example (mindmap, `mindmap.md:189`):**

```json
"deletion": { "Node": { "children": "delete", "relations": "delete",
  "confirm": {
    "count": "self.descendants().size()", "threshold": 1,
    "title": "Delete branch?",
    "message": { "cel": "'Delete \\'' + self.text + '\\' and the ' + string(count) + ' nodes under it? You can undo this.'" },
    "confirmLabel": "Delete", "danger": true } } }
```

and FDG, a count of connections: `"count": "self.incoming.size() + self.outgoing.size()", "threshold": 1, "message": { "cel": "'Removing this element also removes the ' + (count == 1 ? '1 connection' : string(count) + ' connections') + ' to or from it.'" }`.

**0.1 compatibility:** a 0.1 `confirm` string validates and means exactly what it did (asks every time). The deletion `danger` default is presentation only.

**DID:** none.

### 7.5 Menu labels that change with state or carry a count

**Needed by:** SHACL "Remove shape (with {count} statements)" and "Remove target: {kind word} {term}" (`w3c-shacl.md:179-182`, `w3c-shacl.dis:169,369`); RDF and OWL "Remove (with {n} statements)" (`w3c-rdf.md:159`, `w3c-owl.md:122`, `w3c-owl.md:249`); CLD "Remove variable (with 3 references)", "Delayed"/"Not delayed", "Flip the curve"/"Curve back the other way" (`causal-loop-diagram.md:106,123-124,129`; `causal-loop-diagram.dis:437-438` gives both readings in one label); Wardley "Evolve to…"/"Change evolution target…", "Mark as <decorator>"/"Clear <decorator>", "Mark as having inertia"/"Clear inertia" (`wardley-map.md:160-163,168,225`; `wardley-map.dis:564-587`); C4 "Add description…"/"Edit description…", "Set technology…"/"Change technology…" (`c4-container.md:109`); mindmap "Add notes…"/"Edit notes…", "Link to…"/"Change link…", "Collapse"/"Expand" (`mindmap.md:164-167`, already written as `{cel}` at `mindmap.dis:267-270`); databricks-job "Disconnect from 'X'" (`databricks-job.md:164`); Azure "Depends on (by default)" as a field label (`azure-devops-pipeline.md:117`, `azure-devops-pipeline.dis:600`).

**Construct:** `label` on Tool, ContextTool, Operation, QuickFix (already), Form, FormItem and section becomes a **Message**. Contexts: ContextTool and FormItem, the target element (`element`, plus `item` and `index` inside `forEach`, 8.7); Tool, `diagram`; Operation, `operation` without `p`.

**Normative text (7.2, 7.3):**

- A runtime **MUST** evaluate a CEL label each time it presents the entry, for the entry's current target.
- Where an entry is listed without a target (a keyboard-shortcut list, toolbox search), a runtime **MUST** use its `doc.summary`, or the operation's label evaluated with no target if it evaluates, or else the label derived from the id (2.4).
- Toolbox search **MUST** match the evaluated label and `doc.summary`.

**Schema $defs:** `Tool.label`, `ContextTool.label`, `Operation.label`, `Form.label`, `FormItem.label`, `FormItem.title` (section) retyped to `Message`.

**Example (w3c-shacl, `w3c-shacl.md:179`):**

```json
{ "kind": "operation", "operation": "removeShape", "shortcut": "Delete", "icon": "mdi:delete-outline",
  "label": { "cel": "self.removalCount > 1 ? 'Remove shape (with ' + string(self.removalCount) + ' statements)' : 'Remove shape'" } }
```

**0.1 compatibility:** widening; see the `cel` locale note in 7.0 for the nine existing uses.

**DID:** none.

### 7.6 Dialogs: placeholders, pre-filled values, validated input, a button label

**Needed by:** RDF dialogs table: title, icon, placeholder, pre-fill, button (`w3c-rdf.md:167-176`); typed-term validation and collision refusal in the dialog (`w3c-rdf.md:180-190`), today plugin functions `rdfResolveTerm`/`rdfTermRefusal`; OWL add dialogs and Rename (`w3c-owl.md:118,124`); SHACL dialogs, button "Add" (`w3c-shacl.md:186-203`, `w3c-shacl.md:339`: "a button label ("Add") is not" expressible; `w3c-shacl.dis:311-344`); SKOS Add concept with validation sentences, Rename pre-filled (`w3c-skos.md:161,164`); dependency graph "Add node", field "Label", prefilled "New node" (`dependency-graph.md:127`); timeline "Give it an end…" prefilled with the begin, refusing as typed; "Add element here" prefilled with today (`timeline.md:128,135`); CLD "Claim a loop from here…" proposing the lowest free `R<n>`, refusing a duplicate (`causal-loop-diagram.md:102`); databricks-job Rename, Assign cluster (`databricks-job.md:161-163`); Wardley and C4 ask the name before creating (`wardley-map.md:147`, `c4-container.md:111`); gartner "'…' is not a date; write it as YYYY-MM" and size "'…' is not a size" (`gartner-hype-cycle-graph.md:130,205`); dependency graph fractional row refused (`dependency-graph.md:128`).

**Construct (7.5 Forms).** Most of this exists in 0.1: operation `params` + `paramsForm`, Form `label` (title) and `icon`, Field `placeholder`, Field `validate` (`rule` + Message, `form` context with `value`), and a `create` form shown "as a dialog before creation". Add:

- `Form.submitLabel: Message`, `Form.cancelLabel: Message`, `Form.danger: bool`.
- `FormItem.initial: Expression` evaluated once when the dialog opens, in the `form` context with `self` bound to the operation's target (element, or the diagram), plus `position` when the operation was invoked at a point; it is the pre-filled value. For a `create` form, context `create`.
- `FieldValidation.timing`: `"input"` (default, as 0.1: shown immediately) or `"commit"` (checked when the dialog is submitted, the timeline "as typed" refusal).

**Normative text:**

- A dialog **MUST** show `placeholder` in an empty input, **MUST** pre-fill `initial`, and **MUST** label its confirming button with `submitLabel`.
- The dialog **MUST NOT** submit while a validation of severity `error` fails, and **MUST** show that validation's message beside the field. Validation messages are Messages in the `form` context (`value`, `self`, `diagram`, `env`), so a message may be computed by a declared function (FR-091), which is how the RDF family's term refusals are written.
- Operation parameters that are all given by the invoking entry's `args` (8.7) **MUST NOT** open the dialog.

**Schema $defs:** `Form` gains `submitLabel`, `cancelLabel`, `danger`; `FormItem` gains `initial`; `FieldValidation` gains `timing`; `FieldValidation.message` retyped to Message (same set).

**Example (w3c-rdf, Rename, `w3c-rdf.md:171,190`):**

```json
"renameDialog": {
  "for": [ "Resource" ], "usage": [ "popover" ],
  "label": "Rename resource", "icon": "mdi:pencil-outline", "submitLabel": "Rename",
  "items": [ {
    "attribute": "newName", "placeholder": "New IRI or prefixed name",
    "initial": "rdfCompress(self.iri)",
    "validate": [
      { "rule": "rdfResolveTerm(value) != ''", "message": { "cel": "rdfTermRefusal(value)" } },
      { "rule": "!diagram.nodesOfType('Resource').exists(r, r.iri == rdfResolveTerm(value) && r != self)",
        "message": { "cel": "rdfResolveTerm(value) + ' already names something in this document; renaming onto it would silently merge two resources.'" } }
    ] } ]
}
```

**0.1 compatibility:** additive.

**DID:** none.

**Leave to a plugin:** the term grammar itself (`rdfResolveTerm`, `rdfTermRefusal`, `rdfMintIri`) and gartner's month parser stay declared plugin functions called from CEL (FR-091); DISL only needs the validation position, which it has.

---

## 8. Gestures and menus (gap 8)

### 8.1 Positional create ("insert after this sibling")

**Needed by:** mindmap "Add sibling … Inserted right after the node" and "DISL's `create` action cannot say 'right after this node'" (`mindmap.md:161,173,259`; `mindmap.dis:359-367`); Azure "Drop on a stage to add another after it" (`azure-devops-pipeline.md:104`, `azure-devops-pipeline.dis:530`).

**Construct (9.4 Actions):** `create` and `reparent` gain `after: Expression` and `before: Expression` (a sibling element; at most one of the two). Without either, a new child is appended last, as today.

**Normative text:**

- With `after` (or `before`), the new or reparented element **MUST** be placed directly after (before) that sibling in its parent's child order, and the sibling **MUST** have the same parent (or both be top-level); otherwise the transaction is rolled back with an error.
- The parent's type **MUST** declare `children.ordered: true` (for top-level elements, the diagram's root type); a validator **SHOULD** warn where it cannot prove this, and a runtime **MUST** roll back a positional create into an unordered parent.
- The runtime assigns the DID `order` value between the neighbours (a fractional index when `persistence.collaboration.ordering` is `fractional-index`, otherwise renumbering the following siblings) in the same transaction.

**Schema $defs:** `Action` (`create`, `reparent` objects) gain `after`, `before`.

**Example (mindmap):**

```json
"addSibling": { "label": "Add sibling", "for": [ "Node" ], "shortcut": "Enter",
  "actions": [
    { "create": { "type": "'Node'", "parent": "self.parent", "after": "self",
                  "attributes": { "text": "siblingName(self.parent.children.map(c, c.text))" } }, "as": "added" },
    { "select": "added" }, { "editLabel": { "target": "added" } } ] }
```

**0.1 compatibility:** additive.

**DID:** none; DID 3 already stores `order` for ordered children. FBL maps model order to a splice position ("insert after the last entry of its kind"); that mapping is FBL's.

### 8.2 Reorder

**Needed by:** Azure "Move up/Move down (Alt+Up/Alt+Down) reorders a step … withheld at the ends and refused when any step of the job comes from a template … DISL has no reorder action, so the `.dis` routes it through a plugin action" (`azure-devops-pipeline.md:119`; `azure-devops-pipeline.dis:580,836-848`); mindmap Ctrl+Up/Down among siblings (`mindmap.md:231,248`).

**Construct:**

- Action `reorder`: `{ "reorder": { "target": expr, "by": expr } }` (a signed int, `-1` is up) or `{ "reorder": { "target": expr, "after": expr } }` / `"before"`.
- ContextTool kinds `moveUp` and `moveDown` (standard entries running `reorder` by −1 / +1 on the selection).
- Gesture constraint kind `reorder`, context `self`, `parent`, `oldIndex`, `newIndex`, `siblings` (list), `diagram`, `env`.
- In a container with an ordered stack or flow layout (ContainerSpec `layout: "stack" | "flow"`), dragging a child along the stack direction is a reorder gesture.

**Normative text:**

- A reorder **MUST** change only the order among siblings, as one transaction, and **MUST** be refused by `reorder` gesture constraints with their message.
- `moveUp` at the first position and `moveDown` at the last **MUST** be unavailable; the runtime supplies the reason unless `behavior.messages` overrides `std.atStart` / `std.atEnd`.

**Schema $defs:** `Action` gains `reorder`; `ContextTool.kind` gains `moveUp`, `moveDown`; `Constraint.kind` gains `reorder`.

**Example (azure-devops-pipeline, `azure-devops-pipeline.md:119`):**

```json
{ "id": "templateStepsKeepOrder", "kind": "reorder", "scope": "Step",
  "rule": "!siblings.exists(s, s.fromTemplate)",
  "message": "Some of this job's steps come from a template, so their order cannot be changed here." }
```

with `{ "kind": "moveUp", "shortcut": "Alt+Up" }, { "kind": "moveDown", "shortcut": "Alt+Down" }` in the Step context menu, replacing the plugin actions at `azure-devops-pipeline.dis:836-848`.

**0.1 compatibility:** additive.

**DID:** none (`order` exists).

### 8.3 Toolbox items dropped onto an element of a given type; a drop whose target is whatever lies under it

**Needed by:** Azure "Toolbox items are dropped onto an element, not onto empty canvas … DISL's `operation` tool kind does not say what it is dropped on" (`azure-devops-pipeline.md:123`); CLD link and loop "dropped onto a variable … A drop anywhere else is refused with 'Drop a link or a loop onto a variable.'" (`causal-loop-diagram.md:133`; `causal-loop-diagram.dis:420,423`); mindmap "Drop on a node to add a child under it … dropping it on empty canvas does nothing" (`mindmap.md:193,259`); Wardley "Pipeline is dropped on a component" (`wardley-map.md:150`; `wardley-map.dis:551`); C4 containers and components dropped on their parent, refused elsewhere with the kind named (`c4-container.md:110,112`); SHACL "A drop inside a card's rectangle runs the action against that card's id; anywhere else against a placement id … DISL's operation tools cannot say that a drop's target depends on what lies under it" (`w3c-shacl.md:172`, `w3c-shacl.md:338`); FDG "no drop-from-palette mode; the `.dis` uses click" (`functional-decomposition-graph.md:54,87`); timeline and dependency graph drops at the pointer (`timeline.md:118`, `dependency-graph.md:125`); databricks-job drop on empty canvas (`databricks-job.md:159`); RDF drop runs the item's action with a placement (`w3c-rdf.md:153`).

**Construct (7.2 Tools):**

- Tool `mode: "drop"`: the user drags the palette entry and releases it; the release point is the **drop point** and the topmost element under it is the **drop target** (null on empty canvas). For `click` mode, the click point and element under it play the same roles.
- Tool `drop`: a dispatch table.

```
"drop": {
  "targets": [ DropTarget, ... ],          // tried in order; the first whose `on` matches runs
  "elsewhere": "create" | "ignore" | "refuse" | "menu",
  "refusal": Message                        // for "refuse"; context: diagram, env, dropTarget, position
}
```

A **DropTarget** is a ContextTool (any kind: `operation`, `create-child`, `create-connected`, `connect`, …) plus `on`: TypeRef[] and/or the keyword `"canvas"`. Its `self` is the drop target (the diagram for `"canvas"`), and `position` is the drop point.

- Defaults: a `create-node` tool without `drop` behaves as 0.1 (create at the point, inside a container under it when containment allows). An `operation` tool without `drop` runs on the drop target if the operation's `for` admits it, else on the diagram.
- `elsewhere`: `create` (the tool's own `creates` at the drop point), `ignore` (nothing happens, no message; mindmap), `refuse` (show `refusal`; CLD), `menu` (open the canvas context menu, 8.8, at the drop point; RDF placement).
- The `create` gesture context gains `dropTarget` and `tool`, so a `create` gesture constraint can refuse per target with an interpolated message (C4).

**Normative text:**

- A runtime **MUST** resolve a drop by trying `drop.targets` in order against the drop target's type (`on` matches subtypes, per TypeRef) and running the first match as one transaction; with no match it **MUST** apply `elsewhere`.
- While the entry is dragged, a runtime at level Standard or above **SHOULD** apply the `dropTarget` state to an element that a target accepts and the `dropReject` state otherwise, and **SHOULD** show the refusal before release.
- A drop target entry that is unavailable (7.3) **MUST** refuse with its reason, not fall through to `elsewhere`.

**Schema $defs:** `Tool.mode` gains `drop`; `Tool` gains `drop` (new `$defs/DropSpec`, `$defs/DropTarget` = ContextTool properties + `on`); `Constraint` gesture context documented with `dropTarget`, `tool`.

**Example (causal-loop-diagram, `causal-loop-diagram.md:133`; w3c-shacl, `w3c-shacl.md:172`):**

```json
{ "id": "link", "label": "Causal link", "icon": "mdi-arrow-right-thin", "mode": "drop", "creates": "CausalLink",
  "drop": { "targets": [ { "on": [ "Variable" ], "kind": "connect", "via": "CausalLink" } ],
            "elsewhere": "refuse", "refusal": "Drop a link or a loop onto a variable." } }
```

```json
{ "id": "propertyRow", "label": "Property row", "kind": "operation", "mode": "drop", "operation": "addPropertyRow",
  "drop": { "targets": [ { "on": [ "Shape" ], "kind": "operation", "operation": "addPropertyRow" },
                         { "on": [ "canvas" ], "kind": "operation", "operation": "addNodeShape" } ] } }
```

**0.1 compatibility:** additive; the default behaviour of tools without `drop` is the 0.1 behaviour.

**DID:** none.

### 8.4 Relation direction chosen by the anchor used

**Needed by:** dependency graph "Dragging from the right anchor … Dragging from the left anchor reverses it … DISL's `connect` context tool and `create-edge` tool have no notion of a direction chosen by the anchor, so the `.dis` can only name the anchors" (`dependency-graph.md:132`; anchors at `dependency-graph.dis:190-196`, `DependsOn` anchoring at `dependency-graph.dis:210-213`); timeline end anchor versus begin anchor (`timeline.md:115`; anchors at `timeline.dis:230-235`); OWL source anchors `axiom-left` and `axiom-right` for the subclass gesture (`w3c-owl.md:128`); RDF relations start only from a resource card's side anchors (`w3c-rdf.md:192`).

**Construct (6.10 Edge notation):** EdgeNotation gains `connect`:

| Property | Type | Meaning |
|---|---|---|
| `from` | map anchor id → `"source"` or `"target"` | The anchors of the node notation (AnchorSpec `points[].id`) from which a connect gesture of this relation type starts, and which end the node dragged from becomes. Absent: every anchor, as `"source"` (0.1 behaviour). |
| `tool` | tool id | The library tool whose `mode`, `initial`, `createSource` and `createTarget` apply to a gesture started from an anchor (so it need not appear in a palette group). |

**Normative text:**

- A connect gesture started from an anchor listed in `from` **MUST** make the node dragged from the end named there and the node landed on the other end; the gesture constraints of kind `connect` see `source` and `target` after this assignment.
- `createSource` and `createTarget` keep their role-based meaning: when the landing point is empty canvas, the runtime creates the end that has no node, so from a `"target"` anchor it is `createSource` that applies. This is what the timeline note found missing (`timeline.md:116`: "DISL's `createTarget` only covers the end-anchor direction").
- An anchor not listed in `from` **MUST NOT** start a connect gesture for this relation type.

**Schema $defs:** `EdgeNotation` gains `connect` (new `$defs/ConnectGesture`).

**Example (dependency-graph):**

```json
"edges": { "DependsOn": {
  "connect": { "from": { "right": "source", "left": "target" }, "tool": "dependsOn" } } }
```

**0.1 compatibility:** additive.

**DID:** none.

**Related, not in the list:** FDG infers the relation type from the pair (`functional-decomposition-graph.md:52`, and five palette tools standalone does not show). The same `connect` object can carry `via: TypeRef[]` on a node notation ("the first listed relation type whose endpoints admit both ends"); recommended for the notation work of US8 rather than here.

### 8.5 Creating a node plus its edge as one step

**Needed by:** dependency graph "Releasing on empty canvas creates a node labelled 'New node' at the release point and the dependency, as one command and one undo step" (`dependency-graph.md:133`; `dependency-graph.dis:246-259` uses `createSource`/`createTarget` but cannot give the label); timeline "creates a new element there (begin at the start of the dropped day, row nearest the drop, 14 days long, labelled 'New element') and relates it, in one command and one undo" (`timeline.md:116`); timeline "Add element after" / "Add element below" and dependency graph Tab/Enter (`timeline.md:131-132`, `dependency-graph.md:126`) are operations and already one transaction.

**Construct (7.2):** `createSource` and `createTarget` accept a TypeRef (0.1) or `{ "type": TypeRef, "initial": map attr → value or {cel}, "size": Size }`. `initial` is evaluated in the `create` context, where `position` is the release point (domain values: a timestamp on a time axis) and `parent` the container under it, plus `other` (the existing end) and `relationType`.

**Normative text:**

- Creating the missing end, the relation, their hooks and their snapping **MUST** be one transaction and one undo step (14.4 already makes every gesture one transaction; this sentence says the created end belongs to it).
- The created node **MUST** be placed at the release point through its placement (bound attributes are written from `position`, snapped as a drop).

**Schema $defs:** `Tool.createSource` becomes `anyOf: [TypeRef, CreateEnd]`; `Tool.createTarget` becomes `anyOf: [TypeRef, CreateEnd, const "ask"]`; new `$defs/CreateEnd`.

**Example (timeline, `timeline.md:116`):**

```json
"relate": { "id": "relate", "creates": "Relation", "mode": "drag",
  "createTarget": { "type": "Element", "initial": {
      "label": "New element",
      "begin": { "cel": "startOfDay(position.x)" },
      "end":   { "cel": "startOfDay(position.x) + duration('336h')" } } },
  "createSource": { "type": "Element", "initial": { "label": "New element",
      "begin": { "cel": "startOfDay(position.x)" }, "end": { "cel": "startOfDay(position.x) + duration('336h')" } } } }
```

**0.1 compatibility:** a TypeRef keeps its meaning.

**DID:** none.

### 8.6 A context tool answered by a picker of existing elements

**Needed by:** Wardley "Link to… and Flow to…, answered by a choice list of the other elements' names; Remove link… … with a choice list" (`wardley-map.md:163,168,225`; `wardley-map.dis:580-581` uses `connect`, a drag); databricks-job "Assign cluster…" asks for a key among declared clusters (`databricks-job.md:163`); SHACL "Remove target" as one operation with a choice (`w3c-shacl.dis:505-512`, a `select` over `self.targets`); C4 Req 12.4 "offering model elements not yet on the view" (`c4-container.md:114`).

**Construct.** For operations, 0.1 already has it: a reference-typed parameter with a `reference` or `select` widget and `options`. What is missing is the same for `connect` and `create-connected`. ContextTool gains:

| Property | Type | Default | Meaning |
|---|---|---|---|
| `target` | `"drag"`, `"pick"`, `"either"` | `"drag"` | How the other end is chosen. `pick` opens a picker of candidates. |
| `candidates` | Expression → list(Element) | every element the relation's endpoints and prevent-constraints admit | Narrow the list; context `element` (`self` is the element the tool is on). |
| `candidateLabel` | Message | `item.label()` | Row text; context `element` + `item`. |
| `pickerTitle` | Message | the tool's label | |
| `emptyText` | Message | runtime's | Shown when there are no candidates (the entry is unavailable with it). |

**Normative text:**

- With `target: "pick"`, a runtime **MUST** list the candidates for which the `connect` gesture constraints (and built-ins) would pass, in the order the expression returns (or by label), and **MUST** make the entry unavailable with `emptyText` when the list is empty.
- Choosing a candidate **MUST** run the same transaction a drag to that element would.

**Schema $defs:** `ContextTool` gains `target`, `candidates`, `candidateLabel`, `pickerTitle`, `emptyText`.

**Example (wardley-map):**

```json
{ "kind": "connect", "via": "Dependency", "label": "Link to…", "target": "pick",
  "candidates": "diagram.nodesOfType('Positioned').filter(n, n != self)",
  "candidateLabel": { "cel": "item.name" }, "emptyText": "There is nothing else on this map to link to." }
```

**0.1 compatibility:** additive; `target` defaults to the 0.1 drag.

**DID:** none.

### 8.7 One menu entry per list item

**Needed by:** SHACL one "Remove target: {kind word} {term}" per chip, "a DISL menu has neither one entry per list item nor a computed label" (`w3c-shacl.md:179,182`); databricks-job "Disconnect from 'X'", one entry per dependency (`databricks-job.md:164`); Wardley decorator toggles, one per decorator (`wardley-map.md:162`, today five fixed entries at `wardley-map.dis:574-579`).

**Construct (7.3):** ContextTool gains `forEach: Expression → list`, `as: identifier` (default `item`), `args: map param → Expression` (the invoked operation's parameters, evaluated with the item bound; also usable without `forEach`), and `submenu: Message` (group the generated entries under one submenu).

**Normative text:**

- A ContextTool with `forEach` **MUST** produce one entry per list element, in list order, with `item` (or the `as` name) and `index` bound in its `label`, `visible`, `enabled`, `unavailable`, `args` and `icon`; an empty list produces no entry.
- When `args` supplies every required parameter of the operation, the runtime **MUST NOT** open the parameter dialog.
- A runtime **MAY** collapse more than a runtime-chosen number of generated entries into the `submenu` (or a picker, 8.6).

**Schema $defs:** `ContextTool` gains `forEach`, `as`, `args`, `submenu`.

**Example (w3c-shacl, `w3c-shacl.md:179`):**

```json
{ "kind": "operation", "operation": "removeTarget", "icon": "mdi:crosshairs-off",
  "forEach": "self.targets.filter(t, t.predicateIri != '' && t.termIri != '')", "as": "chip",
  "label": { "cel": "'Remove target: ' + chip.kindWord + ' ' + chip.term" },
  "args": { "target": "chip" } }
```

**0.1 compatibility:** additive.

**DID:** none.

### 8.8 A context menu on empty canvas gated on a model fact

**Needed by:** OWL "only when the file holds a triple `? rdf:type owl:Ontology` also 'Add class here…' … DISL has no context menu for the canvas background, so the `.dis` carries the four as `for: "diagram"` operations with a plain `enabled` and records the gate as the diagram attribute `ontologyDeclared`" (`w3c-owl.md:120`, `w3c-owl.md:250`; `w3c-owl.dis:52`); timeline "Empty canvas: Add element here, Add moment here … Placed at the clicked time and row. From a menu without a position, asks for the begin" (`timeline.md:135`); CLD "the canvas menu entry has no DISL counterpart beside the palette" (`causal-loop-diagram.md:116`); C4 add actions "only on empty canvas" (`c4-container.md:110`); RDF placement entries (`w3c-rdf.md:161`).

**Construct (7.3):** `toolbox.contextMenus[].for` accepts the keyword `"diagram"` (the canvas background, as `Form.for` already does). The set's `when` gates it on a model fact (context `element` with `self` = the diagram). Entries see `position`, the clicked point in domain values; the `operation` context gains `position` (null when the operation was not invoked at a point).

**Normative text:**

- A right-click (or the platform's context gesture) on empty canvas **MUST** open the context menu sets whose `for` includes `"diagram"` and whose `when` holds, plus the standard entries unless `standardEntries: false`.
- `position` **MUST** be the clicked point, snapped as a drop would be; an operation invoked from elsewhere sees `position == null`, so it can ask for the value instead (with `FormItem.initial`, 7.6).

**Schema $defs:** `ContextToolSet.for` items become `anyOf: [TypeRef, enum ["diagram", "connection"]]`; operation context documented with `position`.

**Example (w3c-owl):**

```json
{ "for": [ "diagram" ], "placement": "menu", "when": "self.ontologyDeclared", "tools": [
  { "kind": "operation", "operation": "addClass", "label": "Add class here…", "icon": "mdi:shape-circle-plus" },
  { "kind": "operation", "operation": "addObjectProperty", "label": "Add object property…", "icon": "mdi:ray-start-arrow" } ] }
```

**0.1 compatibility:** a type named `diagram` is already ambiguous in `Form.for`; identifiers are case-sensitive and every definition uses PascalCase types, so the keyword is safe. List it in "Changes from 0.1" as a reserved name.

**DID:** none.

### 8.9 Menu entries for transient targets

**Needed by:** RDF "Menu entries for transient targets (a drop position, a drawn relation before it exists)" (`w3c-rdf.md:318`), the placement `new:x,y` entries and the relation gesture `rel:{from}->{to}` → "Relate…" (`w3c-rdf.md:161-162`), "The `.dis` cannot hide menu entries per placement id or gesture id" (`w3c-rdf.md:165`); OWL "a relation between two OWL classes offers 'Subclass of' above 'Relate…'" (`w3c-rdf.md:219`), while a drawn connection "always dispatches `owl.subclass` … without a menu" (`w3c-owl.md:128`); dependency graph and timeline carry the whole gesture as one call (`dependency-graph.md:134`, `timeline.md:115`).

**Construct.** Two transient targets, both covered by constructs above:

- **A point** (a toolbox drop or a click on empty canvas): the `"diagram"` context menu of 8.8 with `position`, reached from a drop through `drop.elsewhere: "menu"` (8.3).
- **A pending connection** (a connect gesture that ends on an element before any relation exists): ContextToolSet `for: ["connection"]`, context `connection`: `source`, `target` (elements, after the anchor assignment of 8.4), `sourceAnchor`, `position`, `diagram`, `env`. Entries are typically operations that take `source` and `target` through `args`. A node notation's anchor that no `EdgeNotation.connect.from` claims starts a pending connection when a `connection` menu set exists. ContextToolSet gains `runSingle: bool` (default `false`): when exactly one entry is available, run it without showing the menu.

**Normative text:**

- A pending connection **MUST NOT** create any model element until an entry runs; cancelling the menu **MUST** leave the model unchanged and record nothing.
- The entry that runs **MUST** see the pending connection's `source` and `target` as they were when the gesture ended.

**Schema $defs:** `ContextToolSet` gains `runSingle`; new CEL context `connection` (12.3).

**Example (w3c-rdf, `w3c-rdf.md:162,174`):**

```json
{ "for": [ "connection" ], "placement": "menu",
  "when": "source.isA('Resource') && target.isA('Resource')",
  "tools": [ { "kind": "operation", "operation": "relate", "label": "Relate…", "icon": "mdi:ray-start-arrow",
               "args": { "from": "source", "to": "target" } } ] }
```

**0.1 compatibility:** additive.

**DID:** none.

**Leave to FBL:** entries that appear because the file asserts another reading's types (SKOS entries under the RDF reading, `w3c-skos.md:155`, `w3c-rdf.md:217-221`) depend on one model with several readings, which is FBL's.

### 8.10 Clamping a drag versus refusing a typed value

**Needed by:** Wardley "The drag is clamped to the map (0..1 on both axes) … A value typed into the property grid outside 0..1 is refused, not clamped … DISL's `std.axisBounds` … does not distinguish" (`wardley-map.md:140-142,229`; attributes at `wardley-map.dis:114-115`); FDG "A size below the minimum … is clamped, not refused" (`functional-decomposition-graph.md:59`); gartner "Setting a boundary … clamps each stored boundary" (`gartner-hype-cycle-graph.md:91`); timeline "The moving edge stops at the other instead of crossing it" while a typed end before the begin is refused (`timeline.md:114,143`); dependency graph "a fractional row is refused … rather than truncated" (`dependency-graph.md:128`).

**Construct (4.3 Attribute facets and 5.3 Axis):** `outOfRange`:

| Property | Values | Default | Meaning |
|---|---|---|---|
| `drag` | `"clamp"`, `"refuse"` | `"refuse"` | A gesture (move, resize, handle drag) that would put the value past `min`/`max` (attribute) or the axis bounds. |
| `typed` | `"refuse"`, `"clamp"` | `"refuse"` | A value entered in a form, an inline label or pasted. |
| `message` | Message | the runtime's `std.facets` / `std.axisBounds` text | The refusal; context `gesture:change` (`self`, `attribute`, `oldValue`, `newValue`) plus `min`, `max`. |

`min` and `max` on an attribute accept an Expression in 0.2 (the timeline end bounded by the begin: `"min": { "cel": "self.begin" }`), evaluated in the `element` context.

**Normative text:**

- With `drag: "clamp"`, a runtime **MUST** stop the dragged value at the bound, **MUST NOT** refuse the gesture, and **MUST** apply the bound after snapping: when the snapped value lies past the bound, the bound wins, even if it is not on the snap grid (spec edge case "a snap rule and a hard bound disagree").
- With `refuse`, the runtime **MUST** refuse the change with `message` (for a drag, before release, per 8.4).
- `std.axisBounds` and `std.facets` keep their 0.1 severity and enforcement; `outOfRange` only chooses clamp or refusal for the prevented gesture.

**Schema $defs:** new `$defs/OutOfRange`; `Attribute` and `Axis` gain `outOfRange`; `Attribute.min` / `max` widened to accept `CelValue`.

**Example (wardley-map):**

```json
"maturity": { "type": "Fraction", "required": true, "group": "Position", "order": 2, "step": 0.01,
  "outOfRange": { "drag": "clamp", "typed": "refuse",
                  "message": { "cel": "string(newValue) + ' is off the map; maturity runs from 0 to 1.'" } } }
```

**0.1 compatibility:** defaults are 0.1's (refuse both ways). `Fraction` bounds come from the data type; the facet expressions are new and optional.

**DID:** none.

### 8.11 Shape handles that write model attributes (gartner phase boundaries)

**Needed by:** gartner "each drawn inner boundary is a handle … writes the boundary's model attribute (`peakEnd`, `troughEnd` or `slopeEnd`) as a month … DISL shape handles edit shape parameters stored in view data, never model attributes, so the specification records the handles only as the `x-ghg-boundaryHandles` key" (`gartner-hype-cycle-graph.md:87`; `gartner-hype-cycle-graph.dis:442-445`); "Only a boundary between two visible phases can be moved; any other is refused" (`gartner-hype-cycle-graph.md:87,206`); the keep-a-month-apart clamp (`gartner-hype-cycle-graph.md:91`); timeline resize edges stop at each other (`timeline.md:114`).

**Construct (6.8 Handles):**

- If the shape instance binds the handle's parameter with `{ "attribute": "path" }` (2.5b), the handle **writes that attribute** (two-way binding), not view data. This states what 2.5b already implies for user-editable bindables.
- Handle `write: Action[]`: for parameters bound with `{cel}`, the inverse, run with `value` (and `yValue`) bound to the new, snapped parameter value, like placement's computed-with-inverse `write` (5.8). New CEL context `handleWrite`: `self`, `diagram`, `env`, `p`, `w`, `h`, `value`, `yValue`.
- Handle `visible: Expression` (context `element`, plus `env`): whether the handle is offered (selected trend, true-time mode, a boundary between two visible phases).
- Handle `refusals.move: Message`: shown when the user tries to drag a handle that is not visible because it does not apply (optional; most runtimes simply do not draw it).
- Handle `snap` may be a CEL snap rule in the `handle` context, which is how the keep-one-step-apart landing is written; the iterative clamp across neighbours is a declared function (FR-091).

**Normative text:**

- A handle drag that writes model attributes **MUST** be one transaction (one undo step) of kind `change`, with `attribute` bound per written attribute: `change` gesture constraints, `outOfRange` (8.10), hooks and invariants apply as to any attribute change, and a refusal **MUST** return the handle to its previous position and show the message.
- A parameter written through the model **MUST NOT** also be stored in view data; its shape parameter's `persist` is ignored.

**Schema $defs:** `Handle` gains `write` (array of `Action`), `visible`, `refusals`; new CEL context `handleWrite`.

**Example (gartner-hype-cycle-graph):**

```json
"handles": [
  { "param": "b1", "x": "w * p.b1", "y": "h / 2", "axis": "x",
    "visible": "self.view.selected && env.viewpoint == 'trueTime' && visiblePhases(self) >= 2",
    "snap": { "cel": "boundaryLanding(self, 1, value)" },
    "write": [ { "set": { "peakEnd": "fractionToMonth(self, value)" } } ],
    "label": { "cel": "'Peak ends ' + formatWhen(fractionToMonth(self, p.b1), diagram.unit, false)" } }
]
```

This replaces `x-ghg-boundaryHandles` (SC-004).

**0.1 compatibility:** a 0.1 handle on a free or `{param}` parameter keeps writing view data. A 0.1 handle on an `{attribute}`-bound parameter was underspecified (6.8 says view data, 2.5b says two-way); 0.2 settles it as a write to the attribute. None of the 0.1 examples or the 23 definitions has such a handle, so no document changes meaning; record the clarification in "Changes from 0.1".

**DID:** none.

---

## 9. Consolidated schema impact

New `$defs`: `Message`, `Reason`, `NamedReason`, `Confirmation`, `GestureRefusals`, `DropSpec`, `DropTarget`, `ConnectGesture`, `CreateEnd`, `OutOfRange`.

Changed `$defs` (all widening or optional additions):

- `LocalizedText`: excludes the `cel` tag.
- `Attribute`: `readOnlyReasons`, `absentText`, `emptyText`, `outOfRange`; `min`/`max` accept `CelValue`.
- `Axis`: `outOfRange`.
- `FormItem`: `label`/`title` → Message; `readOnlyReasons`, `absentText`, `emptyText`, `showAbsent`, `initial`, `unavailable`; `confirm` → Message or Confirmation.
- `Form`: `label` → Message; `submitLabel`, `cancelLabel`, `danger`.
- `FieldValidation`: `message` → Message; `timing`.
- `Tool`: `label` → Message; `mode` + `drop`; `drop`, `unavailable`; `createSource`/`createTarget` accept `CreateEnd`.
- `ContextTool`: `label` → Message; `kind` + `moveUp`, `moveDown`; `visible`, `unavailable`, `forEach`, `as`, `args`, `submenu`, `target`, `candidates`, `candidateLabel`, `pickerTitle`, `emptyText`.
- `ContextToolSet`: `for` accepts `"diagram"`, `"connection"`; `runSingle`.
- `Operation`: `label` → Message; `confirm` → Message or Confirmation; `unavailable`.
- `DeletionPolicy`: `confirm` → Message or Confirmation.
- `Constraint`: `kind` + `reorder`; `message` → Message.
- `Constraints.builtIn` values: `message`.
- `Action`: `create` and `reparent` gain `after`/`before`; new `reorder`.
- `NodeNotation`, `EdgeNotation`: `refusals`; `EdgeNotation`: `connect`.
- `Handle`: `write`, `visible`, `refusals`.
- `Behavior`: `reasons`, `editGate`, `messages`.

CEL contexts (12.3): `gesture:create` gains `dropTarget`, `tool`; `gesture:placement` gains `gesture`; new `gesture:reorder`; `operation` gains `position`; new `connection`, `handleWrite`; `violation` in built-in message overrides; `count` in confirmations; `item`/`index` (or the `as` name) in `forEach` entries.

## 10. Changes from 0.1 (for the "Changes from 0.1" section, FR-002)

1. An object with a `cel` key in a position 0.1 typed as LocalizedText is read as CEL (nine existing uses, section 0). Reason: the key was never a usable locale, and every use means CEL.
2. `LocalizedText` maps may not use `cel` as a language tag.
3. `"diagram"` and `"connection"` are reserved in `contextMenus[].for` (and `"canvas"` in drop `on`).
4. A handle on an `{attribute}`-bound shape parameter writes the attribute (clarifies 2.5b against 6.8).
5. Gesture checks have a declared order (7.1); 0.1 left it open, so no document changes meaning.

## 11. Left to a plugin, a host or FBL

| Item | Where | Why |
|---|---|---|
| Term grammars (IRI resolution, minting, the month and size parsers) | declared plugin functions called from CEL (FR-091) | Format-specific parsing; DISL only needs the validation and message positions, which it has. |
| Gartner's iterative keep-a-month-apart clamp across neighbours | a declared function used in a handle `snap` | An iterative pass over neighbouring anchors; bounded CEL cannot state it cleanly. |
| Refusals about the host: no project history, no registration, file drift on undo, unparseable file | FBL and the host, through `env.readOnly`, `behavior.messages` ids FBL defines | They are about files and registrations, not the model. |
| Menu entries offered because the file asserts another reading's types | FBL (one model, several readings) | DISL scopes tools to one specification. |
| The dialog's visual chrome (modal versus popover, icon placement) | host | `Form.usage` already chooses create, popover or inspector. |

## 12. Traceability (gap 7 and 8 items → section)

| Gaps-summary item | FR | Section |
|---|---|---|
| Refusal sentence per gesture, per element kind, per selection | FR-030 | 7.0, 7.1 |
| Read-only reason per row in priority order; absent versus empty | FR-031 | 7.2 |
| Unavailable-with-reason entries | FR-032 | 7.3 |
| Confirmations: interpolate, differ by element, threshold; 0.1 `deletion.confirm` valid | FR-033 | 7.4 |
| Menu labels with state and counts | FR-034 | 7.5 |
| Dialogs: placeholders, pre-fill, validation, button label | FR-035 | 7.6 |
| Positional create | FR-040 | 8.1 |
| Reorder | FR-040 | 8.2 |
| Drop onto an element of a type; drop target is what lies under it | FR-040 | 8.3 |
| Direction chosen by the anchor | FR-040 | 8.4 |
| Node plus edge in one step | FR-040 | 8.5 |
| Picker of existing elements | FR-040 | 8.6 |
| One menu entry per list item | FR-040 | 8.7 |
| Empty-canvas menu gated on a model fact | FR-040 | 8.8 |
| Entries for transient targets | FR-040 | 8.9 |
| Clamp a drag versus refuse a typed value | FR-041 | 8.10 |
| Handles writing model attributes | FR-042 | 8.11 |

Independent tests of User Stories 3 and 5, covered by the examples above: FDG delete confirmation (7.4), SHACL "Remove shape (with 5 statements)" (7.5), .NET read-only reasons (7.2), mindmap "insert sibling after" (8.1), gartner phase-boundary handles (8.11), dependency graph "connect to existing" (8.6 with `target: "pick"` on a `connect` context tool for `DependsOn`).
