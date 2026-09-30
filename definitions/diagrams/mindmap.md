# Mind map (`freeplane/mindmap`)

This is the companion to [`mindmap.dis`](mindmap.dis), the DISL specification of the Mind map diagram type. The `.dis` holds everything DISL can say: the one node type and its attributes, the derived branches, the notation, the toolbox and context actions, the property form, the rules and the operations. This file holds everything it cannot: the Freeplane `.mm` file format, the two-sided layout algorithm, per-viewer folding, sibling naming, links, the drag-to-re-parent gesture, and the places where the `.dis` could only approximate what the standalone implementation does.

Every statement here is tied to the source that shows it. Paths are in [etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone) on `develop` unless another repository is named; `src/diagrams/mindmap/` is abbreviated to `mindmap/`. "Req" refers to the standalone spec `mindmap-diagram`, which was removed from the tree and is read with `git show "ece03c36^:.spec-workflow/archive/specs/mindmap-diagram/requirements.md"` (and `design.md`, `tasks.md` beside it).

## Sources

| Source | What it contributed |
|---|---|
| `mindmap/backend/EtAlii.Adp.Diagram.Mindmap/` | The model, the `.mm` reader and writer, the layout, the commands, the context actions and properties, the validator, the view state and the session. |
| `mindmap/client/` (`MindmapCanvas.tsx`, `mindmap.css`, `mindmapModel.ts`, `readme.md`) | The notation, the declared actions and keys, the drag behaviour, the styling. |
| `mindmap/api/mindmap.proto` | The node payload on the wire. |
| `mindmap/examples/readme.md`, `mindmap/backend/EtAlii.Adp.Diagram.Mindmap.Tests/Fixtures/readme.md` | What real Freeplane files contain, and what the shipped examples do not exercise. |
| `.spec-workflow/archive/specs/mindmap-diagram/` (in history before `ece03c36`) | The requirements (Req 1-13), design and tasks; all 24 tasks are done. |
| `docs/tools.md` row `freeplane/mindmap` | Catalogue state: ⚗️ Prototype, kind Diagram. |
| Notion, "Tools" database, row "Mind map" | Purpose ("Lay out ideas as a tree of branches around one central topic, in the FreeMind/Freeplane format"), why specialized ("A mind map's value is its radial hierarchy; a dedicated tool keeps branches ordered and foldable while the .mm file stays readable by Freeplane"), focus areas "Clarity in textual data" and "Knowledge and semantics", family "Knowledge & informal modeling"; Standalone ⚗️ Prototype, IntelliJ ✅ Implemented. |
| [etalii.adp.ide.intellij](https://github.com/etalii-adp/etalii.adp.ide.intellij) `specs/001-freemind-mindmap-designer/spec.md`, module `freemind/` | How the IntelliJ host treats the same files differently (section 12). |
| Project conversation "FreeMind layout, panning, centering" (2026-09-28) | Peter's IntelliJ layout ruling: wider horizontal spread so branch curves never bend back, drag-to-pan on empty canvas, open centred on the root. |

## 1. Identity

- Origin tag `freeplane/mindmap`, display name "Mind map", description "Ideas branching from one central topic, for thinking a subject through rather than specifying it.", icon `mdi-family-tree`, body extension `.mm` (`Diagram.cs`).
- Freeplane is named as the vendor because it is the tool most associated with the `.mm` format; other mind-map tools (XMind, MindMeister, Coggle, FreeMind) would each get their own `<vendor>/mindmap` row if their formats were ever read (`docs/tools.md`, section 10).
- The DISL `language.id` is `net.etalii.adp.freeplane.mindmap`, because a DISL id cannot contain the `/` of the origin tag.

## 2. Files: registration and body

DISL's `persistence.files` describes the files of one diagram, but not the standalone host's two-file pair or its routing, so they are recorded here.

- A standalone diagram is a pair: `<name>.adp`, the registration, whose first line is the MIME type `freeplane/mindmap` (`mindmap/examples/example 1/mindmap.adp`), and `<name>.mm`, the body, a sibling with the same base name (Req 2.1, 2.2). No third file is ever written; anything ADP-specific that is ever needed goes into the `.adp` after the MIME line (Req 3.5, 12.4).
- An `.adp` routes by its MIME line (Req 2.3); a bare `.mm` without an `.adp` still opens, routed by extension, and no `.adp` is created for it (Req 2.7). An unknown MIME type is reported by name (Req 2.6); two definitions claiming one extension disable extension routing and report the ambiguity (Req 2.8).
- Renaming or moving the `.adp` moves the `.mm` with it as one undoable command (Req 2.10). Deleting the `.adp` deletes both after a confirmation that names both files, and is not undoable (Req 2.11).
- A missing or empty body opens as an empty map named after the file and is written by the first save (Req 2.5, 2.12; `MindmapDocumentStore.Parse`).
- A new diagram is created from the Add dialog under the `freeplane` vendor group, default name `mindmap`, then `mindmap-2` and so on; both files are written or neither (Req 1). Its body is one root node whose text is the base name: `<map version="freeplane 1.11.5">`, LF newlines, `<node TEXT="<name>" ID="ID_<short id>"/>` (`MindmapDocumentFactory.cs`).
- Other hosts need not use a registration file: IntelliJ opens the `.mm` alone (section 12).

## 3. The `.mm` format

`mindmap.dis` names the format `plugin:net.etalii.adp.freeplane.mm`, because DISL's persistence layer describes JSON-family DID definitions and a mind map is stored in Freeplane's own XML instead. The plugin's contract is this section.

### 3.1 The principle: the XML is the model

The XML a map was parsed from is the single source of truth. Reading a node reads its element; editing a node edits its element; saving writes the XML back rather than regenerating it. Everything ADP does not understand therefore survives exactly as it was (`_Model/MindmapNode.cs`, `MindmapDocument.cs`; Req 3.2, 3.3). This is why DISL's canonical-form, ordering, `omitDefaults` and id-generation settings do not describe the stored file; they are set in the `.dis` only so the specification is complete.

### 3.2 Structure

- The document element is `<map>`; it holds exactly one `<node>`, the central topic. Anything else - no `<map>`, zero or several root nodes, malformed XML - is not a map and fails with a message naming the file; only that diagram fails, never the workspace (`MindmapDocument.Parse`, `MindmapFormatException`; Req 3.8).
- Non-node elements may precede the root node: a genuine Freeplane 1.12 save writes `<bookmarks/>` before it, so the root is found by name, not by position (Fixtures readme, item 4).
- Child nodes are nested `<node>` elements; their order is meaningful and kept.

### 3.3 What is read from a node

| Construct | Meaning | Source |
|---|---|---|
| `ID` | The node's identity; the element id on the wire and in selections. | `MindmapNode.Id` |
| `TEXT` | The node's text. | `MindmapNode.Text` |
| `richcontent TYPE="NODE"` | Formatted text. When present it wins over `TEXT`; its HTML `<body>` is read as plain text, one line per `<p>`, whitespace collapsed. | `MindmapNode.Text`, `PlainTextOf` |
| `richcontent TYPE="NOTE"` | Notes, read as plain text the same way. | `MindmapNode.Notes` |
| `FOLDED="true"` (case-insensitive) | Seeds the collapsed state when a viewer opens the map (section 5). | `MindmapNode.Folded` |
| `LINK` | The link, exactly as stored (section 8). | `MindmapNode.Link` |
| `POSITION` on a first-level node | The side of the central topic: `left`/`right` (Freeplane 1.11) or `top_or_left`/`bottom_or_right` (1.12). | `MindmapNode.Position`, `MindmapLayout` |

`richcontent` is read with or without `CONTENT-TYPE="xml/"`, which 1.12 stopped writing (Fixtures readme, item 5).

Everything else is preserved and neither shown nor edited: `hook`, `MapStyle`, `map_styles`, `stylenode`, `tags`, `properties`, `font`, `edge`, `icon`, `cloud`, `arrowlink`, `attribute`, `bookmarks`, comments (Fixtures readme; `mindmap/examples/readme.md`).

### 3.4 What is written

- **Text:** the `TEXT` attribute. Setting text removes any `richcontent TYPE="NODE"`, so formatted text becomes plain text on rename, without a warning (`MindmapNode.SetText`).
- **Notes:** `<richcontent TYPE="NOTE"><html><head/><body><p>line</p>…</body></html></richcontent>`, one `<p>` per line, placed before the first child node on its own line. Emptying the notes removes the element and the newline after it, and a node left with only whitespace becomes self-closing again (`MindmapNode.SetNotes`).
- **Link:** the `LINK` attribute; unlinking removes it.
- **New nodes:** `<node TEXT="…" ID="ID_<short id>"/>`, attributes in that order.
- **Never written:** `FOLDED` (fold is view state, Req 9.4), `POSITION`, and any layout position (Req 5.8).

### 3.5 Identifiers

- Every node has an `ID` once loaded. A node without one is given `ID_` followed by a ShortGuid in memory, and the id is written on the next save - never on open, and never by the read-only validator (`MindmapDocument.AssignMissingIds`, `NewId`; Req 3.4).
- Freeplane's own ids are `ID_` plus digits; a genuine Freeplane save never contains an id-less node (Fixtures readme, item 3).
- `mindmap.dis` declares `uuid-v4` with prefix `ID_`, the closest DISL strategy; the exact form is the ShortGuid above.

### 3.6 Byte-exact round trip

A map that ADP opens and saves without changing is written back byte for byte; a changed map differs only where it changed (Req 3.3). The writer (`FreeplaneXmlWriter.cs`) is written to match Freeplane, not a generic XML writer:

- no XML declaration; `/>` with no space before it; attributes in the order they were read; whitespace text exactly as loaded;
- in text, only `&`, `<` and `>` are escaped; in attributes also `"`, and a newline as `&#xa;` and a carriage return as `&#xd;`;
- non-ASCII characters and emoji are written literally in UTF-8.

**Line endings are mixed by design.** A Windows Freeplane save ends its structural lines with CRLF while the HTML inside `richcontent` uses LF (Fixtures readme, item 1). An XML parser normalises CRLF to LF, so the reader escapes each CR before parsing and the writer emits it raw again; the whitespace after `</map>` is kept verbatim (`MindmapDocument.Parse`, `ToText`). Structural edits insert the file's own structural newline, read from the whitespace after `<map …>` (`FreeplaneNewline.cs`). In the repository `.gitattributes` marks `*.mm` as `-text`, so fixture bytes survive checkout. `mindmap.dis` therefore sets no `persistence.newline`.

Other 1.11-to-1.12 differences the writer tolerates by not rewriting anything: `icon` before `edge`, `arrowlink` inclinations with `pt` units, a larger `MapStyle`, a trailing space in the version comment, `</html></richcontent>` on one line (Fixtures readme, items 6-10).

### 3.7 Saving, reloading and failure

- Saves are atomic, via a temporary file moved into place (Req 3.7; `WritableDocumentLifecycle`). A failed write returns an error and leaves the edit in memory to be retried (backend-centralization R3.2, R3.4).
- One loaded document is shared by every viewer of a map (Req 2.4).
- An external edit of the `.mm` is reloaded and pushed to every viewer; it is not undoable (Req 11.8, `MindmapDocumentReloader`). A reload that cannot parse keeps the last good map; deleting the body clears the map to the empty state (backend-centralization R2.4, R2.5).

## 4. Layout

`mindmap.dis` names `plugin:net.etalii.adp.freeplane.mindmapLayout` with an `mrtree` fallback, sets `trigger: always` (users never place nodes) and passes the metrics as options. The algorithm is `MindmapLayout.Compute` (Req 5.1):

1. Measure every node (below). Place the central topic with its centre at the origin (0, 0).
2. If the central topic is collapsed, stop.
3. Split the first-level children into a right and a left list, in document order. `POSITION` `left` or `top_or_left` sends a child left; `right` or `bottom_or_right` sends it right; a child with no or another value alternates, starting right, counting only unpositioned children (right, left, right, …), which is the rule Freeplane applies to an unpositioned map.
4. Lay out each side as a column of subtrees vertically centred on the central topic, starting at the central topic's edge plus `gapBeside(rootWidth)`: to the right from its right edge, to the left from its left edge (nodes on the left are right-aligned to that x).
5. A column stacks its subtrees top to bottom. Each subtree's height is the larger of its own node's height and its visible children's stacked heights plus gaps; a collapsed node or a leaf counts only itself. Between two adjacent subtrees the gap is `gapBetween(widthA, widthB)`, from the two subtrees' own node widths.
6. Each node is vertically centred in its slot; its children form a column at its outer edge plus `gapBeside(nodeWidth)`, centred on the node's centre y, growing away from the centre.
7. Collapsed branches take no space and their descendants get no position.

Metrics (`_Model/MindmapMetrics.cs`), all in canvas units:

| Setting | Value | Use |
|---|---|---|
| Font | `system-ui, sans-serif`, 14 | Text width estimate |
| Line height | 1.4 | Node height |
| Horizontal padding | 10 each side | Node width |
| Vertical padding | 6 top and bottom | Node height |
| Horizontal gap | 48 | Floor of `gapBeside` |
| Vertical gap | 10 | Floor of `gapBetween` |
| Minimum width | 32 | Empty nodes stay clickable |
| Minimum gap ratio | 0.1 | Wide nodes get proportionally more air |

- Node width = max(32, textWidth + 20); node height = 14 × 1.4 + 12 = 31.6; values rounded to 2 decimals.
- textWidth = characters × 14 × 0.55, where a character is a UTF-16 code unit (shared `TextMetric`, `src/backend/EtAlii.Adp.Documents/TextMetric.cs`).
- `gapBeside(w)` = max(48, w × ratio); `gapBetween(a, b)` = max(10, max(a, b) × ratio).
- Only the ratio is configurable, as `Mindmap:MinimumGapRatio` in `appsettings.json` (`MindmapOptions.cs`).
- The layout is a pure, deterministic function of the tree and the fold set: the same map gives the same positions for every viewer and after every reconnect (Req 5.2, 5.5).
- The client draws each node at the size the backend measured and does not re-measure (Req 5.6, 5.7). Positions on the wire are box centres, which is why the `.dis` placement anchor is `center`.

IntelliJ lays out the same files with its own framework; after Peter's 2026-09-28 request it places children 50 px from their parent, caps bezier control-point reach so branches never curve back, pans on a left drag over empty canvas and opens centred on the central topic (intellij PR #16). Those are host choices, not part of this type; the standalone layout above has no panning or centring rule of its own beyond the shared canvas.

## 5. Folding

- `FOLDED="true"` in the file seeds each viewer's collapsed set when that viewer first opens the map (`MindmapConnectionView.SeededFrom`; Req 9.3).
- After that, collapsing and expanding is per connection, keyed by viewer and map (`MindmapViewState`). It is never written to the file, never lands on the undo history, is allowed in read-only mode, and does not outlive the connection (Req 9.4, 9.6; design "Deviations").
- The action is offered only on a node with children, labelled "Collapse" or "Expand", on Space (`MindmapContextActionProvider`).
- A collapsed branch is drawn as its node with the ⊕ glyph; its descendants disappear and the rest of the map re-lays out (`MindmapSession.OnFoldToggled`).
- Revealing a node inside a collapsed branch - by a selection from elsewhere - expands its collapsed ancestors (`FoldedAncestorsOf`; Req 10.5).

DISL has `collapsed` view data, but storing it would write fold state into the diagram; the `.dis` therefore stores no view data and models the file's `FOLDED` as a read-only `folded` attribute, with the toggle as a plugin operation (`net.etalii.adp.freeplane.mindmapFold`).

## 6. Notation details DISL does not pin down

- **Node:** a plain rectangle (`centered-box`), fill `--color-surface`, stroke `--color-border` 1.5, text `--color-text` at 12px, `user-select: none`, pointer cursor (`mindmap.css`). Before the backend has measured a node the client draws it 120 × 32 (`MindmapCanvas.tsx`).
- **Font size mismatch:** the backend sizes boxes for 14px text while the client renders 12px, so boxes have more room than their text needs. Recorded, not resolved.
- **Corner glyphs:** `•` notes, `↗` link, `⊕` collapsed with children, joined by spaces, anchored top right (offset y 12, inset x 4). A CSS rule meant them muted and 10px but never applied; they render like the node text, and whether they should look as that rule meant is an open question for Peter (`mindmap.css`).
- **Branches:** a cubic bezier from the parent to the child, leaving and entering each box at the middle of its left or right side only (`anchors: { kind: "edge", edgeSides: "horizontal" }`), under the boxes, 1.5 wide in `--color-border`, no arrowheads. DISL's `sides` anchor mode may also pick the top or bottom side; a mind map never does.
- **Branches are not selectable**, by decision: a branch is a node's link to its parent, so pressing it is pressing the background (client readme; centralized-selection Req 2.4).
- **Drag feedback:** the dragged node at 0.65 opacity; the candidate parent ringed in `--color-primary` (limegreen), 2.5 wide, dashed 6 3; a dashed preview branch from the candidate parent to the dragged node.
- **Theme tokens** in the `.dis` copy the standalone shell's light and dark values (`src/client/src/index.css`).

## 7. Interactions

### 7.1 Keys and actions

| Action | Key | Offered when | Notes |
|---|---|---|---|
| Add child | Insert, Tab | always | Tab is the XMind convention; it invokes the same action and reaches the backend as Insert. |
| Add sibling | Enter | not on the central topic | Inserted right after the node. |
| Rename… | F2 | always | Inline editor over the node. |
| Delete | Delete | not on the central topic | See 7.4. |
| Add notes… / Edit notes… | none | always | Label depends on whether notes exist. |
| Link to… / Change link… | none | always | See section 8. |
| Unlink | none | the node has a link | |
| Collapse / Expand | Space | the node has children | View state only. |

Sources: `MindmapContextActionProvider.cs`, `MindmapCanvas.tsx`. Actions that do not apply are not offered rather than disabled (Req 8.6). F2, Delete and Insert are also the explorer's keys; the innermost level of the current selection decides which provider receives them, never a global key table (Req 8.7). Escape cancels an inline edit and dispatches nothing (Req 7.8). In read-only mode no document-changing action is offered (Req 6.8). The `.dis` writes Space as `"Space"`; the client declares it as `" "`.

### 7.2 Add, then edit in place

Add child and add sibling create the node at once, under a name taken from its new siblings, and then open the inline editor on it, so the usual path replaces the name before anyone reads it; cancelling leaves the name (`AddThenEditAsync`). A new child is appended as the last child; a new sibling goes right after the node. DISL's `create` action cannot say "right after this node", so that position is the runtime's.

**Sibling naming** (`src/backend/EtAlii.Adp.Diagram/SiblingNaming.cs`), which the `.dis` stubs as the function `siblingName`:

1. Ignore empty sibling names; trim the rest.
2. If siblings share a numbered stem, continue it from one past the highest number, not the count ("Phase 1", "Phase 3" → "Phase 4"); the stem most siblings agree on wins ("Step 1" … "Step 4", "Draft 9" → "Step 5").
3. Otherwise, if at least two siblings share a last word, use "New" plus that word ("Measure pass", "Arrange pass" → "New pass"); one sibling is a coincidence, not a pattern.
4. Otherwise use "Node".
5. Make the result unique among the siblings.

### 7.3 Drag to re-parent

A node is never positioned by dragging; a drag is a re-parenting proposal (`MindmapCanvas.tsx` `onElementMoved`). Released over another node, the dragged node and its whole branch become that node's last child; released over empty canvas, nothing happens. The central topic cannot be moved, and a node cannot be dropped on itself or inside its own branch: the client does not offer such a target and the backend refuses it ("The root node cannot be moved.", "A node cannot be moved into its own branch."; `MoveNodeCommand.cs`). The move is one undo step that restores the previous parent and the previous place among its siblings. Reordering among siblings has no gesture or key (see section 11).

### 7.4 Delete

Deleting a leaf happens without a question. Deleting a branch asks "Delete branch?" with "Delete '<text>' and the N nodes under it? You can undo this.", as a danger action. Both are undoable; the undo restores the whole subtree - ids, text, notes, links and unknown content - at its old place (`RemoveNodeCommand`, `RestoreSubtreeCommand`; Req 7.4). DISL's `deletion.confirm` is one fixed text for every deletion of a type, so the leaf-or-branch distinction lives here.

### 7.5 Toolbox

One entry, "Node" (`mdi-card-plus-outline`), "Drop on a node to add a child under it." Dropping it on a node runs Add child on that node; dropping it on empty canvas does nothing (`MindmapToolboxProvider.cs`, `onElementDropped`). DISL's tool kinds either create a node where it is dropped or run an operation on the selection, so the `.dis` declares it as the `addChild` operation and "the node under the drop is the target" is recorded here.

### 7.6 Properties

The property grid shows Text, Notes (multi-line) and Link as editable, each edit one undo step through the same commands as the actions; an emptied link is an unlink. "Collapsed" (category View) and "Identifier" (category Model) are shown read-only with the explanations the `.dis` form carries (`MindmapContextPropertyProvider.cs`). The grid's "Collapsed" reads the file's `FOLDED`, not the viewer's fold state; the `.dis` form shows the viewer's state, which is what the explanation describes.

### 7.7 Selection

- One node at a time: rubber-band selection and Ctrl+click are excluded for mind maps (Req 10.9; multi-select spec Req 7.2).
- A node selection is nested under its diagram file and verified against the map: the node must exist and its path, the chain of texts from the central topic, must match (`MindmapContextSourceResolver.cs`; Req 10.2-10.6). A renamed node keeps the selection; a removed one clears it.

## 8. Links

- Stored in `LINK` exactly as Freeplane defines it: relative to the map file, with forward slashes, or an absolute URL. A genuine Freeplane save confirmed both the attribute and the map-relative resolution (Fixtures readme, "Provenance"; Req 12.1).
- A file link is picked from a tree of the project's files and folders, never typed, so an unresolvable link cannot be created by mistyping (Req 12.7). The tree skips `.git`, `node_modules`, `bin`, `obj`, `.claude`, empty folders and files starting with `~adp-` (`MindmapContextActionProvider.ProjectTree`). The chosen project-relative path is converted to the map-relative form (`MindmapLinks.ToMapRelative`).
- A URL (any absolute non-file URI) is shown but never resolved to a file (`MindmapLinks.IsExternal`).
- A file link never resolves outside the project, however it got into the file (Req 12.9 in code, 12.11 in requirements; `MindmapLinks.ResolveWithinProject`).
- Requirements not met yet, see section 11: the wire carries the raw link only, and following, broken-link display and rewriting links on move are not wired.

## 9. Rules DISL cannot state

| Rule | Severity | Message | Why it is not in the `.dis` |
|---|---|---|---|
| `mindmap.not-a-map` | Error | "'<name>' is not a readable mind map: <reason>" | It judges the file before there is a model to evaluate CEL against. |
| `mindmap.duplicate-id` | Error | "Two nodes share the id '<id>' ('<a>' and '<b>')." | DISL element ids are unique by construction; in a hand-edited `.mm` they need not be. Two nodes with one id would answer to each other's selections. |

The third rule, `mindmap.unnamed-root` ("The map '<name>' has an unnamed central topic.", warning), is in the `.dis` as `unnamedCentralTopic`. Ordinary nodes without text are deliberately not judged, because Freeplane keeps them (`MindmapValidator.cs`; Req 7.6).

## 10. Runtime behaviour specific to the standalone host

- **Wire payload** (`mindmap.proto`): each node is an element of type `freeplane/mindmap+node` at its box centre, with `text`, `notes`, `has_children`, `folded` (always false; fold is the receiver's own state), `link`, `parent_id`, `width`, `height`. Branches are not sent; the client derives them from `parent_id`, which is what the `.dis`'s derived `Branch` relation expresses. The spec's `+edge` element type was never used.
- **Viewport delivery:** only nodes that intersect the viewer's reported viewport are sent, plus exactly one hop of parents and children so branches running off-screen still have both ends; never partners of partners (`MindmapElementMapper.Visible`; Req 11.5).
- **Deltas:** an edit is an upsert of the node; a structural change re-sends the visible set after removing what went; a fold is a group (plus an upsert of every survivor, since the layout moved them) and an expand an ungroup; removals always precede additions (`MindmapSession`; backend-centralization R4.5).
- **Undo:** every document change is a command with an inverse on the project's shared history (`Commands/`); fold is not.

## 11. Known gaps in the standalone implementation

1. **Links are stored but not followed.** Only `MindmapLink.raw` is filled on the wire; `project_relative_path`, `target_entry_id` and `broken` never are, so following a link, showing a broken link and the target's entry id (Req 12.2, 12.5, 12.8, 12.12) are not met. `MindmapLinks.ResolveWithinProject` and `MindmapLinks.Rebase` are called only from tests, so links are not rewritten when the map moves (Req 12.14) or when a target is renamed through ADP (Req 12.9).
2. **Keys the requirements list but the canvas does not declare:** Ctrl+Up and Ctrl+Down to reorder among siblings, and arrow-key navigation between nodes (Req 8.1). Reordering has no gesture at all; a drag always appends as last child.
3. **No missing-link-target rule** in the validator, although the validation seam now carries the paths it needs (`MindmapValidator` remarks).
4. **Formatted text is lost on rename without a warning.** IntelliJ warns first (its FR-020).
5. **Not shown or edited, only preserved:** icons, clouds, arrow links, per-node styling (colours, fonts), attribute tables, tags.
6. **The shipped examples** contain no `FOLDED`, no notes and no `POSITION`, and a link only on the central topic (`mindmap/examples/readme.md`).
7. **Catalogue state** is still ⚗️ Prototype in `docs/tools.md` and Notion although all 24 tasks are done; task 24 moved it to ✅ and that move has not happened.

## 12. Other hosts

The IntelliJ host (`etalii.adp.ide.intellij`, spec `001-freemind-mindmap-designer`, module `freemind/`) reads and writes the same `.mm` files, with these differences a shared runtime would have to choose between:

- a single `.mm` file, no registration file;
- targets FreeMind 0.7.1-1.0.1, and maps it saves must open in FreeMind 1.0.1 (FR-012); Freeplane-only content is preserved but not shown;
- **folding is a persisted, undoable edit** (FR-023), where standalone keeps it as per-viewer view state;
- new nodes get `CREATED`/`MODIFIED` timestamps and edits update `MODIFIED` (FR-011);
- shows arrow links, icons, colours, fonts and notes, with notes readable on hover (FR-015, FR-018); deleting a node removes its arrow links (FR-021);
- warns before replacing formatted text (FR-020); supports multi-select (FR-017);
- keys: Insert and Tab add a child, Enter a sibling, F2 renames, Delete deletes, Ctrl+Up/Down reorder, Ctrl+Left/Right move, Space folds (`freemind/src/main/resources/META-INF/adp-freemind-editing.xml`);
- a 1,000-node map opens in under 2 s and an edit shows in under 0.1 s (SC-003).

## 13. What DISL 0.1 lacks for this type

Recorded as input for the DISL specification, in the order of how much of this file each would absorb:

1. **A non-JSON persistence format with preserve-what-you-don't-understand semantics.** DISL's persistence layer assumes a DID definition it regenerates; a type that adopts an existing external format needs a way to declare "the stored file is the model, edit it in place".
2. **Per-viewer view state that is never persisted**, distinct from `view.store`: fold here, and probably viewport and selection elsewhere.
3. **A tree layout with sides**, or a way to describe a two-sided `mrtree`; `radial` and `mrtree` both differ from the conventional mind-map arrangement.
4. **Containment drawn as edges**: DISL containment nests children visually inside their parent. The `.dis` gets the mind-map picture from a derived relation plus a container that delegates to the layout, which works but says it sideways.
5. **Positional `create`** ("insert after this sibling") and **drop-target semantics for tools** ("run on the node under the drop").
6. **Anchors restricted to some sides** (left and right only).
7. **Deletion confirmation that depends on the element** (branch versus leaf).
