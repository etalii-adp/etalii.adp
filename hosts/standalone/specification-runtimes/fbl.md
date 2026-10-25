---
id: standalone-fbl
type: submodule-design
title: "FBL runtime"
status: draft
parent: standalone-specification-runtimes
depends-on:
  - standalone-primitives
  - standalone-cel
  - standalone-spec-json
  - fbl
---
# FBL runtime

`src/backend/EtAlii.Adp.Specification.Fbl`, part of `standalone-specification-runtimes`.

## Responsibility

Reads and writes bodies through FBL bindings: documents, rules, routing, registration (`.adp`), planning, splices, history and persistence plugins. With a binding, a module writes no parser, document or writer of its own; edits become splices.

## Rules

- Bytes outside an edit stay as they were. The `.adp` registration holds authored layout for formats without a place for it, never the body.
- The IntelliJ and VS Code hosts ported this library with byte parity (`hosts`). A divergence goes to `specifications/fbl`, never into a host.
