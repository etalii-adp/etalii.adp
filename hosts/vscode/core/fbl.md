---
id: vscode-fbl
type: submodule-design
title: "FBL library"
status: draft
parent: vscode-core
depends-on:
  - fbl
  - host-standalone
---
# FBL library

`src/core/fbl`, part of `vscode-core`.

## Responsibility

A generic FBL library at the *Host, declared* level (FBL 0.1–0.6 plus 0.8's insert `constant`) for yaml, json, xml, lines and blocks. It covers documents, expressions and CEL, families, history, planning, registration, routing, rules, splices and UTF-8 byte offsets. It is a port of the standalone host's library, and its public surface is exposed as `AdpApi.fbl`.

## Rules

- Names no tool type or binding (`generic.test.ts`).
- Only two of its files may use `node:*`.
- **The Notion host copies it from here, byte for byte, and never edits it.** A change here is a change for Notion at its next sync.
