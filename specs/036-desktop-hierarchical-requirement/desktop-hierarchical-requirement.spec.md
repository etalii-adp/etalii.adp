# Feature Specification: The Hierarchical Requirement Designer in the Desktop Host

**Feature Branch**: in `etalii.adp`, `features/036-desktop-hierarchical-requirement`; in `etalii.adp.ide.desktop`, one branch of this name per pull request, as the plan cuts them

**Created**: 2026-10-24

**Status**: Planned (2026-10-25): the maintainer approved the specification ("Approve, plan and tasks next"), and the plan and [tasks.md](tasks.md) are written. Building waits for the maintainer's word.

**Input**: The maintainer's request of 2026-10-24: "make sure that the improvements on the standalone hierarchical requirement designer are also replicated to the standalone host", confirmed the same evening to mean the desktop host. Asked how the designer should reach the desktop host, which does not have it yet, the maintainer chose "Spec Kit spec for the port".

## Context

**What exists.** Spec [028](../028-hierarchical-requirement-designer/hierarchical-requirement-designer.spec.md) defined the Hierarchical Requirement Designer (`etalii/hierarchical-requirement`) under `definitions/designers/`: its specification in DESL 0.2, its binding in FBL 0.7's `bullets` family, its companion and its examples. Spec [029](../029-standalone-hierarchical-requirement-designer/standalone-hierarchical-requirement-designer.spec.md) built it in the standalone host, and it is complete (113 of 113 tasks). On 2026-10-24 the maintainer's feedback on it (029's T113) changed the designer in the standalone host and, through etalii.adp pull request 508, its definition:

- standalone pull request 695: the box, the notes (assessments) list, editing in place, adding and deleting, the labels, the list editor, the trail and the filter's completion;
- standalone pull request 696: column widths dragged by the person and kept in the registration, and `@` for a state in the filter;
- standalone pull requests 700 and 702: one list of icons per box, a row beside the title when it fits and a column otherwise, the title wrapping under the drag handle, one spacing, and a box whose height does not change when it is selected or edited;
- standalone pull request 705: a 12px left margin for the tags, the description, its edit box and a wrapped title's later lines, and 12px below the description and its edit box;
- standalone pull request 707: the field for typing a new or renamed title is one line high and starts after the item's or requirement's number.

**What the desktop host lacks.** Spec [030](../030-desktop-native-rust/desktop-native-rust.spec.md) built the desktop host at parity with the standalone host at its reference commit `8b6ccfc`, which is older than spec 029. So the desktop host has no Hierarchical Requirement Designer at all: its catalogue keeps `etalii/hierarchical-requirement` apart as a specification the standalone host did not list, it has no `hierarchy` surface, it reads no `bullets` family and no registration blocks, and its conformance run sets the 29 fixtures of those aside as not supported. Its copy of etalii.adp predates pull request 508, so it lacks the `widths` block and `@`. Spec 030 says that a feature added to the standalone host after its reference commit reaches the desktop host through a feature of its own; this is that feature.

**What this feature adds.** The designer in the desktop host, at parity with the standalone host as it is after the T113 feedback: the same page, the same gestures and the same bytes on disk, in the desktop host's native frame and VS Code's looks.

**Words.** Those of spec 028 and spec 029: a **subject**, an **item**, a **requirement**, an **assessment**, a **requirement document**, a **person**, an **agent**, a **conformance run**. **Parity**, the **parity inventory** and a **golden** are spec 030's. The **reference commit** of this feature is the standalone host's `develop` commit the plan names; it includes standalone pull request 707. Other words are those of [docs/terminology.md](../../docs/terminology.md).

## User Scenarios & Testing *(mandatory)*

Spec 029's user stories describe the designer in the standalone host. Each story below is one of them in the desktop host; "029's Story N" is to be passed in the desktop host as spec 029 states it, and the result on disk is the standalone host's.

### User Story 1 - Open an agent's requirement document and read it by its structure (Priority: P1)

A person opens a Markdown file an agent wrote, with the designer's envelope on its first line, in the desktop host. It opens in the designer, with no registration beside it, as one page of boxes they read, collapse and focus.

**Why this priority**: it is the slice that gives value alone, and it needs the parts every other story rests on: recognising the document, reading the `bullets` family and drawing the `hierarchy` surface.

**Independent Test**: open the web shop example and a hand-written document three levels deep beside an ordinary Markdown file, and pass 029's Story 1.

**Acceptance Scenarios**:

1. 029's Story 1, scenarios 1 to 5, in the desktop host.
2. **Given** the add dialog's catalogue, **When** the person looks for the designer, **Then** it is listed under the name `Hierarchical Requirement Designer` where the standalone host lists it, and no longer kept apart.
3. **Given** the same document opened in the standalone host and in the desktop host, **When** both show it at the same width, **Then** they show the same entries, levels, numbers, tags, collapsed state and findings.

---

### User Story 2 - A person and an agent work on the same file (Priority: P1)

The person keeps the document open while an agent edits the file. The designer shows each change, keeps what was collapsed, refuses an edit made against a changed file, and says when undo stops at the agent's write.

**Why this priority**: without it the designer is a viewer of a file only one party can keep.

**Independent Test**: pass 029's Story 2 with the file changed by a text editor beside the desktop host.

**Acceptance Scenarios**:

1. 029's Story 2, scenarios 1 to 3, in the desktop host.

---

### User Story 3 - The desktop host passes the designer's conformance run (Priority: P1)

A developer runs the desktop host's conformance run. The fixtures it sets aside today for the `bullets` family, the registration blocks and the designer pass, and every edit of the designer writes the bytes the standalone host writes.

**Why this priority**: the fixtures and the goldens are the contract of every byte the desktop host writes (desktop Principle II).

**Independent Test**: run the conformance run with no fixture of `bullets-read`, `bullets-edits`, `behavior-tree-read`, `registration-blocks` or `hierarchical-requirement-*` set aside; plant a wrong byte in one expected result and see it fail there; replay the designer's edit scripts against the goldens recorded from the standalone host.

**Acceptance Scenarios**:

1. 029's Story 3, scenarios 1 to 3, in the desktop host.
2. **Given** an edit script of the designer recorded in the standalone host at the reference commit, **When** the desktop host replays it, **Then** the files it writes equal the golden byte for byte.

---

### User Story 4 - Start a document and shape the hierarchy (Priority: P2)

The person creates a requirement document from the template, adds entries without a dialog, drags an item with everything in it, and deletes what does not apply.

**Why this priority**: as in spec 029.

**Independent Test**: pass 029's Story 4 and compare the created file with the binding's template.

**Acceptance Scenarios**:

1. 029's Story 4, scenarios 1 to 3, in the desktop host.
2. **Given** an item dragged by its handle, **When** the pointer moves, **Then** the page shows where the item lands before it is dropped.

---

### User Story 5 - Questions, remarks and warnings stay with what they concern (Priority: P2)

The person sees the assessment icon of an entry, opens the list of its notes, and adds, changes, removes and resolves each.

**Why this priority**: as in spec 029.

**Independent Test**: pass 029's Story 5, and compare the notes list with the standalone host's after pull request 695.

**Acceptance Scenarios**:

1. 029's Story 5, scenarios 1 and 2, in the desktop host.
2. **Given** an open notes list, **When** it is shown, **Then** it stands over every pane rather than being cut off by the page, each kind has its icon in the kind's list, the text field is three lines high with an Add button below it on the right, and resolve, change and remove are icons with a tooltip, beside a note of several lines and below a note of one line.

---

### User Story 6 - Refer, tag, categorise, set a state, narrow and sort (Priority: P2)

The person refers to another entry with `#`, tags entries, sets a requirement's category and state, edits the lists of tags, categories and states, narrows the page and sorts it, and stores a filter.

**Why this priority**: 029's Stories 6, 7 and 8 together; each needs the page of Story 1 and nothing of the others.

**Independent Test**: pass 029's Stories 6, 7 and 8, and the filter with `@` and its completion.

**Acceptance Scenarios**:

1. 029's Stories 6, 7 and 8, every scenario, in the desktop host.
2. **Given** the filter field, **When** the person types part of a word, **Then** a list completes it from the labels' members, the label prefixes, `item:`, `sort:` and the sort keys; Tab or Enter takes the marked word, the arrow keys move the mark and Escape closes the list.
3. **Given** the filter `@proposed`, **When** it is applied, **Then** only requirements whose state is `proposed` remain, with the items that contain them.
4. **Given** a tag, a category and a state on one entry, **When** it is shown, **Then** the three look different: a tag with `#`, a category as a badge and a state as a dot.

---

### User Story 7 - The page as the maintainer shaped it (Priority: P2)

The person reads and edits boxes laid out as the standalone host lays them out after the maintainer's feedback of 2026-10-24: resizable columns kept in the registration, one icon list per box, the title wrapping under the handle, the margins of pull request 705, and a box whose height does not change when it is selected or edited.

**Why this priority**: it is what the maintainer asked for. It needs Stories 1 and 4 and is the last layer on them.

**Independent Test**: open the web shop example in both hosts at the same width and theme, compare each point below in screenshots, and drag a column's edge in the desktop host and compare the `.adp` with the standalone host's after the same drag.

**Acceptance Scenarios**:

1. **Given** a column of items, **When** the person drags its right edge, **Then** every box of that depth follows the pointer, and letting go is one step of undo that writes the column's width in the registration's `widths` block as the standalone host writes it.
2. **Given** a column with a width, **When** the person double-clicks its edge or presses Home on it, **Then** the column takes the page's own width again and the width is removed from the registration; the arrow keys move a focused edge by 16 pixels; a refused gesture puts the column back.
3. **Given** a registration whose `widths` block names a width outside 120 to 2000 or not a number, **When** the document opens, **Then** that column keeps the page's own width.
4. **Given** a box, **When** it is shown, **Then** its controls are one list with the assessment icon first, then "n more levels", focus, add tag and add description; they stand in a row at the end of the title, right to left, when the whole first line and every icon fit, and otherwise in a column at the box's right, top down, beside the title, the tags and the description.
5. **Given** a long title, **When** it wraps, **Then** the drag handle, the collapse control and the number stand on its first line like words, the collapse control, number, title and icons are aligned to the top, and the later lines start 12 pixels from the box's left edge while the handle keeps 6.
6. **Given** a box, **When** it is shown, **Then** its padding is 6 pixels on every side and between the text and the icons, its tags, categories, states and description start 12 pixels from its left edge, and 12 pixels stand below the description.
7. **Given** a box that can be deleted, **When** it is selected and then opened for editing, **Then** its height is the same in all three states: a slot for the delete icon at the bottom of the right column, 6 pixels from the bottom, is kept on every deletable box and filled on the selected one, and the description's edit box stands where the text stood, as high as it, with the same margins, ending short of the icons.
8. **Given** the controls of a box, **When** the pointer is not over it, **Then** the focus control and the other hover controls are hidden; add item and add requirement are icons; "n more levels" works at every level.
9. **Given** the trail, **When** the person selects an entry, **Then** the trail is shown, follows the selection and names items only.
10. **Given** a new item or requirement, **When** it is added, **Then** it is revealed and selected.
11. **Given** an entry whose title is being typed, after adding it or to rename it, **When** the field is shown, **Then** it is one line high and starts after the entry's number, on the title's own line.

---

### Edge Cases

- A requirement document is also registered as an Agent Behavior Modelling document: the envelope decides, as in spec 029.
- The registration is deleted while the document is open: the designer goes on with default colours, order and widths, and creates a new registration with the next setting.
- A column's width is set while an agent writes the registration: the gesture is refused as an edit against a changed file, and the column is put back.
- The window is narrower than one column: one level is shown, and the rest are marked as levels that do not fit.
- A box's first line fits the icons at one width and not at another: the choice between row and column follows the width, without a gesture.
- The NIST SP 800-53 example (2,616 entries): it opens within the standalone host's limit for it.

## Requirements *(mandatory)*

Each requirement names what it carries: a requirement of spec 029 as "029: FR-0xx", or a standalone pull request of the T113 feedback as "standalone #NNN".

### Functional Requirements

#### The designer as spec 029 states it

- **FR-001**: The desktop host **MUST** meet spec 029's FR-001 to FR-032, with "the host" read as the desktop host and "the Knowledge designer's looks" as the desktop host's Knowledge designer in VS Code's themes (desktop FR-044).
- **FR-002**: The desktop host **MUST** list `etalii/hierarchical-requirement` in its catalogue under the name, vendor and state the standalone host gives it at the reference commit, and **MUST NOT** keep it apart as unlisted (029: FR-001).
- **FR-003**: The desktop host's copy of etalii.adp **MUST** be refreshed to a commit that includes etalii.adp pull request 508, so that the designer reads the definition with the `widths` block and `@`.

#### The maintainer's feedback of 2026-10-24

- **FR-004**: The desktop host **MUST** keep column widths as standalone #696 does: dragged per depth, stored in the registration's `widths` block, read only within 120 to 2000, reset by a double click or Home, moved by the arrow keys in steps of 16 pixels, one step of undo per gesture, and put back when refused; the number of levels that fit **MUST** count these widths.
- **FR-005**: The filter **MUST** take `@` as the prefix of a state and **MUST** offer the completion of standalone #695, with its keys.
- **FR-006**: A box **MUST** lay out its icons, title, tags and description as standalone #700, #702, #705 and #707 do: one icon list in the order of User Story 7 scenario 4, a row or a column chosen per box by its width, the title wrapping under the handle, the paddings and margins of User Story 7 scenarios 5 and 6, a title field of one line after the number, and a height that does not change when it is selected or edited.
- **FR-007**: The notes list, editing in place, the drop preview, the labels, the list editor and the trail **MUST** behave and look as standalone #695 makes them, as User Stories 4, 5, 6 and 7 state.
- **FR-008**: Where the desktop host's VS Code looks (desktop FR-044) and a size of this feedback differ, the sizes of User Story 7 **MUST** stand, since the maintainer gave them as numbers; colours stay VS Code's.

#### Parity

- **FR-009**: Every behaviour of this feature **MUST** be a row of the desktop host's parity inventory, with the tests that show it, and every edit of the designer **MUST** have an edit script whose result equals a golden recorded from the standalone host at the reference commit (desktop Principle IV).
- **FR-010**: The desktop host's conformance run **MUST** no longer set aside the fixtures of `bullets-read`, `bullets-edits`, `behavior-tree-read`, `registration-blocks` and `hierarchical-requirement-*`, and **MUST** pass them (029: FR-029).
- **FR-011**: Every interactive part of the designer **MUST** be exposed to the platform's accessibility interface with its role, name and state, a column's edge included (desktop Principle I).
- **FR-012**: The `hierarchy` surface **MUST** be the desktop host's shared work, so that a later designer type of that kind needs no surface code of its own (029: FR-032; desktop Principle III).

### Key Entities

As in spec 029, with two of this feature's own:

- **Reference commit**: the standalone host's `develop` commit this feature is at parity with, including standalone #707.
- **Column width**: a width the person gave the items of one depth, kept in the registration's `widths` block.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every scenario of spec 029's eight user stories passes in the desktop host.
- **SC-002**: The desktop host's conformance run sets aside no fixture of `bullets-read`, `bullets-edits`, `behavior-tree-read`, `registration-blocks` or `hierarchical-requirement-*`, passes all of them, and fails on a planted defect.
- **SC-003**: Every edit script of the designer recorded from the standalone host at the reference commit writes the same bytes in the desktop host.
- **SC-004**: On the web shop example at the same width and theme, a side-by-side comparison of the two hosts finds each of the eleven points of User Story 7 the same, the sizes within one pixel.
- **SC-005**: A requirement document of 100 items and 500 requirements opens within two seconds and shows an agent's change within two seconds (029: SC-003).
- **SC-006**: The maintainer, given the same document in both hosts, finds no difference in what they can do in the designer.

## Assumptions

- **The definition files win**, as in spec 029: where this specification and `definitions/designers/hierarchical-requirement.*` disagree, the definition wins and this specification is amended.
- **The reference commit is the plan's to name**, at or after the merge of standalone #707. A change to the standalone designer after it reaches the desktop host by a feature of its own, as spec 030 says.
- **The module is written from the definition**, as the desktop host's Knowledge designer was. Reading tool types from ATD tool descriptions (spec 035) is not part of this feature.
- **The `bullets` family is built as the standalone host built it**, so the Agent Behavior Modelling plugin stays as it is, as in spec 029.
- **SC-001, SC-002 and SC-004 of spec 029** (the timed readings and four weeks of real use) were measured in the standalone host and resolved by the maintainer's feedback; they are not measured again here.
- **The NIST SP 800-53 example** is held to the standalone host's 4-second guard; screenshots come from the web shop example, never from NIST (the maintainer, 2026-10-24).

## Out of Scope

- Hosts other than the desktop host.
- Changes to DESL, DED, FBL or the definition. What the work finds wrong in them comes back to etalii.adp as a feature of its own.
- Standalone host changes; a difference found between the two hosts is recorded in the parity inventory or raised as a change, never settled here.
- Agent Behavior Modelling's move onto the `bullets` family.
- Merging the edits of two writers, and references that leave the document (029: Out of Scope).

## Verbatim Constraints

- `Hierarchical Requirement Designer`: the name users see.
- `ITEM-000x`, `REQ-000x`: the numbers of an item and a requirement.
- `#`: what the person types in a description to open the lookup.
- `@`: the filter's prefix for a state.
- 6 pixels: a box's padding; 12 pixels: the left margin of the tags, the description, its edit box and a wrapped title's later lines, and the space below the description; 16 pixels: an arrow key's step on a column's edge; 120 to 2000: the widths a column may keep.
