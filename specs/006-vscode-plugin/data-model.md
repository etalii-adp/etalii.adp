# Data Model: The ADP Plug-in for Visual Studio Code

The models of the two diagram types are the definitions' own (`definitions/diagrams/*.dis`); they are not repeated here. This document holds what the plug-in adds around them.

## Text

- **LineDocument**: a file's text as lines, each with its own ending (`\r\n`, `\n` or none on the last). Never normalised.
- **Splice**: `{ target, startLine, endLine, lines }`, replacing a range of whole lines; `target` is `body` or `registration`. A new line takes the ending its document already uses, CRLF for a new document. An edit is an ordered list of splices applied as one undo step.

## Registration (`.adp`)

As FBL section 8 defines it. Fields the plug-in reads: `origin` (first line), `body` (path relative to the registration; absent means the file of the same name beside it, by the diagram type's extension), `layout` (a block of `<id>: <x> <y>`). The plug-in writes only the `layout` block, by splice, and creates a registration with the origin line and that block when a behavior model first needs one.

## Frame

- **DiagramType**: `origin`, `displayName`, `viewType`, `extensions`, `shared` (true for Markdown), `suggests(text)` (does a shared file look like this type), `newDocument(name)`, and the functions of [contracts/frame.md](contracts/frame.md).
- **Model**: a diagram type's parsed document. Opaque to the frame except for `findings` and `readOnly` (true when the body could not be read at all).
- **Finding**: `{ rule, severity, message, line }`; severity is `error`, `warning`, `information` or `hint`.
- **ViewModel**: `{ elements, relations, bounds, chrome }`.
  - **Element**: `{ id, type, x, y, width, height, label, tooltip, payload }`; `payload` carries what the type's notation needs (a trend's boundaries and visible phases, a behavior node's keyword and family, `dashed`).
  - **Relation**: `{ id, type, from, to, fromAttachment?, toAttachment?, hidden }`.
  - **Chrome**: what the canvas shows around the drawing: ruler declaration, tags in use, legend entries, the compact switch.
- **ViewOptions**: per open editor, never saved: `filterTags`, `filterMode` (`any`, `all`), `compact`, `viewport`.
- **Selection**: ids of selected elements and relations, per editor.
- **ToolboxEntry**: `{ id, label, description, icon }`.
- **Form**: groups of fields for a selection. **Field**: `{ id, label, control, value, options?, readOnly, visible }`; `control` is `text`, `multiline`, `number`, `choice`, `slider`, `tags` or `readonly`.
- **Action**: `{ id, label, shortcut?, danger?, enabled }`, for context menus and commands.
- **EditRequest**: one of `drop` (toolbox entry at a point), `move`, `resize`, `connect`, `moveEnd`, `rename`, `setField`, `action`, `handle` (a shape handle such as a phase boundary), each naming the elements it concerns.
- **EditOutcome**: `{ splices }`, or `{ refusal }` with the definition's sentence, or `{ confirm: { title, message, danger }, then }`.

## State and lifetimes

| State | Lives in | Lifetime |
|---|---|---|
| The model | the text document (and the registration) | the file |
| Dragged positions of a behavior model | the registration's `layout` block | the file |
| Filter, compact, viewport, selection | the webview and its editor | until the editor closes; never written |
| Findings | the diagnostic collection | while the document is open |

## Rules carried from the specification

- A model is never written when `readOnly` is true (FR-011).
- An `EditOutcome` with splices changes only the lines its splices name (FR-010); applying no splices leaves the file byte-identical (FR-009).
- A refusal changes nothing (FR-035).
