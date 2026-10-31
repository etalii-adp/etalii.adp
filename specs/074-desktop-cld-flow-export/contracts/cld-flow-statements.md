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
| `flow <key>=<value> …` | `^\s*flow(?<tail>(?:\s+[a-z]+=[^\s"]+)*)\s*$` | the diagram's `strength`, `delayLength`, `inertia`, `speed`, `density`, `heatmap` (`typeMap` `Flow` → `as: "diagram"`) |
| `strength=`, `delay=`, `inertia=`, `speed=`, `density=` | `^<key>=(?<value>[+-]?(?:[0-9]+\.?[0-9]*\|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)$`, `number: "shortest"` | the attribute of that row |
| `heatmap=` | `^heatmap=(?<value>backlog\|pressure\|throughput\|level)$` | `heatmap` |
| `start=`, `push=` in a variable's tail | the number pattern above | the variable's `start`, `push` |

## Writing

- A property set to a value other than its default is written. A `title` statement goes on the line after the header, and a `flow` statement goes after the `title` statement or, without one, after the header. A new key goes at the end of the `flow` tail, and a new variable word goes at the end of the variable's line, before any trailing comment.
- A property set back to its default removes its word. A `flow` statement with no words left is removed with its line, and so is a `title` statement set to the empty text.
- A changed value replaces its word's value and nothing else.
- Every write is one splice per word or line, and one gesture is one step of undo.

## Fixtures (`specifications/fbl/fixtures/`)

| Fixture | Shows |
|---|---|
| `causal-loop-flow-read` | every property read, defaults where absent, the last of two `flow` statements winning per key |
| `causal-loop-flow-set` | each property set from absent, in a CRLF and an LF file |
| `causal-loop-flow-default` | each property set back to its default, words and empty statements removed |
| `causal-loop-flow-range` | values out of range kept and reported |
| `causal-loop-flow-unknown` | an unknown `flow` key kept byte for byte and reported |
| `causal-loop-flow-legacy` | every `.cld` example of the definition opened and saved byte-identical |

The desktop host's parity scripts replay `causal-loop-flow-set` and `causal-loop-flow-default` as edits recorded from the standalone host.
