# Contract: recognising, adding and deleting a requirement document

How the standalone host decides that a file is a requirement document, opens it with or without a registration, adds one to the workspace, and deletes either of its files. These are the identifiers and outcomes a test of pull request 3 codes against. Every statement cites the spec's requirement (FR), the plan's decision (R, in [research.md](../research.md)) or the definition it comes from. Paths are those of R1: spec 025's homes where it names one (`ToolRouter`, T167; `DesignerAddOptions`, T201), otherwise standalone `develop` `b35336639`.

## What claims the file

The binding `hierarchical-requirement.fbl#markdown` claims, and the host evaluates the claim with the routing its FBL library already has (`EtAlii.Adp.Specification.Fbl/Routing/Router.cs`, `MarkerEvaluator.cs`; FBL sections 12.1 and 12.3):

| Claim | Value, copied from the binding |
|---|---|
| `extensions` | `[".md"]` |
| `shared` | `true` |
| `marker.pattern`, `marker.lines` | `^<!--[ \t]+ded:[ \t]+[^ \t]+[ \t]+designer:[ \t]+etalii/hierarchical-requirement[ \t]+-->[ \t]*$`, `1` |
| `origins` | `["etalii/hierarchical-requirement"]` |

The envelope a document carries on line 1, as the template writes it: `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->`. Only a byte-order mark may stand before it (companion, The file).

| Rule | Source |
|---|---|
| `ToolRouter` asks the marker claim first, for a file of an extension that a designer claims as `shared`, before the routers of the three tool kinds. | R3, FR-002 |
| It reads the first line up to the first line break or 1,024 bytes, and caches the answer until the file changes. It never reads the whole file to route it. | R3 |
| The envelope decides. A `.md` whose line 1 is the envelope is a requirement document, registered or not, and whatever another tool's registration says of it. | FR-002, spec Edge Cases |

## Outcomes of routing a file

`DesignerRouted` keeps its name and gains an optional registration: `DesignerRouted(DesignerDefinition Definition, string? RegistrationPath, string BodyPath)` when the routing came from a body's envelope (R4). A test codes against these outcomes:

| The file | Routed as | Opens in |
|---|---|---|
| A `.md` whose line 1 is the envelope naming `etalii/hierarchical-requirement`, with no registration | `DesignerRouted`, `RegistrationPath` null | The `Hierarchical Requirement Designer` (FR-002, US1 scenario 2) |
| The same, with its registration | `DesignerRouted`, `RegistrationPath` set | The same (FR-004) |
| That registration itself | `DesignerRouted`, as today | The same |
| A `.md` without the envelope | As today: the Markdown editor by extension, or Agent Behavior Modelling when its registration says so | Unchanged (US1 scenario 3) |
| A registration of another tool type whose body carries the envelope | `ToolRouter`'s `Unreadable` (spec 025, T167), its reason saying that its body is a Hierarchical Requirement Designer document | Nothing; the body opens in the designer (R3) |
| An envelope naming a later DED version than 0.2 | `DesignerRouted` | The designer, read-only, `read_only_reason` saying why (FR-031, R6, US1 scenario 5) |

**The registration of a body without one in hand.** It is the `.adp` in the body's folder whose line 1 is `etalii/hierarchical-requirement` and whose `body:` names the body, or that has no `body:` and the body's base name (FBL section 8.4). None found: `RegistrationPath` is null.

## Opening without a registration

| Rule | Source |
|---|---|
| `IDesignerSessionFactory.Open(ShortGuid watchId, string rootPath, string? registrationPath, string bodyPath)`. A null `registrationPath` opens the document with the definition's defaults: `tags` and `filters` empty, the starting categories (`functional` `blue`, `non-functional` `purple`, `technical` `brown`) and states (`proposed` `gray`, `accepted` `green`, `rejected` `red`, `done` `blue`), nothing collapsed. | R4, companion, The registration |
| Opening never writes a file: not the registration, not a missing mark line, not a number for `ITEM-NEW` or `REQ-NEW`. | plan, Constraints; companion, Numbers |
| The first setting the person changes creates the registration (`registration.createOnFirstPlacement: true`): `<body base name>.adp` in the body's folder, holding the line `etalii/hierarchical-requirement`, in the body's dominant line ending, with no `body:` line because the base names are equal. It is written before the edit is planned and outside the undo history, so an undo leaves it in place. | R4, FR-004, FBL section 8.4 |
| When a file of that name exists and is not this document's registration, the setting is refused with a sentence naming that file, and nothing is written. | FBL section 8.4 ("refuses the placement with a reason otherwise") |

## Adding a document to the workspace

`DesignerAddOptions` offers the designer type under the name `Hierarchical Requirement Designer`, with the `.md` format, in the Add dialog's option tree (FR-001).

| The name the person gives | What the host does | Source |
|---|---|---|
| No file of that name | Writes the binding's template, CRLF, `{base}` replaced by the file's base name, byte for byte. No registration is written. | FR-005, US4 scenario 2 |
| A file whose line 1 is the envelope naming `etalii/hierarchical-requirement` | Writes nothing, and opens it in the designer. | FR-003, R5, US1 scenario 4 |
| A file without that envelope | Refuses, and writes nothing. The refusal says that the file has no envelope on its first line and names the line it would need: `<!-- ded: 0.2 designer: etalii/hierarchical-requirement -->`. No dialog offers to write it. | R5, spec Edge Cases |

## Deleting

The explorer's delete (`hierarchy.delete`, handled by `DeleteEntryCommandHandler`) follows the binding:

| Deleted | Also deleted | Source |
|---|---|---|
| The registration of a designer type whose binding has `registration.createOnFirstPlacement: true` | Nothing. The document stays, opens without a registration, and a new one is created with the next setting. | R4, FR-004, US7 scenario 2, SC-008 |
| The registration of any other designer type | Its body, as today | R4 |
| The body | Its registration, as today, so no registration names a file that is gone | R4 |

While the document is open and its registration is deleted, the designer goes on with the default colours and order (spec Edge Cases).

## What the host states

| Where | What | Source |
|---|---|---|
| `docs/tools.md` | The FBL families the host supports, `bullets` among them (`json`, `lines`, `xml`, `yaml`, `bullets`); the DESL surface kinds it supports, `table` and `hierarchy`; the DED version it reads, 0.2. | FR-029, FR-030, FR-031, R6 |
| `KnownMinor` in the FBL library | `7` | plan, Constitution Check (IV) |
| A document of a surface kind the build lacks | The existing unsupported placeholder, `PanelPlaceholder.tsx`, with the reason | R6, FR-030 |
