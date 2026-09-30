# Causal loop diagram

[causal-loop-diagram.dis](causal-loop-diagram.dis) specifies ADP's **Causal loop diagram** (`systems/causal-loop-diagram`, extension `.cld`) in DISL. This page holds everything about the tool that DISL 0.1 cannot express, or can express only approximately, so that an IDE implementing the tool from the specification ends up with the tool that exists today. Each aspect names the code or document that shows it.

The reference implementation is the standalone module [`src/diagrams/causal-loop-diagram/`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/diagrams/causal-loop-diagram) in etalii.adp.ide.standalone. Its original requirements and design live in that repository's history (`.spec-workflow/archive/specs/causal-loop-diagram/requirements.md` and `design.md`, last present in the parent of `53f68611`); requirement numbers below (R3.5 and so on) refer to that document. The Notion "Tools" row for the tool ("Causal loop diagram") files it under the family *Knowledge & informal modeling*, with the focus areas *Systems and strategy*, *Psychological and societal insights* and *Technology assessment*, rarity *Adoption from concept* and state WIP. The project's conversations hold one thread about the tool, which wrote that Notion page; the diagram predates the project, so no other decision about it was taken in conversation.

Paths below are relative to `src/diagrams/causal-loop-diagram/` in the standalone repository, and backend files are in `backend/EtAlii.Adp.Diagram.CausalLoopDiagram/`, unless stated otherwise.

## How the specification maps the tool

| Tool concept | In causal-loop-diagram.dis | Notes |
| --- | --- | --- |
| Variable | node type `Variable` | Wire kind `systems/causal-loop+variable`; element id is the variable's identifier. The identifier attribute is called `name` because `id` is reserved in DISL. |
| Causal link | relation `CausalLink` | Wire kind `systems/causal-loop+link`; element id `link:{from}\|{to}`. The link's free text is called `note` (the standalone's `Label`, shown in the grid as "Note"), because a link's `label` would read as its caption. |
| Loop (a claim) | node type `Loop` | Wire kind `systems/causal-loop+loop`; element id `loop:{identifier}`. The descriptive name is `title` in DISL because `name` is taken by the key convention the variable uses; the grid calls it "Name". |
| Link polarity | enum `Polarity` | `positive`, `negative`, `unstated`. |
| Computed loop polarity | enum `LoopPolarity`, derived attribute `Loop.computed` | Reinforcing, balancing, undecidable (`LoopPolarity.cs`, `_Model/LoopPolarityResult.cs`). |
| Loop claim from its letter | derived `Loop.stated` | `_Model/CausalLoopLoop.cs`, `ClaimsReinforcing`. |
| Cycle enumeration | plugin CEL function `elementaryCycles` | Not expressible in CEL; see *Cycles* below. |
| Ring layout | layout algorithm `ring` (`circular` with `adp.ring.*` options) | Details below. |
| Arrange diagram | operation `arrange` using layout `selfOrganizing` (plugin) | Details below. |
| `.cld` + `.adp` files | persistence `format: plugin:net.etalii.adp.systems.cld` | Grammar below. |

A loop is modelled as a node because DISL has no "claim about a path" construct: it is not a relation (it has no two ends), and a group would imply containment. As a node it has no position of its own; DISL's computed `placement` puts it at the centroid of its members, which is what the standalone does.

## The document on disk

DISL's `persistence` layer describes a DID definition. The causal loop diagram does not store DID: it stores its own line-oriented format, so the whole file format is documented here, and the plugin `net.etalii.adp.systems.cld` reads and writes it.

**Two files.** A diagram is `<name>.adp`, whose first line is the origin `systems/causal-loop-diagram`, plus a sibling body `<name>.cld` (R1.1, R1.4; `Diagram.cs`). Positions the author sets, by dragging or by Arrange diagram, are stored in the `.adp` registration's shared `layout:` block, keyed `variable:<identifier>`, and never in the body (`Commands/ArrangeCausalLoopCommand.cs`; design, *Technical Standards*).

**Why its own format and not XMILE (R1.2).** XMILE, the OASIS interchange standard for system dynamics, was weighed and rejected on three grounds recorded in the design: it is a model format carrying stocks, flows and equations a causal loop diagram states none of; it has no first-class representation of the R/B loop, which is this notation's central artifact; and the extension was fixed as `.cld`, so an XMILE payload would be a third spelling of a format that already has two (`.xmile`, `.stmx`). Converting a `.cld` to XMILE, the stock-and-flow step, remains a possible later specification.

**Grammar (R1.3; `CausalLoopParser.cs`).** One statement per line, so adding a link is a one-line diff:

```text
causal-loop 1

variable population "Population"
variable births "Births"

link population -> births +
link births -> population + delayed weight=2 "seasonal"

loop R1 "Births beget births" population births
```

- `causal-loop 1` is the header. A line whose first word is `causal-loop` is skipped; the reader does not require the header, and does not check the version.
- Blank lines and lines starting with `#` are comments and state nothing.
- A line is split into words on whitespace; a double-quoted run is one word with its quotes dropped. This is how a label with spaces survives, and why no name and no label can contain a double quote.
- `variable <id> ["<Label>"]`. An empty id is a problem: "A variable needs an id of at least one character." (`CausalLoopEmptyVariableId.Tests.cs`).
- `link <from> -> <to> [polarity] [delayed] [flipped] [weight=<n>] ["<note>"]`. The words after the arrow may come in any order. `+` and `s` both mean positive, `-` and `o` both mean negative (R2.2). A polarity nobody wrote is **unstated**, not positive (R3.6). `weight=` takes an invariant-culture floating-point number; one that does not parse is a problem ("'weight=x' does not read as a weight."). Any other word is taken as the note, the last one winning. A malformed link reads: "A link reads 'link <from> -> <to>', optionally followed by a polarity, 'delayed', 'flipped', a weight and a label."
- `loop <Identifier> "<Name>" <variable> <variable> …` needs at least four words: the identifier, the name and at least one variable. The variables are the cycle in the order it runs; the last links back to the first.
- Any other line is recorded as a problem and not dropped: "'<word>' is not a statement this reading knows." (validator id `causal-loop.unreadable-line`, warning). A diagram that quietly ignores a line its author wrote is worse than one that says it could not read it.

**Writing splices lines and never reserializes (R4.1; `CausalLoopWriter.cs`).** Every edit replaces, inserts or removes whole lines of the document it read, so comments, blank lines, statement order, the `s`/`o` spelling of untouched links and every untouched byte survive, and each command's inverse restores the file byte for byte. An implementation must reproduce:

- A new statement goes after the last existing statement of its kind (`AfterLast`); when there is none, at the end of the file.
- Statements are written in one canonical shape: `variable <id> "<label>"` (the quoted label only when not empty); `link <from> -> <to>` followed, in this order and only when present, by ` +` or ` -`, ` delayed`, ` flipped`, ` weight=<n>` and ` "<note>"`; `loop <Identifier> "<Name>" <members…>`. A rewritten link is written in this shape, so an edited `s` link becomes `+`.
- A name must be at least one character with no whitespace and no double quote, or the edit is refused: "A name needs at least one character and no whitespace, because a statement is read as words on one line." DISL's `pattern` states the rule; the sentence is the standalone's.
- Line endings are CRLF, and a new document is exactly the starter below, CRLF throughout with a final newline (`CausalLoopDocumentFactory.cs`).

**Findings the DID model cannot produce.** Two validator findings concern the text and not the model, so they belong to the format plugin and have no rule in the specification: an unreadable line (above), and a **dangling link**, a link naming a variable the document does not declare. The standalone reports the latter as "The link from '<from>' to '<to>' names '<end>', which this document does not declare as a variable, so the link is not drawn." (warning, `CausalLoopValidator.cs`) and does not draw it, because an arrow to nothing is worse than an absent arrow. In DID a relation cannot have a missing end.

## Cycles, and why a plugin

DISL's CEL library has `reachable`, `inCycle` and `hasCycle`, but nothing that **enumerates** cycles, and a user-defined function may not recurse. The whole check this tool exists for (R3.1) needs the elementary cycles, so the plugin `net.etalii.adp.systems.cld` declares two CEL functions:

- `elementaryCycles(relationType)`: Johnson's elementary-cycles algorithm over the causal links, bounded at **1,000 cycles** (`CycleFinder.cs`, `CycleFinder.DefaultBound`). Self-links are cycles of one variable. The result order must be stable, so that findings and auto-claimed identifiers are the same on every run.
- `cycleSearchTruncated(relationType)`: whether the search stopped at the bound (R3.5).

DISL does not say how an expression calls a plugin's CEL function, and the schema requires the declared name to be a simple identifier, so the specification calls them by their bare names.

**Cycle identity.** Two statements of the same cycle entered at different variables are the same loop. The standalone compares cycles by a signature: the member identifiers rotated to start at the ordinally least one and joined (`CycleFinder.CanonicalSignature`, joined with `\0`). The specification's `signature` function does the same with a space as separator, which is safe because an identifier cannot contain whitespace. Direction matters, so the signature rotates rather than sorts.

**Polarity (R3.2, R3.6; `LoopPolarity.cs`).** Computed from the links along the cycle: undecidable as soon as any step has no link or an unstated one; otherwise reinforcing on an even count of negative links, zero included, and balancing on an odd count. This part is expressed in plain CEL functions (`cycleSteps`, `decidable`, `negativeCount`, `cyclePolarity`).

**The claim (`_Model/CausalLoopLoop.cs`).** A loop identifier starting with `R` or `r` claims reinforcing, `B` or `b` balancing, anything else claims nothing and is never compared.

## Validation

The rules in the specification carry DISL identifiers (camelCase, as the schema requires). The standalone's ids and severities are:

| Standalone id | In causal-loop-diagram.dis | Severity | Differences |
| --- | --- | --- | --- |
| `causal-loop.unreadable-line` | none | warning | Format plugin; see above. |
| `causal-loop.dangling-link` | none | warning | Format plugin; see above. |
| `causal-loop.loop-is-not-a-cycle` | `loopIsNotACycle` | warning | None. |
| `causal-loop.undecidable-loop` | `undecidableLoop` | warning | None. |
| `causal-loop.label-disagrees` | `labelDisagrees` | warning | None; the message names the loop, the stated and the computed polarity and the count of negative links (R3.3). |
| `causal-loop.unlabelled-loop` | `unlabelledLoop` | info | The standalone reports **one finding per unclaimed cycle**, naming its path and its polarity. A DISL rule with `scope: diagram` yields one problem, so the specification joins every unclaimed cycle into one message. An implementation should report them separately. |
| `causal-loop.cycle-bound-reached` | `cycleBoundReached` | info | The standalone's message ends "…covers only those." with "below", because it is reported before the unlabelled-loop findings; DISL has no ordering of problems. |

**Nothing is corrected (R3.3, non-goal).** No rule has a quick fix that changes an identifier or an arrow, because the label may be the intent and an arrow the mistake. The grid's loop identifier is the one place an author accepts the arithmetic, by retyping it.

## Editing

Every edit is one command with a byte-restoring inverse, one undo away (R4.1, R4.5; `Commands/`). DISL's undo model covers the model; the byte-for-byte guarantee is the format plugin's.

**Auto-claiming loops when a link is drawn (`CausalLoopWriter.AddLinkAndClaimLoops`).** In the same edit that states a link, every cycle the new link closes that no loop already claims is claimed, as one undo step. Only decidable cycles are claimed, each named for its computed polarity so it never lands disagreeing with itself; a cycle through an unstated link is left for the author. Numbering: the highest number already used behind `R` (and behind `B`, separately, case-insensitive, digits only) is found once, and each new claim in the edit takes the next one, in the order the cycle finder returns the cycles. The name is empty. The specification's hook `claimClosedLoops` expresses this with `forEach`; it relies on each iteration seeing the loops created by the previous ones, which DISL does not state. The statements are inserted after the last link, the link first and its loops after it. A second link between the same two variables is refused: "That link is already stated in this diagram."

**Claiming a loop by hand (`CausalLoopContextActionProvider.cs`).** "Claim a loop from here…" on a variable asks for an identifier, proposing the lowest `R<n>` no loop uses (not one past the highest, which auto-claim uses), and refuses a duplicate with "A loop of that identifier is already stated in this diagram." It claims the shortest cycle through the variable, or the variable alone where it lies on none, and uses the identifier as the loop's name too.

**Renaming.** The canvas's Rename on a variable, and a double-click on it (two clicks under 400 ms, `client/CausalLoopCanvas.tsx`), edit its **label** inline and leave the identifier alone. Retyping the **identifier** in the grid renames the variable and every link and loop that names it (`RenameVariableCommand`), so no link is left dangling. Renaming a loop from its menu changes its name only.

**Removing.** Removing a variable removes the links and loops that name it; its menu entry says how many ("Remove variable (with 3 references)") and asks for confirmation (R4.5; `RemoveVariableCommand`). DISL's deletion policy states the cascade and a fixed confirmation sentence, but not a count in the menu label. Removing a loop leaves its links, because a link belongs to the diagram and not to the loop that happens to traverse it (R4.4). Removing a link leaves the loops through it, which then report `loopIsNotACycle`.

**Loop membership (R4.3).** The grid shows a loop's members read-only with "The cycle a loop claims is edited on the canvas, where the path can be seen." A `SetLoopMembershipCommand` is registered (`ServiceCollection.AddCausalLoop.cs`), but no gesture in the client dispatches it today.

**Refusals (R4.6, R5.4).** Every action that cannot apply is shown disabled with its reason rather than hidden, and the same sentence is used wherever the refusal is reachable: "No variable of that name is in this diagram, so there is nothing to change." (and the link and loop equivalents, `CausalLoopWriter.NoSuchVariable`, `NoSuchLink`, `NoSuchLoop`), "A variable of that name is already declared in this diagram.", and for a document that does not parse "This causal loop diagram could not be read, so nothing can be edited until it is fixed." Same direction is disabled on a positive link and opposite direction on a negative one. DISL's `enabled` has no reason text.

## Context actions and the toolbox

| Standalone action id | Target | In causal-loop-diagram.dis |
| --- | --- | --- |
| `causal-loop.add-variable` | canvas | toolbox tool `variable` (the canvas menu entry has no DISL counterpart beside the palette) |
| `causal-loop.arrange` | canvas | operation `arrange`; disabled with "There is nothing to arrange until this diagram has two variables." |
| `causal-loop.add-link` | variable | context tool `connect` via `CausalLink` ("Add link from here…") |
| `causal-loop.add-loop` | variable | operation `claimLoop` |
| `causal-loop.rename-variable` | variable | context tool `editLabel` |
| `causal-loop.remove-variable` | variable | context tool `delete`, shortcut Delete, styled as dangerous |
| `causal-loop.make-positive`, `causal-loop.make-negative` | link | operations `makePositive`, `makeNegative` |
| `causal-loop.toggle-delay` | link | operation `toggleDelay`; the label reads "Delayed" or "Not delayed" by state |
| `causal-loop.flip-curvature` | link | operation `flipCurve`; the label reads "Flip the curve" or "Curve back the other way" by state |
| `causal-loop.remove-link` | link | context tool `delete` |
| `causal-loop.rename-loop` | loop | operation `renameLoop` |
| `causal-loop.remove-loop` | loop | context tool `delete` |

Labels that change with state are not expressible in DISL; the specification gives both readings in one label.

**Connecting on the canvas.** Dragging with the right mouse button from one variable to another creates a link stating the same direction (positive), and the background menu is enabled (`client/CausalLoopCanvas.tsx`). The toolbox link tool arrives positive too.

**Toolbox (R5.5; `CausalLoopToolboxProvider.cs`).** Three entries: Variable (`mdi-circle-outline`), Causal link (`mdi-arrow-right-thin`) and Feedback loop (`mdi-sync`). The link and loop entries are **dropped onto a variable**, not dragged between two: dropping the link starts a link from that variable and dropping the loop claims a loop through it. A drop anywhere else is refused with "Drop a link or a loop onto a variable." DISL's tool modes (`click`, `drag`) have no "drop onto a node of type" mode. A dropped variable is named `variable<n>` / "Variable <n>" with the lowest free number (`CausalLoopWriter.NextVariableName`), placed at the drop point (`AddVariableAtCommand`).

## Notation details DISL approximates

**Link arcs (`client/causalLoopArc.ts`).** A link is a quadratic curve whose control point sits at `ArcBow = 0.2` times the chord length off the chord's midpoint, **to the left of the direction of travel**, so A → B and B → A bow to opposite sides and a two-variable loop draws as an ellipse. A flipped link bows by −0.2. The ends meet the variables' boxes where the line toward the control point leaves them. DISL's `routing: arc` with `curvature: 0.2` is the nearest construct; DISL does not define which side a positive curvature bows to, nor that it is relative to the chord. A self-link is drawn as two quadratic segments above the variable, leaving its top edge 15% of its width left of centre and returning 15% right of it, and peaking 52 units (twice the self-loop radius of 26) above that edge; DISL's `selfLoop` with size 26 on the top side is the nearest construct.

**Polarity mark.** Drawn at 0.86 along the arc, 11 units off it, as `+` for positive and `−` (U+2212) for negative, and not at all for unstated: drawing a `+` would put a claim on the canvas the document does not make.

**Delay mark (R2.3).** Two short strokes across the arc at 0.44 and 0.56, each reaching 8 units either side of the line. The specification uses the built-in `bar` mid-marker.

**Weight (R8.3; design, *What the shared canvas does not offer*).** A coarse ladder of three steps and never a continuous width: light (stroke 1) at or below 0.5, heavy (stroke 2.5) at or above 2, normal otherwise and when absent. The client registers six relation types, each step in both bow directions (`link-<step>` and `link-<step>-flipped`). A weight is recorded and never evaluated; absent and zero differ, and clearing the grid field removes it.

**Loop badge.** No body; a circular arrow of radius 13 around the identifier, turning **clockwise for a reinforcing loop and anticlockwise otherwise**, with the identifier and the name beside it. Reinforcing is `#0369a1`, balancing `#c2410c`, undecidable muted (`client/causal-loop.css`). A loop whose label disagrees with its arrows gets a **wavy** underline. DISL icons cannot be mirrored, so the balancing variant repeats `mdi-sync` and the direction is lost; the custom marker `loopSweep` describes the arrow but no node construct places a marker on a node. The underline is DISL's plain `underline`.

**Variables.** Pills sized from the label: font size 14, horizontal padding 14, vertical padding 10, minimum width 90, height 14 × 1.4 + 2 × 10 = 39.6 (`_Model/CausalLoopMetrics.cs`). The width is measured on the backend from the label, so every host must measure text the same way for layouts to agree.

**Empty diagram.** "This causal loop diagram states no variables yet." DISL has no empty-canvas message.

## Layout

**The ring (`CausalLoopLayout.cs`).** What a document opens with, and never written to the file:

- The seating order is a depth-first walk of the links treated as undirected, starting from the first-declared variable and always taking the earliest-declared unvisited neighbour; unconnected variables start a new walk in declaration order.
- The first seat is at the top and seats run clockwise.
- Each seat is `slot = widest variable + 40` wide; the radius is `max(slot, n × slot / 2π)`, so no two variables overlap.
- A single variable sits at the origin.
- Positions the author has set (the `.adp` `layout:` block) override the ring variable by variable.

DISL's `circular` algorithm has no seating order or radius rule, so they are carried as `adp.ring.*` options only a runtime that knows them reads.

**Arrange diagram (R6; `SelfOrganizingLayout.cs`).** Meyer's self-organizing graphs, invoked from the canvas menu and never run on open, with every source of randomness replaced so the result is a pure function of the document and identical across processes (R6.2, R6.3):

- Start: a phyllotaxis spiral (golden angle 2.39996…) seeded by each variable's index in document order.
- Stimuli: the iteration's point in a two-dimensional Halton sequence (bases 2 and 3), mapped onto the spiral's extent padded by half the largest box plus 40.
- 2,000 iterations. Learning rate from 0.9 to 0.01 and neighbourhood radius from 3.0 to 0.35 hops, both geometric in the iteration index. Influence `rate × exp(−d² / 2r²)` with `d` the graph distance in hops, links undirected.
- The best-matching unit is the variable nearest the stimulus, ties broken by document order. Variables in another component than the winner are not pulled.
- A separation pass then pushes overlapping boxes apart in document order, nudge 0.5, for up to 200 rounds. If any overlap remains the action is refused, the diagram is left as it is, and the reason names the size: "This layout could not arrange 40 variables without 2 of them overlapping, so the diagram has been left as it is." (R6.5, R6.7; `_Model/SelfOrganizingResult.cs`). Other refusals: "This diagram has no variables to arrange.", "This causal loop diagram could not be read, so there is nothing to arrange."
- The layout runs only within the budget of 1,000 variables (R6.4).
- The result is written as centres into the `.adp` registration's `layout:` block as one command whose undo restores the registration byte for byte (R6.8; `Commands/ArrangeCausalLoopCommand.cs`).

## What is drawn, and where (R7, R10)

- A variable with no position is not drawn, rather than drawn at (0, 0) (R7.1, R7.2; `CausalLoopElementMapper.cs`).
- The whole document is laid out and then filtered by the viewport, never the visible part laid out alone (R10.3).
- A link has no position of its own: it is shown when the rectangle around its two ends' boxes intersects the viewport (R7.3).
- A loop is shown only when every one of its members is drawn, at their centroid.
- Panning reports the viewport through the shared view-report path and the backend answers with what came into and left view (R10.1, R10.2).

DISL has no viewport or streaming model, so none of this is in the specification.

## The wire

`api/causal-loop.proto` carries a variable payload (the displayed text, the identifier, and the measured width and height), a link payload (both ends' element ids, polarity, delayed, weight with a `has_weight` flag because proto3 cannot tell an absent double from zero, the note, flipped) and a loop payload (identifier, name, computed polarity, whether the stated polarity disagrees, and the members' element ids). The proto is a transport of the standalone host and is outside DISL.

## Property grid (R8; `CausalLoopContextPropertyProvider.cs`)

The specification's three forms follow the grid's rows and groups (Identity, Causality, Feedback). What DISL does not carry:

- A read-only row says **why** it is read-only (R8.5): the link's ends, "A link is identified by the two variables it joins. Draw a new link on the canvas rather than changing an end here."; the computed polarity, "Counted from the polarity of the links around the cycle. Change an arrow to change this."; the members, as under *Loop membership*. The specification puts these sentences in the form items' `doc`.
- The **stated polarity** row appears only when it disagrees with the computed one, and its reason names both: "'R3' claims this, and the arrows say balancing. Neither is corrected for you: change the identifier or change an arrow." A permanent "Stated: reinforcing" beside "Computed: reinforcing" is noise that trains a reader to stop looking.
- The polarity field accepts `positive`, `+`, `s`, `negative`, `-`, `o`, `unstated` or empty, case-insensitively.
- The weight field accepts an invariant-culture number; anything else, blank included, clears the weight.

## Starter and examples

**New document.** The document factory creates the starter the specification's `starter` template describes, as text (R5.1, R5.2):

```text
causal-loop 1

variable population "Population"
variable births "Births"

link population -> births +
link births -> population +

loop R1 "Births beget births" population births
```

**Examples (R11; `examples/readme.md`).** Two projects, `reference/` (every construct, including `R3`, whose label deliberately disagrees with its arrows, and `B4`, deliberately undecidable) and `on-call/` (why an on-call rotation gets worse on its own). Both were **authored for ADP** and attribute nothing: five candidate sources were checked and rejected on licence grounds (nocomplexity/causalloopdiagram GPL-3.0, AutoCLD with no licence, Wikipedia CC BY-SA, the MetaSD library with per-model permission and stock-and-flow content, System-Dynamics-Bot CC BY-NC-4.0). Johnson's algorithm is cited from its publication, not from AutoCLD's code.

## Identity and catalogue

- The origin is `systems/causal-loop-diagram`: "causal", not "casual", and the `-diagram` suffix was kept deliberately (requirements, *The identifier, settled*). The DISL language id is `net.etalii.adp.systems.causal-loop-diagram`.
- The standalone catalogue row is in `docs/tools.md`.

## Not part of this tool

The non-goals from the requirements, which an implementation must not add: no simulation (no integration over time, no equations; a weight is an annotation), no stock-and-flow conversion, no automatic correction of a mislabelled loop, no layout on open, and no private appearance, scrollbars or view report beside the host's shared ones.
