---
id: standalone-diagram-modules
type: submodule-design
title: "Standalone: Diagram modules"
status: draft
parent: host-standalone
depends-on:
  - standalone-diagram-modules-base
  - standalone-diagram
  - standalone-canvas-library
  - disl
  - fbl
---
# Standalone: Diagram modules

`src/diagrams/<type>/`, part of `host-standalone`.

## Responsibility

One folder per diagram type, holding up to five parts: `backend`, `api`, `client`, `examples` and, for a DISL-backed type, `definition`. It is discovered at run time, and deleting the folder removes the type. As of 2026-10-24 there are 67 folders: 19 implemented and 48 catalogued stubs. 17 of them bundle a DISL definition, and 16 an FBL binding.

## Rules

- A module may depend on core abstractions. Core never depends on a module, and a module never reaches the server that hosts it.
- A module with a binding writes no parser or writer of its own. One without a binding (Wardley map, supply chain) writes its own on `LineDocument`/`LineSplice`.
- A specification for a diagram type covers at least four aspects: file format, visualisation (positions computed or authored), toolbox, and context actions with their inverse commands. An aspect that does not apply is stated as such, with the reason.
- Service registration lives in one `ServiceCollection.AddX.cs`. It is split out to `AddXCommands` only when a concrete consumer needs the handlers alone.
- `examples/` holds readable documents. Seeding them into `src/examples/` is how a type joins the showcase.
