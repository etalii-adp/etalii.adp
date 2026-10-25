---
id: vscode-scene
type: submodule-design
title: "Scene"
status: draft
parent: vscode-core
depends-on:
  - vscode-disl
---
# Scene

`src/core/scene`, part of `vscode-core`.

## Responsibility

Turns a model into shapes, lines and labels with geometry, snapping and tidy-tree layout.

## Rules

- The shared text metric (0.55 × font size per UTF-16 unit) gives every host the same boxes.
- The webviews may import its geometry and tidy-tree functions. Everything else crosses only as data.
