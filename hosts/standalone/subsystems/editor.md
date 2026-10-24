---
id: standalone-editor
type: submodule-design
title: "Standalone: Editor abstractions"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-documents
---
# Standalone: Editor abstractions

`src/backend/EtAlii.Adp.Editor`, part of `host-standalone`.

## Responsibility

The editor-family contract: `EditorDefinition` (id, extensions, file names, `IsFallback`, `IsDefaultForSharedExtension`, `Build`), `EditorDefinitionDiscovery`, `TextFileBuffer` (reads and writes text while keeping its shape: BOM, line endings) and `IEditorAnalyzer` (findings and completion on text as typed).

## Rules

- Names no format. The formats live in `standalone-editor-modules`.
- Exactly one editor is the fallback (plain text).
