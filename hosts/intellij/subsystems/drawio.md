---
id: intellij-drawio
type: submodule-design
title: "draw.io diagram"
status: draft
parent: host-intellij
depends-on:
  - intellij-core
---
# draw.io diagram

`drawio/`, part of `host-intellij`.

## Responsibility

Uncompressed draw.io files (`jgraph/drawio`): definition, mapping, editor provider, file type and style parsing.

## Rules

- Depends only on `core`.
- A compressed file falls back to the text view with an explanation, never a silent rewrite.
- Anything not shown (other pages, groups, unknown shapes) is preserved.
