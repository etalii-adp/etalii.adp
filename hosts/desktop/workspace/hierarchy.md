---
id: desktop-hierarchy
type: submodule-design
title: "Hierarchy: the workspace tree"
status: draft
parent: desktop-workspace
---
# Hierarchy: the workspace tree

`crates/adp-hierarchy`, part of `desktop-workspace`.

## Responsibility

The workspace tree, live watching through a `Watcher`, and the rules for names and registrations, ported from `EtAlii.Adp.Hierarchy`.

## Rules

- A registration (`.adp`) nests under the file it registers and never under a folder. A folder's own registration is the bare `.adp` inside it. A registration whose subject is missing stays where it is and is marked.
- Names are judged by one set of rules for renaming and creating alike.
