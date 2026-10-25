---
id: desktop-designer-modules
type: submodule-design
title: "Designer modules"
status: draft
parent: desktop-tool-modules
depends-on:
  - desktop-cel
  - desktop-context
  - desktop-desl
  - desktop-documents
  - desktop-fbl
  - desktop-theme
  - desl
  - ded
---
# Designer modules

`modules/designers/knowledge`, part of `desktop-tool-modules`.

## Responsibility

The Knowledge designer: a table of rows and typed properties, with views, kept in one YAML, JSON or XML file. It is read and written through the vendored `knowledge.fbl` and laid out as `knowledge.des` says.

## Rules

- No parser or writer of its own. A file is read through FBL into the DESL runtime's table content, checked, mapped onto the table model, and edited as file changes written behind.
- Renaming a table that others relate to is followed in those files.
