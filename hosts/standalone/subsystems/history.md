---
id: standalone-history
type: submodule-design
title: "History: commands and undo"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-documents
---
# History: commands and undo

`src/backend/EtAlii.Adp.History`, part of `host-standalone`.

## Responsibility

Commands and undo/redo. Anything that changes state is an `ICommand` with an `ICommandHandler<TCommand>`, dispatched through `IHistoryStack`.

## Rules

- A service, gRPC method or action provider never changes state inline. It builds a command and dispatches it.
- A handler reports the command that reverses it as `CommandResult.Inverse`. A deliberately non-undoable change returns plain `Success()` and documents why.
- Handlers revalidate their own preconditions, because undo and redo dispatch them long after the original call.
- A rejected command is a `CommandResult` carrying a sentence for the user. Exceptions are for programming errors only.
- Handlers live in the `Commands/` folder of their area and are registered through `AddCommands`, so a test wires the same pipeline as the host.
