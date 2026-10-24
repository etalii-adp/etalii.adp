---
id: standalone-shell
type: submodule-design
title: "Standalone: Workspace shell (client)"
status: draft
parent: host-standalone
depends-on:
  - standalone-api
  - standalone-canvas-library
  - standalone-table-library
  - standalone-hierarchy-surface-library
  - standalone-client-editors
---
# Standalone: Workspace shell (client)

`src/client/src/shell`, `auth`, `pages`, part of `host-standalone`.

## Responsibility

The workspace around the tools:

- **Shell:** `WorkspaceShell`, with split and tabbed panes.
- **Panels:** explorer, hierarchy, property grid, errors and warnings, search, toolbox, and tool tabs.
- **Ribbon:** contextual groups and the history group.
- **Context:** the context connection, the context menu and the prompt hosts.
- **Entry pages:** the login and project-grid pages.

Tool panels are found by globbing `{diagrams,designers,editors}/*/client/register.ts`.

## Rules

- **The Toolbox is the one way to create elements by picking or dragging**, and many tool types rely on it. A type's toolbox is described by the backend as data (`DescribeToolbox`) and rendered by a panel that does not understand it. A drop runs its `drop_action_id` through the context-action path, so it gets the same command, prompt and undo as a menu or keyboard action. 15 diagram modules contribute toolboxes for 25 origins: 10 through the generic `DislToolboxProvider`, C4 and Databricks derived from DISL by their own providers, and Wardley map, supply chain and the RDF family hand-coded. Read-only types (Ansible, Helm, .NET dependency graph) offer none, by design.
- One stream per tab, opened once at the shell level and fanned out through a React context (`oneStreamPerTab.test.tsx`).
- Styling is centralised in theme tokens, with no inline styles.
- The search panel is a placeholder.
