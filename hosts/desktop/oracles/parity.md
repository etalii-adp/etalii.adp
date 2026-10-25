---
id: desktop-parity
type: submodule-design
title: "Parity oracle"
status: draft
parent: desktop-oracles
depends-on:
  - desktop-add
  - desktop-context
  - desktop-core
  - desktop-desl
  - desktop-diagram
  - desktop-disl
  - desktop-history
  - desktop-diagram-modules
  - desktop-designer-modules
references:
  - host-standalone
---
# Parity oracle

`crates/adp-parity`, part of `desktop-oracles`.

## Responsibility

Replays the edit scripts in `parity/scripts` headless in the desktop core. It compares every file the golden lists, byte for byte, with what the standalone host wrote at its reference commit, assigning the ids the standalone host generated.

## Rules

- **Goldens and scripts are never edited to make a replay pass.** A mismatch becomes an ignored test with its reason.
- Goldens are recorded offline with the .NET recorder in `parity/recorder/`, the one non-Rust artefact of the repository.
- The parity inventory (`parity/inventory.md`) is generated and checked row by row. All 70 rows are checked.
