# M8 review: test consolidation

**Measured at**: `etalii.adp.ide.standalone` `e0a11f9ad`, the merge of pull request 655, 2026-10-23 | **Previous record**: [M7-review.md](M7-review.md), [M7-measurements.json](M7-measurements.json) at `531698115` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M8 put the tests on the testing projects. Ten parity transcripts derive from one `TranscriptTests<TAdapter>` over one `TranscriptHarness` (T245, T246), every module with a bundled DISL definition derives its tests from one `BundledDefinitionContract` (T284), the hand-written test dispatchers, temporary folders and repository-root walks are gone (T247 to T250), the flows that test one module live with it (T251, T252), the two hand-kept type catalogues are derived (T253), and the gate-script tests have left the product suite (T254). Every transcript stayed byte-identical, and no case was lost: T284 took the bundled-definition cases from 171 to 231. Test clone windows fell from 1,791 to 1,533, and the stub modules are unchanged (SC-027).

What did not fit:
- **The harness as T245 left it fitted four of the nine transcripts.** The other five need no toolbox, other names for their documents, an identity of their own or fields after the documents. As ruled on 2026-10-23, the harness took optional hooks first (standalone pull request 646), and each of the five then moved with its transcript byte-identical.
- **Five transcripts stay off the harness.** c4, databricks, functional-decomposition-graph, rdf and sparql keep their own, as ruled on 2026-10-23 (T246's question 2): they are the parity oracles of conversions that were open when T246 was ruled.
- **SC-005 is met only if pull request 186 counts.** This feature's own pull requests remove 3,231 test lines net, against 5,290 (question 1).

The review adds T317 and T318 to M8, strikes nothing, and records B-41 and B-42 as applied. One question goes to the maintainer: whether pull request 186 counts towards SC-005.

## Measurements

Between M7 and M8, 65 pull requests merged: standalone 590 to 655 but 644, which is open.

**This feature: 25.**
- The M7 review's T295, T313 to T316: 598, 607, 608, 609 and 597.
- Twenty M8 pull requests, ten tasks:

| Task | PR | Task | PR | Task | PR |
|---|---|---|---|---|---|
| T245 | 592 | T248 | 619 | T252 | 594 |
| T246 | 631 to 634, 646, 650, 652 to 655 | T249 | 627 | T253 | 622 |
| T247 | 617 | T250 | 618 | T254 | 613 |
| T284 | 629 | T251 | 593 | | |

They were ticked in `etalii.adp` #440 (T251, T252), #454 (T295, T313 to T316), #471 (T247, T248, T250, T254), #481 (T249, T253, T284) and #491 (T245, T246).

**Others: 40.**
- Seventeen of `sparql-disl-fbl`, its tasks 1 to 10 and their ticks: 612, 614, 616, 620, 621, 623, 625, 626, 630, 636, 640, 642, 643, 645, 647, 648 and 651. Task 11 is in progress.
- Seven of `functional-decomposition-graph-disl-fbl`, its tasks 9 to 12 and their ticks: 591, 599, 601, 603, 604, 605 and 610. It closed at 12 of 12.
- Two of `rdf-disl-fbl`: 590 (its task 6) and 602, its tick. Task 7 is in progress.
- Ten of `etalii.adp` spec 029, the hierarchical requirement designer: 596, 600, 606, 615, 624, 628, 635, 637, 639 and 641.
- One of `etalii.adp` spec 034, DISL 0.6's relation flags: 595.
- Three others: 611 (readability refactors), 638 (a DISL diagram's elements kept by type and id) and 649 (a selectable element of shape `none`).

The analysis scripts did not change since M7.

| Figure | M7 (`531698115`) | Now (`e0a11f9ad`) | Target |
|---|---|---|---|
| Projects | 144 | 146 (spec 029's designer and its tests) | about 134 at the end (plan) |
| Files, all | 2,660 | 2,812 | |
| Lines, all | 318,700 | 331,672 (+5,533 production, +7,439 test) | |
| Lines, core production | 53,049 (21 projects) | 55,781 (+2,732) | |
| Lines, core test | 61,047 (24 projects) | 62,339 (+1,292) | |
| Lines, diagram production | 76,095 | 76,320 (+225) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 859 | 861 | SC-006, met at M2: at most 881 |
| Lines, diagram test | 109,968 | 113,110 (+3,142) | |
| Lines, designer production / test | 6,379 / 5,997 | 8,955 / 8,452 (spec 029) | |
| Lines, editor production / test | 2,043 / 2,695 | 2,043 / 2,797 (T252's `JsonEditorFlow`) | |
| Lines, `EtAlii.Adp.Modules.Tests` | 1,427 | 1,875 (T252, T253) | |
| Lines, production | 137,566 | 143,099 (+5,533) | |
| Lines, test | 181,134 | 188,573 (+7,439) | SC-005 as amended by the M7 review: the sum below |
| Clone scan, production: shared windows / files | 303 / 190 | 291 / 185 | |
| Context-source-resolver / session / property-provider windows | 22 / 20 / 6 | 28 / 12 / 7 | SC-008, met at M2 |
| Action-provider windows | 13 | 14 | SC-008, met at M2: fewer than 50 |
| Parser / Writer / Validator / Tokenizer windows | 58 / 22 / 12 / 6 | 41 / 22 / 9 / 6 | |
| Clone scan, test: shared windows / files | 1,791 / 326 | 1,533 / 279 | |
| Methods | 3,651 | 3,832 | |
| Methods over 50 code lines | 120 | 121 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 13 | 12 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 386 | 404 (18 added, none removed) | |
| `PackageReference` edges | 252 | 256 (5 added, 1 removed) | |
| `FrameworkReference` edges | 4 | 4 | |
| `InternalsVisibleTo` edges | 43 | 44 | |
| Projects without a `.cs` file | none | none | SC-013, met at M5 |
| Core projects naming a tool module | 0 | 0 | SC-013, met at M5 |
| `Task.Delay` and `Thread.Sleep`, test / production | 16 / 4 | 16 / 4 | SC-004, SC-010 |
| Polling helpers | 3 | 3 | SC-003 as amended by the M3 review |

**Production lines per project that moved by more than 100:**

| Project | M7 | Now | Change |
|---|---|---|---|
| `EtAlii.Adp.Designer.HierarchicalRequirement` | none | 2,576 | new, spec 029 |
| `EtAlii.Adp.Specification.Fbl` | 9,348 | 10,843 | +1,495: spec 029's bullets (596) +700, registration blocks (600) +451, model (615) +312, envelope routing (606) +20; functional-decomposition-graph's task 10 +11 |
| `EtAlii.Adp.Specification.Disl` | 11,283 | 11,685 | +402: sparql's tasks 4, 5, 7 and 8 +241, spec 034 +79, the element index (638) +69, T316 +10 |
| diagram/sparql | 4,033 | 4,325 | +292: its tasks 3, 7, 8 and 9 +260, T315 +27 |
| `EtAlii.Adp.Hierarchy` | 6,336 | 6,602 | +266: spec 029's envelope routing (606) +256, two writers (628) +10 |
| `EtAlii.Adp.Workspace` | 2,112 | 2,355 | +243: spec 029's hierarchy surface (624) |
| `EtAlii.Adp.Designer` | 408 | 647 | +239: spec 029 (624, 615, 606) |

This feature's 25 pull requests changed production code by +78 lines net.

**The test code** grew by 7,439 lines. Summed from `git diff --numstat` of the `.cs` files of test projects per merge, this feature's 25 pull requests removed 1,807 net, spec 029 added 3,932, the conversions 3,821 (sparql 2,380, functional-decomposition-graph 1,027, rdf 414), spec 034 146 and the other three 161. The per-path sum differs from `lines.py`, which counts by project, by 1,186: the conversions moved production classes into their test projects as oracles (sparql's `SparqlProjection` became `Parity/HandWrittenSparql.cs`), which a per-path sum with rename detection counts as an edit, not as lines that changed side.

**Clone families.**
- **Gone, through M8:**
  - T284: `BundledDefinition.Tests` (62 windows).
  - T245, T246: the transcripts fell from 363 windows to 275, and `Transcript.Tests` from 18 to 8. What is left of `Transcript` is the five transcripts off the harness (`C4Transcript`/`DatabricksTranscript` 38, `RdfTranscript`/`TimelineTranscript` 37 among them) and each adapter's own frame.
  - T247 to T250: `Providers.Tests` 31 to 17, `Examples.Tests` 49 to 41, `Commands.Tests` 79 to 73.
- **Gone, through the M7 review's T295:** `Headers`/`SessionFactory` (12), `Headers`/`RegistrationHeaders` (5) and `RegistrationHeaders`/`SessionFactory` (5).
- **Newly in the twenty largest, all the conversions':** `FdgBody`/`GhgBody` (11), the FBL body a converted module keeps, and `ServiceCollection.AddCausalLoop`/`AddSparql` (11), sparql's registration.
- **Still the largest and left to their conversions, as the M3 review recorded:** `SankeyParser`/`SupplyChainParser` (41), `SankeyWriter`/`SupplyChainWriter` (22), the sankey and supply-chain action providers (12) and validators (9), and `RdfProjection`/`SkosProjection` (9).
- **Test code, the largest families now:** the dependency-graph and timeline twins are unchanged (document 98, parser 80, writer 54, session 46, rows 39, registration 30, commands 24, property provider 24, action provider 20), with `LineDocument.Tests` sharing 35 windows with both document tests. Answered under *Named candidates*.

**Long methods.** Over 50 code lines, 120 became 121; over 80, 13 became 12.
- **Left, through the M7 review's tasks:** `SparqlElementMapper.Elements` (86, T315), `DatabricksContextActionProvider.RunAsync` (83, T314) and `DependencyGraphContextActionProvider.RunAsync` (83, T313).
- **Entered, all through spec 029:** FBL's `DeclaredBlockWriter.Plan` (89) and `Whole` (59) (600, 615), the designer's `TagOperations.Apply` (83, 641) and FBL's `BulletsParser.Parse` (57, 596).
- **Grew, through spec 029:** FBL's `EditPlanner.PlanSet` and `BodyReading.Claim`, 60 to 65 each (596, 615).

**The twenty longest now.** Eleven are rdf's, as at M7, and `SkosLayout.FindKnot` (73) entered the twenty as the three above left it. Then `DeclaredBlockWriter.Plan` (89) and `TagOperations.Apply` (83), spec 029's; `C4Parser.ReadInModel` (85); and `DislNames.Resolve` (77), `CelParser.ParsePrimary` (76), `AbmContextActionProvider.RunAsync` (75), the XML editor's `SchemaValidation.Validate` (74) and `AbmParser.Build` (73), which the M7 review answered.

**Project graph.**
- **Added, through M8:** the knowledge designer's, the pipeline's, the dotnet dependency graph's and the JSON editor's test projects reference `EtAlii.Adp.TestSupport.Host`, for the flows T251 and T252 moved into them.
- **Added, the conversions':** functional-decomposition-graph references `Specification.Fbl` (and its test project YamlDotNet, which the module no longer does), rdf and sparql reference `Specification.Disl` and `Specification.Fbl`, and sparql's test project `Specification.Disl`.
- **Added, spec 029's:** the designer project and its test project, with five references, Serilog, the three test packages and one `InternalsVisibleTo` to its own test project.

**Waits.** Unchanged: 16 in test code and 4 in production, the same sites.

**The stability runs.** Run 19 ([39920628756](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39920628756), at `08c7b6864`, the merge of T284, 2026-10-23) succeeded, as runs 17 and 18 did before the M7 review.

## Exit condition and success criteria

The exit condition of M8 (plan.md): the tests are consolidated and the stub modules unchanged. SC-027 is due at M8, and SC-005, due at M9, is summed here, as the M7 review's question 2 ruled.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| FR-093: one transcript harness with a module adapter, one canonical-JSON writer and one abstract transcript test | Met | 10 transcripts derive from `TranscriptTests<TAdapter>` | T245 (592) and T246 (631 to 634, 646, 650, 652 to 655). Each transcript file stayed byte-identical. The five off the harness are the conversions' oracles, by the ruling of 2026-10-23 |
| FR-094: the test dispatchers, temporary folders and root locators replaced | Met, with one copy that arrived since | 0 dispatchers; 170 of 192 folder sites; 0 root walks of T250's 27, 1 new | T247 (617), T248 (619), T249 (627), T250 (618). Spec 029 added one root walk in `HierarchicalRequirementFiles.cs` (615) after T250 counted: T318 |
| FR-095: flows that test one module live with it; the two catalogues derived or removed | Met | 4 flows by T251, 4 by T252; both catalogues gone | T251 (593), T252 (594), T253 (622) |
| FR-096: the gate-script tests leave the product suite | Met | `GateScript.Tests.cs` (210 lines) gone | T254 (613) |
| SC-027: the 48 stub modules are unchanged | Met | 48 projects, 48 origins, titles and icons | Since the baseline, each stub's `Diagram.cs` changed in two lines, both by T163 (M4): `DiagramOrigin` became `ToolOrigin` and a `using` it no longer needed went. No string changed. Nothing under the stubs changed since M7 |
| SC-005 as amended by the M7 review: the tasks the coverage table lists remove at least 5,290 test lines net, with no test removed that a contract or harness test does not cover | Met if pull request 186 counts, else not met | 5,726 with it, 3,231 without | Below, and question 1 |

**The SC-005 sum.** Summed from `git diff --numstat` of each merge commit against its first parent, over the `.cs` files of the test projects and the two testing projects, with and without rename detection alike:

| Tasks | Pull requests | Added | Removed | Net |
|---|---|---|---|---|
| M0's testing projects, T011 to T026 | 174, 178, 184, 175, 185 | 1,718 | 4,100 | −2,382 |
| M1's contracts: T043 to T048, T056 to T061, and T273 of the M1 review | 200 to 202, 207 to 209, 216, 217, 220 to 223, 227 | 1,346 | 460 | +886 |
| M8: T245 to T253, T284 | the 19 above but 613 | 3,290 | 5,025 | −1,735 |
| **This feature** | | | | **−3,231** |
| Pull request 186, the maintainer's own, which did part of T245 and T250 before they started | 186 | 837 | 3,332 | −2,495 |
| **With 186** | | | | **−5,726** |

T254's 210 lines are left out: FR-096 removes those tests without replacing them, which the criterion's second half does not allow to count. With them the two sums are −3,441 and −5,936.

No test was removed that a contract or harness test does not cover. Counted as `[Fact]` and `[Theory]` lines removed and added in each merge: M0's pull requests and 186 removed none. M1's removed 14 and added 32; the ten that 227 removed are covered by `DiagramElementSourceResolverContract`, which it added (T273). In M8, each T246 module lost its one transcript `[Fact]` to the one `TranscriptTests<TAdapter>` declares, T253 lost the catalogue's to `WireTypes`, and T284 replaced 69 with the contract's seven per module (171 cases to 231).

## Named candidates

**From the contract and the plan.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| Per-module test helpers that are left | Do now for the line-document round trip and one root walk; no for the rest | See below | T317, T318 |

**The per-module test helpers, one by one.**
- **The dependency-graph and timeline document tests (98 windows, and 35 with `LineDocument.Tests`):** do now, T317. Both test the core `LineDocument` against their module's corpus with the same seventeen cases (round trip, unterminated end, last-line removal, dominant ending and so on), differing in the corpus folder, the extension and their comments. One `LineDocumentContract` in `EtAlii.Adp.TestSupport`, as T284 did for the bundled definitions, keeps every case for each corpus. Both conversions have closed, so nothing overtakes it.
- **`HierarchicalRequirementFiles` (spec 029):** do now, T318. It walks up from the test binary to `src/designers/hierarchical-requirement`, which `RepositoryPaths.Under` answers since T250. It arrived in pull request 615, after T250 had counted.
- **The other twins (parser 80, writer 54, session 46, commands 24, the providers 24 and 20, registration 30):** no. Each tests its own module's parser, writer, session or commands, and the two modules' code differs (the action providers by 366 lines of 680, the property providers by 133 of 257, the sessions by 58 of 140). The shared windows are the arrange-and-assert frames of a module that was built by copying the other.
- **The rows twins (39 windows):** no. They test `DependencyGraphRows` and `TimelineRows`, two 34-line production copies (the first says "copied from the timeline unchanged"). Joining them takes a shared home for a three-line rule that is each module's rendering constant, below what any review took up.
- **The five transcripts off the harness:** no, as ruled on 2026-10-23 (T246's question 2). The c4, databricks, functional-decomposition-graph, rdf and sparql transcripts are their conversions' oracles. functional-decomposition-graph has closed since that ruling; its transcript and `FdgTranscriptProbes` stay as its conversion left them, and the M9 review lists the five in its follow-up list.

**For the M8 review, from the tasks and earlier reviews.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| T250: count the copies of the repository-root locator that are left (M0 review) | One, T318 | T250 (618) replaced the 27 left after pull request 186; `RepositoryPaths.Locate` is the one walk, used by 115 files. `ExampleRegistration.Tests.ExampleRootOf` walks up from a registration to its example set, not to the repository root | T318 |
| The moved flows, `Flow.Tests` (22) and `Flow.Tests`/`OwlFlow.Tests` (15) (M6 review) | No | `DatabricksFlow`, `RdfFlow` and `OwlFlow` drive the same four scenarios (a registered file streams, a reposition lands in the `.adp`, a label edit, two registrations on one body) on `FlowSession`, and assert each tool's own payload. A flow contract would take the steps, which `FlowSession` already holds, and leave the assertions. rdf-disl-fbl's tasks 8 to 11 change what two of them assert | none |
| The dependency-graph and timeline test twins (M4 and M7 reviews) | Answered above | | T317 |
| T245: the harness's place (question 1 of the T245 pull request) | Ruled 2026-10-23: `EtAlii.Adp.TestSupport` | The harness needs no host. `data-model.md` and T245 were amended by `etalii.adp` #491 | none |
| T246: which transcripts, and how the five that did not fit move | Ruled 2026-10-23: nine, through optional hooks | Standalone pull request 646 added the hooks with five tests, each seen to fail | none |

## New candidates

**From the clone scan.**
- **`FdgBody`/`GhgBody` (11), and `AadBody`/`CausalLoopBody`/`DependencyGraphBody`/`FdgBody`/`GhgBody` (3):** a follow-up feature, 1 below. Five modules keep a body type that reads through its embedded binding, forks the cached text and plans writes through FBL. rdf, sparql, c4 and databricks are still writing theirs, so a shared base now would be fitted to five of nine.
- **`ServiceCollection.AddCausalLoop`/`AddSparql` (11):** no task here; told to sparql's owner. Its task 11, in progress, closes the conversion.
- **The test families:** answered under *Named candidates*.

**From the method-length count.** The three over 80 the M7 review named are under 50. The two that entered over 80 are spec 029's (`DeclaredBlockWriter.Plan`, `TagOperations.Apply`): no task here, told to spec 029's owner. SC-023 is met with a margin of 2 and 10, so the margin is the open conversions' and spec 029's to keep.

**What M8 made cheap.**
- **A parity transcript:** one adapter class and a seven-line test class; the hooks cover a module without a toolbox, with its own document names, identity and trailing fields.
- **A module with a bundled definition:** its seven definition cases come from deriving `BundledDefinitionContract`.
- **A temporary folder, a repository path, a module's command pipeline in a test:** `TestFolder.Create`, `RepositoryPaths.Under`, `TestHistory.For`.
- **A flow of one module:** it lives in that module's test project, on `EtAlii.Adp.TestSupport.Host`.

**What M8 made pointless.** The per-module transcript test classes, the hand-kept type catalogues, and the gate-script fixtures.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014):
- T245 to T254 and T284 were ticked in their own `etalii.adp` pull requests (above).
- T258 ([M8-measurements.json](M8-measurements.json)) and T259 (this record) are ticked in this pull request. T260 is ticked with its delivery.

**Struck:** none.

**Reduced:** none.

**Added, in M8 under *Added by the M8 review*, to be done before M9's first task:**
- T317: one `LineDocumentContract` in `EtAlii.Adp.TestSupport` for the round-trip cases `DependencyGraphDocument.Tests.cs` and `TimelineDocument.Tests.cs` share; each module derives with its corpus folder and extension, every case kept for each corpus (FR-015; SC-005).
- T318: `HierarchicalRequirementFiles` in the hierarchical requirement designer's test project finds its module through `RepositoryPaths.Under` (FR-094). It touches a file of spec 029's, so it lands after that spec's open pull request on the file, if any, merges.

**Tasks under FR-012.** No remaining task of this feature falls under FR-012. The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `e0a11f9ad`:
- **Closed:** ansible-structure 12 of 12, azure-devops-pipeline 12 of 12, causal-loop 11 of 11, dependency-graph 9 of 9, dotnet-dependency-graph 10 of 10, **functional-decomposition-graph 12 of 12 (closed in M8)**, helm-chart 11 of 11, timeline 7 of 7.
- **Open:**
  - c4, 12 of 17, waiting on the language changes for gaps C1 to C7.
  - databricks, 9 of 15.
  - rdf, 6 of 18, task 7 in progress.
  - **sparql, 10 of 11 (started in M8), task 11 in progress.**
- **Not started:** sankey 0 of 12, supply-chain 0 of 12, wardley-map 0 of 13.

## Behaviour changes

**Ruled and applied since the M7 review:**

| Row | What | Ruled | Applied by |
|---|---|---|---|
| B-41 | A bare-string `editText` is the editor's literal text | 2026-10-22, question 1 (a) of the M7 review | T316, standalone pull request 597 |
| B-42 | An `editText` or `text` bound by `{ "attribute": … }` opens on the attribute's value, and a map on the locale's text | 2026-10-22, question 1 (a) of the M7 review | T316, 597 |

M8's own tasks changed no behaviour: every transcript compared byte-identical, T284 kept every case and added 60, and T251's moved flows ran as many cases in their new projects as before. The two rulings during M8, on the harness's place and on T246's scope and hooks, chose ways that keep behaviour.

**Entered by this review:** none. M9 needs no row.

## Follow-up features

The two of the M6 review, the three of the M4 review and the one of the M7 review stand as written there.

1. **One body base for the modules that read through FBL.** Five modules keep a body type of the same shape: the embedded binding applied by `EtAlii.Adp.Specification.Fbl`, a fork of the cached text per reader, writes planned as splices and undo left to the host's restore command. `FdgBody` and `GhgBody` share 11 windows, and five of them 3. A base in `EtAlii.Adp.Diagram.Modules` would leave each module its binding name and its reading's shape. First estimate: one specification of about six tasks, after rdf, sparql, c4 and databricks have written their bodies, so that the base is fitted to all nine.

## Questions for the maintainer

**1. SC-005: does pull request 186 count towards the 5,290 lines?**

SC-005, as amended on the M7 review's question 2, counts the test lines that the tasks the coverage table lists remove: M0's testing projects, M1's contracts and M8. Those tasks' pull requests remove 3,231 lines net, 2,059 short. Pull request 186 was the maintainer's own request outside this feature, merged on 2026-10-12 during M0. It put the six transcripts on one `TranscriptText`, moved 44 test files onto `RepositoryPaths`, and gave the flow tests one home for their helpers, removing 2,495 test lines net and no test. The M0 review reduced T245 and T250 by what it had done, so without it those tasks would have removed those lines themselves.

- (a) **Count it: SC-005 is met at 5,726.** *Recommended*: the criterion counts the consolidation this feature set out to do, and 186 did part of T245 and T250 before they started, which the M0 review recorded when it reduced them. It costs one sentence added to SC-005, with this review named beside it.
- (b) Do not count it. SC-005 is missed by 2,059, and the M9 review records it as missed with this reason. T317 removes a few hundred lines more, not 2,059.
- (c) Do not count it, and add consolidation tasks until the sum is met. No family left would make up 2,059 lines: the largest is the dependency-graph and timeline twins, whose modules' code differs.
- (d) Other.

**Answers.** Not yet given when this review was written. SC-005 stands as amended by the M7 review until question 1 is ruled.

## Ownership

M8 was owned by one developer, signing as `agent-1-<task>` (FR-006), in a cloud session. A Remote Control session of the same developer on a Mac mini did T245, T251, T252 and T246's first four modules; the cloud session took over the rest of T246 when the Mac mini went offline. M9 is owned by the same developer, agent 1, unless the maintainer hands it over with this review.
