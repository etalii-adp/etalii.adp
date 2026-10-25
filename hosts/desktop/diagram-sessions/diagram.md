---
id: desktop-diagram
type: submodule-design
title: "Diagram sessions"
status: draft
parent: desktop-diagram-sessions
depends-on:
  - desktop-cel
  - desktop-context
  - desktop-core
  - desktop-disl
  - desktop-documents
  - desktop-fbl
  - desktop-history
---
# Diagram sessions

`crates/adp-diagram`, part of `desktop-diagram-sessions`.

## Responsibility

Opens a diagram of a DISL and FBL tool type from a body or a registration. Edits go through FBL as commands on the project's history, with undo, and a body changed on disk is reconciled. It is ported from the standalone host's `EtAlii.Adp.Diagram`, `Diagram.Modules` and the diagram half of `Workspace`.

## Rules

- The gRPC contract's messages are plain Rust types, and the shell calls the core in process.
- A module that needs more than the generic path declares that it opens its documents itself (`DiagramModule::opens_documents`).
