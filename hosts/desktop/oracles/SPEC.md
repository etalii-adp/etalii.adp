---
id: desktop-oracles
type: module-design
title: Oracles
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
  - desktop-workspace
  - desktop-diagram-sessions
  - desktop-tool-modules
  - desktop-application
---

# Oracles

The test-only crates that prove the host writes what the standalone host writes: conformance replays the vendored FBL fixtures and round-trip tests, and parity replays edit scripts against goldens recorded from the standalone host.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-conformance` | `crates/adp-conformance` | FBL, DISL, diagram, diagram and designer modules |
| `desktop-parity` | `crates/adp-parity` | add, context, core, DESL, diagram, DISL, history, diagram and designer modules |

## Boundary

- **Test-only.** Nothing in the product depends on an oracle.
- **Goldens and scripts are never edited to make a replay pass.** A mismatch becomes an ignored test with its reason.
