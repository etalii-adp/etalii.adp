# Contract: Store

What a Notion database holds when it is the store of one graph: its properties, its rows and their order. The add-on, `scripts/store.mjs` and a person who edits the table by hand all code against this, and so does the in-memory Notion of the tests. Decisions are in [research.md](../research.md) D2, D3, D10 and D14.

The store is stated here as a rule over any FBL binding, because the code that keeps it names no tool type (FR-004, FR-028). The tables for the Gartner hype cycle graph are what that rule gives for the binding `gartner-hype-cycle-graph.fbl#ghg`; they are derived, and a change to the binding changes them with no change to the code.

## The database

| Rule | Requirement |
| --- | --- |
| One database is one graph, and the graph's only store: no document text, no second copy | FR-006 |
| The database has one data source. A database with more is refused with a sentence, in the state `unprepared` | FR-009 |
| A row in the trash is no row | FR-007 |
| A property this contract does not name is left alone: never read, never written, never removed | Edge case: changed by hand |
| A view, a sort or a filter a person adds in Notion is theirs; the add-on reads every row whatever the view shows | FR-007 |

## From a binding to properties

| What the binding has | What the store has |
| --- | --- |
| A rule with `insert`, whose `at` ends in `/*` | A **kind**, named by the rule's `name`. Each entry the rule reads is one row |
| A rule without `insert` whose `at` names one place other than `/` | A kind, named by the rule's `name`, with at most one row |
| A rule whose `at` is `/` | Nothing. Its keys are the binding's `header`, which the binding's `template` writes |
| A rule without `insert` whose `at` ends in `/*` | Nothing. It reads what a store cannot hold |
| The key of a kind's `id.from.key` | The title property, named after that key. The row's title is the entry's id as written |
| Every other `key` of an attribute of a kind | One property, named after the key exactly as the binding writes it |
| A one-place kind whose value is the entry itself | One property, named after the last segment of its `at`. The row's title is the rule's `name` |
| An attribute without a `key` | Nothing: it is computed on reading |

Two properties are the store's own:

| Property | Type | Holds |
| --- | --- | --- |
| `Kind` | select | The row's kind. Its options are the kinds' names |
| `Order` | number | The row's place among the rows of its kind, ascending. Rows with the same number are ordered by their creation time |

A property's type follows from the attribute's type in the specification's `metamodel`, found through `persistence.typeMap`:

| Attribute in the specification | Notion property type | Value |
| --- | --- | --- |
| `string`, `text` | rich text | The text, unformatted. Text longer than one rich-text item holds is split over several and joined on reading |
| `yearMonth` | rich text | As the document writes it, such as `1947-12` or `-3200-01`. Never a Notion date, which cannot hold every year |
| `int`, `number` | number | The number |
| `bool` | checkbox | |
| An enum | select | The stored value, not its label. A value outside the enum is an option of its own, so that it is kept and reported |
| `string` with `many` | multi-select | One option per value, in the document's order |
| A `reference` | relation, to rows of the same data source | The row of the element the reference names. The binding reads it as that row's stored id, its title. A reference to one element holds at most one row. An end that names nothing is an empty relation: the element is kept and reported |

| Rule | Requirement |
| --- | --- |
| A key that two kinds share is one property, and its type MUST be the same for both. A binding where it is not cannot be stored, and the add-on says so | FR-003, FR-005 |
| A key that Notion takes for `Kind`, `Order` or another key's property cannot be stored either; it is raised in `etalii.adp`, never renamed in the store | FR-003 |
| An empty property is an absent key. What an absent key means, and whether an emptied one is removed, kept or refused, is the binding's `empty` | FR-007 |
| A property that does not belong to the row's kind is ignored for that row | FR-007 |
| A row whose `Kind` is empty or names no kind is a finding, and the rest is drawn | FR-013 |
| A relation that holds more than one row for a reference to one element, or a row of a kind the reference does not allow, is a finding, and the rest is drawn | FR-013 |
| The id a reference names when no element has that id cannot be held by a relation. It is not kept, and `put` reports it with the entry named | FR-007 |
| A value Notion cannot hold in its property, such as an option with a comma, is refused when a document is put in, with the entry named | FR-007 |

## The Gartner hype cycle graph

Kinds, for `Kind`: `trend`, `trigger`, `note`, `influence`, `unit`.

| Property | Type | `trend` | `trigger` | `note` | `influence` | `unit` |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | title | the id | the id | the id | the id | `unit` |
| `Kind` | select | x | x | x | x | x |
| `Order` | number | x | x | x | x | |
| `name` | rich text | x | x | | | |
| `description` | rich text | x | x | | x | |
| `tags` | multi-select | x | x | | | |
| `row` | number | x | x | x | | |
| `start` | rich text | x | | | | |
| `stop` | rich text | x | | | | |
| `phases` | number | x | | | | |
| `peak-end` | rich text | x | | | | |
| `trough-end` | rich text | x | | | | |
| `slope-end` | rich text | x | | | | |
| `date` | rich text | | x | | | |
| `text` | rich text | | | x | | |
| `at` | rich text | | | x | | |
| `width` | number | | | x | | |
| `height` | number | | | x | | |
| `from` | relation: `trend`, `trigger` | | | | x | |
| `from-phase` | select: `peak`, `trough`, `slope`, `plateau` | | | | x | |
| `from-edge` | select: `top`, `bottom` | | | | x | |
| `from-at` | number | | | | x | |
| `to` | relation: `trend` | | | | x | |
| `to-phase` | select: `peak`, `trough`, `slope`, `plateau` | | | | x | |
| `to-edge` | select: `top`, `bottom` | | | | x | |
| `to-at` | number | | | | x | |
| `unit` | select: `month`, `year`, `decade`, `century` | | | | | x |

The header `gartner-hypecycle-graph: 1` has no row. A graph in months has no `unit` row. The binding marks the unit read-only, "changed in the file itself"; in Notion it is changed in the database's own table, and that difference is raised in `etalii.adp` ([research.md](../research.md), "Differences to raise").

## Order

| Rule | Requirement |
| --- | --- |
| Within a kind, the document's order is ascending `Order` | SC-003 |
| A new element takes the place the binding's `insert.place` gives; for `after-last` that is the highest `Order` of its kind plus 1 | FR-007 |
| The order of the lists among each other is the binding's, from its `template` and each `insert`; no row holds it | D3 |
| The order of an entry's keys is the binding's `insert.keys`; no row holds it | D2 |
| `Order` need not be dense or start at 1, and a person may renumber it by hand | Edge case: changed by hand |

## Reading and writing

| Rule | Requirement |
| --- | --- |
| Reading asks for every row, 100 a call, and never fails: what cannot be read is a finding | FR-013 |
| The rows are the document. The body the FBL library plans against is built in memory from the rows, by the binding; it is a reading of them, never a source, it is replaced whenever the rows are read again, and it is gone when the page is closed | FR-006, D3 |
| One edit writes the rows and properties its splices land on and no other, by the rule of "From a splice to row writes" below. The rows are not read back and compared to find out what changed | FR-018 |
| The writes of one edit are sent in the order of its splices, and the edits in the order they were made. An undo or a redo made while writes are queued is answered at once, and its writes join the queue behind them | FR-018, FR-026 |
| An undo or a redo is a command, stored the same way. A removed element's row is in Notion's trash, and an undo takes that same row out of it, so its row id, its values and the relations to it are as before. Where the row can no longer be restored, a new row is created with the same values, and the relations that named it are written again | FR-026, SC-005 |
| Before a write, the store asks for rows edited since its last read. If any was edited by somebody else, or created or trashed, nothing is written and the store is read again | FR-022, D10 |
| Writes are queued under Notion's limit of about three requests a second, in the order of the edits | SC-004, research R2 |
| A write that Notion refuses stops the queue: no later write of that edit or of a later edit is sent. The writes already stored are not taken back. The user is told that the edit was stored in part, the store is read again and the history is emptied, so the diagram shows what the database holds | FR-020 |
| While writes are queued the status is `storing`, and the page asks the browser to warn before it is closed or left, where the browser lets an embedded page do so. Writes not sent when the page closes are not stored; the next opening shows what the database holds | FR-018, FR-020 |

Two stores are the same, for SC-003 and SC-005, when they have the same rows of each kind in the same order with the same values in the properties this contract names and the same relations, compared by the stored ids of the related rows. Notion's row ids, edit times, `Order` numbers and unnamed properties do not count.

## From a splice to row writes

An edit is planned by the FBL library as splices. Each comes to row writes by this rule, from the binding alone.

| A splice that | Comes to |
| --- | --- |
| Inserts an entry at a place a kind's rule reads | One row created: `Kind` is the rule's name, `Order` follows from the binding's `insert.place`, with one property per key the entry holds and one relation per reference |
| Removes an entry | That entry's row moved to the trash. What the binding's cascade takes with it is further splices, each resolved the same way |
| Changes the value of a key of an entry | That key's property on the entry's row: set, or emptied when the key leaves the document |
| Changes a key whose attribute is a reference | That key's relation on the entry's row: the row whose title is the new id, or empty when no row has it |
| Moves an entry among the entries of its list | The `Order` of the rows that moved |
| Changes the value of a one-place kind | The property of that kind's one row; the row is created when there is none, and trashed when the value leaves the document |
| Changes only how a value is written, or a part of the body no rule reads | Nothing |

| Rule | Requirement |
| --- | --- |
| The kind is found from the splice's place: it is the rule of the binding whose `at` matches that place | FR-004 |
| The row is found from the entry: it is the row of that kind at the entry's position in the document's order, which the store keeps beside the body it built | FR-004 |
| The property is found from the key: it is the property of that name | FR-004 |
| No code names a kind, a key or a property to find them | FR-004, FR-028 |
| A splice that fits no row of the table above cannot be resolved. The whole edit is then refused: nothing is written and the model does not change | FR-019 |

## Preparing a database

`prepare` makes a database a store: it renames the title property after the id key, and adds `Kind`, `Order` and every key's property that is missing. It changes no property that exists with the right type, removes none, and touches no row. A property that exists with another type is reported and left alone, and the database stays `unprepared`. The add-on offers it through `id="prepare"`, and `scripts/store.mjs put` does it first.

## `scripts/store.mjs`

```text
node scripts/store.mjs put <database> <file>
node scripts/store.mjs take <database> <file>
```

| Rule | Requirement |
| --- | --- |
| Run from the root of a checkout of `etalii.adp.ide.notion`. `<database>` is a database id or its Notion address; `<file>` is a document of the tool type, here a `.ghg` | D14 |
| The Notion token is read from the environment variable `NOTION_TOKEN`, never from an argument or a file in the repository | FR-010 |
| The add-on is named by `--addon <id>`; with one add-on in the repository it may be left out | FR-028 |
| `put` prepares the database, then replaces its rows by the document's. It refuses a database that has rows unless `--replace` is given | FR-029 |
| `put` reports what a store cannot hold and does not keep: comments, keys the binding does not read, entries that are not a mapping, and the id of a reference that names nothing | FR-007 |
| `put` creates the rows a reference can name before the rows that hold the reference, and writes each relation by row id | FR-007 |
| `take` writes the document the rows give, through the binding, and overwrites `<file>` only with `--force` | FR-007 |
| Exit code 0 when the whole document is stored or written; any other means the store or the file is not to be relied on | SC-003 |
| `put` followed by `take` gives a document that reads the same in the standalone and Visual Studio Code hosts as the original; its bytes may differ | SC-003 |

## Showcase entry

One per graph, under the page "Showcase" of the Notion workspace.

| Page | Title | Holds |
| --- | --- | --- |
| The entry | The graph's display name | The two below |
| The store | `<display name> - Data` | The database of this contract |
| The diagram page | `Diagram` | One embed block with the address of [addon-address.md](addon-address.md) and `store` set to the database beside it |

| Graph | Display name | Source in the other hosts |
| --- | --- | --- |
| The first graph | `Gartner hype cycle graph` | none: it starts empty |
| | `Coal technologies` | `coal-technologies` |
| | `Digital trends` | `digital-trends` |
| | `Electric vehicles` | `electric-vehicles` |
| | `Energy breakthroughs` | `energy-breakthroughs` |
| | `Eras of innovation` | `eras-of-innovation` |
| | `Internet evolution` | `internet-evolution` |
| | `LLMs and agents` | `llms-and-agents` |
| | `Technology trends` | `technology-trends` |
| | `Warfare in Ukraine` | `warfare-in-ukraine` |

The first graph's pages were found as "Gartner Hypecycle Graph", `Gartner HypeCycle Graph - Data` and `Diagram`. They are renamed to `Gartner hype cycle graph`, `Gartner hype cycle graph - Data` and `Diagram`, the tool type's display name (FR-030); their Notion ids, and so the `store` of every embed, do not change. No two entries share a store (US4 scenario 3).
