---
id: notion-frame
type: submodule-design
title: "Frame: page states and wiring"
status: draft
parent: host-notion
depends-on:
  - notion-fbl
  - notion-disl
  - notion-history
  - notion-store
  - notion-canvas
  - notion-panels
---
# Frame: page states and wiring

`src/frame/`, part of `host-notion`.

## Responsibility

Page states and the entry point. Each story's wiring is a module under `parts/`, attached through `onPage`. Without `store`, the page offers a database chooser, prepares the database and patches its own embed block's address.

## Rules

- Only the frame imports every part.
- `config.ts` is the only place that names the service address (local or the Worker).
- Appearance follows `prefers-color-scheme` or `?theme=`, because the embed cannot read Notion's theme.
