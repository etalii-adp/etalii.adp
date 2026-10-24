---
id: standalone-cel
type: submodule-design
title: "CEL evaluator"
status: draft
parent: host-standalone
references:
  - disl
  - fbl
---
# CEL evaluator

`src/backend/EtAlii.Adp.Specification.Cel`, part of `host-standalone`.

## Responsibility

Evaluates CEL expressions for FBL and DISL alike, including the DISL helper library and user functions.

## Rules

- References nothing. CEL is the one expression language (constitution III); hosts never invent one.
