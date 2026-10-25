---
id: standalone-projects
type: submodule-design
title: "Projects"
status: draft
parent: standalone-workspace-services
depends-on:
  - standalone-primitives
  - standalone-sessions
  - standalone-documents
---
# Projects

`src/backend/EtAlii.Adp.Projects`, part of `standalone-workspace-services`.

## Responsibility

Known projects and their workspace roots, stored under the application-data root and never inside a workspace.

## Rules

- File access is scoped to the workspace roots a user explicitly opened, never the whole machine.
