# Data Model: The ADP Plug-in for Visual Studio Code

The things the plug-in holds while it runs and the files it reads and writes. The two diagram types' models are given as far as the plug-in's structure needs them; their fields, defaults and rules are the definitions' ([gartner-hype-cycle-graph.dis](../../definitions/diagrams/gartner-hype-cycle-graph.dis), [agent-behavior-modelling.dis](../../definitions/diagrams/agent-behavior-modelling.dis) and their companions) and are not repeated here.

## Files

| File | Who owns its format | Read | Written |
|---|---|---|---|
| `*.ghg` | the hype cycle definition (YAML, header `gartner-hypecycle-graph: 1`) | always, tolerantly | by line splices, when the document is saved |
| `*.md` | its author; the tree's place and form are the behavior model definition's | when opened as a behavior model | by line splices, the tree's lines only |
| `*.adp` | FBL section 8 | for its origin and body; for a behavior model also its `layout:` block | for a behavior model only, by splices, when the Markdown is saved; created on the first placement |
| `package.json` | Visual Studio Code | | [contracts/package-manifest.md](contracts/package-manifest.md) |

## Frame entities

### Diagram type

A registered [DiagramType](contracts/frame-api.md): `origin`, `displayName`, `viewType`, `usesRegistration`, and its core, host and view parts. Exactly two exist after this feature. Identity is the origin, which is unique, and from which the view type and every other registered identifier is derived (FR-003).

### Line document

A text as the frame sees it: lines, each with its own ending (`\n`, `\r\n` or none for the last), the dominant ending, and whether a byte-order mark leads it. Joining the lines gives the text back byte for byte. Never held beyond one read or one edit; the text itself lives in Visual Studio Code's `TextDocument`.

### Splice

One replacement: a start line, a count of lines removed, the lines put in their place. An edit is an ordered list of splices over one text, none overlapping. Its inverse is computed from the text it was applied to.

### Reading

What a diagram type makes of a text and a registration: a model, findings, and optionally the sentence that makes the document read-only. Made again from scratch after every change.

### Finding

| Field | Note |
|---|---|
| `rule` | the definition's rule id, such as `ghg.boundary-order` or `abm.no-keyword`; reading problems use the definition's id for them (`ghg.unreadable-entry`) |
| `severity` | `error`, `warning` or `information`, as the definition gives it |
| `line`, `endLine` | the entry or item it concerns, counted from 0 |
| `message` | the definition's sentence |

Published as a diagnostic with the source "ADP" and the rule id as its code. Never blocks saving.

### Registration

The parsed `.adp`: the origin, the headers in their order (known: `body`, `view`; others kept), the layout entries (`id` to `x`, `y`), and the unbound lines after the blocks. A **registration change** is a list of layout entries to set, to remove or to rename, or "remove the block".

State of a session's registration:

```text
absent ──first placement──▶ pending(new) ──save──▶ on disk
on disk ──edit──▶ pending(changed) ──save──▶ on disk
pending ──revert or close unsaved──▶ what is on disk (or absent)
pending ──undo of the edit that made it──▶ the state before that edit
```

A pending registration is never written without the document being saved. A stale entry (an id the model no longer has) is reported and removed with the next write, as FBL 8.5 states.

### Document session

One per open document that at least one diagram shows. Created when the first diagram editor for it resolves, disposed when the last closes.

| Field | Note |
|---|---|
| `document` | Visual Studio Code's `TextDocument`; the session never copies its text |
| `type` | the diagram type |
| `reading` | the current reading and the document version it was made from |
| `registration` | on disk and pending, for a type that uses one |
| `editLog` | below |
| `views` | the diagram editors showing it, and which one has the focus |
| `selection` | per view, the selected ids |

### Edit log entry

| Field | Note |
|---|---|
| `before`, `after` | hashes of the document's text around one edit the session applied; equal for a marker edit |
| `registrationBefore`, `registrationAfter` | the registration's text around it |
| `label` | what the edit was, for the test seam and for logs |

Two stacks, done and undone. A change the platform marks as an undo, taking the text from the top done entry's `after` to its `before`, moves the entry to the undone stack and restores `registrationBefore`; a redo does the reverse; any other change clears the undone stack. An entry is only ever matched at the top of its stack, so a typed edit in the text editor between two diagram edits cannot be taken for one of them.

### Intent

A request to change the document, made by a view: a `kind` owned by a diagram type (`ghg.setSpan`, `abm.arrange`) or by the frame (`frame.remove`, `frame.rename`), its arguments, an id, and the document version it was computed from. Stale by version means dropped, not applied.

### Edit result

Splices with an optional registration change and what to select afterwards; or a refusal with its sentence; or a question with its title, sentence and whether it is styled as dangerous. A question is asked once, and the intent is run again with the answer.

### View state

What a diagram shows that is not in any file: pan and zoom, the selection, and what the diagram type adds (the tag filter with Any or All, and Compact, for the hype cycle). Lives in the webview, starts at its defaults with every opening, and is never written anywhere (FR-019).

### Scene

What a diagram type's view draws for a model, a view state and a viewport: elements with an id, a kind, bounds, a path or shape, classes, labels and tooltips, and relations with their route. Pure data, so tests can compare it.

### Toolbox entry and property field

A toolbox entry: id, label, icon, description, group. A property field: label, control (one of text, multi-line text, number, choice, slider with labelled stops, tag chips with suggestions, read-only), value, options, whether it is shown, and the intent a change sends. Both are computed in the host from the model and the selection.

## Gartner hype cycle graph

Model: the diagram's `unit`, and four lists, each entry with the line range it was read from: trends, triggers, notes, influences. Ids are unique across all four. Derived, never stored: a trend's drawn boundaries (stored or spread), its visible phases, the canvas position of everything (from the scale: 4 canvas units per step, 1900-01 at 0, rows 56 apart).

Intents: add a trend, a trigger or a note; rename; set a placement (start and row, by a move); set a span (start and stop, by a resize); set the phase count; set a boundary; even the phases; add an influence with both ends; set one end's attachment; remove an influence; set tags; set a description; set a note's text; set a note's size and position; set the unit; remove an element (which asks when influences go with it); arrange. Every one answers with splices in the `.ghg` and never with a registration change.

## Agent Behavior Modelling

Model: the tree's roots; each node with its kind (one of eleven), label, attempts for a Retry, notes, whether its keyword was missing, its children in order, its place (`1.2.1`) as id, and the line range of its item and of its whole subtree; and where the Behavior section is, or that there is none. Derived: each node's computed position (200 by 60, 28 between siblings, 56 between levels), then its drawn position after the registration's row heights are applied, never closer than 16 to its parent.

Intents: add a node of a kind at a drop point; rename; set the kind; set the attempts; set the notes; move earlier; move later; arrange a node (a drag: its new index among its siblings and its row's height, in one step); re-parent; remove with everything under it; arrange the diagram. Add, rename, kind, attempts, notes, the keyboard's reorder, re-parent and remove answer with splices in the Markdown, and a registration change where stored ids move. A drag that only changes a row's height, and "Arrange diagram", answer with a registration change and no splice, which the session records with a marker edit.

## Pipeline entities

**Check run**: one run of the Build workflow for a commit; its jobs, its two test reports, its skipped-test summary, and, when the plug-in was packaged, the `.vsix` it offers. **Development build**: the one release with the tag `development`; a pre-release with one asset; moved only forward. Both are specified in [contracts/ci-interface.md](contracts/ci-interface.md).

## Documents in the VS Code repository

| File | Content |
|---|---|
| `README.md` | what the plug-in brings; installing from a file; build, test, debug, package |
| `docs/tools.md` | the tool catalogue in the standalone format: one row per diagram type with its state, origin, name and kind (FR-059) |
| `docs/parity.md` | the parity record: one section per diagram type and one for the frame, each entry a behaviour, what this host does instead, and why (FR-007, FR-060) |
| `examples/`, `fixtures/`, `definitions/` | vendored, each with a `PROVENANCE.md` |
