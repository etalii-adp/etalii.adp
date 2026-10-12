# M0 review: the safety net

**Measured at**: `etalii.adp.ide.standalone` `d5278a3c6`, the merge of pull request 190, 2026-10-12 | **Previous record**: [baseline-measurements.json](baseline-measurements.json), `1217e1d97` ([baseline.md](baseline.md)) | **Written by**: agent 1, the feature's developer, from the owner's notes and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M0 put the tests on one shared footing and closed the small defects. The flow tests share one host harness, one flow session and one set of helpers, every `*.Tests` project reaches the testing project through `Directory.Build.targets`, the 25 stream-startup waits and their constant are gone, and the suite passed twenty runs out of twenty on the GitHub runner at `d5278a3c6`, after a rename race on Linux and a timing test were fixed on the way. D2, D5 and D6 are closed with guards seen to fail, D1, D3, D7 and D8 arrived with pull request 167, and D9 is settled by FBL 0.6 and waits for T216. Two things did not fit: SC-003's wait-until helper was due at M0 in the specification and at M3 in the tasks, so the criterion is amended here; and SC-014 has not been seen on Windows. The review adds T267 to T271 (Windows evidence for SC-014, a check of azure-devops-pipeline's Alt+Up and Alt+Down, a guard-first fix if they fail, test helpers counted as test code, a nightly stability run), strikes T021, which had no site of its own, and marks T245 and T250 reduced because pull request 186 did part of them.

## Measurements

The previous record is the baseline at `1217e1d97`. M0 changed the tool modules' production code only at its edges (unused references, two forwarding rule sets, the shortcuts of two modules, three containment checks), so the clone scan of production code moved by two windows; the figures that moved are those of the tests and the project graph.

| Figure | Baseline (`1217e1d97`) | Now (`d5278a3c6`) | Target |
|---|---|---|---|
| Projects | 129 | 130 (`EtAlii.Adp.TestSupport.Host` added) | about 134 at the end (plan) |
| Files, all | 2,138 | 2,153 | |
| Lines, all | 262,088 | 259,699 (−2,389) | |
| Lines, core production (18 → 19 projects) | 37,631 | 39,126 (+1,495; of which +1,240 are the two testing projects, see below) | |
| Lines, core test | 47,209 | 44,504 (−2,705) | |
| Lines, diagram production | 87,306 | 87,245 (−61) | SC-006: 9,000 smaller at M2 |
| Lines, diagram test | 78,842 | 76,590 (−2,252) | |
| Lines, designer production | 4,878 | 5,575 (+697: the knowledge designer's own work, pull request 179, outside this feature) | |
| Lines, designer test | 4,746 | 5,261 (+515, the same) | |
| Lines, editor production / test | 463 / 1,013 | 463 / 935 | |
| Lines, production | 130,278 | 132,409 (+2,131) | |
| Lines, test | 131,810 | 127,290 (−4,520) | SC-005: 5,273 smaller at M9 |
| Clone scan, production: shared windows / files | 1,566 / 330 | 1,564 / 330 | |
| Context-source-resolver windows | 291 | 291 | SC-008: fewer than 31 at M2 |
| Session-factory windows | 54 | 54 | fewer than 9 at M2 |
| Property-provider windows | 39 | 39 | fewer than 15 at M2 |
| Document-store windows | 98 | 98 | fewer than 43 at M2 |
| Action-provider windows | 80 | 80 | fewer than 41 at M2 |
| Clone scan, test: shared windows / files | 2,502 / 307 | 1,766 / 261 (−30%) | |
| Methods | 3,384 | 3,441 | |
| Methods over 50 code lines | 180 | 184 | SC-023: at most 124 at M9 |
| Methods over 80 code lines | 45 | 45 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 288 | 272 | |
| `PackageReference` edges | 225 | 227 | |
| `InternalsVisibleTo` edges | 41 | 41 | |
| Projects without a `.cs` file | 1 (`EtAlii.Adp.Sessions`) | 1 (`EtAlii.Adp.Sessions`) | SC-013: none at M5 |
| Core references naming a tool module | 11 | 11 | SC-013: none at M5 |
| Projects referencing `EtAlii.Adp.Backend` | 16 | 2 (`Backend.Service`, `Backend.Tests`) | |
| `Task.Delay` and `Thread.Sleep`, test code | 85 | 49 | |
| `Task.Delay` and `Thread.Sleep`, production code | 7 | 10 | SC-010: no `Thread.Sleep` at M3 |
| Polling helpers | 16 | 10 | SC-003: one, amended to M3 |

**Clone families.** The twenty largest production families are the same twenty as at the baseline. In the test code the largest family of the baseline, five copies of `TranscriptText.cs` (159 windows), is gone, and so are the families of the flow classes: `DatabricksFlow`/`RdfFlow` fell from 161 shared windows to 21, `OwlFlow`/`RdfFlow` from 156 to 16, and the pairs of the core flows (`AddDiagramFlow`, `ContextSelectionFlow`, `ExplorerContextActionsFlow`, `UndoRedoFlow`, 37 to 45 windows each) left the forty largest pairs. The largest test family now is `DependencyGraphDocument.Tests`/`TimelineDocument.Tests` (98 windows).

**Long methods.** Four methods newly exceed 50 code lines and none left the list: `KnowledgeCalculations.Of` (63) and `KnowledgeEdits.AddRelation` (51) are the knowledge designer's own work; `ContextService.RunWatchAsync` (54) grew by T034, whose retain moved inside the `try`, and is restructured by T193 in M5; `TranscriptText.Hunks` (53) arrived in `EtAlii.Adp.TestSupport` with pull request 186. The twenty longest are the baseline's twenty, two of the knowledge designer's lines shifted.

**Project graph.** Removed: the references to `EtAlii.Adp.Backend` from `EtAlii.Adp.Diagram` and from 13 diagram modules (T027), the `InternalsVisibleTo` from `EtAlii.Adp.Diagram` to `EtAlii.Adp.Backend.Service` (T029), and the five references to `EtAlii.Adp.TestSupport` in `.csproj` files, which `src/Directory.Build.targets` now attaches to every `*.Tests` project (T011). Added: `EtAlii.Adp.TestSupport.Host` with its references to `EtAlii.Adp.Backend.Service`, `EtAlii.Adp.TestSupport`, `Grpc.Net.Client` and `Microsoft.AspNetCore.Mvc.Testing`, the reference of `EtAlii.Adp.Backend.Tests` to it, and an `InternalsVisibleTo` from `EtAlii.Adp.TestSupport` to `EtAlii.Adp.Tests`. `EtAlii.Adp.Diagram` now references eight core projects.

**What the scripts count wrongly now.** Two classifications of the scripts no longer hold after M0, and both are taken up by T270:

- `lines.py`, `methods.py` and `waits.py` count a project as test code only when its name ends in `.Tests`, so `EtAlii.Adp.TestSupport` (428 → 1,227 lines) and `EtAlii.Adp.TestSupport.Host` (441 lines) are counted as production code. Moving a helper out of a test project into them therefore shows as test code removed and production code added. Counted as test code, the test code is 3,280 lines smaller than the baseline, not 4,520. The three new production waits are all theirs (`Eventually.cs:67`, `TestFolder.cs:135`, `StreamProbe.cs:62`), and so is the 97-line `DrawnConnections.ProblemsAsync` among the twenty longest methods. SC-005, SC-010 and SC-023 read these figures.
- `graph.py` reads `.csproj` files only, so the reference that `Directory.Build.targets` gives every test project is not an edge of the graph.

## Exit condition and success criteria

The exit condition of M0 (plan.md): SC-001, SC-002, SC-003 and SC-014; D5 and D6 closed; D2 and D9 settled; pull request 167 merged. Its review also asks whether the suite is stable enough to judge a refactoring, whether the contract tests of M1 can sit in the light testing project, and whether anything in the baseline contradicts the report's counts.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| SC-001, no fixed wait for a stream to become live, and the constant gone | Met | 0 of 25; `StreamStartupGrace` declared nowhere | Standalone pull request 178 (T019, T020, T025). All 25 sites were context watches, or followed a hierarchy probe already. A context watch provokes itself: `ContextService.RunWatchAsync` queues the baseline before the stream is written, so the first message read means the watch is live (`StreamProbe.WaitUntilContextLiveAsync`). The unnamed 500 ms before a context watch in `KnowledgeDesigner.Tests.cs` went too. `waits.py` cannot tell a wait before a stream read from other waits; the 5 waits left under `Integration Tests/` were read one by one: three assert that nothing arrives within a window (`ContextSelectionFlow` 2, `ExplorerContextActionsFlow` 1), one is the poll of `UndoRedoFlow`'s private `WaitUntilAsync`, and one is the patience race of `UpdateViewWhileTheStreamIsOpen`; none waits for a stream to become live |
| SC-002, twenty consecutive runs give twenty identical results | Met | 20 of 20 green at `d5278a3c6` | The Stability workflow (T026, pull requests 175 and 185), run `38271866183` on `develop` `d5278a3c6`, 2026-10-12 15:39 to 15:52 UTC: every run's `Backend tests` step succeeded, which is the runner's own exit code captured before any other command. The job logs could not be fetched from this session, so the test counts per run are not quoted here. The runs before it are in the next table |
| SC-003, one sign-in, one add-project and one channel helper; one wait-until helper | Met for the three flow helpers; the wait-until helper is due at M3 | `SignInAsync`, `AddProjectAsync` (`FlowExtensions`), `HostFixture.CreateChannel`, `FlowSession.CreateMessageTimeout`: one each, no private copy in a test class; 7 private polling helpers left beside the one `Eventually` | Standalone pull requests 178, 184 and 186. The specification said "from M0" for all four parts, while T149, which deletes the private polling helpers, is an M3 task and the coverage table measures SC-003 at M0 and at M3. **Amended** in the specification by this review: the wait-until helper from M3. Four module flows keep a private `BaselineAsync` of their own shape (ansible-structure, azure-devops-pipeline, c4, helm-chart); SC-003 does not name it, and those flows move to their modules in M8 (T251, T252) |
| SC-014, one implementation decides containment, exercised on Linux and on Windows | Met on Linux; not yet seen on Windows | `PathContainment.IsInside`/`IsAtOrInside` in `EtAlii.Adp`, used by the seven places of the report and by five more | Standalone pull request 180 (T035 to T037), guards seen to fail first for case and for an escaping link. The Build and Stability workflows run on `ubuntu-latest` only, and no record shows the guards run on Windows; there, `CreateLinkOrSkip` skips the two link guards when the process may not create a symbolic link. T267 runs them on Windows |
| D5 closed | Met | | Standalone pull request 176 (T034). `ContextServiceWatchReleaseTests`, a throwing and a cancelled project-actions discovery, each failed against the uncorrected code with zero releases. The leak was in the discovery after the retain, not in the root-actions discovery before it. FR-023's "problem watch" holds trivially: `ProjectWatched` is called after the discovery and retains nothing to release (problem tracking lives as long as the process, by design). See B-13 for a side effect |
| D6 closed | Met on Linux | | As SC-014 |
| D2 settled | Met: a defect, corrected | | T032, by this thread in the running application, headless, on `develop` `019dc30cc`, 2026-10-12, by the maintainer's choice of that day: in an agent-behavior-modelling diagram Alt+Up (Move earlier) and Alt+Down (Move later) did nothing on the canvas (the file's hash unchanged, only `ContextService/Select` posted), while the same actions ran from the context menu; F2 and the mindmap's Insert worked as controls. The mindmap sends no shortcut with a modifier (Insert, Enter, F2, Delete, Space), so it had nothing to fail. The cause had two layers: the client's `compileNotation` kept `"Alt+Up"` as the key with no Alt flag, and DISL's `Up` is not `KeyboardEvent.key`'s `ArrowUp`. The ribbon's tooltip, "Move earlier (Alt+Up)", hid it. T033 corrected it in standalone pull request 190: guards failed first (backend 2, client 2, tooltip 1), and in the running app both shortcuts now move the node and rewrite the file |
| D9 settled | Met: settled, corrected later | | T038 found FBL silent; the maintainer ruled B-09 on 2026-10-12 and FBL 0.6 §6.2 (spec 026, `etalii.adp` pull requests 130 and 132) now says an insert applies the binding's `empty` rule. The fixture pair is in standalone (pull request 188), with `InsertEmptyFixturesTests` recording today's difference. T216 corrects the code in M6, and B-12 (ruled 2026-10-12) gives it the layout of a new JSON entry too |
| Pull request 167 merged | Met | | Merged 2026-10-11 16:05 UTC. Its guards are on `develop`: D1 `CelOverflowTests` (`CelArithmetic.Tests.cs`), D3 `CelMatchesFailureTests` (`CelStrings.Tests.cs`), D7 `Quote_AValueStartingWithAnIndicator_ReadsBackAsWritten` (`LineSplice.Tests.cs`), D8 `CausalLoopQuotedTextTests`; its description records each failing against the uncorrected code (8 CEL, 14 YAML, 5 causal-loop). The mapping of guard to defect follows the description's order (T031) |

**The stability record (T026).** The first three runs found two faults, both corrected before the fourth:

| Run | Commit | Result | Failures |
|---|---|---|---|
| `38239091115`, 10:53 UTC | `develop` `c9dacca6e` | 15 of 20 | One `EtAlii.Adp.Backend.Tests` failure in each of runs 2, 11, 13, 15 and 19; the names were cut from the log, which is why pull request 185 prints them |
| `38249150838`, 12:27 UTC | `features/025-stability-names` (`af6989952` with pull request 185) | 17 of 20 | Runs 2 and 9: `ContextSelectionFlowTests.RenameOnDisk_PushesTheSelectionWithItsNewPathAndTheSameId` (an empty selection after a rename). Run 7: the client's `dragCost.test.tsx`, "per-frame cost is flat across model size", timed out |
| `38259631327`, 13:59 UTC | `develop` `fe4587037`, after pull request 187 | 19 of 20 | Run 2: `KnowledgeGroupsTests.TheViewListsItsGroups_HiddenOnesToo_AndOneOfThemIsShownAgainByItself(".xml")`, `KnowledgeGroups.Tests.cs:128`: after `showGroup` the headings started with a generated id where `o2` was expected. Knowledge designer code, outside this feature |
| `38271866183`, 15:39 UTC | `develop` `d5278a3c6`, after pull requests 189 and 190 | 20 of 20 | none |

Pull request 187 corrected the rename race: .NET's `FileSystemWatcher` on Linux reports a move as one `Renamed` only when inotify's two halves arrive within 2 ms, and otherwise as a `Deleted` and a later `Created`, which cleared the selection and gave the file a new id. `SplitMoveJoiner` now joins them (its known limit: a real delete followed within 250 ms by an unrelated create, with nothing between, reads as a rename). Pull request 189 gave the drag-cost test its own deadline, after reproducing the timeout under load. The knowledge designer's failure did not recur in the last twenty runs, and is passed on below.

**The review's three questions.**

- *Is the suite stable enough to judge a refactoring?* Yes, at `d5278a3c6`: twenty of twenty, with the two faults the runs found corrected and guarded. One failure outside this feature (the knowledge designer's) was seen once in sixty runs; T271 keeps the count running while the code moves.
- *Can the contract tests of M1 sit in the light testing project?* Yes. `EtAlii.Adp.TestSupport` reaches every `*.Tests` project, module test projects included, and starts no host: it references core projects and Serilog, not the service project, `Microsoft.AspNetCore.Mvc.Testing` or a gRPC client. It references no xUnit package yet, because it holds no test; T043, which adds the first abstract contract, adds that reference and records it in `docs/dependencies.md`.
- *Does anything in the baseline contradict the report's counts?* No figure contradicts what the report concluded. The differences over 5% are explained under T008 below, and the success criteria were restated against the baseline in [baseline.md](baseline.md).

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| Merge the two testing projects into one | No | Only `EtAlii.Adp.Backend.Tests` references `EtAlii.Adp.TestSupport.Host`; the other 40 test projects reach `EtAlii.Adp.TestSupport` alone, which references neither the service project nor `Microsoft.AspNetCore.Mvc.Testing` nor a gRPC client. The split buys exactly what research R6 wanted. M8 re-reads it when the module flows move into module test projects (T251, T252), which will then reference the host project | none |
| A server-sent "subscribed" message in place of probing | No | No stream lacked something harmless to provoke: hierarchy watches use the probe, and a context watch provokes itself by writing its baseline first (T020). A wire change would buy nothing the probe does not | none |
| Move the module flows out of the core test project now rather than in M8 | No | The flows already sit on the shared harness (pull request 184), so M1 loses nothing by leaving them; they test the gRPC surface, which M1 and M2 do not change; moving them now would touch the module test projects that M1 and M2 rework for the contract tests a second time. T251 and T252 stand in M8 | none |
| Run the suite twenty times as a scheduled workflow | Do now | Two of the three faults the record found were invisible on a single run (about one run in ten, and one in sixty). The repository is public, so the runner minutes cost nothing; a nightly run at an hour without pull requests keeps SC-002 true while M1 to M8 move code | T271 |

## New candidates

**From the clone scan.** Every production family of the twenty largest is covered by a remaining task: the resolver families by T051 to T054 and the band B tasks of M2, the session families by T050 and band B, `AnsibleWatchedFolder`/`HelmWatchedFolder` by the watched-folder tasks of M2, `DependencyGraphContextActionProvider`/`TimelineContextActionProvider` and the three `*Edits` by band C, `C4Document`/`WardleyDocument` by T127 and T128, `SankeyWriter`/`SupplyChainWriter` by T138, the 40 stub `Diagram.cs` by the ruling on DP-1 (c). `SankeyLayout`/`SupplyChainLayout` (30 windows) is answered **no** for now: T123 moves supply-chain's layering and T124 reads sankey's columns onto the layout library, and the M3 review sees what is left of the pair. In the test code the largest families are the timeline and dependency-graph pairs (document, writer, parser, resolver tests), which the M2 candidate on a shared model base for the two covers, and the transcripts, which T245 and T246 cover. `BundledDefinition.Tests` in seven modules (12 windows) is answered **no** for now: the seven test the definition that T150 and T151 make one type, and the M3 review is where a contract for it can be judged; it is added to that review's candidates in [../contracts/milestone-review.md](../contracts/milestone-review.md).

**From the method-length count.** Nothing new: the four methods that crossed 50 lines are explained under *Measurements*, and the twenty longest are those FR-086 to FR-092 name or the knowledge designer's.

**What M0 made cheap.** Moving a module's flows into its own test project (T251, T252) is now a file move, because every flow stands on `HostFixture` and `FlowSession`. A contract test has a home every test project already references. Measuring is one command. `SplitMoveJoiner` (pull request 187) is the normalisation that T147's `ProjectFileEvents` needs on Linux, and should move into it rather than be repeated beside it; it is added to the M3 review's candidates beside the one on a watcher per project root.

**What M0 made pointless.** T021 (no fixed wait preceded a diagram stream; see below). The candidate of a server-sent subscription message. And part of M8: pull request 186, the maintainer's own request outside this feature, moved the parity transcripts' `TranscriptText` into `EtAlii.Adp.TestSupport` once (T245), put 44 test files on `RepositoryPaths` (T250), and moved the sign-in, add-project and stream-reading helpers into the host project.

**Findings the next milestones must know.**

| Finding | Becomes |
|---|---|
| timeline, dependency-graph, gartner-hype-cycle-graph and agent-activity-diagram build their context shortcut from `key.Key`, not `DerivedShortcut.EventKey`, so a DISL `Space`, arrow or `Esc` would reach the host as `Space`, `Up` or `Esc`, which no `KeyboardEvent.key` is. No shortcut of theirs is such a key today: their definitions use `Delete`, `Enter`, `F2` and `Tab` only, which both forms spell alike (pull request 190's description names a Space of timeline and gartner-hype-cycle-graph; their definitions at `d5278a3c6` have none) | No task now: nothing fails today, and T151 already sends shortcuts one way for all seven modules with a bundled definition in M3. A definition that adds such a key before then must use `EventKey` |
| azure-devops-pipeline hard-codes `ContextShortcutDefinition("Alt+Up")` and `("Alt+Down")` for Move up and Move down (`PipelineContextActionProvider.cs:316` and `:322`): the shape of D2, in a module with no bundled definition, not run | T268 checks it in the running app as T032 did; T269 corrects it, guard first, if it fails (FR-021 named only agent-behavior-modelling and mindmap, and this is the same defect) |
| The client's `backendKey` and `contextShortcutOf` cannot carry modifiers | No: no module needs it today, and DISL gives an entry one shortcut. Reopened if a module needs a modified key sent to its backend |
| The mindmap's shortcuts are checked by tests only | No: it sends no shortcut with a modifier, and pull request 190 left its Space unchanged |
| The knowledge designer's `KnowledgeGroups.Tests.cs:128` failed once in sixty runs | Left to the owner of the knowledge designer's specification in `etalii.adp.ide.standalone` (`knowledge-designer`), through the maintainer: it is outside this feature's code. T271's nightly runs will show whether it recurs |
| T034's side effect: a client that cancels during the project-actions discovery now ends the call through the existing "closed by the client" path instead of an exception leaving the method | Entered as B-13 in the register, asked below |
| T028's catch: `timeline.md` and `dependency-graph.md` in each module's `definition/` are byte copies of `etalii.adp/definitions/diagrams/*.md`, and named the rule sets T028 deleted. They were corrected in `etalii.adp` first (pull request 123, `eeddde3`) and re-bundled by standalone pull request 181 | A rule in [../contracts/pull-request.md](../contracts/pull-request.md): a task that deletes or renames a file a bundled definition's text names corrects that text in `etalii.adp` first. M2, M3 (T150, T151) and M7 delete such files |
| The timeline conversion's design and tasks (`timeline-disl-fbl`) were approved on 2026-10-12, and `fbl-written-text`'s requirements, design and tasks too | Nothing now: by DP-2 (a) the conversions' implementation follows the M2 review. The M1 review reads whether either has started (FR-012) |

## Tasks added, reduced and struck

**Ticked** (merged, FR-014): T008, T010 and T041 (this record), T026 (standalone pull requests 175 and 185, and the record above), T032 (run in the running app by this thread, recorded above), T033 (standalone pull request 190), T040 ([M0-measurements.json](M0-measurements.json)), T042 (this pull request). The other M0 tasks were ticked as their pull requests merged.

**Struck**: T021. No fixed wait preceded a diagram stream: the six waits of `DiagramElementActionFlow.Tests.cs` stood before context watches and went with T020 in standalone pull request 178.

**Added**:

- T267: run the containment guards on Windows (SC-014).
- T268: a Tester checks azure-devops-pipeline's Alt+Up and Alt+Down in the running application (FR-021).
- T269: if T268 finds them not working, guard first, then send the key as `KeyboardEvent.key` spells it with the Alt flag (FR-021, FR-005).
- T270: the measurement scripts count the two testing projects as test code and read `Directory.Build.targets`; the baseline and M0 are measured again (FR-009).
- T271: the Stability workflow also runs nightly (SC-002).

**Also changed by this review**: SC-003 in the specification (above), the M3 candidates of [../contracts/milestone-review.md](../contracts/milestone-review.md) (two rows), [../contracts/pull-request.md](../contracts/pull-request.md) (the bundled definition's text), and B-13 in [../behaviour-changes.md](../behaviour-changes.md).

**Reduced**: T245, to the harness and the module adapter: `TranscriptText` is one writer in `EtAlii.Adp.TestSupport` since standalone pull request 186. T250, to the copies of the repository-root locator that are left: 44 test files use `RepositoryPaths` since pull request 186; the M8 review counts the rest.

**Tasks under FR-012 (T010).** The state of the conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `d5278a3c6`:

| Specification | State |
|---|---|
| `ansible-structure-disl-fbl`, `azure-devops-pipeline-disl-fbl`, `c4-disl-fbl`, `causal-loop-disl-fbl`, `databricks-disl-fbl`, `dependency-graph-disl-fbl`, `dotnet-dependency-graph-disl-fbl`, `functional-decomposition-graph-disl-fbl`, `helm-chart-disl-fbl`, `rdf-disl-fbl`, `sankey-disl-fbl`, `sparql-disl-fbl`, `supply-chain-disl-fbl`, `wardley-map-disl-fbl` | Requirements, design and tasks written (9 to 18 tasks each); no approval record; no task done; no implementation log |
| `timeline-disl-fbl` | Design and tasks approved on 2026-10-12 (7 tasks); no task done; no implementation log |
| `fbl-implementation` | 17 of 17 tasks done (standalone pull request 112) |
| `fbl-written-text` | Requirements, design and tasks approved on 2026-10-12 (7 tasks); no task done |

No conversion has started, so every task under FR-012 **stands**. Per module, the tasks that read its conversion first:

| Module | Tasks under FR-012 |
|---|---|
| sankey | T058, T138 |
| supply-chain | T059, T138 |
| functional-decomposition-graph | T060 |
| timeline | T075, T225 |
| dependency-graph | T078, T225 |
| databricks | T084, T140 |
| causal-loop-diagram | T087, T129, T137, T140 |
| azure-devops-pipeline | T090, T134, T140 |
| c4 | T093, T128, T136, T239 |
| wardley-map | T096, T127, T137, T140, T236, T237 |
| sparql | T099, T140, T238 |
| ansible-structure, helm-chart | T107 and T109, T134, T140 |
| dotnet-dependency-graph | T111, T134 |
| rdf | T140, T231, T232 |
| gartner-hype-cycle-graph, agent-behavior-modelling, agent-activity-diagram, mindmap | T061, T069, T072, T081: these modules have no conversion specification (they read their bundled definition already), so FR-012 leaves their providers standing |
| every module | T010 (done), T207, and the review tasks |

**T008: the scripts against the report.** `measure.sh` on the report's commit `fcb64c9` gives:

| Figure | Report | Scripts at `fcb64c9` | Difference | Explanation |
|---|---|---|---|---|
| Lines, all | 246,000 | 259,884 | +5.6% | The core figure below; the report says its counts are ±5% |
| Files, all | 2,133 | 2,130 | −0.1% | |
| Production, tool modules | 92,000 | 91,949 | 0% | Every module's figure matches the report's |
| Production, core and specification projects | 29,000 | 37,341 | +29% | 37,341 less `EtAlii.Adp.Specification.Fbl`'s 8,135 is 29,206: the report most likely left that project out (inferred; its method does not say) |
| Production code lines | 82,700 | 82,985 | +0.3% | |
| Test | 125,000 | 130,594 | +4.5% | Within the report's margin |
| Projects | 129 | 129 | 0 | |
| Methods over 50 / over 80 code lines | 145 / 40 | 175 / 46 | +21% / +15% | The scripts count local functions, constructors and accessors with a block body as methods; the report seems not to have (inferred: its ten longest match within one line, `WardleyParser.Parse` 160 against 159, `KnowledgeValidator.Validate` 140 against 139) |
| Waits in test code | 84 | 84 | 0 | Production code has 7, which the report did not count |
| Polling helpers | 13 | 16 | +23% | The scripts also count the two `ReadUntilAsync` and `HierarchyWatchProbe.WaitUntilLiveAsync` |
| Shared windows: resolver, session factory, property provider, document store, action provider | 1,911, 326, 134, 115, 99 | 291, 54, 39, 98, 80 | −85% to −15% | Not reproducible: the report's normalisation is not written down and its raw pairs were not kept (its *Method*). The scripts' figures are the baseline, and [baseline.md](baseline.md) states SC-008 as the same proportion of them, weighed by the trend as well at M2 |

## Behaviour changes

Ruled since the work started, all on 2026-10-12 by the maintainer, option (a) each: B-01 (`"0.####"` everywhere), B-02 (reject `\r` in a short string in both languages), B-04 (keep Wardley's rule as its policy), B-05 (core's line ending wins for the three line documents), B-06 (one `IsTransient`), B-09 (FBL is amended, and FBL 0.6 §6.2 settles it, spec 026), and B-12 (T216 writes a new JSON entry in the layout of the entries beside it).

Still open: B-07 and B-08, needed by M4 (T178) and M6; M1 needs no open row. Added by this review: **B-13**, T034's side effect, asked below.

Corrected defects not in the register, because a correction is not a join: the Linux rename race (standalone pull request 187), found by T026, with its guard and its known limit stated above.

## Follow-up features

None. Every finding of M0 serves a requirement of this feature or belongs to another specification's owner.

## Questions for the maintainer

**1. When does M1's first task start?** The exit condition lacks only SC-014's Windows half (T267); T268 and T269 concern a defect of D2's shape in azure-devops-pipeline.

- (a) **After T267, T268 and T269 are merged**, T270 before the M1 review, T271 at any time. *Recommended*: M1 moves code that only a trusted suite and closed defects vouch for, and the three are small; T270 matters only when M1 is measured.
- (b) After T267 only; T268 and T269 at any point before the M1 review. Starts M1 sooner; a probable shortcut defect stays open meanwhile.
- (c) Now, with all five recorded at the M1 review. Fastest; SC-014 stays unproven on Windows through M1, which changes no containment code.
- (d) Other.

*Ruled (chat, 2026-10-12): (a), after T267, T268 and T269.*

**2. How is SC-014 shown on Windows (T267)?**

- (a) **A `windows-latest` job in standalone's Build workflow that runs the containment guards only** and fails when one of them is skipped. *Recommended*: SC-014 holds "from M0", so it should be checked while M4 wraps containment in typed paths, and the hosted Windows runner may create symbolic links, so the link guards run; on a public repository the minutes cost nothing.
- (b) The maintainer runs the containment guards once on his Windows machine and the result is recorded here. One command; it proves today only, and the link guards skip unless the machine is in developer mode.
- (c) Other.

*Ruled (chat, 2026-10-12): (b), the maintainer runs the containment guards once on his Windows machine, in developer mode so the link guards run; the M1 review records the result.*

**3. B-13: a client cancelling during the project-actions discovery.** Since T034 (standalone pull request 176) the call ends through the `catch` for a client that closed the stream, as a cancellation while streaming always did, instead of the cancellation leaving the method. The client cancelled, so it sees a cancelled call either way; the host logs "closed by the client" at Debug instead of the cancellation.

- (a) **Record it as not a change** for any user, and keep it. *Recommended*: the client cannot tell the two apart, and a cancellation now ends the same way wherever it lands.
- (b) Restore the old path for the discovery: the cancellation leaves the method again, the release still runs. Costs a second `catch` that exists only to keep a difference nobody sees.
- (c) Other.

**4. Should the two testing projects count as test code in the measurements (T270)?**

- (a) **Yes: T270 changes `lines.py`, `methods.py` and `waits.py` to count `EtAlii.Adp.TestSupport` and `EtAlii.Adp.TestSupport.Host` as test code, makes `graph.py` read `Directory.Build.targets`, and measures the baseline and M0 again**, with [baseline.md](baseline.md) restated where a figure moves. *Recommended*: otherwise every helper M1 and M8 move into them reads as test code removed and production code added, SC-005 is met on paper, and a `Thread.Sleep` in a test helper fails SC-010.
- (b) No: the scripts stay, and the M9 review adds the two projects to the test figures by hand. No work now; every review in between reads figures that need a footnote.
- (c) Other.

*Ruled (chat, 2026-10-12): (a).*

**5. How often does the Stability workflow run by itself (T271)?**

- (a) **Nightly**, at an hour no pull request runs. *Recommended*: a flake shows within a day of the merge that brought it, while the merge is still easy to find; the minutes are free on a public repository.
- (b) Weekly. Fewer runs to read; a flake can hide behind a week of merges.
- (c) Only by hand, at each review. As today; nothing watches SC-002 between reviews.
- (d) Other.

*Ruled (chat, 2026-10-12): (a), nightly.*

## Ownership

M0 was owned by one developer, signing as `agent-1-<task>` (FR-006), with the maintainer's rulings on 2026-10-11 and 2026-10-12. M1 is owned by the same developer unless the maintainer hands it over with this review.
