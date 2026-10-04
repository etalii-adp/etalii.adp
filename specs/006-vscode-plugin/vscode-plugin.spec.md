# Feature Specification: The ADP Plug-in for Visual Studio Code

**Feature Branch**: `features/006-vscode-plugin`
**Created**: 2026-10-05
**Status**: Draft
**Input**: "in etalli.adp create a spec kit specification for the etalii.adp.ide.vscode plugin. Make sure that a pipeline is available to create a artifact to download. use the naming conventions as per the other implementations. For examples take the Gartner Hypecycle Graph and the Agent Behavior Modelling diagram tools. Replicate all tool specific functional logic and visual representation. Use VS Code specific aspects where they are available and if not create them from scratch (i.e. property grid). Add tests + make sure that debugging locally is easy."

## Context

ADP has four hosts. Two of them carry tools today: `etalii.adp.ide.standalone`, with more than sixty diagram modules, and `etalii.adp.ide.intellij`, with two diagrams. `etalii.adp.ide.vscode` holds no plug-in code at all: a readme, a licence, the Spec Kit setup and a Build workflow whose `plugin` job reports itself as skipped until a `package.json` appears (spec 001, FR-009 to FR-011). Someone who works in Visual Studio Code cannot use any ADP tool.

This feature gives that repository its first plug-in: one installable Visual Studio Code extension that brings two diagrams, built so that the third costs a fraction of the first.

- **Gartner hype cycle graph**, origin `gartner/hypecycle-graph`, on `.ghg` files: trends on a time axis, each a banner cut into the phases it has reached, with triggers, notes and the influences between them.
- **Agent Behavior Modelling**, origin `etalii/agent-behavior-modelling`, on Markdown files: a chat agent's instructions drawn as a behavior tree, stored in the instruction file the agent itself reads.

They were chosen as examples because between them they cover most of what an ADP diagram can ask of a host: a file format of ADP's own and a tree kept inside someone else's prose; a canvas bound to data (time across, rows down) and a computed layout with a few dragged overrides; a toolbox, a property grid, findings, confirmations and refusals; a registration file that keeps positions; and "Arrange diagram".

**What "replicate" is measured against.** Both diagram types are specified in this repository: [gartner-hype-cycle-graph.dis](../../definitions/diagrams/gartner-hype-cycle-graph.dis) with [its companion](../../definitions/diagrams/gartner-hype-cycle-graph.md), and [agent-behavior-modelling.dis](../../definitions/diagrams/agent-behavior-modelling.dis) with [its companion](../../definitions/diagrams/agent-behavior-modelling.md). The `.dis` holds what DISL can state; the companion holds the rest, each point tied to the standalone code that shows it. Together they are the reference, and the standalone modules (`src/diagrams/gartner-hype-cycle-graph/` and `src/diagrams/agent-behavior-modelling/` in `etalii.adp.ide.standalone`) are the worked example, with their example documents, test fixtures and recorded browser passes. Where the two disagree, the definition is corrected here first (constitution, principle I), and then both hosts follow it.

Two things the standalone modules do are not yet in the definitions: "Arrange diagram" for both diagram types (standalone pull request 122), and the hype cycle companion was read at a standalone commit older than that. This feature brings the definitions up to date before the VS Code host is built against them.

**Where the work lands.** This specification, its plan and its tasks live here in `etalii.adp`, as specs 001 and 002 did for work that spans repositories. The plug-in, its tests and its pipeline land in `etalii.adp.ide.vscode` through pull requests into its `develop`. The changes to the two definitions land here.

Four roles appear below. A **user** works on documents in Visual Studio Code. A **contributor** is a person or agent who changes the plug-in and opens pull requests. A **maintainer** reviews and merges pull requests. A **tool engineer** specifies a tool type in this repository.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download the plug-in and install it (Priority: P1)

A user who wants to try ADP in Visual Studio Code opens the `etalii.adp.ide.vscode` repository on GitHub, follows the readme to its Releases page and downloads the development build: the plug-in built from the current `develop` after it passed every check. They install it from that one file and open a `.ghg` example. A maintainer reviewing a pull request does the same with the plug-in built for that pull request, taken from its Build run.

**Why this priority**: named first in the ask, and nothing else in this feature can be tried by anyone but its author without it. It is also the smallest slice that proves the repository builds an extension at all.

**Independent Test**: merge a pull request into `develop`; once its checks pass, the development build on the Releases page is the plug-in from that merge commit, and it installs from the downloaded file into a clean Visual Studio Code. From a passing pull request, the run offers that pull request's plug-in, which installs the same way.

**Acceptance Scenarios**:

1. **Given** a pull request into `develop`, **When** it is opened or a new commit is pushed to it, **Then** the Build workflow builds the plug-in from its latest commit, runs every automated test and shows a pass or a fail on the pull request; a failure names the step that failed and links to its output.
2. **Given** a run in which the plug-in built and every test passed, **When** a maintainer opens the run, **Then** it offers the installable plug-in for that commit as a download, the file itself rather than an archive around it.
3. **Given** a run in which the plug-in did not build, **When** a maintainer opens it, **Then** no plug-in is offered for download.
4. **Given** a change is merged into `develop`, **When** its checks pass, **Then** the development build on the Releases page is replaced by the plug-in built from that commit, marked as a pre-release, with the commit and date in its name or notes.
5. **Given** a change merged into `develop` fails its checks, **When** a user looks at the Releases page, **Then** the previous development build is still offered, unchanged.
6. **Given** the downloaded plug-in, **When** a user installs it as the readme describes, **Then** Visual Studio Code accepts it, lists it under the name "ADP: A Different Perspective", and both diagrams work without anything else being installed or running.

---

### User Story 2 - Work on a hype cycle graph (Priority: P1)

A user opens a `.ghg` file. It opens in the Gartner hype cycle graph, drawn as the standalone IDE draws it: trends as right-pointing banners in the four phase colours along a time axis, triggers as circles with their name and date, notes as word-wrapped boxes, influences as curves that meet a trend's edge at a right angle. The user drops a trend from the toolbox, renames it, drags a phase boundary, draws an influence from one trend's Plateau to another's Peak, tags it, filters by tag, switches to Compact and back, and arranges the diagram. Every edit is one step in Visual Studio Code's own undo, changes only the lines of the file it concerns, and leaves the file dirty until it is saved. A problem in the file appears in the Problems panel with its line.

**Why this priority**: it is the first of the two example tools, and the one that exercises the bound canvas, the property grid and the canvas chrome the plug-in has to build itself.

**Independent Test**: open each of the nine standalone example graphs, compare what is drawn with the definition and the standalone screenshots, and work through the checks of the standalone browser pass for this diagram (`tests.md` in `etalii.adp.ide.standalone`) in Visual Studio Code.

**Acceptance Scenarios**:

1. **Given** a `.ghg` file, **When** it is opened from the Explorer, **Then** it opens in the hype cycle graph by default, and the text editor remains available for the same file, beside the diagram or instead of it.
2. **Given** any of the nine example graphs, **When** it is opened, **Then** every trend, trigger, note and influence is drawn at the place, size, shape and colour the definition gives it, in the light, dark and high-contrast themes.
3. **Given** an open graph, **When** the user saves it without editing, **Then** the file is byte for byte what it was.
4. **Given** an open graph, **When** the user makes any edit the definition describes (add, rename, move, resize, set a span, change the phase count, drag a boundary, even the phases, draw or remove an influence, move an influence's end, set tags or a description, edit or resize a note, remove an element), **Then** the file changes exactly as the definition says, as one undoable step, and everything else in the file, comments and unknown keys included, stays as it was.
5. **Given** an edit the definition refuses, such as a trend shorter than its phases or a second influence in the same direction, **When** the user attempts it, **Then** the file is unchanged and the user is shown the definition's sentence for that refusal.
6. **Given** a trend or trigger with influences, **When** the user removes it, **Then** a confirmation names how many influences go with it, and one without influences is removed at once.
7. **Given** a graph with one of the twelve rule violations, **When** it is open, **Then** the finding is listed in the Problems panel as a warning with the line of the entry it concerns, and choosing it shows that line.
8. **Given** an open graph, **When** the user types tags into the tag filter, switches Any and All, or turns Compact on, **Then** the canvas shows what the definition says for that view, and nothing is written to the file.
9. **Given** an open graph, **When** the user chooses "Arrange diagram", **Then** only rows change, as the definition says, in one undoable step, and asking again when nothing would change is refused with a sentence.
10. **Given** the file is changed in the text editor or on disk while the diagram is open, **When** the change arrives, **Then** the diagram shows the new content; a file that cannot be read at all opens as an empty, read-only diagram with the definition's explanation.

---

### User Story 3 - Work on an agent's behavior model (Priority: P1)

A user has a Markdown file with an agent's instructions and a `Behavior` section. They open it as a behavior model from the Explorer or the Command Palette. The tree is drawn top-down with the eleven kinds in their shapes and family colours, the keyword above each label. They drop a "Retry" from the toolbox, which lands under the nearest node above that can take another child; drag a node past its sibling, which reorders the lines in the Markdown with everything beneath them; lower a row; re-parent a subtree; change a node's kind in the property grid; and arrange the diagram. The Markdown stays the agent's instructions throughout: only the list lines an edit concerns change, and nothing is written into it to remember where a node was dragged.

**Why this priority**: it is the second example tool, and the one that proves the plug-in handles a model that lives inside another document, a shared file extension and positions kept in a registration.

**Independent Test**: open each of the four standalone example agents, compare what is drawn with the definition, and perform every gesture the definition's Interaction section lists, checking the Markdown and the registration after each.

**Acceptance Scenarios**:

1. **Given** any Markdown file, **When** it is opened from the Explorer, **Then** it opens in Visual Studio Code's text editor exactly as before the plug-in was installed.
2. **Given** a Markdown file, **When** the user chooses to open it as a behavior model, **Then** the tree under its `Behavior` or `Behaviour` heading is drawn as the definition says; a file with no such section opens as an empty model with the information finding the definition gives.
3. **Given** a Markdown file that has a `Behavior` heading, **When** the user opens its context menu in the Explorer, **Then** opening it as a behavior model is offered there; for a Markdown file without one it is still reachable from the Command Palette and "Open With".
4. **Given** an open model, **When** the user saves it without editing, **Then** the Markdown is byte for byte what it was, line endings included.
5. **Given** an open model, **When** the user makes any edit the definition describes (drop from the toolbox, rename, change kind, set attempts or notes, reorder by drag or by keyboard, lower or raise a row, re-parent, delete), **Then** the Markdown and the registration change exactly as the definition says, as one undoable step that puts both back together.
6. **Given** an edit the definition refuses, such as a line to a leaf or a kind that cannot hold the node's children, **When** the user attempts it, **Then** nothing changes and the user is shown the definition's sentence.
7. **Given** a model with one of the seven rule violations, **When** it is open, **Then** the finding is listed in the Problems panel with the definition's severity and the line of the item.
8. **Given** a node was dragged, **When** the model is closed and opened again, in this host or in the standalone IDE, **Then** the row is where it was left, read from the registration beside the Markdown file.
9. **Given** a model with dragged positions, **When** the user chooses "Arrange diagram", **Then** the dragged positions are forgotten, the tree is drawn by the computed layout again, the Markdown is untouched, and one undo puts the registration back; a model with nothing to forget refuses with a sentence.
10. **Given** the user creates a new behavior model, **When** it is created, **Then** the file has the title, the legend that tells an agent what each keyword means and the starting tree the definition gives.

---

### User Story 4 - A toolbox, a property grid and the rest of the frame (Priority: P1)

Whichever diagram has the focus, the user finds the same two companions: an "ADP Toolbox" listing what can be added to that diagram, and "ADP Properties" showing and editing the selection. Visual Studio Code has neither, so the plug-in builds them, once, for every diagram to come. Everything Visual Studio Code does have, the plug-in uses rather than rebuilds: its editors and tabs, its undo and redo, its dirty marker and save, its Problems panel, its Command Palette, menus and keyboard shortcuts, its themes, its dialogs and notifications.

**Why this priority**: stories 2 and 3 cannot be completed without it, and it is the part every later tool reuses. It is its own story because it is tested on its own: with one diagram open, the frame either behaves like part of Visual Studio Code or it does not.

**Independent Test**: with one example of each diagram open, switch between them and watch the toolbox and the property grid follow; edit one property of each control type; undo with the editor's own undo; change the colour theme; rebind a shortcut; close and reopen Visual Studio Code with an unsaved edit.

**Acceptance Scenarios**:

1. **Given** a diagram has the focus, **When** the user looks at the ADP Toolbox, **Then** it lists that diagram type's entries with the icons and descriptions the definition gives, and an entry can be dragged onto the canvas or added from the keyboard.
2. **Given** an element is selected, **When** the user looks at ADP Properties, **Then** it shows the groups and fields the definition's forms give for that element, each with the control the definition asks for: text, multi-line text, number, choice, a slider with labelled stops, tag chips with suggestions, and read-only values.
3. **Given** the user edits a property, **When** the edit is accepted, **Then** it is the same undoable change to the file that the matching gesture on the canvas makes; when it is refused, the field shows the definition's sentence and returns to its value.
4. **Given** nothing or another editor has the focus, **When** the user looks at either companion, **Then** it says there is nothing to show rather than showing the last diagram.
5. **Given** a diagram and the text editor are open on the same file, **When** the user edits in either, **Then** the other follows, and one undo history serves both.
6. **Given** any command the plug-in adds, **When** the user opens the Command Palette, **Then** the command is listed under the "ADP" category, and its shortcut can be changed in Keyboard Shortcuts.
7. **Given** the colour theme changes, **When** a diagram is open, **Then** the canvas, the toolbox and the property grid follow at once, without reopening.
8. **Given** a file that is read-only, **When** it is opened in a diagram, **Then** it is drawn and nothing that edits is offered.

---

### User Story 5 - Tests that say whether it works (Priority: P2)

A contributor changes how a phase boundary is clamped. They run the tests with one command and learn within minutes whether the format still round-trips every example byte for byte, whether the phase and scale arithmetic still agrees with the standalone host on the shared fixtures, and whether the plug-in, installed into a real Visual Studio Code, still opens an example, takes an edit and undoes it. The Build workflow runs the same tests on every pull request.

**Why this priority**: asked for, and it is what makes "replicates the standalone tool" a checked claim rather than an impression. It follows the stories that give it something to test, but each of those stories is delivered with its tests.

**Independent Test**: break one behaviour of each kind on purpose (a splice that rewrites a neighbouring line, a boundary rule, a missing command) and see a test of the matching level fail and name it.

**Acceptance Scenarios**:

1. **Given** a clean clone, **When** a contributor runs the one documented test command, **Then** every automated test runs without a display and without anything installed by hand beyond what the readme lists.
2. **Given** each example document and fixture of both standalone modules, **When** the tests run, **Then** each is read, written back unchanged and compared byte for byte, and each rule fixture yields exactly the findings the definition gives.
3. **Given** the fixtures both hosts share (the hype cycle's scale fixture and the standalone cross-tier fixtures that concern these two diagram types), **When** the tests run, **Then** this host's results equal the fixtures'.
4. **Given** the built plug-in, **When** the tests run, **Then** it is installed into a real Visual Studio Code, which opens an example of each diagram, performs an edit, undoes it and saves, and the file on disk is checked after each step.
5. **Given** a test cannot run where it is, **When** the run finishes, **Then** it is reported as skipped with its reason, on a passing run too, and never as passed.
6. **Given** a failing test in the Build workflow, **When** a contributor opens the run, **Then** the failure names the test and the run keeps the test reports.

---

### User Story 6 - Start debugging in one step (Priority: P2)

A contributor, or an agent working for one, clones the repository, opens it in Visual Studio Code and starts debugging. A second Visual Studio Code window opens with the plug-in loaded and a folder of example documents ready. A breakpoint in the code that splices the file stops there; so does one in the code that draws the canvas. A change to the code shows up after a reload, without packaging or installing anything. A single test can be run under the debugger from the editor.

**Why this priority**: asked for. A plug-in whose two halves run in different places is hard to debug unless that is set up once and kept working.

**Independent Test**: on a machine with only the prerequisites the readme lists, go from a fresh clone to a breakpoint hit in each half of the plug-in, timing it.

**Acceptance Scenarios**:

1. **Given** a fresh clone and the prerequisites the readme lists, **When** the contributor opens the repository in Visual Studio Code and starts debugging, **Then** a development window opens with the plug-in loaded and the example folder open, with no other step.
2. **Given** the development window, **When** a breakpoint is set in the code that reads and writes files or in the code that draws the canvas, **Then** it is hit, in the original source rather than in built output.
3. **Given** a code change, **When** the contributor reloads the development window, **Then** the change is in effect, and build errors are shown in the Problems panel as they are made.
4. **Given** the example folder, **When** documents in it are edited while debugging, **Then** the examples the tests read are untouched.
5. **Given** a test, **When** the contributor chooses to debug it from the editor, **Then** it runs under the debugger.
6. **Given** the readme, **When** a contributor reads its Build section, **Then** it says how to build, test, debug and package, and what must be installed first.

---

### User Story 7 - The definitions describe what both hosts do (Priority: P2)

A tool engineer, or the developer of the VS Code host, reads the two definitions here to learn what "Arrange diagram" does for each diagram type, and finds it: which positions it changes, what it leaves alone, when it refuses and with which sentence. Wherever the VS Code host cannot do what a definition says, or does it differently, the difference is written down in one place rather than discovered.

**Why this priority**: the constitution's first principle. A second host built against a definition that trails the first host by two features would copy the code instead, and then there are two sources of truth.

**Independent Test**: read both definitions for "Arrange diagram" and compare them with the standalone modules; read the VS Code repository's parity record and find every difference a side-by-side comparison of the two hosts turns up.

**Acceptance Scenarios**:

1. **Given** the two definitions, **When** this feature lands, **Then** each states "Arrange diagram" for its diagram type, in the `.dis` as far as DISL reaches and in the companion for the rest, and the hype cycle companion names the standalone commit it was read at.
2. **Given** the changed `.dis` files, **When** `validate-examples.py` runs, **Then** both validate against the DISL schema.
3. **Given** the VS Code repository, **When** a reader opens its tool catalogue, **Then** both diagram types are listed with the origin, display name and kind the standalone catalogue gives them, and their state in this host.
4. **Given** a behaviour in a definition that this host does not have or does differently, **When** a reader opens the parity record, **Then** it is listed there with the reason.

---

### Edge Cases

- A `.ghg` file whose text is not YAML at all: it opens as an empty, read-only diagram with the definition's explanation, and the text editor is one step away.
- A Markdown file with two `Behavior` headings, or an example tree quoted in a fenced code block: the first heading's list is the tree and the code block is never read as one, as the definition says.
- A hand-written list item without a keyword: it is drawn as a dashed "Do" and reported, not refused.
- A behavior model opened for a Markdown file that has no registration beside it: it opens with the computed layout; the registration is written when the first row is dragged, and "Arrange diagram" refuses with the sentence for a model without one.
- A registration that names a body which no longer exists, or an origin this plug-in does not bring: opening it says so and offers the text editor; nothing is created or rewritten.
- The same file open in two diagram tabs, or in a diagram and the text editor in two windows: they stay in step, and undo in one is seen in the others.
- Line endings: a file with CRLF, with LF, with no trailing newline, or with mixed endings is written back with what it had; a new line takes the ending its file already uses.
- An edit arrives from the text editor while a drag is in progress on the canvas: the drag is abandoned rather than applied to text it was not computed from.
- Visual Studio Code is closed with unsaved diagram edits: on reopening they are restored as unsaved text edits are.
- A workspace opened in Restricted Mode: both diagrams work, since they only read and write the open file and its registration.
- The plug-in installed in a Visual Studio Code older than the release it declares: installation is refused by Visual Studio Code with its own message.
- A pull request from a fork: the checks run without the repository's secrets and nothing is published from them.
- Two changes merged into `develop` close together, or an older run of `develop` re-run after a newer one published: the development build ends as, and stays, the one from the later commit.
- A toolbox drop in Compact, a drop into an empty tree, a drop with no node above that has room: each behaves as the definition says, refusals included.
- A very large document (several hundred trends, or a tree several hundred items long): it stays usable, drawing only what is in view as the definitions describe.

## Requirements *(mandatory)*

### Functional Requirements

**The plug-in and its names**

- **FR-001**: `etalii.adp.ide.vscode` MUST produce one installable Visual Studio Code extension that brings both diagram types and needs nothing else installed or running to work, and performs no network access at runtime.
- **FR-002**: The plug-in MUST carry the names the other hosts use: display name "ADP: A Different Perspective", identifier `etalii.adp`, publisher shown as "EtAlii", and an installable file named `etalii-adp-<version>.vsix`.
- **FR-003**: Each diagram type MUST be known by the origin, display name and kind the standalone catalogue gives it: `gartner/hypecycle-graph`, "Gartner hype cycle graph", Diagram; `etalii/agent-behavior-modelling`, "Agent Behavior Modelling", Diagram. Identifiers the plug-in registers for a diagram type MUST be derived from its origin, as `etalii.adp.<vendor>.<type>`, the way the language ids in `definitions/diagrams/` are.
- **FR-004**: Everything the plug-in shows to a user MUST use the ADP glossary's words: "tool" for all kinds, "diagram" for these two, and the names "ADP Toolbox" and "ADP Properties" for the two companions, as the IntelliJ host names them. Names of the platform's own concepts keep theirs.
- **FR-005**: The plug-in MUST be laid out so that a diagram type is a self-contained part that supplies only what is specific to it, and the frame (FR-030 to FR-041) is shared. Adding a third diagram type MUST NOT require changing either of these two.

**Conformance to the definitions**

- **FR-006**: For each of the two diagram types, the plug-in MUST do what its definition in `definitions/diagrams/` states, the `.dis` and its companion together: the model, the file format, the notation, the toolbox, the forms, the gestures, the context actions, the shortcuts, the rules and their severities, the refusals and confirmations with their sentences verbatim, the layout, and the canvas chrome.
- **FR-007**: A difference between what a definition states and what this host does MUST be recorded in the VS Code repository's parity record with its reason; a difference between a definition and the standalone host MUST be raised as a change to the definition here, not settled in the VS Code host.
- **FR-008**: This specification does not decide whether the plug-in is driven by the `.dis` files through a runtime or implements the two diagram types by hand; the plan decides, and FR-006 holds either way.

**Files**

- **FR-009**: Opening a file and saving it without edits MUST leave it byte-identical, line endings and a missing final newline included.
- **FR-010**: Every edit MUST change only the lines it concerns. Comments, blank lines, key order, unknown keys and prose the diagram does not understand MUST survive, as the definitions' round-trip sections state.
- **FR-011**: Reading MUST never fail: an entry or item that cannot be read becomes a finding and the rest is drawn; a file that cannot be read at all opens empty and read-only with the definition's explanation, and is never written.
- **FR-012**: A `.ghg` file MUST open in the hype cycle graph by default, with or without a registration file beside it.
- **FR-013**: A Markdown file MUST keep opening in the text editor by default. Opening it as a behavior model MUST be offered through "Open With", through a command, and on the Explorer's context menu for a file that has a `Behavior` or `Behaviour` heading.
- **FR-014**: The plug-in MUST read and write the `.adp` registration as FBL defines it (section 8), so a registration made in the standalone IDE works here and the other way round. For a behavior model it MUST keep dragged positions there and nowhere else. Opening a registration whose origin is one of the two MUST open that diagram on its body.
- **FR-015**: The plug-in MUST offer creating a new document of each type, from the Explorer and the Command Palette, with the content the definition gives a new document.
- **FR-016**: A change to the file made in the text editor or on disk MUST be shown in an open diagram without reopening it.

**Gartner hype cycle graph**

- **FR-017**: The plug-in MUST draw trends, triggers, notes and influences as the definition states: the scale and its origin, rows, the phased banner and its four colours, phase boundaries spread evenly or stored, trigger and note shapes and labels, influence curves and their attachment to a phase, edge and fraction, and what is hidden rather than removed.
- **FR-018**: The plug-in MUST support every edit the definition describes, each as one undoable step: adding from the toolbox, renaming in place, moving and resizing with the definition's snapping per gesture, setting a span and a phase count, dragging a phase boundary, evening the phases, drawing and removing an influence, moving an influence's end, setting tags and descriptions, editing and resizing a note, changing the time unit, and removing with the counted confirmation.
- **FR-019**: The plug-in MUST provide the canvas chrome the definition states: the ruler pinned to the bottom with its rungs by unit and spacing, the tag filter with chips and the Any/All switch, the phase legend, and the Compact switch with its layout; none of these is saved to the file or remembered between openings.
- **FR-020**: The plug-in MUST report the twelve `ghg.*` rules as the definition gives them, each with the line of its entry, and MUST never block saving on a finding.
- **FR-021**: "Arrange diagram" for a hype cycle graph MUST change rows only, as the updated definition states, in one undoable step, and refuse when nothing would change.

**Agent Behavior Modelling**

- **FR-022**: The plug-in MUST read the tree from, and write it to, the Markdown as the definition states: where the tree is, what a node, its children and its notes are, the eleven keywords, Retry's count, an item without a keyword, ids as places in the tree, and adding to a file without a tree.
- **FR-023**: The plug-in MUST draw the tree as the definition states: the computed top-down layout with its sizes and gaps, a row shared by the children of one parent, rows at stored heights and never closer to their parent than the definition's minimum, the eleven shapes, the family colours, the two labels, and the dashed outline of an implicit "Do".
- **FR-024**: The plug-in MUST support every edit the definition describes, each as one undoable step that puts the Markdown and the registration back together: a toolbox drop placed under the nearest node above with room, renaming in place, changing kind, attempts and notes in the property grid, dragging a node with its subtree to reorder it and to move its row, with siblings stepping aside while it moves, reordering from the keyboard, re-parenting, and deleting a node with everything under it.
- **FR-025**: The plug-in MUST report the seven `abm.*` rules with the severities the definition gives them, each located by its line.
- **FR-026**: "Arrange diagram" for a behavior model MUST forget every dragged position in the registration, leave the Markdown untouched, be undone in one step, and refuse with the definition's sentences when there is no registration or nothing to forget.

**Definitions in this repository**

- **FR-027**: `definitions/diagrams/gartner-hype-cycle-graph.dis` and its companion, and `definitions/diagrams/agent-behavior-modelling.dis` and its companion, MUST state "Arrange diagram" as the standalone host implements it, and the hype cycle companion MUST be re-read against the standalone `develop` it then names.
- **FR-028**: The changed `.dis` files MUST stay valid against the DISL schema, checked by `validate-examples.py`.
- **FR-029**: Each definition's companion MUST name `etalii.adp.ide.vscode` as a host that implements the diagram type once it does, beside the standalone host.

**The frame: what Visual Studio Code provides**

- **FR-030**: Each diagram MUST open in an editor of Visual Studio Code registered for its file type, in a tab like any other, so that choosing an editor for a file, splitting, moving between groups and reopening with another editor behave as they do for built-in editors.
- **FR-031**: The diagram and the text editor MUST share one document and one undo history for a file. Every user-visible change MUST be one step in Edit > Undo and Redo, with their usual shortcuts.
- **FR-032**: Modified state, save, save all, auto save, revert, closing with unsaved changes and restoring unsaved changes after a restart MUST behave as they do for the text editor.
- **FR-033**: Findings MUST be shown in the Problems panel, with the severity the definition gives, the file and the line; choosing one MUST lead to that line.
- **FR-034**: Every command MUST be available from the Command Palette under the category "ADP", and where it applies from the canvas's context menu; every shortcut the definitions give MUST be the command's default and MUST be changeable in Keyboard Shortcuts.
- **FR-035**: Confirmations MUST use Visual Studio Code's own dialogs. A refusal MUST show the definition's sentence to the user where they are working, and leave the file unchanged.
- **FR-036**: The canvas, the toolbox and the property grid MUST follow the colour theme, light, dark and high contrast, and a change of theme at once. The phase and family colours MUST be the definitions' theme tokens in each.
- **FR-037**: A read-only file MUST open in the diagram with nothing that edits offered.

**The frame: what the plug-in builds**

- **FR-038**: The plug-in MUST provide the canvas: pan and zoom, selection of one and several elements, in-place text editing, dragging and resizing with snapping, drawing a relation between elements, handles on a selection, tooltips, and drawing only what is in view.
- **FR-039**: The plug-in MUST provide the ADP Toolbox: the entries of the focused diagram's type with their icons and descriptions, added by dragging onto the canvas and from the keyboard. It MUST be placed as a view of Visual Studio Code where the platform lets it do this, and inside the diagram's editor otherwise.
- **FR-040**: The plug-in MUST provide ADP Properties, a property grid for the selection: grouped fields, the control types the two definitions' forms use (text, multi-line text, number, choice, slider with labelled stops, tag chips with suggestions, read-only), fields shown or hidden by the definition's conditions, edits that are the same undoable changes as the canvas's, and a refused edit shown at its field.
- **FR-041**: The toolbox and the property grid MUST follow the diagram that has the focus and say so when none has.

**Tests**

- **FR-042**: The repository MUST have automated tests at three levels: the file formats and the logic of each diagram type without Visual Studio Code; the frame's parts on their own; and the built plug-in installed into a real Visual Studio Code.
- **FR-043**: The format tests MUST round-trip every example document and fixture of both standalone modules byte for byte, and MUST check each rule against the standalone rule fixtures. The examples MUST be vendored with their source and licence recorded beside them.
- **FR-044**: Results both hosts must agree on MUST be tested against the fixtures the standalone host publishes for them, the hype cycle's scale fixture among them, read unchanged.
- **FR-045**: The tests in a real Visual Studio Code MUST cover, for each diagram type: opening by default or by choice as FR-012 and FR-013 state, an edit from the canvas, an edit from the property grid, undo and redo, save, a finding reaching the Problems panel, and the text editor and the diagram following each other.
- **FR-046**: Every test MUST run headlessly from one documented command, the same one the Build workflow runs. A test that cannot run MUST be reported as skipped with its reason, never as passed.
- **FR-047**: Each user-visible behaviour delivered by this feature MUST arrive with the test that covers it, in the same pull request.

**Debugging**

- **FR-048**: The repository MUST carry a debug configuration that, from a fresh clone with the documented prerequisites, starts a development Visual Studio Code with the plug-in loaded and a folder of example documents open, in one step.
- **FR-049**: Breakpoints MUST work in original source in both halves of the plug-in: the part that runs in Visual Studio Code's extension host and the part that draws the canvas, the toolbox and the property grid.
- **FR-050**: A code change MUST take effect on reloading the development window, without packaging or installing, and build errors MUST be shown while editing.
- **FR-051**: The example folder a debug session edits MUST be a copy, refreshed from the vendored examples, so debugging never changes what the tests read.
- **FR-052**: A single test at any of the three levels MUST be debuggable from the editor.

**Pipeline and downloads**

- **FR-053**: The Build workflow of `etalii.adp.ide.vscode` MUST, on every pull request into `develop`, every change to `develop` and every manual run, build the plug-in, run every automated test, package the installable file, and keep the rules spec 001 gives every Build workflow (its name, triggers, hosted runners, the `terminology` job, the file checks).
- **FR-054**: A run in which the plug-in built and the tests passed MUST offer `etalii-adp-<version>.vsix` as a download from the run, the file itself, kept for a retention period. A run in which it did not build MUST offer none.
- **FR-055**: After a change to `develop` passes its checks, the repository's Releases page MUST offer the plug-in built from that commit as the "Development build", replacing the previous one, marked as a pre-release, naming the version, commit and date. It MUST only move forward, and a failing change MUST leave it as it was.
- **FR-056**: The run MUST keep its test reports and list skipped tests with their reasons in its summary, on passing runs too.
- **FR-057**: Nothing MUST be published from a pull request's run, pull requests from forks MUST NOT receive the repository's secrets, and only the job that publishes the development build may write to the repository.

**Documentation**

- **FR-058**: The VS Code repository's readme MUST say what the plug-in brings, how to install it from the Releases page and from a pull request's run, and how to build, test, debug and package it.
- **FR-059**: The VS Code repository MUST carry a tool catalogue, `docs/tools.md`, in the format the standalone and IntelliJ catalogues use, with a row for each of the two diagram types and its state in this host.
- **FR-060**: The VS Code repository MUST carry the parity record FR-007 names, one section per diagram type, and MUST ratify its constitution before the plan for this feature is checked against it.

### Key Entities

- **Plug-in**: the one Visual Studio Code extension `etalii.adp.ide.vscode` produces, "ADP: A Different Perspective", with a version and the installable file `etalii-adp-<version>.vsix`.
- **Diagram type**: one of the two tools the plug-in brings, known by its origin, display name and definition in this repository.
- **Definition**: a diagram type's `.dis` and its companion in `definitions/diagrams/`, the reference for what the tool does and how it looks.
- **Document**: one file a user works on: a `.ghg` graph, or a Markdown file read as a behavior model.
- **Registration**: the `.adp` file beside a document, naming its origin and body and keeping the positions a user placed.
- **Frame**: what every diagram type shares in this host: the editor integration, the canvas, the ADP Toolbox, ADP Properties and the bridge to the Problems panel, commands and themes.
- **Finding**: the result of a rule or of reading a file, with a severity and a line, shown in the Problems panel.
- **Parity record**: the list, per diagram type, of where this host differs from the definition and why.
- **Check run**: one run of the Build workflow for a commit, with its results, test reports and the plug-in it offers.
- **Development build**: the single pre-release on the Releases page holding the plug-in from the latest `develop` commit that passed its checks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user goes from the repository's front page to a hype cycle example open in their own Visual Studio Code in under 3 minutes, without cloning or building anything.
- **SC-002**: 13 of 13 standalone example documents (nine graphs, four agents) open and are drawn as their definition states, and each is byte-identical after open and save.
- **SC-003**: Every edit, refusal, confirmation and rule the two definitions list is either demonstrated by an automated test or listed in the parity record; a side-by-side comparison of the two hosts finds no difference that is in neither.
- **SC-004**: After any single edit, the file's changed lines are only those the definition names for that edit; a comparison across all edit kinds on all examples finds 0 other changed bytes.
- **SC-005**: Any of the 13 examples is drawn within 2 seconds of being opened, and a gesture on it is reflected on the canvas without a visible pause.
- **SC-006**: 100% of pull requests into the VS Code repository's `develop` opened after the pipeline lands show a check result, and every passing one offers its plug-in.
- **SC-007**: The development build is never older than the latest `develop` commit that passed its checks, once that commit's checks finish.
- **SC-008**: The full test run finishes within 15 minutes on a hosted runner and within 10 minutes on a contributor's machine.
- **SC-009**: A contributor with the prerequisites installed goes from a fresh clone to a breakpoint hit in each half of the plug-in in under 10 minutes, following only the readme.
- **SC-010**: Both definitions state "Arrange diagram", and `validate-examples.py` passes on them.
- **SC-011**: The first diagram type added after this feature changes no file of the two diagram types here and no file of the frame, other than a registration of the new type.

## Assumptions

- "The other implementations" for naming are `etalii.adp.ide.intellij` for the plug-in's own names (its identifier `etalii.adp`, its name "ADP: A Different Perspective", its download `etalii-adp-<version>.zip`, its "ADP Toolbox" and "ADP Properties", its "Development build") and `etalii.adp.ide.standalone` for each tool's origin and display name. `docs/new-repository.md` and spec 001 give the repository, branch and workflow names.
- "An artifact to download" means what IntelliJ's spec 005 delivers and VS Code's Build workflow was prepared for: the plug-in offered from each run for reviewers, and a development build on the Releases page for users. Versioned releases by a version mark and publishing to the Visual Studio Marketplace or Open VSX are out of scope here and follow in their own specification, as they do for IntelliJ.
- The plug-in targets the desktop Visual Studio Code, at the release current when the plan is made, on Windows, macOS and Linux. Visual Studio Code for the Web and remote workspaces are not excluded by design but are not tested by this feature.
- Visual Studio Code's own concepts are named in this specification (editors, the Problems panel, the Command Palette, the Explorer, Keyboard Shortcuts, themes, Restricted Mode) because the ask is to use them where they exist. Which extension APIs, languages, libraries and build tools realise them is for the plan.
- The standalone host keeps its backend in .NET and its client in the browser. This host does not have to share code with it; it has to agree with it on the definitions, the example documents and the shared fixtures. Whether any code is shared is for the plan.
- "Arrange diagram" is part of the ask's "all tool specific functional logic", since both standalone modules have it (pull request 122), as is the behavior model's drag that reorders and snaps (pull request 120), which the definition already states.
- The gaps the definitions already record for the standalone host (a "Delegate" that does not open its linked file, for example) are gaps here too, not work for this feature.
- A Markdown file is never taken over: it is a shared extension, so the text editor stays its default and the behavior model is chosen. A `.ghg` file belongs to ADP alone, so the diagram is its default.
- In the standalone IDE a document is added to a project through its registration. Visual Studio Code has no ADP project; the workspace folder is the project, a registration is read where it exists and written only when there are positions to keep.
- The two example sets are vendored from `etalii.adp.ide.standalone`, which is Apache-2.0 as this repository's hosts all are; their provenance is recorded beside them.
- There is no branch protection in the organization, so a failing check informs the maintainer and cannot block a merge, as in every other repository.
- The work is delivered as several pull requests into `etalii.adp.ide.vscode`'s `develop`, in the order of the stories' priorities, and one pull request here for the definitions. The plan and tasks for all of them live in this folder.

## Out of Scope

- Any diagram, designer or editor other than these two.
- Versioned releases, signing, and publishing to the Visual Studio Marketplace or Open VSX.
- A settings page for the plug-in; neither tool needs a setting yet.
- Changes to the standalone or IntelliJ hosts, other than what a correction to a definition asks of them in their own specifications.
- A DISL runtime as a deliverable in its own right. If the plan chooses to drive these two tools from their `.dis` files, it builds what they need and no more.
- The website's and Notion's per-host status for the two tools, which follow from the VS Code repository's `docs/tools.md` through the upkeep those already have.
