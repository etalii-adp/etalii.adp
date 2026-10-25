---
id: desktop-atd-lsp
type: submodule-design
title: "ATD language server"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-check
  - desktop-atd-format
  - desktop-atd-runtime
  - desktop-atd-syntax
  - desktop-atd-validate
references:
  - atd
---
# ATD language server

`crates/adp-atd-lsp`, part of `desktop-atd-toolchain`.

## Responsibility

A transport-free `Server::handle` that takes an LSP message and returns the messages to send, over a workspace's open documents and their descriptions. Diagnostics are the checker's findings, with the same codes.

## Rules

- **One server, three transports:** in process for the desktop shell, stdio for IntelliJ, and WebAssembly for VS Code. So every host shows the same checker (`hosts`).
- Shipped crates are limited to Apache, MIT, BSD, Zlib and Unicode-compatible licences (`deny.toml`).
