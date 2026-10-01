# DISL 0.2 research: derived elements (gap 3) and the small items (gap 13)

Scope: User Story 4 (FR-090, FR-091) and User Story 10 (FR-100) of `specs/004-disl-0-2/disl-0-2.spec.md`. Sources: `specifications/disl/DISL-specification.md` (0.1), `specifications/disl/disl.schema.json`, `specifications/did/DID-specification.md`, and the 23 definitions in `definitions/diagrams/`. File and line citations are to those files as of 2026-09-30.

Design rules applied throughout: extend 0.1 constructs before adding new ones (constitution V); every computed value is CEL (constitution III); a 0.1 specification stays valid and keeps its meaning (FR-002).

---

## 0. Summary of decisions

| # | Item | Decision | Where |
|---|------|----------|-------|
| A | FBL / DISL line | FBL produces **stored elements**, one per source entry, each with a source location and (or without) a write rule. DISL **derived elements** are every element whose existence is a function over other elements: grouping, merging, splitting, lifting, membership, and anything whose ends or parent are derived. | new 4.11 (informative boundary note) |
| B1 | Derived node types | New `derived` object on a node type (`from`, `key`, `id`, `attributes`, `parent`, `slot`, `sources`, `reason`, `edits`). | 4.6, new 4.11 |
| B2 | Derived edges | 0.1 `derived: Expression` on a relation type keeps its meaning; 0.2 adds an object form with the same members plus `source`, `target`, `owner`. Extra keys in 0.1 result maps are defined as attribute values. | 4.9, 4.11 |
| B3 | Computed containment | `derived.parent` / `derived.slot` on derived node types. Stored nodes keep stored containment. | 4.11 |
| B4 | Edge owned by another scope | `derived.owner` on derived relations; `owner` becomes a CEL member of every relation. | 4.11, 12.2 |
| B5 | Merging several source elements | `derived.key`: items with equal keys yield one element; `group` holds them. | 4.11 |
| B6 | Provenance, findings, edits | `sources` list on every derived element (`Element.sources` in CEL); findings attach to derived elements and borrow the first source's location; gestures are refused with `reason` unless `edits` maps them to operations. | 4.11, 8, 12.2 |
| B7 | C4 view membership | New `members` expression on a viewpoint. | 3.5 |
| B8 | C4 relationship lifting | Expressible with B2 + B5 + B7 and a user function; no new construct. | example |
| B9 | Processing | Derived elements are computed in declaration order in the "recompute derived" step of every transaction and on load; never written; never on undo; failures give one finding and draw the rest. | 2.5, 14.2, 14.4 |
| C1 | Recursion | Opt-in bounded self-recursion on user functions: `recursion: {maxDepth, atMaxDepth}`. | 3.4 |
| C2 | Cycle enumeration | Built-in `diagram.cycles(relType, max)` and `diagram.cyclesTruncated(relType, max)`, with a defined canonical order. | 12.4 |
| D | CEL calls a plugin function | Formalise 13.1 `celFunctions`: bare-name calls, collision rule, `uses`, `deterministic`, named params, `fallback`, and behaviour when absent. | 13.1, 15.2 |
| E1 | Simulated animated action | New `simulate` body on an operation (alternative to `actions`/`plugin`): discrete steps of a CEL state function, timed, outside any transaction, never on undo. | 9.3, new 9.6 |
| E2 | `forEach` sees earlier iterations | Clarify: actions run sequentially on the transaction's working state; the list is evaluated once. | 9.4 |
| E3 | `sort()` on strings | Defined as Unicode code point order, stable; `sortBy` likewise. | 12.1, 12.5 |
| E4 | Enum wire values with hyphens | New `value` on an enum value: the stored form; CEL keeps using the identifier key. | 4.5 |
| E5 | `acyclic` on an abstract relation | Covers the union of the type and all its subtypes; `*OfType`, `inCycle`, `reachable` include subtypes. | 4.9, 8.7, 12.2 |
| E6 | Fixed attribute not persisted | New `fixed` on an attribute (allowed as narrowing in a subtype): constant, read-only, never persisted. | 4.3, 4.7 |

Left to FBL, not DISL: Azure template attribution and unresolved-template nodes, Databricks unknown kinds, and the whole-model reads of Ansible, Helm and .NET (section A). Left to a plugin: layouts that consume derived elements (gap 5, a later feature); OWL's canvas renderer MAY stay a plugin function if the engineer prefers speed, but it is now expressible (C1).

---

## A. Where FBL stops and derived elements start

### A.1 The criterion

FBL's read binding turns a foreign file into **stored model elements**. A stored element corresponds to one entry of the source (a triple, a YAML list entry, a DSL statement, a `.csproj` reference), carries that entry's source location (FR-020's shape, defined in DISL), and either has a write rule (it is spliced back) or has none, in which case FBL marks it "not written back" (feature spec, Context, boundary bullet 3).

A DISL **derived element** is computed over the model once read. It has no source entry of its own. An element is derived when any of these holds:

1. it **groups** several stored elements (an RDF card is every triple sharing a subject IRI);
2. it **merges** several stored elements into one drawn element (a SKOS hierarchy edge stated by `skos:broader` and `skos:narrower`);
3. it **splits** one stored element into several drawn ones (an OWL IRI that is both a class and an individual);
4. it **lifts** or **filters** elements for a view (C4 membership and lifted relationships);
5. its **ends or parent are derived** (an RDF statement edge between two derived cards; a SPARQL variable placed in its shallowest scope).

Stated as a normative sentence for 4.11: "A derived element **MUST NOT** have a source entry of its own; its source location, where one is needed, is that of its first source (4.11.4). An element that corresponds to exactly one source entry, and whose ends and parent are stored, **SHOULD** be a stored element produced by the format binding, not a derived element."

Consequence for FBL (to align with the parallel session): FBL does not group, merge or lift. A read binding that needs any of the five operations above produces the finer-grained stored records and leaves the drawn projection to DISL. Stored records that should never be drawn are ordinary node types excluded by the viewpoint (3.5 already says excluded types "still exist in the model and are still validated"), so no FBL "hidden" construct is needed.

### A.2 Classification of the gap-3 items

| Item | Source | Owner | Why |
|------|--------|-------|-----|
| W3C cards from triples | `w3c-rdf.md:97-103`, `w3c-owl.md:61`, `w3c-shacl.md:73-94`, `w3c-skos.md:86-96` | DISL derived (group) | one card per IRI across many triples |
| W3C literal rows | `w3c-rdf.md:105`, `w3c-shacl.md:102-107` | DISL derived attribute of the card | a list over the group |
| `rdf:type` triple as a badge | `w3c-rdf.md:107`, `w3c-owl.md:90`, `w3c-rdf.dis:98-113` | DISL derived attribute of the card, and a `from` filter that keeps it off the edges | no new construct beyond B1 |
| One IRI yielding two elements | `w3c-owl.md:72`, `w3c-owl.md:213` (punning) | DISL derived (split): two derived node types over the same IRIs | ids differ by prefix |
| Edges merging several triples | `w3c-skos.md:98`, `w3c-shacl.md:140`, `w3c-skos.dis:208-221` | DISL derived relation with `key` | one edge per pair |
| SPARQL, everything from the query | `sparql-query.md:68`, `:204` | split: scopes, patterns, annotations are FBL stored records (one per syntax entry, read-only); variables and pattern edges are DISL derived | variables group mentions; pattern edges end on derived variables |
| SPARQL shallowest-scope placement | `sparql-query.md:80`, `:204` | DISL computed containment (B3) | parent is a function of all mentions |
| SPARQL edges owned by a scope other than their ends | `sparql-query.md:80`, `:205`; `sparql-query.dis:249` | DISL derived relation `owner` (B4) | |
| Azure template attribution | `azure-devops-pipeline.md:36`; `.dis:144, 151-155` | **FBL**: the read binding follows the template and gives each element the template file as its source location; DISL 0.2 exposes that location in CEL (`self.source`, from the findings work, FR-020) so the read-only reason can say "This comes from {file}" | 1:1 with an entry, in another file |
| Azure "unresolved template" pseudo-nodes | `azure-devops-pipeline.md:37-43`; `.dis:224-234` | **FBL**: only the reader knows the resolution failed; the node is 1:1 with the `template:` entry and is not written back | FBL owns "not written back" |
| Databricks unknown kinds as generic nodes, never written | `databricks-bundle.md:44`; `databricks-bundle.dis:82-89` | **FBL**: 1:1 with an unmodelled key, no write rule | |
| C4 view membership (include/exclude, wildcards) | `c4-container.md:66` (and the same line in the five sibling notes); `c4-container.dis:71-88, 2272-2290` | DISL viewpoint `members` (B7) | membership is a function of stored `includes`/`excludes` |
| C4 relationships lifted and merged | `c4-container.md:67` and siblings | DISL derived relation (B2, B5) using membership | |
| Ansible, Helm, .NET: model derived from a folder | `ansible-structure.md:27, 246`; `helm-chart.md:22-28`; `dotnet-dependency-graph.md:63` | **FBL** (folder as subject, gap 2) | the "derivation" there is reading; the only DISL parts are the derived attributes and relations these `.dis` files already use (`helm-chart.dis:283-316`) |

---

## B. Derived elements

### B1. Derived node types

**(1) Needed by.** W3C ×4 (`w3c-rdf.md:97-107`, `w3c-owl.md:61-90`, `w3c-shacl.md:73-140`, `w3c-skos.md:86-104`); SPARQL (`sparql-query.md:68-80`, `:204`). Today each of these hands the whole projection to a required plugin (`w3c-rdf.dis:484-503`, "the projection of triples onto this specification's elements").

**(2) Construct.** Section 4.6 gains a row; a new section **4.11 Derived elements** holds the rules.

| Property | Type | Description |
|----------|------|-------------|
| `derived` | DerivedNode | The node type's elements are computed from the model, never stored (4.11). |

`DerivedNode`:

| Property | Type | Req. | Context | Description |
|----------|------|------|---------|-------------|
| `from` | Expression → `list(dyn)` | ✓ | `derive` | The items; one element per item, or per distinct `key`. |
| `key` | Expression → `dyn` | – | `deriveItem` | Items with equal keys (CEL `==`) yield one element. Default: every item is its own element. |
| `id` | Expression → `string` | ✓ | `deriveItem` | The element id. It **MUST** be unique among all elements of the diagram. |
| `attributes` | map attribute → Expression | – | `deriveItem` | Values of the type's attributes. An attribute not listed has its default. |
| `parent` | Expression → `Element?` | – | `deriveItem` | Computed containment (B3). Default `null` (top level). |
| `slot` | Expression → `string` | – | `deriveItem` | Slot in the parent (4.8). |
| `sources` | Expression → `list(Element)` | – | `deriveItem` | Provenance (B6). Default: `group` when the items are elements, else `[]`. |
| `reason` | Bindable&lt;string&gt; | – | `element` | Why a gesture on the element is refused (B6). Default: the runtime's localized "This is computed from the model, so it cannot be edited here." |
| `edits` | map gesture → operation id | – | – | Gestures that are carried out by an operation on the sources instead of being refused (B6). Keys: `delete`, `reparent`, `move`, `connect`, `rename`, `attribute:<name>`. |
| `doc` | Doc | – | – | |

New CEL contexts (12.3):

| Context | Used by | Variables |
|---------|---------|-----------|
| `derive` | `derived.from` | `diagram`, `env` |
| `deriveItem` | every other `derived` expression | `item` (the first item of the group), `group` (all items with this key, in `from` order), `index` (position of the group in `from` order), `diagram`, `env` |

Normative sentences for 4.11:

- "A node type with `derived` **MUST NOT** be instantiated by a user, a tool, a template or an action; `create`, `delete`, `retype` and `reparent` actions whose target is a derived element are a specification error where statically known and a run-time error otherwise."
- "Derived elements **MUST NOT** be written to a DID definition or by a format binding, and **MUST NOT** enter the undo history. Undoing a change to their sources recomputes them."
- "Every attribute of a derived node type is read-only. An attribute with its own `derived` expression (4.3) is evaluated on the derived element in the `element` context, as for stored elements."
- "The runtime **MUST** compute derived node types in declaration order, then derived relation types in declaration order (4.11.5). Each `from` sees the stored elements and the derived elements of every type computed before it; a reference to a derived type computed later is a specification error."
- "Groups are ordered by the position of their first item in `from`; that order is the iteration order of the type in `diagram.nodes` and `nodesOfType` (12.5)."
- "Two derived elements with the same id, or a derived id equal to a stored id, is a run-time error: the later one in computation order is not drawn and one finding `std.derivedId` names both."
- "The ids of a derived type are stable unless the type is marked unstable by the identity construct of FR-011; view data **MAY** be stored for derived elements with stable ids and **MUST NOT** be stored for the others."

A derived node type MAY extend stored or abstract node types and inherits their notation, forms and constraints (4.7). A stored type MUST NOT extend a derived one.

**(3) Schema.** `NodeType.properties.derived: {"$ref": "#/$defs/DerivedNode"}`. New `$defs/DerivedNode` (object, `required: ["from","id"]`, `additionalProperties: false`, `^x-` allowed). `edits` is `{"type":"object","propertyNames":{"pattern":"^(delete|reparent|move|connect|rename|attribute:[A-Za-z_][A-Za-z0-9_]*)$"},"additionalProperties":{"$ref":"#/$defs/SimpleId"}}`.

**(4) Example (w3c-rdf).** Triples are stored records produced by the Turtle binding and excluded from the viewpoint; the card, its rows and its badges are derived.

```json
"types": {
  "Triple": {
    "doc": "One triple of the file, as the format binding reads it. Never drawn.",
    "attributes": {
      "s": { "type": "string" }, "p": { "type": "uri" }, "o": { "type": "string" },
      "oKind": { "type": "TermKind" }, "language": { "type": "string" }, "datatype": { "type": "string" }
    }
  },
  "Resource": {
    "extends": "Term",
    "labelAttribute": "display",
    "attributes": {
      "iri":   { "type": "uri" },
      "types": { "type": "uri", "many": true },
      "rows":  { "type": "LiteralRow", "many": true },
      "badgeLine": { "type": "string", "derived": "self.types.map(t, rdfDisplayName(t)).join(' · ')" }
    },
    "derived": {
      "from": "diagram.nodesOfType('Triple').map(t, t.oKind == 'iri' && t.p != RDF_TYPE ? [[t.s, t], [t.o, t]] : [[t.s, t]]).flatten()",
      "key": "item[0]",
      "id": "'res:' + item[0]",
      "attributes": {
        "iri":   "item[0]",
        "types": "group.map(g, g[1]).filter(t, t.s == item[0] && t.p == RDF_TYPE && t.oKind == 'iri').map(t, t.o)",
        "rows":  "group.map(g, g[1]).filter(t, t.s == item[0] && t.oKind == 'literal').map(t, {'predicateIri': t.p, 'value': t.o, 'language': t.language, 'datatype': t.datatype, 'memberIndex': 0})"
      },
      "sources": "group.map(g, g[1]).distinct()",
      "reason": "'Resources are read from the triples; add, rename or remove them through the context menu.'",
      "edits": { "delete": "removeResource", "rename": "renameResource" }
    }
  }
},
"viewpoints": { "graph": { "exclude": ["Triple"], "default": true } }
```

(`RDF_TYPE` stands for the IRI literal; blank-node subjects follow the same pattern in a `BlankNode` derived type with an unstable id. The `rdf:type` triple does not contribute its object as a card key, which is exactly "a class used only as an `rdf:type` object is a badge, not a card", `w3c-rdf.dis:120`.)

One IRI yielding two elements (OWL, `w3c-owl.md:72`): two derived types, `OwlClass` with `id: "'res:' + item"` and `Individual` with `id: "'ind:' + item"`, each with its own `from` filter over the same triples. Nothing more is needed: "One stored element **MAY** be a source of any number of derived elements, of one or several types."

**(5) 0.1 compatibility.** New optional property; no 0.1 document has it. Adding derived nodes to `diagram.nodes` changes nothing for a 0.1 document, which has none.

**(6) DID.** DID 3 gains: "A definition **MUST NOT** contain records of derived types. A reader that finds one treats it as unknown content (8.2): preserved, not part of the model, reported." DID 5 gains: "The keys of a view's `nodes` and `edges` **MAY** name derived elements whose ids are stable. A key that names no element after derived elements are computed is kept and ignored; it is not an unresolvable reference." DID 8.1 step 3 excludes view keys from "references resolvable", and a new step between 3 and 4 computes derived elements. DID version 0.2.

### B2. Derived edges

**(1) Needed by.** W3C statement edges between derived cards (`w3c-rdf.dis` `Statement`, `w3c-owl.md:76`, `w3c-shacl.md:134-140`), SKOS merged pairs (`w3c-skos.md:98`), SPARQL pattern edges (`sparql-query.md:84`), C4 lifted relationships (`c4-container.md:67`). 0.1's form is already used with extra keys the spec does not define: `azure-devops-pipeline.dis:266` returns `'isImplicit': true`.

**(2) Construct.** 4.9's `derived` becomes *Expression or DerivedRelation*.

- 0.1 form, meaning kept: "an Expression returning `list(map)`; each map has `source` and `target` (Elements). **New in the text, not in meaning:** any other key that names an attribute of the relation type gives that attribute's value, and the keys `id`, `sources` and `owner` have the meanings of the object form. When `id` is absent the id is `<TypeName>:<source.id>-><target.id>`, with `#2`, `#3` … appended to repeats in list order."
- Object form: every DerivedNode property except `parent`/`slot`, plus:

| Property | Type | Req. | Description |
|----------|------|------|-------------|
| `source`, `target` | Expression → `Element` | ✓ | The ends; they **MUST** satisfy the relation type's `source`/`target` declarations, else the item is dropped with one `std.derivedEnds` finding per type. |
| `owner` | Expression → `Element?` | – | B4. |

**(3) Schema.** `RelationType.properties.derived: {"anyOf": [{"$ref":"#/$defs/Expression"}, {"$ref":"#/$defs/DerivedRelation"}]}`. The two branches cannot both match: an Expression object requires `cel`, a DerivedRelation requires `from` and forbids `cel`.

**(4) Example (w3c-skos, one edge per pair).**

```json
"Broader": {
  "source": { "types": ["Concept"], "role": "narrower" },
  "target": { "types": ["Concept"], "role": "broader" },
  "attributes": { "assertedBothWays": { "type": "bool" } },
  "derived": {
    "from": "diagram.nodesOfType('Triple').filter(t, t.p in [SKOS_BROADER, SKOS_NARROWER] && t.oKind == 'iri')",
    "key": "item.p == SKOS_BROADER ? [item.s, item.o] : [item.o, item.s]",
    "id": "cel.bind(k, item.p == SKOS_BROADER ? [item.s, item.o] : [item.o, item.s], 'broader:' + k[0] + '|' + k[1])",
    "source": "diagram.elementById('res:' + (item.p == SKOS_BROADER ? item.s : item.o))",
    "target": "diagram.elementById('res:' + (item.p == SKOS_BROADER ? item.o : item.s))",
    "attributes": { "assertedBothWays": "group.size() > 1" },
    "edits": { "delete": "disconnectPair" }
  }
}
```

**(5) Compatibility.** The 0.1 expression form keeps its meaning; defining extra keys and a default id only fills what 0.1 left open (listed under "Clarifications" in "Changes from 0.1").

**(6) DID.** As B1.

### B3. Computed containment

**(1) Needed by.** SPARQL shallowest-scope placement (`sparql-query.md:80`, `:204`). The feature spec's acceptance scenario 2 of User Story 4.

**(2) Construct.** `derived.parent` and `derived.slot` (B1). Sentences: "The parent of a derived node is the value of `parent`; it **MAY** be a stored or a derived node of a type computed earlier, and **MUST** be allowed by that type's `children` (4.8), else the element is drawn at top level with one `std.containment` finding. A stored node's parent is always stored; DISL 0.2 does not compute containment for stored nodes." "A gesture that would change a derived node's parent is refused with the type's `reason` unless `edits.reparent` names an operation; that operation runs as one transaction and the parent then follows from recomputation."

For the SPARQL "longest common ancestor" CEL needs `ancestors()` in a defined order. 12.2 is clarified: "`ancestors()` lists the parent first and the top-level ancestor last."

**(4) Example (sparql-query).** `Mention` is a stored record per variable occurrence (scope, name), produced by the SPARQL binding.

```json
"functions": {
  "commonScope": {
    "params": [{ "name": "scopes", "type": "list(Element)" }], "returns": "Element",
    "cel": "cel.bind(lca, ([scopes[0]] + scopes[0].ancestors()).filter(a, scopes.all(s, s == a || a in s.ancestors()))[0], lca.isA('Union') ? lca.parent : lca)"
  }
},
"Variable": {
  "extends": "Term",
  "attributes": { "name": { "type": "string" }, "joinCount": { "type": "int" } },
  "derived": {
    "from": "diagram.nodesOfType('Mention').filter(m, m.kind == 'variable')",
    "key": "item.name",
    "id": "'var:' + item.name",
    "attributes": { "name": "item.name", "joinCount": "group.filter(m, m.inPattern).size()" },
    "parent": "commonScope(group.map(m, m.scope))",
    "reason": "'Everything here is read from the query; edit the query text to change it.'"
  }
}
```

(`lca` is null-safe because every scope descends from the root `where` scope.)

**(5)/(6)** New, optional; DID as B1.

### B4. Edges owned by a scope other than their ends

**(1) Needed by.** SPARQL (`sparql-query.md:80` "An edge belongs to the scope that states it and may cross region borders", `:205`; today an attribute, `sparql-query.dis:249`).

**(2) Construct.** `derived.owner` on DerivedRelation. "The owner of a relation is the element it belongs to: it is drawn in the owner's layer (6.16), hidden when the owner is collapsed or hidden, and counted among the owner's contents by layout. Default: the nearest common ancestor of its ends, or the diagram." 12.2 adds `owner → Element` to the relation members (0.1 lists it only for nodes and ports); for stored relations it is the default above, which is what runtimes already do.

**(4) Example.**

```json
"PatternEdge": {
  "source": { "types": ["Term"] }, "target": { "types": ["Term"] },
  "attributes": { "predicate": { "type": "string" }, "isPath": { "type": "bool" } },
  "derived": {
    "from": "diagram.nodesOfType('Pattern')",
    "id": "'edge:' + termId(item.s) + '|' + item.predicate + '|' + termId(item.o) + '|' + string(item.ordinal)",
    "source": "diagram.elementById(termId(item.s))",
    "target": "diagram.elementById(termId(item.o))",
    "owner": "item.scope",
    "attributes": { "predicate": "item.predicate", "isPath": "item.isPath" }
  }
}
```

**(5)** Compatible (the default restates current behaviour). **(6)** None.

### B5. Merging (key and group)

Covered by `key`/`group` in B1 and B2; used by SKOS pairs (`w3c-skos.md:98`), SHACL edge dedupe (`w3c-shacl.md:140`), RDF cards (`w3c-rdf.md:101`) and C4 lifted relationships (`c4-container.md:67`, "several relationships collapsing onto one pair draw one line, carrying the first one's label", which is `group[0].description`). Rule: "Keys are compared with CEL equality; a key **MUST** be a string, number, bool or list of those, else a specification error where statically known." A general `groupBy` CEL macro was considered and rejected: `key` keeps grouping declarative and lets the runtime index it, and CEL maps have no defined iteration order.

### B6. Provenance, findings and edits on derived elements

**(1) Needed by.** RDF "Remove (with {n} statements)" (`w3c-rdf.md:159`), SKOS "Disconnect (both directions)" (`w3c-skos.md:150, 162`), feature spec edge case "A derived node whose computation fails", and every W3C/SPARQL finding on a card.

**(2) Construct.**

- 12.2 adds to `Element`: `derived → bool` and `sources → list(Element)` (empty for stored elements).
- 8: "Constraints **MAY** scope derived types. A problem on a derived element is keyed by its id; its source location (FR-020) is that of its first source that has one. Suppressions **MUST NOT** name derived elements with unstable ids."
- 9: "Hooks never fire for derived elements appearing, changing or disappearing." Operations named in `edits` receive the derived element as `self`, so they reach the stored elements through `self.sources`.
- Refusals: a gesture on a derived element that `edits` does not map is refused with `reason`, which the refusal work (FR-030) displays like any other refusal sentence.

**(4) Example.** `"edits": { "delete": "removeResource" }` with

```json
"removeResource": {
  "for": ["Resource"],
  "label": { "cel": "self.sources.size() > 1 ? 'Remove (with ' + string(self.sources.size()) + ' statements)' : 'Remove'" },
  "actions": [ { "delete": "self.sources" } ]
}
```

(The Bindable label depends on the menu-label construct of FR-034.)

**(5)/(6)** New; DID as B1 for suppressions.

### B7. View membership from include/exclude lists and wildcards (C4)

**(1) Needed by.** All six C4 types: `c4-container.md:66`, `c4-component.md:66`, `c4-context.md:62`, `c4-deployment.md:66`, `c4-dynamic.md:66`, `c4-system-landscape.md:61`; the stored lists are `c4-container.dis:71-88`; the rules approximate membership inline (`c4-container.dis:2033, 2047`). The C4 dynamic bug "interaction participants never become members" (gaps summary) is a membership bug.

**(2) Construct.** Viewpoint (3.5) gains:

| Property | Type | Description |
|----------|------|-------------|
| `members` | Expression → `bool`, context `element` | Whether an element whose type passes `include`/`exclude` is drawn in views of this viewpoint. Default `true`. |

Sentences: "An element is drawn in a view when its type passes `include` and `exclude` and `members` is true for it. A relation is drawn only when both its ends are drawn. Elements not drawn remain in the model and are validated (as in 0.1)." CEL gains `e.drawn() → bool` in the `element`, `deriveItem` and `constraint` contexts, evaluated for the current viewpoint; headless validators evaluate it for the viewpoint of each stored view, and for the default viewpoint when a definition has no view. Wildcards use the existing `matchesGlob` (12.4).

**(4) Example (c4-container).**

```json
"functions": {
  "inView": {
    "params": [{ "name": "e", "type": "Element" }], "returns": "bool", "uses": ["diagram"],
    "cel": "(diagram.includes.exists(i, i == '*' || matchesGlob(e.id, i))) && !diagram.excludes.exists(x, matchesGlob(e.id, x))"
  }
},
"viewpoints": {
  "container": {
    "include": ["Person", "SoftwareSystem", "Container"],
    "members": "inView(self)",
    "layout": "c4Ranks", "default": true
  }
}
```

**(5)** Optional, default `true`: 0.1 meaning. **(6)** None: membership is recomputed, never stored.

### B8. Relationships lifted to the nearest drawn ancestor and merged (C4)

**(1) Needed by.** `c4-container.md:67` and the same bullet in the five sibling notes.

**(2) Construct.** No new construct: a derived relation over stored `Relationship`s, using B7's function, B5's `key`, and the `ancestors()` order clarified in B3. The stored `Relationship` is excluded from the viewpoint so that every drawn line is the derived one.

**(4) Example (c4-container).**

```json
"functions": {
  "liftTo": {
    "params": [{ "name": "e", "type": "Element" }], "returns": "Element", "uses": ["diagram"],
    "cel": "([e] + e.ancestors()).filter(a, inView(a)).first().orValue(null)"
  }
},
"relations": {
  "DrawnRelationship": {
    "source": "Element", "target": "Element",
    "attributes": { "description": { "type": "string" }, "technology": { "type": "string" } },
    "derived": {
      "from": "diagram.relationsOfType('Relationship').filter(r, liftTo(r.source) != null && liftTo(r.target) != null && liftTo(r.source) != liftTo(r.target))",
      "key": "[liftTo(item.source).id, liftTo(item.target).id]",
      "id": "'rel:' + liftTo(item.source).id + '->' + liftTo(item.target).id",
      "source": "liftTo(item.source)",
      "target": "liftTo(item.target)",
      "attributes": { "description": "item.description", "technology": "item.technology" },
      "edits": { "attribute:description": "describeRelationship", "delete": "deleteRelationships" }
    }
  }
}
```

and `"exclude": [..., "Relationship"]` on the viewpoint. **(5)/(6)** as B2.

### B9. Processing model, errors and budgets

- 14.2 (load): after validation and migrations, "compute derived elements (4.11)", then resolve view data.
- 14.4 (transaction): the existing step "recompute derived values & bindings" is extended to derived elements, before invariants. "Expressions evaluated during the transaction that read derived elements see them as of the working state; runtimes **MAY** recompute incrementally, but the result **MUST** equal a full recomputation." Selection and view data follow ids across recomputation.
- 2.5 table, new row: "Derived element: a failing `from` yields no elements of that type and one finding `std.derivedFailed` naming the type and the error; a failing per-item expression drops that item, with one finding per type and error message. The rest of the diagram is drawn." (Feature spec edge case, verbatim intent.)
- 8.7 gains `std.derivedFailed`, `std.derivedId`, `std.derivedEnds` (warning / report).
- Derived elements count toward the hard budgets of FR-060, in their computation order (the RDF budget of 1000 cards, `w3c-rdf.md:123`, is then a budget over the derived `Resource` type).
- Cost: derived expressions are subject to `language.limits.celCost` per evaluation of `from`, and per item for the others.

---

## C. Recursion and cycle enumeration (FR-091)

### C1. Bounded recursion in user functions

**(1) Needed by.** OWL's expression text, "a function over graph structure, not a CEL expression over attributes" (`w3c-owl.md:247`), with depth cap 2 on the canvas and uncapped with a cycle guard in the grid (`w3c-owl.md:155`, `:96`). Also SHACL's one-level inline summary (`w3c-shacl.md:124`).

**(2) Construct.** 3.4 `Function` gains:

| Property | Type | Description |
|----------|------|-------------|
| `recursion` | `{maxDepth: int ≥ 1, atMaxDepth: CelSource}` | The function **MAY** call itself. A call nested deeper than `maxDepth` does not evaluate the body; it returns `atMaxDepth`, evaluated over the same parameters. |

Sentences replacing the last paragraph of 3.4: "A function **MAY** call functions declared before it. A function with `recursion` **MAY** also call itself; indirect recursion remains a specification error. Recursion depth counts nested calls of the same function within one top-level call. The run-time cost limit of 2.5 applies to the whole evaluation; validators **SHOULD** warn when they cannot bound the estimated cost statically." Termination is kept by `maxDepth`; exponential fan-out is kept in check by the existing run-time cost limit.

A cycle guard is a parameter the caller passes (`visited`), so no new construct is needed for it.

**(4) Example (w3c-owl, abbreviated).**

```json
"expressionText": {
  "params": [ { "name": "n", "type": "string" }, { "name": "visited", "type": "list(string)" } ],
  "returns": "string", "uses": ["diagram"],
  "recursion": { "maxDepth": 2, "atMaxDepth": "'…'" },
  "cel": "n in visited ? '…' : cel.bind(ts, diagram.nodesOfType('Triple').filter(t, t.s == n), ts.exists(t, t.p == OWL_SOME) ? '∃ ' + owlShort(ts.filter(t, t.p == OWL_ON_PROPERTY)[0].o) + '.' + expressionText(ts.filter(t, t.p == OWL_SOME)[0].o, visited + [n]) : ts.exists(t, t.p == OWL_UNION) ? '(' + listMembers(ts.filter(t, t.p == OWL_UNION)[0].o).map(m, expressionText(m, visited + [n])).join(' ∪ ') + ')' : owlShort(n))"
}
```

The grid's uncapped rendering is a second function with a larger `maxDepth`. **Recommendation:** express it; the plugin function MAY stay where a runtime needs the speed.

**(5)** Optional; recursion without `recursion` stays an error, as in 0.1. **(6)** None.

### C2. Cycle enumeration as a built-in

**(1) Needed by.** CLD, whose whole check needs the elementary cycles (`causal-loop-diagram.md:65-74`, `:19`; plugin functions `causal-loop-diagram.dis:676-680`); per-cycle findings (FR-022, `causal-loop-diagram.md:91`); SKOS hierarchy cycles (`w3c-skos.md:219`).

**(2) Construct.** 12.4 gains, beside `hasCycle`/`inCycle`:

| Function | Description |
|----------|-------------|
| `diagram.cycles(relType, max) → list(list(Element))` | The elementary cycles over relations of `relType` and its subtypes (E5), at most `max`. Each cycle lists its nodes in the direction of the relations, rotated to start at its member that comes first in persistence order (12.5); a self-loop is a cycle of one. Cycles are ordered by comparing their member lists position by position in persistence order, shorter first on a common prefix. Undirected relation types (`directed: false`) are not supported: a specification error. |
| `diagram.cyclesTruncated(relType, max) → bool` | Whether more than `max` elementary cycles exist. |

"Implementations **MUST** return the same list for the same model; the algorithm is not prescribed (Johnson's is suitable). The cost estimate is proportional to (nodes + relations) × (max + 1)." Keeping it built-in, not recursive CEL, because enumerating cycles in bounded-recursion CEL is exponential and its order would depend on how each engineer wrote it.

**(4) Example (causal-loop-diagram).** `"forEach": "diagram.cycles('CausalLink', 1000).filter(c, …)"` replaces the plugin's `cycles('CausalLink')`; `cycleBoundReached` uses `diagram.cyclesTruncated('CausalLink', 1000)`. The plugin then provides only layout and persistence.

**(5)** Additive. **(6)** None.

---

## D. How CEL calls a plugin function (FR-091)

**(1) Needed by.** Every W3C specification (`w3c-rdf.dis:487-497`, `w3c-owl.dis:796-805`, `w3c-shacl.dis:579`, `w3c-skos.dis:558`), CLD (`causal-loop-diagram.dis:676`). `rdfDisplayName` reads the file's prefixes, state the 0.1 declaration cannot express. Feature spec acceptance scenario 3 of User Story 4 and edge case "A plugin function called from CEL that is not available".

**(2) Construct.** 13.1 `celFunctions` items gain properties, and a new paragraph 13.1.1 "Plugin functions in CEL":

| Property | Type | Description |
|----------|------|-------------|
| `params` | (string or `{name, type, doc}`)[] | 0.1 strings still allowed; the object form names the parameter for `fallback`. |
| `uses` | `("diagram" \| "env")[]` | As for user functions (3.4): the implementation receives a read-only view of the working state and/or `env`. Without it, the result **MUST** depend on the arguments only. |
| `deterministic` | bool, default `true` | `false` forbids calls in the contexts of 12.5. |
| `fallback` | CelSource | Evaluated in place of the call when the plugin is absent, over the named parameters. |

Normative text:

- "A plugin function is called by its bare name, like a user function. Its name **MUST NOT** equal a name in 12.4, a user function, or another declared plugin function; a clash is a specification error."
- "Validators type-check calls against the declaration (14.1 step 8) and charge the declared `cost` per call."
- "A plugin function **MUST NOT** change the model or any state visible to CEL."
- "When the plugin is absent, a call evaluates `fallback` if declared; otherwise the call is an evaluation error handled per the table in 2.5 (so a constraint reports 'could not be evaluated', never passes). The runtime reports one finding `std.pluginMissing` per missing plugin, not per call." 15.2 gains: "A missing plugin function degrades through its `fallback`; without one, semantic uses report findings and visual uses fall back to defaults, never a crash."
- 13.1's `required: true` rule is unchanged: such diagrams are not opened for editing; read-only viewing uses the rules above.

**(3) Schema.** `Plugin.properties.celFunctions.items`: `params.items` becomes `anyOf [string, {name, type, doc}]`; add `uses`, `deterministic`, `fallback`.

**(4) Example (w3c-rdf).**

```json
{ "name": "rdfDisplayName", "params": [ { "name": "iri", "type": "string" } ], "returns": "string",
  "cost": 10, "uses": ["diagram"], "fallback": "rdfLocalName(iri) != '' ? rdfLocalName(iri) : iri",
  "doc": "An IRI as drawn: prefixed name under the file's prefixes, else the local name, else the IRI." }
```

**(5)** All additions optional; string `params` still valid. **(6)** None.

---

## E. The small items (gap 13, FR-100)

### E1. A simulated, animated action outside undo

**(1) Needed by.** Databricks ×3: `databricks-job.md:177-191` ("DISL has no notion of an action that plays over time"), `databricks-bundle.md:123-125`, `databricks-pipeline.md:133-135`; today a transient enum attribute, conditional styles and a non-required plugin (`databricks-job.dis:68-72, 86, 157-161, 328-333, 396-406`).

**(2) Construct.** New section **9.6 Simulations**; an operation (9.3) gains `simulate` as a third body, exclusive with `actions` and `plugin`.

| Property | Type | Req. | Description |
|----------|------|------|-------------|
| `for` | TypeRef[] | ✓ | The element types that take part. |
| `state` | attribute name | ✓ | A `transient` attribute declared on each of those types; the only thing a simulation writes. |
| `initial` | Expression | ✓ | Each element's state at step 0. |
| `next` | Expression | ✓ | Each element's state at the next step. |
| `until` | Expression → bool | ✓ | Evaluated after each step; the run finishes when true. |
| `stepMs` | int | – | Time between steps. Default 700. |
| `maxSteps` | int | – | Hard stop. Default 1000. |
| `notice` | `{running, finished}` Bindable&lt;string&gt; | – | The status notice shown while it runs and after it finishes (the notice construct of FR-051); dismissing it ends the run and clears the states. |

Context `simulation`: `self`, `state` (map element id → state of the previous step), `step` (int), `p` (the operation's parameters, the mock profile), `diagram`, `env`.

Normative text: "A simulation runs outside any transaction. Its writes to `state` **MUST NOT** enter the undo history, mark the document modified, be persisted, fire hooks or be seen by constraints. Every element's `next` is evaluated against the previous step's states (simultaneous update). Any committed transaction, a change of viewpoint or closing the view ends the run and clears the states. Runtimes honouring reduced-motion settings **MAY** run the steps without delay. Headless validators never run simulations." If the view-state work (FR-050) defines per-viewer state, `state` **SHOULD** name such a variable instead of a transient attribute; the rules above are the same.

**(4) Example (databricks-job, run).**

```json
"simulateRun": {
  "label": "Run job (simulated)", "icon": "mdi-play-outline", "for": "diagram",
  "params": { "failTaskId": { "type": "string" }, "conditionOutcome": { "type": "Outcome", "default": "true" } },
  "simulate": {
    "for": ["Task"], "state": "simulated", "stepMs": 700,
    "initial": "'pending'",
    "next": "state[self.id] == 'running' ? (self.key == p.failTaskId ? 'failed' : 'succeeded') : state[self.id] == 'pending' && upstreamSettled(self, state) ? (mayRun(self, state, p) ? 'running' : 'skipped') : state[self.id]",
    "until": "state.all(id, state[id] in ['succeeded', 'failed', 'skipped'])",
    "notice": { "running": "'Simulated: job run'", "finished": "'Simulated: job run — finished'" }
  }
}
```

`upstreamSettled` and `mayRun` are user functions encoding the `run_if` table of `databricks-job.md:183-187` (they treat a predecessor that is `running` in the previous step as settled with its outcome, which gives the "finish, then start" order of one wave). The bundle's ripple (`databricks-bundle.md:125`) is `next: "state[self.id] == 'running' ? 'succeeded' : (ripple(self) == step ? 'running' : state[self.id])"` with `ripple` the element's index in x-then-y order.

**(5)** Additive; `transient` keeps its 0.1 meaning. **(6)** None. Removes the `net.etalii.adp.databricks.simulation` plugin from three definitions.

### E2. A hook `forEach` that sees the claims of earlier iterations

**(1) Needed by.** CLD's `claimClosedLoops` (`causal-loop-diagram.dis:536-564`), which "relies on each iteration seeing the loops created by the previous ones, which DISL does not state" (`causal-loop-diagram.md:100`); `nextLoopIdentifier` reads `diagram` (`causal-loop-diagram.dis:84-89`).

**(2) Construct.** Clarification in 9.4, no new property: "Actions run in order against the transaction's working state. Every expression of an action, including its `when`, sees the effects of every action run before it in the same transaction, including those of earlier iterations of an enclosing `forEach`. The list of a `forEach` is evaluated once, before its first iteration; `let` values are evaluated once, where they appear."

**(4) Example.** The existing CLD hook is valid unchanged and now has one meaning: the second auto-claimed cycle takes `R2` because `nextLoopIdentifier` sees `R1`, and a cycle claimed by an earlier iteration is skipped by the `when`.

**(5)** 0.1 was silent; the only reading consistent with `create … as name` being "available in subsequent actions" (9.4) is this one. Listed as a clarification. **(6)** None.

### E3. The ordering of CEL `sort()` on strings

**(1) Needed by.** SKOS, which assumes ordinal order "as .NET's `StringComparer.Ordinal` is" (`w3c-skos.md:116`; `w3c-skos.dis:30`); CLD's signature, "rotated to start at the ordinally least one" (`causal-loop-diagram.md:74`, `causal-loop-diagram.dis:81`); .NET version lists (`dotnet-dependency-graph.dis:82`).

**(2) Construct.** 12.1 and 12.5 gain: "`<`, `sort()` and `sortBy()` order strings by Unicode code point, comparing code point by code point (CEL's own string ordering). Both sorts **MUST** be stable. Runtimes on UTF-16 platforms **MUST NOT** compare UTF-16 code units directly, which differs for characters beyond U+FFFF." No locale-aware sort is added; a notation that needs one is not in the 23 definitions.

Note for the definitions: .NET `Ordinal` equals code point order except for supplementary characters against U+E000–U+FFFF, which none of the example files contain; the SKOS note should say "code point order".

**(5)** Fixes what 0.1 left to the CEL implementation; CEL's specification already orders strings this way, so conforming runtimes do not change. **(6)** None.

### E4. Enum wire values that are not identifiers

**(1) Needed by.** Databricks job `run-job`, `for-each` (`databricks-job.md:66-72`; `databricks-job.dis:42, 44`). The FDG's `x-fdg.documentType` values (`ui-child`, `owns-action`, `functional-decomposition-graph.dis:170-200`) are the same problem for type names and belong to FBL's mapping, not to enums.

**(2) Construct.** 4.5 EnumValue gains `value`:

| Property | Type | Description |
|----------|------|-------------|
| `value` | string | The stored form of this member. Default: the member's key. |

Sentences: "The key of an enum member is its name in the specification and in CEL; `value` is how it is stored in a DID definition and the default spelling a format binding maps it to. Stored forms **MUST** be unique within an enumeration. A reader maps a stored form back to its key; an unknown stored form is kept for an `extensible` enum and reported otherwise." CEL keeps seeing the key: `self.type == 'run_job'`, `ordinal(self.type, 'TaskType')`. This satisfies acceptance scenario 1 of User Story 10 ("CEL refers to the member by a valid identifier").

**(3) Schema.** `EnumValue.properties.value: {"type": "string", "minLength": 1}`.

**(4) Example.** `"run_job": { "label": "Run job", "value": "run-job" }`, `"for_each": { "label": "For each", "value": "for-each" }`.

**(5)** Absent `value` keeps 0.1's "value ids are what is stored". **(6)** DID 3, `attributes` row: "an enum value is stored in its stored form (DISL 4.5)".

### E5. `acyclic` on an abstract relation type

**(1) Needed by.** FDG: `acyclic: true` on the abstract `Owns` (`functional-decomposition-graph.dis:157-165`), plus a duplicate `ownershipLoop` invariant "to state it unambiguously" (`functional-decomposition-graph.md:72`, `:87`; `.dis:487-493`).

**(2) Construct.** 4.9 `acyclic` row becomes: "Forbids cycles in the graph formed by all relations whose type is this type or one of its subtypes. On an abstract type it therefore covers any mix of its subtypes. A subtype of an acyclic type is acyclic and **MUST NOT** set `acyclic: false`." 12.2 states once, for `nodesOfType`, `relationsOfType`, `incomingOf`, `outgoingOf`, `successors`, `predecessors`, `reachable`, `inCycle`, `hasCycle` and `cycles`: "a type name includes its subtypes." 8.7 `std.acyclic` reads "over the type and its subtypes".

**(4) Example.** The FDG `Owns` declaration as it stands; `ownershipLoop` becomes redundant (it may stay).

**(5)** 4.7 already says a subtype "is accepted wherever a supertype is expected ... in constraint scopes", and `acyclic` generates a constraint (8.7), so the union reading is the 0.1 reading made explicit; the `acyclic: false` prohibition follows 4.7's no-relaxing rule. Listed as a clarification. **(6)** None.

### E6. A fixed attribute that is not persisted

**(1) Needed by.** FDG: "Height is stored only for a Comment ... DISL's `size` can fix the height at 48, but it cannot say 'do not persist this'" (`functional-decomposition-graph.md:39`, `:87`; `.dis:334, 343`). Under FBL the `.fdg` keys `width`/`height` are attributes bound by placement, so the mark belongs on the attribute (feature spec Context: "DISL 0.2 owns the 'not persisted' mark on a fixed attribute").

**(2) Construct.** 4.3 Attribute gains:

| Property | Type | Description |
|----------|------|-------------|
| `fixed` | literal | The attribute always has this value. Implies `readOnly`; never persisted; `has(self.attr)` is false. |

4.7 adds `fixed` to what a subtype may set when narrowing an inherited attribute (a constant is the tightest facet). "A writer (DID or a format binding) **MUST NOT** write a fixed attribute. A reader that finds a stored value ignores it, and reports a warning when it differs from the fixed value." `fixed` and `derived` are mutually exclusive; `fixed` with `default` is a specification error.

`derived: "48"` was considered: it already means "computed, never stored", but 4.7 does not let a subtype turn an inherited stored attribute into a derived one, and a constant is not a computation. A notation-level rule for view sizes (a dimension with `min == max` is never stored in `NodeView`) is a possible companion, but `omitDefaults` (default `true`, 11.7) already omits it in DID, so it is not proposed.

**(3) Schema.** `Attribute.properties.fixed: true` (any JSON value), plus a 14.1 semantic check that it matches `type`.

**(4) Example (functional-decomposition-graph).**

```json
"FdgElement": { "abstract": true, "attributes": { "height": { "type": "number", "min": 1 } } },
"UiElement":  { "extends": "NamedElement", "attributes": { "height": { "type": "number", "fixed": 48 } } },
"Comment":    { "extends": "FdgElement" }
```

**(5)** New optional property. **(6)** DID 3: "fixed attributes are never stored".

---

## F. Consolidated impact

### F.1 Schema `$defs`

| `$def` | Change |
|--------|--------|
| `NodeType` | + `derived` → `DerivedNode` |
| `RelationType` | `derived` → `anyOf [Expression, DerivedRelation]` |
| `DerivedNode` (new) | `from`, `key`, `id`, `attributes`, `parent`, `slot`, `sources`, `reason`, `edits`, `doc` |
| `DerivedRelation` (new) | as `DerivedNode` without `parent`/`slot`, plus `source`, `target`, `owner` |
| `Viewpoint` | + `members` (Expression) |
| `Function` | + `recursion` `{maxDepth, atMaxDepth}` |
| `Plugin` | `celFunctions.items`: `params` items string or object; + `uses`, `deterministic`, `fallback` |
| `Operation` | + `simulate` → `Simulation`; `oneOf` over `actions`/`plugin`/`simulate` stays a 14.1 semantic check (as 0.1 does for `actions`/`plugin`) |
| `Simulation` (new) | `for`, `state`, `initial`, `next`, `until`, `stepMs`, `maxSteps`, `notice` |
| `EnumValue` | + `value` |
| `Attribute` | + `fixed` |
| root | `$id` → `…/disl/schema/0.2/disl.schema.json` (FR-001) |

Prose-only (no schema): `forEach` visibility (9.4), string ordering (12.1/12.5), `acyclic` over subtypes (4.9/8.7/12.2), `ancestors()` order (12.2), new contexts `derive`, `deriveItem`, `simulation` (12.3), new functions `cycles`, `cyclesTruncated`, `drawn()`, members `derived`, `sources`, relation `owner` (12.2/12.4), new built-in findings `std.derivedFailed`, `std.derivedId`, `std.derivedEnds`, `std.pluginMissing` (8.7).

### F.2 DID 0.2

1. Records of derived types are never written; a reader treats one as unknown content (8.2).
2. View `nodes`/`edges` keys may name derived elements with stable ids; unresolved view keys are kept and ignored, not errors (8.1 step 3).
3. Loading computes derived elements after validation and before resolving view data (8.1).
4. Suppressions may name derived elements with stable ids.
5. Enum values are stored in their stored form (`value`).
6. Fixed attributes are never stored; a stored one is ignored with a warning.

### F.3 "Changes from 0.1" entries (clarifications, no 0.1 document changes meaning)

- Extra keys and default ids in 0.1 derived-relation result maps (B2).
- `ancestors()` order; relation `owner` default (B3, B4).
- `forEach` sees earlier iterations (E2).
- String order is code point order; sorts are stable (E3).
- `acyclic` and the `*OfType` family include subtypes (E5).

### F.4 x-adp keys and plugins this replaces (FR-004)

- `celFunctions` `cycles`, `cycleSearchTruncated` of `net.etalii.adp.systems.cld` → built-ins (C2).
- `net.etalii.adp.databricks.simulation` (three definitions) → `simulate` (E1).
- The projection half of `net.etalii.adp.w3c.turtle`, `…sparqlQuery` (plus their readers moving to FBL) → derived types (B1–B5).
- The C4 plugin's membership and lifting → `members` and a derived relation (B7, B8).
- FDG's redundant `ownershipLoop` invariant → optional (E5).

Remaining plugins in this theme: layouts (gap 5, later feature); `rdfDisplayName`/`rdfCompress`/`rdfMintIri` family stay plugin functions (they depend on the Turtle writer's rules), now declared with `uses` and `fallback`.

### F.5 Open points for the plan

- Cost of CEL grouping over large triple stores: the `key` design lets runtimes index, but the RDF example's `from` still touches every triple per recomputation; incremental recomputation is permitted (B9) and probably needed for files beyond the 1000-card budget (`w3c-rdf.md:123`), such as the Wikidata example with hundreds of rows per card (`w3c-rdf.md:136`).
- `e.drawn()` depends on the viewpoint; the headless validator rule (B7) should be checked against the whole-model C4 rules of the findings work (FR-023, `c4-container.md:100`).
- Whether `edits` should also accept a shorthand "write through to the single source's attribute of the same name" for 1:1 derived edges (C4 description editing); left out to keep one mechanism.
