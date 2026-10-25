---
id: desktop-editor-modules
type: submodule-design
title: "Editor modules"
status: draft
parent: desktop-tool-modules
depends-on:
  - desktop-libxml2
references:
  - edsl
---
# Editor modules

`modules/editors/{json,markdown,xml,yaml}`; plain text in `desktop-documents`/`desktop-text`, part of `desktop-tool-modules`.

## Responsibility

Ports of the standalone host's editors (approach 1 of `architecture` *Tool-type approaches*, because EDSL is a placeholder). JSON: syntax, duplicate names, and checks and completion from the `$schema` it names. Markdown: outline and preview as blocks. XML: well-formedness, declared encoding and XSD/DTD validation through libxml2. YAML: multi-document reading, the `yaml-language-server` schema line, tabs, duplicate keys, anchors and alias limits.

## Rules

- Schemas are read from the project only, relative to the document and never above the project root, and never from the network.
- The crates know no toolkit. The shell draws their findings and previews.
