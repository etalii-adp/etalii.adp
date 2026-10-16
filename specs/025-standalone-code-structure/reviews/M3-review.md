# M3 review: shared utilities

**Measured at**: `etalii.adp.ide.standalone` `d162f0dd1`, the merge of pull request 374, 2026-10-16 | **Previous record**: [M2-review.md](M2-review.md), [M2-measurements.json](M2-measurements.json) at `20d43776d` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M3 put the utilities the report found copied into core, each once: the layout library (`Rect`, the viewport test, `Layering.LongestPath` with a named `CyclePolicy`, `GridPacker`, `OverlapResolver`), the line document and its index, the terminal scanner, YAML access, `DslNumber`, the line lexer and quoter, `ParseOutcome`, the clock with `Debouncer` and `RetainedRegistry`, `WatchedFile`, `WatchedFolder` and `ProjectFileEvents`, one text-editor session, and `DislDiagramDefinition`. The clone scan's shared production windows fell from 690 to 387, the three editor-session families (145 windows) are gone, and real-time waits in tests fell from 55 to 5. Diagram production code is 1,753 lines and 20 files smaller than at M2. What did not fit: SC-010's "no `Thread.Sleep` in production" and "one read-retry", because the store base's `DocumentLifecycle` still retries synchronously, and SC-003's "one wait-until helper", because `StreamProbe` keeps its own loop. Both are asked below. Two copies arrived beside M3 and are now the largest production family: `GhgBody` and `TimelineBody` (52 windows). The nightly stability runs failed on three intermittent tests. The review adds T279 to T285, widens T157 and T236, reduces T225 and T235, and strikes nothing.

## Measurements

The previous record is M2 at `20d43776d`. Between the two, 55 pull requests of this feature merged (T277, the last addition to M2, and M3's 54, standalone pull requests 297 to 374). So did 25 others: `ansible-structure-disl-fbl` (eight pull requests, with `ansible-bundle` and `ansible-structure-client`), the last three tasks of `timeline-disl-fbl`, tasks 1 to 8 of `helm-chart-disl-fbl`, and `baseline-refusal`, `empty-baseline` and `fbl-yaml-unclosed-flow`. By the C# lines of each merge's own diff, the feature's 55 changed production code by −850 lines and test code by +2,230. The others changed production by +1,733 and test by +5,565, of which `ansible-structure-disl-fbl` is +748 and +3,115. Those figures are named where they move a total.

| Figure | M2 (`20d43776d`) | Now (`d162f0dd1`) | Target |
|---|---|---|---|
| Projects | 136 | 138 (`EtAlii.Adp.Layout` and its tests) | about 134 at the end (plan) |
| Files, all | 2,271 | 2,335 | |
| Lines, all | 267,942 | 276,620 (+528 production, +8,150 test) | |
| Lines, core production (18 projects) | 41,139 | 44,418 (+3,279; `EtAlii.Adp.Documents` +1,526, `EtAlii.Adp.Layout` +658, `EtAlii.Adp` +350, `EtAlii.Adp.Diagram` +349, `EtAlii.Adp.Editor` +145, `EtAlii.Adp.Hierarchy` −235 from M3; `EtAlii.Adp.Specification.Fbl` +422 and `.Disl` +158, from the conversions' folder body and DISL locations and from `BundledBinding`, T278) | |
| Lines, core test (22 projects) | 50,913 | 55,099 (+4,186; `EtAlii.Adp.Documents.Tests` +1,218, `EtAlii.Adp.Layout.Tests` +571, `EtAlii.Adp.Editor.Tests` +401, `EtAlii.Adp.Tests` +378 from M3; the specification tests +989, mostly from the conversions) | |
| Lines, diagram production | 76,357 | 74,604 (−1,753) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 875 | 855 (−20) | SC-006, met at M2: at most 881 |
| Lines, diagram test | 81,696 | 87,023 (+5,327; ansible-structure +3,048, helm-chart +931 and timeline +851, from the conversions) | |
| Lines, editor production / test | 2,936 / 4,006 | 1,997 / 2,652 (−939 / −1,354, T144, T145, T272) | |
| Lines, production | 126,028 | 126,556 (+528) | |
| Lines, test | 141,914 | 150,064 (+8,150) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 690 / 223 | 387 / 184 | |
| Context-source-resolver windows | 30 | 30 | SC-008, met at M2: fewer than 200 |
| Session windows | 31 | 31 | |
| Property-provider windows | 10 | 7 | SC-008, met at M2: fewer than 50 |
| Document-store windows | 20 | 3 or fewer (below the scan's fortieth row) | SC-008, met at M2: fewer than 50 |
| Action-provider windows | 22 | 22 | SC-008, met at M2: fewer than 50 |
| Editor-session windows | 145 | 0 | |
| Tokenizer / Layout / Document windows | 27 / 30 / 29 | 6 / 0 / 0 | |
| Validator / Writer / Parser windows | 37 / 31 / 62 | 12 / 22 / 58 | |
| Body windows | 20 | 57 (`GhgBody`/`TimelineBody`, below) | |
| Clone scan, test: shared windows / files | 1,847 / 286 | 1,564 / 283 | |
| Methods over 50 code lines | 163 | 162 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 36 | 36 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 323 | 330 | |
| `PackageReference` edges | 244 | 244 | |
| `InternalsVisibleTo` edges | 44 | 41 | |
| Projects without a `.cs` file | 1 (`EtAlii.Adp.Sessions`) | 1 | SC-013: none at M5 |
| Core references naming a tool module | 9 | 9 (all from test projects) | SC-013: none at M5 |
| `Task.Delay` and `Thread.Sleep`, test code | 55 | 5 | SC-004 |
| `Task.Delay` and `Thread.Sleep`, production code | 10 | 5 | SC-010: no `Thread.Sleep` at M3 |
| Polling helpers | 11 | 3 (all in `StreamProbe`) | SC-003: one at M3 |

**The modules, before and after.** Production lines per module that moved by more than 50:

| Module | M2 | Now | Change |
|---|---|---|---|
| rdf | 11,800 | 11,314 | −486 (T125, T130, T131, T140) |
| c4 | 5,514 | 5,239 | −275 (T118, T128, T136) |
| causal-loop-diagram | 4,341 | 4,102 | −239 (T119, T126, T151, T278) |
| editors, five together | 2,936 | 1,997 | −939 (T144, T145, T272) |
| sparql | 4,138 | 3,946 | −192 (T119, T132, T140) |
| gartner-hype-cycle-graph | 4,029 | 3,856 | −173 (T119, T139, T151, T278) |
| agent-behavior-modelling | 3,191 | 3,070 | −121 (T151, T278) |
| wardley-map | 5,702 | 5,582 | −120 (T127, T135, T137; T140 +87) |
| databricks | 4,161 | 4,041 | −120 (T122, T133) |
| supply-chain | 3,001 | 2,885 | −116 (T119, T123, T134, T138) |
| sankey | 2,662 | 2,547 | −115 (T119, T124, T134, T138) |
| dotnet-dependency-graph | 2,236 | 2,145 | −91 |
| dependency-graph | 2,424 | 2,335 | −89 |
| mindmap | 3,171 | 3,104 | −67 |
| designer/knowledge | 5,596 | 5,537 | −59 (T145) |
| ansible-structure | 2,904 | 3,475 | +571 (its conversion; T122 and T149 −51) |

**Clone families.** The editor sessions, M2's three largest families (67, 60 and 18 windows), are gone; so are `C4Document`/`WardleyDocument` (29), `SankeyLayout`/`SupplyChainLayout` (30) and `RdfTokenizer`/`SparqlTokenizer` (27). The largest production family is now new: `GhgBody`/`TimelineBody`, 52 windows (below). After it come the sibling pairs left to their conversions, `SankeyParser`/`SupplyChainParser` (28), `SankeyWriter`/`SupplyChainWriter` (22), the YAML parsers of fdg, sankey and supply chain (13 and 12), the timeline and dependency-graph session, registration, resolver and action provider (14, 12, 9 and 8), `SankeyContextActionProvider`/`SupplyChainContextActionProvider` (12) and `SankeyValidator`/`SupplyChainValidator` (9). Then `RdfProjection`/`SkosProjection` (9, T231 and T232) and the registration-header readers of c4, databricks and rdf (5, T173). The 47 stub modules' `Diagram.cs` fill the other rows, as at M2. In the test code the transcripts (221 windows) lead as before; the editor-session test families (114, 65 and 38 windows) are gone, and `BundledDefinition.Tests` has grown from 29 to 30 windows over 476 file pairs.

**Long methods.** Eighteen of M2's twenty longest are still there, nearly unchanged. Two left the list: `WardleyParser.Parse` (160) and `SkosLayout.Layout` (116, T124). `WardleyParser.Outcome` replaced `Parse` at 220 code lines, because T140 made every line the parser passes over a problem; the dotnet `DependencyGraph.Derive` (93) entered at the bottom. The over-50 count fell by one and the over-80 count is unchanged: M3 joined copies spread across classes and did not touch the long methods, which are M7's.

**Project graph.** Seven project references were added and none removed. `EtAlii.Adp.Diagram` now references `EtAlii.Adp.Layout` (T118, for `DiagramViewport.Intersects(Rect)`) and `EtAlii.Adp.Specification.Disl` (T150, for `DislDiagramDefinition`). The test project has two, and ansible-structure and helm-chart gained `Specification.Disl` and `.Fbl` through their conversions. Four `InternalsVisibleTo` edges went with the editor modules' sessions (T144) and one came, `EtAlii.Adp.Editor` to its tests. `EtAlii.Adp.TestSupport` took `Microsoft.Extensions.TimeProvider.Testing` (T141), and the four editor modules dropped Serilog.

## Exit condition and success criteria

The exit condition of M3 (plan.md, the specification's milestone table): one implementation of each utility the report found copied (FR-041 to FR-053). SC-004, SC-010 and SC-011 are due at the end of M3, and SC-003's wait-until helper from M3 on.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| One implementation of each utility (FR-041) | Met for eleven of the twelve; the read-retry has two | below | Searched in `src/` at `d162f0dd1` for each utility's declarations. FR-042: one line document, `LineDocument` (wardley-map and c4 moved; causal-loop's went with its conversion). FR-043: `LineIndex`; the UTF-8 byte search in `TimelineBody` and `GhgBody` T130 left for this review is T279. FR-044: `TerminalScanner`, `RdfEscapes`, `NumericLiteral`. FR-045: `Rect`, `DiagramViewport.Intersects`, `Layering`, `GridPacker`, `OverlapResolver`; `OrderByBarycentre` struck by T126 with its reason. FR-046: `YamlAccess`; pipeline keeps a `Scalar` that reads through merge keys, with the reason on the method, and `HelmChartReader`'s three are left to `helm-chart-disl-fbl`. FR-047: `DslNumber`; sankey's `#,0.##` is a display format, and ghg's two formats (a note size and an influence position), which the report did not count among the ten, are left as they are. FR-048: `LineLexer`, `QuotedString`, `LineSplice.QuoteText`. FR-049: `ParseOutcome` in every module but helm-chart (its conversion) and the three converted modules. FR-050: `WatchedFile`, `WatchedFolder` (the one place the tree makes a watcher in core), `ProjectFileEvents`, `AdpFileWriter.IsTransient`; `AnsibleFolder` and the per-file watchers of `WatchedFile` are T280. FR-051: `Debouncer`, `RetainedRegistry`, the clock injected. FR-052: `DislDiagramDefinition` and `DislToolboxProvider`, `BundledBinding` and `TextMemo` (T278). FR-053: `TextEditorSession`. **The read-retry**: `WatchedFile.ReadAsync` and `DocumentLifecycle.TryRead`, question 1 |
| SC-003: one wait-until helper (13) | Not met as written | 3 polling helpers, all in `StreamProbe` | `waits.py` counts `WaitUntilLiveAsync`, `WaitUntilHierarchyLiveAsync` and `WaitUntilContextLiveAsync`. They are three entries into one private loop of the M0 host harness, which provokes the stream again on every round rather than polling a condition (SC-001), so `Eventually` cannot take its place without a second shape. Every other helper is gone (T149). Question 4 |
| SC-004: no test waits in real time for a debounce, an idle eviction or a retry | Met, with one exception that belongs to SC-010 | 5 test waits | The five are `Eventually`'s and `FakeClocks`' own delays, `StreamProbe`'s probe interval, `TestFolder`'s cleanup retry (the test's own clean-up, not production's retry), and c4's 5 ms spacing between saves (it paces the stimulus). The debouncers, the retained registries, the folder stores' settle delay, `HierarchyService`'s polls and `ProjectValidator`'s timeout run on an injected clock that their tests advance (T142, T143, T149). The exception is the store base's read-retry: a test of a refused read waits up to 4 × 50 ms of `DocumentLifecycle`'s real sleep. It goes with SC-010 (question 1). The host's flow tests run on the system clock, so a flow that loses a project root waits for `HierarchyService`'s 2 s presence poll; a presence poll is none of the three things SC-004 names, and the M8 review reads it with the flows (T251) |
| SC-010: one line document, one rectangle, one viewport test, one number format, one YAML scalar accessor, one read-retry, no `Thread.Sleep` in production | Not met: the read-retry and the sleep | line document 1, rectangle 1, viewport test 1, number format 1, YAML scalar accessor 1 (two kept with their reason, three left to a conversion), read-retry 2, `Thread.Sleep` 1 | `DocumentLifecycle.TryRead` in `EtAlii.Adp.Documents` sleeps between its five attempts (50 ms) because `GetOrLoad` and `Reload` are synchronous. 74 calls in 40 production files reach them. Question 1, with T283 recommended |
| SC-011: each tool's fixtures lay out as before; the layering of every tool names its cycle policy | Met for M3's part | 8 layouts on `Layering.LongestPath` | Pipeline and dotnet under `BackEdgeIsZero`, databricks under `BackEdgeIgnored`, ansible under `BackEdgeIsZeroPerNode`, supply chain, sankey and SKOS under `Kahn`, OWL over its strongly connected components; each pull request kept its module's layout fixtures byte for byte. `C4Layout.Rank` is the one layering left, T239 in M7, where SC-011 is measured again. Helm's layout ranks by kind and is no layering |

**The stability runs.** SC-002 is due at M0 and M9; the runs since the M2 review are read here as T275 asks. The nightly schedule ran twice and failed both times, each on intermittent tests unrelated to the run's changes: on 2026-10-15 (`684f344fd`) 19 of 20 runs were green, `JsonEditorPanel`'s colour test finding no highlighted property name. On 2026-10-16 (`b6f172cc5`) 18 of 20 were green: `XmlEditorPanel`'s colour test failed the same way, and `KnowledgeEditingTests.WhatIsShownBeforeAWrite_IsWhatTheFileHoldsAfterIt(".json")` found the file and what was shown different after `toggleGroup`. The first two are the shape T276 corrected for the YAML editor, a test that reads colours before CodeMirror has parsed; they are T281. The knowledge designer's is T282. A run started by hand for this review on `develop` [run 38973200271](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/38973200271) (at `6a4ca9d23`, which adds two conversion pull requests after M3) is recorded in this pull request's description when it ends.

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| One cycle policy for all tools | No, as ruled on 2026-10-16 (question 3, (a)): each tool keeps its policy | Five rules are in use, not three: T122 found `BackEdgeIgnored` and `BackEdgeIsZeroPerNode` beside the pipeline's `BackEdgeIsZero`, T123 needed `Kahn`, and OWL condenses its cycles. [M3-cycle-policies.svg](M3-cycle-policies.svg) draws one cyclic graph under each. A cycle is a defect in three of the five sources: the pipeline and databricks validators report it as a problem, and a .NET solution with a cycle of project references does not build. Mostly a broken document's picture would change | none, unless question 3 says otherwise |
| One watcher per project root for every consumer, the editors and the knowledge designer included | Do now | `ProjectFileEvents` feeds the reload bridge, the hierarchy, the problems watcher, the folder stores and `DependencyGraphStore` (T147, T148). Outside it: every `WatchedFile` (the five text editors and the knowledge designer) makes its own `WatchedFolder` on its file's folder, and `AnsibleFolder`, from `ansible-structure-disl-fbl` (#355), makes its own recursive `FileSystemWatcher`, the only one outside `WatchedFolder` | T280 |
| Module layouts that are now a few calls into the layout library, expressed as data | No | After T118 to T126 each layout still holds its notation's placement: sizes, rows per kind, lanes, edge routing. The library took the generic part. Expressing what is left as data is a DISL arrangement, which each conversion writes for its own module (timeline's is in its definition, helm-chart's canvas is compiled from its definition in `helm-chart-disl-fbl`) (FR-012) | none |
| The findings of every module as one `ParseOutcome` flow into the problems project | No | `ParseOutcome` is one type in every module that parses (T139, T140). What is left per module is three to six lines in its validator that turn the outcome's problems into a `DiagramProblem` under the module's own rule id, one problem or all of them as each module has always reported. A shared mapping would take every one of those as a parameter | none |
| One contract test for the seven modules' `BundledDefinition.Tests` | Do now, in M8 | Ten files, 781 lines, 30 shared windows over 476 file pairs, testing the definition T150 and T151 made one type. It is a test consolidation, so it goes beside T245 rather than before M4 | T284 |
| `SplitMoveJoiner` of standalone pull request 187 inside `ProjectFileEvents` | Done | T147 put it there: `ProjectFileEvents` joins a split move for every consumer, and `SplitMoveJoiner.Tests` and the hierarchy's `SplitMove.Tests` guard it | none |
| `Rebuild` and `UnreadableOf` on `LifecycleDocumentStore` (T139's note, T140 left it to this review) | Do now for `Rebuild`; no for `UnreadableOf` | `Rebuild` is abstract, and its one caller is `Parse`'s default (`new(Rebuild(body), [])`). Four modules answer `Rebuild` alone (agent-activity-diagram, agent-behavior-modelling, c4, causal-loop-diagram), because their reading cannot fail. The nine that answer `Parse` must still write a `Rebuild` nobody calls, each repeating its `Parse` (`SankeyParser.Parse`, `RdfParser.Outcome(body).Model`, `Parse(body).Model`). With `Parse` as the one abstract hook, the four write `new(model, [])` and the nine lose a dead method. `UnreadableOf` stays: it is agent-activity-diagram's FBL body's own sentence for a usable model, which `Parse` does not carry | T285 |

## New candidates

**From the clone scan.**

- *`GhgBody`/`TimelineBody`* (52 windows, the largest family). `timeline-disl-fbl` wrote `TimelineBody` from `GhgBody`, and both now hold the same edit side of a spliced FBL body: `LinesOf` over the UTF-8 line starts, `Change`, `Batch` and `Combined`. The line search is the third one T130 named. **Do now**: T279, one type beside `BundledBinding` and `TextMemo`; every conversion still to come writes a body like these (FR-043, FR-052).
- *The sankey and supply-chain parsers, writers, action providers and validators* (28, 22, 12 and 9 windows), *the fdg, sankey and supply-chain YAML parsers* (13 and 12), *dependency-graph beside timeline* (14, 12, 9 and 8). **No**: T112 found these are notation or overrides of the bases; their conversions (`sankey-disl-fbl`, `supply-chain-disl-fbl`, `functional-decomposition-graph-disl-fbl`, `dependency-graph-disl-fbl`, none started) replace the parsers and writers (FR-012).
- *`RdfProjection`/`SkosProjection`* (9): T231 and T232. *The registration-header readers of c4, databricks and rdf* (5): `AdpRegistration` of T173 reads the headers.

**From the method-length count.** `WardleyParser.Outcome` (220) is the chain of `TryKeyword` tests T236 replaces; T236 is widened to name it. `DependencyGraph.Derive` (93) falls under T241's "whatever `methods.py` now puts in its twenty longest".

**From the project graph, for M4.** `EtAlii.Adp.Diagram` gained `EtAlii.Adp.Layout` and `EtAlii.Adp.Specification.Disl`, which T158 and SC-012 do not allow it. T157 already moves `DislDiagramDefinition` to `EtAlii.Adp.Diagram.Modules`; it is widened to take `DislToolboxProvider`, `RecentBodies` and `TextMemo` with it, and to make `Intersects(Rect)` an extension there, so that T158 holds as written.

**What M3 made cheap.** A layout that layers, packs a grid or separates overlapping boxes is now a call with a named policy. A line DSL has its line document, index, lexer, quoter, number format and parse outcome. Anything that waits takes a `TimeProvider`, and its test moves a fake clock instead of sleeping: 50 real-time waits left the tests. A new text editor is a variant of `TextEditorSession` of about 40 lines, and a module with a bundled DISL definition gets its toolbox, menus, rows and shortcuts from `DislDiagramDefinition`. A new FBL body loads its binding and memoizes its readings in one line each (T278), and after T279 it inherits its edit side too.

**What M3 made pointless.** Part of T235: `KnowledgeSession` already reads through `WatchedFile` (T145), so T235 keeps the `PendingEditQueue` and the `KnowledgeViewState`. Part of T225: the timeline conversion removed `TimelineDisl.cs`, so only dependency-graph's `DependencyGraphFindings` still builds `FblElement`s. Nothing else among the remaining tasks.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014): T118 to T151 and T278 were ticked in their own `etalii.adp` pull requests, the last two, T149 and T140, by #260 and #262. T152 ([M3-measurements.json](M3-measurements.json)), T153 and T154 (this pull request).

**Added**, all but T283 and T284 in M3 under *Added by the M3 review*, to be done before M4's first task:

- T279: one spliced-FBL-body type for `GhgBody` and `TimelineBody` (FR-043, FR-052).
- T280: `WatchedFile` inside a project root takes its events from `ProjectFileEvents`, and `AnsibleFolder` moves onto it once `ansible-structure-disl-fbl` has closed (FR-050, FR-012).
- T281: the JSON and XML editor panels' colour tests wait until CodeMirror has parsed, as T276 did for YAML (FR-005; SC-002).
- T282: the knowledge designer's intermittent `WhatIsShownBeforeAWrite_IsWhatTheFileHoldsAfterIt(".json")` after `toggleGroup` (FR-005; SC-002).
- T285: `Parse` is the store base's one abstract hook, and the nine `Rebuild` overrides nobody calls are deleted (FR-049).
- T283, in M5 beside the lifetimes: the store base's document reads become asynchronous and retry through `WatchedFile`'s policy on the injected clock (FR-050, FR-051; SC-010, SC-018). Recommended in question 1; moved or struck as the answer says.
- T284, in M8 beside T245: one contract test for the bundled-definition tests (FR-015, FR-052).

**Widened**: T157 also moves `DislToolboxProvider`, `RecentBodies` and `TextMemo`, and makes `Intersects(Rect)` an extension in `EtAlii.Adp.Diagram.Modules`. T236 names `WardleyParser.Outcome` (220 code lines) as the method it shortens.

**Reduced**: T225 to dependency-graph (`timeline-disl-fbl` closed; `DependencyGraphFindings` is what still builds `FblElement`s). T235 to the `PendingEditQueue` and the `KnowledgeViewState` (the `WatchedFile` part is T145's).

**Struck**: none.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `d162f0dd1`: `timeline-disl-fbl` done (7 of 7), `fbl-written-text` done (7 of 7), `causal-loop-disl-fbl` 10 of 11, `ansible-structure-disl-fbl` 11 of 12 (its close under way), `helm-chart-disl-fbl` 8 of 11 (task 9 under way); the other ten have no task done. So: T225 **reduced** (above). T231 and T232 (rdf, 0 of 18) **stand**, T236 and T237 (wardley-map, 0 of 13) **stand**, T238 (sparql, 0 of 11) **stands**, T239 (c4, 0 of 17) **stands**. T280's ansible part waits for its conversion's close, as written.

## Behaviour changes

Ruled since the M2 review, and applied: B-02 and B-17 to B-19 (T132, standalone pull request 346), B-01 and B-20 (T135), B-04 (T137), B-05 with B-15 and B-16 (T127, T128), B-06 (T146), B-21 to B-24 (T139, T140), B-25 (T140, shown by pull request 345). B-03 stays *not a change*; question 3 asks whether to make it one.

Ruled with this review on 2026-10-16: B-07 (question 2, (a)): the rename handler validates with `EntryNameRules` and its messages win; T178 applies it. B-03 stays *not a change* (question 3, (a)).

Still open: B-08, needed by M6.

## Follow-up features

None. Every finding of M3 serves a requirement of this feature.

## Questions for the maintainer

**1. SC-010 asks for no `Thread.Sleep` in production and one read-retry at the end of M3; the store base keeps one of each.** `DocumentLifecycle.TryRead` retries a refused read five times, 50 ms apart, sleeping, because `GetOrLoad` and `Reload` are synchronous; `WatchedFile.ReadAsync` is the asynchronous retry on the clock. The sleep blocks a thread for at most 200 ms, and only when another program holds the file.

- (a) **Add T283 in M5 and amend SC-010 to name the one sleep and its task.** *Recommended*: M5 is where blocking waits are judged (SC-018) and where lifetimes change. Making `GetOrLoad` and `Reload` asynchronous touches 74 calls in 40 files, and many of them move in M4 first, so doing it after M4 touches each once. M4 can start now.
- (b) T283 now, before M4: SC-010 holds as written, at the cost of the largest change left in M3 and of M4 waiting for it.
- (c) Amend SC-010 to the measured figures, with no task: the synchronous retry stays.
- (d) Other.

**2. B-07, needed by T178 in M4: one validator of entry names.** Laid side by side at `d162f0dd1`: both refuse the same characters (the portable set) and `.`/`..`. `EntryNameRules`, which the dialog runs while the user types, also trims the name, refuses the unchanged name, refuses a name that leaves the folder, and refuses a taken name as "An item named 'x' already exists in this folder." `RenameEntryCommandHandler.ValidateName`, run when the command executes, does not trim, and words its refusals differently: "A name is required." for "Enter a name.", "A name cannot contain a path separator." and a listing of the characters for "A name cannot contain a path or any of \ / : * ? " < > |", and "'x' already exists in this folder." for a taken name. A name typed in the dialog never reaches the handler's checks, so a user sees a difference only for a command that skips the dialog.

- (a) **The handler validates with `EntryNameRules`, its messages win.** *Recommended*: the dialog's rules are the stricter, already the ones users see, and no shipped example has a name either set refuses.
- (b) The handler's messages win, and `EntryNameRules` takes its wording.
- (c) Keep both: B-07 is struck as not worth a change, and T178 with it.
- (d) Other.

**3. One cycle policy for all tools? (B-03; the contract asks this as a product decision with pictures.)** [M3-cycle-policies.svg](M3-cycle-policies.svg) draws the graph S→A→B→C→A, C→D under each policy in use. `BackEdgeIsZero` (pipeline, dotnet) puts A after C; `BackEdgeIgnored` (databricks) puts B beside S; `BackEdgeIsZeroPerNode` (ansible) stacks the cycle in one column after a long gap; `Kahn` (supply chain) leaves B, C and D in the first column; *Condensed* stacks the cycle in one column right after S.

- (a) **Keep each tool's policy.** *Recommended*: in the pipeline, databricks and .NET sources a cycle is a defect (two validators report it, and the build refuses the third), so mostly a broken document's picture would change; every layout keeps its fixtures, and no register row is needed.
- (b) One policy, *Condensed*: a cycle's members share one layer and what follows the cycle comes after it, as OWL draws. One new `CyclePolicy` from OWL's code, and five layouts moved with a register row and a changed cycle test each; about 150 lines.
- (c) One policy, `BackEdgeIsZero`, the most used: databricks, ansible and supply chain change their picture of a cyclic document.
- (d) Other.

**4. SC-003 asks for one wait-until helper from M3; `StreamProbe` keeps a second loop.** Its three entries (`WaitUntilLiveAsync` and its hierarchy and context variants) share one private loop that provokes the stream again every round and reads until the provocation comes back; `Eventually` polls a condition.

- (a) **Amend SC-003 to "one wait-until helper (13), and the stream probe of the host harness (SC-001)", naming this review.** *Recommended*: the probe does something `Eventually` does not, and the figure then reads true as `waits.py` counts it.
- (b) A task: give `Eventually` a round action and build `StreamProbe` on it, so there is one loop; about 40 lines, and `waits.py` then needs a change to stop counting the three entries.
- (c) Other.

**Answers.** Ruled by the maintainer on 2026-10-16, in the project thread, each on (a): question 1 "In M5", question 2 "Dialog's rules", question 3 "Keep each", question 4 "Amend SC-003". This pull request was written as (a) for all four and stands as written.

## Ownership

M3 was owned by one developer, signing as `agent-1-<task>` (FR-006), first in a cloud session and, from T149's last parts, on the maintainer's machine. M4 is owned by the same developer unless the maintainer hands it over with this review.
