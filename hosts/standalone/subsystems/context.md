---
id: standalone-context
type: submodule-design
title: "Context: selection and actions"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-sessions
  - standalone-history
  - standalone-projects
---
# Context: selection and actions

`src/backend/EtAlii.Adp.Context`, part of `host-standalone`.

## Responsibility

What is selected and what can be done with it: selection, actions, properties and prompts. `ContextService` is the single owner of a connection's selection and pushes it over the connection's stream, with the resolved chain and the innermost level's actions in the same message.

## Rules

- Something becomes selectable through an `IContextSourceResolver`, never through a bespoke RPC.
- Actions come from `IContextActionProvider` per `ContextScope` and reach the ribbon, the context menu and the keyboard through one path. `IContextPropertyProvider` fills the property grid.
- Consumers are pure subscribers that call only `ExecuteAction`. To carry more, extend the chain (`none | action | child`) rather than add a parallel message.
- If a feature needs a change inside the context service itself, the abstraction is wrong: fix the abstraction, don't special-case the feature.
- It compiles against `Grpc.Core.Api` only.
