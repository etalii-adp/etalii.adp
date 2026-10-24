---
id: standalone-api
type: submodule-design
title: "gRPC contracts"
status: draft
parent: host-standalone
---
# gRPC contracts

`src/api/*.proto` and the generated stubs, part of `host-standalone`.

## Responsibility

The stable boundary between backend and client: authentication, connection, context, deltas, designers, diagrams, editors, elements, hierarchy, problems, projects, shared and workspace. `.proto` files are the primary API documentation.

## Rules

- One source of truth: neither side keeps its own copy of a contract.
- A module adds its own `api/*.proto` for its payloads (carried as `Any`) and never edits a core `.proto`.
- Two legs: unary calls from client to backend, and one server-streaming `Watch` from backend to client. Calls that act on a connection carry its `watch_id`.
- What rides the stream are deltas (add, remove, update). The client reconciles them against its own unsaved edits and never silently discards those edits.
