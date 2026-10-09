# Contract: Add-on Address

The address a Notion page embeds to show a Gartner hype cycle graph, what the page at that address shows, and the identifiers a test or a second add-on may rely on. Anyone who pastes the address into an embed block codes against this, and so do the manual pass and the panel tests. Decisions are in [research.md](../research.md) D1, D9, D10, D11 and D13; the tree the page is published in is in [published-tree.md](published-tree.md), the database it reads in [store.md](store.md).

## Address

```text
https://etalii.net/adp-notion/gartner-hype-cycle-graph/?store=<database id>[&theme=light|dark]
```

| Part | Value | Requirement |
| --- | --- | --- |
| Add-on id | `gartner-hype-cycle-graph`, the name of the file `definitions/diagrams/gartner-hype-cycle-graph.dis` without its extension | FR-001, D11 |
| Tool type | origin `gartner/hypecycle-graph` | FR-001 |
| `store` | The id of the Notion database that is the graph's store: 32 hexadecimal digits, with or without dashes, in either case. It is the part of the database's Notion address before `?v=` | FR-009 |
| `theme` | Optional. `light` or `dark` overrides the appearance the browser reports; any other value is ignored | NFR-003, D13 |
| Any other parameter | Ignored, and never an error | FR-009 |

The address does not change when another add-on is added or removed, and one published add-on serves any number of graphs: the page that embeds it decides the store (FR-009).

The first graph, as the request found it:

| What | Notion address | Title |
| --- | --- | --- |
| Store | `https://app.notion.com/p/3f2be2fd05b680f5bfe1d89398eabb4e?v=3f2be2fd05b6807cbf5a000c8f2809c0` | `Gartner HypeCycle Graph - Data` |
| Diagram page | `https://app.notion.com/p/Diagram-3f2be2fd05b68030ad49fb0c78476d76` | `Diagram` |

Its embed address is `https://etalii.net/adp-notion/gartner-hype-cycle-graph/?store=3f2be2fd05b680f5bfe1d89398eabb4e`. The titles are renamed by [store.md](store.md), "Showcase entry"; the ids stay.

## States

The page is in exactly one state, named in `data-state` on `<body>`.

| `data-state` | When | What is shown | Requirement |
| --- | --- | --- | --- |
| `loading` | From the first paint until the store is read | The frame, and the status `loading` | NFR-008 |
| `setup` | The address has no `store`, or its value is no database id | The steps of `docs/set-up-a-graph.md` in short, and `id="choose-store"`, which starts the selection of a database. No call is made and no token is asked for until that control is used | Edge case: no database to read; D11; FR-033 |
| `connect` | No token is kept, or Notion refused the one kept | An invitation to grant access, with `id="connect"` | FR-010, D1 |
| `unshared` | The token is valid and Notion says the database does not exist for it | A sentence saying the database is not shared with the connection, and `id="connect"` to grant again | Edge case: not shared; research R3 |
| `unprepared` | The database lacks a property [store.md](store.md) asks for | What is missing, and `id="prepare"` when the person may change the database | D14 |
| `ready` | The store is read and may be written | Canvas, toolbox, property grid, findings, undo and redo | FR-015 to FR-018 |
| `read-only` | The store is read and may not be written by this person: Notion says so when the store is opened, or refuses this person's first write, which then changes nothing ([service.md](service.md)) | Canvas, property grid without controls that change, findings. No toolbox, no undo, no redo, no editing control | FR-021 |
| `unreadable` | The document cannot be read at all | An empty canvas and the sentence `The graph could not be read, so it cannot be edited.` No editing control | FR-013, US1 scenario 4 |

An empty database that has every property is `ready` with an empty graph and no finding (US1 scenario 5). An entry that cannot be read is a finding in `ready` or `read-only`, never a state of its own (FR-013).

## Selecting a store

| Step | What happens | Requirement |
| --- | --- | --- |
| The person uses `id="choose-store"` | Access is asked for where none is kept, then `id="stores"` lists the databases that access reaches | FR-033 |
| The person chooses a database | Its properties are compared with what the binding asks. A missing property that an existing one of the right type can become is offered both ways in `id="properties"`; nothing of the database is changed yet | FR-034 |
| The person agrees with `id="prepare"` | The chosen properties are renamed, the others added, and the internal ones hidden from the database's views where Notion lets a connection do so | FR-035, FR-036 |
| The store is ready | The add-on looks on the page that holds the database, and on the pages directly under that page, for an embed block whose address is this add-on's without a `store`. Exactly one: its address is set to name the store. None or several: `id="store-address"` shows the address to put in the block | FR-033 |
| Either way | The page goes to its own address with that `store`, so the diagram is shown at once | FR-033 |

## Identifiers

Elements a test may rely on. Each is present only in the states that show it.

| Identifier | Element |
| --- | --- |
| `id="canvas"` | The SVG the diagram is drawn in. It takes the keyboard focus |
| `id="toolbox"` | The toolbox panel; `data-collapsed="true"` or `"false"`, kept in the browser's local storage under `adp-notion.<add-on id>.panel.toolbox` |
| `id="toolbox-toggle"` | The control that collapses and opens the toolbox; it stays visible when the panel is collapsed |
| `id="property-grid"` | The property grid panel; `data-collapsed` as the toolbox, kept under `adp-notion.<add-on id>.panel.property-grid` |
| `id="property-grid-toggle"` | The control that collapses and opens the property grid; it stays visible when the panel is collapsed |
| `id="findings"` | The list of findings; it has one item per finding and none when there is none |
| `id="undo"`, `id="redo"` | The two buttons; `disabled` when there is nothing to undo or to redo |
| `id="status"` | What the add-on is doing; `data-status` is `idle`, `loading`, `storing`, `offline` or `failed` |
| `id="message"` | The last refusal or failure, with `role="alert"`; empty when there is none |
| `id="connect"` | The control that starts the grant of access |
| `id="disconnect"` | The control that removes the kept token and puts the page in `connect`; present in every state that has a token |
| `id="prepare"` | The control that adds the missing properties to the database |
| `id="open-in-tab"` | While a grant of access is in progress: a link to the grant itself, for the person to open when no window opened, as in the Notion desktop app (research R4) |
| `id="cancel-connect"` | While a grant of access is in progress: the control that stops waiting for it |
| `id="choose-store"` | In `setup`: the control that starts the selection of a database. It asks for access first where none is kept |
| `id="stores"` | The list of the databases the person's access reaches, one item per database with its title and the kind of place it is in; choosing one selects it. `id="find-store"` looks for one by name, `id="more-stores"` shows the next 25, and `id="connect"` grants access again, to reach a database that is not listed |
| `id="properties"` | For a selected database that lacks properties: one item per missing property, each with the choice between a new property and an existing one of the right type, and `id="prepare"` to agree |
| `id="store-address"`, `id="copy-store-address"` | Where the embed block could not be set: the address with its `store`, and the control that copies it. They are shown once, on the page of the store the add-on then goes to, with the reason |

| Attribute | On | Value |
| --- | --- | --- |
| `data-state` | `<body>` | A state of the table above |
| `data-theme` | `<html>` | `light` or `dark`, the appearance in use |
| `data-addon` | `<html>` | The add-on id, `gartner-hype-cycle-graph` |
| `data-tool` | Each item of the toolbox | The `id` of the tool in the specification's `toolbox` |
| `data-form`, `data-attribute` | The property grid; each of its rows | The key of the form in the specification's `forms`; the row's `attribute`, or its `id` when it has none |
| `data-element`, `data-type` | Each drawn element of the canvas | The element's id in the document; its type in the specification's `metamodel` |
| `data-selected` | A drawn element | `true` while it is selected |
| `data-severity`, `data-element` | Each item of the findings | `error`, `warning` or `info`; the id of the element the finding concerns, absent when it concerns the document |

The values of `data-tool`, `data-form`, `data-attribute` and `data-type` come from the specification and are written nowhere in the add-on's code (FR-004).

A panel's collapsed state is kept per add-on and per panel under the key `adp-notion.<add-on id>.panel.<panel id>`, with the value `collapsed` or `expanded`, written when it changes and read when a page of the add-on opens. It is a preference of that reader in that browser and is in no store. Where the browser refuses the storage, the panels open expanded and nothing fails.

## Keys

They act while the keyboard focus is inside the add-on's page. With the focus in the Notion page around it, Notion's own undo runs and the add-on's does not.

| Keys | Does | Requirement |
| --- | --- | --- |
| `CTRL+Z` | Undoes the last edit, on the canvas and in the store | FR-023 |
| `CTRL+Y` | Redoes the last undone edit, on the canvas and in the store | FR-023 |
| `CTRL+SHIFT+Z` | The same as `CTRL+Y` | FR-023 |
| On macOS, Command+Z and Shift+Command+Z | Undo and redo | FR-023 |
| The buttons `id="undo"` and `id="redo"` | The same two, without a keyboard | FR-025 |

| Rule | Requirement |
| --- | --- |
| One gesture is one step: a drag that changes several attributes, or a removal that takes influences with it, is undone by one press | FR-024 |
| A new edit after an undo empties what could be redone | US3 scenario 4 |
| With nothing to undo or redo, the key and the button change nothing and show nothing | US3 scenario 5 |
| The history starts empty when the page is opened and ends when it is closed; it is emptied when the store is read again after a change made elsewhere | D9, D10 |
| A key the specification's `behavior` binds, such as the one that removes the selection, acts as that section says | FR-015 |

## What a reader and a user can rely on

| Event | Result | Requirement |
| --- | --- | --- |
| The page is opened with a store of 50 trends | The graph is drawn within 3 seconds | SC-002 |
| An edit is completed | The canvas shows it within 100 milliseconds; `data-status` is `storing` until the store holds it, within 5 seconds for an edit of one element | SC-004, research R2 |
| An edit the specification refuses | Nothing changes, and `id="message"` holds the specification's sentence | FR-019 |
| A write fails, or the connection is lost | `data-status` is `failed` or `offline`, `id="message"` says so, and the store is read again so that the canvas shows what the database holds. A write that fails after others of the same edit were stored leaves those stored, and `id="message"` says the edit was stored in part | FR-020 |
| Somebody else changed a row since the last read | Nothing is written, `id="message"` says so, the store is read again and the history is emptied | FR-022, D10 |
| The page is closed or left while `data-status` is `storing` | The browser is asked to warn first, where it lets an embedded page do so. Writes not yet sent are not stored | FR-018, FR-020 |
| The specification or the binding is changed in its repository and the add-on is published again | The page follows it, with no change to this contract's address | US1 scenario 6 |
| The page is shown in an embed block narrower than both panels | Both panels are collapsed and the canvas stays usable | FR-011, FR-017 |

The page never navigates the frame it is in to another page and never asks to leave it: the one navigation it makes is to its own address with the `store` just selected. It makes no request to any address but its own folder and the service of [service.md](service.md).
