# Research: The Hierarchical Requirement Designer

Decisions the plan rests on. Each settles a question the decision of 2026-10-13 carried forward or one that reading the specifications raised. Section numbers are those of the documents at `develop` `40ca01b`: DED 0.1, DESL 0.1, FBL 0.6. Paths prefixed `standalone:` are in `etalii.adp.ide.standalone`, read at `f45a4d50c`.

## The file

### R1. A requirement document has four parts, found by their place and their headings

**Decision.** The file is read as follows.

```markdown
<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->
<!-- last: ITEM-0003 REQ-0004 -->
# Web shop

## How to read this file

(the legend: prose and fenced examples, never read as entries)

## Requirements

- ITEM-0001 Backend #core
  Everything behind the public interface.
  - REQ-0001 A session ends after 30 minutes without activity. #security category:functional state:accepted
    Activity is any request the user makes. See [REQ-0002] for sign-in.
  - REQ-0002 Users sign in with an e-mail address and a password. #security
  - ITEM-0002 Sessions
    - REQ-NEW Tokens are refreshed without the user noticing.

## Assessments

- [ ] Question REQ-0001: Is 30 minutes right for the mobile app?
- [x] Warning ITEM-0002: Overlaps with the gateway's own session handling.
```

1. **Line 1 is the envelope** (R3).
2. **Line 2 is the mark line**: the last number given of each kind (R5).
3. **The hierarchy** is the list items under the first heading whose text is `Requirements`, at any heading level, in any case. The section ends at the next heading of the same or a higher level.
4. **The assessments** are the list items under the first heading whose text is `Assessments`, by the same rule.

Everything else is the author's: the title, the legend, any other section. It is kept byte for byte and never reported (FR-055).

**Rationale.** A legend has to show example bullets, and the assessments are a second list, so "every bullet in the file" cannot be the hierarchy. Agent Behavior Modelling solved the same problem with a named heading and skipped fenced code (`definitions/diagrams/agent-behavior-modelling.md`, The file format), and agents keep to headings well.

**Alternatives considered.** The first list in the file: the legend's examples would be read as requirements. A marker comment around the hierarchy: one more thing for an agent to break, where a heading is something it already writes.

### R2. A bullet is a number, a title and trailing words; lines under it are its description

**Decision.**

- **An item** is `- ITEM-0004 <title> <words>`, **a requirement** `- REQ-0031 <title> <words>`. The markers `-`, `*` and `+` are all read; a new bullet uses the marker its list already uses.
- **The trailing words** are the maximal run of words at the end of the line that are each a tag (`#name`), a category (`category:name`) or a state (`state:name`). The title is what stands between the number and that run. The designer writes tags first, in the order they were added, then the category, then the state; it reads them in any order.
- **A name** (of a tag, a category or a state) has no whitespace. Typing a space in the designer writes `-`. Names compare ignoring case.
- **The description** is the lines indented under the bullet that are not bullets themselves, blank lines between them included, as Agent Behavior Modelling reads a node's notes.
- **Children** are the bullets indented under a bullet. A tab counts as four columns.
- A requirement carries at most one `category:` and one `state:`; of several the first counts and the others stay as written. On an item's line only `#name` words are trailing words.

**Rationale.** The maintainer's answer has tags as anchors at the end of the text (intake, Clarifications). A category and a state have to be told apart by an agent that cannot see the lists, which live in the registration, so each names its kind. The same three notations are the filter's (R17), so a person, an agent and a text search all use one way of writing "the accepted security requirements".

**Alternatives considered.** `(functional, accepted)` after the number: which word is the category cannot be told without the lists. Names with spaces in quotes: every word slot, every filter word and every agent would have to handle the quoting. A known limit follows from the choice and goes in the companion: a title cannot end in a word that reads as a tag, a category or a state.

### R3. The envelope is the first line, an HTML comment, and DED says so

**Decision.** `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->` is line 1. DED 0.2 adds a Markdown paragraph to its section 2 with this form, and `.md` to the shared extensions of its section 4. The binding states it as its `header`, with `required: true`, and as its claim's marker.

**Rationale.** DED section 2 says a definition **MUST** begin with its envelope, and FBL's markers look at the first lines only (section 12.2), so the envelope cannot stand after a legend. A comment is invisible in a Markdown viewer and plainly not a requirement to an agent (FR-060). DED 0.1 would let the designer type state the form itself ("Other formats"). Stating it in DED is one paragraph, and it is what lets the validator, and any host, recognise a Markdown definition of any designer type the same way.

**Consequence for the specification.** FR-006 said a new document "MUST begin with a legend". It begins with the envelope, and the legend stands ahead of the hierarchy (R22).

**Alternatives considered.** YAML front matter: a second syntax for the family to read, and many viewers show it as a table at the top of the page. No DED change: possible, and every Markdown designer after this one would then choose its own form.

### R4. A file is recognised by its envelope; the registration is created with the first setting

**Decision.** The binding claims `.md` as a shared extension with the envelope as its marker, as the Knowledge bindings claim `.yaml`. A bare `.md` with the envelope opens in the designer. The registration is optional: a document without one shows default colours and order, nothing collapsed and no stored filter, and the first setting the person changes creates it (`registration.createOnFirstPlacement`, which FBL 0.7 widens from the first placement to the first setting).

**Rationale.** This is DED's own recognition (sections 1.2 and 4) and what FR-005 asks: the document is complete without its registration.

**Correction.** The specification said a file becomes a requirement document "by its envelope and its registration, as Agent Behavior Modelling's does". That tool has no envelope and opens only through a registration. The sentence is corrected (R22).

### R5. Numbers are counted by a new id strategy, and the last number given is kept in the file

**Decision.**

- DESL 0.2 adds the id strategy `counter`, per type: a `prefix` (`ITEM-`, `REQ-`), a number of `digits` (4, growing when the count needs more), a `mark` and a `placeholder`.
- **The mark** is a document attribute that holds the last id the strategy gave. The binding stores both marks on line 2: `<!-- last: ITEM-0003 REQ-0004 -->`.
- **A new id** is one more than the higher of the mark and the highest number read in the document, and the mark is set to it in the same transaction. So a number is not given again after its entry is deleted, in the designer or as text (FR-012).
- **The placeholder** is `NEW`. An agent that adds an entry writes `ITEM-NEW` or `REQ-NEW`. Such an entry has no usable id: it is shown, reported by `std.missingId`, and numbered with the next edit the designer writes, by DESL's existing `missing: "assign"` (section 5.3.4), which is FR-013 word for word.
- **A number the writer chose** is accepted when it is free (section 5.3.1), and the count continues past it.
- **Two entries with one number**: DESL's existing rule (section 5.3.4). The first in reading order keeps it, the later ones are reported by `std.duplicateId` and are ephemeral, so nothing can refer to them, and only the person's action gives one a new number. That is FR-014, and no reference has to be rewritten when it happens.
- **A missing mark line** reads as no mark. The count then continues from the highest number in the file, and the line is written again with the next numbering.
- **Undo restores the mark with the rest of the body**, so an add that is undone frees its number.

**Rationale.** The mark has to be in the file: FR-005 rules out the registration, and DED rules out the envelope, which is never written after the template. Counting from the highest number in the file alone would give a deleted number out again. A placeholder makes the kind of an unnumbered bullet certain, where a bare bullet could be either.

**What changes in DESL.** Section 5.3.1 says a runtime **MUST NOT** decode an id. The counter strategy reads the number of an id that has its prefix followed by digits, to keep the mark, and treats every other id as opaque.

**Alternatives considered.** A bare bullet as an unnumbered requirement: its kind would be a guess, and Agent Behavior Modelling's answer (a default kind and a warning) fits a tree of one family of nodes, not two kinds that nest differently. Marks as integers: the binding would write `7` beside `ITEM-0007`; holding the id itself needs no number format.

### R6. A reference is the number in square brackets, read by a new `mentions` facet

**Decision.** A reference is written `[REQ-0002]` or `[ITEM-0004]` in a description. DESL 0.2 adds `mentions` to a `string` or `text` attribute: a regular expression with a group `id` and the element types a mention may name. A runtime finds the mentions in the value, resolves each to an element by id, and reports one that names no element by the new built-in `std.mentions`. The text is never changed when an element is deleted. An assessment's target uses the same facet on a one-line attribute.

**Rationale.** FR-044 and FR-039 keep the text of a broken reference and of an orphaned assessment. DESL's reference attribute does the opposite: deleting an element **MUST** unset every reference to it (section 4.7), and a reference has one target type where these name an item or a requirement. A `text` attribute has no markup today, so the box of FR-041 needs a construct in any case. Since numbers never change (FR-011) and a duplicate cannot be referred to (R5), a mention never has to be rewritten, which is why reading suffices.

**The notation.** Square brackets are CommonMark's shortcut reference form, the least an agent can write that still reads as a link, and one token holds the number, so the text and the target cannot disagree. A link with a target, `[text](https://…)`, stays an ordinary link (FR-043). The `#` is the key that opens the lookup (FR-040), not what is written.

**Alternatives considered.** `[REQ-0002](#REQ-0002)`: twice the tokens, a dead anchor in every viewer, and two places to keep equal. A reference attribute beside the text: the reference would not stand where it was typed.

### R7. Assessments are a task list under their own heading

**Decision.** An assessment is `- [ ] <Kind> <number>: <text>`, with `[x]` when it is resolved. The kinds are `Question`, `Remark`, `Warning` and `Idea`, read in any case. The checkbox may be left out, which reads as unresolved. Lines indented under the bullet are its detail. An assessment's id is derived from its place and ephemeral, since nothing refers to one. The first assessment added to a file without the heading appends the section at the end of the file.

**Rationale.** A task list is the Markdown an agent already writes for "open, then done", and viewers draw the checkbox. Resolving in the designer is one `replace-value` of one character, and an agent resolves the same way (specification, Assumptions).

### R8. Only a missing envelope makes the file unreadable

**Decision.**

| What the designer finds | What it does |
|---|---|
| No envelope on line 1, or a file that is not UTF-8 | Unreadable: read-only, one `std.unparseable` finding, never written (FBL section 7.5, FR-054). |
| An envelope that names another designer type or a later DED version | As DED section 4 says: the envelope decides, with a finding, and a later version opens read-only. |
| No `Requirements` heading, or no bullet under it | An empty document, readable and editable. The first item added appends the section. |
| A bullet in the hierarchy that is neither an item nor a requirement | `std.unreadableEntry` at that bullet. Its bytes, with everything nested in it, are kept and not read. |
| A requirement at the top level, or a bullet nested under a requirement | `std.containment` at that bullet; it is kept. |
| A bullet under `Assessments` in no known form | `std.unreadableEntry` at that bullet. |

**Correction.** The specification's assumption named "no list of bullets" as a second cause of an unreadable file. Markdown is never malformed, so FBL section 7.5 gives no ground for it, and a document whose last item was deleted would become read-only for good (R22).

## FBL 0.7

### R9. The `bullets` family

**Decision.** A sixth family, `bullets`: the body is lines as in the `lines` family, with nesting by the indentation of list items.

- **Line kinds.** Blank; a heading; a fence and the lines it encloses, which are unbound; a thematic break, which is never an item; an **item line** (indentation, a marker `-`, `*` or `+`, a space, text); a **continuation line** (not an item, indented deeper than the marker of the nearest item above it); any other line is a **statement**, as in `lines`.
- **Sections.** A binding's `sections` name headings by a regular expression, as `blocks` names the statements that open a block. A rule's `within` names the sections its items stand in. An item in no named section is unbound.
- **Entries and spans.** An item's entry runs from its marker to the end of its last continuation line or of its last nested item. A rule's `line` matches the text of the item's first line after the marker, and its named groups and words are slots as in `lines`. One new slot, `{continuation: true}`, is the item's continuation lines with their indentation taken off.
- **Containment** is `parent`, as elsewhere: the nearest item above with a smaller indentation.
- **Statements** outside items are matched by rules with `line`, as in `lines`. That is how the mark line is bound, and a statement no rule matches is unbound, never reported unless `unmatched` is `report`.
- **New text.** A new item takes the marker and indentation of its previous sibling, else of its next sibling, else stands at the content column of its parent. A missing section is created by `insert.create` with its heading as text, an `ensure-container` at the end of the document.
- **A move to another depth** shifts the indentation of every line of the entry by the difference, and changes nothing else. FBL sections 5.5 and 6.4 say a move keeps "the entry's own bytes"; for this family the rule is the entry's own bytes, re-indented.
- **Never unreadable** by its family: there is no malformed list. A `required` header still applies, and for this family the header's `line` is matched against line 1.

**Rationale.** See the Constitution Check in the plan: a family and a plugin cost each host the same, and only the family puts the reading in this repository. The rules above are Agent Behavior Modelling's, which three hosts have already built (`standalone:src/diagrams/agent-behavior-modelling/backend/…/AbmParser.cs`, `AbmWriter.cs`).

**Where it lands in the document.** Sections 1.5 (six families), 2.4, 3.1, 3.2, a new 4.8, 5.1, 5.2, 5.5, the Families column of 6.1, 6.2, 6.3, 6.4, 7.5, 15.1, Appendix A, and the schema's `Family` and `Body`.

**Alternatives considered.** Extending `lines` with an indentation option: every sentence of `lines` that says "one statement per line" would gain an exception, and `blocks` shows that nesting earns a family. A general Markdown family: FBL's non-goal.

### R10. Two worked examples, one of them a second tool's reading

**Decision.** The family's examples are `specifications/fbl/behavior-tree.fbl`, a declared binding of Agent Behavior Modelling's file format, and the designer's own binding in `definitions/designers/`. Fixtures: `bullets-read`, `bullets-edits`, `behavior-tree-read`.

**Rationale.** The decision asked whether a second tool is in view that would bind its Markdown through the family. One exists and is unbound today: the companion of `etalii/agent-behavior-modelling` records its `.fbl` as "not written yet". Writing its reading as an example proves the family is not shaped to one tool, and costs one binding and one fixture. It changes neither that tool's definition nor any host; hosts keep its plugin until a feature moves it.

**What the example must show.** The keyword in bold with the label after it, Retry's count inside the keyword, a keyword-less item as an implicit Do through a second rule, ids derived from place, notes as continuation lines, and the section appended on the first add. If one of these cannot be declared, the family is corrected before it is merged, not the example dropped.

### R11. An edit against a changed file is refused

**Decision.** FBL 0.7 adds to section 7.2: before applying an edit, a host **MUST** compare the body on disk with the bytes the edit was planned against, and when they differ refuse the edit with a reason, write nothing, and read the body again.

**Rationale.** FR-052. Section 7.2 requires the comparison before an undo and a redo only. The standalone host already refuses ("The file has changed since this edit was made, so it was not written.", `standalone:src/backend/EtAlii.Adp.Documents/WritableDocumentLifecycle.cs`), so this is a host's behaviour coming back to the specification (principle I). Section 7.3 stays as it is: an external change clears the history, so the person's undo stack ends with each write an agent makes. That is recorded in the hand-off as something a person will notice.

### R12. A binding declares further blocks of the registration

**Decision.** `registration.blocks` in a binding names further blocks, as `registration.headers` names further headers. A declared block has the grammar the registration already has: the block's name and a colon on a line, then entries `<key>: <value>`, indented two spaces.

| Property | Values | Meaning |
|---|---|---|
| `order` | `ordinal` (default), `kept` | `ordinal`: entries are written in the ordinal order of their keys, as `layout:` is. `kept`: an entry stands where the edit put it, and a move is a `remove-entry` and an `insert-entry` of the same bytes. |
| `keys` | `ids`, `names` (default) | `ids`: the key is an element's id; an entry whose id is not in the model is stale and pruned with the next write, as section 8.5 says of layout. |
| `history` | `true` (default), `false` | `false`: writes to the block are not steps of the body's history. |

- A value is one line and **MUST NOT** contain `: `, since the key is everything before the last `: `; an edit that would write one is refused.
- A block that is not declared is kept and reported as `fbl.unknown-block`, an information finding, as an unknown header is.
- Blocks are written in the order the binding declares them, after `layout:` and `identities:`.
- The fixture format gains an edit, `setting`, beside `place`: a block, a key, and a value, a position or a removal.

**For this designer** the registration is:

```text
etalii/hierarchical-requirement
body: web-shop.md
tags:
  security: red
  core: default
categories:
  functional: blue
  non-functional: purple
  technical: brown
states:
  proposed: gray
  accepted: green
  rejected: red
  done: blue
collapsed:
  ITEM-0002: yes
filters:
  Open security: #security state:proposed sort:state
```

`tags`, `categories`, `states` and `filters` keep their order and are keyed by name. `collapsed` is ordinal, keyed by id, pruned when stale and outside the history, so that undo takes back the last change to the requirements and not the last box the person folded.

**Rationale.** See the Constitution Check. FBL section 8.3 ends "Other view data … is not stored in FBL 0.1"; this is that other view data, in the grammar already there. FBL stays ignorant of what a value means, which is the specification language's (R13).

**Found on the way.** The validator's `parse_registration` fails a file with a block it does not know, and the standalone host stops reading at one, where section 8.1 says trailing content is kept as unbound. The validator is corrected with this change; the host's reader is listed in the hand-off.

**Alternatives considered.** Headers with long values (`collapsed: ITEM-0002 ITEM-0009 …`): one line that every collapse rewrites, and no pruning per entry. One flat `settings:` block with dotted keys: the order of a list would be numbers that a reorder rewrites one by one. A second file: against the maintainer's rule, which names the `.adp`.

## DESL 0.2

### R13. `persistence.settings` says what is kept in the registration

**Decision.** `persistence.settings` maps a block of the registration to part of the model, in one of two forms.

| Form | Properties | Meaning |
|---|---|---|
| A list | `type`, `key`, `value`, `initial` | The elements of `type` are the block's entries, in the block's order: the attribute `key` is an entry's key and the attribute `value` its value. `initial` lists the elements a document has while the block is absent. |
| A state | `attribute`, `of` | The attribute `attribute` of the elements of the types `of` is kept in the block, keyed by the element's id. Only a value that differs from the attribute's default is stored. |

- A change to such an element or attribute is planned as an edit of the registration, in the same transaction as any change to the body (FBL section 8.4).
- A block is absent or complete. Changing one member writes the whole list.
- An element of a settings type takes its id from its key, by a derived rule.

**For this designer.** `Tag`, `Category` and `State` (key `name`, value `colour`), `Filter` (key `name`, value `query`), and the state `collapsed` of `Item` and `Requirement`. `Category` starts as functional, non-functional and technical; `State` as proposed, accepted, rejected and done; `Tag` and `Filter` start empty.

**Implicit members.** A name that an entry carries and its list does not hold is a member of the list all the same: it stands after the stored members, in order of first appearance, with the default colour. This is stated with the surface's roles (R14) and is FR-029: the agent touches no other file.

**What is lost with the registration.** Colours, order, what is collapsed and the stored filters, as FR-004 lists, and also a tag, category or state that no entry carries, since only the registration knew it. The initial categories and states return. FR-005 and the edge case are corrected to say so (R22).

**Rationale.** DISL has `persistence.view.store` for a diagram's view data; DESL has nothing, because the Knowledge designer keeps everything in its document. Tag colours and stored filters are more than view data: a tag is renamed, a filter is named. Mapping a block to a type keeps them elements, so the ordinary actions (`create`, `set`, `delete`, `reorder`) change them and no second set of actions is needed.

### R14. The `hierarchy` surface kind

**Decision.** A second surface kind, named for what it lays out and for no designer type (section 7.1). Its roles:

| Role | Names | Meaning |
|---|---|---|
| `levels` | a type, its `title` and `description` attributes | The elements drawn as boxes that contain. The type contains itself and the entries' type. |
| `entries` | a type, its `title` and `description` attributes | The elements a level holds that contain nothing. |
| `labels` | per attribute: the types it is on, `many`, and `options` (`type`, `name`, `colour`) | Attributes whose values name the members of a list. With `many` they are drawn as tags below the title. A value that names no member is an implicit member (R13). |
| `notes` | a type and its `about`, `kind`, `text`, `detail` and `resolved` attributes | Elements that stand at the level or entry they are about, as an icon that opens a list. |
| `collapsed` | an attribute | The boolean attribute that folds a level or an entry. |
| `filters` | a type and its `name` and `query` attributes | The stored filters (R17). |
| `ids` | `shown`, `hidden` | Whether an element's id is shown beside its title. |

The section states the layout every host draws:

- one page that scrolls from top to bottom, with no second pane (FR-015);
- a level is a box; its entries, then its levels, stand to its right, and it is as high as they are; neighbouring boxes share their borders (FR-016);
- a title and an optional description on each (FR-018), with mentions drawn as boxes in the text (R6);
- a collapsed level or entry shows its id, title, tags and notes icon only (FR-019);
- **focus** (FR-017): the page shows as many levels as fit its width, marks a level whose deeper levels do not fit, and lets the person make any level the left edge of the page, with a trail of the levels above it. Focus is the viewer's and is not stored;
- **notes** (FR-036): the icon of the kind for one unresolved note, an icon for several, a way to add the first when there is none; a collapsed level's icon also stands for the unresolved notes of everything inside it.

**Rationale.** Role names are generic so that one host component serves all designers of the kind, as the table's does. What the layout looks like is normative because every host has to draw the same page; how a host draws a tag or a menu is the looks of the Knowledge designer (FR-021), which the companion names and DESL does not.

**Alternatives considered.** Extending the table kind with nested rows: the Knowledge designer already nests rows by a parent relation, and a row there is one line across columns, which is the layout the maintainer set this against. A general layout language: one layout is needed.

### R15. A `move` action

**Decision.** DESL 0.2 adds the action `move`: an element, a new `parent`, an optional `slot`, and `after` or `before` a sibling. It is planned as FBL's `move` change (section 11.2), so the entry's bytes travel unchanged, re-indented in the `bullets` family.

**Rationale.** FR-023. `reorder` changes only the place among siblings (section 8.2), and a delete followed by a create would give the entry a new number, against FR-011.

### R16. What DESL 0.2 holds, in one list

1. The surface kind `hierarchy` (R14).
2. The id strategy `counter` (R5).
3. The facet `mentions` and the built-in `std.mentions` (R6).
4. The action `move` (R15).
5. `persistence.settings` (R13).

FR-057 named the first two. The other three were found by reading DESL against the requirements, and each is a requirement no host can share without it. The schema's `Surface` becomes one shape per `kind`, `desl` accepts `"0.1"` and `"0.2"`, and section 10.1 step 4 gains the name checks of the new kind. `minimal-hierarchy.des` and `minimal-hierarchy.fbl` are the worked example, beside `minimal-table`.

### R17. A filter is a line of words, in the file's own notation

**Decision.** A filter's `query` is words separated by spaces:

| Word | Selects |
|---|---|
| `#name` | Entries that carry the tag. |
| `category:name`, `state:name` | Entries with that category or state. |
| `item:pattern` | Levels whose title matches the pattern, with everything in them. `*` is any run of characters and `?` one character, in any case; the pattern has no space, so `?` or `*` stands for one in a title. |
| `sort:key` | The order of the entries within each level: `number`, `title`, `category` or `state`, ascending. A category or a state sorts by its place in its list. |

Words of one kind are alternatives; kinds combine. A level is shown when an `item:` word selects it or one above it, or none is given, and it holds an entry that is shown or no entry word is given. Nothing a filter does changes the file (FR-049). A stored filter is a name and a query in the registration's `filters` block.

**Rationale.** FR-045 to FR-048 ask for four ways to narrow, a sort and a stored form. One line of words is the smallest thing that is all of them, it is the same notation as in the file (R2), and it fits one value of a registration entry (R12). The Knowledge designer's views are a tree of conditions stored in its document; nothing here asks for nesting.

## The definition

### R18. Names

| What | Name |
|---|---|
| Origin | `etalii/hierarchical-requirement` |
| Language id | `net.etalii.adp.etalii.hierarchical-requirement` |
| Label, the name users see | `Hierarchical Requirement Designer` |
| Files | `definitions/designers/hierarchical-requirement.des`, `.fbl`, `.md`, `.schema.json`, `examples/web-shop.md`, `examples/web-shop.adp` |
| Binding | `hierarchical-requirement.fbl#markdown` |
| Extension | `.md`, shared, with the envelope as marker |
| Types | `Item`, `Requirement`, `Assessment`, `Tag`, `Category`, `State`, `Filter` |

`item` is a reserved attribute name in DESL (section 2.2); `Item` as a type name is not, and no attribute is named `item`. The binding stores a requirement's `category:` and `state:` under attribute names that are not reserved.

### R19. A new document, and the legend

**Decision.** The binding's `template` is the whole text of a new document, written with CRLF as the Knowledge and Agent Behavior Modelling templates are: the envelope, the mark line, the title `{base}`, the legend, the starting structure and an empty `Assessments` section. The numbers in it are written out (`ITEM-0001` onwards), with the mark line naming the last of each, so the template needs no new placeholder.

- **The starting structure** is five top items, User interface, Integration, Backend, Data and Processes, each with one or two requirements, and one sub-item under two of them: at most two levels and at most three requirements in an item (FR-007).
- **The legend** tells an agent, in a dozen lines: what the two headings hold; that a number is never changed and never used again; to add an entry as `ITEM-NEW` or `REQ-NEW`; that lines under a bullet describe it; tags, category and state at the end of the line; `[REQ-0001]` to refer; an assessment as `- [ ] Question REQ-0001: …` and `[x]` to resolve; and to leave the first two lines alone. Its examples stand in a fenced block.

**Rationale.** FR-006 asks that an agent that has never seen the tool can add an item, a requirement, a tag, a reference and an assessment from the legend alone. Agent Behavior Modelling's legend is the model: "The legend is what lets a model that has never heard of behavior trees follow one."

### R20. How the Build workflow checks a Markdown document

**Decision.**

- `validate-examples.py` takes `.md` files under `definitions/designers/examples/` and the Markdown example under `specifications/ded/` as examples. The companion documents one folder up are not examples.
- It reads the envelope of any Markdown definition, which is DED's check.
- It reads a requirement document with a reader written for this designer, as `check_knowledge` and `knowledge_from_xml` are written for the Knowledge designer, into a JSON form that `hierarchical-requirement.schema.json` describes. That schema refines DED's `$defs/Definition`, as `knowledge.schema.json` does.
- It reports what reading the document would report: an unreadable bullet, a duplicate number, a mention or an assessment that names nothing, a requirement out of place.
- `resolve_desl` branches on `surface.kind`; `parse_registration` reads declared blocks and keeps unknown ones.
- The exact bytes of every edit are proven by FBL fixtures over the designer's binding, replayed splice by splice.

**Rationale.** This is the mechanism the repository has. A generic interpreter of bindings in the validator would be a seventh host.

### R25. Smaller rules

Settled so that the definition's tasks do not have to.

| Question | Rule |
|---|---|
| Attribute names | `Item` and `Requirement`: `title`, `description`, `tags`, `collapsed`. `Requirement` also `category` and `state`. `Assessment`: `kind`, `about`, `text`, `detail`, `resolved`. The document: `lastItem`, `lastRequirement`. `Tag`, `Category`, `State`: `name`, `colour`. `Filter`: `name`, `query`. None is reserved in DESL. |
| Colours | The Knowledge designer's enumeration `Colour`, Notion's ten names. A member created in the designer or adopted from the file is `default`. The initial categories are functional `blue`, non-functional `purple`, technical `brown`; the initial states proposed `gray`, accepted `green`, rejected `red`, done `blue`. |
| The value of a `collapsed` entry | `yes`. |
| Renaming or deleting a category or a state | As a tag (FR-028): every requirement that carries it follows a rename, and loses it on a delete, in the same step. A delete of a member that is carried asks first. |
| Implicit members when a list is written | They become stored members, after the others, in their order. |
| Spelling | The list's spelling is what the designer shows. An entry keeps the spelling it was written with until the member is renamed. A member adopted from the file takes the spelling of its first appearance. |
| A number with fewer digits | `REQ-12` is accepted as written and is not the id `REQ-0012`: ids are strings. Its number counts for the mark, so the strategy never gives a number that any entry carries in any form. |
| The order in the file | Kept as written. The surface shows an item's requirements above its sub-items whatever the file's order. The designer writes a new requirement after the item's last requirement, or before its first sub-item when it has none, and a new sub-item after the item's last child. |
| An empty title | `std.required` on `title`. |
| Reopening an assessment | Resolving is a switch: the same control sets `[x]` and `[ ]`. |
| Where mentions are read | In a description, and in an assessment's text and detail. Not in a title. |
| Derived ids | An assessment: `assessment/` and its place among the assessments, ephemeral. A member: `tag/`, `category/` or `state/` and its name in lower case. A filter: `filter/` and its name. |
| Severities | `std.mentions` is a warning. `fbl.unknown-block` is information. An envelope of another designer type or a later version is reported as DED section 4 says, with no code of this designer's. |
| Sorting | A requirement without the category or state it is sorted by stands last. Of several `sort:` words the first counts. |
| Giving a duplicate a new number | Part of the `counter` strategy, not an operation: a runtime offers it on an element that `std.duplicateId` reports, and writes the next number in place of the old one. |
| Moving within one item | `reorder`, as DESL 0.1 has it. `move` is for another parent. |
| Icons | The kinds of assessment are an enumeration whose values each name an icon, as the Knowledge designer's value types do. The icon that stands for several is the host's. |
| A stale `collapsed` entry | As FBL section 8.5 says of layout: reported as `fbl.stale-view-data` and removed with the next write of the registration. |
| What pull request 4 carries beside the blocks | The widening of `createOnFirstPlacement` to the first setting. The fixture `registration-blocks` brings a small binding of its own that declares its blocks, as `insert-empty-yaml` brings `cards.fbl`; the example registration is parsed without one. |
| Collapsing an entry without a usable number | For the session only: an ephemeral id keys nothing that is stored (DESL section 5.3.3). |
| The JSON form the validator reads a document into | The envelope's two values, the two marks, `items` (each with its id, title, description, tags, `requirements` and `items`), and `assessments`. The file schema's task fixes the rest. |

## Around the definition

### R21. Left out on purpose

- **A `plugins` key in DESL.** Only the fallback needs it (R23).
- **Descending sort, free-text search, a stored focus.** No requirement asks for them.
- **A metamodel facet for managed lists.** The lists are named by the surface's `labels` role, as the table's `options` are.
- **Designer-specific finding codes.** The built-ins cover every case in R8, with `std.mentions` added.
- **Merging two writers' edits, rich text, references that leave the document.** Out of scope in the specification.

### R22. Corrections to the specification made while planning

| Where | Was | Is |
|---|---|---|
| FR-006 | A new document begins with a legend. | It carries a legend ahead of the hierarchy; line 1 is the envelope (R3). |
| FR-025 | An edit changes only the bytes of the entries it concerns. | And of the entries it numbers under FR-013, and the mark line (R5). |
| FR-057 | Two constructs of DESL. | Five (R16). |
| Assumptions | A file becomes a requirement document by its envelope and its registration, as Agent Behavior Modelling's does. | By its envelope, as a Knowledge file does; the registration adds what FR-004 lists (R4). |
| Assumptions | Unreadable only when no envelope or no list of bullets can be found. | Only when the envelope is missing or the file is not UTF-8 (R8). |
| Assumptions | Tags are anchors at the end of the title line; category and state "in a form the plan settles". | `#name`, `category:name`, `state:name`, names without whitespace (R2). |
| Assumptions | A reference is a link that names the number. | The number in square brackets (R6). |
| Edge cases | The registration is missing. | Adds what else is lost: a tag, category or state no entry carries (R13). |
| Edge cases | | Added: an add that is undone frees its number (R5); a bullet that is neither `ITEM-` nor `REQ-` (R8). |

### R23. If a reserved construct is refused at review

The fallback on record is a persistence plugin and the registration as it is. It is not free, and the review should know its price.

- **Without the family**: the binding names a plugin as its reader. DESL has no `plugins` (FBL section 1.3: "DESL 0.1 has no plugins"), so DESL 0.2 gains that key in place of nothing. The reading rules of R1, R2 and R9 move from FBL into the companion's prose and each host's code, and `behavior-tree.fbl` and the `bullets` fixtures are dropped. The file format does not change.
- **Without declared blocks**: `persistence.settings` has nowhere to write. The lists, the collapsed state and the stored filters then go into the Markdown, as comment lines the binding reads, against the maintainer's rule, or the first version has no colours, no remembered folding and no stored filters. That is the maintainer's choice to make if it comes to it.

### R24. What the standalone host has to build and settle

Found by reading the host at `f45a4d50c`. None of it is this repository's to change; all of it goes into the hand-off.

- **A second shared surface.** The designer family is the table from end to end: `IDesignerSession`, `designers.proto`, `useTableStream`, `TableSurface`. `declarativeDesignerModules.test.ts` refuses any element written in a module's client. The `hierarchy` surface is therefore core work (model, wire, client library), and the tag components the specification wants to reuse sit inside the table library, bound to the table model.
- **No DESL library.** The host reads no `.des`; a developer writes the module from the definition and `DefinitionConformance.Tests` compares vocabularies.
- **FBL.** A `bullets` reader beside `Files\{Json,Lines,Xml,Yaml}`, declared registration blocks in `RegistrationDocument`, whose reader stops at an unknown block today, and the drift check before an edit. The host's vendored conformance corpus is FBL 0.1 with selected additions.
- **An existing `.md` cannot be added as a designer document.** `DesignerAddOptions.Plan` refuses when the body exists, and `DesignerFileRouter` claims no body by its content. US1 opens a file an agent wrote, so both have to change.
- **Deleting the registration.** The module guide says deleting either file removes the other. US7's test deletes the registration and keeps the document.
- **`.md` has two owners already**: the Markdown editor by extension and Agent Behavior Modelling by registration.
- **Undo after an agent's write.** FBL section 7.3 clears the history on every external change (R11).
- **Spec 025 moves these seams.** It joins the three tool-family routers, catalogs and factories, with 92 of 276 tasks ticked. The host's specification of this designer is written after it.
