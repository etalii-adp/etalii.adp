---
id: standalone-workspace-services
type: module-design
title: Workspace services
status: draft
parent: host-standalone
depends-on:
  - standalone-foundation
  - standalone-tool-kinds
  - standalone-specification-runtimes
  - standalone-api
---

# Workspace services

Everything a connected browser tab works with: sign-in and sessions, the lifetime of a connection and its project, selection and actions, known projects, the workspace tree, problems, and the gRPC services that serve all of it over one stream per tab.

## Members

| Node | Project | References (production) |
|---|---|---|
| `standalone-sessions` | `EtAlii.Adp.Sessions` | primitives, Diagram, Designer, Editor, History |
| `standalone-authentication` | `EtAlii.Adp.Authentication` | primitives, Sessions |
| `standalone-context` | `EtAlii.Adp.Context` | primitives, Sessions, History, Projects |
| `standalone-projects` | `EtAlii.Adp.Projects` | primitives, Sessions, Documents |
| `standalone-hierarchy` | `EtAlii.Adp.Hierarchy` | primitives, Context, Documents, Diagram, Projects, Editor, Designer, Specification.Fbl |
| `standalone-problems` | `EtAlii.Adp.Problems` | primitives, Documents, Diagram, Context, Hierarchy |
| `standalone-workspace` | `EtAlii.Adp.Workspace` | Diagram, Context, History, Hierarchy, Projects, Editor, Designer, Sessions |

## Boundary

- **Per connection, and dies with it.** State is keyed by the connection id that the stream and the unary calls share. The one scope a tab's stream opens, held by `standalone-sessions`, acquires everything a connection holds and is the only thing that releases it.
- **One stream per tab.** Anything the backend pushes rides `WorkspaceService.Watch` as a new member, never a second stream (`standalone-workspace`).
- **One context service.** Selection and actions are resolved once and pushed. Features extend the context through resolvers and providers, never through bespoke calls (`standalone-context`).
- **Host-only projects:** Authentication, Problems and Workspace may carry hosting packages. Tool modules never reach them.
- **Inward references only.** This layer references the foundation, the tool kinds and the FBL runtime, never a tool module and never the host process.
