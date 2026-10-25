---
id: notion-history
type: submodule-design
title: "History"
status: draft
parent: host-notion
---
# History

`src/history/`, part of `host-notion`.

## Responsibility

Commands, a dispatcher and a history stack, modelled on the standalone host's `EtAlii.Adp.History`.

## Rules

- Every edit, undo and redo goes through it, and one gesture is one command.
- Imports nothing. It exists because an embed has no part in Notion's undo.
