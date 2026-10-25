---
id: notion-canvas
type: submodule-design
title: "Canvas"
status: draft
parent: host-notion
depends-on:
  - notion-disl
  - notion-history
  - notion-store
---
# Canvas

`src/canvas/`, part of `host-notion`.

## Responsibility

Scene, shapes, geometry, gestures, snapping, ruler, filters, in-place editing and connectors.

## Rules

- Draws from the model and the DISL notation. It names no tool type.
