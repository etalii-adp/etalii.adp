# Supply chain diagram

The companion to [supply-chain.dis](supply-chain.dis). The `.dis` specifies ADP's **Supply chain diagram** (`etalii/supply-chain`) in DISL 0.1 as far as DISL reaches; this page holds everything about the tool that DISL cannot express, or can express only approximately, so that an IDE implementing the diagram type from the specification ends up with the tool that exists today. Each point names the code that shows it.

The diagram type is implemented in the standalone IDE as the module `src/diagrams/supply-chain/` of [etalii-adp/etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone), origin `etalii/supply-chain`. Paths below without a repository are relative to that module folder; `standalone:` marks a path relative to the standalone repository root. At the time of writing the module is on the standalone branch `claude/supply-chain-diagram-u8lo3k` and not yet merged into `develop`: its backend is committed there (`ffe21a12`, "Add the supply chain diagram backend"), while its client and its `docs/tools.md` row are still being written beside it. There is no specification document for it under `standalone:.spec-workflow/specs/`; the code is the source of truth.

## What the diagram is for

A supply chain diagram follows goods from where they start to where they are used: mines and farms, the suppliers and plants that refine and make things from them, the assemblers that build the product, and the distributors, retailers and consumers it reaches. Its question is not only *who supplies whom* but *how much*, and *what else depends on this*: a flow's band is as broad as its volume, and selecting anything lights the whole chain through it.

- **Inspiration.** The notation follows the [yFiles supply chain showcase](https://www.yfiles.com/demos/showcase/supply-chain/): cards per stage with a coloured header, flows drawn as bands whose width follows their volume with goods moving along them, regions as frames, and the selection tracing everything upstream and downstream. The `standalone:docs/tools.md` row says so ("after the yFiles supply chain showcase").
- **Origin.** The notation and its file format are defined by the user of the repository rather than by a standards body or a vendor, which is why the origin is `etalii/` and the schema is ADP's own (`backend/EtAlii.Adp.Diagram.SupplyChain/Diagram.cs`).
- **State.** ⚗️ Prototype, the state its `standalone:docs/tools.md` row carries. The `.dis` records this under `x-adp.state`, which is catalogue data rather than DISL.

## Mapping from the `.dis` to the implementation

| `.dis` name | Document spelling | Wire type | Where |
| --- | --- | --- | --- |
| `RawMaterial` | `type: raw-material` | `etalii/supply-chain+raw-material` | `backend/EtAlii.Adp.Diagram.SupplyChain/_Model/SupplyChainModel.cs`, `SupplyChainNodeTypes` |
| `Supplier` | `type: supplier` | `etalii/supply-chain+supplier` | same |
| `Manufacturer` | `type: manufacturer` | `etalii/supply-chain+manufacturer` | same |
| `Assembler` | `type: assembler` | `etalii/supply-chain+assembler` | same |
| `Distributor` | `type: distributor` | `etalii/supply-chain+distributor` | same |
| `Retailer` | `type: retailer` | `etalii/supply-chain+retailer` | same |
| `Consumer` | `type: consumer` | `etalii/supply-chain+consumer` | same |
| `Group` | an entry under `groups:` | `etalii/supply-chain+group` | `_Model/SupplyChainModel.cs`, `SupplyChainGroup` |
| `Flow` | an entry under `flows:` | `etalii/supply-chain+flow` | `_Model/SupplyChainModel.cs`, `SupplyChainFlow` |

- **Seven types, one card.** The implementation has one node record whose `type` key is the stage; the client registers one element type per stage so each can carry its colour (`client/SupplyChainCanvas.tsx`, `stageType`). The `.dis` makes each stage a node type under the abstract `Stage`, so that the toolbox, the palette icons and a change of stage (a retype, `behavior.retype`) are DISL's own constructs; each concrete type carries its document spelling in `x-supplyChain.documentType`. `Stage` exists only in the `.dis`, and holds the one notation all seven share.
- **Membership is a key, not nesting.** In the file a node names its group with `group: <id>`; groups are listed separately and do not nest. The `.dis` expresses membership as containment (`Group.children` allows `Stage`), because that is what gives a frame that encloses its members, moves them when it moves and keeps them when it is removed (`children: "reparent"`). A node whose `group` names no group is drawn outside every group and reported (see *Rules*); containment cannot hold such a dangling key, so the reader keeps the line and reports it.
- **The display words** of the stages ("Raw material", "Supplier", …) are `SupplyChainNodeTypes.Display`; the `.dis` computes them with `stageLabel`.

## The file format (`.supply`)

DISL's persistence layer describes a DID definition, and this diagram does not store DID, so the `.dis` names the format `plugin:net.etalii.adp.etalii.supply` and declares a plugin that provides `persistenceFormat`. The format itself, from `backend/…/SupplyChainParser.cs`, `SupplyChainWriter.cs` and `SupplyChainDocumentFactory.cs`:

```yaml
supply-chain: 1
# An electric and combustion car maker's supply chain, from mine to driveway.
groups:
  - id: central-africa
    name: Central Africa
    description: The Copperbelt, source of most of the world's cobalt.
nodes:
  - id: kolwezi-cobalt
    type: raw-material
    name: Kolwezi cobalt mines
    group: central-africa
    quantity: 170
    unit: kt Co
    step: 5
  - id: cobalt-refinery
    type: supplier
    name: Cobalt refinery
    x: 320
    y: 40
flows:
  - id: cobalt-ore
    from: kolwezi-cobalt
    to: cobalt-refinery
    product: Cobalt hydroxide
    volume: 120
    unit: kt Co
    step: 5
```

- **Shape.** YAML with a header `supply-chain: 1`, then three lists: `groups`, `nodes` and `flows`. YamlDotNet reads; nothing ever serialises a model back.
- **Group keys:** `id`, `name`, `description`. **Node keys:** `id`, `type`, `name`, `description`, `group`, `quantity`, `unit`, `step`, `x`, `y`. **Flow keys:** `id`, `from`, `to`, `product`, `description`, `volume`, `unit`, `step`.
- **Position is the top-left corner** (`x`, `y`), while the canvas and the wire work with the centre; `SupplyChainElementMapper.cs` and `client/SupplyChainCanvas.tsx` (`onElementMoved`) convert. A node is placed by the document only when it states **both** `x` and `y` (`SupplyChainNode.IsPlaced`); with either missing, the layout places it. Positions are written rounded to whole units.
- **Sizes are never stored.** Every node is 192 by 96 (`SupplyChainGeometry`), and a group's frame is computed from its members, so neither has a size or a group a position in the file.
- **Numbers** are read with invariant culture as any finite double, and written in the format `0.####` (`SupplyChainWriter.Number`), so four decimals at most; the `.dis` says `precision.numbers: 4` and `precision.canvas: 0`, the nearest DISL has.
- **Text** is written plain where YAML reads it back unchanged, and double-quoted where a plain scalar would mean something else: a colon, a hash or a leading dash (the shared `LineSplice.Quote`), and also a leading `[`, `]`, `{`, `}`, `&`, `*`, `!`, `|`, `>`, `%`, `@`, `` ` ``, `,` or `?`, a number, `true`, `false`, `yes`, `no`, `null` and `~` (`SupplyChainWriter.Text`).
- **The empty document** is `supply-chain: 1`, `groups: []`, `nodes: []`, `flows: []`, each on its own line, with CRLF and a final newline, because a new file has no style to preserve and CRLF is the standalone repository's house style. The lists are written flow-empty because a bare `nodes:` reads as null rather than an empty list; the first entry added opens the flow form into a block (`SupplyChainDocumentFactory.cs`). DISL's `newline: "crlf"` in the `.dis` describes only new files.
- **Round trip.** An unchanged document comes back byte-identical, and every edit is a splice of the line range the parser recorded for that entry (`LineSplice`), so comments, blank lines, indentation, quoting, unknown keys, line endings and a missing final newline survive. Because the bytes are the test subject, standalone's `.gitattributes` marks `*.supply -text`. Fixtures: `backend/EtAlii.Adp.Diagram.SupplyChain.Tests/Fixtures/crlf-line-endings.supply`, `lf-line-endings.supply`, `no-trailing-newline.supply`, `malformed-entries.supply`, `not-yaml.supply` and `rules-broken.supply`.
- **What an edit writes.**
  - A new node is appended after the last node, with indentation copied from the file, and keys in the order `id`, `type`, `name`, then `group`, `quantity` (always `0` for a node from the palette), `unit`, `x` and `y` when they have values. A new group is `id` and `name`; a new flow is `id`, `from`, `to`, and `product`, `volume` and `unit` when they have values. When the document has no such list, the list's key is created at the end of the document together with the first entry.
  - Placing nodes writes `y` and then `x` into each entry, bottom-up, so that a newly placed entry reads `x` before `y`.
  - Removing a node removes every flow to or from it and then the node, bottom-up so earlier line numbers stay valid. Removing a group removes the `group` key from each member and then the group entry.
  - Setting `name` keeps the key even when empty. Setting `description`, `unit` or a flow's `product` to blank removes the key, as does clearing a number. Putting a node in no group removes its `group` key.
- **Tolerance.** The parser never throws. A document that is not YAML opens empty and says why, with its line. A missing header, a version that is not a number and a version other than 1 are reported, and the document still opens. An unknown key is reported and its line kept; an entry that is not a mapping is reported and passed over; a number that will not read is reported and ignored; a node of an unknown stage survives the round trip, is reported and is not drawn.
- **An unreadable body is not a missing one.** Both open empty, but a document that could not be read refuses every edit ("… could not be read, so nothing can be edited until it can: …") so that its emptiness is never saved over the only copy on disk (`_Model/SupplyChainDocumentEntry.cs`, `Commands/SupplyChainEdits.cs`). Changes made to the file outside ADP are picked up and pushed to every open view (`SupplyChainDocumentReloader.cs`).
- **Ids.** Ids live in the file because the schema is ADP's own. New ids are `ShortGuid`s, 25-character lowercase base-36 renderings of a GUID; hand-written ids (`kolwezi-cobalt`) are equally valid. DISL has no ShortGuid strategy, so the `.dis` says `nanoid`, the nearest shape. **Groups, nodes and flows share one id space**: the first entry with an id is drawn, and every later entry reusing it is not (`SupplyChainLayout.Compute`), and a command refuses an id already in use ("That id is already used in this diagram.").
- **Registration.** A diagram is added to an ADP project by an `.adp` file whose first line is the origin `etalii/supply-chain` and whose second is `body: <name>.supply` (`examples/automotive/automotive.adp`). `.supply` is owned by this type (`Diagram.IsBody`).
- **Undo** restores the whole document text as it was before the command (`RestoreDocumentCommand<ISupplyChainDocumentStore>`), with the command itself as the redo, rather than inverting a model edit. An edit is made on a copy of the cached document, so a refusal halfway through leaves nothing behind.

## Layout

The `.dis` names the layout `plugin:net.etalii.adp.etalii.supplyChainLayers`, falling back to `layered`, with `trigger: "always"` and `respect: "all"`: a node the document places is drawn there, and every other node is placed by the layout. The algorithm is `SupplyChainLayout.Arrange`, and an implementation reproducing the tool must reproduce it, because a document whose nodes carry no positions (both examples) is drawn entirely by it:

- **It is computed over the whole document**, never over a view, and cached per model instance, so a pan reuses it and an edit recomputes it. Only drawable entries take part: nodes with an id, a known stage and an id not taken earlier; flows with an id whose two ends are drawable and different.
- **Layers** run left to right. A node's layer is the longest path to it from a node that nothing supplies, over the flows, after every cycle has been broken at the flow that closes it in a depth-first walk in document order, so a recycling loop does not stretch the chain. The stage plays no part: a supplier that nothing supplies sits in the first layer.
- **Bands** are the groups, plus one band for the nodes outside every group, each first in document order of its first member. A band spans the layers its members occupy.
- **Order** is by barycentre. Every node starts at its document position; a node's barycentre is the mean position of the nodes it trades with (its own position when it trades with none). Eight passes each sort the bands by the mean barycentre of their members, then each band's members within each layer by their barycentres, ties broken by document order, and renumber every node's position from the result.
- **Placement.** The bands are dropped, in that order, onto a per-layer skyline, so a band covering the first two layers and one covering the last two can sit side by side. Layers are 320 apart (the card's 192 plus 128); nodes stacked in one band are 124 apart (96 plus 28); a grouped band reserves 40 above its nodes for the frame's title and 20 below them; two bands sharing a layer are 32 apart. This is what keeps every frame clear of every other group's nodes.
- **Dragging a node** writes its position, so it alone moves; nobody else does, because the layout of the rest never depended on stored positions.
- **Arrange diagram** writes the computed position of **every** node into the document, whatever it stated before (`ArrangeSupplyChainCommandHandler`). DISL's `respect` describes automatic layout only; the `.dis` models Arrange as a `layout` action, and this sentence is what says it overrides stored positions.

## The trace

Selecting something marks the chain through it, and this is how a supply chain is read. DISL 0.1 expressions cannot read the viewer's selection, so the `.dis` declares a plugin CEL function, `traceOf(element)`, and its node, group and edge conditions read it. The rules are `SupplyChainTrace.Through`:

- **What a selection traces from.** A node traces from itself. A flow is itself selected and traces upstream from its supplier and downstream from its consumer, which are marked upstream and downstream. A group traces from all of its members at once, and its members are marked selected: the region's whole exposure.
- **Upstream and downstream are walked separately**, breadth-first along the flows in one direction each, never both ways from a node reached, which would light the whole connected graph. Every flow walked and every node reached is marked; a node reached both ways (goods that come back round) keeps the first marking it got, and the upstream walk runs first.
- **Groups** with a member on the chain that are not themselves marked are `related`. Everything not marked is `dimmed`. With nothing selected in the diagram, nothing is marked at all.
- **What the marks look like** (`client/supply-chain.css`): an upstream card's outline is orange and 2.5 wide, a downstream card's blue; an upstream or downstream flow's band and arrowhead take the same colour at 0.85 opacity; a related or selected group's dashed frame becomes solid; anything dimmed is drawn at 0.22 opacity, and a dimmed flow's goods stop moving. The selected element itself is painted by the canvas library's shared selection.
- **The selection is the backend's.** A module client may not read the selection, so the backend learns of it through its context source resolver and keeps it per connection and per body (`SupplyChainSelections.cs`): one browser tab is one connection with several diagrams open, and a selection in one must not light up another. The marks travel to the client on each element's payload (`trace` in `api/supply-chain.proto`), so a change of selection reaches the canvas as ordinary deltas.

DISL 0.2 adds `view.selected` to `ViewData` (DISL section 12.2), with which the trace could be written in CEL from `reachable` and `predecessors`; this definition stays on DISL 0.1 with its siblings.

## Notation details DISL approximates

**Cards** (`client/SupplyChainCanvas.tsx`, `stageType`, and `client/supply-chain.css`):

- A rounded rectangle 192 by 96 with the canvas library's default corner radius of 8, filled with the surface colour, outlined 1.5 in the border colour, with a drop shadow of 0, 2, 4 that grows to 0, 6, 12 on hover.
- **The header** is a 24-unit band in the stage's colour: the client draws a rectangle with radius 10 and a squared 10-unit seam beneath it. The `.dis` draws one path with corners of radius 8, which matches the card's outline.
- **Texts**, all inset 14 from the left: the stage's display word in capitals at y 16 (10 px, bold, letter-spaced 0.08 em, white); the name at y 46 (13 px, weight 600, truncated, editable in place, the id when the name is empty); the quantity at y 74 (20 px, bold, tabular figures) or a dash when the node has none. **The unit** is drawn as a separate 11 px muted text just after the number, at an x estimated from the number's characters (12 per digit, 6 per other character, plus 6). DISL 0.1 cannot place a label by another label's width, so the `.dis` joins the number and the unit in one label.
- **Numbers** are formatted with `toLocaleString("en-US")`, two decimals at most and three for a non-zero value below one (`client/supplyChainModel.ts`, `formatAmount`); the `.dis` writes the same as ICU patterns.
- **The share bar** is 4 high on a track along the foot, 12 above the bottom and inset 14 on each side, in the stage's colour, at least 4 long, drawn only for a node with a quantity. Its share is of the largest quantity **among the nodes the client holds** with the same unit, which, because the backend sends only what is in view plus what the visible nodes trade with, can change as the view is panned. The `.dis` computes the share over the whole diagram; the client's behaviour is the one an implementation copying the tool would see.
- **Tooltip:** `Stage: name — amount unit`, the amount part only when the node has a quantity.
- **Colours** are CSS variables of the module, declared in both colour-scheme modes; the `.dis` carries them as light and dark theme tokens, converting the CSS `rgb(… / n%)` values to `#RRGGBBAA`. The text, muted text, surface and border tokens are the host's shared canvas variables, carried so the `.dis` stands alone.

**Flows** (`flowPath`, `flowAdornment`, `bandWidthOf`):

- **Route.** A cubic curve from the middle of the supplier's facing side to the middle of the consumer's: when the consumer's centre lies right of the supplier's, it leaves the right side and arrives at the left; otherwise it leaves the left and arrives at the right. Both control points lie horizontally from the ends, `max(48, |dx| / 2)` away, which makes the horizontal S. The `.dis` says `routing: "bezier"` with `normal` directions and side-midpoint anchors; DISL 0.1 neither restricts the sides to left and right (AnchorSpec `sides` is DISL 0.2) nor pins a bezier's reach (DISL 0.2's `BezierSpec`), so a runtime may otherwise attach to the top or bottom.
- **Width.** `3 + round(weight × 15)`, where the weight is the flow's volume divided by the heaviest volume among the drawable flows **with the same unit**, clamped to 0..1, and 0 for a flow without a volume (`SupplyChainElementMapper.Flow`). The band is drawn at 0.55 opacity with round caps, 0.8 on hover.
- **The goods** are a second line along the same path: white, dashes of 1 and gaps of 13, at least 2 wide and otherwise 0.4 of the band, at 0.85 opacity, moving forward 14 units every 1.4 s, and still when the user prefers reduced motion or the flow is dimmed. DISL's `flow` animates a line's own dashes and an edge has one line, so the `.dis` draws the goods as repeated dots along the band, which do not move.
- **Arrowhead.** A filled triangle at the consumer's side, square to that side rather than to the curve's tangent, as long as `7 + band / 3` and 1.4 times that wide, in the band's colour.
- **Labels.** The product above the middle, editable in place. The volume with its unit in a pill under the middle, 18 high with fully rounded ends, `max(36, characters × 6.4 + 16)` wide, 10 px weight 600, only when the flow has a volume.

**Groups** (`GROUP_ELEMENT_TYPE`): a rounded rectangle with the library's radius 8, a faint fill, a 1.5 dashed outline (6 on, 4 off) in the border colour; the name at the top left (13 px, bold, editable in place, the id when empty) and the member count at the top right ("1 node", "3 nodes"; 11 px, muted). The frame is drawn beneath the flows, so a band crosses it rather than hiding behind it, and it is 20 beyond its members left, right and below and 40 above them. An empty group draws nothing.

**What the backend sends.** Only what is in view: a node whose box overlaps the viewport, plus every node a visible node trades with, so no flow arrives with one end missing; a group whose frame overlaps the viewport; and a flow when both its ends are sent. Scrolling and zooming never change the layout.

## Interaction

**The palette** has seven items, one per stage, described by the backend as data (`SupplyChainToolboxProvider.cs`): ids `supply-chain.toolbox.<stage>`, the stage's display word, its icon and a one-line description. **Adding** is a drop from the palette onto the canvas, which centres the new card on the drop point (action `supply-chain.add.<stage>` on the target `new:x,y`). The node is named "New raw material", "New supplier" and so on, then " 2", " 3" when the name is taken among the nodes, written with `quantity: 0` and its position. DISL's toolbox has no drop-from-palette mode; the `.dis` uses click. The same seven additions are offered on empty canvas as "Add raw material here" and so on.

**Drawing a flow** is a drag from a card's side handle (its left or right anchor), or a right-button drag from one card's body to another's (`connectOnRightDrag`); the card dragged from supplies the one dropped on. It travels as `supply-chain.connect` on the target `rel:from->to`. There is no flow tool in the palette. A new flow has no product, volume or unit. Refusals, each a sentence shown to the person: "A flow runs from one node to another.", "A node does not supply itself.", "These two are already connected by a flow in this direction." and "That id is already used in this diagram.".

**Moving.** Dragging a card writes its top-left, rounded. Dragging a group's frame moves every member by the same distance, in one edit and one undo. Dropping a card onto a group does not put it in the group: "A node joins a group through its Group property, not by being dropped on it." A diagram opened without a history is read-only: "This diagram is read-only."

**The steppers.** Beside the one node or flow that is selected (its trace is `selected`), the client draws a − and a + button that the backend never sends: round, 22 across and 4 apart, at the card's right edge level with the quantity (centres 141 and 167 from the card's left, 68 from its top), or for a flow under the volume pill (38 below the middle of its two ends). A press steps the value without moving the selection, so the chain stays lit. The keyboard does the same: `+` with or without Shift, and `=`, increase; `-`, and `_` with Shift, decrease. At zero the − is drawn at 0.35 opacity with a not-allowed cursor and does nothing. The `.dis` declares the buttons as context tools around the selection and the keys as operation shortcuts; it cannot place a context tool under a flow's label.

**Stepping** (`StepSupplyChainValueCommandHandler.cs`) adds or takes the element's own `step`, or 1 when it states none (or states a step that is not above zero), rounds the result to four decimals so ten steps of 0.1 come back to a whole number, and never goes below zero: a decrease that would pass zero lands on zero, and a decrease at zero is refused ("The quantity is already zero.", "The volume is already zero."). A value that was not stated counts as zero. A group has no value: "A group has no value of its own; its members do."

**Actions and keys** come from the backend as data and reach the right-click menu and the keyboard through one path (`SupplyChainContextActionProvider.cs`). Each row group below is a separate menu group.

| On | Action | Key | Behaviour |
| --- | --- | --- | --- |
| Node | Increase quantity | + | Steps up. |
| Node | Decrease quantity | - | Steps down; disabled at zero with "The quantity is already zero." |
| Node | Rename… | F2, double-click | Opens the editor in place on the name. |
| Node | Put in a new group… | | Asks for "Group name" (confirm "Create group"), refuses a blank one ("A group needs a name."), creates the group and puts the node in it. A group comes into being only this way, since an empty one draws nothing. |
| Node | Remove | Delete | Removes the node and every flow to or from it. With no flows it happens at once; otherwise it asks first, as a danger confirmation, naming the count: "Removing this node also removes the 1 flow to or from it." / "… the N flows to or from it." |
| Node, group | Arrange diagram | | See *Layout*. |
| Flow | Increase volume, Decrease volume | +, - | As for a node's quantity. |
| Flow | Rename product… | F2, double-click | Opens the editor in place on the product. |
| Flow | Remove flow | Delete | At once. |
| Group | Rename… | F2, double-click | Opens the editor in place on the name. |
| Group | Remove group | Delete | At once; its members stay where they are, ungrouped. |
| Empty canvas | Add *stage* here (seven), Arrange diagram | | Arrange is disabled on an empty diagram: "There is nothing to arrange until this diagram has a node." |

DISL 0.1's deletion `confirm` is a fixed message asked every time; the count and the condition are this page's (DISL 0.2's Confirmation has `count` and `threshold`). DISL 0.1 also has no menu for empty canvas (DISL 0.2 reserves `diagram` in `contextMenus[].for`), so the `.dis` offers Arrange from the node and group menus only.

**Properties** (`SupplyChainContextPropertyProvider.cs`), every row an edit through `SetSupplyChainPropertyCommand` on the project's history:

- A node: **Name**, **Stage**, **Group** and **Description** (group Identity); **Quantity**, **Unit** and **Step** (group Amount). Stage is a choice of the seven stages, shown and stored in their document spelling (`raw-material`); choosing one retypes the node. Group is a choice of "(none)" and the groups' names (their ids when unnamed); the document keeps the id, so a renamed group keeps its members. Step shows 1 when the node states none.
- A flow: **Product** and **Description**; **Volume**, **Unit** and **Step**.
- A group: **Name** and **Description**.
- **Checks.** A number must read with invariant culture as a finite value of zero or more ("'…' is not an amount this diagram can hold: a number of zero or more."), and a step must not be zero ("A step of zero would make + and − do nothing."); an empty number removes the key. A stage must be one of the seven ("`…` is not a stage: raw-material, supplier, manufacturer, assembler, distributor, retailer, consumer."), and a group must exist ("There is no group `…` in this diagram.").

DISL 0.1 forms bind fields to attributes, and neither the stage (the type) nor the group (the parent) is an attribute in the `.dis`, so its form shows both read-only and the change is this page's: a choice that retypes, and a choice that reparents.

## Rules

Breaches reach the Errors and Warnings panel through `SupplyChainValidator`, the module's `IDiagramValidator`, each located by its line counted from 1. **What is lost is an error, what is merely untidy a warning**: an error names something that is not drawn, a warning something that still draws everything the author meant. Fixture: `backend/…Tests/Fixtures/rules-broken.supply`.

| Rule id | Severity | When | In supply-chain.dis |
| --- | --- | --- | --- |
| `supply-chain.unreadable` | warning | Anything the parser reported: not YAML, a missing or wrong header, an unknown key, an unknown stage, a number that will not read, an entry that is not a mapping. | Partly: `std.typeExists` downgraded to warning for an unknown stage; the rest is the reader's. |
| `supply-chain.missing-id` | error | A group, node or flow has no id ("A node has no id and is not drawn."). | Not expressible; ids are persistence. |
| `supply-chain.duplicate-id` | error | An id is used again anywhere in the document; only its first entry is drawn. | Not expressible. |
| `supply-chain.dangling-flow` | error | A flow names a node that is not there, or is missing an end. | `std.references`. |
| `supply-chain.self-flow` | error | A flow runs from a node to itself. | `selfFlow`, and `allowSelfLoops: false`. |
| `supply-chain.unknown-group` | warning | A node names a group that is not there; it is drawn outside every group. | Not expressible under containment. |
| `supply-chain.empty-group` | warning | A group has no members; it is not drawn. | `emptyGroup`. |

A second flow between the same pair in the same direction is refused while drawing but not reported in a file, so the `.dis` sets `allowParallel: true` and states the refusal as a `connect` rule. Negative amounts are likewise refused by every edit but not reported in a file: the `.dis` uses `change` rules rather than a `min` facet, whose built-in check would report them.

## Known gaps

- **DISL 0.1 gaps this diagram exposed:** no way to read the selection in an expression (the trace needs a plugin function); no anchor sides restricted to left and right; no pinned bezier reach; one line per edge, so no band with a separately animated line along it; no label placed by another label's width; no conditional deletion confirmation with a count; no menu on empty canvas; no drop-from-palette toolbox mode; no form field that retypes or reparents; no "only when both coordinates are stored" rule for which positions the layout respects. Several of these are answered by DISL 0.2, as noted where they occur.
- **The client's share bar** is computed over the nodes in view, while the flow widths are computed over the whole document; see *Notation*.
- **The client** (`client/`) and the catalogue row are not yet committed in the standalone repository; the descriptions above are of the working tree on `claude/supply-chain-diagram-u8lo3k` on 2026-10-04.

## The examples

Two examples under `examples/` (also under `standalone:src/examples/diagrams/supply-chain/`, without their readmes), each written for ADP, because the notation is the repository's own and no published corpus of `.supply` documents exists to vendor. Their figures are illustrative orders of magnitude, not market data.

- **`examples/automotive/automotive.supply`**: a European maker of electric and combustion cars, from lithium, cobalt, nickel, copper, iron ore and rubber to private buyers and company fleets: 7 groups, 24 nodes in all seven stages, 25 flows.
- **`examples/gpu-memory/gpu-memory.supply`**: the GPU and memory industry, from rare earths, gallium, quartz, neon and process chemicals through wafers, lithography, logic and memory fabs, HBM stacking and packaging to phones, laptops, graphics cards, servers and their markets: 8 groups, 26 nodes, 38 flows.

Their readmes list what they do not demonstrate: authored positions (no node states `x` or `y`, so both are drawn entirely by the layout), a cycle, a node outside every group, an empty group, and a document that breaks the rules (the fixtures cover that).

## Sources

- Module code and tests: `src/diagrams/supply-chain/` in etalii.adp.ide.standalone, branch `claude/supply-chain-diagram-u8lo3k`.
- Catalogue row: `docs/tools.md` in etalii.adp.ide.standalone, row for `etalii/supply-chain`.
- Canvas library: `src/client/src/canvas/library/` and `src/client/src/canvas/canvas.css` in etalii.adp.ide.standalone.
- Inspiration: the [yFiles supply chain showcase](https://www.yfiles.com/demos/showcase/supply-chain/).
