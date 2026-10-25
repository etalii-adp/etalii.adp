---
id: desktop-fbl
type: submodule-design
title: "FBL runtime"
status: draft
parent: desktop-specification-runtimes
depends-on:
  - desktop-cel
  - fbl
---
# FBL runtime

`crates/adp-fbl`, part of `desktop-specification-runtimes`.

## Responsibility

FBL ported from the standalone host's `EtAlii.Adp.Specification.Fbl`. It covers:

- **Bindings and families:** bindings, and lossless families (yaml, json, xml, lines, blocks).
- **Rules engine:** ids, references and containment.
- **Planning and history:** the planner that turns a model change into one edit's splices, and the history that applies, undoes and redoes them.
- **Registration and routing:** registration files written by the same splices, routing and templates.
- **Plugins and legacy:** persistence plugins for bodies FBL cannot declare (file bodies and folder subjects), and the legacy sidecars.

## Rules

- Reading never fails on content, and bytes outside an edit stay as they were.
- The same edit writes identical bytes to the standalone host (spec 030 FR-032), checked by `desktop-conformance` and `desktop-parity`.
