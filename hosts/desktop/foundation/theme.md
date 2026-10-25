---
id: desktop-theme
type: submodule-design
title: "Theme"
status: draft
parent: desktop-foundation
---
# Theme

`crates/adp-theme`, part of `desktop-foundation`.

## Responsibility

VS Code's default Dark 2026 and Light 2026 themes, value for value, extracted by `tools/extract-vscode-theme.py` from a pinned VS Code release, plus sizes and contrast tests.

## Rules

- The shell reads every colour, stroke width and font size from a `Theme`. The crate knows no toolkit.
- Look follows VS Code; behaviour follows the standalone host.
