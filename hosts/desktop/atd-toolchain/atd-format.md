---
id: desktop-atd-format
type: submodule-design
title: "ATD formatter"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-syntax
references:
  - atd
---
# ATD formatter

`crates/adp-atd-format`, part of `desktop-atd-toolchain`.

## Responsibility

The canonical layout of ATD (ATD §16): two spaces per brace level, one member per line, a settings block on one line when it fits in 120 columns and holds no comment, every comment kept with its construct, and blank lines between members kept as one.

## Rules

- Machine edits are splices, as FBL's are.
