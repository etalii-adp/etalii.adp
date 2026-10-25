---
id: desktop-application
type: module-design
title: Application
status: draft
parent: host-desktop
depends-on:
  - desktop-foundation
  - desktop-specification-runtimes
  - desktop-workspace
  - desktop-diagram-sessions
  - desktop-tool-modules
  - desktop-atd-toolchain
---

# Application

The window and what it offers: the shell that draws every panel with egui, and the add dialog's offer and writes. This is the top of the product; nothing in it depends on this layer.

## Members

| Node | Crate | Depends on (in the host) |
|---|---|---|
| `desktop-shell` | `crates/adp-shell` (binary `adp-desktop`) | nearly every crate and every module |
| `desktop-add` | `crates/adp-add` | core, DESL, diagram, FBL, hierarchy, diagram and designer modules |

## Boundary

- **Only `desktop-shell` uses egui, `rfd` or `syntect`, and only it links every module** (principle III).
- **`desktop-add` is a library apart from the shell,** so `desktop-parity` replays an add without a window.
