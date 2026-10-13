# Contract: what DED 0.2, FBL 0.7 and DESL 0.2 add

What each specification language gains, the sections and schema definitions it touches, and the worked examples and fixtures each change delivers (FR-061). Every statement cites the functional requirement (FR) of [the specification](../hierarchical-requirement-designer.spec.md) or the decision (R) of [research.md](../research.md) it comes from. Section numbers are those of DED 0.1, DESL 0.1 and FBL 0.6 at `develop` `40ca01b` (research.md).

## In one table

| Pull request | Language | Adds | Source |
|---|---|---|---|
| 2 | DED 0.2 | The envelope in a Markdown file. | R3, FR-060 |
| 3 | FBL 0.7 | The `bullets` family, and drift before an edit. | R9, R11, FR-058, FR-052 |
| 4 | FBL 0.7 | Declared blocks in the registration. | R12, FR-059 |
| 5 | DESL 0.2 | The `hierarchy` surface, the `counter` id strategy, the `mentions` facet with `std.mentions`, the `move` action and `persistence.settings`. | R16, FR-057 |
| 6 | none | The definition that rests on them: see [tool-type.md](tool-type.md). | FR-056 |

Each language's change is a pull request of its own, merged before the definition (FR-062, plan, Delivery). Pull request 4 stands apart from 3 so that the reserved construct can be refused without the family (plan, Delivery).

**Holds for all three.** Each new version is a draft and a superset of the one before: every existing document stays valid, and each schema stays at its 0.1 address (plan, Constitution Check, principle IV). Each change comes as its document, its schema and its worked examples together, each example valid against that schema (FR-061). New normative text uses the RFC 2119 key words, regular expressions in FBL's common subset and CEL, and no new expression syntax (plan, Constitution Check, principle III).

## DED 0.2

### DED: what it adds

| Construct | Statement | Source |
|---|---|---|
| The envelope in Markdown | Line 1 of a Markdown definition is an HTML comment that holds both values of the envelope: `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->`. | R3, FR-060 |
| `.md` as a shared extension | A binding a designer type names for `.md` uses the envelope as its marker, as the bindings for `.yaml`, `.json` and `.xml` do. | R3, R4 |

The comment is invisible in a Markdown viewer and plainly not a requirement to an agent (FR-060). Stating the form in DED, and not per designer type under "Other formats", lets the validator and any host recognise a Markdown definition of any designer type the same way (R3).

### DED: where it lands

| Section | Change | Source |
|---|---|---|
| 2. The envelope | A Markdown paragraph with the form above, beside "YAML and JSON" and "XML". | R3 |
| 4. Reading a definition | `.md` joins the shared extensions of step 1. | R3 |
| `ded.schema.json`, `$defs/Definition` | `ded` accepts `"0.1"` and `"0.2"`, since the file schema of the designer type refines it (R20) and its envelope says `0.2` (R3). | R3, R20 |

R3 names sections 2 and 4 only. The header table, the status paragraph, the version check of section 4, and sections 6, 7 and 8 follow as the task that writes the document finds them, and so does the kind of marker a Markdown binding uses.

### DED: examples and checks

| Delivers | What it shows | Source |
|---|---|---|
| `specifications/ded/web-shop.md` | A Markdown definition as worked example. | plan, Project Structure |
| `validate-examples.py` | Reads the envelope of any Markdown definition, which is DED's check, and takes the Markdown example under `specifications/ded/` as an example. | R20, plan, Delivery step 2 |

## FBL 0.7: the `bullets` family

### The family: what it adds

A sixth family. The body is lines as in the `lines` family, with nesting by the indentation of list items (R9).

| Construct | Statement | Source |
|---|---|---|
| Line kinds | Blank. A heading. A fence and the lines it encloses, which are unbound. A thematic break, which is never an item. An **item line**: indentation, a marker `-`, `*` or `+`, a space, text. A **continuation line**: not an item, indented deeper than the marker of the nearest item above it. Any other line is a **statement**, as in `lines`. | R9 |
| `sections` | A binding's `sections` name headings by a regular expression, as `blocks` names the statements that open a block. | R9 |
| `within` | A rule's `within` names the sections its items stand in. An item in no named section is unbound. | R9 |
| Entries and spans | An item's entry runs from its marker to the end of its last continuation line or of its last nested item. | R9 |
| `line` | A rule's `line` matches the text of the item's first line after the marker. Its named groups and words are slots as in `lines`. | R9 |
| Slot `{continuation: true}` | The item's continuation lines with their indentation taken off. | R9 |
| Containment | `parent`, as elsewhere: the nearest item above with a smaller indentation. | R9 |
| Statements | Outside items, matched by rules with `line`, as in `lines`. A statement no rule matches is unbound, and never reported unless `unmatched` is `report`. | R9 |
| New text | A new item takes the marker and indentation of its previous sibling, else of its next sibling, else stands at the content column of its parent. | R9 |
| A missing section | Created by `insert.create` with its heading as text: an `ensure-container` at the end of the document. | R9 |
| A move to another depth | Shifts the indentation of every line of the entry by the difference, and changes nothing else. For this family "the entry's own bytes" of sections 5.5 and 6.4 are the entry's own bytes, re-indented. | R9 |
| Never unreadable by its family | There is no malformed list. A `required` header still applies, and for this family the header's `line` is matched against line 1. | R9, R8 |

The family reads list items under named headings, not Markdown: FBL's non-goal stands (plan, Constitution Check).

### Drift before an edit

| Construct | Statement | Source |
|---|---|---|
| Section 7.2 | Before applying an edit, a host **MUST** compare the body on disk with the bytes the edit was planned against, and when they differ refuse the edit with a reason, write nothing, and read the body again. | R11, FR-052 |

Section 7.3 stays as it is: an external change clears the history (R11).

### The family: where it lands

R9 names these sections and schema definitions, by number only except for 1.5 and 4.8. The middle column is each section's title today. The right column is the statement of R9 that concerns what the section defines: the pairing is this contract's reading, it is empty where no statement of R9 pairs plainly, and the task that writes the document settles it.

| Section | Title in FBL 0.6 | The statement of R9 that concerns it |
|---|---|---|
| 1.5 | Non-goals | Six families, where it says five. |
| 2.4 | CEL | |
| 3.1 | Overview (of the binding) | The binding's `sections`. |
| 3.2 | The body | `family` gains `bullets`. |
| 4.8 | new | The family's lossless reading: line kinds, entries and spans. |
| 5.1 | Element rules | `line` and `within` for this family. |
| 5.2 | Slots and attribute bindings | The slot `{continuation: true}`. |
| 5.5 | Containment | `parent` by indentation, and a move's re-indented bytes. |
| 6.1 | The splice catalogue | The Families column. |
| 6.2 | Inserting and removing | `insert.create` with a heading as text. |
| 6.3 | New text | The marker and indentation of a new item. |
| 6.4 | Edits | A move's re-indented bytes. |
| 7.2 | Drift | The comparison before an edit (R11, not in R9's list). |
| 7.5 | The unreadable body | Never unreadable by its family, and the header against line 1. |
| 15.1 | Conformance classes | |
| Appendix A | JSON Schema | |
| `fbl.schema.json` | `$defs/Family`, `$defs/Body` | The value `bullets`. |

The status paragraph and sections 2.1 and 2.7 name `"0.7"`, as they name every version before it. The schema property that holds `sections`, and its shape, are left to the task.

### The family: examples and fixtures

| Delivers | What it shows | Source |
|---|---|---|
| `specifications/fbl/behavior-tree.fbl` | A declared binding of Agent Behavior Modelling's file format: a second tool's reading. | R10, FR-058, User Story 3 scenario 3 |
| `fixtures/bullets-read/` | Reading the family. | R10, plan |
| `fixtures/bullets-edits/` | Add, set, remove, move across depths, a missing section. | R10, plan |
| `fixtures/behavior-tree-read/` | Reading through `behavior-tree.fbl`. | R10, plan |

`behavior-tree.fbl` has to show: the keyword in bold with the label after it, Retry's count inside the keyword, a keyword-less item as an implicit Do through a second rule, ids derived from place, notes as continuation lines, and the section appended on the first add. If one of these cannot be declared, the family is corrected before it is merged, and the example is not dropped (R10). The example changes neither that tool's definition nor any host (R10).

The second worked example of the family is the designer's own binding, delivered with the definition in pull request 6 (R10).

## FBL 0.7: declared blocks in the registration

### Declared blocks: what it adds

| Construct | Statement | Source |
|---|---|---|
| `registration.blocks` | In a binding, names further blocks of the registration, as `registration.headers` names further headers. | R12, FR-059 |
| The grammar | The one the registration already has: the block's name and a colon on a line, then entries `<key>: <value>`, indented two spaces. | R12 |
| A value | One line. It **MUST NOT** contain `: `, since the key is everything before the last `: `. An edit that would write one is refused. | R12 |
| An undeclared block | Kept, and reported as `fbl.unknown-block`, an information finding, as an unknown header is. | R12 |
| The order of blocks | Written in the order the binding declares them, after `layout:` and `identities:`. | R12 |
| The fixture edit `setting` | Beside `place`: a block, a key, and a value, a position or a removal. | R12 |
| `registration.createOnFirstPlacement` | Widened from the first placement to the first setting: the first setting the person changes creates the registration. | R4 |

A declared block has these properties:

| Property | Values | Meaning | Source |
|---|---|---|---|
| `order` | `ordinal` (default), `kept` | `ordinal`: entries are written in the ordinal order of their keys, as `layout:` is. `kept`: an entry stands where the edit put it, and a move is a `remove-entry` and an `insert-entry` of the same bytes. | R12 |
| `keys` | `ids`, `names` (default) | `ids`: the key is an element's id, and an entry whose id is not in the model is stale and pruned with the next write, as section 8.5 says of layout. | R12 |
| `history` | `true` (default), `false` | `false`: writes to the block are not steps of the body's history. | R12 |

FBL stays ignorant of what a value means: that is the specification language's (R12, R13).

### Declared blocks: where it lands

R12 gives no list of sections. These are the sections and schema definitions that hold today what it extends. Which of them change, and how, is left to the task that writes the document.

| Section or definition | Holds today |
|---|---|
| 8.1 The line form | The blocks that follow the headers, and the key as everything before the last `: `. |
| 8.3 The layout block | "Other view data … is not stored in FBL 0.1", which R12 cites. |
| 8.4 Writing the registration | `registration.createOnFirstPlacement`. |
| 8.5 Stale and ephemeral ids | Stale entries, pruned at the next write. |
| 6.1 The splice catalogue | `ensure-container` and `remove-container` for the registration's blocks. |
| 7.4 Tolerant reading | FBL's own finding codes, `fbl.unknown-header` among them. |
| 15.3 Round-trip fixtures | The edits a step may be. |
| `$defs/RegistrationSettings` | `headers`, `createOnFirstPlacement`. |
| `$defs/Registration` | The parsed form: `layout` and `identities`. |
| `$defs/Edit` | `place`. |

### Declared blocks: examples and fixtures

| Delivers | What it shows | Source |
|---|---|---|
| `specifications/fbl/registrations/requirements.adp` | A registration with declared blocks. | plan, Project Structure |
| `fixtures/registration-blocks/` | Kept order, ordinal order, stale entries. | plan, Project Structure |
| `validate-examples.py` | `parse_registration` reads declared blocks and keeps unknown ones. Today it fails a file with a block it does not know, where section 8.1 says trailing content is kept as unbound. | R12, R20 |

Pull request 4 carries the widening of `createOnFirstPlacement`. The fixture `registration-blocks` brings a small binding of its own that declares its blocks, as `insert-empty-yaml` brings `cards.fbl`, since the designer's binding arrives two pull requests later; the example registration is parsed without a binding. A stale entry of a block keyed by ids is reported as `fbl.stale-view-data` and removed with the next write, as section 8.5 says of layout (R25).

## DESL 0.2

FR-057 names five constructs (R16, R22).

### 1. The surface kind `hierarchy`

A second surface kind, named for what it lays out and for no designer type (R14, FR-057).

| Role | Names | Meaning | Source |
|---|---|---|---|
| `levels` | A type, its `title` and `description` attributes | The elements drawn as boxes that contain. The type contains itself and the entries' type. | R14 |
| `entries` | A type, its `title` and `description` attributes | The elements a level holds that contain nothing. | R14 |
| `labels` | Per attribute: the types it is on, `many`, and `options` (`type`, `name`, `colour`) | Attributes whose values name the members of a list. With `many` they are drawn as tags below the title. A value that names no member is an implicit member. | R14, R13 |
| `notes` | A type and its `about`, `kind`, `text`, `detail` and `resolved` attributes | Elements that stand at the level or entry they are about, as an icon that opens a list. | R14 |
| `collapsed` | An attribute | The boolean attribute that folds a level or an entry. | R14 |
| `filters` | A type and its `name` and `query` attributes | The stored filters. | R14, R17 |
| `ids` | `shown`, `hidden` | Whether an element's id is shown beside its title. | R14 |

The section states the layout every host draws (R14):

| Layout rule | Source |
|---|---|
| One page that scrolls from top to bottom, with no second pane. | R14, FR-015 |
| A level is a box. Its entries, then its levels, stand to its right, and it is as high as they are. Neighbouring boxes share their borders. | R14, FR-016 |
| A title and an optional description on each, with mentions drawn as boxes in the text. | R14, R6, FR-018 |
| A collapsed level or entry shows its id, title, tags and notes icon only. | R14, FR-019 |
| Focus: the page shows as many levels as fit its width, marks a level whose deeper levels do not fit, and lets the person make any level the left edge of the page, with a trail of the levels above it. Focus is the viewer's and is not stored. | R14, FR-017 |
| Notes: the icon of the kind for one unresolved note, an icon for several, a way to add the first when there is none. A collapsed level's icon also stands for the unresolved notes of everything inside it. | R14, FR-036 |

How a host draws a tag or a menu is not DESL's: the companion names the looks (R14, FR-021).

A filter's `query` is words separated by spaces (R17):

| Word | Selects |
|---|---|
| `#name` | Entries that carry the tag. |
| `category:name`, `state:name` | Entries with that category or state. |
| `item:pattern` | Levels whose title matches the pattern, with everything in them. `*` is any run of characters and `?` one character, in any case. The pattern has no space. |
| `sort:key` | The order of the entries within each level: `number`, `title`, `category` or `state`, ascending. A category or a state sorts by its place in its list. |

Words of one kind are alternatives, and kinds combine. A level is shown when an `item:` word selects it or one above it, or none is given, and it holds an entry that is shown or no entry word is given. Nothing a filter does changes the file (R17, FR-049).

### 2. The id strategy `counter`

| Property | Meaning | Source |
|---|---|---|
| `prefix` | Per type: `ITEM-`, `REQ-`. | R5 |
| `digits` | The number of digits, 4 for this designer, growing when the count needs more. | R5 |
| `mark` | A document attribute that holds the last id the strategy gave. | R5 |
| `placeholder` | What stands in place of the number on an entry that has none yet: `NEW`. | R5 |

| Rule | Source |
|---|---|
| A new id is one more than the higher of the mark and the highest number read in the document, and the mark is set to it in the same transaction. | R5, FR-012 |
| An entry with the placeholder has no usable id. It is reported by `std.missingId` and numbered by the existing `missing: "assign"` of section 5.3.4. | R5, FR-013 |
| A number the writer chose is accepted when it is free (section 5.3.1), and the count continues past it. | R5 |
| Duplicates follow the existing rule of section 5.3.4, unchanged. A runtime offers, on an element that `std.duplicateId` reports, to give it the next number; that is the person's action the section asks for, and no operation states it. | R5, R25, FR-014 |
| A missing mark reads as no mark. | R5 |
| Section 5.3.1 says a runtime **MUST NOT** decode an id. The counter strategy reads the number of an id that has its prefix followed by digits, to keep the mark, and treats every other id as opaque. | R5 |

### 3. The facet `mentions` and the built-in `std.mentions`

| Construct | Statement | Source |
|---|---|---|
| `mentions` | On a `string` or `text` attribute: a regular expression with a group `id`, and the element types a mention may name. | R6 |
| Resolution | A runtime finds the mentions in the value and resolves each to an element by id. | R6 |
| `std.mentions` | Reports a mention that names no element. | R6, FR-044, FR-039 |
| Deletion | The text is never changed when an element is deleted. This is what sets a mention apart from a reference, which section 4.7 unsets. | R6 |

### 4. The action `move`

| Construct | Statement | Source |
|---|---|---|
| `move` | An element, a new `parent`, an optional `slot`, and `after` or `before` a sibling. | R15, FR-023 |
| Planning | Planned as FBL's `move` change (FBL section 11.2), so the entry's bytes travel unchanged, re-indented in the `bullets` family. | R15, R9 |

`reorder` stays as it is: it changes only the place among siblings (section 8.2).

### 5. `persistence.settings`

Maps a block of the registration to part of the model, in one of two forms (R13, FR-059).

| Form | Properties | Meaning |
|---|---|---|
| A list | `type`, `key`, `value`, `initial` | The elements of `type` are the block's entries, in the block's order: the attribute `key` is an entry's key and the attribute `value` its value. `initial` lists the elements a document has while the block is absent. |
| A state | `attribute`, `of` | The attribute `attribute` of the elements of the types `of` is kept in the block, keyed by the element's id. Only a value that differs from the attribute's default is stored. |

| Rule | Source |
|---|---|
| A change to such an element or attribute is planned as an edit of the registration, in the same transaction as any change to the body (FBL section 8.4). | R13 |
| A block is absent or complete. Changing one member writes the whole list. | R13 |
| An element of a settings type takes its id from its key, by a derived rule. | R13 |
| The ordinary actions (`create`, `set`, `delete`, `reorder`) change these elements. No second set of actions is added. | R13 |

### DESL: where it lands

The last column says whether research.md names the section or definition itself. Where it does not, the row is where DESL 0.1 defines that kind of construct today, and the task that writes the document settles it.

| Section or definition | Change | Source | Named in research.md |
|---|---|---|---|
| 2.7 Versioning, 3.1 Top-level object | `desl` accepts `"0.1"` and `"0.2"`. | R16 | no |
| 4.3 Attributes | The facet `mentions`. | R6 | no |
| 5 Persistence | `persistence.settings`. | R13 | no |
| 5.3 Identifiers | The strategy `counter`. | R5 | no |
| 5.3.1 Generation | The exception to "**MUST NOT** decode". | R5 | yes |
| 6.5 Built-in constraints | `std.mentions`. | R6 | no |
| 7.1 Overview (of the surface), and a new section for the kind | `kind` gains `hierarchy`. | R14 | 7.1 |
| 8.2 Actions | `move`. | R15 | yes |
| 10.1 Loading a DESL specification, step 4 | The name checks of the new kind. | R16 | yes |
| `desl.schema.json`, `$defs/Surface` | One shape per `kind`. | R16 | yes |

The remaining schema definitions follow their sections (`$defs/Attribute`, `$defs/Persistence`, `$defs/IdStrategy`, `$defs/IdRule`, `$defs/Action`, and new ones for the roles). Their names and shapes, the number of each new section, and the names of the properties of `mentions` are left to the task that writes them. `std.mentions` is a warning (R25).

### DESL: examples and checks

| Delivers | What it shows | Source |
|---|---|---|
| `specifications/desl/minimal-hierarchy.des` | The worked example, beside `minimal-table.des`. | R16 |
| `specifications/desl/minimal-hierarchy.fbl` | Its binding. | R16 |
| `validate-examples.py` | `resolve_desl` branches on `surface.kind`. | R20 |

## What stays as it is

| Construct | Why it is named here | Source |
|---|---|---|
| DESL section 4.7, references | A mention is not a reference. Deleting an element still unsets every reference to it. | R6 |
| DESL section 5.3.4, missing and duplicate ids | Already says what FR-013 and FR-014 ask. | R5 |
| FBL section 7.3, external changes | An external change still clears the history. | R11 |
| A `plugins` key in DESL | Not added. Only the fallback of R23 needs it. | R21, R23 |
| Designer-specific finding codes, a metamodel facet for managed lists, descending sort, free-text search, a stored focus | Left out on purpose. | R21 |

## If a reserved construct is refused at review

| Refused | What changes | Source |
|---|---|---|
| The `bullets` family | The binding names a persistence plugin as its reader, and DESL 0.2 gains a `plugins` key. The reading rules move from FBL into the companion's prose and each host's code. `behavior-tree.fbl` and the `bullets` fixtures are dropped. The file format does not change. | R23 |
| Declared blocks | `persistence.settings` has nowhere to write. The lists, the collapsed state and the stored filters go into the Markdown as comment lines the binding reads, or the first version has no colours, no remembered folding and no stored filters. The choice is the maintainer's. | R23 |
