---
id: standalone-editor
type: submodule-design
title: "Editor abstractions"
status: draft
parent: standalone-tool-kinds
depends-on:
  - standalone-primitives
  - standalone-documents
---
# Editor abstractions

`src/backend/EtAlii.Adp.Editor`, part of `standalone-tool-kinds`.

## Responsibility

The editor-family contract: `EditorDefinition` (id, extensions, file names, `IsFallback`, `IsDefaultForSharedExtension`, `Build`), `EditorDefinitionDiscovery`, `TextFileBuffer` (reads and writes text while keeping its shape: BOM, line endings) and `IEditorAnalyzer` (findings and completion on text as typed).

## Rules

- Names no format. The formats live in `standalone-editor-modules`.
- Exactly one editor is the fallback (plain text).
