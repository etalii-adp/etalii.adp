---
id: standalone-workspace
type: submodule-design
title: "Workspace services and streams"
status: draft
parent: host-standalone
depends-on:
  - standalone-diagram
  - standalone-context
  - standalone-history
  - standalone-hierarchy
  - standalone-projects
  - standalone-editor
  - standalone-designer
  - standalone-sessions
---
# Workspace services and streams

`src/backend/EtAlii.Adp.Workspace`, part of `host-standalone`.

## Responsibility

The gRPC services a connection calls (`DiagramService`, `EditorService`, `DesignerService`, `WorkspaceService`), the connections and their streams (`WorkspaceConnection.OpenStreamAsync`, `WorkspaceConnections.Find`), the table wire, the editor plumbing and the reload bridge.

## Rules

- **One server-streaming `WorkspaceService.Watch` per tab.** A feature that pushes something new adds a member to that stream's message, never a second stream. Why: over HTTP/1.1 every live stream holds one of the browser's six connections per origin, and three streams per tab once wedged a second tab (`two-tab-connection-wedge`).
- Diagrams, tables and hierarchy surfaces join and leave the stream through unary open/close calls, under a stream id the client generates.
- The stream's first message is always the current state, so a client that reconnects with the same id is brought back to the current state without a protocol of its own.
- Domain services (`HierarchyWatch`, `ContextWatch`, `DiagramPump`) are shared, and no gRPC service is handed another (guard `GrpcServiceDelegation.Tests`).
- The older `ContextService.Watch`, `HierarchyService.WatchHierarchy` and `DiagramService.Open` are still declared for integration tests. The client opens none of them.
- Host-only.
