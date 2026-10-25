---
id: intellij-atd
type: submodule-design
title: "ATD language support"
status: draft
parent: host-intellij
depends-on:
  - atd
  - host-desktop
---
# ATD language support

`atd/`, part of `host-intellij`.

## Responsibility

`.atd` file type and language, served by the desktop host's `atd-lsp` over stdio, one server per project. The binaries are fetched at build time from the `atd-v0.1.0` release, verified against `atd-lsp.lock` (SHA-256) and packed per platform. `ATD_RELEASE_DIR` allows an offline build.

## Rules

- Loaded only where the platform's LSP module exists (an optional dependency), because not every JetBrains IDE has it.
- Only Windows x64, macOS arm64 and Linux x64 get a server. Other platforms get the language without one.
- The host has no ATD checker of its own, so every host shows the same findings.
