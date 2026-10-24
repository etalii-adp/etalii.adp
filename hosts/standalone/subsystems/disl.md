---
id: standalone-disl
type: submodule-design
title: "DISL runtime"
status: draft
parent: host-standalone
depends-on:
  - standalone-cel
  - standalone-fbl
  - standalone-spec-json
  - disl
---
# DISL runtime

`src/backend/EtAlii.Adp.Specification.Disl`, part of `host-standalone`.

## Responsibility

Loads DISL specifications and the bundled definitions, and builds a diagram's model from an FBL reading. From that model it derives the toolbox, context menus, forms and property rows, findings, gesture refusals and canvas chrome. It resolves toolbox drops by their drop targets, runs operations, hooks, deletion policy and retyping, and gives the FBL library the attribute types of a binding.

## Rules

- Bundled definitions are byte-for-byte copies with `provenance.json`, never edited here.
- What a definition cannot express stays in its module as residue, listed in the definition's companion document, and the gap is reported to `etalii.adp`.
