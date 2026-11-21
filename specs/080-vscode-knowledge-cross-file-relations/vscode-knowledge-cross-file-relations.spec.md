# Feature Specification: The VS Code Knowledge Designer Follows Relations into Other Files

**Feature Branch**: `features/080-vscode-knowledge-cross-file-relations`

**Created**: 2026-11-21

**Status**: Draft

**Input**: Peter, 2026-11-21, on a decision card about bringing the VS Code Knowledge designer in line with the standalone one: "All 32, incl. cross-file". The inventory of that day found 32 differences; [spec 079](../079-vscode-knowledge-table-parity/vscode-knowledge-table-parity.spec.md) covers the 29 that need nothing outside the open document, and this feature the ones that need a relation's target file: rows 19 (the two-way relation and the delete that asks about its other side) and 28 (related rows shown by title, opened, and picked from a list).

## Context

`knowledge.md` section *Relations and the steps that write two files* says that a relation names its target file by a path relative to its own file, that the designer resolves a row id of that file, reads the target read-only for titles and watches it, and that a two-way relation keeps a computed counterpart in the target. It requires every host to make each step that changes two files one undoable step: plan both edits, write neither when either is refused, write both, and undo both together.

The standalone host does all of that. The VS Code host reads only the open document, by a rule of its own recorded in `docs/disl-support.md` ("a tool type here is a function of one document's text"), and so:

| What | Standalone host | VS Code today |
| --- | --- | --- |
| A related row in a cell | Its title, as a link that opens the row in its file | The id the file holds, with an × |
| Adding a related row | A searchable list of the target's rows | Typing the row's id |
| A relation limited to one row | Choosing a second replaces the first | A second is added and `knowledge.relation-over-limit` reported |
| `knowledge.unresolved-target`, `knowledge.unresolved-row` | Raised | Not raised |
| A new relation | Name, then target (knowledge files only, this file first), limit, and optionally a counterpart on the target with its name | A form; no counterpart written |
| Deleting one side of a two-way relation | Asks: delete the other side too, or keep it one-way | Nothing to ask: no counterpart exists |
| Deleting rows that other files relate to | Says how many first | Not known |
| Renaming or moving a target file | Rewrites `target` in every file that names it | Not done |

Peter's choice changes the VS Code rule: a Knowledge designer's relation may read and, for the steps `knowledge.md` names, write its target file.

### What this feature is not

- **Not a change to the Knowledge designer's definition** of relations: `knowledge.md` already says all of the above; this feature makes VS Code do it.
- **Not a general multi-file model for every tool type.** Only a relation of a DESL table, as `knowledge.md` defines it, reads or writes a second file.
- **Not the layout of spec 079.** The column menu entry "Edit relation" sits where spec 079 puts the column menu.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A related row is seen and opened by its title (Priority: P1)

A person opens `cities.yaml`; the Province column shows "Noord-Holland", not `nh`. Pressing it opens `provinces.yaml` in the Knowledge designer with that row selected.

**Why this priority**: An id means nothing to a reader; it is the most visible part of the gap.

**Independent Test**: The relations example opened in VS Code shows every related row by its title, and pressing one opens and selects it.

**Acceptance Scenarios**:

1. **Given** a relation to another knowledge file, **When** the table is drawn, **Then** each related row shows the target row's title as a link.
2. **Given** that link, **When** it is pressed, **Then** the target file opens in the Knowledge designer (or comes to the front, when open) with that row selected.
3. **Given** a relation to the file itself, **When** a link is pressed, **Then** that row is selected in the same table.
4. **Given** the target file changes on disk or in another editor, **When** the change lands, **Then** the titles follow without reopening.

---

### User Story 2 - A related row is picked from a list (Priority: P1)

A person edits a relation cell and gets a list of the target's rows by title with a search field; choosing one adds it, and on a relation limited to one row, replaces the one there.

**Why this priority**: Typing an id is the only way today and needs the person to know it.

**Independent Test**: In `cities.yaml`, Province set to "Limburg" for Venlo by search and choice writes Limburg's id.

**Acceptance Scenarios**:

1. **Given** a relation cell, **When** its editor opens, **Then** it lists the target's rows by title with a search field that has the focus.
2. **Given** a relation limited to one row with a value, **When** another row is chosen, **Then** it replaces the value, as one undo step.

---

### User Story 3 - A two-way relation is created and deleted as one step (Priority: P1)

A person adds a relation to `provinces.yaml`, asks for it to show on the target too and names that side "Cities"; both files change. Undo takes both changes back. Deleting the relation later asks whether "Cities" goes too or stays as a one-way relation.

**Why this priority**: It is the half of a relation VS Code cannot do at all today, and the two-file step is a MUST of the definition.

**Independent Test**: The two-way creation, its undo, its redo and both delete choices, each compared with the files the standalone host writes.

**Acceptance Scenarios**:

1. **Given** the new-property panel with Relation chosen, **When** a target is chosen, it offers only knowledge files, this file first, then a limit of one row or none, and a counterpart with its name.
2. **Given** a two-way relation created, **When** undo runs once, **Then** both files are as they were before, byte for byte.
3. **Given** either file refuses its edit, **When** the creation is asked, **Then** neither file changes and the reason is shown.
4. **Given** a two-way relation, **When** Delete is chosen in its column menu, **Then** the menu asks between deleting the other side too and keeping it as a one-way relation, and does what is chosen as one step over both files.

---

### User Story 4 - Broken and moving targets are handled (Priority: P2)

A person whose relation names a file that is gone sees the finding; one who renames `provinces.yaml` in VS Code's Explorer finds `cities.yaml` still related to it; one who deletes a province that cities point at is told how many first.

**Why this priority**: These protect the data but happen less often than reading and editing.

**Independent Test**: The three cases on the relations example, compared with the standalone host's findings and files.

**Acceptance Scenarios**:

1. **Given** a relation whose target is missing, unreadable or not a knowledge file, **When** the table opens, **Then** `knowledge.unresolved-target` is reported on the property and its values are kept.
2. **Given** a value naming a row the target does not hold, **When** the table opens, **Then** `knowledge.unresolved-row` is reported on that cell and the value is kept.
3. **Given** a target file renamed or moved in VS Code, **When** the move completes, **Then** every knowledge file in the workspace that names it has its `target` rewritten.
4. **Given** rows that rows of other files relate to, **When** they are deleted, **Then** the person is told how many relate to them before anything is deleted; the values that named them stay and become unresolved.

### Edge Cases

- A target that is the open file itself (`.`): titles come from the open document, with no second file read.
- A target outside the workspace or in an untrusted workspace: read-only titles only where VS Code allows reading it; never written; the reason is shown.
- A target open with unsaved changes in another editor: titles come from the open, unsaved text, and a two-file step edits that open text.
- A two-file step undone after one of the two files was changed by hand: the undo is refused for both rather than applied to one, and the reason is shown.
- A counterpart whose first side is gone: shown as a computed property with no values, and reported.
- A target file that is very large: titles are read once and kept until it changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** (row 28): A relation cell **MUST** show each related row by its title in the target file, as a link; a value the target does not resolve **MUST** show its id.
- **FR-002** (row 28): Pressing a related row **MUST** open its file in the Knowledge designer, or bring it forward when open, and select that row; a row of the same file **MUST** be selected in place.
- **FR-003** (row 28): Editing a relation cell **MUST** open a searchable list of the target's rows by title. On a relation limited to one row, choosing **MUST** replace the value.
- **FR-004**: The host **MUST** read each relation's target read-only and follow its changes, from disk and from an editor that has it open, without the table being reopened.
- **FR-005**: The host **MUST** raise `knowledge.unresolved-target` and `knowledge.unresolved-row` where `knowledge.md` says, and **MUST NOT** remove a value because it is unresolved.
- **FR-006** (row 19): Adding a relation **MUST** ask, in order, its target (knowledge files only, this file first), a limit of one row or none, and whether the target shows it too and under which name; nothing **MUST** be written before it is confirmed.
- **FR-007** (row 19): Creating a two-way relation **MUST** add the property with its `counterpart` here and the computed counterpart in the target, as one step: both edits planned first, neither written if either is refused, and one undo and one redo that restore both files.
- **FR-008** (row 19): Deleting one side of a two-way relation **MUST** ask whether to delete the other side too or keep it as a one-way relation, and do the choice as one step over both files.
- **FR-009**: Deleting rows that rows of other files relate to **MUST** first say how many relate to them, and go ahead only when confirmed.
- **FR-010**: Renaming or moving a knowledge file within the workspace **MUST** rewrite `target` in every knowledge file of the workspace that names it, as one step with the move.
- **FR-011**: The column menu's "Edit relation" (spec 079, FR-011) **MUST** show the target and let the limit and the other side be changed, each as a step under FR-007's rule when it changes the target.
- **FR-012**: VS Code's rule that a tool type is a function of one document's text, in `docs/disl-support.md`, **MUST** be restated with this exception, and the rows of `docs/disl-support.md` and `docs/parity.md` that this feature closes **MUST** be removed in the change that closes them.

### Key Entities

- **Relation**: a property of type relation, with `target`, `limit` and, when two-way, `counterpart`.
- **Target file**: the knowledge file a relation names, read for titles and rows and written only by the steps of FR-007, FR-008 and FR-010.
- **Two-file step**: one change that edits two documents, undone and redone as one.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In the relations example, every related row that the target holds is shown by its title, and none by its id.
- **SC-002**: For each step of FR-007, FR-008 and FR-010, the two files VS Code writes equal those the standalone host writes for the same step, byte for byte apart from new ids, and one undo returns both to their bytes before the step.
- **SC-003**: Opening a related row takes one press from the cell.
- **SC-004**: Inventory rows 19 and 28 are closed: a side-by-side check of the relations example in both hosts finds neither again.

## Assumptions

- VS Code's own undo for an edit that spans two documents is acceptable as "one undoable step" when one Undo in the designer restores both; the plan decides how.
- Only files inside the workspace folders are written; a target outside them is read where possible and never written.
- The standalone host on `develop` at `6da7f5a` is the reference for the panel's order and wording.
