# Data Model: The Hierarchical Requirement Designer in the Standalone Host

**Feature**: [standalone-hierarchical-requirement-designer.spec.md](standalone-hierarchical-requirement-designer.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

The types the standalone host gains or reshapes for this designer: what each holds, where it lives, the rules on it and how it changes state. The entities of a requirement document itself (item, requirement, number, reference, assessment, tag, category, state, filter, the envelope, the mark line and the registration's five blocks) are [spec 028's data model](../028-hierarchical-requirement-designer/data-model.md) and the definition `definitions/designers/hierarchical-requirement.*` at `etalii.adp` `bfb0c27`, and are not defined again here: where this file and they disagree, they win (spec, Assumptions). Every rule cites the requirement (FR), success criterion (SC) or research decision (R) it comes from.

Paths prefixed `standalone:` are in `etalii.adp.ide.standalone`. They are spec 025's homes where it names one, and those read at `b35336639` otherwise (R1); the first task corrects them against the host as it is when building starts. A type name that does not exist in the host yet is this plan's proposal and may be renamed in review, as long as its contents and rules stay.

## Overview

```text
FBL library (standalone:src/backend/EtAlii.Adp.Specification.Fbl/)          PR 1, 2
├── Family.Bullets, the bullets reader and writer
├── Registration block declarations, declared and undeclared blocks
├── Drift check before an edit (OpenBody)
└── Conformance: fixture steps of FBL 0.7, recursion, derived-id stand-ins

Routing and adding (EtAlii.Adp.Hierarchy, spec 025's ToolRouter and DesignerAddOptions)   PR 3
├── Marker claim, first-line cache
├── DesignerRouted with an optional registration
├── Add outcome for an existing file
└── Delete cascade

Designer core (EtAlii.Adp.Sessions, EtAlii.Adp.Designer)                     PR 4, 5
├── Envelope check (moved from Knowledge, R6)
├── IDesignerSession, ITableDesignerSession, IHierarchySurfaceSession
├── HierarchySurfaceModel: the read model the wire carries
└── HierarchySurfaceGesture: what the person did

Wire (standalone:src/api/designers.proto, workspace.proto)                   PR 5
└── HierarchySurface* messages, WorkspaceMessage.hierarchy_surface

Client library (standalone:src/client/src/hierarchySurface/library/)         PR 5 to 11
└── View state: focus, trail, applied filter, sort, selection, open field, conflict bar, lists

Module (standalone:src/designers/hierarchical-requirement/)                  PR 4 onwards
└── Definition, body, model, operations, session, template, context actions, declarations
```

## The FBL library

### Family

Stored in `standalone:…/EtAlii.Adp.Specification.Fbl/Documents/FblModelTypes.cs`, the enumeration `Family`.

| Change | Rule | Source |
|---|---|---|
| A member `Bullets` beside `Yaml`, `Json`, `Xml`, `Lines` and `Blocks` | Chosen by `Rules/BodyReading.cs` for a binding whose `body.family` is `bullets` | FR-029, R2 |
| `FblDocumentLoader.KnownMinor` goes from 5 to 7 | A binding of FBL 0.7 loads without the "newer than" warning; one of 0.8 or later still gets it | FR-029, Constitution Check IV |

### Bullets reader and writer

New, in `standalone:…/EtAlii.Adp.Specification.Fbl/Files/Bullets/`, beside the readers of the other families. It implements FBL 0.7's `bullets` family as written; its parts are the binding's, not this designer's.

| What it reads | From the binding | Rules |
|---|---|---|
| Header | `header.line`, `required` | A required header missing on line 1 makes the file unreadable (`std.unparseable`) |
| Sections | `sections[]`: `heading`, `caseInsensitive` | The lines after the first heading whose text matches, at any level, up to the next heading of as many `#` or fewer. Everything outside a section is unbound and kept byte for byte |
| Elements | `elements[]`: line rules, word slots, groups, the continuation slot | A bullet's parent is the nearest bullet above with a smaller indentation; a tab counts as four columns. A bullet of the type the specification maps as unreadable is not looked into |
| Text settings | `text.newline`, `text.indent`, `text.finalNewline` | A new file is written with the binding's newline; an edit follows the file's own dominant line ending |

Each element read carries its span (the byte range of its bullet with everything nested in it), its parent's id and its attribute values with their own spans, so that the writer plans a splice of only the bytes an edit concerns (028: FR-025; SC-006).

Validation:

- Every byte the writer produces is one a fixture of `bullets-edits` or `hierarchical-requirement-*` states (SC-006).
- Reading never writes (plan, Constraints).

### Registration block declaration

New, in `FblModelTypes.cs`, read by `FblDocumentLoader` from a binding's `registration.blocks`. `registration.createOnFirstPlacement` is already read (`FblRegistration.CreateOnFirstPlacement`) and is now acted on (R4).

| Field | Values | Meaning | Source |
|---|---|---|---|
| `Name` | The block's key in `blocks` | The line `<name>:` that opens the block | FR-028, FBL section 8.1 |
| `Order` | `kept`, `ordinal` | `kept`: entries in the order they were written or moved to. `ordinal`: entries sorted by key | FR-028 |
| `Keys` | `names`, `ids` | `ids`: a key is an element's id, and an entry whose id is not in the model is stale and pruned with the next write | FR-028 |
| `History` | `true` (default), `false` | `false`: a change to the block is written outside the undo history | FR-004, FR-010, R4 |

For this designer the five declarations are the binding's: `tags`, `categories`, `states` and `filters` kept, by names, in the history; `collapsed` ordinal, by ids, outside it.

### Registration document

`standalone:…/EtAlii.Adp.Specification.Fbl/Registration/RegistrationDocument.cs` and `OpenRegistration.cs`, extended.

| Part | Holds | Rules | Source |
|---|---|---|---|
| Origin line, `body:`, `layout:`, `identities:` | As today | Unchanged | |
| Declared block | Its declaration, and its entries as `(key, value)` in the block's order, each with its span | A block is absent or complete: changing one entry writes the whole block. A value is one line and holds no `: `; an edit that would write one is refused. Blocks are written in the binding's order, after `layout:` and `identities:` | FR-028, 028 data model |
| Undeclared block | Its bytes | Kept as it was, never rewritten, and reported once as `fbl.unknown-block`, severity information. Reading no longer stops at it | FR-028, US3 scenario 3 |

The registration may be absent (see [Registration lifecycle](#registration-lifecycle)). Its creation writes the origin line, and `body:` only when the base names of the two files differ, in the body's dominant line ending, before the edit that caused it is planned and outside the undo history (R4).

### Drift check

`standalone:…/EtAlii.Adp.Specification.Fbl/History/OpenBody.cs` and `SplicedFile.cs`, extended.

| Field | Holds | Rule | Source |
|---|---|---|---|
| The bytes read | The body's bytes when it was last read, or a digest of them with their length | Before an edit is planned, the bytes on disk are compared with them. When they differ, the edit is refused with the shared sentence, nothing is written, and the body is read again | FR-024, R12 |
| The shared sentence | One sentence, owned by the library | Knowledge's module-local sentence (`KnowledgeBody.cs`) is replaced by it in pull request 1 | R12 |

Undo after an outside change keeps `CommandResult.Outdated` and `OutdatedBodyPath` (`standalone:src/backend/EtAlii.Adp.History/_Model/CommandResult.cs`) unchanged: the history stack drops that file's entries and says so at the first undo past them (FR-025, R10, R12).

### Conformance fixture step

`standalone:…/EtAlii.Adp.Specification.Fbl.Tests/Conformance/`, the harness's reading of a `fixture.json`.

| Addition | Rule | Source |
|---|---|---|
| Discovery | `fixture.json` is found at any depth under `Conformance/etalii.adp/`, so the eleven fixtures one folder down run. This feature brings 27 | FR-029, R14 |
| Edit forms | `move`, `setting`, `position`, `slot`, `occurrence`, `expectFile`, and an `edit` that is a list carrying its `x-operation` | R14 |
| Read comparison | `read.elements[].parent` is compared | R14 |
| Derived ids | `tag/<name>`, `category/<name>`, `state/<name>`, `filter/<name>`, `assessment/<n>` resolve through a stand-in beside `Support/NaturalIds.cs` | R14 |
| Corpus copy | The fixtures and the four definition files sit in etalii.adp's layout, unchanged, and are logged with the etalii.adp commit in the corpus `readme.md` | R14 |

Validation: a planted defect in one expected byte fails the run at that step (US3 scenario 2, SC-006).

## Routing and adding

### Marker claim

The binding's `claims`, evaluated by the FBL library's existing `Routing/Router.cs` and `MarkerEvaluator.cs`, which spec 025's `ToolRouter` now calls.

| Field | For this designer | Source |
|---|---|---|
| Extensions | `.md` | R3 |
| Shared | `true`: other tools claim the extension too | R3 |
| Marker | The envelope pattern, on line 1 | R3, FR-002 |
| Origins | `etalii/hierarchical-requirement` | R3 |

### First-line cache entry

Held by the explorer's hierarchy model, keyed by path (R3).

| Field | Holds |
|---|---|
| Path | The file |
| Stamp | What tells a changed file: its length and last write time |
| First line | The bytes up to the first line break, or 1,024 bytes, whichever comes first |

Rules: read only for a file of an extension that a designer claims as shared. Dropped when the file changes. A tree refresh reads no more than this of a Markdown file (R3).

### Routing precedence

| Order | Asked | Claims | Source |
|---|---|---|---|
| 1 | Marker claims of designers, for a file of a shared extension | A `.md` whose line 1 is the envelope, with or without a registration | FR-002, R3 |
| 2 | The diagram router | Agent Behavior Modelling by its registration | R3 |
| 3 | The designer router | A body by its registration | |
| 4 | The editor router | The Markdown editor by extension | |

A registration of another tool whose body carries the envelope routes as the tool router's `Unreadable`, with the reason that its body is a Hierarchical Requirement Designer document (R3, Edge Cases).

### DesignerRouted

`standalone:src/backend/EtAlii.Adp.Hierarchy/_Model/DesignerRouting.cs`, reshaped.

| Field | Before | After | Source |
|---|---|---|---|
| `Definition` | The designer type | Unchanged | |
| `RegistrationPath` | Always present ("A designer's document always has one") | Optional: absent for a body claimed by its envelope with no `.adp` beside it | FR-002, FR-004, R4 |
| `BodyPath` | Optional | Present whenever the document was claimed by its envelope | R3 |

`IDesignerSessionFactory.Open` takes the registration path as optional in the same way (R4).

### Add outcome

Spec 025's `DesignerAddOptions` (T201), for a designer document whose name the person gives.

| Condition | Outcome | Writes | Source |
|---|---|---|---|
| No file of that name | Created from the binding's template, `{base}` replaced by the file's base name | The body only, byte for byte the template; no registration | FR-005, US4 scenario 2 |
| The file exists and line 1 is the envelope of the chosen designer type | Accepted and opened | Nothing | FR-003, R5 |
| The file exists without that envelope | Refused, naming the line the file would need on line 1 | Nothing | R5, Edge Cases |

### Delete cascade

| Deleted | For a designer type whose binding has `createOnFirstPlacement: true` | For every other designer type | Source |
|---|---|---|---|
| The registration | The body is kept | The body is deleted, as today | FR-004, R4 |
| The body | The registration is deleted | The registration is deleted | R4 |

## Designer core

### Envelope check

Moved from the Knowledge module to `EtAlii.Adp.Designer` in pull request 4 if it is local to Knowledge, with this module as its second consumer (R6).

| Envelope on line 1 | Outcome | Writes | Source |
|---|---|---|---|
| `ded: 0.2`, this designer's origin | Readable | Yes | FR-031 |
| A later DED version | Read-only, with the reason | Never | FR-031, US1 scenario 5 |
| Another designer's origin | Routed to that designer, or unrouted | | FR-031, DED section 4 |
| Absent, or the file is not UTF-8 | Read-only, one finding `std.unparseable` | Never | FR-027 |

The envelope is never written after the template (FR-031).

### Session contracts

In spec 025's home for them, `EtAlii.Adp.Sessions` (T266) (R8).

| Contract | Members | Source |
|---|---|---|
| `IDesignerSession` | What both surface kinds share: disposal, and what an editor session owes the file underneath it | R8 |
| `ITableDesignerSession` | The table's members, moved: `Baseline`/`TableBaseline`, `SetWindow`, `SetActiveView`, the table gesture and its `Changed` event | R8 |
| `IHierarchySurfaceSession` | `Model()`: the whole read model. `Changed`: raised with the whole model after every change, or with an edit's outcome. `Gesture(editId, gesture)`: an empty string when accepted, else the sentence saying why it is refused and nothing changed | FR-032, R8 |

Rules:

- A session is per connection and ends with its stream. Two tabs on one document are two sessions over one document (as the table's).
- Every change of the file is a command through `IHistoryStack`, except those the binding puts outside it: the `collapsed` block and the creation of the registration (FR-004, FR-010).
- A refusal is a `CommandResult`, never an exception (standalone principles).

### HierarchySurfaceGesture

What the person did, as the client sends it and the session takes it (R8).

| Field | Holds | Rules | Source |
|---|---|---|---|
| Operation | The name of one operation of `hierarchical-requirement.des` (`addTopItem` … `removeFilter`), or `renumberDuplicate` | The module maps it to its model change; an unknown name is refused | FR-026 |
| Target | The id of the element it is `for`: an entry's number, `assessment/<n>`, `tag/<name>`, `category/<name>`, `state/<name>`, `filter/<name>`, or none for `document` | A target that no longer exists is refused (R11) | FR-026 |
| Parameters | The operation's `params` by name, each a string, a list of strings or an element id | Validated as the `.des` declares: `required`, `minLength`, the attribute's `pattern`; an empty title is refused | FR-026 |
| (confirmation) | Not a field: the client asks before it sends `deleteEntry` for an entry that holds anything or that a reference or an assessment names, counted from the model it holds | [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md), Gestures | FR-014 |

`renumberDuplicate` gives a duplicate entry a new number from its finding; it is part of the `counter` strategy, not an operation of the definition (companion, Gestures and operations; R17).

### HierarchySurfaceModel

The read model the session builds from the module's model and sends whole on open and after every change (R8). Its wire form, field names and ids are those of [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md), which wins where this table differs: the wire carries the entries flat, each with its parent's id. New, in `standalone:src/backend/EtAlii.Adp.Designer/HierarchySurfaceModel/`, beside `TableModel/`, one type per file. It knows no designer type: the module fills it from its own model and supplies the declarations that name the roles (FR-032).

| Type | Fields | Source |
|---|---|---|
| `HierarchySurfaceModel` | `Revision` (counts the models the session sent); `Title` (the document's first heading, for the trail); `ReadOnly` and `ReadOnlyReason`; `Levels` (the top entries, in file order); `Labels` (one `HierarchySurfaceLabelList` per declared label: tags, category, state); `Collapsed` (the set of collapsed ids); `Filters` (the stored filters, in order); `Notes` (every assessment); `Findings` | FR-006 to FR-011, FR-027 |
| `HierarchySurfaceEntry` | `Id` (the number as written when it is usable, `ITEM-0004`, `REQ-0031`; otherwise `line/<n>`, valid for one model, as the contract's Ids say); `Number` (as written, `ITEM-NEW` included); `Role` (`level` for an item, `entry` for a requirement); `Title`; `Description` with its `References`; `Tags` (in the line's order); `Category`, `State` (absent when none); `Children` (in file order: requirements, then items, as written); `UsableId` (false for a placeholder or a duplicate) | FR-007, FR-009, 028 data model |
| `HierarchySurfaceReference` | `Start`, `Length` in the description; `TargetId`; `TargetTitle` (the target's current title); `Broken` | FR-017, FR-018 |
| `HierarchySurfaceLabelList` | `Name` (`tags`, `category`, `state`); `Prefix` (`#`, `category:`, `state:`); `On` (the roles that carry it); `Members` | FR-011, FR-019 |
| `HierarchySurfaceLabelMember` | `Name` (the list's spelling); `Colour` (one of the ten `Colour` names); `Implicit` (carried by an entry, absent from the block); its place is its index | FR-011, 028 data model |
| `HierarchySurfaceFilter` | `Name`; `Query` | FR-019, FR-020 |
| `HierarchySurfaceNote` | `Id` (`assessment/<n>`, ephemeral); `Kind`; `About`; `AboutFound`; `Text`; `Detail`; `Resolved` | FR-015, FR-016 |
| `HierarchySurfaceFinding` | `Code`; `Severity`; `Message`; `EntryId` (absent for a finding of the file or the registration); `Line` | FR-021, FR-027 |

Rules:

- The model carries no focus, filter, sort or selection: those are the client's (R8, FR-008).
- An entry's `Collapsed` is in the set only when its id is usable; a placeholder collapsed for the session is the client's (028 data model).
- A note's id is its position and changes when the file is edited, so a list of notes the client holds open is closed on every new model (R13).
- Size: the whole model of 100 items and 500 requirements is a few hundred kilobytes and is sent within SC-003's two seconds. The code carries the `// simplified:` comment of R8.

### Surface declarations

What the module declares for the shared library to read, on the backend for the read model and on the client for drawing, as `knowledgeDefinition.ts` declares the table's (R9).

| Declaration | For this designer | Source |
|---|---|---|
| Roles | `levels`: `Item`; `entries`: `Requirement`; `notes`: `Assessment` | FR-032, DESL section 7.7.1 |
| Labels | `tags` on both, `category` and `state` on `Requirement`, with their prefixes | FR-011 |
| Note kinds | `question`, `remark`, `warning`, `idea` with the `.des` icons; several: `mdi-comment-multiple-outline` | FR-015, R10 |
| Ids | `shown` | FR-009 |
| Add keys | `Ctrl+Enter`: an entry of the same kind directly below the selected one (`addItemBelow`, `addRequirementBelow`). `Ctrl+Shift+Enter` on an item: a requirement as its first content (`addRequirement`). Both context actions with a `ContextShortcut` | FR-012, R10 |

## Wire

`standalone:src/api/designers.proto` and `workspace.proto`, pull request 5 (R8). The messages in full are in [contracts/hierarchy-surface.md](contracts/hierarchy-surface.md).

| Message | Carries | Rules |
|---|---|---|
| `OpenHierarchySurfaceRequest` | The client's stream id, the document's path | Opens one session on this connection |
| `CloseHierarchySurfaceRequest` | The stream id | Ends it |
| `HierarchySurfaceGestureRequest` | The stream id, the edit id, the gesture | Answered with the refusal sentence, empty when accepted |
| `HierarchySurfaceStreamMessage` | The stream id and one event: the model, an edit's outcome, an outside change while a field is open, or the stream's end | Sent as the `WorkspaceMessage` member `hierarchy_surface`, beside `table`; never a second stream |

## Client view state

Held by `standalone:src/client/src/hierarchySurface/library/`, never written to a file (FR-008, 028: FR-049).

| State | Holds | Rules | Source |
|---|---|---|---|
| Focus | The id of the item at the page's left edge, or none | Lost on reload. When the focused item disappears in a new model, focus moves to its nearest ancestor still there, or to none | FR-008 |
| Trail | Derived from focus: the document's title, then each item above the focused one by number and title | Each step focuses its item | FR-008, R10 |
| Fit | Derived from the page's width: how many levels show from the focus | An item whose deeper levels do not fit carries `mdi-chevron-double-right` with the number of hidden levels | FR-008, R10 |
| Session collapse | Ids without a usable number the person collapsed | Not sent to the session; lost on reload | 028 data model |
| Applied filter | A parsed query: tags, categories, states, item patterns, sort key | Words of one kind are alternatives, kinds combine; `*` and `?` match in any case. A requirement that remains is shown with the items that contain it | FR-019, FR-020 |
| Sort | `number`, `title`, `category` or `state`, ascending, within each item | Never changes the file's order | FR-020 |
| Selection | One entry, one reference box or one finding | Selecting a finding or a reference box reveals its entry (below) | FR-018, FR-021 |
| Open field | The entry id, the attribute (`title` or `description`), the text typed, the model revision it started on | The one thing that can be unsaved (R11) | FR-023 |
| Conflict bar | Shown or not | Shown when a new model arrives while a field is open | FR-023, R10 |
| Open note list | The entry whose icon was pressed | Closed on every new model | FR-016, R13 |
| Lookup | The query typed after `#`, the candidates | Narrowed by number or title; same document only | FR-017 |
| Pending confirmation | The gesture and the message | Sent only when the person agrees | FR-014 |

**Reveal.** Selecting a reference box or a finding changes focus to the nearest item above the target that keeps it in sight, expands every collapsed ancestor of the target and clears the applied filter as far as it hides the target. Expanding is a `toggleCollapsed` gesture, which writes the registration's `collapsed` block only; reveal itself never writes the Markdown file (FR-018, FR-021, US6 scenario 2).

**The assessment icon.** For each entry, counted from the notes whose `About` is its id and that are not resolved: none shows the add control, one the kind's icon, more the icon for several. A collapsed item counts the open notes of everything inside it (FR-015).

## The module

`standalone:src/designers/hierarchical-requirement/`, written by hand from the definition as the Knowledge module is; no `.des` interpreter (plan, Constraints).

| Part | Where | Holds | Source |
|---|---|---|---|
| Definition | `definition/` | The vendored `.des`, `.fbl`, `.md`, and `provenance.json` with the etalii.adp commit; the `.md` is `-text` | R15 |
| Examples | `examples/` | `web-shop.md`, `web-shop.adp`, `LICENSE.md`, `readme.md` | plan |
| Definition and vocabulary | `backend/…/Designer.cs` and beside it | The origin, the name `Hierarchical Requirement Designer`, the type, attribute, enumeration and operation names the vocabulary test compares with the `.des` | FR-001 |
| Body | `backend/…` | The bullets body opened through `OpenBody`: the binding, the bytes read, the elements with their spans | FR-026, FR-027 |
| Model | `backend/…`, POCOs in `_Model/` | The document's `lastItem` and `lastRequirement`; `Item`, `Requirement`, `Assessment`, `Tag`, `Category`, `State`, `Filter` with the `.des` attributes; the findings | 028 data model |
| Operations | `backend/…` | One model change per operation of the `.des`, planned as the fixtures state; a change of the file and the registration in one history step restored by a two-file command after Knowledge's `RestoreKnowledgeFilesCommand` | FR-026, R17 |
| Session and factory | `backend/…` | `IHierarchySurfaceSession` over the body and the optional registration; watches both through spec 025's `WatchedFile` | FR-022, R13 |
| Template | `backend/…` | `IDesignerDocumentTemplate`: the binding's template with `{base}` replaced | FR-005 |
| Context actions | `backend/…` | The add keys of R10 | FR-012 |
| Client | `client/` | `register.ts`, the panel that mounts the library, the declarations; `KNOWN_MODULE_CLIENTS` becomes 2 | R9 |

Rules on the module's model, beyond the definition's:

- A placeholder number and a missing mark line are written with the next edit of any kind that writes the Markdown file (R17).
- The first change to an absent list writes the whole list, initial members and implicit members included (R17).
- A new tag, a tag rename or delete, and a category or state rename or delete write the `.md` and the `.adp` in one history step (R17).

## State transitions

### The session's document

| From | Event | To | Writes | Source |
|---|---|---|---|---|
| Closed | Opened, readable | Editable | Never on open | FR-002, plan Constraints |
| Closed | Opened, envelope of a later DED version | Read-only, with the reason | Never | FR-031 |
| Closed | Opened, no envelope or not UTF-8 | Read-only, empty, one finding | Never | FR-027 |
| Closed | Opened, a surface kind or FBL family the build lacks | The unsupported placeholder, with the reason | Never | FR-030, R6 |
| Editable | The file changes outside, still readable | Editable, the new model sent, collapsed kept by number, undo history ends at the change | | FR-022, FR-025 |
| Editable | The file changes outside and becomes unreadable | Read-only, the last readable content, one finding | Never | FR-027 |
| Read-only (became unreadable) | The file changes outside and is readable again | Editable | | FR-022 |

A change the session wrote itself, or identical bytes, raises nothing (R13).

### An edit

| From | Event | To | Source |
|---|---|---|---|
| Sent | The gesture fails its parameters, its target is gone, or it needs confirmation | Refused with the sentence; nothing changed | FR-014, FR-026 |
| Sent | Accepted | Shown at once, written behind | standalone `IDesignerSession` contract |
| Shown | The bytes on disk still match those read | Settled: written as the fixtures state | FR-026 |
| Shown | The bytes on disk differ | Refused with the shared sentence; the file is read again and the page shows it; never merged | FR-024, R10, R12 |

### The open field during an outside change

| From | Event | To | Source |
|---|---|---|---|
| Typing | A new model arrives | Typing, with the conflict bar; the page is read again around the field | FR-023, R11 |
| Conflict bar | "Show the file" | The field closes, its text is dropped | R10, R11 |
| Conflict bar | "Keep my text" | The field stays open | R10, R11 |
| Kept, then committed | The entry's number is still in the file | `setTitle` or `setDescription` planned against the file as it is now | R11 |
| Kept, then committed | The entry's number is gone | Refused, and the person is told | R11 |

### The undo history

| From | Event | To | Source |
|---|---|---|---|
| Steps of this file | An outside change is read | The steps stay listed as outdated | FBL section 7.3 |
| Outdated | The person undoes past the change | The steps are dropped, the `Outdated` message is shown once, the file is not written | FR-025, US2 scenario 3, R10 |

### Registration lifecycle

| From | Event | To | In the undo history | Source |
|---|---|---|---|---|
| Absent | Opened | Absent: default colours and order, nothing collapsed, no stored filter | | FR-004 |
| Absent | The first setting changes (a tag created, a member recoloured or moved, an entry collapsed, a filter stored) | Present: origin line, `body:` when the base names differ, then the block of that setting | Creation: no. The setting: as its block declares | FR-004, R4 |
| Present | The person deletes it, also while the document is open | Absent; the body stays and the open page goes on with defaults | | FR-004, US7 scenario 2, Edge Cases |
| Present | The person deletes the body | Both gone | | R4 |
| Present | Changed outside | Read again, the new model sent | | FR-022, R13 |

### Adding an existing file

| From | Event | To | Source |
|---|---|---|---|
| A `.md` in the folder | Added as a designer document, with the envelope | A designer document, the file unchanged | FR-003, R5 |
| A `.md` in the folder | Added as a designer document, without the envelope | Unchanged, the refusal naming the line to write | R5 |
| A `.md` without the envelope | Line 1 becomes the envelope, by a person or an agent | Routed to the designer on the next tree refresh | FR-002, R3 |

## Validation rules, by requirement

| Rule | Where it is enforced | Source |
|---|---|---|
| A `.md` is a requirement document by line 1 alone, ahead of Agent Behavior Modelling and the Markdown editor | Routing precedence | FR-002 |
| Opening never writes a file; the registration appears with the first setting only | Session, registration lifecycle | FR-004, plan Constraints |
| A new document is the template byte for byte, `{base}` the file's base name | Add outcome, template | FR-005 |
| Collapsing and creating the registration are not undo steps | Block declaration `History`, session | FR-004, FR-010 |
| Deleting an entry that contains anything, or that a reference or an assessment names, asks first | Client view state, by the `.des` `confirm` of `deleteEntry` | FR-014 |
| Focus, filter, sort and reveal never write the Markdown file | Client view state | FR-008, FR-018, FR-020 |
| A finding stays listed under a filter | Client view state, `HierarchySurfaceFinding` | FR-021 |
| An edit against changed bytes is refused, never merged | Drift check | FR-024 |
| Every byte written is a fixture's | Bullets writer, operations, conformance run | FR-026, SC-006 |
| A fault at one bullet keeps everything else editable; an unreadable file is never written | Body, session document state | FR-027, SC-007 |
| An undeclared registration block is kept and reported as information | Registration document | FR-028 |
| The supported families include `bullets`, the supported surface kinds `table` and `hierarchy`, stated in `standalone:docs/tools.md` | FBL library, docs | FR-029, FR-030 |
| A later DED version is read-only; an envelope is never changed | Envelope check | FR-031 |
| The surface knows no designer type | Session contract, read model, declarations, `DesignerModuleIsolation.Tests` | FR-032 |
