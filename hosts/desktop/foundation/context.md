---
id: desktop-context
type: submodule-design
title: "Context: selection, actions, prompts and property rows"
status: draft
parent: desktop-foundation
---
# Context: selection, actions, prompts and property rows

`crates/adp-context`, part of `desktop-foundation`.

## Responsibility

The data the standalone host's context system carries (`context.proto`, `context-contract.proto`) as plain Rust. The shell renders it and knows nothing more, as the standalone client renders what its backend sends.

## Rules

- One description of an action feeds the ribbon, the context menu and the keyboard.
- No dependencies and no toolkit.
