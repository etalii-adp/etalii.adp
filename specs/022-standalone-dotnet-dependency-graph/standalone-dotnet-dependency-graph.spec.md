# Feature Specification: The .NET Project and Package Dependency Graph

**Feature Branch**: none of its own: specified with spec-workflow in `etalii.adp.ide.standalone` and delivered on that repository's `develop`
**Created**: 2026-09-07
**Status**: Completed (2026-09-07)
**Input**: The spec-workflow specification `dotnet-dependency-graph` of `etalii.adp.ide.standalone`: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/dotnet-dependency-graph/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/dotnet-dependency-graph/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/dotnet-dependency-graph/tasks.md), plus [findings.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/dotnet-dependency-graph/findings.md), read at that repository's commit `9a64600`. Its requirements, design and tasks were each approved in the spec-workflow dashboard on 2026-09-07. Migrated to Spec Kit on 2026-10-10; the text below is the source's, rearranged into Spec Kit's sections.

## Context

The source's Requirements Document opens with its introduction and its alignment with the product vision, verbatim here.

### Introduction

This spec adds the **`.NET project and package dependency graph`** diagram type (origin `dotnet/dependency-graph`): the projects of a .NET solution, the NuGet packages they consume, and the `ProjectReference`/`PackageReference` edges between them, **computed from the `.csproj` files rather than authored**.

**It is a new module rather than a mode of the existing one, and the reason is provenance, not appearance.** `generic/dependencies` (`src/diagrams/dependency-graph`, catalogued Implemented) is the *authored* graph: a person writes nodes and edges into ADP's own YAML and may write anything. This type writes nothing. Its nodes and edges are a **projection of files the user maintains elsewhere**, it is read-only in every respect except arrangement, and it must be **refreshable** because its subject changes underneath it. Two modules that render similar pictures from opposite directions; merging them would mean one document format that is sometimes the truth and sometimes a cache.

**The `.adp` registration holds layout and nothing else.** There is no body document to own - the solution and its project files are the body. That shape already exists here: `ansible/structure` registers a bare `.adp` whose subject is the surrounding files, so this spec introduces no new file concept.

**Most of what looks novel here is already built, and this spec adopts rather than redefines it.** `RegistrationLayout` in `EtAlii.Adp.Hierarchy` already reads, writes, merges and prunes the `layout:` block and is explicitly "offered to every module"; `databricks-diagrams` Requirement 7 already settled the semantics this type needs - stored positions overlay computed ones element by element, an id with no element is ignored on read and dropped on the next write, and repositioning works on read-only diagrams because arrangement is a view concern rather than an edit to the subject. **The refresh-versus-stored-layout question is therefore answered before it is asked.** What remains genuinely open is named in Requirement 5 and in *Decisions for the user*.

**Dependencies.** This spec redefines none of them:

* `databricks-diagrams` Requirement 7 - the `layout:` block in the `.adp`, adopted wholesale.
* `dependency-graph` - the authored sibling; its canvas conventions are the visual reference.
* `ansible/structure` - the precedent for a derived module whose subject is files on disk.
* structure.md's `diagrams/<diagram>/` module layout and its example-replication rule; tech.md's **Commands** rule; `diagram-undo-redo`; `errors-and-warnings-panel`, where an unresolvable project file's finding lands.

### Alignment with Product Vision

This is the product's **"linkage over illustration"** capability in its purest available form: the elements are not pictures *of* code artifacts, they **are** the code artifacts, named by the files that define them. It is also the clearest case of **"files are the source of truth"** - the graph cannot drift from the build, because the build's own files are what it reads, and the only thing ADP stores is where the user put the boxes. And it delivers **"value from day one"**: a solution acquires an accurate architecture diagram by adding one registration file, with nothing to author and nothing to keep in sync.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A derived module of its own (Priority: P2)

*Source: Requirement 1 - A derived module of its own*

**User Story:** As a maintainer, I want this to be a full module beside the others, so that it costs core nothing and could be removed without a trace.

**Why this priority**: The module boundary is what keeps core free of .NET, MSBuild, NuGet and solution vocabulary, but it delivers no graph on its own; the source makes it the first task so every later task changes a working module.

**Independent Test**: Register the module with no readers and check that it resolves and builds, that `docs/diagrams.md` carries its row, and that nothing under `src/backend/` changed.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **1.1** The type SHALL live at `src/diagrams/dotnet-dependency-graph/` with the `api/`, `backend/`, `client/` and `examples/` layout structure.md requires, and SHALL register the MIME type `dotnet/dependency-graph`.
2. **1.2** Core SHALL gain no knowledge of .NET, MSBuild, NuGet or solution files; every type this spec introduces SHALL live in the module.
3. **1.3** The catalog row in `docs/diagrams.md` SHALL be added with its state icon and the `dotnet/dependency-graph` origin tag, and SHALL be moved as the state changes.
4. **1.4** WHERE `docs/creating-a-diagram-module.md` names a touch point this module moves, that document SHALL be updated in the same change.

### User Story 2 - The subject: a solution, bound by the registration (Priority: P1)

*Source: Requirement 2 - The subject: a solution, bound by the registration*

**User Story:** As a developer, I want to point ADP at my solution and get its dependency graph, so that I do not have to describe a structure the solution already states.

**Why this priority**: Without a bound solution there is no subject: the type's nodes and edges are a projection of files the user maintains elsewhere, and Requirement 2.3 forbids inferring which solution is meant.

**Independent Test**: Point a registration at a `.sln` and at a `.slnx` of the same solution, including one that names a missing project, and check that the same project set is read and the failure is reported as a problem.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **2.1** WHEN a registration names a solution file THEN the module SHALL read that solution and treat its projects as the graph's project set.
2. **2.2** The module SHALL support both `.sln` and `.slnx`.
3. **2.3** WHERE a folder holds more than one solution, the registration SHALL identify which one, so the binding is never inferred.
4. **2.4** WHEN a solution is unreadable, or names a project file that is not there THEN the diagram SHALL still open showing what it could resolve, and the failure SHALL be reported as a problem rather than presented as an empty diagram.

### User Story 3 - The graph: projects, packages, and the two reference kinds (Priority: P1)

*Source: Requirement 3 - The graph: projects, packages, and the two reference kinds*

**User Story:** As an architect, I want to see which projects depend on which projects and packages, so that I can judge the shape of a solution I did not write.

**Why this priority**: The projects, packages and the two reference kinds between them are the graph itself; the source calls central package management the normal case here, not an edge case.

**Independent Test**: Derive the graph of a small solution with project references, direct and centrally versioned package references and one package at two versions, and check the elements, the directed edges and the visible version conflict.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **3.1** Each project in the solution SHALL be one element; each distinct package consumed SHALL be one element; the two kinds SHALL be visually distinguishable.
2. **3.2** Every `ProjectReference` SHALL be a directed edge from the referencing project to the referenced project.
3. **3.3** Every `PackageReference` SHALL be a directed edge from the referencing project to the package.
4. **3.4** WHERE a package is referenced by several projects at one version it SHALL be a single element with several incoming edges, so the diagram shows sharing rather than repeating it.
5. **3.5** WHERE the same package is referenced at different versions, that difference SHALL be visible rather than silently collapsed.
6. **3.6** The module SHALL resolve references declared through central package management and MSBuild imports to the same degree the build does, or SHALL state in its readme what it does not resolve. **This repository uses central package management, so the question is not hypothetical.**

### User Story 4 - Element properties, read-only (Priority: P2)

*Source: Requirement 4 - Element properties, read-only*

**User Story:** As a user, I want to select an element and see what it is, so that I can read the diagram without opening the files behind it.

**Why this priority**: Reading an element without opening its files depends on the graph existing; the properties add explanation to it rather than structure.

**Independent Test**: Select a project and a package element and check that every row is read-only, carries its reason, and shows an absent value as absent.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **4.1** A project element SHALL expose **project name**, **target framework**, and **.NET version where available**.
2. **4.2** A package element SHALL expose **package name** and **package version**.
3. **4.3** Every property in this requirement SHALL be **read-only**: the property grid SHALL present it as a value that cannot be edited, not as an editor that rejects input.
4. **4.4** WHERE a property has no value for an element - a project with no discoverable .NET version, say - the grid SHALL show that absence explicitly, rather than an empty field indistinguishable from an empty value.

### User Story 5 - The package description, and where it comes from (Priority: P2)

*Source: Requirement 5 - The package description, and where it comes from*

**User Story:** As a user, I want to see what a package actually is without leaving the diagram, because a package id is not always self-explanatory.

**Why this priority**: The description is the one property with no source in the repository, and the source records the user's decision to read it from the local NuGet cache only.

**Independent Test**: Read descriptions against a cache layout with the package present and absent, and check that absence is shown explicitly and is never an error or a wait.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **5.1** The property grid SHALL show a **package description** for a package element, read-only.
2. **5.2** **The description has no source in the repository**, unlike every other property in Requirement 4. The design SHALL state where it is read from and SHALL NOT leave it implied.
3. **5.3** WHEN a description cannot be obtained THEN the grid SHALL say so explicitly, and the diagram SHALL open and behave normally: a missing description SHALL never be an error, a blocking wait, or an empty diagram.
4. **5.4** WHERE obtaining a description requires network access, it SHALL be optional and SHALL NOT be required for any other part of this type to work - the product's "no required backend infrastructure beyond the workspace's own files" principle binds here.

### User Story 6 - Layout: adopted, not redefined (Priority: P1)

*Source: Requirement 6 - Layout: adopted, not redefined*

**User Story:** As a user, I want to arrange the graph so it makes sense to me, and find that arrangement again after the solution changes.

**Why this priority**: Element ids bind stored positions, and the source calls the id scheme the load-bearing decision of the design; arrangement is the one thing this type writes.

**Independent Test**: Reposition an element, reopen the diagram, and check that the stored position wins for that element and computed positions hold for the rest; undo the reposition.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **6.1** Authored positions SHALL be stored in the diagram's own `.adp` file in the `layout:` block core already defines, through core's existing `RegistrationLayout`; this spec SHALL add no second layout mechanism.
2. **6.2** WHEN the diagram opens with no stored layout THEN the module SHALL compute one suited to a directed dependency graph.
3. **6.3** WHEN the diagram opens with a stored layout THEN stored positions SHALL win over computed ones **element by element**, so a solution that has gained projects degrades gracefully rather than losing the whole arrangement.
4. **6.4** WHEN a stored id no longer matches any element THEN it SHALL be ignored on read and dropped on the next layout write.
5. **6.5** Elements SHALL be draggable even though they are read-only: arrangement is a view concern, not an edit to the solution.
6. **6.6** A reposition SHALL be an undoable command with an inverse, like any other edit.
7. **6.7** Element ids SHALL be **stable across refreshes**, and the design SHALL state what an id is made of - it is what a stored position is bound to, so a renamed project keeping or losing its place follows from this choice rather than from chance.

### User Story 7 - Refresh: the graph follows its subject (Priority: P1)

*Source: Requirement 7 - Refresh: the graph follows its subject*

**User Story:** As a developer, I want the diagram to reflect what my solution says now, not what it said when I opened it.

**Why this priority**: The type is derived from files that change underneath it, so a graph that does not follow its subject would be wrong; the source also requires that a refresh never costs the user their arrangement.

**Independent Test**: Add and remove a project in the solution, refresh, and check that the new element appears, the removed one disappears with its stored id dropped on the next write, and untouched elements keep their positions.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **7.1** The diagram SHALL be refreshable, so that projects, packages and relations added since it was opened appear.
2. **7.2** WHEN the graph is recomputed THEN the stored layout SHALL be re-applied per Requirement 6, so a refresh SHALL NOT cost the user their arrangement.
3. **7.3** WHEN an element disappears from the recomputed graph THEN it SHALL disappear from the diagram, and its stored position SHALL be handled per Requirement 6.4.
4. **7.4** The design SHALL state whether refresh is automatic on file change, explicit, or both, and SHALL justify that against the product's **live, pushed updates** capability.

### User Story 8 - Examples (Priority: P3)

*Source: Requirement 8 - Examples*

**User Story:** As someone evaluating the type, I want a shipped example that shows a believable graph.

**Why this priority**: Examples help evaluation and are not needed for the type to work.

**Independent Test**: Open the shipped example and read its readme for what the corpus does not demonstrate and for any vendored licence.

**Acceptance Scenarios** (the source's Acceptance Criteria):

1. **8.1** The module SHALL ship an example under `src/diagrams/dotnet-dependency-graph/examples/`, replicated per structure.md's example-replication rule.
2. **8.2** The example's readme SHALL record what the corpus does **not** demonstrate.
3. **8.3** WHERE example data is vendored from an external source, its licence SHALL be permissive - share-alike refused - and the licence file SHALL be vendored verbatim beside the data as `LICENSE.md`, read from the dataset's own statement rather than from the page around it.

### Edge Cases

- An unreadable solution, or one naming a project file that is not there: the diagram still opens with what resolved, and the failure is reported as a problem rather than shown as an empty diagram (criterion 2.4).
- A folder holding more than one solution: the registration identifies which one (criterion 2.3).
- The same package referenced at different versions: one element, with the difference visible (criteria 3.4, 3.5).
- A property with no value, such as a project with no discoverable .NET version: the grid shows the absence explicitly (criterion 4.4).
- A package description that cannot be obtained: the grid says so, and the diagram opens and behaves normally (criterion 5.3).
- A stored layout id that matches no element: ignored on read and dropped on the next layout write (criterion 6.4).
- A graph too large to read: the design says what the type does, rather than rendering an unreadable hairball (non-functional requirement, performance and scale).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The type MUST be a module of its own at `src/diagrams/dotnet-dependency-graph/`, registering `dotnet/dependency-graph`, with no .NET, MSBuild, NuGet or solution knowledge in core, and with its catalog row and module guide kept current. (User Story 1; criteria 1.1–1.4)
- **FR-002**: The module MUST read the `.sln` or `.slnx` the registration names, treat its projects as the project set, and report an unreadable solution or a missing project file as a problem while still opening what resolved. (User Story 2; criteria 2.1–2.4)
- **FR-003**: The graph MUST hold one element per project and one per distinct package, a directed edge per `ProjectReference` and `PackageReference`, show shared packages once and version differences visibly, and resolve central package management or state what it does not resolve. (User Story 3; criteria 3.1–3.6)
- **FR-004**: Project and package elements MUST expose their properties read-only, with an absent value shown explicitly. (User Story 4; criteria 4.1–4.4)
- **FR-005**: A package element MUST show its description read-only from a source the design states, with a missing description never an error, a wait or an empty diagram, and any network access optional. (User Story 5; criteria 5.1–5.4)
- **FR-006**: Positions MUST be stored through core's `RegistrationLayout` in the `.adp` `layout:` block, computed when absent, overlaid element by element when present, pruned when stale, draggable on a read-only subject, undoable, and bound to stable element ids. (User Story 6; criteria 6.1–6.7)
- **FR-007**: The diagram MUST be refreshable, re-applying the stored layout, removing vanished elements, and the design MUST state whether refresh is automatic, explicit or both. (User Story 7; criteria 7.1–7.4)
- **FR-008**: The module MUST ship a replicated example whose readme records what it does not demonstrate, with any vendored data under a permissive, non-share-alike licence vendored verbatim as `LICENSE.md`. (User Story 8; criteria 8.1–8.3)

### Non-Functional Requirements

#### Performance and scale

* **This repository is itself a live subject, and not a toy.** `EtAlii.Adp.slnx` carries roughly thirty backend projects plus sixty-one diagram modules. The type SHALL remain usable at that size, and the design SHALL say what it does when a graph is too large to read - grouping, filtering, or an explicit limit - rather than rendering an unreadable hairball and calling it correct.
* Reading project files SHALL NOT block the diagram from opening.

#### Correctness

* The module SHALL NOT invent edges: an edge SHALL correspond to a declaration in a project file. WHERE a declaration cannot be resolved, the module SHALL report that rather than omit it silently.
* The type SHALL never write to a `.csproj`, `.sln` or `.slnx`. The only file it writes is its own `.adp`, and only that file's `layout:` block.

#### Consistency

* The canvas SHALL follow the conventions of the authored `generic/dependencies` module, so that two dependency graphs do not feel like two products.

### Key Entities

- **Project element**: one project of the solution, identified by `project:<path relative to the solution>`; exposes project name, target framework and .NET version where available (criterion 4.1).
- **Package element**: one distinct package consumed, identified by `package:<package id>` without its version; exposes package name, version or versions, and description (criteria 4.2, 5.1).
- **Dependency edge**: a directed edge for each `ProjectReference` (project to project) and each `PackageReference` (project to package) (criteria 3.2, 3.3).
- **Registration `.adp`**: binds the solution through its `body:` header and holds the `layout:` block, the only thing the type writes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every landing has the four gates green on the merged tree (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test`), exit codes captured before any pipe, a fresh-tree build, and `jb inspectcode` clean for the affected projects.
- **SC-002**: All 36 acceptance criteria across Requirements 1 to 8 are claimed by exactly one task, as the source's coverage diff records.
- **SC-003**: The test that a package whose version changes keeps its element id is seen to fail against an id that includes the version before it is trusted.
- **SC-004**: The type stays usable against `EtAlii.Adp.slnx` itself, measured rather than asserted, and a limit, if any, is stated on the diagram.
- **SC-005**: Nothing under `src/backend/` changes, and no `.csproj`, `.sln` or `.slnx` is ever written.

### Outcome

All thirteen tasks were logged on 2026-09-07, built on the worktree branch `claude/ddg`. The module, its readers, the graph with its `project:` and `package:` ids, the read-only properties, the session bound through `body:`, the adopted layout, automatic and explicit refresh, the canvas on the shared `DiagramCanvas` library, a purpose-built four-project example and the documentation landed in tasks 1 to 12. Task 13 measured `EtAlii.Adp.slnx` at 104 projects, 17 packages and 106 watched files, derived in 51 to 58 ms, and its second log records Architect 1's ruling for degree-based package filtering, on by default and always visibly stated, as the answer to scale. Findings recorded on 2026-09-22 about `SolutionWatcher`'s tests are kept in [research.md](research.md).

## Decisions for the user

Three choices change what gets built. They are recorded here rather than settled by whoever implements the task, and each names a recommendation.

1. **Where the package description comes from.** *(a)* the `.nuspec` in the local NuGet cache - offline, no network, but empty until a restore has run; *(b)* the configured feed - always populated, needs network, and the only option that reaches a package never restored locally; *(c)* both, cache first. **Recommendation: (c)** - it satisfies Requirement 5.4 offline and still answers for packages this machine has not restored.
2. **Direct or transitive package references.** A `PackageReference` is a direct declaration; a build resolves transitive ones too. *(a)* direct only - matches the files exactly, and is what "using the `PackageReference` entries" says; *(b)* direct plus transitive, visually distinguished. **Recommendation: (a)** - it keeps the diagram a projection of the files rather than of a restore, and (b) can be added later without invalidating a stored layout.
3. **Whether this repository ships as the example.** *(a)* a small purpose-built solution - readable, demonstrates little; *(b)* `EtAlii.Adp.slnx` itself - honest about scale, and already here. **Recommendation: both** - (a) as the readable example and (b) as the scale example, because the scale question above needs a subject that actually exercises it.
