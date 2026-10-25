---
id: desktop-conformance
type: submodule-design
title: "Conformance oracle"
status: draft
parent: desktop-oracles
depends-on:
  - desktop-fbl
  - desktop-disl
  - desktop-diagram
  - desktop-diagram-modules
  - desktop-designer-modules
references:
  - fbl
---
# Conformance oracle

`crates/adp-conformance`, part of `desktop-oracles`.

## Responsibility

Replays the FBL fixtures and examples vendored from `etalii.adp`, and the standalone host's round-trip tests, against the desktop core (spec 030 FR-034).

## Rules

- Test-only. *(Its doc comment still says it is empty; its `tests/` are real.)*
