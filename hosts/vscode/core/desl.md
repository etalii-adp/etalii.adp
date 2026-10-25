---
id: vscode-desl
type: submodule-design
title: "DESL support"
status: draft
parent: vscode-core
depends-on:
  - vscode-disl
  - desl
  - ded
---
# DESL support

`src/core/desl`, part of `vscode-core`.

## Responsibility

What DESL 0.1 adds on top of DISL: the specification, the table surface and operations.

## Rules

- Table surface only. The two-document steps of DESL §5.4 are not made.
