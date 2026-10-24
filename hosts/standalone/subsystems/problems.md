---
id: standalone-problems
type: submodule-design
title: "Standalone: Problems"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-documents
  - standalone-diagram
  - standalone-context
  - standalone-hierarchy
---
# Standalone: Problems

`src/backend/EtAlii.Adp.Problems`, part of `host-standalone`.

## Responsibility

Errors and warnings about the workspace's documents, kept current while a project is open and stored under the application-data root.

## Rules

- Host-only.
- Tests that boot the host use a temporary problem store (guard `ProblemStoreIsolation.Tests`).
