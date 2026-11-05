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
- It carries DISL 0.9's macro `groupBy` (etalii.adp spec 075), with a grouping's `get` and `keys`, which the standalone host does not yet have. A grouping is kept by the identity of its list and by its key while the key read nothing but its item's stored values, and the lists `nodesOfType` and `relationsOfType` give stay one list while nothing of their type is added, removed or moved and no value changes; a kept grouping is charged what making it cost, so the memory changes time and never a budget.
