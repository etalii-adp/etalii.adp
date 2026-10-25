---
id: desktop-workspace
type: module-design
title: Workspace core
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
---

# Workspace core

The core's handle per window and its event channel, the tool-type catalogue, the project list, the workspace tree and the findings per project: what a window needs before any tool opens.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-core` | `crates/adp-core` | context, history, DISL, FBL |
| `desktop-projects` | `crates/adp-projects` | core |
| `desktop-problems` | `crates/adp-problems` | core |
| `desktop-hierarchy` | `crates/adp-hierarchy` | — |

## Boundary

- **The core-shell contract lives here** (`desktop-core`): the shell talks to the core only through in-process calls and one event channel per window.
- **Per-user state never enters a workspace.** Projects, findings caches and window state live in the app-data folder.
