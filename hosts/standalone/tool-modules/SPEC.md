---
id: standalone-tool-modules
type: module-design
title: Tool modules
status: draft
parent: host-standalone
depends-on:
  - standalone-workspace-services
  - standalone-tool-kinds
  - standalone-specification-runtimes
  - standalone-foundation
  - standalone-client
  - definitions
---

# Tool modules

The tool types themselves: one folder per diagram, designer or editor type, with backend, API, client and example parts, plus the shared bases diagram modules build on. Everything that knows a particular tool type lives here, and nowhere else.

## Members

| Node | Where | References (production) |
|---|---|---|
| `standalone-diagram-modules-base` | `EtAlii.Adp.Diagram.Modules` | Diagram, Context, History, Hierarchy, Layout, Sessions, Specification.Disl |
| `standalone-diagram-modules` | `src/diagrams/*` (67: 19 implemented, 48 stubs) | the bases and the core abstractions |
| `standalone-designer-modules` | `src/designers/*` (2) | Designer, the surface libraries, FBL |
| `standalone-editor-modules` | `src/editors/*` (5) | Editor, the client editor plumbing |

## Boundary

- **Discovered, never named.** The host process references modules only by wildcard, and no core file names a module. Deleting a module's folder removes its type.
- **Modules depend inward,** on core abstractions, the runtimes and the client libraries. They never reach the server that hosts them, the host-only projects, or each other.
- **Definitions and bindings come from `etalii.adp`.** They are bundled byte for byte with `provenance.json` and never edited here. A module's residue (what the languages cannot yet express) is listed in its definition's companion document, and each gap is reported upstream.
- **Three tool-type approaches coexist here** (`architecture`): DISL-backed diagram modules with residue, host-coded modules (editors, and the Wardley map and supply chain diagrams), and none yet in ATD.
- **A module adds its own `.proto`** for its payloads, carried as `Any`, and never edits a core contract.
