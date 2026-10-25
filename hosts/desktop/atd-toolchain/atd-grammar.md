---
id: desktop-atd-grammar
type: submodule-design
title: "ATD grammar and tables"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - atd
---
# ATD grammar and tables

`crates/adp-atd-grammar`, part of `desktop-atd-toolchain`.

## Responsibility

Reads the modules of a grammar in ATD grammar notation, refuses what the notation subset does not admit, and hands them to `etalii-lark` (a Rust port of Lark) in strict LALR mode with the contextual lexer. The LALR(1) tables, conflicts and terminal collisions are Lark's own verdict. Used for ATD itself and, at run time, for the grammars bindings carry.

## Rules

- Prints the normalised tables equal to what `atd-grammar.py --tables` prints from Python Lark, so `etalii.adp`'s grammar check and this crate agree.
- Optimised even in dev builds, so that the grammar builds within what LSP clients wait.
