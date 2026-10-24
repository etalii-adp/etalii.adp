---
id: standalone-sessions
type: submodule-design
title: "Standalone: Sessions and connection lifetime"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-diagram
  - standalone-designer
  - standalone-editor
  - standalone-history
---
# Standalone: Sessions and connection lifetime

`src/backend/EtAlii.Adp.Sessions`, part of `host-standalone`.

## Responsibility

Every kind of session:

- **Sign-in:** the session store, the session context and the `SessionInterceptor` that checks every call.
- **Tool sessions:** the contracts of the three kinds with their factories and registries (`IDiagramSessionFactory`, `IEditorSession`, `IDesignerSession`, `ITableDesignerSession`, `IHierarchySurfaceSession`), plus the bases a module builds on (`DocumentDiagramSession<TBody,TModel>`, `TextEditorSession`).
- **Viewports:** the viewport registry.
- **Lifetime:** the lifetime of a connection and of the project it has open.

## Rules

- **The one scope a tab's workspace stream opens** acquires everything a connection and its project hold (history, problem watching, hierarchy model, context registrations, the connection slot), and it is the only thing that releases them.
- Per-connection state is keyed by the connection id and dies with the stream. It is never shared with another connection, not even the same user's on the same project.
- It references the family abstractions, never the reverse.
