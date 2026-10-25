---
id: desktop-add
type: submodule-design
title: "Add: creating tool files"
status: draft
parent: desktop-application
depends-on:
  - desktop-core
  - desktop-desl
  - desktop-diagram
  - desktop-fbl
  - desktop-hierarchy
  - desktop-diagram-modules
  - desktop-designer-modules
---
# Add: creating tool files

`crates/adp-add`, part of `desktop-application`.

## Responsibility

What the add dialog offers and what it writes, ported from the standalone host. The offer lists every diagram definition grouped by vendor, and designer types with a choice per format, each with its state from `docs/tools.md`. Adding writes the registration (MIME origin and CRLF) and the body beside it, byte for byte what the standalone host writes.

## Rules

- A folder-subject type takes no name, says why, and is unavailable when the folder is already registered.
- On an existing file, the add registers the file instead of creating one.
