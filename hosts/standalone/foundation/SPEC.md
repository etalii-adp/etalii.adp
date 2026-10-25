---
id: standalone-foundation
type: module-design
title: Foundation
status: draft
parent: host-standalone
---

# Foundation

The backend's base layer: the shared primitives, file access, open documents, commands with undo, and geometry. Every other backend layer builds on it, and it builds on nothing else in the host.

## Members

| Node | Project | References (production) |
|---|---|---|
| `standalone-primitives` | `EtAlii.Adp` | — |
| `standalone-files` | `EtAlii.Adp.Files` | primitives |
| `standalone-documents` | `EtAlii.Adp.Documents` | primitives, Files |
| `standalone-history` | `EtAlii.Adp.History` | primitives, Documents |
| `standalone-layout` | `EtAlii.Adp.Layout` | — |

## Boundary

- **References nothing outside this layer.** No tool kind, no specification runtime, no session, and no ASP.NET Core or gRPC server.
- **One path to the disk.** All production file access goes through `standalone-files`, and all document writes through `AdpFileWriter` in `standalone-documents`.
- **One path for state changes.** Every state change in the host is a command dispatched through `standalone-history`. The layers above build commands; they never change state inline.
