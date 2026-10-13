# M1 review: the module middle layer, piloted

**Measured at**: `etalii.adp.ide.standalone` `3daf9654c`, the merge of pull request 224, 2026-10-13 | **Previous record**: [M0-review.md](M0-review.md), [M0-measurements.json](M0-measurements.json) at `d5278a3c6` | **Written by**: agent 1, the feature's developer, from the notes kept at each band's check and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M1 wrote the seven base types of the middle layer once, against sankey, and moved supply-chain, functional-decomposition-graph and gartner-hype-cycle-graph onto them unchanged in kind: every pilot now has the shape of report 1.7, and every base type serves all four. The pilots' production code is 2,511 lines (17%) and 15 files smaller; core production grew by 1,378 lines in the three projects that hold the bases, so the middle layer has paid for itself before M2 rolls it out to fifteen more modules. Nothing needed a switch on the module type: the bases gained hooks where a pilot did more (supply chain follows a selection, ghg reads and writes through FBL), each added in the first pull request that used it. What did not fit is the file count: at the pilots' rate SC-006's 250 fewer files is out of reach at M2, while its 9,000 lines looks safe; that is asked below. The twenty-run stability check on `develop` failed once, in a YAML editor client test outside the middle layer, so SC-002 is not met. The review adds T272 to T276 (the three new editor sessions join T144, a resolver contract test and a store-taking resolver base before the rollout, the nightly stability schedule, which has not fired once, and that YAML test) and strikes nothing.

## Measurements

The previous record is M0 at `d5278a3c6`. Between the two, other specifications landed beside M1: the JSON, YAML and XML editors (standalone pull requests 199, 203, 204, 205), which added six projects, 5,559 lines and three `Thread.Sleep` read-retries, and a few hundred lines of knowledge designer, hierarchy and problems work. Their figures are named where they move a total.

| Figure | M0 (`d5278a3c6`) | Now (`3daf9654c`) | Target |
|---|---|---|---|
| Projects | 130 | 136 (the six editor projects) | about 134 at the end (plan) |
| Files, all | 2,153 | 2,238 | |
| Lines, all | 259,699 | 266,416 | |
| Lines, core production (17 projects) | 37,458 | 38,968 (+1,510; `EtAlii.Adp.Diagram` +990, `EtAlii.Adp.Documents` +207, `EtAlii.Adp.History` +181) | |
| Lines, core test (21 projects) | 46,172 | 47,560 (+1,388; `EtAlii.Adp.TestSupport` +415 for the three contracts, `EtAlii.Adp.Backend.Tests` +719) | |
| Lines, diagram production | 87,245 | 84,737 (−2,508) | SC-006: 9,000 smaller than the baseline's 87,306 at M2 |
| Files, diagram production | 959 | 944 (−15) | SC-006: 250 fewer than the baseline's 961 at M2 |
| Lines, the four pilots' production projects | 14,766 | 12,255 (−2,511) | |
| Lines, diagram test | 76,590 | 77,299 (+709, the pilots' contract tests) | |
| Lines, editor production / test | 463 / 935 | 2,951 / 4,006 (the three new editors) | |
| Lines, production | 130,741 | 132,252 (+1,511) | |
| Lines, test | 128,958 | 134,164 (+5,206; 3,071 of them the new editors' tests) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 1,564 / 330 | 1,517 / 304 | |
| Context-source-resolver windows | 291 | 283 | SC-008: fewer than 31 at M2 |
| Session windows | 182 | 160 | |
| Session-factory windows | 54 | 45 | fewer than 9 at M2 |
| Property-provider windows | 39 | 31 | fewer than 15 at M2 |
| Document-store windows | 98 | 63 | fewer than 43 at M2 |
| Action-provider windows | 80 | 70 | fewer than 41 at M2 |
| Reloader windows | 23 | 14 | |
| `Edits` windows | 66 | 18 | |
| Clone scan, test: shared windows / files | 1,766 / 261 | 1,997 / 281 | |
| Methods over 50 code lines | 182 | 177 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 44 | 42 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 313 | 322 (the editors) | |
| `PackageReference` edges | 227 | 244 (the editors) | |
| `InternalsVisibleTo` edges | 41 | 45 (one per new editor project and one for `EtAlii.Adp.Editor`) | |
| Projects without a `.cs` file | 1 (`EtAlii.Adp.Sessions`) | 1 | SC-013: none at M5 |
| Core references naming a tool module | 11 | 11 | SC-013: none at M5 |
| `Task.Delay` and `Thread.Sleep`, test code | 52 | 54 (one in the YAML editor's tests, one absence window in `SupplyChainSession.Tests.cs`) | |
| `Task.Delay` and `Thread.Sleep`, production code | 7 | 10 (the read-retry of the JSON, XML and YAML editor sessions) | SC-010: no `Thread.Sleep` at M3 |
| Polling helpers | 10 | 10 | SC-003: one at M3 |

**The pilots, before and after.** Measured as production projects:

| Module | Files | Lines | Code lines |
|---|---|---|---|
| sankey | 39 → 35 | 3,220 → 2,682 | 2,117 → 1,745 |
| supply-chain | 42 → 38 | 3,564 → 3,013 | 2,361 → 1,972 |
| functional-decomposition-graph | 44 → 40 | 3,207 → 2,521 | 1,897 → 1,465 |
| gartner-hype-cycle-graph | 65 → 62 | 4,775 → 4,039 | 2,916 → 2,438 |

Within the pilots, the band checks scanned the roles the bands touched. Band A (T049): the store, entry, reloader, document-factory, session-factory and changed-event files went from 24 to 8 and from 84 shared windows to none. Band B (T055): the session and resolver files kept their count of 8, went from 1,333 lines to 591 and from 181 shared windows to 26, and the 26 are the derived classes' constructors and one-line overrides, not logic. Band C removed the three `*Edits` files and the `XEdit` struct of each pilot; the largest family of M0's `Edits` role (`FdgEdits`, `SankeyEdits`, `SupplyChainEdits`) is gone from the scan.

**Clone families.** Of M0's twenty largest production families, three are gone (the pilots' resolver families and the three `*Edits`) and the rest are unchanged. Three new families entered at the top, all from the new editors: `JsonEditorSession`/`MarkdownEditorSession`/`XmlEditorSession` (67 windows), `PlainEditorSession`/`YamlEditorSession` (60) and the five editor sessions together (18). In the test code the new editors bring the `WatcherObligations`, `ReadRetry` and `SpeaksAfterLateConfiguration` families (35 to 65 windows each). `FdgContextSourceResolver.Tests`/`GhgContextSourceResolver.Tests` (46 windows) is unchanged since M0; band B kept the pilots' resolver tests as they were.

**Long methods.** The twenty longest are M0's twenty. Two methods left the over-80 list and five the over-50 list, all in the pilots' providers and handlers. The pilots' longest methods are their layouts, `SupplyChainLayout.Arrange` (138) and `SankeyLayout.Compute` (127), which T123 and T124 move onto the layout library in M3.

**Project graph.** M1 changed no project reference: the bases live in projects the pilots already referenced (`EtAlii.Adp.Diagram`, `EtAlii.Adp.Documents`, `EtAlii.Adp.History`, `EtAlii.Adp.TestSupport`). The edges added since M0 are the six editor projects'.

## Exit condition and success criteria

The exit condition of M1 (plan.md): the four pilot modules have the shape of report 1.7; the seven base types each serve four modules. SC-014 is due at M0 and M1. Its review also asks whether each base type fitted four modules without a switch, whether the estimates per role hold (and SC-006 with them), whether the rollout order of M2 should change, and whether the entry type can carry a parse outcome already.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| The four pilots have the shape of report 1.7 | Met | 4 of 4 | T063: every pilot has `Diagram.cs`, `ServiceCollection.AddX.cs`, the store and its interface over the shared entry, the session, the resolver, the mapper, the action and property providers, the parser and writer (ghg: `GhgBody` over its FBL binding, with a parser for the problems), the model and the commands with their `XEditHandler`. The types beyond the shape, each with its reason, are listed under *The pilots beside report 1.7* below |
| The seven base types each serve four modules | Met | 7 × 4 | At `3daf9654c` each pilot's production project uses `IDiagramDocumentStore` with `DiagramDocumentReloader<TStore>` (T043), `LifecycleDocumentStore<TBody, TModel>` with `DocumentEntry<TBody, TModel>` (T044), `AddDiagramSession` and `AddEmptyDocument` (T045), `DocumentDiagramSession<TBody, TModel>` (T050), `DiagramElementSourceResolver<TModel>` (T051), `DocumentEditHandler<TCommand, TStore, TBody, TModel>` (T057) and `DiagramActionProvider`/`DiagramPropertyProvider<TBody, TModel>` (T058), one file each (a search of the four projects for each name) |
| SC-014, exercised on Windows (M1 half) | Met | 0 failed, 0 skipped | T267, run by the maintainer on 2026-10-12 on Windows 11 in Developer Mode against `25669b48f`: `EtAlii.Adp.Tests` 61, `EtAlii.Adp.Hierarchy.Tests` 414 and `EtAlii.Adp.Problems.Tests` 99 tests, the six link guards among them. M1 changed no containment code |
| SC-002, twenty identical runs (kept true between reviews by T271) | Not shown at M1 | Not met: 19 of 20 | The nightly schedule of T271 (standalone pull request 193, merged 2026-10-12 20:35 UTC) has not fired: the Stability workflow lists four runs, all started by hand on 2026-10-12, and none from a schedule. A run was started by hand on `develop` `3daf9654c` for this review; it passed 19 of 20, below. T275 makes the schedule fire and T276 steadies the failing test |

**The review's four questions.**

- *Did each base type fit four modules without a switch?* Yes. No base type tests which module it serves. Where a pilot did more than sankey, the base gained a hook, added in the pull request that first used it, because an unused hook fails the inspection job: `Rerender()` and `OnDisposing()` on the session base and the watch and element ids on the resolver's `Follow`, for supply chain's selection highlight (pull request 213); `ReadOnlyRefusal` beside `ParentRefusal`, for fdg's and ghg's own wording (214); `ITextBody<TSelf>`, so the handler base can copy a body to undo it, implemented by `LineDocument` (217) and `GhgBody` (223); `Load(target)` on the action frame and the target on its `Validate`, for ghg's validation, which reads the model (223). Four departures from the data model's type parameters were needed because the store, not the entry, is what the modules share; they are listed under *Departures from the data model*.
- *Do the estimates per role hold, and SC-006 with them?* For lines, yes; for files, no. The pilots lost 628 lines each on average (17% of their production code), and the remaining fifteen modules with real code hold about 71,700 lines: at the pilots' rate they lose about 12,000, more than SC-006's 9,000. The pilots lost only 15 files between them, because a file goes only where a whole role goes (a reloader, a factory, an `*Edits` class). The fifteen modules hold 81 such files (reloaders, changed-event and unsubscriber types, session and document factories, `*Edits` and private entry types, by name at `3daf9654c`); with the RDF family's four sessions becoming one and the watched-folder copies one store, the end of M2 lands near 100 fewer files, not 250. Asked below.
- *Should the rollout order of M2 change?* No. The order puts agent-behavior-modelling and agent-activity-diagram first and timeline and dependency-graph next to each other. Agent-activity-diagram reads and writes through FBL like ghg, which `ITextBody` now covers; timeline and dependency-graph share most of their code, so the second of them gets the first one's answers at once. Nothing the pilots found makes another module a better next step.
- *Can the entry type carry a parse outcome already?* Not needed now: see the first named candidate.

**The stability run.** Started by hand for this review on `develop` `3daf9654c`, 2026-10-13: [run 5](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/38367112037), 19 of the 20 `dotnet test` runs green. Run 16 failed in `EtAlii.Adp.Client.Tests`: the first case of `src/editors/yaml/client/yamlScalarColour.test.tsx`, "plain scalars yes is coloured as the type YAML 1.2 reads it as", found no text carrying the string class (`expected [] to include 'yes'`), and vitest's run failed as a whole with it. The other cases of the same table passed, and the test is the YAML editor's (standalone pull request 204), not M1's. Inferred, not reproduced: the first editor the file mounts is checked before CodeMirror has highlighted it, which a cold, slow runner can expose. T276 makes the test wait for the parse and sees it fail without the wait first.

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| The entry type carries a `ParseOutcome` already | No | The pilots never read the entry's failure field themselves: at `3daf9654c` only the store base, the provider frames, `DocumentEditRun` and `DocumentStoreContract` read `Unreadable` or `IsUsable`, and no file of the four pilots does. A module on the bases therefore sees the entry only through core, so T139 can change the entry in M3 by changing core and each parser, not every module's entry handling. Doing it now would design `ParseOutcome` before T140 has looked at the five parse styles it must carry | none |
| A `DocumentBasedDiagramModule` registration for store, reloader, session and resolver | No | Each pilot registers the five in five one-line calls (`AddEmptyDocument`, `TryAddSingleton` of the store, `AddDiagramSession`, `AddDiagramDocumentReloader`, the resolver), as `ServiceCollection.AddSankey.cs` shows. One call would save four lines per module and hide which of the five a module replaces, as supply chain's session factory does with its selections. The M2 review's candidate on deriving `ServiceCollection.AddX.cs` asks the larger question with nineteen modules to read | none |
| Change the rollout order of M2 | No | Above, under the review's questions | none |
| The element mapper's `Diff` and `Same` | No: overtaken | No mapper of any module declares `Diff` or `Same` at `3daf9654c`; the one comparison is `DiagramDiff.Same` in `EtAlii.Adp.Diagram`, which the session base calls through `DiagramDocumentChangeHandler` | none |

## New candidates

**From the clone scan.**

- *The editor sessions* (67, 60 and 18 windows, the largest three production families). T144 replaces `MarkdownEditorSession` and `PlainEditorSession` with one `TextEditorSession`, and T145 their read-retry with `WatchedFile`; since M0 the JSON, XML and YAML editors added three more sessions of the same shape, with the same read-retry and its `Thread.Sleep`. **Do now**: T272 puts them on `TextEditorSession` and `WatchedFile` with T144 and T145 in M3, and moves their tests' shared families onto one contract. Without it SC-010 fails on three sleeps no task names.
- *`FdgContextSourceResolver.Tests` and `GhgContextSourceResolver.Tests`* (46 windows), and the `ContextSourceResolver.Tests` role (136 windows in 158 file pairs). The resolver base has no contract test, while the store, the reloader and the edit handler have one. **Do now**: T273 adds `DiagramElementSourceResolverContract` to `EtAlii.Adp.TestSupport` and puts the four pilots' resolver tests on it, before the band B tasks of M2, which then use it.
- *The 26 windows left between the pilots' resolvers* (T055). Three of the four resolvers load and follow their document the same way, so the resolver base could take the store and give `Load` and a default `Follow` itself; supply chain overrides `Follow`. **Do now**: T274, before M2's band B tasks, so fifteen modules derive from the smaller base rather than repeating the two overrides.
- `SankeyLayout`/`SupplyChainLayout`, `SankeyWriter`/`SupplyChainWriter` and `SankeyParser`/`SupplyChainParser` (28 to 30 windows each) are unchanged and stay with T123, T124 and T138. **No** new task.

**From the method-length count.** Nothing new: the twenty longest are M0's, and the pilots' two in the list are their layouts (T123, T124).

**What M1 made cheap.** A document-based module is now its notation: the parser, writer, mapper, layout and the `Apply` of each command, with persistence, the session, selection, undo and the providers' plumbing inherited. A module's contract tests are a class that names its store and its example. The provider frames give every module's menus and grid the same refusal of a document that could not be read (B-14).

**What M1 made pointless.** Nothing in the remaining tasks: the band tasks of M2 are what M1 piloted. The `XActions` and `XProperties` names of the data model are read as roles, not file names: the providers keep the names of the interfaces they implement (`XContextActionProvider`, `XContextPropertyProvider`), which nineteen modules, their tests and `creating-a-diagram-module.md` use; renaming them would change every module for no structure. **No** task.

**The pilots beside report 1.7 (T063).** Types beyond the shape, production code only:

| Module | Type | Lines | Why it is there |
|---|---|---|---|
| all four | `XToolboxProvider`, `XValidator` | 20 to 136 | Core seams report 1.7 leaves out: the palette and the Errors and Warnings panel. T150 and T151 (`DislToolboxProvider`, FR-052) remove the forwarding ones |
| sankey | `SankeyLayout` (with `SankeyBox`) | 369 | The column layout; `SankeyBox` is one of the box types FR-045 replaces with `Rect` |
| sankey | `SankeyArrangement` | 200 | "Arrange diagram": the order of each column with the fewest weighted crossings. A candidate for `OrderByBarycentre` (FR-045) |
| sankey | `SankeyColors`, `SankeyFormat` | 59, 36 | Notation: the palette words and the value format |
| supply-chain | `SupplyChainLayout` (with `SupplyChainBox`) | 448 | The stage layout; another FR-045 box type |
| supply-chain | `SupplyChainSelections`, `SupplyChainTrace` | 94, 146 | The trace highlight: what each connection selected, and the chain through it |
| functional-decomposition-graph | `FdgRelations`, `FdgConnectVerdict`, `FdgOwnership` | 106, 73, 169 | The relation table, the connect check the canvas mirrors, and the one cycle check; DISL constraints once the module has a definition |
| functional-decomposition-graph | `FdgRuleSet` (with `FdgBreach`) | 210 | The rules behind the validator (FR-052) |
| gartner-hype-cycle-graph | `GhgDefinition` | 227 | The bundled DISL definition's adapter, one of the seven T150 replaces |
| gartner-hype-cycle-graph | `GhgPhases`, `GhgScale`, `GhgArrangement`, `GhgGestures` | 268, 160, 65, 59 | Phase boundaries, the time scale, row packing and the connect gesture's attachments |
| gartner-hype-cycle-graph | `GhgBreach`, `GhgRefusals` | 32, 25 | The validator's breach record; the refusal sentences the body, the handlers and the parity tests share |

The model files beside each model record (fdg's elements, connections and geometry; ghg's trends, triggers, notes, influences and time unit) are the model.

**Departures from the data model.** Made while writing the bases, each in the pull request named:

- `DiagramDocumentReloader<TStore>` lives in `EtAlii.Adp.Diagram`, not `EtAlii.Adp.Documents`, which cannot reference `DiagramOrigin` (200).
- The store base is `LifecycleDocumentStore<TBody, TModel>` and the entry the shared `DocumentEntry<TBody, TModel>`, not a per-module `<TEntry, TBody>` (201); the session base is `<TBody, TModel>` and the resolver base `<TModel>`, not `<TStore, TModel>` (211, 212); the handler base is `DocumentEditHandler<TCommand, TStore, TBody, TModel>`, not `<TCommand, TEntry>` (217). All four follow from the store interface being shared.
- The empty document is a member of each parser (`SankeyParser.EmptyDocument` and its three siblings), registered with `AddEmptyDocument` (202).
- An edit returns the new `EditOutcome`, which replaces each module's `XEdit` struct; a command the handler base runs implements the new `IDocumentEditCommand`, deliberately not `IDocumentBoundCommand`, so history behaviour does not change (217). The model lookups the handlers and providers shared moved onto each model (`SankeyModel.NodeOf`, `FlowOf`, `IsTaken` and their siblings).
- The unique-name helper is the public `UniqueName.Of` in `EtAlii.Adp.History` rather than a protected member of the handler base, because ghg's parity tests compare it with DISL's `uniqueName` (223).

## Tasks added, reduced and struck

**Ticked** (merged, FR-014): T043 to T048 (standalone pull requests 200, 201, 202, 207, 208, 209), T049 (the band A check, recorded above), T050 to T054 (211 to 215), T055 (the band B check, recorded above), T056 (216), T057 (217), T058 (220), T059 (221), T060 (222), T061 (223), T062 (224, with `etalii.adp` pull request 156 for the bundled definition's text), T063 (recorded above), T064 ([M1-measurements.json](M1-measurements.json)), T065 and T066 (this pull request).

**Added**:

- T272: the JSON, XML and YAML editor sessions join T144 and T145 (FR-053, FR-050; SC-010).
- T273: a contract test for the resolver base, the pilots' resolver tests on it, before M2's band B tasks (FR-030, FR-035).
- T274: the resolver base takes the store and gives `Load` and a default `Follow`; the pilots drop their overrides, before M2's band B tasks (FR-027, FR-030).
- T275: make the nightly Stability schedule fire, and read its runs at each review (SC-002).
- T276: steady `yamlScalarColour.test.tsx`, the one failure of the M1 stability run (SC-002; FR-005).

**Struck**: none. **Reduced**: none.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `3daf9654c` are as the M0 review found them: fourteen with requirements, design and tasks written and no approval, no task done and no implementation log; `timeline-disl-fbl` and `fbl-written-text` approved on 2026-10-12, no task done. No conversion has started, so every remaining task under FR-012 **stands**. T058 to T060 wrote the provider frames and moved three pilots' providers onto them now, because `sankey-disl-fbl`, `supply-chain-disl-fbl` and `functional-decomposition-graph-disl-fbl` had not started; when they do, they replace the modules' halves of the frames, not the frames.

## Behaviour changes

Ruled since the M0 review: **B-13** (2026-10-12, keep T034's cancellation path) and **B-14** (2026-10-13, refuse an edit to a document that could not be read up front, in the menus and the grid; applied by standalone pull requests 220 to 223, guarded by `ADocumentThatCouldNotBeRead_IsRefusedByTheMenusAndTheGrid_AndWritesNothing` for sankey). Ghg's grid sentence, "The graph could not be read, so it cannot be edited.", became the frames' one sentence, which names the file.

Still open: B-07 and B-08, needed by M4 (T178) and M6; M2 needs neither. M2 puts fifteen more modules on the provider frames, so B-14's question returns for any of them that today lets a menu act on a document that could not be read; asked below.

## Follow-up features

None. Every finding of M1 serves a requirement of this feature.

## Questions for the maintainer

**1. SC-006 asks for 250 fewer files at the end of M2. The pilots suggest about 100.** The line target looks safe; the file target counts files that the rollout does not delete, because a module keeps one file per type of report 1.7.

- (a) **Keep SC-006 as written and amend it at the M2 review**, with the figure of nineteen modules rather than four. *Recommended*: the fifteen modules differ more than the four pilots did (the RDF family, the watched folders), so the M2 measurement is the better ground for a new number, and the criterion is not judged before then.
- (b) Amend now to "about 100 files fewer", in this pull request. Settles it today, from four modules' evidence.
- (c) Drop the file count and keep the lines. The lines say what SC-006 was for; the files were a proxy.
- (d) Other.

**2. B-14 for the rollout.** When M2 moves a module's providers onto the frames, a module that today lets a menu or the grid act on a document that could not be read starts refusing up front, as the four pilots now do.

- (a) **B-14's ruling covers every module the rollout puts on the frames**; each band C pull request names the modules whose behaviour changes and adds the guard. *Recommended*: it is the same change for the same reason, and asking it fifteen times would stop the rollout fifteen times.
- (b) A new row per module, each ruled before its band C task. Each change is seen separately; the rollout waits on each ruling.
- (c) Other.

## Ownership

M1 was owned by one developer, signing as `agent-1-<task>` (FR-006), with the maintainer's ruling on B-14 on 2026-10-13. M2 is owned by the same developer unless the maintainer hands it over with this review.
