---
id: standalone-hierarchy-surface-library
type: submodule-design
title: "Hierarchy surface library (client)"
status: draft
parent: host-standalone
depends-on:
  - standalone-api
---
# Hierarchy surface library (client)

`src/client/src/hierarchySurface/library`, part of `host-standalone`.

## Responsibility

Draws one page of nested boxes for a designer's hierarchy surface, with its trail, folds, note marks, references, columns and narrowing.

## Rules

- The whole page model arrives on open and after every change. The client focuses, narrows and sorts it without asking the backend.
- An edit is a gesture sent as one unary call, answered once accepted and written to the file behind it.
