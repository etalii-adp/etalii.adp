---
id: desktop-atd-check
type: submodule-design
title: "ATD checker"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-syntax
references:
  - atd
---
# ATD checker

`crates/adp-atd-check`, part of `desktop-atd-toolchain`.

## Responsibility

Checks a description's files and versions, names and imports, the constructs its kind admits, expression types, settings against the DISL, DESL and FBL schemas, cross-checks between model, surface and bindings, and its script. It produces findings with codes, positions, suggestions and fixes.

## Rules

- Findings carry the same codes wherever they appear: the CLI, the language server, IntelliJ and VS Code.
