---
id: standalone-tool-kinds
type: module-design
title: Tool-kind abstractions
status: draft
parent: host-standalone
depends-on:
  - standalone-foundation
---

# Tool-kind abstractions

The contracts of the three tool kinds (diagram, editor and designer) that core code programs against and modules implement. This layer is what lets the core serve any tool type without knowing one.

## Members

| Node | Project | References (production) |
|---|---|---|
| `standalone-diagram` | `EtAlii.Adp.Diagram` | primitives, Documents |
| `standalone-editor` | `EtAlii.Adp.Editor` | primitives, Documents |
| `standalone-designer` | `EtAlii.Adp.Designer` | primitives |

## Boundary

- **Core never depends on a particular tool type.** The canvas, storage and sync machinery never know a type's schema, so a type is added by adding its module folder and removed by deleting it.
- **Discovery by reflection.** Each kind has a definition (`DiagramDefinition`, `EditorDefinition`, `DesignerDefinition`) and a discovery, found through the shared `ToolDefinitionScan`. No core file names a type.
- **The kinds are siblings.** None references another, and the foundation is all they build on.
- **Sessions are not here.** Session contracts and their lifetime belong to `standalone-workspace-services`, which references these kinds and never the reverse.
