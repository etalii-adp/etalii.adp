---
id: standalone-guards
type: submodule-design
title: "Standalone: Guards and gates"
status: draft
parent: host-standalone
---
# Standalone: Guards and gates

`src/backend/EtAlii.Adp.Repository.Tests`, per-module guard tests, client guard tests, `.github/tools`, `docs/guards.md`, part of `host-standalone`.

## Responsibility

The tests that keep the repository's rules true. Tree-wide guards cover documentation links, the architecture pages, the shape of file access, line endings, the dependency inventory, example registrations and gRPC service delegation, among others. Module guards and client guards sit beside them. They are backed by four local gates and CI (`build.yml`: backend tests, style, client, gate scripts, InspectCode, terminology, release; plus a nightly stability run).

## Rules

- **Every bug leaves a guard**, and the guard is seen failing first.
- `docs/guards.md` is the inventory and is itself guarded (`GuardInventory.Tests`).
- No JetBrains Rider warning in C# (constitution VI). InspectCode is authoritative, and a run that could not see the code counts as neither clean nor dirty.
- The architecture pages are descriptive, and their counts are guarded. Where a page and a rule disagree, the rule wins.
