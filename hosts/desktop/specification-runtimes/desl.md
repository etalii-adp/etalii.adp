---
id: desktop-desl
type: submodule-design
title: "DESL and DED runtime"
status: draft
parent: desktop-specification-runtimes
depends-on:
  - desktop-cel
  - desktop-fbl
  - desl
  - ded
---
# DESL and DED runtime

`crates/adp-desl`, part of `desktop-specification-runtimes`.

## Responsibility

The designer runtime: DESL loading with findings, DED recognition by envelope and checks, and the `table` surface. The table covers the model that crosses to the shell, the content a designer module reads into, the view engine that filters, sorts, groups and nests rows on the core side, and the windowed session that answers a window of lines.

## Rules

- The view engine goes by the DESL value type's editor, key and sort, not by any designer's type names. It is the host-neutral form of the standalone host's Knowledge view engine.
- A 10,000-row table keeps pace with the pointer, because only the window in sight crosses to the shell.
