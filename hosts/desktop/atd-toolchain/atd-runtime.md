---
id: desktop-atd-runtime
type: submodule-design
title: "ATD runtime"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-check
  - desktop-atd-script
  - desktop-cel
  - desktop-diagram
  - desktop-disl
  - desktop-fbl
  - desktop-layout
references:
  - atd
---
# ATD runtime

`crates/adp-atd-runtime`, part of `desktop-atd-toolchain`.

## Responsibility

The runtime of a tool description: the capability registry, and the lowering of a checked description onto the engines that drive today's tools (DISL, FBL, CEL, layout).

## Rules

- Phase 1 of spec 035: it exercises descriptions to validate and debug them. No person's tool is run from `.atd`.
- The capability registry holds `two_sided_tree` so far.
