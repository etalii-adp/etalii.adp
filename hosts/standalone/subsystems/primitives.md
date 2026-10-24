---
id: standalone-primitives
type: submodule-design
title: "Shared primitives (EtAlii.Adp)"
status: draft
parent: host-standalone
---
# Shared primitives (EtAlii.Adp)

`src/backend/EtAlii.Adp`, part of `host-standalone`.

## Responsibility

The primitives every other project shares: `ShortGuid` (the identity type, fixed-length base36), `ToolOrigin`, `ProjectRoot`/`ProjectPath`, and `ToolDefinitionScan`, the reflection scan that discovers the tool definitions of all three kinds.

## Rules

- References nothing. Everything may reference it.
- Wherever an id is needed it is a `ShortGuid`.
- A name for something that serves every kind says *tool* (`ToolDefinitionScan`); a name for one kind says that kind.
