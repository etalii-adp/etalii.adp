---
id: desktop-drawing
type: submodule-design
title: "Drawing: the recording painter"
status: draft
parent: desktop-diagram-sessions
depends-on:
  - desktop-diagram
  - desktop-disl
  - desktop-scene
references:
  - atd
---
# Drawing: the recording painter

`crates/adp-drawing`, part of `desktop-diagram-sessions`.

## Responsibility

Turns a scene into `$defs/Drawing`, the drawing a conformance fixture records and `atd validate` compares. It records each element's body, labels and style, each relation's route and ends, the canvas chrome, and the drawing order. Positions are rounded to 0.01.

## Rules

- Reads the scene, not pixels.
- Moved out of the shell so that hosts without a window (`atd`, the language server, validation) record what the canvas draws.
