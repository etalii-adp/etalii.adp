---
id: desktop-layout
type: submodule-design
title: "Layout: geometry and layout modes"
status: draft
parent: desktop-foundation
---
# Layout: geometry and layout modes

`crates/adp-layout`, part of `desktop-foundation`.

## Responsibility

Geometry ported from the standalone host's `EtAlii.Adp.Layout`: rectangle, text metric, grid, layering with its cycle rules, overlap pass and row packing. Alongside it, the layout modes from its client canvas library: manual, directional tree, row-packed, radiating deterministic force, and fold state independent of any one tool type.

## Rules

- Nothing here draws: a layout takes ids, sizes and links and returns positions, so the canvas, the parity runner and the tests all read the same numbers.
- Optimised even in dev builds; otherwise the force layout lags.
