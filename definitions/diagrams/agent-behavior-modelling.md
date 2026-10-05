# Agent Behavior Modelling

The companion to [agent-behavior-modelling.dis](agent-behavior-modelling.dis). The `.dis` specifies the diagram type in DISL 0.1 as far as DISL reaches; this page holds everything about the tool that DISL cannot express, each point tied to the code that shows it.

The diagram type is implemented in the standalone IDE as the module `src/diagrams/agent-behavior-modelling/` of [etalii-adp/etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone), origin `etalii/agent-behavior-modelling`, read here at `develop` commit `13b517b3`. It is also implemented in the Visual Studio Code plug-in, [etalii-adp/etalii.adp.ide.vscode](https://github.com/etalii-adp/etalii.adp.ide.vscode), against this definition; where that host differs is recorded in its `docs/parity.md`. Paths below without a repository are relative to that module folder; `standalone:` marks a path relative to the standalone repository root. The research it rests on is [docs/research/behavior-trees-for-agents.md](../../docs/research/behavior-trees-for-agents.md) in this repository.

## What the diagram is for

A chat agent's instructions are usually prose. Agent Behavior Modelling writes them as a behavior tree, the structure game developers use for character AI, tuned to agent engineering: composites say whether steps run in order, as alternatives or together; wrappers say when a step is retried, repeated, guarded or held for the user's approval; leaves are the checks, the work, the questions to the user and the hand-overs to sub-agents.

- **The Markdown file is the instructions.** The tree is stored in the instruction file the agent reads (a system prompt, an `AGENTS.md`, a `CLAUDE.md`, a skill). The agent reads the tree as instructions; the diagram reads the same lines as a tree.
- **The `.adp` file is only the visualization.** It registers the Markdown file as a diagram and keeps the positions the author dragged nodes to. Deleting it loses a layout, never a behavior.
- The notation is ADP's own, so the origin is `etalii/` (`standalone:docs/tools.md`, row for `etalii/agent-behavior-modelling`).
- State: ⚗️ Prototype, recorded under `x-adp.state`. No browser pass has been recorded yet.

## Mapping from the `.dis` to the implementation

| `.dis` name | Keyword in the Markdown | Standalone id | Shape |
| --- | --- | --- | --- |
| `Sequence` | Do in order | `sequence` | superellipse |
| `Fallback` | Try in order | `fallback` | superellipse |
| `Parallel` | Do together | `parallel` | superellipse |
| `Retry` | Retry up to N times | `retry` | hexagon |
| `RepeatUntil` | Repeat until | `repeat` | hexagon |
| `Guard` | Only while | `guard` | hexagon |
| `Approval` | Ask approval before | `approval` | hexagon |
| `Check` | Check | `check` | pill |
| `Do` | Do | `action` | box |
| `AskUser` | Ask the user | `ask` | parallelogram |
| `Delegate` | Delegate | `delegate` | diode |
| `Child` | (nesting) | `child` | orthogonal line with an arrow |

The kinds are declared once in `backend/EtAlii.Adp.Diagram.AgentBehaviorModelling/_Model/AbmNodeKinds.cs`; on the wire each type is `etalii/agent-behavior-modelling+<id>`, and the client states the same ids once in `client/abmIds.ts`. The abstract types `BehaviorNode`, `Composite`, `Decorator` and `Leaf` exist only in the `.dis`, to share attributes and to state each family's number of children once; the implementation has the family as a field of the kind (`AbmNodeCategory`). Each concrete type carries its keyword in `x-abm.keyword`.

## The file format (Markdown)

DISL's persistence layer cannot describe a tree kept inside someone else's prose, so the `.dis` names the format `plugin:net.etalii.adp.etalii.abmMarkdown`. The format itself, from `backend/…/AbmParser.cs` and `AbmWriter.cs`:

- **Where the tree is.** The first bullet list under the first heading whose text is `Behavior` or `Behaviour`, at any heading level, case-insensitive. The section ends at the next heading of the same level or higher. Fenced code blocks are skipped, so an example tree quoted in a code block is never read as the tree.
- **A node** is one list item, written `- **<Keyword>:** <label>`. The markers `-`, `*` and `+` are all read; new items are written with the marker the list already uses.
- **Children** are the items indented under an item, in order. A tab counts as four columns.
- **Notes** are the lines indented under an item that are not list items themselves, blank lines between them included. They are kept as written and are the node's `notes` attribute.
- **Retry's count** is part of the keyword: `Retry up to 3 times`, or `Retry up to 1 time`. A new Retry gets three.
- **An item without a keyword**, or with bold text that is none of the eleven (a Retry with no number among them), is read as a Do whose label is the whole item, drawn dashed, and reported (`abm.no-keyword`), so a hand-written list opens rather than refusing.
- **Ids are places in the tree**: `1`, `1.2`, `1.2.1`. Nothing is written into the Markdown to name a node, because anything written there the agent would read too. The `.dis` says `ids.strategy: derived` with an expression for the last part; DISL has no way to say "the parent's id, a dot, and this". A place survives a rename, so selection and a stored position survive it too; a drag that reorders siblings renames the stored positions with them, so they follow the node; a reorder by Alt+Up or Alt+Down, or a re-parent, does not, and a stored height then follows the place, which is a known limit.
- **Round trip.** The parser never throws, and every edit is a line splice through `LineDocument`: the rest of the file, its line endings and its prose are untouched, and an unchanged file is written back byte for byte. A new list item uses the file's existing line ending.
- **Adding to a file without a tree.** The first node added to a Markdown file with no Behavior heading appends a `## Behavior` section at the end of the file.
- **A new diagram** (`AbmDocumentFactory.cs`) is written with CRLF: a title, one line saying what the file is, a `## How to follow the behavior` section that tells the agent what each keyword means, and a `## Behavior` section holding `- **Do in order:** Handle the request`. The legend is what lets a model that has never heard of behavior trees follow one.
- **Registration.** `.md` is a shared extension (`SharedExtension: true` in `Diagram.cs`), as `.yml` is for Azure DevOps pipelines: a repository is full of Markdown that is not a behavior model, so a `.md` file becomes one only when the user registers it through Add, which writes the `.adp`. Add suggests the type only for a file that has a Behavior heading (`SuggestsBody`).

## Layout

- **Computed, top-down.** The root sits at the top; each node's children are laid out left to right in document order beneath it, each subtree as wide as it needs, so no two subtrees overlap (`AbmLayout.cs`: nodes 200 by 60, 28 between siblings, 56 between levels). Several roots stand side by side.
- **Across, the order; down, the row.** A node's x is always the computed one, because its place among its siblings is the order they run in. All children of one parent share one row: the `.adp` registration's `layout:` block keeps the top-left of every node a drag moved, keyed by its place (`1.2: 360 160`), and a row is drawn at the first height stored for any of its nodes, or hangs the computed distance below its parent when none is, and never closer to the parent than 16 (`AbmLayout.Arrange`). So everything beneath a row follows it. The `.dis` approximates this with `respect: pinned`; DISL cannot say that pins live in the registration rather than in the model file, nor that a pin moves a row.
- **Viewport.** The whole tree is laid out and then culled to the viewport; a parent line is kept when either end is in view and brings both ends with it (`AbmElementMapper.cs`).

## Interaction

- **Adding** is a drop from the toolbox, one item per kind. The node goes under the nearest node above the drop point that can take another child, placed among its children by where it was dropped. Into an empty tree the first node becomes the root; a drop with no such node above it is refused with a sentence naming the kinds that take children. Its label is selected for editing at once. DISL's toolbox has no drop-from-palette mode and cannot say "the nearest node above that has room"; the `.dis` uses an operation per kind whose parent is a fallback.
- **Re-parenting** is a right-button drag from the new parent's body to the node (`connectOnRightDrag`): the node moves, with everything under it, to the end of the new parent's children. A line to a leaf, to the node itself or to anything below it is refused with a sentence; the cycle rule is also declared on the canvas (`acyclic`), so such a target is never offered.
- **Dragging** a node carries everything beneath it, and its siblings follow it up and down. Dropped past a sibling's middle, it takes that sibling's place: while it moves, the siblings it passes step aside to show where it will land, as the Sankey diagram does in a column, and on release its lines move in the Markdown with everything under them (`ArrangeAbmNodeCommand`). The order and the row's height are one undoable step.
- **Reordering** among siblings is also Alt+Up and Alt+Down (`abm.move-earlier`, `abm.move-later`); the node's lines move with everything under them.
- **Rename** is F2 or a double-click, editing the label only. The keyword is the kind, changed in the property grid's Kind choice (`abm.kind`); a kind that cannot hold the node's present children is refused ("\"Check\" holds no children, and this node has 2 children."). Attempts (`abm.attempts`) shows only for a Retry, Notes (`abm.notes`) edits the note lines, and Place (`abm.place`) is read-only.
- **Delete** removes the node and everything under it, as one splice. When nodes go with it, it asks first: "Removing this node also removes the 1 node beneath it." or "… the N nodes beneath it."
- **Arrange diagram** (`abm.arrange`, `Commands/ArrangeAbmCommand.cs`) is offered on empty canvas and on every node. The tidy tree is the arrangement: a behavior tree's layout is computed from the tree, and a drag is only an override kept in the registration, so the least cluttered drawing is the computed one and arranging means dropping the overrides. It removes the registration's `layout:` block and never touches the Markdown; one undo puts the registration back byte for byte. It is refused with "This behavior model was opened without a registration, so it has no dragged positions to forget." when there is no registration, with "This behavior model is already arranged." when the block is empty, and is disabled with "There is nothing to arrange until this behavior model has a node." for an empty tree. The `.dis` declares it as the operation `arrange`, carried out by the plugin `net.etalii.adp.etalii.abmArrange`.
- **Undo** restores the whole document text (`RestoreDocumentCommand<IAbmDocumentStore>`), so every edit above is one undoable step; a drag's undo (`RestoreAbmArrangementCommand`) puts back the Markdown and every stored position together.

## Rules

The rule ids, in `backend/…/AbmRuleSet.cs`, reach the Errors and Warnings panel through `AbmValidator`, each located by its line:

| Rule id | Severity | When |
| --- | --- | --- |
| `abm.leaf-with-children` | error | A Check, Do, Ask the user or Delegate has children. |
| `abm.decorator-children` | error | A wrapper has no child or more than one. |
| `abm.no-attempts` | error | A Retry allows no attempt. |
| `abm.empty-composite` | warning | A composite has no children, the natural state while a tree is being written. |
| `abm.several-roots` | warning | The list has more than one top-level item. |
| `abm.no-keyword` | warning | An item has no keyword and is read as a Do. |
| `abm.no-behavior` | information | The file has no Behavior heading, or the section holds no list yet. |

## Notation details DISL approximates

- **Two labels.** Each node shows its keyword in small capitals on the top line and its label beneath it (`client/AbmCanvas.tsx`). The `.dis` writes the keyword label as a CEL string per type.
- **Superellipse and diode** are drawn by the canvas library's built-in shapes (`standalone:src/client/src/canvas/library/shapes/outline.ts`); the `.dis` reuses the functional decomposition graph's custom paths for them.
- **Colours** are CSS variables in `standalone:src/client/src/index.css` (`--color-diagram-abm-*`) applied by `client/abm.css`, the functional decomposition graph's fills reused per family: composites green (`#aaed92`, dark `#2e7814`), wrappers yellow (`#fcf281`, `#736a03`), Check blue (`#9edcfa`, `#086fa1`), Do grey (`#ededed`, `#696969`), Ask the user and Delegate teal (`#86e6d9`, `#187569`).
- **An implicit Do** is drawn with a dashed outline, a payload flag the `.dis` has no notation for.

## Known gaps

- **No browser pass recorded**, and no screenshot in `standalone:docs/screenshots/`.
- **Delegate does not open the linked file**; the link is text in the label.
- **DISL gaps this diagram exposed:** a model kept inside another document's prose; ids derived from a place in the tree; pins stored in a registration; a drop-from-palette mode with a computed parent; a label computed from the type and an attribute together.

## The examples

`examples/` holds four agents: `pull-request-reviewer`, `customer-support`, `bug-fixer` and `research-assistant`. Together they use all eleven kinds, and `research-assistant.adp` has a `layout:` block that lowers one row, with everything beneath it, below its computed height. They were written for ADP because no published corpus of this notation can exist; their readme (`examples/readme.md`) says what they do not demonstrate.

## Sources

- Module code and tests: `src/diagrams/agent-behavior-modelling/` in etalii.adp.ide.standalone.
- Catalogue row: `docs/tools.md` in etalii.adp.ide.standalone.
- Research: `docs/research/behavior-trees-for-agents.md` in this repository.
- Notion: the "Tools" database row for Agent Behavior Modelling.
