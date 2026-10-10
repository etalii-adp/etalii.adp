# Tasks: The .NET Project and Package Dependency Graph

**Input**: [plan.md](plan.md), [standalone-dotnet-dependency-graph.spec.md](standalone-dotnet-dependency-graph.spec.md) and the spec-workflow [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/dotnet-dependency-graph/tasks.md), whose task numbers are kept in brackets.
**Status**: every task is done; each was logged in the standalone implementation logs, copied to [implementation-logs/](implementation-logs/).

## Notes from the source

The source's Tasks Document opens with these notes, verbatim.

**One developer owns this specification end to end**, in a worktree. The tasks are ordered so each lands on a green tree, and the reading stages (solution, project, package cache) are separable from the graph so the parsing can be tested without a canvas.

**Every task is `[normal]`, and that is a finding rather than an oversight.** The previous backend specification needed `[HOLD]` landings because it renamed types consumed across the module tree. **This one adds a module and renames nothing**: no shared type moves, no proto is re-namespaced, no existing consumer changes. The blast radius of every task below is the module's own folder, **plus the two registries a new module must enumerate itself in** - the backend solution (`EtAlii.Adp.slnx`, already listed in task 1) and the client's `generate` script in `src/client/package.json`, a chain of `buf generate` calls with one entry per module that has a proto - **plus, in two tasks, a documentation file.**

**The tripwire, stated correctly: if a task needs to teach anything outside the module folder about .NET, MSBuild, NuGet or solution files, the design was wrong - and that is not a reason to arrange a hold, it is a reason to stop and route it.** It guards against the module's *concepts* leaking outward. **Enumerating the module in a registry is not a concept leak**, and an earlier draft of this document said "any change outside the module folder", which was wrong in a way its own task 1 contradicted. **A tripwire that fires falsely is worse than none**: the developer who met this one argued instead of stopping, which is a property of that developer rather than of the rule.

**Every landing:** the four gates green on the merged tree (exit codes captured **before any pipe**, `Zero tests ran` read as a broken build), a **fresh-tree build**, and `jb inspectcode` clean for the affected projects. Merge with the fast-forward **withheld** and land it in the foreground after a fresh read of `develop` - a chained fast-forward moved `develop` under another session's open window once already.

**Worktree.** A short name - a long one pushes the deepest project paths past `MAX_PATH`, and the symptom is `dotnet test` reporting `Zero tests ran` rather than failing. `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0` before gating. Identity at creation: `git config --worktree user.name "developer-N-dotnet-dependency-graph"`, read back with plain `git config user.name` before the first commit.

### Coverage

**The diff was run, not promised: every requirement reference in the tasks below extracted, every acceptance criterion in the requirements listed, and the two sets compared.** All **36** acceptance criteria across Requirements 1-8 are claimed by exactly one task. **Nothing is unclaimed.**

**Three non-functional requirements are cross-cutting and deliberately claimed by no single task** - the *no task can claim it* kind rather than the *nobody claimed it* kind, named here so the diff's silence is not read as a gap:

* **Correctness - never invent an edge, never omit one silently.** Binds tasks 2, 3 and 4 together; each carries it in its own success criteria.
* **Correctness - never write to a `.csproj`, `.sln` or `.slnx`.** Binds every task. The only file this module writes is its own `.adp`, and only that file's `layout:` block.
* **Consistency with the authored `generic/dependencies` canvas.** Binds task 10, and is a review criterion rather than an assertable test.

**Scale is the exception and is claimed**, by task 13, because it needs a subject that exercises it rather than a promise that it holds.

## Phase 1: Setup

- [x] **T001** [1] [US1] 1. Create the module skeleton and register the type **[normal]** · `src/diagrams/dotnet-dependency-graph/`, `Diagram.cs`, `ServiceCollection.AddDotNetDependencyGraph.cs`, `EtAlii.Adp.slnx`
  - Files: `src/diagrams/dotnet-dependency-graph/` with `api/`, `backend/EtAlii.Adp.Diagram.DotNetDependencyGraph/`, `client/`, `examples/`; `Diagram.cs` declaring the origin; `ServiceCollection.AddDotNetDependencyGraph.cs`; solution entry.
  - **Land it empty and green before anything reads a file.** The module registers, resolves, and draws nothing - so every later task is a change to a working module rather than a step in a module that has never built.
  - **Core gains nothing.** If a task in this list needs a change under `src/backend/`, stop and route it: the design says core learns no .NET, MSBuild, NuGet or solution vocabulary.
  - _Requirements: 1.1, 1.2_
  - Log: [task-1_2026-09-07T2056_8d2ccf9a.md](implementation-logs/task-1_2026-09-07T2056_8d2ccf9a.md)

## Phase 2: Reading the files and deriving the graph

- [x] **T002** [2] [US2] 2. `SolutionReader` - read `.sln` and `.slnx` **[normal]** · `SolutionReader.cs`, tests
  - Files: `SolutionReader.cs`, tests.
  - Both formats: the classic `Project(...)` lines and the newer XML. Project paths resolved relative to the solution file.
  - **An unreadable solution and a missing project file are reported, never swallowed and never fatal** - the diagram opens with what resolved.
  - _Requirements: 2.1, 2.2, 2.4_
  - Log: [task-2_2026-09-07T2056_89cf72f3.md](implementation-logs/task-2_2026-09-07T2056_89cf72f3.md)

- [x] **T003** [3] [US3] 3. `ProjectReader` - references, frameworks, central package management **[normal]** · `ProjectReader.cs`, tests
  - Files: `ProjectReader.cs`, tests.
  - `ProjectReference`, `PackageReference`, `TargetFramework`/`TargetFrameworks`. **A `PackageReference` with no `Version` resolves from `Directory.Packages.props`, walking upward as MSBuild does - this repository uses central package management, so it is the normal case here, not an edge case.**
  - **What the reader does not resolve is written in the module readme**, not left for a reader to discover from a missing edge.
  - _Requirements: 3.2, 3.3, 3.6_
  - Log: [task-3_2026-09-07T2104_09d4080c.md](implementation-logs/task-3_2026-09-07T2104_09d4080c.md)

- [x] **T004** [4] 4. `DependencyGraph` and the element id scheme **[normal]** · `DependencyGraph.cs`, `_Model/`, tests
  - Files: `DependencyGraph.cs`, `_Model/` node and edge records, tests.
  - Ids: `project:<path relative to the solution>`, `package:<package id>` - **the package id carries no version, deliberately.**
  - One element per package id; a package referenced at several versions is **one element marked as a version conflict, with the versions carried as properties**. Collapsing loudly, not silently.
  - **The guarding test: a package whose version changes keeps its element id.** It **must be seen to fail** against an id that includes the version, and only then be trusted. A test that has never been watched failing against the defect it guards is not a guard - and this one guards the design's load-bearing decision, which review left unchallenged rather than endorsed on its merits.
  - _Requirements: 3.1, 3.4, 3.5, 6.7_
  - Log: [task-4_2026-09-07T2104_3f5ecb93.md](implementation-logs/task-4_2026-09-07T2104_3f5ecb93.md)

- [x] **T005** [5] [US5] 5. `PackageDescriptionReader` - the local NuGet cache, and nothing else **[normal]** · `PackageDescriptionReader.cs`, tests
  - Files: `PackageDescriptionReader.cs`, tests.
  - Reads the `.nuspec` from the global packages folder and takes its description. **No feed. No network. No exception.** This is the user's decision, taken over a more capable recommendation, to keep the workspace-files-only principle absolute.
  - **A package that is not cached yields absence, not an error** - and absence must be distinguishable from an empty description.
  - _Requirements: 5.2, 5.3, 5.4_
  - Log: [task-5_2026-09-07T2108_1ccf6c44.md](implementation-logs/task-5_2026-09-07T2108_1ccf6c44.md)

## Phase 3: Properties and the session

- [x] **T006** [6] 6. `DotNetContextPropertyProvider` - every row read-only **[normal]** · `DotNetContextPropertyProvider.cs`, tests
  - Files: `DotNetContextPropertyProvider.cs`, tests.
  - Project rows: name, target framework, .NET version where discoverable. Package rows: id, version(s), description.
  - **Every row carries a non-empty `ReadOnlyReason`**, in the house shape - cause first, then remedy, naming the file the value lives in. `SetAsync` refuses even though the resolver already refuses server-side.
  - **A property with no value shows its absence explicitly**, never an empty field indistinguishable from an empty value.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_
  - Log: [task-6_2026-09-07T2124_68916d83.md](implementation-logs/task-6_2026-09-07T2124_68916d83.md)

- [x] **T007** [7] [US2] 7. Session and factory - bind through the `body:` header **[normal]** · `DotNetDependencyGraphSession.cs`, `DotNetDependencyGraphSessionFactory.cs`, `DotNetContextSourceResolver.cs`, tests
  - Files: `DotNetDependencyGraphSession.cs`, `DotNetDependencyGraphSessionFactory.cs`, `DotNetContextSourceResolver.cs`, tests.
  - The module declares `.sln`/`.slnx` as document extensions and binds through `body:` - **the `c4` pattern, not the ansible one**, because a bare registration cannot say which solution when a folder holds two.
  - _Requirements: 2.3_
  - Log: [task-7_2026-09-07T2124_fbc66366.md](implementation-logs/task-7_2026-09-07T2124_fbc66366.md)

## Phase 4: Layout and refresh

- [x] **T008** [8] [US6] 8. Layout - adopt `RegistrationLayout`, add nothing **[normal]** · `DotNetDependencyGraphLayout.cs`, tests
  - Files: `DotNetDependencyGraphLayout.cs` (computation only), tests.
  - Computed layering for a directed graph; `RegistrationLayout.Apply` overlays stored positions element by element; reposition dispatched as core's `SetRegistrationLayoutCommand`, undoable.
  - **If this task finds itself writing layout parsing, persistence or pruning, it has gone wrong** - core has all three and they are offered to every module.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - Log: [task-8_2026-09-07T2124_d61eee44.md](implementation-logs/task-8_2026-09-07T2124_d61eee44.md)

- [x] **T009** [9] [US7] 9. Refresh - automatic and explicit, for different reasons **[normal]** · the solution watcher, an explicit refresh action, tests
  - Files: watcher over the solution, its project files and `Directory.Packages.props`; an explicit refresh action; tests.
  - Automatic because the product capability is live pushed updates. **Explicit as well because a description can become available after a `restore` that touches no watched file** - a consequence of the cache-only decision reaching past the property it was about.
  - A refresh **must not cost the user their arrangement**; a vanished element's stored id is dropped on the next write.
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - Log: [task-9_2026-09-07T2154_51d3e3db.md](implementation-logs/task-9_2026-09-07T2154_51d3e3db.md)

## Phase 5: Client, examples and documentation

- [x] **T010** [10] [US3] 10. Client canvas **[normal]** · `client/` canvas, stream hook, tests
  - Files: `client/` canvas, stream hook, tests.
  - Follows `generic/dependencies`' conventions so two dependency graphs do not feel like two products. Projects and packages visually distinct; edges directed; **elements drag although the subject is read-only.**
  - _Requirements: 3.1 (visual), and the consistency non-functional requirement_
  - Log: [task-10_2026-09-07T2155_83aa6e33.md](implementation-logs/task-10_2026-09-07T2155_83aa6e33.md)

- [x] **T011** [11] [US8] 11. Examples **[normal]** · `examples/`
  - Files: `examples/`, replicated per structure.md; a readme recording what the corpus does **not** demonstrate.
  - **Any vendored data: permissive licence only, share-alike refused, `LICENSE.md` verbatim beside the data, read from the dataset's own statement rather than the page around it.**
  - _Requirements: 8.1, 8.2, 8.3_
  - Log: [task-11_2026-09-07T2155_f45413da.md](implementation-logs/task-11_2026-09-07T2155_f45413da.md)

- [x] **T012** [12] [US1] 12. Catalog row and documentation **[normal]** · `docs/diagrams.md`, `docs/creating-a-diagram-module.md`
  - Files: `docs/diagrams.md` row with state icon and the `dotnet/dependency-graph` origin tag; `docs/creating-a-diagram-module.md` where this module moves a touch point it names.
  - **Move the row as the state changes** rather than adding it once and leaving it stale.
  - _Requirements: 1.3, 1.4_
  - Log: [task-12_2026-09-07T2157_0725c4b3.md](implementation-logs/task-12_2026-09-07T2157_0725c4b3.md)

## Phase 6: Scale

- [x] **T013** [13] 13. Scale: run it against this repository's own solution **[normal]** · the scale answer, the implementation log
  - Files: whatever the answer requires - grouping, filtering, or a stated limit - plus the measurement recorded in the implementation log.
  - **`EtAlii.Adp.slnx` is the subject: roughly thirty backend projects plus sixty-one diagram modules.** This is the one task that cannot be satisfied by assertion, because the requirement is that the type stays *usable* at that size.
  - **Rendering an unreadable hairball and calling it correct is the failure mode this task exists to prevent.** If the answer is a limit, the diagram must say it is limited rather than silently showing part of the graph.
  - _Requirements: the performance and scale non-functional requirements_
  - Log: [task-13_2026-09-07T2154_b5f2936b.md](implementation-logs/task-13_2026-09-07T2154_b5f2936b.md)
  - Log: [task-13_2026-09-07T2218_52f3bfb4.md](implementation-logs/task-13_2026-09-07T2218_52f3bfb4.md)

## Dependencies & Execution Order

- The source orders the tasks so each lands on a green tree: task 1 lands the module empty and green before anything reads a file, and every later task changes a working module.
- The reading stages (tasks 2, 3 and 5) are separable from the graph (task 4), so the parsing is tested without a canvas and the graph without a filesystem.
- Task 6 reads the graph through the `IDependencyGraphStore` seam that task 7 implements; task 8's computation half landed a commit ahead of task 7, because a session cannot emit an element without a position (task 8's log).
- Task 9 refreshes the session of task 7; task 10 draws what the session serves; tasks 11 and 12 follow the working module; task 13 measures the finished type against `EtAlii.Adp.slnx`.
- The source has no phases of its own; the phases here group its tasks without changing their order.
