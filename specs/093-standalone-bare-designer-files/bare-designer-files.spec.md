# Feature Specification: Designer Files That Open Without a Registration in the Standalone Host

**Feature Branch**: `claude/project-thread-2y63ay` (a cloud session's branch, in place of `features/093-standalone-bare-designer-files`)

**Created**: 2026-11-26

**Status**: Draft, awaiting Peter's approval; no plan or tasks until then

**Input**: Peter, 2026-11-26: "Write the spec", on the decision card about the one new-user hurdle that spec 092's host test left open (etalii.adp `specs/092-standalone-links/tasks.md`, *Trace*; etalii.adp.ide.standalone `tests.md`, the third run of T035): "a knowledge file copied in without a registration opens as text; it needs a feature of its own."

## Context

A knowledge file is a YAML, JSON or XML document whose own content says what it is: its root key `designer: etalii/knowledge` (or, in XML, the `designer` attribute of its `<ded>` root). The knowledge binding (`definitions/designers/knowledge.fbl`) declares that mark as its claim's **marker** (FBL 12.1, 12.2), and FBL 12.3 says how a host routes a file that is not a registration: a binding whose shared extension's marker matches is a candidate, a single candidate opens the file as its tool type, and several are offered rather than chosen silently.

The standalone host opens a knowledge file in the knowledge designer only when an `.adp` registration stands beside it. A person who copies a knowledge file into a project, downloads one, receives one from a colleague, or writes one by hand, sees it open as text, with no hint that it is a table; the VS Code host opens the same file as a table. Only the hierarchical requirement designer is recognised by its content in the standalone host today, and by a claim written for it alone rather than by its binding's marker.

| Id | What is missing | Requirement |
| --- | --- | --- |
| A1 | A designer file with its binding's marker and no registration opens as text in the standalone host | FR-001, FR-002 |
| A2 | Recognition by content is written for one designer type rather than read from each binding's claims | FR-003, SC-004 |
| A3 | The hierarchy, the links of the workspace and a knowledge relation's targets do not see such a file as the designer's document | FR-004 |
| A4 | A shared-extension file that two designer types both claim, or that none claims, has no defined outcome in this host | FR-005, FR-006 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A copied knowledge file opens as a table (Priority: P1)

A person copies `cities.yaml`, a knowledge file, into a folder of a project. Nothing else is beside it. They open it from the hierarchy and see the knowledge designer's table, as they would had they made it in the host.

**Why this priority**: it is the hurdle the host test found, and the first thing a new user does with a file someone shared.

**Independent Test**: copy one of the knowledge examples into an empty folder of a project with no `.adp` file beside it, open it, and see the table; look in the folder afterwards and find no file added.

**Acceptance Scenarios**:

1. **Given** a YAML knowledge file with `designer: etalii/knowledge` and no registration, **When** the person opens it, **Then** it opens in the knowledge designer, showing its rows and columns as with a registration.
2. **Given** the same file in JSON or XML form, **When** it is opened, **Then** it opens in the knowledge designer too.
3. **Given** the file was opened and only looked at, **When** the person looks in its folder, **Then** no registration or other file was written.
4. **Given** the file is open, **When** the person edits a cell and undoes it, **Then** the file is written and restored byte for byte, as for a knowledge file with a registration.
5. **Given** the host is running, **When** the file is copied into the folder, **Then** the hierarchy shows it as a knowledge table without a restart.

---

### User Story 2 - The copied file takes part in the workspace (Priority: P2)

The copied file is a table of the project like any other: other knowledge files can relate to it, diagrams can link to its rows, and its own relations and links resolve.

**Why this priority**: a table that opens but cannot be related to or linked is still a hurdle, just a later one.

**Independent Test**: with the copied file and a second knowledge file in a project, make a relation from the second to the first, and link a timeline element to one of the copied file's rows; save, reopen and navigate both.

**Acceptance Scenarios**:

1. **Given** a copied knowledge file with a document id, **When** another knowledge file's *New relation* lists its targets, **Then** the copied file is among them.
2. **Given** a diagram's lookup, **When** the person searches for a row of the copied file by its name, **Then** the row is offered, and the link resolves and navigates.
3. **Given** the copied file has relations or links of its own, **When** it is opened, **Then** they resolve as they would with a registration.

---

### User Story 3 - Any designer whose binding has a marker (Priority: P3)

What holds for the knowledge designer holds for any designer type whose binding declares a marker, now and when such a type is added, without a change to the host for that type.

**Why this priority**: the next designer type with a shared extension would otherwise meet the same hurdle.

**Independent Test**: for each installed designer type whose binding declares a marker, open one of its examples with no registration beside it, and see it open in its designer.

**Acceptance Scenarios**:

1. **Given** each installed designer type whose binding declares a marker, **When** one of its examples is opened with no registration, **Then** it opens in its designer.
2. **Given** a file of a shared extension that no binding's marker matches, such as an ordinary YAML file, **When** it is opened, **Then** it opens as text, as today.

### Edge Cases

- A file whose marker names a designer type that is not installed opens as text, and the host says which tool type it names.
- A file whose marker matches two installed bindings is not opened silently in either: the host offers both (FBL 12.3, step 3).
- A registration beside the file still decides its tool type (FBL 12.3), even when the file's marker names another; the file is then not routed by its marker.
- A file whose marker matches but which its binding cannot read opens in its designer with the binding's findings, as a file with a registration would, rather than falling back to text unannounced.
- A file that is renamed, moved or copied again keeps opening in its designer, with no registration to follow it.
- A large file is recognised from its first bytes, as FBL 12.2 says a marker is evaluated, without reading the whole of it first.
- A knowledge file with no document id opens; only its being a link target waits for the id, which the first edit writes (spec 092, FR-010).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** (A1): When a file that is not a registration is opened, the standalone host **MUST** route it as FBL 12.3 says, with the bindings of each installed designer type among the candidates: a binding whose `extensions` or `names` take the file and, for a `shared` claim, whose `marker` matches (FBL 12.2).
- **FR-002** (A1): A file with a single candidate **MUST** open in that designer type, with what it shows, its edits, its undo and its findings the same as for the same file opened through a registration. Opening it **MUST NOT** write a registration or any other file; a registration is written only as the binding's `registration` says (FBL 8.4).
- **FR-003** (A2): Which designer types claim a file **MUST** come from their bindings' `claims` as the bundled definitions declare them; the host **MUST NOT** hold a claim, an extension, a marker or a tool type's name in code for one designer type. The hierarchical requirement designer's present claim is read the same way, and keeps opening the same files.
- **FR-004** (A3): A file so routed **MUST** be the designer type's document everywhere the host knows documents: the hierarchy shows it with its tool type, the workspace's index of links holds it (spec 092, FR-007), a knowledge relation's targets and a lookup offer it, and a change to it on disk is followed as for a file with a registration.
- **FR-005** (A4): A file that several bindings claim **MUST** be offered with each, and **MUST NOT** be opened silently in one (FBL 12.3, step 3).
- **FR-006** (A4): A file of a shared extension that no binding claims **MUST** open as it does today. A file whose marker names a tool type that is not installed **MUST** open as text with a sentence naming that tool type.
- **FR-007**: The standalone host's `docs/creating-a-designer-module.md` **MUST** say that a designer type's binding marker is what lets its files open without a registration, and `tests.md` **MUST** hold the host test of User Stories 1 and 2.

### Key Entities

- **Claim**: what a binding says it takes (FBL 12.1): extensions, names, whether the extension is shared, and the marker a shared extension needs.
- **Marker**: the mark a file's own content carries that says which binding takes it (FBL 12.2): a root key with a value, a first line, or a pattern of the first lines.
- **Registration**: the `.adp` file beside a body that names its tool type and keeps its view data (FBL 8); when present, it decides the tool type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every knowledge example the standalone host carries, in YAML, JSON and XML, opens in the knowledge designer with no registration beside it, and opening and closing it leaves its folder byte-identical.
- **SC-002**: A knowledge file copied into a running host's project is shown as a table in the hierarchy within the time a new file of any kind takes to appear, with no restart.
- **SC-003**: In a host test on the Mac mini, a new user who copies a knowledge file into a project opens it as a table, relates another table to it and links a diagram element to one of its rows, meeting no error, no setting and no hurdle (Peter's onboarding rule of 2026-11-23).
- **SC-004**: No standalone host code names a designer type, an extension or a marker for routing; adding a designer type whose binding declares a marker needs no host change for its files to open without a registration.
- **SC-005**: Every file the standalone host's examples and fixtures hold that opened as text before still opens as text, and every file that opened in a tool before still opens in that tool.

## Assumptions

- The knowledge binding's markers are as `definitions/designers/knowledge.fbl` declares them today, for YAML, JSON and XML; no definition changes in this feature.
- The VS Code host already opens a knowledge file by its marker, and the desktop host is outside this feature; a difference found there is raised separately rather than built here.
- Diagram types already route bare files by their claims in the standalone host; this feature makes designer types follow the same rule and changes nothing for diagrams.
- "Open as", which proposes tool types for a file by `suggest` (FBL 12.3), stays as it is; this feature is about files that carry their marker.
