# Research: The Hierarchical Requirement Designer in the Standalone Host

Decisions the plan rests on. Paths prefixed `standalone:` are in `etalii.adp.ide.standalone`, read at `develop` `b35336639` on 2026-10-15, 203 commits after the `f45a4d50c` that spec 028 read. Spec 025 was then about half done (129 tasks ticked, 149 open, M3 merged up to T120), so many of these paths move before this feature is built. Where spec 025 names the new home, the decision names that home.

## When and against what

### R1. Plan now, against the host spec 025 leaves; read the host again before the first task

**Decision.** This plan is written against spec 025's end state where 025 names it: the tool router of T167, the add strategies of T201, the gRPC services in `EtAlii.Adp.Workspace` (T155), the session contracts in `EtAlii.Adp.Sessions` (T266) and the file watching in `EtAlii.Adp.Files` (M4). Every other path is the one read at `b35336639`. The first task of the feature reads the host again once spec 025 is done and the maintainer gives the word, and corrects every path in `tasks.md` that has moved, in a pull request here before any standalone pull request is opened.

**Rationale.** The spec asks for the plan to read the host at the point building starts. Writing the plan then would put weeks between the definition and its plan. The decisions below hold whichever project a type ends up in. Only the paths move.

**Alternatives considered.** Waiting with the plan until spec 025 is done: it leaves the definition's open questions unanswered for that long. Planning against `b35336639` alone: half the paths are already scheduled to move.

### R2. Eleven standalone pull requests, in the host's implementation order

**Decision.** The work lands as eleven pull requests, each cut from `develop` after the one before it is merged:

| # | Pull request | Stories | What it holds |
|---|---|---|---|
| 1 | FBL 0.7: the `bullets` family | US3 | The reader, drift checked before an edit, `KnownMinor = 7`, the harness's new edit forms, recursion into sub-folders, `bullets-read` and `bullets-edits` in the corpus |
| 2 | FBL 0.7: declared registration blocks | US3 | Blocks the binding declares, kept order and ordinal order, `history: false`, `createOnFirstPlacement`, `registration-blocks` in the corpus |
| 3 | Documents recognised by their envelope | US1 | The marker claim in the tool router, a designer document without a registration, adding an existing file, deleting a registration that keeps the body |
| 4 | The module's model and persistence | US3 | `src/designers/hierarchical-requirement/` backend: the vendored definition, the body, the read model, the `hierarchical-requirement-*` fixtures; `Designer.cs` waits for pull request 5, so the type is never offered without a page |
| 5 | The hierarchy surface | US1 | The session contract, the wire, the shared client library, the module's `Designer.cs`, session and client: the page that reads |
| 6 | Two writers | US2 | Reading an outside change again, the refusal, the choice between reloading and keeping, the end of undo |
| 7 | Shaping | US4 | Creating from the template, editing a title and a description, adding by control and key, dragging, deleting with confirmation |
| 8 | Assessments | US5 | The icon, the list, adding, changing, removing and resolving |
| 9 | References | US6 | The `#` lookup, the reference box, showing the target |
| 10 | Tags | US7 | The tag field and list in the Knowledge designer's looks |
| 11 | Narrowing and sorting | US8 | Category, state, the filter bar, sorting, stored filters |

**Rationale.** Standalone's `processes.md` orders work as model, persistence, wire, client UI, then the rest. Pull requests 1 to 4 are the model and persistence and close User Story 3. Pull request 5 is the wire and the page and closes User Story 1. Each later story is one pull request, so the P3 story can be cut without touching the others. The two FBL pull requests stay apart for the same reason spec 028 kept them apart: a reviewer can refuse the declared blocks without the family.

**Alternatives considered.** One pull request per layer across all stories: a story could then not ship alone. The surface before the module: a shared type without its first consumer, which standalone's rules and spec 025's FR-008 refuse.

## Recognising and opening

### R3. The envelope claims a `.md` through the FBL library's marker routing, ahead of every registration

**Decision.** The binding's `claims` (`extensions: [".md"]`, `shared: true`, a line-1 `marker`, `origins: ["etalii/hierarchical-requirement"]`) are evaluated by the routing that the FBL library already has (`standalone:src/backend/EtAlii.Adp.Specification.Fbl/Routing/Router.cs`, `MarkerEvaluator.cs`, FBL sections 12.1 and 12.3) and that nothing in the host calls yet. Spec 025's `ToolRouter` asks it first, for a file of an extension that a designer claims as shared, before the routers of the three tool kinds. The first line is read up to the first line break or 1,024 bytes and cached by the hierarchy model until the file changes. A registration of another tool whose body carries the envelope is routed as `Unreadable`, with the reason that its body is a Hierarchical Requirement Designer document.

**Rationale.** The edge case says the envelope decides. Agent Behavior Modelling is a diagram, and diagrams route first today, so the claim has to stand before the diagram router, not only before the editor. Marker routing is what FBL defines for this, and the library implements it already.

**Alternatives considered.** A content check in the designer router alone: Agent Behavior Modelling would still win a registered file. Reading the whole file at routing time: a folder of large Markdown files would be read on every tree refresh.

### R4. A designer document may have no registration

**Decision.** `DesignerRouted` carries a registration path that may be absent, and `IDesignerSessionFactory.Open` takes it as optional. The session creates the registration with the first setting the person changes, by the binding's `registration.createOnFirstPlacement: true` (FBL section 8.4): the origin line, and `body:` only when the base names differ, in the body's dominant line ending, written before the edit is planned and outside the undo history. Deleting a registration no longer deletes its body for a designer type whose binding creates the registration on first placement. Deleting the body still deletes its registration.

**Rationale.** FR-002 and FR-004. The FBL loader already reads `createOnFirstPlacement`; `DesignerAddOptions` ignores it. Keeping the cascade from body to registration leaves no registration naming a file that is gone.

**Alternatives considered.** Creating an empty registration on open: opening would write a file, which the definition forbids.

### R5. Adding a file that exists: accepted when it carries the envelope, refused when it does not

**Decision.** In the add strategy for a designer document (spec 025's `DesignerAddOptions`, T201), a name that exists is no longer refused outright. If the file carries the envelope of the chosen designer type, the host writes nothing and opens it. If it does not, the host refuses, saying that the file has no envelope on its first line and naming the line it would need. No consent flow writes the envelope.

**Rationale.** FR-003, and the spec's edge case, which leaves the choice to the plan. With routing by envelope (R3), an enveloped file is already a designer document. Refusing with the line to write keeps the file untouched and gives the person, or their agent, what to do.

**Alternatives considered.** Offering to write the envelope, with the person's consent: a second dialog, and a write the companion already lets an agent or a person do in one line. It can be added later if the refusal proves a nuisance.

### R6. Reading a later DED version and an unsupported surface kind

**Decision.** The envelope's DED version is checked where the Knowledge designer checks its own. If that check is local to the Knowledge module, it moves to `EtAlii.Adp.Designer` in pull request 4, with this module as its second consumer. A later version opens the page read-only with the reason. The supported surface kinds, `table` and `hierarchy`, are stated in `standalone:docs/tools.md`. A document whose kind the build does not have shows the existing unsupported placeholder (`standalone:src/client/src/shell/panels/PanelPlaceholder.tsx`).

**Rationale.** FR-030 and FR-031. Modules are written from their definitions, so a kind the host does not support cannot be part of the build. The placeholder is the reason the person sees.

## The hierarchy surface

### R7. Named "hierarchy surface" in full, to keep it apart from the explorer's hierarchy

**Decision.** Every type, folder and message of the surface carries the two words: `HierarchySurface…` in C#, `hierarchySurface/` in the client, `HierarchySurface…` messages in `designers.proto`.

**Rationale.** `EtAlii.Adp.Hierarchy`, `hierarchy.proto` and `HierarchyService` are the explorer tree. A bare `Hierarchy` prefix would read as that.

### R8. A second session contract beside the table's; the whole model on every change

**Decision.**

- `IDesignerSession` keeps what both kinds share. Its table members (`TableBaseline`, `SetWindow`, `SetActiveView`, `TableGesture`) move to `ITableDesignerSession`, and `IHierarchySurfaceSession` is new. Both live where spec 025 T266 puts the session contracts.
- `designers.proto` gains `OpenHierarchySurface`, `CloseHierarchySurface` and `HierarchySurfaceGesture`. `WorkspaceMessage` gains one member, `hierarchy_surface`, never a second stream.
- The session sends the whole read model on open and after every change: entries, the tag, category and state lists, the collapsed set, the stored filters, the open assessments and the findings. The client lays it out, focuses, narrows and sorts. Writing a setting (collapse, a stored filter, a list change) is a gesture.

**Rationale.** FR-032 asks for shared work, and the table's members cannot serve a page with no rows and no columns. Narrowing, sorting and focus never write the file, so they belong to the client, and a whole model of 500 requirements is a few hundred kilobytes, inside SC-003's two seconds.

**Alternatives considered.** Deltas, as the table sends them: worth it for a table windowed over thousands of rows, not here. The code carries `// simplified: whole model per change, measured at 100 items and 500 requirements; send deltas when SC-003's test fails at a larger size`.

### R9. The client library reuses the table's tag pieces in place

**Decision.** `src/client/src/hierarchySurface/library/` draws the page and imports `OptionTag`, `SearchList` and `OptionsEditor` from where they are (`table/library/cells/`, `components/`, `table/library/header/`). The drag uses `canvas/gesture/usePointerGesture.ts`, as the table's row handles do. Collapsing copies the shape of `NestedRowToggle`, the end-of-item control that of `NewRow`. The module's client mounts the library and declares its definition, as `knowledgeDefinition.ts` does, and `KNOWN_MODULE_CLIENTS` goes to 2 in `declarativeDesignerModules.test.ts`.

**Rationale.** FR-011 asks for the Knowledge designer's looks outside a table: the same components give them. Moving the components to a shared folder is churn without a second reason.

**Alternatives considered.** Moving `OptionTag` and `OptionsEditor` to `components/` first: done only if a guard refuses the import.

### R10. What the host settles

**Decision.**

| Question | Answer |
|---|---|
| The key for adding | `Ctrl+Enter` on a selected entry adds an entry of the same kind directly below it, ready for typing. `Ctrl+Shift+Enter` on a selected item adds a requirement as its first content. Both are context actions with a `ContextShortcut`, so the ribbon and the menus show them: that is the host's help. |
| The icon for several assessments | `mdi-comment-multiple-outline`. |
| How focus is offered | A focus control in the header of every item box, and pressing the mark of an item whose levels do not fit. |
| The mark of an item whose levels do not fit | `mdi-chevron-double-right` at the item box's right edge, with the number of hidden levels in its tooltip. |
| The trail | One row above the page: the document's title, then each item above the focused one by number and title, each a link that focuses it. It scrolls with the page's header, not the page. |
| A refusal of an edit against a changed file | "The file changed while you were editing, so this change was not written. The page now shows the file as it is." |
| The choice between reloading and keeping | A bar over the page: "This file was changed outside the designer." with "Show the file" and "Keep my text". |
| Undo past an outside change | The history stack's existing `Outdated` message, unchanged. |

**Rationale.** Spec 028's host handoff leaves each of these to the host. The shortcuts as context actions use the one mechanism the host has. There is no help screen to add a line to.

**Alternatives considered.** A keyboard help screen: none exists in the host, and building one serves every tool, not this one.

## Two writers

### R11. "Unsaved edits" are the text being typed, and keeping it re-plans one field

**Decision.** A designer writes behind: a gesture is planned and saved at once. What can be unsaved is the title or description field the person is typing in. When the file changes while such a field is open, the page is read again around it and the bar of R10 appears. "Show the file" closes the field and drops its text. "Keep my text" leaves the field open. Committing it is a new edit of that one value, planned against the file as it is now, and refused if the entry's number is gone. Any other gesture planned against bytes that have changed is refused by FBL section 7.2, with the message of R10.

**Rationale.** FR-023 and FR-024. Replacing one value of an entry that still exists is an edit of the new file, not a merge of two versions. The text editors' conflict bar (`standalone:src/client/src/editors/TextEditorPanel.tsx`) is the precedent for the wording and the shape.

**Alternatives considered.** Holding a queue of unsaved gestures and replaying them: that is merging, which the spec forbids.

### R12. Drift before an edit is shared, in the FBL library

**Decision.** `OpenBody` checks before it plans that the file's bytes are still those it read, and refuses with one shared sentence. Knowledge's module-local sentence (`standalone:…/KnowledgeBody.cs:108`) is replaced by it in the same pull request. Undo after an outside change keeps the history stack's `CommandResult.Outdated`, which drops that file's entries and says so at the first undo past it.

**Rationale.** FBL 0.7 section 7.2 makes the check a property of every writer, and a second designer would otherwise copy the first one's sentence.

### R13. Reading an outside change again

**Decision.** The session watches its body and its registration through spec 025's `WatchedFile` (`EtAlii.Adp.Files`), skips its own writes, ignores identical bytes and sends the whole model again. Collapsed entries come from the registration by number, so an item an agent moved keeps its fold. An assessment's open list is closed on a re-read, because an assessment's id is its position.

**Rationale.** FR-022 and the definition: assessments have no number, so a list kept open across a re-read could point at the wrong one.

## Conformance

### R14. The corpus in etalii.adp's layout, with a runner that recurses

**Decision.** `bullets-read`, `bullets-edits`, `registration-blocks`, the twelve `hierarchical-requirement-*` folders and the four `definitions/designers/hierarchical-requirement.*` files are copied unchanged under `standalone:src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/etalii.adp/`, in the source tree's layout, so every relative binding path resolves. The copy is logged in the corpus `readme.md` with the etalii.adp commit. The runner enumerates `fixture.json` at any depth, 27 of them for this feature. The harness's `ReadChange` learns `move`, `setting`, `position`, `slot`, `occurrence`, `expectFile`, an `edit` that is a list with its `x-operation`, and compares `read.elements[].parent`. The derived ids (`tag/<name>`, `category/<name>`, `state/<name>`, `filter/<name>`, `assessment/<n>`) get a stand-in beside `Support/NaturalIds.cs`. The planted-defect test follows `TheRunnerFailsOnAnAttributeValueOfAnotherType`.

**Rationale.** FR-029 and SC-006 say every fixture. Eleven of them sit one folder down, and the runner today reads the top level only, so it would skip them without a word. The `etalii.adp/** -text` rule already keeps the copies byte-exact.

**Alternatives considered.** The flat `Conformance/fixtures/` folder: relative binding paths from a sub-folder fixture do not resolve there.

### R15. `.gitattributes` for the module's Markdown

**Decision.** The existing rules cover the examples (`src/designers/*/examples/**`), the binding (`src/designers/*/definition/*.fbl`) and the specification (`*.des`). The vendored companion needs one more line: `src/designers/*/definition/*.md -text`.

**Rationale.** `.md` is ordinary text under `* text=auto eol=crlf` in standalone, and the companion and examples are byte-compared by the provenance test.

## The spec, corrected

### R16. Where the definition disagrees with spec 029, the spec is amended in this pull request

**Decision.** The definition wins (spec, Assumptions). These are amended in the spec with this plan:

- FR-005 and User Story 4 scenario 2: a new document's title is its file's base name, which the template writes as `{base}`. The person names the file, not the title.
- FR-004: the registration is created outside the undo history.
- FR-010: folding is not an undo step, because the binding's `collapsed` block is outside the history.
- SC-009: "without a finding" exempts `std.missingId` for an entry written `ITEM-NEW` or `REQ-NEW`, which the companion tells writers to use.
- Context and Key Entities: the twelve folders hold 23 fixtures, and the corpus holds FBL 0.1 with additions up to 0.6.

**Rationale.** Each is stated by the binding, the fixtures or the companion. The spec says it is amended where they disagree.

### R17. What the definition leaves out, and the host does by the fixtures

**Decision.** The host does each of these as the fixtures state, and the companion's user-facing note is enough:

- A placeholder number and a missing mark line are written with the next edit of any kind, so an unrelated edit can rewrite them.
- The first change to an absent list writes the whole list.
- A new tag, a tag rename or delete, and a category rename write the `.md` and the `.adp` in one history step. Knowledge's `RestoreKnowledgeFilesCommand` is the pattern for a restore of two files.
- Giving a duplicate number a new one from its finding, and resolving an assessment written without a checkbox, are gestures whose bytes the fixtures state.

**Rationale.** None is a requirement a person would phrase. Each is visible in the bytes, and the fixtures fix them.

## Success criteria a person shows

### R18. Measured in the host and recorded here

**Decision.** SC-003 is a backend test that opens a generated document of 100 items and 500 requirements and applies an outside change, each within two seconds, plus a browser check in `standalone:tests.md`. SC-001, SC-002, SC-004 and SC-005 are observed after pull request 11 and recorded in `measurements.md` in this folder, by a pull request here. SC-001 is two timed readings of the same task on the same document, at least a day apart, text first.

**Rationale.** The four need real use over weeks. They do not block a standalone pull request.
