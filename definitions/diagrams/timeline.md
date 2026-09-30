# Timeline diagram

[timeline.dis](timeline.dis) specifies ADP's **Timeline diagram** (`generic/timeline`) in DISL. This page holds everything about the tool that DISL 0.1 cannot express, or can express only approximately, so that an IDE implementing the tool from the specification ends up with the tool that exists today. Each aspect names the code or document that shows it.

The reference implementation is the standalone module [`src/diagrams/timeline/`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/diagrams/timeline) in etalii.adp.ide.standalone. Its original requirements live in that repository's history (`.spec-workflow/archive/specs/timeline-diagram/`, removed in `ece03c36`); requirement numbers below (R3.4 and so on) refer to that document. The Notion "Tools" row for the tool says: kind Diagram, focus areas *Planning and roadmapping* and *Technology assessment*, "Time is the axis that matters; a dedicated timeline tool snaps elements to rows and dates, which a generic canvas leaves to the eye." The project's conversations contain no further decisions about this tool.

Paths below are relative to `src/diagrams/timeline/` in the standalone repository unless they start with `src/`.

## How the specification maps the tool

| Tool concept | In timeline.dis | Notes |
| --- | --- | --- |
| Element with an end (a period) | node type `Period` | Wire type `generic/timeline+period`. Labelled "Element" in the toolbox. |
| Element without an end (a moment) | node type `Moment` | Wire type `generic/timeline+moment`. |
| Both | abstract `Element` | Holds `label`, `begin`, `row`. |
| Connection | relation `Connection` | Wire type `generic/timeline+connection`; the UI calls it a "relation". |
| x axis | time axis `time` | Seconds since the Unix epoch in the implementation. |
| y axis | linear axis `rows`, 60 canvas units per row | See *Rows* below. |

The split into `Period` and `Moment` is a modelling choice of this specification. In the file there is one kind of element, and whether it is a period or a moment is decided only by whether an `end` key is present (`backend/EtAlii.Adp.Diagram.Timeline/TimelineParser.cs`, `ReadElements`). Giving a moment an end, or removing a period's end, is a retype in DISL (`giveEnd`, `removeEnd`) and a single-key edit in the file.

## The document on disk

DISL's `persistence` layer describes a DID definition. The timeline does not store DID: it stores its own YAML format, so the whole file format is documented here.

**Two files.** A timeline is `<name>.adp`, whose first line is the MIME-style origin `generic/timeline`, plus a sibling body `<name>.tml` (Timeline Markup Language) holding the timeline itself (R1.1). `.tml` is owned outright by this type: a bare `.tml` routes to it with no registration step, and the extension is not shared with any other tool (`backend/EtAlii.Adp.Diagram.Timeline/Diagram.cs`, R1.2).

**Why its own format.** The Gantt family (`mermaid/gantt`, PlantUML gantt) was considered and rejected: they compute their layout, express links only as scheduling dependencies and have nowhere to put an authored row. YAML is the serialization; schema and extension are ADP's own (R1.4).

**Layout of the file.**

```yaml
timeline: 1
elements:
  - id: discovery
    label: Discovery
    begin: 2025-04-27
    end: 2025-06-05
    row: 11
  - id: launch
    label: Launch
    begin: 2025-12-04
    row: 8
connections:
  - id: c1
    from: discovery
    to: launch
    label: informs
```

- `timeline: 1` is the schema marker. `elements` is a sequence of mappings with `id`, `label`, `begin`, optional `end` and `row`. `connections` is a sequence of mappings with `id`, `from`, `to` and optional `label`. Keys are read with those exact names; a missing `connections` key means no connections.
- A new document is exactly `timeline: 1\r\nelements: []\r\n`: CRLF, a trailing newline, no title and no sample content (`backend/EtAlii.Adp.Diagram.Timeline/TimelineDocumentFactory.cs`, R1.3).
- An empty file, or one whose root is not a mapping, is an empty timeline, not an error (`TimelineParser.Parse`).

**Only the affected lines change (R2.1, R2.2).** Nothing ever serializes a model back to the file. Every write is a splice of the line range the parser recorded for that element or connection (`backend/EtAlii.Adp.Diagram.Timeline/TimelineWriter.cs`). Consequences an implementation must reproduce:

- A document opened and saved with no edit is byte-identical: line endings (LF or CRLF), indentation, key order, comments, blank lines, quoting style and a missing final newline all survive.
- Keys the tool does not model survive verbatim, at document, element and connection level, including nested sequences (R2.3; fixture `unmodelled-keys.tml`). DISL's `x-*` rule covers the specification, not user files.
- A new element is appended after the last existing one, with indentation copied from the file (only an empty document falls back to two spaces). Keys are written in the order `id`, `label`, `begin`, `end` (only for a period), `row`. A label is quoted only when it needs to be.
- A new connection is appended after the last existing one; when the file has no `connections:` key, the key is created at the end of the document together with the first entry, and undoing that insert removes the key again so the file returns byte for byte (`TimelineWriter.HasConnectionsSection`, `RemoveConnectionsSectionIfEmpty`). The `label` key is omitted when the label is empty, and clearing a connection's label removes the key.
- Removing a period's end removes the `end` line (R11.3).
- The fixture corpus in `backend/EtAlii.Adp.Diagram.Timeline.Tests/Fixtures/` (comments, CRLF/LF pair, no trailing newline, odd indentation, quoting, shared rows, unmodelled keys) is the test of all this; `*.tml -text` in `.gitattributes` keeps git from rewriting it.

**Ids.** Ids live in the file because the schema is ADP's own. New ids are ShortGuids: 25-character lowercase base-36 renderings of a GUID (`src/backend/EtAlii.Adp/ShortGuid.cs`), for example `467lu0vgaiudevamnkpl6k052`. Hand-written ids (`discovery`, `c1`) are equally valid. DISL's id strategies have no ShortGuid, so timeline.dis says `nanoid`, which is the nearest shape. A command that creates an element generates its ids once, when the gesture happens, so a redo re-creates the element under the same ids.

**Times as written.** `begin` and `end` are ISO 8601, either date-only (`2026-01-05`) or date-time without offset (`2026-01-05T14:30:00`). The implementation keeps the **text** as written and its **precision** (date or date-time), decided by whether the text contains a `T` (`_Model/TimelineInstant.cs`, `_Model/TimelinePrecision.cs`). DISL's `datetime` type has one representation, so timeline.dis declares `datetime` with `timezone: "preserve"` and this page carries the rest:

- A value is read at face value and pinned to offset zero; it is never interpreted in the machine's local time zone (`TimelineInstants.cs`). A value written is the value drawn (R3.7).
- One element never mixes a date-only value with a date-time value (R3.2).
- A value the tool writes back after a drag or resize takes the precision of the value it replaces: `2026-01-05` stays `2026-01-05`, never `2026-01-05T00:00:00` (`TimelineScale.ToText`). Date-times are written as `yyyy-MM-ddTHH:mm:ss`, rounded to the whole second.
- Values created by the tool (toolbox drops, create-and-relate, add after or below) are always date-only.

**An unreadable file** (not YAML) opens in the unavailable state naming the parser's message and line, and no edit is accepted until it is fixed, so a broken file is never made worse (R2.4, `_Model/TimelineDocumentEntry.cs`). The store keeps the last good document across a reload that cannot read, and a deleted body closes rather than lingering (`TimelineDocumentReloader.cs`). Changes made to the file outside ADP are picked up and pushed to every open view.

## Rows

A row is an integer the author owns: negative rows are valid, gaps are allowed, and several elements share a row (R3.5). It is a placement grid and **nothing more**: no identity, label, membership or meaning (R3.6). That is what keeps this a timeline rather than a swimlane, so an implementation must not add lane headers, lane labels or lane packing. DISL's ordinal axis would give rows identity, so timeline.dis uses a linear axis in row units with grid snapping of one row instead.

- A row is 60 canvas units high (`TimelineRows.Height`, mirrored as `ROW_HEIGHT` in `client/TimelineCanvas.tsx`). The height is a rendering constant, not data.
- A vertical drag snaps to the nearest row; halves round **away from zero**, so the midpoint between two rows resolves the same way on both sides of the origin (`src/backend/EtAlii.Adp.Documents/RowRounding.cs`, shared by the client's `snapToStep`). DISL's `nearest` does not say how halves round.
- A row that does not read as an integer is read as row 0.
- Overlapping elements are drawn overlapping; the tool never moves anything to avoid overlap (R4.5).

## The time axis

- The implementation's x is seconds since the Unix epoch, as a double (`TimelineScale.cs`); the time-to-coordinate conversion lives in exactly one function pair.
- The client freezes a seconds-to-canvas-units scale when the first non-empty model arrives: the span of all elements plus 10 % on each side, fitted to about 1200 units; for an empty timeline, one day is 20 units (`timelineScaleOf` in `client/TimelineCanvas.tsx`). It is frozen so an edit never rescales the drawing under the user. DISL's fixed `scale` of 20 units per day in timeline.dis is the empty-timeline value; the fitted initial zoom is this implementation's.
- The same document always draws identically (R4.7).

**x snapping depends on the element.** A date-only element's begin snaps to the start of a day when dragged, and its edges snap to days when resized. An element whose times carry a time of day does not snap in x at all and keeps whole seconds (`snap` in `TIMELINE_DEFINITION`, `TimelineScale.ToTime`). DISL cannot make snapping depend on a value's written precision, so timeline.dis declares day snapping, which is the case for every element the tool itself creates.

## The time ruler

The ruler is chrome fixed to the view, not to the diagram (R5). DISL's `ruler` declares a position and levels; the behaviour below is the tool's own (`client/TimelineRuler.tsx`, `client/timelineTicks.ts`, `client/timeline.css`):

- It sits along the **bottom** of the view, 24 px high, stays in sight whatever is scrolled vertically, and is visually subordinate: muted 10 px labels on a mostly transparent band, no pointer events.
- Its labels slide with the content, because their x comes from the same view transform as the elements.
- The label interval adapts to the visible span so labels neither crowd nor vanish: at least 80 px per label, choosing from 1 s, 15 s, 1 min, 5 min, 15 min, 1 h, 6 h, 1 day and 1 week, then calendar months, quarters and years (any whole number of years). Labels fall on round UTC boundaries, never on offsets from the viewport edge.
- Label text: `HH:mm:ss` below a minute, `HH:mm` below a day, `Mon d` for days and weeks (`Mon yyyy` on the first of a month), `Mon yyyy` for months and quarters, and the bare year on 1 January and for year ticks.
- It is measured against the surface's real width, so a label sits over the elements it dates.

## Appearance

- A period is a box 36 units high, its left edge at begin and its right edge at end, at least 2 units wide. It sits at the top of its row, leaving a 24-unit gutter to the next row. Its label is inside, on one line, truncated.
- A moment is a diamond with a radius of 9 units, drawn with its left tip at begin and its centre 18 units below the top of its row, so it lines up with the middle of the periods on the same row. Its label is beside it. It is filled with the accent colour and has no outline (`client/timeline.css`, the library's `moment` shape). timeline.dis expresses the vertical alignment as a placement offset of 0.3 row.
- An element with an empty label shows its id instead.
- A connection leaves the **end** anchor (right-side midpoint) of its source and arrives at the **begin** anchor (left-side midpoint) of its target, always; anchors never move to the top, bottom or a corner (R8.1). It is a cubic bezier that leaves and arrives horizontally. When the target begins left of where the source ends, the curve loops forward out of the source and back into the target (`forwardBezierPath` versus `horizontalBezierPath` in `src/client/src/canvas/connectors.ts`); DISL's `bezier` routing has no such rule. It has no arrowhead. Its label sits at the midpoint, 6 units above the line.
- Connections are redrawn continuously while an element is dragged or resized, not only on release (R6.5, R7.7, R8.6).
- The shared canvas styling (`src/client/src/canvas/canvas.css`) supplies colours and selection states; the timeline adds only the moment's fill and the ruler.

## Gestures

- **Move.** A horizontal drag shifts begin and end by the same amount, keeping the duration; a vertical drag changes only the row; a drag with both does both, as **one** edit with one undo entry (R6.1 to R6.4). A moment never gains an end from a drag. While dragging, a hint above the element shows the time under its left edge and the row it would land on, as `yyyy-MM-ddTHH:mm:ss · row N`. `Escape` returns the element and records nothing (R6.6).
- **Resize.** A selected period shows adorners on both edges; the left one changes only begin, the right one only end. The moving edge stops at the other instead of crossing it, on the client and again on the server (R7.4, `SetTimelinePlacementCommandHandler`). A moment offers no right adorner (R7.5). A resize is sent as a property edit of begin or end, formatted in the element's own precision.
- **Relate.** Dragging from an element's **end** anchor to another element relates source to target. Dragging from its **begin** anchor runs the relation the other way: the element dropped on becomes the source, because what precedes an element points into it. The whole gesture travels as one stateless call (`TimelineRelationGesture.cs`), deliberately replacing a two-call protocol whose stale state once related the wrong pair.
- **Create and relate.** Releasing a relation on empty canvas creates a new element there (begin at the start of the dropped day, row nearest the drop, 14 days long, labelled "New element") and relates it, in one command and one undo. From the begin anchor, the new element is the source and the existing one the target. DISL's `createTarget` only covers the end-anchor direction.
- **Self relations are refused**; two relations between the same pair are allowed, because each carries its own label (R8.7, R8.8).
- **Toolbox drop.** The palette has two items, *Element* and *Moment*, described by the backend as data (R9, `TimelineToolboxProvider.cs`). A drop creates the element with its begin at the start of the day under the drop and its row nearest the drop; an element is 14 days long. It is labelled "New element" or "New moment" and offered for rename in place. The drop and the menu run the same command.
- There is no connection tool in the palette; relations are made only by dragging from an anchor.

## Actions and keys

Actions come from the backend as data and reach the ribbon, the right-click menu and the keyboard through one path (R11.2, `TimelineContextActionProvider.cs`).

| On | Action | Key | Behaviour |
| --- | --- | --- | --- |
| Element | Rename… | F2 | Asks for the label. |
| Moment | Give it an end… | | Asks for the end, prefilled with the begin; refuses an unreadable time and an end before the begin as typed. |
| Period | Remove its end | | Removes the `end` key; the period becomes a moment. |
| Element | Remove | Delete | Removes the element and every relation attached to it. With no relations it happens at once; otherwise it asks first, naming the count ("…also removes the 1 relation attached to it." / "…the N relations…"), as a danger confirmation (R2.5). |
| Element | Add element after | Tab | A new element 6 days after this one's end (or begin, for a moment), 14 days long, same row, related from this one. |
| Element | Add element below | Enter | A new element with this one's begin, one row down, 14 days long, related from this one. |
| Relation | Relabel… | F2 | Asks for the label; an empty label removes the key. |
| Relation | Remove relation | Delete | |
| Empty canvas | Add element here, Add moment here | | Placed at the clicked time and row. From a menu without a position, asks for the begin (prefilled with today) and uses row 0, or the row of the element the gesture anchored on. |

Additions are a separate menu group from the edits. timeline.dis models the additions and end changes as operations; DISL's static `confirm` cannot carry the relation count. An action that does not apply to the selection is reported as not applicable rather than failing silently (R11.8). Every edit is one command with an inverse on the project's history (R11.1).

## Properties

The property grid shows, for an element: **Label** (group Identity), **Begin** and **End** (group Timing; End only for a period) and **Row** (group Placement). For a relation: **Label**, and **From** and **To** read-only with the reason "Reconnecting is done on the canvas, by dragging the relation's end to another element." (`TimelineContextPropertyProvider.cs`, R10).

- Begin and End are plain line editors validated on commit; there is no date picker yet (R10.6). A value that does not read as a time is refused ("'…' is not a time this timeline can read."), a value in the other precision than the element's other time is refused ("This element uses the other time form; begin and end must both be dates, or both carry a time."), and an end before the begin is refused. A moment shows no empty End row: giving it an end is the menu's job.
- Editing Begin moves only the begin; unlike a drag, it does not keep the duration.
- Every edit travels as a command onto the history and out to other views, never written by the panel directly (R10.5).

## Diagnostics

Problems reach the Errors and Warnings panel, not a canvas overlay (R12). All are **warnings** naming the element, and the rest of the diagram still draws; only an unparseable file is an **error**, reported as one problem with the same message the unavailable state shows (`TimelineRuleSet.cs`, `TimelineValidator.cs`, `TimelineRules.cs`).

| Rule id | When | In timeline.dis |
| --- | --- | --- |
| `timeline.unparseable` | The file is not YAML (error, with line). | Not expressible. |
| `timeline.missing-id` | An element or relation has no id. | Not expressible; ids are persistence. |
| `timeline.duplicate-id` | Two declarations share an id. | Not expressible. |
| `timeline.unreadable-time` | A begin or end is not a time. | Partly: `std.required` downgraded to warning. |
| `timeline.end-before-begin` | End lies before begin; only a hand edit can cause it. | `endBeforeBegin`. |
| `timeline.mixed-precision` | One element mixes a date and a date-time. | Not expressible. |
| `timeline.dangling-connection` | A relation names an element that does not exist. | `std.references` downgraded to warning. |

Elements with problems stay on the canvas: an element whose begin cannot be read is drawn at the epoch as a moment, so it stays selectable, and a relation to a missing element is still sent so the canvas can show it (`TimelineElementMapper.cs`).

## Scale and performance

- The client asks the backend only for what is in view; a period is culled on its whole span, not its begin, and a relation is sent only when both its ends are (`TimelineElementMapper.Visible`).
- Scrolling and zooming never round-trip to the backend (NFR performance).

## Known gaps

- Several requirements stated in the original specification are not visible in the code: choosing *Relate* from a menu and then clicking a target (R11.6) and adorners withheld in read-only mode (R7.8) were not verified here.
- There is no date editor in the property grid (R10.6).
- The only real `.tml` documents are the two examples under `examples/`; the fixtures were written by the module's author, which the fixtures' own readme names as a weakness.
