---
id: desktop-tool-modules
type: module-design
title: Tool modules
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
  - desktop-workspace
  - desktop-diagram-sessions
---

# Tool modules

One crate per tool type that needs code: diagram modules holding only their residue, the Knowledge designer, and the hand-ported editors (approach 1, because EDSL is a placeholder).

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-diagram-modules` | `modules/diagrams/<tool>/` (19 crates) | CEL, context, core, diagram, DISL, documents, FBL, history, layout, theme |
| `desktop-designer-modules` | `modules/designers/knowledge` | CEL, context, DESL, documents, FBL, theme |
| `desktop-editor-modules` | `modules/editors/{json,markdown,xml,yaml}` | libxml2 |

## Boundary

- **A module depends on core crates and the theme, never on the shell or egui.** Only the application links every module.
- **Modules are siblings.** None references another.
