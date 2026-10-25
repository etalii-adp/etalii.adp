---
id: desktop-cel
type: submodule-design
title: "CEL engine"
status: draft
parent: desktop-specification-runtimes
references:
  - fbl
  - disl
---
# CEL engine

`crates/adp-cel`, part of `desktop-specification-runtimes`.

## Responsibility

The standalone host's CEL engine (`EtAlii.Adp.Specification.Cel`) ported to Rust. Expressions are compiled against an environment of variables, functions (with arity and cost) and macros, and evaluated under a budget. FBL's regular-expression subset lives here.

## Rules

- Anything the environment does not offer is refused at compile time, by name.
- FBL builds its contexts on the standard environment in `adp-fbl`, and DISL in `adp-disl`.
- Chosen over the planned `cel-interpreter` crate so that results match the standalone host's.
