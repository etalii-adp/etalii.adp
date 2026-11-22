# Feature Specification: Export a Causal Loop Diagram's Flow Page from VS Code

**Feature Branch**: `features/082-vscode-cld-flow-export`

**Created**: 2026-11-22

**Status**: Approved on 2026-11-22 (decision card "Approve, then build")

**Input**: Peter, 2026-11-22: "is the CLD export also available in the VS Code host?", and, told that it is not, "Yes, but do it from an ADP (context) menu item." "The CLD export" is the flow page of [spec 074](../074-desktop-cld-flow-export/desktop-cld-flow-export.spec.md): one self-contained, animated web page of a causal loop diagram, which until now only the desktop host writes, from its ribbon.

**Amendments of 2026-11-22**, Peter's own answers in the project thread:

- 23:40, where the menu item goes: "all options you proposed and a window menu item under the root "ADP"". The options proposed were the diagram's right-click menu with the Command Palette, the Explorer's right-click on a `.cld`, and the editor tab's right-click (FR-001 to FR-003b).
- 23:41: VS Code gives an extension no menu of its own in the window's menu bar, so a root "ADP" menu cannot be made there. On a decision card Peter chose an ADP submenu in the editor title bar instead (FR-003c).

## Context

**What exists.** Spec 074 gave the desktop host (`etalii.adp.ide.desktop`) an Export flow page button. Pressed on an open causal loop diagram, it writes the diagram's flow page beside the `.cld` as `FILENAME {yyyy-mm-dd hh.mm}.html` and opens it. The page is the accepted prototype, [reference/mental-health-cld-flows.html](../074-desktop-cld-flow-export/reference/mental-health-cld-flows.html), byte for byte apart from the places spec 074's FR-035 names, with the diagram's data embedded ([contracts/flow-page.md](../074-desktop-cld-flow-export/contracts/flow-page.md), [data-model.md](../074-desktop-cld-flow-export/data-model.md)). The values the page starts from are properties of the causal loop diagram, in its definition and its `.cld`.

[Spec 081](../081-vscode-causal-loop-diagram/vscode-causal-loop-diagram.spec.md) brought the causal loop diagram to VS Code (`etalii.adp.ide.vscode`), feature-identical to the standalone host: it opens, draws, edits, checks and arranges `.cld` files, and already shows and edits every flow property (its FR-035 and FR-036). It left the export out, because spec 074 made the export the desktop host's alone.

**What this feature adds.** The same export in VS Code, offered from an ADP menu item, so that a person working on a causal loop diagram in VS Code gets the same page the desktop host gives, without leaving VS Code.

**What changes in earlier decisions.** Spec 074's Out of Scope ("an export button in any host other than the desktop host") and its assumption that a second host would be "a feature of its own" are answered by this feature, for VS Code only. Spec 081's "Not the flow page export" stays true of spec 081; this feature is that export. Neither specification is edited.

**Words.** A **flow page**, a **variable**, a **link**, a **loop**, an **external variable** and a **dot** are spec 074's. The **diagram's menu** is the menu VS Code's causal loop diagram opens on a right-click of the canvas, whose entries come from the definition, such as Arrange diagram. Other words are those of [docs/terminology.md](../../docs/terminology.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export the open diagram from its menu (Priority: P1)

A person has `mental-health.cld` open in VS Code. They right-click the empty canvas, choose Export flow page, and a moment later the flow page opens in their browser, already moving. VS Code says where the page was written.

**Why this priority**: it is the whole request in one gesture.

**Independent Test**: open each of VS Code's six causal loop examples, choose Export flow page from the diagram's menu, and see each page open with every variable, link and loop of its diagram.

**Acceptance Scenarios**:

1. **Given** a causal loop diagram open in VS Code, **When** the person right-clicks the empty canvas, **Then** the diagram's menu offers Export flow page beside the menu's other entries.
2. **Given** they choose it, **Then** the page is written beside the `.cld` as `FILENAME {yyyy-mm-dd hh.mm}.html`, opened in the person's program for web pages, and a VS Code notification names the file, with an action that reveals it in the Explorer.
3. **Given** the diagram has unsaved edits or variables just dragged, **When** it is exported, **Then** the page shows the diagram as the canvas shows it, edits and positions included, and the `.cld`, its registration and the document's modified state are left as they were.
4. **Given** the export, **Then** VS Code's undo history is unchanged: the export is no edit.
5. **Given** the Command Palette while a causal loop diagram is the active editor, **Then** ADP: Export Flow Page runs the same export; with any other editor active it is not offered.

---

### User Story 2 - The same page as the desktop host's (Priority: P1)

The person exports the same diagram from VS Code and from the desktop host and gets the same page: the same drawing, flow, heatmap, controls, loops and chart.

**Why this priority**: Peter accepted that page; a second page that behaves differently would be a second tool.

**Independent Test**: for each of the six examples, export from both hosts with the variables at the same positions and the same export time, and compare the two files byte for byte.

**Acceptance Scenarios**:

1. **Given** the same diagram, the same variable positions and the same minute of export, **When** it is exported from VS Code and from the desktop host, **Then** the two files are byte-identical.
2. **Given** the flow properties set in the diagram (Title, Link strength, Delay length, Inertia, Simulation speed, Dot density, Heatmap reading, a variable's Starting level and Outside push, a link's Weight), **When** it is exported, **Then** the page starts from them as spec 074's FR-017 and FR-035 say.
3. **Given** the page, **Then** everything spec 074's User Stories 2 to 7 describe holds for it, since it is the same page.

---

### User Story 3 - Export from wherever the person is (Priority: P2)

The person right-clicks a `.cld` file in VS Code's Explorer, or the tab of an open causal loop diagram, or opens the ADP menu in the title bar of the diagram's editor, and chooses Export flow page.

**Why this priority**: Peter asked for every place (2026-11-22); the diagram's menu alone already serves the request.

**Independent Test**: export each example once from each place and compare the pages with the one exported from the diagram's menu.

**Acceptance Scenarios**:

1. **Given** a `.cld` file in the Explorer, **When** the person right-clicks it, **Then** Export flow page is offered; for a file of no tool type with an export it is not offered.
2. **Given** the tab of an open causal loop diagram, **When** the person right-clicks it, **Then** Export flow page is offered.
3. **Given** a causal loop diagram open in its editor, **Then** the editor's title bar holds an ADP menu, and Export flow page is in it.
4. **Given** the diagram is open in VS Code, **When** it is exported from any place, **Then** the page shows it as VS Code holds it, unsaved edits included; **given** it is not open, **Then** the page is made from the file as saved, with its registration's positions and, for a variable without one, the ring the diagram opens on.

### Edge Cases

- A diagram never saved (an untitled document): Export flow page is offered disabled with "Save the diagram first: the page is written beside its file."
- A diagram opened read-only, or from a folder VS Code cannot write to: the export is offered; when the page cannot be written, nothing is written and VS Code shows why in an error notification.
- No program for web pages, or a remote workspace whose files the person's browser cannot reach: the page is still written, and the notification names it and offers to reveal it in the Explorer.
- The same diagram exported twice within one minute: the second page replaces the first, as spec 074's FR-004 says; a page exported a minute later is a new file, and earlier pages are left as they are.
- A diagram with unreadable lines, dangling links or out-of-range flow values: the page holds what was read and the nearest values in range, as spec 074 says; VS Code's findings on the diagram are unchanged.
- A label holding web markup or script: shown as text in the page, never run.
- A file name with spaces, dots or characters outside ASCII: kept as it is in the page's name.
- A large diagram (`uk-cod-population.cld`, 49 variables): the page is written and opens as quickly as SC-001 asks.

## Requirements *(mandatory)*

### Functional Requirements

**The menu item**

- **FR-001**: The diagram's menu of a causal loop diagram open in VS Code **MUST** offer Export flow page when the empty canvas is right-clicked, enabled while the diagram has a file on disk and disabled with its reason otherwise, as the menu's other unavailable entries are.
- **FR-002**: The same export **MUST** be a command in the Command Palette under the category ADP, titled Export Flow Page, with a rebindable shortcut and no default key, offered only while a causal loop diagram is the active editor (VS Code Principle I).
- **FR-003**: VS Code's Explorer **MUST** offer Export flow page on the right-click of a `.cld` file (Peter, 2026-11-22).
- **FR-003a**: The right-click menu of an open causal loop diagram's editor tab **MUST** offer Export flow page.
- **FR-003b**: Every place **MUST** export the diagram as VS Code holds it where it is open, unsaved edits and the positions its editor shows included, and the file as saved where it is not (User Story 3).
- **FR-003c**: The editor title bar of an open causal loop diagram **MUST** hold an ADP menu, with Export flow page in it, standing in for the root ADP menu VS Code does not let an extension add to the window's menu bar (Peter's choice, 2026-11-22). The ADP menu **MUST** be one for every tool, holding what the active tool type offers, so a later tool type adds to it without the frame changing.
- **FR-004**: The menu item **MUST** be offered by the causal loop diagram, not named by the shared frame: what VS Code builds once for every tool (the canvas, the menu, the commands) **MUST NOT** name the causal loop diagram, so that another tool type could offer an export later without the frame changing (VS Code Principle III, `test/core/tool/words.test.ts`).

**What it writes**

- **FR-005**: The export **MUST** write the page of the diagram as the canvas holds it at that moment, unsaved edits and current positions included, and **MUST NOT** change the diagram's document, its registration, its undo history or any other existing file except an earlier page of the same name.
- **FR-006**: The page **MUST** be written in the diagram's own folder, beside its `.cld`, named `FILENAME {yyyy-mm-dd hh.mm}.html` exactly as spec 074's FR-004 says, in the local time of the machine VS Code runs on.
- **FR-007**: For the same diagram data and the same minute, the page **MUST** be byte-identical to the page the desktop host writes: the same template, data, escaping and key order as spec 074's [contracts/flow-page.md](../074-desktop-cld-flow-export/contracts/flow-page.md) and [data-model.md](../074-desktop-cld-flow-export/data-model.md) state, so spec 074's FR-007 to FR-021 and FR-035 to FR-036 hold for it unchanged.
- **FR-008**: The page **MUST** hold the loops the diagram declares, and with none declared the cycles VS Code's causal loop diagram finds, in the standalone host's order (spec 081, FR-030), named as VS Code's canvas names them.
- **FR-009**: Where VS Code's page and the desktop host's would differ for the same data, the desktop host's page **MUST** be the reference, and the difference **MUST** be raised in etalii.adp and recorded in VS Code's `docs/parity.md`, never settled in VS Code alone.

**After writing**

- **FR-010**: After writing, VS Code **MUST** ask the platform to open the page with the person's program for web pages, and **MUST** show a notification naming the file whether or not it opened, with an action that reveals it in the Explorer.
- **FR-011**: When the page cannot be written, the export **MUST** write nothing and **MUST** say why in an error notification.

**Fit with VS Code and ADP**

- **FR-012**: The export **MUST NOT** add a construct to DISL, DID, FBL or ATD, and **MUST NOT** change the causal loop diagram's definition: it reads only what the diagram already states and its flow properties (spec 074, FR-022).
- **FR-013**: The page **MUST** come out of VS Code with no network access, and the extension **MUST NOT** start, embed or need a browser to write it (VS Code's platform constraints).
- **FR-014**: The template of the page **MUST** be held in VS Code as an unchanged copy with its source recorded, never edited there; a correction **MUST** go to its owner and arrive with a newer copy, as every copied file in VS Code does.
- **FR-015**: The code that is the export **MUST** be listed in VS Code's `docs/disl-support.md` under "Code for one tool type" with its reason (spec 074 kept the export outside the definition), or carried as a plugin, and `docs/parity.md` **MUST** record the export as matching the desktop host, which has it, and not the standalone host, which has none.
- **FR-016**: VS Code's `README.md` and `docs/tools.md` **MUST** say that its causal loop diagram exports a flow page, in the change that builds it.
- **FR-017**: Where the ADP website's description of the export names the hosts that offer it (spec 074, FR-033), it **MUST** name VS Code as well once this feature is merged, by the route the site takes sourced content.

### Key Entities

- **Flow page**: spec 074's page, one self-contained file per export.
- **Diagram's menu**: the right-click menu of VS Code's causal loop diagram canvas, where Export flow page is offered.
- **ADP menu**: the submenu in the title bar of an open tool's editor, holding what its tool type offers.
- **Page name**: `FILENAME {yyyy-mm-dd hh.mm}.html`, beside the diagram.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From choosing Export flow page to the page moving in the browser takes under two seconds for `uk-cod-population.cld`.
- **SC-002**: Each of VS Code's six causal loop examples exports to a page holding all of its variables, links and loops, checked by count.
- **SC-003**: For each of the six examples, VS Code's page and the desktop host's page for the same positions and minute are byte-identical.
- **SC-004**: Exporting the same diagram twice in one minute gives byte-identical files, and the `.cld`, its `.adp` and VS Code's undo history are unchanged by an export.
- **SC-005**: An exported page opened with the network off makes no request and runs as it does online.
- **SC-006**: A label made of web markup and script shows as its own text in the page and runs nothing.
- **SC-007**: Shown VS Code's export of the mental health example beside the desktop host's, Peter finds them the same.

## Assumptions

- **Where the item goes** was chosen by Peter on 2026-11-22: the diagram's own right-click menu, the Command Palette, the Explorer's and the editor tab's right-click menus, and an ADP menu in the editor title bar in place of a root ADP menu in the menu bar, which VS Code does not let an extension add.
- **The label** is spec 074's, Export flow page, in the diagram's menu, and Export Flow Page in the Command Palette, following VS Code's title case there (as Arrange Diagram does).
- **The desktop host's page is the reference.** Its template and generator on `develop` are what VS Code matches; VS Code's copy of the template records the commit it came from.
- **The positions** are those VS Code's canvas holds: from the registration, from a drag, from Arrange diagram, or on the ring a file without positions opens on, which spec 081 made the standalone host's.
- **The desktop host keeps its button**, and the standalone host still has no export; nothing changes in either.
- **The page is not a tool**: as spec 074 says, it reads no definition and is not listed as a tool in `docs/tools.md`; only the causal loop diagram's row there mentions it.
- **No example flow pages are added**: the site already publishes one per example (spec 074, User Story 10).

## Out of Scope

- An export in any other host (IntelliJ, Eclipse, ThinkRail, Notion, Claude, standalone).
- Any change to the page itself, its model, its controls or its look; those are spec 074's.
- A preview of the page inside VS Code, such as a webview panel; the page opens in the person's own program for web pages.
- Flow pages of other tool types.
- Any change to DISL, DID, FBL, ATD or the causal loop diagram's definition.

## Verbatim Constraints

- `Export flow page`: the entry in the diagram's menu (spec 074).
- `ADP: Export Flow Page`: the command in the Command Palette.
- `FILENAME {yyyy-mm-dd hh.mm}.html`: the page's name, beside the diagram (Peter, 2026-10-31).
- `Save the diagram first: the page is written beside its file.`: the reason the entry is disabled for an unsaved diagram.
- [reference/mental-health-cld-flows.html](../074-desktop-cld-flow-export/reference/mental-health-cld-flows.html): the page, byte for byte apart from spec 074's FR-035 places.
