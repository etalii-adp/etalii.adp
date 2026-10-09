# Feature Specification: The Gartner Hype Cycle Graph as a Notion Add-on

**Feature Branch**: `features/012-notion-hype-cycle-addon`
**Created**: 2026-10-08
**Status**: Draft
**Input**: "Create a Notion plugin that makes the Gartner Hypecycle graph working inside of Notion and with a database for storage. Build the plugin to use the DISL and BL for the Gartner Hypecycle graph, i.e. do not change it but build the correct interpreter. Store the data in this database [...]. Embed the diagram on this page [...]. If you can, replicate the above with the correct names for all examples also already available in the other ADP hosts. The plugin should also be able to edit the diagram, so incorporate a (collapsible) toolbox and property grid, in a reusable form so that they can also be used for other Notion plugins. Make sure that there is an undo-redo system; if Notion provides an API of its own then use that. This can also be done indirectly through the database mutations, as long as the user can do the usual CTRL+Z / CTRL+Y. Read here on more details on the Notion plugin implementation: [a Claude session]."

## Context

Spec [011-notion-repository](../011-notion-repository/notion-repository.spec.md) made Notion a host and gave it a published address, `https://etalii.net/adp-notion`, with no tool in it. This feature delivers the first one: the Gartner hype cycle graph, a diagram that places trends along the curve of expectations over time and relates them by influences.

The tool type already exists. Its DISL specification is `definitions/diagrams/gartner-hype-cycle-graph.dis` in `etalii.adp`, its origin is `gartner/hypecycle-graph`, and it reads and writes its documents through the FBL binding the specification names. The standalone host and the Visual Studio Code host run it today. The Notion add-on is a third reading of the same specification and binding: it interprets them and changes neither.

What differs in Notion is where the document lives. In the IDE hosts it is a `.ghg` file in a repository. In Notion there is no file: the document is kept in a Notion database, and the diagram is shown in a Notion page through an embed block.

The request calls the add-on a "plugin" and the binding language "BL". This specification uses the glossary's words: **Notion add-on** and **FBL**.

Three roles appear below. A **reader** opens a Notion page that holds the diagram. A **user** changes the diagram there. A **contributor** builds another Notion add-on in `etalii.adp.ide.notion`.

## Clarifications

### Session 2026-10-08

- Q: Is a graph one row that holds the whole document, or one row per trend, trigger, note and influence? → A: One row per element, with each attribute a property of the database and no document text kept. Comments, the order of keys, keys the binding does not read and entries that are not a mapping are not kept, so SC-003 compares what the hosts read and not bytes.
- Q: How does a web page shown in an embed block come to read and write a Notion database? → A: Through a small service beside the published pages, which a person grants access to their Notion content once. The Notion repository's principle that publication is by GitHub Pages only is amended in this feature.
- A reference between two elements is a Notion relation between their two rows (the maintainer's review of the data model, 2026-10-07). A relation cannot hold the id of an element that does not exist, so the id of a reference that names nothing is not kept either; FR-007 and SC-003 say so.

### Session 2026-10-09

The maintainer added two requirements while the feature was being finished (FR-033 to FR-037). On 2026-10-09 the maintainer asked that the add-on itself makes the embed block name the selected database, and the last open point was settled so (FR-033): an embedded page is not told which block it is, so the block is found beside the database, and the address is shown to copy where it cannot be found. On the same day the grant of access was found not to complete in the Notion desktop app, and the maintainer chose that the service hands a completed grant over to the page that started it, keeping it for at most two minutes (FR-010 as amended). The maintainer said which properties are internal: everything that is technically needed and not relevant to understand the domain, such as coordinates and row levels (FR-036). On 2026-10-09 the maintainer settled the third: the add-on adds the missing properties itself, once the user has agreed (FR-035).
- The other hosts ship nine examples, not six: the plan step found `llms-and-agents`, `technology-trends` and `warfare-in-ukraine` beside the six named when this specification was written.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A reader sees a hype cycle graph inside a Notion page (Priority: P1)

A reader opens the Notion page "Diagram". The Gartner hype cycle graph is drawn there, from what the first graph's database holds: each trend as a banner with its phases along the time ruler, each trigger, each note, and the influences between them. It looks and reads as the same document does in the standalone and Visual Studio Code hosts.

**Why this priority**: it is the smallest slice that makes a tool available in the Notion host, and every other story stands on it. It also proves the hard part: an interpreter for the DISL specification and the FBL binding that is not written for this one diagram's quirks.

**Independent Test**: fill the database with the document of one example, open the page, and compare what is drawn with the same example opened in the Visual Studio Code host.

**Acceptance Scenarios**:

1. **Given** the database holds a hype cycle graph, **When** a reader opens the page "Diagram", **Then** the graph is drawn inside the page with every trend, trigger, note and influence the document holds.
2. **Given** the same document opened in the Visual Studio Code host, **When** the two are compared, **Then** every element has the same name, the same place on the time ruler, the same phases and the same influences.
3. **Given** a document with an entry that cannot be read, **When** the page is opened, **Then** the rest is drawn and the unreadable entry is reported as a finding with the sentence the specification gives.
4. **Given** a document that cannot be read at all, **When** the page is opened, **Then** an empty, read-only diagram is shown with the sentence "The graph could not be read, so it cannot be edited."
5. **Given** an empty database, **When** the page is opened, **Then** an empty graph is shown and nothing is reported as an error.
6. **Given** the DISL specification of the tool type is changed in `etalii.adp` and the add-on is published again, **When** the page is opened, **Then** the diagram follows the changed specification with no change to the add-on's own code for that diagram.

---

### User Story 2 - A user changes the graph, and the database keeps it (Priority: P2)

A user opens the same page and works in the diagram as in the other hosts. They drag a trend, a trigger or a note from a toolbox onto the canvas, draw an influence between two elements, move a trend along the time ruler, drag a phase boundary, and rename or remove what they select. A property grid shows the attributes of the selection and lets them be changed. Both panels can be collapsed to leave the canvas the room. Every change is kept in the database, so the next reader sees it.

**Why this priority**: a diagram that cannot be changed where it is read is a picture. Editing is what makes Notion a host and not a viewer.

**Independent Test**: add a trend, rename it, move it and draw an influence to it; reload the page and find all four changes; then open the database and find them there.

**Acceptance Scenarios**:

1. **Given** the diagram is open, **When** the user drags a trend from the toolbox onto the canvas, **Then** a trend appears where it was dropped, with the default name and length the specification gives.
2. **Given** an element is selected, **When** the user changes an attribute in the property grid, **Then** the canvas shows the change at once and the database holds it.
3. **Given** a change has been made, **When** the page is reloaded, **Then** the diagram shows the change.
4. **Given** the toolbox or the property grid is open, **When** the user collapses it, **Then** the canvas takes its room, and the panel opens again from a visible control.
5. **Given** an edit the specification refuses, such as an id already in use, **When** the user attempts it, **Then** nothing changes and the specification's sentence for that refusal is shown.
6. **Given** a document whose constraints are broken, **When** it is open, **Then** each finding is shown with its severity and the element it concerns.
7. **Given** an edit that cannot be stored, **When** the store fails, **Then** the user is told, the diagram shows what the database holds, and no change is silently lost.
8. **Given** a reader whose access reaches the database but does not allow changing it, **When** they open the page, **Then** the diagram is shown read-only and offers no editing control, from the moment the add-on can tell. A reader whose access does not reach the database is invited to connect and sees no diagram.

---

### User Story 3 - A user undoes and redoes with the usual keys (Priority: P3)

A user makes a change they did not intend and presses CTRL+Z. The change is gone, on the canvas and in the database. CTRL+Y brings it back. A gesture that the user experiences as one action, such as dragging a trend, is undone as one.

**Why this priority**: editing without undo makes every drag a risk. It comes after Story 2 because there is nothing to undo before there is something to do.

**Independent Test**: make five different edits, press CTRL+Z five times and compare the database with its state before the first edit, then press CTRL+Y five times and compare with the state after the last.

**Acceptance Scenarios**:

1. **Given** an edit was just made, **When** the user presses CTRL+Z, **Then** the canvas and the database are as they were before that edit.
2. **Given** an edit was just undone, **When** the user presses CTRL+Y, **Then** the edit is back on the canvas and in the database.
3. **Given** a drag that changed several attributes, **When** the user presses CTRL+Z once, **Then** the whole drag is undone.
4. **Given** an edit was undone, **When** the user makes a new edit, **Then** the undone edit can no longer be redone.
5. **Given** nothing to undo or redo, **When** the user presses the key, **Then** nothing changes.

---

### User Story 4 - The examples of the other hosts are in the Notion workspace (Priority: P4)

A reader opens the "Showcase" page of the Notion workspace and finds, beside the first graph, one entry per example the other hosts ship for this tool type. Each has its own database and its own page with the diagram, and each carries the example's name as the other hosts show it.

**Why this priority**: the examples show what the tool is for, and they are the comparison set of Story 1. They need Stories 1 and 2 to exist first.

**Independent Test**: list the examples of the Visual Studio Code host and tick each one off in the Showcase; open each and compare it with the same example in that host.

**Acceptance Scenarios**:

1. **Given** the examples the other hosts hold for this tool type, **When** the Showcase is opened, **Then** there is one entry for each, named as in those hosts.
2. **Given** an example's page, **When** it is opened, **Then** the diagram shows the same document as the example in the other hosts.
3. **Given** an example is edited in Notion, **When** another example is opened, **Then** it is unchanged: no two examples share a store.

---

### User Story 5 - A contributor reuses the toolbox and the property grid in another add-on (Priority: P5)

A contributor starts a second Notion add-on for another tool type. They do not write a toolbox or a property grid. They use the ones this feature made, which draw their content from the other tool type's DISL specification.

**Why this priority**: it costs little when done with the first add-on and much when retrofitted. It is last because no second add-on exists yet to prove it against.

**Independent Test**: give the toolbox and the property grid the DISL specification of another diagram type, for example the mind map, and check that they show that type's toolbox items and attributes with no change to their code.

**Acceptance Scenarios**:

1. **Given** the DISL specification of another tool type, **When** the toolbox is given it, **Then** it lists that type's toolbox items with their names, icons and descriptions.
2. **Given** an element of another tool type, **When** the property grid is given it, **Then** it shows that element's attributes with the controls its specification asks for.
3. **Given** the code of the toolbox and the property grid, **When** it is read, **Then** it names no element, attribute or rule of the Gartner hype cycle graph.
4. **Given** the toolbox and the property grid open in a Notion page, **When** they are compared with Notion's own panels and controls, **Then** their type, colours, spacing, corners and controls read as Notion's, in the light and in the dark appearance.
5. **Given** a second add-on that uses the toolbox and the property grid, **When** it is opened, **Then** the panels look and behave as they do in the first, with no styling written for that add-on.

### Edge Cases

- Two people edit the same graph at the same time. What does each see, and whose change is kept?
- Somebody changes the database directly in Notion while the diagram is open. Is the diagram updated, and is a change made by hand kept when the diagram next writes?
- The database is given content the binding cannot read. Reading never fails: the unreadable part is a finding and the rest is drawn.
- The page is opened by somebody the database is not shared with, or by somebody not signed in.
- CTRL+Z is pressed while the keyboard focus is in the Notion page and not in the diagram. Notion's own undo runs and the diagram's does not.
- The user undoes past the point where the page was opened.
- An edit is undone after somebody else changed the same element.
- The page is opened on a phone, where the embed is narrow and there is no keyboard.
- The connection is lost in the middle of an edit.
- The add-on's address is embedded in a page with no database to read.
- The same database is embedded in two pages.

## Requirements *(mandatory)*

### Functional Requirements

**The add-on and its specification**

- **FR-001**: A Notion add-on for the tool type with origin `gartner/hypecycle-graph` MUST be published under `https://etalii.net/adp-notion`, in its own folder, at an address that the index there lists.
- **FR-002**: The add-on MUST take everything it knows about the tool type from the DISL specification `definitions/diagrams/gartner-hype-cycle-graph.dis` and the FBL binding that specification names: the elements and relations, the time axis and its ruler, the phases, the toolbox, the menus, the forms, the constraints and their sentences.
- **FR-003**: This feature MUST NOT change that DISL specification or that FBL binding. A difference found between them and what Notion needs MUST be raised as a change in `etalii.adp`, never settled in the add-on.
- **FR-004**: The part of the add-on that interprets DISL and FBL MUST be general: it MUST NOT name an element, attribute or rule of the Gartner hype cycle graph.
- **FR-005**: What the add-on does not yet support of the DISL specification MUST be listed where a reader of the add-on finds it, and the add-on MUST NOT claim more.

**Storage**

- **FR-006**: A graph's document MUST be kept in a Notion database, and in nothing else: the add-on keeps no second copy on a server or in the browser that outlives the page.
- **FR-007**: What the database holds MUST be what the FBL binding describes, so that a document taken out of the database opens unchanged in the standalone and Visual Studio Code hosts, and one from those hosts can be put in. A graph is one row per trend, trigger, note and influence, and each attribute the binding reads is a property of the database, so that a reader sorts and filters the elements in Notion. The database keeps no document text: comments, the order of keys, keys the binding does not read and entries that are not a mapping are lost when a document is put in. A reference is kept as a relation between two rows, so the id a reference names is lost as well when no element has that id; the element that holds the reference is kept.
- **FR-008**: The first graph MUST be stored in the database and shown on the page that the request names, both identified by their Notion addresses under Verbatim Constraints. They were found titled "Gartner HypeCycle Graph - Data" and "Diagram", under the page "Gartner Hypecycle Graph" of the Showcase; FR-030 says what they are titled from here on.
- **FR-009**: The add-on MUST be told which database to read by the page that embeds it, so that one published add-on serves any number of graphs.
- **FR-010**: The add-on MUST read and write the database with the rights of the person looking at the page, or with rights that person granted, and MUST NOT publish a secret in its pages. It does so through a service beside the published pages, to which that person grants access once, from a web browser and from the Notion desktop app alike. The service MAY keep the token of a grant in progress for at most two minutes, to hand it to the page that started the grant, once; it keeps no token beyond that.

**Choosing and preparing a store**

- **FR-033**: When the add-on is added to a page without a store, it MUST ask the user to select a database, from the databases that user's access reaches, and MUST NOT need the user to find and type a database id. Once a database is selected and prepared, the add-on MUST make the embed block name it: it looks for the embed block of this add-on that names no store, on the page that holds the database and on the pages directly under that page, and where it finds exactly one it sets that block's address. Where it finds none or several, it MUST show the address for the user to put in the block, ready to copy. Either way the diagram of the selected database MUST be shown at once.
- **FR-034**: For the selected database the add-on MUST check whether the properties the tool type needs are there, or can be projected from properties the database already has. A property can be projected when the database has a property of the type that is needed under another name, which no other need claims: projecting it gives that property the name that is needed, and the user chooses per property between that and a new one.
- **FR-035**: Where properties are missing and cannot be projected, the add-on MUST tell the user which ones and offer to add them. It adds them itself once the user has agreed, and MUST NOT change a database before that.
- **FR-036**: The properties of a store that hold internal, technical information MUST be hidden in the database's views, so that a reader of the table sees what the graph is about. A property is internal when it is needed to draw or to keep the graph and tells nothing of its domain: where an element is placed and how large it is drawn, where a relation is attached, and the order of the rows. For the Gartner hype cycle graph these are `Order`, `row`, `at`, `width`, `height`, `peak-end`, `trough-end`, `slope-end`, `from-phase`, `from-edge`, `from-at`, `to-phase`, `to-edge` and `to-at`. What stays shown is the id, `name`, `Kind`, `description`, `tags`, `start`, `stop`, `date`, `phases`, `text`, `from`, `to` and `unit`. The add-on MUST find the internal properties from the specification and name none itself (FR-004).
- **FR-037**: FR-036 MUST hold for every store that exists when this feature is delivered, the ten of the Showcase, and for every database the add-on prepares or fills from then on.

**Showing**

- **FR-011**: The diagram MUST be shown inside a Notion page through an embed block, and MUST be usable at the width and height the embed block is given.
- **FR-012**: A document MUST be drawn the same as in the standalone and Visual Studio Code hosts: the same elements, names, places on the time ruler, phases and influences.
- **FR-013**: Reading MUST NOT fail. An entry that cannot be read is a finding and the rest is drawn; a document that cannot be read at all opens empty and read-only.
- **FR-014**: Findings MUST be shown with their severity, their sentence and the element they concern.

**Editing**

- **FR-015**: A user MUST be able to make every edit the DISL specification offers: add a trend, a trigger and a note from the toolbox, draw an influence, move and resize along the time ruler, drag a phase boundary, change attributes, rename, remove, and the context actions the specification lists.
- **FR-016**: A toolbox MUST list the toolbox items of the specification, and a property grid MUST show and change the attributes of the selection through the forms of the specification.
- **FR-017**: The toolbox and the property grid MUST each be collapsible, and the diagram MUST remain usable with both collapsed.
- **FR-018**: Every completed edit MUST be stored in the database without a save action.
- **FR-019**: An edit the specification refuses MUST change nothing and MUST show the specification's sentence.
- **FR-020**: An edit that cannot be stored MUST be reported to the user, and the diagram MUST then show what the database holds.
- **FR-021**: Somebody whose access reaches the database but does not allow changing it MUST get a read-only diagram with no editing control, as soon as the add-on can tell: when the store is opened where Notion says so then, and otherwise at the first write Notion refuses, which MUST change nothing. Somebody whose access does not reach the database is invited to connect and gets no diagram.
- **FR-022**: A change made to the database outside the diagram MUST NOT be overwritten by the diagram's next write without the user being told.

**Undo and redo**

- **FR-023**: CTRL+Z MUST undo the last edit and CTRL+Y MUST redo the last undone edit, on the canvas and in the database, while the diagram has the keyboard focus. On macOS the platform's own keys for the two MUST work as well.
- **FR-024**: One gesture MUST be one step of undo.
- **FR-025**: Undo and redo MUST also be reachable without a keyboard.
- **FR-026**: Where Notion offers a way for an add-on to take part in Notion's own undo, the add-on MUST use it; where it does not, the add-on MUST keep its own history and store each undo and redo as a change to the database.

**Reuse**

- **FR-027**: The toolbox and the property grid MUST be usable by another Notion add-on without change, drawing their content from that add-on's DISL specification.
- **FR-028**: The interpreter of DISL and FBL, the storage in a Notion database and the undo history MUST likewise be usable by another add-on, so that a second add-on consists of its specification and what is particular to it.

**The examples**

- **FR-029**: For every example the other hosts ship for this tool type, the Showcase MUST hold a database with that example's document and a page that shows it, each named after the example as those hosts name it: the heading of the example's `readme.md`.
- **FR-030**: The naming of the first graph's pages MUST follow the same rule, and MUST spell the tool type as its display name does.

**Truthfulness**

- **FR-031**: Once the add-on is published, the places that say no tool is available in Notion MUST say what is: the index at `/adp-notion`, the `README.md` of `etalii.adp.ide.notion`, and the site's host entry and tool catalogue.
- **FR-032**: The row of the Gartner hype cycle in the "Tools" database of the Notion workspace MUST state the tool's state in the Notion host.

### Non-Functional Requirements

**Looking like Notion**

- **NFR-001**: Everything the add-on shows around the diagram MUST follow Notion's styling, and every departure is listed (NFR-004): the toolbox, the property grid, the menus, the controls, the findings and the messages use Notion's type, colours, spacing, corners and icon style, and its controls behave as Notion's do, so that the add-on reads as a part of the page and not as a foreign page inside it.
- **NFR-002**: The drawing of the diagram itself is not subject to NFR-001: its notation is what the DISL specification gives and FR-012 holds. Where the specification leaves a choice open, such as the canvas background or the selection mark, the add-on MUST choose as Notion would.
- **NFR-003**: The add-on MUST follow the light and the dark appearance of the page it is embedded in, wherever it can tell which of the two the reader uses.
- **NFR-004**: Every place where the add-on departs from Notion's styling MUST be listed with its reason where a reader of the add-on finds it.
- **NFR-005**: The styling of the toolbox and the property grid MUST be a part of them, so that another add-on that uses them gets the same look with no styling of its own.

**Using it**

- **NFR-006**: The toolbox, the property grid and the controls MUST be operable with the keyboard alone, with a visible focus, and MUST name their controls to assistive technology.
- **NFR-007**: Text and controls MUST keep the contrast Notion's own have, in both appearances.
- **NFR-008**: The add-on MUST show that it is loading, storing or has lost its connection in the manner Notion does, and MUST NOT block the page it is embedded in while it does.

### Key Entities

- **Notion add-on**: the web page that shows the Gartner hype cycle graph inside a Notion page. One add-on, one tool type, one address under `/adp-notion`.
- **Tool type**: the Gartner hype cycle graph, origin `gartner/hypecycle-graph`, defined by its DISL specification and the FBL binding it names. Not owned by this feature.
- **Graph**: one document of that tool type. It holds an optional unit and up to four lists: trends, triggers, notes and influences. A trend has a name, a start, phases and tags; an influence runs from a trend or a trigger to a trend.
- **Store**: the Notion database that holds one graph. It is the graph's only store.
- **Diagram page**: the Notion page that shows one graph through an embed block and tells the add-on which store to use.
- **Showcase entry**: a page of the Showcase holding one store and one diagram page, named after its graph.
- **Example**: a graph the other hosts ship: coal technologies, digital trends, electric vehicles, energy breakthroughs, eras of innovation, internet evolution, LLMs and agents, technology trends, warfare in Ukraine.
- **Toolbox** and **property grid**: the two panels of the add-on, shared by every Notion add-on.
- **Edit**: one change a user makes, stored in the database, and one step of the undo history.
- **Finding**: the result of a rule or of reading, with a severity, a sentence and a place.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each of the nine examples, opened in Notion and in the Visual Studio Code host, shows the same elements with the same names, places and influences: 0 differences.
- **SC-002**: A graph of 50 trends is drawn within 3 seconds of opening its page.
- **SC-003**: A document taken from a host, stored, edited in no way and taken out again reads the same in that host as the original: the same elements in the same order with the same attributes, 0 differences, but for what FR-007 says is not kept. Its bytes may differ.
- **SC-004**: An edit is visible on the canvas within 100 milliseconds. An edit of one element is in the database within 5 seconds; an edit of many elements is stored at the pace Notion allows, with its progress shown.
- **SC-005**: After any sequence of 20 edits, 20 presses of CTRL+Z leave the database identical to its state before the first edit.
- **SC-006**: Every edit the specification offers can be made in Notion: the list of its toolbox items, gestures and context actions has 0 items that cannot be done.
- **SC-007**: The toolbox and the property grid show another tool type's items and attributes with 0 lines of their code changed.
- **SC-008**: The DISL specification and the FBL binding of the tool type are unchanged by this feature: 0 lines.
- **SC-009**: A new graph can be set up in Notion by a person following written steps in under 5 minutes, with no change to the add-on.
- **SC-010**: No page the add-on publishes holds a secret, and no place says that Notion has no tool.
- **SC-011**: Set beside Notion's own panels in the light and in the dark appearance, the toolbox and the property grid differ from Notion's styling only where the list of NFR-004 says so: 0 unlisted departures.
- **SC-012**: Every control of the toolbox and the property grid can be reached and used with the keyboard alone: 0 controls that need a pointer.

## Assumptions

- "BL" in the request is FBL, the Format Binding Language: the DISL specification of this tool type declares its persistence as an FBL binding.
- The examples "available in the other ADP hosts" are the nine of the Visual Studio Code host, `examples/gartner-hypecycle-graph/`. The standalone host's test fixtures are not examples.
- Each graph has its own database and its own diagram page, as the first one has.
- The Claude session the request points to could not be read. How a Notion add-on reaches a database was decided without it, on 2026-10-08: see Clarifications.
- Notion offers an embedded page no way to take part in Notion's own undo. FR-026 keeps the request's order of preference in case it does.
- Two people editing one graph at the same time is out of scope beyond FR-022: no change is silently overwritten, and nobody sees the other's cursor.
- The add-on is built for a desktop browser. On a phone the diagram is shown and can be read; editing there is not promised.
- The glossary already defines host and Notion add-on. A new term this feature needs, such as the store, is defined there first.
- Other tool types get their Notion add-ons in features of their own.

## Verbatim Constraints

- The tool type's origin: `gartner/hypecycle-graph`
- Its DISL specification: `definitions/diagrams/gartner-hype-cycle-graph.dis`
- The database of the first graph: `https://app.notion.com/p/3f2be2fd05b680f5bfe1d89398eabb4e?v=3f2be2fd05b6807cbf5a000c8f2809c0`, titled `Gartner HypeCycle Graph - Data`
- The page of the first graph: `https://app.notion.com/p/Diagram-3f2be2fd05b68030ad49fb0c78476d76`, titled `Diagram`
- The keys: `CTRL+Z` and `CTRL+Y`
- The session with the implementation details: `https://claude.ai/code/session_01UbhpjvoaQLqQRBnfW7Akbo`
