# Contract: the flow properties in a `.cld`

What the binding `specifications/fbl/causal-loop-diagram.fbl#cld` reads and writes for FR-025 to FR-029. Line endings are the file's own, CRLF for a new file, as before.

## Statements

```text
causal-loop 1
title "Why mental health at work stays out of sight"
flow strength=4 delay=6.5 heatmap=pressure

variable selfDirection "Experienced self-direction" start=0.3
variable toughNorm "Norm: don't make a fuss" start=0.8 push=-1.5
link emotionSuppression -> exhaustion + delayed weight=1.5 "keeping up an untrue story is tiring"
```

| Statement or word | Pattern | Maps to |
|---|---|---|
| `title "<text>"` | `^\s*title\s+"(?<title>[^"\r\n]*)"\s*$` | the diagram's `title` (`typeMap` `Title` → `as: "diagram"`) |
| `flow <key>=<value> …` | `^\s*flow(?<tail>(?:\s+(?:(?:strength\|delay\|inertia\|speed\|density)=<number>\|heatmap=(?:backlog\|pressure\|throughput\|level)))*)\s*$`, where `<number>` is the number pattern below; a line with any other word is no `flow` statement, and the binding's last rule keeps and reports it whole | the diagram's `strength`, `delayLength`, `inertia`, `speed`, `density`, `heatmap` (`typeMap` `Flow` → `as: "diagram"`) |
| `strength=`, `delay=`, `inertia=`, `speed=`, `density=` | `^<key>=(?<value>[+-]?(?:[0-9]+\.?[0-9]*\|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)$`, `number: "shortest"` | the attribute of that row |
| `heatmap=` | `^heatmap=(?<value>backlog\|pressure\|throughput\|level)$` | `heatmap` |
| `start=`, `push=` in a variable's tail | the number pattern above | the variable's `start`, `push` |
| a variable's label | the first word of its tail that matches `^(?:"[^"]*"\|[^"=]+)$` | the variable's `label`, so `variable a start=0.7` reads no label |

## Writing

- A property set to a value other than its default is written. A `title` statement goes on the line after the header, and a `flow` statement goes after the `title` statement or, without one, after the header. A file with no header takes the statement before its first statement. A new key takes its place in the order `strength`, `delay`, `inertia`, `speed`, `density`, `heatmap`: an `insert-key` right after the key before it where that key is present, and otherwise a `re-emit-line`, which loses nothing since a `flow` statement holds only words the rule reads. A new variable word goes after its label and any word listed before it, before any trailing comment, always as an `insert-key`.
- A title or flow statement is added with the position `{after}` naming the entry it follows (FBL section 11.2). The entry named is the last of those at the top of the body mapped as the header or as an earlier type of the diagram, in `typeMap` order.
- An edit of a diagram attribute goes to the last statement that states it, else the last of its type.
- A property set back to its default removes its word from every statement that states it. A `flow` statement with no words left is removed with its line, and so is a `title` statement set to the empty text.
- A changed value replaces its word's value and nothing else.
- Every write is one splice per word or line, and one gesture is one step of undo.

## Fixtures (`specifications/fbl/fixtures/`)

| Fixture | Shows |
|---|---|
| `causal-loop-flow-read` | every property read, defaults where absent, the last of two `flow` statements winning per key |
| `causal-loop-flow-set`, `causal-loop-flow-set/lf` | each property set from absent, in a CRLF and an LF file |
| `causal-loop-flow-default` | each property set back to its default, words and empty statements removed |
| `causal-loop-flow-range` | values out of range kept and reported |
| `causal-loop-flow-unknown` | a `flow` line with an unknown key or an unreadable value kept byte for byte and reported whole |
| `causal-loop-flow-legacy/*` | the `.cld` conformance inputs of the definition opened and saved byte-identical |
| `causal-loop-flow-older` | the binding as it was before this feature reading a file that holds the new statements and words (T001) |

The desktop host's parity scripts replay `causal-loop-flow-set` and `causal-loop-flow-default` as edits recorded from the standalone host.
