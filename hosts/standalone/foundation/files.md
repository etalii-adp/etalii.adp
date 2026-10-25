---
id: standalone-files
type: submodule-design
title: "Files"
status: draft
parent: standalone-foundation
depends-on:
  - standalone-primitives
---
# Files

`src/backend/EtAlii.Adp.Files`, part of `standalone-foundation`.

## Responsibility

Writing a file whole, reporting what holds a file open, deciding whether two paths are one file, and watching a file, a folder or a project's files (`ProjectFileEvents`, one watcher per watched root).

## Rules

- All production file access goes through these helpers, never through raw file APIs (guard `ShapeOfFileAccess.Tests`).
- Tested from `Documents.Tests`.
