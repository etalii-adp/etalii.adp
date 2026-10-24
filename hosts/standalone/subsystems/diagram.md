---
id: standalone-diagram
type: submodule-design
title: "Diagram abstractions"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-documents
---
# Diagram abstractions

`src/backend/EtAlii.Adp.Diagram`, part of `host-standalone`.

## Responsibility

The diagram-type contract: `DiagramDefinition`, `DiagramDefinitionDiscovery`, `IDiagramToolboxProvider`, `IDiagramValidator`, `IDiagramDocumentFactory`, `DiagramDiff.Between` (removes before adds), `DiagramDocumentReloader<TStore>` and `RelationAttribute`.

## Rules

- Core code never depends on a particular diagram type, and the canvas, storage and sync machinery never know a type's schema.
- The name is singular and has no `Backend` segment; a guard rejects names of projects that do not exist.
- A module's `Diagram.cs` takes one of three shapes. **Stub:** an inline `Definitions` array with no `Build`. **Implemented:** named definition properties, each with a `Build` delegate. **Family:** one definition carries `Build`, and its registration loops over the family's origins. So `Build is null` means "registers nothing itself", not "stub": whether a type is served is read from the registration.
