---
id: desktop-atd-toolchain
type: module-design
title: ATD toolchain
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
  - desktop-diagram-sessions
---

# ATD toolchain

Spec 035 phase 1: the grammar, parser, checker, formatter, script interpreter, runtime and validation of `.atd` tool descriptions, and the two front ends built on them, the `atd` command line and `atd-lsp`. The `atd-v*` releases publish those two for `etalii.adp`'s CI and the other hosts.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-atd-grammar` | `crates/adp-atd-grammar` | — |
| `desktop-atd-syntax` | `crates/adp-atd-syntax` | grammar |
| `desktop-atd-check` | `crates/adp-atd-check` | syntax |
| `desktop-atd-format` | `crates/adp-atd-format` | syntax |
| `desktop-atd-script` | `crates/adp-atd-script` | check, syntax, CEL, history |
| `desktop-atd-runtime` | `crates/adp-atd-runtime` | check, script, CEL, diagram, DISL, FBL, layout |
| `desktop-atd-validate` | `crates/adp-atd-validate` | check, runtime, context, diagram, DISL, drawing, history |
| `desktop-atd-lsp` | `crates/adp-atd-lsp` | check, format, runtime, syntax, validate |
| `desktop-atd-cli` | `crates/adp-atd-cli` | check, format, grammar, runtime, syntax, validate |

## Boundary

- **Headless.** Nothing here depends on the workspace core, a module or the shell, so the CLI and the language server ship without the window.
- **Phase 1 only exercises descriptions.** No person's tool is run from `.atd`; `.dis`, `.des` and `.fbl` stay the files the host runs.
- **The language server runs in process** over an in-memory connection when the shell is its client.
