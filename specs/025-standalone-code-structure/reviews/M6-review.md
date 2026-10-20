# M6 review: the specification projects

**Measured at**: `etalii.adp.ide.standalone` `514e784f1`, the merge of pull request 546, 2026-10-20 | **Previous record**: [M5-review.md](M5-review.md), [M5-measurements.json](M5-measurements.json) at `9a55998a5` | **Written by**: agent 1, the feature's developer, from the notes kept at each pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M6 restructured the three specification projects. What the FBL and DISL loaders shared now lives in a small project of its own, `EtAlii.Adp.Specification.Json`: one diagnostic, JSON Pointer escaping, the property helpers, the conversion to CEL scalars, duplicate-key detection and the `major.minor` version check (B-08). Compiled CEL programs are kept in one `CelProgramCache` per DISL specification and per FBL reading, and an FBL rule keeps the programs it compiled. The four format families write through one template, and D9 is closed. The FBL loader is a reader and a checker that report schema-invalid input at its pointer, a `Slot` is a closed hierarchy and every setting is parsed once. JSON is read with `Utf8JsonReader`, and YAML with YamlDotNet's scanner (B-29 to B-35). DISL's operations, actions, toolbox, menus, forms, constraints, hooks, names and notation are records read at load, each expression holding its program, and an expression read where the loader compiled none is a load error (B-37). The public surface of the three projects is what another project uses, and `PublicSurfaceTests` holds it. The FBL conformance fixtures and the DISL suite passed unchanged throughout.

Two things did not fit:
- **SC-019 is met for what FR-079 names, not to its letter.** Raw JSON reads in DISL outside the loader fell from 422 lines to 58. Of these, a type's label, icon, key and `derived`, a derived relation's pointers, the wire ids and a tool's initial literal are still read from JSON while a diagram runs. T305 moves them into the loader.
- **A whole JSON number reaches CEL as a double**, although `JsonScalars.ToCel`'s comment says an int. Its two copies did the same before T210 joined them. A body's `0` is an int and a binding's `"default": 0` is a double. B-38 asks which it should be.

The review adds T305 to T312 to M6 and strikes nothing. Four questions go to the maintainer: B-38, B-40, whether use by another project's tests counts as use (SC-022), and the rdf conversion against M7's T231 and T232.

## Measurements

Between M5 and M6, 42 pull requests merged (standalone 504 to 546; 545 was not merged).

**This feature: 26.**
- The M5 review's T296 to T301 (506 to 511).
- T303 (529), with its correction 546: the bootstrap logger now hands its events on to the logger that was global before it. Its guard is `LogCaptureThroughAFlowHostTests`.
- T304 (531), and the mind map's definition re-bundled from `etalii.adp` (530).
- Sixteen M6 tasks:

| Task | PR | Task | PR | Task | PR | Task | PR |
|---|---|---|---|---|---|---|---|
| T209 | 513 | T213 | 518 | T218 | 523 | T212 | 535 |
| T210 | 515 | T215 | 519 | T219 | 525 | T222 | 539 |
| T211 | 516 | T216 | 520 | T221 | 526 | T223 | 541 |
| T214 | 534 | T217 | 522 | T224 | 543 | T226 | 544 |

**Others: 16.**
- Nine of `databricks-disl-fbl`: 505, 524, 527, 528, 532, 533, 538, 540 and 542.
- Six of `c4-disl-fbl`: 504, 512, 514, 517, 536 and 537.
- One shared correction: 521, a refused drag snaps back.

The analysis scripts did not change since M5.

| Figure | M5 (`9a55998a5`) | Now (`514e784f1`) | Target |
|---|---|---|---|
| Projects | 142 | 144 (`Specification.Json`; `src/tests/EtAlii.Adp.Modules.Tests`, counted as *other*) | about 134 at the end (plan) |
| Files, all | 2,496 | 2,562 | |
| Lines, all | 298,158 | 306,428 (+3,269 production, +5,001 test) | |
| Lines, core production | 48,000 (20 projects) | 50,494 (21 projects; +2,494) | |
| Lines, core test | 60,273 (24 projects) | 57,601 (−2,672; 1,445 more moved to *other*) | |
| Lines, diagram production | 74,981 | 75,756 (+775: databricks +688, c4 +86) | SC-006, met at M2: at most 78,306 |
| Files, diagram production | 850 | 853 | SC-006, met at M2: at most 881 |
| Lines, diagram test | 99,228 | 105,456 (+6,228: the flows of T303, databricks +3,456) | |
| Lines, editor and designer | unchanged | unchanged | |
| Lines, production | 130,592 | 133,861 (+3,269) | |
| Lines, test | 167,566 | 172,567 (+5,001) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 354 / 202 | 355 / 200 | |
| Context-source-resolver / session / property-provider windows | 22 / 23 / 6 | 22 / 23 / 6 | SC-008, met at M2 |
| Action-provider windows | 14 | 13 | SC-008, met at M2: fewer than 50 |
| Parser / Writer / Validator / Tokenizer windows | 58 / 22 / 12 / 6 | 58 / 22 / 12 / 6 | |
| Clone scan, test: shared windows / files | 1,663 / 301 | 1,687 / 309 | |
| Methods | 3,357 | 3,472 | |
| Methods over 50 code lines | 158 | 147 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 34 | 31 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 369 | 382 (13 added, none removed) | |
| `PackageReference` edges | 248 | 252 (4 added, all `Modules.Tests`) | |
| `FrameworkReference` edges | 4 | 4 | |
| `InternalsVisibleTo` edges | 40 | 42 | |
| Projects without a `.cs` file | none | none | SC-013, met at M5 |
| Core projects naming a tool module | 0 | 1, which names no tool module (below) | SC-013, met at M5 |
| `Task.Delay` and `Thread.Sleep`, test / production | 15 / 4 | 15 / 4 | SC-004, SC-010 |
| Polling helpers | 3 | 3 | SC-003 as amended by the M3 review |

**The core projects, before and after.** Production lines per core project that moved by more than 50:

| Project | M5 | Now | Change |
|---|---|---|---|
| `EtAlii.Adp.Specification.Disl` | 7,672 | 9,676 | +2,004. T222 to T224, the typing at load, net +1,745 (+2,950, −1,205); about 190 from the c4 and databricks conversions; the rest T210 to T214 |
| `EtAlii.Adp.Specification.Json` | none | 163 | new (T209 to T211): six files, seven types |
| `EtAlii.Adp.Hierarchy` | 5,942 | 6,068 | +126 (T296, T299) |
| `EtAlii.Adp.Context` | 3,095 | 3,192 | +97 (T298, T300) |
| `EtAlii.Adp.Specification.Cel` | 1,877 | 1,947 | +70 (`CelProgramCache`, T212) |
| `EtAlii.Adp.Specification.Fbl` | 9,144 | 9,158 | +14 |

FBL hardly changed in size, although its contents changed a good deal:
- **Gone:** the 210-line byte-level JSON parser, and `YamlParser`'s line reader with `FlowReader` and `WellFormed()`.
- **Added:** the reader and the checker, the slot hierarchy, the enumerations and the four families' hooks.

DISL grew because a record read at load is longer than the `GetProperty` chain it replaces. Each record carries its pointer, its compiled program and the problem at that pointer.

The core test projects:
- `EtAlii.Adp.Backend.Tests` fell from 12,259 to 7,983 lines. T303 moved its single-module flows to the modules, and T304 moved its cross-module tests to `src/tests/EtAlii.Adp.Modules.Tests`.
- `Specification.Disl.Tests` grew by 996 lines, the typing's guards.

**Clone families.**
- **Smaller:** the action providers, from 14 to 13. `DatabricksContextActionProvider.Discover` left with the databricks conversion.
- **New:**
  - `Planner`/`Splices` (5) and `Splices`/`YamlScalars` (3). Databricks task 2 grew `DatabricksSplices` by 256 lines; its task 12 deletes the file.
- **No longer reported:** `ServiceCollection.AddCausalLoop`/`AddSparql` (3) and `ShaclElementMapper`/`SkosElementMapper` (3). None of their four files changed since M5, and no task concerns either pair.
- **Unchanged:** every other production pair, `YamlScalars`/`PipelinePlanner` (10, T302) among them.
- **Test code:**
  - The transcripts grew from 263 to 300 windows, and the bundled-definition tests from 30 to 39 (T284).
  - The flows T303 moved show up as two new pairs, `Flow.Tests` (22 windows in 32 file pairs) and `Flow.Tests`/`OwlFlow.Tests` (15). These replace `DatabricksFlow`/`RdfFlow` (21) and `OwlFlow`/`RdfFlow` (16): the same files, now in different projects.

**Long methods.** Over 50 code lines, 158 became 147; over 80, 34 became 31. In the three specification projects, the count over 50 went from 31 to 26 and over 80 from 5 to 4:
- FBL: 18 to 12.
- DISL: 9 to 10.
- CEL: 4 to 4.

- **Left the set:**
  - The M5 review's tasks: `SubmitInteraction` (58), the rename and delete handlers (82, 77, 66, 53), `HierarchyModel.ApplyFolder` (60), `HierarchyWatch.RunAsync` (58) and `DiagramPump.Open` and `RunAsync` (77, 62).
  - M6's tasks:
    - T217: `FblDocumentLoader.Check` (96), `FindDuplicateKeys` (52), `ReadAttribute` (61) and `ReadRule` (74).
    - T216: `JsonFamily.Insert` (52) and `XmlFamily.Write` (61).
    - T221: `FlowReader.Value` (58) and `YamlParser`'s `ParseBlockScalar` (66) and `ParseFlow` (73).
    - T224: `ConstraintEvaluator.Rule` (55).
  - The databricks conversion: `DatabricksContextActionProvider.Discover` (93).
- **Moved and still long:**
  - `XmlFamily.ReadStartTag` (68) is now `XmlParser.ReadStartTag`, and `LinesFamily.Parse` (67) is `LinesParser.Parse` (63), T219.
  - `HierarchyModel.ApplyFolder` (60) is now `HierarchyTree.ApplyFolder` (T296).
- **Entered:**
  - From M6's tasks:
    - T219: `JsonBodyParser.Parse` (54).
    - T221: `YamlParser.FlowNode` (56).
    - T222: `DislActionReader.Action` (53).
    - T223: `DislToolboxReader.Read` (54).
  - From earlier work: `EditPlanner.PlanAdd` (55) and `DiagramSnapshotSourceResolver.ResolveAsync` (52).
  - From the databricks conversion: `DatabricksDisl.BundleElements` (51) and `JobElements` (52).
- **The longest in the specification projects:**
  - Over 80, all named under *New candidates*: `ActionRunner.Action` (152), `DislModelBuilder.From` (100), `DislModelBuilder.DerivedRelations` (94) and `CelParser.Tokenize` (90).
  - Between 70 and 80: `DislNames.Resolve` (77), `CelParser.ParsePrimary` (76) and `DislModelBuilder.ExpressionForm` (76).

**Project graph.**
- **The new projects:**
  - `Specification.Disl` and `Specification.Fbl` reference `Specification.Json`, which nothing else references.
  - `src/tests/EtAlii.Adp.Modules.Tests` references `Backend.Service` and `TestSupport.Host`, and takes `TestSupport` through the shared targets.
  - Eight module test projects reference `TestSupport.Host` for the flows T303 moved.
- **`InternalsVisibleTo`, two grants added:**
  - `Specification.Disl` to `Diagram.Modules` (T224), so that the module host reads the typed operations.
  - `Hierarchy` to `EtAlii.Adp.Modules.Tests` (T304), for the editor-resolution test that moved there.
- **The one "core project naming a tool module":** it is the second grant. `graph.py` treats any project outside the core as a module. `EtAlii.Adp.Modules.Tests` is a test project of the host, not a diagram, designer or editor, so SC-013 still holds. T311 corrects the count.

**The YAML spike (T220).** It succeeded, as recorded in [M6-yaml-spike.md](M6-yaml-spike.md), and T221 replaced the line reader (standalone pull request 526):
- The yaml family reads YamlDotNet's tokens in one pass.
- `FlowReader` and `WellFormed()` are gone, and with them the hang on `[2, 2, SwitchCase: 1]`.
- Where the old reader departed from YAML, the maintainer ruled for YAML's reading (B-30 to B-35).

**The stability run.** [Run 16](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/39389430025), the only run since the M5 review, ran at `c77eeac43` on 2026-10-20.
- It failed once in 20: the 14th run's *Backend tests* step exited with code 2.
- Its log could not be read from the session this review was written in: the host that serves it refused the download, and the job's annotations name no test.
- So it is not known whether this is one of the flows T300 corrected, which merged before that commit, or a new one. T312 reads it.

## Exit condition and success criteria

The exit condition of M6 (T229): the specification projects are restructured. SC-019 to SC-022 are due at the end of M6, with D9 closed.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| The specification projects are restructured | Met, but for SC-019's remainder | every recommendation of report 6.1 to 6.9 done; 6.10 is the conversions' | 6.1: T215, T216. 6.2: T219 to T221. 6.3: T222 to T224. 6.4: T212 to T214. 6.5: T209 to T211. 6.6: T218. 6.7: T217. 6.8: T225, struck by the M4 review, and not needed (below). 6.9: T226 |
| D9: the families agree on an empty value on insert, by what FBL says | Met | `insert-empty-json` and `insert-empty-yaml` run as plain fixtures | B-09 was settled by FBL 0.6 §6.2 (spec 026) and applied with B-12 by T216 (standalone pull request 520); `InsertEmptyFixturesTests` is gone. The xml family's new element is outside D9, which named the JSON and YAML families, but not outside §6.2: T307 |
| SC-019: DISL's derivation code holds no raw JSON access (about 430 sites); what remains is in the loader | Met for operations, actions, toolbox, menus, forms, constraints, hooks, names and notation; not met to the letter | Lines naming `TryGetProperty`, `GetProperty`, `JsonElement`, `ValueKind`, an `Enumerate…` or a `DislJson` helper, outside `Loading/`: 320 at the report's commit `fcb64c9`, 422 at M5, 58 now. In `Derivation/` and `Behavior/`: 371 at M5, 14 now | Of the 58 lines:<br>• 24 convert or read at load: `DislValues` 13, `PluginFunctions` 11.<br>• `DislTypeMap` 7, `DislModelBuilder` 7, `WireIdMap` 6.<br>• 2 each: `DislElement`, `DislDiagram`, `ToolboxDerivation`, `FormDerivation`.<br>• 1 each: `DislNaturalIds`, `DislToolbox`, `ContextMenuDerivation`, `ConstraintEvaluator`, `CanvasChromeDerivation`, `BundledDefinition`.<br>What is still read while a diagram runs:<br>• a type's or an attribute's `label` and `icon` (toolbox, chrome, menu, form);<br>• the presence of `derived` (form, element, diagram);<br>• `key` (natural ids) and one flag in `ConstraintEvaluator.Flag`;<br>• a derived relation's JSON, whose pointers `DislModelBuilder.DerivedRelations` rebuilds by hand;<br>• the wire ids, read by `WireIdMap.Of` once per definition;<br>• a tool's initial literal, which `OperationInterpreter` converts with `DislValues.FromJson` at each drop.<br>T305 |
| SC-020: one cache serves compiled CEL programs (5 mechanisms); one write loop serves four families (4) | Met | 5 mechanisms to one cache and the rule's own programs; 4 families on one template | T212: `CelProgramCache<TKey>`. Each DISL specification owns one, which the loader, `DislEvaluation` (the `ConditionalWeakTable` is gone) and `DislModelBuilder.DerivedIds` share. Each `BodyReading` keeps one. T213: a `Rule` keeps the programs it compiled (`BindingChecker.cs:190`). T215 and T216: `FamilyReader.Write` is non-virtual, with abstract `RemoveSlot`, `ReplaceSlot` and `InsertSlot`, which the xml, yaml, json and lines families implement. Outside the specification projects, c4's `C4Definitions.PermittedTypes` compiles `permitted(env.viewpoint)` at each call (c4 commit `fe4477748`, 2026-10-19). It is the conversion's code and is told to its owner |
| SC-021: the FBL conformance fixtures and the DISL suite pass with no fixture's expected result changed, through M6 | Met | built in a fresh tree at `514e784f1`: FBL 1,980, DISL 561, CEL 271 tests, all passed (at the fixed point 1,803, 493, 269) | The check of [M6-fixed-point.md](M6-fixed-point.md), `git diff --stat 621be6f18 514e784f1` over its four paths, changes no fixture: only the conformance runners (`*.Tests.cs`) and their `readme.md`, and `InsertEmptyFixtures.Tests.cs` removed by T216. The DISL suite's definitions and the hype-cycle and behaviour-model definitions are unchanged. Of the changed DISL test files:<br>• T214 renamed `DislContexts` to `DislContext`.<br>• T211 added a theory whose message it worded itself.<br>• Typing tests were added.<br>• `DislReachability.Tests` gained two nodes and their expected values. That came from databricks task 4 (standalone pull request 527), not an M6 task, and widened a fixture without changing an existing result.<br>No pull request copied the corpus again |
| SC-022: FBL's public types are those another project uses (72 public types) | Met as amended by this review (question 3) | FBL 45 public top-level types (65 with nested ones), from 85; CEL 15, from 22; DISL 58, from 65 | T226 (standalone pull request 544). A type stays public only when another project names it or a public signature exposes it, and `PublicSurfaceTests` fails on any other. The 72 was FBL's count at the report's commit (72 at `fcb64c9`), a baseline and not a target. FBL had grown to 85 by M6's start |

## Named candidates

**From the contract and the plan.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| The order of the conversions, now that their libraries are settled (DP-2) | Advice; no task | Nothing any conversion waits on is this feature's (T227, below). What they wait on are language changes in `etalii.adp` and rulings. The state at `514e784f1` is under *Tasks added, reduced and struck*. The order this review advises the conversions' owner:<br>1. Those with no language wait: rdf's stage one (tasks 1 to 11; see question 4), sparql, and dotnet-dependency-graph up to its tasks 8 and 9, which wait on rulings.<br>2. Sankey and supply-chain, once their owner has read FBL 0.5's `read` and `fallback` against the gaps they record, which these may already answer.<br>3. Functional-decomposition-graph, wardley-map, c4 tasks 13 to 17 and databricks task 10 onward, as the FBL and C4 changes they wait on land (follow-up feature 2) | none |
| Is the hand-written XML parser still justified? | Yes; keep it | `XmlParser.cs` (307 lines, split from the family by T219) reads bytes and loses nothing: it gives each attribute, value and quote the offset a splice needs, with one grammar. FBL parses XML nowhere else; only the XML editor uses `System.Xml`'s `XmlReader`, which reports a line and a column and normalises what it reads. JSON and YAML could move because `Utf8JsonReader` and YamlDotNet's scanner report the offset of every token | none |
| Does DISL need to reference FBL at all? | Yes | DISL builds its model from FBL's reading (`DislModelBuilder.From(FblModel)`), reports with FBL's `Finding`, and hands FBL its attribute types and natural ids (`DislAttributeTypes`, `DislNaturalIds` supply `FblOptions` delegates). Its writes are FBL's `ModelChange` (`DislWrite.ToFbl`). FR-083's bridge was the other join, and it is not needed (T225, struck at M4). The 12-argument `FblElement` constructor is used only by the FBL plugins (mind map, behaviour model, pipeline, Ansible, Helm) and by `DatabricksDisl`, databricks' stage-one adapter, which its task 11 deletes | none |
| Typed DISL nodes generated from the schema in `etalii.adp` | No | A record of T222 to T224 is mostly what a schema cannot give: the compiled program by context, the problem at its pointer, the defaults DISL's prose sets, the checks across the document. The shapes alone are the smaller part. The other hosts are TypeScript and Kotlin, so sharing them would take a generator per language. That would be a feature in `etalii.adp`, and none is asked for | none |

**For the M6 review, from the tasks.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| T212: `BodyReading` tells a reading-time compile failure only to its first caller | No | A reading reports its problems as findings, once each; a second caller in the same reading would add the same finding again. It was so before T212, and the per-reading cache keeps it | none |
| T216: a new xml element writes an empty attribute under `empty: "remove"` | Do now | `XmlFamily.NewElement` writes every value that is not null. `FamilyReader.InsertValue`, which the other families use, leaves an empty value out under `remove`. FBL 0.6 §6.2 makes the rule every family's, and `etalii.adp` has no `insert-empty-xml` fixture, so no conformance run catches it | T307 |
| T222, T223: hooks, `parse`/`write` and the notation's labels still reached actions through bridges and `Root` | Overtaken | T224 removed the last bridge; DISL and `Diagram.Modules` hold none | none |
| T224: `DislSpecification.Json` stays public for seven modules | Later: follow-up feature 1 | `DotNetDefinition`, `PipelineDefinition` with `AddPipelineElementCommand`, `AnsibleDefinition` with `AnsibleInventoryRows`, `HelmDefinition`, `CausalLoopDefinition`, `C4Disl` and `AadDefinition` read messages, operations, rules, enums, relations, sizes, viewpoints and their own `x-` blocks from it. No requirement of this feature asks that a module's code read DISL typed: FR-079 types DISL's own code, and FR-082 keeps public what is used. Two of the seven are in conversions still running (c4, dotnet-dependency-graph) | none |
| T224: `InternalsVisibleTo` from `Specification.Disl` to `Diagram.Modules` | No | `Diagram.Modules` is a core project, so SC-013 is not touched. It reads the typed operations of a definition, which no module needs. The grant keeps those records off the public surface that T226 narrowed | none |
| T224: a definition whose operation states no unavailable sentence now throws `InvalidOperationException` where a missing `behavior` threw `KeyNotFoundException` | No; entered as B-39 | `DislDiagramDefinition.StandingReasonsOf` throws for a module's configuration mistake, which no shipped definition makes. T224 should have entered it before it merged; this review enters it | none |
| T226: use by another project's tests counts as use | Question 3 | By that rule, other projects' tests alone keep `FblDocumentLoader`, `DislLoader` and `DislLoadResult` public. Those tests are `TestSupport`'s real-file corpus, `Diagram.Modules.Tests`, `Disl.Tests` and the c4, dependency-graph, timeline, pipeline and databricks tests. `PluginReader` and `DislExpression` are public because public members expose them (`FblBinding.Plugin`, `DislSpecification.Expressions`). Production loads through `BundledBinding.Load` and `BundledDefinition.Load` | none until it is ruled |
| T226: could the types `Diagram.Modules` alone needs be internal, granted to it? | No | `DerivedShortcut` is exposed by `DerivedMenuEntry`. `DerivedMenuGroup` is named by agent-activity-diagram's production code. `PlanResult`, with its case `Planned`, is named by six modules and the knowledge designer | none |
| T226: `PublicSurfaceTests` matches a type's name as text, so a name used elsewhere could keep a type public | No | The names it finds elsewhere for another reason (`Marker`, `Router`, `BodyText`) belong to internal types already; the leniency kept nothing public | none |
| T303: `UpdateViewWhileTheStreamIsOpen.Tests.cs` was in neither T303's list nor T304's | Done | T304 took it to `EtAlii.Adp.Modules.Tests` | none |
| T304: `ModulePluggabilityTests.Core_CompilesAndRuns_WithNoDiagramModuleLoaded` asserts that its own assembly references no mind map module, in a project whose purpose is modules | Do now | `EtAlii.Adp.Diagram.Tests` references only `EtAlii.Adp.Diagram`, the seam the test is about | T310 |

**Noted while reviewing.**

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| `JsonScalars.ToCel` hands a whole number to CEL as a double | Question 1 (B-38) | C# types `value.TryGetInt64(out var integer) ? integer : value.GetDouble()` as `double`, so the `long` is converted back. Both copies T210 joined (`DislValues`, `BodyReading`) did the same. Callers: a DISL literal, and an FBL binding's `default`, empty default and fallback. A value read from a body is a `long` (`YamlScalars`, `JsonBodyParser`). In CEL, `%` refuses a double and `/` divides two ints whole; `==` compares an int and a double by value. Timeline's binding gives `row` a `"default": 0` | T308 |
| `DislNotationReader.EditText` compiles a label's bare-string `text` as an expression when it has no `editText` | Question 2 (B-40) | DISL §2.5 (b): a bare string in a Bindable position is always a literal. T224 kept the runtime's reading, as its comment says. No shipped label has a bare-string text and no `editText`. A label is editable only through an attribute binding (§6.12), so only a module that asks `FormCommit.EditText` for such a label sees the difference | T309 |
| `DislLoader` builds the specification before it checks for errors, and still returns none when there are errors | No | The typed readers need the specification to compile into and to report at a pointer. A caller of a document with errors gets no specification, as before | none |

## New candidates

**From the method-length count.**
- **`ActionRunner.Action` (152 code lines), `DislModelBuilder.From` (100), `DerivedRelations` (94) and `ExpressionForm` (76).** Do now: T306, after T305.
  - `Action` became a switch over the `DislAction` union with T222. Each arm is now an action kind with its own record, so one method per kind is a split along a seam that exists.
  - The three methods of `DislModelBuilder` are where T305 removes the JSON. They are cheaper to shorten after it.
- **`CelParser.Tokenize` (90) and `ParsePrimary` (76).** No. A tokenizer's one loop and a parser's one precedence level, each doing one thing.
- **`DislNames.Resolve` (77).** No, for the same reason: one pass over the names, at load.
- **The other 19 methods over 50 in the specification projects** (51 to 68). No for this review. They include `XmlParser.ReadStartTag`, `RegexSubset.Check`, `PluginFunctions.Function`, `LinesParser.Parse`, `EditPlanner.PlanSet` and `PlanAdd`, `BodyReading.Claim`, and the yaml family's `EnsureContainer` and `Insert`. Each is one grammar rule, one check or one plan. SC-023 is counted at M9, and the M7 review reads the count again after T241.
- **`DatabricksDisl.BundleElements` (51) and `JobElements` (52).** No. Databricks task 11 deletes the adapter.

**From the clone scan.**
- **`Planner`/`Splices` (5) and `Splices`/`YamlScalars` (3).** No. Databricks task 12 deletes `DatabricksSplices`.
- **The moved flows, `Flow.Tests` (22) and `Flow.Tests`/`OwlFlow.Tests` (15).** No for now. They are the same windows the M5 scan found between `DatabricksFlow`, `RdfFlow` and `OwlFlow`, now in three projects. The M8 review reads them with T251 and T252.
- **`C4Definitions.PermittedTypes` compiles at each call.** Not this feature's. It is c4's code inside `c4-disl-fbl` (FR-012); this review tells its owner.
- **Folding `Specification.Json` into FBL.** No. It is 163 lines that FBL and DISL share, and DISL would then reach them only through FBL. The plan took a folder as the fallback only if the project would hold fewer than a handful of types; it holds seven, with two consumers.

**From the tooling.**
- **`graph.py` counts a core project's grant to `EtAlii.Adp.Modules.Tests` as naming a tool module.** Do now: T311.
- **Stability run 16 failed once in 20, and its log was not readable here.** Do now: T312.

**What M6 made cheap.**
- **A diagnostic.** Both loaders report a `LoadDiagnostic` at a JSON Pointer, and print it alike.
- **A compiled expression.** A DISL record field is a `DislExpressionField` holding its program. Programs are kept in one cache per specification, so a new reading compiles nothing twice.
- **A new FBL setting.** It is parsed once into an enumeration by `BindingReader`, and a value the schema refuses is a problem at its pointer.
- **A new format family.** It is a parser and three hooks on `FamilyReader.Write`.
- **A new DISL action kind.** It is one record in the `DislAction` union, read at load, and one arm in `ActionRunner`; after T306, one method.
- **A YAML question.** The yaml family reads what YAML says, through YamlDotNet's scanner, and keeps every offset.
- **The public surface.** `PublicSurfaceTests` says which types must stay public, and why.

**What M6 made pointless.** Nothing among the remaining tasks. FR-083's bridge was struck at M4 (T225), and M6 confirmed that no module needs it.

## Tasks added, reduced and struck

**Ticked** (merged, FR-014):
- T207 to T224 and T226 were ticked in their own `etalii.adp` pull requests, the last by #376.
- T303 and T304 likewise.
- T227 (the hand-over, below), T228 ([M6-measurements.json](M6-measurements.json)) and T229 (this record) are ticked in this pull request.

**Added, in M6 under *Added by the M6 review*, to be done before M7's first task:**
- T305: the rest of SC-019.
  - A type's and an attribute's `label`, `icon`, `key`, flags and `derived` become members read at load.
  - A derived relation becomes a record with its compiled fields, so `DislModelBuilder` rebuilds no pointer.
  - `WireIdMap` reads its block beside the loader.
  - A tool's initial literal is converted at load.
  - `DislJson`'s one-line forwards (296 uses, all inside DISL) give way to `JsonProperties` and `JsonPointer`.
  - (FR-079; SC-019.)
- T306: `ActionRunner.Action` (152) one method per action kind, and `DislModelBuilder.From` (100), `DerivedRelations` (94) and `ExpressionForm` (76) under 50 code lines, after T305 (FR-079; SC-023).
- T307: a new xml element follows its binding's `empty` rule, as FBL 0.6 §6.2 says and B-09 was ruled, with a guard seen to fail first (FR-076, FR-025, FR-005; B-09).
- T308: apply B-38 as ruled (FR-074, FR-002; B-38).
- T309: apply B-40 as ruled; if the ruling keeps the expression reading, the difference goes to `etalii.adp` (FR-079, FR-002, FR-085; B-40).
- T310: move `Core_CompilesAndRuns_WithNoDiagramModuleLoaded` to `EtAlii.Adp.Diagram.Tests` (FR-056; SC-013).
- T311: `graph.py` counts as a tool module only a diagram, designer or editor project (FR-009; SC-013).
- T312: read Stability run 16's failure and treat it as T300 did (FR-005; SC-002).

**Reduced:** none. **Struck:** none.

**T227, the hand-over.** Timeline and dependency-graph had closed by the M4 review. Databricks is at 9 of 15 at `514e784f1`.
- **Stage one has closed**: task 9 is standalone pull request 542, with `etalii.adp` #374.
- **Task 10 waits on FBL gaps 1 and 2**, and in part on gap 4. Gap 3 is answered by FBL 0.5.
- **Task 14 waits on a canvas player for `simulate`.**
- **None of these is this feature's.** Of FR-074 to FR-083, databricks needed:
  - the shared JSON helpers (T210);
  - the version check (T211);
  - the program cache (T212);
  - the write template (T215, T216);
  - the typed DISL (T222 to T224), which its tasks 4, 6 and 7 preceded as T207 agreed;
  - and a public surface that keeps what it uses (T226).
- **All have merged.** The bridge of FR-083 it does not need: its stage-one adapter `DatabricksDisl` builds `FblElement`s for now, and its task 11 deletes it.
- The databricks work stays its owner's.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `514e784f1`:
- **Closed:** ansible-structure 12 of 12, azure-devops-pipeline 12 of 12, causal-loop 11 of 11, dependency-graph 9 of 9, helm-chart 11 of 11, timeline 7 of 7.
- **Open:**
  - c4 is at 12 of 17. Its tasks 13 to 17 wait on the language changes for its gaps C1 to C7.
  - databricks is at 9 of 15, as above.
- **Not started:**
  - dotnet-dependency-graph, 0 of 10. Tasks 8 and 9 wait on rulings.
  - functional-decomposition-graph, 0 of 12. Tasks 9 to 11 wait on FBL gaps 1 and 2.
  - rdf, 0 of 18. Only task 17 waits on a language change. Tasks 8 to 11 move `RdfProjection`, `SkosProjection`, `OwlProjection`, `OwlValidator`'s logic and `OwlModelIndex` to its test project, as the oracle.
  - sankey, 0 of 12. Task 9 waits on gaps 1 and 2.
  - sparql, 0 of 11. No language wait, and `SparqlParser` stays (its task 3 edits it).
  - supply-chain, 0 of 12. Tasks 10 to 12 wait on a scalar read as written.
  - wardley-map, 0 of 13. Task 11, which retires `WardleyParser`, waits on FBL gap 1 and its gaps 7 and 8.

No conversion specification names spec 025, and no `etalii.adp` feature from 026 to 031 takes up the FBL gaps.

So:
- **T231 and T232 (rdf) stand.** `OwlProjection.Project` is 344 code lines, `SkosProjection.Project` 200 and `RdfProjection.Project` 144. But rdf's tasks 8 to 11 would take all three out of production, with no language wait in front of them. Question 4.
- **T236 and T237 (wardley-map) stand.** `WardleyParser.Outcome` is 220. Wardley's task 11 would retire it, but it waits on three language changes.
- **T238 (sparql) stands.** It reads sparql's task 3 first.
- **T239 and T240 (c4) stand.** `C4Layout` stays through c4's remaining tasks, which read, write and place. `ComputeNested` is 114.
- **T241 stands.** `OwlValidator.Judge` and `OwlModelIndex.Build` follow question 4.
- **T294, T295 and T302 stand.** The modules T294 and T302 touch have closed their conversions, and T295 reads c4, databricks and rdf first.

## Behaviour changes

**Ruled and applied since the M5 review:**

| Row | What | Ruled | Applied by |
|---|---|---|---|
| B-08 | One version check, strict | 2026-10-19, question 3 of the M5 review | T211, standalone pull request 516 |
| B-09, B-12 | The empty value on insert, and a new JSON entry's layout | 2026-10-12 | T216, 520 |
| B-29 | A body that is not RFC 8259 JSON | 2026-10-20 | T219, 525 |
| B-30 to B-35 | YAML's own reading where the line reader departed from it | 2026-10-20 | T221, 526 |

**Applied without a ruling, as their tasks prescribed:**
- B-36: a derived id that does not compile is a missing id (T212, 535).
- B-37: an expression read where the loader compiled none is a load error (T224, 543).

**Entered by this review:**
- **B-38, open.** How a whole JSON number reaches CEL. T308 applies it. Question 1.
- **B-39, applied by T224 (543).** The exception a module's configuration mistake throws in `StandingReasonsOf`. No ruling is asked: no shipped definition reaches it, and only the type of a programming error's exception changed.
- **B-40, open.** A label's bare-string `text` read as the editor's text. T309 applies it. Question 2.

M7 needs no row. T308 and T309 wait on B-38 and B-40, and both come before M7.

## Follow-up features

1. **The modules read DISL typed.** Seven modules read `DislSpecification.Json` with their own `GetProperty` chains, for things DISL now reads at load:
   - messages, operations, constraint rules, enums, relations, a node's size and the viewpoints;
   - and their own `x-` blocks and attribute extensions.

   Moving them onto the typed members, and adding typed access to a definition's extension blocks, would let `Json` become internal. It touches seven modules, two of them in conversions still running. No requirement of this feature asks for it.
2. **The FBL and C4 language changes the conversions wait on.** In `etalii.adp`:
   - databricks' FBL gaps 1, 2 and 4;
   - c4's C1 to C7;
   - rdf's and functional-decomposition-graph's gaps 1 and 2;
   - wardley-map's gaps 1 to 4, 7 and 8;
   - and the scalar read as written that sankey and supply-chain record, which FBL 0.5 may already answer.

   No feature takes them up yet. Until one does, half the remaining conversions cannot finish, and with them the M7 tasks that wait for their modules.

The three of the M4 review stand as written there.

## Questions for the maintainer

**1. B-38: a whole JSON number in CEL.** `JsonScalars.ToCel` turns a whole JSON number into a double, though its comment says an int. Its two copies did the same before T210.

It reaches CEL from two places:
- a DISL literal;
- an FBL binding's `default`, empty default and fallback.

A value read from a body is an int. So timeline's `row`, whose binding says `"default": 0`, is a double when defaulted and an int when written. `%` refuses the double, and `/` divides it where it would divide two ints whole; `==` is unaffected.

- (a) **Ints, as the comment says: a whole number is an int, any other a double.** *Recommended*: a default then has the type a written value has, and CEL's `%` and integer division work on it. It costs one line and a guard. A tool whose expression divides a defaulted value would then divide whole; the guard shows whether any shipped expression does.
- (b) Keep the doubles and correct the comment. Nothing changes; a defaulted value and a written one keep different types.
- (c) Convert by the attribute's declared type where one is known, else as (a). This needs the declared type at every caller; `BodyReading`'s fallback has none.
- (d) Other.

**2. B-40: a label's bare-string `text` as the editor's text.** When a label has no `editText`, `DislNotationReader.EditText` compiles its `text` as an expression, even a bare string. DISL §2.5 (b) says a bare string in a Bindable position is always a literal. No shipped label is affected: an editable label needs an attribute binding (§6.12), and none has a bare-string text without `editText`.

- (a) **The literal, as §2.5 (b) says.** *Recommended*: the runtime then reads what the specification says, and no tool changes. It is a few lines and a guard.
- (b) Keep the expression reading, and send the difference to `etalii.adp` as a feature of its own (FR-085). The runtime keeps reading something the specification does not allow.
- (c) Other.

**3. SC-022 and FR-082: does use by another project's tests count as use?** T226 counted it. Three types are public only because tests in other projects name them: `FblDocumentLoader`, `DislLoader` and `DislLoadResult`. Those tests load modified or hand-written documents, which the bundled loaders cannot.

- (a) **Keep counting a test project's use.** *Recommended*: three types stay public, which costs nothing. SC-022 stands as this review amends it.
- (b) Grant `InternalsVisibleTo` to the test projects that use them instead. That is nine grants, six of them to tool modules' test projects (pipeline from both, c4, dependency-graph, timeline, databricks). SC-013 forbids a core project granting internals to a tool module, so it would need amending too.
- (c) Move those tests onto `BundledBinding.Load` and `BundledDefinition.Load`. Tests that load a modified document lose their way in, so some would be rewritten or dropped.
- (d) Other.

**4. rdf-disl-fbl against M7's T231, T232 and the rdf part of T241.** M7's largest tasks restructure:
- rdf's projections: `OwlProjection.Project` 344 code lines, `SkosProjection.Project` 200, `RdfProjection.Project` 144;
- `OwlValidator.Judge` and `OwlModelIndex.Build`, 102 each.

rdf's own tasks 8 to 11 move all five out of production into its test project, as the oracle the binding is checked against. Nothing in front of them waits on a language change. The conversions' owner decides when rdf starts.

- (a) **Advise the conversions' owner to start rdf's stage one (tasks 1 to 11) now. M7 does its other tasks first, and the M7 review reduces or strikes T231, T232 and T241's rdf part once rdf has started.** *Recommended*: five of the thirteen longest methods would leave production without being restructured first. It costs M7 its order: T231 and T232 wait for rdf, and if rdf has not started by the M7 review, that review does them.
- (b) M7 does T231 and T232 as planned. About 700 restructured lines would then become rdf's test oracle, work that rdf's tasks 8 to 11 move rather than keep.
- (c) Strike T231 and T232 now, as overtaken by rdf by design. If rdf never runs, SC-023 misses five of its longest methods.
- (d) Other.

**Answers.** Not yet given when this review was written. SC-022 is amended in the specification, with this review named beside it, as question 3 (a) would leave it: the 72 was a count at the report's reading and never a target, which T226 had said. T308 and T309 wait on the rulings of questions 1 and 2. T231 and T232 stand as written until question 4 is ruled.

The maintainer answered all four on decision cards on 2026-10-20, each with the recommended option: question 1 (a), ints, which T308 applies; question 2 (a), the literal, which T309 applies; question 3 (a), a test project's use counts as use, so SC-022 stands as amended; question 4 (a), rdf's stage one goes first, M7 does its other tasks before T231, T232 and T241's rdf part, and the M7 review reduces or strikes those once rdf has started.

## Ownership

M6 was owned by one developer, signing as `agent-1-<task>` (FR-006), all of it in a cloud session. M7 is owned by the same developer unless the maintainer hands it over with this review.
