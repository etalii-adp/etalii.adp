# Feature Specification: The Tools on DISL and FBL in Visual Studio Code

**Feature Branch**: `features/027-vscode-disl-fbl-tools`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "check the Spec workflow MCP specifications and start migrating the tools that already are on DISL and FBL to VS Code. There should be specifications for that. Use those."

## Context

**No specification covered this yet.** On 2026-10-12 the spec-workflow specifications of `etalii.adp.ide.standalone` (31 folders under `.spec-workflow/specs/`, the same on its `develop` and in the local checkout) and the Spec Kit features here were searched. The thirteen `*-disl-fbl` specifications in standalone convert standalone's own modules to DISL and FBL; none of them names Visual Studio Code. The two features for Visual Studio Code are finished: 006-vscode-plugin built the plug-in with two diagrams, and 009-vscode-fbl-implementation gave it a generic FBL implementation that no tool uses yet. This feature is the specification the request expected to find.

**Which tools are "on DISL and FBL".** A tool type is on DISL and FBL when its specification is a DISL or DESL file in `definitions/` whose `persistence` reads and writes its documents through an FBL binding. At `develop` `73ec4a7` that is five tool types:

| Tool type | Kind | Origin | Specification | Binding | Files | In Visual Studio Code today |
|---|---|---|---|---|---|---|
| Gartner hype cycle graph | Diagram | `gartner/hypecycle-graph` | `gartner-hype-cycle-graph.dis` (DISL 0.3) | `gartner-hype-cycle-graph.fbl`, in standalone | `.ghg` | Yes, coded by hand (spec 006) |
| Agent Behavior Modelling | Diagram | `etalii/agent-behavior-modelling` | `agent-behavior-modelling.dis` (DISL 0.3) | `agent-behavior-modelling.fbl`, in standalone, read by a plugin | `.md` | Yes, coded by hand (spec 006) |
| Mind map | Diagram | `freeplane/mindmap` | `mindmap.dis` (DISL 0.3) | `mindmap.fbl`, in standalone and in `specifications/fbl/` | `.mm` | No |
| Agent activity diagram | Diagram | `etalii/agent-activity-diagram` | `agent-activity-diagram.dis` (DISL 0.4) | `agent-activity-diagram.fbl`, beside it | `.aad` | No |
| Knowledge | Designer | `etalii/knowledge` | `knowledge.des` (DESL 0.1) | `knowledge.fbl`, beside it, three bindings | `.yaml`, `.yml`, `.json`, `.ded`, `.xml` | No |

Three more diagram types, the timeline, the dependency graph and the .NET dependency graph, have DISL specifications but read their files through a plugin of their own rather than an FBL binding; the `timeline-disl-fbl`, `dependency-graph-disl-fbl` and `dotnet-dependency-graph-disl-fbl` specifications in standalone move them onto FBL. They are out of scope here and join a later feature once their definitions persist through FBL.

**What "migrating" means.** The organization's direction (2026-09-26) is that every tool has a definition, and a core in each IDE interprets the definitions, with code added only where a definition cannot say something. Visual Studio Code does not do that yet: its two diagrams are coded by hand from their definitions, and it reads no `.dis` or `.des` file. So migrating a tool to Visual Studio Code means that its definition files, copied unchanged from this repository, are what the plug-in reads to know the tool type, and its documents are read and written through its FBL binding by the FBL implementation of spec 009. The Notion add-ons (`etalii.adp.ide.notion`, spec 012) already interpret a DISL specification this way, and their record of what they support is the model for this host's.

**What "replicate" is measured against.** As in spec 006: the definition (the specification file, its binding and its companion `.md`) is the reference, and the standalone module is the worked example, with its examples, fixtures and recorded browser passes. Where they disagree, the definition is corrected here first.

**Where the work lands.** This specification, its plan and its tasks live here. The plug-in changes land in `etalii.adp.ide.vscode` through pull requests into its `develop`. A change a definition needs lands here.

Three roles appear below. A **user** works on documents in Visual Studio Code. A **contributor** is a person or agent who changes the plug-in. A **tool engineer** specifies a tool type in this repository.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Work on a mind map (Priority: P1)

A user opens a FreeMind or Freeplane `.mm` file in Visual Studio Code. It opens in the mind map, drawn as the mind map's definition says. They add a child and a sibling, rename a node, fold a branch, move a node to another parent, and remove one. Every edit is one step of Visual Studio Code's undo, changes only the part of the file it concerns, and leaves the file dirty until saved; the file stays a mind map FreeMind and Freeplane open.

**Why this priority**: the mind map is the smallest of the three new tool types and its binding is one of FBL's own examples, so it is the first proof that a tool type can be brought to this host by its definition. Alone it gives users a working tool.

**Independent Test**: open each standalone example mind map, compare what is drawn with the definition, perform every gesture the definition's behaviour lists, and check the file after each.

**Acceptance Scenarios**:

1. **Given** a `.mm` file, **When** it is opened from the Explorer, **Then** it opens in the mind map, and the text editor remains available for the same file.
2. **Given** any example mind map, **When** it is opened, **Then** every node and connection is drawn as the definition says, in the light, dark and high-contrast themes.
3. **Given** an open mind map, **When** the user saves it without editing, **Then** the file is byte for byte what it was.
4. **Given** an open mind map, **When** the user makes any edit the definition offers, **Then** the file changes as the binding says, as one undoable step, and everything else in it stays as it was.
5. **Given** a `.mm` file the definition's binding does not claim, such as one whose first lines carry no `<map` element, **When** it is opened, **Then** it opens as text and nothing is shown as an error.

---

### User Story 2 - Work on an agent activity diagram (Priority: P1)

A user opens an `.aad` file. It opens in the agent activity diagram, drawn as its definition says, with its states, its lanes and its findings. They add, rename, move and remove what the definition's toolbox offers, and the registration beside the file keeps the positions they drag.

**Why this priority**: it is the first tool type on DISL 0.4, and the one specified most recently with every host in mind (spec 014), so it tests that the interpreter follows the newest language version and not only what the first tools needed.

**Independent Test**: open each of the three standalone examples, compare what is drawn with the definition, and perform every gesture its behaviour lists, checking the file and the registration after each.

**Acceptance Scenarios**:

1. **Given** an `.aad` file, **When** it is opened, **Then** it opens in the agent activity diagram by default.
2. **Given** any example, **When** it is opened, **Then** what is drawn, the toolbox, the properties and the findings are those the definition gives.
3. **Given** an open diagram, **When** the user saves without editing, **Then** the file and its registration are byte for byte what they were.
4. **Given** an edit the definition refuses, **When** the user attempts it, **Then** nothing is written and the user is shown the definition's sentence for that refusal.
5. **Given** a rule the definition states, **When** a document breaks it, **Then** the finding is in the Problems panel with the line it concerns.

---

### User Story 3 - Work in the Knowledge designer (Priority: P2)

A user opens a Knowledge document, a YAML, JSON or XML file whose envelope names the Knowledge designer. It opens in the designer, a form-based layout with nothing connected, as its definition describes. They add, edit, reorder and remove what the definition offers. Any other YAML, JSON or XML file still opens as text.

**Why this priority**: it is the first designer in this host, so it needs a surface the diagrams do not, and its files share extensions with every other YAML, JSON and XML file in a workspace. It comes after the two diagrams because they need only what the hand-coded diagrams already built.

**Independent Test**: open each standalone example (`cities.yaml`, `cities.json`, `cities.xml`, `provinces.yaml`), compare what is shown with the definition, perform every operation it lists, and check the file after each; then open a YAML, JSON and XML file without the envelope and see each open as text.

**Acceptance Scenarios**:

1. **Given** a YAML, JSON or XML file whose envelope names the Knowledge designer, **When** it is opened, **Then** it opens in the designer.
2. **Given** a YAML, JSON or XML file without that envelope, **When** it is opened, **Then** it opens as text exactly as before this feature, and the designer is offered nowhere for it except "Open With".
3. **Given** the same knowledge kept in YAML, JSON and XML, **When** each is opened, **Then** the designer shows the same thing for each.
4. **Given** an open document, **When** the user saves without editing, or makes an edit and undoes it, **Then** the file is byte for byte what it was.

---

### User Story 4 - The hype cycle graph and Agent Behavior Modelling read their definitions (Priority: P3)

A contributor changes a sentence, a colour or a rule in one of the two existing diagrams' definitions here, copies the definitions into the plug-in again, and sees the change in Visual Studio Code without changing the plug-in's code. Users see the two diagrams behave as they did before.

**Why this priority**: the request is about the tools already on DISL and FBL, and these two are, but they already work in Visual Studio Code. Moving them gives users nothing new; it gives contributors one way of building a tool instead of two. It is last because the interpreter is first proven on tools that are new here, and these two then give it the strictest comparison: a hand-coded version that already passes spec 006.

**Independent Test**: run the plug-in's existing tests for both diagrams after the move; they pass unchanged, apart from tests that named the hand-coded parts themselves.

**Acceptance Scenarios**:

1. **Given** the plug-in after the move, **When** a user opens any example of either diagram and performs the checks of spec 006, **Then** every result is the one spec 006 required, or a difference is recorded with its reason in the plug-in's parity record.
2. **Given** a definition change here that alters only what the definition states (a label, a colour, a refusal sentence), **When** the copied definitions are refreshed, **Then** the plug-in shows the change with no other change to its code.

---

### Edge Cases

- A definition uses a construct of DISL or DESL the plug-in does not interpret: the document still opens, the construct is read as the nearest supported one, a finding says so, and the plug-in's support record lists it.
- A definition names a plugin (DISL's `plugins`, FBL section 11): the plug-in carries code for it and the support record names it, or the documents open read-only with a finding that says which plugin is missing.
- A file another tool type also claims (a Markdown file claimed by Agent Behavior Modelling, a YAML file claimed by Knowledge): the binding's own claim decides, by extension and marker, and a file nothing claims opens as text.
- A body with mixed line endings: the reconciliation spec 009 left to "the feature that first connects a tool to FBL" is this feature's.
- A body FBL reads as unreadable: it opens empty and read-only with the finding, and is never saved.
- A copied definition changes upstream: the copy is refreshed by a script and its recorded commit changes; a check on every pull request fails when a copy differs from its record.
- Two hosts write different bytes for the same edit of the same document: the question goes to this repository, and neither host settles it alone.

## Requirements *(mandatory)*

### Functional Requirements

#### The definitions in the plug-in

- **FR-001**: For every tool type in scope, the plug-in MUST hold a copy of its specification file, its FBL binding and its companion `.md`, unchanged, with the repository, path and commit each was copied from recorded beside it, kept from line-ending conversion and never edited in the plug-in's repository.
- **FR-002**: The repository MUST check on every pull request that every copy is the one its record names, and MUST offer one command that refreshes the copies from a given commit.
- **FR-003**: What a tool type shows and does (its elements, shapes, colours, toolbox, properties, refusals, findings and behaviour) MUST be read from its copied definition. Code specific to one tool type is allowed only where the definition names a plugin, or where the definition cannot state something, and each such place MUST be listed in the support record with its reason.
- **FR-004**: The plug-in MUST keep a support record, readable by contributors, that lists which DISL and DESL features and plugins it implements, what it does instead for each one it does not, and every difference between a tool type in this host and its definition.
- **FR-005**: Adding a further tool type whose definition uses only supported features MUST require no change to the plug-in beyond copying its definition and registering its files.

#### Documents

- **FR-006**: Every document of a tool type in scope MUST be read and written through its binding by the plug-in's FBL implementation (spec 009): opening and saving without an edit leaves the file byte-identical, and an edit changes only the bytes of its splices.
- **FR-007**: Every edit MUST be an edit of Visual Studio Code's text document for the file, so undo, redo, the modified state, save, revert and the text editor beside the tool work as for any other file; one gesture MUST be one undo step.
- **FR-008**: A file MUST open in a tool type only when that tool type's binding claims it, extension and marker both; a file of a shared extension that no binding claims MUST open as it did before this feature.
- **FR-009**: Positions the user drags, where a definition keeps them in a registration, MUST be written to the `.adp` registration by the FBL implementation and never into the document.
- **FR-010**: Findings MUST appear in the Problems panel with the line of their cause; refusals MUST show the definition's sentence; confirmations MUST use Visual Studio Code's own dialogs.

#### The tools

- **FR-011**: The mind map, the agent activity diagram and the Knowledge designer MUST each be offered for the files their bindings claim, with what their definitions describe.
- **FR-012**: The Knowledge designer MUST be shown as a form-based layout, and the toolbox and properties views the diagrams use MUST serve it where its definition calls for them.
- **FR-013**: The Gartner hype cycle graph and Agent Behavior Modelling MUST be read from their definitions as FR-003 says, and MUST pass the plug-in's existing tests of their behaviour. A test that named a hand-coded part MAY be rewritten to name the same behaviour.

#### Tests and reporting

- **FR-014**: Every tool type in scope MUST be tested against the examples and fixtures its standalone module publishes, copied unchanged with their source recorded: each opens, saves unchanged, and each edit its behaviour lists changes the file as the binding says and undoes exactly.
- **FR-015**: Registration, undo and redo, save and findings for each new tool type MUST be covered by tests running the packaged plug-in in a real Visual Studio Code, and the native dialogs each tool type raises MUST be seen in a real Visual Studio Code window once before the feature is called done.
- **FR-016**: Every test MUST be written before the behaviour it covers and seen to fail first; a test that cannot run MUST be reported as skipped with its reason.
- **FR-017**: The repository's documentation and its tool list (`docs/tools.md`) MUST list each tool type it offers with its kind, its display name and its origin.
- **FR-018**: Every difference found between a definition and what its standalone module does, and every construct a definition needed that DISL, DESL or FBL could not state, MUST be reported to this repository as a candidate change.

### Key Entities

- **Tool type, definition, specification, binding, registration, plugin, finding**: as [docs/terminology.md](../../docs/terminology.md), DISL, DESL and FBL define them.
- **Copied definition**: a tool type's specification file, binding and companion `.md`, held unchanged in the plug-in with a provenance record.
- **Support record**: the plug-in's list of what it implements of DISL and DESL, its plugins, and its differences from each definition.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every example of the three new tool types opens in its tool in Visual Studio Code and saves byte-identical without an edit.
- **SC-002**: For every edit each new tool type's behaviour lists, the file after the edit is the one its binding prescribes, and undo restores it byte for byte.
- **SC-003**: A YAML, JSON, XML, Markdown or `.mm` file that no binding claims opens exactly as it did before this feature.
- **SC-004**: The plug-in's existing tests for the hype cycle graph and Agent Behavior Modelling pass after User Story 4, apart from tests rewritten under FR-013.
- **SC-005**: Removing the copied definitions of a tool type removes it from the plug-in without other change, and adding them back restores it.
- **SC-006**: Every difference and missing construct found is filed against this repository before the feature's last pull request is merged.

## Assumptions

- **The scope is the five tool types whose `persistence` is `format: "fbl"`** at `develop` `73ec4a7`. A tool type joins when its definition moves onto FBL, as a later feature, not this one.
- **The user stories are delivered in their order**, each in its own pull request into `etalii.adp.ide.vscode` where that keeps them reviewable: the mind map first, as the smallest proof of interpreting a definition, and the move of the two existing diagrams last.
- **Interpreting, not translating.** The plug-in reads the definition files; it does not generate code from them at build time that a contributor then maintains. Whether it reuses the Notion add-ons' DISL interpreter is a planning choice.
- **The bindings that live in standalone** (hype cycle, Agent Behavior Modelling, mind map) are copied from where each definition's `persistence.binding` points, as the Notion add-ons copy theirs.
- **The Knowledge designer's YAML and JSON files are offered as an option, not the default editor, for every `.yaml`, `.yml` and `.json` file**, and become the default only for a file the binding's marker or envelope claims, so that the many other YAML and JSON files in a workspace keep opening as text.
- **Folder subjects, watching files and the timeline and dependency graphs are out of scope.**
