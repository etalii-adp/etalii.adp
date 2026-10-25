---
id: desktop-atd-cli
type: submodule-design
title: "`atd` command line"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-check
  - desktop-atd-format
  - desktop-atd-grammar
  - desktop-atd-runtime
  - desktop-atd-syntax
  - desktop-atd-validate
references:
  - atd
---
# `atd` command line

`crates/adp-atd-cli`, part of `desktop-atd-toolchain`.

## Responsibility

The `atd` command: `check` (with `--json`, `--expect`, `--corpus`, `--trace`), `fmt`, `tree`, `tables`, `validate` and `record`. Exit code 0 means nothing to report, 1 means findings, and 2 a usage or I/O error. `etalii.adp`'s CI checks every tool description with it (`ci-validators`), and `atd-v*` releases publish it with `atd-lsp` for three operating systems and wasm, with SHA-256 files.

## Rules

- `record` (building cases from parity scripts and goldens) needs the shell and parity crates, so it is a default feature. The build other hosts get drops it with `--no-default-features`.
- On a pull request whose branch also exists in `etalii.adp`, CI reads that branch's specification (`ATD_SPEC_DIR`).
