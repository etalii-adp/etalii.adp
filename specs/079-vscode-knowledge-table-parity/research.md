# Research: The VS Code Knowledge Designer Looks and Works as the Standalone One

**Feature**: [vscode-knowledge-table-parity.spec.md](vscode-knowledge-table-parity.spec.md) | **Date**: 2026-11-21 | **Read at**: `etalii.adp.ide.vscode` `develop` `21e4a16`, `etalii.adp.ide.standalone` `develop` `6da7f5a`, `knowledge.des` as vendored in VS Code (`definitions/knowledge/`, etalii.adp `5062bde`)

## R1. Where a gesture's operation comes from

**Decision**: A table gesture of the standalone kind (hide a column, sort it descending, freeze up to it, add a row in a group, and so on) is named by the table surface in its own words, and a tool type's plugin says which operation of its definition, with which arguments, carries it out. The Knowledge designer's plugin, `src/core/plugins/knowledge-views/`, which already carries what a view shows, gains that table. The core turns a gesture into operations and runs them; the webview asks for gestures and never names an operation of a tool type.

**Rationale**: `knowledge.md` section *Gestures and operations* gives the mapping in prose and says that the gesture that starts each operation is the host's; DESL 0.1 cannot state it (issue 162). VS Code's rule is that code for one tool type is a plugin its definition reaches, and that nothing under `src/core/tool/` names a tool type's element types, attributes or operations; `test/core/tool/words.test.ts` holds that. Gesture names such as `hideColumn` or `sortColumn` are the table surface's vocabulary, as Notion's table has them, not a tool type's.

**Alternatives considered**: (a) Offer in a column's menu every View operation that takes a property, pre-filled. It needs no plugin and covers Filter, Sort, Group, Freeze and Calculate, but not Hide or Wrap, which `setColumn` sets together with width, nor Sort ascending and descending as two entries, so the menu would still differ from the standalone one. (b) Amend `knowledge.des` so DESL states gestures. That is issue 162's work and blocks this feature on a language change.

## R2. One gesture, one undo step, when it is several operations

**Decision**: The core accepts a request of several steps, each an operation, a cell or an item, run one after the other on the model, written as one edit. A later step may name an element an earlier one created (`$created:0`, the first element step 0 created). The webview sends such a request for a new option chosen in a cell (`addOption`, then `setOption` or `addItem`), a row added in a group (`addRow`, then the value of the group), an edit of several selected rows, the move of several rows, and groups put in name order.

**Rationale**: `toolTypeFrom.ts` already chains outcomes this way for a multi-valued field of ADP Properties (`setField`), writing their changes once, so the undo step is one. `knowledge.des` says of `addRow` that "in a group, the host also sets the value that puts the row there, in the same step", and of `addOption` that it is "also what typing a new name in a selection cell does, before the value is set": both ask the host to compose.

**Alternatives considered**: One request kind per composite gesture; more code for the same result and a new kind with each gesture.

## R3. Spec 079 FR-017's amendment is not needed

**Finding**: FR-017 says `addRow` takes no value and that the definition must be amended so it can. The definition does not need it: `addRow`'s `doc` already gives the host the step of setting the group's value, in the same step, and R2 lets VS Code do so. The standalone host does the same without the operation carrying the value.

**Decision**: Build FR-017 with R2 and ask Peter, as a small amendment (CLAUDE.md, *Specification bookkeeping*), to drop the sentence that asks for the amendment. Task T010 waits on that answer and does nothing if the sentence is dropped.

## R4. Confirmations

**Decision**: Questions are the platform's dialogs, as they are today in VS Code (principle I, *confirmations MUST be the platform's dialogs*): the question before a row delete, before deleting an option rows use, and before deleting a property with values. The standalone host's inline "Delete / Keep" bar is not copied.

**Rationale**: The principle is non-negotiable; `docs/parity.md` already lists the native dialogs Peter saw on 2026-10-13. The wording and the moment of asking are the standalone host's, which is what a user notices.

## R5. Drawing only the rows in sight

**Decision**: The view message keeps every row the view shows, as today; the webview draws the rows in sight and a margin, between two spacers, with one row height, as the standalone `rows/windowing.ts` does. Nested and grouped rows are flattened into lines first, so a heading, a row and a `+ New` line each take one line.

**Rationale**: A view of 10,000 rows is a few megabytes of JSON, which a webview receives in well under SC-003's 100 ms per frame budget when it does not also lay out 10,000 table rows. Windowing the message as well would make every scroll a round trip through the extension, for a cost nobody has measured as a problem. T047 measures it, and the decision is revisited only if SC-003 fails.

## R6. Findings on cells

**Decision**: The view of a table carries the findings of the document by the element they are about (a cell's element id, or its row and property), with their severity and message; the webview marks the cell and gives the messages as its title and `aria-description`. The Problems panel keeps them as today.

**Rationale**: The frame already computes findings with element ids for the Problems panel (`ToolType.findings`); carrying them in the view costs one pass and no second computation.

## R7. What each view editor edits through

| Editor or control | Operations (`knowledge.des`), reached through R1's gestures |
| --- | --- |
| View tabs | `addView`, `renameView`, `duplicateView`, `deleteView`, `moveView`, `switchView` (`show` request) |
| Property visibility, hide, wrap, resize | `setColumn` with the column's other two settings as they are, `resetColumn` |
| Sort editor and items | `addSort`, `setSortDirection`, `moveSort`, `removeSort` |
| Filter editor and items | `addCondition`, `setCondition`, `removeCondition`, `addFilterGroup`, `setMatch` |
| Group editor and headings | `groupBy`, `ungroup`, `hideEmptyGroups`, `setGroup` (`hiddenGroups`, `collapsed`, `groupOrder`), `unsetGroup`, `moveGroup` |
| Calculation line | `calculate`, `removeCalculation` |
| Column menu | the above, and `renameProperty`, `changePropertyType`, `duplicateProperty`, `deleteProperty`, `setParentRelation`, `addProperty` (insert left and right), `freeze`, `unfreeze` |
| Options panel | `addOption`, `renameOption`, `recolourOption`, `moveOption`, `deleteOption` |
| Rows | `addRow` (with R2's value of the group), `deleteRows`, `moveRow` |

Every operation the definition has stays reachable; none is added.

## R8. Which calculations a column offers

**Decision**: The plugin says which calculations a property's type offers, from `knowledge.md` section *Views* (every type: the counts and percentages; dates and dates and times: earliest, latest, date range; numbers: sum, average, median, min, max, range), as the labels of the enum `Calculation`. The calculation line offers None and those.

**Rationale**: `knowledge.md` states the list per type and DESL cannot; it is view logic, which the plugin already carries.
