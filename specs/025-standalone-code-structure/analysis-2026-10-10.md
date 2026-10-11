# Code analysis: the C# code of etalii.adp.ide.standalone

Repository `etalii-adp/etAlii.adp.ide.standalone`, `develop` at `fcb64c9`, read on 2026-10-10. This is advice only: nothing was changed, committed or pushed.

## In short

The C# code is about 246,000 lines in 2,133 files. About 121,000 are production code: 92,000 in the tool modules (diagrams, designers and editors) and 29,000 in the core and specification projects. The other 125,000 are tests.

The code inside a single type is mostly decent: careful, well tested and heavily commented. The large problems sit **between** types:

1. **The diagram modules lack a middle layer.** Core provides low-level pieces (`WritableDocumentLifecycle`, `DiagramDocumentChangeHandler`, `GestureIds`, `RestoreDocumentCommand<TStore>`). Each of the 19 real diagram modules then re-wraps them in the same ten role classes: source resolver, session, session factory, document store, entry, changed-event args, reloader, document factory, edit helper and command handlers. A normalized clone scan puts most of the duplicated production code in exactly those roles. About **9,000 to 10,000 production lines and about 300 files** could go, and with them about 5,000 lines of per-module tests that would become shared contract tests.
2. **Shared utilities are copied instead of shared.** These exist several times each: a line document, the Turtle/SPARQL tokenizers, an offset-to-line index, graph layering, a `Box` struct, the viewport-intersection test, YAML access helpers, number formatting, quoting, file watching with read-retry, and debouncing. The copies have **already drifted**, and several of the possible defects listed below come from that drift.
3. **The core project graph does not say what the architecture says.** `EtAlii.Adp.Diagram`, the "diagram abstractions" project that 67 modules reference, is actually the host layer: it references 8 core projects and contains every gRPC streaming service. `EtAlii.Adp.Sessions` contains no code. The three tool families (diagram, designer, editor) each have a hand-copied discovery, catalog, factory registry and router, and the routing precedence between them is coded in four places.
4. **The specification projects follow two philosophies.** FBL maps its JSON into typed records at load. DISL interprets raw `JsonElement` at every call, with about 430 `TryGetProperty`/`JsonElement` uses spread across its derivation code. CEL programs are compiled and cached in about five different ways. FBL's four format families each write their own copy of the same write loop. Two of FBL's three hand-written parsers duplicate libraries the project already uses.
5. **The tests copy their infrastructure.** One gRPC flow-test harness is copied into 35 classes (`LoginAsync` alone has 23 copies), and a parity-transcript harness into 6 modules. **25 fixed "stream startup" sleeps** remain: the same race that `HierarchyWatchProbe` was written to close for hierarchy watches only, and a likely source of the CI flakiness seen before.

What follows is organized by theme, most valuable first. Every finding names its evidence as `path:line`; paths under `src/backend/` are written from there, and module paths from `src/diagrams/`.

---

## 1. The missing middle layer for diagram modules (highest value)

Production line counts for the 19 diagram modules with real code: rdf 12.8k, wardley-map 6.4k, azure-devops-pipeline 6.3k, c4 5.9k, causal-loop-diagram 5.2k, gartner-hype-cycle-graph 4.8k, databricks 4.7k, sparql 4.5k, timeline 3.9k, agent-behavior-modelling 3.8k, supply-chain 3.6k, ansible-structure 3.4k, helm-chart 3.4k, dependency-graph 3.3k, mindmap 3.2k, sankey 3.2k, functional-decomposition-graph 3.2k, dotnet-dependency-graph 2.5k, agent-activity-diagram 2.3k.

The normalized clone scan hashes 10-line windows with module prefixes replaced by a placeholder. Shared windows by role pair:

| Role | Shared windows |
|---|---|
| ContextSourceResolver | 1,911 |
| SessionFactory | 326 |
| ContextPropertyProvider | 134 |
| DocumentStore | 115 |
| ContextActionProvider | 99 |
| the `*Session` classes (rdf/owl/shacl/skos; timeline/dependency-graph/fdg/ghg/aad/sankey) | several hundred |

### 1.1 Context source resolvers: one generic base (about 2,000 to 3,000 lines)

- **Evidence:** 19 files, 3,840 lines. `FdgContextSourceResolver.cs` and `GhgContextSourceResolver.cs` differ almost only in the doc comment, two sentences and the 20-line method that describes an element by id. `TimelineContextSourceResolver.cs` and `DependencyGraphContextSourceResolver.cs` differ in 18 to 30 of 216 lines. Each `ResolveAsync` runs about 80 code lines (for example `AadContextSourceResolver.cs:51`, `GhgContextSourceResolver.cs:51`, `TimelineContextSourceResolver.cs:44`) and repeats the same steps:
  1. the parent-scope check;
  2. `_router.Route` and the origin check;
  3. placement and relation gesture ids;
  4. the client-path check;
  5. the payload, taken by mapping the whole diagram through `_mapper.Visible(model, DiagramViewport.Unbounded)` to find one element;
  6. the same `ContextTarget` construction.
- Each file also declares a private `Unsubscriber`; there are 12 `*Unsubscriber` types in the modules.
- **Recommendation:** add an abstract `DiagramElementSourceResolver<TModel>` in `EtAlii.Adp.Diagram`. A module supplies its `Origin`, `Load(bodyPath)`, `Describe(model, id)`, a single-element mapping and a change subscription, plus optional nouns ("New influence"). Add `Disposable.From(Action)` to core and delete the 12 unsubscribers. About 15 modules drop from 170 to 260 lines to 40 to 70.

### 1.2 Sessions: a document-session base (about 1,100 lines)

- **Evidence:** 22 session files, 4,283 lines. `FdgSession.cs` and `GhgSession.cs` differ in 17 lines, and the timeline and dependency-graph sessions in 10.
- Core already has `DiagramDocumentChangeHandler` for the delivered-elements diff. **13 sessions do not use it** and hand-roll `_delivered` plus `DiagramDiff.Between` instead (for example `TimelineSession.cs:16,58,121`): timeline, dependency-graph, mindmap, wardley, databricks, sparql, the four rdf sessions, ansible, helm and dotnet.
- **Recommendation:** add `DocumentDiagramSession<TStore, TModel>` in `EtAlii.Adp.Diagram`, with abstract `Model()` and `Render(model, viewport)` and virtual `PlacementCommand` and refusal texts. Move the 13 hand-rolled diffs onto the change handler.

### 1.3 Store, entry, event args and reloader (about 1,650 lines and 40 files)

- **Evidence:**
  - Reloaders: 16 files that are only a constructor and two forwarding calls (`TimelineDocumentReloader.cs`, 33 lines).
  - Event args: 12 copies of `XDocumentChangedEventArgs(string path)`.
  - Entries: `XDocumentEntry(Document, Model, string Error|Unreadable)` in 13 modules. The failure field is called `Error` in 7, `Unreadable` in 6, and C4 uses a `bool` (`c4/.../C4DocumentEntry.cs:9`).
  - Stores: `SankeyDocumentStore.cs` and `SupplyChainDocumentStore.cs` differ in one doc-comment line. The ghg, fdg, abm and aad stores differ in 8 to 13 lines.
  - The cause: `IReloadableDocumentStore` (`EtAlii.Adp.Documents`) declares only `Reload`, so every module re-declares `BodyDeleted`/`Forget` in its own interface.
- **Recommendation:** in `EtAlii.Adp.Documents`, add:
  - an `IDiagramDocumentStore : IReloadableDocumentStore` with `BodyDeleted`/`Forget`;
  - a generic `DiagramDocumentReloader<TStore>`;
  - a `DocumentEntry<TBody, TModel>` with one failure field;
  - a `DocumentChangedEventArgs`;
  - a `LifecycleDocumentStore<TEntry, TBody>` base with abstract `Read`, `TextOf` and `Rebuild`.

  A module keeps a 10 to 15 line subclass, plus a marker interface only where DI or a command needs a distinct type (as `RestoreDocumentCommand<IFdgDocumentStore>` already does).

### 1.4 Session factories and document factories become registrations (about 600 plus 500 lines)

- **Evidence:** 21 session-factory files (972 lines). Most are a constructor, `Origin` and one `new XSession(...)`. The timeline and dependency-graph factories are identical after renaming, and the owl, shacl and skos factories are 0 to 3 lines from rdf's. The 21 document factories (1,043 lines) mostly return a constant.
- **Recommendation:** `services.AddDiagramSession(origin, ctx => new SankeySession(...))` over a delegate-based `DiagramSessionFactory`, and `services.AddEmptyDocument(origin, "timeline: 1\r\nelements: []\r\n")`. C4, helm, ansible and dotnet keep their own factories, because they read registration headers.

### 1.5 Command handlers: one edit pipeline, and the save warning by construction

- **Evidence:** 66 handler files in the diagram modules (178 handler classes including multi-handler files such as `wardley-map/.../Commands/WardleyElementCommandHandlers.cs`, 681 lines with 12 handlers). Each repeats null and cancel checks, `GetOrLoad`, the usable check, find-by-id ("is no longer in this…", 92 occurrences), capturing the inverse, `Save`, then `Failed ? Failure : Success`. `Task.FromResult(CommandResult…)` appears 218 times.
- `XEdits.Run` (load, parse a copy, apply, save, return `RestoreDocumentCommand`) is copied in 9 modules (`functional-decomposition-graph/.../Commands/FdgEdits.cs:8-44`). A `readonly record struct XEdit(string? Refusal)` is declared 6 times, although core already has `DocumentEdit<T>`.
- **Copy drift:** `DocumentSaveResult.Warning` is documented as "must not pass unmentioned" (`EtAlii.Adp.Documents/DocumentSaveResult.cs:11`). Every handler in timeline, dependency-graph, mindmap, azure-devops-pipeline, c4 and causal-loop drops it (checked in `timeline/.../Commands/RenameTimelineElementCommandHandler.cs:39-42`). That is harmless only while the Wardley store is the one store that produces warnings.
- 12 hand-written `Restore*CommandHandler`s remain beside the generic `RestoreDocumentCommandHandler<TStore>` (`EtAlii.Adp.History/RestoreDocumentCommandHandler.cs:14`). `RestoreWardleyDocumentCommandHandler` duplicates it outright, and the timeline and dependency-graph line-restore handlers differ in 2 lines.
- **Recommendation:** in `EtAlii.Adp.History`, add:
  - `CommandResult.FromSave(DocumentSaveResult, ICommand inverse)`, which carries the warning;
  - a `DocumentEditHandler<TCommand, TEntry>` base whose only abstract member is `Apply(entry, command) → inverse | refusal`;
  - `DocumentEditRun.Run(...)` with one `EditOutcome` struct;
  - a generic `RestoreLinesCommandHandler<TStore>`.

### 1.6 Action and property providers: a small shared frame

These hold real module logic, so the gain is smaller (about 600 lines). The shared parts are:
- `DispatchAsync`, copied 13 times (`GhgContextActionProvider.cs:237`);
- the `Scope`;
- `DiscoverAsync => Definition.Menus(...)`;
- the "could not be read, so cannot be edited" guard;
- the deletion-confirmation block (6 modules).

Wardley shows the cost of not sharing: `WardleyContextActionProvider` keeps two `switch (actionId)` blocks that must stay in step (`:145` discover, `:312` execute), and `WardleyContextPropertyProvider.SetAsync` (`:173`) maps the same commands a third time. A per-action record (id, applies-to, describe, toCommand) read by both providers removes that.

### 1.7 What a module would look like afterwards

A typical document-based module carries 8 or 9 types for persistence alone today. Afterwards it would be: `Diagram.cs` plus `ServiceCollection.AddX.cs`, `XDocument` (entry and store subclass), `XSession`, `XSourceResolver`, `XElementMapper`, `XActions`, `XProperties`, the parser and writer (or an FBL binding), and the commands. agent-activity-diagram already points this way: `AadProviders.cs` holds the toolbox, property provider and validator, and `AadSession.cs:101` holds its factory.

**Suggested order:** the reloader and `IDiagramDocumentStore` first, then the store base (pilot on sankey, supply-chain, fdg and ghg), the session-factory delegate, the session base, the resolver base and the handler base. Each step lands per module, in its own pull request.

---

## 2. Sibling modules that should share code

| Pair or family | Finding | Advice |
|---|---|---|
| ansible-structure and helm-chart | `AnsibleWatchedFolder.cs` and `HelmWatchedFolder.cs` (129 lines each) differ only in namespace, one comment and the type names (checked by diff). `AnsibleYaml`/`HelmYaml` and the two `NodeSubscription`s are identical. `AnsibleProjectStore`/`HelmChartStore` differ in 2 lines. dotnet-dependency-graph's `SolutionWatcher.cs` plus `DependencyGraphStore.cs` (292 lines) is a third variant. These are the only three modules with a `FileSystemWatcher`. | A core `WatchedFolderStore<TSnapshot>` (claim, release, settle debounce, `Changed`) and a `TolerantYaml` reader. About 900 lines. Keep the readers, graphs and rules per module. |
| sankey and supply-chain | Identical document layer. The writers' private `Text()` quoter is duplicated (`SankeyWriter.cs:251`, `SupplyChainWriter.cs:299`). The parser, layout and providers genuinely differ. | Do not merge the modules. Section 1 absorbs most of the overlap, and the stricter `Text()` quoter belongs in core (see possible defect D1). |
| timeline and dependency-graph | Near-clones: 0 lines different in reloader, document factory, session factory and relation gesture; 10 in session; 13 in store; 18 to 30 in resolver; 2 in rename/restore handlers. Same command set. | Section 1 removes most of it. What is left (model, parser, writer) could share a small YAML node/edge base. Both also still carry `TimelineNewPlacement`/`TimelineRelationGesture`-style forwarders to core `GestureIds`; inline them. |
| rdf, owl, shacl, skos | Already one project. Four sessions of about 250 lines differ from `RdfSession.cs` in only 24 to 47 lines, and four factories in 0 to 3. | An `RdfFamilySession<TProjection>` and one factory parameterised by origin. About 650 lines. |
| sparql and rdf | `SparqlTokenizer.cs` (366) and `RdfTokenizer.cs` (383) share the constructor, line starts and every terminal reader (`ReadString`, `ReadIri`, `ReadNumber`, `ReadBlankNodeLabel`…). String decoding, `NumericDatatype` and `ResolveIri` are duplicated. They have already drifted: the RDF one rejects `\r` in short strings and the SPARQL one does not. | Keep the parsers separate, as `SparqlParser.cs:16` intends. Put the shared terminal scanner, `RdfEscapes`, `NumericLiteral` and a `LineIndex` in core, because the sparql project may not reference rdf. |
| fdg, ghg, aad, abm | Infrastructure is clone-level (store 8 to 13 lines different, reloader 6, session 17 for fdg). Mappers and providers genuinely differ. | The first pilots for the section 1 bases. Fdg has no `definition/` yet; once it has one it can move to DISL-derived toolbox, menus and rows as ghg did. |

### 2.1 The 48 stub modules

- **Evidence:** 48 of the 67 diagram folders are stubs. Each is a 17-line `Diagram.cs` holding one `DiagramDefinition` (origin, title, description, icon), a 7-line `.csproj` and two boilerplate readmes. Together that is 192 files and 48 projects of the 129 in the solution. At runtime they only give a `.adp` naming that type a title and an icon.
- **Advice:** one `EtAlii.Adp.Diagram.Catalog` project whose `Definitions` array holds all 48 would remove 188 files and 47 projects, with no core change and a faster build. Going further, the catalog could be generated from `docs/tools.md`, which the tests already treat as the source of truth.
- **This needs a decision first:** `.spec-workflow/steering/tech.md:61` mandates the stub shape, and the architecture pages say "a type is a folder; deleting the folder removes it".

---

## 3. Shared utilities that core should own

Each item exists several times today. The right home is core, typically `EtAlii.Adp.Documents` or a small new project.

| Utility | Copies today (evidence) | Proposed home |
|---|---|---|
| Line document | `wardley-map/.../WardleyDocument.cs` (204), `c4/.../_Model/C4Document.cs` (169) and `causal-loop-diagram/.../CausalLoopDocument.cs` (136) reimplement core `EtAlii.Adp.Documents/LineDocument.cs` (229). Line endings, which have bitten this repository repeatedly, are handled four times. | Move all three onto `LineDocument`, adding `ReplaceLine`/`InsertLine` if needed. |
| Offset-to-line index | `RdfTokenizer.LineOf:33`, `SparqlTokenizer.LineOf:34`, `RdfWriter.LineOf:584` (binary search), `ShaclWriter.LineOf:441` (linear scan). | `LineIndex`, also exposed from `LineDocument`. |
| Graph layering | Three algorithms with different cycle rules: DFS with back edge = 0 (`PipelineLayout.Layers:171`, `DatabricksJobLayout.Layers:66`, `AnsibleLayout.Depth:130`, `DotNetDependencyGraphLayout:79`), Kahn's algorithm (`SupplyChainLayout.Layers:420`) and relaxation (`C4Layout.Rank:371`). Also column assignment in `SankeyLayout.ColumnsOf:285`, `SkosLayout:90` and `OwlLayout`. The same graph would layer differently in different tools. | A core layout library: `Layering.LongestPath(nodes, edges, CyclePolicy)`, `OrderByBarycentre`, a `GridPacker` (rdf, shacl and sparql each grid-place by hand, while core `RowPacking` is used by only two modules) and an `OverlapResolver` (`C4Layout.Spread:606`, `SelfOrganizingLayout.Separate:194`). |
| Rectangle and viewport test | 9 identical `record struct (X, Y, Width, Height)` types: `C4Box`, `CausalLoopBox`, `AnsibleBox`, `HelmBox`, `SupplyChainBox`, `SankeyBox`, `MindmapBox`, `SparqlRect`, `GhgElementMapper.Box`. The viewport test `box.Right >= viewport.MinX && …` is written in about 17 mappers (for example `C4ElementMapper:357`, `CausalLoopElementMapper:202`). | One `Rect` and `DiagramViewport.Intersects(Rect)`. |
| YAML access | `Scalar(YamlMappingNode, key)` in 7 parsers plus 3 local copies in `HelmChartReader`. `Sequence` and `LineOf` are repeated too. `databricks/.../DatabricksYaml.cs` already has the right set, but locally. | Promote it to `EtAlii.Adp.Documents/YamlAccess.cs`, beside `YamlNodeRange`. |
| Number formatting | `Number(double) => "0.####"` is defined 6 times in Wardley alone (writer, edit, action provider, property provider, rule set), and again in sankey, supply-chain and fdg. Fdg's provider uses `"0.##"`, so it rounds differently. | `DslNumber.Format`. |
| Lexing and quoting of line DSLs | Three comment and quote rule sets: Wardley `WithoutComment` (`WardleyParser.cs:380`, not quote-aware), C4 `C4Line.StripComment:23` (quote-aware, escapes), causal loop `Tokenize:170` (quotes, no escapes). | A core `LineLexer` with configurable comment and escape policy (C4's `C4Tokens.SplitWithSpans` is the most complete start) and a matching `QuotedString.Write`. |
| Parse outcome | Four styles: thrown exceptions (rdf, sparql, mindmap, `YamlException` in 11 modules), silent skip (`WardleyParser`), a string or bool on the entry, and findings lists (ghg). | One `ParseOutcome<TModel>` (model, problems, usable). Exceptions stay inside tokenizers. |
| File watching and read-retry | `ReadWithRetry` with `Thread.Sleep` three times (`MarkdownEditorSession.cs:174`, `PlainEditorSession.cs:202`, `KnowledgeSession.cs:591`), which blocks thread-pool threads. Core also hand-rolls a watcher in `EtAlii.Adp.Problems/TrackedProblemRoot.cs:24-40` "guarded like RootFolderWatcher". One project root ends up with 3+ recursive watchers (per connection, for reloads, for problems), plus one per editor or designer session. | A core `WatchedFile`/`WatchedFolder` with async retry, and one reference-counted `ProjectFileEvents` per root that publishes normalized events after scratch-file filtering. |
| Scratch-file detection | `HierarchyModel.cs:271/302`, `ProblemMaintenance.cs:253` (missing the `~RF` backup case), `Documents/DestinationState.cs:28,89`. | `AdpFileWriter.IsTransient(name)`, next to `TempPrefix`. |
| Debounce and idle eviction | Coalescing timers in `HistoryActionsBroadcaster.cs:43`, `ProblemStore.cs:330`, `TrackedProblemRoot.cs:51`. Idle-eviction stores in `ContextSelectionStore.cs:319`, `HierarchyModelStore.cs:114`, `HistoryStackStore.cs:65`. | `Debouncer<TKey>` and `RetainedRegistry<TKey, TValue>` in `EtAlii.Adp`, both on a `TimeProvider` (see 7.3). |
| DISL adapter scaffolding | The seven modules with a bundled DISL definition each carry a `*Definition.cs` adapter (167 to 326 lines, 1,587 in total) with the same `Lazy<BundledDefinition>`, `WireIdMap`, toolbox projection, menu `Action(...)` mapping and row mapping. Toolbox providers (`TimelineToolboxProvider.cs`, 17 lines) and rule sets (`TimelineRuleSet.cs`, `DependencyGraphRuleSet.cs`) are pure forwarders. The DISL-finding-to-severity mapping is copied three times. | A core `DislDiagramDefinition` and a `DislToolboxProvider`. Delete the forwarders. About 800 lines, and it fixes the shortcut drift (D2). |
| Editor session | `MarkdownEditorSession.cs` (183) and `PlainEditorSession.cs` (211) are the same class. The markdown copy records that a copied premise was false "for a while" (`:62-67`). | One `TextEditorSession`, with markdown as a thin subclass. |

---

## 4. The core project structure

### 4.1 `EtAlii.Adp.Diagram` is a host layer posing as an abstraction layer (high)

- **Evidence:**
  - `EtAlii.Adp.Diagram.csproj` references Hierarchy, Context, Projects, History, Editor, Designer, Documents and Backend.
  - Beside the module contracts (`IDiagramSession`, `IDiagramValidator`, `DiagramDelta`), it holds `DiagramService*`, `WorkspaceService`, `EditorService`, `DesignerService`, `WorkspaceConnections`, the designer table wire and the editor plumbing.
  - Its `ServiceCollection.AddDiagrams.cs:44-57` even registers `HierarchyService`, `ContextService` and the editor catalog.
  - So every module that only needs `IDiagramSession` pulls in ASP.NET, gRPC and half of core.
  - It also pushed `DiagramDefinition` down into Documents, and makes Problems depend on all of Diagram just for `IDiagramValidator`.
- **Recommendation:**
  - Keep a thin `EtAlii.Adp.Diagram` with the module contracts and `DiagramDefinition`/`DiagramOrigin`, depending only on Documents.
  - Move the services, the connection registry, the table wire and the reload bridge into a new host project such as `EtAlii.Adp.Workspace`.

### 4.2 Projects that are empty, too thin or too fat (medium)

- **`EtAlii.Adp.Sessions` contains no `.cs` file.** `AddSessions` lives in Authentication, and `Sessions.Tests` tests Authentication's `SessionInterceptor`. `docs/architecture.md` says Sessions owns "a connection's lifetime and its state". That lifetime is actually spread over `WorkspaceConnections`, `ContextService.RunWatchAsync`, `HierarchyModelStore`, `ContextSelectionStore` and `HistoryStackStore`.
- **`EtAlii.Adp.Backend` is 146 lines** of client hosting. `Diagram.csproj` references it (line 8) without using it, and so do 13 diagram modules.
- **`EtAlii.Adp.Documents` is a grab-bag.** It holds the wire protos, the diagram definition contract, row and text geometry, YAML line ranges, line splicing, file publishing (`AdpFileWriter.cs`, 486 lines) and Windows Restart Manager/NTFS P/Invoke. It also grants `InternalsVisibleTo` to two concrete modules, C4 and CausalLoopDiagram, so core names tools.
- **Recommendation:**
  - Either delete Sessions or make it the real owner of connection and project lifetime (see 5.2).
  - Fold Backend into Backend.Service and remove the dead references.
  - Split Documents into wire, layout and file-system parts, and replace the module-specific `InternalsVisibleTo` with a public test seam.

### 4.3 Three tool families, copied rather than generic (high)

- **Evidence:**
  - **Discovery:** the dedupe-and-log block is verbatim in `DiagramDefinitionDiscovery.cs:80-100`, `EditorDefinitionDiscovery.cs:52-72` and `DesignerDefinitionDiscovery.cs:48-68`.
  - **Copied per family:** three identical `Add*Definitions` extensions, three catalogs (their comments say they mirror each other "deliberately … without sharing a type") and three session-factory registries.
  - **Routers:** three, each with its own closed result hierarchy (`DiagramRouting`, `DesignerRouting`, `EditorRouting`).
  - **Catalog registration** is spread over four projects with `TryAdd`, so behaviour depends on registration order: the diagram catalog in `History/ServiceCollection.AddCommands.cs:25`, the editor catalog in `AddDiagrams`, and the designer catalog twice.
  - **The product rule "diagram before designer before editor"** is coded at least four times: `DiagramService.Open.cs:31-120` (one open can read `projects.json` up to four times), `HierarchyModel.RefreshDiagramStates` (`:720-815`), `ProjectValidator.cs:185-307` and `DeleteEntryCommandHandler`.
- **Recommendation:**
  - Add `IToolDefinition` with one generic `ToolDefinitionDiscovery`, `ToolDefinitionCatalog<T>`, `ToolSessionFactories<TKey, TFactory>` and `AddToolDefinitions<T>`.
  - Register each catalog once, in its own family's extension.
  - Add one `ToolRouter.Route(path, root)` returning `DiagramRouted | DesignerRouted | EditorRouted | Unreadable | None`, and switch on that everywhere.
  - This matches the CLAUDE.md vocabulary: a name that serves every kind says *tool*.

### 4.4 Editors pretend to be diagrams (medium)

- **Evidence:** `EditorSessionAdapter.cs` fakes a one-element diagram whose payload is the whole text, so every change is a Remove plus an Add that re-sends the full text. `DiagramService.Open.cs:137` type-checks `is not EditorSessionAdapter` to skip the viewport.
- **Recommendation:** give the workspace stream a `text` member and an editor pump, as designers already have `table`. Alternatively, define a minimal `IToolSession` with the viewport as an optional capability.

### 4.5 Identities and paths as bare strings (medium; one point is security-relevant)

- **Path containment is written seven times**, and the copies disagree:
  - The seven: `Diagram/ProjectTextFile.cs:45`, `Problems/ProjectValidator.cs:466`, `Problems/ProblemMaintenance.cs:240-247`, `Hierarchy/HierarchyModel.cs:887`, `Hierarchy/HierarchyModelStore.cs:80-88`, `Hierarchy/DiagramFilePair.cs:129` and `Hierarchy/HierarchyContextSourceResolver.cs:149`.
  - Only two of them refuse a symbolic link that points outside the root. `ProjectTextFile.TryResolve` does not, and it is the gate for `EditorService.SaveText`, `DesignerService.OpenTable` and the open path.
  - All seven compare with `OrdinalIgnoreCase`, which is wrong on case-sensitive Linux file systems (checked at `ProjectTextFile.cs:49`). Only `AdpFileWriter.cs:83` switches its comparer by OS.
- **Origins have three types:** a diagram origin is a `DiagramOrigin` record, a designer origin a `"vendor/type"` string, and an editor origin a string id. `ProjectValidator.cs:309` parses the designer string back into a `DiagramOrigin`.
- **Project roots** travel as `string rootPath` and serve as dictionary keys in at least five stores, with inconsistent normalization.
- **Recommendation:**
  - Add a `ProjectPath`/`ProjectRoot` value type in `EtAlii.Adp` that normalizes once, checks link escapes and carries an OS-correct comparer.
  - Add one `ToolOrigin(vendor, type, subtype)` for all three families.

### 4.6 Owning types for files and settings (medium)

- **The `.adp` registration has no owning type.** It is parsed or written ad hoc in `DiagramFilePair.cs:16,141,269`, `DiagramRegistrationSet.cs:62-84`, `CreateDiagramFileCommandHandler.cs:68`, `RegistrationLayout.cs` (341 lines) and `DiagramRegistrationName.cs`. Every `Route` re-opens the file. Layout persistence lives in Hierarchy, so 6 modules reference Hierarchy only for `RegistrationLayout`.
  - **Advice:** one `AdpRegistration` (parse and serialize the MIME line, headers and layout) with an mtime cache, and move `RegistrationLayout` and its commands to the thin Diagram project.
- **`projects.json` is re-read on every call.** `ProjectRootResolver.TryResolve` reads and parses the file at 8 call sites, several of them hot. `ContextService.ExecuteAction` resolves the project twice. `FileProjectStore.Add`/`Remove` read, modify and write with no lock.
  - **Advice:** cache per user, invalidate on write, lock the writes, resolve once per request, and move `ProjectTextFile` into Projects.
- **Name validation is written twice.** `EntryNameRules.cs:22` and `RenameEntryCommandHandler.cs:276` validate names with different rules and messages.
  - **Advice:** keep one validator.

### 4.7 History and Context depend on each other in both directions (low to medium)

- **Evidence:**
  - `IContextNoticeSink` lives in History, while `HistoryActionsBroadcaster` and `HistoryContextActionProvider` live in Context.
  - Startup ordering relies on the service locator: `Program.cs:125-128` resolves `HistoryActionsBroadcaster` and `ProblemBroadcaster` only to construct them.
  - `IContextWatchHooks` has one implementation and exists only to break a cycle.
- **Recommendation:** rename the sink so History owns it, turn the broadcasters into `IHostedService`s, and move the diagram-catalog registration out of `AddCommands`.

---

## 5. Core hotspots

### 5.1 `HierarchyModel` is a god class that does disk I/O under its lock (high)

`EtAlii.Adp.Hierarchy/HierarchyModel.cs` is 918 lines.

- **It owns too much:** three id/path indexes, rename-echo suppression, scratch and backup-file detection, watcher event translation, folder sync (`SyncFolder:520`, 83 lines), nesting, diagram-state colouring (`:720-815`), body resolution and symlink containment.
- **Disk work under the lock:** `SyncFolder`, `RefreshDiagramStates` and `IsContained` enumerate directories and open `.adp` files inside `lock (_gate)`, which gRPC threads and the watcher thread share.
- **Events raised under the lock:** `EntryChanged` fires while the lock is held (for example `:580, 614, 686, 812`), and subscribers go on into `ContextSelectionStore` locks. That is a deadlock-prone shape that `HistoryStack.cs:148` deliberately avoids.
- **Folder queries scan everything:** every "children of folder X" query is a linear scan of all entries, so subtree removal is O(n²).
- **Silent degraded modes:** the router and editor resolver are optional "for older tests".
- **Leftovers:** commented-out code remains at `:565, 583, 589`.

**Recommendation:**
- Extract a `WatcherEventNormalizer`, a `HierarchyIndex` with children-by-parent maps, and a `DiagramStateDecorator`.
- Compute I/O outside the lock and apply the result under it.
- Queue events and raise them after the lock is released.
- Make the dependencies required.

### 5.2 Connection lifetime is scattered, with a leak path (medium)

- **The leak:** in `EtAlii.Adp.Context/ContextService.cs:141-150`, `_historyStacks.Retain(rootPath)` and the problem-watch hook run before the `try` that starts at `:163`. If the `DiscoverAsync` at `:142` throws or is cancelled, `Release` (`:178`) never runs and the project's history is kept forever. Checked in the source.
- **Services composed as domain services:** `WorkspaceService.cs:60-73` composes two gRPC service classes as if they were domain services.
- **Recommendation:**
  - Model a `ConnectionSession`/`ProjectSession`, a natural content for the empty Sessions project, that acquires history, problem watching and the hierarchy model in one `using`-shaped scope.
  - Let the gRPC services delegate to domain services rather than to each other.

### 5.3 Fire-and-forget, sync-over-async and unbounded channels (medium)

- **Unobserved tasks:** `DesignerService.cs:70,75`, `WorkspaceService.cs:125`, `ContextSelectionStore.cs:177,222`, `TrackedProblemRoot.cs:80` and `HierarchyService.cs:107,155`.
- **Blocking on async work:** `HistoryActionsBroadcaster.cs:66` blocks on `DiscoverAsync(...).GetAwaiter().GetResult()` on a timer thread, and `HistoryStack.cs:322` calls `_gate.Wait()` on a semaphore that the async paths share.
- **Unbounded channels:** every pump uses one.
- **Duplicated pumps:** the open, pump and close code is duplicated between diagram streams (`WorkspaceService.cs:98-165`) and table streams (`DesignerService.cs:53-215`), and "the connection exists and belongs to this user" is checked by hand four times.
- **Recommendation:**
  - Add `WorkspaceConnection.OpenStream(streamId, session, map)`, which owns the pump, the ended message and cleanup, and awaits its tasks on close.
  - Bound the channels and give each an explicit drop policy.

### 5.4 Smaller hotspots

- **`AdpFileWriter` is static, with static mutable state.** A static `ConcurrentDictionary` of per-path locks (`:82`) grows forever. The `Monitor` locks block, so async callers wrap the writer in `Task.Run`. It cannot be substituted.
  - **Advice:** an injectable `IFileWriter` with async, reference-counted locks.
- **`AddDiagramContextActionProvider.CommitAsync`** (`:306-428`) holds four workflows: a new document diagram, a folder subject, registering an existing file and a new designer document.
  - **Advice:** one strategy per family (`DiagramAddOptions`, `DesignerAddOptions`).
- **`ProblemStore`** (450 lines) mixes caching, JSON persistence, debounced writes and staleness that depends on the router and validators.
  - **Advice:** split it into a cache and a staleness policy.
- **`ContextService.Actions.cs`** (503 lines) holds about 120 lines of proto mapping. `TryResolveTargetAsync` special-cases the Project and Problems source kinds although `IContextSourceResolver` exists for that.
  - **Advice:** a `ContextWire` mapper, as `DiagramWire` and `TableWire` already are, and register Project and Problems as ordinary resolvers.
- **Stale comments and dead code:**
  - `Program.cs:74-78` describes a `DiagramDefinition.All`/`Initialize` that no longer exists.
  - `Diagram.csproj:48` grants `InternalsVisibleTo` for that non-existent `Initialize`.
  - Three legacy RPCs are kept in production only for tests.
  - The `IoPath = System.IO.Path` alias is in 417 files only because the wire message is called `Path`; renaming it (for example `WirePath`) retires the alias.

---

## 6. The specification projects (FBL, DISL, CEL)

`FamilyReader` and `TreeFamily` are already good template methods for the *reading* half. The problems are elsewhere.

1. **The write loop is copied into every family (high).** `XmlFamily.Write:508`, `LinesFamily.Write:400`, `YamlFamily.Write:189` and `JsonFamily.Write:303` repeat one skeleton: remove when empty, replace when present, insert by key order. Placeholder and key-order logic exists four times (`JsonFamily.WireValue:441`, `YamlFamily.WireValue:560`, `LinesFamily.Placeholder:457`, and the key order three ways), although `Rule.WireOrder()` exists. JSON and YAML differ in whether computed or empty values are skipped, which looks like a latent bug.
   - **Advice:** a non-virtual `FamilyReader.Write` with `RemoveSlot`/`ReplaceSlot`/`InsertSlot` hooks, one `InsertValues` resolver and one `KeyOrder` helper.
2. **Hand-written parsers duplicate libraries (high).**
   - **JSON:** `JsonFamily` has a 210-line byte-level parser (`:37-245`), while `Utf8JsonReader` gives byte offsets and is already used in `FblDocumentLoader.cs:133`.
   - **YAML:** every body is parsed twice by two grammars, YamlDotNet in `YamlFamily.WellFormed:55` and the 550-line `YamlParser`. The parser justifies itself by YamlDotNet lacking spans, but YamlDotNet's scanner marks do carry an `Index`.
   - **XML:** the hand-written parser is justified.
   - **Advice:** rebuild the JSON reading on `Utf8JsonReader`. Run a spike on a YamlDotNet-token tree; if it fails, record why. Split every family into `XxxParser` and `XxxFamily`.
3. **DISL is interpreted from raw JSON at every call (high).**
   - `DislSpecification` keeps a `JsonElement Root`, and only the metamodel is typed.
   - About 430 JSON-access sites spread schema knowledge over the derivation code. The top files are `OperationInterpreter` (50), `ContextMenuDerivation` (46), `FormDerivation` (45), `DislNames` (43), `ConstraintEvaluator` (36) and `ActionRunner` (31).
   - `ActionRunner.Action` (`:77`, 126 lines) switches on action-kind strings at every run.
   - Compiled expressions are looked up by JSON Pointer strings that consumers rebuild by hand (`OperationInterpreter.cs:161,225-230`). A miss silently compiles on the fly (`DislEvaluation.cs:62`), so a pointer mismatch is never noticed.
   - **Advice:** typed records at load for operations, actions, toolbox, menus, forms, constraints and hooks (an `Action` union), with each expression-bearing field holding its compiled program.
4. **CEL is compiled and cached five ways (medium-high).** The five: the DISL loader by pointer, the `ConditionalWeakTable` in `DislEvaluation`, a per-call dictionary in `DislModelBuilder.DerivedIds` (unguarded, so a `CelException` escapes), a per-reading cache in `BodyReading`, and `FblDocumentLoader.Compile`, which compiles only to validate and throws the program away. CEL contexts are an enum in FBL and about 40 string constants in DISL.
   - **Advice:** one thread-safe `CelProgramCache` in `Specification.Cel`, programs stored on FBL `Rule`s, and typed DISL contexts.
5. **DISL and FBL built their own loader infrastructure twice (medium).**
   - The same diagnostic record and severity enum (`DislDiagnostic`, `LoadProblem`).
   - JSON Pointer escaping, the `Str`/`Bool`/`Strings` helpers and JSON-to-CEL scalar conversion, each twice.
   - Duplicate-key detection twice, with different techniques.
   - The `major.minor` version check twice, with different strictness.
   - **Advice:** one small shared `SpecificationJson` component.
6. **`Slot` is a one-of type written as ten nullable fields (medium).** Exactly-one is enforced by counting non-null fields (`FblDocumentLoader.cs:636`), and every consumer if-chains. Settings are stringly typed: `Empty`, `Place`, `Quote`, `Style` and `IdStrategy` give 14 string comparisons in the families.
   - **Advice:** a closed record hierarchy and enums parsed once.
7. **`FblDocumentLoader.cs` is 678 lines holding four classes**, with god methods `ReadRule:331` and `Check:539`. `GetProperty`/`First()` calls (`:362,369`) throw on schema-invalid input, against the class's collect-every-problem contract.
   - **Advice:** split into `BindingReader` and `BindingChecker`, and use `TryGetProperty`.
8. **DISL depends on FBL** only for `DislModelBuilder.From(FblModel)`. Modules therefore fabricate `FblElement`s through a 12-argument positional constructor full of `null`s (`timeline/.../TimelineDisl.cs:69-101`, and dependency-graph likewise).
   - **Advice:** a thin bridge, or a DISL-side read element.
9. **The public surface is too large.** FBL has 72 public types, many used by no other project. CEL's library registrars and several DISL types should be internal.
10. **Modules that bypass FBL (migration candidates).**
    - **Half-migrated:** timeline and dependency-graph parse with their own YamlDotNet code and then fabricate FBL elements. These are the cheapest to move: a `.fbl` binding removes their parser and writer.
    - **Splicing by hand:** databricks hand-splices YAML and JSON keys with `TrimStart().StartsWith("key:")` (`DatabricksSplices.cs`), which FBL already does losslessly.
    - **Own YamlDotNet readers and writers:** azure-devops-pipeline, ansible, helm, sankey, supply-chain and fdg. Moving them is spec work rather than a refactor.

---

## 7. Module internals worth restructuring

- **RDF projections are god methods built from closures** (high).
  - `OwlProjection.Project` (`rdf/.../Owl/OwlProjection.cs:34`) is about 420 lines: about 215 inline, then 11 local functions mutating captured dictionaries.
  - `SkosProjection.Project` is 241 lines and `RdfProjection.Project` 173.
  - SPARQL already uses a nested `Builder` class instead.
  - **Advice:** a `*ProjectionBuilder` class per projection, and a shared `BudgetedGraphBuilder<TNode, TEdge>` for the node registration and budget cut.
- **The knowledge designer dispatches on bare strings** (medium-high).
  - `KnowledgeEdits.Plan` (`:74-131`) is a 45-arm `switch` on gesture-kind strings. A `_ when view is null` guard arm sits halfway (`:111`), so reordering cases silently changes behaviour.
  - Value types are strings scattered across files: `"multipleSelection"` 20 times, `"relation"` 23 times, 35 `case` arms in `KnowledgeViewEngine`.
  - `KnowledgeEdits` is a 1,265-line static class with 60 methods.
  - **Advice:** a `KnowledgeValueType` registry (one strategy per type: stored key, comparisons, grouping, conversion), and `KnowledgeEdits` split into cell, column, view and filter edits behind a gesture table with an explicit `RequiresView` flag.
- **`KnowledgeSession` holds too many jobs** (600 lines, 17 mutable fields under one lock). It owns its own watcher, read-retry, optimistic edits with generation rollback, windowing and relation resolution.
  - **Advice:** split out a `PendingEditQueue`, a `WatchedFile` (section 3) and a `KnowledgeViewState`.
- **Wardley.**
  - The parser is a 202-line chain of 15 `TryKeyword` tests where order matters (`"annotations"` before `"annotation"`, `WardleyParser.cs:78,84`).
  - DSL text is built in command handlers instead of the writer (`WardleyElementCommandHandlers.cs:79,343,383,442,507,593`).
  - **Advice:** a keyword table in the parser, and statement builders on `WardleyWriter`.
- **`SparqlParser`** (1,432 lines, 51 methods) mixes grammar, a token skim of expressions (`FindBalancedEnd:1315`, `FindTopLevelKeyword:1353`) and scope analysis (`Finish:1062`, `AssignPaths:1111`, `IndexScope:1142`).
  - **Advice:** a `SparqlScopeAnalyzer` pass and a `SparqlTokenCursor`. That leaves about 800 lines of grammar.
- **`C4Layout`** is a 694-line static class.
  - **Advice:** shared layering for `Rank`, a `C4BoundaryPacker` (`ComputeNested`, `PushOutsiders`) and the core `OverlapResolver`.

Long methods overall: 145 production methods exceed 50 code lines and 40 exceed 80. The top ten after the RDF projections are `WardleyParser.Parse` (159), `KnowledgeValidator.Validate` (139), `SankeyLayout.Compute` (126), `ActionRunner.Action` (126), `SkosLayout.Layout` (115), `AnsibleGraph.Derive` (113), `OwlLayout.Positions` (112), `C4Layout.ComputeNested` (105), `OwlValidator.Judge` (101) and `OwlModelIndex.Build` (101). The six resolver `ResolveAsync` methods (about 81 each) disappear with 1.1.

---

## 8. Tests

1. **One gRPC flow-test harness is copied into 35 classes (high).** In `EtAlii.Adp.Backend.Tests/Integration Tests/`:
   - each class writes its own `WebApplicationFactory` setup;
   - the user constants are redeclared in 29 files;
   - private helpers are re-defined per file: `LoginAsync` 23 times, `AddProjectAsync` 23, `CreateChannel` 24, `CreateMessageTimeout` 19, `BaselineAsync` 9;
   - the helpers come to about 1,550 lines and the setup to about 700. `RdfFlow` and `OwlFlow` differ in 202 of 808 lines.
   - **Advice:** a `HostFixture`, a `FlowSession` with those helpers, and one `FlowConstants`.
2. **25 fixed stream-startup sleeps (high, flakiness).**
   - `StreamStartupGrace` (500 ms, or 250 ms in two files) is awaited 25 times, 6 of them in `DiagramElementActionFlow.Tests.cs`.
   - `HierarchyWatchProbe.cs:17-27` records that this exact sleep made `UndoRedoFlowTests` fail on GitHub runners, but it fixed only hierarchy watches. Context and diagram watches still sleep.
   - **Advice:** generalize the probe into `StreamProbe.WaitUntilLiveAsync`, or have the server send a subscribed or baseline message, and delete the constant.
3. **The parity-transcript harness is copied into 6 modules (high).**
   - `*Transcript.cs` is 512 to 587 lines in ghg, dependency-graph, mindmap, timeline and abm; about 270 of 400 code lines match after renaming.
   - `TranscriptText.cs` exists six times, about 1,800 lines for one canonical-JSON writer.
   - Six `*Transcript.Tests.cs` files are identical after renaming.
   - **Advice:** one `TranscriptHarness` with a module adapter, and an abstract `TranscriptTests<TAdapter>`.
4. **Contract tests are copied with the stores (medium-high).**
   - 9 copies of `*DocumentStore.LostEdit.Tests.cs` (736 lines) and 10 of `*DocumentReloader.Tests.cs` (1,024 lines).
   - `TimelineFlow.Tests.cs:46-50` notes that six of nine stores shared one faulty shape: the tests were copied, and so was the defect.
   - **Advice:** abstract `DocumentStoreContract<…>` and `DocumentReloaderContract<…>` classes. They follow naturally from 1.3.
5. **No clock seam (medium-high).**
   - `TimeProvider` appears nowhere in `src/`.
   - Debounce and idle tests wait in real time: `SettleDelay` 150 ms in 7 helm and ansible files, 1,500 ms sleeps in two hierarchy tests, `Thread.Sleep` in several others.
   - 84 `Task.Delay`/`Thread.Sleep` calls in total, and 13 separate polling helpers (`Eventually`, `WaitUntil`, `UntilAsync`), one per file.
   - **Advice:** inject `TimeProvider` and use `FakeTimeProvider`, plus one shared `Eventually`.
6. **The root cause: shared helpers are hard to reach (high, structural).**
   - `src/TestSupport` (compiled into every test project) holds only `TestFolder` and `LogCapture`.
   - `EtAlii.Adp.TestSupport` (with `TestHistory`, which builds the real command pipeline) is referenced by only 5 core test projects. No module test project can reach it.
   - That is why the 8 hand-written `*TestDispatcher.cs`, the 273 hand-built temp folders and the 63 copies of the repository-root locator exist.
   - **Advice:** keep `LogCapture` compiled in, since its module initializer needs that. Add a referenced testing project for everything else, with `TestHistory.For(s => s.AddTimeline())`, `TestFolder.Create(prefix)`, `RepositoryPaths`, `Eventually`, the host harness and the contracts. Attach it to every module test project through `Directory.Build.targets`.
7. **Smaller test findings.**
   - About 5,300 lines of module flows sit in the core `Backend.Tests`.
   - Two hand-kept per-module type catalogues sit in one project (`ElementTypeCatalog.cs`, `DrawnConnections.Tests.cs:103-172`).
   - `ShippedExamples.Tests.cs:53` hard-codes five extensions, so the `.ghg`, `.ttl` and `.rq` examples are never swept. I did not confirm whether that is intended.
   - `GateScript.Tests.cs` still exercises `gate.sh`/`land.sh`, the local-merge process that CLAUDE.md now says no longer applies, from inside the product test suite.

Reclaimable test code is roughly 6,000 to 7,000 lines. Removing the fixed sleeps matters more than the line count.

---

## 9. Comments that record history

Production code has 82,700 code lines and 29,800 comment lines (36%). About 1,500 comment lines cite a task number, a ruling, a requirement number or a date. Many doc comments read as provenance rather than description. For example, `FdgContextSourceResolver.cs:15` opens with "Brought forward from task 13 to land with task 11 (the user's chat ruling of 2026-09-25)".

That provenance is valuable, and it is the repository's deliberate style. It does have two costs:
- it makes each copy in section 1 look different when the code is the same;
- it goes stale as code moves (5.4 lists four stale examples).

**Advice:** keep *why* in code comments and move *when, by which task* to commit messages and specifications. Apply this as files are touched by the refactors above, not as a sweep.

---

## 10. Possible defects found along the way

Each comes from reading the code. None was confirmed with a failing test; per this repository's rules each needs one first.

| # | Where | What |
|---|---|---|
| D1 | `EtAlii.Adp.Documents/LineSplice.cs:233-251` | `Quote` does not quote leading `[ { & * ! \| > % @` or the bare words `true/false/null/yes/no/~` and numerics. A name like `[draft] plan` written through it (for example by `FdgWriter.SetName`) may produce invalid or retyped YAML. Sankey and supply-chain patched this locally with their own quoter. |
| D2 | `agent-behavior-modelling/.../AbmDefinition.cs:29` | Shortcuts are sent with key `"Alt+Up"` and no modifier flags, a shape `ContextShortcutDefinition.Matches` probably never matches. Mindmap drops modifiers too, while timeline, dependency-graph and ghg pass them. |
| D3 | `causal-loop-diagram/.../CausalLoopWriter.cs:486` (also link labels `:515`, loop names `:522`) | Labels are interpolated inside quotes without escaping, and the property provider allows a `"` in labels (`CausalLoopContextPropertyProvider.cs:240-244`). A label containing a quote would be written as a line that the parser splits apart. |
| D4 | 6 modules' command handlers | `DocumentSaveResult.Warning` is dropped, against its documented contract (1.5). |
| D5 | `EtAlii.Adp.Context/ContextService.cs:141-178` | History is retained before the `try`, so a failed or cancelled discovery leaks it (5.2). |
| D6 | `EtAlii.Adp.Diagram/ProjectTextFile.cs:45-50` and six siblings | Containment is case-insensitive on Linux, and `TryResolve` does not refuse symbolic links that escape the root (4.5). |
| D7 | `EtAlii.Adp.Specification.Cel/Library/CelCore.cs:50-51` | A `matches()` regex timeout raises `RegexMatchTimeoutException`, which `CelProgram.Evaluate` does not catch (it catches only `CelException`). |
| D8 | `EtAlii.Adp.Specification.Cel/Evaluation/CelNode.cs:191-200` | Integer `+`, `-` and `*` are unchecked, while CEL makes overflow an error. |
| D9 | `JsonFamily.WireValue:441` vs `YamlFamily.WireValue:560` | The two families disagree on skipping computed or empty values on insert. |
| D10 | `EtAlii.Adp.Hierarchy/HierarchyModel.cs` | Events are raised while holding the lock that their subscribers' callers also take: a deadlock-prone shape (5.1). |

---

## 11. A suggested roadmap

Each step is independently landable, and most are mechanical.

1. **Quick wins and the possible defects.** Write failing tests for D1 to D8, then fix them. Remove the dead project references, decide the fate of Sessions, fold Backend in, delete the toolbox and rule-set forwarders, and correct the stale comments.
2. **The module middle layer (section 1)**, piloted on sankey, supply-chain, fdg and ghg: reloader, store base, session-factory delegate, session base, resolver base, handler base with `CommandResult.FromSave`. Roll out per module. The contract tests from 8.4 come with it.
3. **Shared utilities (section 3):** `LineDocument` for the three copies, `LineIndex`, `Rect` and `Intersects`, the layout library, `YamlAccess`, `DslNumber`, `LineLexer` and quoting, `WatchedFolderStore`, and `DislDiagramDefinition`.
4. **Core graph surgery (4.1 to 4.3):** a thin Diagram project plus a Workspace host project, generic tool families, one `ToolRouter`, `ProjectRoot`/`ToolOrigin`, and `AdpRegistration`.
5. **Core hotspots (section 5):** `HierarchyModel` decomposition, connection lifetime, the injectable file writer, and stream pumps.
6. **Specification projects (section 6):** shared loader infrastructure and the CEL cache, then the family write template, then typed DISL nodes, then parser replacement and module migration to FBL.
7. **Test infrastructure (section 8):** the shared testing project, `FlowSession` and `StreamProbe` (removing the 25 sleeps), `TimeProvider`, and the transcript harness. The sleeps could move earlier, given past CI flakiness.
8. **Stub consolidation (2.1)**, once the steering documents allow it.

Steps 2 to 4 change structure that `docs/architecture.md`, `docs/solution-structure.md` and the three `creating-a-*-module.md` guides describe. Under CLAUDE.md, each such change updates those pages in the same pull request. Steps 2 and 4 are large enough to deserve a spec-workflow specification each.

---

## Method

- **Measurements.** I wrote three scripts: a line count per project; a normalized 10-line-window clone scan over production code, with module prefixes, string literals and numbers normalized; and a brace-matching method-length count. The raw clone pairs are in `/tmp` of the analysis container and are not kept.
- **Reading.** Five parallel reviews read the code itself: the core projects, the specification projects, the diagram-module role classes side by side, the internals of the largest modules plus the designer and editors, and the test code. Their findings were merged here.
- **Spot checks.** I checked these claims against the source myself: the resolver diff, the empty Sessions project, the unused Backend reference, the case-insensitive containment, the history-retain leak, the Ansible/Helm watched-folder diff, `LineSplice.Quote`, the causal-loop label interpolation and the dropped save warning.
- **Not covered.** The TypeScript client, the `.proto` contracts and the generated code are out of scope. Line counts are approximate (±5%). Savings estimates are rough and assume the proposed base types fit as sketched.
