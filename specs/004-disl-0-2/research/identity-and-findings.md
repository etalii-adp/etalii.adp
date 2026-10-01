# Research: identity (gap 4) and findings (gap 6) for DISL 0.2

Input for the plan of feature 004 (`specs/004-disl-0-2/disl-0-2.spec.md`, FR-010 to FR-012 and FR-020 to FR-026). Read against DISL 0.1 (`specifications/disl/DISL-specification.md`, sections 8, 11.5, 12) and DID 0.1 (`specifications/did/`), and the 23 definitions in `definitions/diagrams/`. Line numbers are those of the files on `features/004-disl-0-2` at commit 8036c5f.

## Summary of decisions

1. **One new id strategy, `derived`, plus a per-type map `ids.types`**, covers paths, natural keys with a shape, IRIs, triple plus repeat counter, term forms, scope paths, relation formula ids and fixed singleton ids. They differ only in the CEL expression, so they are examples, not seven strategies. The expression runs in a new `identity` CEL context.
2. **ShortGuid is `uuid-v4` plus an `encoding` property** (`hex`, `base64url`, `base36`). The definitions disagree on what a ShortGuid is (22 base64url characters in dependency graph and gartner, 25 base-36 characters in timeline and FDG), so a single `shortguid` value would be wrong for half of them.
3. **Unstable ids are called `ephemeral`**, not `stable: false`. DISL 0.1's `stable` already means something else (the id is kept once assigned even if its key changes). `ephemeral` is a bool or a CEL condition, per type, with an optional refusal `reason`.
4. **Tolerant loading** is `ids.missing` (`assign` or `ephemeral`) plus two built-ins, `std.missingId` and `std.duplicateId`. The first element in reading order keeps a duplicated id; the second and later are treated as ephemeral. DID keeps `id` required for writers and gains a tolerant reader.
5. **The finding shape is defined once, in DISL 8.6**: `SourceLocation {file, line?, column?, length?}` (1-based lines and columns, columns and lengths in Unicode code points) and an optional `subject` string. FBL references it. The constraint object gains `location` and `subject` expressions, and elements gain `self.location()`.
6. **One finding per item** is a constraint property `forEach` (a list expression; `item` and `index` bound; `rule` optional, defaulting to "every item is a finding"). With `self.positionIn(list)` and two graph functions (`diagram.cycles`, `diagram.knots`), it covers per-cycle findings in loop order and second-and-later duplicates without further constructs.
7. **Parse failure** is the built-in `std.unparseable`, which a reader raises. It replaces every other finding located in that file, and when that file is the model's only or primary file no constraint runs at all.
8. **Ordering needs no new property**: DISL 0.2 makes the order normative (reader findings, then built-ins, then declared rules in array order, then elements in model order, then items in `forEach` order). CLD's "bound reached" rule moves above the unlabelled-loop rule.
9. **Whole model versus view** is `over: "model"` (the default, which is the 0.1 meaning) or `"view"`, with a `view` variable and `diagram.views`. File-system facts are two functions, `fs.exists` and `fs.isDirectory`. Each returns an optional, so a rule stays silent when the fact is unknown.
10. **Built-ins**: `std.unparseable`, `std.unreadableEntry`, `std.missingId`, `std.duplicateId`, `std.mixedPrecision` and `std.ephemeralViewData`. The `builtIn` settings gain `code` and `message`, and every constraint gains `code`, which replaces the 15 `x-adp-ruleId` keys and the rule ids now kept in `label` (Azure) or `tags` (C4, gartner).
11. **Rename "problems" to "findings"** (section 8.6, the prose, and terminology.md). Keep the form item kind `problems` as a deprecated alias of `findings`, and keep the headless validator's 0.1 keys. Hosts keep their platform "Problems" panel names.

---

## Part A — Identity (gap 4)

### A.0 The shared construct: `ids` as a default plus per-type rules

Most identity items need the same thing: the id of an element of a given type is a function of the model. DISL 0.1's 11.5 has one id setting for the whole specification and generates ids only when an element is created (`cel` runs in the `create` context, which has no `self`). The smallest extension that covers all items:

- `persistence.ids` stays as it is: the default for every type.
- New `persistence.ids.types`: a map from TypeRef to an **IdRule** that overrides the default for that type and its subtypes. The nearest rule in the C3 linearisation wins.
- New strategy value `derived`: the id is the value of `expression`, evaluated in a new CEL context `identity`, and recomputed whenever the model is read and at the end of every transaction.

**Section:** DISL 11.5, split into 11.5.1 Generation (0.1 text), 11.5.2 Per-type rules and derived ids, 11.5.3 Ephemeral ids, 11.5.4 Missing and duplicate ids. Plus a new row in 12.3 and one function in 12.4. This is the only change to section 11, as the FBL boundary requires (spec Context, bullet 4).

**Properties** (the IdRule object; `types`, `missing` and `compare` are allowed only at the top level):

| Property | Type | Default | Meaning |
|---|---|---|---|
| `strategy` | 0.1 enum + `"derived"` | `"uuid-v7"` (0.1) | `derived` added. |
| `encoding` | `"hex"`, `"base64url"`, `"base36"` | `"hex"` | Text form of `uuid-v4` / `uuid-v7` ids (A.1). |
| `prefix` | string (map at top level, as in 0.1) | none | Not applied to `derived` or `cel` results. |
| `expression` | Expression | — | Required for `cel` (0.1, `create` context) and for `derived` (`identity` context). |
| `stable` | bool | `true`; **`false` for `derived`** | 0.1 meaning unchanged. |
| `ephemeral` | bool or Expression → bool | `false` | A.9. |
| `reason` | LocalizedText or `{cel}` | runtime text | Refusal sentence for gestures refused because an id is ephemeral (A.9). |
| `pattern` | regex | 0.1 default | Unchanged. |
| `suffix` | string with `{n}` | `"-{n}"` | How `cel` and `natural` make a new id unique (0.1 says `-2`, `-3`, which is `"-{n}"`). |
| `types` | map TypeRef → IdRule | — | Top level only. |
| `missing` | `"assign"`, `"ephemeral"` | `"assign"` | A.10. Top level only. |
| `compare` | `"exact"`, `"ignore-case"` | `"exact"` | A.13. Top level only. |

**`identity` context** (12.3): variables `self` and `diagram`, and no `env`, so that an id cannot depend on locale, user or time. `self.id` is not available. The ids that are available are those of `self`'s ancestors and, for a relation, of its source and target, including their ancestors.

**New function** (12.4, all contexts): `e.positionIn(l) → int`, the zero-based position of element `e` in list `l`, where elements are compared by identity in reading order and never by id, or −1. Because it does not rely on ids, it works while ids are being computed and when ids are duplicated. It is reused in B.5. (Not named `ordinal`, because five definitions already have an attribute of that name, for example w3c-rdf.dis:155.)

**Normative text:**

- "A rule in `ids.types` **MUST** apply to the named type and to every subtype that has no rule of its own; where two inherited rules apply, the one nearest in the type's linearisation (4.7) wins."
- "For the `derived` strategy, the id of an element **MUST** be the value of `expression`, evaluated in the `identity` context. It **MUST** be recomputed after the model is read and at the end of every transaction, before invariants are checked (14.4)."
- "A runtime **MUST** compute ids in this order: nodes with their ancestors first, then relations. An `identity` expression **MUST NOT** read the id of an element other than an ancestor of `self` or, for a relation, its ends and their ancestors. A runtime **MUST** report an expression that does so, or that fails, as `std.missingId` on `self`."
- "A derived id **MUST NOT** be altered to make it unique; two elements with the same derived id are reported by `std.duplicateId` (B.9)."
- "When a derived id changes in a transaction and the element is stored by id, the runtime **MUST** rewrite every stored reference to it (parent, relation ends, reference attributes, view keys) in the same transaction." This is what 0.1 already implies for `natural` with `stable: false`.
- "A validator **MUST** reject a specification whose persistence format stores elements by id (any format other than one bound through FBL) and which declares a stored type's ids `ephemeral`."

**Schema:** extract the inline `Persistence.properties.ids` into `$defs/IdStrategy`, which adds `types`, `missing` and `compare` to `$defs/IdRule`. Add `$defs/IdRule` with the properties above, a `derived` value in the strategy enum, and `if strategy ∈ {cel, derived} then required: [expression]`. `Persistence.ids` becomes `{"$ref": "#/$defs/IdStrategy"}`.

**0.1 compatibility:** every 0.1 value and default is kept. `derived`, `types`, `encoding`, `ephemeral`, `missing`, `compare` and `suffix` are new. The different default of `stable` applies only to the new strategy. `prefix` on `cel` was unspecified in 0.1; saying it does not apply is a clarification, listed in "Changes from 0.1".

**DID:** section 4 must say how derived ids are handled on load. When a stored id differs from its recomputed value, the element takes the computed id and every reference follows; the change is written on the next save and is not an undo step. See Part C.

---

### A.1 ShortGuid

**Needed by:**
- dependency-graph.dis:365-369 (`uuid-v4`, doc: 22 URL-safe base64 characters); dependency-graph.md:95.
- gartner-hype-cycle-graph.dis:1021-1024 (`uuid-v4`, 22 base64url characters); gartner-hype-cycle-graph.md:58.
- timeline.dis:550-553 (`nanoid`, doc: 25-character lowercase base-36); timeline.md:64.
- functional-decomposition-graph.dis:547-548 (`uuid-v4`, "random GUIDs written in base 36"); functional-decomposition-graph.md:46.
- mindmap.dis:447 (`uuid-v4`, prefix `ID_`); mindmap.md:78-80 (the encoding is not stated).
- wardley-map.md:84 (ShortGuid in base 36, but kept in a sidecar, so FBL's; see A.11).

**Construct:** `encoding` on the generation strategies `uuid-v4` and `uuid-v7`.
- `hex`: 0.1 behaviour, the RFC 9562 hyphenated lowercase form.
- `base64url`: the 16 bytes in RFC 9562 byte order, encoded with base64url (RFC 4648 §5) without padding, 22 characters.
- `base36`: the 128-bit value as an unsigned integer in lowercase base 36, left-padded with `0` to 25 characters.

**Normative:** "Ids **MUST** be treated as opaque strings: a runtime **MUST NOT** decode an id to recover a UUID, so implementations whose byte order differs produce interchangeable ids." And: "Hand-written ids that match `pattern` **MUST** be accepted whatever the strategy; the strategy governs only ids the runtime generates." Every definition above relies on the second sentence.

**Schema:** the `encoding` enum on `$defs/IdRule`. Both encodings fit the default `pattern` (base64url uses `-` and `_`).

**Example (dependency-graph):**
```json
"ids": { "strategy": "uuid-v4", "encoding": "base64url", "stable": true, "missing": "ephemeral" }
```
Timeline: `{ "strategy": "uuid-v4", "encoding": "base36" }`, replacing the `nanoid` approximation.

**0.1:** the default `hex` is the 0.1 form. **DID:** none.

### A.2 Ids built from paths

**Needed by:**
- dotnet-dependency-graph.md:71 and :104-106 (`project:<path relative to the solution>`, forward-slashed); dotnet-dependency-graph.dis:367.
- ansible-structure.md:108-121 (`playbook:<path>`, `taskfile:<path>`, `inventory:<path>`, `vars:<path>`, and `play:<playbook path>#<index>`); ansible-structure.dis:688-701.
- helm-chart.md:48-60 (`values:<path>`, `tpl:<path>`, …); helm-chart.dis:692-697.
- databricks-pipeline.md:89-99 (`library:<path>`).
- azure-devops-pipeline.md:138 (structural paths `stage/job`, `job/index`); azure-devops-pipeline.dis:895-899.

**Construct:** `derived` (A.0). The path itself is an attribute the reader fills in, and normalising it (forward slashes, relative to the subject's root) is the reader's job, which belongs to FBL. DISL only composes the id.

**Example (ansible-structure, `Play`, whose id is positional within its playbook):**
```json
"types": {
  "Playbook": { "strategy": "derived", "expression": "'playbook:' + self.path" },
  "Play": { "strategy": "derived", "expression": "'play:' + self.playbook + '#' + string(self.indexInPlaybook)" }
}
```

**Normative:** none beyond A.0. One informative sentence: a rename or move that changes the path changes the id, so a stored position keyed by the old id no longer applies. helm-chart.dis:696 and databricks-job.md:130 call this intentional.

**0.1 / DID:** none.

### A.3 Natural keys

**Needed by:**
- causal-loop-diagram.dis:662 (`natural`, key `Variable.name`); causal-loop-diagram.md:13.
- databricks-job.dis:368-372 and databricks-job.md:122-130 (`task:<task_key>`, `cluster:<job_cluster_key>`).
- databricks-bundle.dis:335-339.
- sparql-query.md:72 (`var:{name}`).
- c4-container.dis:2254-2259 and c4-container.md:55, :61: ids are the DSL identifiers. A new identifier is the name's letters and digits with the first letter lowered, numbered `web`, `web2`, `web3` against clashes, and the ids pattern `^[A-Za-z_][A-Za-z0-9_]*$` forbids the 0.1 suffix `-2`.

**Construct:** keep `natural`, and state what 0.1 left open: "A `natural` id **MUST** be the type's `prefix` followed by the string forms of its `key` attributes, in declaration order after inheritance is flattened, joined by `|`." The `|` separator is also what the relation formulas use (A.7), and an IRI cannot carry it unencoded (w3c-rdf.md:109). For the C4 numbering, add `suffix`: "When a generated id is already in use, the runtime **MUST** append `suffix` with `{n}` replaced by the smallest integer n ≥ 2 that makes it unique."

**Example (C4, new element ids):**
```json
"ids": { "strategy": "natural", "stable": true, "pattern": "^[A-Za-z_][A-Za-z0-9_]*$", "suffix": "{n}", "compare": "ignore-case" }
```

**0.1:** 0.1 did not define how a natural id is composed, and none of the 23 definitions has more than one key attribute. Pinning the composition is listed in "Changes from 0.1". **DID:** none.

### A.4 IRIs

**Needed by:**
- w3c-rdf.md:90 (`res:{full IRI}`); w3c-rdf.dis:476.
- w3c-owl.dis:785 (`res:`, `ind:`, `thing:`).
- w3c-skos.md:88; w3c-skos.dis:547.
- w3c-shacl.md:142; w3c-shacl.dis:568.
- sparql-query.md:75 (`iri:`).

**Construct:** `derived`. **Example (w3c-rdf):**
```json
"Resource": { "strategy": "derived", "expression": "'res:' + self.iri" }
```

**Normative:** none new. The `pattern` must allow IRIs, which the definitions already do with `res:.+`. Informative: the default length limit of 128 is too short for many IRIs, so the specification should widen `pattern`.

**0.1 / DID:** none.

### A.5 Triples with a repeat counter

**Needed by:**
- w3c-rdf.md:109 (`edge:{from}|{predicate}|{to}`, with `|{n}` for the second and later repeats).
- w3c-owl.md:76 and :92 (the same for edges, and `expr:{owner}|{predicate}|{ordinal}`).
- w3c-skos.md:88.
- sparql-query.md:75 (`edge:{from}|{predicate as written}|{to}|{ordinal}`, where the ordinal counts repeats).

**Construct:** `derived` with `positionIn` (A.0). **Example (w3c-rdf, `Statement`):**
```json
"Statement": { "strategy": "derived",
  "expression": "cel.bind(n, self.positionIn(diagram.relationsOfType('Statement').filter(r, r.source.id == self.source.id && r.predicateIri == self.predicateIri && r.target.id == self.target.id)), 'edge:' + self.source.id + '|' + self.predicateIri + '|' + self.target.id + (n > 0 ? '|' + string(n) : ''))" }
```

**Normative:** A.0's reading-order definition of `positionIn`, plus: "Reading order **MUST** be the order in which the reader produced the elements (for a DID definition, record order; for a model read through FBL, the order FBL defines)."

**0.1 / DID:** none.

### A.6 Term forms and scope paths

**Needed by:** sparql-query.md:72-76 (`var:`, `anon:{n}`, `lit:`, `sub:{scope path}.{ordinal}`, `region:{scope path}` with paths such as `where/union.0/branch.1`, `note:{path}/{kind}.{ordinal}`), sparql-query.md:206 and sparql-query.dis:554-569.

**Construct:** `derived`. A scope path needs no recursion, because a scope's id may read its parent's id (A.0). **Example (sparql-query, `Scope`):**
```json
"Scope": { "strategy": "derived",
  "expression": "self.parent.isA('Scope') ? self.parent.id + '/' + scopeKind(self) + '.' + string(self.positionIn(self.parent.children.filter(c, scopeKind(c) == scopeKind(self)))) : 'region:' + scopeKind(self)" }
```
`scopeKind` is a user function of the specification, mapping `UnionBranch` to `branch` and so on.

**0.1 / DID:** none.

### A.7 Formula ids for relations

**Needed by:**
- ansible-structure.md:116-121 (`edge:<source id>|<Kind>|<target as written>`, with a fourth part for `Targets`).
- helm-chart.md:60 (`edge:<source>|<Kind>|<target>|<label>`, with an empty target for an open end).
- dotnet-dependency-graph.md:108 (`depends:<source id>-><target id>`; "Relations have no key attribute in the `.dis`, so DISL's `natural` strategy says nothing about them").
- databricks-job.md:127 (`edge:<from>-><to>`).
- databricks-pipeline.md:97-98 (`flow:<path>->pipeline`).
- azure-devops-pipeline.md:48 and :138 (`edge:{from or ?name}->{to}`).
- The W3C edges of A.5.

**Construct:** `derived`; `self.source.id` and `self.target.id` are readable (A.0). **Example (dotnet-dependency-graph):**
```json
"ProjectReference": { "strategy": "derived", "expression": "'depends:' + self.source.id + '->' + self.target.id" }
```
A relation without a target (Helm's open end, Ansible's unresolved target) depends on the "relation with no target" item of gap 11 (notation theme). There `self.target` is `null` and the formula uses `self.targetAsWritten`.

**0.1 / DID:** none.

### A.8 Fixed singleton ids

**Needed by:**
- helm-chart.md:52-53 (`chart` and `crds`, fixed; "the natural key would give `Chart.yaml`").
- databricks-pipeline.md:89-99 (`pipeline`, `target`, `compute`, `notifications`).
- sparql-query.md:75 (`header:query`, `truncation`).
- w3c-rdf.dis:476 (`truncation`).

**Construct:** `derived` with a constant expression. No shorthand, for simplicity; a constant is one short CEL literal. **Example (helm-chart):**
```json
"Chart": { "strategy": "derived", "expression": "'chart'" }
```

**Normative:** none new. A second instance is caught by `std.duplicateId`, and the type's `multiplicity` or `perType` (8.7 `std.multiplicity`) says there is one.

**0.1 / DID:** none.

### A.9 Ephemeral (unstable) ids: never stored, positioned or related

**Needed by:**
- w3c-rdf.md:77 (`blank:{ordinal}`, "ordinals restart with every parse"), :192-198 (the refusal sentences), :312 ("the `.dis` spells it out as a row of gesture constraints with `rule: "false"`").
- w3c-owl.md:92-94 and :246 (`expr:` "deterministic within this parse, deliberately unstable across edits").
- w3c-skos.md:80 and :88.
- w3c-shacl.md:142 and :225 (one type, `Shape`, whose id is `res:` or `blank:`).
- sparql-query.md:74, :117 and :206 (`anon:{n}`).
- c4-*.md:54 (relationship id `source->destination@line`) and :55 (unnamed elements `<kind>_<name>_<n>`, "not stable across edits above them"), for example c4-container.md:54-55.
- azure-devops-pipeline.md:138 ("Ids are paths, not stored"; `view.store` is empty there anyway).

**Construct:** `ephemeral` on an IdRule, a bool or a CEL condition (for SHACL's one type with two id shapes), plus `reason`.

**Normative:**
- "An element is **ephemeral** when the IdRule that applies to its type has `ephemeral` true or evaluating to true. Its id identifies it within one reading of the model only."
- "A runtime **MUST NOT** store, for an ephemeral element, view data (DID section 5, or a registration's layout, which is FBL's), a style override, a suppression, or a reference by its id (a parent, a relation end, or a reference attribute)."
- "A gesture whose only effect would be one of those writes (moving, resizing or pinning an ephemeral node, connecting to it where the relation would be stored by id, suppressing one of its findings) **MUST** be refused before it is applied, with the rule's `reason` or, without one, a runtime sentence saying that the element's identity does not survive re-reading." This replaces the `rule: "false"` gesture rows (w3c-rdf.md:312).
- "An ephemeral element **MAY** be selected, shown in forms, and targeted by findings and operations within the session."
- "Stored view data keyed by an id that the current reading makes ephemeral **MUST** be ignored, **MUST** be reported by `std.ephemeralViewData`, and **MUST** be dropped when the view data is next written." This covers the spec's edge case of a file written before 0.2.
- Whether a relation read from the model that ends at an ephemeral node is written back (for example a Turtle triple with a blank object) is not a reference by id: FBL writes it in the model's own syntax. DISL forbids only id-keyed storage.

**Examples:**
```json
"types": {
  "BlankNode": { "strategy": "derived", "expression": "'blank:' + string(self.ordinal)", "ephemeral": true,
                 "reason": "That is a blank node, whose identity does not survive a reparse, so a stored position could not be trusted. Name it with an IRI to arrange it." }
}
```
(w3c-rdf, where `ordinal` is the `BlankNode` attribute of w3c-rdf.dis:155.) For SHACL, `"Shape": { "strategy": "derived", "expression": "self.blank ? 'blank:' + … : 'res:' + self.iri", "ephemeral": { "cel": "self.blank" } }`. For C4, `"Relationship": { "strategy": "derived", "expression": "self.source.id + '->' + self.target.id + '@' + string(self.location().orValue({'line': 0}).line)", "ephemeral": true }`, where `location()` is B.1.

**Schema:** `ephemeral: bool | CelValue` and `reason: LocalizedText | CelValue` on `$defs/IdRule`.

**0.1:** new, with default `false`. The existing `stable: false` in the W3C, Ansible, Helm and Azure definitions keeps its 0.1 meaning (the id follows its key), which is correct for `res:` and path ids and wrong only for the blank-node shapes. Those move to `ephemeral` in the migration follow-up.

**DID:** section 5 and suppressions: ephemeral ids never appear as view keys or in suppressions. On load, a stored one is ignored and reported (Part C).

### A.10 Tolerant loading: missing and duplicate ids

**Needed by:**
- dependency-graph.md:96 ("tolerated on load and reported … the first declaration with it wins") and :108-109 (`missing-id` at the declaration's first line; `duplicate-id` on "the second and later declarations"; "Nodes and relations share one id space").
- mindmap.md:78 (a node without an id gets `ID_` plus a ShortGuid in memory, "written on the next save - never on open, and never by the read-only validator") and :217 (`mindmap.duplicate-id`, error, naming both nodes).
- timeline.md:154-155.
- gartner-hype-cycle-graph.md:58 and :189 (unique across all four lists).
- functional-decomposition-graph.md:70-71 (`fdg.duplicate-id`).
- Generally: spec FR-012 and acceptance scenario US1-4.

**Construct:** top-level `missing` (A.0), and the built-ins `std.missingId` and `std.duplicateId` (B.9).

**Normative:**
- "Nodes, relations and views of one diagram **MUST** share one id space. Ports are in the id space of their element when the definition writes port ids as `element#port`."
- "A runtime **MUST** open a model in which ids are missing or duplicated, and **MUST** report each case through `std.missingId` or `std.duplicateId`."
- "Of the elements that share an id, the first in reading order (A.5) **MUST** keep it: every lookup and reference resolves to it. The second and later **MUST** be drawn and **MUST** be treated as ephemeral (A.9) until the duplication is resolved."
- "With `missing: "assign"`, an element without a usable id (absent, empty, or not matching `pattern`) **MUST** receive a new id from the applicable strategy. The new id **MUST NOT** be written when the model is opened or validated, and **MUST** be written with the next save that writes the model. With `missing: "ephemeral"`, the element **MUST** be drawn and treated as ephemeral."
- "A runtime **MUST NOT** change an id in order to resolve a duplicate, except through a user action such as the quick fix of `std.duplicateId`."
- With `compare: "ignore-case"`, duplicates are detected case-insensitively (A.13).

**Examples:** dependency graph `"missing": "ephemeral"` (dependency-graph.md:108: "nothing can select, connect or edit it"); mindmap `"missing": "assign"`. **Schema:** `missing` enum on `$defs/IdStrategy`.

**0.1:** 0.1 DID definitions always have unique, present ids, so nothing changes for a valid 0.1 definition. A 0.1 runtime refused an invalid one; a 0.2 runtime opens it and reports. **DID:** section 4 and section 8.1 step 3 change (Part C).

### A.11 Ids held outside the document (sidecar) — left to FBL

**Needed by:** wardley-map.md:84-87 and :219; wardley-map.dis:804. **Recommendation:** FBL owns it, as agreed (spec Context, bullet 5). The ids FBL keeps in the sidecar are generated with DISL's strategy (`uuid-v4` with `encoding: "base36"`), and reconciliation against natural keys is FBL's. DISL needs nothing further.

### A.12 Ids generated once per gesture (redo reuses them)

**Needed by:** dependency-graph.md:149 ("Redo reuses the ids the first execution generated … A redo that would duplicate an id is refused"); timeline.md:64.

**Construct:** normative text only, in 11.5.1 and 14.4: "An id generated for a new element **MUST** be generated once, when the transaction is first applied. Redoing the transaction **MUST** re-create the element with the same id. A redo that would create a duplicate id **MUST** be refused." **Schema / DID:** none. **0.1:** it states what 0.1 implied by transactions (14.4) without saying so.

### A.13 Case-insensitive ids

**Needed by:** c4-container.md:55 ("Case-insensitive throughout"), the same in the five other C4 notes, and c4-container.md:84 (sidecar keys case-insensitive); dotnet-dependency-graph.md:108 ("Package ids are grouped case-insensitively; the element takes the spelling of the first reference read"), and its casing bug in the gaps summary.

**Construct:** top-level `compare: "ignore-case"`. **Normative:** "With `compare: "ignore-case"`, ids **MUST** be compared using Unicode default case folding for lookups, references, duplicate detection and view keys, and the spelling of the first occurrence in reading order **MUST** be kept." **0.1:** the default `exact` is 0.1. **DID:** section 4 notes that view keys follow `compare`.

---

## Part B — Findings (gap 6)

### B.0 Naming: rename "problems" to "findings"

DISL 0.1 uses "problem" 29 times, most importantly in 8.6 "Problems", the form item kind `problems` (disl.schema.json:7305) and DID's "suppressions of constraint problems".

**Recommendation: rename the concept to *finding*.**
- Many results are not problems: `info` and `hint` severities are used for "this ontology imports X, which is not fetched" (w3c-owl.md:181), an unlabelled loop (causal-loop-diagram.md:91), an unused prefix (sparql-query.md:159) and a legacy chart (helm-chart.md:120).
- FBL has already agreed to report "DISL findings" (spec Context, bullet 2), and the 0.2 spec's FR-020 to FR-026 use the word.
- The notes use it throughout (dependency-graph.md:103, causal-loop-diagram.md:91, databricks-job.md:197, helm-chart.md:121, sparql-query.md:161, w3c-owl.md:168).

**Compatibility:**
- Section 8.6 becomes "Findings".
- The form item kind `findings` is added, and `problems` stays valid as a deprecated alias in section 18.
- The headless validator keeps its 0.1 keys (B.10).
- `blockSaveOn`, `suppressible` and `constraints.builtIn` are unchanged.
- Hosts keep the name of their platform's "Problems" panel, which terminology.md's Exceptions already allow for platform APIs.
- In terminology.md, add **Finding** under Related terms: "a result of validation or of reading: a rule, a severity, a message and where it applies; DISL 0.1 called it a problem". Do not add "problem" to Retired uses: it is ordinary English, and the terminology check would flag every occurrence.

### B.1 Source location and undrawn subject

**Needed by:**
- ansible-structure.md:216-224 ("A problem points at a file and line, not at an element"; locations rebased to project-relative).
- azure-devops-pipeline.md:97 and :132 (file-level findings; a finding at `template:{id}`; unparseable at a line); azure-devops-pipeline.dis:147-148 (`firstLine`, `lastLine`).
- c4-container.md:103 (relationships and views located by line).
- databricks-bundle.md:129-133, databricks-job.md:197 and databricks-pipeline.md:139 (every finding at a YAML line).
- dependency-graph.md:105-110 (a "Located at" column).
- gartner-hype-cycle-graph.md:178; helm-chart.md:121 (file and line; a finding at a file without a line; a finding on the folder); timeline.md:153.
- sparql-query.md:155-162, w3c-rdf.md:245-254, w3c-owl.md:168-185, w3c-shacl.md:281 and w3c-skos.md:217-230 (1-based lines of triples; findings about triples and IRIs that are not elements, such as `skos.nonconcept-target`).
- wardley-map.md:198.
- sparql-query.dis:58 (a `line` field kept so a finding can point at it); ansible-structure.dis:79 and :154.

**Construct:** the shape agreed with FBL, defined once in DISL 8.6.

```
SourceLocation = { file: string, line?: int ≥ 1, column?: int ≥ 1, length?: int ≥ 0 }
Finding = { rule, code?, severity, message, elements?: [id], attribute?, location?: SourceLocation, subject?: string, view?: id, pointer?: JSON Pointer, fixes? }
```

- `file`: a relative path with `/` separators, relative to the diagram's subject (the model file's folder, or the folder that is the subject). It may name a file other than the model file (an included file, a sibling in a folder subject, a lock file). A host **MAY** rebase it for display (ansible-structure.md:224, helm-chart.md:121). Whether it is relative to the subject or to the registration must be settled with FBL; this proposal takes the subject.
- `line` and `column` are 1-based. `column` and `length` are counted in Unicode code points, not UTF-16 units or bytes. `column` requires `line`, and `length` requires `column`. Without `line`, the finding is about the whole file (helm-chart.md:121: "at the lock file without a line").
- `subject`: a display string naming something not drawn (a triple, a key path such as `resources.jobs.x`, a prefix). It is not an id, and runtimes **MUST NOT** resolve it as one.

**Constraint object (8.2) gains:**

| Property | Type | Default | Meaning |
|---|---|---|---|
| `location` | Expression → SourceLocation map, or `null` | the target element's `location()` | Where the finding is, when that is not the element or is more precise. |
| `subject` | Expression → string | none | The undrawn thing the finding is about. |
| `code` | QualifiedId (hyphens allowed) | none | The id reported to users and tools, for example `databricks.duplicate-task-key`. Replaces `x-adp-ruleId`, and rule ids kept in `label` (azure-devops-pipeline.dis:688) or `tags` (c4-container.dis:1965, gartner-hype-cycle-graph.md:195). |

**New CEL members** (12.2): `e.location() → optional(map)`, the source location the reader recorded for element `e` (the start of its declaration), and `e.location(attr) → optional(map)` for one attribute's value. Both are `optional.none()` for elements the reader recorded nothing for, including every element of a DID-stored diagram. **Filling them is FBL's job**, and DISL only defines the accessor.

**Normative:**
- "Every finding **MUST** carry the id of the rule that raised it and a severity and message. It **MAY** carry element ids, an attribute, a source location, a subject, or several of these. A finding with none of them applies to the diagram as a whole."
- "When a finding targets an element and the constraint declares no `location`, the runtime **MUST** use the element's `location()` when it has one."
- "Runtimes **MUST** present a finding with a location so that the user can go to that place in the file, and a finding with a subject with the subject shown. They **MUST NOT** fail to present a finding because it has no element."
- "`line` and `column` **MUST** be 1-based; `column` and `length` **MUST** count Unicode code points."

**Schema:** new `$defs/SourceLocation` and `$defs/Finding`, which are also used by B.10. `Constraint` gains `location` (Expression), `subject` (Expression) and `code` (QualifiedId).

**Example (databricks-job `duplicate_task_key`, databricks-job.dis:283-286, with B.5 and `code`):**
```json
{ "id": "duplicateTaskKey", "code": "databricks.duplicate-task-key", "scope": "Task",
  "rule": "self.positionIn(diagram.nodesOfType('Task').filter(t, t.key == self.key)) == 0",
  "message": { "cel": "'The task key \\'' + self.key + '\\' is used more than once. Every task needs its own.'" } }
```
The location comes from `self.location()`, which the reader records.

**0.1:** all additions are optional. `x-adp-ruleId` stays valid, because `x-` properties are always allowed, and is superseded by `code`. **DID:** suppressions (B.3 and Part C).

### B.2 A parse failure replaces all other findings

**Needed by:**
- dependency-graph.md:103 and :107 ("reported as a single problem at the parser's line instead of running the rules over an empty model").
- sparql-query.md:157 and :161; w3c-rdf.md:247 and :253; w3c-owl.md:168; w3c-shacl.md:282; w3c-skos.md:215; timeline.md:149 and :153; mindmap.md:216 (`not-a-map`, "judges the file before there is a model").
- azure-devops-pipeline.md:132.
- Per file within a folder subject: ansible-structure.md:221 and :225 and ansible-structure.dis:610-618 (`unreadableYaml`); helm-chart.md:122-123 ("No problem is raised about Chart.yaml's content when it is unreadable") and helm-chart.dis:569-582.

**Construct:** built-in `std.unparseable` (B.9). The reader, whether FBL or DID's loader, raises it; DISL defines what it does.

**Normative:**
- "A reader that cannot parse a file of the model **MUST** report exactly one `std.unparseable` finding for that file, located at the parser's line (and column) when it has one."
- "A runtime **MUST NOT** report any other finding whose location names a file for which `std.unparseable` was reported."
- "When that file is the model's only file, or the file the specification binds as primary (FBL), the runtime **MUST NOT** evaluate any constraint over the model. Otherwise the model read from the remaining files is validated as usual."
- "A runtime **MUST NOT** crash, hide the diagram, or report a parse failure in any way other than this finding." Whether the diagram then opens empty or read-only is FBL's.

**Example (w3c-rdf):** `"builtIn": { "std.unparseable": { "code": "rdf.unparseable", "message": { "cel": "'This is not RDF that can be read: ' + detail.reason" } } }`, where `detail` is B.11.

**0.1:** new built-in. **DID:** 8.1 says a DID file that cannot be parsed produces this finding rather than an unexplained refusal (Part C).

### B.3 One finding per item from a diagram-scope rule

**Needed by:**
- ansible-structure.md:225 (one per unreadable file); databricks-bundle.md:133 (one per stray override); helm-chart.md:122 (one per CRD file, one per stale lock entry).
- sparql-query.md:162 and sparql-query.dis:510-519 (one per unused prefix, joined into one message today).
- w3c-rdf.md:255 (every re-declaration); w3c-owl.md:187 and :189 (per IRI, per import); w3c-shacl.md:281; w3c-skos.md:233.
- causal-loop-diagram.md:91 (one per unclaimed cycle).
- The 0.1 limit is in 8.2: "`diagram` evaluates once".

**Construct:** constraint property `forEach` (the same name as the hook action's `forEach`, 9.4).
- `forEach`: an Expression that returns a list, evaluated once for each scope element (once for `scope: "diagram"`).
- For each item, `item` and `index` are bound. Both are already reserved names (2.2), and `compartmentItem` uses them.
- `when`, `rule`, `severity`, `message`, `target`, `location`, `subject` and `attribute` are then evaluated for that item.
- `rule` becomes optional when `forEach` is present. Its default is `false`, meaning every item yielded is a finding.
- When `target` is omitted, the default is `item` if the item is an element, otherwise `self`.

**Normative:**
- "A constraint with `forEach` **MUST** produce one finding for each item for which `when` holds and `rule` does not, in list order."
- "A constraint with `forEach` **MUST** have `enforcement: "report"`; a validator **MUST** reject any other enforcement." This keeps `prevent` defined only over elements, as in 0.1.

**Schema:** `Constraint` gains `forEach` (Expression), and the `required` list becomes `id` plus `anyOf [rule, forEach]`.

**Example (sparql-query `unusedPrefix`):**
```json
{ "id": "unusedPrefix", "code": "sparql.unused-prefix", "scope": "diagram",
  "forEach": "diagram.prefixes.filter(p, !p.used)",
  "severity": "info",
  "message": { "cel": "\"The prefix '\" + item.prefix + \":' is declared but never used.\"" },
  "location": "{'file': diagram.file, 'line': item.line}",
  "subject": "'PREFIX ' + item.prefix + ':'" }
```
`diagram.file` is the model file's subject-relative path; this proposal adds it as a Diagram member. The CEL context table gains `item` and `index` for `constraint` when `forEach` is used.

**0.1:** 0.1 rules all have `rule`, and no 0.1 rule has `forEach`. **DID:** none.

### B.4 One finding per cycle, naming the loop in order

**Needed by:**
- azure-devops-pipeline.md:130 and azure-devops-pipeline.dis:688-692 (each cycle once, with the whole loop; "A DISL invariant … cannot name the loop's members in order").
- databricks-job.md:201 (names every task on a circle).
- causal-loop-diagram.md:91-92 and causal-loop-diagram.dis:508-531 (elementary cycles, bounded, via the plugin CEL function `elementaryCycles` at causal-loop-diagram.dis:677).
- w3c-owl.md:177 and :186 (Tarjan, one per cycle, "the `.dis` … reports one finding per member") and w3c-owl.dis:632.
- w3c-skos.md:219 and :231 (one per knot, names sorted by id) and w3c-skos.dis:424.
- functional-decomposition-graph.md:71 (`fdg.ownership-cycle`).

**Construct:** `forEach` (B.3) over two new Diagram functions in 12.2. This overlaps gap 3's FR-091 (cycle enumeration), so it should be coordinated with that theme.
- `diagram.cycles(relType, max) → list(list(Element))`: the elementary cycles over relations of the type, including subtypes, at most `max` of them. Each is in loop order and starts at its member that comes first in model order; the cycles are ordered by their first member and then lexicographically by member order. A self-loop is a cycle of one.
- `diagram.cyclesTruncated(relType, max) → bool`.
- `diagram.knots(relType) → list(list(Element))`: the strongly connected components with more than one member or with a self-loop, members in model order, components ordered by first member.

**Normative:**
- "These functions **MUST** be deterministic given the model and the reading order."
- "`cycles` **MUST NOT** return more than `max` cycles, and its cost **MUST** be estimated as proportional to (nodes + relations) × (max + 1)." This bound keeps CEL's termination guarantee (Appendix D.1).

**Example (causal-loop-diagram `unlabelledLoop`, placed after `cycleBoundReached` in the array, see B.6):**
```json
{ "id": "unlabelledLoop", "code": "causal-loop.unlabelled-loop", "scope": "diagram", "severity": "info", "cost": "expensive",
  "forEach": "diagram.cycles('CausalLink', 500).filter(c, !diagram.nodesOfType('Loop').exists(l, signature(l.members) == signature(c)))",
  "target": "item",
  "message": { "cel": "'The links form a feedback loop through ' + item.map(v, v.name).join(' → ') + ' that no loop statement names.'" } }
```
Azure `cycle`: `"forEach": "diagram.cycles('Dependency', 1000)"`, `"target": "item[0]"`, with the message `item.map(s, s.title).join(' -> ') + ' -> ' + item[0].title`. OWL and SKOS use `knots`.

**0.1:** new functions only. **DID:** none.

### B.5 Only the second and later duplicates

**Needed by:**
- databricks-job.md:200 ("reported on the second and later tasks with the key … The DISL rule flags them all").
- databricks-bundle.md:132 (`multiple-default-targets`).
- helm-chart.md:122 (a name collision, once at the second declaration) and helm-chart.dis:640-643.
- dependency-graph.md:109 (ids).
- w3c-rdf.md:248 and :255 (each re-declaration of a prefix).

**Construct:** `e.positionIn(l)` from A.0. **No new property.** The rule is "self is the first in its group": `self.positionIn(group) == 0`. The B.1 example shows it for databricks-job. For ids, the built-in `std.duplicateId` does the same.

**Normative:** only `positionIn`'s definition (A.0). **0.1 / DID:** none.

### B.6 Order among findings

**Needed by:** causal-loop-diagram.md:92 ("`cycle-bound-reached` … is reported before the unlabelled-loop findings; DISL has no ordering of problems"). FR-023.

**Construct:** a normative order, with **no new property**: 2.1 already makes the order of constraints significant.

**Normative:** "Findings **MUST** be ordered as follows:
1. findings raised by the reader (`std.unparseable`, `std.unreadableEntry`, `std.missingId`, `std.duplicateId`), in reading order;
2. other built-in constraints, in the order of the table in 8.7;
3. declared constraints, in the order of `rules`;
4. within one constraint, by scope element in model order (12.5), then by `forEach` item order.

The headless validator's output and a runtime's default presentation **MUST** use this order. A runtime **MAY** let the user sort differently."

**Example:** in causal-loop-diagram.dis, `cycleBoundReached` (now at :522) moves before `unlabelledLoop` (now at :508). **0.1:** 0.1 defined no order, so this adds a guarantee without changing any meaning. **DID:** none.

### B.7 Whole model versus one view

**Needed by:**
- c4-container.md:100 and the other five C4 notes (`c4.element-not-on-any-view` needs every view's membership; `disconnected-element` and `element-not-on-any-view` are "silent while the model declares no views"; "Standalone validates the workspace, across every view at once").
- FBL's "one model, several readings" (gaps summary, gap 2), which makes the evaluation scope matter: six C4 readings of one `.dsl` must not report a model rule six times.

**Construct:** constraint property `over: "model" | "view"`, default `"model"`, with:
- the `view` variable bound in the `constraint` context when `over: "view"` (`view` is already reserved, 2.2), with members `id`, `viewpoint`, `name` and `members → list(Element)`;
- the Diagram member `diagram.views → list(View)`: the DID views, or the views the model's readings define (FBL).

Which elements are members of a view is gap 3's derived membership. This construct only reads it.

**Normative:**
- "A constraint with `over: "model"` **MUST** be evaluated once per model, however many views or readings of it are open, and its findings **MUST** be shared by all of them."
- "A constraint with `over: "view"` **MUST** be evaluated once per view, and each of its findings **MUST** carry that view's id."
- "`diagram` **MUST** always denote the whole model."

**Example (c4-container, a new rule replacing the note at c4-container.md:100):**
```json
{ "id": "elementNotOnAnyView", "code": "c4.element-not-on-any-view", "over": "model",
  "scope": ["Person", "SoftwareSystem", "Container", "Component"],
  "when": "diagram.views.size() > 0",
  "rule": "diagram.views.exists(v, v.members.exists(m, m.id == self.id))",
  "severity": "warning",
  "message": { "cel": "\"'\" + self.name + \"' is on no view.\"" } }
```

**Schema:** `Constraint.over` enum. `Finding.view`. **0.1:** in 0.1, `diagram` in a constraint is already the model (`diagram.nodes` are "model nodes, not view-only", 12.2), so the default is the 0.1 meaning. `diagram.viewOnly` keeps its "current view" meaning. **DID:** none.

### B.8 Rules that consult file-system facts

**Needed by:** wardley-map.md:194 and :197 (`wardley.submap-missing`: a submap's `url` that looks like a local path, resolves inside the project root and does not exist; "CEL has no file-system access"). FR-025. The folder readers (Ansible, Helm, .NET) read the file system as FBL; their read failures are B.9's `std.unreadableEntry`, not rules.

**Construct:** two functions, available only in the `constraint` context (12.4, new subsection "File-system facts"):
- `fs.exists(path) → optional(bool)`
- `fs.isDirectory(path) → optional(bool)`

**Normative:**
- "`path` **MUST** be resolved relative to the folder of the diagram's subject. The result **MUST** be `optional.none()` when the path is absolute, carries a URI scheme, resolves outside the root the runtime was given (the host's project, or the headless validator's root), or when the runtime has no file-system access."
- "The functions **MUST** reveal only whether a path exists and is a folder, never a file's content, size or time, and **MUST NOT** follow network paths."
- "The facts **MUST** be taken once per validation run, as `env.now` is (12.5). A runtime **MUST** re-evaluate constraints that use them on explicit validation and on save, and **SHOULD** re-evaluate them when the file system changes."
- "These two functions are the only file-system facts DISL defines." FR-025 asks for the list.
- In section 16, a sentence on confinement.

**Example (wardley-map):**
```json
{ "id": "submapMissing", "code": "wardley.submap-missing", "scope": "Submap",
  "when": "self.url != '' && !self.url.contains(':')",
  "rule": "fs.exists(self.url).orValue(true)",
  "severity": "warning",
  "message": { "cel": "\"The submap '\" + self.name + \"' points at '\" + self.url + \"', which is not in this project.\"" } }
```

**Schema:** none; these are functions. The determinism clause of 12.5 names them as an exception, like `env.now`. **0.1 / DID:** none.

### B.9 Built-in rules

Added to the 8.7 table. Each is raised either by the reader (FBL or the DID loader) or by the runtime, and each can be re-rated, given a `code`, or given a `message` in `constraints.builtIn` (B.11).

| Id | Raised when | Default severity / enforcement | Location and target | Needed by |
|---|---|---|---|---|
| `std.unparseable` | A file of the model cannot be parsed | error / report; replaces (B.2) | the file, at the parser's line; no element | dependency-graph.md:107, timeline.md:153, mindmap.md:216, sparql-query.md:157, w3c-rdf.md:247, azure-devops-pipeline.md:132, ansible-structure.md:221, helm-chart.dis:569 |
| `std.unreadableEntry` | An entry of a parsed file cannot be turned into an element (an unknown key, a malformed value, a line in no known form, a project that does not resolve). The entry is kept in the file (FBL) and not drawn | warning / report | the entry's location; `subject` names it | gartner-hype-cycle-graph.md:56 and :190, functional-decomposition-graph.md:40, :45 and :71, causal-loop-diagram.md:54 and :86, dotnet-dependency-graph.md:100 and :216, databricks-job.md:199 (`task-key-missing`, "not drawn at all") |
| `std.missingId` | An element has no usable id (A.10), or its derived id could not be computed (A.0) | warning / report | the element (ephemeral or newly assigned) and its location | dependency-graph.md:108, timeline.md:154, mindmap.md:78 |
| `std.duplicateId` | An element's id equals that of an element earlier in reading order (A.10); comparison follows `compare` | warning / report; second and later only | each second and later element | dependency-graph.md:109, mindmap.md:217, timeline.md:155, gartner-hype-cycle-graph.md:189, functional-decomposition-graph.md:71 |
| `std.mixedPrecision` | Two attributes of one element tied by `samePrecisionAs` hold values written with different precisions | warning / report; and prevent in forms, as `std.facets` does | the element and the attribute | timeline.md:143 and :158 |
| `std.ephemeralViewData` | Stored view data is keyed by an ephemeral id (A.9) | info / report | the element when present; otherwise `subject` = the stored key | spec edge case "An unstable id that a DID definition already stores a position for" |

**`std.mixedPrecision`** needs a construct from gap 12 (time): an attribute keeps its written precision. The time theme defines that, and this built-in relies on it and on a CEL `precisionOf(v)` that the same theme should define. The only addition here is the attribute property `samePrecisionAs: <attribute name>`; timeline sets it on `end` with the value `"begin"`. It is generated, not written as CEL, because the rule needs the written form, which CEL values do not carry. **Schema:** `Attribute.samePrecisionAs` (SimpleId).

**Normative (8.7):** "A reader **MUST** report `std.unparseable`, `std.unreadableEntry`, `std.missingId` and `std.duplicateId` as they occur, and **MUST NOT** fail to open a model because of any of them. Whether an unparseable primary file leaves the diagram empty or read-only is FBL's."

**0.1:** new built-ins, each generated only from a situation that was invalid in 0.1 or from a new declaration, so a valid 0.1 diagram reports nothing new. **DID:** 8.1 names the four reader built-ins (Part C).

### B.10 Headless validator output

**Needed by:** FR-026. The 0.2 spec's independent test for US2 validates "a headless-validator output that contains a file-and-line finding, a parse-failure finding and a finding on an undrawn subject against the 0.2 finding shape". ansible-structure.md:228 and w3c-rdf.md:243 describe validators that read the files directly.

**Construct:** keep the 0.1 JSON array. Each item keeps `constraintId`, `severity`, `message`, `elementId`, `attribute` and `pointer`, and gains the optional `code`, `elementIds`, `location`, `subject` and `view`.

**Normative (8.6):**
- "A headless validator **MUST** write its findings as a JSON array valid against `$defs/ValidatorOutput`, in the order of B.6, and **MUST** exit with a non-zero status when any finding has severity `error`."
- "`elementId` **MUST** equal the first of `elementIds` when either is present."
- "`pointer` **MUST** be present for a finding about a record of a DID definition, and **MUST** be absent when `location` names a file that is not a DID definition."
- "A headless validator **MUST** be given, or **MUST** derive from its input, the root that B.8 and `location.file` are relative to."

**Schema:** `$defs/ValidatorOutput` = `{ "type": "array", "items": { "$ref": "#/$defs/Finding" } }`. `Finding` uses the 0.1 key `constraintId` in the output rather than `rule`, for compatibility. The runtime-facing prose keeps "rule" and states the mapping.

**Example (dependency graph, a hand-edited `.dgr`):**
```json
[
  { "constraintId": "std.duplicateId", "code": "dependencies.duplicate-id", "severity": "warning",
    "message": "The id 'api-gateway' is declared more than once, which makes every reference to it ambiguous.",
    "elementIds": ["api-gateway"], "location": { "file": "shop.dgr", "line": 14 } },
  { "constraintId": "std.references", "code": "dependencies.dangling-relation", "severity": "warning",
    "message": "A dependency names 'billing', and no node with that id is in this graph.",
    "elementId": "k3JdQx0bQ2u2iP5tq7lT9w", "elementIds": ["k3JdQx0bQ2u2iP5tq7lT9w"], "location": { "file": "shop.dgr", "line": 31, "column": 5, "length": 7 } }
]
```
For `sparql.unparseable`: `{ "constraintId": "std.unparseable", "code": "sparql.unparseable", "severity": "error", "message": "…", "location": { "file": "q.rq", "line": 3 } }`. For `skos.nonconcept-target`: `…, "subject": "ex:Widget", "location": { "file": "stw.ttl", "line": 812 }`.

**0.1:** additive. A 0.1 consumer that reads only the 0.1 keys keeps working. **DID:** none.

### B.11 Reported codes and built-in messages

**Needed by:** the 15 `x-adp-ruleId` keys (ansible-structure.dis 5, databricks-job.dis 5, databricks-bundle.dis 3, databricks-pipeline.dis 2); rule ids in `label` (azure-devops-pipeline.md:127) and in `tags` (c4-container.dis:1965, gartner-hype-cycle-graph.md:195); built-ins re-rated with the tool's own id and sentence (dependency-graph.md:110-111 with `std.references` and `std.endpoints`; gartner-hype-cycle-graph.md:182-193; timeline.md:156 and :159; wardley-map.md:187-190).

**Construct:**
- `code` on constraints (B.1).
- The entries of `constraints.builtIn` (8.1) gain `code` (QualifiedId) and `message` (LocalizedText or `{cel}`).
- A built-in `message` CEL runs in the `constraint` context, with `self` (the element, or the diagram) and a `detail` map whose keys each built-in lists in 8.7. For example, `std.duplicateId` has `{id, first}`, `std.unparseable` has `{reason}`, `std.references` has `{attribute, missingId}`, and `std.unreadableEntry` has `{reason, entry}`.

**Normative:**
- "When a built-in or declared constraint has a `code`, findings **MUST** report it."
- "Suppressions **MUST** remain keyed by the constraint `id` (or built-in id), not by `code`."
- "`detail` **MUST** be bound only for built-in messages."

**Schema:** extract `Constraints.builtIn`'s value into `$defs/BuiltInSetting { severity, enabled, code, message }`. `detail` is a reserved name (add it to 2.2).

**Example (timeline):** `"builtIn": { "std.references": { "severity": "warning", "code": "timeline.dangling-connection" }, "std.mixedPrecision": { "code": "timeline.mixed-precision", "message": "This element uses the other time form; begin and end must both be dates, or both carry a time." } }`.

**0.1:** 0.1 said built-in messages are localised by the runtime, and that stays the default. **DID:** none.

---

## Part C — DID changes (DID 0.2, FR-005)

1. **Version**: `did: "0.2"`, with a new schema `$id` of `…/did/schema/0.2/did.schema.json`. `$defs` references to DISL move to DISL 0.2.
2. **Section 4, identifiers**:
   - A writer **MUST NOT** write a missing, empty or duplicate id. `id` stays `required` in the schema, because the schema describes what writers produce.
   - A reader **MUST** load a definition with missing or duplicate ids and report them (`std.missingId`, `std.duplicateId`). The first record in record order keeps a duplicated id.
   - With `missing: "assign"`, the new id is written on the next save and not on load.
   - A save writes back unchanged the records the user did not edit, so a hand-made duplicate stays until the user fixes it.
   - Ids compare according to `persistence.ids.compare`.
   - Derived ids are recomputed on load and the references follow (A.0).
3. **Section 5, view data**: view keys **MUST NOT** be ephemeral ids. A stored one is ignored, reported by `std.ephemeralViewData`, and dropped when the view is next written.
4. **Section 3, suppressions**: `[{constraint, element?, subject?, reason, by, at}]`, with exactly one of `element` and `subject`, so that a finding without an element can be suppressed by its subject. A suppression **MUST NOT** name an ephemeral id. **Schema:** `required: ["constraint"]` plus `oneOf [{required: [element]}, {required: [subject]}]`. This loosens the current `required: ["constraint", "element"]`, so every valid 0.1 suppression stays valid.
5. **Section 8.1, loading**:
   - A file that cannot be parsed produces `std.unparseable` instead of an unexplained refusal. A file whose language id differs is still refused.
   - In step 3, a record that fails `$defs/Element` or `$defs/Relation` for a reason other than a missing or duplicate id is preserved verbatim as unknown content (8.2), left out of the model, and reported as `std.unreadableEntry` with its JSON Pointer.
   - Step 5 reads "show findings".
6. **Wording**: "constraint problems" becomes "findings" (B.0).

A valid DID 0.1 definition stays valid and means the same thing, because every change either loosens the schema or applies only to input that 0.1 rejected.

---

## Part D — Schema impact, in one place

| `$defs` | Change |
|---|---|
| `IdStrategy` (new, extracted from `Persistence.properties.ids`) | 0.1 properties + `types`, `missing`, `compare`, `encoding`, `ephemeral`, `reason`, `suffix`; strategy enum + `derived` |
| `IdRule` (new) | `strategy`, `encoding`, `prefix` (string), `expression`, `stable`, `ephemeral`, `reason`, `pattern`, `suffix`, `doc`; `expression` required for `cel` and `derived` |
| `Persistence` | `ids` → `$ref IdStrategy` |
| `Constraint` | + `code`, `forEach`, `location`, `subject`, `over`; `required: [id]` + `anyOf [[rule], [forEach]]`; `if forEach then enforcement ∈ {report}` |
| `Constraints` | `builtIn` values → `$ref BuiltInSetting` |
| `BuiltInSetting` (new) | `severity`, `enabled`, `code`, `message` |
| `Attribute` | + `samePrecisionAs` |
| `FormItem` kind enum | + `findings` (`problems` kept, marked deprecated) |
| `SourceLocation` (new) | `file` (required), `line` ≥ 1, `column` ≥ 1, `length` ≥ 0; `dependentRequired: {column: [line], length: [column]}` |
| `Finding` (new) | `constraintId` (required), `code`, `severity` (required), `message` (required), `elementId`, `elementIds`, `attribute`, `location`, `subject`, `view`, `pointer` |
| `ValidatorOutput` (new) | array of `Finding` |

CEL (not schema): context `identity` (12.3); `item`, `index` and `view` in `constraint` where applicable; `detail` in built-in messages; functions `e.positionIn(l)`, `e.location()`, `e.location(attr)`, `diagram.file`, `diagram.views`, `diagram.cycles`, `diagram.cyclesTruncated`, `diagram.knots`, `fs.exists`, `fs.isDirectory`. Reserved names in 2.2 gain `detail`.

## Part E — Left to FBL, a plugin or a host

| Item | Owner | Reason |
|---|---|---|
| Sidecar ids keyed by natural keys, and their reconciliation (wardley-map.md:84-87) | FBL | The sidecar is FBL's (agreed boundary). DISL provides the generation strategy. |
| Recording each element's source location (`location()` data) and normalising paths | FBL | Only the reader knows the text. DISL defines the accessor and the shape. |
| Detecting a parse failure, and whether the diagram then opens empty or read-only (timeline.md:73, c4-container.md:121) | FBL | DISL defines the finding and its replacement semantics. |
| Keys of `.adp` `layout:` blocks (ansible-structure.md:153, databricks-job.md:122) | FBL | They are ids, so they follow A.9 (never ephemeral), and the block's grammar is FBL's. |
| Rebasing locations to project-relative paths for display (ansible-structure.md:224, helm-chart.md:121) | Host | Presentation only; `file` is subject-relative. |
| Navigating to a line and opening the file in a text editor (azure-devops-pipeline.md:139) | Host | Runtime behaviour, not a specification construct. |
| Recursive expression text (w3c-owl.md:155) and cycle polarity (causal-loop-diagram.md:90) | Gap 3 or the tool's own functions | These are not identity or findings. `diagram.cycles` here should be coordinated with FR-091. |
| Viewport delivery and wire ids (`azure-devops/pipeline+stage`, azure-devops-pipeline.md:137) | Host | Out of scope (spec Assumptions). |

## Part F — Open points to settle with other themes

- **FBL:** what `file` in a SourceLocation is relative to (this proposal says the subject), and which file is "primary" for B.2. Also that FBL's reader produces elements in a reading order that A.5 and B.6 can rely on.
- **Gap 3 (derived nodes):** derived elements may be ephemeral; C4 view membership feeds `diagram.views[].members`; `cycles` and `knots` answer part of FR-091.
- **Gap 11 (notation):** relations without a target (A.7, Helm and Ansible).
- **Gap 12 (time):** written precision and `precisionOf`, used by `std.mixedPrecision`.
- **Gap 7 (telling the user why):** the ephemeral `reason` is a refusal sentence and should use gap 7's reason shape (interpolation) once it is defined.
