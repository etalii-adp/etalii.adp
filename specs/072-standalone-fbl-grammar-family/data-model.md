# Data model: The FBL library reads the grammar family

The types the family adds to `EtAlii.Adp.Specification.Fbl`, and where the existing ones grow. Every type is `internal` unless named public; the test project sees the internals already (`InternalsVisibleTo`).

## Loading

| Type | Where | Fields | Rules |
|---|---|---|---|
| `Family.Grammar` (public enum member) | `Documents/FblModelTypes.cs` | | `"family": "grammar"` in a body or a file rule |
| `GrammarBody` | `Documents/FblModelTypes.cs`, on `BodySettings.Grammar` | `Text` (the grammar's text), `File` (the `.lark` name, or null), `Start` (default `start`), `Recover` (`Unit`, `Sync`), `Built` (the `GrammarBuild`, set once the binding loads) | present exactly when the family is `grammar` (Requirement 2.6); `Recover.Unit` a rule of the grammar and the start rule `unit*`; each `Sync` entry a terminal name or the text of an anonymous string terminal |
| `GrammarBuild` | `Files/Grammar/GrammarBuild.cs` | the `EtAlii.Lark` parser, its terminal names, the ignored terminals, the anonymous string terminals by text, the folder imports were read from | built once per loaded binding; at most 256 KiB of grammar text with its imports, 4,096 rules, 32,768 states (research R7) |
| `SlotKind.Node(string Selector)` (public) | `Documents/FblModelTypes.cs` | the relative selector, `.` for the entry | only in the `grammar` family; segments name a rule, alias or terminal of the grammar, `*`, `**` or `.` (Requirement 2.6) |
| `Slot.Match` | `Slot` | a regular expression with a group `value` | refused without the named group `value` |
| `Slot.Escape` | `Slot`, as `NodeEscape(char With, char Quote)` | one character each | `{node}` slots only |
| `Slot.Split`, `AttributeBinding.Separator` | `Slot`, `AttributeBinding` | a text of one character or more; the text written between two items, `", "` when absent | `split` never beside `items`, never in another family, holding neither escape character (Requirement 11.1) |
| `CreateChild.After` | `Documents/FblModelTypes.cs` | the attributes, nearest first, whose parts precede an absent part | each an attribute of the same rule |

## Reading

| Type | Where | Fields | Rules |
|---|---|---|---|
| `GrammarNode : Entry` | `Files/Grammar/GrammarNode.cs` | `Name` (rule, alias or terminal), `IsToken`, `Own` (byte span; null for a node that matched no token), `Children`, `Parent`, `Empty` (an optional part that matched nothing) | a node's own span is the container span, filtered tokens included; the root's is the whole body (FBL section 4.9) |
| `GrammarTrivia` | `Files/Grammar/GrammarParser.cs` | the ignored tokens by byte offset, each with whether it is a comment | a comment holds a character other than whitespace |
| `GrammarReading` | `Files/Grammar/GrammarParser.cs` | the root, the trivia, the skipped spans and where reading stopped in each | with `recover`, the root's children are the units read |
| `GrammarSelector` | `Files/Grammar/GrammarSelector.cs` | segments: a name, `*`, `**`, `name[path='v']`, `.` | absolute from the root, a slot's relative to its entry |
| `SplitItem` | `Files/Grammar/SplitItems.cs` | the item's text before escapes, its value after them, its byte span, the node it is in | an empty piece is no item; white space is Unicode's `White_Space` |

CEL sees a `GrammarNode` as `{type, text, children}`, a token's `children` empty and an empty optional part `null` (FBL section 4.1.4).

## Writing

No new type: the family plans the engine's `Splice`s (`replace-value`, `insert-entry`, `remove-entry`, `rewrite-reference`, and for Requirement 11 `insert-key` and `remove-key`), and the history's undo and redo are the engine's.

## State

A loaded binding holds its built grammar for its lifetime. A read builds a fresh tree; nothing of a read outlives it but the `FblModel` the engine already returns.
