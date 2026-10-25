---
id: notion-disl
type: submodule-design
title: "DISL interpreter"
status: draft
parent: host-notion
depends-on:
  - notion-fbl
  - disl
---
# DISL interpreter

`src/disl/`, part of `host-notion`.

## Responsibility

A DISL interpreter sized to this host, one module per specification section: metamodel, notation, coordinates, viewpoints, layout, constraints, behaviour, forms, toolbox, expressions (CEL through cel-js plus the DISL helpers), persistence and specification.

## Rules

- Supported features are listed in `support.ts` (conformance `standard`), and anything unsupported is a finding.
- Not supported: most built-in `std.*` findings, SVG and plugin shapes, edge labels, several viewpoints, layouts other than rows, imports, plugins, extensions, quick fixes, clipboard, retyping, simulations and inline bindings.
- Four interim rules cover behaviour the specification leaves unstated (etalii.adp issue 93). None of them names a tool type.
