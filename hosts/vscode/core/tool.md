---
id: vscode-tool
type: submodule-design
title: "Tool: definitions to tool types"
status: draft
parent: vscode-core
depends-on:
  - vscode-frame
  - vscode-disl
  - vscode-desl
  - vscode-scene
  - vscode-fbl
  - vscode-plugins
---
# Tool: definitions to tool types

`src/core/tool`, part of `vscode-core`.

## Responsibility

`toolTypeFrom` turns a vendored `definitions/<tool>` folder into a `ToolType`. Alongside it: table views, model changes (one gesture is one composed splice set, which is one undo step), claims, the plugin registry, registration layout, and the mapping of legacy `x-` wire ids.

## Rules

- **No tool-type names in generic code.** A lint rule and a words test hold this. Any exception needs a row in the support record.
- `toolTypeFrom` concentrates many of the host's decisions, so it is where a newly supported construct usually lands.
