---
id: notion-store
type: submodule-design
title: "Store: a Notion database as the document"
status: draft
parent: host-notion
depends-on:
  - notion-fbl
  - notion-disl
  - notion-history
---
# Store: a Notion database as the document

`src/store/`, part of `host-notion`.

## Responsibility

The open document of a Notion database. Its parts:

- `document`: states, edit, undo, redo, prepare.
- `schema`: binding to Notion properties, adding `Kind` and `Order`.
- `rows`: rows to and from the FBL body, within Notion's value limits.
- `writes`, `changes`: splices to row writes.
- `drift`: the concurrent-edit check.
- `internal`: properties hidden in views.
- `embed`: finding and patching the embed block.
- `session`: the token, refresh and grant polling.
- `notion`: the API calls.

## Rules

- **The rows are the document.** The FBL body is rebuilt in memory by replaying the rows into the binding's template, and each splice maps to a row write.
- Only `session` and `notion` know the service or the token.
- A drift check runs before every write and on focus. Notion has no conditional write and edit times only to the minute, so a race window remains.
