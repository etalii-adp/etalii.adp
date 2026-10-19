# M5 review: core hotspots

**Measured at**: `etalii.adp.ide.standalone` `9a55998a5`, the merge of pull request 503, 2026-10-19 | **Previous record**: [M4-review.md](M4-review.md), [M4-measurements.json](M4-measurements.json) at `0ea296327` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M5 took the core hotspots of report 5 apart. The hierarchy model hands its watcher events, its indexes and its diagram states to `WatcherEventNormalizer`, `HierarchyIndex` and `DiagramStateDecorator`, reads the disk outside its lock and raises its changes after the lock is released. A connection and its project are held by one `ConnectionSession` in the sessions project, and the workspace service delegates to domain services. Files are written through one injected `IFileWriter`, streams are opened through one `OpenStreamAsync` and every channel is bounded (B-28). Started tasks are observed through `RunningTasks`, nothing blocks on asynchronous work, document reads are asynchronous with one read-retry on the injected clock, and every module-facing seam takes a typed root. No core project references a tool module any more.

Two things did not fit:
- **The hierarchy model is not half its size.** `HierarchyModel.cs` is 874 lines against SC-017's 459. Its lock discipline is met, but reading the disk outside the lock and applying the result under it added as much as the three extractions took away.
- **The host's test project still names modules in code.** Its references are gone, but 18 of its files name a tool module's types. Most are the single-module flows that M8 moves (T251, T252).

The review adds T296 to T302 and widens T294. Three questions go to the maintainer: SC-013's "in code" for the host's tests, SC-017's size, and B-08, which M6 needs.

## Measurements

Between M4 and M5, 66 pull requests merged (standalone 438 to 503):
- **This feature: 48.** M4's review tasks T280 (its Helm half), T288 to T292; M5's T185 to T203 with T283 (eight parts), T287 and T293 (nine parts); and one defect found on the way (448).
- **Others: 18.** Thirteen of `c4-disl-fbl` and five of `azure-devops-pipeline-disl-fbl`, which closed.

| Figure | M4 (`0ea296327`) | Now (`9a55998a5`) | Target |
|---|---|---|---|
| Projects | 142 | 142 | about 134 at the end (plan) |
| Files, all | 2,405 | 2,496 | |
| Lines, all | 287,515 | 298,158 (+1,889 production, +8,754 test) | |
| Lines, core production | 45,665 (20 projects) | 48,000 (+2,335) | |
| Lines, core test | 56,856 (24 projects) | 60,273 (+3,417) | |
| Lines, diagram production | 75,445 | 74,981 (−464; pipeline −750, c4 +220, the conversions) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 855 | 850 | SC-006, met at M2: at most 881 |
| Lines, diagram test | 93,937 | 99,228 (+5,291, the conversions) | |
| Lines, editor production / test | 2,037 / 2,654 | 2,043 / 2,695 | |
| Lines, production | 128,703 | 130,592 (+1,889) | |
| Lines, test | 158,812 | 167,566 (+8,754) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 401 / 195 | 354 / 202 | |
| Context-source-resolver windows | 22 | 22 | SC-008, met at M2: fewer than 200 |
| Session windows | 23 | 23 | |
| Action-provider windows | 14 | 14 | SC-008, met at M2: fewer than 50 |
| Property-provider windows | 6 | 6 | SC-008, met at M2: fewer than 50 |
| Body windows | 9, and *Body / Folder* 20 | 9, and *Body / Folder* 11 | |
| Registration windows | 43 | 0 (T289) | |
| Parser / Writer / Validator / Tokenizer windows | 58 / 22 / 12 / 6 | 58 / 22 / 12 / 6 | |
| Clone scan, test: shared windows / files | 1,615 / 292 | 1,663 / 301 | |
| Methods over 50 code lines | 164 | 158 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 36 | 34 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 377 | 369 (2 added, 10 removed) | |
| `PackageReference` edges | 252 | 248 (9 added, 13 removed) | |
| `FrameworkReference` edges | 8 | 4 (4 removed) | |
| `InternalsVisibleTo` edges | 40 | 40 | |
| Projects without a `.cs` file | none | none | SC-013: none at M5 |
| Core references naming a tool module | 10 | 0 | SC-013: none at M5 |
| `Task.Delay` and `Thread.Sleep`, test / production | 5 / 5 | 15 / 4 (no `Thread.Sleep` in production) | SC-004, SC-010 |
| Polling helpers | 3 (all in `StreamProbe`) | 3 | SC-003 as amended by the M3 review |

**The core projects, before and after.** Production lines per core project that moved by more than 100:

| Project | M4 | Now | Change |
|---|---|---|---|
| `EtAlii.Adp.Specification.Disl` | 7,005 | 7,672 | +667 (the c4 and pipeline conversions) |
| `EtAlii.Adp.Hierarchy` | 5,368 | 5,942 | +574 (T186 to T191, T201) |
| `EtAlii.Adp.Sessions` | 968 | 1,243 | +275 (T192, T193) |
| `EtAlii.Adp.Workspace` | 1,857 | 2,096 | +239 (T194, T197, T198) |
| `EtAlii.Adp.Files` | 2,401 | 2,608 | +207 (T195, T196, T283) |
| `EtAlii.Adp.Diagram` | 1,931 | 1,750 | −181 (T283, T293) |
| `EtAlii.Adp.Context` | 2,950 | 3,095 | +145 (T199, T203) |
| `EtAlii.Adp.Projects` | 412 | 522 | +110 (`StreamBound`, T198) |

M5 moved responsibilities into types of their own and made lifetimes and waits explicit, which costs lines. Core production grew by 2,335, of which about 670 are the conversions' DISL work.

**Clone families.**
- **Gone:** `AdpRegistration`/`RegistrationLayout` (43 windows, T289), and the 4 windows the scan found between two `*Service` files at M4, which T194 to T197 rewrote.
- **Smaller:** `AnsibleFolder`/`HelmBody` from 20 to 11. T280 moved Helm's watcher onto `ProjectFileEvents`; what both still share is the translation of a file event into the folder body's notifications.
- **New:**
  - `C4ContextSourceResolver`/`DatabricksContextSourceResolver` (7), from the c4 conversion.
  - `MoveNodeCommand`/`RemoveNodeCommand` (5), mind map's load-and-find preamble, which T283 made identical in both.
  - `ServiceCollection.AddCausalLoop`/`AddSparql` (3), two registration lists.
- **Unchanged:** `YamlScalars`/`PipelinePlanner` (10), `AnsibleYaml`/`HelmYaml` (14), `AnsibleFolders`/`HelmChartStore` (9), and the sibling pairs left to their conversions.
- **Test code:** the transcripts grew from 248 to 263 windows. The largest pairs are still the dependency-graph and timeline test files.

**Long methods.**
- Over 50: 164 to 158; over 80: 36 to 34.
- **Left the set:** `HierarchyModel.SyncFolder` (84, T189), `AddDiagramContextActionProvider.CommitAsync` (82, T201), `HierarchyModel.RefreshDiagramStates` (62, T188), `HierarchyModel.ApplyNesting` (52, now 42), `ContextService.Actions.TryResolveTargetAsync` (56, now 47, T203), `ContextService.RunWatchAsync` (55; `ContextWatch.RunAsync` is 36, T194), and c4's `C4RuleSet.ValidateElements` and `C4ElementMapper.RelationshipsOf` (the conversion).
- **Moved and still long:** `DiagramService.Open.OpenSession` is now `DiagramPump.Open` (77) and `PumpAsync` is `DiagramPump.RunAsync` (62), T194. `HierarchyService.RunWatchAsync` (62) is `HierarchyWatch.RunAsync` (58). `RenameEntryCommandHandler.Move` (82) and `RenameSubjectWithItsRegistrations` (77) became asynchronous with T283 at the same length.
- **Entered:** `HierarchyModel.ApplyFolder` (60, T189) and `C4Disl.Build` (52, the c4 conversion).

**Project graph.**
- **The hosting packages** (T288): the context, hierarchy, projects and sessions projects take `Grpc.Core.Api` in place of `Grpc.AspNetCore` and the `Microsoft.AspNetCore.App` framework. `EtAlii.Adp`, the designer and editor projects take `Microsoft.Extensions.Hosting.Abstractions`, and the five editor modules and the knowledge designer lost their own hosting reference with them. `ModuleHostingPackages.Tests` guards it.
- **The tool modules** (T287): `Backend.Tests` lost its five module references and `Specification.Fbl.Tests` its five. `EtAlii.Adp.TestSupport` now references `Specification.Fbl`, for the real-file corpus the modules' cross-checks share.
- **The conversions:** `Diagram.C4` references `Specification.Disl`, and `Diagram.Mindmap` takes `Microsoft.Extensions.Configuration.Binder`.
- **`InternalsVisibleTo`:** unchanged. No core project grants one to a tool module.

## Exit condition and success criteria

The exit condition of M5 (T205): the core hotspots are corrected. SC-013, SC-017 and SC-018 are due at the end of M5, with SC-028's second half and the clause of SC-010 that the M3 review moved to T283.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| The core hotspots are corrected | Met, but for the hierarchy model's size (SC-017) | every recommendation of report 5.1 to 5.4 done | 5.1: T186 to T191. 5.2: T192 to T194. 5.3: T197 to T200. 5.4: T195, T196, T201 to T203. Of 5.4's stale comments and dead code, the three legacy calls and the `IoPath` alias are the follow-up features the maintainer ruled at M4 |
| SC-013: no project without code; no core project names a tool module, in a reference, in `InternalsVisibleTo` or in code | Met for references, `InternalsVisibleTo` and empty projects; not met in code (question 1) | 0 references (10 at M4), 0 grants, 0 empty projects; 18 files of `EtAlii.Adp.Backend.Tests` name a module's types | `graph.py` reports no core project naming a tool module (T287, standalone pull request 503). In code, a search of the core projects for a module's namespace finds only `EtAlii.Adp.Backend.Tests`, which reaches the modules through the host project:<br>• 11 flows of one module each (agent activity, Ansible twice, C4, Databricks, Helm twice, OWL, RDF, timeline, Wardley map), which T251 and T252 move in M8.<br>• `DrawnConnections.Tests` and `ElementTypeCatalog` with `ElementTypes.Tests`, which name every module on purpose: they check what all of them draw.<br>• `ModulePluggability.Tests` and `DesignerModuleIsolation.Tests`, which check that the host takes a module it is given.<br>• `SharedRestoreFlow.Tests`, which checks the shared restore edit every module registers in the host, and `YamlEditorResolution.Tests`, which checks that a registered pipeline body opens in its diagram and a bare YAML file in the YAML editor.<br>`Repository.Tests` names modules only in strings, as the paths its guards read |
| SC-017: the hierarchy model is at most half its size (918 lines), does no input or output and raises no event while holding its lock | Lock: met. Size: not met (question 2) | 874 lines, against at most 459 | `HierarchyModel.DiskOutsideTheLock.Tests` (T189) stops a type lookup during a listing, a reconcile, a watcher event and a local rename, and asks the model a question meanwhile. `HierarchyModel.EventsOutsideTheLock.Tests` (T185, T190) has a subscriber that needs the lock at each of the twelve sites that raise a change. Both were seen to fail before their change. The size: T186 to T188 moved 432 lines into three types, and T189 and T190 added about as many. Reading a folder, applying what was read, the per-event handlers and the queue of changes now sit side by side in the model |
| SC-018: every channel bounded; no blocking wait on asynchronous work and no task started and left unobserved in the places report 5.3 lists | Met | 0 unbounded channels in production (every pump at M4); 0 blocking waits; 0 unobserved tasks of the nine report 5.3 lists | `StreamBound` bounds the hierarchy, context, diagram delta, table change and tab channels at 1,000 (T198, B-28). No `CreateUnbounded`, `.GetAwaiter().GetResult()` or `.Wait()` is left in core production. `HistoryActionsBroadcaster` awaits its discovery and `HistoryStack.ClearAsync` its gate (T200). The tasks of `ContextSelectionStore`, `TrackedProblemRoot` and `HierarchyWatch` run through `RunningTasks` and are awaited on close, and the pumps of `DesignerService` and `WorkspaceService` moved into `OpenStreamAsync`, which awaits them (T197, T199) |
| SC-028, M5's half: no retaining or releasing of what a connection or a project holds outside the lifetime scope | Met | 0 outside `ConnectionSession` and `ProjectSession` | The three stores lost their public `Remove` (T193). A connection holds the hierarchy model's claim, the selection and interaction registrations and the workspace connection through `ConnectionSession.Hold`, and the history and problem tracking are its project's parts. Disposing the session is the only release. The stores' own `Retain` and `Release` are on their `RetainedRegistry`, behind the claims the scope holds |
| SC-010, the clause the M3 review left to T283: one read-retry and no `Thread.Sleep` in production | Met | 1 read-retry, 0 `Thread.Sleep` (1 at M4) | A refused read is retried only through `WatchedFile.RetryAsync` on the lifecycle's clock (T283). `waits.py` counts four `Task.Delay` in production: the retry's own wait, the problems' grace and the hierarchy watch's presence poll and recovery |

T283 needed no row in the register. It kept each caller's retry count and pause (`DocumentLifecycle` 5 × 50 ms, `WatchedFile` 3 × 20 ms), so the one retry changed no observable timing. The M4 review had expected a row.

**The test waits.** `waits.py` counts 15 `Task.Delay` in test code, up from 5, all added in M5:
- Three are `Task.Delay(Timeout.Infinite, token)`, standing in for a task that never ends.
- Five hold for one second to show that a close is still waiting (`RunningTasks`, `ContextSelectionStore`, `HistoryActionsBroadcaster`, `ProblemMaintenance`, `HierarchyService.LateRecovery`). They wait for nothing to happen, not for a debounce, an idle eviction or a retry, so SC-004 still holds.
- One is `DocumentLifecycle.Tests`' loop that advances a fake clock until the retry is done. `FakeClocks` already does this, so it is a copy of a helper. T301.

**The stability runs.** Both runs since the M4 review failed, 19 of 20 green each time:
- [Run 14](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39107441611), at `4888dfa2f`: `ExplorerContextActionsFlowTests.APromptRaisedOnOneConnection_IsNeverObservedOnAnothersStream`, "Connection B observed a message raised for connection A." (`ExplorerContextActionsFlow.Tests.cs:248`).
- [Run 15](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39219905282), at `815799c10`, failed twice:
  - The same prompt test, with the same message.
  - `ContextSelectionFlowTests.ASelectionOnOneConnection_IsNeverObservedOnAnothersStream`, "Connection B observed a selection made on connection A." (`ContextSelectionFlow.Tests.cs:333`).

T292 corrected a cancelled baseline read in the second test. This failure is a different one, at its last assertion. The prompt test also failed once on standalone pull request 498 and passed on its re-run. All three assert that a connection's stream never carries another connection's message, so they are taken together in T300. T291's watcher test and M3's intermittent tests did not recur.

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| The three retained stores collapse into the connection session | No | Each store keeps its entries in one `RetainedRegistry` on the injected clock, and acquires and releases only through the claims `ConnectionSession` holds (T193). There is no eviction of their own left to fold. What they still do is lookup across connections, which a session cannot do:<br>• Problems and notices are pushed to every watcher of a root.<br>• A rename is told to every model.<br>• One history stack serves every connection to a project, with its grace after the last release.<br>• A selection can be set before its stream registers.<br>Moving them into the session would put a registry of sessions in their place | none |
| Remove `IContextWatchHooks` | No | It is no longer there to break a cycle. It is there because the problems project references the context project (`ContextWatchHooks`, the problems resolver of T203), so the context project cannot call the problems project directly. Its two members are a project being watched, so its revalidation moves up, and the problems a new watcher is seeded with. That ordering belongs to the watch, not to the tracking that `ProblemTracking` does as a part of the project session | none |
| What is left of `ContextService` and `DiagramService.Open` | Do now | `DiagramService.Open.OpenSession` became `DiagramPump.Open` (77 code lines) with T194, and `PumpAsync` became `DiagramPump.RunAsync` (62). `HierarchyWatch.RunAsync` (58) is the same shape. In `ContextService.Actions.cs`, `ExecuteAction` is 76 and `SubmitInteraction` 58; `TryResolveTargetAsync` went from 56 to 47 with T203. These are the longest methods left in the core services, and SC-023 needs 35 more methods under 50 by M9 | T297, T298 |
| Back-pressure to the client rather than dropping | No | Ruled as B-28 (T198): a full channel ends its stream with `ResourceExhausted`, and the tab re-opens it and is sent a fresh baseline. Nothing is dropped silently, and the tab's own channel already makes its writers wait. Back-pressure across gRPC would hold the watcher and the history threads behind the slowest tab | none |

## New candidates

**From the method-length count.**
Outside the specification projects, 21 core methods are over 50 code lines.
- **The hierarchy's rename and delete handlers.** Do now: T299. `RenameEntryCommandHandler.MoveAsync` (82) and `RenameSubjectWithItsRegistrationsAsync` (77) are the two longest. With them go its `ExecuteAsync` (53) and `DeleteEntryCommandHandler.ExecuteAsync` (66).
- **`HierarchyModel.ApplyFolder` (60).** Do now, within T296.
- **The pumps and the context actions.** Do now: T297 and T298, under the named candidate above.
- **The other eleven** (51 to 71: `RowPacking.Pack`, `ProjectValidator.ValidateDocumentAsync`, `ApplicationAssemblies.Find`, `HistoryStack.UndoAsync`, `TextFileBuffer.Open`, `ToolDefinitionScan`, `ProblemBroadcaster.ToProto`, `FileHolders.WindowsHolders`, `ContextSelectionResolver.ResolveChainAsync`, `LineLexer.Tokens`, `OverlapResolver.Separate`). No for this review: none was a hotspot of report 5, and each does one thing. SC-023 is counted at M9, and the M7 review reads the count again after T241.
- The core methods over 50 in the specification projects (DISL, FBL, CEL) are M6's, and the M6 review reads them.

**From the clone scan.**
- **`YamlScalars`/`PipelinePlanner` (10).** Do now, in M7: T302. The pipeline conversion has closed (12 of 12), and its planner still writes a scalar with its own copy of the FBL library's plain-syntax test and double quoting. SC-010 asks for one YAML scalar accessor (FR-046).
- **`AnsibleFolder`/`HelmBody` (11).** Do now, widening T294: the translation of a file event (a lost event, a rename, any other) into the folder body's notifications is written once, beside `FolderBody`.
- **`C4ContextSourceResolver`/`DatabricksContextSourceResolver` (7).** No for now. `c4-disl-fbl` is at 12 of 17 and `databricks-disl-fbl` has not started; the M7 review reads both again (FR-012).
- **`MoveNodeCommand`/`RemoveNodeCommand` (5).** No. They share the load-and-find preamble every mind map handler states. A helper on `MindmapCommandHandler` would save about ten lines and hide which refusal each command gives.
- **`ServiceCollection.AddCausalLoop`/`AddSparql` (3).** No: two registration lists that happen to name the same kinds of service.

**From the test waits.** `DocumentLifecycle.Tests` copies `FakeClocks`' loop that advances a fake clock until a task is done. Do now: T301.

**From the stability runs.** The cross-connection flows. Do now: T300.

**What M5 made cheap.**
- **A stream.** It is a `StreamMap` and a call to `OpenStreamAsync`, which checks ownership once, bounds the channel and awaits the pump on close.
- **A connection's lifetime.** Anything a connection holds is held through `ConnectionSession.Hold` and released when the session is disposed.
- **A write.** Inject `IFileWriter` and await it; no `Task.Run`, no static lock table.
- **A background task.** Start it through `RunningTasks`, and its owner awaits it on close.
- **A document read.** It is asynchronous and retried on the injected clock, so its tests advance a fake clock.
- **A new source kind for the context.** It is one more `IContextSourceResolver`.
- **A test helper shared across test projects.** It goes into `EtAlii.Adp.TestSupport`, which every test project references, now including the FBL corpus.

**What M5 made pointless.** Nothing among the remaining tasks.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014):
- T185 to T203, T283 and T293 were ticked in their own `etalii.adp` pull requests, the last by #337.
- T287 (standalone pull request 503), T204 ([M5-measurements.json](M5-measurements.json)), T205 and T206 (this pull request).

**Added, in M5 under *Added by the M5 review*, to be done before M6's first task:**
- T296: `HierarchyModel.cs` at most 459 lines. Reading a folder (`ReadFolder`, `ReadView`, `EventFacts`, `SafeHasAnyChild`, `ResolvedBodyNameOf`), applying what was read (`ApplyFolder`, `ApplyNesting`, `ApplyStates`) and the per-event handlers (`OnCreated`, `OnRemoved`, `OnRenamed`, `RecomputeHasChildren`) move out of the model. The model keeps its lock, its queue of changes and its public members, and the guards of T185 and T189 still pass. As question 2 rules (FR-066; SC-017).
- T297: `DiagramPump.Open` (77), `DiagramPump.RunAsync` (62) and `HierarchyWatch.RunAsync` (58) under 50 code lines, one method per outcome of the route and per phase of the pump (FR-067, FR-069; SC-023).
- T298: `ContextService.ExecuteAction` (76) and `SubmitInteraction` (58) under 50 code lines (FR-073; SC-023).
- T299: `RenameEntryCommandHandler.MoveAsync` (82), `RenameSubjectWithItsRegistrationsAsync` (77) and `ExecuteAsync` (53), and `DeleteEntryCommandHandler.ExecuteAsync` (66), under 50 code lines (SC-023).
- T300: the cross-connection flows that failed once in twenty: `ExplorerContextActionsFlowTests.APromptRaisedOnOneConnection_IsNeverObservedOnAnothersStream` (Stability runs 14 and 15, standalone pull request 498) and `ContextSelectionFlowTests.ASelectionOnOneConnection_IsNeverObservedOnAnothersStream` (run 15, at its last assertion). Find the race, make a guard that fails on it every time, and correct it (FR-005; SC-002).
- T301: `DocumentLifecycle.Tests`' advance-until-done loop uses `FakeClocks`' helper in place of its own copy (FR-051).

**Added, in M7:** T302, `PipelinePlanner` writes its scalars through the FBL library's `YamlScalars` in place of its copy (FR-046, FR-012; SC-010).

**Widened:** T294 also writes once the translation of a file event into the folder body's notifications that `AnsibleFolder` and `HelmBody` share (11 windows).

**Reduced:** none. **Struck:** none.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `9a55998a5`:
- Closed: `ansible-structure-disl-fbl` 12 of 12, `azure-devops-pipeline-disl-fbl` 12 of 12, `causal-loop-disl-fbl` 11 of 11, `dependency-graph-disl-fbl` 9 of 9, `helm-chart-disl-fbl` 11 of 11, `timeline-disl-fbl` 7 of 7.
- Open: `c4-disl-fbl` 12 of 17. Its tasks 13 to 16 are the binding's read, the splice writes and the positions.
- Not started: databricks 0 of 15, dotnet-dependency-graph 0 of 10, functional-decomposition-graph 0 of 12, rdf 0 of 18, sankey 0 of 12, sparql 0 of 11, supply-chain 0 of 12, wardley-map 0 of 13.

So:
- T231 and T232 (rdf) **stand**. `OwlProjection.Project` is still 344 code lines.
- T236 and T237 (wardley-map) **stand**. `WardleyParser.Outcome` is still 220.
- T238 (sparql) **stands**.
- T239 and T240 (c4) **stand**. `C4Layout` is 715 lines, and c4's remaining conversion tasks read, write and place, not lay out. `C4Layout.ComputeNested` is 114.
- T295 **stands**, reading c4, databricks and rdf first. T227 (databricks) **stands**.
- T302 is new: the pipeline has closed.

## Behaviour changes

**Ruled and applied since the M4 review:**
- B-27, applied by T290 (standalone pull request 442): an `.adp` registration that cannot be served carries no type in the tree.
- B-28, ruled on 2026-10-18 and applied by T198 (standalone pull request 475): a full channel ends its stream, and the tab re-opens it for a fresh baseline.

**The register's Status column, corrected in this pull request.** The M4 review found rows reading *ruled* that their reviews record as applied. Each now reads *applied* with its pull request:

| Row | Applied by |
|---|---|
| B-01, B-20 | T135, standalone pull request 321 |
| B-04 | T137, 325 |
| B-05, B-15 | T127, 312 |
| B-16 | T128, 313 |
| B-06 | T146, 354 |
| B-10, B-11 | T035 to T037, 180; B-11 also T293, 497 (a file reached through a link that leaves the project) |
| B-14 | 220 to 223, and the M2 rollout |
| B-28 | T198, 475 |

**Still open, and needed by M6:**
- **B-08**, the `major.minor` version check of the DISL and FBL loaders, for T211. Question 3.
- B-09 and B-12 are ruled; T216 applies them.

M6 needs no other row.

## Follow-up features

None new. The three of the M4 review (a `text` member on the workspace stream, the wire `Path` renamed, the three legacy calls removed) stand as written there.

## Questions for the maintainer

**1. SC-013 "in code" and the host's test project.** No core project references a tool module any more. But 18 files of `EtAlii.Adp.Backend.Tests`, the project that runs the whole host, name a module's types:
- 11 single-module flows, which T251 and T252 move to their modules in M8.
- Seven files whose tests span modules or the host's taking of one: `DrawnConnections`, `ElementTypeCatalog` with `ElementTypes`, `ModulePluggability`, `DesignerModuleIsolation`, `SharedRestoreFlow` and `YamlEditorResolution`.

- (a) **Amend SC-013: the host's test project may name modules in code until M8 moves its single-module flows, and its whole-host tests may name them for good.** *Recommended*: the flows already have their task in M8, where they move beside their harness. The whole-host tests test what every module draws, which only the host can. The criterion's references, grants and empty projects are met at M5 as written.
- (b) Move the 11 single-module flows now, as M5 tasks ahead of M6, and amend SC-013 for the seven files that span modules only. This brings part of T251 and T252 forward by three milestones: 11 files, and a reference to the host harness in each module's test project.
- (c) Other.

**2. SC-017's size: the hierarchy model at 874 lines against 459.** The lock discipline is met. The three extractions the report named are done (432 lines), but computing outside the lock and applying under it doubled the model's paths.

- (a) **T296 in M5: move the folder reads, the applying of what was read and the per-event handlers out, to reach 459.** *Recommended*: the criterion is explicit, and what is left in the model is three responsibilities beside its lock. It is about 420 lines moved, in one or two pull requests, before M6.
- (b) Amend SC-017 to the three extractions and the lock discipline, dropping the size; T296 is not added. The model stays at 874 lines.
- (c) Other.

**3. B-08: one version check for the DISL and FBL loaders (T211, M6).** Both specifications say the same: a version is `major.minor`, a higher major is refused, and a newer minor is read with a warning (DISL section 2.9, FBL section 2.7). The two loaders differ:
- DISL takes exactly two parts, digits only, and keeps checking the rest of the document after a refusal.
- FBL takes two or more parts (`"0.5.1"` loads as 0.5), allows a sign or spaces, refuses every major other than 0, and stops at the first version error.

Every specification, binding and fixture in both repositories writes two parts.

- (a) **Strict, as both specifications write it: exactly `major.minor` in digits, a higher major refused, a newer minor warned about, and the loader goes on to report the rest.** *Recommended*: it is what the two specifications and the FBL schema's enumeration say, and no document in either repository changes. FBL would refuse `"0.5.1"` and `" 0.5"`, which no document uses.
- (b) Lenient in both: a trailing patch and surrounding spaces are read. DISL would then load documents its own schema refuses.
- (c) Keep each loader's strictness. T211 shares the code with the strictness as a parameter, and the difference stays.
- (d) Other.

**Answers.** Not yet given when this review merged. It was written as (a) for all three, and T296 was added as question 2 (a) would have it. No criterion is amended in this pull request: SC-013 and SC-017 are amended in the specification, with this review named beside them, once the maintainer has ruled. The maintainer ruled on 2026-10-19 on cards in the project's thread:
- Question 1: (c), other. The alternatives are on a second card, and SC-013 stays as written until it is answered.
- Question 2: (a), T296 now. T296 was already done, in standalone pull request 506: `HierarchyModel.cs` is 381 lines. SC-017 is not amended.
- Question 3: (a), strict, as both specifications write it. B-08 is ruled so, and T211 builds it in M6.

## Ownership

M5 was owned by one developer, signing as `agent-1-<task>` (FR-006), all of it in a cloud session. M6 is owned by the same developer unless the maintainer hands it over with this review.
