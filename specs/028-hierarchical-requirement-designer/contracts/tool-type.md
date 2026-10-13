# Contract: the designer type's definition

The files that define the Hierarchical Requirement Designer in this repository, the names in them, the roles of its surface, what each gesture changes, and the findings a host reports (FR-056). Every statement cites the functional requirement (FR) of [the specification](../hierarchical-requirement-designer.spec.md) or the decision (R) of [research.md](../research.md) it comes from. What neither settles is listed under [Left to the tasks](#left-to-the-tasks).

## Names

| What | Name | Source |
|---|---|---|
| Label, the name users see | `Hierarchical Requirement Designer` | Verbatim Constraints, FR-001, R18 |
| Origin | `etalii/hierarchical-requirement` | R18 |
| Language id | `net.etalii.adp.etalii.hierarchical-requirement` | R18 |
| Binding | `hierarchical-requirement.fbl#markdown` | R18 |
| Extension | `.md`, shared, with the envelope as marker | R18, R4 |
| Types | `Item`, `Requirement`, `Assessment`, `Tag`, `Category`, `State`, `Filter` | R18 |
| An item's number | `ITEM-000x` | Verbatim Constraints, FR-009 |
| A requirement's number | `REQ-000x` | Verbatim Constraints, FR-009 |
| The key that opens the lookup in a description | `#` | Verbatim Constraints, FR-040 |

`item` is a reserved attribute name in DESL (section 2.2). `Item` as a type name is not, and no attribute is named `item` (R18).

## Files

All under `definitions/designers/`, under one base name, as the Knowledge designer's are (plan, Structure Decision).

| File | Holds | Source |
|---|---|---|
| `hierarchical-requirement.des` | The DESL 0.2 specification: metamodel, persistence, surface, operations. | R18, FR-056 |
| `hierarchical-requirement.fbl` | The binding `markdown`: how the file and the registration's blocks are read and written, and the template of a new document. | R18, R19, FR-056 |
| `hierarchical-requirement.md` | The companion: what a person or an agent needs to write a valid requirement document from it alone, the known limit of a title (R2), and the looks taken from the Knowledge designer (R14, FR-021). | FR-056, SC-007 |
| `hierarchical-requirement.schema.json` | The JSON form the validator reads a requirement document into. It refines DED's `$defs/Definition`, as `knowledge.schema.json` does. | R20 |
| `examples/web-shop.md` | An example requirement document, validated by the Build workflow. | R18, FR-056 |
| `examples/web-shop.adp` | Its registration. | R18 |
| `README.md` | A second row in the table of designers. | plan, Project Structure |

## Types and where each is kept

| Type | Kept in | Id | Source |
|---|---|---|---|
| `Item` | The file, as a bullet under `Requirements`. | `counter`, prefix `ITEM-`, 4 digits and growing, placeholder `NEW`. | R2, R5 |
| `Requirement` | The file, as a bullet in an item. | `counter`, prefix `REQ-`, the same. | R2, R5 |
| `Assessment` | The file, as a bullet under `Assessments`. | Derived from its place, ephemeral. | R7 |
| `Tag` | The registration, block `tags`: key `name`, value `colour`. Starts empty. | From its key, by a derived rule. | R13 |
| `Category` | The registration, block `categories`: key `name`, value `colour`. Starts as functional, non-functional and technical. | The same. | R13, FR-030 |
| `State` | The registration, block `states`: key `name`, value `colour`. Starts as proposed, accepted, rejected and done. | The same. | R13, FR-031 |
| `Filter` | The registration, block `filters`: key `name`, value `query`. Starts empty. | The same. | R13, R17 |

The state `collapsed` of `Item` and `Requirement` is kept in the registration's block `collapsed`, keyed by id (R13). The two marks of the `counter` strategy are document attributes, stored on line 2 of the file (R5). The attributes of each type are the subject of [data-model.md](../data-model.md); this contract names only those research.md names.

## Persistence

| Setting | Value | Source |
|---|---|---|
| Family | `bullets` | R9 |
| Claim | `.md`, shared, with the envelope as its marker. A bare `.md` with the envelope opens in the designer. | R4 |
| `header` | The envelope, with `required: true`. | R3 |
| Sections | The headings `Requirements` and `Assessments`. | R1, R9 |
| The mark line | A statement outside the items, matched by a rule with `line`. | R9, R5 |
| `ids` | The strategy `counter` per type, with `missing: "assign"`. | R5 |
| `registration.createOnFirstPlacement` | The first setting the person changes creates the registration. | R4 |
| `registration.blocks` | `tags`, `categories`, `states` and `filters`: order `kept`, keyed by name. `collapsed`: order `ordinal`, keyed by id, pruned when stale, outside the history. | R12 |
| `persistence.settings` | The four lists above as the list form, and `collapsed` of `Item` and `Requirement` as the state form. | R13 |
| `template` | The whole text of a new document, written with CRLF: the envelope, the mark line, the title `{base}`, the legend, the starting structure and an empty `Assessments` section. The numbers are written out, `ITEM-0001` onwards, with the mark line naming the last of each. | R19, FR-006, FR-007 |

The file's notation, the registration and what reading reports are in [requirement-document.md](requirement-document.md).

## Surface roles

The surface is of the kind `hierarchy` (R14). Each role of the kind, and what plays it here:

| Role | Played by | Source |
|---|---|---|
| `levels` | `Item`, with its title and its description. | R14, FR-016 |
| `entries` | `Requirement`, with its title, which states the requirement itself, and its description. | R14, FR-018 |
| `labels` | The tags of `Item` and `Requirement`, with `many` and the options `Tag`. The category of `Requirement`, with the options `Category`. The state of `Requirement`, with the options `State`. Each options type gives `name` and `colour`. | R14, R13, FR-026, FR-030, FR-031 |
| `notes` | `Assessment`: what it is about, its kind, its text, its detail and whether it is resolved. | R14, R7, FR-035 |
| `collapsed` | The `collapsed` state of `Item` and `Requirement`. | R14, R13, FR-019 |
| `filters` | `Filter`, with `name` and `query`. | R14, R17, FR-048 |
| `ids` | `shown`: both parties point at an entry by its number, so the person has to see it. | R14, FR-009, Assumptions |

The description of an item and of a requirement, and what an assessment is about, carry the `mentions` facet: a reference `[REQ-0002]` in a description is drawn as a box with the target's number and current title, and an assessment's target is a mention on a one-line attribute (R6, FR-041).

## Gestures and operations

DESL asks for one operation per gesture, and leaves the gesture that starts each to the host, except where the specification fixes it (DESL section 8.1). The table gives, per gesture, the action of DESL it rests on. The operations' names are left to the task that writes `hierarchical-requirement.des`; the attribute names are in research.md R25.

| Gesture | Changes | Action | Written to | Source |
|---|---|---|---|---|
| The control at the end of an item's content, or the key from a selected entry | Adds an item or a requirement there, ready for typing, with no dialog. A new requirement from a selected one appears below it. | `create`, with the next number of its kind. | The file: the new bullet and the mark line. | FR-022, R5, User Story 4 scenario 3 |
| Typing in a title or a description | Changes that text. | `set` | The file: that entry only. | FR-018, FR-025 |
| Dragging an item or a requirement below another item or to another place | Moves it, an item with everything in it. No number changes. | `move` to another item, `reorder` within one (R25) | The file: the entry's own bytes, re-indented. | FR-023, R15, R9 |
| Delete | Deletes the entry with what it contains. Asks first when it contains anything, or a reference or an assessment names it. | `delete`, with a confirmation. | The file. | FR-024, DESL section 8.3 |
| The control to the left of a title | Collapses or expands the item or the requirement. | `set` of the `collapsed` state. | The registration, block `collapsed`, outside the history. | FR-019, FR-020, R12, R13 |
| Typing in a tag field, then Enter | A name equal to a tag's name in any case picks that tag. A name that equals none creates it. | `set` on the entry, and `create` of a `Tag` when none equals. | The file for the entry, the registration for a new tag. | FR-027, R13 |
| The tag list: rename, recolour, reorder, delete | A rename or a delete updates every entry that carries the tag, in the same undoable step. | `set`, `reorder`, `delete` | A rename or a delete: the file and the registration. A colour or a place: the registration only. | FR-028, R13, User Story 7 scenario 3 |
| Picking a category or a state on a requirement | Sets it. | `set` | The file. | FR-030, FR-031 |
| The category list and the state list: add, rename, reorder, delete | As the tag list. | `create`, `set`, `reorder`, `delete` | As the tag list. | FR-030, FR-031, R13 |
| The icon at the top right of an entry | Opens its assessments as a list, each with the entry it names. Adds, changes, removes or resolves one. | `create`, `set`, `delete`, and `set` of resolved. | The file, under `Assessments`. Resolving is one `replace-value` of one character. | FR-036, FR-037, FR-038, R7 |
| Typing `#` in a description, then picking an entry | Opens a lookup of the requirements and items of the same document, narrowed by number or title. Picking writes the number in square brackets into the text. | `set` of the description. | The file. | FR-040, FR-041, R6 |
| Selecting a reference box | Shows its target, expanding what hides it. | none | Nothing in the file. What it expands is the `collapsed` state. | FR-042 |
| Giving a duplicate a new number | Only by the person's action, offered on the finding. | None: part of the `counter` strategy. | The file: the next number in place of the old one, and the mark line. | FR-014, R5, R25 |
| Storing a filter under a name | Keeps the current filter with its sorting. | `create` of a `Filter`. | The registration, block `filters`. | FR-048, R13 |
| Narrowing and sorting | A way of looking. | none | Nothing. | FR-045, FR-047, FR-049, R17 |
| Focusing on an item, and the trail back | The viewer's, not stored. | none | Nothing. | FR-017, FR-049, R14 |

Every edit is one undoable step (FR-025). A change to an element kept in the registration is planned as an edit of the registration, in the same transaction as any change to the body (R13).

## Findings

No designer-specific finding code is added: the built-ins cover every case, with `std.mentions` new in DESL 0.2 (R21).

| Code | Raised for | What the designer does | Source |
|---|---|---|---|
| `std.unparseable` | No envelope on line 1, or a file that is not UTF-8. | Read-only, this one finding, never written. | R8, FR-054 |
| `std.unreadableEntry` | A bullet in the hierarchy that is neither an item nor a requirement. A bullet under `Assessments` in no known form. | Keeps its bytes, with everything nested in it, and does not read them. Every other entry stays editable. | R8, FR-053 |
| `std.containment` | A requirement at the top level, or a bullet nested under a requirement. | Keeps it. | R8 |
| `std.missingId` | An entry written as `ITEM-NEW` or `REQ-NEW`. | Shows it, and numbers it with the next edit it writes. | R5, FR-013 |
| `std.duplicateId` | Each entry whose number an earlier entry carries. | Shows it as ephemeral, so nothing can refer to it. Changes no number by itself. | R5, FR-014 |
| `std.mentions` | A reference whose target no longer exists. An assessment whose entry no longer exists. | Keeps the text. Marks the reference box as broken. | R6, FR-044, FR-039 |
| `fbl.unknown-block` | A block of the registration the binding does not declare. | Keeps it. An information finding. | R12 |
| DED's own | An envelope that names another designer type or a later version of DED. | As DED section 4 says: the envelope decides, with a finding, and a later version opens read-only. | R8, R25 |

Of several `category:` or `state:` words on one requirement the first counts, and nothing is reported (R25). A finding stays listed when a filter hides its entry, and selecting it shows the entry (Edge Cases). Text outside the bullets is never reported (FR-055).

## Examples and fixtures

| Delivers | What it shows | Source |
|---|---|---|
| `definitions/designers/examples/web-shop.md`, `web-shop.adp` | A requirement document and its registration. The validator reads the document with a reader written for this designer, checks it against `hierarchical-requirement.schema.json`, and reports what reading it would report: an unreadable bullet, a duplicate number, a mention or an assessment that names nothing, a requirement out of place. | R20 |
| `specifications/fbl/fixtures/hierarchical-requirement-*/` | The exact bytes of every edit over the designer's binding, replayed splice by splice. | R20, plan, Project Structure |

What the fixtures have to state, each from a requirement. How the cases are split over folders, and each folder's name after `hierarchical-requirement-`, is left to the task that writes them.

| Case | What the fixture states | Source |
|---|---|---|
| Reading | The elements of a document, and the finding for each fault in the table above. | R8, SC-005 |
| A save without an edit | No splice, the same bytes. | SC-004 |
| A change of one title | Splices in that entry only. | FR-025, User Story 2 scenario 2 |
| An add | The new bullet with its sibling's marker and indentation, its number from the mark, and the mark line rewritten, in one edit. | R5, R9, FR-025 |
| An edit while an entry is `ITEM-NEW` or `REQ-NEW` | That entry numbered in the same edit. | FR-013, R5 |
| The first item in a file without the heading, and the first assessment | The section appended. | R8, R7 |
| A move across depths | The entry's own bytes re-indented, and no number changed. | R9, R15, FR-011, SC-003 |
| An undo of an add | The mark restored. | R5 |
| A rename of a tag carried by several entries | Every carrier in one edit. | FR-028 |
| Resolving an assessment | One `replace-value` of one character. | R7 |
| Settings | The `setting` edit: a kept order, `collapsed` outside the history, a stale entry pruned, the registration created with the first setting. | R12, R4 |
| The template | Reads through its binding with no finding of severity warning or above. | FBL section 13, R19 |

The defect to plant for each check, and the failure to see, are named by the task that adds the check. There is no harness for it (plan, Technical Context, SC-008).

## Left to the tasks

| What is open | Left to |
|---|---|
| The operations' names, and the icon each kind of assessment names. | The task that writes `hierarchical-requirement.des` |
| The content of the companion beyond what the table of files lists. | The task that writes `hierarchical-requirement.md` |
