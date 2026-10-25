---
id: desktop-history
type: submodule-design
title: "History: commands and undo"
status: draft
parent: desktop-foundation
---
# History: commands and undo

`crates/adp-history`, part of `desktop-foundation`.

## Responsibility

Commands, composite commands and the history with its barriers, ported from the standalone host's `EtAlii.Adp.History`. Every change is a command that, when it succeeds, returns the command that reverses it.

## Rules

- A rejected command changes nothing and keeps the redo side.
- The undo side holds at most a fixed capacity of changes and drops the oldest past it.
- A change from outside (another program writing the body) ends the history: undo stops there and says why.
- No dependencies. Core crate: never depends on egui.
