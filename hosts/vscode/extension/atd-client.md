---
id: vscode-atd-client
type: submodule-design
title: "ATD client"
status: draft
parent: vscode-extension
depends-on:
  - atd
  - host-desktop
---
# ATD client

`src/extension/atd`, `syntaxes/`, part of `vscode-extension`.

## Responsibility

`.atd` language support. A TextMate grammar is generated in `etalii.adp`, and the desktop host's `atd-lsp`, compiled to WebAssembly, runs on a worker thread through `vscode-languageclient`.

## Rules

- No child process and no socket.
- The wasm build is fetched at build time from the `atd-v0.1.0` release and pinned by SHA-256 in `vendor/atd-lsp.lock`. `ATD_RELEASE_DIR` allows an offline build.
- The core plays no part in it.
