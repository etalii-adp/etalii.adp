---
id: desktop-foundation
type: module-design
title: Foundation
status: draft
parent: host-desktop
---

# Foundation

The core's base layer: commands with undo, the context data the shell renders, open documents, the editors' text model, geometry and layout modes, the theme values, and the one C library. Every other layer builds on it, and it builds on nothing else in the host.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-history` | `crates/adp-history` | — |
| `desktop-context` | `crates/adp-context` | — |
| `desktop-documents` | `crates/adp-documents` | context |
| `desktop-text` | `crates/adp-text` | — |
| `desktop-layout` | `crates/adp-layout` | — |
| `desktop-theme` | `crates/adp-theme` | — |
| `desktop-libxml2` | `crates/adp-libxml2` | — |

## Boundary

- **References nothing outside this layer**, and no specification language either.
- **No toolkit.** None of these crates uses egui; the shell draws what they hold, and the theme is values the shell reads.
- **One path for state changes.** Every change is a command on `desktop-history`; the layers above build commands and never change state inline.
- **`unsafe` stops here.** `desktop-libxml2` is the one crate allowed `unsafe`, with every file it reads going through a project-scoped resolver.
