# Contract: the changes to the two definitions

What pull request A changes under `definitions/diagrams/` in this repository (user story 7, FR-027 to FR-029), read from `etalii.adp.ide.standalone` at `develop` commit `13b517b3`, which holds pull request 122 ("Arrange diagram", merge `c4ff2084`) and pull request 120 (the behavior model's drag, `e7c20431`). `python .github/scripts/validate-examples.py` must pass on both `.dis` files afterwards (FR-028, SC-010). Both stay DISL 0.1 documents; moving them to DISL 0.2 is not part of this feature.

## Gartner hype cycle graph

### `gartner-hype-cycle-graph.dis`

| Where | Change |
|---|---|
| `language.version` | `1.0.0` to `1.1.0` |
| `behavior.operations.arrange` | new: label "Arrange diagram", `for: "diagram"`, `enabled` while the diagram is writable and has a trend, one `layout` action over the diagram's nodes with the algorithm `arrangeRows`, and a `doc` that states the rule and both refusals |
| `layout.algorithms.arrangeRows` | new: `plugin:net.etalii.adp.gartner.arrangeRows`, with a `doc`: rows only, as few as the elements allow, influenced trends close together |
| `plugins` | new entry `net.etalii.adp.gartner.arrangeRows`, `provides: ["layout"]`, not required |
| `layout.trigger` | stays `manual`: the arrangement runs only when asked |

The operation is offered on the canvas's background. DISL 0.1 has no menu for the empty canvas, as the supply chain companion already notes, so the `.dis` declares the operation and the companion says where it is offered.

### `gartner-hype-cycle-graph.md`

- The opening paragraph names commit `13b517b3` in place of `b2a2692`, and the whole document is re-read against that commit: every point that names a file is checked against the file as it is there, and corrected where the code has moved on.
- A new section, "Arrange diagram", after "Compact mode", stating from `GhgArrangement.cs`, `Commands/ArrangeGhgCommandHandler.cs` and the shared `RowPacking.cs`:
  - **What changes:** the `row` of trends, triggers and notes, and nothing else. No date changes, because across is time.
  - **The rule:** as few rows as the elements allow. Each element takes the width it is drawn with: a trend's banner with its name before it, a trigger's circle with its name and date before it, a note's box over as many rows as it is tall; label widths by the shared text metric at size 12 with a gap of 8, and at least 16 canvas units clear between two elements on a row. Influences are the links, so a trend sits near what it influences; a note is linked to nothing and fills the room that is left. The packing itself is described from `RowPacking.cs` in enough detail to implement it.
  - **What is skipped:** an entry without an id, a trend without a span, a trigger without a date and a note that cannot be placed keep their rows.
  - **One step:** every changed `row` line is one undoable edit.
  - **Refusals, verbatim:** "There is nothing to arrange until this graph has a trend." and "This graph is already arranged."
  - **Where it is offered:** the canvas's background menu, as the action `ghg.arrange`.
- "Toolbox, context actions and the property grid" gains the background menu's entry.
- "Refusals and confirmations" gains the two sentences.
- "Extension keys" and "Validation rules" are unchanged unless the re-read finds otherwise.
- A line under the opening paragraph names the hosts that implement the diagram type. Pull request A names the standalone host; the last pull request of this feature adds `etalii.adp.ide.vscode` (FR-029).

## Agent Behavior Modelling

### `agent-behavior-modelling.dis`

| Where | Change |
|---|---|
| `language.version` | `0.1.0` to `0.2.0` |
| `behavior.operations.arrange` | new: label "Arrange diagram", `for: "diagram"`, a `plugin` body named `net.etalii.adp.etalii.abmForgetPositions`, and a `doc` that states what it forgets and the refusals. DISL's `layout` action places nodes; it cannot say "remove the pins from the registration", which is why this is a plugin operation and not a layout action |
| `plugins` | new entry `net.etalii.adp.etalii.abmForgetPositions`, `provides: ["action"]`, required |
| `layout.doc` | one sentence added: "Arrange diagram forgets every pin." |

### `agent-behavior-modelling.md`

- The opening paragraph gains the commit the page was read at, `13b517b3`, which it does not state today.
- "Interaction" gains **Arrange diagram**, from `Commands/ArrangeAbmCommand.cs`:
  - **What changes:** the registration's `layout:` block is removed, so every row hangs at its computed height again. The Markdown is not touched.
  - **One step:** one undo puts the registration back as it was.
  - **Refusals, verbatim:** "This behavior model was opened without a registration, so it has no dragged positions to forget." and "This behavior model is already arranged."
  - **Where it is offered:** the canvas's background menu.
- "Layout" says in one sentence that "Arrange diagram" is the way back to the computed layout.
- "Known gaps" keeps "No browser pass recorded" and adds that none is recorded for "Arrange diagram" or the drag either.
- The host line, as for the hype cycle.

## The leaf colours (research, open point O1)

The `.dis` and the companion give Do the teal fill and Ask the user and Delegate the grey one; the standalone stylesheet at `13b517b3` gives them the other way round. Pull request A corrects whichever side the owner rules to be wrong: either the two token values and the companion's sentence here, or nothing here and an issue for the standalone host. It does not leave the two in disagreement without a line in the companion's "Known gaps".

## What does not change

No specification under `specifications/` changes: DISL, DID and FBL are read, not amended. No other definition changes. No schema changes, so nothing in `validate-examples.py` changes.
