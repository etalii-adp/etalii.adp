# Feature Specification: Links Between Tools

**Feature Branch**: `claude/project-thread-hu5ioe` (a cloud session's branch, in place of `features/089-cross-tool-links`)

**Created**: 2026-11-23

**Status**: Approved on 2026-11-23 (decision card "Approve as written"); plan written, tasks await approval

**Input**: The maintainer, 2026-11-23: "specify a new way to link information between diagrams/designers and editors", shaped in the project thread on decision cards and in the maintainer's own words the same day. The rules for identifying documents and elements, the form of a link, and the four tool types that get links are the maintainer's, quoted under *The maintainer's rules*; the remaining choices were made on cards and are listed under *Decisions*.

## Context

**What exists today.** ADP has no general way for one tool's document to point at an element of another tool's document:

- A diagram can open a web address or a file path (DISL 0.4, the `open` action), but not an element inside another document. *Diagram-to-diagram links* is still open question 1 of DISL appendix D.2.
- DESL says a reference to an element of another document "is a value that names the other document and an id in it, resolved by the host" (DESL section 3), and that a step changing two documents is one undoable step (DESL 5.4); it does not say what that value looks like.
- The Knowledge designer is the one tool that links across files: a relation names its target file by a relative path, holds row ids of that file per cell, and a two-way relation writes a computed counterpart property into the target file ([knowledge.md](../../definitions/designers/knowledge.md), *Relations and the steps that write two files*; spec 080 for VS Code).
- ATD's `import` shares declarations between tool *types*; nothing links the *documents* people make with them.

A path breaks when a file is moved or renamed, and a row id means nothing to a reader. This feature defines one link, the same in every tool type that adopts it: it identifies the target document by an id stored in the document, falls back to the file's name, identifies the element by its id, and carries the element's name so it can be shown before anything is looked up.

**Words.** The **workspace** is the folder structure a host is working on, up to its root. The **consuming document** is the document a link is written in; the **target document** is the document it points at, and the **target element** the element in it. A **document id** and an **element id** are short ids stored in the documents themselves. A **linked element** is an element of a consuming document that stands for a target element. A **backlink** is a link seen from its target. The **lookup** is the step in which a person picks a target element from the workspace.

### The maintainer's rules

Quoted from the thread (2026-11-23 16:31 Europe/Berlin), and binding on every requirement below:

1. "The scope of searching is always up to the root of the (folder) structure that the host is working on."
2. "Each document needs to have a unique (short) ID. However, also the name of the file should be included, as else copies can make weird situations."
3. "Each element in the document that is linked to also requires a unique (short) ID."
4. "Duplicate ID's are not allowed in a file."
5. A link is composed as `$[DOCUMENT-ID]@[DOCUMENT-NAME]#[ELEMENT-ID].[ELEMENT-NAME-PROP]=[ELEMENT-NAME]`; "the $, @ and # and . (dot) are important, the brackets identify the individual parts of the identifier."
6. "The document name resolve is only used when no unique document can be resolved with the document id."
7. "The element id should be the unique identifier of the element."
8. "The element-name-prop depicts the value that should be used to identify the element in the document, so it can resolve into a property, column or anything else. When not provided the system will find a fitting value."
9. "The element-name is the locally cached name of the relation, i.e. that way it can be visualized even without doing the complete lookup."
10. Supported tools: the Knowledge designer ("the relation system should work with this mechanism"), the Mind map ("having the ability to add elements from other documents"), the Timeline and the Dependency graph. Not every tool type gets links: only selected ones.
11. "There needs to become a mechanism to look up elements from other documents. For the Knowledge designer this should be tied in how lookups are done in Notion, but for the other ones there should be a reusable concept (probably a context menu action)."
12. The cached name "should be validated / updated when the consuming document (i.e. where the link resides in) is loaded."

### Decisions

Taken on decision cards on 2026-11-23:

| Question | Answer |
| --- | --- |
| What a link can point at | An element in a tool's document (here: in a document of one of the four tool types) |
| Where a link is stored | In the consuming document, through the tool type's own format |
| Direction | One-way: a link is written only in the consuming document; backlinks are computed from the workspace |
| What a link shows | It navigates, shows the target's name live and chosen attributes of the target, and reports a finding when its target is gone |
| Id format | 8 characters of base 36 (`0-9a-z`), random |
| Where a mind map keeps its document id | A Freeplane node attribute on the root node |
| How a timeline and a dependency graph show a link | As a linked element on the canvas |
| Today's knowledge relations | Converted to links, every file once |
| An ambiguous link | A finding; the person picks the target, and the copy gets a new document id |
| The knowledge lookup | Notion's relation picker, with Notion's relation limits |

### What this feature is not

- **Not links for every tool type.** Only the Knowledge designer, the Mind map, the Timeline and the Dependency graph hold links or are linked to. Another tool type adopts links by a specification of its own.
- **Not links into editors.** Editors get no element ids here.
- **Not transclusion.** A linked element shows the target's name and chosen attributes; it does not draw the target's view or let the target be edited through the link.
- **Not links outside the workspace.** A link never resolves to a document above the workspace root, nor to a web address; DISL's `open` stays as it is for those.
- **Not a host build.** This feature defines the link, the languages' part in it and the four tool types' definitions; each host builds it in a specification of its own (see *Assumptions*).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add an element from another document to a mind map (Priority: P1)

A person working on a mind map wants a node to stand for a requirement row in a knowledge file and a service in a dependency graph. On a node they choose the context menu action that looks up an element in another document, search, pick the element, and get a child node that shows the element's name with a link badge. Activating the badge opens the target document with the element selected.

**Why this priority**: it is the maintainer's first example of the reusable lookup, and it exercises every part of a link: lookup, storing, showing and navigating.

**Independent Test**: in a workspace with a knowledge file and a dependency graph, add a linked node to a mind map for one row and one node, save, reopen, and activate each badge.

**Acceptance Scenarios**:

1. **Given** a mind map in a workspace holding other supported documents, **When** the person chooses the lookup action on a node, **Then** a search lists the elements of the workspace's supported documents by name, each with its document's name and folder.
2. **Given** an element picked in the lookup, **When** the person confirms, **Then** a linked child node is added as one undoable step, and the mind map file holds the link in the form `$<document-id>@<document-name>#<element-id>.<element-name-prop>=<element-name>`.
3. **Given** a linked node, **When** its badge is activated, **Then** the target document opens in its own tool with the target element selected, or comes to the front when it is open already.
4. **Given** a linked node, **When** the mind map is opened in Freeplane, **Then** the node is an ordinary node showing the cached name, and saving in Freeplane keeps the link.

---

### User Story 2 - Link survives moves, renames and copies (Priority: P1)

A person renames and moves a knowledge file to another folder, and later copies a dependency graph to start a variant. Links to the renamed file keep working; links to the copied graph are reported as ambiguous instead of silently landing on one of the two.

**Why this priority**: identity that survives moves is the reason links carry a document id, and copies are the case the maintainer named.

**Independent Test**: link a timeline to a knowledge row, rename and move the knowledge file, reopen the timeline; then copy the target, reopen again, and resolve the finding.

**Acceptance Scenarios**:

1. **Given** a link whose target document was renamed or moved inside the workspace, **When** the consuming document is loaded, **Then** the link resolves by its document id, and the document-name part and the cached element name are updated in the consuming document as one undoable step.
2. **Given** two documents with the same document id, **When** a link names that id and its document name matches exactly one of them, **Then** the link resolves to that one.
3. **Given** two documents with the same document id and the same name (in different folders), **When** the consuming document is loaded, **Then** the link is reported as ambiguous, and the finding's fix lists the candidates by path; choosing one resolves the link and gives every other candidate a new document id.
4. **Given** a link whose document id matches no document, **When** exactly one document in the workspace has the link's document name, **Then** the link resolves to it and its document-id part is updated on load.

---

### User Story 3 - Knowledge relations become links, picked as in Notion (Priority: P1)

A person opens an existing knowledge file whose relation names its target by path and holds row ids. It is converted once to links. Editing a relation cell then opens a picker as Notion's relation picker does: a search over the target's rows by title as they type, the chosen rows shown as removable chips, and "create new row" when nothing matches.

**Why this priority**: the Knowledge designer already depends on cross-file relations; it must move onto the one mechanism without losing a relation.

**Independent Test**: open the knowledge relations example (cities and provinces), check the converted file against the original row by row, then add, remove and create a related row through the picker.

**Acceptance Scenarios**:

1. **Given** a knowledge file with relations in today's form, **When** it is loaded, **Then** every relation and every cell is rewritten as links in one undoable step, no related row is lost, and the rest of the file is unchanged byte for byte.
2. **Given** a relation cell, **When** the person edits it, **Then** the picker searches the target document's rows by title as they type and shows the cell's rows as removable chips.
3. **Given** a relation limited to one row, **When** the person picks a second, **Then** it replaces the first, as Notion does.
4. **Given** a search with no match, **When** the person chooses "create new row", **Then** a row with that title is created in the target document and linked, as one undoable step over both documents (DESL 5.4).
5. **Given** a two-way relation, **When** the target document is shown, **Then** its counterpart column lists, per row, the rows of other documents that link to it, computed from the workspace and not stored in the target.

---

### User Story 4 - Linked elements in a timeline and a dependency graph (Priority: P2)

A person planning a release adds to a timeline the milestones of a knowledge file and the services of a dependency graph, each as a linked element placed on the timeline like any other. In a dependency graph they add a node that stands for a service in another team's graph and draw dependencies to it.

**Why this priority**: it carries the reusable lookup to the two other diagrams the maintainer named.

**Independent Test**: add two linked elements to a timeline and one to a dependency graph through the context menu action, connect them, save, reopen, and navigate from each.

**Acceptance Scenarios**:

1. **Given** an empty spot on the canvas, **When** the person chooses the lookup action there, **Then** the picked element is added as a linked element at that place, as one undoable step.
2. **Given** a linked element, **When** the diagram is shown, **Then** it is drawn as the tool type draws its own elements, with a link badge and the target's current name.
3. **Given** a linked element in a dependency graph, **When** the person connects it to a node, **Then** the dependency is drawn and stored as any other dependency.
4. **Given** a linked element whose tool type declares attributes to show, **When** it is drawn, **Then** those attributes of the target (for example a row's status) are shown with their current values.

---

### User Story 5 - See what links to an element (Priority: P2)

A person selects a knowledge row and wants to know which mind maps, timelines and graphs refer to it before changing it.

**Why this priority**: backlinks are what make one-way links safe to change.

**Independent Test**: link one row from three documents, select it, and check the list and each navigation.

**Acceptance Scenarios**:

1. **Given** a selected element, **When** links in the workspace point at it, **Then** the tool shows them as "Linked from", each with the consuming document's name and the linked element's name.
2. **Given** an entry of "Linked from", **When** it is activated, **Then** the consuming document opens with the linked element selected.
3. **Given** an element some document links to, **When** the person deletes it, **Then** the tool says how many links will break before deleting.

---

### User Story 6 - Broken and malformed links (Priority: P2)

A person opens a mind map whose linked node points at a deleted row.

**Independent Test**: delete a linked row and a linked file, write a malformed link by hand, and open the consuming documents.

**Acceptance Scenarios**:

1. **Given** a link whose target document cannot be resolved by id or by name, **When** the consuming document is loaded, **Then** the linked element shows its cached name, marked broken, and a finding names the document id and name.
2. **Given** a link whose document resolves but whose element id is not in it, **When** the consuming document is loaded, **Then** a finding says the element is gone, with fixes to pick another element through the lookup or to remove the link.
3. **Given** a link value that does not follow the link form, **When** the consuming document is loaded, **Then** a finding quotes it, and the value is kept as written.

---

### User Story 7 - A tool engineer gives a tool type links (Priority: P1)

A tool engineer specifies in a tool type's definition that it holds links, which of its element types are linked elements, which attributes of a target it shows, and that its elements can be linked to with which name property; no host code is written for the tool type.

**Why this priority**: tool types are definitions; links must be stated there to reach every host.

**Independent Test**: read the four tool types' definitions and their tool descriptions, and check each declares what the requirements below ask, and validates.

**Acceptance Scenarios**:

1. **Given** a tool type whose definition does not declare links, **When** it is used, **Then** nothing about it changes.
2. **Given** the definitions of the four tool types, **When** the repository's validation runs, **Then** each validates, with its document id, element ids and link declarations stated.

### Edge Cases

- A consuming document that links to itself: the link resolves within the document; it is shown and navigated like any other.
- A document of a supported tool type without a document id (made before this feature, or by another program): it gets one when it is loaded by a host, written as one undoable step.
- A target element with an id that is not of the 8-character form (a Freeplane `ID_123`, a timeline ShortGuid, a knowledge `r1`): its id is used as written; only new ids take the 8-character form.
- A name part that contains `$`, `@`, `#`, `.`, `=` or `%`: the character is percent-escaped in the link and unescaped when read.
- A link without its element-name-prop: the tool type's declared name property is used, else the first text attribute that the target element has.
- A link without its element-name: it is filled in on the next load.
- A workspace with several roots: a link is resolved within the root that holds the consuming document.
- A target document of a tool type that does not support links: the lookup does not offer it, and a link written to it by hand is reported as broken.
- A target document that cannot be read: the link shows its cached name and a finding says why.
- A duplicate element id inside one file: reported by the tool type's existing duplicate-id finding; a link to that id is reported as ambiguous.

## Requirements *(mandatory)*

### Functional Requirements

**Identity**

- **FR-001**: Every document of a tool type that supports links **MUST** hold a document id: 8 random characters from `0-9a-z`, stored in the document itself (for the Knowledge designer in DED's envelope, for the Timeline and the Dependency graph as a top-level `id` key, for the Mind map as a Freeplane node attribute on the root node).
- **FR-002**: A document of such a tool type without a document id **MUST** be given one when a host loads it, as one undoable step.
- **FR-003**: Every element that can be linked to **MUST** have an element id unique within its file; new element ids **MUST** take the form of FR-001, and existing ids **MUST** be kept as written.
- **FR-004**: Two elements with one id in a file **MUST** be reported (rule 4).

**The link**

- **FR-005**: A link **MUST** be written as `$<document-id>@<document-name>#<element-id>.<element-name-prop>=<element-name>`, where `<document-name>` is the target file's name with its extension and without its folder, `.<element-name-prop>` may be absent, and `=<element-name>` may be absent.
- **FR-006**: `$`, `@`, `#`, `.`, `=` and `%` inside a part **MUST** be written percent-escaped and read unescaped.
- **FR-007**: A link **MUST** be stored only in the consuming document, through the tool type's own format and binding.

**Resolution**

- **FR-008**: A link **MUST** be resolved only among the documents under the workspace root that holds the consuming document.
- **FR-009**: The target document **MUST** be the one document with the link's document id; only when there is not exactly one **MUST** the document name be used, among the documents with that id when there are several, else among all documents.
- **FR-010**: When several documents remain, the link **MUST** be reported as ambiguous; its fix **MUST** list the candidates by path, and choosing one **MUST** give every other candidate a new document id.
- **FR-011**: When no document remains, or the element id is not in the target, the link **MUST** be reported as broken, showing its cached name; fixes **MUST** offer the lookup and removing the link.
- **FR-012**: A link value that does not follow FR-005 **MUST** be reported and kept as written.

**Load-time validation**

- **FR-013**: When a consuming document is loaded, every link in it **MUST** be resolved, and a document-id, document-name or element-name part that differs from what resolution found **MUST** be updated in the document, all in one undoable step.
- **FR-014**: While a consuming document is open, a linked element **MUST** show the target's current name and declared attributes, following changes to the target document.

**What a link does**

- **FR-015**: Activating a link **MUST** open the target document in its tool, or bring it to the front, with the target element selected.
- **FR-016**: A tool type **MAY** declare, per linked element type, attributes of the target to show; they **MUST** be shown with their current values and are never written to the consuming document.
- **FR-017**: For a selected element, the tool **MUST** list the links in the workspace that point at it ("Linked from"), computed and never stored, each navigable to its consuming document.
- **FR-018**: Deleting an element that links point at **MUST** say how many links will break before it is done.

**Lookup**

- **FR-019**: The Mind map, the Timeline and the Dependency graph **MUST** offer one shared context menu action that opens the lookup: a search over the elements of the workspace's documents of supported tool types by name, each shown with its document's name and folder, the consuming document's own elements included.
- **FR-020**: In the Mind map the action **MUST** add the picked element as a linked child of the node it was chosen on; in the Timeline and the Dependency graph it **MUST** add it as a linked element at the place it was chosen.
- **FR-021**: The Knowledge designer's relation cell **MUST** use a picker as Notion's relation picker: search of the target's rows by title as typed, chosen rows as removable chips, "create new row" when nothing matches, and Notion's limit to one row, a second replacing the first.

**Tool types**

- **FR-022**: Exactly the Knowledge designer, the Mind map, the Timeline and the Dependency graph **MUST** support links, holding them and being linked to; no other tool type changes.
- **FR-023**: A linked element in the Mind map, the Timeline and the Dependency graph **MUST** be placed, connected, moved and deleted as the tool type's own elements are; deleting it removes only the link.
- **FR-024**: A Mind map with linked nodes **MUST** stay an ordinary Freeplane map: a linked node is a node whose text is the cached name.
- **FR-025**: A knowledge relation **MUST** name its target document as a link without an element (`$<document-id>@<document-name>`) and hold links per cell.
- **FR-026**: A knowledge file with relations in today's form (target path, row ids, counterpart properties) **MUST** be converted once, on load, to FR-025 in one undoable step, losing no related row; a two-way relation's counterpart **MUST** afterwards be computed from backlinks and stored in no target file.
- **FR-027**: Each of the four tool types **MUST** state in its definition, and in its tool description, its document id, which of its element types can be linked to and by which name property, its linked element types, and the target attributes they show.

**Languages**

- **FR-028**: The link, its resolution and its findings **MUST** be stated once, in a place every specification language refers to, so that DISL, DESL and their tool descriptions use the same definition; DISL appendix D.2 question 1 and DESL section 3's cross-document reference **MUST** point at it.
- **FR-029**: The findings **MUST** have stable ids shared by every tool type: malformed link, broken document, broken element, ambiguous document.

### Key Entities

- **Document id**: 8 characters of base 36, in the document; with the file's name, identifies the document in the workspace.
- **Element id**: unique within its document; identifies the target element.
- **Link**: a string in the consuming document of the form of FR-005; one-way.
- **Linked element**: an element of the Mind map, the Timeline or the Dependency graph that holds one link and stands for its target.
- **Backlink**: a link seen from its target; computed, never stored.
- **Lookup**: the search in which a person picks a target element.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every pair of the four tool types, an element of one can be linked from the other, saved, reopened and navigated in both directions (link and backlink): 16 pairs, all passing.
- **SC-002**: After a target file is renamed and moved, 100% of links to it resolve on the next load of their consuming documents, with no action by the person.
- **SC-003**: A copied target is never resolved silently: in every case where id and name match several documents, a finding is shown.
- **SC-004**: Converting the knowledge examples loses no related row: the set of (row, related row) pairs before and after conversion is equal.
- **SC-005**: A person can add a linked element through the lookup in under 30 seconds in a workspace of 200 documents.
- **SC-006**: A Mind map with linked nodes opened and saved in Freeplane keeps every link and its document id.
- **SC-007**: No host code is written for one tool type to support links: everything per tool type is in its definition.

## Assumptions

- **Scope of this feature.** The link and its rules in the specification languages, and the definitions of the four tool types; each host (standalone, VS Code, IntelliJ, Eclipse, Notion, Claude, ThinkRail) builds it in a specification of its own, in the order the maintainer chooses.
- **Where the shared definition lives.** FR-028 asks for one place; whether that is a section of FBL (which already serves every kind), a new small specification, or ATD is the plan's choice.
- **Loading may change a file.** By the maintainer's rulings, loading a consuming document updates stale link parts (FR-013), loading a document without an id gives it one (FR-002), and loading an old knowledge file converts it (FR-026). A document opened read-only is not changed; its links are resolved and shown without being written.
- **The document name** is the file's name with its extension; a document's title is not used, because titles are not unique and change more often.
- **The knowledge counterpart.** Under one-way links a two-way relation's counterpart is not written to the target; the counterpart's name, today a property in the target file, moves to the relation in the consuming document during conversion. This keeps the maintainer's "one-way" answer and Notion's two-way relation together; it is the part of this specification most open to amendment.
- **"Create new row"** writes a row into the target document. It creates a target element; it does not store a link there, so it does not break the one-way rule.
- **Percent-escaping** (FR-006) is chosen so that names may contain the link's separators.
- **The workspace** is the folder a host has open: a VS Code workspace folder, an IntelliJ project's root, the standalone host's hierarchy root.
