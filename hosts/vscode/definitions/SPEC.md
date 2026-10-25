---
id: vscode-definitions
type: module-design
title: "Vendored definitions and sync"
status: draft
parent: host-vscode
depends-on:
  - definitions
---
# Vendored definitions and sync

`definitions/<tool>/`, `scripts/sync-definitions`, part of `host-vscode`.

## Responsibility

Byte-for-byte copies of each supported tool type's `.dis`/`.des`, `.fbl` and companion from `origin/develop` of `etalii.adp` and the standalone host, with `PROVENANCE.md`. The sync script also generates each tool type's `customEditors` and `commands` entries in `package.json`.

## Rules

- Refreshed only by the sync script; `--check` runs in CI.
- Shipped in the `.vsix` and read at startup. Nothing is fetched at run time.
