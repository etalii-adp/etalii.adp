---
id: desktop-atd-syntax
type: submodule-design
title: "ATD parser and lossless tree"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-grammar
references:
  - atd
---
# ATD parser and lossless tree

`crates/adp-atd-syntax`, part of `desktop-atd-toolchain`.

## Responsibility

The parser of ATD: the declared version, the contextual lexer, the LALR(1) tables built at build time, a lossless tree whose tokens and trivia are every byte of the file, recovery at the next construct, and lowering to the abstract tree of `atd.schema.json#/$defs/Tree`.

## Rules

- Every byte of a file is in the tree, so formatting and machine edits never lose text.
