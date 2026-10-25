---
id: desktop-core
type: submodule-design
title: "Core: window handle, event channel and catalogue"
status: draft
parent: desktop-workspace
depends-on:
  - desktop-context
  - desktop-disl
  - desktop-fbl
  - desktop-history
---
# Core: window handle, event channel and catalogue

`crates/adp-core`, part of `desktop-workspace`.

## Responsibility

The core's handle per window, its event channel and threads (the core-shell contract of spec 030), the host's per-user state, and the tool-type catalogue. The catalogue joins the standalone host's `docs/tools.md` (as `catalogue/tools.json`) with the vendored `.dis` and `.des` files.

## Rules

- **The shell talks to the core only through in-process calls and one event channel per window.** This replaces the standalone host's unary calls and its one stream per tab, and keeps every behaviour testable headless.
- Per-user state lives in the platform's app-data folder (`%AppData%\EtAlii\ADP Desktop` and its equivalents), never in a workspace.
