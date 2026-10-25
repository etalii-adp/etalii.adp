---
id: intellij-fbl
type: submodule-design
title: "FBL library"
status: draft
parent: host-intellij
depends-on:
  - fbl
  - host-standalone
---
# FBL library

`fbl/` (package `etalii.adp.fbl`), part of `host-intellij`.

## Responsibility

A port of the standalone host's FBL library, with byte parity and its finding sentences copied word for word. It implements FBL at the *Host, declared* level for yaml, json, xml, lines and blocks, plus FBL 0.8's `insert.constant`. It is layered as document, expression (a CEL subset and bounded regex), family, rule, plan, history (exact undo, drift refusal), registration, routing, and the host's side of plugins.

## Rules

- Depends on nothing. `HostFreeTest` forbids platform, AWT, Swing and network imports and any example binding name. It is compiled with `-Xlint:all -Werror`.
- **Wired to no tool yet** (spec 010 FR-004). The first tool that uses it must join FBL's history to the platform undo and reconcile mixed line endings with the platform `Document`.
- Not yet covered: several readings of one body, the DISL-dependent loader checks, the JSON Schema check, and file watching.
- Where FBL leaves an output undecided, the fix goes to `specifications/fbl`. Divergences are recorded in `divergences.json`.
