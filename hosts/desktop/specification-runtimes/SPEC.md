---
id: desktop-specification-runtimes
type: module-design
title: Specification runtimes
status: draft
parent: host-desktop
---

# Specification runtimes

The generic interpreters of the specification languages: CEL, FBL, DISL with DID, DESL with DED, and the scene that turns a DISL notation into drawing primitives. They are what lets the host run a tool type from its vendored definitions instead of from code (approach 2 of `architecture` *Tool-type approaches*).

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-cel` | `crates/adp-cel` | — |
| `desktop-fbl` | `crates/adp-fbl` | CEL |
| `desktop-disl` | `crates/adp-disl` | CEL, FBL |
| `desktop-desl` | `crates/adp-desl` | CEL, FBL |
| `desktop-scene` | `crates/adp-scene` | CEL, FBL, DISL |

## Boundary

- **Depends only on the languages,** never on the workspace, a session, a module or the shell, so every runtime can be tested headless against the vendored examples.
- **Results match the standalone host's.** Each runtime is a port of the standalone host's interpreter, and the same edit writes the same bytes (checked by `desktop-oracles`).
- **Host-neutral.** No toolkit: the scene hands the shell primitives and asks it for text metrics.
