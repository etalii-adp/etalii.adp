# Feature Specification: The Hierarchical Requirement Designer

**Feature Branch**: `features/028-hierarchical-requirement-designer`

**Created**: 2026-10-13

**Status**: Draft

**Input**: The go of 2026-10-13 in [decision.md](../../.specify/assessments/hierarchical-requirement-designer/decision.md), for Option C of [concept.md](../../.specify/assessments/hierarchical-requirement-designer/concept.md), with [problem.md](../../.specify/assessments/hierarchical-requirement-designer/problem.md), [research.md](../../.specify/assessments/hierarchical-requirement-designer/research.md) and [intake.md](../../.specify/assessments/hierarchical-requirement-designer/intake.md) beside it.

## Context

**The problem.** A person who works with agents on requirements has them only as flat, per-feature Markdown that the agent reads and writes. The person can only skim that text and search it for words. That is slow, and it does not show how the requirements fit together. No one place follows the structure of the subject, in which the person and the agent can discuss its requirements.

**What was decided.** The maintainer chose the idea in full (Option C) over the concept's recommendation (Option B), and declined the trial that would have measured the layout first. The go rests on the maintainer's judgement of the need, not on evidence of demand. Three reservations come with it and are kept in this specification:

- What Option C adds over Option B (a state, sorting, a category list users manage, stored filters, wildcards, a Markdown family in FBL, a settings block in the registration) has no goal or metric in `problem.md` behind it. It is where this specification is most ready to be cut, and User Story 8 holds most of it for that reason.
- The go does not pass the plan's Constitution Check. If the plan cannot justify the Markdown family or the settings block as a current tool's need (principle V), the fallback on record stands: the file is read by a persistence plugin and the registration stays as it is.
- Nothing was measured before this was written. The baseline for the time a person needs, the count of agents' breaks and the shape of a real document are found by this specification and by use.

**Where the work lands.** This specification, its plan and its tasks live here. The designer type's definition and the changes to the specification languages land in this repository, all through this one feature, as spec 013-knowledge-designer delivered the Knowledge designer's. The designer itself is built first in `etalii.adp.ide.standalone`, which plans with spec-workflow in its own repository. No other host is in scope.

**When.** The decision placed this specification after the open work on the standalone host, spec 025-standalone-code-structure among it. The maintainer started it on 2026-10-13, before that work ended. This specification reads that as: specifying starts now, and building in the standalone host still waits for that work.

**Words.** A **subject** is what the requirements are about: an application, a product, a process or anything else. An **item** is one level of the hierarchy, a part of the subject. A **requirement** stands in an item. An **assessment** is a question, remark, warning or idea about an item or a requirement. A **requirement document** is one Markdown file that holds all of these for one subject. Three roles appear below: a **person** works in the designer, an **agent** reads and writes the file as text, and a **tool engineer** specifies tool types in this repository. Other words are those of [docs/terminology.md](../../docs/terminology.md).

## Clarifications

### Session 2026-10-14

- Q: When a hierarchy is nested deeper than the page is wide, how should the designer keep the deep levels readable and editable? → A: Focus on an item. The page shows as many levels as fit, the person makes any item the left edge of the page, and a trail of the items above it leads back.
- Q: What can an assessment be attached to, and which assessments does the icon on an item stand for? → A: An assessment names one requirement or one item. Each entry's icon shows its own assessments, and a collapsed item's icon also stands for the unresolved assessments hidden inside it.
- Q: Should the changes to DESL, FBL, DED and the registration be delivered inside feature 028, or as features of their own that 028 depends on? → A: All in 028, as spec 013 did for the Knowledge designer.
- Q: Is the title of a requirement the requirement itself, or a short name for it with the requirement written out in the description? → A: The requirement itself. A description is optional clarification.
- Q: Which states should a new requirement document offer for a requirement to start with? → A: Four neutral states: proposed, accepted, rejected and done. The person can change the list.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the requirements of a subject by its structure (Priority: P1)

A person opens a requirement document that an agent wrote. They see one page that scrolls from top to bottom. Each item is a box. What an item contains, its sub-items and its requirements, stands to its right, and the box is as high as what it contains. Every item and requirement shows its number, its title and, when it has one, its description. The person collapses the parts they do not need and reads the rest.

**Why this priority**: this is the problem as stated. It gives value with nothing else built: a person can already judge an agent-written file by the subject's structure and not by skimming.

**Independent Test**: open a requirement document written by hand, three levels deep, and compare the page with the file. Collapse and expand items and requirements, focus on a deep item and go back, close the document and open it again.

**Acceptance Scenarios**:

1. **Given** a requirement document with items nested three deep, each holding requirements, **When** it is opened, **Then** every item is a box, its requirements and sub-items stand to its right, and the box is as high as what stands to its right.
2. **Given** an item with sub-items, requirements and a description, **When** the person collapses it, **Then** only its number, title, tags and assessment icon remain.
3. **Given** a requirement with a description, **When** the person collapses it, **Then** only its number, title, tags and assessment icon remain.
4. **Given** a document with collapsed items, **When** it is closed and opened again, **Then** the same items are collapsed.
5. **Given** a hierarchy deeper than the page is wide, **When** the person focuses on an item, **Then** that item stands at the left edge of the page, the levels below it that now fit are shown, and a trail of the items above it leads back to each of them.

---

### User Story 2 - A person and an agent work on the same file (Priority: P1)

An agent adds, changes and moves requirements by editing the Markdown file as text. The designer shows each change without the person reopening anything. The person edits in the boxes, and the file stays text the agent reads. Each party points at an item or a requirement by its number, and the number still means the same entry after either has reorganised the document. When the agent leaves the file out of its structure, the person sees where, and nothing is lost.

**Why this priority**: the person and the agent discussing the same requirements, each in the form that suits them, is the second half of the problem. Without it the designer is a viewer of a file that only one party can keep.

**Independent Test**: open a requirement document in the designer and in a text editor side by side. Make each kind of edit on each side, and plant each kind of fault in the text.

**Acceptance Scenarios**:

1. **Given** an open requirement document, **When** an agent adds a requirement under an item in the file, without a number, **Then** the designer shows it without being reopened, reports that it has no number yet, and gives it the next number with the next edit the designer writes.
2. **Given** an open requirement document, **When** the person changes one title in the designer, **Then** only that entry's text changes in the file and every other byte is what it was.
3. **Given** a requirement that other requirements refer to, **When** either party moves it to another item, **Then** its number is unchanged and every reference and assessment still names it.
4. **Given** an open requirement document, **When** an agent writes a bullet the designer cannot follow, **Then** a finding stands at that bullet, its text is kept as written, and every other entry stays editable.
5. **Given** an open requirement document, **When** the file becomes unreadable as a whole, **Then** the last readable content stays on screen, read-only, with one finding, and the file is not written.
6. **Given** unsaved edits in the designer, **When** the file changes on disk, **Then** the person is told and chooses between reloading and keeping their version.

---

### User Story 3 - A host builds the designer from its definition (Priority: P1)

A tool engineer finds the Hierarchical Requirement Designer defined in this repository: what it shows and does, how its file is written, and worked examples. The specification languages can state everything the definition needs. A developer of a host builds the designer from those files alone, and an agent writes a valid requirement document from the companion document alone.

**Why this priority**: every host implements the one specification, and the standalone host builds nothing before the definition exists.

**Independent Test**: run the example validator on the definition, its examples and the changed specifications, with one defect planted at a time. Give an agent the companion document only and validate the file it writes.

**Acceptance Scenarios**:

1. **Given** the definition and the changed specifications, **When** the example validator runs, **Then** it passes, and it fails on each planted defect.
2. **Given** only the companion document, **When** a person or an agent writes a requirement document by hand, **Then** the designer opens it without a finding.
3. **Given** a second tool type whose document is nested Markdown bullets, **When** its tool engineer binds it, **Then** it declares its reading and brings no code of its own for it.

---

### User Story 4 - Start a document and shape the hierarchy (Priority: P2)

A person creates a requirement document for a new subject. It is not empty: it starts with a small structure and a legend that tells an agent how the file is written. The person adds items and requirements without leaving the page, drags an item with everything in it below another item, and deletes what does not apply.

**Why this priority**: with Stories 1 and 2 a person can work on a file an agent started. This lets the person start one and reorganise it.

**Independent Test**: create a document, inspect the file, then add, move and delete items and requirements and compare the file after each step.

**Acceptance Scenarios**:

1. **Given** the designer, **When** a person creates a requirement document, **Then** it holds a starting structure at most two levels deep, with at most three requirements in each item, and a legend for agents.
2. **Given** a new document and an agent that has never seen the tool, **When** the agent is asked to add an item with two requirements, **Then** the designer reads the result without a finding.
3. **Given** a selected requirement, **When** the person uses the quick way to add, **Then** a new requirement appears below it, ready for typing, with no dialog.
4. **Given** an item that holds sub-items and requirements, **When** the person drags it below another item, **Then** it moves with everything in it and no number changes.
5. **Given** an item that holds anything or is referred to, **When** the person deletes it, **Then** they are asked to confirm, and its numbers are never given to another entry.

---

### User Story 5 - Questions, remarks and warnings stay with what they concern (Priority: P2)

An agent leaves a question about a requirement, or about an item, in the file's part for assessments. The person sees an icon for it at the top right of that entry, opens the list, answers by changing the entry, and resolves the question. The person writes a warning of their own, and the agent reads it in the file.

**Why this priority**: it turns the document into the place where the two discuss the requirements, which today happens in chat, away from the requirement.

**Independent Test**: write assessments of each kind in the file as text and in the designer, on one entry and on several, and resolve them.

**Acceptance Scenarios**:

1. **Given** a requirement with one assessment, **When** the document is shown, **Then** the icon at its top right is that of the assessment's kind.
2. **Given** a requirement with several assessments, **When** the person presses its icon, **Then** all of them are listed and each can be changed, removed or resolved, and a new one can be added.
3. **Given** an assessment the person resolves, **When** the file is read as text, **Then** the assessment is still there, marked resolved, and the icon no longer counts it.
4. **Given** an item whose requirements carry unresolved assessments, **When** the person collapses the item, **Then** its icon stands for those assessments too, and pressing it lists them with the entry each names.
5. **Given** an item with no requirements, **When** an agent writes a question that names the item, **Then** the question's icon stands at the top right of that item.
6. **Given** an assessment that names a requirement that was deleted, **When** the document is shown, **Then** the assessment is kept in the file and reported as a finding.

---

### User Story 6 - Refer to another requirement or item (Priority: P2)

While typing a description, a person types `#`. A lookup lists the requirements and items of the document. They pick one, and it stands in the text as a box. The agent reads the same reference in the file as a link that names the number.

**Why this priority**: pointing at one requirement, so that the other party knows which is meant, is a goal of its own. It needs the numbers of Story 2 and nothing else.

**Independent Test**: make references by typing `#` and by writing links in the file, then move, rename and delete their targets.

**Acceptance Scenarios**:

1. **Given** a description being edited, **When** the person types `#` and then part of a number or a title, **Then** the lookup lists the matching requirements and items of this document.
2. **Given** a picked reference, **When** the file is read as text, **Then** it is a link that names the target's number, and the designer shows it as a box with that number and the target's current title.
3. **Given** a reference whose target is collapsed or out of view, **When** the person selects the box, **Then** the target is shown.
4. **Given** a reference whose target was deleted, **When** the document is shown, **Then** the box is marked as broken, the text in the file is kept, and a finding reports it.

---

### User Story 7 - Tag items and requirements (Priority: P2)

A person tags items and requirements. They type in the tag field: a name that matches a tag picks it, and a name that matches none creates it on Enter. They rename a tag, give it another colour, reorder the list and delete a tag, as in Notion's selection property. The tags an entry carries are in the file, where the agent reads them. The colours and the order are not.

**Why this priority**: tags are how a person marks the kind of requirement that concerns them, and what narrowing in Story 8 works on.

**Independent Test**: add, create, rename, recolour, reorder and delete tags in the designer, add one as text in the file, and delete the document's registration.

**Acceptance Scenarios**:

1. **Given** a tag field, **When** the person types a name that matches no tag and presses Enter, **Then** the tag is created with a colour and the entry carries it.
2. **Given** a tag carried by several entries, **When** the person renames it, **Then** every carrier in the file follows, as one undoable step.
3. **Given** a tag, **When** the person changes its colour or its place in the list, **Then** the Markdown file does not change.
4. **Given** an agent that writes a tag on a requirement that the list does not hold, **When** the document is shown, **Then** the tag is shown on the requirement and has joined the list, without the agent having touched any other file.
5. **Given** a document whose registration is deleted and created again, **When** it is opened, **Then** every entry carries the tags, category and state it had, and only colours, order, what was collapsed and stored filters are gone.

---

### User Story 8 - Categorise, set a state, narrow and sort (Priority: P3)

A person gives a requirement a category and a state, each from a list they can change. They narrow the page to one tag, one category, one state or the items whose title matches a pattern with wildcards. They sort the requirements within each item. They store a filter under a name and find it again the next day.

**Why this priority**: the maintainer named state, sorting and filtering as what makes the text least favourable by comparison. None has a goal or a metric in `problem.md`, so this story is the first to cut if the feature has to shrink.

**Independent Test**: set categories and states in the designer and as text, apply each kind of filter and sort, store a filter, reopen the document, and compare the file before and after.

**Acceptance Scenarios**:

1. **Given** a requirement, **When** the person picks a category or a state, **Then** it is written in the file and shown on the requirement.
2. **Given** a filter on one tag, **When** it is applied, **Then** only the requirements that carry the tag remain, with the items that contain them.
3. **Given** a filter `back*` on items, **When** it is applied, **Then** the items whose title begins with "back", in any case, remain with everything in them.
4. **Given** a sort by state, **When** it is applied, **Then** the requirements within each item are shown in that order and the file's order is unchanged.
5. **Given** a stored filter, **When** the document is closed and opened again, **Then** the filter is offered by its name.

---

### Edge Cases

- Two entries carry the same number, because an agent copied a bullet: the first in reading order keeps it, the other is shown with a finding and cannot be referred to until the person gives it a new number. The designer never renumbers by itself.
- A writer chose a number of their own: it is accepted when it is free, and the count continues past the highest number ever read.
- An entry was deleted as text: its number is still not given to a new entry by the designer.
- The count passes `9999`: the next number has five digits and no existing number changes.
- Text outside the bullets, such as a heading or the legend: kept byte for byte, not shown as an item or a requirement.
- A requirement bullet nested under a requirement, or an entry with a prefix the designer does not know: a finding on that bullet, the rest editable.
- An item with nothing in it: a box that offers the quick ways to add.
- A link in a description that points outside the document: shown as an ordinary link, not as a reference box.
- A filter hides an entry that has a finding: the finding is still listed, and selecting it shows the entry.
- The file is unreadable when it is opened: an empty, read-only page with one finding at the problem. It is never written.
- The person edits while an agent has just written the file: the edit is refused and the person is told. Edits of two writers are not merged.
- The registration is missing: the requirement document is still complete, and it opens with default colours and order. A tag, category or state that no entry carries is gone with the registration, and the starting categories and states are back.
- An add is undone: its number is free again, since undo restores the file as it was.

## Requirements *(mandatory)*

### Functional Requirements

#### The document

- **FR-001**: Users MUST see the designer type named "Hierarchical Requirement Designer" wherever a tool type's name is shown.
- **FR-002**: A requirement document MUST be one Markdown file of nested bullets that is the designer's own document, in which every item and every requirement is one bullet and the nesting of the bullets is the hierarchy.
- **FR-003**: The Markdown file MUST hold everything an agent needs to read and change the requirements: every item and requirement with its number, title and description, the tags it carries, a requirement's category and state, the references and the assessments.
- **FR-004**: The document's registration MUST hold what an agent does not need to read, and only that: the colours and order of the tag, category and state lists, what is collapsed, and the stored filters with their sorting.
- **FR-005**: The designer MUST work the same after the registration is deleted and created again, apart from what FR-004 lists.
- **FR-006**: A document the designer creates MUST carry, ahead of the hierarchy, a legend that tells an agent how the file is written, complete enough for an agent that has never seen the tool to add an item, a requirement, a tag, a reference and an assessment correctly.
- **FR-007**: A document the designer creates MUST be filled with a starting structure at most two levels deep with at most three requirements in each item, every part of which the person can rename, move and delete as any other.
- **FR-008**: The hierarchy MUST have no maximum depth, and a requirement MUST be allowed in an item at any depth.

#### Numbers

- **FR-009**: Every item MUST carry a number of the form `ITEM-000x` and every requirement one of the form `REQ-000x`, written as the prefix of its bullet and shown beside its title.
- **FR-010**: Items and requirements MUST be counted apart, each count per document and counted up, so that `ITEM-0003` and `REQ-0003` name different entries.
- **FR-011**: A number MUST NOT change once given, whatever happens to its entry: a move, a change of its text, tags, category or state, or a change to anything above or beside it.
- **FR-012**: The designer MUST NOT give a new entry a number that it has given or read before in that document, also after the entry that carried it was deleted.
- **FR-013**: An entry written as text without a number MUST be shown, MUST be reported as having no number yet, and MUST be given the next number with the next edit the designer writes, never when the document is only opened.
- **FR-014**: Of several entries that carry one number, the first in reading order MUST keep it, each later one MUST be shown with a finding, and the designer MUST NOT change a number to resolve this except by the person's action.

#### What the person sees

- **FR-015**: The designer MUST show the whole document as one page that scrolls from top to bottom, with no separate tree beside it.
- **FR-016**: An item MUST be shown as a box with its requirements and its sub-items to its right, the requirements above the sub-items, and MUST be as high as what stands to its right, with neighbouring boxes sharing their borders.
- **FR-017**: The page MUST show as many levels as fit its width, MUST mark an item whose deeper levels do not fit, and MUST let the person make any item the left edge of the page, with a trail of the items above it that leads back to each of them.
- **FR-018**: Every item and requirement MUST have a title, which is the one line on its bullet and for a requirement states the requirement itself, and MAY have a description below it that clarifies it.
- **FR-019**: Every item and requirement MUST be collapsible by a control to the left of its title, and a collapsed entry MUST show only its number, title, tags and assessment icon.
- **FR-020**: What is collapsed MUST be the same when the document is opened again.
- **FR-021**: The designer MUST take its looks from the Knowledge designer: its colours, typography, spacing, the way tags are drawn and the way menus and lists open.

#### Editing

- **FR-022**: The person MUST be able to add an item or a requirement from where they are on the page, by a control at the end of every item's content and by the keyboard from a selected entry, without a dialog.
- **FR-023**: The person MUST be able to move an item with everything in it, or a requirement, to another item or another place by dragging it.
- **FR-024**: Deleting an entry that contains anything, or that a reference or an assessment names, MUST ask for confirmation first.
- **FR-025**: Every edit in the designer MUST be one undoable step and MUST change only the bytes of the entries it concerns, of the entries it numbers under FR-013, and of the line that keeps the last number given.

#### Tags, categories and states

- **FR-026**: Items and requirements MUST be able to carry tags from one list per document, shown below the title in each tag's colour.
- **FR-027**: Typing in a tag field MUST narrow the list, a name equal to a tag's name in any case MUST pick that tag, and a name that equals none MUST create a tag on Enter.
- **FR-028**: The person MUST be able to rename, recolour, reorder and delete a tag, and a rename or a delete MUST update every entry that carries it in the same undoable step.
- **FR-029**: A tag written in the file that the list does not hold MUST be shown on its entry and added to the list, with no action required of its writer outside the Markdown file.
- **FR-030**: A requirement MUST be able to carry one category from a list the person can add to, rename, reorder and delete from, which starts as functional, non-functional and technical.
- **FR-031**: A requirement MUST be able to carry one state from a list the person can add to, rename, reorder and delete from, which starts as proposed, accepted, rejected and done, and which the person sets in the designer or an agent in the file.

#### Assessments

- **FR-032**: The file MUST have one part for assessments, set apart from the hierarchy, in which each assessment names the entry it concerns by number and has a kind and a text.
- **FR-033**: The kinds of assessment MUST be at least question, remark, warning and idea, each with an icon of its own.
- **FR-034**: An agent MUST be able to write an assessment as text in the file, and a person MUST be able to write one in the designer.
- **FR-035**: An assessment MUST name exactly one requirement or one item of the same document, and MUST be shown at that entry.
- **FR-036**: The top right of an entry MUST show the icon of the kind when it has one unresolved assessment, an icon that stands for several when it has more, and a way to add the first when it has none; a collapsed item's icon MUST also stand for the unresolved assessments of everything hidden inside it.
- **FR-037**: Pressing the icon MUST open the assessments it stands for as a list, each with the entry it names, in which the person can add, change, remove and resolve each.
- **FR-038**: A resolved assessment MUST stay in the file, marked as resolved, and MUST no longer count towards the icon.
- **FR-039**: An assessment whose entry no longer exists MUST be kept in the file and reported as a finding.

#### References

- **FR-040**: Typing `#` in a description MUST open a lookup of the requirements and items of the same document, narrowed by number or title as the person types.
- **FR-041**: A picked reference MUST be written in the file as a link that names the target's number, and MUST be shown in the text as a box with the target's number and current title.
- **FR-042**: Selecting a reference box MUST show its target, expanding what hides it.
- **FR-043**: The lookup MUST offer only entries of the same document, and a link that points anywhere else MUST be shown as an ordinary link.
- **FR-044**: A reference whose target no longer exists MUST be shown as broken and reported as a finding, with its text in the file kept.

#### Narrowing and sorting

- **FR-045**: The person MUST be able to narrow the page by tag, by category, by state and by item title, and a requirement that remains MUST be shown with the items that contain it.
- **FR-046**: A filter on item titles MUST accept `*` for any run of characters and `?` for one character, in any case.
- **FR-047**: The person MUST be able to sort the requirements within each item by number, title, category or state, without the order in the file changing.
- **FR-048**: The person MUST be able to store a filter with its sorting under a name, and find it under that name when the document is opened again.
- **FR-049**: Narrowing, sorting, collapsing and focusing on an item MUST NOT change the Markdown file.

#### The file under two writers

- **FR-050**: When the file changes outside the designer, the designer MUST read it again and show the change without being reopened, and entries matched by number MUST keep what was collapsed.
- **FR-051**: When the file changes outside the designer while it holds unsaved edits, the person MUST be told and MUST choose between reloading and keeping their version.
- **FR-052**: An edit made against a file that has changed since it was read MUST be refused and reported, never merged.
- **FR-053**: A bullet the designer cannot follow MUST be reported as a finding at that bullet, its bytes MUST be kept as written, and every other entry MUST stay readable and editable.
- **FR-054**: A file the designer cannot read at all MUST be shown read-only with one finding at the problem, with the last readable content when it was open and empty when it was not, and MUST NOT be written.
- **FR-055**: Text outside the bullets MUST be kept byte for byte and MUST NOT be reported.

#### The definition and the specification languages

- **FR-056**: The designer type MUST be defined in this repository completely enough that a host builds it from the definition alone: its specification, how its file is read and written, a companion document, and example documents that the Build workflow validates.
- **FR-057**: The Designer Specification Language MUST be able to state a surface of boxes that contain boxes, an identifier that is counted up per kind of entry and kept, a move of an entry to another parent, a text that names entries by their number, and what of the model is kept in the registration.
- **FR-058**: The Format Binding Language MUST be able to declare a reading of nested Markdown bullets, so that this tool type and a later one bind their Markdown without code of their own.
- **FR-059**: A registration MUST be able to hold a tool type's settings for one document, of which FR-004 lists this tool type's.
- **FR-060**: The Designer Definition Language MUST say where a definition's envelope stands in a Markdown file, in a place that neither an agent nor a Markdown viewer takes for a requirement.
- **FR-061**: Each change to a specification language MUST come as its document, its schema and worked examples together, each example valid against that schema.
- **FR-062**: The changes of FR-057 to FR-061 MUST be delivered by this feature, each language's change in a pull request of its own, before the definition that rests on it.
- **FR-063**: The designer MUST be built first in the standalone host and in no other host by this feature.

### Key Entities

- **Requirement document**: one Markdown file for one subject. It holds a legend, the hierarchy as nested bullets and a part for assessments. Its registration stands beside it.
- **Item**: one level of the hierarchy. It has a number (`ITEM-000x`), a title, an optional description and tags, and contains requirements and items.
- **Requirement**: stands in one item. It has a number (`REQ-000x`), a title that states the requirement, an optional description, tags, at most one category and at most one state.
- **Tag, category, state**: an entry of one of three lists per document. Its name is in the Markdown file wherever it is carried. Its colour and its place in the list are in the registration.
- **Assessment**: a question, remark, warning or idea about one entry, named by number. It has a kind, a text and whether it is resolved, and is written by an agent or a person.
- **Reference**: a link in a description that names one requirement or item of the same document by number.
- **Stored filter**: a named choice of tags, categories, states, an item pattern and a sorting, kept in the registration.
- **Legend**: the text at the head of a requirement document that tells an agent how the file is written.
- **Finding**: a reported problem at one place in the file, as FBL defines it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On one real requirement document, a person finds and judges the requirements of one part of the subject, and says how they fit with the rest, in less time in the designer than in the same file read as text. Both times are measured, and the text's time is the baseline that does not exist today.
- **SC-002**: At least nine in ten changes an agent makes to a requirement document over the first four weeks of real use are read without a finding and without the person repairing the file by hand.
- **SC-003**: After any move, reorder or rename, every reference and assessment names the same entry as before.
- **SC-004**: A requirement document that is opened and saved without an edit is byte for byte what it was, and an edit of one entry changes only that entry's bytes.
- **SC-005**: For every fault planted in the examples, the designer shows either one finding at one bullet with everything else editable, or a read-only page with one finding, and in neither case changes the file.
- **SC-006**: Deleting a document's registration loses no tag, category, state, reference or assessment.
- **SC-007**: A requirement document written from the companion document alone, by a person or by an agent, opens without a finding.
- **SC-008**: The example validator passes on the definition, its examples and every changed specification, and fails on each planted defect.
- **SC-009**: A requirement document of 100 items and 500 requirements opens within two seconds and shows an agent's change within two seconds.
- **SC-010**: The maintainer keeps the requirements of one real subject outside this repository in a requirement document for four weeks and prefers it to the text.
- **SC-011**: A second person, other than the maintainer, keeps the requirements of a real subject this way. This adds to success and is not a condition for it.

## Assumptions

Each is an informed default for a question the decision carried forward. Any of them can be overturned in `/speckit-clarify`.

- **One feature, against the constitution's rule of one per change to a specification.** The maintainer chose it on 2026-10-14. The plan records the departure in its complexity tracking, and still checks the Markdown family and the settings block each on its own against principle V.
- **Specifying starts now, building waits.** The maintainer started this specification before the open work on the standalone host ended. Nothing is built in that host until that work, spec 025 among it, is done.
- **The file extension is a plain `.md`.** Every agent and Markdown viewer then treats the file as Markdown. A file is a requirement document by its envelope, its first line, as a Knowledge file is one by its envelope. The registration adds what FR-004 lists and is not needed to open the file.
- **A description is written as lines under its bullet that are not bullets**, as Agent Behavior Modelling writes a node's notes.
- **Tags are written at the end of the title line**, as `#name`, as the maintainer said of the one text a bullet then had. A reference is the number in square brackets, `[REQ-0002]`, so the `#` stays the sign of a tag. In a description the `#` is the key that opens the lookup, not the notation in the file.
- **A requirement's category and state are written at the end of its title line**, as `category:name` and `state:name`. The name of a tag, a category or a state has no spaces, and names compare in any case.
- **An agent adds an entry as `ITEM-NEW` or `REQ-NEW`**, and the designer gives it its number. A bullet in the hierarchy that is neither an item nor a requirement is a finding at that bullet.
- **Requirements stand above the sub-items** of the same item.
- **Numbers are shown.** Both parties point at an entry by its number, so the person has to see it.
- **Numbers have at least four digits** and grow past `9999`. The last number given of each kind is kept on a line of the file, so that FR-012 holds without the registration.
- **The starting structure is that of a generic web application**: user interface, integration, backend, data and processes as top items. Another kind of subject starts with the same and the person changes it.
- **A tag in the file that the list lacks joins the list** with a default colour. An agent never has to touch the registration.
- **A name resolves to a tag when it equals the tag's name in any case.** A partial match narrows the list and picks nothing by itself.
- **A requirement has at most one category and at most one state**, and may have neither.
- **A thought is a remark.** The kinds are question, remark, warning and idea.
- **An agent can resolve an assessment** by marking it resolved in the file. "Acting on" an assessment is changing the entry it concerns, and needs no function of its own.
- **A reference is a plain link.** It has no kind such as "depends on" or "refines".
- **Sorting is a way of looking**, not a rewrite of the file, and is stored only with a stored filter.
- **Wildcards are `*` and `?`**, matched against item titles in any case.
- **The quick ways to add** are a control at the end of an item's content and a key from a selected entry.
- **The whole file is unreadable only when its envelope is missing or it is not valid text.** Every other fault is a finding at one bullet, and a file with no hierarchy yet is an empty document.
- **File interaction is FBL's**, as the maintainer answered: sections 7.2 to 7.5 of the FBL specification.
- **The size in SC-009 is a planning figure.** No size is on record beyond that of a new document.
- **The first subject is the maintainer's to name.** None is on record, and it is not this repository's or the standalone host's own specifications.

## Out of Scope

- Hosts other than the standalone host.
- Showing how requirements connect, beyond a reference from one to another.
- Taking the text away from the agent, or getting agents to write less of it.
- The Knowledge designer beyond its looks.
- Spec Kit's `spec.md` and spec-workflow's `requirements.md`, which are neither read nor replaced.
- References that leave the document: to an element of another tool or to a requirement in another file.
- Merging the edits of two writers.
- Rich text in a description beyond the reference box.
- The trial of the file and the layout without a tool (Option A).

## Verbatim Constraints

- `Hierarchical Requirement Designer`: the name users see.
- `ITEM-000x`: an item's number.
- `REQ-000x`: a requirement's number.
- `#`: what the person types in a description to open the lookup of requirements and items.
