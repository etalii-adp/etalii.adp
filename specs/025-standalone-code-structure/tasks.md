# Tasks: The Structure of the Standalone Host's C# Code

**Input**: [standalone-code-structure.spec.md](standalone-code-structure.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [behaviour-changes.md](behaviour-changes.md), [contracts/](contracts/), and the report, [analysis-2026-10-10.md](analysis-2026-10-10.md).

**276 tasks in ten milestones.** T265 and T266 were added on 2026-10-11 with the ruling on DP-5 and stand in M4. T255 to T257 were struck on 2026-10-12 by the ruling on DP-1 (c), keep the stubs. The M0 review added T267 to T271 to M0 and struck T021, so 267 remained. The M1 review added T272 (in M3, beside T144 and T145), T273 and T274 (at the head of M2) and T275 and T276 (in M1), and struck nothing, so 272 remain. Paths carry their repository as prefix. The code lands in `etalii.adp.ide.standalone`; the review records and this file are in `etalii.adp`. The clones sit side by side.

## How to read a task

- `[P]` marks a task that can run beside its neighbours: other files, no dependency on an unfinished task. One developer owns the feature (FR-006), so `[P]` buys freedom of order and clean merges, not more hands.
- `[USn]` is the user story of the specification the task serves.
- The requirement and, where there is one, the report section, success criterion or register row stand at the end of the task.
- **Every task follows** [contracts/pull-request.md](contracts/pull-request.md): its own `features/025-<task>` worktree and `agent-<N>-<task>` identity, no behaviour change outside a defect or a ruled register row, the documentation it makes false in the same pull request, comments in touched files reduced to what and why, the four gates and the inspection at exit zero, a merge commit.
- **A task is ticked only when its pull request in `etalii.adp.ide.standalone` is merged** (FR-014). A task a review finds unnecessary is struck, with the review named, and never ticked.
- A task that names FR-012 reads its module's `*-disl-fbl` specification first. A task that names a `DP-n` waits for that ruling (FR-013); DP-1 to DP-6 were ruled on 2026-10-11.
- **No task of a milestone starts before the previous milestone's review is merged** (FR-010).

## M0: the safety net

### Decisions and baseline

- [x] T001 [US9] Put decision points DP-1 to DP-6 to the maintainer as selections (options, what each means, the recommended one with its reason, an "other") and record each ruling, with its date, in the *Decision points* table of `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` (FR-013). Done on 2026-10-11 in `etalii.adp`: (a) for each, DP-5 widened; DP-1 later ruled (c), keep the stubs.
- [x] T002 [P] [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/lines.py`: lines and files per project of `src/backend/EtAlii.Adp.slnx`, split into production and test and into core and the three tool kinds, classifying core by the absence of a leading `../` as `docs/solution-structure.md` warns (FR-009; report *Method*).
- [x] T003 [P] [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/clones.py`: the normalized clone scan over production code, hashing 10-line windows with module prefixes, string literals and numbers normalized, reporting shared windows per role pair and the twenty largest clone families; a second mode scans the test code (FR-009; report 1, *Method*).
- [x] T004 [P] [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/methods.py`: brace-matched method lengths in code lines, the counts over 50 and over 80, the twenty longest, and the largest types per project (FR-009; report 7, *Method*).
- [x] T005 [P] [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/graph.py`: every `ProjectReference`, `PackageReference`, `FrameworkReference` and `InternalsVisibleTo` as an edge list, the projects without a `.cs` file, and the core projects that name a tool module (FR-009; report 4).
- [x] T006 [P] [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/waits.py`: every `Task.Delay` and `Thread.Sleep` in test and in production code, with its file and line, and every polling helper (FR-009; report 8.2, 8.5).
- [x] T007 [US1] Write `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh`, which runs the five scripts on the checked-out commit and writes `measurements.json` and `measurements.md`, with `--self-test` on a small fixture tree kept beside it and a `readme.md` saying what each figure means; the scripts are tools and are not added to the product test suite (FR-009).
- [x] T008 [US1] Run `measure.sh` on `fcb64c9` and compare each figure with the report's (lines per group, the role-pair table of section 1, 145 and 40 long methods, 129 projects, 84 waits); explain every difference over 5% in the M0 review before any figure is used as a target (FR-009).
- [x] T009 [US1] Run `measure.sh` on the `develop` commit the work starts from and save it as `etalii.adp/specs/025-standalone-code-structure/reviews/baseline-measurements.json`; restate SC-005 to SC-023 against it where the baseline differs from the report (FR-009).
- [x] T010 [US9] Read the state of the fifteen `etalii.adp.ide.standalone/.spec-workflow/specs/*-disl-fbl/` specifications and of `fbl-implementation` and `fbl-written-text` (approved, tasks written, implementation logs present), and list in the M0 review which tasks of this feature fall under FR-012 for each module (FR-012).

### The testing projects

- [x] T011 [US1] In `etalii.adp.ide.standalone/src/Directory.Build.targets`, attach `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/EtAlii.Adp.TestSupport.csproj` as a `ProjectReference` of every `*.Tests` project; keep `LogCapture.cs` and `LogCaptureCaptureSink.cs` compiled in, with the comment that explains why, and see `LogCaptureReachesModuleTestProjects.Tests.cs` still pass; correct the *TestSupport* paragraphs of `etalii.adp.ide.standalone/docs/solution-structure.md` (FR-015; report 8.6).
- [x] T012 [P] [US1] Add `TestFolder.Create(prefix)`, a disposable temporary folder, to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/` and move `TestFolder.TryDelete` there from `etalii.adp.ide.standalone/src/TestSupport/TestFolder.cs`; use it in the test project that gains it first (FR-015; report 8.6).
- [x] T013 [P] [US1] Add `RepositoryPaths` (the repository root, `src/`, `src/examples/`, `src/fixtures/`) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/`, with its first consumer (FR-015; report 8.6).
- [x] T014 [P] [US1] Add one `Eventually` wait-until helper to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/`, taking a `TimeProvider`, with its first consumer (FR-015; report 8.5).
- [x] T015 [P] [US1] Add `TestHistory.For(configure)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/TestHistory.cs`, so that a module test builds the real command pipeline with its own registrations (`TestHistory.For(s => s.AddTimeline())`), with the timeline tests as first consumer (FR-015; report 8.6).
- [x] T016 [US1] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport.Host/EtAlii.Adp.TestSupport.Host.csproj` (with its `.DotSettings`), add it to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.slnx`, and correct the project counts and tables of `etalii.adp.ide.standalone/docs/solution-structure.md` and the figures in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Repository.Tests/ArchitecturePages.Tests.cs` (FR-015, FR-004; research R6).
- [x] T017 [US1] Add `HostFixture`, one in-process host per test class, to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport.Host/`, and move the first flow class of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/` onto it (FR-016; report 8.1).
- [x] T018 [US1] Add `FlowSession` (sign in, add a project, create a channel, the message timeout, the baseline) and `FlowConstants` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport.Host/`, and move the same flow class onto them (FR-016; report 8.1).
- [x] T019 [US1] Generalize `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/HierarchyWatchProbe.cs` into `StreamProbe.WaitUntilLiveAsync(stream, provoke, recognize)` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport.Host/`, keeping its rule of returning on the last probe provoked; the hierarchy flows use it (FR-017; report 8.2; research R7).
- [x] T020 [US1] Give `StreamProbe` a provocation for context watches and replace every fixed wait before a context stream is read in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/`; if a context stream has nothing harmless to provoke, stop and report it for the M0 review (FR-017; report 8.2).
- [ ] ~~T021 [US1] Give `StreamProbe` a provocation for diagram streams and replace every fixed wait before a diagram stream is read, the six in `DiagramElementActionFlow.Tests.cs` first (FR-017; report 8.2).~~ struck by the M0 review: no fixed wait preceded a diagram stream; the six waits of `DiagramElementActionFlow.Tests.cs` stood before context watches and went with T020 (standalone pull request 178).
- [x] T022 [US1] Move the flow classes of the core areas (hierarchy, context, history, projects, problems, sign-in) in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/` onto `HostFixture`, `FlowSession` and `FlowConstants`, deleting their private `LoginAsync`, `AddProjectAsync`, `CreateChannel`, `CreateMessageTimeout` and `BaselineAsync` (FR-016; report 8.1).
- [x] T023 [P] [US1] Move the first half of the module flow classes in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/` (in alphabetical order, `RdfFlow` and `OwlFlow` in the same pull request so that their 606 shared lines meet) onto the harness (FR-016; report 8.1).
- [x] T024 [P] [US1] Move the second half of the module flow classes onto the harness; after it no file under `Integration Tests/` declares a `WebApplicationFactory` or a user constant of its own (FR-016; report 8.1).
- [x] T025 [US1] Delete the `StreamStartupGrace` constant in every file of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/` that declares it (500 ms, and 250 ms in two files); `waits.py` reports no fixed wait before a stream read (FR-017; SC-001).
- [x] T026 [US1] Add a manually triggered workflow `etalii.adp.ide.standalone/.github/workflows/stability.yml` that runs `dotnet test` twenty times on the GitHub runner and reports every run's result; run it and record the twenty results in the M0 review (SC-002).

### Quick wins

- [x] T027 [P] [US4] Remove the reference to `EtAlii.Adp.Backend` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/EtAlii.Adp.Diagram.csproj` and from the 13 diagram module projects under `etalii.adp.ide.standalone/src/diagrams/` that reference it without using it; `graph.py` names them (FR-018; report 4.2).
- [x] T028 [P] [US2] Delete the toolbox providers and rule sets that only forward (`TimelineToolboxProvider.cs`, `TimelineRuleSet.cs`, `DependencyGraphRuleSet.cs` and their like under `etalii.adp.ide.standalone/src/diagrams/`) wherever the target can be registered directly; list the ones that must wait for `DislToolboxProvider` in M3 (FR-018; report 3, *DISL adapter scaffolding*).
- [x] T029 [P] [US4] Correct the stale comment in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Service/Program.cs` (lines 74 to 78 at the report's reading) about a `DiagramDefinition.All`/`Initialize` that no longer exists, remove the `InternalsVisibleTo` for it in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/EtAlii.Adp.Diagram.csproj`, and delete the commented-out code in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/HierarchyModel.cs` (FR-018, FR-007; report 5.1, 5.4).
- [x] T030 [P] [US1] Settle whether `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Repository.Tests/ShippedExamples.Tests.cs` leaves out the `.ghg`, `.ttl` and `.rq` examples on purpose: read its history; if not on purpose, sweep every shipped extension from the tool definitions without a hard-coded list, and correct what the wider sweep finds (FR-019; report 8.7).

### Possible defects

- [x] T031 [US1] Confirm that pull request 167 of `etalii.adp.ide.standalone` is merged and that D1, D3, D7 and D8 each have their guard on `develop` (in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents.Tests/`, the causal-loop module's tests and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Cel.Tests/`); if it was closed unmerged, add the four as guard-first tasks in the M0 review (FR-020).
- [x] T032 [US1] A Tester checks D2 in the running application: in an agent-behavior-modelling diagram and in a mindmap, press each shortcut that `etalii.adp.ide.standalone/src/diagrams/agent-behavior-modelling/backend/` (`AbmDefinition.cs`) and the mindmap module send with a key such as `Alt+Up` and no modifier flags, and record whether the action runs (FR-021; report D2).
- [x] T033 [US1] If T032 shows a shortcut that does not work: write a guard that fails on `ContextShortcutDefinition.Matches` for that shape, then send the modifiers as timeline, dependency-graph and gartner-hype-cycle-graph do. If it works: strike D2 in the M0 review with the evidence and correct the report's reading in a comment at `AbmDefinition` (FR-021, FR-005).
- [x] T034 [US5] D5, guard first: a test in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Context.Tests/` in which the first `DiscoverAsync` of a watch throws, and one in which it is cancelled, each asserting that the history stack and the problem watch are released; see both fail; then move the retain in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Context/ContextService.cs` inside the `try` (FR-023, FR-005; report 5.2).
- [x] T035 [US4] D6, guard first: tests in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Tests/` for a path that differs from the root only in case (accepted on Windows, refused on Linux) and for a symbolic link that leaves the root (refused on both), written against `ProjectTextFile.TryResolve` and seen to fail; then add `PathContainment` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/` with an operating-system-correct comparer and a link check, and make `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/ProjectTextFile.cs` use it (FR-024, FR-005; report 4.5; behaviour-changes B-10, B-11).
- [x] T036 [P] [US4] Move `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/ProjectValidator.cs` and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/ProblemMaintenance.cs` onto `PathContainment`, each with a guard for the escaping link (FR-024).
- [x] T037 [P] [US4] Move `HierarchyModel.cs`, `HierarchyModelStore.cs`, `DiagramFilePair.cs` and `HierarchyContextSourceResolver.cs` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/` onto `PathContainment`; `graph.py` or a search finds no other containment test (FR-024; SC-014).
- [x] T038 [US6] D9: read what `etalii.adp/specifications/fbl/FBL-specification.md` says about a computed or empty value on insert, write the fixture pair that shows `JsonFamily.WireValue` and `YamlFamily.WireValue` disagreeing, and record the answer in `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` (B-09); if the specification is silent, write up the question as a feature for `etalii.adp` and leave the code unchanged (FR-025; report D9).
- [x] T039 [US9] Put rows B-01, B-02, B-04, B-05 and B-06 of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` to the maintainer as selections and record the rulings (FR-002).

### Review

- [x] T040 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M0's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M0-measurements.json` (FR-009, FR-010).
- [x] T041 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M0-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M0 (the safety net) and the success criteria due, an answer for every candidate named for the M0 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M1 needs (FR-010, FR-011, FR-012).
- [x] T042 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

### Added by the M0 review

- [x] T267 [US4] Run the containment guards on Windows: `PathContainment.Tests` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Tests/` and the link guards of T036 and T037, once, by the maintainer on his Windows machine in developer mode so the link guards are not skipped (ruled on question 2 of the M0 review, chat, 2026-10-12). The M1 review records the result (FR-024; SC-014). Done on 2026-10-12 on the maintainer's Windows 11 machine (Developer Mode on), against `etalii.adp.ide.standalone` develop `25669b48f`: `EtAlii.Adp.Tests` 61, `EtAlii.Adp.Hierarchy.Tests` 414 and `EtAlii.Adp.Problems.Tests` 99 tests, none failed and none skipped, so all six link guards ran and passed. An earlier run without Developer Mode skipped exactly those six.
- [x] T268 [US1] A Tester checks azure-devops-pipeline's Move up and Move down in the running application: select a step, press Alt+Up and Alt+Down, which `etalii.adp.ide.standalone/src/diagrams/azure-devops-pipeline/backend/EtAlii.Adp.Diagram.AzureDevOpsPipeline/PipelineContextActionProvider.cs` sends as the key `"Alt+Up"` and `"Alt+Down"` with no modifier flag, and record whether the step moves and the file is rewritten, with the context menu as control (FR-021; report D2). Done on 2026-10-12, headless, recorded in standalone pull request 192: the shortcuts did not work, because the backend sent the key `"Alt+Up"` with Alt unset and the canvas never declared the actions.
- [x] T269 [US1] If T268 shows a shortcut that does not work: a guard that fails on `ContextShortcutDefinition.Matches` for Alt with `ArrowUp` and with `ArrowDown`, then send `ContextShortcutDefinition("ArrowUp", Alt: true)` and `ContextShortcutDefinition("ArrowDown", Alt: true)` from `PipelineContextActionProvider.cs`, and see both shortcuts work in the running application. If they work: the M1 review strikes this task with T268's evidence (FR-021, FR-005; report D2). Done in standalone pull request 192 (2026-10-12): the backend and canvas guards seen to fail first; the provider sends `ArrowUp` and `ArrowDown` with Alt, and the canvas declares both moves for steps.
- [x] T270 [US1] As ruled on question 4 of the M0 review (chat, 2026-10-12): make `lines.py`, `methods.py` and `waits.py` in `etalii.adp.ide.standalone/.github/tools/analysis/` count `EtAlii.Adp.TestSupport` and `EtAlii.Adp.TestSupport.Host` as test code and `graph.py` read the references of `src/Directory.Build.targets`, with the self-test fixture extended for both and `readme.md` saying so; then measure `1217e1d97` and `d5278a3c6` again and replace `etalii.adp/specs/025-standalone-code-structure/reviews/baseline-measurements.json` and `M0-measurements.json`, restating `etalii.adp/specs/025-standalone-code-structure/reviews/baseline.md` where a figure moves (FR-009; SC-005, SC-010, SC-023). Done in standalone pull request 195 (2026-10-12); the baseline and M0 measured again and `baseline.md` and `M0-review.md` restated in `etalii.adp`.
- [x] T271 [US1] Add a `schedule` trigger to `etalii.adp.ide.standalone/.github/workflows/stability.yml`, nightly (ruled on question 5 of the M0 review, chat, 2026-10-12), beside the manual one; each review reads the runs since the previous review (SC-002). Done in standalone pull request 193 (2026-10-12): nightly at 02:30 UTC.

## M1: the module middle layer, piloted

### Band A: persistence (report 1.3, 1.4)

- [x] T043 [US2] Add `IDiagramDocumentStore` (reload, body deleted, forget) and `DiagramDocumentReloader<TStore>` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, with the abstract `DocumentReloaderContract` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/`; sankey adopts: delete `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/SankeyDocumentReloader.cs`, reduce `ISankeyDocumentStore.cs` to a marker, and derive its reloader tests from the contract. DP-3 is ruled (a) (FR-028, FR-035, FR-008). Done in standalone pull request 200 (2026-10-13).
- [x] T044 [US2] Add `DocumentEntry<TBody, TModel>` with one failure field, `DocumentChangedEventArgs` and `LifecycleDocumentStore<TEntry, TBody>` (abstract `Read`, `TextOf`, `Rebuild`) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, with the abstract `DocumentStoreContract` (lost edit, own save ignored, last good document kept, deleted body) in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/`; sankey adopts: `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/SankeyDocumentStore.cs` becomes a subclass, `_Model/SankeyDocumentEntry.cs` and its event args go, its lost-edit tests derive from the contract (FR-029, FR-035). Done in standalone pull request 201 (2026-10-13).
- [x] T045 [US2] Add `AddDiagramSession(origin, factory)` over a delegate-based `DiagramSessionFactory` and `AddEmptyDocument(origin, text)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`; sankey adopts in `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/ServiceCollection.AddSankey.cs` and loses `SankeySessionFactory.cs` and `SankeyDocumentFactory.cs`; update the persistence section of `etalii.adp.ide.standalone/docs/creating-a-diagram-module.md` (FR-030, FR-004). Done in standalone pull request 202 (2026-10-13).
- [x] T046 [P] [US2] supply-chain adopts band A in `etalii.adp.ide.standalone/src/diagrams/supply-chain/backend/EtAlii.Adp.Diagram.SupplyChain/`: the generic reloader, the store base and entry, the session and empty-document registrations, and the two contract tests; anything a base type could not carry is taken up in the base, never with a switch on the module (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 207 (2026-10-13).
- [x] T047 [P] [US2] functional-decomposition-graph adopts band A in `etalii.adp.ide.standalone/src/diagrams/functional-decomposition-graph/backend/EtAlii.Adp.Diagram.FunctionalDecompositionGraph/`: the generic reloader, the store base and entry, the session and empty-document registrations, and the two contract tests; anything a base type could not carry is taken up in the base, never with a switch on the module (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 208 (2026-10-13).
- [x] T048 [P] [US2] gartner-hype-cycle-graph adopts band A in `etalii.adp.ide.standalone/src/diagrams/gartner-hype-cycle-graph/backend/EtAlii.Adp.Diagram.GartnerHypeCycleGraph/`: the generic reloader, the store base and entry, the session and empty-document registrations, and the two contract tests; anything a base type could not carry is taken up in the base, never with a switch on the module (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 209 (2026-10-13).
- [x] T049 [US2] Band A check: run `clones.py` over the four pilots; the store, entry, reloader and factory roles share no window between them. Record what the base types had to change to fit four modules, for the M1 review (FR-027). Done on 2026-10-13, recorded in `reviews/M1-review.md`: 84 shared windows before band A, none after.

### Band B: session and resolver (report 1.1, 1.2)

- [x] T050 [US2] Add `DocumentDiagramSession<TStore, TModel>` (abstract `Model()` and `Render(model, viewport)`, virtual placement command and refusal texts, deltas through `DiagramDocumentChangeHandler`) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`; `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/SankeySession.cs` derives from it (FR-031). Done in standalone pull request 211 (2026-10-13).
- [x] T051 [US2] Add `Disposable.From(Action)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/` and `DiagramElementSourceResolver<TModel>` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/` (the parent-scope check, the route and origin check, the placement and relation gesture ids, the client-path check, the payload from a single-element mapping, the `ContextTarget`); `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/SankeyContextSourceResolver.cs` supplies only its origin, loading, description, single-element mapping and subscription, and its private unsubscriber goes (FR-032). Done in standalone pull request 212 (2026-10-13).
- [x] T052 [P] [US2] supply-chain adopts band B in `etalii.adp.ide.standalone/src/diagrams/supply-chain/backend/EtAlii.Adp.Diagram.SupplyChain/`: its session derives from the session base and its resolver from the resolver base; `FdgContextSourceResolver` and `GhgContextSourceResolver` differ afterwards only in how they describe an element (FR-031, FR-032). Done in standalone pull request 213 (2026-10-13).
- [x] T053 [P] [US2] functional-decomposition-graph adopts band B in `etalii.adp.ide.standalone/src/diagrams/functional-decomposition-graph/backend/EtAlii.Adp.Diagram.FunctionalDecompositionGraph/`: its session derives from the session base and its resolver from the resolver base; `FdgContextSourceResolver` and `GhgContextSourceResolver` differ afterwards only in how they describe an element (FR-031, FR-032). Done in standalone pull request 214 (2026-10-13).
- [x] T054 [P] [US2] gartner-hype-cycle-graph adopts band B in `etalii.adp.ide.standalone/src/diagrams/gartner-hype-cycle-graph/backend/EtAlii.Adp.Diagram.GartnerHypeCycleGraph/`: its session derives from the session base and its resolver from the resolver base; `FdgContextSourceResolver` and `GhgContextSourceResolver` differ afterwards only in how they describe an element (FR-031, FR-032). Done in standalone pull request 215 (2026-10-13).
- [x] T055 [US2] Band B check: `clones.py` over the four pilots for the session and resolver roles; record what did not fit (FR-027). Done on 2026-10-13, recorded in `reviews/M1-review.md`: 1,333 lines and 181 shared windows before band B, 591 lines and 26 windows after, all of them declarations.

### Band C: commands and providers (report 1.5, 1.6)

- [x] T056 [US2] D4, guard first: add the abstract `EditHandlerContract` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/` (a save that warns gives a command result that carries the warning; a missing element is refused), run it against a handler that builds its result with `Failed ? Failure : Success` and see it fail; then add `CommandResult.FromSave(DocumentSaveResult, ICommand inverse)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.History/` (FR-022, FR-033, FR-005; report D4). Done in standalone pull request 216 (2026-10-13).
- [x] T057 [US2] Add `DocumentEditHandler<TCommand, TEntry>` (one abstract `Apply(entry, command)` giving an inverse or a refusal) and `DocumentEditRun` with one `EditOutcome` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.History/`; the nine handlers in `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/Commands/` derive from it, `SankeyEdits.cs` goes, and the module's handler tests derive from `EditHandlerContract` (FR-033). Done in standalone pull request 217 (2026-10-13).
- [x] T058 [US2] Add the provider frame to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`: `DispatchAsync`, the scope, `DiscoverAsync` from the definition's menus, the could-not-be-read guard and the deletion confirmation; `etalii.adp.ide.standalone/src/diagrams/sankey/backend/EtAlii.Adp.Diagram.Sankey/SankeyContextActionProvider.cs` and `SankeyContextPropertyProvider.cs` adopt it. Read `sankey-disl-fbl` first (FR-034, FR-012). Done in standalone pull request 220 (2026-10-13).
- [x] T059 [P] [US2] supply-chain adopts band C in `etalii.adp.ide.standalone/src/diagrams/supply-chain/backend/EtAlii.Adp.Diagram.SupplyChain/`: its command handlers derive from the handler base, with `EditHandlerContract` seen to fail for the module first where its handlers dropped the warning, and its `XEdits.Run` and `XEdit` struct go; its providers adopt the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 221 (2026-10-13).
- [x] T060 [P] [US2] functional-decomposition-graph adopts band C in `etalii.adp.ide.standalone/src/diagrams/functional-decomposition-graph/backend/EtAlii.Adp.Diagram.FunctionalDecompositionGraph/`: its command handlers derive from the handler base, with `EditHandlerContract` seen to fail for the module first where its handlers dropped the warning, and its `XEdits.Run` and `XEdit` struct go; its providers adopt the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 222 (2026-10-13).
- [x] T061 [P] [US2] gartner-hype-cycle-graph adopts band C in `etalii.adp.ide.standalone/src/diagrams/gartner-hype-cycle-graph/backend/EtAlii.Adp.Diagram.GartnerHypeCycleGraph/`: its command handlers derive from the handler base, with `EditHandlerContract` seen to fail for the module first where its handlers dropped the warning, and its `XEdits.Run` and `XEdit` struct go; its providers adopt the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 223 (2026-10-13).
- [x] T062 [US2] Read `etalii.adp.ide.standalone/docs/creating-a-diagram-module.md` and the *how a diagram type plugs in* section of `etalii.adp.ide.standalone/docs/architecture.md` from start to end against sankey as it now is, and correct what the band pull requests left behind (FR-004). Done in standalone pull request 224 (2026-10-13).
- [x] T063 [US2] List the types of each pilot module beside the shape of report 1.7 (`Diagram.cs`, `ServiceCollection.AddX.cs`, document, session, resolver, mapper, actions, properties, parser and writer, commands) and name every extra type with its reason, for the M1 review (FR-036). Done on 2026-10-13, recorded in `reviews/M1-review.md`: all four pilots have every type of the shape; the extra types are listed there with their reasons.

### Review

- [x] T064 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M1's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M1-measurements.json` (FR-009, FR-010). Done on 2026-10-13 on `develop` `3daf9654c`, the merge commit of standalone pull request 224.
- [x] T065 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M1-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M1 (the four pilot modules have the shape of report 1.7) and the success criteria due, an answer for every candidate named for the M1 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M2 needs (FR-010, FR-011, FR-012). Done on 2026-10-13.
- [x] T066 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014). Done on 2026-10-13: T043 to T066 ticked, T272 to T276 added, nothing struck, no success criterion amended.

### Added by the M1 review

- [x] T275 [US1] Make the nightly schedule of `etalii.adp.ide.standalone/.github/workflows/stability.yml` fire: by the M1 review it had not run once since T271, every run having been started by hand. Find why, correct it, see a scheduled run on `develop`, and read the runs since the previous review at each review (SC-002). Done on 2026-10-13: nothing needed correcting. The cron (`30 2 * * *`) and the workflow's state were right, and run 7 of the Stability workflow was started by the schedule on `develop` (at 09:41 UTC, GitHub starting scheduled runs late), on commit `bb41003`.
- [x] T276 [US1] The M1 stability run failed once (run 16 of 20) in the first case of `etalii.adp.ide.standalone/src/editors/yaml/client/yamlScalarColour.test.tsx`, which found no highlighted text: make its `mount` wait until CodeMirror has parsed the document, having seen the case fail without the wait first, and run the Stability workflow again (SC-002, FR-005). Done in standalone pull request 226 (2026-10-13); runs 6 and 7 of the Stability workflow on `bb41003` were both green, 40 of 40.

## M2: the middle layer in every module, and the sibling modules

### Added by the M1 review, before band B of any module

- [x] T273 [US2] Add the abstract `DiagramElementSourceResolverContract` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/` and derive the resolver tests of sankey, supply-chain, functional-decomposition-graph and gartner-hype-cycle-graph from it; the band B tasks of M2 then use it (FR-030, FR-035). Done in standalone pull request 227 (2026-10-13); every sabotage of the base resolver was seen to turn the contract red.
- [x] T274 [US2] `DiagramElementSourceResolver` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/` takes the document store and gives `Load` and a default `Follow` itself; the pilots drop those overrides, supply chain keeping its own `Follow` (FR-027, FR-030). Done in standalone pull request 228 (2026-10-13); supply chain's `Follow` now adds to the base's.

### Document-based modules, one module per pull request (report 1)

- [x] T067 [P] [US2] agent-behavior-modelling, band A in `etalii.adp.ide.standalone/src/diagrams/agent-behavior-modelling/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 229 (2026-10-13); the document factory stays a class, the new model's title being the file's name.
- [x] T068 [US2] agent-behavior-modelling, band B in `etalii.adp.ide.standalone/src/diagrams/agent-behavior-modelling/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type (FR-031, FR-032). Done in standalone pull request 232 (2026-10-13); the bases gained `ParentMoveOf` and `HasChildren`, and the resolver contract an overridable rename and `SelectedIn`, for a module whose `.md` is shared.
- [x] T069 [US2] agent-behavior-modelling, band C in `etalii.adp.ide.standalone/src/diagrams/agent-behavior-modelling/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. Its providers read a bundled DISL definition: FR-012 (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 235 (2026-10-13); both provider frames gained `Serves`, by which a behavior model is told apart by origin from every other `.md`. Behaviour change (B-14): an action or property change on an unreadable model, Arrange included, is refused up front. The module never dropped the save warning, so the contract was seen red by dropping it in the shared edit run.
- [x] T070 [P] [US2] agent-activity-diagram, band A in `etalii.adp.ide.standalone/src/diagrams/agent-activity-diagram/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. `AadSession.cs` already holds its factory; the factory becomes a registration (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 231 (2026-10-13); the store base gained `UnreadableOf` and the save against the file as it is now.
- [x] T071 [US2] agent-activity-diagram, band B in `etalii.adp.ide.standalone/src/diagrams/agent-activity-diagram/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type (FR-031, FR-032). Done in standalone pull request 233 (2026-10-13); the bases gained `Shown` and `ProposedOf`.
- [x] T072 [US2] agent-activity-diagram, band C in `etalii.adp.ide.standalone/src/diagrams/agent-activity-diagram/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. `AadProviders.cs` already holds toolbox, properties and validator in one file; keep that (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 236 (2026-10-13); the bases gained `IEditSavingDocumentStore`, `DocumentEditRun.RunOnCurrent`, `CurrentDocumentEditHandler` and `WarningEditSavingDocumentStore`, which databricks, causal loop and RDF can use. Behaviour change (B-14): a property change on an unreadable activity file is refused up front. The module never dropped the save warning either; the contract was seen red by dropping it in `RunOnCurrent`.
- [x] T073 [P] [US2] timeline, band A in `etalii.adp.ide.standalone/src/diagrams/timeline/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 234 (2026-10-13); its behaviour changes (an unreadable first open held unreadable, the base's save refusal wording) are listed in that pull request for the M2 review.
- [x] T074 [US2] timeline, band B in `etalii.adp.ide.standalone/src/diagrams/timeline/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. The session is one of the 13 that hand-roll `_delivered` and `DiagramDiff.Between` (`TimelineSession.cs`) (FR-031, FR-032). Done in standalone pull request 237 (2026-10-13); its behaviour changes are listed in that pull request for the M2 review.
- [x] T075 [US2] timeline, band C in `etalii.adp.ide.standalone/src/diagrams/timeline/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. Add `RestoreLinesCommandHandler<TStore>` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.History/` here, as its first consumer; inline the `TimelineNewPlacement` and `TimelineRelationGesture` forwarders to core `GestureIds` (FR-039) (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 238 (2026-10-13); its behaviour changes are listed in that pull request for the M2 review.
- [x] T076 [P] [US2] dependency-graph, band A in `etalii.adp.ide.standalone/src/diagrams/dependency-graph/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 239 (2026-10-13); its behaviour changes are listed in that pull request for the M2 review.
- [x] T077 [US2] dependency-graph, band B in `etalii.adp.ide.standalone/src/diagrams/dependency-graph/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. Its session is one of the 13 with a hand-rolled diff (FR-031, FR-032). Done in standalone pull request 240 (2026-10-13); its behaviour changes are listed in that pull request for the M2 review.
- [x] T078 [US2] dependency-graph, band C in `etalii.adp.ide.standalone/src/diagrams/dependency-graph/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. Use `RestoreLinesCommandHandler<TStore>`; inline its gesture forwarders (FR-039) (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 241 (2026-10-13); its behaviour changes are listed in that pull request for the M2 review.
- [x] T079 [P] [US2] mindmap, band A in `etalii.adp.ide.standalone/src/diagrams/mindmap/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. Its store has no `Forget` and reacts to the kind of structural change; where the base does not fit, the module keeps its own and says why (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 242 (2026-10-13); mindmap keeps its own store and document factory, with the reason in the code, by the rule that a module which cannot adopt a shared type keeps its own; the M2 review records it.
- [x] T080 [US2] mindmap, band B in `etalii.adp.ide.standalone/src/diagrams/mindmap/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. Its session is one of the 13 with a hand-rolled diff (FR-031, FR-032). Done in standalone pull request 244 (2026-10-13); mindmap keeps its own session and resolver, with the reason in the code, by the same rule; the M2 review records it.
- [x] T081 [US2] mindmap, band C in `etalii.adp.ide.standalone/src/diagrams/mindmap/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 246 (2026-10-13); mindmap keeps its own handlers and providers, with the reason in the code, by the same rule; the M2 review records it.
- [x] T082 [P] [US2] databricks, band A in `etalii.adp.ide.standalone/src/diagrams/databricks/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. One engine serves bundle, job and pipeline; the registrations loop over the family's origins (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 243 (2026-10-13); the document factory keeps a class because its empty document depends on the file's base name; the M2 review records it.
- [x] T083 [US2] databricks, band B in `etalii.adp.ide.standalone/src/diagrams/databricks/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. Its session is one of the 13 with a hand-rolled diff (FR-031, FR-032). Done in standalone pull request 247 (2026-10-13); one resolver is registered per type of the family, and a selection now carries the canvas payload; both are listed in that pull request for the M2 review.
- [x] T084 [US2] databricks, band C in `etalii.adp.ide.standalone/src/diagrams/databricks/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012). Done in standalone pull request 249 (2026-10-13); an edit on a file that does not parse is refused with the shared wording, and task removal goes through the frame; both are listed in that pull request for the M2 review.
- [x] T085 [P] [US2] causal-loop-diagram, band A in `etalii.adp.ide.standalone/src/diagrams/causal-loop-diagram/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 252 (2026-10-13); a missing or deleted causal loop file now opens as a new empty diagram, as in the other modules (Peter, card, 2026-10-13).
- [x] T086 [US2] causal-loop-diagram, band B in `etalii.adp.ide.standalone/src/diagrams/causal-loop-diagram/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type (FR-031, FR-032). Done in standalone pull request 256 (2026-10-13); an id with the placement prefix that does not parse as a point is now refused as gone; noted for the M2 review.
- [ ] T087 [US2] causal-loop-diagram, band C in `etalii.adp.ide.standalone/src/diagrams/causal-loop-diagram/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. `CausalLoopContextPropertyProvider` and the writer were touched by pull request 167; start from its merge (FR-033, FR-034, FR-022, FR-012).
- [x] T088 [P] [US2] azure-devops-pipeline, band A in `etalii.adp.ide.standalone/src/diagrams/azure-devops-pipeline/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests (FR-028, FR-029, FR-030, FR-035). Done in standalone pull request 258 (2026-10-13); the store keeps its own class, because a pipeline's parse needs the workspace root to resolve templates and the store base reads a body from its text alone; it extends the shared store interface, so the shared reloader, entry and changed event serve it. The empty-document factory keeps its class, since its document names the diagram. Noted for the M2 review.
- [ ] T089 [US2] azure-devops-pipeline, band B in `etalii.adp.ide.standalone/src/diagrams/azure-devops-pipeline/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type (FR-031, FR-032).
- [ ] T090 [US2] azure-devops-pipeline, band C in `etalii.adp.ide.standalone/src/diagrams/azure-devops-pipeline/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012).
- [ ] T091 [P] [US2] c4, band A in `etalii.adp.ide.standalone/src/diagrams/c4/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. Its entry keeps a `bool` failure today (`C4DocumentEntry.cs`); it takes the one failure field. It keeps its session and document factories, because they read registration headers (FR-028, FR-029, FR-030, FR-035).
- [ ] T092 [US2] c4, band B in `etalii.adp.ide.standalone/src/diagrams/c4/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type (FR-031, FR-032).
- [ ] T093 [US2] c4, band C in `etalii.adp.ide.standalone/src/diagrams/c4/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012).
- [ ] T094 [P] [US2] wardley-map, band A in `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. Its store is the one that produces save warnings today (FR-028, FR-029, FR-030, FR-035).
- [ ] T095 [US2] wardley-map, band B in `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. Its session is one of the 13 with a hand-rolled diff (FR-031, FR-032).
- [ ] T096 [US2] wardley-map, band C in `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. `RestoreWardleyDocumentCommandHandler` duplicates `RestoreDocumentCommandHandler<TStore>` and goes; the twelve handlers of `Commands/WardleyElementCommandHandlers.cs` derive from the base; one `DiagramAction` record per action replaces the two `switch (actionId)` blocks of `WardleyContextActionProvider` and the third mapping in `WardleyContextPropertyProvider.SetAsync` (FR-033, FR-034, FR-022, FR-012).
- [ ] T097 [P] [US2] sparql, band A in `etalii.adp.ide.standalone/src/diagrams/sparql/backend/`: the generic reloader, the store base, the one entry type and changed event, the session and empty-document registrations, the contract tests. The store is read-only: it adopts the reloader and entry, and the store base only if a read-only store fits it without a switch (FR-028, FR-029, FR-030, FR-035).
- [ ] T098 [US2] sparql, band B in `etalii.adp.ide.standalone/src/diagrams/sparql/backend/`: the session on the session base and the shared change handler, the resolver on the resolver base, no unsubscriber type. Its session is one of the 13 with a hand-rolled diff (FR-031, FR-032).
- [ ] T099 [US2] sparql, band C in `etalii.adp.ide.standalone/src/diagrams/sparql/backend/`: `EditHandlerContract` seen to fail first where the module drops the save warning, then every command handler on the handler base and the edit run; the providers on the frame where FR-012 leaves them standing. It has few commands; band C may be empty, and the task then says so (FR-033, FR-034, FR-022, FR-012).

### The RDF family (report 2)

- [ ] T100 [P] [US2] rdf, owl, shacl and skos, band A in `etalii.adp.ide.standalone/src/diagrams/rdf/backend/EtAlii.Adp.Diagram.Rdf/`: one store on the store base, the generic reloader, the registrations looping over the four origins (FR-028, FR-029, FR-030, FR-035).
- [ ] T101 [US2] Replace the four sessions (`RdfSession.cs` and its three near-copies, 24 to 47 lines apart) with one `RdfFamilySession<TProjection>` on the session base, and the four factories with one registration parameterised by origin; the four hand-rolled diffs go; the resolver adopts the resolver base (FR-038, FR-031, FR-032).
- [ ] T102 [US2] rdf family, band C in `etalii.adp.ide.standalone/src/diagrams/rdf/backend/EtAlii.Adp.Diagram.Rdf/`: the command handlers on the handler base; the `Edits.ExecuteAsync` copy goes (FR-033, FR-034, FR-022).

### The watched-folder modules (report 2)

- [ ] T103 [US2] Add `WatchedFolderStore<TSnapshot>` (claim, release, settle debounce, `Changed`) and `TolerantYaml` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, with a contract test; `etalii.adp.ide.standalone/src/diagrams/ansible-structure/backend/EtAlii.Adp.Diagram.AnsibleStructure/` adopts: `AnsibleWatchedFolder.cs`, `AnsibleYaml` and its `NodeSubscription` go, `AnsibleProjectStore` becomes a snapshot reader (FR-037).
- [ ] T104 [P] [US2] helm-chart adopts the watched-folder store and `TolerantYaml` in `etalii.adp.ide.standalone/src/diagrams/helm-chart/backend/`: `HelmWatchedFolder.cs`, `HelmYaml` and its `NodeSubscription` go (FR-037).
- [ ] T105 [P] [US2] dotnet-dependency-graph adopts the watched-folder store in `etalii.adp.ide.standalone/src/diagrams/dotnet-dependency-graph/backend/`: `SolutionWatcher.cs` and the watching half of `DependencyGraphStore.cs` go; no module declares a `FileSystemWatcher` (FR-037).
- [ ] T106 [P] [US2] ansible-structure, band B in `etalii.adp.ide.standalone/src/diagrams/ansible-structure/backend/`: the session on the shared change handler in place of its hand-rolled diff, the resolver on the resolver base; its session and document factories stay, because they read registration headers (FR-031, FR-032, FR-030).
- [ ] T107 [P] [US2] ansible-structure, band C in `etalii.adp.ide.standalone/src/diagrams/ansible-structure/backend/`: the command handlers it has on the handler base, the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012).
- [ ] T108 [P] [US2] helm-chart, band B in `etalii.adp.ide.standalone/src/diagrams/helm-chart/backend/`: the session on the shared change handler in place of its hand-rolled diff, the resolver on the resolver base; its session and document factories stay, because they read registration headers (FR-031, FR-032, FR-030).
- [ ] T109 [P] [US2] helm-chart, band C in `etalii.adp.ide.standalone/src/diagrams/helm-chart/backend/`: the command handlers it has on the handler base, the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012).
- [ ] T110 [P] [US2] dotnet-dependency-graph, band B in `etalii.adp.ide.standalone/src/diagrams/dotnet-dependency-graph/backend/`: the session on the shared change handler in place of its hand-rolled diff, the resolver on the resolver base; its session and document factories stay, because they read registration headers (FR-031, FR-032, FR-030).
- [ ] T111 [P] [US2] dotnet-dependency-graph, band C in `etalii.adp.ide.standalone/src/diagrams/dotnet-dependency-graph/backend/`: the command handlers it has on the handler base, the providers on the frame where FR-012 leaves them standing (FR-033, FR-034, FR-022, FR-012).

### Closing M2

- [ ] T112 [US2] Read sankey beside supply-chain, and timeline beside dependency-graph, with `clones.py`: confirm that nothing in the role classes is still shared by copy, that the two pairs are still two modules each, and list what model, parser and writer still share, for the M2 review (FR-039, FR-040).
- [ ] T113 [US2] List the types of each of the 19 modules beside the shape of report 1.7 and name every extra type with its reason, for the M2 review (FR-036; SC-007).
- [ ] T114 [US2] Read `etalii.adp.ide.standalone/docs/creating-a-diagram-module.md`, `etalii.adp.ide.standalone/docs/architecture.md` and `etalii.adp.ide.standalone/docs/solution-structure.md` from start to end against the modules as they now are (FR-004).

### Review

- [ ] T115 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M2's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M2-measurements.json` (FR-009, FR-010).
- [ ] T116 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M2-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M2 (all 19 modules stand on the middle layer) and the success criteria due, an answer for every candidate named for the M2 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M3 needs (FR-010, FR-011, FR-012).
- [ ] T117 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M3: shared utilities

### Layout (report 3)

- [ ] T118 [US3] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Layout/EtAlii.Adp.Layout.csproj` with `Rect` and `DiagramViewport.Intersects(Rect)`, move core `RowPacking` and the text-width geometry into it from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, and make c4 its first consumer (`C4Box`, `C4ElementMapper`); solution, `etalii.adp.ide.standalone/docs/solution-structure.md`, `ArchitecturePages.Tests` (FR-045, FR-004; research R10).
- [ ] T119 [P] [US3] Replace the other eight box types (`CausalLoopBox`, `AnsibleBox`, `HelmBox`, `SupplyChainBox`, `SankeyBox`, `MindmapBox`, `SparqlRect`, `GhgElementMapper.Box`) with `Rect`, one module per commit (FR-045; SC-010).
- [ ] T120 [P] [US3] Replace the hand-written viewport test (`box.Right >= viewport.MinX && ...`) in the about 17 element mappers under `etalii.adp.ide.standalone/src/diagrams/` with `DiagramViewport.Intersects` (FR-045; SC-010).
- [ ] T121 [US3] Add `Layering.LongestPath(nodes, edges, CyclePolicy)` and `CyclePolicy` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Layout/`, with `PipelineLayout.Layers` of azure-devops-pipeline as first consumer under the back-edge-is-zero policy; its layout fixtures are unchanged (FR-045; SC-011; behaviour-changes B-03).
- [ ] T122 [P] [US3] Move `DatabricksJobLayout.Layers`, `AnsibleLayout.Depth` and `DotNetDependencyGraphLayout` onto `Layering.LongestPath` with the same policy; fixtures unchanged (FR-045).
- [ ] T123 [P] [US3] Move `SupplyChainLayout.Layers` onto `Layering.LongestPath` with a Kahn policy; fixtures unchanged (FR-045).
- [ ] T124 [P] [US3] Read `SankeyLayout.ColumnsOf`, `SkosLayout` and `OwlLayout` for whether their column assignment is a layering under one of the named policies; adopt where it is, with fixtures unchanged, and record where it is not (FR-045).
- [ ] T125 [P] [US3] Add `GridPacker` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Layout/` beside `RowPacking` and move the hand-placed grids of rdf, shacl and sparql onto it; fixtures unchanged (FR-045).
- [ ] T126 [P] [US3] Add `OverlapResolver` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Layout/` with `SelfOrganizingLayout.Separate` as first consumer (`C4Layout.Spread` follows in M7); add `OrderByBarycentre` only if a module's ordering moves onto it with fixtures unchanged, and otherwise record it as struck (FR-045; research R16).

### Text and lines (report 3)

- [ ] T127 [P] [US3] wardley-map: replace `WardleyDocument.cs` with core `LineDocument` (`etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/LineDocument.cs`), adding `ReplaceLine` or `InsertLine` to core only if this module needs it; a round-trip guard for a file with equal counts of LF and CRLF, and the byte round-trip fixtures unchanged. Read `wardley-map-disl-fbl` first (FR-042, FR-012; behaviour-changes B-05).
- [ ] T128 [P] [US3] c4: replace `_Model/C4Document.cs` with core `LineDocument` (`etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/LineDocument.cs`), adding `ReplaceLine` or `InsertLine` to core only if this module needs it; a round-trip guard for a file with equal counts of LF and CRLF, and the byte round-trip fixtures unchanged. Read `c4-disl-fbl` first (FR-042, FR-012; behaviour-changes B-05).
- [ ] T129 [P] [US3] causal-loop-diagram: replace `CausalLoopDocument.cs` with core `LineDocument` (`etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/LineDocument.cs`), adding `ReplaceLine` or `InsertLine` to core only if this module needs it; a round-trip guard for a file with equal counts of LF and CRLF, and the byte round-trip fixtures unchanged. Read `causal-loop-disl-fbl` first (FR-042, FR-012; behaviour-changes B-05).
- [ ] T130 [P] [US3] Add `LineIndex` (binary search) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, offered by `LineDocument`, and replace `RdfTokenizer.LineOf`, `SparqlTokenizer.LineOf`, `RdfWriter.LineOf` and the linear `ShaclWriter.LineOf` (FR-043).
- [ ] T131 [US3] Add `TerminalScanner`, `RdfEscapes` and `NumericLiteral` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/` (not to the rdf module, which sparql may not reference) and make `RdfTokenizer.cs` read its terminals through them (FR-044).
- [ ] T132 [US3] Make `SparqlTokenizer.cs` read its terminals through the shared scanner; the parsers stay separate; `\r` in a short string is handled as B-02 is ruled, with a guard for each language (FR-044, FR-002; behaviour-changes B-02).
- [ ] T133 [US3] Promote `etalii.adp.ide.standalone/src/diagrams/databricks/backend/` `DatabricksYaml.cs` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/YamlAccess.cs` beside `YamlNodeRange` (`Scalar`, `Sequence`, `LineOf`), with databricks as first consumer (FR-046).
- [ ] T134 [P] [US3] Replace `Scalar(YamlMappingNode, key)` in the other parsers and the three local copies in `HelmChartReader` with `YamlAccess`; skip a parser whose module's conversion has started (FR-046, FR-012; SC-010).
- [ ] T135 [P] [US3] Add `DslNumber.Format` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/` and replace the six `Number(double)` of wardley-map and those of sankey, supply-chain and functional-decomposition-graph; the two-decimal form of the functional-decomposition-graph provider is handled as B-01 is ruled, with a guard (FR-047, FR-002; behaviour-changes B-01).
- [ ] T136 [US3] Add `LineLexer` (a comment policy and an escape policy) and `QuotedString.Write` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, starting from `C4Tokens.SplitWithSpans`; c4 (`C4Line.StripComment`) is first consumer. Read `c4-disl-fbl` first (FR-048, FR-012).
- [ ] T137 [P] [US3] Move `WardleyParser.WithoutComment` and the causal-loop `Tokenize` onto `LineLexer`, each with the policy it has today, and a guard for a quoted `//` in a Wardley line (FR-048, FR-012, FR-002; behaviour-changes B-04).
- [ ] T138 [P] [US3] Replace the private `Text()` quoters of `SankeyWriter.cs` and `SupplyChainWriter.cs` with the core quoter (`LineSplice.Quote` as pull request 167 left it, or `QuotedString.Write`), after a test shows they agree on every case the two private ones guard (FR-048, FR-040, FR-012).
- [ ] T139 [US3] Add `ParseOutcome<TModel>` (model, problems, usable) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/` and let `DocumentEntry` carry it; gartner-hype-cycle-graph, which already keeps findings lists, is first consumer (FR-049).
- [ ] T140 [P] [US3] Move the other parse styles onto `ParseOutcome`: exceptions caught at the parser's edge (rdf, sparql, mindmap, the `YamlException` of 11 modules), the silent skips of `WardleyParser` reported as problems, and the string or `bool` on an entry; one module per pull request, skipping a parser whose conversion has started (FR-049, FR-012).

### Time and files (report 3, 8.5)

- [ ] T141 [US3] Register `TimeProvider.System` in the host, reference `Microsoft.Extensions.TimeProvider.Testing` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport/` and record it in `etalii.adp.ide.standalone/docs/dependencies.md` (FR-051, FR-004; research R8).
- [ ] T142 [US3] Add `Debouncer<TKey>` on a `TimeProvider` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/` and move the coalescing timers of `HistoryActionsBroadcaster.cs`, `ProblemStore.cs` and `TrackedProblemRoot.cs` onto it; their tests advance a fake clock (FR-051; SC-004).
- [ ] T143 [US3] Add `RetainedRegistry<TKey, TValue>` on a `TimeProvider` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/` and move the idle eviction of `ContextSelectionStore.cs`, `HierarchyModelStore.cs` and `HistoryStackStore.cs` onto it; the two hierarchy tests that sleep 1,500 ms advance a fake clock (FR-051; SC-004).
- [ ] T144 [P] [US3] Replace `MarkdownEditorSession.cs` and `PlainEditorSession.cs` under `etalii.adp.ide.standalone/src/editors/` with one `TextEditorSession` in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Editor/`, the markdown editor a thin variant; update `etalii.adp.ide.standalone/docs/creating-an-editor-module.md` (FR-053, FR-004).
- [ ] T145 [US3] Add `WatchedFile` and `WatchedFolder` with an asynchronous read-retry on a `TimeProvider` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`; `TextEditorSession` and `KnowledgeSession.cs` read through `WatchedFile` in place of `ReadWithRetry` with `Thread.Sleep`, and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/TrackedProblemRoot.cs` watches through `WatchedFolder` (FR-050; SC-010).
- [ ] T272 [US3] Added by the M1 review: the JSON, XML and YAML editor sessions under `etalii.adp.ide.standalone/src/editors/`, added since M0 with the read-retry and `Thread.Sleep` of the markdown and plain sessions, move onto `TextEditorSession` with T144 and read through `WatchedFile` with T145, and their tests' shared families onto one contract (FR-053, FR-050; SC-010).
- [ ] T146 [P] [US3] Add `AdpFileWriter.IsTransient(name)` beside `TempPrefix` and use it in `HierarchyModel.cs`, `ProblemMaintenance.cs` and `DestinationState.cs`; a guard for the `~RF` backup name in problem maintenance, as B-06 is ruled (FR-050, FR-002; behaviour-changes B-06).
- [ ] T147 [US3] Add `ProjectFileEvents`, one reference-counted source of normalized file events per project root that filters transient files, to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`, with the reload watcher as first consumer (FR-050).
- [ ] T148 [US3] Move the per-connection hierarchy watcher and the problems watcher onto `ProjectFileEvents`, so that a project root has one recursive watcher; `WatchedFolderStore` of M2 takes its events from it where the folder is inside a project root (FR-050).
- [ ] T149 [US3] Replace the real-time waits that are left in tests with the fake clock or the one `Eventually`: `SettleDelay` (150 ms) in the seven helm-chart and ansible-structure files, and every other entry `waits.py` lists; delete the 13 private polling helpers (FR-051, FR-015; SC-003, SC-004).

### DISL adapters (report 3)

- [ ] T150 [US3] Add `DislDiagramDefinition` (the lazy bundled definition, the wire-id map, the toolbox projection, the menu action mapping, the row mapping, one finding-to-severity mapping) and `DislToolboxProvider` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`, with timeline's `*Definition.cs` as first consumer (FR-052).
- [ ] T151 [P] [US3] Move the other six modules with a bundled definition onto `DislDiagramDefinition`, one module per pull request, deleting the forwarding toolbox providers and rule sets that T028 left; shortcuts are sent in one way by all seven (FR-052; report D2).

### Review

- [ ] T152 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M3's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M3-measurements.json` (FR-009, FR-010).
- [ ] T153 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M3-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M3 (one implementation of each utility) and the success criteria due, an answer for every candidate named for the M3 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M4 needs (FR-010, FR-011, FR-012).
- [ ] T154 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M4: the core project graph

### A thin diagram project and a host project (report 4.1, 4.2)

- [ ] T155 [US4] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Workspace/EtAlii.Adp.Workspace.csproj` and move into it `DiagramService*`, `WorkspaceService`, `EditorService`, `DesignerService`, `WorkspaceConnections`, the designer table wire, the editor plumbing and the reload bridge from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`, with their tests; build a freshly created worktree before trusting the gates, because generated code moves; solution, `etalii.adp.ide.standalone/docs/architecture.md` (*which project owns which concern*), `etalii.adp.ide.standalone/docs/solution-structure.md`, `ArchitecturePages.Tests` (FR-054, FR-004).
- [ ] T156 [US4] Move the registrations of `HierarchyService`, `ContextService` and the editor catalog out of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/ServiceCollection.AddDiagrams.cs`: each to its own project's registration, the composition to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Workspace/` (FR-054, FR-057).
- [ ] T157 [US4] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram.Modules/EtAlii.Adp.Diagram.Modules.csproj` and move into it the M1 bases that need the context or history projects (`DiagramElementSourceResolver`, `DocumentEditHandler`, `DocumentEditRun`, the provider frame, `DislDiagramDefinition`); the 19 module projects reference it; `etalii.adp.ide.standalone/docs/creating-a-diagram-module.md` (FR-054, FR-004; research R9).
- [ ] T158 [US4] Make `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/EtAlii.Adp.Diagram.csproj` reference `EtAlii.Adp.Documents` and `EtAlii.Adp` only, with no `Microsoft.AspNetCore.App` and no gRPC package: `DiagramDefinition` moves up into it from the documents project, and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/` takes `IDiagramValidator` from the thin project (FR-054; SC-012).
- [ ] T265 [P] [US4] Move the sign-in session code (`ISessionStore`, `InMemorySessionStore`, `SessionContext`, `SessionInterceptor`, `ServiceCollection.AddSessions.cs`) from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Authentication/Sessions/` into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/`, and turn the reference round: the authentication project references the sessions project, and what the interceptor needs of authentication comes through a contract the sessions project declares; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions.Tests/` then tests the project it is named for; `etalii.adp.ide.standalone/docs/architecture.md` (*which project owns which concern*), `etalii.adp.ide.standalone/docs/solution-structure.md`, `ArchitecturePages.Tests` (FR-065, FR-004; SC-013, SC-028; DP-5).
- [ ] T266 [US4] Move the tool-session contracts into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/`: the diagram session contract and its factory contract from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`, the designer session and factory contracts from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Designer/`, the editor session and factory contracts from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Editor/`, and with them the factory registry of T166, `AddDiagramSession` and `DocumentDiagramSession`; the sessions project references the thin diagram project and the designer and editor projects, never the reverse, and the module projects reference it; a shared session type that cannot move without closing a cycle stays and is named in the M4 review; the three `etalii.adp.ide.standalone/docs/creating-a-*-module.md` guides, `etalii.adp.ide.standalone/docs/architecture.md`, `etalii.adp.ide.standalone/docs/solution-structure.md`, `ArchitecturePages.Tests` (FR-065, FR-054, FR-004; SC-028; DP-5).
- [ ] T159 [P] [US4] Fold `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend/` (146 lines of client hosting) into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Service/` and remove the project from the solution; `etalii.adp.ide.standalone/docs/solution-structure.md` (which lists it under *Host and composition*), `etalii.adp.ide.standalone/docs/architecture.md`, `ArchitecturePages.Tests` (FR-055, FR-004).
- [ ] T160 [US4] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Files/EtAlii.Adp.Files.csproj` and move into it `AdpFileWriter.cs`, the Restart Manager and NTFS calls, `WatchedFile`, `WatchedFolder`, `WatchedFolderStore` and `ProjectFileEvents` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/`; if it would hold fewer than a handful of types, keep a folder instead and record that in the M4 review (FR-056, FR-004; research R10).
- [ ] T161 [US4] Leave `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/` with the wire vocabulary and the document types: the last layout code goes to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Layout/`, and its reference to `Microsoft.AspNetCore.Hosting.Abstractions` goes if nothing left uses it (FR-056).
- [ ] T162 [P] [US4] Replace the `InternalsVisibleTo` that `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Documents/EtAlii.Adp.Documents.csproj` grants to `EtAlii.Adp.Diagram.C4` and `EtAlii.Adp.Diagram.CausalLoopDiagram` with a public seam for what those modules use; `graph.py` reports no core project naming a tool module (FR-056; SC-013).

### Generic tool families and one router (report 4.3, 4.5)

- [ ] T163 [US4] Add `ToolOrigin(vendor, type, subtype)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/` and make it the origin of diagrams, designers and editors: `DiagramOrigin` becomes it or wraps it, the designer's `"vendor/type"` string and the editor's string id are parsed once at the edge, and the parsing back in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/ProjectValidator.cs` goes (FR-060).
- [ ] T164 [US4] Add `IToolDefinition` and one generic `ToolDefinitionDiscovery` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/`, with the dedupe-and-log block written once; `DiagramDefinitionDiscovery.cs`, `EditorDefinitionDiscovery.cs` and `DesignerDefinitionDiscovery.cs` use it (FR-057).
- [ ] T165 [US4] Add `ToolDefinitionCatalog<T>` and `AddToolDefinitions<T>`; the three catalogs become it, and each is registered once, in its own family's registration: the diagram catalog leaves `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.History/ServiceCollection.AddCommands.cs`, and the designer catalog is no longer registered twice (FR-057, FR-064).
- [ ] T166 [P] [US4] Add `ToolSessionFactories<TKey, TFactory>` and replace the three session-factory registries; T266 takes it on to the sessions project (FR-057; SC-015).
- [ ] T167 [US4] Add `ToolRouter.Route(path, root)` returning `DiagramRouted`, `DesignerRouted`, `EditorRouted`, `Unreadable` or `None` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/`, the lowest project that sees all three catalogs and the one that holds `DiagramFilePair`, with the precedence between the three tool kinds (diagrams, then designers, then editors) coded there; the three routers delegate to it (FR-058).
- [ ] T168 [US4] Make `DiagramService.Open.cs` switch on `ToolRouter`'s result; one open reads `projects.json` and the registration once (FR-058, FR-062).
- [ ] T169 [US4] Make `HierarchyModel.RefreshDiagramStates`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/ProjectValidator.cs` and `DeleteEntryCommandHandler` switch on `ToolRouter`'s result; a search finds the precedence in one method (FR-058; SC-015).

### Typed paths, registrations and settings (report 4.5, 4.6)

- [ ] T170 [US4] Add `ProjectRoot` and `ProjectPath` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp/`: normalized once, with an operating-system-correct comparer, wrapping `PathContainment` (FR-059).
- [ ] T171 [US4] Key the stores that use `string rootPath` as a dictionary key (`HierarchyModelStore`, `ContextSelectionStore`, `HistoryStackStore`, the problem store and the document stores) on `ProjectRoot` (FR-059).
- [ ] T172 [US4] Resolve a `ProjectRoot` once at the service boundary and pass it down, in place of `string rootPath` parameters through the services and resolvers (FR-059, FR-062).
- [ ] T173 [US4] Add `AdpRegistration` (the MIME line, the headers, the layout; parse and serialize; a cache keyed on modification time) to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/` (FR-061).
- [ ] T174 [US4] Make `DiagramFilePair.cs`, `DiagramRegistrationSet.cs`, `CreateDiagramFileCommandHandler.cs` and `DiagramRegistrationName.cs` read and write through `AdpRegistration`; a route no longer re-opens the file (FR-061).
- [ ] T175 [US4] Move `RegistrationLayout.cs` and its commands from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Diagram/`, and drop the reference to the hierarchy project from the six modules that had it only for this (FR-061).
- [ ] T176 [US4] Cache `projects.json` per user in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Projects/`, invalidated on write, and make `FileProjectStore.Add` and `Remove` read, modify and write under a lock; a guard for two concurrent adds, seen to fail first (FR-062, FR-005).
- [ ] T177 [US4] Resolve the project once per request at the 8 call sites of `ProjectRootResolver.TryResolve` (`ContextService.ExecuteAction` resolves it twice), and move `ProjectTextFile.cs` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Projects/` (FR-062; SC-016).
- [ ] T178 [P] [US4] Keep one validator of entry names: lay the rules and messages of `EntryNameRules.cs` and of `RenameEntryCommandHandler.cs` side by side in `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` (B-07), get the ruling, then make the rename handler use `EntryNameRules` (FR-063, FR-002).

### History and Context (report 4.7)

- [ ] T179 [P] [US4] Move or rename `IContextNoticeSink` so that the history project owns the contract it defines, and `HistoryActionsBroadcaster` and `HistoryContextActionProvider` sit on the side of the dependency that needs no back-reference (FR-064).
- [ ] T180 [P] [US4] Make `HistoryActionsBroadcaster` and `ProblemBroadcaster` `IHostedService`s and remove their resolution "only to construct them" from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Service/Program.cs` (FR-064).
- [ ] T181 [US4] Read `etalii.adp.ide.standalone/docs/architecture.md` and `etalii.adp.ide.standalone/docs/solution-structure.md` from start to end against the solution as it now is: the project tables, the counts, *which project owns which concern* (FR-004).

### Review

- [ ] T182 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M4's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M4-measurements.json` (FR-009, FR-010).
- [ ] T183 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M4-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M4 (the project graph says what the architecture says) and the success criteria due, an answer for every candidate named for the M4 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M5 needs (FR-010, FR-011, FR-012).
- [ ] T184 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M5: core hotspots

### The hierarchy model (report 5.1)

- [ ] T185 [US5] D10, guard first: a test in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy.Tests/` whose `EntryChanged` subscriber asks, from another thread, for something that needs the hierarchy's lock, and fails with a timeout while events are raised under it; see it fail for each raising site (FR-026, FR-005; report D10).
- [ ] T186 [US5] Extract `WatcherEventNormalizer` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/HierarchyModel.cs`: rename-echo suppression, transient-file detection through `IsTransient`, and the translation of watcher events (FR-066).
- [ ] T187 [US5] Extract `HierarchyIndex` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/HierarchyModel.cs`: the three id and path indexes and a children-by-parent map, so that a folder's children are a lookup and a subtree's removal is linear (FR-066).
- [ ] T188 [US5] Extract `DiagramStateDecorator` from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Hierarchy/HierarchyModel.cs` (`RefreshDiagramStates`), on `ToolRouter` (FR-066).
- [ ] T189 [US5] Compute outside the lock and apply under it: `SyncFolder`, `RefreshDiagramStates` and `IsContained` no longer enumerate a directory or open an `.adp` file inside `lock (_gate)`; a guard that a slow directory read does not hold up a concurrent query (FR-066; SC-017).
- [ ] T190 [US5] Queue `EntryChanged` under the lock and raise it after the lock is released; T185 passes (FR-066, FR-026; SC-017).
- [ ] T191 [US5] Make the router and the editor resolver required dependencies of the hierarchy model and give the "older tests" real ones through `EtAlii.Adp.TestSupport` (FR-066).

### Lifetimes, writers and streams (report 5.2, 5.3, 5.4)

- [ ] T192 [US5] By DP-5 as ruled: add `ConnectionSession` and `ProjectSession` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions/`, acquiring and releasing the history stack, the problem watch and the hierarchy model as one scope, through contracts the sessions project declares wherever a direct reference would close a cycle; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Sessions.Tests/` tests the scope, and `etalii.adp.ide.standalone/docs/architecture.md` says what the project owns (FR-065, FR-067, FR-004; SC-028).
- [ ] T193 [US5] Make `ContextService.RunWatchAsync`, `WorkspaceConnections`, `HierarchyModelStore`, `ContextSelectionStore` and `HistoryStackStore` acquire through the scope; the guards of T034 still pass and the leak is now impossible by construction, and a search finds no retaining or releasing outside the scope (FR-067, FR-023; SC-028).
- [ ] T194 [P] [US5] Make `WorkspaceService` delegate to domain services in place of composing two gRPC service classes (FR-067).
- [ ] T195 [US5] Add `IFileWriter` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Files/` with asynchronous, reference-counted locks per path that are released when unused, registered in the host; `AdpFileWriter`'s static dictionary of locks goes; a guard that the lock table is empty after writes to many paths, seen to fail first (FR-068, FR-005).
- [ ] T196 [US5] Inject `IFileWriter` into the stores and handlers that call the static writer, and remove the `Task.Run` wrappers that existed only because its locks blocked (FR-068).
- [ ] T197 [US5] Add `WorkspaceConnection.OpenStream(streamId, session, map)` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Workspace/`, owning the pump, the ended message and the clean-up and awaiting its tasks on close; the diagram streams of `WorkspaceService` and the table streams of `DesignerService` use it, and "the connection exists and belongs to this user" is checked in one place (FR-069).
- [ ] T198 [US5] Bound every channel and give each a stated drop policy; a test with a client that stops reading shows the bound held and the policy applied (FR-070; SC-018).
- [ ] T199 [P] [US5] Observe or await the tasks started and left in `DesignerService.cs`, `WorkspaceService.cs`, `ContextSelectionStore.cs`, `TrackedProblemRoot.cs` and `HierarchyService.cs` (FR-070; SC-018).
- [ ] T200 [P] [US5] Remove the blocking on asynchronous work: `DiscoverAsync(...).GetAwaiter().GetResult()` on a timer thread in `HistoryActionsBroadcaster.cs`, and `_gate.Wait()` on the semaphore the asynchronous paths share in `HistoryStack.cs` (FR-070; SC-018).

### Smaller hotspots (report 5.4)

- [ ] T201 [P] [US5] Split `AddDiagramContextActionProvider.CommitAsync` into one strategy per family (`DiagramAddOptions`, `DesignerAddOptions`): a new document diagram, a folder subject, registering an existing file, a new designer document (FR-071).
- [ ] T202 [P] [US5] Split `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Problems/ProblemStore.cs` into a cache with its persistence and a staleness policy that knows the router and the validators (FR-072).
- [ ] T203 [P] [US5] Move the proto mapping of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Context/ContextService.Actions.cs` into a `ContextWire` mapper, and register the Project and Problems source kinds as ordinary `IContextSourceResolver`s in place of the special cases in `TryResolveTargetAsync` (FR-073).

### Review

- [ ] T204 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M5's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M5-measurements.json` (FR-009, FR-010).
- [ ] T205 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M5-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M5 (the core hotspots are corrected) and the success criteria due, an answer for every candidate named for the M5 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M6 needs (FR-010, FR-011, FR-012).
- [ ] T206 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M6: the specification projects

### Before anything moves

- [ ] T207 [US6] Read the state of `fbl-implementation`, `fbl-written-text` and the fifteen conversions in `etalii.adp.ide.standalone/.spec-workflow/specs/`, and agree with their owners which of the M6 tasks go before, after or around their work; a task that would collide is reduced or re-ordered and the M6 review says so (FR-012, FR-084).
- [ ] T208 [US6] Record the FBL conformance fixtures vendored under `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/` and the DISL suite as the fixed point of M6: their expected results are not edited by any M6 task, and a task that needs to edit one stops and reports (FR-085; SC-021).

### What the loaders share (report 6.4, 6.5)

- [ ] T209 [US6] Create `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Json/` with one diagnostic record and severity; `DislDiagnostic` and `LoadProblem` become it; solution and architecture pages (FR-074, FR-004).
- [ ] T210 [P] [US6] Move JSON Pointer escaping, the `Str`, `Bool` and `Strings` helpers and the conversion from JSON to CEL scalars into `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Json/`, each from its two copies (FR-074).
- [ ] T211 [P] [US6] One duplicate-key detection and one `major.minor` version check in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Json/`, the strictness decided as B-08 is ruled against what the two specifications in `etalii.adp` say (FR-074, FR-002; behaviour-changes B-08).
- [ ] T212 [US6] Add a thread-safe `CelProgramCache` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Cel/` and move onto it the DISL loader's cache by pointer, the `ConditionalWeakTable` of `DislEvaluation`, the per-call dictionary of `DislModelBuilder.DerivedIds` (with a guard that a `CelException` there no longer escapes) and the per-reading cache of `BodyReading` (FR-075, FR-005; SC-020).
- [ ] T213 [P] [US6] Store the compiled program on an FBL `Rule`: `FblDocumentLoader.Compile` no longer compiles to validate and throws the program away (FR-075).
- [ ] T214 [P] [US6] Give DISL typed CEL contexts in place of about 40 string constants, as FBL has an enumeration (FR-075).

### FBL (report 6.1, 6.2, 6.6, 6.7)

- [ ] T215 [US6] Add a non-virtual `FamilyReader.Write` with `RemoveSlot`, `ReplaceSlot` and `InsertSlot` hooks, one `InsertValues` resolver and one `KeyOrder` helper on `Rule.WireOrder()` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/`, with `YamlFamily` as first consumer (FR-076).
- [ ] T216 [US6] Move `JsonFamily.Write`, `LinesFamily.Write` and `XmlFamily.Write` onto the template; D9 is corrected here as T038 settled it, and a new JSON entry is written in the layout of the entries beside it, with its fixture pair as the guard (FR-076, FR-025, FR-005; SC-020; behaviour-changes B-09, B-12).
- [ ] T217 [US6] Split `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/FblDocumentLoader.cs` into `BindingReader` and `BindingChecker`, breaking up `ReadRule` and `Check`, and use `TryGetProperty` so that schema-invalid input is collected as problems; a guard with such input, seen to throw first (FR-077, FR-005).
- [ ] T218 [US6] Make `Slot` a closed record hierarchy in place of ten nullable fields, and parse `Empty`, `Place`, `Quote`, `Style` and `IdStrategy` once into enumerations; the 14 string comparisons in the families go (FR-078).
- [ ] T219 [US6] Rebuild JSON reading in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/` on `Utf8JsonReader`, as `JsonBodyParser` beside `JsonFamily`, in place of the 210-line byte-level parser; split the other families into `XxxParser` and `XxxFamily` (FR-080).
- [ ] T220 [US6] Spike: build the YAML tree that `YamlFamily` needs from YamlDotNet's scanner tokens and their `Index` marks, on the conformance fixtures; record the outcome in the M6 review, with the fixtures that fail if it fails (FR-081).
- [ ] T221 [US6] Only if T220 succeeds: replace the 550-line `YamlParser` so that a body is parsed once; otherwise strike this task with the spike's record (FR-081).

### DISL (report 6.3, 6.8)

- [ ] T222 [US6] Type operations and actions at load in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/`: records for operations, a union for the action kinds that `ActionRunner.Action` switches on by string, each expression-bearing field holding its compiled program; `OperationInterpreter` and `ActionRunner` read the records (FR-079).
- [ ] T223 [US6] Type the toolbox, menus and forms at load; `ContextMenuDerivation` and `FormDerivation` read the records (FR-079).
- [ ] T224 [US6] Type constraints, hooks and names at load; `ConstraintEvaluator` and `DislNames` read the records; a JSON Pointer that matches no compiled expression is an error at load, and the silent compile on a miss in `DislEvaluation.cs` goes; `DislSpecification` keeps no `JsonElement Root` for the derivation code (FR-079; SC-019).
- [ ] T225 [US6] Add a DISL-side read element or a thin bridge so that `DislModelBuilder` takes a module's own reading; `TimelineDisl.cs` and its dependency-graph twin stop constructing `FblElement`s through the 12-argument constructor. Read `timeline-disl-fbl` and `dependency-graph-disl-fbl` first: if either conversion has landed, its module needs no bridge (FR-083, FR-012).
- [ ] T226 [US6] Narrow the public surface of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/`, `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Cel/` and `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Disl/` to what another project uses: the 72 public FBL types, CEL's library registrars, the DISL types nothing outside reads (FR-082; SC-022).
- [ ] T227 [US6] For timeline, dependency-graph and databricks: record in the M6 review what each conversion still waits on from this feature, confirm nothing of FR-074 to FR-083 that they need is left open, and hand over. Their work stays theirs (FR-084).

### Review

- [ ] T228 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M6's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M6-measurements.json` (FR-009, FR-010).
- [ ] T229 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M6-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M6 (the specification projects are restructured) and the success criteria due, an answer for every candidate named for the M6 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M7 needs (FR-010, FR-011, FR-012).
- [ ] T230 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M7: module internals

### Each task reads its module's conversion specification first (FR-012)

- [ ] T231 [US7] Turn `OwlProjection.Project` (about 420 lines, 11 local functions over captured dictionaries) in `etalii.adp.ide.standalone/src/diagrams/rdf/backend/EtAlii.Adp.Diagram.Rdf/Owl/OwlProjection.cs` into an `OwlProjectionBuilder` whose methods are each under 50 code lines; add `BudgetedGraphBuilder<TNode, TEdge>` for node registration and the budget cut, as its first consumer (FR-086, FR-092, FR-012).
- [ ] T232 [P] [US7] Turn `SkosProjection.Project` (241 lines) and `RdfProjection.Project` (173 lines) into builders on `BudgetedGraphBuilder` (FR-086, FR-092, FR-012).
- [ ] T233 [P] [US7] Add a `KnowledgeValueType` registry to `etalii.adp.ide.standalone/src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/`, one strategy per value type (stored key, comparisons, grouping, conversion), in place of the type names as strings in `KnowledgeViewEngine` and elsewhere (FR-087, FR-092).
- [ ] T234 [US7] Split `KnowledgeEdits` (1,265 lines, 60 methods) into cell, column, view and filter edits behind a gesture table with an explicit `RequiresView` flag, in place of the 45-arm switch with its guard arm halfway; a guard that the order of entries does not matter (FR-087, FR-092).
- [ ] T235 [US7] Split `KnowledgeSession.cs` (600 lines, 17 mutable fields under one lock) into a `PendingEditQueue`, the `WatchedFile` of M3 and a `KnowledgeViewState` (FR-088, FR-092).
- [ ] T236 [P] [US7] Replace the chain of 15 `TryKeyword` tests in `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap/WardleyParser.cs` with a keyword table in which order does not matter (`annotations` and `annotation`); a guard that shuffles the table (FR-089, FR-092, FR-012).
- [ ] T237 [P] [US7] Move the DSL text built in `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap/Commands/WardleyElementCommandHandlers.cs` (six places) into statement builders on `WardleyWriter` (FR-089, FR-012).
- [ ] T238 [P] [US7] Split `SparqlParser.cs` (1,432 lines) in `etalii.adp.ide.standalone/src/diagrams/sparql/backend/` into the grammar, a `SparqlScopeAnalyzer` pass (`Finish`, `AssignPaths`, `IndexScope`) and a `SparqlTokenCursor` (`FindBalancedEnd`, `FindTopLevelKeyword`) (FR-090, FR-092, FR-012).
- [ ] T239 [P] [US7] Move `C4Layout.Rank` in `etalii.adp.ide.standalone/src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4/` onto `Layering.LongestPath` with a relaxation policy and `C4Layout.Spread` onto `OverlapResolver`; layout fixtures unchanged (FR-091, FR-045, FR-012; SC-011).
- [ ] T240 [US7] Extract a `C4BoundaryPacker` (`ComputeNested`, `PushOutsiders`) from the 694-line static `C4Layout` (FR-091, FR-092).
- [ ] T241 [P] [US7] Bring the other long methods the report lists under 50 code lines, or name each in the M7 review as left on purpose: `KnowledgeValidator.Validate`, `SankeyLayout.Compute`, `SkosLayout.Layout`, `AnsibleGraph.Derive`, `OwlLayout.Positions`, `OwlValidator.Judge`, `OwlModelIndex.Build`, and whatever `methods.py` now puts in its twenty longest (FR-092; SC-023).

### Review

- [ ] T242 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M7's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M7-measurements.json` (FR-009, FR-010).
- [ ] T243 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M7-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M7 (the module internals are decomposed) and the success criteria due, an answer for every candidate named for the M7 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M8 needs (FR-010, FR-011, FR-012).
- [ ] T244 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M8: test consolidation

### Tests (report 8.3, 8.6, 8.7)

- [ ] T245 [US8] Add `TranscriptHarness` with a module adapter, one `TranscriptText` canonical-JSON writer and the abstract `TranscriptTests<TAdapter>` to `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.TestSupport.Host/`, with gartner-hype-cycle-graph as first consumer; its `Parity/*.transcript.json` is unchanged (FR-093). Reduced by the M0 review to the harness, the module adapter and `TranscriptTests<TAdapter>`: `TranscriptText` is one writer in `EtAlii.Adp.TestSupport` since standalone pull request 186.
- [ ] T246 [P] [US8] Move the transcripts of dependency-graph, mindmap, timeline, agent-behavior-modelling and the sixth module onto the harness, one module per pull request; no transcript file changes (FR-093).
- [ ] T247 [P] [US8] Replace the 8 hand-written `*TestDispatcher.cs` with `TestHistory.For` (FR-094).
- [ ] T248 [P] [US8] Replace the hand-built temporary folders in the core test projects under `etalii.adp.ide.standalone/src/backend/` with `TestFolder.Create` (FR-094).
- [ ] T249 [P] [US8] Replace the hand-built temporary folders in the module test projects under `etalii.adp.ide.standalone/src/diagrams/`, `etalii.adp.ide.standalone/src/designers/` and `etalii.adp.ide.standalone/src/editors/` with `TestFolder.Create`; 273 at the report's reading, in all (FR-094).
- [ ] T250 [P] [US8] Replace the 63 copies of the repository-root locator with `RepositoryPaths` (FR-094). Reduced by the M0 review to the copies that are left: 44 test files use `RepositoryPaths` since standalone pull request 186; the M8 review counts the rest.
- [ ] T251 [US8] Move the flows that test one module out of `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/` into that module's test project, referencing `EtAlii.Adp.TestSupport.Host`: the first half of about 5,300 lines (FR-095).
- [ ] T252 [US8] Move the second half; `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/` holds no flow that tests one module, and `etalii.adp.ide.standalone/docs/solution-structure.md` (*where tests and fixtures live*) says so (FR-095, FR-004).
- [ ] T253 [P] [US8] Derive `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Unit Tests/ElementTypeCatalog.cs` and the catalogue in `DrawnConnections.Tests.cs` from the tool definitions, or remove them if the module's own tests cover the same (FR-095).
- [ ] T254 [P] [US8] Move `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/GateScript.Tests.cs` out of the product test suite: beside the scripts under `etalii.adp.ide.standalone/.github/tools/gate/` if `retire.sh` is still tested by it, and deleted for `gate.sh` and `land.sh`, which no longer apply (FR-096).

### The stub modules (report 2.1); struck, DP-1 is ruled (c)

- [ ] ~~T255 [US2] By DP-1 (a): in one pull request, change *Declaring a diagram definition* in `etalii.adp.ide.standalone/.spec-workflow/steering/tech.md`, the "a type is a folder" sentences of `etalii.adp.ide.standalone/docs/architecture.md` and `etalii.adp.ide.standalone/docs/solution-structure.md`, create `etalii.adp.ide.standalone/src/diagrams/catalog/backend/EtAlii.Adp.Diagram.Catalog/` with a `Definitions` array, and move the first stub into it, with the test that discovery still finds its origin, title and icon (FR-097, FR-004).~~ Struck: DP-1 ruled (c), keep the stubs (maintainer, 2026-10-11).
- [ ] ~~T256 [US2] Move the other 47 stub definitions into the catalog and delete their projects and readmes from `etalii.adp.ide.standalone/src/diagrams/` and from `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.slnx`; `etalii.adp.ide.standalone/docs/tools.md` still names every type, and the counts of `etalii.adp.ide.standalone/docs/solution-structure.md` and `ArchitecturePages.Tests` are corrected (FR-097, FR-004; SC-027).~~ Struck: DP-1 ruled (c), keep the stubs (maintainer, 2026-10-11).
- [ ] ~~T257 [US2] Rewrite the part of `etalii.adp.ide.standalone/docs/creating-a-diagram-module.md` that says how a cataloged type becomes an implemented module: its definition leaves the catalog when its own project gains a `Build` delegate (FR-097, FR-004).~~ Struck: DP-1 ruled (c), keep the stubs (maintainer, 2026-10-11).

### Review

- [ ] T258 [US9] Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of M8's last pull request, in a freshly created worktree, and save its output as `etalii.adp/specs/025-standalone-code-structure/reviews/M8-measurements.json` (FR-009, FR-010).
- [ ] T259 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M8-review.md` by `etalii.adp/specs/025-standalone-code-structure/contracts/milestone-review.md`: the comparison with the previous record, the exit condition of M8 (the tests are consolidated and the stub modules unchanged) and the success criteria due, an answer for every candidate named for the M8 review, what the clone scan and the method-length count show that nobody named, the tasks under FR-012 marked *stands*, *reduced* or *overtaken*, and the open rows of `etalii.adp/specs/025-standalone-code-structure/behaviour-changes.md` that M9 needs (FR-010, FR-011, FR-012).
- [ ] T260 [US9] In the same pull request into `etalii.adp`, update `etalii.adp/specs/025-standalone-code-structure/tasks.md`: tick what is merged, add the tasks the review produced with new numbers, strike what it found unnecessary; amend a success criterion in `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` only with this review named beside it. No task of the next milestone starts before this pull request is merged (FR-010, FR-011, FR-014).

## M9: close

### Close

- [ ] T261 [US9] Run `measure.sh` on the last merge and the stability workflow of T026 once more; save `etalii.adp/specs/025-standalone-code-structure/reviews/M9-measurements.json` (FR-009, FR-098; SC-002).
- [ ] T262 [US9] Read `etalii.adp.ide.standalone/docs/architecture.md`, `etalii.adp.ide.standalone/docs/solution-structure.md` and the three `creating-a-*-module.md` guides from start to end against the code; correct what is false (FR-004; SC-025).
- [ ] T263 [US9] Write `etalii.adp/specs/025-standalone-code-structure/reviews/M9-review.md`: every success criterion SC-001 to SC-028 as met, amended (with the review that amended it) or missed (with the reason); every defect D1 to D10 as closed or struck; the follow-up features of all reviews in one list, in order of value (FR-098, FR-010; SC-024, SC-026).
- [ ] T264 [US9] Tick the last tasks in `etalii.adp/specs/025-standalone-code-structure/tasks.md`, set the status line of `etalii.adp/specs/025-standalone-code-structure/standalone-code-structure.spec.md` (FR-098, FR-014).

## Dependencies and order

- **Milestones run in order**, M0 to M9, each gated by the review before it. DP-6 was ruled (a), one owner at a time, so no milestone runs beside another. Should that ruling ever change: M6 and M7 touch the specification projects and module internals only and could run beside M3 to M5; M6 still needs T207, and M7 still needs the layout library of M3 for T239 and `WatchedFile` for T235.
- **M0**: T002 to T006 are independent; T007 needs them; T008 and T009 need T007. T011 comes before T012, T013, T014 and T015; T016 before T017, T018 and T019; T020 and T021 before T025; T025 before T026. T035 before T036 and T037. T031 waits on pull request 167. T033 needs T032. T269 needs T268; T270 comes before T064, which measures M1.
- **M1**: band A (T043, T044, T045, then the three pilots, then T049) before band B (T050, T051, the pilots, T055) before band C (T056, T057, T058, the pilots). T043 needs T011.
- **M2**: within a module, band A before B before C. Modules are independent of each other, except: T103 before T104 and T105; timeline's band C adds the lines-restore handler that dependency-graph's band C uses. The order of modules is the list's, and the M1 review may change it. T273 and T274 come before every band B task of M2 (M1 review).
- **M3**: T118 before every other layout task; T121 before T122 and T123; T131 before T132; T133 before T134; T136 before T137; T139 before T140; T141 before T142, T143 and T145; T144 before T145; T272 goes with T144 and T145; T146 before T147; T150 before T151.
- **M4**: T155 and T156 before T157 before T158; T158 before T174 and T167, because the hierarchy project can reference the diagram project only once the diagram project no longer references it. T163 before T164 before T165 and T166; T173 before T167 before T168 and T169; T170 before T171 and T172; T176 before T177. T178 needs the ruling on B-07. T265 stands alone; T266 needs T158 and T166 and comes after T157.
- **M5**: T185 first; T186, T187 and T188 before T189 before T190; T192 needs T266 and comes before T193; T195 before T196; T197 before T198.
- **M6**: T207 and T208 first. T209 before T210 and T211; T212 before the three DISL typing tasks; T215 before T216, which needs T038; T220 before T221; T226 last of the code tasks.
- **M7**: T231 before T232; T233 before T234.
- **M8**: T245 before T246; T251 before T252.

## Coverage

Every requirement of the specification with the tasks that claim it, extracted from the task lines above and compared with the requirement list of the specification. A requirement no task *can* claim, because every task holds it, is marked as such; that is not a gap.

| Requirement | Tasks |
|---|---|
| FR-001 | Held by every task through [contracts/pull-request.md](contracts/pull-request.md) (*No behaviour change*), and checked at every review by the unchanged fixtures and transcripts. |
| FR-002 | T039, T132, T135, T137, T146, T178, T211 |
| FR-003 | Held by every task through [contracts/pull-request.md](contracts/pull-request.md). |
| FR-004 | 21 tasks, T016 to T266 |
| FR-005 | T033, T034, T035, T056, T176, T185, T195, T212, T216, T217, T269, T276 |
| FR-006 | Held by every task through [contracts/pull-request.md](contracts/pull-request.md) (the identity) and by the *Ownership* section of every review record (the owner). |
| FR-007 | T029 |
| FR-008 | T043 |
| FR-009 | 19 tasks, T002 to T261, and T270 |
| FR-010 | 28 tasks, T040 to T263 |
| FR-011 | 18 tasks, T041 to T260 |
| FR-012 | 44 tasks, T010 to T259 |
| FR-013 | T001 |
| FR-014 | T042, T066, T117, T154, T184, T206, T230, T244, T260, T264 |
| FR-015 | T011, T012, T013, T014, T015, T016, T149 |
| FR-016 | T017, T018, T022, T023, T024 |
| FR-017 | T019, T020, T025; T021 struck by the M0 review |
| FR-018 | T027, T028, T029 |
| FR-019 | T030 |
| FR-020 | T031 |
| FR-021 | T032, T033, T268, T269 |
| FR-022 | 19 tasks, T056 to T111 |
| FR-023 | T034, T193 |
| FR-024 | T035, T036, T037, T267 |
| FR-025 | T038, T216 |
| FR-026 | T185, T190 |
| FR-027 | T049, T055, T274 |
| FR-028 | 16 tasks, T043 to T100 |
| FR-029 | 16 tasks, T044 to T100 |
| FR-030 | 21 tasks, T045 to T110, and T273, T274 |
| FR-031 | 19 tasks, T050 to T110 |
| FR-032 | 19 tasks, T051 to T110 |
| FR-033 | 20 tasks, T056 to T111 |
| FR-034 | 19 tasks, T058 to T111 |
| FR-035 | 18 tasks, T043 to T100, and T273 |
| FR-036 | T063, T113 |
| FR-037 | T103, T104, T105 |
| FR-038 | T101 |
| FR-039 | T075, T078, T112 |
| FR-040 | T112, T138 |
| FR-041 | The heading of FR-042 to FR-053; claimed through them. |
| FR-042 | T127, T128, T129 |
| FR-043 | T130 |
| FR-044 | T131, T132 |
| FR-045 | T118, T119, T120, T121, T122, T123, T124, T125, T126, T239 |
| FR-046 | T133, T134 |
| FR-047 | T135 |
| FR-048 | T136, T137, T138 |
| FR-049 | T139, T140 |
| FR-050 | T145, T146, T147, T148, T272 |
| FR-051 | T141, T142, T143, T149 |
| FR-052 | T150, T151 |
| FR-053 | T144, T272 |
| FR-054 | T155, T156, T157, T158, T266 |
| FR-055 | T159 |
| FR-056 | T160, T161, T162 |
| FR-057 | T156, T164, T165, T166 |
| FR-058 | T167, T168, T169 |
| FR-059 | T170, T171, T172 |
| FR-060 | T163 |
| FR-061 | T173, T174, T175 |
| FR-062 | T168, T172, T176, T177 |
| FR-063 | T178 |
| FR-064 | T165, T179, T180 |
| FR-065 | T192, T265, T266 |
| FR-066 | T186, T187, T188, T189, T190, T191 |
| FR-067 | T192, T193, T194 |
| FR-068 | T195, T196 |
| FR-069 | T197 |
| FR-070 | T198, T199, T200 |
| FR-071 | T201 |
| FR-072 | T202 |
| FR-073 | T203 |
| FR-074 | T209, T210, T211, T227 |
| FR-075 | T212, T213, T214 |
| FR-076 | T215, T216 |
| FR-077 | T217 |
| FR-078 | T218 |
| FR-079 | T222, T223, T224 |
| FR-080 | T219 |
| FR-081 | T220, T221 |
| FR-082 | T226 |
| FR-083 | T225, T227 |
| FR-084 | T207, T227 |
| FR-085 | T208 |
| FR-086 | T231, T232 |
| FR-087 | T233, T234 |
| FR-088 | T235 |
| FR-089 | T236, T237 |
| FR-090 | T238 |
| FR-091 | T239, T240 |
| FR-092 | T231, T232, T233, T234, T235, T236, T238, T240, T241 |
| FR-093 | T245, T246 |
| FR-094 | T247, T248, T249, T250 |
| FR-095 | T251, T252, T253 |
| FR-096 | T254 |
| FR-097 | none: satisfied by leaving the stubs as they are (DP-1 (c)); T255 to T257 struck |
| FR-098 | T261, T263, T264 |

FR-002, FR-004, FR-005, FR-007 and FR-008 are rules of [contracts/pull-request.md](contracts/pull-request.md) that every task holds; the tasks listed beside them are the ones whose text names a particular page, guard, register row or first consumer.

| Success criterion | Where it is worked for | Measured at the review of |
|---|---|---|
| SC-001 | T025, T263 | M0 |
| SC-002 | T026, T261, T271, T275, T276 | M0, M9 |
| SC-003 | T149 | M0, M3 |
| SC-004 | T142, T143, T149 | M3 |
| SC-005 | The test-code tasks of M0, M1 (contracts) and M8; T009 | M9 |
| SC-006 | Every band task of M1 and M2 | M2 |
| SC-007 | T113 | M2 |
| SC-008 | Every band task of M1 and M2 | M2 |
| SC-009 | Every band C task | M2 |
| SC-010 | T119, T120, T134, T145, T272 | M3 |
| SC-011 | T121, T239 | M3, M7 |
| SC-012 | T158 | M4 |
| SC-013 | T162, T265 | M5 |
| SC-014 | T037, T267 | M0, M1 |
| SC-015 | T166, T169 | M4 |
| SC-016 | T177 | M4 |
| SC-017 | T189, T190 | M5 |
| SC-018 | T198, T199, T200 | M5 |
| SC-019 | T224 | M6 |
| SC-020 | T212, T216 | M6 |
| SC-021 | T208 | M6 |
| SC-022 | T226 | M6 |
| SC-023 | T009, T241 | M9 |
| SC-024 | The three review tasks of each milestone; T263 | M0 to M9 |
| SC-025 | T262 | M9 |
| SC-026 | The defect tasks of M0, M1, M2, M5 and M6; T263 | M9 |
| SC-027 | T263 | M8 |
| SC-028 | T192, T193, T265, T266 | M4, M5 |

Requirements named by a task that the specification does not define: none.

