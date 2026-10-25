---
id: notion-panels
type: submodule-design
title: "Panels"
status: draft
parent: host-notion
depends-on:
  - notion-disl
  - notion-history
---
# Panels

`src/panels/`, part of `host-notion`.

## Responsibility

Toolbox, property grid, menu and controls.

## Rules

- Imports neither store nor canvas.
- `notion.css` holds the only literal colours, as light and dark `--notion-*` tokens, and every class is prefixed `adp-`.
- Reuse is proven by testing the panels against `mindmap.dis` as well as the add-on's own specification.
