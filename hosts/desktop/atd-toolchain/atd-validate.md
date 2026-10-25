---
id: desktop-atd-validate
type: submodule-design
title: "ATD validation by conformance replay"
status: draft
parent: desktop-atd-toolchain
depends-on:
  - desktop-atd-check
  - desktop-atd-runtime
  - desktop-context
  - desktop-diagram
  - desktop-disl
  - desktop-drawing
  - desktop-history
references:
  - atd
---
# ATD validation by conformance replay

`crates/adp-atd-validate`, part of `desktop-atd-toolchain`.

## Responsibility

Replays a description's conformance cases through its runtime on in-memory copies. Each case's steps are made with the ids the reference host generated. Bytes, splices, reading, findings, refusal and drawing are compared after each step, and each difference is reported with the construct that produced it.

## Rules

- Nothing is read from or written to the file system.
