# Contract: Resolution, Load-Time Validation, Backlinks and Findings (FBL 0.23, sections 13.2 to 13.6)

## Workspace and index

The **workspace** is the root folder the host has open that holds the consuming document (several roots: the one that holds it). A host keeps an index of the workspace's documents of tool types whose bindings declare `document.id`: per document its path, file name and id, and per linkable element its id and name. Resolution reads only this index and the target body, never outside the root.

## Resolution of one link

1. Parse (link-form.md). Failure: `link.malformed`, the value kept as written.
2. Candidates = documents whose id equals the link's `document-id`. If exactly one: that document.
3. Otherwise narrow by name: among the candidates when there are several, else among all documents in the workspace, keep those whose file name equals `document-name`. Exactly one: that document. Several: `link.ambiguous-document`. None: `link.broken-document`.
4. In the target, the element whose id equals `element-id` (ids compared as the target type's `compare` says). None: `link.broken-element`. Several (a duplicate id in the target): `link.ambiguous-document` naming the element.

## Load-time validation (FR-002, FR-013, FR-026)

When a consuming document is loaded, in one undoable step:

0. If its binding declares `document.id` and the body has none, write a new id.
1. Convert a body in an older form its companion names (the knowledge file, R9).
2. Resolve every link.
3. For each resolved link, rewrite any part that differs: `document-id` (resolved by name), `document-name` (renamed or moved), `name` (the name property's current value; filled in when absent).
4. Report the findings of the unresolved links.

A document opened read-only is resolved and shown but not written. When nothing differs, nothing is written and no step is recorded. While the document is open, the host follows changes to target documents and shows the current names and `shows` values (FR-014) without writing.

## Backlinks (FR-017, FR-018)

The links that resolve to an element, computed from the index over the whole workspace and never stored. Deleting an element with backlinks says their number first. A relation's `backlinkName` shows them on the target as a column of that name.

## Findings

| Code | Severity | Message | Fixes |
|---|---|---|---|
| `link.malformed` | Error | "'<text>' is not a link." | Remove the link |
| `link.broken-document` | Warning | "No document '<name>' with id '<id>' is in the workspace." | Pick another element (lookup); remove the link |
| `link.broken-element` | Warning | "'<name>' is no longer in '<document>'." | Pick another element in that document (lookup); remove the link |
| `link.ambiguous-document` | Warning | "<n> documents are '<name>' with id '<id>': <paths>." | Choose one: the link resolves to it and every other candidate is given a new id (each in its own body, by its own load-time step when it is next loaded, and at once when it is open) |
