---
id: standalone-documents
type: submodule-design
title: "Documents"
status: draft
parent: standalone-foundation
depends-on:
  - standalone-primitives
  - standalone-files
---
# Documents

`src/backend/EtAlii.Adp.Documents`, part of `standalone-foundation`.

## Responsibility

Open documents and their contents: the shared wire vocabulary, `LineDocument`/`LineSplice` for modules without an FBL binding, `LifecycleDocumentStore<TBody,TModel>`, `WritableDocumentLifecycle`, `IDiagramDocumentStore`, `IEntryRenameFollower` and `AdpFileWriter`.

## Rules

- **Concurrent saves to one destination take turns** in `AdpFileWriter.Save`, keyed by the normalised full path (case-insensitive on Windows). They are not retried, and no sharing mode is changed to avoid a failure. Why: two in-process publishes race inside `File.Replace` (measured at 1009 failures in 3000 saves). A save that had to wait logs a warning naming the path, so a second writer is never hidden. Revisit only if saves race across processes.
- A sharing violation from a reader that shares only `Read` fails at once, because that reader asked for the file not to change.
