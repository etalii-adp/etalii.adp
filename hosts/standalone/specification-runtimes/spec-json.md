---
id: standalone-spec-json
type: submodule-design
title: "Specification loader plumbing"
status: draft
parent: standalone-specification-runtimes
---
# Specification loader plumbing

`src/backend/EtAlii.Adp.Specification.Json`, part of `standalone-specification-runtimes`.

## Responsibility

What the DISL and FBL loaders share: the diagnostic a loader reports and its severity, JSON pointers, duplicate-key detection, scalar and property reading, and the language version.

## Rules

- References nothing. A loader reports diagnostics; it never throws on content.
