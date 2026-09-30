# Data Model: Format Binding

The entities FBL defines, with the fields `fbl.schema.json` gives them. Words in *italics* are defined by DISL 0.2 (feature 004) and only referenced here.

## FBL document

The file a tool engineer writes, `*.fbl`, JSON.

| Field | Type | Rule |
|---|---|---|
| `$schema` | URI | optional; `https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Document` |
| `fbl` | version string | required, `"0.1"` |
| `doc` | DISL Doc | optional |
| `bindings` | map name → Binding | required, at least one; a binding is referenced as `<document uri>#<name>` |

## Binding

| Field | Type | Rule |
|---|---|---|
| `title`, `doc` | Localized text, Doc | as in DISL |
| `claims` | Claims | which files the binding takes (routing) |
| `body` | Body | one file of a family, or a folder |
| `reader` | `"declared"` or PluginReader | `declared` requires `body.family` and at least one rule; a plugin reader requires no rules |
| `text` | TextDefaults | used only where the file gives no evidence (R7) |
| `header` | Header | optional version or identity check at the top of the file (`timeline: 1`, `causal-loop 1`) |
| `elements` | ElementRule[] | node types |
| `relations` | RelationRule[] | relation types |
| `registration` | RegistrationSettings | extra headers, legacy sidecars, whether a bare file may be positioned |
| `template` | Template | the bytes of a new body |
| `readOnly` | bool or reason | the whole body is never written (FR-014) |

Validation: rule names are unique within a binding; every rule a rule refers to exists; every `type` names a type in the language that uses the binding (checked when a DISL specification references the binding).

## Claims

| Field | Type | Rule |
|---|---|---|
| `extensions` | string[] | lowercase, with the dot |
| `names` | glob[] | file names claimed regardless of extension (`databricks.yml`, `Chart.yaml`) |
| `shared` | bool | the extension belongs to many formats; then `marker` or `registrationOnly` is required (FR-071) |
| `marker` | Marker | `{rootKey}`, `{firstLine}` (prefix) or `{pattern, lines}` (regular expression over the first `lines` lines, default 20) |
| `suggest` | `{contains: string[]}` | substrings that make the host propose this reading |
| `registrationOnly` | bool | never claim a bare file; open only through a registration |
| `origins` | string[] | extra first-line values of a registration that name this binding's language (legacy media types) |

## Body

| Field | Type | Rule |
|---|---|---|
| `kind` | `"file"` or `"folder"` | |
| `family` | `"yaml"`, `"json"`, `"xml"`, `"lines"`, `"blocks"` | required for a declared file body; a declared folder names families per file rule |
| `alsoRead` | family[] | other families accepted for the same body (databricks pipeline: `json` read as settings) |
| `recognise` | `{all, any, none}` of globs | folder only (FR-060) |
| `files` | FileRule[] | folder only: `{glob, family, rules}` or handed to the plugin reader |
| `ignore` | glob[] | folder only |
| `settle` | int ms | folder only, default 400 |

## ElementRule and RelationRule

| Field | Type | Rule |
|---|---|---|
| `name` | identifier | unique; referenced by `parent`, `cascade`, `reference.to` |
| `type` | DISL TypeRef | the node or relation type produced |
| `at` | Selector | tree and xml families: where entries are; `lines`/`blocks`: omitted |
| `line` | regular expression | `lines`/`blocks`: a statement; named groups are the value spans (R6) |
| `within` | rule name[] | `blocks`: the rules whose block encloses the statement |
| `opens` | bool | `blocks`: the statement may open a `{ … }` block |
| `when` | CEL | condition over `entry` (and `path` captures) |
| `id` | *IdBinding* | the *id strategy* and its inputs; an *unstable id* is never stored or positioned |
| `parent` | `{rules, slot}` | containment: the nearest enclosing entry matched by one of `rules` is the parent, in DISL slot `slot` |
| `attributes` | map attribute → AttributeBinding | |
| `source`, `target` | Slot | relations only: where the ends' references are; `{parent: attr}` takes the end from the enclosing entry |
| `insert` | Insert | how a new entry is written; absent: adding is refused with a reason |
| `remove` | `{cascade: rule[], container: "keep"/"remove-when-empty"}` | absent: removing is refused with a reason |
| `undo` | `"inverse"` (default) or `"snapshot"` | R8 |
| `readOnly` | reason | the rule is read, never written |

## Slot and AttributeBinding

A slot is exactly one place in the file (R5): `{key}` (tree), `{attribute}` (xml), `{text}` (xml child text, with `child` selector), `{group}` (lines, blocks), `{parent: attr}`, or `{value: CEL}` (read-only). An AttributeBinding is a slot plus:

| Field | Rule |
|---|---|
| `empty` | `"remove"` (remove the key), `"keep"` (write an empty value), `"refuse"` |
| `number` | `{decimals}` or `"shortest"` (default) |
| `time` | `"keep-precision"`: a written time keeps the precision of the value it replaces |
| `style` | preferred scalar style for new values: `plain`, `double`, `single`, `literal` (`\|-` for multi-line), `flow` (sequences on one line) |
| `reference` | `{to: rule[], by: attribute}`: the value names another entry; a rename of that entry rewrites it (FR-013, FR-024) |
| `map` | enum wire value → model value (`ui-element` → `UiElement`), both ways |

## Insert

| Field | Rule |
|---|---|
| `place` | `"after-last"` (after the last entry of this rule), `"end"` (end of container), `"start"`, `"before": key`, `"last-child"`, `"after-selected"` |
| `container` | Selector of the container; created on demand by `create` |
| `create` | `{at: "end-of-document" / {before: key} / {under: selector}, text}`: where a missing container is created; undone by removing it |
| `keys` | key order of a new entry (tree), or attribute order (xml) |
| `emit` | text template for `lines`, `blocks` and `xml`: `{attr}` placeholders, `[ … ]` optional segments written only when their placeholders are non-empty |
| `skeleton` | fixed text inserted with the entry (per-type task skeletons) |

## Splice operation

Every write is one of eleven named operations; one edit is one or more (FR-022, FR-024). Each has an exact inverse.

| Operation | Effect |
|---|---|
| `replace-value` | replace a value's span, keeping its quoting or scalar style when the new value fits it |
| `insert-key` | add a key (or XML attribute, or regex group's optional segment) to an existing entry, at the position `insert.keys` gives |
| `remove-key` | remove a key with its own line(s) and comments, or an attribute |
| `insert-entry` | add an entry at `insert.place`, formatted by the inference rules, with separators (JSON commas, Turtle `;`) |
| `remove-entry` | remove an entry with the comments it owns and its separators |
| `ensure-container` | create a missing container at `insert.create.at` |
| `remove-container` | remove a container that became empty, when the binding says so |
| `rewrite-reference` | replace one reference's span on rename; a rename is one `replace-value` plus one `rewrite-reference` per reference |
| `re-emit-line` | `lines`/`blocks`: rewrite a whole statement from `emit` when a changed value has no span in it |
| `open-block` | `blocks`: give a one-line statement a `{ … }` block to hold a first child; undone by `close-block` |
| `self-close` | `xml`: collapse an element emptied of children to `<x …/>`, or expand it back |

## Registration

The `.adp` file (R12). Parsed form, as `$defs/Registration`:

| Field | Line form | Rule |
|---|---|---|
| `origin` | line 1 | the language id, or one of the binding's `origins` |
| `body` | `body: <path>` | relative to the registration; absent: the sibling with the same base name, or the folder the registration is in |
| `view` | `view: <key>` | which view of a shared body (C4) |
| `resource` | `resource: <key>` | which keyed entry of a multi-resource body (databricks) |
| `headers` | other `key: value` lines | only those the binding declares in `registration.headers`; others are kept and reported |
| `layout` | `layout:` then `  <id>: <x> <y>` | only elements the user placed; sorted by id; removed when empty |

State transitions of a stored position: absent → stored (first drag, `insert-entry` in the layout block, `ensure-container` for `layout:` when needed) → changed (`replace-value`) → dropped (undo of the first drag, or its element no longer exists at the next save: reported, then `remove-entry`).

## Reading and open body

A reading is one language opened on one body through one binding. The host keeps one **open body** per (canonical body path, binding name) with: the bytes, the lossless reading, the model, the findings, and one history of edits. Each edit holds its splices with the bytes they replaced and the digest of the document it produced (R8).

## Fixture

`fixtures/<name>/fixture.json`, as `$defs/Fixture`:

| Field | Rule |
|---|---|
| `binding` | reference to the binding under test |
| `input` | file name of the input body in the same folder |
| `read` | optional expected elements (`id`, `type`) and findings (`rule`, `line`) |
| `steps[]` | `{edit, splices[], expect, undo}`: the model change; the splices it must produce as `{operation, start, end, text}` in UTF-8 byte offsets of the document before the step; the document after it (inline or a file); `undo: true` if the step is an undo of the previous edit |

Consistency (checked in CI): applying a step's splices to the document before it yields `expect`; applying their inverses yields the document before it.
