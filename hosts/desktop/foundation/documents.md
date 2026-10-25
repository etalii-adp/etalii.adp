---
id: desktop-documents
type: submodule-design
title: "Documents and tabs"
status: draft
parent: desktop-foundation
depends-on:
  - desktop-context
---
# Documents and tabs

`crates/adp-documents`, part of `desktop-foundation`.

## Responsibility

Open documents and tabs: opening, unsaved state, save, and reconciling with the disk. Plain-text buffers keep their BOM and line endings, and binary files are refused.

## Rules

- Saves are atomic.
- Nothing is written to a workspace that the standalone host would not write.
