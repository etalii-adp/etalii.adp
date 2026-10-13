# Data Model: The Hierarchical Requirement Designer

**Feature**: [hierarchical-requirement-designer.spec.md](hierarchical-requirement-designer.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

The entities of a requirement document, where each is stored, and the rules on each. Element, attribute, binding, body, registration, splice and finding are the words of [DESL](../../specifications/desl/DESL-specification.md), [FBL](../../specifications/fbl/FBL-specification.md) and [docs/terminology.md](../../docs/terminology.md) and are not defined again here. Every rule cites the requirement (FR) or the research decision (R) it comes from. The smaller rules a first draft of this model found open are settled in research.md R25 and cited here as R25.

There are two stores. The **Markdown file** holds everything an agent reads (FR-003). The **registration** (`.adp`) holds what an agent does not need to read, and only that (FR-004). An **entry** is an item or a requirement. A **member** is a tag, a category or a state of its list.

## Overview

```text
Requirement document (the Markdown file, named by the registration as its body)
├── Envelope                  line 1
├── Mark line                 line 2: the last ITEM number and the last REQ number given
├── Author's text             the title, the legend, any other section
├── ## Requirements
│   └── Item *
│       ├── Requirement *     carries Tag * and at most one Category and one State, by name
│       │   └── description   holds Reference *, each names one Item or Requirement by number
│       └── Item *            to any depth
└── ## Assessments
    └── Assessment *          about one Item or Requirement, by number

Registration (optional)
├── origin, body
├── tags:                     Tag: name, colour, place in the list
├── categories:               Category: the same
├── states:                   State: the same
├── collapsed:                the collapsed Items and Requirements, by number
└── filters:                  Filter: name, query
```

The designer type's element types are `Item`, `Requirement`, `Assessment`, `Tag`, `Category`, `State` and `Filter` (R18). A reference, the envelope, the mark line and the legend are not element types.

## The Markdown file

### Requirement document

One Markdown file for one subject, with the extension `.md` (FR-002, R18). It is recognised by its envelope alone (R4).

| Part | Where it stands | Read as | Source |
|---|---|---|---|
| Envelope | Line 1 | The binding's required header and its claim's marker | R1, R3 |
| Mark line | Line 2 | The two marks of the id strategy `counter` | R1, R5 |
| Hierarchy | The list items under the first heading whose text is `Requirements`, at any heading level, in any case, up to the next heading of the same or a higher level | Items and requirements | R1 |
| Assessments | The list items under the first heading whose text is `Assessments`, by the same rule | Assessments | R1, FR-032 |
| Author's text | Everything else: the title, the legend, any other section, fenced lines | Not read. Kept byte for byte and never reported | R1, R9, FR-055 |

Rules:

- A file with no `Requirements` heading, or with no bullet under it, is an empty document, readable and editable. The first item added appends the section (R8).
- The first assessment added to a file without the `Assessments` heading appends the section at the end of the file (R7).
- The hierarchy has no maximum depth (FR-008).
- A document the designer creates is the binding's template: the envelope, the mark line, the title, the legend, a starting structure and an empty `Assessments` section. The numbers in it are written out and the mark line names the last of each (R19, FR-006, FR-007).

### Envelope

Stored in the Markdown file, line 1: `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->` (R3).

| Field | Value | Source |
|---|---|---|
| `ded` | The DED version, `0.2` | R3 |
| `designer` | The origin, `etalii/hierarchical-requirement` | R3, R18 |

Rules:

- It is never written after the template (R5).
- A file without it on line 1 is unreadable (R8).
- One that names another designer type or a later DED version is handled as DED section 4 says: the envelope decides, with a finding, and a later version opens read-only (R8).

### Mark line

Stored in the Markdown file, line 2: `<!-- last: ITEM-0003 REQ-0004 -->` (R5).

| Field | Meaning | Source |
|---|---|---|
| Last item number | The last id the `counter` strategy gave to an `Item`, held as the id itself | R5 |
| Last requirement number | The same for a `Requirement` | R5 |

Rules:

- Each mark is a document attribute, set in the same transaction as the id it records (R5).
- A missing mark line reads as no mark. The count continues from the highest number in the file, and the line is written again with the next numbering (R5).
- An edit that numbers an entry changes this line beside the entries it concerns (FR-025).
- Undo restores the marks with the rest of the file (R5).

### Item

One level of the hierarchy, one bullet: `- ITEM-0004 <title> <words>` (R2). It fills the role `levels` of the `hierarchy` surface (R14).

| Field | Stored in | Notation | Rules |
|---|---|---|---|
| Number | Markdown file, the prefix of the bullet | `ITEM-0004` | See [Number](#number). FR-009 |
| Title | Markdown file, the bullet's line between the number and the trailing words | One line | Required (FR-018). It cannot end in a word that reads as a tag, a category or a state (R2). |
| Description | Markdown file, the lines indented under the bullet that are not bullets, blank lines between them included | Free text | Optional (FR-018, R2). References are read in it (R6). |
| Tags | Markdown file, trailing words of the bullet's line | `#name` | Any number. Each names a member of the tag list (FR-026). |
| Parent | Markdown file, by indentation | The nearest bullet above with a smaller indentation; a tab counts as four columns | None at the top level of the hierarchy, else an item (R2, R9). |
| Contents | Markdown file, the bullets indented under it | | Requirements and items, at any depth (FR-008). |
| Collapsed | Registration, block `collapsed`, keyed by the item's number | A block entry when collapsed | Default: not collapsed (R4). Only a value that differs from the default is stored (R13). FR-020 |

### Requirement

One bullet in an item: `- REQ-0031 <title> <words>` (R2). It fills the role `entries` of the `hierarchy` surface (R14).

| Field | Stored in | Notation | Rules |
|---|---|---|---|
| Number | Markdown file, the prefix of the bullet | `REQ-0031` | See [Number](#number). FR-009 |
| Title | Markdown file, as an item's | One line | Required. It states the requirement itself (FR-018). The same limit on its last word (R2). |
| Description | Markdown file, as an item's | Free text | Optional clarification (FR-018). References are read in it (R6). |
| Tags | Markdown file, trailing words | `#name` | Any number (FR-026). |
| Category | Markdown file, trailing word | `category:name` | At most one, and it may have none. Of several the first counts and the others stay as written (R2, FR-030). |
| State | Markdown file, trailing word | `state:name` | At most one, and it may have none. Of several the first counts and the others stay as written (R2, FR-031). |
| Parent | Markdown file, by indentation | As an item's | Exactly one item. A requirement at the top level is reported by `std.containment` (R8). |
| Contents | | | Nothing. A bullet nested under a requirement is reported by `std.containment` (R8). |
| Collapsed | Registration, block `collapsed`, keyed by the requirement's number | A block entry when collapsed | As an item's (R4, R13, FR-020). |

Rules for both kinds of entry:

- The trailing words are the maximal run of words at the end of the bullet's line that are each a tag, a category or a state. They are read in any order. The designer writes the tags first, in the order they were added, then the category, then the state (R2).
- The bullet markers `-`, `*` and `+` are all read. A new bullet uses the marker its list already uses (R2).
- A bullet in the hierarchy that is neither an item nor a requirement is reported by `std.unreadableEntry`. Its bytes, with everything nested in it, are kept and not read (R8, FR-053).

### Number

The id of an item or a requirement, given by the id strategy `counter` (R5). Stored in the Markdown file as the prefix of the entry's bullet.

| Aspect | Rule | Source |
|---|---|---|
| Form | The prefix `ITEM-` or `REQ-` followed by digits: four, and more when the count needs them. After `9999` the next number has five digits and no existing number changes. | FR-009, R5, Edge Cases |
| Counts | Items and requirements are counted apart, each per document, counted up. `ITEM-0003` and `REQ-0003` name different entries. | FR-010 |
| A new number | One more than the higher of the mark and the highest number read in the document. | R5 |
| Stability | A number never changes once given, whatever happens to its entry. | FR-011 |
| No reuse | A number given or read before is not given again, also after its entry was deleted in the designer or as text. | FR-012, R5 |
| A number the writer chose | Accepted when it is free. The count continues past it. | R5, Edge Cases |
| Placeholder | `ITEM-NEW` or `REQ-NEW`. The entry has no usable id: it is shown and reported by `std.missingId`. | R5, FR-013 |
| Duplicate | The first entry in reading order keeps the number. Each later one is reported by `std.duplicateId` and is ephemeral, so nothing can refer to it. | R5, FR-014 |
| Shown | Beside the title (`ids: shown`). | FR-009, R14 |
| Decoding | The strategy reads the number of an id that has its prefix followed by digits, to keep the mark. Every other id is opaque. | R5 |

### Reference

A mention of one entry in a description, read by the facet `mentions` (R6). Stored in the Markdown file, inside the description.

| Field | Notation | Rules |
|---|---|---|
| Target | `[REQ-0002]` or `[ITEM-0004]` | One requirement or item of the same document, resolved by id (R6, FR-043). |

Rules:

- It has no kind such as "depends on" (Assumptions).
- The text is never rewritten: a number does not change and a duplicate cannot be referred to (R6).
- A reference that names no element is shown as broken and reported by `std.mentions`. Its text is kept, also after its target is deleted (R6, FR-044).
- A link with a target, or one that points outside the document, is an ordinary link (R6, FR-043).
- `#` is the key that opens the lookup and is not written (R6, FR-040).

### Assessment

One bullet under `Assessments`: `- [ ] <Kind> <number>: <text>` (R7). It fills the role `notes` of the `hierarchy` surface, whose attributes give the field names below (R14). All of it is stored in the Markdown file.

| Field | Notation | Rules |
|---|---|---|
| `resolved` | `[ ]` or `[x]` | The checkbox may be left out, which reads as unresolved (R7). |
| `kind` | `Question`, `Remark`, `Warning` or `Idea` | Read in any case (R7, FR-033). A thought is a remark (Assumptions). |
| `about` | The number before the colon | Exactly one requirement or item of the same document (FR-035). Read by the facet `mentions` on a one-line attribute (R6). |
| `text` | What follows the colon | FR-032 |
| `detail` | The lines indented under the bullet | Optional (R7). |
| Id | Not stored | Derived from its place and ephemeral, since nothing refers to an assessment (R7). |

Rules:

- A bullet under `Assessments` in no known form is reported by `std.unreadableEntry` (R8).
- An assessment whose entry does not exist is kept in the file and reported as a finding (FR-039, R6).
- It is written by an agent as text or by a person in the designer (FR-034).

## The registration

### Registration

The `.adp` file beside the Markdown file. Optional: the first setting the person changes creates it (R4).

| Part | Notation | Holds | Source |
|---|---|---|---|
| Origin | Line 1: `etalii/hierarchical-requirement` | The designer type | R12, R18 |
| Body | `body: web-shop.md` | The Markdown file | R12 |
| Declared blocks | The block's name and a colon on a line, then entries `<key>: <value>`, indented two spaces | The five blocks below | R12 |

| Block | Holds | Key | Value | Order | Pruned when stale | In the undo history |
|---|---|---|---|---|---|---|
| `tags` | The `Tag` elements | Name | Colour | Kept | No | Yes |
| `categories` | The `Category` elements | Name | Colour | Kept | No | Yes |
| `states` | The `State` elements | Name | Colour | Kept | No | Yes |
| `collapsed` | The attribute `collapsed` of `Item` and `Requirement` | The entry's number | `yes` (R25) | Ordinal | Yes | No |
| `filters` | The `Filter` elements | Name | Query | Kept | No | Yes |

Source of the table: R12 and R13. "Yes" in the last column is the default of `history` in R12, which names only `collapsed` as outside it.

Rules:

- A block is absent or complete. Changing one member writes the whole list (R13).
- A value is one line and does not contain `: `. An edit that would write one is refused (R12).
- Blocks are written in the order the binding declares them, after `layout:` and `identities:` (R12).
- A `collapsed` entry whose number is not in the model is stale and pruned with the next write (R12).
- A block that is not declared is kept and reported as `fbl.unknown-block`, an information finding (R12).
- A change to a settings element or attribute is planned as an edit of the registration, in the same transaction as any change to the Markdown file (R13).
- Without a registration the document shows default colours and order, nothing collapsed and no stored filter (R4, FR-005).

### Tag, Category, State

A member of one of three lists per document. Each is an element of a settings type and takes its id from its key (R13).

| Field | Stored in | Rules |
|---|---|---|
| `name` | Registration, as the key of the member's block entry. Markdown file, wherever an entry carries it. | No whitespace: typing a space in the designer writes `-`. Names compare ignoring case (R2). |
| `colour` | Registration, as the value of the block entry | One of the Knowledge designer's enumeration `Colour`. A member created in the designer or adopted from the file is `default` (R13, R25). FR-004 |
| Place in the list | Registration, as the block entry's place in its block | The blocks keep their order (R12). FR-004 |

| List | Carried by | Per entry | Members while the block is absent | Source |
|---|---|---|---|---|
| Tag | Items and requirements | Any number | None | FR-026, R13 |
| Category | Requirements | At most one | functional `blue`, non-functional `purple`, technical `brown` | FR-030, R13, R25 |
| State | Requirements | At most one | proposed `gray`, accepted `green`, rejected `red`, done `blue` | FR-031, R13, R25 |

Rules:

- **Implicit member.** A name that an entry carries and its list does not hold is a member all the same. It stands after the stored members, in order of first appearance, with the default colour. Its writer touches no other file (R13, FR-029).
- **Picking and creating.** Typing narrows the list. A name equal to a member's name in any case picks it, and for a tag a name that equals none creates it on Enter (FR-027).
- **Rename and delete of a member.** Every entry that carries it follows a rename and loses it on a delete, in the same undoable step, for a tag, a category and a state alike (FR-028, R25).
- **Spelling.** The list's spelling is shown. An entry keeps the spelling it was written with until the member is renamed (R25).
- **Writing a list.** Its implicit members become stored members, after the others (R25).
- **Lost with the registration.** The colours, the order, and a member that no entry carries. The initial categories and states return (R13, FR-005).

### Filter

A stored filter. An element of the settings type `Filter`, stored in the registration only (FR-004, FR-048, R13).

| Field | Stored in | Rules |
|---|---|---|
| `name` | Registration, block `filters`, the key | The name it is found under (FR-048). |
| `query` | Registration, block `filters`, the value | Words separated by spaces, with its sorting (R17). |

| Word of a query | Selects | Source |
|---|---|---|
| `#name` | Entries that carry the tag | R17, FR-045 |
| `category:name`, `state:name` | Entries with that category or state | R17, FR-045 |
| `item:pattern` | Items whose title matches the pattern, with everything in them. `*` is any run of characters and `?` one character, in any case. The pattern has no space, so `?` or `*` stands for one in a title. | R17, FR-046 |
| `sort:key` | The order of the requirements within each item: `number`, `title`, `category` or `state`, ascending. A category or a state sorts by its place in its list. | R17, FR-047 |

Rules:

- Words of one kind are alternatives. Kinds combine (R17).
- An item is shown when an `item:` word selects it or one above it, or none is given, and it holds an entry that is shown or no entry word is given (R17).
- A requirement that remains is shown with the items that contain it (FR-045).
- Nothing a filter does changes the Markdown file (FR-049).

## In neither file

| What | How it comes about | Source |
|---|---|---|
| Focus: the item at the left edge of the page, and the trail above it | The viewer's. Not stored. | R14, FR-017 |
| The filter and the sorting that are applied | A way of looking. Stored only as a `Filter`. | FR-004, Assumptions |
| The icon on an entry | Counted from its unresolved assessments. A collapsed item's icon also stands for those of everything inside it. | FR-036, R14 |
| The title in a reference box | The target's current title, looked up by number. | FR-041 |
| A finding | Reported when the file is read. | FR-053, R8 |

## Findings

No finding code belongs to this designer type alone. The built-ins cover every case, with `std.mentions` added (R21).

| Code | Raised when | What happens to the file | Source |
|---|---|---|---|
| `std.unparseable` | No envelope on line 1, or the file is not UTF-8 | Read-only, one finding, never written | R8, FR-054 |
| `std.unreadableEntry` | A bullet in the hierarchy that is neither an item nor a requirement, or a bullet under `Assessments` in no known form | The bullet's bytes are kept. Every other entry stays editable. | R8, FR-053 |
| `std.containment` | A requirement at the top level, or a bullet nested under a requirement | The bullet is kept | R8 |
| `std.missingId` | An entry written as `ITEM-NEW` or `REQ-NEW` | Shown. Numbered with the next edit. | R5, FR-013 |
| `std.duplicateId` | A second or later entry with a number already read | Shown. It is not renumbered except by the person. | R5, FR-014 |
| `std.mentions` | A reference, or an assessment's target, that names no element | The text is kept | R6, FR-039, FR-044 |
| `fbl.unknown-block` | A block of the registration that the binding does not declare | The block is kept | R12 |

A finding that a filter hides is still listed, and selecting it shows the entry (Edge Cases).

## State transitions

### The number of an entry

| From | Event | To | Source |
|---|---|---|---|
| None | The person adds an entry in the designer | Numbered, and the mark is set in the same transaction | R5 |
| Placeholder | The document is opened or read again | Placeholder, reported | FR-013 |
| Placeholder | The next edit the designer writes to the Markdown file | Numbered | FR-013, R5 |
| Numbered | A move, or a change of text, tags, category or state | The same number | FR-011 |
| Duplicate | The person gives it a new number | Numbered | FR-014 |
| Numbered | The entry is deleted, in the designer or as text | Never given to another entry | FR-012 |
| Numbered by an add | The add is undone | Free again | R5, Edge Cases |

Collapsing writes only the registration (FR-049), so it does not number a placeholder.

### An assessment

| From | Event | To | Source |
|---|---|---|---|
| None | An agent writes it in the file, or a person adds it in the designer | Unresolved | FR-034 |
| Unresolved | The person resolves it, or an agent writes `[x]` | Resolved: it stays in the file and no longer counts towards the icon | FR-038, R7, Assumptions |
| Either | The person removes it | Gone from the file | FR-037 |
| Either | Its entry is deleted | Kept in the file, reported as a finding | FR-039 |

### A member of a list

| From | Event | To | Source |
|---|---|---|---|
| None | The person creates a tag on Enter | Stored, with a colour, and carried by the entry | FR-027 |
| None | An agent writes the name on an entry | Implicit | FR-029, R13 |
| Stored | The registration is deleted, and an entry carries the member | Implicit | R13 |
| Stored | The registration is deleted, and no entry carries the member | Gone | R13 |
| Initial category or state | The block is written for the first time | Stored, with the whole list | R13 |

### The document as it is read

| Condition | The designer shows | Writes | Source |
|---|---|---|---|
| Readable | Every entry, editable | Yes | R8 |
| No hierarchy yet | An empty document, editable | Yes | R8 |
| A fault at one bullet | A finding at that bullet, every other entry editable | Yes, never that bullet's bytes | FR-053 |
| Unreadable when opened | An empty, read-only page with one finding | Never | FR-054 |
| Becomes unreadable while open | The last readable content, read-only, with one finding | Never | FR-054 |
| A later DED version in the envelope | Read-only, with a finding | Never | R8 |

| Event while open | Result | Source |
|---|---|---|
| The file changes outside the designer | It is read again and the change is shown. Entries matched by number keep what was collapsed. The undo history is cleared. | FR-050, R11 |
| The file changes outside while the designer holds unsaved edits | The person is told and chooses between reloading and keeping their version | FR-051 |
| An edit is planned against bytes that differ from the file on disk | Refused with a reason, nothing is written, and the file is read again. Never merged. | FR-052, R11 |

### The registration

| From | Event | To | Source |
|---|---|---|---|
| Absent | The person changes the first setting | Present, with the block of that setting | R4, R13 |
| Present | It is deleted | Absent: default colours and order, nothing collapsed, no stored filter | R4, FR-005 |

## Where a change is written

| Change | Markdown file | Registration | An undoable step |
|---|---|---|---|
| Add an entry | The new bullet, the entries numbered under FR-013, the mark line | None | Yes (FR-025) |
| Change a title, a description, or the tags, category or state an entry carries | That entry's bytes | The list's block, when a tag is created (FR-027) | Yes (FR-025) |
| Move an entry | The entry's own bytes, re-indented, at their new place | None | Yes (FR-023, R15, R9) |
| Delete an entry | The entry's bytes | Its `collapsed` entry is stale and pruned with the next write | Yes (FR-025, R12) |
| Add, change, remove or resolve an assessment | That assessment's bullet. Resolving replaces one character. | None | Yes (FR-025, R7) |
| Rename or delete a tag | Every entry that carries it | Block `tags` | One step (FR-028) |
| Recolour or reorder a member | None | The list's block | Yes (R12) |
| Collapse or expand | None | Block `collapsed` | No (R12) |
| Store a filter | None | Block `filters` | Yes (R12) |
| Apply a filter, sort, or focus on an item | None | None | Not an edit (FR-049) |

Deleting an entry that contains anything, or that a reference or an assessment names, asks for confirmation first (FR-024).

## Attribute names

As the definition's `.des` names them (R25).

| Type | Attributes |
|---|---|
| The document | `lastItem`, `lastRequirement` |
| `Item` | `title`, `description`, `tags`, `collapsed` |
| `Requirement` | `title`, `description`, `tags`, `category`, `state`, `collapsed` |
| `Assessment` | `kind`, `about`, `text`, `detail`, `resolved` |
| `Tag`, `Category`, `State` | `name`, `colour` |
| `Filter` | `name`, `query` |

Other rules of R25 that this model relies on:

- `REQ-12` is accepted as written and is not the id `REQ-0012`. Its number counts for the mark.
- The file's order is kept as written. The designer writes a new requirement after the item's last requirement, or before its first sub-item when it has none, and a new sub-item after the item's last child.
- An entry with an empty title is reported by `std.required`.
- Resolving an assessment is a switch between `[ ]` and `[x]`.
- Mentions are read in a description and in an assessment's `text` and `detail`, not in a title.
- An assessment's id is `assessment/` and its place, ephemeral. A member's is `tag/`, `category/` or `state/` and its name in lower case; a filter's `filter/` and its name.
- A requirement without the category or state it is sorted by stands last, and of several `sort:` words the first counts.
- An entry without a usable number can be collapsed for the session only.
