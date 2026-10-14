# M2 review: the middle layer in every module, and the sibling modules

**Measured at**: `etalii.adp.ide.standalone` `20d43776d`, the merge of pull request 294, 2026-10-14 | **Previous record**: [M1-review.md](M1-review.md), [M1-measurements.json](M1-measurements.json) at `3daf9654c` | **Written by**: agent 1, the feature's developer, from the notes kept at each module's pull request and the measurements (no Architect was assigned to this review) | **Owner of the feature**: agent 1 (Developer)

## In short

M2 moved the fifteen remaining modules with real code onto the middle layer M1 piloted, one band at a time, and added the two shared types the folder modules needed (`WatchedFolderStore` with `TolerantYaml`, and `DiagramSnapshotSourceResolver<TSnapshot>`). Diagram production code is 8,380 lines and 69 files smaller than at M1, and 10,949 lines and 86 files smaller than the baseline; the clone scan's shared production windows fell from 1,517 to 690, and every role SC-008 names is under its target. No module declares a reloader, an unsubscriber or a hand-rolled diff any more, and every module with command handlers has the edit-handler contract test. What did not fit: SC-006's file count (86 of 250, amended here as the M1 review's ruling asked), and two clauses of SC-007, twelve document-factory classes where four were allowed and mindmap's own changed event, which is asked below with a recommended task. Five modules keep a type of their own beside the bases, each named with its reason. The review adds T277 and T278, widens T135, reduces T137 and T140, and strikes T129, which the causal-loop conversion overtook.

## Measurements

The previous record is M1 at `3daf9654c`. Between the two, two other specifications landed beside M2: `fbl-written-text` (standalone pull request 255) and `causal-loop-disl-fbl` (pull request 281 and those before it), which grew `EtAlii.Adp.Specification.Fbl` and `EtAlii.Adp.Specification.Disl` with their tests by 3,060 lines and rewrote causal-loop-diagram's document handling. Their figures are named where they move a total.

| Figure | M1 (`3daf9654c`) | Now (`20d43776d`) | Target |
|---|---|---|---|
| Projects | 136 | 136 | about 134 at the end (plan) |
| Files, all | 2,238 | 2,271 | |
| Lines, all | 266,416 | 267,942 | |
| Lines, core production (17 projects) | 38,968 | 41,139 (+2,171; `EtAlii.Adp.Documents` +751, `EtAlii.Adp.Diagram` +320, `EtAlii.Adp.History` +171 from M2; `EtAlii.Adp.Specification.Fbl` +450 and `.Disl` +476 from the two conversions) | |
| Lines, core test (21 projects) | 47,560 | 50,913 (+3,353; `EtAlii.Adp.TestSupport` +566 and `EtAlii.Adp.Documents.Tests` +469 from M2, the specification tests +2,134 from the conversions) | |
| Lines, diagram production | 84,737 | 76,357 (−8,380) | SC-006: 9,000 smaller than the baseline's 87,306, so at most 78,306 |
| Files, diagram production | 944 | 875 (−69) | SC-006: 250 fewer than the baseline's 961, so at most 711 |
| Lines, the fifteen M2 modules' production projects | 71,666 | 63,341 (−8,325) | |
| Lines, diagram test | 77,299 | 81,696 (+4,397, the contract tests of fifteen modules and the conversions' tests) | |
| Lines, production | 132,252 | 126,028 (−6,224) | |
| Lines, test | 134,164 | 141,914 (+7,750) | SC-005: 5,290 smaller than the baseline at M9 |
| Clone scan, production: shared windows / files | 1,517 / 304 | 690 / 223 | |
| Context-source-resolver windows | 283 | 30 | SC-008: fewer than 200 |
| Session windows | 160 | 31 | |
| Session-factory windows | 45 | 3 or fewer (below the scan's fortieth row) | SC-008: fewer than 50 |
| Property-provider windows | 31 | 10 | SC-008: fewer than 50 |
| Document-store windows | 63 | 20 | SC-008: fewer than 50 |
| Action-provider windows | 70 | 22 | SC-008: fewer than 50 |
| `Edits` windows | 18 | 3 or fewer | |
| Clone scan, test: shared windows / files | 1,997 / 281 | 1,847 / 286 | |
| Methods over 50 code lines | 177 | 163 | SC-023: at most 123 at M9 |
| Methods over 80 code lines | 42 | 36 | SC-023: at most 22 at M9 |
| `ProjectReference` edges | 322 | 323 (causal-loop-diagram on `EtAlii.Adp.Specification.Disl`) | |
| `PackageReference` edges | 244 | 244 | |
| `InternalsVisibleTo` edges | 45 | 44 (`EtAlii.Adp.Documents` no longer to c4 and causal-loop-diagram; newly to `EtAlii.Adp.TestSupport`) | |
| Projects without a `.cs` file | 1 (`EtAlii.Adp.Sessions`) | 1 | SC-013: none at M5 |
| Core references naming a tool module | 11 | 9 (the two `InternalsVisibleTo` above) | SC-013: none at M5 |
| `Task.Delay` and `Thread.Sleep`, test code | 54 | 55 | |
| `Task.Delay` and `Thread.Sleep`, production code | 10 | 10 | SC-010: no `Thread.Sleep` at M3 |
| Polling helpers | 10 | 11 (a private `Until` in `WatchedFilesStore.Tests.cs`, T103) | SC-003: one at M3 |

**The fifteen, before and after.** Production lines per module:

| Module | M1 | Now | Change |
|---|---|---|---|
| rdf | 12,762 | 11,800 | −962 |
| timeline | 3,830 | 2,923 | −907 |
| causal-loop-diagram | 5,240 | 4,341 | −899 (with its conversion) |
| dependency-graph | 3,297 | 2,424 | −873 |
| wardley-map | 6,447 | 5,702 | −745 |
| agent-behavior-modelling | 3,794 | 3,191 | −603 |
| ansible-structure | 3,447 | 2,904 | −543 |
| databricks | 4,686 | 4,161 | −525 |
| helm-chart | 3,396 | 2,883 | −513 |
| agent-activity-diagram | 2,307 | 1,843 | −464 |
| c4 | 5,944 | 5,514 | −430 |
| sparql | 4,465 | 4,138 | −327 |
| dotnet-dependency-graph | 2,511 | 2,236 | −275 |
| azure-devops-pipeline | 6,323 | 6,110 | −213 |
| mindmap | 3,217 | 3,171 | −46 |

The pilots moved by 55 lines between them (the resolver contract and the smaller resolver base, T273 and T274).

**Clone families.** The editor sessions are still the three largest production families (67, 60 and 18 windows, T144, T145 and T272). Below them, every family is now between two or three modules' notation: `SankeyLayout`/`SupplyChainLayout` and `SankeyWriter`/`SupplyChainWriter` (30 each), `C4Document`/`WardleyDocument` (29, T127 and T128), `SankeyParser`/`SupplyChainParser` (28), `RdfTokenizer`/`SparqlTokenizer` (27, T131 and T132), the YAML parsers of fdg, sankey and supply chain (11 and 12, T134), and the timeline and dependency-graph pair (below). Two families are new candidates: `AadBody`/`CausalLoopBody`/`GhgBody` (8) and `AnsibleElementMapper`/`HelmElementMapper` (12). M1's resolver, session, store and `Edits` families are gone from the twenty. In the test code the transcripts (221 windows), the examples and bundled-definition tests and the editor families lead, as at M1; they are M8's.

**Long methods.** Seventeen of M1's twenty longest are still there. `TimelineContextActionProvider.RunAsync` (100) and `DatabricksContextActionProvider.Discover` (93) are the same methods under the frame's names; `DislModelBuilder.From` (97) came with the causal-loop conversion. The over-50 count fell by fourteen and the over-80 count by six, nearly all in providers the frames shortened.

**Project graph.** M2 added no project reference: the bases live in projects every module already referenced. The two `InternalsVisibleTo` edges from the documents project to c4 and causal-loop-diagram went with the private line documents those modules stopped reading through core internals.

## Exit condition and success criteria

The exit condition of M2 (plan.md): all 19 modules stand on the middle layer, and the sibling modules share what they copied. SC-006 to SC-009 are due at the end of M2, and FR-036 for all 19 modules. The review also asks whether the action and property providers can become generic, whether timeline and dependency-graph should share a model base, which M3 utilities the rollout already removed, and whether a module's `ServiceCollection.AddX.cs` can be derived.

| Criterion | Met | Figure | Evidence |
|---|---|---|---|
| All 19 modules stand on the middle layer (FR-036) | Met, with five modules keeping a type of their own on the record | 19 of 19 | Fifteen sessions derive from `DocumentDiagramSession`; ansible-structure, helm-chart and dotnet-dependency-graph hold `DiagramDocumentChangeHandler` over a `WatchedFolderStore`; mindmap keeps its own store and session. Every module with command handlers runs its body edits on `DocumentEditHandler` or `CurrentDocumentEditHandler`, except pipeline's `PipelineEditHandler` and mindmap's `MindmapCommandHandler`; abm's three arrangement handlers write the registration, not the body. The types kept beside the bases are under *The fifteen beside report 1.7* below: pipeline's store, resolver and edit base (the store needs the workspace root to follow templates), wardley-map's resolver (its ids are identities kept in a sidecar), sparql's providers (read-only, no edits), c4's and the folder modules' factories (one per type, or the registration's folder or `body:` header), and mindmap's types (its document is Freeplane XML mutated in place) |
| The sibling modules share what they copied (FR-039, FR-040) | Met | T112 | Below, under *The sibling pairs* |
| SC-006: 9,000 lines and 250 files fewer than the baseline | Lines met; files not, amended | −10,949 lines, −86 files | `diagram/production` in [M2-measurements.json](M2-measurements.json) against [baseline-measurements.json](baseline-measurements.json): 87,306 to 76,357 lines, 961 to 875 files; the 47 stub modules are 17 lines and one file each in both. The M1 review foresaw about 100 files: a file goes only where a whole role goes, and a module keeps one file per type of report 1.7. Amended in this pull request to 80 files, as the maintainer ruled on 2026-10-13 |
| SC-007: no reloader, changed-event, unsubscriber type or hand-rolled diff; at most four session-factory and four document-factory classes | Partly met | reloaders 0, unsubscribers 0, hand-rolled diffs 0, changed-event types 1, session factories 4, document factories 12 | A search of `src/diagrams/` at `20d43776d` for each declaration. The changed-event type left is `MindmapChangedEventArgs`; `SupplyChainSelectionChangedEventArgs` is a selection, not a document change. The session factories are ansible's, helm's, dotnet's and c4's. The twelve document factories are abm's, pipeline's, wardley's, mindmap's, databricks', dotnet's, c4's two and rdf's four; each writes a text that depends on the file's base name or the type, which `AddEmptyDocument(origin, text)` cannot say. Asked below, with T277 recommended |
| SC-008: resolver windows under 200; session-factory, property-provider, document-store and action-provider windows under 50 each | Met | 30; 3 or fewer, 10, 20, 22 | The clone scan's role pairs in [M2-measurements.json](M2-measurements.json) |
| SC-009: no command handler builds its result from a save without the save's warning, held by the contract test of FR-033 for every module | Met | 15 of 15 | Every module with command handlers has a test class deriving from `EditHandlerContract` (sankey, supply-chain, fdg, ghg, abm, aad, timeline, dependency-graph, pipeline, c4, wardley-map, rdf, causal-loop-diagram, mindmap, databricks); sparql, ansible-structure, helm-chart and dotnet-dependency-graph have no command handlers. Each band C pull request saw the contract fail for the module first where it dropped the warning |

**The stability run.** Started by hand for this review on `develop` `20d43776d`, 2026-10-14: [run 9](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/38594701765), 20 of the 20 `dotnet test` runs green. The nightly schedule T275 made fire has run twice since the M1 review, on 2026-10-13 and 2026-10-14, both green. SC-002 is due at M0 and M9; it holds at M2.

**The review's four questions** are answered under *Named candidates*.

## Named candidates

| Candidate | Answer | Evidence | Tasks added |
|---|---|---|---|
| Generic action and property providers | No | The frames left each provider with what its notation offers and what each answer commits; nothing in them is shared by copy (22 and 10 windows, from 70 and 31). Seven modules derive their menus and rows from a bundled DISL definition already, through seven adapters T150 and T151 make one `DislDiagramDefinition`; the other twelve have no definition yet, and their conversions under FR-012 have not started. A generic provider would be T150's projection with the module's commands plugged in, which is T151's work, not a new one | none |
| A shared model base for timeline and dependency-graph, or leave both to their conversions | No: leave both to their conversions | T112, below: the two share their role classes only as overrides of the bases, and their model, parser and writer share 6, 1 and 1 windows. `timeline-disl-fbl` has four of its six tasks done and replaces the parser and writer; `dependency-graph-disl-fbl` is written and approved | none |
| `ServiceCollection.AddX.cs` derived from the module's types | No | The registrations differ in what each module replaces: a factory per type (c4, rdf, databricks), a resolver per reading (rdf), a selection store (supply chain), a view state (pipeline, mindmap), a second extension for the commands (wardley-map, mindmap). The one pair that registers the same shapes, timeline and dependency-graph (15 windows), is left to its conversions. Deriving the registration would hide which of these a module replaces | none |
| The commands as generic commands over an element id | No | The handler base left each handler with its `Apply`, which is the notation: a timeline rename edits a `label:` line, a wardley rename rewrites a statement and its references, an rdf rename renames a term across the file. What the handlers shared, loading, saving, the undo and the result, is already the base's | none |
| Which M3 tasks the rollout already made unnecessary | One struck, three reduced or widened | T129 is overtaken: causal-loop-diagram has no `CausalLoopDocument` since its conversion. T137 loses the causal-loop `Tokenize`, which went the same way. T140's "the `YamlException` of 11 modules" is now seven (pipeline, databricks, dependency-graph, fdg, sankey, supply-chain, timeline): ansible and helm read through `TolerantYaml` since T103. T135 gains `DependencyGraphWriter.Number`, which it did not name. The `Scalar` copies of T134 are unchanged (ten files), and `SettleDelay` of T149 is still in the two folder stores and their flow tests | T135 widened, T137 and T140 reduced, T129 struck |

## New candidates

**From the clone scan.**

- *The FBL bodies* (`AadBody`/`CausalLoopBody`/`GhgBody`, 8 windows; `AbmBody` has the same shape). Each loads its binding from an embedded resource the same way and keeps the DISL model of its current bytes the same way. **Do now**: T278, in M3 beside T150, one loader for a bundled binding and the memo on `ITextBody` or beside it, the four bodies its consumers (FR-052).
- *`AnsibleElementMapper`/`HelmElementMapper`* (12 windows): the viewport filter that keeps a node in view and pulls in what its edges reach. **No**: T120 moves both onto `DiagramViewport.Intersects`; the edge closure is two modules' and reads their own edge types.
- *Timeline and dependency-graph* (15 windows between the registrations, 14 between the sessions and between the validators): overrides of the bases, as T112 found. **No**: left to their conversions.

**From the method-length count.** Nothing new: the two renamed provider methods and `DislModelBuilder.From` are in the twenty longest, which T241 already takes.

**What M2 made cheap.** A module whose subject is a folder or a solution rather than one document now has a store (`WatchedFolderStore`), a YAML reader (`TolerantYaml`), a resolver base (`DiagramSnapshotSourceResolver<TSnapshot>`) and the change handler, so a new one is its reader, graph and layout. A module's contract tests now cover its store, reloader, resolver and handlers. A removal from a line-based body is undone by the shared `RestoreLinesCommandHandler<TStore>`, byte for byte.

**What M2 made pointless.** T129 (above). Nothing else among the remaining tasks: the M3 utilities are inside the notation code the rollout did not touch.

**The sibling pairs (T112).** Read with `clones.py`'s windows at `48eec6a5d`, per pair of files of the two modules. Each module of the four references only core projects, so each pair is still two modules (FR-040). Sankey and supply chain share little in their role classes: 12 windows between the action providers (the start of `RunAsync` and the removal confirmation), 4 between the registrations and 2 between two handlers; their model side shares 39 windows in the parsers, 30 in the layouts, 30 in the writers and 9 in the validators, which T123, T124, T134 and T138 take. Timeline and dependency-graph share their role classes by copy only as the overrides of the bases (store 20, resolver 19, registration 16, session 14, validator 14, handlers 4 to 8 windows); the one piece of logic copied is the `YamlException` catch in the store's `Rebuild` and `UnreadableOf` and in the validator, which T140 replaces with `ParseOutcome`. Their model side shares 6 windows in the parsers, 1 in the writers and 1 in the definitions (FR-039).

**The fifteen beside report 1.7 (T113).** Types beyond the shape, production code only, counted at `48eec6a5d` (dotnet-dependency-graph at the merge of T110). Every module has `Diagram.cs`, `ServiceCollection.AddX.cs`, a store with its interface, a session, a resolver, a mapper, the two providers, a parser and writer or an FBL body, its model and its commands; what is listed here is what is left beside them. As in the M1 review, the records of a model are the model, the toolbox providers and validators are the core seams report 1.7 leaves out, and a `*Definition` is one of the DISL adapters T150 replaces; they are named only where they say something about the module.

| Module | Type | Lines | Why it is there |
|---|---|---|---|
| agent-behavior-modelling | `AbmBody`, `AbmMarkdownPlugin` | 117, 288 | The FBL body and the binding's persistence plugin (FBL §11): the module's parser and writer, in the form report 1.7 allows |
| agent-behavior-modelling | `AbmDocumentFactory` | 66 | A new model is a Markdown file an agent can follow, not an empty one; one of the four document factories SC-007 allows |
| agent-behavior-modelling | `AbmLayout`, `AbmNodeKinds`, `AbmBreach` | 194, 133, 34 | The tree layout; what a node may hold, which the toolbox and the drop check share; the validator's breach record |
| agent-behavior-modelling | `AbmEdits` | 25 | What the handlers share besides the handler base: node types and one refusal |
| agent-activity-diagram | `AadBody` | 168 | The FBL body: the parser and writer |
| agent-activity-diagram | `AadProviders` | 128 | The palette and the validator in one file; its name is the only thing off the shape |
| timeline | `TimelineScale`, `TimelineRows`, `TimelineInstants`, `TimelineArrangement` | 61, 33, 24, 87 | The one conversion between a time and x, and between a row and y, the one reading of a time, and "Arrange diagram" |
| timeline | `TimelineDisl`, `TimelineTimes` | 129, 51 | The DISL model built from the module's own reading, and the CEL plugin functions of its definition; T225 and `timeline-disl-fbl` decide both |
| timeline | `TimelineEdits`, `TimelineRules` | 26, 23 | Locate-before-edit for every handler (undo replays the same command instance); the rule ids |
| dependency-graph | `DependencyGraphRows`, `DependencyGraphEdits`, `DependencyGraphRules` | 34, 26, 23 | Timeline's three, for the same reasons (T112) |
| dependency-graph | `DependencyGraphFindings` | 164 | The definition's constraints evaluated by the DISL runtime: the validator's rules, written once in DISL |
| azure-devops-pipeline | `PipelineGraphBuilder`, `PipelineLayout`, `PipelineMetrics` | 211, 221, 38 | What waits for what under the schema's rules, and the layered picture of it |
| azure-devops-pipeline | `PipelineTemplates` | 152 | Follows `template:` and `extends:` within the workspace; the reason its store needs the workspace root and stays its own |
| azure-devops-pipeline | `PipelineViewState`, `PipelineConnectionView`, `PipelineElementExpandedEventArgs` | 57, 39, 12 | What each connection has expanded: view state, never written to the file |
| azure-devops-pipeline | `PipelineEdits`, `PipelineEditTarget`, `PipelineElementLocation`, `PipelineBlocks`, `PipelineLineIndent`, `PipelineAddKind`, `PipelineAddOutcome` | 159, 61, 44, 125, 20, 20, 20 | The edit side of a YAML the module writes by splice: locate, decide editability, the YAML of a new block, indentation |
| azure-devops-pipeline | `PipelineRuleSet`, `PipelineRules`, `PipelineDocumentFactory` | 234, 30, 41 | The validator's rules and ids; a new pipeline that runs |
| c4 | `C4Document`, `C4Line`, `C4DocumentLine`, `C4Tokens`, `C4Token`, `C4ParseState`, `C4ParseScope` | 174, 48, 12, 206, 8, 69, 16 | The Structurizr DSL held as its lines, and the line tokenizer; `LineDocument` and `LineLexer` replace the first and the fourth in M3 (FR-042, FR-048) |
| c4 | `C4Layout`, `C4Metrics`, `C4Theme` | 710, 64, 131 | The layout, its pitch and the default look |
| c4 | `C4LayoutSidecar`, `C4SidecarPosition`, `C4ViewMembershipCommands` | 261, 4, 83 | Positions live in a sidecar because the `.dsl` is another ecosystem's format |
| c4 | `C4Placement`, `C4Commands` | 288, 165 | Where a new element goes in the DSL; the small commands in one file |
| c4 | `C4SessionFactory`, `C4DocumentFactory`, `C4CodeDocumentFactory` | 83, 121, 29 | One factory per C4 type, which differ only in the view; kept, as the M2 notes say (SC-007's four) |
| c4 | `C4RuleSet`, `C4Rules`, `C4StructurizrMirror` | 479, 61, 105 | The rules, their ids, and which mirror Structurizr's inspect |
| wardley-map | `WardleyDocument`, `WardleyDocumentLine`, `WardleyLine` | 209, 13, 14 | The `.owm` held as its lines; `LineDocument` replaces them in M3 (FR-042) |
| wardley-map | `WardleyIdentities`, `WardleyIdentityKeys`, `WardleyIdentityEntry`, `WardleyIdentityKind` | 234, 99, 19, 17 | Identities the `.owm` has no place for, in a sidecar; the reason its resolver stays off the resolver base |
| wardley-map | `WardleyActions`, `WardleyElementDescriptions`, `WardleyElementDescription`, `WardleyEditability` | 370, 158, 13, 64 | What an action or row runs on, what to call an element, and the one place editability is decided |
| wardley-map | `WardleyElementCommands`, `WardleyElementCommandHandlers` | 124, 455 | Commands and handlers in two files instead of one each, on the handler base |
| wardley-map | `WardleyAxis`, `WardleyEvolution`, `WardleyDecorators`, `WardleyElementTypes` | 45, 71, 67, 41 | Notation: the axes, the evolution stages, the decorators, the wire's element types |
| wardley-map | `WardleyRuleSet`, `WardleyDocumentFactory`, `ServiceCollection.AddWardleyMapCommands` | 253, 26, 65 | The rules; a new map titled after its file; the command registrations in a second extension |
| sparql | `SparqlTokenizer`, `SparqlToken`, `SparqlTokenKind`, `SparqlParseException`, `SparqlVocabulary` | 366, 24, 47, 12, 29 | The tokenizer; `TerminalScanner` takes its terminals in M3 (FR-044) |
| sparql | `SparqlProjection`, `SparqlProjectionResult`, `SparqlLayout`, `SparqlSelection` | 439, 108, 281, 107 | The variable-as-node projection, its layout, and the id vocabulary the resolver and providers share |
| rdf | `RdfFamilySession`, `IRdfReading`, `RdfReadings`, and per reading `XReading`, `XProjection`, `XLayout`, `XSelection`, `XElementMapper`, `XValidator` | 99, 34, 21, ... | Four readings of one Turtle file over one store (FR-038): each reading is a module's session, mapper and validator in all but name |
| rdf | `RdfTokenizer`, `RdfParseException`, `RdfVocabulary`, `OwlVocabulary`, `SkosVocabulary`, `ShaclVocabulary` | 383, 11, 44, 64, 58, 131 | The tokenizer (FR-044) and the vocabularies each reading names |
| rdf | `OwlModelIndex`, `OwlClassHierarchy`, `ExpressionRenderer`, `ShaclShapeDiscovery`, `SkosLabels` | 252, 153, 158, 191, 67 | The analyses a reading needs that a projection should not repeat |
| rdf | `ShaclActions`, `ShaclProperties`, `SkosActions`, `SkosProperties`, `SkosCommands`, `ShaclEditGate`, `ShaclRefusals` | 294, 237, 230, 179, 113, 76, 34 | Each reading's actions and rows, registered through the family's one provider pair |
| rdf | `RdfRegistrationHeaders`, `SkosRegistrationLanguage`, four `XDocumentFactory`, `RdfLocalName` | 77, 94, 31 to 41, 28 | Registration headers a reading reads; a new document per reading, named after its file |
| rdf | `RdfGestures`, `RdfTermInput`, `RdfViewport` | 43, 54, 43 | The `new:` placement id, a term as an author types it, and the viewport check (FR-045) |
| causal-loop-diagram | `CausalLoopBody`, `CausalLoopNote`, `CausalLoopUnreadable` | 285, 174, 97 | The FBL body, the note re-read as the tool always read it, and the sentence for what the binding does not read (`causal-loop-disl-fbl`) |
| causal-loop-diagram | `CycleFinder`, `CausalLoopCycles`, `SelfOrganizingLayout`, `CausalLoopLayout`, `CausalLoopMetrics` | 194, 54, 487, 215, 39 | The feedback loops the arrows form, the CEL plugin over them, and the two layouts |
| causal-loop-diagram | `CausalLoopSelection`, `CausalLoopEdits` | 71, 168 | The id vocabulary; the refusal sentences the handlers share |
| mindmap | `MindmapDocument`, `MindmapNode`, `FreeplaneXmlWriter`, `FreeplaneNewline`, `MindmapFreeplanePlugin`, `MindmapLinks` | 265, 178, 127, 25, 133, 93 | The Freeplane XML as a document every edit mutates, and the FBL plugin over it; the module keeps its own types (M2 notes) |
| mindmap | `MindmapChange`, `MindmapReloaded`, `MindmapStructureChanged`, `MindmapNodeUpdated`, `MindmapChangedEventArgs` | 9, 4, 8, 4, 9 | The module's own changed event, the one SC-007 counts against it (below) |
| mindmap | `MindmapViewState`, `MindmapConnectionView`, `MindmapLayout`, `MindmapMetrics`, `MindmapOptions` | 61, 61, 143, 59, 20 | Folding per connection, the layout and its settings |
| mindmap | `MindmapCommandHandler`, `ServiceCollection.AddMindmapCommands`, `MindmapDocumentFactory`, `MindmapFormatException` | 60, 36, 34, 18 | Its own handler base and registrations; a new map with one root named after its file |
| databricks | `BundleParser`/`Writer`, `JobParser`/`Writer`, `PipelineParser`/`Writer`, `DatabricksYaml`, `DatabricksSplices` | 190/150, 175/335, 139/162, 67, 97 | Three formats in one family; `YamlAccess` replaces `DatabricksYaml` in M3 (FR-046) |
| databricks | `DatabricksBundleLayout`, `DatabricksJobLayout`, `DatabricksPipelineLayout` | 54, 129, 50 | One layout per type; the job layout is one of FR-045's layerings |
| databricks | `DatabricksSelection`, `DatabricksGestures`, `DatabricksHeaders`, `DatabricksDocumentFactory`, `DatabricksRuleSet` | 226, 42, 65, 72, 180 | The id vocabulary, the `new:` id, the `resource:` header, a new document per type, the rules |
| databricks | `DatabricksBundleCommands`, `DatabricksJobCommands`, `DatabricksPipelineCommands` | 31, 119, 53 | Commands grouped per type |
| ansible-structure | `AnsibleProjectReader`, `AnsibleGraph`, `AnsibleLayout`, `AnsibleMetrics` | 606, 307, 155, 35 | A folder is read, not parsed: the reader stands in for the parser, and there is no writer |
| ansible-structure | `AnsibleSessionFactory`, `AnsibleRuleSet`, `AnsibleRules` | 51, 163, 20 | The subject is the registration's folder; the rules |
| helm-chart | `HelmChartReader`, `TemplateScan`, `DependencyResolution`, `HelmGraph`, `HelmLayout` | 464, 103, 58, 150, 147 | Ansible's shape: a read-only folder, read and laid out |
| helm-chart | `HelmSessionFactory`, `HelmRuleSet`, `HelmRules` | 59, 233, 38 | As ansible |
| dotnet-dependency-graph | `SolutionReader`, `ProjectReader`, `PackageDescriptionReader`, `DependencyGraph`, `DotNetDependencyGraphLayout` | 196, 260, 139, 297, 164 | Ansible's shape again, from a solution and its projects |
| dotnet-dependency-graph | `DotNetDependencyGraphSessionFactory`, `DotNetSolutionDocumentFactory`, `DotNetDefinition` | 57, 60, 124 | Both factories read the registration's `body:` header (T110 keeps them); the definition adapter |

## Tasks added, reduced and struck

**Ticked** (merged, FR-014): T067 to T111 and T273, T274, each in its own `etalii.adp` pull request when its standalone pull request had merged (standalone pull requests 225 to 293); T112, T113 (recorded above), T114 (standalone pull request 294), T115 ([M2-measurements.json](M2-measurements.json)), T116 and T117 (this pull request).

**Added**:

- T277: a delegate registration for a document factory, `AddEmptyDocument(origin, baseName => text)`, and the twelve document-factory classes onto it, before M3 (FR-029; SC-007). Recommended in question 1; struck again if the maintainer chooses otherwise.
- T278: one loader for a bundled FBL binding and one memo of a body's DISL model, in M3 beside T150, with the four FBL bodies as consumers (FR-052).

**Widened**: T135 also replaces `DependencyGraphWriter.Number`.

**Reduced**: T137 to `WardleyParser.WithoutComment` (the causal-loop `Tokenize` went with `causal-loop-disl-fbl`); T140's `YamlException` sites from eleven modules to seven.

**Struck**: T129, overtaken by `causal-loop-disl-fbl`: causal-loop-diagram reads and writes through its FBL binding and has no `CausalLoopDocument` to replace.

**Tasks under FR-012.** The conversion specifications in `etalii.adp.ide.standalone/.spec-workflow/specs/` at `20d43776d`: `causal-loop-disl-fbl` and `fbl-written-text` are done (10 of 10 and 7 of 7 tasks, with implementation logs); `timeline-disl-fbl` has 4 of its 6 tasks done (the splice writer and the close are left); the other thirteen have one approval each and no task done. So: T129 **overtaken** (above), T137 **reduced** (above), T140 **reduced** (above). T225 **stands**, reading `timeline-disl-fbl` first as it says: once that conversion closes, only dependency-graph's reading needs the bridge. Every other remaining task under FR-012 (T127, T128, T134, T136, T138, T231, T232, T236 to T239) **stands**: its module's conversion has not started.

## Behaviour changes

Ruled since the M1 review: none; B-14's ruling of 2026-10-13 was applied to every module the rollout put on the frames, and each band C pull request named the modules whose behaviour changed, with a guard. No row was added during M2: the changes each module pull request listed (an unreadable first open held unreadable, the shared refusal sentences, an edit writing text that does not parse cached as usable in rdf) follow from rulings already made, B-14 and the store base's lifecycle, and are recorded in those pull requests.

Still open: B-07 and B-08, needed by M4 (T178) and M6. M3 needs B-01 to B-06, all ruled on 2026-10-12.

## Follow-up features

None. Every finding of M2 serves a requirement of this feature.

## Questions for the maintainer

**1. SC-007 allows four document-factory classes after M2; there are twelve, and mindmap keeps its own changed-event type.** Each factory writes a new document from the file's base name or its type (a map titled after its file, one C4 view per type, one starter per RDF reading), which `AddEmptyDocument(origin, text)` cannot say, so the classes stayed. Mindmap's `MindmapChangedEventArgs` stays with its own store, because its document is Freeplane XML that every edit mutates in place.

- (a) **Add T277 now, before M3**: a delegate registration, `AddEmptyDocument(origin, baseName => text)`, takes the twelve factories' place, so none is left as a class; and amend SC-007's changed-event clause to name mindmap's one type as kept on the record. *Recommended*: one overload in `EtAlii.Adp.Diagram` and eight modules' registrations, an estimated 250 lines fewer (the twelve classes hold 588), and SC-007 then holds as written for factories; mindmap's store is a larger change than the criterion is worth before M7.
- (b) Amend SC-007 to the measured figures (twelve document-factory classes, one changed-event type), with no new task. Settles it today; the factories stay classes.
- (c) T277, and move mindmap onto the store base as well. SC-007 holds in full; mindmap's store, session and handlers are rewritten in M2, the largest single change left in the milestone.
- (d) Other.

This pull request is written as (a); it changes as the answer says.

## Ownership

M2 was owned by one developer, signing as `agent-1-<task>` (FR-006), with the maintainer's rulings of 2026-10-13 on SC-006 and B-14. M3 is owned by the same developer unless the maintainer hands it over with this review.
