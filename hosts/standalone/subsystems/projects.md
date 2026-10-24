---
id: standalone-projects
type: submodule-design
title: "Standalone: Projects"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-sessions
  - standalone-documents
---
# Standalone: Projects

`src/backend/EtAlii.Adp.Projects`, part of `host-standalone`.

## Responsibility

Known projects and their workspace roots, stored under the application-data root and never inside a workspace.

## Rules

- File access is scoped to the workspace roots a user explicitly opened, never the whole machine.
