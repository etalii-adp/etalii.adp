---
id: standalone-service
type: submodule-design
title: "Backend host (EtAlii.Adp.Backend.Service)"
status: draft
parent: host-standalone
depends-on:
  - standalone-authentication
  - standalone-workspace
  - standalone-problems
  - standalone-context
  - standalone-hierarchy
  - standalone-projects
  - standalone-diagram-modules
  - standalone-designer-modules
  - standalone-editor-modules
---
# Backend host (EtAlii.Adp.Backend.Service)

`src/backend/EtAlii.Adp.Backend.Service`, part of `host-standalone`.

## Responsibility

The one executable. It composes the core (`AddSignIn`, `AddProjects`, `AddContext`, `AddHierarchy`, `AddWorkspace`, `AddCommands`, `AddProblems`, `AddGrpc` with `SessionInterceptor`) and the discovered tool definitions, serves the built client as static files, and in development proxies to the Vite dev server. It holds `appsettings.json` and `appsettings.developer.json`.

## Rules

- Composition only: registering a resolver, provider or module is one line in `Program.cs`, and the host holds no domain logic.
- Service → core, never the reverse. Modules are referenced by wildcard project references, so adding one changes no host file.
- Only the host carries ASP.NET Core and the gRPC server.
- It runs as a console application, the primary way to run and debug the backend. Windows-service and Docker hosting are intended and not set up.
