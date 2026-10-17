# Feature Specification: The Native Desktop Host

**Feature Branch**: in `etalii.adp`, `features/030-desktop-native-rust`; in `etalii.adp.ide.desktop`, one branch of this name per pull request, as the plan cuts them

**Created**: 2026-10-17

**Status**: Draft. Only the specification is written; the plan and tasks wait for the maintainer's approval.

**Input**: The maintainer's request of 2026-10-17: "in the etalii.adp repository create a spec kit specification to duplicate the .NET / web implementation in etalii.adp.ide.standalone to etalii.adp.ide.desktop as a full-native rest implementation." Asked whether "rest" meant Rust or a REST interface, the maintainer answered the same day: Rust, a fully native Rust desktop application.

## Context

**What exists.** `etalii.adp.ide.standalone` is the standalone host. It is one ASP.NET Core process that serves a React web client to a browser and talks to it over gRPC-Web: one stream per tab for what the backend pushes, and unary calls for every action. Everything a person sees is drawn by the browser; everything that reads and writes files, keeps the selection, the undo history and the findings, and interprets DISL, DESL, FBL and CEL runs in the .NET process. Its release is a platform-neutral archive started with the .NET runtime, opened in a browser after a sign-in. This specification reads it at commit [`8b6ccfc`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/8b6ccfca4f4a65e43c1a1a73a3224abe7ebf800e) of its `develop`, the **reference commit**.

**What this feature adds.** A new host, `etalii.adp.ide.desktop`, the **desktop host**: the same tools and the same workspace experience as the standalone host, as one native desktop application. It needs no .NET runtime, no browser, no embedded web view and no local server: the person installs it and opens a folder.

**Why.** A browser and a server process are two programs the person has to start, keep alive and sign in to for a tool that only ever works on their own files. A native application starts as one program, uses the platform's windows, menus, file dialogs and keyboard conventions, and draws large canvases and tables without a network hop between what is shown and what is held. The maintainer chose Rust, which the project's research into a host-agnostic tool language (the note *Rust as the tool language*, 2026-10-13) also points to as the place where DISL, CEL and FBL semantics could one day be implemented once for every host.

**What stays.** The standalone host is not replaced, frozen or changed by this feature. Both hosts implement the same specifications in this repository (Principle I) and open the same workspaces. A feature added to the standalone host after the reference commit reaches the desktop host through a feature of its own, not through this one.

**Words.** Those of [docs/terminology.md](../../docs/terminology.md): tool, diagram, designer, editor, tool type, document, registration file, body, splice, reading, folder subject, finding, host, IDE host, runtime, canvas. A **person** is the one who uses the desktop host. A **workspace** is a folder the person opened as a project. **Parity** is the state in which a person can do in the desktop host everything the standalone host lets them do at the reference commit, with the same result on disk.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install, open a workspace and find one's way in it (Priority: P1)

A person installs the desktop host on a machine with nothing else installed for it. They start it, add a folder as a project, open it, and see the workspace as the standalone host shows it: the explorer tree with registrations nested under what they register, the tabs, the toolbox, the properties, and the errors and warnings. They open a text file, edit it, save it, and close the tab.

**Why this priority**: it is the frame every tool runs in, and it is already of value alone with the editors: a person can browse and edit a repository in it.

**Independent Test**: on a clean machine of each supported platform, install the desktop host, open a copy of the standalone repository's `src/examples/` as a project, and walk the explorer, the tabs and the five editors.

**Acceptance Scenarios**:

1. **Given** a machine with no .NET runtime, browser runtime or developer tools added for ADP, **When** the person installs and starts the desktop host, **Then** it opens its project list without asking for anything else to be installed and without asking the person to sign in.
2. **Given** the project list, **When** the person adds a folder, **Then** it is validated, listed and kept across restarts; a folder that is gone is reported when opened, not silently dropped.
3. **Given** an open project, **When** a file in it is added, renamed or deleted outside the desktop host, **Then** the explorer shows the change without a reload.
4. **Given** the explorer, **When** the person uses the keyboard alone, **Then** every action the standalone host offers there (add, add folder, rename with F2, delete with confirmation, open as text, open with, validate, validate all) is reachable, with the same shortcuts.
5. **Given** a plain, Markdown, JSON, XML or YAML file, **When** the person opens, edits and saves it, **Then** the editor behaves as the standalone host's does (encoding and line endings kept, Markdown preview and outline, schema checks and completion), and the tab shows unsaved changes until saved.

---

### User Story 2 - Work in a diagram with the same result on disk (Priority: P1)

A person opens a mind map, a timeline or a C4 workspace that someone else also edits with the tool that owns its format. They select, move, connect, rename on the canvas, edit in the property grid, add from the toolbox, undo and redo. The file they save is the file the standalone host would have written for the same edits, byte for byte, and the owning tool still opens it.

**Why this priority**: diagrams are most of ADP's tools, and identical writes are what lets the two hosts share a repository without one host's saves showing as noise in the other's history.

**Independent Test**: for each diagram type with a module at the reference commit, replay the same scripted edits in both hosts on copies of the same example and compare the bodies and registrations byte for byte.

**Acceptance Scenarios**:

1. **Given** a body ADP has not changed, **When** it is opened and saved without edits, **Then** it is unchanged.
2. **Given** the same edit made in each host on the same file, **When** both are saved, **Then** the bodies and the registration files are identical.
3. **Given** the canvas, **When** the person pans, zooms, fits to view, box-selects, multi-selects with Ctrl and drags, **Then** the gestures and their shortcuts are those of the standalone host, and Escape cancels a drag.
4. **Given** several selected elements, **When** the person changes a property, **Then** all of them change and one undo reverts all of them.
5. **Given** a diagram open in the desktop host, **When** the body changes on disk (another tool, a `git pull`), **Then** the canvas shows the change and the person's unsaved edits are reconciled as the standalone host does.

---

### User Story 3 - Pass the same conformance runs as the standalone host (Priority: P1)

A developer of the desktop host runs its conformance suite: every FBL fixture in this repository, every DISL, DESL and DED example, and the round-trip fixtures the standalone host's tests use. All pass, and the host states the versions of each specification it conforms to.

**Why this priority**: the fixtures are the contract of every byte a host writes and every finding it reports (Principle I). They are how parity is shown rather than claimed.

**Independent Test**: run the suite; plant one wrong byte in an expected result and see it fail at that step.

**Acceptance Scenarios**:

1. **Given** the fixtures under `specifications/fbl/fixtures/` and the examples under `specifications/` and `definitions/` at the `etalii.adp` commit the plan names, **When** the conformance suite runs, **Then** every step passes.
2. **Given** a specification file a tool type is built from, **When** the desktop host loads it, **Then** it reports the same findings, with the same severities and locations, as the standalone host does for it.

---

### User Story 4 - Work in the Knowledge designer (Priority: P2)

A person opens a folder of YAML, XML or JSON files as Knowledge designer tables, with typed properties, relations between files and views that show, sort, filter and group. A table of ten thousand rows scrolls without pause.

**Why this priority**: it is the one designer at the reference commit, and it rests on the frame (Story 1) and the bindings (Story 3).

**Independent Test**: open the standalone host's Knowledge designer examples and a generated table of 10,000 rows, and pass the standalone host's Knowledge designer acceptance checks.

**Acceptance Scenarios**:

1. **Given** a Knowledge designer document, **When** the person edits a cell, adds a row or changes a view, **Then** the files are written as the standalone host writes them, and undo reverts the change.
2. **Given** a table of 10,000 rows, **When** the person scrolls from top to bottom, **Then** no frame stalls visibly and the memory used does not grow with each screen scrolled.

---

### User Story 5 - Every tool type of the standalone host, and the same catalogue (Priority: P2)

A person adds a new document from the same vendor-grouped catalogue the standalone host offers, and every tool type with a module at the reference commit works: the diagrams in the standalone host's `docs/tools.md` with a backend and a client, their readings (OWL, SKOS and SHACL over RDF; the six C4 views over one workspace), the folder subjects (Ansible, Helm), the read-only ones (.NET dependency graph, SPARQL query) and the Knowledge designer. Tool types that are only an identity in the standalone host are listed with the same names and the same state.

**Why this priority**: parity is the request. It comes after Stories 1 to 3 because each tool type is built on them and can be delivered one by one.

**Independent Test**: for each tool type, open its examples from the standalone repository in both hosts and walk its acceptance checks from the standalone host's spec-workflow specification of it.

**Acceptance Scenarios**:

1. **Given** the add dialog, **When** the person lists the tool types, **Then** the list, the names, the grouping and the states are those of the standalone host at the reference commit.
2. **Given** a tool type and its examples, **When** the person opens each in the desktop host, **Then** it is drawn with the same elements, labels and layout modes (Manual, Automatic Horizontal, Vertical, Cloud), and collapsing and expanding behave the same.

---

### User Story 6 - Look and feel of a native application (Priority: P3)

The desktop host follows the platform: its own window and title bar, native file dialogs, the platform's modifier key where a shortcut uses one, light and dark themes following the system setting, and the tokens and contrast the standalone host's themes guarantee. A screen reader can reach the explorer, menus, dialogs, tabs and the errors panel as it can in the standalone host.

**Why this priority**: it is why a native host is wanted, but every tool is usable before it is complete.

**Independent Test**: on each platform, switch the system theme, use a screen reader through Story 1's walk, and run the contrast checks against both themes.

**Acceptance Scenarios**:

1. **Given** the system theme changes, **When** the desktop host is open, **Then** it follows without restart, and every pair of text and background colour meets the contrast the standalone host's theme tests require.
2. **Given** a screen reader, **When** the person walks the explorer, a menu, a dialog and the errors panel, **Then** each element is announced with its role, name and state.

### Edge Cases

- A workspace in which the standalone host is open at the same time: both hosts see each other's writes as changes from outside, and neither loses an edit silently.
- A body in an encoding, byte order mark or mixed line endings the standalone host preserves: the desktop host preserves it too.
- A file larger than the standalone host can open, or a folder with tens of thousands of files: the desktop host does not stall its window while reading it, and says when it declines.
- A registration naming a tool type the desktop host does not have yet: the file is listed, opens as text, and the reason is stated.
- A project folder on a network drive or removable disk that disappears while open: the person is told, and no unsaved edit is discarded without asking.
- A specification file with a version later than the desktop host knows: it is refused with the reason, as the standalone host does.
- The standalone host's sign-in: the desktop host has none (FR-003); a workspace never depends on a credential.

## Requirements *(mandatory)*

### The host

- **FR-001**: The desktop host **MUST** be a new repository, `etalii.adp.ide.desktop`, created by the rules of [docs/new-repository.md](../../docs/new-repository.md), with its features specified in this repository.
- **FR-002**: The desktop host **MUST** run as one native application process on the person's machine. It **MUST NOT** require a .NET runtime, a JavaScript runtime, a browser, an embedded web view or any network listener, and **MUST NOT** download code at run time.
- **FR-003**: The desktop host **MUST NOT** ask the person to sign in; it acts with the rights of the person who started it.
- **FR-004**: The desktop host **MUST** be installable and run on Windows, macOS and Linux, each on the 64-bit architectures the plan names, from one installer or package per platform.
- **FR-005**: The desktop host **MUST** be implemented in Rust, as the maintainer decided on 2026-10-17. Everything it needs **MUST** be part of the installed application.
- **FR-006**: This repository's documents that list the hosts (`docs/terminology.md`, the constitution, `docs/new-repository.md`) **MUST** name the desktop host as an IDE host before its first release, changed in the terminology first.

### Parity with the standalone host

- **FR-010**: The desktop host **MUST** offer every capability the standalone host offers at the reference commit, except the sign-in (FR-003) and the serving of a client to a browser. The plan **MUST** hold the parity inventory: one row per capability and per tool type, each traced to the standalone host's specification or code that defines it.
- **FR-011**: The project list **MUST** add, validate, remove and open projects, and keep them across restarts, as the standalone host does.
- **FR-012**: The workspace **MUST** show the explorer, the tool tabs, the toolbox, the properties and the errors and warnings, in resizable panes, with a ribbon holding Save, New, Undo, Redo, the contextual groups and Zoom In, Zoom Out and Fit to View.
- **FR-013**: The explorer **MUST** follow the disk live, nest each registration under the file or folder it registers, support several registrations of one subject, and offer the standalone host's actions, shortcuts and confirmations.
- **FR-014**: Opening a document **MUST** open it in a tab, or focus the tab it already has; tabs **MUST** show unsaved changes and save with Ctrl+S (the platform's equivalent on macOS).
- **FR-015**: There **MUST** be one selection per window, and every action **MUST** reach the ribbon, the context menu and the keyboard from one description of it, as in the standalone host's context system, with the same prompts: choices, file dialogs, text input, confirmations and notices.
- **FR-016**: Every change **MUST** be an undoable command on the project's history, composite changes **MUST** undo as one step, and undo **MUST** stop at a change from outside as the standalone host does.
- **FR-017**: The property grid **MUST** show the selection chain, grouped rows and read-only rows with their reason, with the editor kinds line, text, toggle, choice and ordered slider, and an edit **MUST** be one undoable command.
- **FR-018**: The canvas **MUST** offer pan, zoom, fit to view, box and Ctrl selection, the shared drag, move, resize and connect gestures with Escape to cancel, toolbox drag onto the canvas, creating the target of a connection dropped on empty space, Tab and Enter to add a child or sibling, inline label rename, the four layout modes, and collapse and expand.
- **FR-019**: Problems **MUST** be validated and cached per project, revalidated at start, and listed in the errors and warnings panel with their location.
- **FR-020**: The five editors **MUST** be present: plain (keeping encoding and line endings), Markdown (preview and heading outline), JSON (JSON Schema checks and completion), XML (checks against the schema or DTD the document names) and YAML (schema from a `yaml-language-server` comment), each with completion on Ctrl+Space.
- **FR-021**: Every tool type with a module at the reference commit **MUST** be present with the same origin, display name, file claims and state; tool types that are an identity only there **MUST** be listed the same way.
- **FR-022**: The Knowledge designer **MUST** be present, reading and writing YAML, XML and JSON bodies through its binding, with typed properties, relations, views and windowed display of large tables.
- **FR-023**: Changes on disk **MUST** reach open views live, including with unsaved edits, as the standalone host reconciles them.
- **FR-024**: The search panel **MAY** stay a placeholder, as it is in the standalone host.

### Files and specifications

- **FR-030**: The desktop host **MUST** implement the specifications of this repository (DISL, DID, DESL, DED, FBL with its registration file, and CEL as they use it) at the versions the standalone host implements at the reference commit.
- **FR-031**: Every write to a body **MUST** be made of FBL splices, keeping every byte outside them, the byte order mark and the majority line ending.
- **FR-032**: For the same edit on the same file, the desktop host **MUST** write the same bytes to the body and to the registration file as the standalone host.
- **FR-033**: Authored positions **MUST** be kept in the registration file, never in a body that another tool owns.
- **FR-034**: The desktop host **MUST** pass every FBL conformance fixture and every example of this repository at the `etalii.adp` commit its plan names, and the round-trip tests of the standalone host at the reference commit.
- **FR-035**: The desktop host **MUST** load tool types from the same specification files the standalone host bundles, so that a tool type is specified once for both.
- **FR-036**: The desktop host **MUST** keep its own state (project list, problem cache, window layout) in the platform's per-user application data folder, and **MUST NOT** write anything into a workspace that the standalone host would not write.

### Quality and delivery

- **FR-040**: The desktop host **MUST** have a `Build` workflow that builds and tests it on every pull request into `develop` and on `develop`, including the conformance suite and the terminology check, and publishes an installable release for each platform from a green `develop`.
- **FR-041**: Every interactive element **MUST** be reachable by keyboard and exposed to the platform's accessibility interface with its role, name and state.
- **FR-042**: Light and dark themes **MUST** follow the system setting and meet the contrast the standalone host's theme tests require; text **MUST** be in English, as in the standalone host.
- **FR-043**: The desktop host **MUST** be delivered in increments a person can use: the frame and the editors (Story 1), then the bindings and the conformance suite (Story 3), then the diagrams type by type (Stories 2 and 5), then the Knowledge designer (Story 4). The parity inventory (FR-010) records which increment holds each row.

### Key Entities

- **Project**: a folder the person added, with its name and path; kept in the per-user state.
- **Document**: one piece of content opened with a tool, identified by its body and, where present, its registration file.
- **Registration file**: the `.adp` file that names a document's origin, its body and its authored positions, as FBL section 8 defines it.
- **Tool type**: a tool the host offers, identified by its origin, built from its specification file and binding.
- **Command**: one undoable change, kept on the project's history.
- **Finding**: the result of a rule or a reading, with its severity and location, cached per project.
- **Parity inventory**: the list of every capability and tool type of the standalone host at the reference commit, each with its source and the increment that delivers it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a clean machine of each supported platform, a person goes from the installer to an open workspace in under 3 minutes, with nothing else installed and no sign-in.
- **SC-002**: Every row of the parity inventory is delivered and checked: 100% of the capabilities and tool types of the standalone host at the reference commit.
- **SC-003**: 100% of the FBL conformance fixtures and specification examples pass, and a planted defect in any one of them is caught.
- **SC-004**: For a scripted set of at least 20 edits per diagram type, the files written by the two hosts are identical in 100% of cases.
- **SC-005**: The desktop host shows its project list within 2 seconds of being started, and a workspace of 5,000 files within 3 seconds of being opened, on the reference machine the plan names.
- **SC-006**: Panning, zooming and dragging on a canvas of 1,000 elements, and scrolling a table of 10,000 rows, keep pace with the pointer: no visible stall in a person's walk of each.
- **SC-007**: While idle with a workspace of 5,000 files and three documents open, the desktop host uses at most half the memory that the standalone host's process and its browser tab use together for the same workspace.
- **SC-008**: A change made on disk by another program appears in the open view within 1 second.
- **SC-009**: A screen reader user completes Story 1's walk without sighted help, on at least one platform per release.

## Assumptions

- **Sign-in is dropped.** The standalone host signs in because a browser reaches it over a port; a native process has no such door, so the default is no sign-in (FR-003). Remote or shared use is out of scope.
- **Parity is fixed at the reference commit.** Work that lands in the standalone host later, such as spec 025's restructuring or spec 029's Hierarchical Requirement Designer, is out of scope here and comes to the desktop host as features of its own.
- **Platforms.** Windows, macOS and Linux on 64-bit machines are the default targets; the plan names the architectures and the minimum versions of each.
- **The standalone host is the oracle.** Where the standalone host's behaviour and its spec-workflow specification disagree at the reference commit, its behaviour wins and the difference is recorded in the parity inventory.
- **No shared code with the standalone host.** Nothing of the .NET or TypeScript code is reused; the desktop host shares only the specifications, definitions, examples and fixtures of this repository and the examples of the standalone repository.
- **One window per workspace** is enough for parity; the standalone host's one stream per browser tab is a property of its transport, not a capability a person uses.
- **The repository's principles.** `etalii.adp.ide.desktop` will get its own principles in `.specify/memory/repositories/etalii.adp.ide.desktop.md`, written with its plan; Principle VI (no Rider warnings in C#) does not apply, as it holds no C#.
- **Dependencies.** The repository is created by the maintainer or with their access; its `Build` workflow needs GitHub's hosted runners for the three platforms; the plan decides how the specifications and fixtures of this repository reach the desktop host's build.
