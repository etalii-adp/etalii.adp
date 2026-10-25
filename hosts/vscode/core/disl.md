---
id: vscode-disl
type: submodule-design
title: "DISL interpreter"
status: draft
parent: vscode-core
depends-on:
  - disl
  - host-notion
---
# DISL interpreter

`src/core/disl`, part of `vscode-core`.

## Responsibility

A DISL interpreter (conformance class `standard`) covering metamodel, expressions, coordinates, notation, layout and force layout, constraints, behaviour, toolbox, forms, persistence and viewpoints. It was copied from the Notion host and is now owned here.

## Rules

- `support.ts` lists the supported features and must match `docs/disl-support.md`. A test holds the record to the code.
- Unsupported constructs fall back to the nearest supported one, with a finding. A newer minor version opens with a warning, and a different major version is not loaded.
