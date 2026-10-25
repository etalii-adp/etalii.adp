---
id: intellij-freemind
type: submodule-design
title: "FreeMind mind map"
status: draft
parent: host-intellij
depends-on:
  - intellij-core
---
# FreeMind mind map

`freemind/`, part of `host-intellij`.

## Responsibility

The FreeMind `.mm` mind map (`freeplane/mindmap`): a parser, range-exact edits, a definition and mapping, a `MindMapFileEditor` with its own model, actions (add, indent, rename, fold), and New > FreeMind Mind Map.

## Rules

- Depends only on `core`, never on another format module.
- `.mm` is also Objective-C++, so files are claimed by content sniffing (`FreeMindSniffer`).
- Byte-identical round trip of real published files. Test data carries its licence. The FreeMind 1.0.1 compatibility test is opt-in (`FREEMIND_HOME`), because FreeMind is GPL and is never a build dependency.
