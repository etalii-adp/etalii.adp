# Feature Specification: The VS Code Knowledge Designer Looks and Works as the Standalone One

**Feature Branch**: `features/079-vscode-knowledge-table-parity`

**Created**: 2026-11-21

**Status**: Draft

**Input**: Peter, 2026-11-21: "The implementation of the knowledge designer differs from the VS code one to the standalone one. A lot of aspects are not implemented or wrongly positioned. Make an inventory of the differences (the standalone version is the better one) + a correctly proposal." The inventory found 32 differences; on a decision card the same day Peter chose to close all 32, cross-file relations included. This feature covers the 29 that need no second file; [spec 080](../080-vscode-knowledge-cross-file-relations/vscode-knowledge-cross-file-relations.spec.md) covers the three that do.

## Context

The Knowledge designer (`definitions/designers/knowledge.des`, `knowledge.fbl`, `knowledge.md`) is built by two hosts. The standalone host draws it as `knowledge.md` section *Layout and behaviour* describes: Notion's table view, with views as tabs, a view bar, menus that open from the header itself, a `+` for each kind of thing that can be added, a calculation line, drag and drop, and a selection of rows that can be edited together. The VS Code host (`etalii.adp.ide.vscode`) draws the same definition as a generic table: every change is one of the definition's operations, reached through a `…` button and asked in a form, and several parts of that section are not drawn at all.

The inventory (2026-11-21, VS Code `develop` at `21e4a16`, standalone `develop` at `6da7f5a`) lists every difference by number. Its rows are the references below, so that each requirement traces to a difference seen and each difference to a requirement.

| Row | Difference, standalone first | This feature |
| --- | --- | --- |
| 1–11 | Views and the view bar: `+` tab, tab menu on press, rename in place, drag tabs, search behind a magnifier, one settings control with four editors, sort and filter items in words, filter, sort, group and property-visibility editors | FR-001 – FR-009 |
| 12–18 | Columns: no row-number column, header menu on press, the full column menu, drag to move, drag to resize, `+` after the last header, options panel | FR-010 – FR-016 |
| 20–25 | Rows and groups: `+ New` under the table and each group, row selection with a bar and bulk edit, drag a row, the row menu, nesting by parent, group heading controls | FR-017 – FR-022 |
| 26, 27, 29 | Cells: rounded option tags, a searchable list that creates options, findings on their cells | FR-023 – FR-025 |
| 30–32 | The table: calculation line, a key that adds a row, only the rows in sight drawn | FR-026 – FR-028 |
| 19, 28 | Two-way relations, relations shown by title and opened | Spec 080 |

Row 24 (nesting by the parent relation) was first counted with the cross-file rows; the parent relation is a relation to the file itself, so it belongs here.

### What this feature is not

- **Not a change to the standalone host.** It is the reference; nothing there changes.
- **Not a change to what a knowledge file holds.** Every gesture makes the model change its operation in `knowledge.des` makes today; only how the gesture is reached changes. The one exception is FR-017's amendment of `addRow`.
- **Not reading another file.** Everything here is a function of the open document's text; spec 080 is where VS Code reads a relation's target.
- **Not a new surface for other designers.** What is built is the table surface every DESL `table` tool type gets in VS Code, driven by the roles and operations its definition declares; the Knowledge designer is the one that has those roles today.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The table looks as it does in the standalone host (Priority: P1)

A person who knows the Knowledge designer from the standalone host opens `cities.yaml` in VS Code and finds the same table: the views as tabs with a `+`, the view bar with its magnifier and settings control and the sorts and filters in words, a header per column with its type's icon, no column of row numbers, rounded option tags, a `+ New` line, and a calculation line.

**Why this priority**: It is what Peter saw first: things missing or in the wrong place.

**Independent Test**: The example `cities.yaml` opened in both hosts, in the same view, and the two screenshots compared part by part against rows 1, 5, 7, 12, 13, 17, 20, 26 and 30.

**Acceptance Scenarios**:

1. **Given** `cities.yaml` open in VS Code, **When** the table is drawn, **Then** there is a `+` after the last view tab and after the last column header, and no `…` button on any tab or header.
2. **Given** a view with a sort and a filter, **When** the bar is drawn, **Then** each shows as an item in words ("Population descending", "Country is Netherlands") with an × that removes it, and no column setting shows as an item.
3. **Given** a selection column, **When** its cells are drawn, **Then** each option is a rounded tag in its option's colour.

---

### User Story 2 - Everything a column offers is in its menu (Priority: P1)

A person presses a column's header and gets its menu: rename, change type, edit options, filter, sort ascending, sort descending, group, nest rows, hide in view, wrap text, freeze up to the column, insert left, insert right, duplicate and delete. Choosing filter, sort or group applies it to that column without asking which column.

**Why this priority**: Today sorting, filtering and grouping by a column take a form reached from the view's tab, which is the largest difference in daily use.

**Independent Test**: For every entry of the standalone column menu, the same entry in VS Code's menu for the same column makes the same change to the file.

**Acceptance Scenarios**:

1. **Given** the Population column, **When** its header is pressed and "Sort descending" chosen, **Then** the view gains a descending sort on Population and the bar shows "Population descending", with no form asked.
2. **Given** the title column, **When** its menu opens, **Then** Hide in view and Delete are shown disabled with the reason "The column that names a row is always there."
3. **Given** a column whose type has no options, **When** its menu opens, **Then** it has no "Edit options".

---

### User Story 3 - A view is set up in its editors (Priority: P1)

A person opens the settings control in the view bar and chooses Property visibility, Filter, Sort or Group; the editor opens under the bar and shows the view's whole setting of that kind, to change in place.

**Why this priority**: A view's settings are the designer's reason to exist; one form per change makes them hard to read and to change.

**Independent Test**: Each of the four editors, used on the Map view of `cities.yaml`, produces the file the standalone editor produces for the same changes.

**Acceptance Scenarios**:

1. **Given** the filter editor, **When** a person adds a group under a condition and sets it to "any", **Then** the view's filter holds that group, nested, and groups deeper than three levels are not offered.
2. **Given** the group editor on a view grouped by Country, **When** a person hides Belgium with its eye and orders the groups A to Z, **Then** Belgium is no longer drawn and "Show 1 hidden group" brings it back.
3. **Given** property visibility, **When** a person unticks Founded, **Then** the column is hidden in that view only, and the title's tick cannot be cleared.

---

### User Story 4 - Rows are added, selected and changed together (Priority: P2)

A person adds a row from the `+ New` line under a group and the row lands in that group; selects rows by their checkboxes; and sets one property for all of them at once, or deletes them, from the bar that appears while rows are selected.

**Why this priority**: Adding and changing rows is frequent, but each is possible today in more steps.

**Independent Test**: In a view grouped by Country, a row added under Netherlands has Country Netherlands; three rows selected and given the tag Port all have it after one undo step.

**Acceptance Scenarios**:

1. **Given** a view grouped by Country, **When** `+ New` under the Netherlands group is pressed, **Then** the new row's Country is Netherlands and it shows in that group.
2. **Given** three selected rows, **When** "Edit a property…" is set to Visited and Check pressed, **Then** all three are checked, and one undo unchecks all three.
3. **Given** a view with a sort, **When** a row's handle is dragged, **Then** nothing moves, because a sorted view has an order of its own.

---

### User Story 5 - Things are moved by dragging (Priority: P2)

A person drags a view tab, a column header, a column's right border, a row's handle, a sort in the sort editor, a group in the group editor or an option in the options panel, and it moves or resizes where it is let go, as one undo step.

**Why this priority**: The forms do the same changes today; dragging is the faster path the definition describes.

**Independent Test**: Each drag ends in the same file as the standalone drag with the same start and end.

**Acceptance Scenarios**:

1. **Given** a column's right border, **When** it is dragged 40 pixels to the right, **Then** the column follows the pointer while dragged and one width is written when it is let go.
2. **Given** three view tabs, **When** the first is dragged past the third, **Then** it is the last view, as one undo step.

---

### User Story 6 - A large table stays responsive (Priority: P3)

A person opens a knowledge file of 10,000 rows; scrolling, selecting and editing respond without delay, because only the rows in sight are drawn.

**Why this priority**: The example files are small; the difference shows only with large files.

**Independent Test**: A generated file of 10,000 rows opened and scrolled from top to bottom, timed.

**Acceptance Scenarios**:

1. **Given** a file of 10,000 rows, **When** it opens, **Then** the table has drawn at most a few screens of rows, and the scroll bar spans all 10,000.

### Edge Cases

- A view tab's menu on the only view: Delete is disabled with "A table keeps at least one view."
- A table opened read-only (a newer DED version, an unparseable file): no `+`, no handles, no checkboxes, no editable menus; the view bar still searches.
- A name typed for a new or renamed column that the definition refuses (a duplicate): refused at the field, which stays open with what was typed.
- A row added under a group whose value the row cannot take (a filtered view): it is added with that value and stays in sight until the view is next opened.
- A drag let go where it started: nothing is written and no undo step is made.
- A column narrower than the minimum: a resize stops at the minimum.
- A finding on a cell that is not in sight: shown when the cell is scrolled into sight.

## Requirements *(mandatory)*

### Functional Requirements

Each requirement names the inventory rows it closes. "As the standalone host does" means the behaviour described in `knowledge.md` section *Layout and behaviour* as the standalone host draws it on `develop` at `6da7f5a`.

**Views and the view bar**

- **FR-001** (rows 1, 2): The view tabs **MUST** end in a `+` that adds a view. Pressing the tab of the view shown **MUST** open its menu (Rename, Duplicate, Delete, with Delete disabled on the only view); pressing another tab **MUST** show that view. No tab **SHALL** carry a separate menu button.
- **FR-002** (row 3): Renaming a view **MUST** edit its name in its tab: Enter keeps it, Escape or an empty name keeps the old one.
- **FR-003** (row 4): A view tab **MUST** be movable by dragging it among the tabs.
- **FR-004** (row 5): The search box **MUST** sit in the view bar behind a magnifier that opens it; Escape **MUST** close it and clear the search. Search **MUST** remain available on a read-only table and **MUST NOT** be stored.
- **FR-005** (row 6): The view bar **MUST** have one settings control whose menu lists Property visibility, Filter, Sort and Group, each opening its editor under the bar; one editor **MUST** be open at a time, with a control that closes it.
- **FR-006** (row 7): The bar **MUST** show each sort and each top-level filter entry of the view as an item in words, with the sort's direction or the filter's icon and an × that removes it; pressing an item **MUST** open its editor. Column settings (width, visibility, wrapping, calculation) **MUST NOT** appear as items.
- **FR-007** (row 8): The filter editor **MUST** show and edit the view's conditions and nested all/any groups to the depth `knowledge.md` allows, each condition with its property, comparison and value.
- **FR-008** (rows 9, 10): The sort editor **MUST** list the view's sorts in order, each with its direction, reorderable by dragging, with a way to add one; the group editor **MUST** offer Group by, Hide empty groups, an order of the groups by name ascending or descending, an eye per group that hides or shows it, reordering groups by dragging, and a control that shows every hidden group again.
- **FR-009** (row 11): The property-visibility editor **MUST** list every property with a tick that shows or hides it in the view; the title property's tick **MUST** stay set.

**Columns**

- **FR-010** (row 12): The table **MUST NOT** have a column of row numbers. Where rows can be moved or selected, the first column **MUST** carry each row's drag handle and selection checkbox, and its header a checkbox that selects every row.
- **FR-011** (rows 13, 14): Pressing a column's header **MUST** open its menu, grouped and ordered as the standalone column menu is: Rename, Change type, Edit options, (Edit relation, spec 080); Filter, Sort ascending, Sort descending, Group, Nest rows by this; Hide in view, Wrap text, Freeze up to column; Insert left, Insert right, Duplicate, Delete. An entry whose operation applies to the view **MUST** apply it to that column without asking which property. An entry that does not suit the column (options on a type without options, nesting on a property that cannot nest) **MUST** be left out; one that cannot run on it (hiding or deleting the title) **MUST** be shown disabled with its reason.
- **FR-012** (row 15): A column **MUST** be movable by dragging its header among the headers.
- **FR-013** (row 16): A column **MUST** be resizable by dragging its header's right border, following the pointer while dragged and writing one width when let go, never below a minimum width.
- **FR-014** (row 17): A `+` after the last header and the menu's Insert left and Insert right **MUST** open a panel that asks a new property's name and then its type, and add it there; a property added without a name **MUST** ask its name in its header at once.
- **FR-015** (row 17): Adding a property, a relation, a row and a view **MUST NOT** depend on a toolbar that shows only while nothing is selected.
- **FR-016** (row 18): Edit options **MUST** open a panel of the column's options in which each is renamed in place, recoloured, reordered by dragging and deleted, with the question `knowledge.des` asks before deleting an option that rows use.

**Rows and groups**

- **FR-017** (row 20): A `+ New` line **MUST** end the table and every group, and a row added from a group's line **MUST** get the value that puts it in that group. Because `addRow` in `knowledge.des` takes no value today, this feature **MUST** amend the definition so that it can, with its `knowledge.md` text and fixtures, and the standalone host's copy refreshed.
- **FR-018** (row 21): Rows **MUST** be selectable by their checkboxes, singly and all at once. While rows are selected a bar **MUST** say how many, and offer to set one property for all of them (one undo step), to delete them, and to clear the selection.
- **FR-019** (row 22): A row **MUST** be movable by dragging its handle, except in a view with a sort, where the handle **MUST NOT** move it.
- **FR-020** (row 23): A row's context menu **MUST** offer what the standalone row menu offers (Delete row, or Delete N rows for a selection), and **MUST NOT** list the per-value setters of the definition (Set text, Set number and the like), which are reached by editing a cell.
- **FR-021** (row 24): A view grouped by the parent relation **MUST** nest rows under their parents to any depth, each parent with a fold toggle in its title cell; the fold **MUST** be stored with the view.
- **FR-022** (row 25): A group heading **MUST** carry a fold toggle, its label (as a tag when the group is an option), its count, and controls that move the group up, move it down and hide it.

**Cells**

- **FR-023** (row 26): Option values **MUST** be drawn as rounded tags in their option's colour, in a light and a dark theme, and with a border in high contrast.
- **FR-024** (row 27): A selection or multiple-selection cell **MUST** open a list of its options with a search field that has the focus; typing a name that is no option and confirming **MUST** create that option and choose it, in one undo step.
- **FR-025** (row 29): A cell that a finding is about **MUST** show it: marked by the most serious finding's severity, with the findings' messages on hover and to assistive technology.

**The table**

- **FR-026** (row 30): Where a column can be given a calculation, a calculation line **MUST** be under the rows; each column's place **MUST** show its calculation and value, or offer "Calculate", and pressing it **MUST** list None and the calculations its type has.
- **FR-027** (row 31): Shift+Enter in a cell that is not being edited **MUST** add a row under that cell's row, as the standalone keyboard does.
- **FR-028** (row 32): The table **MUST** draw only the rows in or near sight; the scroll bar **MUST** span every row, and the grid's row count to assistive technology **MUST** be the view's whole count.

**Throughout**

- **FR-029**: Every gesture above **MUST** be one edit of the text document and one step of VS Code's undo, as every edit of a designer in VS Code is today, and a refused gesture **MUST** change nothing and show its reason.
- **FR-030**: Every control above **MUST** be reachable by the keyboard and named to assistive technology; every drag **MUST** have a keyboard or menu path to the same change.
- **FR-031**: A read-only table **MUST** offer none of the controls that edit.
- **FR-032**: VS Code's records of where it differs (`docs/disl-support.md`, `docs/parity.md`) **MUST** lose each row this feature closes, in the change that closes it, and `docs/screenshots/knowledge.png` **MUST** be retaken.

### Key Entities

- **Table surface**: the drawing of a DESL `table` tool type in VS Code: view tabs, view bar, headers, rows, group headings, calculation line.
- **View settings**: what a view stores (columns, sorts, filter, grouping, freeze, calculations), changed through the bar, its editors and the column menu.
- **Row selection**: the rows chosen by their checkboxes, never stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Of the 29 inventory rows this feature owns, 29 are closed: a side-by-side check of `cities.yaml` in both hosts finds none of them again.
- **SC-002**: Sorting, filtering or grouping by a column takes at most two presses from its header (header, entry), against at least four today (tab menu, entry, property, confirm).
- **SC-003**: A knowledge file of 10,000 rows opens and scrolls from top to bottom in VS Code with no frame taking longer than 100 ms while scrolling.
- **SC-004**: For each gesture in FR-001 – FR-027, the file written by VS Code equals the file written by the standalone host for the same gesture on the same file, byte for byte, apart from new ids.
- **SC-005**: No part of the table surface that is shared by every DESL table names a tool type, an element type or an attribute of the Knowledge designer, as VS Code's existing word check holds.

## Assumptions

- The standalone host on `develop` at `6da7f5a` is the reference; where it and `knowledge.md` disagree, the definition wins and the difference is raised in etalii.adp, as VS Code's rules require.
- The inventory's row numbers are stable references; the inventory is Peter's 2026-11-21 Claude Doc "Knowledge designer: VS Code vs standalone".
- The work lands in `etalii.adp.ide.vscode` in several pull requests, plus one in etalii.adp for FR-017's amendment and one in `etalii.adp.ide.standalone` to refresh its copy of the definition.
