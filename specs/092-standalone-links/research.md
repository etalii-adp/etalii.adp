# Research: Links Between Tools in the Standalone Host

**Feature**: [standalone-links.spec.md](standalone-links.spec.md) | **Date**: 2026-11-25

## R0. What breaks today, measured

**Done**: in a scratch worktree of standalone `develop` at `dcd22bdf`, the timeline, dependency graph and mind map definitions were re-bundled from etalii.adp `develop` (`2f150406`) with `bash src/diagrams/tools/bundle-disl.sh <module> <etalii.adp>`, the solution built with the .NET 10 SDK, and each module's tests run.

**Found**: the build passes, and every test that loads a definition fails at load with the same two errors per definition:

- `/metamodel/types/<LinkedType>/attributes/<link>/type: 'link' is not a primitive, an enum, a data type or a type of this specification (DISL §4.3)` (timeline `LinkedPeriod` and `LinkedMoment`, dependency graph `LinkedNode`, mind map `LinkedNode.linkedElement`);
- `/behavior/operations/<addLinked…>/actions/0/lookup/create: '<LinkedType>' is not a variable here (context operation)`: the action reader does not know `lookup`, so it reads `create` as an expression.

Nothing else in the definitions stops the loader, so its first gap is DISL 0.12's attribute type and action (R2). The client side is the second gap (R5): the canvas library has no CEL and takes every expression a notation uses from the module's `celPaths` and `celConditions`, so `has(self.link)` and `has(self.linked) ? '↪' : '↪⚠'` have no entry. The knowledge designer was not re-bundled in R0; its DESL 0.1 to 0.5 step is larger and is measured in phase 6's first task.

## R1. Where the link lives in the standalone solution

**Decision**: the link's grammar, escaping and resolution as pure functions in `EtAlii.Adp.Specification.Fbl` (a folder `Links/`), because FBL 17 owns them and that project already owns ids, references and routing. The workspace's index, its watching and backlinks in a new core project `EtAlii.Adp.Links`, which reads the project's files through `EtAlii.Adp.Files` and its tree through `EtAlii.Adp.Hierarchy`, and which `EtAlii.Adp.Diagram.Modules` and `EtAlii.Adp.Designer` consume through an interface (`ILinkIndex`).

**Rationale**: FBL 17.1 to 17.3 are testable without a workspace, against spec 089's fixture `specifications/fbl/fixtures/links-workspace/`, which the FBL conformance tests already copy (`EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/`). The index is per project root and per connection-independent, so it belongs beside `EtAlii.Adp.Hierarchy`, not inside one module.

**Alternatives**: the index inside `EtAlii.Adp.Hierarchy` (it already watches the tree): rejected, because that project decides which tool opens a file and would then also read every file's body. One index per module: rejected, since a lookup searches every tool type at once.

**Consequence**: the solution gains a project and its test project, so `docs/solution-structure.md`'s counts and `ArchitecturePages.Tests` change in the same pull request.

## R2. DISL 0.12 and DESL 0.5 in the loaders

**Decision**: `EtAlii.Adp.Specification.Disl` reads, for every tool type: the attribute type `link` (a string in the model, DISL 4.12), `linkable` with `nameProperty`, `linked` with its `attribute`, `persistence.documentId`, the action `lookup` (`create`, `as: child | at`, `origins`, and its `as` name), the widget `lookup`, and `nanoid` with `alphabet` and `length` (DISL 11.5). The designer loader reads DESL 0.5's `link` value type, `documentId` and the relation picker's declarations. A definition that uses `lookup` where no index is given still loads; the action is then refused with the sentence that no workspace is open.

**Rationale**: R0 shows these are the only loader errors; reading them generically is principle I of the standalone repository.

## R3. The FBL library's part

**Decision**: `EtAlii.Adp.Specification.Fbl` reads a binding's `document: { id: … }` slot for the families the four tool types use (`yaml` and `json` top-level key, `xml` root attribute, and a persistence plugin's own id operations, FBL 17.2), exposes the id on the reading, offers `{newid:document}` to templates, and plans the id's insertion as a splice like any other attribute. FBL 0.23's documents are read; a construct of 0.6 to 0.23 the four served bindings do not use stays reported by `UnreadConstructs` as today.

**Rationale**: the served bindings are embedded in their modules (`BundledBinding`), so the bytes VS Code copies are the bytes this host reads: the binding can only change once this library reads it.

## R4. The served bindings

**Decision**: each served binding takes spec 089's change to the example binding and keeps what it already says where the module reads differently (its `doc` lists those differences): `timeline.fbl` and `dependency-graph.fbl` gain `document.id` on the top-level `id` and rules for an `elements` entry with a `link` key (`LinkedPeriod`, `LinkedMoment`, `LinkedNode`) before the rules for an ordinary entry; `mindmap.fbl` names the plugin at `^0.2.0`. The FBL version each states rises to the version whose constructs it then uses.

**Check**: the desktop host's copies of `timeline.fbl` and `dependency-graph.fbl` are the reference: the served files after this step and those copies **MUST** read the same documents the same way, which the desktop's conformance recordings check (R9).

## R5. The client

**Decision**: the canvas library treats a link generically, so no module adds an entry for it. The backend sends, on each element of a type with `linked`, the target's current name as its label attribute and two generic members of the payload, `link` (the text) and `linked` (present when it resolves, holding the `shows` attributes). The library maps `has(self.link)` and `has(self.linked)` to those members, as it maps `self.<attribute>` today, in `compileNotation.ts`; the module clients change only to the extent that they list `celPaths` that already name these expressions (none, after the change). The lookup is one shared component of the shell, opened by the existing interaction leg (`ContextService.SubmitInteraction`) with a new interaction kind `lookup`, searched through a new unary call. Navigation is a new member of the workspace stream's message (`reveal`: path and element id), because the backend decides it while running an operation, which the architecture page requires to ride the one stream.

**Alternatives**: a CEL evaluator in the client: rejected as larger than the feature and against how the canvas library is built.

## R6. Load-time validation with the first edit

**Decision**: when a document of a tool type with a document id opens, the module's session asks the index to validate it and keeps what it finds as pending changes (a missing document id, link parts that differ). They are shown at once (the linked element's label is the target's current name), and are written with the first command, in its undo step; undoing that command takes them back too. Whether `EtAlii.Adp.History` lets a command carry such a change as it stands, or needs a small generic addition, is the first thing phase 3 tests.

**Rationale**: FR-010, and the desktop and VS Code hosts behave so; a file opened and closed is never written.

## R7. The mind map plugin

**Decision**: the module's `MindmapFreeplanePlugin` takes version 0.2.0 and the two operations of `mindmap.md` section 3.8: it reads the central topic's `adp-id` and a node's `adp-link` (Freeplane `<attribute NAME="…" VALUE="…"/>` children), and writes them in place as the module already edits the XML, keeping every other byte. A linked node's `TEXT` is its cached name.

## R8. The knowledge designer

**Decision**: re-bundle `knowledge.des` 0.2.0 and `knowledge.fbl` from etalii.adp and read DESL 0.5 and DED 0.3 (R2). `KnowledgeRelations` and `KnowledgeTargetRename` move from a path and row ids to links resolved through `ILinkIndex`; the conversion of `knowledge.md` (*Relations and the steps that write two files*, the conversion of a file made before links) runs as R6's pending change, and `specifications/fbl/fixtures/links-workspace/knowledge/cities.yaml` to `cities.converted` is its byte test. The backlink column is computed from the index. The relation picker is a cell editor of the table library (`src/client/src/table/library`), with chips, search as typed and *Create*, the two-file step being the module's existing two-file command.

## R9. VS Code and desktop

**VS Code**: after the standalone pull request with the served bindings merges, `npm run sync-definitions` copies `timeline.fbl` and `dependency-graph.fbl` into `definitions/timeline/` and `definitions/dependency-graph/`. Its interpreter already reads links (its `docs/disl-support.md`); what is left is the record in that document (its row on knowledge relations as links still names the standalone binding as what waits) and the host test of FR-021, which runs on the Mac mini.

**Desktop**: `etalii.adp.ide.desktop` is not one of this cloud session's repositories; its pull request is made from its clone on the Mac mini (`/Volumes/Data/Git/etalii.adp.ide.desktop`), by a Remote Control session. It deletes the two copies, points its timeline and dependency graph at the bindings their definitions name, as its other tool types do, and runs its recordings.

## R10. Where the gates run

**Decision**: the four gates run in this cloud session (the .NET 10 SDK from the distribution's packages, with `src/global.json` changed locally and never committed) and on the pull request's CI, which is the one gate that counts (standalone's Linux CI). The host tests (SC-002, SC-006, SC-007, SC-008 and User Story 6) need a running host and a browser: they run on the Mac mini, where the standalone clone is.
