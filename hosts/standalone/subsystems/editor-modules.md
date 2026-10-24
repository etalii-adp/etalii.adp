---
id: standalone-editor-modules
type: submodule-design
title: "Editor modules"
status: draft
parent: host-standalone
depends-on:
  - standalone-editor
  - standalone-client-editors
references:
  - edsl
  - edd
---
# Editor modules

`src/editors/<editor>/`, part of `host-standalone`.

## Responsibility

Five text editors: JSON, Markdown, plain text (the fallback), XML and YAML, with their analyzers. They are host code (approach 1 of `architecture` *Tool-type approaches*), because EDSL is a placeholder. The JSON and XML modules list what an EDSL specification would have to state.

## Rules

- Same folder shape as the diagram modules (`EtAlii.Adp.Editor.<Editor>` and its tests).
- Editor examples are byte-identical replicas in `src/examples/editors/`.
