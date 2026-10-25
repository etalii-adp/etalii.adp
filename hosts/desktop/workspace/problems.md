---
id: desktop-problems
type: submodule-design
title: "Problems: findings per project"
status: draft
parent: desktop-workspace
depends-on:
  - desktop-core
---
# Problems: findings per project

`crates/adp-problems`, part of `desktop-workspace`.

## Responsibility

Findings, validated and cached per project in the state folder as one JSON file each, ported from `EtAlii.Adp.Problems`.

## Rules

- A missing, unreadable or other-version cache reads as never validated, not as an error.
- Validating a file, a folder or the project replaces exactly that scope's findings. A finding whose file changed since is reported as stale.
- At most 1000 findings are reported, and the counts cover all of them.
