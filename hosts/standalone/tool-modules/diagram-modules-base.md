---
id: standalone-diagram-modules-base
type: submodule-design
title: "Diagram module bases (EtAlii.Adp.Diagram.Modules)"
status: draft
parent: standalone-tool-modules
depends-on:
  - standalone-diagram
  - standalone-context
  - standalone-history
  - standalone-hierarchy
  - standalone-layout
  - standalone-sessions
  - standalone-disl
---
# Diagram module bases (EtAlii.Adp.Diagram.Modules)

`src/backend/EtAlii.Adp.Diagram.Modules`, part of `standalone-tool-modules`.

## Responsibility

The bases a diagram module builds on: the provider frame (`DiagramElementSourceResolver`, `DiagramActionProvider`, `DiagramPropertyProvider`), `DislDiagramDefinition` (a bundled DISL definition as the module's palette, menus and property rows), the generic `DislToolboxProvider`, and the viewport test.

## Rules

- A module derives its palette, menus and rows from its bundled DISL definition through these bases, rather than hand-writing them, wherever the definition can express them.
