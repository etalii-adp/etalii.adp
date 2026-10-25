---
id: vscode-core
type: module-design
title: Core
status: draft
parent: host-vscode
---

# Core

`src/core/`. The headless heart of the extension: the one tool-type contract and its webview protocol, the generic FBL, DISL and DESL interpreters, the scene, the code that turns a vendored definition into a tool type, and the plugins that hold what a definition cannot say. Everything the extension host and the webviews show is computed here.

## Members

| Node | Folder | Depends on (in the core) |
|---|---|---|
| `vscode-frame` | `src/core/frame` | — |
| `vscode-fbl` | `src/core/fbl` | — |
| `vscode-disl` | `src/core/disl` | — |
| `vscode-desl` | `src/core/desl` | DISL |
| `vscode-scene` | `src/core/scene` | DISL |
| `vscode-plugins` | `src/core/plugins/<id>` | frame |
| `vscode-tool` | `src/core/tool` | frame, FBL, DISL, DESL, scene, plugins |

## Boundary

- **No `vscode`, no DOM, and no import from the extension host or the webviews.** A lint rule and a words test hold this, so the core runs under vitest alone and can be shared with other hosts.
- **No tool-type names outside `vscode-plugins`.** Any other exception needs a row in the support record.
- **Shared with the Notion host.** `vscode-fbl` is the copy Notion takes byte for byte, and `vscode-disl` was taken from Notion and is now owned here (`host-notion`).
