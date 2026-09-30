# Gartner hype cycle graph: what DISL does not express

This document accompanies [gartner-hype-cycle-graph.dis](gartner-hype-cycle-graph.dis), the DISL specification of the Gartner hype cycle graph diagram. The specification holds everything DISL 0.1 can state: the metamodel, the axes, the phased banner, the forms, the constraints, the hooks and the two viewpoints. This document holds the rest, each point tied to the code, specification or ruling that shows it.

The tool it describes is the standalone module `src/diagrams/gartner-hype-cycle-graph/` in [etalii-adp/etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/diagrams/gartner-hype-cycle-graph), read at `develop` commit `b2a2692`. Its tool type origin is `gartner/hypecycle-graph` and its documents use the extension `.ghg`. Unless a path says otherwise, it is relative to that module: `backend/` is `backend/EtAlii.Adp.Diagram.GartnerHypeCycleGraph/`, and `client/` is the module's client folder.

## Contents

1. [Sources](#sources)
2. [The document](#the-document)
3. [Time beyond what DISL's time types hold](#time-beyond-what-disls-time-types-hold)
4. [Phases](#phases)
5. [Influences](#influences)
6. [Triggers](#triggers)
7. [Notes](#notes)
8. [Canvas chrome: ruler, tag filter, legend](#canvas-chrome-ruler-tag-filter-legend)
9. [Compact mode](#compact-mode)
10. [Toolbox, context actions and the property grid](#toolbox-context-actions-and-the-property-grid)
11. [Validation rules](#validation-rules)
12. [Refusals and confirmations](#refusals-and-confirmations)
13. [Extension keys used in the specification](#extension-keys-used-in-the-specification)
14. [Rulings from the owner](#rulings-from-the-owner)
15. [The Notion row](#the-notion-row)

## Sources

- The module's code, as named per point below.
- The three requirements documents in the standalone repository: `.spec-workflow/specs/gartner-hype-cycle-graph/requirements.md`, `.spec-workflow/specs/ghg-compact-mode/requirements.md` and `.spec-workflow/specs/ghg-triggers-and-notes/requirements.md`.
- The catalog row in the standalone repository's `docs/tools.md`.
- The Notion "Tools" database row for the Gartner Hype Cycle (see [The Notion row](#the-notion-row)).
- The owner's rulings in the project's conversations while the module was built (see [Rulings from the owner](#rulings-from-the-owner)).

## The document

DISL's persistence layer describes JSON-like records keyed by id; the `.ghg` document is a hand-editable YAML file with its own shape and its own writing discipline. The specification names it `plugin:net.etalii.adp.gartner.ghgYaml` and declares that plugin required. What the plugin does:

**Shape.** (`backend/GhgParser.cs`, `backend/GhgWriter.cs`, the examples under `examples/`)

- The first key is the header `gartner-hypecycle-graph: 1`. The `1` is the document version; this specification's `language.version` `1.0.0` corresponds to it.
- An optional top-level `unit:` follows, one of `month`, `year`, `decade` or `century`; absent means `month`. It is the DISL diagram attribute `unit`.
- Then up to four lists, always in this order: `trends:`, `triggers:`, `notes:`, `influences:`. A `triggers:` or `notes:` list is opened just before `influences:` only when its first entry is added. Adding to a list the document does not have is refused: "The document has no `trends` section to add to."
- Keys are kebab-case in the file and camelCase in the specification, because DISL attribute names are simple identifiers: `peak-end` is `peakEnd`, `trough-end` is `troughEnd`, `slope-end` is `slopeEnd`, `from-phase` is `fromPhase`, `from-edge` is `fromEdge`, `from-at` is `fromAt`, and the same for `to-`.
- An influence names its ends with `from:` and `to:`, the ids of the elements it joins. DISL models these as the relation's source and target, which are reserved names and not attributes.
- Key order within an entry is fixed by the writer (`TrendKeyOrder`, `TriggerKeyOrder`, `NoteKeyOrder`, `InfluenceKeyOrder` in `backend/GhgWriter.cs`):
  - trend: `id, name, start, stop, row, phases, peak-end, trough-end, slope-end, tags, description`
  - trigger: `id, name, date, row, tags, description`
  - note: `id, text, at, row, width, height`
  - influence: `id, from, from-phase, from-edge, from-at, to, to-phase, to-edge, to-at, description`
- A new trend is written with `row` and `phases` even at their defaults, which is why the specification sets `omitDefaults` to false; a trend or trigger's `row` is rewritten only when it changed or is already present.
- Tags are written as a flow sequence on one line (`tags: [mining, steam]`), so adding a tag rewrites one line. An empty tag list removes the key. An empty description removes the key.
- A note's text is written as a literal block scalar (`|-`) when it has a line break, and as a plain or quoted scalar otherwise.
- An `at` of an influence end is written with at most two decimals (`GhgEnd.FormatAt`), matching the specification's `precision: 2`.

**Writing is splicing.** Every edit rewrites only the lines it changes (`LineSplice` in `backend/GhgWriter.cs`); the document is never re-serialised. An unchanged document therefore stays byte-identical, comments and blank lines survive, and keys the tool does not know survive an edit of the entry they sit in. DISL's `canonical` persistence aims at identical output from any two runtimes, which is a different promise; nothing in DISL says "preserve the author's text".

**Reading never fails.** The parser never throws (`backend/GhgParser.cs`). An unknown key, a malformed value or an entry it cannot read becomes a problem reported as `ghg.unreadable-entry`, with a line number, and the rest of the document is still drawn. Keys `from-phase`, `from-edge` and `from-at` on an influence that comes from a trigger are ignored and reported. A body that cannot be read at all opens as an empty, read-only diagram, and the document store refuses to write it; the property grid then says "The graph could not be read, so it cannot be edited." (`backend/GhgContextPropertyProvider.cs`).

**Ids.** New entries get a ShortGuid, a version 4 GUID written as 22 characters of URL-safe base64 (`Commands/Add*CommandHandler.cs`). The specification says `uuid-v4`; the 22-character encoding is not expressible. Hand-written ids such as `steam-engine` are kept. Ids are unique across all four lists together, not per list (`ghg.duplicate-id`), and adding an entry under an id already in use is refused: "That id is already used in this graph."

**The project entry.** In the standalone tool each diagram sits beside a `.adp` entry file that names the tool type origin `gartner/hypecycle-graph` and the `body:` document (for example `examples/coal-technologies/coal-technologies.adp`). That entry belongs to the IDE host, not to this diagram type.

## Time beyond what DISL's time types hold

DISL's `time` axis and `date` type could not carry this tool's time, for three reasons, so the specification uses a linear axis of steps and string dates converted by CEL functions:

- **Units coarser than a year.** The diagram's `unit` can be a decade or a century (`backend/_Model/GhgTimeUnit.cs`), while DISL's time units stop at `year`.
- **Years before 1.** Dates are signed astronomical years (`0000` is 1 BCE, `-3200` is 3201 BCE), with four to six digits after a minus sign (`backend/GhgScale.cs`, `MonthExpression`). CEL timestamps cover only years 0001 to 9999. The `eras-of-innovation` example uses such dates.
- **Month precision without days.** A date is a month, `YYYY-MM`; a month index is `year * 12 + month - 1`, with the year floored for negative months.

The scale (`backend/GhgScale.cs`, `scale-fixture.json`): four canvas units per step of the unit, the origin 1900-01 at x = 0, so `x = (monthIndex - 22800) * 4 / unitMonths`. Rows are 56 canvas units apart, a 32-unit trend plus a 24-unit gutter; a row's top is `row * 56`.

**Snapping differs by gesture**, which one DISL snap rule per axis cannot say:

- A move or resize snaps to the nearest step start, halves rounded away from zero, on both sides of the origin.
- A toolbox drop lands in the step that contains the drop point (floor), not the nearest one.
- A row is found from an element's top for a move (`RowAtTop`) and from its middle for a drop (`RowAtMiddle(y) = RowAtTop(y - 16)`).
- Each element carries its own snap origin (`snapX`, `snapY` in the payload): 0 for trends and notes, and for a trigger the offsets that put its centre on a step line and on a row's middle (`client/GhgCanvas.tsx`, `snap`). The specification gives the trigger a row offset of 16/56 and centres it on the step start.

**Label formats follow the unit.** A trigger's date reads `Dec 1947` in a diagram of months and the year alone (`1947`, or `-3200`) in one of years or coarser (`GhgScale.FormatWhen`); the tooltip uses the full month name (`FormatWhenLong`). The specification's `formatWhen` function mirrors this.

## Phases

The phase boundary rule is in the specification (`phaseBoundaries`), checked against `GhgPhases.BoundariesOf` over 200,000 random trends with no difference. What it cannot express:

### Dragging a phase boundary

On a selected trend in true-time, each drawn inner boundary is a handle (`draggableBoundaries: true` in `client/GhgCanvas.tsx`). Dragging it snaps to a step, is kept at least one step from its neighbouring boundaries or the trend's ends (`boundaryLanding` in the standalone client's `canvas/library/shapes/segments.ts`), and writes the boundary's model attribute (`peakEnd`, `troughEnd` or `slopeEnd`) as a month (`Commands/SetGhgBoundaryCommandHandler.cs`). DISL shape handles edit shape parameters stored in view data, never model attributes, so the specification records the handles only as the `x-ghg-boundaryHandles` key on the `phasedBanner` shape. Only a boundary between two visible phases can be moved; any other is refused with "Only a boundary between two visible phases can be moved." The same boundaries are editable in the property grid as "Peak ends", "Trough ends" and "Slope ends"; the specification shows them as computed values because the grid shows the drawn boundary, which may be spread rather than stored.

### Keeping every phase at least a month long

Setting a boundary, and rescaling boundaries after a resize, clamps each stored boundary so every visible phase, including those spread evenly around it, stays at least one month long (`KeptAMonthApart` in `backend/GhgPhases.cs`). A stored boundary beyond the last visible phase is only kept inside the span. The specification's `rescaleBoundaries` hook does the proportional rescale (`newStart + round((b - oldStart) * newSpan / oldSpan)`, which is an exact shift on a move); the clamp that follows is an iterative pass over neighbouring anchors that one declarative `set` per attribute cannot express.

### Other phase behaviour

- **A changed phase count keeps the stored boundaries** (`GhgWriter.SetPhases`, Requirement 3.4). A boundary beyond the new last visible phase stays in the file, is not drawn and is not a neighbour for spreading.
- **A span shorter than its phases is refused**: a trend showing N phases must be at least N months long. The specification states this as two gesture constraints; the exact refusal text is in [Refusals and confirmations](#refusals-and-confirmations).
- **Per-segment tooltips.** Hovering a phase shows its full Gartner name: "Peak of Inflated Expectations", "Trough of Disillusionment", "Slope of Enlightenment", "Plateau of Productivity" (`GhgPhases.GartnerNames`, Requirement 4.4). DISL tooltips belong to a node, not to a shape part, so the specification records each on its part as `x-ghg-tooltip`.
- **Phase titles** in the grid and in influence lists are Peak, Trough, Slope and Plateau (the `Phase` enum labels).
- **Even phases** (`ghg.even-phases`) forgets all three stored boundaries. It is offered only while one is stored; asked for otherwise it is refused with "This trend's phases are already even."

## Influences

### Attaching an influence to a phase

An influence end is not an anchor point of a node: it is a phase, an edge and a fraction. It attaches anywhere along the top or bottom edge of one phase segment, at `at` from 0 to 1 along that segment's stretch of the edge (`anchors: { kind: "along", edges: ["top", "bottom"], regions: "segments" }` in `client/GhgCanvas.tsx`; `attachmentPointOf` in `segments.ts`). Because `at` is a fraction of the segment, a resize or a boundary drag moves the end proportionally. DISL's anchoring offers outline, centre, fixed points, sides or ports, none of which is bound to model attributes, so the specification models the three attributes per end and records the binding as `x-ghg-attachment` on the edge notation. No anchor dots are drawn on trends; the whole edge is the handle.

- **The connect gesture records both ends** as one undo step, sending `rel:{from}@{phase}/{edge}/{at}->{to}@{phase}/{edge}/{at}` (`backend/GhgGestures.cs`, `client/GhgCanvas.tsx` `gestureEnd`); a trigger's end carries no `@` part.
- **Moving an end.** A selected influence shows a handle on each end (`movableEnds: true`), which slides along the trend's edge and across into other phases. The drop writes `from-phase`, `from-edge` and `from-at` (or the `to-` keys), written in the grid as `phase/edge/at` such as `plateau/bottom/0.3` (`ghg.from-attachment`, `ghg.to-attachment`; `Commands/SetGhgAttachmentCommand*.cs`).
- **Default ends.** A gesture that carries no end leaves from the source's last visible phase, bottom edge, 0.5, and arrives at the target's Peak, top edge, 0.5 (`Commands/AddGhgInfluenceCommandHandler.cs`). The specification's `defaultEnds` hook states the same.
- **Drawing.** A cubic Bézier with an arrow at the target, leaving and entering perpendicular to the edge it attaches to, so it meets the border at 90° (`route: "cubic-bezier"`; `startDirection`/`endDirection: "normal"` in the specification).
- **Hidden, not removed.** An influence attached to a phase its trend does not show is hidden (`hideWhenAttachmentHidden: true`), stays in the document and still counts for the one-per-direction rule (Requirement 7.3). The specification's condition hides it with `visible: false`.
- **One per direction.** A to B and B to A may both exist; a second A to B is refused. The duplicate check reads the document, not what is drawn, so a hidden influence still blocks a new one.

## Triggers

(`client/GhgCanvas.tsx` `TRIGGER_TYPE`; `.spec-workflow/specs/ghg-triggers-and-notes/requirements.md`)

- A circle 16 across, half a trend's height, centred on its step's start and its row's middle. Never resized.
- Its label is written before it as `{name} · {when}`. Only the name is edited in place: the inline editor opens on the name alone, not on the composite text. The specification approximates this with a `parse` that keeps the text before ` · `.
- The tooltip reads `Trigger: {name}, {December 1947}`.
- An influence may start at a trigger but never end at one. It leaves from one of three invisible handles, top, right and bottom, and the line leaves the outline facing its target wherever the gesture began (`anchors: { kind: "compass", positions: ["n", "e", "s"], attachDrawnBy: "edge", visible: false }`). The document stores nothing for that end.
- Removing a trigger removes the influences from it, after the confirmation below.

## Notes

(`client/GhgCanvas.tsx` `NOTE_TYPE`; `Commands/SetGhgNoteSizeCommand*.cs`)

- A box with the author's text, word-wrapped and edited in place over several lines; overflowing text ends in an ellipsis and the whole text is the tooltip.
- Dropped from the toolbox it is 160 by 64, its top-left at the step start and the row top of the drop, and its editor opens at once (`editOnDrop: true`). DISL's tool `after: "editLabel"` is the nearest statement.
- It moves and resizes in both directions. A resize sends one command, `W x H at YYYY-MM row N` (the regex in `SetGhgNoteSizeCommand.cs`), so size and position change in one undo step. In the grid, Size reads `160 x 64` and accepts the same form; anything else is refused with "'…' is not a size; write it as width x height, such as 160 x 64."
- `width` and `height` are canvas units and are stored as numbers with at most two decimals. DISL's size binding is assumed to write back on resize; if a runtime only reads it, the resize is this tool's own.
- No anchors, no tags, no influences, and it stays visible under every tag filter.
- A note whose position cannot be read cannot be resized: "This note's position cannot be read, so it cannot be resized until it is fixed in the file."

## Canvas chrome: ruler, tag filter, legend

**Ruler.** A horizontal ruler pinned to the bottom of the screen, not to the canvas (`chrome.rulers` in `client/GhgCanvas.tsx`). Its rungs, finest first, are month (`MMM yyyy`), quarter (`MMM yyyy`), year (`yyyy`), decade (`yyyy`), century and millennium (`yyyy`, as 10 and 100 decades starting on years ending in 00 and 000). A diagram drawn in a coarser unit keeps only the rungs at least one of its steps wide, and a rung is shown only while its labels are at least 64 pixels apart (`minSpacingPx`). DISL ruler levels are calendar units up to `year` on a `time` axis; this axis is linear in steps, so the specification only declares a visible ruler at the bottom.

**Tag filter.** A "Filter by tags" box with tag chips, a lookup of the tags in use and an Any/All switch; matching is case-insensitive (`filter` in `client/GhgCanvas.tsx`; the library's `DiagramCanvas.tsx`). It applies to trends and triggers only. Elements that do not match are hidden, not dimmed, together with every influence to or from them; notes always stay. The filter is a view state only and is never saved. An earlier and/or expression filter was replaced by the chips at the owner's request. DISL has no user-driven view filter.

**Legend.** A key to the phase colours sits under the filter box, one swatch per phase painted by the same rule that paints the phase (`legend` under `filter`). The specification's `canvas.legend` names the `Phase` enum; the placement under the filter is the tool's.

**Theme colours** are the specification's `ghg.*` theme tokens, taken from the standalone client's `src/client/src/index.css`, which `client/ghg.css` applies to the phases, triggers and notes.

## Compact mode

The specification's `compact` viewpoint states the static part: trends 24 canvas units per visible phase (96 for all four, twice a new true-time trend), even phases, nothing moved or resized, no ruler, and a row-packed layout declared as the plugin `net.etalii.adp.gartner.rowPacked`. What the tool adds (`client/GhgCanvas.tsx`, `layout`; `.spec-workflow/specs/ghg-compact-mode/requirements.md`):

- **A toggle, not a viewpoint picker.** A "Compact" switch below the legend. It is not remembered: every diagram opens in true-time.
- **The layout.** Every element keeps its stored row; within a row, elements keep the order of their start dates and are placed as far left as they fit, 4 canvas units apart. An influence's target starts after the middle of its source, so causes read to the left of their effects (`followConnections`). Only trends take the compact width; triggers keep their circle and notes their box, and a note two rows tall keeps both rows clear.
- **The whole document.** Compact places every trend by where all the others start, so while it is on the view reported to the backend is the whole canvas rather than the part on screen.
- **What still works.** Influences (drawn, added and removed), renaming, the property grid, undo and the tag filter. The boundary handles, moving, resizing and the ruler are gone.
- **Drops.** A toolbox drop in compact still needs a date; it is approximated by running the placement backwards from the drop point.

## Toolbox, context actions and the property grid

**Toolbox** (`backend/GhgToolboxProvider.cs`): the icons and descriptions are in the specification. A dropped trend is 12 steps of the unit long with all four phases; the default names "New trend" and "Trigger" are numbered "New trend 2", "New trend 3" when taken (`GhgEdits.UniqueName`), which the specification's `uniqueName` function mirrors. Influences are drawn, not dropped, so they have no toolbox entry. The toolbox is supplied by the backend, and a toolbox derived from the definition drops the same add actions (`DROPPED_ACTIONS`).

**Context actions** (`backend/GhgContextActionProvider.cs`):

- Trend: Rename… (F2), Even phases, Remove (Delete).
- Trigger: Rename…, Remove.
- Note: Edit text…, Remove.
- Influence: Remove influence.
- Activating an element (double-click) also renames it.
- A read-only diagram offers nothing that edits.

**Property grid** (`backend/GhgContextPropertyProvider.cs`): the specification's forms follow it. Details it cannot state exactly:

- The Phases slider's four stops are labelled "Peak", "Peak and Trough", "Peak, Trough and Slope" and "All four". DISL has no labelled slider stops; the specification passes them as `widgetOptions.labels`.
- The per-phase groups' "Influence" and "Influenced by" lists are read-only text, one `Name · Phase` per line, or a trigger's name alone, or "None". A hidden phase's group is titled `{Phase} (hidden)` and is shown only while an influence attaches to it.
- Tag suggestions are the tags in use on trends and triggers.
- The "From attachment" and "To attachment" fields are one text field each in the tool, written `phase/edge/at`; the specification splits them into their three attributes.
- Descriptions are shown only in the grid; they are never drawn.

## Validation rules

All twelve rules report as warnings in the Errors and Warnings panel, each with the line of the entry it concerns (`backend/GhgRuleSet.cs`, `backend/GhgValidator.cs`). Saving is never blocked. How each rule is carried in the specification:

| Rule | Where it is in the specification |
|---|---|
| `ghg.duplicate-influence` | `allowParallel: false` on `Influence` (built-in `std.endpoints`, re-rated to warning). |
| `ghg.self-influence` | `allowSelfLoops: false` on `Influence` (`std.endpoints`). |
| `ghg.stop-before-start` | Constraint `stopAfterStart`. |
| `ghg.phase-count` | Constraint `phaseCount`. |
| `ghg.boundary-order` | Constraint `boundaryOrder`: stored boundaries strictly inside the span and strictly in order. |
| `ghg.bad-attachment` | Constraint `sourceAttachment` for the from end; `std.required` and `std.facets` for the to end. |
| `ghg.dangling-reference` | `std.references`. |
| `ghg.duplicate-id` | Not expressible: DISL ids are unique by construction, while a hand-edited `.ghg` can repeat one, across all four lists. |
| `ghg.unreadable-entry` | Not expressible: raised by the reading plugin (see [The document](#the-document)). |
| `ghg.influence-into-trigger` | `target: "Trend"` on `Influence` (`std.endpoints`). |
| `ghg.trigger-date` | `required` on `Trigger.date` (`std.required`). |
| `ghg.note-position` | `required` and `exclusiveMin: 0` on `Note.at`, `width` and `height` (`std.required`, `std.facets`). |

The rule messages are the tool's own sentences, such as "`a` influences `b` 2 times; a trend influences another once in each direction." Where a built-in constraint carries the rule, the message is the runtime's, not this one. The explicit constraints carry the tool's rule id in `tags`.

## Refusals and confirmations

The backend refuses what the canvas would not offer anyway, because a request is never trusted to come from this canvas. The sentences, verbatim:

- "A trend needs a name." and "A trigger needs a name." (a note's text may be emptied)
- "A trend must stop after it starts, at least one month later." and "A trend must be at least one month long."
- "A trend showing N phases must be at least N months long, one per phase." (`GhgEdits.cs`)
- "A trend shows 1 to 4 phases."
- "'…' is not a date; write it as YYYY-MM, such as 2007-06."
- "Only a boundary between two visible phases can be moved."
- "This trend's phases are already even."
- "An influence cannot end at a trigger.", "An influence is drawn from one trend to another.", "A trend cannot influence itself.", "This trend already influences that one; a trend influences another once in each direction."
- "An influence has a from end and a to end." and "An influence attaches to a phase, on its top or bottom edge, at a fraction from 0 to 1."
- "That id is already used in this graph."

**Removing with influences.** Removing a trend or trigger that has influences asks first, in a danger-styled confirmation titled "Remove": "Removing this trend also removes the 1 influence to or from it." or "… the N influences to or from it." With no influences it removes at once. DISL's `deletion.confirm` is one fixed text asked every time; the count and the skip are the tool's.

## Extension keys used in the specification

| Key | On | Meaning |
|---|---|---|
| `x-ghg-tooltip` | each phase part of `phasedBanner` | The phase's tooltip. See [Other phase behaviour](#other-phase-behaviour). |
| `x-ghg-boundaryHandles` | `phasedBanner` | The boundary handles and the attributes they write. See [Dragging a phase boundary](#dragging-a-phase-boundary). |
| `x-ghg-attachment` | the `Influence` edge notation | Which attributes place each end on a phase. See [Attaching an influence to a phase](#attaching-an-influence-to-a-phase). |
| `x-ghg-header` | `persistence` | The document's header key and version. See [The document](#the-document). |

## Rulings from the owner

Decisions Peter made in the project's conversations while the module was built, which the code follows:

- The extension is `.ghg` (2026-09-26).
- Dates before year 1 are written as signed ISO (astronomical) years (2026-09-27).
- The time axis stays linear, never logarithmic (2026-09-27).
- Phase colours: Peak yellow, Trough light grey, Slope orange, Plateau lime green.
- Phases are spread evenly until a boundary is dragged.
- One influence per direction.
- Filtered-out elements are hidden, not dimmed.
- Influence arrows meet the border at 90°.
- Anchor handles on trends are shown only when selected; triggers get handles top, right and bottom but no visible anchor dots (2026-09-27, cited in `client/GhgCanvas.tsx`).
- The phase legend sits under the filter box.
- The property grid lists each phase's influences.
- The filter is tag chips with an Any/All switch.
- Compact trends are twice as wide as a new true-time trend, a share per phase, and causes read left of their effects (2026-09-27, cited in `client/GhgCanvas.tsx`).
- The six open questions of the triggers and notes specification took their proposed defaults.

## The Notion row

The "Tools" database row: Kind Diagram; description "Gartner Hype Cycle (technologies and trends placed along the curve of expectations over time, from innovation trigger to plateau of productivity, with the relations between them)"; focus areas Technology assessment, Psychological and societal insights, Planning and roadmapping; purpose "Aims to provide insights in how socio-technological trends relate to each other."; rarity Unique to ADP; Standalone 🛠️ Work-in-progress; state 📝 Specified; theory [Gartner hype cycle](https://en.wikipedia.org/wiki/Gartner_hype_cycle); why specialized "The Hype Cycle's meaning lies in the position on its curve; a dedicated tool keeps each item on the curve and relates them, which free drawing loses."

The Notion page's description of compact widths predates the ruling above; the code and this document follow the ruling.
