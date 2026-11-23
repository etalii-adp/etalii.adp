# Data Model: Links Between Tools

| Entity | Fields | Rules |
|---|---|---|
| **Document id** | 8 characters of `0-9a-z` (new); any id matching the binding's pattern (existing) | One per document, in the body (R3). Assigned at load when missing. A second document with the same id is legal (a copy) and handled by resolution. |
| **Element id** | as the tool type's `persistence.ids` makes it | Unique within its document (FR-004); new ids 8 characters of `0-9a-z`. |
| **Link** | `documentId`, `documentName`, `elementId?`, `nameProperty?`, `name?` | Text form in [link-form.md](contracts/link-form.md). Stored only in the consuming document. A knowledge relation's `target` is a link without `elementId`. |
| **Linked element** (diagram) | the type's own attributes, plus `link` | Its label is the target's current name; its `shows` are the target's current values; deleting it deletes only it. |
| **Relation property** (knowledge) | `target` (document link), `limit`, `backlinkName?` | Cells hold links into `target`. `limit: one` holds at most one. |
| **Backlink** | consuming document, linked element or row | Computed from the workspace index; never stored. A relation with `backlinkName` shows its backlinks on the target as a column of that name. |
| **Workspace** | root folder | The folder of the host that holds the consuming document; resolution never leaves it. |
| **Finding** | `link.malformed`, `link.broken-document`, `link.broken-element`, `link.ambiguous-document` | At the link's entry; severities and fixes in [resolution.md](contracts/resolution.md). |

## States of a link at load

```text
text ──parse──▶ malformed (finding, kept as written)
  │
  ▼
by id ──one──▶ document ──element found──▶ resolved ──parts differ──▶ rewritten (one undoable step)
  │                         └─not found─▶ broken-element (finding)
  ├─none or several──▶ by name ──one──▶ document (as above; id part rewritten)
                              ├─several──▶ ambiguous (finding; pick ⇒ other candidates re-id'd)
                              └─none────▶ broken-document (finding)
```
