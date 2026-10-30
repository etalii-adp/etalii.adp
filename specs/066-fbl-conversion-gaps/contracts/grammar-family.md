# Contract: what the `grammar` family gains (pull request A, and C for `items`)

FBL section 4.9 (*The `grammar` family*), 5.2, 6.1, 6.3 and 7.4, and `fbl.schema.json`. Every property is optional and new; a binding that declares none of them reads and writes as in FBL 0.9 (FR-031). Research: R5 to R9, R11, R17.

## Comments (FR-001, FR-004), section 4.9, *The tree*

No property. Section 4.9's bullet on ignored tokens is replaced by the five rules of research R5: a leading comment is owned by the entry below it; a comment after a token on its line is a trailing comment of the innermost entry that holds that token, and part of that entry's line span; a comment over several lines follows the rule of the line it opens on and extends its owner's line span to its last line; a comment inside a value's span is part of the value's text; every splice keeps a comment it does not remove, a part written where it was absent (below) being written before a trailing comment.

A grammar expresses where a comment can start by its terminals alone (ATD section 3.6): the `.owm` grammar's `URL` token starts before the `//` of `https://` and is longer than the comment from there, so the comment terminal is never a candidate at that `//`.

## Reading in part inside blocks (FR-002, FR-004), `$defs/Recover`

```json
"recover": {
  "unit": "statement",
  "sync": ["_NL"],
  "nested": { "open": "{", "close": "}" },
  "unclosed": { "BLOCK_COMMENT": "*/" }
}
```

```json
"nested": {
  "description": "FBL 0.10, section 4.9: read a body that does not parse in part inside its blocks too. open and close are the terminals (or anonymous string terminals) that open and close a block.",
  "type": "object",
  "properties": { "open": { "type": "string" }, "close": { "type": "string" } },
  "required": ["open", "close"],
  "additionalProperties": false
},
"unclosed": {
  "description": "FBL 0.10, section 4.9: ignored terminals whose token must end with the given text; one that does not is reported as fbl.unclosed-comment.",
  "type": "object",
  "additionalProperties": { "type": "string", "minLength": 1 }
}
```

The algorithm is research R6's six rules, stated in section 4.9 as a numbered continuation of *Reading in part*. Section 7.4's table gains:

| Code | Severity | When |
|---|---|---|
| `fbl.unclosed-block` | warning | *(FBL 0.10)* A block of a `grammar` body read with `recover.nested` is still open at the end of the body. Its location is the line and column of its `open` token. |
| `fbl.unmatched-close` | warning | *(FBL 0.10)* A `close` token closes no block; it is unbound. Its location is the token. |
| `fbl.unclosed-comment` | warning | *(FBL 0.10)* A token of a terminal named in `recover.unclosed` does not end with its text; it runs to the end of the body. Its location is its first line. |

Section 7.5 keeps: with `recover` a `grammar` body is never unreadable for its family.

FR-003 adds no property: section 4.9 says that only what the grammar reads as a block opens one, so a statement whose text ends in `{` and that the grammar reads as one token opens nothing, and recovery never treats that `{` as a block (a `{` inside a token is not a `close`/`open` token).

## Escapes (FR-005), `$defs/Slot` (`{node}`)

```json
"escape": {
  "description": "FBL 0.10, section 4.9: the escapes of a quoted value. Reading replaces with+quote by quote and with+with by with, and keeps with before any other character; writing escapes every quote and with character of the value.",
  "type": "object",
  "properties": {
    "with": { "type": "string", "minLength": 1, "maxLength": 1 },
    "quote": { "type": "string", "minLength": 1, "maxLength": 1 }
  },
  "required": ["with", "quote"],
  "additionalProperties": false
}
```

The escape applies to the value after `match`; the value's span is `match`'s group `value`. Section 6.3's *grammar* bullet *A changed value* becomes: written unescaped and unquoted, unless the slot has `escape`, in which case escaped as above; the family's re-read check (section 4.9, *Writing*) still applies.

## Absent parts and positional arguments (FR-006, FR-007, FR-024), `$defs/AttributeBinding/properties/create`

`create` gains a third form, admitted only in the `grammar` family:

```json
{
  "description": "FBL 0.10, grammar: how an absent part holding the value is written. emit is its text with {value}; it is written right after the last token of the first attribute of after that is present; with pad, each absent attribute of after before that one is written first, with its own emit and the empty value.",
  "type": "object",
  "properties": {
    "emit": { "type": "string" },
    "after": { "type": "array", "items": { "$ref": "#/$defs/SimpleId" }, "minItems": 1 },
    "pad": { "type": "boolean", "default": false }
  },
  "required": ["emit", "after"],
  "additionalProperties": false
}
```

A Structurizr container's arguments, as the rewritten example writes them:

```json
"attributes": {
  "name":        { "node": "name", "match": "\"?(?<value>.*?)\"?", "escape": { "with": "\\", "quote": "\"" }, "empty": "refuse" },
  "description": { "node": "description", "escape": { "with": "\\", "quote": "\"" }, "empty": "keep",
                   "create": { "emit": " \"{value}\"", "after": ["name"], "pad": true } },
  "technology":  { "node": "technology", "escape": { "with": "\\", "quote": "\"" }, "empty": "keep",
                   "create": { "emit": " \"{value}\"", "after": ["description", "name"], "pad": true } },
  "tags":        { "node": "tags", "escape": { "with": "\\", "quote": "\"" }, "empty": "keep",
                   "create": { "emit": " \"{value}\"", "after": ["technology", "description", "name"], "pad": true } }
}
```

(The `match` above is illustrative; regular expressions keep FBL section 2.5's subset, and the example's are settled when the grammar is written.)

Setting `technology` to `Java` on `container "Web" // c` is one `insert-key` at the offset after `"Web"`, of ` "" "Java"`: the line becomes `container "Web" "" "Java" // c`, and the undo removes those bytes (scenario 5). Section 4.9's sentence "has no `insert-key` or `remove-key` … (the attribute bindings' `absent` and `empty: "remove"` have no use here)" is replaced by the place rule, the padding rule, research R7's removal rule (the part's span and the whitespace before it) and the sentence that clearing the last positional part leaves the empty parts before it. FR-007 is the sentence: a set or a written part on an entry that opens a block changes neither the block's opening nor any byte of the block.

Section 6.1's table: `insert-key` "… optional segment or word (lines, blocks, bullets), *(FBL 0.10)* absent part (grammar) …", families "all"; `remove-key` likewise.

## Several nodes, segments in any order, structured items (FR-024, FR-025)

- *(PR A)* Section 5.2's `{node}` row: with a `many` attribute, every node the selector reaches, in document order; a set writes the difference as section 6.3 says for word slots, new items by `create`.
- *(PR C)* `items` on a `{node}` slot of a `many` attribute:

```json
"positions": {
  "node": "positions/position",
  "items": {
    "visibility": { "node": "visibility" },
    "maturity":   { "node": "maturity" }
  },
  "separator": ",",
  "create": { "emit": "[{visibility},{maturity}]", "after": ["positions"] }
}
```

(Settled with the grammar, research R4: `wardley-map.lark` names the two numbers of a position as the rules `visibility` and `maturity`, so selectors gain no index.)

Each item is a map of its attributes; a set of one item's value is a `replace-value` of that value's span; an added item an `insert-key` of `separator` and the item's `emit` after the last item; a removed item a `remove-key` of the item and one separator (the one before it, or for the first item the one after it).

## A block written around a first child (FR-023), `$defs/ElementRule/properties/opens`

```json
"opens": {
  "oneOf": [
    { "type": "boolean" },
    {
      "description": "FBL 0.10, grammar: the text that opens a block after the entry's last token, and the closing line, when an add puts a first child into an entry without a block. A line feed in open writes a line ending and the entry's indentation.",
      "type": "object",
      "properties": { "open": { "type": "string" }, "close": { "type": "string" } },
      "required": ["open", "close"],
      "additionalProperties": false
    }
  ]
}
```

The splices are `open-block` (the opening, after the entry's last token and before a trailing comment), `insert-entry` (the child) and `open-block` (the closing line, indented like the entry), as `structurizr-open-block` lists them. Section 6.1's `open-block` row lists `blocks, grammar`. Section 4.9 also says that a grammar whose block's opening brace may stand on the next line reads both forms in one body (FR-023), with the `.owm` grammar as its example.

## A read-only value from several places (FR-013), `$defs/AttributeBinding/properties/gather`

```json
"gather": {
  "description": "FBL 0.10, grammar: further {node} slots of the same entry whose values follow the first slot's, in document order. Only on a read-only binding of a many attribute (section 14.1).",
  "type": "array",
  "items": { "$ref": "#/$defs/Slot" },
  "minItems": 1
}
```

## Several items in one node (FR-038, pull request D, amendment of 2026-10-30), `split`

On `$defs/Slot` and `$defs/AttributeBinding`, beside `items` and `separator`:

```json
"split": {
  "description": "(FBL 0.13) grammar, on a {node} slot of a many attribute: the text at which the slot's value is cut into items; each piece without the white space at its start and end is an item with its own span, and an empty piece is no item. Not beside items, and holding neither character of the slot's escape (sections 4.9, 5.2, 6.3, 14.1).",
  "type": "string",
  "minLength": 1
}
```

`dependentRequired` gains `"split": ["node"]`; `separator` stands beside `items` or `split` (`dependentSchemas`), and `split` never beside `items`. `RuleOutsideGrammar` refuses `split` outside the `grammar` family. Section 14.1 checks what the schema cannot: `split` on a `many` attribute only, as `items`, and no character of the slot's `escape` in it.

```json
"tags": {
  "node": "tags",
  "match": "\"?(?<value>(?:[^\"\\\\]|\\\\.)*)\"?",
  "escape": { "with": "\\", "quote": "\"" },
  "split": ",",
  "gather": [ { "node": "tags_statement/tag", "match": "…", "escape": { "with": "\\", "quote": "\"" }, "split": "," } ],
  "readOnly": true
}
```

Reading (section 4.9, *Several items in one node*): the value after `match` is cut at every occurrence of `split`, from the left; each piece without the white space at its start and end (Unicode's `White_Space`) is an item, its span those bytes; an empty piece is no item; each item's escapes are resolved after the cut. `tags "Extra, More"` reads `Extra`, `More`; `" Extra ,More,, "` the same two; `""` none.

Writing (section 6.3, *An item of a slot with `split`*), the difference by the longest common subsequence, as a `many` slot:

| Change | Splice | Example |
|---|---|---|
| A changed item | `replace-value` of the item's span, escaped by the slot's `escape` | `"One ,Two,  Three"` with `2` for `Two`: `"One ,2,  Three"` |
| A new item | `insert-key` of `separator` (`", "` by default) and the value, right after the last item the slot reaches | `"Extra, More"` given `Most`: `"Extra, More, Most"` |
| New items where no node holds an item | `replace-value` of the last node's value span, the items joined by `separator` | `""` given `Extra`, `More`: `"Extra, More"` |
| New items where the slot reaches no node | `insert-key` of the slot's `create`, its `{value}` the items joined by `separator` | `epsilon` given `X`, `Y`: `epsilon "X, Y"` |
| A run of removed items after a kept item of the same node | `remove-key` from the end of that kept item to the end of the run's last item | `"One ,Two,  Three"` without `Two`: `"One,  Three"` |
| A run of removed items at the start of a node | `remove-key` from the start of the run's first item to the start of the next kept item | `"Extra, More"` without `Extra`: `"More"` |
| Every item of a node removed | `remove-key` of the node and the whitespace before it, as for a node of a `many` slot without `split` | `alpha "Extra, More"` without both: `alpha` |

Every byte of an item the set keeps, and between two items it keeps, stays, empty pieces included. Undo is the inverse splices. A gathered attribute stays read-only (section 3.3), so `structurizr.fbl`'s tags are never written; `grammar-split-slot` shows the writing on a binding of its own whose tags are writable.

## Section 15.1 (FR-037)

The *Host — full* row's sentence on the family becomes: no host is required to support the `grammar` family, except that a host which reads or writes Structurizr DSL workspaces or `.owm` maps through their declared bindings (the six C4 tool types and the Wardley map) **MUST** support it with every construct of this version, say so, and pass its fixtures byte for byte with the same splices as every other host. The section's last paragraph adds: a host that supports the family only at 0.9 treats a binding that uses a 0.10 construct of the family as one whose family it does not support.
