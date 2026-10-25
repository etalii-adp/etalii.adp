---
id: desktop-text
type: submodule-design
title: "Text: the editor model"
status: draft
parent: desktop-foundation
---
# Text: the editor model

`crates/adp-text`, part of `desktop-foundation`.

## Responsibility

The model of the editors' text component: a rope with one cursor and its selection, editing, moving, undo inside the editor with typing grouped word by word as VS Code groups it, line and column positions, and find.

## Rules

- Offsets are in characters.
- Knows no toolkit; the shell draws it.
