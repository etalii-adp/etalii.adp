---
id: standalone-problems
type: submodule-design
title: "Problems"
status: draft
parent: standalone-workspace-services
depends-on:
  - standalone-primitives
  - standalone-documents
  - standalone-diagram
  - standalone-context
  - standalone-hierarchy
---
# Problems

`src/backend/EtAlii.Adp.Problems`, part of `standalone-workspace-services`.

## Responsibility

Errors and warnings about the workspace's documents, kept current while a project is open and stored under the application-data root.

## Rules

- Host-only.
- Tests that boot the host use a temporary problem store (guard `ProblemStoreIsolation.Tests`).
