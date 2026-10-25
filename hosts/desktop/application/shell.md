---
id: desktop-shell
type: submodule-design
title: "Shell: the window"
status: draft
parent: desktop-application
depends-on:
  - desktop-add
  - desktop-atd-check
  - desktop-atd-lsp
  - desktop-cel
  - desktop-context
  - desktop-core
  - desktop-desl
  - desktop-diagram
  - desktop-disl
  - desktop-documents
  - desktop-drawing
  - desktop-fbl
  - desktop-hierarchy
  - desktop-history
  - desktop-layout
  - desktop-problems
  - desktop-projects
  - desktop-scene
  - desktop-text
  - desktop-theme
  - desktop-diagram-modules
  - desktop-designer-modules
  - desktop-editor-modules
---
# Shell: the window

`crates/adp-shell` (binary `adp-desktop`), part of `desktop-application`.

## Responsibility

One native window per workspace, drawn with egui on wgpu, exposed to screen readers through AccessKit, in VS Code's theme following the system. It holds the canvas, table, properties, ribbon, explorer, problems, editor with highlighting (`syntect` and TextMate grammars), the ATD client, accessibility and the add dialog.

## Rules

- **The only crate that uses egui, `rfd` or `syntect`, and the only one that links every module** (principle III).
- It is a library that the binary runs, so tests drive frames and read the AccessKit tree as the platform does.
- Every interactive element has an AccessKit role, name and state. Dialogs are native, and the platform's modifier key and light or dark setting are followed.
- The search panel is a placeholder.
