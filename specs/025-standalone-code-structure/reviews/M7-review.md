# M7 review: module internals

**Measured at**: `etalii.adp.ide.standalone` `531698115`, the merge of pull request 587, 2026-10-22 | **Previous record**: [M6-review.md](M6-review.md), [M6-measurements.json](M6-measurements.json) at `514e784f1` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M7 decomposed the module internals the report named, except rdf's. The knowledge designer's value types are one strategy each (T233), its 49 gestures are a table that states which need a view (T234), and its session holds a `PendingEditQueue` and a `KnowledgeViewState` (T235). Wardley's parser reads one keyword table and its commands build their statements through the writer (T236, T237). The SPARQL parser has a scope pass and a token cursor of its own (T238). C4 ranks through `Layering.LongestPath` with its own cycle policy, pushes overlaps through `OverlapResolver` and packs boundaries in a `C4BoundaryPacker` (T239, T240). Nine of the report's other long methods are under 50 code lines (T241), and the YAML and folder code that ansible-structure and helm-chart copied is written once (T294, T302). Seven of these tasks showed a byte-identical dump before and after, T241 held each example's layout to a digest recorded before the split, and T235, T237 and T294 rest on their guards. Methods over 50 code lines fell from 147 to 120 and over 80 from 31 to 13, so SC-023's targets for M9 (123 and 22) are met already, and production clone windows fell from 355 to 303.

What did not fit:
- **rdf's projections were not restructured.** As ruled on 2026-10-20, rdf-disl-fbl went first; it has started (5 of 18 at `531698115`), and its tasks 8 to 11 take the projections, `OwlValidator`'s logic and `OwlModelIndex` out of the product. This review strikes T231 and T232 and reduces T241 to its done non-rdf part.
- **SC-005 cannot be met as written.** Test code is 181,134 lines against a baseline of 132,238, mostly tests that no task of this feature can remove (question 2).
- **The `.adp` registration has a second writer.** FBL's `OpenRegistration`, which core's new `PlaceInRegistrationCommand` uses since dotnet-dependency-graph's task 8 (standalone pull request 563), writes registrations beside `AdpRegistration`, which FR-061 made the one owner at M4 (follow-up feature 3).

The review adds T313 to T316 to M7 and strikes T231 and T232. It reduces T241 and T295, and enters B-41 and B-42. Two questions go to the maintainer: B-41 and B-42, and how SC-005 is measured.

## Measurements

Between M6 and M7, 43 pull requests merged: standalone 545, 547 to 575, and 577 to 589. 576 is open, a dependency bump.

**This feature: 20.**
- The M6 review's T305 to T312: 552, 553, 548, 556, 555, 549, 550 and 547.
- Twelve M7 pull requests, eleven tasks:

| Task | PR | Task | PR | Task | PR |
|---|---|---|---|---|---|
| T236 | 558 | T233 | 570 | T240 | 577 |
| T238 | 559 | T235 | 572 | T294 | 585 |
| T237 | 561 | T234 | 573 | T302 | 587 |
| T239 | 564, 568 | T241, its non-rdf part | 575 | | |

They were ticked in `etalii.adp` #396 (T236), #398 (T237, T238), #408 (T239), #409 (T233 to T235), #410 (T240, T241's non-rdf part) and #432 (T294, T302).

**Others: 23.**
- Nine of `dotnet-dependency-graph-disl-fbl`: 545, 551, 554, 557, 560, 562, 563, 565 and 566. It closed at 10 of 10.
- Eight of `functional-decomposition-graph-disl-fbl`: 567, 569, 571, 574, 578, 579 and 580 (its tasks 1 and 3 to 8), and 583, which reports every ownership loop.
- Four of `rdf-disl-fbl`: 581, 584, 586 and 589 (its tasks 1, 3, 4 and 5).
- Two library changes: 582, a relation type's `allowSelfLoops` defaulting to false as DISL §4.9 says, and 588, `etalii.adp` spec 033, an insert's constant (FBL 0.8).

The analysis scripts changed once since M6: T311's `graph.py` (standalone pull request 550).

| Figure | M6 (`514e784f1`) | Now (`531698115`) | Target |
|---|---|---|---|
| Projects | 144 | 144 | about 134 at the end (plan) |
| Files, all | 2,562 | 2,660 | |
| Lines, all | 306,428 | 318,700 (+3,705 production, +8,567 test) | |
| Lines, core production | 50,494 (21 projects) | 53,049 (+2,555) | |
| Lines, core test | 57,601 (24 projects) | 61,047 (+3,446) | |
| Lines, diagram production | 75,756 | 76,095 (+339) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 853 | 859 | SC-006, met at M2: at most 881 |
| Lines, diagram test | 105,456 | 109,968 (+4,512) | |
| Lines, designer production / test | 5,568 / 5,370 | 6,379 / 5,997 (T233 to T235) | |
| Lines, editor | unchanged | unchanged | |
| Lines, production | 133,861 | 137,566 (+3,705) | |
| Lines, test | 172,567 | 181,134 (+8,567) | SC-005: 5,290 smaller than the baseline (132,238) at M9; question 2 |
| Clone scan, production: shared windows / files | 355 / 200 | 303 / 190 | |
| Context-source-resolver / session / property-provider windows | 22 / 23 / 6 | 22 / 20 / 6 | SC-008, met at M2 |
| Action-provider windows | 13 | 13 | SC-008, met at M2: fewer than 50 |
| Parser / Writer / Validator / Tokenizer windows | 58 / 22 / 12 / 6 | 58 / 22 / 12 / 6 | |
| Clone scan, test: shared windows / files | 1,687 / 309 | 1,791 / 326 | |
| Methods | 3,472 | 3,651 | |
| Methods over 50 code lines | 147 | 120 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 31 | 13 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 382 | 386 (4 added, none removed) | |
| `PackageReference` edges | 252 | 252 | |
| `FrameworkReference` edges | 4 | 4 | |
| `InternalsVisibleTo` edges | 42 | 43 | |
| Projects without a `.cs` file | none | none | SC-013, met at M5 |
| Core projects naming a tool module | 1 by the old count, which named no tool module | 0 (T311) | SC-013, met at M5 |
| `Task.Delay` and `Thread.Sleep`, test / production | 15 / 4 | 16 / 4 | SC-004, SC-010 |
| Polling helpers | 3 | 3 | SC-003 as amended by the M3 review |

**Production lines per module that moved by more than 30:**

| Module or project | M6 | Now | Change |
|---|---|---|---|
| `EtAlii.Adp.Specification.Disl` | 9,676 | 11,283 | +1,607: rdf's library tasks 3 and 4 +877, functional-decomposition-graph's tasks 3, 4 and 7 +405, T305 +210, T306 +105, T309 +10 |
| designer/knowledge | 5,568 | 6,379 | +811, 17 files more: T233's strategies, T234's four edit classes and T235's two types |
| diagram/dotnet-dependency-graph | 2,152 | 2,749 | +597, its conversion |
| `EtAlii.Adp.Hierarchy` | 6,068 | 6,336 | +268, dotnet-dependency-graph's tasks 8 and 9 (563, 565), `PlaceInRegistrationCommand` and its handler among them |
| `EtAlii.Adp.Diagram.Modules` | 1,207 | 1,469 | +262, T294's `OpenFolders<TFolder>`, `PluginFileYaml` and `FolderBodyEvents` |
| diagram/helm-chart | 3,203 | 2,999 | −204, T294 |
| `EtAlii.Adp.Specification.Fbl` | 9,158 | 9,348 | +190: spec 033 +78, rdf's task 5 +64, dotnet-dependency-graph +41, T307 +6, T302 +1 |
| diagram/ansible-structure | 3,483 | 3,298 | −185, T294 |
| `EtAlii.Adp.Layout` | 704 | 839 | +135, T239: `CyclePolicy.Relaxation` and `OverlapResolver.PushOffAlongAxes` |
| diagram/functional-decomposition-graph | 2,495 | 2,370 | −125, its conversion |
| diagram/sparql | 3,945 | 4,033 | +88, T238 |
| diagram/rdf | 11,280 | 11,353 | +73, rdf's tasks 1 to 5 |
| diagram/supply-chain, sankey, timeline | 2,887, 2,549, 2,868 | 2,939, 2,596, 2,901 | +52, +47, +33, T241 |
| diagram/wardley-map | 5,599 | 5,562 | −37, T236 and T237 |
| diagram/azure-devops-pipeline | 6,373 | 6,341 | −32, T302 |
| diagram/c4 | 5,550 | 5,582 | +32, T239 and T240 |

**The test code** grew by 8,567 lines. Summed from `git diff --numstat` of the `.cs` files of test projects per merge, this feature's 20 pull requests added 1,872 net and the conversions 5,931: dotnet-dependency-graph 2,382, functional-decomposition-graph 1,967 and rdf 1,582. The two library changes added 215. The per-path sum differs from `lines.py`, which counts by project, by 549.

**Clone families.**
- **Gone:**
  - T294: `AnsibleYaml`/`HelmYaml` (14), `AnsibleFolder`/`HelmBody` (11), `AnsibleFolders`/`HelmChartStore` (9), and `TolerantYaml`/`Yaml` (3).
  - T302: `PipelinePlanner`/`YamlScalars` (10).
  - The conversions: `Planner`/`Splices` (5), `ServiceCollection.AddFunctionalDecompositionGraph`/`AddSankey` (5), and three session windows (23 to 20).
- **Newly in the twenty largest:**
  - `C4SessionFactory`/`DatabricksHeaders` (7). It is the same three registration-header readers as before, now reported as a pair as well: T295.
  - `AadBody`/`CausalLoopBody`/`DependencyGraphBody`/`GhgBody` (3), and two 2-window families of six `ServiceCollection.Add…` and six context source resolvers. Each is a constructor's or a registration's frame.
- **Still the largest and left to their conversions, as the M3 review recorded:** `SankeyParser`/`SupplyChainParser` (28), `SankeyWriter`/`SupplyChainWriter` (22), the YAML parsers of fdg, sankey and supply chain (13 and 12), the sankey and supply-chain action providers (12) and validators (9), and `RdfProjection`/`SkosProjection` (9).
- **Test code:**
  - The transcripts grew from 300 to 363 windows, and the bundled-definition tests from 39 to 62. rdf's task 1 froze four transcripts, and the two conversions added their bundled-definition tests.
  - The dependency-graph and timeline test twins are unchanged: document 98, parser 80, writer 54, session 46, rows 39, registration 30, property provider 24. They are the M8 review's to read (T246, T284).

**Long methods.** Over 50 code lines, 147 became 120; over 80, 31 became 13. Thirty-one methods left the set and four entered.
- **Left, through M7's tasks:**
  - T236: `WardleyParser.Outcome` (220).
  - T241: `KnowledgeValidator.Validate` (141), `SupplyChainLayout.Arrange` (138), `SankeyLayout.Compute` (127), `AnsibleGraph.Derive` (114), `OwlLayout.Positions` (112), `TimelineContextActionProvider.RunAsync` (100), the dotnet `DependencyGraph.Derive` (93), `CelParser.Tokenize` (90) and `SkosLayout.Layout` (89).
  - T239 and T240: `C4Layout.ComputeNested` (114, now 33 in `C4BoundaryPacker`) and `C4Layout.Spread` (51).
  - T234: `KnowledgeEdits.SetCell` (99), `ChangeType` (88), `Plan` (65), `Written` (56), `DeleteColumn` (54) and `AddRelation` (51).
  - T233: `KnowledgeViewEngine.Holds` (94). T235: `KnowledgeSession.Edit` (72).
  - T238: `SparqlParser.ParseGroupGraphPattern` (93), `ParseDescribeQuery` (59), `ParseSubSelect` (52) and `ParseTermOrBlank` (51).
- **Left, through the M6 review's T306:** `ActionRunner.Action` (152), `DislModelBuilder.From` (100), `DerivedRelations` (94) and `ExpressionForm` (76).
- **Left, through the functional-decomposition-graph conversion:** `FdgContextActionProvider.RunAsync` (61, its task 6) and `FdgOwnership.CyclesIn` (51, its task 7).
- **Moved:** `PluginFunctions.Function` (63) from `Expressions/` to `Loading/` (T305), the same method.
- **Entered, all through rdf's library tasks:**
  - `DislModelBuilder.DerivedNode` (58, task 3, standalone pull request 584).
  - `DislKnots.Components` (54, task 4, 586).
  - `DislSpecification`'s constructor, which T305 left at 50 and rdf's tasks 3 and 4 took to 56.

**The twenty longest now.**
- **Eleven are rdf's:**
  - the three projections (344, 200, 144);
  - `OwlModelIndex.Build` and `OwlValidator.Judge` (102 each);
  - `RdfContextActionProvider.ExecuteAsync` (91) and `DiscoverAsync` (78);
  - `ShaclValidator.ValidateAsync` (89) and `ShaclProjection.BuildCard` (86);
  - `SkosValidator.ValidateAsync` (86) and `SkosProperties.Describe` (78).
- **Then:**
  - `SparqlElementMapper.Elements` (86), `C4Parser.ReadInModel` (85), and the `RunAsync` of the databricks and dependency-graph action providers (83 each);
  - `DislNames.Resolve` (77), `CelParser.ParsePrimary` (76), `AbmContextActionProvider.RunAsync` (75), the XML editor's `SchemaValidation.Validate` (74) and `AbmParser.Build` (73).

All answered under *Named candidates*.

**Project graph.**
- **Added, the conversions':** dotnet-dependency-graph references `Hierarchy` and `Specification.Fbl`, functional-decomposition-graph references `Specification.Disl`, and `Hierarchy` references `Specification.Fbl` for `PlaceInRegistrationCommand` (standalone pull request 563).
- **`InternalsVisibleTo`, one grant added:** `Diagram.Modules` to `Diagram.Modules.Tests` (T294), for `FolderBodyEvents`' translation. Both are core projects, so SC-013 is not touched.
- **T311:** the grant from `Hierarchy` to `src/tests/EtAlii.Adp.Modules.Tests` is no longer counted as naming a tool module, so the count is 0.

**Waits.** One `Task.Delay` was added to test code: `PendingEditQueue.Tests.cs:152` (T235) waits 100 ms to show that a second write does not start while the first is held. It waits for nothing to happen, as the five the M5 review read do, not for a debounce, an idle eviction or a retry, so SC-004 holds. Production waits are the same four.

**The stability runs.** Runs 17 ([39565515776](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39565515776), at `c450598e1`, 2026-10-21) and 18 ([39743631885](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39743631885), at `d3376652f`, 2026-10-22) passed 20 of 20 each, the first runs since T312 corrected run 16's failure.

## Exit condition and success criteria

The exit condition of M7 (plan.md): the methods FR-086 to FR-092 name are under the lengths of SC-023, or struck under FR-012. SC-011 is measured again at M7 (the coverage table), and User Story 7 has two acceptance scenarios for the end of M7.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| The methods FR-086 to FR-092 name are under SC-023's lengths, or struck under FR-012 | Met | Every method named is under 50 code lines, or in a task struck or reduced by this review as overtaken by rdf-disl-fbl | FR-086: T231 and T232 struck (below).<br>FR-087: T233 (570), T234 (573).<br>FR-088: T235 (572), as the M3 review reduced it.<br>FR-089: T236 (558), `Outcome` 220 to 23; T237 (561).<br>FR-090: T238 (559), `SparqlParser.cs` 942 code lines with the scope pass and the cursor apart.<br>FR-091: T239 (564, 568), T240 (577), `ComputeNested` 114 to 33.<br>FR-092: T241 (575), nine methods under 50; its rdf part reduced away (below), and the rest of the twenty longest named under *Named candidates* |
| User Story 7, scenario 1: `OwlProjection.Project` is a builder type whose methods are each under 50 code lines | Not met; overtaken | 344 code lines | rdf-disl-fbl's task 11 moves `OwlProjection` into rdf's test project as the oracle the derived reading is checked against (FR-012; M6 review, question 4 (a), ruled 2026-10-20) |
| User Story 7, scenario 2: a gesture is looked up in a table that states whether it needs a view, and reordering entries changes nothing | Met | 49 gestures, 26 with `RequiresView` | T234: `KnowledgeEdits.Gestures.Tests.cs` plans every kind with the table reversed and shuffled |
| SC-011: each tool's fixtures lay out as before; the layering of every tool names its cycle policy | Met | 9 layouts on `Layering.LongestPath`, whose `CyclePolicy` parameter is required | M3 left `C4Layout.Rank` as the one layering of its own. T239 puts it on `LongestPath` with `CyclePolicy.Relaxation`, C4's bounded relaxation. Every layout of every view of 335 workspaces (the 35 `.dsl` under `src/` and 300 random ones) dumped byte-identically before and after T239. T240's dump of 34,700 lines was byte-identical too |
| SC-023 (due at M9, read now because a candidate of this review asks for it): at most 123 methods over 50 code lines and at most 22 over 80 | Met already | 120 and 13 | 27 of the 120 are rdf's, and 20 of those 27 are in the classes whose logic rdf's tasks 8 to 11 move into its test project. rdf's library tasks also added three methods over 50 to DISL, so the margin of 3 is the conversions' to keep. The M9 review counts again |
| SC-004, from M3: no test waits in real time for a debounce, an idle eviction or a retry | Holds | 16 test waits | The one added waits for nothing to happen (above) |
| SC-013, met at M5 | Holds | 0 | T311 |

No criterion is amended by this review. SC-005 waits on question 2.

## Named candidates

**From the contract and the plan.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| Which module-internal tasks a conversion overtook (FR-012) | T231 and T232 struck; T241's rdf part and T295's databricks part reduced away; nothing else | rdf-disl-fbl has started (tasks 1 to 5 done, task 6 in progress at `531698115`), which is what the ruling of 2026-10-20 waited for.<br>• Task 8 takes `RdfProjection`, the RDF providers' logic and `RdfValidator`'s rules into rdf's test project.<br>• Task 9 does the same for `SkosProjection`, SKOS's providers and `SkosValidator` but for its header rule.<br>• Task 10 does it for `ShaclProjection`, `ShaclShapeDiscovery`, SHACL's providers and `ShaclValidator`.<br>• Task 11 does it for `OwlProjection`, `OwlModelIndex`, `OwlClassHierarchy` and `OwlValidator`'s logic.<br>None waits on a language change; each waits on rdf's measurement of its Requirement 4.5 (below).<br>`databricks-disl-fbl`'s task 11 removes `DatabricksHeaders` from the product. The other M7 tasks were done before this review, each having read its module's conversion first: wardley-map, sparql and knowledge have not started, c4 keeps its layout, and ansible, helm and pipeline have closed | T313 to T315 (below), none of them overtaken |
| The budgeted graph builder for SPARQL as well | No; overtaken | The budget cut is DISL's `limits.budgets` (§3.2.1) since rdf's task 4 (standalone pull request 586): `DislBudgets` and `DislBudgetReader` in `Specification.Disl`, with `measure`, `max`, `truncate`, `order` and the notice. sparql-disl-fbl takes its cut from the same construct (its library item L5; its design: "no placement, no id, no order and no cut: those are the definition's"). No module would consume a builder of its own | none |
| The longest methods that are left | Do now for the three over 80 that survive every conversion; no for the rest | See the list below | T313, T314, T315 |

**The longest methods, one by one.** Every method of the twenty longest, and every one T241 left to this review:
- **The eleven rdf methods of the twenty:** overtaken, as above. One fallback stays open. A reading whose derivation exceeds `limits.celCost` keeps its projection in the product as the stand-in for rdf's gap 6, and then only that reading's providers lose their logic (rdf's task list, *What waits*). If that happens, the review after that rdf task answers the projection as a new candidate, because a struck task is not reopened.
- **`SparqlElementMapper.Elements` (86):** do now, T315. sparql-disl-fbl keeps the mapper ("`SparqlLayout` and `SparqlElementMapper` keep their input and do not change", its task 7). The method is six loops, one per drawn kind, so one method per kind is a split along a seam that exists.
- **`DependencyGraphContextActionProvider.RunAsync` (83):** do now, T313. dependency-graph-disl-fbl has closed, so nothing replaces it. It is the twin of timeline's `RunAsync`, which T241 split from 100 code lines to 43 by moving each arm into a method.
- **`DatabricksContextActionProvider.RunAsync` (83):** do now, T314. databricks-disl-fbl's stage two changes the commands this method dispatches (its task 12) and the client's simulation (task 14), and leaves the provider's dispatch in place. The split follows the switch's arms and keeps every command it builds as it is.
- **`C4Parser.ReadInModel` (85):** no. c4-disl-fbl's task 14 moves `C4Parser` into c4's test project once FBL answers gaps C1, C2 and C6.
- **`DislNames.Resolve` (77) and `CelParser.ParsePrimary` (76):** no, as the M6 review answered. Each is one pass over the names at load, or one precedence level.
- **`AbmContextActionProvider.RunAsync` (75), `SchemaValidation.Validate` (74), `AbmParser.Build` (73) and the 71s below them:** no. SC-023 is met without them, they are under 80, and none is in the report's list (FR-092).
- **`KnowledgeEdits.SetCell`:** T234 took it, and it is no longer over 50. `ComputeNested` is T240's (33).

**For the M7 review, from the tasks.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| T236, T237: they went ahead although wardley-map-disl-fbl's task 11 will retire the parser | No; recorded | That conversion has not started (0 of 13), and its task 11 waits on FBL gaps 1, 7 and 8. The M3 review ruled that T236 stands | none |
| T239: `OverlapResolver.Separate` would have moved 47 of 335 layouts and the C4 parity transcript | Done as ruled | The maintainer chose "Add C4's rule" on the card (2026-10-21): `PushOffAlongAxes` keeps C4's one-sided push beside `Separate`. B-03's ruling, that each tool keeps its own cycle policy, already allows a tool its own rule | none |
| T240: the c4 companions' layout row (`definitions/diagrams/c4-*.md` in `etalii.adp`, line 170) names `C4Layout`, `C4LayoutEngine`, `C4Boundary` and `C4Metrics` but not `C4BoundaryPacker` | No task here; told to c4's owner | The row is incomplete, not false: the boundaries and the moving of outsiders are still the host's. c4-disl-fbl's task 17 rewrites that table "checked against `git ls-files` of the backend project", which finds the class. The ansible and helm companions were corrected by `etalii.adp` #432 with T294 | none |
| T240: a hand-placed position applied to an element inside a deployment node failed no test | Done | `AwsDeploymentTests.AHandPlacedPosition_IsIgnored_ForAnElementInsideANode`, seen to fail on the sabotage | none |
| T241: the rdf methods and the five that moved into the twenty longest | Answered above | | T313 to T315 |
| T294: say why a registry does not fit `RetainedRegistry` | Both fit | `OpenFolders<TFolder>` holds the ansible and helm folders on `RetainedRegistry`, which now accepts a zero retention and drops a value at its last release | none |
| T302: `YamlScalars` made public | Done as ruled | The maintainer chose "Make it public" on a card (2026-10-22). `PipelinePlanner` names it, so `PublicSurfaceTests` holds it by FR-082's rule as the M6 review's question 3 ruled it | none |
| T309: a bare-string `editText` is compiled as CEL, and an `editText` written `{ "attribute": … }` reaches `FormCommit.EditText` as an expression with no source | Question 1 (B-41, B-42) | DISL §2.3 types `editText` as a Message, whose bare string is a LocalizedText, and §6.12 says the editor starts with "the value of the attribute it binds". `DislNotationReader.cs:93` compiles a bare `editText` as CEL in the element context. Any object without `cel`, whether `{ "attribute": … }` or a LocalizedText map, becomes a `DislExpressionField` without source, which `DislEvaluation.Evaluate` answers with a `CelError`, so `FormCommit.EditText` returns null. The same holds for a label's `text` written `{ "attribute": … }` with no `editText`, which T309 did not name. Shipped definitions write `editText` as `{ "attribute": … }` (pipeline, hype cycle, the six C4 definitions) or `{ "cel": … }` (causal loop), and only causal loop asks `FormCommit.EditText` (`CausalLoopDefinition.cs:196`), so no tool's behaviour changes either way | T316 |
| T235: a new `Task.Delay` in `PendingEditQueue.Tests.cs` | No | It waits for nothing to happen; SC-004 holds (above) | none |
| T233 to T235: the knowledge designer grew by 811 production lines and 17 files | No | The price of one strategy per value type and of four edit classes behind a table. Its longest method is now 64 code lines (141 at M6), and seven of its methods are between 53 and 64 | none |

**Noted while reviewing.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| `RdfRegistrationHeaders` has no caller in production | Do now, in T295 as reduced | Only `RdfRegistrationHeaders.Tests.cs` names it. `SkosRegistrationLanguage` reads the `language` header with a scan of its own that also finds a misplaced header, and rdf's task 9 turns it into `SkosLabelLanguage`. The class takes part in two of T295's three clone families | none (T295) |
| A second writer of the `.adp` registration | Later: follow-up feature 3 | FR-061 made `AdpRegistration` (in `EtAlii.Adp.Diagram`) the one type that owns the registration, at M4. Since standalone pull request 563, `PlaceInRegistrationCommandHandler` in `EtAlii.Adp.Hierarchy` writes the `layout:` block through FBL's `OpenRegistration` (FBL §8.3). It sits beside `SetRegistrationLayoutCommand`, which writes through `AdpRegistration`. FBL's internal `RegistrationDocument` reads the headers by FBL §8.1 as well. databricks' task 13 and c4's task 16 plan to write positions through the same FBL writer, as ruled for them. Which of the two owns the registration in the end is a decision across the conversions, not a refactoring | none |
| rdf's library tasks put three DISL methods over 50 code lines | No task; told to rdf's owner | `DislModelBuilder.DerivedNode` 58 (584), `DislKnots.Components` 54 (586), `DislSpecification`'s constructor 50 to 56 (584, 586). It is the conversion's code, and SC-023 is met | none |
| SC-005 cannot be met as written | Question 2 | Below | none until it is ruled |

## New candidates

**From the method-length count.** All of it is answered under *Named candidates*: the three survivors over 80 are T313 to T315, and the rest is no or overtaken.

**From the clone scan.**
- **`C4SessionFactory`/`DatabricksHeaders` (7), `Headers`/`SessionFactory` (12), `RegistrationHeaders`/`SessionFactory` (5) and `Headers`/`RegistrationHeaders` (5).** These are T295's, as reduced below. With c4's reader on `AdpRegistration`, `RdfRegistrationHeaders` deleted and `DatabricksHeaders` left to its conversion, no pair of the three remains.
- **The new 2- and 3-window families** (four bodies, six registrations, six resolvers). No. Each is the frame of a constructor or a registration, below what any earlier review took up.
- **The dependency-graph and timeline test twins (24 to 98 windows each).** Not M7's. The M8 review reads them with T246 and T284.

**What M7 made cheap.**
- **A knowledge value type:** one `KnowledgeValueType` in `KnowledgeValueTypes`, the one place the names are written.
- **A knowledge gesture:** one table entry with its `RequiresView`.
- **A tool's own layering or overlap rule:** `CyclePolicy.Relaxation` and `OverlapResolver.PushOffAlongAxes` are in the layout library, open to any layout.
- **A diagram drawn from a folder:** `OpenFolders<TFolder>`, `PluginFileYaml` and `FolderBodyEvents`, with `RetainedRegistry` at zero retention.
- **A YAML scalar a module writes:** `YamlScalars`, public.
- **A Wardley statement:** one entry in the keyword table and one builder on `WardleyWriter`.
- **Showing a move kept behaviour:** seven M7 tasks compared a dump before and after, from 43 Wardley documents to 1.36 million replayed knowledge gestures, and T239 and T240 showed theirs changed under sabotage. M8's moves can be judged the same way.

**What M7 made pointless.**
- `BudgetedGraphBuilder` and the builder types of FR-086, through DISL's budgets and rdf's tasks 8 to 11.
- T295's databricks part, through databricks' task 11.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014):
- T233 to T240, T294 and T302 were ticked in their own `etalii.adp` pull requests (above).
- T241 is ticked in this pull request, as reduced below. Its non-rdf part is standalone pull request 575.
- T242 ([M7-measurements.json](M7-measurements.json)) and T243 (this record) are ticked in this pull request. T244 is ticked with its delivery.

**Struck:**
- **T231 (`OwlProjection` as a builder, and `BudgetedGraphBuilder`): overtaken.**
  - rdf-disl-fbl's task 11 moves `OwlProjection` into rdf's test project as the oracle.
  - The budget cut is DISL's `limits.budgets` since rdf's task 4.
  - (FR-012; M6 review, question 4 (a).)
- **T232 (`SkosProjection` and `RdfProjection` as builders): overtaken.** rdf's tasks 9 and 8 move them likewise.

**Reduced:**
- **T241, to its non-rdf part, and so done.**
  - `OwlValidator.Judge` and `OwlModelIndex.Build` go with rdf's task 11.
  - The rdf methods T241 left to this review go with rdf's tasks 8 to 11.
  - `ComputeNested` went with T240 and `KnowledgeEdits.SetCell` with T234.
  - The five that moved into the twenty longest are answered above (T313 to T315).
- **T295, to c4 and rdf.**
  - **c4:** `C4SessionFactory` reads the `view:` header as `AdpRegistration.Read(path)?.View`. A registration with two `view:` lines is held by a guard: c4 takes the first and `AdpRegistration` the last, so the task keeps c4's answer or enters the difference in the register before it merges.
  - **rdf:** `RdfRegistrationHeaders` and its test are deleted, since no production code calls the class.
  - **databricks, overtaken:** databricks-disl-fbl's task 11 removes `DatabricksHeaders` from the product and reads the resource key through its binding.

**Added, in M7 under *Added by the M7 review*, to be done before M8's first task:**
- T313: `DependencyGraphContextActionProvider.RunAsync` (83 code lines) under 50, one method per gesture as T241 split timeline's twin (FR-092, FR-012; SC-023).
- T314: `DatabricksContextActionProvider.RunAsync` (83) under 50, after reading databricks-disl-fbl's tasks 11 and 12 (FR-092, FR-012; SC-023).
- T315: `SparqlElementMapper.Elements` (86) under 50, one method per drawn kind (FR-092, FR-012; SC-023).
- T316: apply B-41 and B-42 as ruled, in `DislNotationReader.EditText` and `FormCommit.EditText`, with a guard for each shape seen to fail first; if the ruling keeps a reading, the difference goes to `etalii.adp` (FR-079, FR-002, FR-085; B-41, B-42).

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `531698115`:
- **Closed:** ansible-structure 12 of 12, azure-devops-pipeline 12 of 12, causal-loop 11 of 11, dependency-graph 9 of 9, **dotnet-dependency-graph 10 of 10 (closed in M7)**, helm-chart 11 of 11, timeline 7 of 7.
- **Open:**
  - c4, 12 of 17. Its tasks 13 to 17 wait on the language changes for gaps C1 to C7.
  - databricks, 9 of 15. Its task 10 waits on FBL gaps 1 and 2, task 14 on a canvas player for `simulate`.
  - **functional-decomposition-graph, 8 of 12 (started in M7).** Its task 9 waits on nothing since FBL 0.8's insert constant (ruled in chat 2026-10-22).
  - **rdf, 5 of 18 (started in M7), task 6 in progress.** Tasks 8 to 11 wait on rdf's own measurement, and only task 17 waits on a language change.
- **Not started:** sankey 0 of 12, sparql 0 of 11, supply-chain 0 of 12, wardley-map 0 of 13.

So:
- **T231 and T232: overtaken (struck).**
- **T241: reduced to its non-rdf part, done.**
- **T295: reduced to c4 and rdf.** c4 keeps `C4SessionFactory` as the host's (its design, *What remains*) and reads a registration as today through its task 14. rdf does not call `RdfRegistrationHeaders`. databricks' part is overtaken.
- **T313: stands.** dependency-graph has closed.
- **T314: stands.** databricks' stage two changes the commands, not the provider's dispatch.
- **T315: stands.** sparql keeps its mapper unchanged.

## Behaviour changes

**Ruled and applied since the M6 review:**

| Row | What | Ruled | Applied by |
|---|---|---|---|
| B-38 | A whole JSON number reaches CEL as an int | 2026-10-20, question 1 of the M6 review | T308, standalone pull request 556 |
| B-40 | A label's bare-string `text` is the editor's literal text | 2026-10-20, question 2 of the M6 review | T309, 555 |

M7's own tasks changed no behaviour: seven compared a dump before and after, T241 held recorded layouts, and T235, T237 and T294 rest on their guards. The two rulings during M7, on T239's spread and T302's `YamlScalars`, chose ways that keep behaviour.

**Entered by this review:**
- **B-41, open.** A bare-string `editText` is compiled as CEL; DISL §2.3 makes it literal text. T316 applies it. Question 1.
- **B-42, open.** An `editText`, or a `text` without `editText`, written `{ "attribute": … }`, and an `editText` written as a LocalizedText map, open the editor on no text through `FormCommit.EditText`; DISL §6.12 says the attribute's value. T316 applies it. Question 1.

M8 needs no row. T316 waits on B-41 and B-42, and comes before M8.

## Follow-up features

The two of the M6 review stand as written there: the modules reading DISL typed, and the FBL and C4 language changes the conversions wait on. The second is partly answered: FBL 0.5 answered the scalar read as written, and spec 033 (FBL 0.8, standalone pull request 588) added an insert's constant, which unblocked functional-decomposition-graph's task 9. databricks' gaps 1 and 2, c4's C1 to C7, rdf's gaps 1 and 2 and wardley-map's gaps still have no feature. The three of the M4 review stand as written there.

3. **One owner of the `.adp` registration.** Core reads and writes registrations through `AdpRegistration` (FR-061), and FBL's library reads and writes them through `RegistrationDocument` and `OpenRegistration` (FBL §8).
   - Since standalone pull request 563, core's `PlaceInRegistrationCommand` writes positions through FBL's writer, beside `SetRegistrationLayoutCommand`.
   - databricks' task 13 and c4's task 16 are ruled to write through it too.
   - The two readers scan headers by different rules: `AdpRegistration` stops at the first line that is neither `body:` nor `view:`, while FBL §8.1 reads the headers a binding declares.

   A feature would make one the front of the other, so that a registration has one reader, one writer and one cache. It touches core, FBL and three conversions' plans, and the decision on FBL §8.5's pruning, which databricks' owner left to a ruling of its own. First estimate: one specification of about eight tasks, after databricks' task 13 or c4's task 16 has shown what FBL's writer must do for every tool.

## Questions for the maintainer

**1. B-41 and B-42: the text a label's inline editor opens on.**

DISL §2.3 types `editText` as a Message, so a bare string in it is literal text, and §6.12 says that an `editText` written `{ "attribute": … }` opens the editor on that attribute's value. The runtime departs from both:
- it compiles a bare-string `editText` as CEL;
- it opens on no text for `{ "attribute": … }` in `editText`, for a label's `text` written so when it has no `editText`, and for a LocalizedText map in `editText`.

Only causal loop asks `FormCommit.EditText`, and it writes `{ "cel": … }`, so no shipped tool behaves differently whichever is chosen.

- (a) **Both as DISL says: the bare string is literal text, an attribute binding opens on the attribute's value, and a map on the locale's text.** *Recommended*: the runtime then reads what the specification says, as B-40 was ruled for `text`. It costs a few lines in `DislNotationReader.EditText` and `FormCommit.EditText` and a guard per shape, each seen to fail first (T316).
- (b) Correct the attribute binding and the map, keep the bare-string `editText` as CEL, and send that difference to `etalii.adp` as a feature of its own (FR-085). `editText` would then be the one Message position where a bare string is an expression.
- (c) Keep both readings and send both differences to `etalii.adp`. A label bound to an attribute keeps opening its editor on no text through `FormCommit.EditText`.
- (d) Other.

**2. SC-005: how is "test code at least 5,000 lines smaller than the baseline" measured?**

SC-005 is due at M9 and is part of M8's exit (plan.md). Test code was 132,238 lines at the baseline and 128,958 at M0. It grew in every milestone since, +5,206, +7,750, +8,150, +8,748, +8,754, +5,001 and +8,567, and is 181,134 now, 48,896 above the baseline.

Most of the growth is tests no task of this feature can remove:
- the conversions' parity and derivation tests (in M7 alone 5,931 of 8,567);
- the new tools' tests (3,071 for the editors at M1);
- the guard every defect leaves.

M8's tasks remove copies (T245 to T254, T284), but no count of copies removed can bring the whole tree 5,290 lines under the baseline.

- (a) **Count the consolidation itself.** SC-005 is met when the pull requests of the tasks the coverage table lists for SC-005 (the test-code tasks of M0, M1's contracts and M8) remove at least 5,290 test lines net, summed from `git diff --numstat` of their merge commits over the test projects, with no test removed that a contract or harness test does not cover. *Recommended*: it measures what the criterion was written for, the copies this feature removes, and leaves out the tests other work adds. It costs an amendment of SC-005, with this review named beside it, and a sum the M8 review makes from the merge commits.
- (b) Keep SC-005 as written. The M9 review then records it as missed, with this reason; nothing changes now.
- (c) Other.

**Answers.** Not yet given when this review was written. T316 waits on question 1. SC-005 stands as written until question 2 is ruled.

The maintainer answered both on decision cards on 2026-10-22, each with the recommended option: question 1 (a), both as DISL says, which T316 applies; question 2 (a), count the consolidation itself, so SC-005 is amended in the specification with this review named beside it, and the M8 review makes the sum.

## Ownership

M7 was owned by one developer, signing as `agent-1-<task>` (FR-006), in a cloud session. A Remote Control session of the same developer on a Mac mini did T240 and T241's non-rdf part. M8 is owned by the same developer, agent 1, unless the maintainer hands it over with this review.
