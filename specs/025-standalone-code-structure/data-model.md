# Data Model: the shared types this feature introduces

This feature stores no data. Its "model" is the set of types that take the place of the copies: what each is for, where it lives, what it replaces and what a module still supplies. Names are the report's working names (spec, *How to read this specification*); a task may choose a better one. **Homes are proposals for the maintainer's judgement** (research R9). Paths are under `etalii.adp.ide.standalone/src/backend/` unless they start with `src/`.

The rule for every type here: it arrives with its first consumer and its tests (FR-008), it takes what differs between modules as a parameter with a name, and it is never taught about a particular module.

## M0: tests and measurements

| Type | What it is for | Home | Replaces | Requirement |
|---|---|---|---|---|
| `measure.sh`, `lines.py`, `clones.py`, `methods.py`, `graph.py` | The report's measurements, repeatable on any commit | `.github/tools/analysis/` | The scripts lost in the analysis container | FR-009 |
| `TestFolder.Create(prefix)` | A temporary folder that deletes itself | `EtAlii.Adp.TestSupport/` | 273 hand-built temporary folders | FR-015, FR-094 |
| `RepositoryPaths` | The repository root, `src/`, the examples and the fixtures | `EtAlii.Adp.TestSupport/` | 63 copies of the root locator | FR-015, FR-094 |
| `Eventually` | Wait until a condition holds, on a clock | `EtAlii.Adp.TestSupport/` | 13 polling helpers | FR-015 |
| `TestHistory.For(configure)` | The real command pipeline with a module's registrations | `EtAlii.Adp.TestSupport/` | 8 hand-written `*TestDispatcher` | FR-015, FR-094 |
| `HostFixture` | One in-process host per test class | `EtAlii.Adp.TestSupport.Host/` | The `WebApplicationFactory` set-up in 35 classes | FR-016 |
| `FlowSession` | Sign in, add a project, open a channel, wait for a message, take a baseline | `EtAlii.Adp.TestSupport.Host/` | `LoginAsync` × 23, `AddProjectAsync` × 23, `CreateChannel` × 24, `CreateMessageTimeout` × 19, `BaselineAsync` × 9 | FR-016 |
| `FlowConstants` | The test user and its secrets | `EtAlii.Adp.TestSupport.Host/` | The constants redeclared in 29 files | FR-016 |
| `StreamProbe` | Proof that a stream is live | `EtAlii.Adp.TestSupport.Host/` | `HierarchyWatchProbe` and 25 fixed sleeps | FR-017 |
| `PathContainment` | Is this path inside this root: compared as the operating system compares, refusing a link that leaves the root | `EtAlii.Adp/` | Seven implementations (report 4.5) | FR-024 |

## M1 and M2: the module middle layer

| Type | What it is for | Home (M1) | What a module supplies | Replaces | Requirement |
|---|---|---|---|---|---|
| `IDiagramDocumentStore` | Reload, body deleted, forget | `EtAlii.Adp.Documents/` | Nothing; a marker interface where registration needs a distinct type | `BodyDeleted`/`Forget` re-declared per module | FR-028 |
| `DiagramDocumentReloader<TStore>` | Forwards a file event to a store | `EtAlii.Adp.Documents/` | Nothing | 16 reloader classes | FR-028 |
| `DocumentEntry<TBody, TModel>` | A loaded document, its model, and one failure field | `EtAlii.Adp.Documents/` | The two type arguments | 13 entry records with `Error`, `Unreadable` or a `bool` | FR-029 |
| `DocumentChangedEventArgs` | The path that changed | `EtAlii.Adp.Documents/` | Nothing | 12 event-args types | FR-029 |
| `LifecycleDocumentStore<TEntry, TBody>` | Load, cache, reload, ignore own save, keep the last good document, save | `EtAlii.Adp.Documents/` | `Read`, `TextOf`, `Rebuild` | The body of every document store | FR-029 |
| `AddDiagramSession(origin, factory)` | Registers a session factory from a delegate | `EtAlii.Adp.Diagram/` | The delegate | 17 of 21 session-factory classes | FR-030 |
| `AddEmptyDocument(origin, text)` | Registers the empty document of a type | `EtAlii.Adp.Diagram/` | The text | 17 of 21 document-factory classes | FR-030 |
| `DocumentDiagramSession<TStore, TModel>` | A session over one document: render, deliver deltas through `DiagramDocumentChangeHandler`, refuse placements | `EtAlii.Adp.Diagram/` | `Model()`, `Render(model, viewport)`; optionally the placement command and refusal texts | The shared 80% of 22 sessions; 13 hand-rolled diffs | FR-031 |
| `DiagramElementSourceResolver<TModel>` | Resolves a selected element to a context target | `EtAlii.Adp.Diagram/` | `Origin`, `Load(bodyPath)`, `Describe(model, id)`, the mapping of one element, the change subscription, optional nouns | 19 resolvers of 170 to 260 lines | FR-032 |
| `Disposable.From(Action)` | A disposable from a delegate | `EtAlii.Adp/` | Nothing | 12 `*Unsubscriber` types | FR-032 |
| `CommandResult.FromSave(saveResult, inverse)` | A command result that carries the save's failure or warning | `EtAlii.Adp.History/` | Nothing | `Failed ? Failure : Success`, which drops the warning in six modules | FR-033, FR-022 |
| `DocumentEditHandler<TCommand, TEntry>` | Null and cancel checks, load, usable check, apply, save, result | `EtAlii.Adp.History/` | `Apply(entry, command)` returning an inverse or a refusal | The frame of 178 handler classes | FR-033 |
| `DocumentEditRun` and `EditOutcome` | Load, parse a copy, apply, save, return the restore command | `EtAlii.Adp.History/` | The edit | 9 `XEdits.Run` and 6 `XEdit` structs | FR-033 |
| `RestoreLinesCommandHandler<TStore>` | Restores the lines an edit replaced | `EtAlii.Adp.History/` | Nothing | The line-restore handlers of timeline and dependency-graph, and the hand-written `Restore*` handlers that duplicate `RestoreDocumentCommandHandler<TStore>` | FR-033 |
| `DiagramActionProvider` and `DiagramPropertyProvider` (frame) | Dispatch, scope, discovery from a definition, the unreadable-document guard, the deletion confirmation | `EtAlii.Adp.Diagram/` | The actions and rows | `DispatchAsync` × 13 and the guard and confirmation blocks | FR-034 |
| `DiagramAction` (record) | One action: id, applies to, description, command | `EtAlii.Adp.Diagram/` | One record per action | Two `switch (actionId)` blocks and a third mapping in wardley-map | FR-034 |
| `DocumentStoreContract<…>`, `DocumentReloaderContract<…>` | What every store and reloader must do, as abstract test classes | `EtAlii.Adp.TestSupport/` | A fixture document and a factory for its store | 9 lost-edit test files, 10 reloader test files | FR-035 |
| `EditHandlerContract<…>` | A save warning reaches the command result; a missing element is refused | `EtAlii.Adp.TestSupport/` | A store that warns | Nothing (it is the guard for D4) | FR-022 |
| `WatchedFolderStore<TSnapshot>` | Claim, release, settle after changes, raise `Changed` | `EtAlii.Adp.Documents/` (M4: `EtAlii.Adp.Files/`) | How to read a snapshot | `AnsibleWatchedFolder`, `HelmWatchedFolder`, `SolutionWatcher` with `DependencyGraphStore` | FR-037 |
| `TolerantYaml` | Reads YAML and reports instead of throwing | `EtAlii.Adp.Documents/` | Nothing | `AnsibleYaml`, `HelmYaml` | FR-037 |
| `RdfFamilySession<TProjection>` | The session of rdf, owl, shacl and skos | `src/diagrams/rdf/backend/EtAlii.Adp.Diagram.Rdf/` | The projection | Four sessions and four factories | FR-038 |

In M4 the session base, the resolver base, the handler base and the provider frame move to `EtAlii.Adp.Diagram.Modules/` (research R9).

### What a module looks like afterwards (report 1.7)

`Diagram.cs`; `ServiceCollection.AddX.cs`; `XDocument` (entry and store subclass); `XSession`; `XSourceResolver`; `XElementMapper`; `XActions`; `XProperties`; the parser and writer, or an FBL binding; the commands. A type beyond these is named, with its reason, in the module's adoption task and in the M2 review (FR-036).

## M3: shared utilities

| Type | What it is for | Home | Replaces | Requirement |
|---|---|---|---|---|
| `LineDocument` (existing; gains `ReplaceLine`, `InsertLine` if needed) | A text as lines, with its line ending | `EtAlii.Adp.Documents/` | `WardleyDocument`, `C4Document`, `CausalLoopDocument` | FR-042 |
| `LineIndex` | Offset to line, by binary search | `EtAlii.Adp.Documents/` | `LineOf` in two tokenizers and two writers, one of them a linear scan | FR-043 |
| `TerminalScanner`, `RdfEscapes`, `NumericLiteral` | The terminals Turtle and SPARQL share | `EtAlii.Adp.Documents/` | The terminal readers of `RdfTokenizer` and `SparqlTokenizer` | FR-044 |
| `Rect` and `DiagramViewport.Intersects(Rect)` | A rectangle, and whether a viewport shows it | `EtAlii.Adp.Layout/` | 9 box types, about 17 hand-written tests | FR-045 |
| `Layering.LongestPath(nodes, edges, CyclePolicy)` | Layers of a directed graph | `EtAlii.Adp.Layout/` | Six layerings with three cycle rules | FR-045 |
| `CyclePolicy` | What a cycle does: back edge is zero, Kahn's remainder, relaxation | `EtAlii.Adp.Layout/` | The unnamed difference between those six | FR-045 |
| `OrderByBarycentre` | Order within a layer (only if a consumer adopts it unchanged; research R16) | `EtAlii.Adp.Layout/` | Per-module ordering | FR-045 |
| `GridPacker` | Places items on a grid | `EtAlii.Adp.Layout/` | The hand-placed grids of rdf, shacl and sparql; joins core `RowPacking` | FR-045 |
| `OverlapResolver` | Pushes overlapping boxes apart | `EtAlii.Adp.Layout/` | `C4Layout.Spread`, `SelfOrganizingLayout.Separate` | FR-045 |
| `YamlAccess` | `Scalar`, `Sequence`, `LineOf` on a YAML node | `EtAlii.Adp.Documents/`, beside `YamlNodeRange` | `Scalar` in 7 parsers and 3 local copies; `DatabricksYaml` | FR-046 |
| `DslNumber.Format` | A number as a line DSL writes it | `EtAlii.Adp.Documents/` | `Number(double)` × 10 | FR-047 |
| `LineLexer`, `QuotedString.Write` | Tokens of a line, with a comment policy and an escape policy | `EtAlii.Adp.Documents/` | `WardleyParser.WithoutComment`, `C4Line.StripComment`, the causal-loop `Tokenize`; the private `Text()` of two writers | FR-048 |
| `ParseOutcome<TModel>` | A model, its problems, and whether it is usable | `EtAlii.Adp.Documents/` | Thrown exceptions, silent skips, a string or `bool` on the entry, findings lists | FR-049 |
| `WatchedFile`, `WatchedFolder` | A file or folder watched, with an asynchronous read-retry | `EtAlii.Adp.Documents/` (M4: `EtAlii.Adp.Files/`) | `ReadWithRetry` with `Thread.Sleep` × 3; the hand-rolled watcher of `TrackedProblemRoot` | FR-050 |
| `ProjectFileEvents` | One reference-counted source of normalized file events per project root | `EtAlii.Adp.Documents/` (M4: `EtAlii.Adp.Files/`) | Three or more recursive watchers per root | FR-050 |
| `AdpFileWriter.IsTransient(name)` | Is this a scratch or backup file | Beside `TempPrefix` | Three detections, one missing the `~RF` case | FR-050 |
| `Debouncer<TKey>` | Coalesces events per key on a clock | `EtAlii.Adp/` | Three coalescing timers | FR-051 |
| `RetainedRegistry<TKey, TValue>` | Reference-counted values with idle eviction on a clock | `EtAlii.Adp/` | Three idle-eviction stores | FR-051 |
| `DislDiagramDefinition`, `DislToolboxProvider` | A bundled DISL definition as a module's toolbox, menus and rows | `EtAlii.Adp.Diagram/` (M4: `EtAlii.Adp.Diagram.Modules/`) | Seven `*Definition.cs` adapters, the forwarding toolbox providers and rule sets, three finding-to-severity mappings | FR-052 |
| `TextEditorSession` | The session of a text editor | `EtAlii.Adp.Editor/` | `MarkdownEditorSession`, `PlainEditorSession` | FR-053 |

## M4: the core project graph

| Type or project | What it is for | Home | Replaces | Requirement |
|---|---|---|---|---|
| `EtAlii.Adp.Diagram` (thin) | The module contracts, `DiagramDefinition`, `DiagramOrigin`, the registration layout | project | The same project with eight core references and every streaming service | FR-054 |
| `EtAlii.Adp.Workspace` | `DiagramService*`, `WorkspaceService`, `EditorService`, `DesignerService`, `WorkspaceConnections`, the table wire, the reload bridge | new project | Those types in the diagram project | FR-054 |
| `EtAlii.Adp.Diagram.Modules` | The M1 bases a module derives from | new project | Their M1 home | FR-054, R9 |
| `EtAlii.Adp.Files` | The file writer, the watchers, the project file events, the Restart Manager and NTFS calls | new project | That part of the documents project | FR-056 |
| `IToolDefinition` | What a diagram, designer and editor definition have in common | `EtAlii.Adp/` | Nothing | FR-057 |
| `ToolDefinitionDiscovery`, `ToolDefinitionCatalog<T>`, `ToolSessionFactories<TKey, TFactory>`, `AddToolDefinitions<T>` | Discovery with one dedupe-and-log, a catalog, a factory registry and a registration, for any tool kind | `EtAlii.Adp/` | Three of each | FR-057 |
| `ToolRouter.Route(path, root)` and `ToolRouting` | Which tool serves a path: `DiagramRouted`, `DesignerRouted`, `EditorRouted`, `Unreadable`, `None` | `EtAlii.Adp.Hierarchy/`, the lowest project that sees all three catalogs | Three routers and four codings of the precedence | FR-058 |
| `ProjectRoot`, `ProjectPath` | A root and a path within it, normalized once | `EtAlii.Adp/` | `string rootPath` as a key in five stores; wraps `PathContainment` | FR-059 |
| `ToolOrigin(vendor, type, subtype)` | The identity of a tool type, for all three kinds | `EtAlii.Adp/` | `DiagramOrigin`, a `"vendor/type"` string, a string id | FR-060 |
| `AdpRegistration` | The MIME line, the headers and the layout of an `.adp` file, parsed and serialized, cached by modification time | `EtAlii.Adp.Diagram/` | Parsing in five files of the hierarchy project | FR-061 |
| `ProjectCatalogCache` | `projects.json` per user, invalidated on write, written under a lock | `EtAlii.Adp.Projects/` | A read and parse at 8 call sites | FR-062 |
| `EntryNameRules` (the one that stays) | The rules for an entry's name | `EtAlii.Adp.Hierarchy/` | The second validator in `RenameEntryCommandHandler` | FR-063 |
| `HistoryActionsBroadcaster`, `ProblemBroadcaster` as hosted services | Start with the host, stop with it | Their projects | Resolution in `Program.cs` "only to construct them" | FR-064 |

## M5: core hotspots

| Type | What it is for | Home | Replaces | Requirement |
|---|---|---|---|---|
| `WatcherEventNormalizer` | Turns watcher events into changes: rename echoes, scratch files | `EtAlii.Adp.Hierarchy/` | Part of `HierarchyModel` | FR-066 |
| `HierarchyIndex` | Ids, paths and children by parent | `EtAlii.Adp.Hierarchy/` | Three indexes and the linear scans | FR-066 |
| `DiagramStateDecorator` | Colours entries by their tool state | `EtAlii.Adp.Hierarchy/` | `RefreshDiagramStates` | FR-066 |
| `ConnectionSession`, `ProjectSession` | What a connection and a project hold, acquired and released as one scope | `EtAlii.Adp.Sessions/` (DP-5) | Retain and release spread over five types | FR-067, FR-023 |
| `IFileWriter` | Publishes a file, with asynchronous per-path locks that are released | `EtAlii.Adp.Files/` | The static `AdpFileWriter` with its ever-growing lock dictionary | FR-068 |
| `WorkspaceConnection.OpenStream(streamId, session, map)` | Owns the pump, the ended message and the clean-up of a stream | `EtAlii.Adp.Workspace/` | The pump in `WorkspaceService` and in `DesignerService`; four ownership checks | FR-069 |
| `DiagramAddOptions`, `DesignerAddOptions` (strategies) | How a tool of one family is added | `EtAlii.Adp.Workspace/` | Four workflows in `CommitAsync` | FR-071 |
| `ProblemCache`, `ProblemStalenessPolicy` | What is known, and when it is out of date | `EtAlii.Adp.Problems/` | `ProblemStore` | FR-072 |
| `ContextWire` | Context messages to and from the wire | `EtAlii.Adp.Context/` | About 120 lines of mapping in `ContextService.Actions.cs` | FR-073 |

## M6: the specification projects

| Type | What it is for | Home | Replaces | Requirement |
|---|---|---|---|---|
| `SpecificationJson`: `LoadDiagnostic`, `JsonPointer`, scalar helpers, `DuplicateKeys`, `VersionCheck`, JSON-to-CEL conversion | What two loaders share | `EtAlii.Adp.Specification.Json/` | `DislDiagnostic` and `LoadProblem`, and five helpers written twice | FR-074 |
| `CelProgramCache` | Compiled programs, thread-safe | `EtAlii.Adp.Specification.Cel/` | Five mechanisms | FR-075 |
| `FamilyReader.Write` with `RemoveSlot`, `ReplaceSlot`, `InsertSlot`; `InsertValues`; `KeyOrder` | One write loop | `EtAlii.Adp.Specification.Fbl/` | `Write` in four families | FR-076 |
| `BindingReader`, `BindingChecker` | Read a binding; check it | `EtAlii.Adp.Specification.Fbl/` | `FblDocumentLoader` (678 lines, four classes) | FR-077 |
| `Slot` as a closed hierarchy; enumerations for `Empty`, `Place`, `Quote`, `Style`, `IdStrategy` | Exactly one kind of slot, known to the compiler | `EtAlii.Adp.Specification.Fbl/` | Ten nullable fields and 14 string comparisons | FR-078 |
| Typed DISL nodes: operation, action (a union), toolbox, menu, form, constraint, hook | The definition, typed at load, each expression compiled | `EtAlii.Adp.Specification.Disl/` | `JsonElement Root` and about 430 access sites | FR-079 |
| `JsonBodyParser` on `Utf8JsonReader` | A JSON body with byte offsets | `EtAlii.Adp.Specification.Fbl/` | 210 lines of byte-level parser | FR-080 |
| `XxxParser` beside each `XxxFamily` | Parsing apart from binding | `EtAlii.Adp.Specification.Fbl/` | Families that do both | FR-080, FR-081 |
| `DislReading` (bridge) | A DISL model from a module's own reading | `EtAlii.Adp.Specification.Disl/` | `FblElement`s built through a 12-argument constructor | FR-083 |

## M7: module internals

| Type | Home | Replaces | Requirement |
|---|---|---|---|
| `OwlProjectionBuilder`, `SkosProjectionBuilder`, `RdfProjectionBuilder`, `BudgetedGraphBuilder<TNode, TEdge>` | `src/diagrams/rdf/backend/EtAlii.Adp.Diagram.Rdf/` | Three `Project` methods of 420, 241 and 173 lines | FR-086 |
| `KnowledgeValueType` (registry), cell, column, view and filter edits, the gesture table | `src/designers/knowledge/backend/` | A 45-arm switch, strings in 35 `case` arms, a static class of 1,265 lines | FR-087 |
| `PendingEditQueue`, `KnowledgeViewState` | `src/designers/knowledge/backend/` | 17 mutable fields under one lock | FR-088 |
| The Wardley keyword table; statement builders on `WardleyWriter` | `src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap/` | 15 ordered `TryKeyword` tests; DSL text built in six handlers | FR-089 |
| `SparqlScopeAnalyzer`, `SparqlTokenCursor` | `src/diagrams/sparql/backend/EtAlii.Adp.Diagram.Sparql/` | Part of a parser of 1,432 lines | FR-090 |
| `C4BoundaryPacker` | `src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4/` | Part of a static class of 694 lines | FR-091 |

## M8: tests and stubs

| Type | Home | Replaces | Requirement |
|---|---|---|---|
| `TranscriptHarness`, `TranscriptText`, `TranscriptTests<TAdapter>` | `EtAlii.Adp.TestSupport.Host/` | Six harnesses, six canonical-JSON writers, six identical test files | FR-093 |
| `EtAlii.Adp.Diagram.Catalog` with one `Definitions` array | `src/diagrams/catalog/backend/` (DP-1) | 48 stub projects, 192 files | FR-097 |

## Relationships that constrain the order

- `DiagramDocumentReloader<TStore>` needs `IDiagramDocumentStore`; `LifecycleDocumentStore` implements it; `DocumentDiagramSession` and `DiagramElementSourceResolver` take a store; `DocumentEditHandler` takes an entry. Hence bands A, B, C.
- The contract tests need the light testing project to be reachable from module test projects. Hence M0 before M1.
- `ProjectPath` wraps `PathContainment`; `ToolRouter` returns `ToolOrigin`; `AdpRegistration` is what the router reads, and it lives in the diagram project, which the hierarchy project can reference only after the diagram project is thinned. Hence the order inside M4.
- `ConnectionSession` uses `RetainedRegistry` (M3) and lives where DP-5 says. `WorkspaceConnection.OpenStream` needs `EtAlii.Adp.Workspace` (M4).
- `WatchedFile` (M3) is what `KnowledgeSession` is split onto (M7) and what `TextEditorSession` reads through (M3).
- `CelProgramCache` comes before typed DISL nodes, which hold compiled programs.
