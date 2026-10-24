---
id: standalone-client-editors
type: submodule-design
title: "Text editor plumbing (client)"
status: draft
parent: host-standalone
depends-on:
  - standalone-api
---
# Text editor plumbing (client)

`src/client/src/editors`, part of `host-standalone`.

## Responsibility

The shared text editor on CodeMirror 6 (`BaseTextEditor`, `TextEditorPanel`): highlighting, findings and completion from the backend's `IEditorAnalyzer`, and schema lookup.

## Rules

- Names no format. Format knowledge stays in the editor modules and their backend analyzers.
