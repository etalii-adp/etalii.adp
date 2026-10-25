---
id: notion-fbl
type: submodule-design
title: "FBL (copied)"
status: draft
parent: host-notion
depends-on:
  - fbl
  - host-vscode
---
# FBL (copied)

`src/fbl/`, part of `host-notion`.

## Responsibility

A byte-for-byte copy of the VS Code host's FBL library, refreshed by `scripts/sync-fbl.mjs` with `PROVENANCE.md`. A shim replaces `node:crypto` in the browser.

## Rules

- Never edited and not linted. A need goes to the VS Code host's library, or to `specifications/fbl`.
- Top of the layering: it imports no other part.
