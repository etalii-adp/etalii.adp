# Data Model: FBL 0.10, What the C4, Databricks and Wardley Map Conversions Wait On

Every construct the feature adds to FBL, by the `$defs` entry of `fbl.schema.json` it lands on, with the requirement it answers, the pull request that brings it (R1: A is User Story 1 and the shared constructs, B User Story 2, C User Story 3) and its default, which is FBL 0.9's behaviour (FR-031). Shapes and normative wording are in [contracts/](contracts/).

## Constructs by schema entry

### `$defs/Body` and `$defs/Recover` *(grammar)*

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `recover.nested` | `{open, close}`, each a terminal name or the text of an anonymous string terminal | Recovery inside the blocks those tokens open and close (R6). Requires `recover.unit` and `recover.sync`. | FR-002 | A |
| `recover.unclosed` | map terminal → string | An ignored terminal's token that does not end with the string is reported as `fbl.unclosed-comment` (R6 rule 5). | FR-004 | A |

### `$defs/Binding`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `blocks` | BlockRule[] | Now admitted in `grammar` as well as `blocks` (R10). | FR-008 | A |

### `$defs/BlockRule`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `at` | Selector | `grammar`: the block's entries; exactly one of `at` and `line`, `at` only in `grammar`. | FR-008 | A |
| `view` | group name (`blocks`) or Slot (`grammar`) | Names the view; in `grammar` a `{node}` or `{value}` slot (R10). | FR-008 | A |
| `origins` | origin[] | The readings the block is a view for; a subset of `claims.origins` (R12). | FR-008, FR-014 | A |
| `insert` | Insert | An entry that produces no element can be added (R10). `grammar` only. | FR-012 | A |

### `$defs/ElementRule` and `$defs/RelationRule`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `selectedView` | bool | Read only inside the selected view's entry (R10). Requires a BlockRule with `view`. | FR-008 | A |
| `opens` | bool (`blocks`) or `{open, close}` (`grammar`) | In `grammar`, the text of a block written around a first child (R9). | FR-023 | A |
| `origins` | origin[] | Read only for readings of those origins (R12). | FR-014 | B |

### `$defs/IdBinding` (`sidecar`)

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `sidecar.kind` | Name | The key space of the rule's identities; entries keyed `<kind>:<key>` (R16). | FR-027 | C |
| `sidecar.ordinal` | string holding `{n}` | Appended to the key of each later holder of one key (R16). | FR-028 | C |

### `$defs/Slot` (`{node}`, grammar)

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `escape` | `{with, quote}`, one character each | Read and write escapes inside the value (R8). | FR-005 | A |
| `items` | map attribute → `{node}` Slot, and `separator` | A list of structured values from the repeated nodes the selector reaches (R17). | FR-025 | C |

### `$defs/AttributeBinding`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `create` | `{emit, after, pad}` in `grammar` | An absent part written and removed (R7); `after` names attributes of the rule, nearest first. | FR-006, FR-024 | A |
| `gather` | `{node}` Slot[] | Further places of a read-only `many` attribute, in document order (R11). | FR-013 | A |
| `refusals` | `{empty, absent}`, each LocalizedText | The sentence of each refusal (R14). | FR-019 | B |
| `secondary` | Slot | Read only when the first slot is absent; removed when the attribute is written (R14). | FR-021 | B |

A `{node}` slot of a `many` attribute reads every node it reaches (R17; FR-024, PR A).

`origins` is one property with one meaning on every rule. Whichever of PR A (on BlockRule) and PR B (on element and relation rules) merges first defines it in section 5.1; the other adds its rules to the definition.

### `$defs/Insert`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `refusals` | `{when, container}`, each LocalizedText | The sentence when `when` is false, or when the container is missing and there is no `create` (R14). | FR-019 | B |

### `$defs/RegistrationSettings`

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| `resource.byOrigin` | map origin → `{capture}` or `null` | The capture per reading; `null` selects none (R12). Exclusive with `resource.capture`. | FR-016 | B |
| `legacyIdentities` | string | The file is the array `[{id, kind, key}]` (R16); same property, described anew. | FR-026 | C |

### Templates, findings and the splice catalogue

| What | Change | FR | PR |
|---|---|---|---|
| Section 13 | the placeholder `{key:lower}` | FR-022 | B |
| Section 7.4 | `fbl.unclosed-block`, `fbl.unmatched-close`, `fbl.unclosed-comment` (warnings) | FR-002, FR-004 | A |
| Section 6.1 | `insert-key`, `remove-key` and `open-block` list `grammar` | FR-006, FR-023 | A |
| `$defs/Document/properties/fbl` | `"0.10"` (and `"0.11"`, `"0.12"` with PRs B and C) | FR-030 | A, B, C |

### `$defs/Fixture` (section 15.3)

| Property | Type | Rule | FR | PR |
|---|---|---|---|---|
| step `expectFiles` | map path → string | The bytes after the step of each file beside the input that its splices name in `file`; replayed with undo and redo. | FR-010, FR-026, FR-029, FR-032 | A |
| `template` | `{name, origin}` | The input is the binding's template for that file name and reading, placeholders replaced; the validator compares. | FR-022, FR-032 | B |

## Validation (section 14.1, step 6)

| Check | Where | PR |
|---|---|---|
| `at`, `escape`, `items`, `gather`, `create.after`/`pad`, `opens` as an object, `recover.nested`/`unclosed` only in a `grammar` binding | schema, by `if`/`then` on `body.family` as 0.9 does for `{node}` | A, C |
| BlockRule has exactly one of `at` and `line` | schema | A |
| `recover.nested.open`/`close` and every key of `recover.unclosed` name a terminal of the grammar, or the text of an anonymous string terminal; `unclosed`'s terminals are ignored | step 6 (`atd-grammar.py --bindings`) | A |
| `selectedView` only in a binding with a BlockRule that has `view` | step 6 | A |
| `create.after` names attributes of the same rule that have a `create` or a present-by-grammar slot | step 6 | A |
| `gather` only on a read-only binding of a `many` attribute | step 6 | A |
| `origins` of a rule, a BlockRule and `resource.byOrigin` are origins of `claims.origins` | step 6 | A, B |
| `secondary` not beside `override` on one attribute | schema (`not` over both) | B |
| `resource.capture` and `resource.byOrigin` not both | schema | B |
| `ordinal` holds `{n}` once; `kind` is a Name | schema (pattern) | C |
| `items` only on a `many` attribute's `{node}` slot | step 6 | C |

Each check the schema cannot make has a refused document under `specifications/fbl/refused/`.

## State

### Reading a `grammar` body with `recover.nested` (R6)

| Situation | Read as | Finding |
|---|---|---|
| A statement in a block does not parse | skipped from the block's last boundary to the end of the next `sync` token, or to before the block's `close` | `fbl.unparsed-text` |
| The body ends inside blocks | each open block ends at the end of the body | `fbl.unclosed-block` per block, at its `open` |
| A `close` that closes no block | skipped alone, closes nothing | `fbl.unmatched-close` |
| A token of an `unclosed` terminal without its end | trivia, to the end of the body | `fbl.unclosed-comment` |
| The body parses as a whole | as without `nested` | none |

An add into a block reported `fbl.unclosed-block` is refused.

### An absent part (R7)

| Edit | Splices |
|---|---|
| set, part present | `replace-value` of its span |
| set, part absent | `insert-key` of `create.emit` after the last token of the first present attribute of `after`; with `pad`, preceded by the `emit` of each absent attribute between, with the empty value |
| set to empty, `empty: "remove"` | `remove-key` of the part and the whitespace before it |
| set to empty, `empty: "keep"` | `replace-value` with the empty value |
| clear the last positional part | its `remove-key` only; the empty parts before it stay |
| undo of any of these | the exact inverse |

### Identity entries (R16)

| Event | The entry |
|---|---|
| first read of an element with no entry | an id is made; it is written with the next write of the body, outside the history |
| a later holder of a key | keyed `<key>` + `ordinal` with its `{n}`; stored with the next write |
| a change of an attribute the key is computed from | moved to the new key in the same edit; an undo moves it back |
| an entry whose kind no rule declares (legacy file) | kept as written, reported as `fbl.stale-view-data` |
| removal of the element | removed at the next write, as section 8.5 prunes |

### The open body with several origins (R12)

One open body per path and binding: one lossless reading, one history, one model per origin. A registration's resource selection is a view of its origin's model. An edit is planned once against the body and shown in every reading of every origin.
