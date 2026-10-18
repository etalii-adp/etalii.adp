# M4 review: the core project graph

**Measured at**: `etalii.adp.ide.standalone` `0ea296327`, the merge of pull request 437, 2026-10-18 | **Previous record**: [M3-review.md](M3-review.md), [M3-measurements.json](M3-measurements.json) at `d162f0dd1` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M4 split the old diagram project four ways. `EtAlii.Adp.Diagram` is now a thin project of 1,931 lines that references the documents project and the shared primitives only. `EtAlii.Adp.Workspace` holds the gRPC services and the connections, `EtAlii.Adp.Diagram.Modules` the module bases, and `EtAlii.Adp.Files` the writer and the watchers. `EtAlii.Adp.Backend` was folded into the host. The sessions project, empty at M3, now holds every sign-in session type and every tool-session contract, factory contract and registry. The three tool kinds share one origin, one discovery, one catalog type, one session-factory registry and one router. Roots and paths are typed and resolved once per request, `projects.json` is cached per user, and a registration is parsed in one place.

The graph matches what the architecture pages say. Two things did not fit:
- **The diagram project still receives a hosting package transitively.** `EtAlii.Adp` took `Microsoft.AspNetCore.Hosting.Abstractions` for one interface, and every module reaches `Grpc.AspNetCore` and ASP.NET Core through the context, hierarchy, projects and sessions projects.
- **One two-kind ordering was left outside the router**, in `HierarchyContextSourceResolver`.

The review adds T288 to T295 and widens T280 to Helm's copy of the folder watcher. It reduces T227, and strikes T225, which its conversion overtook. Two questions go to the maintainer: the three wire candidates, and typed roots on the module-facing seams.

## Measurements

Between M3 and M4, 62 pull requests merged (standalone 375 to 437):
- **This feature: 34.** The M3 review's T279, T280's first half, T281, T282 and T285; M4's T155 to T181, T265 and T266; and T286.
- **Others: 28.** Nine of `azure-devops-pipeline-disl-fbl`, nine of `dependency-graph-disl-fbl` (its whole conversion), three of `helm-chart-disl-fbl` (its close), two of `causal-loop-disl-fbl` (its close), `ansible-structure-disl-fbl`'s close, and four small others.

By the C# lines of each merge's own diff:

| | Production | Test |
|---|---|---|
| This feature's 34 | +596 | +1,124 |
| The others | +1,551 | +7,624 |
| Of the others: pipeline | +1,218 | +3,356 |
| Of the others: helm-chart | +331 | +1,812 |

The two groups add up to the measured totals.

| Figure | M3 (`d162f0dd1`) | Now (`0ea296327`) | Target |
|---|---|---|---|
| Projects | 138 | 142 (+ `Workspace`, `Diagram.Modules`, `Files` and two test projects; − `Backend`) | about 134 at the end (plan) |
| Files, all | 2,335 | 2,405 | |
| Lines, all | 276,620 | 287,515 (+2,147 production, +8,748 test) | |
| Lines, core production | 44,418 (18 projects) | 45,665 (20 projects; +1,247) | |
| Lines, core test | 55,099 (22 projects) | 56,856 (24 projects; +1,757) | |
| Lines, diagram production | 74,604 | 75,445 (+841, of which pipeline +1,055, helm-chart +355, dependency-graph −303, the conversions; gartner −95 and timeline −94, T279) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 855 | 855 | SC-006, met at M2: at most 881 |
| Lines, diagram test | 87,023 | 93,937 (+6,914, the conversions) | |
| Lines, editor production / test | 1,997 / 2,652 | 2,037 / 2,654 | |
| Lines, production | 126,556 | 128,703 (+2,147) | |
| Lines, test | 150,064 | 158,812 (+8,748) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 387 / 184 | 401 / 195 | |
| Context-source-resolver windows | 30 | 22 | SC-008, met at M2: fewer than 200 |
| Session windows | 31 | 23 | |
| Action-provider windows | 22 | 14 | SC-008, met at M2: fewer than 50 |
| Property-provider windows | 7 | 6 | SC-008, met at M2: fewer than 50 |
| Body windows | 57 | 9, and *Body / Folder* 20 (below) | |
| Registration windows | 0 | 43 (`AdpRegistration`/`RegistrationLayout`, below) | |
| Parser / Writer / Validator / Tokenizer windows | 58 / 22 / 12 / 6 | 58 / 22 / 12 / 6 | |
| Clone scan, test: shared windows / files | 1,564 / 283 | 1,615 / 292 | |
| Methods over 50 code lines | 162 | 164 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 36 | 36 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 330 | 377 (62 added, 15 removed) | |
| `PackageReference` edges | 244 | 252 (14 added, 6 removed) | |
| `FrameworkReference` edges | 9 | 8 | |
| `InternalsVisibleTo` edges | 41 | 40 (5 added, 6 removed) | |
| Projects without a `.cs` file | 1 (`EtAlii.Adp.Sessions`) | none | SC-013: none at M5 |
| Core references naming a tool module | 9 | 10 (all from test projects; the tenth is `Specification.Fbl.Tests` → `HelmChart`, from helm-chart task 9) | SC-013: none at M5 |
| `Task.Delay` and `Thread.Sleep`, test / production | 5 / 5 | 5 / 5 | SC-004, SC-010 (T283 in M5) |
| Polling helpers | 3 (all in `StreamProbe`) | 3 | SC-003 as amended by the M3 review |

**The core projects, before and after.** Production lines per core project that moved by more than 100:

| Project | M3 | Now | Change |
|---|---|---|---|
| `EtAlii.Adp.Diagram` | 4,575 | 1,931 | −2,644 (T155 to T158, T266) |
| `EtAlii.Adp.Documents` | 5,815 | 3,221 | −2,594 (T160, T161) |
| `EtAlii.Adp.Files` | | 2,401 | new (T160) |
| `EtAlii.Adp.Workspace` | | 1,857 | new (T155, T156) |
| `EtAlii.Adp.Diagram.Modules` | | 1,162 | new (T157) |
| `EtAlii.Adp.Sessions` | 0 | 968 | T265, T266 |
| `EtAlii.Adp.Specification.Disl` | 6,519 | 7,005 | +486 (the causal-loop and pipeline conversions) |
| `EtAlii.Adp.Hierarchy` | 5,749 | 5,368 | −381 (T167, T169, T174, T175) |
| `EtAlii` `.Adp` | 1,091 | 1,424 | +333 (`ToolOrigin`, `ToolDefinitionDiscovery`, `ToolDefinitionCatalog`, `ProjectRoot`, `ProjectPath`) |
| `EtAlii.Adp.Editor` | 743 | 496 | −247 (T164 to T166, T266) |
| `EtAlii.Adp.Backend` | 146 | 0 | removed (T159); `Backend.Service` +137 |
| `EtAlii.Adp.Designer` | 549 | 408 | −141 (T164 to T166, T266) |
| `EtAlii.Adp.Authentication` | 442 | 332 | −110 (T265) |

**Clone families.**
- **Gone:** `GhgBody`/`TimelineBody` (52 windows, T279). The dependency-graph and timeline session, registration, resolver and action provider (14, 12, 9 and 8): the dependency-graph conversion rewrote that module.
- **New: `AdpRegistration`/`RegistrationLayout`, 43 windows, now the largest family that is not a stub's `Diagram.cs`.** T173 wrote the layout read and write of `AdpRegistration` (`ReadLayout`, `TryParseEntry`, `AppendBlock`, `FindBlock`) as a copy of `RegistrationLayout`'s. T175 moved the two side by side but did not fold them.
- **New, from helm-chart task 9:**
  - `AnsibleFolder`/`HelmBody` (20): the recursive `FileSystemWatcher` and its notification.
  - `AnsibleYaml`/`HelmYaml` (14): the tolerant YAML read.
  - `AnsibleFolders`/`HelmChartStore` (9): a claim-counted registry of open folders.
- **New, from pipeline task 9:** `YamlScalars`/`PipelinePlanner` (10).
- **Unchanged:** the sibling pairs left to their conversions (sankey and supply-chain parsers 28, writers 22, the YAML parsers 13 and 12).
- **Test code:** the transcripts grew from 221 to 248 windows, `GhgTranscript`/`TimelineTranscript` from 44 to 48. The dependency-graph and timeline test files are still the largest pairs (document 98, parser 80, writer 54, session 45), with dependency-graph's now under its conversion's `Parity/Oracle/`.

**Long methods.**
- Eighteen of M3's twenty longest are unchanged.
- `ActionRunner.Action` grew from 127 to 151 (pipeline task 4), and `DislModelBuilder.DerivedRelations` (97) entered.
- The over-50 count rose by two. Three left: `DiagramDefinitionDiscovery.Discover` (T164), `ProjectValidator.ConsiderFileAsync` (62 to 39, T169) and `HelmGraph.Derive` (helm-chart's close). Five entered, all from the conversions: `DislModelBuilder.ExpressionForm` 76, `PipelineYamlPlugin.Elements` 66, `PipelinePlanner.Entry` 56, `HelmChartFolderPlugin.Elements` 56, `PipelineGraphBuilder.Build` 52.
- `DiagramService.Open.OpenSession` grew from 60 to 77, because T168 put the router's five outcomes in it. M5's named candidate *what is left of `DiagramService.Open`* reads it.

**Project graph.**
- **Diagram:** the thin project lost its references to the context, designer, editor, hierarchy, history, layout, projects and DISL projects, and with them `Microsoft.AspNetCore.App`, `Grpc.AspNetCore` and `Grpc.Tools`.
- **Hierarchy:** it now references the diagram project, which no longer references it (T158, T167).
- **Sessions:**
  - It references the diagram, designer, editor and history projects, never the reverse.
  - The authentication, context and projects projects reference it in place of the authentication project, so the direction between the two is turned round (T265).
  - The six tool modules other than diagrams reference it directly.
- **Diagram modules:** all 19 reference `Diagram.Modules`.
- **`InternalsVisibleTo`:**
  - Removed: authentication and diagram to their tests and `Backend.Tests`, documents to `TestSupport`, editor to its tests.
  - Added: files to `Documents.Tests` and `TestSupport`, sessions and workspace to their tests, workspace to `Backend.Tests`.
  - No core project grants one to a tool module.

## Exit condition and success criteria

The exit condition of M4 (T183): the project graph says what the architecture says. SC-012, SC-015 and SC-016 are due at the end of M4, and SC-028 for the sign-in code and the contracts.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| The project graph says what the architecture says | Met | every reference the pages state holds | T181 (standalone pull request 437) read both pages against the solution and corrected eight sentences, none of them about a reference. Checked again at `0ea296327` against the csproj files:<br>• `docs/solution-structure.md` says the sessions project "references the diagram, designer, editor and history projects, never the reverse", the layout project has no dependency, and the diagram project references "the documents project and the shared primitives only".<br>• The plan puts the router in the lowest project that sees all three catalogs: the hierarchy project references the diagram, designer and editor projects.<br>• `DislDiagramDefinition` and `DislToolboxProvider` are in `Diagram.Modules`, which is why it, not the diagram project, references the layout and DISL projects (the M3 review's widening of T157).<br>• Only test projects name a module. |
| SC-012: the diagram-abstractions project references the documents project and the shared primitives, no other core project, and no web or gRPC hosting package | Met by its project file. A hosting abstraction still arrives transitively (T288) | 2 core references (8 at the report's reading); no `FrameworkReference`, no `Grpc.*` | `EtAlii.Adp.Diagram.csproj` references `EtAlii.Adp` and `EtAlii.Adp.Documents`, and `Serilog` and `Microsoft.Extensions.DependencyModel`. No file in it uses `Microsoft.AspNetCore` or `Grpc`. `EtAlii.Adp` took `Microsoft.AspNetCore.Hosting.Abstractions` when T161 took it from the documents project. It needs only `IHostApplicationBuilder` from it (`HostApplicationBuilder.AddToolDefinitions.cs`), which `Microsoft.Extensions.Hosting.Abstractions` provides, so the diagram project reaches ASP.NET Core's HTTP and server abstractions through it. T288 |
| SC-015: the precedence between the three tool kinds is decided in one method; one discovery, one catalog type and one session-factory registry serve three families | Met for discovery, catalog and registry; the precedence has one full ordering and one partial one (T290) | 1 discovery, 1 catalog type, 1 registry (3 of each); precedence in 1 method plus 1 two-kind ordering (4 places) | `ToolRouter.Route` (`EtAlii.Adp.Hierarchy/ToolRouter.cs`) orders diagrams, designers, editors for the open, the validator, the hierarchy's states and the delete handler (T168, T169). `ToolDefinitionDiscovery`, `ToolDefinitionCatalog<T>` and `ToolSessionFactories<TKey, TFactory>` each serve the three kinds through one-line derivations (T164 to T166). Left: `HierarchyContextSourceResolver.DiagramMimeTypeOf` asks the diagram router and then the editor resolver, "diagrams first, unconditionally", unchanged since M3. T290 |
| SC-016: `projects.json` read at most once per request, and at most once per user between writes | Met | 9 resolving call sites, none reached twice by one request (8 at the report's reading, `ExecuteAction` twice) | `FileProjectStore` keeps each user's parsed list, checked against the file's time and length, and dropped on its own write; `Add` and `Remove` read, change and write under one lock (T176). Every service resolves once (T172, T177). `FilePromptFlow.Tests`' `AnActionThatAsks_ResolvesTheProjectOnce` asserts one read |
| SC-028, M4's half: no sign-in session type, tool-session contract, factory contract or factory registry outside the sessions project | Met | 0 found outside `EtAlii.Adp.Sessions` (declared in four projects at `b62b7f8`) | A search of every other core production project for `ISessionStore`, `InMemorySessionStore`, `SessionContext`, `SessionInterceptor`, `I(Diagram\|Designer\|Editor)Session`, `*SessionFactory` and `*SessionFactories` finds none (T265, T266). Two types the task did not name moved with them, because leaving them would have closed a cycle: the viewport registry and `TextEditorSession`. So no shared session type stays behind for want of a reference (spec, *A session type that cannot move*). `EditorSessionAdapter` in `EtAlii.Adp.Workspace` implements the diagram session contract to carry an editor over the diagram stream. It is a wire adapter, not a contract, factory or registry, and it goes if the `text` stream member is ever made (question 1) |

**The stability runs.** SC-002 is due at M0 and M9; T275 asks each review to read the runs since the last one. Both runs since the M3 review failed, 19 of 20 green each time, on two intermittent tests not seen before:
- [Run 12](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/38973200271), started by hand for the M3 review at `6a4ca9d23`. `ContextSelectionFlowTests.ASelectionOnOneConnection_IsNeverObservedOnAnothersStream` had its baseline read cancelled (`ContextSelectionFlow.Tests.cs:64`). This is T292.
- [Run 13](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39012532979), scheduled, at `a0ba731e1`. `WatchedFolderTests.ARename_NamesBothTheOldAndTheNewName` reported "The rename was never heard" after 10 s (`WatchedFolder.Tests.cs:65`). This is T291.

The three intermittent tests of M3 (T281, T282) did not recur.

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| Does the problems project still need the hierarchy project? | No | It uses the routers of the hierarchy project: `DiagramFileRouter` (9 uses), `ToolRouter` (3, which T169 put `ProjectValidator` on deliberately) and `DesignerFileRouter`, and `HierarchyTargets`. The router lives in the hierarchy project because that is the lowest project that sees all three catalogs (T167). Removing the reference would need a routing project of its own, which no requirement asks for. The problems project is a leaf: only the host and two test projects reference it, so the reference closes no cycle | none |
| Move the gRPC services of the context, hierarchy, history and projects projects to the host project | No to moving the classes; do now what the move was for, T288 | The history project has no gRPC service. `HierarchyService` and `ProjectService` are confined to one or two files. In the context project, nine files outside `ContextService` are typed in its wire messages, so moving the service would mean splitting `context.proto`, which is out of scope. What the move was for is that a module carries no hosting package. It does today: all 25 modules with code reach `Grpc.AspNetCore` and `Microsoft.AspNetCore.App`, through `Diagram.Modules` (context, hierarchy, sessions) or through the sessions project. Those projects use only `Grpc.Core`'s API (`ServerCallContext`, `RpcException`, `Interceptor`) and the generated service bases, which `Grpc.Core.Api` provides. No file in them uses `Microsoft.AspNetCore`. Exchanging the two hosting references for the API package frees every module without moving a class | T288 |
| Keep the sessions project free of the hosting packages | Do now, within T288 | Three of its files touch gRPC: `SessionInterceptor`, `SessionContext` (`ServerCallContext.UserState`) and a documentation reference. None needs ASP.NET Core. Moving the interceptor and `SessionContext` out would cost more than it buys: `SessionContext.GetUserId` is called from eleven production files in five projects, which would then reference the authentication or host project. So the sessions project keeps them, and takes the API package in place of `Grpc.AspNetCore` and ASP.NET Core (DP-5, R17) | T288 |
| A `text` member on the workspace stream (report 4.4) | Follow-up feature, question 1 | A wire change, out of scope by the specification. `WorkspaceMessage` has hierarchy, context, diagram and table members. `EditorSessionAdapter` (74 lines) presents an editor as one `"content"` element and replays a change as a remove and an add, and the client's `useEditorText` folds it back. The table member (`OpenTable`) is the precedent | none |
| Rename the wire message `Path` and retire the `IoPath` alias (report 5.4) | Follow-up feature, question 1 | A wire change. The alias is now in 465 files (417 at the report's reading; 65 production, 400 test), with 2,573 uses. `message Path` is in `connection.proto` and a field fifteen times across seven protos. The alias's own comment names a type `EtAlii.Adp.Path` that became `EtAlii.Adp.Documents.Wire.Path` on 2026-09-25, so in about 385 files it may already be needless. That is a text search, unconfirmed by a build | none |
| Remove the three legacy calls kept for tests (report 5.4) | Follow-up feature, question 1 | A wire change. The client calls none of them (`oneStreamPerTab.test.tsx` guards it). The tests still do: `WatchHierarchy` 12 times in 5 flow files, `ContextService.Watch` 49 times in 13, `DiagramService.Open` in 22 flow files. The M0 harness's `FlowSession` and `StreamProbe` read those streams. Removing them means a demultiplexer over the workspace stream in the harness and about 40 flow files rewritten, which is M8's flow move (T251) in size | none |
| Do the editor and designer projects still earn a project each? | No | Each is its kind's contract project, as the thin diagram project is for diagrams. The editor project keeps 496 lines (`EditorDefinition`, `IEditorAnalyzer`, `TextFileBuffer` of 277 lines that the text editor session and the hierarchy use). The designer project keeps 408 (`DesignerDefinition`, the document templates, `TableModel` of 227 lines that the table wire and the knowledge designer use). Joining them would let editor modules see designer types or the reverse | none |
| A `ProjectRoot` on the wire boundary: validate once in an interceptor | No | Each request resolves its root once (T172, T177), and T176's cache reads `projects.json` at most once per user between writes, so SC-016 is met. `project_id` is in 19 fields across 8 protos, and the refusals differ (an `RpcException`, an in-band error, a refusal before the workspace stream registers). `ProjectTextFile` also checks containment of a path, which an interceptor cannot. An interceptor would add reflection over every message for nothing saved | none |

## New candidates

**From the clone scan.**
- **`AdpRegistration`/`RegistrationLayout` (43 windows).** Do now: T289. `RegistrationLayout` reads and writes the layout block through `AdpRegistration`, which already parses and serializes it (FR-061).
- **`AnsibleFolder`/`HelmBody` (20).** Do now, widening T280 to `HelmBody`'s watcher. Helm task 9 copied ansible's recursive `FileSystemWatcher`. With helm-chart and ansible-structure closed, both take their events from `ProjectFileEvents`, and the tree is left with the one watcher of `WatchedFolder` (FR-050).
- **`AnsibleYaml`/`HelmYaml` (14) and `AnsibleFolders`/`HelmChartStore` (9).** Do now, in M7: T294. Both conversions have closed, so nothing will replace these. The tolerant YAML read is written once, and the two claim-counted folder registries use `RetainedRegistry` where it fits or say why not (FR-046, FR-051).
- **The registration-header readers of c4, databricks and rdf (5 and 12).** Do now, in M7: T295, read through `AdpRegistration`. The M3 review assigned these to T173, but no module reads through `AdpRegistration` yet (FR-061). Each module's conversion (0 of 17, 0 of 15, 0 of 18 tasks) is read first (FR-012).
- **`YamlScalars`/`PipelinePlanner` (10).** No for now. The pipeline conversion is at 9 of 12 tasks, and its task 12 takes the remaining classes; the M5 review reads it again once it has closed (FR-012).
- **The sankey, supply-chain and functional-decomposition families.** No, as at M3: their conversions (each 0 of 12) replace them (FR-012).
- **The dependency-graph and timeline test files.** No for this review. Dependency-graph's are its conversion's parity oracle, which that specification keeps. The M8 review reads the test clones (T245, T246).

**From the method-length count.**
- `ActionRunner.Action` (151) and the five methods new to the over-50 set come from conversions still open or just closed. T241 already takes "whatever `methods.py` now puts in its twenty longest" at M7.
- `DiagramService.Open.OpenSession` (77) is M5's named candidate.

**From the project graph.** The hosting packages that reach every module (T288). One partial ordering of the tool kinds outside the router (T290).

**What M4 made cheap.**
- **A new kind of tool.** It is a definition type, a one-line catalog, a call to the generic discovery and a one-line factory registry. Its precedence is one line in `ToolRouter`.
- **An open.** It asks the router once and gets a result to switch on.
- **A root or a path.** It is a value: normalized once, compared as the file system compares, and resolved once per request.
- **A registration.** It is parsed in one place, cached on its modification time.
- **A module's references.** A module references the thin project, `Diagram.Modules` and the sessions project. None of them needs a module, and after T288 none carries a hosting package.

**What M4 made pointless.** Nothing among the remaining tasks. The conversions did:
- **T225:** the dependency-graph conversion removed `DependencyGraphFindings`' construction of `FblElement`s. It is struck.
- **T227:** two of its three modules have closed. It is reduced to databricks.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014):
- T155 to T180, T265, T266 and T286 were ticked in their own `etalii.adp` pull requests, the last, T266, by #302.
- T181 (standalone pull request 437), T182 ([M4-measurements.json](M4-measurements.json)), T183 and T184 (this pull request).

**Added, in M4 under *Added by the M4 review*, to be done before M5's first task:**
- T288: the context, hierarchy, projects and sessions projects take `Grpc.Core.Api` in place of `Grpc.AspNetCore` and ASP.NET Core. `EtAlii.Adp`, the editor and the designer projects take `Microsoft.Extensions.Hosting.Abstractions` in place of `Microsoft.AspNetCore.Hosting.Abstractions`. A guard checks that no project a tool module reaches carries a hosting package (FR-054, FR-065; SC-012).
- T289: `RegistrationLayout` reads and writes the layout block through `AdpRegistration` (FR-061).
- T290: `HierarchyContextSourceResolver` asks `ToolRouter` (FR-058; SC-015).
- T291: the intermittent `WatchedFolderTests.ARename_NamesBothTheOldAndTheNewName` (FR-005; SC-002).
- T292: the intermittent `ContextSelectionFlowTests.ASelectionOnOneConnection_IsNeverObservedOnAnothersStream` (FR-005; SC-002).

**Added, in M5:** T293, the module-facing seams take `ProjectRoot` and `ProjectPath` in place of `string rootPath`, as question 2 rules (FR-059).

**Added, in M7:**
- T294: one tolerant YAML read for ansible-structure and helm-chart, and their folder registries on `RetainedRegistry` (FR-046, FR-051).
- T295: the registration headers of c4, databricks and rdf read through `AdpRegistration` (FR-061, FR-012).

**Widened:** T280 also moves `HelmBody`'s watcher onto `ProjectFileEvents`. Its remaining half is unblocked: `ansible-structure-disl-fbl` closed (12 of 12) before its first half merged, and `helm-chart-disl-fbl` has closed (11 of 11). It comes before M5's first task with T288 to T292. T287's HelmChart part is unblocked by the same close.

**Reduced:** T227 to databricks (`timeline-disl-fbl` and `dependency-graph-disl-fbl` have closed).

**Struck:** T225, overtaken by `dependency-graph-disl-fbl`. `DependencyGraphFindings` no longer builds `FblElement`s; the module re-identifies the binding's elements. The 12-argument constructor is now used only by FBL plugins, which T225 never concerned.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `0ea296327`:
- Closed: `ansible-structure-disl-fbl` 12 of 12, `helm-chart-disl-fbl` 11 of 11, `causal-loop-disl-fbl` 11 of 11, `dependency-graph-disl-fbl` 9 of 9.
- Open: `azure-devops-pipeline-disl-fbl` 9 of 12, task 10 under way.
- Not started: the other nine.

So:
- T225 is **overtaken** (struck) and T227 is **reduced**, both above.
- T231 and T232 (rdf, 0 of 18) **stand**, T236 and T237 (wardley-map, 0 of 13) **stand**, T238 (sparql, 0 of 11) **stands**, and T239 (c4, 0 of 17) **stands**. `WardleyParser.Outcome` is still 220 code lines.
- T280's ansible part is **unblocked**, and T295 reads its three conversions first.

## Behaviour changes

**Ruled and applied since the M3 review:**
- B-07, applied by T178 (standalone pull request 401): the rename handler validates with `EntryNameRules`, and its messages win.
- B-26, ruled on 2026-10-17 and applied by T168 (standalone pull request 423): an `.adp` registration that cannot be served is refused.

**Still open:** B-08, needed by M6 (T211). M5 needs none of the open rows.

**New rows for M5.** Two M5 tasks change what a user can observe, so each enters a row of its own before it merges:
- T283: one read-retry in place of `DocumentLifecycle`'s 5 × 50 ms and `WatchedFile`'s 3 × 20 ms changes when a refused read gives up.
- T198: a stated drop policy changes what a client that stops reading receives.

**The register's Status column lags its record.** B-01 with B-20, B-04, B-05 with B-15 and B-16, B-06, B-10, B-11 and B-14 read *ruled*, although the M3 and M1 reviews record them as applied. Each is corrected to *applied*, with its pull request, by the M5 review, which reads the register next.

## Follow-up features

Each depends on question 1, and each is a change to a `.proto` contract, which this feature's scope excludes.

1. **A text member on the workspace stream.**
   - *Evidence:* the `text` candidate above.
   - *Estimate:* a `oneof` member and an open request in `workspace.proto`, a text pump in `EtAlii.Adp.Workspace` in place of `EditorSessionAdapter`, the editor branch of `DiagramService.Open`, and the client's `useEditorText` and stream demultiplexer with their tests. About ten files and 400 to 600 lines, in standalone only.
2. **The wire `Path` renamed, and the `IoPath` alias retired.**
   - *Evidence:* the `Path` candidate above.
   - *Estimate:* one `.proto`, two client files and about 470 C# files, mechanically. The roughly 385 aliases that look needless already could go first, with no wire change, if a build confirms it.
3. **The three legacy calls removed.**
   - *Evidence:* the legacy-calls candidate above.
   - *Estimate:* a demultiplexer over the workspace stream in `EtAlii.Adp.TestSupport.Host` (about 150 lines), about 40 flow test files rewritten, and the three calls and their wrappers removed. Best done beside M8's move of the flows (T251).

## Questions for the maintainer

**1. The three wire candidates: a `text` member on the workspace stream, the wire `Path` renamed with the `IoPath` alias retired, and the three legacy calls removed.** Each changes a `.proto` contract, which this feature leaves out of scope. Their evidence and estimates are above.

- (a) **All three become follow-up features, written as above.** *Recommended*: none of them serves a requirement of this feature. Each touches the client or the test harness more than the C# structure. They are independent of each other and of M5 to M9.
- (b) The legacy calls are removed in this feature, in M8 beside T251, where the flows move anyway; the other two become follow-up features. This adds a task of about 40 files to M8.
- (c) None is done: the three are recorded as declined.
- (d) Other.

**2. Typed roots on the module-facing seams (T293).** T172 resolved a `ProjectRoot` once at each service boundary, but the seams a module implements still take `string rootPath`: `IContextSourceResolver`, the three session factories' `Open`, `IDiagramDocumentReloader`, `IEditorAnalyzer`, `IEntryRenameFollower`, `IHistoryStackStore`, `ICommandNoticeSink` and `ContextTarget.RootPath`. That is 55 parameters in 30 module production files. Modules re-check containment by hand, for example mindmap's `IsInside` and the XML editor's resolver.

- (a) **All of them, in M5.** *Recommended*: FR-059 asks for roots and paths as values normalized once. M5 reworks `IHistoryStackStore`'s retain and release (T192, T193) and the store reads (T283) anyway, so each seam is touched once. The size is about 90 production files and 60 to 100 test files, mechanically, in two or three pull requests.
- (b) Only the seams whose implementations read the root (about 25), in M5; the others keep their string until a task touches them.
- (c) None: the module-facing seams keep `string rootPath`, and T293 is struck.
- (d) Other.

## Ownership

M4 was owned by one developer, signing as `agent-1-<task>` (FR-006). T155 to T158 ran on the maintainer's machine. From T159 on, M4 ran in a cloud session, after the maintainer chose it on 2026-10-17 when the machine could not restart. M5 is owned by the same developer unless the maintainer hands it over with this review.
