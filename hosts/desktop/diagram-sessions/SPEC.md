---
id: desktop-diagram-sessions
type: module-design
title: Diagram sessions and drawing
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
  - desktop-workspace
---

# Diagram sessions and drawing

An open diagram of a DISL and FBL tool type, its edits as commands on the project's history, and the recording painter that turns its scene into the drawing that conformance fixtures and `atd validate` compare. Designer sessions are not here: the DESL runtime's windowed table session serves them.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-diagram` | `crates/adp-diagram` | CEL, context, core, DISL, documents, FBL, history |
| `desktop-drawing` | `crates/adp-drawing` | diagram, DISL, scene |

## Boundary

- **No toolkit.** Drawing records the scene, not pixels, so hosts without a window (`atd`, the language server, validation) record what the canvas draws.
- **Generic first.** A module that needs more than the generic path declares that it opens its documents itself.
