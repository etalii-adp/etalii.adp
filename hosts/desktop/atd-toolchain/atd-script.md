---
id: desktop-atd-script
type: submodule-design
title: "ATD script interpreter"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-check
  - desktop-atd-syntax
  - desktop-cel
  - desktop-history
references:
  - atd
---
# ATD script interpreter

`crates/adp-atd-script`, part of `desktop-atd-toolchain`.

## Responsibility

Runs a description's functions (callable from CEL by name) and the statements of operations and hooks, for one user gesture.

## Rules

- **Step-budgeted:** one step per statement, loop iteration, expression and call (ATD §12.6). The budget is the gesture's.
- A call that ends other than by returning (a `fail`, a CEL error, a refused action, a loop limit, a budget overrun, the debugger) is a `Stop` naming the function. The host then discards the transaction and refuses the gesture.
