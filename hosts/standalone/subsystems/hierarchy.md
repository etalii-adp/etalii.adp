---
id: standalone-hierarchy
type: submodule-design
title: "Hierarchy: the workspace tree"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-context
  - standalone-documents
  - standalone-diagram
  - standalone-projects
  - standalone-editor
  - standalone-designer
  - standalone-fbl
---
# Hierarchy: the workspace tree

`src/backend/EtAlii.Adp.Hierarchy`, part of `host-standalone`.

## Responsibility

The workspace tree, kept current from the project's file events. It decides which tool opens each file (`EditorResolver`, `DesignerFileRouter`, routing by `.adp` registration, owned extension or designer envelope) and holds the commands that create, rename and delete entries (`TemplateDocumentFactory`, `DesignerAddOptions`).

## Rules

- A diagram's file pair (body and `.adp` registration) is created, renamed and deleted together or not at all (guard `DiagramFilePair.Tests`).
- Create, rename and delete are commands (`standalone-history`), so they are undoable.
