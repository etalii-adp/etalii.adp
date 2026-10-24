---
id: standalone-layout
type: submodule-design
title: "Layout: geometry"
status: draft
parent: host-standalone
---
# Layout: geometry

`src/backend/EtAlii.Adp.Layout`, part of `host-standalone`.

## Responsibility

Geometry shared by modules: the rectangle, row packing, the row a drag snaps to, text width, and graph layering.

## Rules

- References nothing and draws nothing. It computes only.
