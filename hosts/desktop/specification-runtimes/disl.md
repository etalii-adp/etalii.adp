---
id: desktop-disl
type: submodule-design
title: "DISL and DID runtime"
status: draft
parent: desktop-specification-runtimes
depends-on:
  - desktop-cel
  - desktop-fbl
  - disl
  - did
---
# DISL and DID runtime

`crates/adp-disl`, part of `desktop-specification-runtimes`.

## Responsibility

Ported from `EtAlii.Adp.Specification.Disl`. It loads a DISL specification and compiles its expressions in their CEL context. From an FBL reading it builds a diagram's elements, derives findings, gesture refusals, the palette, context menus and property rows, and interprets behaviour into model changes written through FBL.

## Rules

- A specification that fails to load still lists its tool type, with findings, and opens nothing.
- A later major version is refused with the reason, and a later minor version gives a warning.
- Its modules follow the standalone host's folders: loading, expressions, model, derivation, behaviour, bundling.
