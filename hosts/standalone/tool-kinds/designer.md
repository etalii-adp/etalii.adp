---
id: standalone-designer
type: submodule-design
title: "Designer abstractions"
status: draft
parent: standalone-tool-kinds
depends-on:
  - standalone-primitives
---
# Designer abstractions

`src/backend/EtAlii.Adp.Designer`, part of `standalone-tool-kinds`.

## Responsibility

The designer-family contract: `DesignerDefinition`, `DesignerFormat`, `DesignerClaim` (recognition by envelope), discovery and catalogue, `IDesignerDocumentTemplate`, and the table and hierarchy-surface models that designer sessions speak.

## Rules

- The surface models name no designer type: a designer's document is drawn by the surface its DESL specification names (table or hierarchy).
