# M9 review: the close

**Measured at**: `etalii.adp.ide.standalone` `8616924ec`, the merge of pull request 661, 2026-10-24 | **Previous record**: [M8-review.md](M8-review.md), [M8-measurements.json](M8-measurements.json) at `e0a11f9ad` | **Written by**: agent 1, the feature's developer, from the reviews M0 to M8, the measurements and the code at `8616924ec` (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

The feature is done but for one test. Of the twenty-eight success criteria, twenty-six are met at M9, six of them as a review amended them and SC-014 as ruled, seen on Windows once. SC-002 is not met at this review's run: 19 of 20, with one test of spec 029's designer failing once, which T319 steadies; the spec closes when it is merged and a run is 20 of 20. It was, as *Afterwards* below records. SC-025's second half did not hold: the architecture pages twice had to be corrected for sentences the work had made false. Every defect D1 to D10 is closed with a guard seen to fail, and none was struck.

At M9:
- **Test code removed: 5,941 lines net.** That is the sum of the coverage table's tasks against 5,290 (SC-005 as amended), with T317 adding 215 lines to M8's 5,726.
- **Diagram modules' production code: 10,938 lines and 100 files smaller than the baseline**, the stubs not counted. The targets were 9,000 and 80 (SC-006).
- **Long methods: 122 over 50 code lines and 13 over 80.** The targets were 123 and 22 (SC-023).
- **The 48 stub modules are unchanged** (SC-027).

Three of the four M9 tasks are done here, and T264 waits on T319:
- T261: [M9-measurements.json](M9-measurements.json) and the stability run, 19 of 20.
- T262: standalone pull request 661, which corrected 30 sentences of the five architecture and module pages.
- T263: this review.
- T264: the last ticks and the specification's status line, after T319 and a stability run of 20 of 20.

The review adds no task and strikes none. It marks B-13 as applied and lists eight follow-up features in order of value. It corrects one record: the M0 review paired D1, D3, D7 and D8 with the wrong guards. It asks the maintainer nothing.

## Measurements

Between M8 and M9, seven pull requests merged in `etalii.adp.ide.standalone`:
- This feature: T317 (657), T318 (658) and T262 (661).
- Spec 029: 644 and 659.
- The conversions: sparql's last task (656) and sankey-disl-fbl's first (660).

| Figure | Baseline | M8 | M9 |
|---|---|---|---|
| Projects | | 146 | 146 |
| Production lines (files) | 129,850 | 143,099 | 143,398 (1,588) |
| Test lines (files) | 132,238 | 188,573 | 189,266 (1,232) |
| Diagram production lines (files), stubs included | 87,306 (961) | 76,320 (861) | 76,320 (861) |
| Production clone windows (files) | | 291 (185) | 297 (187) |
| Test clone windows (files) | | 1,533 (279) | 1,450 (280) |
| Methods; over 50; over 80 code lines | | 3,832; 121; 12 | 3,838; 122; 13 |
| Edges: project, package, framework, `InternalsVisibleTo` | | 404, 256, 4, 44 | 404, 256, 4, 44 |
| Fixed waits in tests; in production; polling helpers | | 16; 4; 3 | 16; 4; 3 |

The whole tree grew from the baseline because the conversions and two designers arrived alongside this feature. A whole-tree figure therefore says little about the feature, which is why the M7 review re-based SC-005.

What moved between M8 and M9:
- **T317:** −252 lines in `DependencyGraph.Tests` and −254 in `Timeline.Tests`, against +291 in `EtAlii.Adp.TestSupport`.
- **Spec 029:** +299 in `HierarchicalRequirement` and +363 in its tests. It added a production clone family, `CategoryStateOperations` / `TagOperations` with 6 windows, and `CategoryStateOperations.Apply` (89 code lines) entered the twenty longest methods. That is the one method over 50 that M9 gained.
- **Sankey-disl-fbl task 1:** +545 in `Sankey.Tests`.

The conversions running beside this feature stood as follows, by their own task lists:

| Conversion | Tasks done |
|---|---|
| c4 | 12/17 |
| databricks | 9/15 |
| rdf | 6/18 |
| sparql | 11/11 |
| sankey | 0/12 |
| supply-chain | 0/12 |
| wardley | 0/13 |

## Success criteria

Every figure is read from [M9-measurements.json](M9-measurements.json) at `8616924ec`, or from the code at that commit where the measurements do not hold it, against the baseline as [baseline.md](baseline.md) restates it.

| Criterion | At M9 | Figure | Evidence |
|---|---|---|---|
| SC-001, no fixed wait for a stream to become live, and its constant gone | Met | 0 of 25 | Met at M0 (standalone pull request 178). `StreamStartupGrace` appears nowhere under `src/`, and none of the 16 waits in tests is a flow test's |
| SC-002, twenty identical runs at M0 and at M9 | Met after T319 | 19 of 20 at `8616924ec`; 20 of 20 at `d9b9a136d` | Met at M0, 20 of 20 at `d5278a3c6`. The record between is in the reviews: 19 or 18 of 20 at M1 and M3 to M6, each failure steadied by a task; 20 of 20 at M2, M7 and M8 |
| SC-003, one sign-in, one add-project and one channel helper from M0; one wait-until helper from M3 | Met as amended | 3 polling helpers, all in `StreamProbe` | Amended by the M0 review (the wait-until helper due at M3) and the M3 review, question 4: `Eventually` and the stream probe. The three helpers of M0 met at M0 |
| SC-004, no test waits in real time for a debounce, an idle eviction or a retry | Met | 16 fixed waits in tests, the same sites as at M8 | Met at M3, held at M5 and M7, each site read. One site no review named: `CelProgramCache.Tests.cs:19` `Thread.Sleep(20)` (T212, M6), standing in for a slow compiler in a concurrency test. It waits for no debounce, eviction or retry |
| SC-005, test code 5,000 lines smaller, no test removed without cover | Met as amended | 5,941 net | Amended by the M7 review (the coverage table's tasks remove at least 5,290 test lines net) and the M8 review (pull request 186 counts). M8 summed 5,726. T317 (657) removes 215 more by the same method, `git diff --numstat` against the first parent over the test projects and the two testing projects. Its 36 document cases became 18 in `LineDocumentContract`, which both modules run in full. T318's 8 lines are FR-094's, not SC-005's |
| SC-006, diagram production code 9,000 lines and 80 files smaller at M2, stubs not counted | Met as amended | −10,938 lines, −100 files | Amended by the M2 review (250 files to 80). Met at M2 with −10,949 and −86. The stubs are taken out of both sides: 48 modules of 17 lines at the baseline and 16 at M9 (T163), in files that did not change in number |
| SC-007, no reloader, changed event but mindmap's, unsubscriber or own diff; at most four session factories and four document factories | Met as amended | 0 reloaders; 1 changed event kept; 0 unsubscribers; 4 session factories; 0 document factories | Amended by the M2 review (mindmap's event stays). Partly met at M2 with 12 document factories, which T277 (297) removed. At M9 the module code declares no `*Reloader`, no `*Unsubscriber` and no `*DocumentFactory`. `SupplyChainSelectionChangedEventArgs` is a selection, not a document change. The four session factories are ansible's, c4's, dotnet's and helm's |
| SC-008, clone windows: context-source resolver under 200, four roles under 50 | Met | 28; session factory 1; property provider 7; document store 3; action provider 14 | Met at M2 against the specification's figures. Also met against [baseline.md](baseline.md)'s restatement (<31, <9, <15, <43, <41), where the resolver's margin is the narrowest: 3 |
| SC-009, no command handler drops a save's warning | Met | 15 of 15 modules derive `EditHandlerContract` | Met at M2. Each band C pull request saw the contract fail first where the warning was dropped (D4). Not re-run at M9 beyond the suite |
| SC-010, one line document, rectangle, viewport test, number format, YAML scalar accessor and read-retry; no `Thread.Sleep` in production | Met as amended | 1 read-retry; 0 `Thread.Sleep`; 4 production waits | Amended by the M3 review, question 1 (the read-retry and the sleep to T283 in M5). The utilities met at M3, the rest at M5. The four production waits are the ones M5 read: the retry in `WatchedFile`, the validator's and the hierarchy watch's two |
| SC-011, fixtures lay out as before; every layering names its cycle policy | Met | 9 layouts on `Layering.LongestPath` | Met for the fixtures at M3, and for the layerings at M7 |
| SC-012, the diagram abstractions reference only the documents project and the shared primitives, with no hosting package | Met | `EtAlii.Adp`, `EtAlii.Adp.Documents`; packages Serilog and `Microsoft.Extensions.DependencyModel` | Met at M4 by the project file. T288 (439) removed the hosting package that arrived transitively, held by `ModuleHostingPackages.Tests` |
| SC-013, no project without code; no core project names a tool module | Met | 0 and 0 | `graph.without_cs_file` and `graph.core_naming_a_tool_module` are empty. In code, after T303, T304, T310 and T311, `src/backend` names modules only in the guards that check this and as fixture paths, which the M5 review accepted |
| SC-014, one containment implementation, exercised on Linux and Windows | Met, on Windows once as ruled | 1 `PathContainment` | Met on Linux at M0 (180), and on Windows at M1: T267, by the maintainer, 2026-10-12, at `25669b48f`, 0 failed. Ruled to be seen once (M0 review). The Build and Stability workflows run on Linux only, so later changes to containment were seen on Linux alone |
| SC-015, tool-kind precedence in one method; one discovery, catalog and registry for three kinds | Met | `ToolRouter` | Met at M4 for discovery, catalog and registry. T290 (442, B-27) removed the last partial ordering |
| SC-016, `projects.json` read at most once per request and per user between writes | Met | | Met at M4, held by `FilePromptFlow`'s `AnActionThatAsks_ResolvesTheProjectOnce` |
| SC-017, the hierarchy model at most half its size, with no I/O and no event under its lock | Met | 380 lines (target 459) | The lock clauses met at M5, the size by T296 (506). D10 |
| SC-028, every session type in the sessions project | Met | | Every declaration of the session store, the session context and interceptor, the three tool-session contracts, their factories and registries is in `src/backend/EtAlii.Adp.Sessions/` |
| SC-018, channels bounded; no blocking wait; no unobserved task | Met | 0 unbounded channels; 0 blocking waits | Met at M5. A search of production `src/backend` finds no `CreateUnbounded`, `GetAwaiter().GetResult()` or `.Wait()`. Unobserved tasks were read at M5 and are not searchable |
| SC-019, no raw JSON access in DISL's derivation code | Met | 0 lines outside `Loading/` | M6 met it for what FR-079 names, with 58 lines left. T305 (552) took them out, held by `RawJsonOutsideLoadingTests` |
| SC-020, one CEL program cache; one write loop for four families | Met | | Met at M6. The compile-per-call in c4's `C4Definitions.PermittedTypes`, which M6 handed to c4's owner, is still there; it is the conversion's code |
| SC-021, FBL fixtures and the DISL suite unchanged through M6 | Met | FBL 1,980; DISL 561; CEL 271 tests | Met at M6, in a fresh tree |
| SC-022, FBL's public types are those another project uses | Met as amended | 45 top-level (65 with nested) | Amended by the M6 review (72 is a baseline, not a target), held by `PublicSurface.Tests` |
| SC-023, at most 100 methods over 50 code lines and 20 over 80 | Met | 122 (target 123); 13 (target 22) | Against the baseline as [baseline.md](baseline.md) restates it. The margin over 50 is one method: spec 029's `CategoryStateOperations.Apply` took the place of `SkosLayout.FindKnot` in the twenty. rdf's long methods (`OwlProjection.Project`, 344) wait on rdf-disl-fbl, which overtook User Story 7 for rdf (M7 review) |
| SC-024, ten reviews, each merged before the next milestone's first task | Met | 10 | M0 to M9, each with its measurements. Each review merged before the first merge of the next milestone's tasks, below |
| SC-025, every pull request passed the four gates and the inspection job; none left the architecture pages describing what is no longer so | Gates met by the merge rule; pages not met | 8 sentences corrected at M4, 30 at M9 | The feature merged a pull request only once its Build checks, the inspection job included where it ran, were green, and after the four gates ran locally, which each description records. This review did not re-count the checks pull request by pull request. The pages did not hold: T181 (M4) corrected 8 sentences and T262 (661) 30 across `architecture.md`, `solution-structure.md` and the three module guides. Some were made false by this feature's own pull requests (the Workspace and Hierarchy rows, `SaveAsync` and `RunAsync`), and others by spec 029 and the conversions beside it; the review did not attribute each. At the close the pages are true as far as T262 read them |
| SC-026, every defect closed with a guard seen to fail, or struck | Met | 10 closed, 0 struck | Below |
| SC-027, the 48 stub modules unchanged | Met | 48 | The same 48 module names as the baseline, each 16 production lines (17 at the baseline), and no file under them changed since M8. Since the baseline each changed only by T163's rename (M8 review) |

**When each review merged (SC-024).** Each pair below gives the review's merge in `etalii.adp`, then the first merge of the next milestone's tasks in `etalii.adp.ide.standalone`, in Amsterdam time:

- M0: 2026-10-12 22:39, then 10-13 00:49.
- M1: 10-13 11:27, then 12:38.
- M2: 10-14 20:34, then 20:48.
- M3: 10-17 00:14, then 07:46.
- M4: 10-18 02:29, then 06:24.
- M5: 10-19 15:59, then 20:16.
- M6: 10-20 20:26, then 10-21 03:15.
- M7: 10-22 19:26, then 20:42.
- M8: 10-23 23:43, then 10-24 01:37.

Work on a milestone sometimes started in parallel with the review before it, as the maintainer directed, but none of it merged ahead of that review.

**The stability run (T261).** Started by hand for this review on `develop` `8616924ec`, the commit measured above: [run 40040896979](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/40040896979). Nineteen of twenty runs passed. Run 14 failed in one backend test, `OutsideChangeTests.AChangeThatMakesTheFileUnreadable_KeepsTheLastPage_ReadOnly_UntilItReadsAgain` of the hierarchical requirement designer (spec 029, merged 2026-10-23, after this feature's M0 baseline): after the file was made readable again, no readable page arrived within ten seconds. The cause is in the test, not the session: it counted the pages sent only after its own write, so when the session read the file and sent the page before the test's continuation ran, as a loaded runner allows, the page it waited for was skipped. A one-second delay after the write makes it fail every time, and counting before the write makes it pass with the delay. T319 is that change, followed by one more run. This is the same shape as T276 at M1: a test that read too early or too late, not a defect of the product.

## Defects

The defects are those of [the analysis](../analysis-2026-10-10.md) (D1 to D10).

**A correction to the M0 review.** It paired the four guards of standalone pull request 167 with D1, D3, D7 and D8 "following the description's order". That order is not the analysis's. Read against the analysis, the pairs are:
- D1, `LineSplice.Quote`: `Quote_AValueStartingWithAnIndicator_ReadsBackAsWritten`.
- D3, causal-loop labels: `CausalLoopQuotedTextTests`.
- D7, `matches()`: `CelMatchesFailureTests`.
- D8, integer overflow: `CelOverflowTests`.

All four were closed by the same pull request with the same evidence, so only the record changes.

| Defect | Closed by | Guard seen to fail |
|---|---|---|
| D1, `LineSplice.Quote` leaves indicators and bare words unquoted | Standalone 167 | `Quote_AValueStartingWithAnIndicator_ReadsBackAsWritten`. Pull request 167 records the failures: 8 CEL, 14 YAML and 5 causal-loop |
| D2, shortcuts sent without modifier flags | T032, T033 (190); azure-devops-pipeline's by T268, T269 (192) | Backend 2, client 2, tooltip 1 (M0 review) |
| D3, causal-loop labels not escaped | Standalone 167 | `CausalLoopQuotedTextTests` |
| D4, the save warning dropped in six modules' handlers | M2's band C, against `EditHandlerContract` | The contract, failing first in each module that dropped the warning (SC-009) |
| D5, history leaked by a failed or cancelled discovery | T034 (176); impossible by construction since T193 (458) | `ContextServiceWatchReleaseTests` (B-13) |
| D6, containment case-insensitive on Linux, escaping links accepted | T035 to T037 (180); Windows by T267 | Guards for case and for an escaping link (B-10, B-11) |
| D7, a `matches()` timeout not caught | Standalone 167 | `CelMatchesFailureTests` |
| D8, unchecked integer overflow | Standalone 167 | `CelOverflowTests` |
| D9, JSON and YAML disagree on an empty value on insert | Settled by FBL 0.6 §6.2 (B-09); applied by T216 (520), xml by T307 (548) | `insert-empty-json` and `insert-empty-yaml` as plain fixtures; `XmlNewElementTests` |
| D10, events raised under the hierarchy lock | T185, T190 (454) | 12 sites, each seen to fail |

## Tasks added, reduced and struck

Added:
- T319, in M9: the outside-change test of the hierarchical requirement designer counts the pages sent before its write, seen to fail with a delay after the write first; then the Stability workflow runs again (SC-002, FR-005).

Nothing is reduced or struck. T261 and T263 are ticked in this pull request; T264 waits on T319 and a run of 20 of 20.

**Afterwards (2026-10-24).** T319 merged as standalone pull request 665, and [run 40047572220](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/40047572220) on `develop` `d9b9a136d`, its merge, was 20 of 20. SC-002 is met, twenty-seven of the twenty-eight criteria are met, and T264 closed the specification.

## Behaviour changes

B-13 is marked applied: the behaviour the maintainer ruled to keep on 2026-10-12 is the one T034 (standalone pull request 176) made, so nothing further was ever due. Every other entry of [the register](../behaviour-changes.md) is applied or not a change.

## Follow-up features

These are the follow-up features of every review, in one list, in order of value. Each would be a feature of its own. None is part of this one.

1. **The FBL and C4 language changes the conversions wait on, in `etalii.adp`** (M6 review). They are still without a feature:
   - databricks gaps 1, 2 and 4;
   - c4's C1 to C7;
   - rdf's gaps 1 and 2;
   - wardley's gaps 1 to 4, 7 and 8.

   FBL 0.5 and spec 033 settled the others (M7 review). This comes first because it unblocks half the open conversions. Those conversions remove the largest production clone families left, the sankey and supply-chain twins, and rdf's long methods.
2. **One owner of the `.adp` registration** (M7 review): one specification of about eight tasks, after databricks task 13 or c4 task 16. Two readers and writers with different header rules on a file the user sees are a correctness risk, and the conversions are adding writes.
3. **One body base for the modules that read through FBL** (M8 review): one specification of about six tasks. There are five copies now (`FdgBody` and `GhgBody` share 11 windows), and there will be nine once the conversions write their bodies. It is timed by them.
4. **Modules read DISL typed, so `DislSpecification.Json` can become internal** (M6 review). It touches seven modules, two of them in conversions still running. It narrows the DISL surface that every module depends on.
5. **The text member on the workspace stream** (M4 review): about 10 files and 400 to 600 lines, standalone only. It replaces `EditorSessionAdapter`, which `DiagramPump` still uses.
6. **The three legacy wire calls kept for tests removed** (M4 review): a demultiplexer of about 150 lines in `TestSupport.Host` and about 40 flow files. It is cheaper now that the flows live in their modules (T251, T252).
7. **The wire's `Path` renamed and the `IoPath` alias retired** (M4 review): one `.proto`, two client files and the C# files that alias it, 505 `using IoPath` lines at M9. It is mechanical. The aliases that are already needless can go first, with no wire change.
8. **The five transcripts left off the harness moved onto it** (M8 review, by the ruling on T246's question 2): c4, databricks, functional-decomposition-graph, rdf and sparql. Functional-decomposition-graph closed during M8 and sparql at standalone pull request 656, so two are free to move now. Each is an adapter class and a short test class, best done as its conversion closes.

Handed to owners rather than proposed as features, and not repeated here:
- the Knowledge designer's intermittent test (M0);
- the client's `backendKey` modifiers (M0);
- c4's `PermittedTypes` (M6);
- c4's companions' layout row (M7);
- rdf's DISL methods over 50 code lines (M7);
- `AddCausalLoop` and `AddSparql` (M8);
- spec 029's two methods over 80 (M8).

## Questions for the maintainer

None. Every question of M0 to M8 has its answer on record. The M2 review's question 1 has no *Answers* line, but its ruling stands in the specification: SC-007's amendment and T277 both name it.

## Ownership

M9 was owned by agent 1, the feature's developer, signing as `agent-1-<task>` (FR-006), in a cloud session. That ends the feature's ownership: the follow-up features above have no owner until they are specified.
