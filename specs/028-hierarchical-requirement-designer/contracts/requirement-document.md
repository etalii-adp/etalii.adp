# Contract: the requirement document and its registration

What an agent, a host and a fixture read and write. Every rule cites the functional requirement (FR) of [the specification](../hierarchical-requirement-designer.spec.md) or the decision (R) of [research.md](../research.md) it comes from. What is left to the task that writes a file is listed under [Left to the tasks](#left-to-the-tasks). The attribute names, the colours and the other smaller rules are in research.md R25.

## Identifiers

Copied exactly. A consumer or a test codes against these.

| Identifier | What it is | Source |
|---|---|---|
| `Hierarchical Requirement Designer` | The name users see. | Verbatim Constraints, FR-001 |
| `ITEM-000x` | An item's number. | Verbatim Constraints, FR-009 |
| `REQ-000x` | A requirement's number. | Verbatim Constraints, FR-009 |
| `#` | What the person types in a description to open the lookup of requirements and items. It is a key, not what is written in the file. | Verbatim Constraints, FR-040, R6 |
| `etalii/hierarchical-requirement` | The designer type's origin: the `designer` of the envelope and line 1 of the registration. | R18 |
| `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->` | The envelope, line 1 of the file. | R3 |
| `<!-- last: ITEM-0003 REQ-0004 -->` | The mark line, line 2: the last number given of each kind. | R5 |
| `Requirements`, `Assessments` | The text of the two headings whose list items are read. | R1 |
| `ITEM-NEW`, `REQ-NEW` | What a writer puts in place of a number on an entry it adds. | R5 |
| `#name`, `category:name`, `state:name` | A tag, a category and a state at the end of a title line. | R2 |
| `[REQ-0002]`, `[ITEM-0004]` | A reference in a description. | R6 |
| `- [ ] <Kind> <number>: <text>` | An assessment, with `[x]` when it is resolved. | R7 |
| `Question`, `Remark`, `Warning`, `Idea` | The kinds of assessment. | R7, FR-033 |
| `.md` | The extension, shared with every other Markdown file. | R4, R18 |

## The file

One Markdown file for one subject (FR-002). The example is R1's.

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

| Part | How it is found | Who writes it | Source |
|---|---|---|---|
| Envelope | Line 1. | The template, once. Nobody afterwards. | R3, DED section 5 |
| Mark line | Line 2. | The designer, with every numbering. A writer of text leaves it alone. | R5, R19 |
| Hierarchy | The list items under the first heading whose text is `Requirements`, at any heading level, in any case. The section ends at the next heading of the same or a higher level. | Both. | R1 |
| Assessments | The list items under the first heading whose text is `Assessments`, by the same rule. | Both. | R1, FR-032, FR-034 |
| Everything else | The title, the legend, any other section, and every fenced block. | The writer. Kept byte for byte, never read as an entry and never reported. | R1, R9, FR-055 |

The mark may name a higher number than any entry in the file carries, because numbers of deleted entries are not given again (FR-012).

## A bullet

| Rule | Source |
|---|---|
| An item is `- ITEM-0004 <title> <words>`, a requirement `- REQ-0031 <title> <words>`. | R2, FR-009 |
| The markers `-`, `*` and `+` are all read. A new bullet uses the marker its list already uses. | R2 |
| The trailing words are the maximal run of words at the end of the line that are each `#name`, `category:name` or `state:name`. The title is what stands between the number and that run. | R2 |
| The designer writes tags first, in the order they were added, then the category, then the state. It reads them in any order. | R2 |
| A name of a tag, a category or a state has no whitespace. Typing a space in the designer writes `-`. Names compare ignoring case. | R2 |
| The description is the lines indented under the bullet that are not bullets themselves, blank lines between them included. | R2, FR-018 |
| The children are the bullets indented under a bullet. A tab counts as four columns. | R2 |
| An item contains requirements and items, to any depth. A requirement contains nothing and stands in an item. | FR-008, Key Entities, R8 |
| A requirement carries at most one `category:` and at most one `state:`, and may have neither. Of several the first counts and the others stay as written. An item carries tags only. | R2, FR-030, FR-031, Key Entities |
| A title cannot end in a word that reads as a tag, a category or a state. This is a known limit, stated in the companion. | R2 |

## Numbers

| Rule | Source |
|---|---|
| Items and requirements are counted apart, per document, upwards: `ITEM-0003` and `REQ-0003` name different entries. | FR-010 |
| A number has at least four digits and grows past `9999` without any existing number changing. | R5, Edge Cases |
| A number never changes once given, whatever happens to its entry. | FR-011 |
| A new number is one more than the higher of the mark and the highest number read in the document, and the mark is set to it in the same transaction. | R5, FR-012 |
| A writer of text adds an entry as `ITEM-NEW` or `REQ-NEW`. It is shown, reported by `std.missingId`, and numbered with the next edit the designer writes, never when the document is only opened. | R5, FR-013 |
| A number the writer chose is accepted when it is free, and the count continues past it. | R5, Edge Cases |
| Of several entries with one number, the first in reading order keeps it. Each later one is reported by `std.duplicateId` and cannot be referred to until the person gives it a new number. The designer never renumbers by itself. | R5, FR-014 |
| A missing mark line reads as no mark: the count continues from the highest number in the file, and the line is written again with the next numbering. | R5 |
| Undo restores the mark with the rest of the body, so an add that is undone frees its number. | R5, Edge Cases |

## References

| Rule | Source |
|---|---|
| A reference is the number in square brackets, `[REQ-0002]` or `[ITEM-0004]`, in a description. It names one requirement or item of the same document. | R6, FR-041, FR-043 |
| A link with a target, `[text](https://…)`, is an ordinary link and not a reference. | R6, FR-043 |
| A reference has no kind such as "depends on". | Assumptions |
| The text of a reference is never changed by the designer, also when its target is deleted. A reference that names no element is reported by `std.mentions`. | R6, FR-044 |

## Assessments

| Rule | Source |
|---|---|
| An assessment is `- [ ] <Kind> <number>: <text>`, with `[x]` when it is resolved. | R7, FR-032, FR-038 |
| The kinds are `Question`, `Remark`, `Warning` and `Idea`, read in any case. | R7, FR-033 |
| The checkbox may be left out, which reads as unresolved. | R7 |
| Lines indented under the bullet are its detail. | R7 |
| The number names exactly one requirement or one item of the same document. | FR-035 |
| An agent resolves an assessment by writing `[x]`. In the designer, resolving is one `replace-value` of one character. | R7, Assumptions |
| A resolved assessment stays in the file. | FR-038 |
| An assessment whose entry no longer exists is kept and reported by `std.mentions`. | R6, FR-039 |
| The first assessment added to a file without the heading appends the section at the end of the file. | R7 |
| An assessment has no number of its own: its id is derived from its place and is ephemeral. | R7 |

## What reading reports

| What is found | What the designer does | Source |
|---|---|---|
| No envelope on line 1, or a file that is not UTF-8 | Unreadable: read-only, one `std.unparseable` finding, never written. The last readable content stays on screen when the document was open, and the page is empty when it was not. | R8, FR-054 |
| An envelope that names another designer type or a later version of DED | As DED section 4 says: the envelope decides, with a finding, and a later version opens read-only. | R8 |
| No `Requirements` heading, or no bullet under it | An empty document, readable and editable. The first item added appends the section. | R8 |
| A bullet in the hierarchy that is neither an item nor a requirement | `std.unreadableEntry` at that bullet. Its bytes, with everything nested in it, are kept and not read. Every other entry stays editable. | R8, FR-053 |
| A requirement at the top level, or a bullet nested under a requirement | `std.containment` at that bullet. It is kept. | R8 |
| A bullet under `Assessments` in no known form | `std.unreadableEntry` at that bullet. | R8 |
| `ITEM-NEW` or `REQ-NEW` | `std.missingId`. | R5 |
| A number an earlier entry carries | `std.duplicateId`. | R5 |
| A reference or an assessment that names no entry | `std.mentions`. | R6 |

## What writing guarantees

| Guarantee | Source |
|---|---|
| A document that is opened and saved without an edit is byte for byte what it was. | SC-004 |
| An edit changes only the bytes of the entries it concerns, of the entries it numbers under FR-013, and of the mark line. | FR-025 |
| A new item takes the marker and indentation of its previous sibling, else of its next sibling, else stands at the content column of its parent. | R9 |
| A move to another depth shifts the indentation of every line of the entry by the difference and changes nothing else. No number changes. | R9, R15, FR-011 |
| A rename or a delete of a tag updates every entry that carries it in the same undoable step. | FR-028 |
| A change of a colour or of a place in a list, collapsing, narrowing, sorting and focusing on an item do not change the Markdown file. | FR-049, User Story 7 scenario 3 |
| An edit made against a file that has changed since it was read is refused and reported, nothing is written, and the body is read again. Edits of two writers are never merged. | FR-052, R11 |
| A new document is the binding's template, written with CRLF. An edit afterwards follows the file's own line endings, as FBL section 6.3 says. | R19 |

## The registration

The registration stands beside the file and holds what an agent does not need to read, and only that (FR-004). The example is R12's.

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

| Block | An entry | `order` | `keys` | `history` | Source |
|---|---|---|---|---|---|
| `tags` | `<name>: <colour>` | `kept` | `names` | `true` | R12, R13 |
| `categories` | `<name>: <colour>` | `kept` | `names` | `true` | R12, R13 |
| `states` | `<name>: <colour>` | `kept` | `names` | `true` | R12, R13 |
| `collapsed` | `<number>: <value>` | `ordinal` | `ids` | `false` | R12, R13 |
| `filters` | `<name>: <query>` | `kept` | `names` | `true` | R12, R13, R17 |

| Rule | Source |
|---|---|
| A block is the block's name and a colon on a line, then entries `<key>: <value>`, indented two spaces. | R12 |
| The key is everything before the last `: ` of the line. A value is one line and does not contain `: `. An edit that would write one is refused. | R12 |
| Blocks are written in the order the binding declares them, after `layout:` and `identities:`. | R12 |
| A block is absent or complete. Changing one member writes the whole list. | R13 |
| While `categories` is absent the list is functional, non-functional and technical. While `states` is absent it is proposed, accepted, rejected and done. `tags` and `filters` start empty. | R13, FR-030, FR-031 |
| A name an entry carries and its list does not hold is a member all the same: it stands after the stored members, in order of first appearance, with the default colour. An agent never touches the registration. | R13, FR-029 |
| `collapsed` stores only a value that differs from the attribute's default. An entry whose number is not in the model is stale and pruned with the next write. Its writes are not steps of the body's history. | R12, R13 |
| A block that is not declared is kept and reported as `fbl.unknown-block`, an information finding. | R12 |
| The registration is optional. Without one the document shows default colours and order, nothing collapsed and no stored filter. The first setting the person changes creates it. | R4, FR-005 |
| Deleting the registration loses colours, order, what was collapsed, the stored filters, and a tag, category or state that no entry carries. It loses no tag, category, state, reference or assessment that the file holds. | R13, FR-005, SC-006 |

### A stored filter's query

Words separated by spaces, in the file's own notation (R17).

| Word | Selects | Source |
|---|---|---|
| `#name` | Entries that carry the tag. | R17, FR-045 |
| `category:name`, `state:name` | Entries with that category or state. | R17, FR-045 |
| `item:pattern` | Items whose title matches the pattern, with everything in them. `*` is any run of characters and `?` one character, in any case. The pattern has no space, so `?` or `*` stands for one in a title. | R17, FR-046 |
| `sort:key` | The order of the requirements within each item: `number`, `title`, `category` or `state`, ascending. A category or a state sorts by its place in its list. | R17, FR-047 |

Words of one kind are alternatives, and kinds combine. An item is shown when an `item:` word selects it or one above it, or none is given, and it holds an entry that is shown or no entry word is given (R17).

## Who relies on what

| Reader or writer | Relies on | Source |
|---|---|---|
| An agent | The legend at the head of the file, and nothing else: the two headings, numbers that are never changed or used again, `ITEM-NEW` and `REQ-NEW`, lines under a bullet as its description, the trailing words, `[REQ-0001]`, the assessment form with `[x]`, and leaving the first two lines alone. It never reads or writes the registration. | R19, FR-006, FR-003 |
| A host | The binding `hierarchical-requirement.fbl#markdown` for the file and its declared blocks for the registration. It recognises a bare `.md` by its envelope, without a registration. | R4, R18 |
| A fixture | The same bytes: an input file compared byte for byte, the splices of every step as UTF-8 byte offsets, and, for the registration, the `setting` edit. | R12, R20, FBL section 15.3 |

## Left to the tasks

| What is open | Left to |
|---|---|
| The exact wording of the legend. R19 fixes what it tells an agent and that its examples stand in a fenced block. | The task that writes the template in `hierarchical-requirement.fbl` |
| The exact text of the template: the titles of the requirements and of the two sub-items in the starting structure. R19 fixes the five top items, the limits of FR-007 and the parts in order. | The same task |
| The regular expressions of the header, the marker, the sections and the rules, and the kind of marker. | The same task |
| The property names of the JSON form a requirement document is read into, beyond the outline in R25. | The task that writes `hierarchical-requirement.schema.json` (R20) |
