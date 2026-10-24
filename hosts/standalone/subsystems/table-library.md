---
id: standalone-table-library
type: submodule-design
title: "Standalone: Table library (client)"
status: draft
parent: host-standalone
depends-on:
  - standalone-api
---
# Standalone: Table library (client)

`src/client/src/table/library`, part of `host-standalone`.

## Responsibility

Draws a designer's table surface from the model and a module's declarations: the table, headers, cells, editors, views and menus.

## Rules

- The backend filters, sorts and groups, and the client draws only the window in sight, so a table of ten thousand rows is never sent or drawn whole.
- A designer module mounts the library and writes no element of its own (guard `declarativeDesignerModules`).
