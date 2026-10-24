---
id: host-standalone
type: module-design
title: Standalone host (etalii.adp.ide.standalone)
status: draft
parent: hosts
depends-on:
  - disl
  - desl
  - ded
  - fbl
  - definitions
references:
  - did
  - edsl
---

# Standalone host (`etalii.adp.ide.standalone`)

The standalone web workspace. It opens tools (diagrams, designers and editors) from a user's own workspace folder, draws them and lets the user edit them, while the documents stay plain, diffable files in that folder. It is the host with the widest tool coverage and the worked example the other hosts port from, but it is **not the reference**: its technical shape is how this host works, not a standard (goal `adp`). Sources: the repository's `CLAUDE.md`, `.spec-workflow/steering/` and `docs/architecture.md`. Where this node and those disagree, they win and this node is stale.

## State

Available as alpha releases, a platform-neutral ZIP from each green `develop` build. `docs/tools.md` is the catalogue of record; as of 2026-10-24 it lists 11 tool types implemented, 22 prototypes and 3 in progress, out of 102 identified. It runs locally as a console application with a browser client. Windows-service and Docker hosting, a chromeless window, remote hosting and partial embedding in VS Code are intended and not built; nothing assumes they never arrive.

## Shape

```mermaid
flowchart LR
  browser["Browser client<br/>src/client"] -->|unary Action calls| process["One ASP.NET Core process<br/>EtAlii.Adp.Backend.Service"]
  process -->|one server-streaming Watch per tab| browser
  process <--> files[("Workspace folder")]
```

- **One process.** ASP.NET Core serves the built client and hosts the gRPC-Web endpoint. In development it proxies to Vite for hot reload. In production no Vite runs.
- **The filesystem is a boundary, and only the backend crosses it.** Access is scoped to workspace folders the user opened.
- **`.proto` is the stable boundary** between backend and client (`standalone-api`). Either side may change freely while the contract holds.
- **Core never depends on a tool type.** Modules are discovered by reflection, and deleting a module's folder removes the type.

## Subsystems

| Node | Project or folder | References (production) |
|---|---|---|
| `standalone-primitives` | `EtAlii.Adp` | — |
| `standalone-service` | `EtAlii.Adp.Backend.Service` | everything; all modules by wildcard |
| `standalone-authentication` | `EtAlii.Adp.Authentication` | primitives, Sessions |
| `standalone-files` | `EtAlii.Adp.Files` | primitives |
| `standalone-documents` | `EtAlii.Adp.Documents` | primitives, Files |
| `standalone-history` | `EtAlii.Adp.History` | primitives, Documents |
| `standalone-context` | `EtAlii.Adp.Context` | primitives, Sessions, History, Projects |
| `standalone-problems` | `EtAlii.Adp.Problems` | primitives, Documents, Diagram, Context, Hierarchy |
| `standalone-projects` | `EtAlii.Adp.Projects` | primitives, Sessions, Documents |
| `standalone-sessions` | `EtAlii.Adp.Sessions` | primitives, Diagram, Designer, Editor, History |
| `standalone-hierarchy` | `EtAlii.Adp.Hierarchy` | primitives, Context, Documents, Diagram, Projects, Editor, Designer, Specification.Fbl |
| `standalone-layout` | `EtAlii.Adp.Layout` | — |
| `standalone-diagram` | `EtAlii.Adp.Diagram` | primitives, Documents |
| `standalone-diagram-modules-base` | `EtAlii.Adp.Diagram.Modules` | Diagram, Context, History, Hierarchy, Layout, Sessions, Specification.Disl |
| `standalone-editor` | `EtAlii.Adp.Editor` | primitives, Documents |
| `standalone-designer` | `EtAlii.Adp.Designer` | primitives |
| `standalone-workspace` | `EtAlii.Adp.Workspace` | Diagram, Context, History, Hierarchy, Projects, Editor, Designer, Sessions |
| `standalone-cel` | `EtAlii.Adp.Specification.Cel` | — |
| `standalone-spec-json` | `EtAlii.Adp.Specification.Json` | — |
| `standalone-fbl` | `EtAlii.Adp.Specification.Fbl` | primitives, Cel, Json |
| `standalone-disl` | `EtAlii.Adp.Specification.Disl` | Cel, Fbl, Json |
| `standalone-api` | `src/api/*.proto` | — |
| `standalone-canvas-library` | `src/client/src/canvas` | api |
| `standalone-table-library` | `src/client/src/table/library` | api |
| `standalone-hierarchy-surface-library` | `src/client/src/hierarchySurface/library` | api |
| `standalone-client-editors` | `src/client/src/editors` | api |
| `standalone-shell` | `src/client/src/shell`, `auth`, `pages` | api, the client libraries |
| `standalone-diagram-modules` | `src/diagrams/*` | core abstractions, never the host |
| `standalone-designer-modules` | `src/designers/*` | core abstractions, never the host |
| `standalone-editor-modules` | `src/editors/*` | core abstractions, never the host |
| `standalone-guards` | `EtAlii.Adp.Repository.Tests`, client guard tests, gate scripts | — |

- **Direction:** Service → core, never the reverse. Only the service and the host-only projects (Authentication, Problems, Workspace) carry ASP.NET Core or the gRPC server. A module never reaches them.
- **Shape:** `src/backend/EtAlii.Adp.slnx` is a flat list of 152 projects (51 core, 86 diagram, 10 editor, 4 designer, 1 spanning), so the whole solution opens and builds in Rider.

## How it consumes the specifications

- DISL definitions and FBL bindings are **bundled byte for byte** into each module's `definition/` folder with `provenance.json` (revision and SHA-256), and never edited in the host.
- `standalone-disl`, `standalone-fbl` and `standalone-cel` interpret them generically: palette, menus, property rows, findings, drops, operations and splices.
- **There is no generic "DISL-only" path yet.** Every tool type is still a module, and a module's residue (what the languages cannot express) is listed in a companion beside its definition. This is approach 2 of `architecture` *Tool-type approaches*.
- Designers name their surface in DESL. Hierarchical-requirement documents are recognised by their DED envelope.
- Editors are host code (approach 1). `src/editors/{json,xml}/readme.md` list what an EDSL specification would have to state (etalii.adp issue 154).
- The host has no ATD code. In the spec 035 plan, adopting ATD in standalone is a later phase.

## Decisions

From `tech.md`'s decision log, each with its why:

1. **Files, not a database:** diagrams stay reviewable and mergeable. Revisit only for hosted or multi-user use.
2. **gRPC between client and backend:** typed contracts and native streaming suit pushing changes to open clients.
3. **.NET backend:** the team's Rider, F5-first workflow.
4. **React + TypeScript client, not Blazor:** a more mature diagramming ecosystem. The canvas is SVG; tech.md's "WebGL-rendered" wording is stale.
5. **ASP.NET Core hosts the React build:** one process in production and no JS-interop boundary on the delta path.
6. **One context service** (`standalone-context`): selection is cross-cutting, so it is resolved once and pushed.
7. **Commands for every state change** (`standalone-history`): undo is a property of the system and not of each feature.
8. **Unary `Action` + streaming `Watch`:** grpc-web limits. This also makes each call authorizable and retryable, and gives per-connection state an owner and a lifetime.
9. **Bottom-up implementation order:** data model, then persistence, wire, UI, and the remaining logic. Each layer is tested before the next.
10. **No orphaned types:** measured, not assumed. Re-measure before hunting dead code.
11. **Concurrent saves take turns:** `standalone-documents`.

## Process

- **Planning:** standalone plans in **spec-workflow** (`.spec-workflow/`, with the approval dashboard and steering documents), not in this repository's Spec Kit. Its nine finished archived specs were migrated into `specs/016-*` to `specs/024-*` here.
- **Transition:** ADP is moving its planning to ThinkRail. Until that is complete, spec-workflow stays authoritative for this host and is neither disregarded nor duplicated here (goal `adp`).
- **Team:** one Scrum master, four Developers (one per specification, exclusively), two Architects and two Testers (`steering/roles.md`).
- **Gates and CI:** four local gates (`npm test`, typecheck, `dotnet format style`, `dotnet test`) and CI with InspectCode (constitution VI). See `standalone-guards`.
