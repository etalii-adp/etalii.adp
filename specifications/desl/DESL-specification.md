# DESL — Designer Specification Language

**Specification, version 0.1 (Draft)**

|   |   |
|---|---|
| Date | 2026-10-09 |
| Kind | designer |
| Role | specification language |
| File extension | `.des` |
| Paired language | DED, the Designer Definition Language (`.ded`), a placeholder |
| Document schema | `desl.schema.json` (JSON Schema, draft 2020-12), `$defs/Specification` |
| Builds on | [DISL](../disl/DISL-specification.md) 0.3, by reference; [FBL](../fbl/FBL-specification.md) 0.3 for storage |
| Expression language | CEL — Common Expression Language (https://cel.dev), as DISL uses it |
| Licence | [Apache License 2.0](https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE) (`Apache-2.0`) |

---

## Status of this document

This is a draft, version 0.1. It holds what the first designer, the Knowledge designer (`definitions/designers/knowledge.des`), needs and nothing more (constitution principle V), so its constructs may change when a second designer arrives, and any construct may change before 1.0 (constitution principle IV). Sections and paragraphs marked *(informative)* explain intent; everything else is *normative*.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY** and **OPTIONAL** are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in bold capitals.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [The document](#2-the-document)
3. [Language](#3-language)
4. [Metamodel](#4-metamodel)
5. [Persistence](#5-persistence)
6. [Constraints](#6-constraints)
7. [Surface](#7-surface)
8. [Operations](#8-operations)
9. [Processing model](#9-processing-model)
10. [Conformance](#10-conformance)
- [Appendix A — JSON Schema](#appendix-a--json-schema)

---

## 1. Introduction

### 1.1 What DESL is

A **designer** is the kind of ADP tool that lays its content out as a form-based visual layout in which nothing is connected ([terminology](../../docs/terminology.md)). In DESL a tool engineer specifies one designer type: the model its documents hold, where and how they are stored, which models are valid, how the model is presented on the designer's surface, and what each gesture on that surface changes. A DESL file (`.des`) holds one designer type, as a DISL file holds one diagram type.

### 1.2 An example *(informative)*

```json
{
  "$schema": "https://etalii.net/adp/desl/schema/0.1/desl.schema.json#/$defs/Specification",
  "desl": "0.1",
  "language": { "id": "net.etalii.adp.knowledge", "version": "0.1.0", "origin": "etalii/knowledge", "label": "Knowledge" },
  "metamodel": { "types": { "Property": { … }, "Row": { … }, "Cell": { … }, "View": { … } } },
  "persistence": { "format": "fbl", "bindings": ["knowledge.fbl#yaml", "knowledge.fbl#json", "knowledge.fbl#xml"],
                   "ids": { "strategy": "uuid-v4", "encoding": "base36" } },
  "surface": { "kind": "table", "columns": { "type": "Property", … }, "rows": { "type": "Row" }, … },
  "operations": { "addProperty": { … } }
}
```

`minimal-table.des` beside this document is a complete, small example.

### 1.3 Relation to DISL

DESL does not redefine what DISL already defines for every tool. These sections of DISL **apply to a DESL specification as written**, with "diagram" read as "the designer's document" and "diagram type" as "designer type":

| Concern | DISL section | DESL property |
|---|---|---|
| The language's identity and origin | §3.2 | `language` |
| The metamodel: primitive types, attributes, data types, enumerations, node types, containment and references | §4.2 to §4.8 | `metamodel` |
| Constraints, quick fixes and findings, with their codes, severities and source locations | §8.1 to §8.7 | `constraints` |
| Operations and their actions, run as one transaction | §9.3, §9.4 | `operations` |
| Persistence with `format: "fbl"`, `typeMap`, and identifiers | §11.2, §11.5 | `persistence` |
| The CEL environment and determinism | §12 | every Expression |
| The editing transaction | §14.4 | every gesture |

What a DESL specification has that DISL does not is its **surface** (section 7): how the model is laid out for the user. What DISL has that DESL does not is everything that draws a diagram: coordinates and placement, notation, the toolbox, layout, viewpoints and relation types, since nothing on a designer is connected.

### 1.4 Relation to FBL and DED *(informative)*

A designer document is stored through FBL ([FBL-specification.md](../fbl/FBL-specification.md)): its body is a file the bindings in `persistence.bindings` read and write by splices, beside an `.adp` registration whose first line is the designer type's origin. DED, the Designer Definition Language, is to be ADP's own storage format for designers, as DID is for diagrams; it is a placeholder, and DESL 0.1 stores designer documents through FBL only.

---

## 2. The document

A DESL document is a JSON document (RFC 8259) encoded in UTF-8, validated by `desl.schema.json#/$defs/Specification`:

| Property      | Type | Description |
|---------------|------|-------------|
| `$schema`     | URI | Optional; the schema's `$id` with `#/$defs/Specification`. |
| `desl`        | `"0.1"` | **Required.** The DESL version the specification is written in. |
| `language`    | DISL `Language` | **Required.** Section 3. |
| `metamodel`   | DISL `Metamodel` | **Required.** Section 4. |
| `persistence` | Persistence | **Required.** Section 5. |
| `constraints` | DISL `Constraints` | Section 6. |
| `surface`     | Surface | **Required.** Section 7. |
| `operations`  | map SimpleId → DISL `Operation` | Section 8. |
| `functions`   | map SimpleId → DISL `Function` | User functions, as DISL §3.4. |
| `doc`         | DISL `Doc` | |

A document **MUST NOT** contain duplicate keys. Properties whose names start with `x-` are extension properties, ignored by hosts that do not know them, as in DISL §2.8. A host **MUST** refuse a document whose major version it does not support, and **SHOULD** read a document of a newer minor version, ignoring what it does not know, with a warning.

---

## 3. Language

`language` is DISL's `Language` (DISL §3.2). `origin`, `<vendor>/<type>`, is **REQUIRED** in DESL: it is the first line of every registration of the designer's documents (FBL section 8.1) and the designer type's key in a host's catalogue.

---

## 4. Metamodel

`metamodel` is DISL's `Metamodel` (DISL §4), with these restrictions:

- `relations` **MUST NOT** be given: a designer draws no relation. A link between elements is a **reference attribute** (DISL §4.8), and a designer shows it as a value.
- `diagram.attributes` are the attributes of the document as a whole (for a table, its name and the view it was last left in), as in DISL.
- An attribute name **MUST NOT** be one DISL reserves (DISL §4.3), whatever key the body stores it under; the binding maps one onto the other (FBL section 5.2).

---

## 5. Persistence

| Property   | Type | Description |
|------------|------|-------------|
| `format`   | `"fbl"` | **Required.** The only format of DESL 0.1. |
| `bindings` | BindingRef[] | **Required**, at least one. One FBL binding per format family a document of this type may be written in, each `<document>#<name>` (FBL section 2.3), resolved against the specification's own location. |
| `ids`      | DISL `IdStrategy` | How ids are made and derived (DISL §11.5). |
| `typeMap`  | map → DISL `TypeMapEntry` | The bindings' types mapped onto the metamodel (DISL §11.2). |
| `doc`      | Doc | |

- The bindings **MUST** read the same model: for the same content, every binding **MUST** yield the same elements, attributes and findings, so that a document's format never changes what it means.
- Two bindings **MUST NOT** claim the same extension or the same file name (FBL section 12.1). A host opening a body uses the binding whose claims take it (FBL section 8.1).
- Each binding's `template` is the body of a new document in its format. A host that creates a document **MUST** let the user choose the format at that moment, and **MUST NOT** offer to change a document's format afterwards: that would rewrite every byte, against FBL's first principles.
- A step that changes two documents at once (a two-way reference between two files) **MUST** be one undoable step in the host, whose undo restores both bodies, and which writes neither when either edit is refused. FBL keeps one history per body (FBL section 7.1); making the two one step is the host's.

---

## 6. Constraints

`constraints` is DISL's `Constraints` (DISL §8), with its findings (DISL §8.6) and built-in findings (DISL §8.7). Constraints with `over: "view"` do not apply: a designer's views are elements of its model (section 7.4), and a constraint about one is scoped to its type.

---

## 7. Surface

### 7.1 Overview

`surface` says how the model is laid out for the user, by naming which types and attributes of the metamodel play which part. It names no designer type of its own; a host's component for a `kind` serves all designer types of that kind.

| Property | Type | Description |
|----------|------|-------------|
| `kind`   | `"table"` | **Required.** The layout. DESL 0.1 defines one kind. |

The rest of this section defines the `table` kind.

### 7.2 The table

A **table** shows elements of one type as **rows**, the elements of another type as **columns**, and at each crossing one **cell** that holds the row's value for that column. A table has **views**, elements that store how it is shown: which columns, in which order and width, sorted, filtered and grouped how.

| Property     | Type | Description |
|--------------|------|-------------|
| `columns`    | Columns | **Required.** The type whose elements are the columns (7.3). |
| `rows`       | `{ type }` | **Required.** The type whose elements are the rows, in document order unless a view sorts them. |
| `cells`      | Cells | **Required.** The type whose elements are the cells (7.3). |
| `views`      | Views | **Required.** The type whose elements are the views, and the types of their settings (7.4). |
| `valueTypes` | map SimpleId → ValueType | **Required.** One entry per value type a column may have (7.5). |

### 7.3 Columns and cells

| Columns property | Type | Description |
|------------------|------|-------------|
| `type`      | TypeRef | **Required.** The columns' node type. Document order is column order. |
| `name`      | attribute | **Required.** The attribute that names a column. |
| `valueType` | attribute | **Required.** The attribute whose value, a key of `valueTypes`, is the column's value type. |
| `title`     | attribute | The boolean attribute that marks the one column that titles a row. |
| `options`   | `{ type, name, colour }` | The node type contained in a column that lists the values a choice may take, with the attributes that name and colour one. |
| `parent`    | attribute | The boolean attribute that marks a column whose values are the row's parent within the same document, for nesting. |

| Cells property | Type | Description |
|----------------|------|-------------|
| `type`   | TypeRef | **Required.** The cells' node type, contained in a row. |
| `column` | attribute | **Required.** The reference attribute that names the cell's column. |
| `items`  | TypeRef | The node type contained in a cell that holds one of several values. |

A row has at most one cell per column. A row without a cell for a column has no value for it, which is shown empty. A cell **MUST NOT** carry an id of its own beyond what its row and column give it.

### 7.4 Views

| Views property | Type | Description |
|----------------|------|-------------|
| `type`     | TypeRef | **Required.** The views' node type. Document order is the order of the view tabs. |
| `name`     | attribute | **Required.** |
| `active`   | attribute | An attribute of the document (`diagram.attributes`) naming the view the document was last left in; absent, the first view. |
| `settings` | map role → TypeRef | The node types contained in a view that store its settings, by role: `columns` (a column's visibility, width and wrap), `sorts`, `conditions`, `filterGroups` and `groups` (the order, hidden state and collapsed state of a group). |

A table **MUST** always have at least one view. A view stores only what differs from the default: a column with no settings is visible, at the default width, after the columns that have settings, in column order.

### 7.5 Value types

A **value type** says what a column's cells hold and how the surface treats it:

| Property      | Type | Description |
|---------------|------|-------------|
| `label`       | LocalizedText | **Required.** |
| `key`         | attribute | **Required.** The attribute of the cells' type that holds the value or, with `many`, of the items' type that holds one value. A cell holds its value under the key of its column's type, so a value that does not fit its column's type is still readable and is reported, never discarded. |
| `many`        | bool | The cell holds any number of values as items (7.3). Default false. |
| `editor`      | `text`, `number`, `checkbox`, `date`, `dateTime`, `time`, `choice`, `choices`, `rows` | **Required.** The editor a host opens over a cell: free text, a number, a checkbox, a date, a date and time, a time, one option, several options, or rows of a document, searched by title. |
| `comparisons` | string[] | **Required.** The comparisons a filter condition on this type offers, by the operator stored in the condition. `is-empty` and `is-not-empty` are offered for every type and **MUST NOT** be listed. |
| `sort`        | `text`, `number`, `false-first`, `chronological`, `option-order`, `title` | **Required.** How values compare when sorted: by text ignoring case, numerically, unchecked first, by time, by the options' order (of the first value, for several), or by the first related row's title. Empty values sort last in both directions. |
| `converts`    | map value type → conversion | What a value becomes when its column's type changes to another (7.6). |

### 7.6 Conversions

| Conversion | From → to | Result |
|------------|-----------|--------|
| `written-form` | any → a text type | The value's written form: the text a cell shows. |
| `parse` | text → number, checkbox, date, date and time, time | The value parsed in its target type's form (a number as JSON writes one, `true` or `false`, ISO 8601); a text that does not parse is not converted. |
| `match-option` | text → a choice | The option whose name equals the text, ignoring case, created when there is none. |
| `wrap` | one value → several | The one value as the only item. |
| `unwrap` | several → one value | The only item, when the cell holds exactly one. |

A change of a column's value type **MUST** convert every cell whose value the change's conversion converts, in the same step. A value with no conversion to the new type, or one its conversion cannot convert, **MUST** be kept as it is, under its old key, and reported as a finding on its cell. No value is discarded by a change of type.

---

## 8. Operations

`operations` are DISL's operations (DISL §9.3), each a named transaction of actions (DISL §9.4) with its parameters as `p`. A designer **SHOULD** declare one operation per gesture of its surface, so that every host makes the same model changes for the same gesture; the gesture a host offers to start each is the host's, and the specification's prose beside the `.des` names them. An operation's actions are planned into splices by the bindings as one edit (FBL section 6.4).

---

## 9. Processing model

### 9.1 Loading a DESL specification

1. **Parse** the JSON; reject duplicate keys.
2. **Check the version**: `desl` major version supported.
3. **Validate** against `desl.schema.json#/$defs/Specification`.
4. **Resolve names**: every type the surface names is a node type of the metamodel; every attribute it names is an attribute of the type it is named for; `columns.options.type` and `cells.items` are among the containment of the columns' and the cells' types; each value type's `key` is an attribute of the cells' type, or of the items' type with `many`; every binding in `persistence.bindings` exists, and every rule `type` in it names a node type of the metamodel or a key of `typeMap`.
5. **Check the metamodel and the rest** as DISL §14.1 does for those layers.

A validator reports every problem with the JSON Pointer of its location, a severity and a message, as DISL §14.1 does.

### 9.2 Opening and editing a document

A host opens a document as FBL section 14.2 says, with the binding of section 5, and builds the model as DISL §14.2 does. Each gesture is one transaction (DISL §14.4), planned as one edit of the body (FBL section 6.4), or of two bodies in one step as section 5 says.

---

## 10. Conformance

| Class | Requirements |
|---|---|
| **DESL specification** | Validates against `$defs/Specification` and passes the checks of section 9.1 without errors. |
| **Validator** | Implements section 9.1 and reports problems with JSON Pointers. |
| **Host** | Reads a DESL specification, opens its documents through FBL as a declared host of the bindings' families (FBL section 15.1), keeps the constraints of section 6, lays out the surface of section 7 for each `kind` it supports, and runs the operations of section 8. It states which kinds it supports; a document of a kind it does not support opens read-only, if at all, with the reason. |

---

## Appendix A — JSON Schema

The normative schema is [`desl.schema.json`](desl.schema.json) beside this document (JSON Schema draft 2020-12, `$id` `https://etalii.net/adp/desl/schema/0.1/desl.schema.json`). Its `$defs` are `Specification`, `Persistence`, `Surface`, `Columns`, `Cells`, `Views`, `ValueType` and `Conversion`. It references DISL's `Language`, `Metamodel`, `Constraints`, `Operation`, `Function`, `IdStrategy`, `TypeMapEntry`, `TypeRef`, `SimpleId`, `LocalizedText` and `Doc`, and FBL's `BindingRef`. `python .github/scripts/validate-examples.py` validates every `*.des` against it and performs the checks of section 9.1.
