---
id: vscode-frame
type: submodule-design
title: "Frame: the tool-type contract and protocol"
status: draft
parent: vscode-core
---
# Frame: the tool-type contract and protocol

`src/core/frame`, part of `vscode-core`.

## Responsibility

The single `ToolType` contract: `claimed`, `suggests`, `findings`, `view`, `toolbox`, `fields`, `actions`, `edit` and `newDocument`. `edit` returns an `EditOutcome`: applied with splices, refused with a sentence, confirm, edit in place, show a field, open, or pick a path. The frame also holds the webview protocol (v2) and the view type naming (`etalii.adp.<vendor>.<type>`).

## Rules

- Everything is JSON-serialisable.
- A request carries the document version, and a request made on a stale version is cancelled.
- Core layer: no `vscode`, no extension or webview imports, no DOM.
