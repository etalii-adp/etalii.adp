---
id: desktop-scene
type: submodule-design
title: "Scene: notation to primitives"
status: draft
parent: desktop-specification-runtimes
depends-on:
  - desktop-cel
  - desktop-disl
  - desktop-fbl
---
# Scene: notation to primitives

`crates/adp-scene`, part of `desktop-specification-runtimes`.

## Responsibility

A DISL specification's notation, a diagram's model and its positions turned into a flat, ordered list of drawing primitives in diagram coordinates, culled to a viewport. Ported from the standalone host's TypeScript canvas library: the notation compiler, definitions, shapes, connectors and text metrics.

## Rules

- Host-neutral: no UI toolkit. The shell paints the primitives and implements `TextMetrics`.
- A 1,000-element canvas keeps pace with the pointer, because only what is visible is painted.
