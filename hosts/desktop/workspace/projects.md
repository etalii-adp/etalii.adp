---
id: desktop-projects
type: submodule-design
title: "Projects"
status: draft
parent: desktop-workspace
depends-on:
  - desktop-core
---
# Projects

`crates/adp-projects`, part of `desktop-workspace`.

## Responsibility

The project list: add, validate, remove and open projects, kept across restarts in `projects.json` in the host's own state folder.

## Rules

- A project's path is validated when added and again when opened. A folder that has gone is reported, never silently dropped.
- Never written into a workspace.
